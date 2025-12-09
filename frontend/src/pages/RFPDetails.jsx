import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getRFPDetails, getVendors, sendRFP } from '../api';

export default function RFPDetails() {
  const { id } = useParams();
  const [rfp, setRfp] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRFPDetails(id)
      .then(res => {
        const data = res.data.data || res.data; 
        setRfp(data.rfp);
        setProposals(data.proposals || []);
      })
      .catch(err => setError("Failed to load RFP Details"));

    getVendors()
      .then(res => {
        const data = res.data.data || res.data;
        setVendors(Array.isArray(data) ? data : []);
      })
      .catch(err => console.error("Failed load vendors", err));
  }, [id]);

  const handleSend = async () => {
    if (selectedVendors.length === 0) return;
    setLoading(true);
    try {
      await sendRFP(id, selectedVendors);
      alert("Emails sent successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to send emails");
    } finally {
      setLoading(false);
    }
  };

  const getAnalysis = (proposal) => {
      let analysis = proposal.ai_analysis;
      if (typeof analysis === 'string') {
          try {
              analysis = JSON.parse(analysis);
          } catch (e) {
              return { summary: analysis }; // Fallback if simple string
          }
      }
      return analysis || {};
  };

  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!rfp) return <div className="p-8">Loading RFP Details...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">{rfp.title}</h1>
      <div className="bg-white p-4 rounded border mb-8 shadow-sm">
        <h3 className="font-bold text-gray-700">Requirements:</h3>
        <p className="text-gray-600 mt-1">{rfp.raw_prompt}</p>
      </div>
      <div className="bg-gray-50 p-6 rounded mb-8 border">
        <h3 className="font-bold mb-4">Select Vendors to Invite</h3>
        {vendors.length === 0 && <p className="text-sm text-red-500">No vendors found in database.</p>}
        
        <div className="flex gap-4 flex-wrap mb-4">
          {vendors.map(v => (
            <label key={v.id} className="flex items-center space-x-2 bg-white p-2 border rounded cursor-pointer hover:bg-gray-50">
              <input 
                type="checkbox" 
                onChange={(e) => {
                  if(e.target.checked) setSelectedVendors([...selectedVendors, v.id]);
                  else setSelectedVendors(selectedVendors.filter(x => x !== v.id));
                }}
              />
              <span className="font-medium">{v.name}</span>
            </label>
          ))}
        </div>
        <button 
          onClick={handleSend}
          disabled={loading || selectedVendors.length === 0}
          className="bg-indigo-600 text-white px-6 py-2 rounded font-medium disabled:bg-gray-300 transition-colors hover:bg-indigo-700"
        >
          {loading ? 'Sending...' : 'Send RFP Emails'}
        </button>
      </div>
      <h2 className="text-2xl font-bold mb-4">Received Proposals ({proposals.length})</h2>
      
      {proposals.length === 0 ? (
        <div className="bg-white border rounded p-8 text-center text-gray-500">
          Waiting for vendors to reply...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border shadow">
          <table className="w-full bg-white">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-600">Vendor</th>
                <th className="p-4 text-left font-semibold text-gray-600">Total Price</th>
                <th className="p-4 text-left font-semibold text-gray-600">Timeline</th>
                <th className="p-4 text-left font-semibold text-gray-600">AI Score</th>
                <th className="p-4 text-left font-semibold text-gray-600">Analysis</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map(p => {
                const analysis = getAnalysis(p);
                return (
                    <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-900">{p.vendor_name || 'Unknown'}</td>
                      <td className="p-4 font-mono text-blue-600">
                        ${p.ai_extracted_data?.total_price?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="p-4">
                        {p.ai_extracted_data?.delivery_days ? `${p.ai_extracted_data.delivery_days} Days` : '?'}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          (p.ai_score || 0) >= 80 ? 'bg-green-100 text-green-800' : 
                          (p.ai_score || 0) >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {p.ai_score || 0}/100
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={analysis.summary}>
                        {analysis.summary || 'Processing...'}
                      </td>
                    </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRFPs } from '../api';

export default function Dashboard() {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRFPs()
      .then(res => {
        // Handle both Array direct return or { success: true, data: [] }
        const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setRfps(data);
      })
      .catch(err => console.error("Failed to load RFPs", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">RFP Dashboard</h1>
        <Link to="/create" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + New RFP
        </Link>
      </div>

      <div className="grid gap-4">
        {rfps.length === 0 && <p className="text-gray-500">No RFPs found. Create one to get started.</p>}
        
        {rfps.map(rfp => (
          <div key={rfp.id} className="border p-4 rounded shadow hover:shadow-md transition bg-white">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold">{rfp.title}</h2>
              <span className={`px-2 py-1 rounded text-sm uppercase font-bold tracking-wide ${
                rfp.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
              }`}>
                {rfp.status || 'OPEN'}
              </span>
            </div>
            <p className="text-gray-600 mt-2 truncate">{rfp.raw_prompt}</p>
            <div className="mt-4">
              <Link to={`/rfp/${rfp.id}`} className="text-blue-600 font-medium hover:underline">
                View Proposals →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

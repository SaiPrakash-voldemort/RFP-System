import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createRFP } from '../api';

export default function CreateRFP() {
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Calls Backend -> AI -> DB
      await createRFP({ title, raw_prompt: prompt });
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Failed to create RFP. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-start pt-20">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create Procurement Request</h1>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ✕ Cancel
          </Link>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
         
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Project Title</label>
            <input 
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. Q1 IT Equipment Upgrade"
              required
            />
          </div>
        
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Requirements Description</label>
            <textarea 
              className="w-full border border-gray-300 p-3 rounded-lg h-48 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none" 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)} 
              placeholder="Describe what you need in natural language...&#10;&#10;Example: I need 50 Dell XPS 15 laptops with 32GB RAM. Budget is around $80,000. We need delivery by the end of next month."
              required
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold mr-2">AI POWERED</span>
              Our AI will automatically extract budget, items, and specs from this text.
            </p>
          </div>
          <div className="pt-4">
            <button 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed shadow-sm flex justify-center items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Requirement...
                </>
              ) : 'Launch RFP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

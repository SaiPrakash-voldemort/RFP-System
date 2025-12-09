import axios from 'axios';

// Ensure this matches your backend port
const API_URL = 'http://localhost:3000/api';

// RFP Endpoints
export const createRFP = (data) => axios.post(`${API_URL}/rfps`, data);
export const getRFPs = () => axios.get(`${API_URL}/rfps`);
export const getRFPDetails = (id) => axios.get(`${API_URL}/rfps/${id}`);
export const sendRFP = (id, vendorIds) => axios.post(`${API_URL}/rfps/${id}/send`, { vendorIds });

// Vendor Endpoints
export const getVendors = () => axios.get(`${API_URL}/vendors`);

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const API_ROUTES = {
    marketEdge: `${API_BASE}/market-edge`,
    priceGenix: `${API_BASE}/pricing-mix`,
    analytics: `${API_BASE}/analytics`
};

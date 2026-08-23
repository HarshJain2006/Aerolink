/* ---------------------------------------------------------------
 * AeroLink data source configuration.
 * Flip USE_MOCK_DATA to false to hit the real Django REST API.
 * --------------------------------------------------------------- */
export const USE_MOCK_DATA = true;

export const API_BASE_URL = "http://localhost:8000/api";

export const API_ENDPOINTS = {
  nodes: `${API_BASE_URL}/nodes/`,
  sos: `${API_BASE_URL}/sos/`,
} as const;

/** Live-update / poll interval in ms. */
export const REFRESH_INTERVAL_MS = 3000;

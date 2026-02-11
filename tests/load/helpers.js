/**
 * Shared helpers for k6 load test scenarios
 */

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

/**
 * Default thresholds for all scenarios
 */
export const defaultThresholds = {
  http_req_duration: ['p(95)<200', 'p(99)<500'],
  http_req_failed: ['rate<0.01'],
};

/**
 * Authenticate and return a valid access token
 */
export function login(http, email, password) {
  const res = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email, password }),
    { headers: { 'Content-Type': 'application/json' } }
  );

  if (res.status !== 200) {
    console.error(`Login failed: ${res.status} ${res.body}`);
    return null;
  }

  const body = JSON.parse(res.body);
  return body.data?.token || body.token;
}

/**
 * Return auth headers for requests
 */
export function authHeaders(token) {
  return {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };
}

export { BASE_URL };

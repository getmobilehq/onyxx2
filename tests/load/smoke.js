/**
 * Smoke Test — 1 user, 1 minute
 * Sanity check that all critical endpoints are responding.
 *
 * Run: k6 run tests/load/smoke.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, defaultThresholds, login, authHeaders } from './helpers.js';

export const options = {
  vus: 1,
  duration: '1m',
  thresholds: defaultThresholds,
};

export function setup() {
  const token = login(http, 'admin@acme.com', 'password123');
  if (!token) {
    throw new Error('Failed to authenticate — is the API running and seeded?');
  }
  return { token };
}

export default function (data) {
  const opts = authHeaders(data.token);

  // Health check
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health: status 200': (r) => r.status === 200,
  });

  // Dashboard stats
  const dashRes = http.get(`${BASE_URL}/api/v1/dashboard/stats`, opts);
  check(dashRes, {
    'dashboard: status 200': (r) => r.status === 200,
  });

  // Building list
  const buildingsRes = http.get(`${BASE_URL}/api/v1/buildings`, opts);
  check(buildingsRes, {
    'buildings: status 200': (r) => r.status === 200,
  });

  // Assessment list
  const assessmentsRes = http.get(`${BASE_URL}/api/v1/assessments`, opts);
  check(assessmentsRes, {
    'assessments: status 200': (r) => r.status === 200,
  });

  // Auth me
  const meRes = http.get(`${BASE_URL}/api/v1/auth/me`, opts);
  check(meRes, {
    'auth/me: status 200': (r) => r.status === 200,
  });

  sleep(1);
}

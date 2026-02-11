/**
 * Stress Test — Ramp from 10 to 200 users over 10 minutes
 * Find the breaking point of the system.
 *
 * Run: k6 run tests/load/stress.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, defaultThresholds, login, authHeaders } from './helpers.js';

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Warm up
    { duration: '2m', target: 50 },   // Moderate load
    { duration: '2m', target: 100 },  // High load
    { duration: '2m', target: 150 },  // Very high load
    { duration: '1m', target: 200 },  // Peak load
    { duration: '1m', target: 200 },  // Sustain peak
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    ...defaultThresholds,
    // Relax thresholds slightly for stress test
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

export function setup() {
  const adminToken = login(http, 'admin@acme.com', 'password123');
  const managerToken = login(http, 'manager@acme.com', 'password123');
  const assessorToken = login(http, 'assessor@acme.com', 'password123');

  if (!adminToken || !managerToken || !assessorToken) {
    throw new Error('Failed to authenticate test users');
  }

  return {
    tokens: [adminToken, managerToken, assessorToken],
  };
}

export default function (data) {
  const token = data.tokens[__VU % data.tokens.length];
  const opts = authHeaders(token);

  // Authentication
  const loginRes = http.post(
    `${BASE_URL}/api/v1/auth/login`,
    JSON.stringify({ email: 'admin@acme.com', password: 'password123' }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(loginRes, {
    'login: status 200': (r) => r.status === 200,
  });

  sleep(0.2);

  // Building list (Branch Manager primary view)
  const buildingsRes = http.get(`${BASE_URL}/api/v1/buildings`, opts);
  check(buildingsRes, {
    'buildings: status 200': (r) => r.status === 200,
  });

  // Assessment list
  const assessmentsRes = http.get(`${BASE_URL}/api/v1/assessments`, opts);
  check(assessmentsRes, {
    'assessments: status 200': (r) => r.status === 200,
  });

  sleep(0.2);

  // Dashboard stats (Org Admin/Executive view)
  const dashRes = http.get(`${BASE_URL}/api/v1/dashboard/stats`, opts);
  check(dashRes, {
    'dashboard: status 200': (r) => r.status === 200,
  });

  sleep(0.3);
}

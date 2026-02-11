/**
 * Average Load Test — 50 concurrent users, 5 minutes
 * Simulates typical Branch Manager + Assessor workload.
 *
 * Run: k6 run tests/load/average.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { BASE_URL, defaultThresholds, login, authHeaders } from './helpers.js';

export const options = {
  stages: [
    { duration: '30s', target: 25 },  // Ramp up to 25 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Sustain 50 users
    { duration: '30s', target: 25 },  // Ramp down to 25
    { duration: '30s', target: 0 },   // Ramp down to 0
  ],
  thresholds: defaultThresholds,
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
  // Rotate through user tokens to simulate different roles
  const token = data.tokens[__VU % data.tokens.length];
  const opts = authHeaders(token);

  // Branch Manager flow: dashboard → buildings → assessment list
  const dashRes = http.get(`${BASE_URL}/api/v1/dashboard/stats`, opts);
  check(dashRes, {
    'dashboard: status 200': (r) => r.status === 200,
  });

  const buildingsRes = http.get(`${BASE_URL}/api/v1/buildings`, opts);
  check(buildingsRes, {
    'buildings list: status 200': (r) => r.status === 200,
  });

  sleep(0.5);

  const assessmentsRes = http.get(`${BASE_URL}/api/v1/assessments`, opts);
  check(assessmentsRes, {
    'assessments list: status 200': (r) => r.status === 200,
  });

  // Assessor flow: view specific assessment elements
  if (assessmentsRes.status === 200) {
    const body = JSON.parse(assessmentsRes.body);
    const assessments = body.data?.data || body.data || [];

    if (assessments.length > 0) {
      const assessmentId = assessments[0].id;
      const detailRes = http.get(
        `${BASE_URL}/api/v1/assessments/${assessmentId}`,
        opts,
      );
      check(detailRes, {
        'assessment detail: status 200': (r) => r.status === 200,
      });
    }
  }

  sleep(1);

  // Auth check
  const meRes = http.get(`${BASE_URL}/api/v1/auth/me`, opts);
  check(meRes, {
    'auth/me: status 200': (r) => r.status === 200,
  });

  sleep(0.5);
}

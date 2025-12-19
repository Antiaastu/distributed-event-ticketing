import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 50 },  // Ramp up to 50 users
    { duration: '20s', target: 50 },  // Hold at 50 users
    { duration: '10s', target: 100 }, // Ramp up to 100 users
    { duration: '20s', target: 100 }, // Hold at 100 users
    { duration: '10s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Failure rate should be less than 1%
  },
};

export default function () {
  const res = http.get('http://api_gateway:80/api/events');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '20s', target: 20 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration{status:200}': ['p(95)<500'], // GET phải dưới 500ms
    'http_req_duration{status:201}': ['p(95)<800'], // POST tạo mới phải dưới 800ms
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const baseUrl = 'https://jsonplaceholder.typicode.com';

  // Nhóm 1: Xem danh sách và chi tiết
  group('Browse Posts', function () {
    const listRes = http.get(`${baseUrl}/posts`);
    check(listRes, { 'get list status is 200': (r) => r.status === 200 });

    const detailRes = http.get(`${baseUrl}/posts/1`);
    check(detailRes, { 'get detail status is 200': (r) => r.status === 200 });
  });

  sleep(0.5);

  // Nhóm 2: Tạo bài viết mới
  group('Create Post Flow', function () {
    const payload = JSON.stringify({
      title: 'Performance Testing with k6',
      body: 'Simulating multi-request workload',
      userId: 1,
    });

    const params = {
      headers: { 'Content-Type': 'application/json' },
    };

    const postRes = http.post(`${baseUrl}/posts`, payload, params);
    check(postRes, { 'create post status is 201': (r) => r.status === 201 });
  });

  sleep(1);
}

export function handleSummary(data) {
  return {
    'k6_summary.html': htmlReport(data),
  };
}
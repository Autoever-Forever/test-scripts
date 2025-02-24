import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';

let loginDuration = new Trend('login_duration');

const BASE_URL = 'http://localhost:3000';

// 가상의 350명 유저 생성
const users = new SharedArray('users', function () {
  let generatedUsers = [];
  for (let i = 0; i < 10; i++) {
    generatedUsers.push({
      email: `user${i}@test.com`,
      password: `password${i}`
    });
  }
  return generatedUsers;
});

export let options = {
  iterations: 10,
  vus: 10,
};

export default function () {
  // 메인 페이지 접속
  const res = http.get(`${BASE_URL}`);
  check(res, { '메인 페이지 응답 정상': (r) => r.status === 200 });

  // 로그인 페이지 접속
  let loginPageRes = http.get(`${BASE_URL}/login`);
  check(loginPageRes, { '로그인 페이지 접근 성공': (r) => r.status === 200 });

  // 가상의 350명 중 랜덤 유저 선택
  let user = users[Math.floor(Math.random() * users.length)];
  check(user, { '유저 정보 가져오기 성공': (u) => u.email && u.password });

  // 로그인 시도
  login(user.email, user.password);
  sleep(1);
}

function login(email, password) {
  let loginData = { email: email, password: password };
  
  // 로그인 API 호출
  let loginRes = http.post(`${BASE_URL}/auth/sign_in`, JSON.stringify(loginData), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, { '로그인 성공': (r) => r.status === 200 });
  
  loginDuration.add(loginRes.timings.duration);

  let token = loginRes.json('token');

  // 로그인 완료 페이지 접근
  let loginSuccessPageRes = http.get(`${BASE_URL}/signup-success`);
  check(loginSuccessPageRes, { '로그인 완료 페이지 접근 성공': (r) => r.status === 200 });

  if (token) {
    let homePageRes = http.get(`${BASE_URL}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    check(homePageRes, { '홈 페이지 접근 성공': (r) => r.status === 200 });
    sleep(1);
  }
}
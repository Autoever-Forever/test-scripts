import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// ✅ 응답 시간 측정을 위한 Trend 메트릭 생성
let homePageResponseTime = new Trend('home_page_response_time');
let productPageResponseTime = new Trend('product_page_response_time');
let inventoryPageResponseTime = new Trend('inventory_page_response_time');
let reservationRequestResponseTime = new Trend('reservation_request_response_time');
let successPageResponseTime = new Trend('success_page_response_time');
let myPageResponseTime = new Trend('mypage_response_time');

// BASE_URL과 JWT_TOKEN 설정 필요
//const BASE_URL = 'http://112.218.95.58:13005';  // 🚀 실제 API URL로 변경
const BASE_URL = 'http://auttoever.com:13005';  // 🚀 실제 API URL로 변경
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5ODQzODRiNDgyYWU0MmFhOTg3OTIzNWRjYmQzYmJmYyIsImF1dGgiOiJST0xFX1VTRVIiLCJleHAiOjM0NzMwMjY3MjN9.GN1QydkJnoMmIOQzPA7Gw0ltXI7cXPZPhISBgehM4mw";


// export let options = {
//   vus: 1,         // ✅ 가상 사용자 수를 1명으로 설정
//   iterations: 1,  // ✅ 1번만 실행하고 종료
// };

export let options = {
  stages: [
    { duration: '10s', target: 500 },  // ⚡ 10초 만에 500명으로 급증
    { duration: '60s', target: 500 },  // ⏸️ 60초 동안 500명 유지
    { duration: '90s', target: 0 },    // 🐢 90초 동안 천천히 0명으로 감소
  ],
};

// 홈페이지 방문
export function homepageVisit() {
  console.log(`홈페이지 방문 시작...`);
  let res = http.get(`${BASE_URL}`);
  
  homePageResponseTime.add(res.timings.duration); // 응답 시간 측정
  
  check(res, { '홈페이지 로딩 성공': (r) => r.status === 200 });

  if (res.status !== 200) {
    console.error(`오류 발생 - 상태 코드: ${res.status}, 응답 본문: ${res.body}`);
  }

  sleep(Math.random() * 2);
}

// 상품 예약 진행
export function product(){

  // 상품 상세 페이지 접속
  console.log(`상품 상세 페이지 접속...`);
  let res = http.get(`${BASE_URL}/product/0`);
  
  productPageResponseTime.add(res.timings.duration); // 응답 시간 측정

  if (res.status !== 200) console.error(`오류 발생 - 응답 코드: ${res.status}, 응답 본문: ${res.body}`);
  
  check(res, { '상품 상세 페이지 로딩 성공': (r) => r.status === 200 });
  sleep(Math.random() * 2)
}

// 예매 페이지 접속
export function bookingProcess() {
  console.log(`예매 페이지 접속...`);
  let res = http.get(`${BASE_URL}/inventory/0`);
  
  inventoryPageResponseTime.add(res.timings.duration); // 응답 시간 측정

  check(res, { '예매 페이지 로딩 성공': (r) => r.status === 200 });

  if (res.status !== 200) {
    console.error(`오류 발생 - 상태 코드: ${res.status}, 응답 본문: ${res.body}`);
  }
  
  sleep(Math.random() * 2);


  // 예약 요청하기
  console.log(`예약 요청 중...`);
  res = http.post(`${BASE_URL}/api/v1/reservation`, JSON.stringify({
    productId: "15F5D770-4886-46EB-8677-A7660B4222D5", // 변경해야함
    seatId: "11EFE567-A1B2-C3D4-921C-0242AC110002", // 변경해야함함
    seatCount: 2
  }), {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JWT_TOKEN}` }
  });

  reservationRequestResponseTime.add(res.timings.duration); // 응답 시간 측정

  check(res, { '예약 요청 성공': (r) => r.status === 200 || r.status === 201 });

  if (res.status !== 200) {
    console.error(`오류 발생 - 상태 코드: ${res.status}, 응답 본문: ${res.body}`);
  }
  
  sleep(Math.random() * 2);


  // 예약 성공 페이지 접속
  console.log(`예약 성공 페이지 확인...`);
  res = http.get(`${BASE_URL}/success`);

  successPageResponseTime.add(res.timings.duration); // 응답 시간 측정

  check(res, { '예약 성공 페이지 로딩 성공': (r) => r.status === 200 });

  if (res.status !== 200) {
    console.error(`오류 발생 - 상태 코드: ${res.status}, 응답 본문: ${res.body}`);
  }
  
  sleep(Math.random() * 2);


  // 예약 내역 조회
  console.log(`예약 내역 확인...`);
  res = http.get(`${BASE_URL}/mypage`, {
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JWT_TOKEN}` }
  });

  myPageResponseTime.add(res.timings.duration); // 응답 시간 측정

  check(res, { '예약 내역 페이지 로딩 성공': (r) => r.status === 200 });

  if (res.status !== 200) {
    console.error(`오류 발생 - 상태 코드: ${res.status}, 응답 본문: ${res.body}`);
  }
  
  sleep(Math.random() * 2);
}


export default function () {
  homepageVisit(); // ✅ 오타 수정

  let randomChoice = Math.random();

  if (randomChoice < 0.7) {  // 70% 확률로 product() 실행
    product();
  }

  if (randomChoice < 0.5) {  // 50% 확률로 bookingProcess() 실행
    bookingProcess();
  }
}

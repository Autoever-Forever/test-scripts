import http from 'k6/http';
import { Trend } from 'k6/metrics';
import { check, sleep } from 'k6';

const requestOptions = {
    headers: {
        'Content-Type': 'application/json'
    }
};


export const options = {
    stages: [
        { duration: '1m', target: 50 },  // 1분 동안 50명으로 증가
        { duration: '3m', target: 500 }, // 3분 동안 500명까지 증가
        { duration: '1m', target: 0 },   // 1분 동안 점진적으로 종료
    ]
};

// ✅ 응답 시간 측정을 위한 Trend 메트릭 생성
let homePageResponseTime = new Trend('home_page_response_time');
let productPageResponseTime = new Trend('product_page_response_time');
let inventoryPageResponseTime = new Trend('inventory_page_response_time');
let reservationRequestResponseTime = new Trend('reservation_request_response_time');
let successPageResponseTime = new Trend('success_page_response_time');
let myPageResponseTime = new Trend('mypage_response_time');

// 변수
const BASE_URL = 'http://auttoever.com'; 
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI5ODQzODRiNDgyYWU0MmFhOTg3OTIzNWRjYmQzYmJmYyIsImF1dGgiOiJST0xFX1VTRVIiLCJleHAiOjM0NzMwMjY3MjN9.GN1QydkJnoMmIOQzPA7Gw0ltXI7cXPZPhISBgehM4mw";

export default function () {
    //const vuId = __VU;

    // 1. 홈 페이지 접속
    console.log(`홈페이지 접속 시작...`);
    let res = http.get(`${BASE_URL}`);
    homePageResponseTime.add(res.timings.duration);

    if (res.status !== 200) console.error(`오류 발생 - 응답 코드: ${res.status}, 응답 본문: ${res.body}`);
    
    check(res, { '홈페이지 로딩 성공': (r) => r.status === 200 });
    sleep(Math.random() * 2);


    // 2. 상품 상세 페이지 접속
    console.log(`상품 상세 페이지 접속...`);
    res = http.get(`${BASE_URL}/product/0`);
    productPageResponseTime.add(res.timings.duration);

    if (res.status !== 200) console.error(`오류 발생 - 응답 코드: ${res.status}, 응답 본문: ${res.body}`);
    
    check(res, { '상품 상세 페이지 로딩 성공': (r) => r.status === 200 });
    sleep(Math.random() * 2);

    // 3-1. 예매 페이지 접속
    console.log(`예매하기 페이지 접속...`);
    res = http.get(`${BASE_URL}/inventory/0`);
    inventoryPageResponseTime.add(res.timings.duration);

    if (res.status !== 200) console.error(`오류 발생 - 응답 코드: ${res.status}, 응답 본문: ${res.body}`);

    check(res, { '예매하기 페이지 로딩 성공': (r) => r.status === 200 });
    sleep(Math.random() * 2);

    // 3-2. 예약 요청 (POST 요청)
    console.log(`예약 요청 중...`);
    res = http.post(`${BASE_URL}/api/v1/reservation`, JSON.stringify({
        productId: "15F5D770-4886-46EB-8677-A7660B4222D5",
        seatId: "11EFE567-A1B2-C3D4-921C-0242AC110002",
        seatCount: 2
    }), {
        headers: { 'Content-Type': 'application/json', 'Authorization': JWT_TOKEN }
    });

    reservationRequestResponseTime.add(res.timings.duration);

    if (res.status !== 200) {
        console.error(`오류 발생 - 응답 코드: ${res.status}, 응답 본문: ${res.body}`);
    }

    let responseBody;
    try {
        responseBody = JSON.parse(res.body);
    } catch (e) {
        console.error(`응답 본문 파싱 오류: ${res.body}`);
        return;
    }

    check(res, { '예약 요청 성공': (r) => r.status === 200 || r.status === 201 });
    sleep(Math.random() * 2);

    // 4-1. 예약 성공 페이지 접속
    console.log(`예약 성공 페이지 확인...`);
    res = http.get(`${BASE_URL}/success`);
    successPageResponseTime.add(res.timings.duration);

    if (res.status !== 200) {
        console.error(`오류 발생 - 응답 코드: ${res.status}, 응답 본문: ${res.body}`);
    }

    check(res, { '예약 성공 페이지 로딩 성공': (r) => r.status === 200 });
    sleep(Math.random() * 2);

    // 4-2. 예약 확인 페이지(마이페이지) 접속
    console.log(`예약 마이페이지 확인...`);
    res = http.get(`${BASE_URL}/mypage`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': JWT_TOKEN }
    });
    myPageResponseTime.add(res.timings.duration);

    if (res.status !== 200) {
        console.error(`오류 발생 - 응답 코드: ${res.status}, 응답 본문: ${res.body}`);
    }

    check(res, { '예약 마이페이지 로딩 성공': (r) => r.status === 200 });
}
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter } from 'k6/metrics';

// BASE_URL과 JWT_TOKEN 설정 필요
// const BASE_URL = 'http://auttoever.com:13005';
const FRONT_BASE_URL = "http://localhost:3000"
const BACK_USER_URL = "http://localhost:8081/auth"
const BACK_QUERY_URL = "http://localhost:8082/products"
const BACK_RESERV_URL = "http://localhost:8083/api/v1/reservation"
const BACK_ADMIN_URL = "http://localhost:8084/admin"
const JWT_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJlZjJhMWNhMDVlMzU0YWExOTE1NGJjMWU0NTBkNGY5ZCIsImF1dGgiOiJST0xFX1VTRVIiLCJleHAiOjM0ODExOTYyNDB9.N64GM0D9535hMTXkKzk_VIzlqkBcy6AKV04iNo6-Lek";

const signupCounter = new Counter('signup_counter');
const visitHomeCounter = new Counter('visitHome_counter');
const makeReservationCounter = new Counter('makeReservation_counter');

const actionDistribution = [
    { name: 'signup', weight: 0.1 },
    { name: 'visitHome', weight: 0.2 },
    { name: 'makeReservation', weight: 0.7 }
]

function randomWeightedChoice() {
    let sum = 0;
    const rand = Math.random();
    for (const action of actionDistribution) {
        sum += action.weight;
        if (rand < sum) return action.name;
    }

    return actionDistribution[0].name;
}

function createRandomEmail() {
    return `user_${__VU}_${Date.now()}@naver.com`;
}

// 회원가입 로직
function signup() {
    let res;
    let data;
    let jsonRes;

    // 메인 페이지
    // front
    res = http.get(`${FRONT_BASE_URL}`);
    check(res, {'메인 페이지 로딩 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`메인페이지 접속 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }
    // back
    res = http.get(`${BACK_QUERY_URL}/info/?pageNum=0`, {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, {'상품 전체 조회 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`상품 전체조회 Back 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }


    // 로그인 페이지 접속
    // front
    res = http.get(`${FRONT_BASE_URL}/login`);
    check(res, {'로그인 페이지 로딩 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`로그인 페이지 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }


    // 회원가입 페이지 접속
    // front
    res = http.get(`${FRONT_BASE_URL}/signup`);
    check(res, {'회원가입 페이지 로딩 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`외원가입 페이지 로딩 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }

    // back - 인증번호 전송
    const email = createRandomEmail();
    res = http.post(`${BACK_USER_URL}/send-verification?email=${email}`, {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, {'인증번호 전송 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`인증번호 전송 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }
    jsonRes = JSON.parse(res.body);
    const verification_code = jsonRes.data;

    // back - 인증번호 확인
    res = http.post(`${BACK_USER_URL}/verify-code?email=${email}&verificationCode=${verification_code}`, {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, {'인증번호 확인 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`인증번호 확인 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }

    // back - 회원가입
    data = {
        name: `user_${__VU}`,
        email: `${email}`,
        verificationCode: `${verification_code}`,
        userPw: '1234',
        confirmPassword: '1234'
    };
    res = http.post(`${BACK_USER_URL}/signup`, JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, {'회원가입 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`회원가입 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }

    // back - 내부적으로 로그인
    data = {
        email: `${email}`,
        password: '1234'
    };
    res = http.post(`${BACK_USER_URL}/sign-in`, JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, {'로그인 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`로그인(회원가입) 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }


    // 회원가입 완료
    // front
    res = http.get(`${FRONT_BASE_URL}/signup-success`);
    check(res, {'회원가입 성공 페이지 접속': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`회원가입 완료 페이지 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }

    // 메인으로 돌아가기
    // front
    res = http.get(`${FRONT_BASE_URL}`);
    check(res, {'메인 페이지 로딩 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`메인페이지 리다이렉션 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }
    // back
    res = http.get(`${BACK_QUERY_URL}/info/?pageNum=0`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JWT_TOKEN}` }
    });
    check(res, {'상품 전체 조회 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`상품 전체 조회 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }
}

// 홈페이지 접속 및 로그인 로직
function visitHome() {
    let res;
    let data;
    let jsonRes;

    // 메인 페이지
    // front
    res = http.get(`${FRONT_BASE_URL}`);
    check(res, {'메인 페이지 로딩 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`메인페이지 로딩 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }
    // back
    res = http.get(`${BACK_QUERY_URL}/info/?pageNum=0`, {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, {'상품 전체 조회 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`상품 전체 조회 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }


    // 로그인 페이지 접속
    // front
    res = http.get(`${FRONT_BASE_URL}/login`);
    check(res, {'로그인 페이지 로딩 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`로그인 페이지 로딩 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }
    // back
    data = {
        email: 'ocar1115.shin@gmail.com',
        password: '1234'
    };
    res = http.post(`${BACK_USER_URL}/sign-in`, JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
    check(res, {'로그인 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`로그인 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }


    // 메인 페이지 리다이렉트
    // front
    res = http.get(`${FRONT_BASE_URL}`);
    check(res, {'메인 페이지 로딩 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`메인 페이지 리다이렉트 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }
    // back
    res = http.get(`${BACK_QUERY_URL}/info/?pageNum=0`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JWT_TOKEN}` }
    });
    check(res, {'상품 전체 조회 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`상품 전체 조회 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }
}

// 상품 예약 로직
function makeReservation(){
    let res;
    let data;
    let jsonRes;

    // 상품 상세 페이지 접속
    // front
    res = http.get(`${FRONT_BASE_URL}/product/1`);
    check(res, {'메인 페이지 로딩 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`상품 상세 페이지 접속 🚨오류 발생 \n 상태코드 : ${res.status}`);
    }
    // back
    const productId = '15f5d770-4886-46eb-8677-a7660b4222d5';
    res = http.get(`${BACK_QUERY_URL}/info/detail?id=${productId}`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JWT_TOKEN}` }
    });
    check(res, {'상품 상세 데이터 조회 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`상품 상세 데이터 조회 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }

    // 상품 예약 페이지 접속
    // front
    res = http.get(`${FRONT_BASE_URL}/inventory/0`);
    check(res, {'inventory 페이지 로딩 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`inventory 페이지 로딩 🚨오류 발생 \n 상태코드 : ${res.status}`);
    }
    // back
    res = http.get(`${BACK_QUERY_URL}/info/inventory?id=${productId}`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JWT_TOKEN}` }
    });
    jsonRes = JSON.parse(res.body);
    const seatId = jsonRes.data[1].seatId;
    check(res, {'inventory 데이터 조회 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`inventory 데이터 조회 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }


    // 예매 및 예매 성공 페이지 접속
    // back
    data = {
        productId: `${productId}`,
        seatId: `${seatId}`,
        seatCount: 1
    };
    res = http.post(`${BACK_RESERV_URL}`, JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${JWT_TOKEN}` }
    });
    check(res, {'예매 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`예매 로직 🚨오류 발생 \n 상태코드 : ${res.status} \n 응답 : ${res.body}`);
    }

    // front
    res = http.get(`${FRONT_BASE_URL}/success`);
    check(res, {'예약 성공 페이지 로딩 성공': (r) => r.status === 200});
    if (res.status !== 200) {
        console.error(`예약 성공 페이지 로딩 🚨오류 발생 \n 상태코드 : ${res.status}`);
    }
}

export let options = {
    vus: 50,
    iterations: 50,
    executor: 'constant-vus',
    
    // stages: [
    //     { duration: '5s', target: 10 },  // 5초 만에 50명으로 급증
    //     { duration: '60s', target: 10 }, // 60초 동안 50명 유지
    //     { duration: '90s', target: 0 },  // 90초 동안 천천히 0명으로 감소
    // ],
};

export default function () {
    const selectedAction = randomWeightedChoice();
    //console.log(`선택된 기능: ${selectedAction}`);

    if (selectedAction === 'signup') {
        signupCounter.add(1);
        signup();
    } else if (selectedAction === 'visitHome') {
        visitHomeCounter.add(1);
        visitHome();
    } else if (selectedAction === 'makeReservation') {
        makeReservationCounter.add(1);
        makeReservation();
    }
}

export function handleSummary(data) {
    console.log("========== 최종 실행 횟수 ==========");
    console.log(`회원가입: ${data.metrics.signup_counter.values.count}회`);
    console.log(`홈페이지 방문: ${data.metrics.visitHome_counter.values.count}회`);
    console.log(`예약하기: ${data.metrics.makeReservation_counter.values.count}회`);
    console.log("===================================");

    return {};
}

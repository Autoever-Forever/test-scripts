const BASE_URL = 'http://localhost:3000';
const PASSWORD = '1234';

const requestOptions = {
    headers: {
        'Content-Type': 'application/json'
    }
};

function generateEmail(vuId) {
    return `test.user${vuId}.${Date.now()}@test.com`;
}

function generateUsername(vuId) {
    return `test.user${vuId}`;
}


export default function () {
    const vuId = __VU;
    const uniqueEmail = generateEmail(vuId);
    const uniqueUsername = generateUsername(vuId);
    let JWT_TOKEN = "";


    // 1. 홈 페이지 접속
    console.log(`VU ${vuId}: 홈페이지 접속 시작...`);
    let res = http.get(`${BASE_URL}`, requestOptions);
    check(res, {
        '홈페이지 로딩 성공': (r) => r.status === 200,
    });

    sleep(Math.random() * 2);

    // 2-1. 회원가입 페이지 접속
    console.log(`VU ${vuId}: 회원가입 페이지 접속...`);

    // 2-2. 회원가입 요청 (POST 요청)
    console.log(`VU ${vuId}: 회원가입 요청...`);
    const signupPayload = {
        email: uniqueEmail,
        password: PASSWORD,
        username: uniqueUsername
    };
    res = http.post(`${BASE_URL}/auth/signup`, JSON.stringify(signupPayload), {
        headers: { "Content-Type": "application/json" }
    });
    check(res, { "회원가입 성공": (r) => r.status === 200 });

    sleep(Math.random() * 2);

    // 3-1. 로그인 페이지 접속
    console.log(`VU ${vuId}: 로그인 페이지 접속...`);
    res = http.get(`${BASE_URL}/sign-in`, requestOptions);
    check(res, {
        '로그인 페이지 로딩 성공': (r) => r.status === 200,
    });

    sleep(Math.random() * 2);

    // 3-2. 로그인 폼 제출
    console.log(`VU ${vuId}: 로그인 폼 제출...`);
    const loginPayload = {
        email: user.email,
        password: user.password
    };
    res = http.post(
        `${BASE_URL}/auth/sign-in`,
        JSON.stringify(loginPayload),
        requestOptions
    );

    const loginSuccess = check(res, {
        '로그인 성공': (r) => r.status === 200,
    });

    if (loginSuccess) {
    try {
        let responseBody = JSON.parse(res.body);
        if (responseBody.data && responseBody.data.accessToken) {
            JWT_TOKEN = `${responseBody.data.grantType} ${responseBody.data.accessToken}`;
            console.log(`VU ${vuId}: 로그인 성공, JWT 토큰 저장 완료`);
        } else {
            console.log(`VU ${vuId}: 응답에 accessToken 없음`);
        }
    } catch (e) {
        console.log(`VU ${vuId}: 응답 파싱 실패 - ${e.message}`);
    }
    }

    sleep(Math.random() * 2);

    // 4. 상품 상세 페이지 접속
    console.log(`VU ${vuId}: 상품 상세 페이지 접속...`);
    res = http.get(`${BASE_URL}/product/0`);
    check(res, {
        '상품 상세 페이지 로딩 성공': (r) => r.status === 200,
    });
    sleep(Math.random() * 2);
    
    // 5-1. 예매 페이지 접속
    console.log(`VU ${vuId}: 예매하기 페이지 접속...`);
    res = http.get(`${BASE_URL}/inventory/0`);
    check(res, {
        '예매하기 페이지 로딩 성공': (r) => r.status === 200,
    });
    sleep(Math.random() * 2);

     // 5-2. 예약 요청 (POST 요청)
     console.log(`VU ${vuId}: 예약 요청 중...`);
     res = http.post(`${BASE_URL}/api/v1/reservation`, JSON.stringify({
         productId: "15F5D770-4886-46EB-8677-A7660B4222D5", // 고정값으로 하면 될듯
         seatId: "11EFE567-A1B2-C3D4-921C-0242AC110002", // 고정값으로 하면 될듯
         seatCount: 2
     }), {
         headers: { 'Content-Type': 'application/json', 'Authorization': JWT_TOKEN }
     });
 
     // 응답 데이터 JSON 파싱
     let responseBody = JSON.parse(res.body);
     
     check(res, {
         '예약 요청 성공': (r) => r.status === 200 || r.status === 201,
     });
 
     if (responseBody.success && responseBody.data && responseBody.data.reservationId) {
         let reservationId = responseBody.data.reservationId; // 예약 ID 저장
         console.log(`예약 성공! 예약 ID: ${reservationId}`);
     } else {
         console.log('예약 ID 없음. 테스트 종료.');
         return;
     }
     
     sleep(Math.random() * 2);
    
    // 5-3. 예약 성공 페이지 접속
    console.log(`VU ${vuId}: 예약 성공 페이지 확인...`);
    res = http.get(`${BASE_URL}/success`);
    check(res, {
        '예약 성공 페이지 로딩 성공': (r) => r.status === 200
    });
    

    // 5-4. 예약 확인 페이지(마이페이지지) 접속
    console.log(`VU ${vuId}: 예약 마이페이지 확인...`);
    res = http.get(`${BASE_URL}/mypage`, {
        headers: { 'Content-Type': 'application/json', 'Authorization': JWT_TOKEN }
    });
    check(res, {
        '예약 마이페이지 로딩 성공': (r) => r.status === 200
    });    

    
    // // 6. 예약 취소 요청 (DELETE 요청)
    // console.log(`VU ${vuId}: 예약 취소 요청 중...`);
    
    // res = http.del(`${BASE_URL}/api/v1/reservation/cancel/${reservationId}`, null, {
    //    headers: { 'Content-Type': 'application/json', 'Authorization': JWT_TOKEN }
    // });
    
    // check(res, {
    //     '예약 취소 요청 성공': (r) => r.status === 200 || r.status === 201,
    // });
    
    // console.log(`예약 ID ${reservationID} 취소 완료!`);
    // sleep(Math.random() * 2);
        
}
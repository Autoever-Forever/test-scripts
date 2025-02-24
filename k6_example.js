import http from 'k6/http';
import { check } from 'k6';

export default function () {
    let res = http.get("http://localhost:3000");

    check(res, {
        "✅ 응답 코드가 200이어야 함": (r) => r.status === 200,
    });

    console.log(`응답 코드: ${res.status}`);
}

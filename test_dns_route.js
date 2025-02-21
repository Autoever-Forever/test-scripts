import http from 'k6/http';

export default function () {

    let domain = ['auttoever.com'];  // 조회할 도메인 목록
    let idc_ip = '112.218.95.58'

    let idc_count = 0;  // IDC IP가 나온 횟수
    let aws_count = 0;  // AWS IP가 나온 횟수
    let timestamp = new Date().getTime();

    for (let i = 0; i < 10; i++) {  // 10번 반복
        let dns_res = http.get(`https://dns.google/resolve?name=${domain}&type=A&nocache=${timestamp}`);
        let result = JSON.parse(dns_res.body);

        if (result.Answer && result.Answer.length > 0) {
            let resolved_ip = result.Answer[0].data;
            console.log(`Attempt ${i + 1}: Resolved IP: ${resolved_ip}`);

            if (resolved_ip === idc_ip) { // 실제 IDC IP
                idc_count++;
            } else {
                aws_count++;
            }
        } else {
            console.log(`Attempt ${i + 1}: No DNS answer received`);
        }
    }

    console.log(`IDC Count : ${idc_count}`);
    console.log(`AWS Count : ${aws_count}`);
}

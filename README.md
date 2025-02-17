# 테스트 진행하기

- K6 Cloud로 테스트 결과를 올리기 위해서는 외부에서 접근할 수 있는 IP여야 한다.
- 로컬 IP로 진행한다면
  
```
  
  k6 run test.js
  
```
    
## **1️⃣ K6 설치하기**

🔹 **Linux (Debian/Ubuntu)**
    
```
    
sudo apt update && sudo apt install -y k6
    
```
    
🔹 **Linux (Fedora/CentOS)**
    
```
 
sudo dnf install -y k6
    
```
    
🔹 **macOS (Homebrew)**
    
```

brew install k6
    
```
    
🔹 **Windows (Chocolatey)**
    
```

choco install k6
    
```
    
    
🔹 **Docker 사용 시**
    
```

docker run -i grafana/k6 run - <script.js
    
```
    

    
## **2️⃣ K6 Cloud 로그인**
    
K6 Cloud에 로그인해야 클라우드에서 테스트를 실행할 수 있어.
    
```

k6 cloud login --token YOUR_API_TOKEN
    
```
    
➡️ **예제 (`YOUR_API_TOKEN`은 본인의 K6 Cloud API 토큰으로 변경)**
    
```

k6 cloud login --token 16f0bada9aabd3108df76e8ca3e600b6c62577f6658809da889b78d5650d453d

```
    

    
## **3️⃣ K6 테스트 스크립트 생성**
    
```

k6 new test.js
    
```
    
➡️ `test.js` 파일이 생성됨.
    
---
    
## **4️⃣ K6 클라우드 테스트 옵션 설정 (`test.js` 수정)**
    
`test.js` 파일을 열어서 **K6 Cloud에서 실행될 테스트 설정**을 추가.
    
```jsx

    export const options = {
      cloud: {
        projectID: 3747570, // K6 Cloud 프로젝트 ID (본인 프로젝트 ID로 변경)
        name: "YOUR TEST NAME", // 테스트 이름 설정
      },
    };

```
    

## **5️⃣ K6 Cloud에서 테스트 실행**
  
- K6 Cloud로 테스트 결과 전송됨 
    
```

k6 cloud test.js

```
    
➡️ **이 명령어를 실행하면 K6가 클라우드에서 테스트를 실행하고, 결과를 K6 Cloud 대시보드에서 확인 가능.**
    
    
## **6️⃣ 결과 확인**
    
K6 Cloud에서 실행이 완료되면, 아래와 같은 메시지가 표시됨.
    
```

View results in the cloud: https://app.k6.io/runs/123456
    
```
    
➡️ **K6 Cloud 대시보드에서 실시간 결과 확인 가능.**
    
- 테스트 스크립트
    
```jsx
    import { sleep } from 'k6';
    import http from 'k6/http';
    
    // 옵션 추가
    export const options = {
      vus: 1,  // 동시에 10명의 가상 유저 실행
      duration: '1s', // 30초 동안 실행
    };
    
    export default function () {
      http.get('http://test.k6.io');
      sleep(1);
    }
```

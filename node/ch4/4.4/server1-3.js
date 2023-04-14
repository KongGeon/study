const https = require('https'); //http 서버를 https로 바꿔줄수 있음
const fs = require('fs');

https.createServer({ //https는 인수가추가됨
  cert: fs.readFileSync('도메인 인증서 경로'),//서버에서는 sync 쓰지 말아야 하는데 딱 한번만 실행하거나 초기화 할때는 사용 해도 됨
  key: fs.readFileSync('도메인 비밀키 경로'),
  ca: [
    fs.readFileSync('상위 인증서 경로'),//인증서도 얻어와야함
    fs.readFileSync('상위 인증서 경로'),
  ],
}, (req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.write('<h1>Hello Node!</h1>');
  res.end('<p>Hello Server!</p>');
})
  .listen(443, () => { //https인 경우에 443으로 만들어야 뒤에 생략이 가능함
    console.log('443번 포트에서 서버 대기 중입니다!');
  });

const http = require('http');

http.createServer((req, res) => {
  console.log(req.url, req.headers.cookie);
  //다음 전달부터 쿠키를 읽어서 콘솔로 찍어줌
  res.writeHead(200, { 'Set-Cookie': 'mycookie=test' }); //Set-Cookie : 쿠키 넣음 // mycookie : 키 // test: 값
  //f12 apllication에서 쿠키 확인 가능
  //Session 쿠키는 브라우저를 끄는 순간 쿠키 사라짐
  //favicon.ico는 크롬이 알아서 보내주는 것임 신경 안써도 됨
  res.end('Hello Cookie'); //respons에서 확인 가능
})
  .listen(8083, () => {
    console.log('8083번 포트에서 서버 대기 중입니다!');
  });

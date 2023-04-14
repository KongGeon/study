const http = require('http');
const fs = require('fs').promises;

const users = {}; // 데이터 저장용  // 이거 안만들어 노흐면 데이터 못넣음

http.createServer(async (req, res) => { //서버를 만들고 8082번으로 요청을 보낸다. //node restServer 터미널에 작성시 시작
  //req : 요청  //res : 응답
  try {
    if (req.method === 'GET') { //주소창에 직접 치는 것이 GET요청
      if (req.url === '/') { //localhost:8082 만 쳐도 뒤에 '/'가 생략되어있음
        const data = await fs.readFile('./restFront.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); // charset=utf-8 : 한글사용
        //200 : 성공 , f12 > 네트워크 > 요소 클릭 > 우측에 헤더스 클릭하면 response headers 안에 Content-Type 들어있음
        //header는 data들에 대한 data, html에 대한 data를 헤더에 담아서 보내줌
        return res.end(data);
      } else if (req.url === '/about') { //localhost:8082/about => a태그로 이동되어도 get 요청임
        const data = await fs.readFile('./about.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(data);
      } else if (req.url === '/users') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(users)); //json형식으로 제작
      }
      // /도 /about도 /users도 아니면
      try {
        const data = await fs.readFile(`.${req.url}`); //html 파일에서 첨부한 css, js를 프론트로 보내주는 역할
        return res.end(data);
      } catch (err) {
        // 주소에 해당하는 라우트를 못 찾았다는 404 Not Found error 발생
      }
    } else if (req.method === 'POST') { //등록버튼 눌렀을때 post로 전달해줌
      if (req.url === '/user') {
        let body = '';
        // 요청의 body를 stream 형식으로 받음
        req.on('data', (data) => {
          body += data;
        });
        // 요청의 body를 다 받은 후 실행됨
        return req.on('end', () => { //응답 데이터는 f12 network 요소클릭 우측에 response에 들어있음
          console.log('POST 본문(Body):', body);
          const { name } = JSON.parse(body); //이런식으로 보내는 것으로 외우자
          const id = Date.now();
          users[id] = name;
          res.writeHead(201, { 'Content-Type': 'text/plain; charset=utf-8' });//200번으로 보내도 되는데 201은 생성되었다는 의미가 있어서 더 구체적인 데이터 전달 가능
          res.end('ok'); // f12  >  user > response 에서 확인 가능
        });
      }
    } else if (req.method === 'PUT') {  //수정
      if (req.url.startsWith('/user/')) {
        const key = req.url.split('/')[2];
        let body = '';
        req.on('data', (data) => {
          body += data;
        });
        return req.on('end', () => {
          console.log('PUT 본문(Body):', body);
          users[key] = JSON.parse(body).name;
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }); 
          return res.end('ok');
        });
      }
    } else if (req.method === 'DELETE') { //삭제
      if (req.url.startsWith('/user/')) {
        const key = req.url.split('/')[2];
        delete users[key];
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('ok');
      }
    }
    res.writeHead(404);
    return res.end('NOT FOUND');
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(err.message);
  }
})
  .listen(8082, () => {
    console.log('8082번 포트에서 서버 대기 중입니다');
  });

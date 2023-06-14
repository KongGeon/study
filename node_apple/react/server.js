const express = require('express');
const path = require('path');
const app = express();

app.listen(8080, function () {
  console.log('listening on 8080')
}); 

//리액트는 아마존이나 거기 올릴때에는 빌드를 해야 쓸수 있음, 빌드하면 html 파일이 생김

//이 코드 넣고 시작하셔야 리액트와 nodejs 서버간 ajax 요청 잘됩니다.  이거 쓰려면 서버프로젝트 터미널에서 npm install cors 설치해야합니다. 
app.use(express.json());
var cors = require('cors');
app.use(cors());


app.use(express.static(path.join(__dirname, 'react-project/build'))); //이게 있어야 특정 폴더의 파일들 전송가능

app.get('/', function (요청, 응답) {
  응답.sendFile(path.join(__dirname, '/react-project/build/index.html')); //리액트로 만든 html 파일경로
});


app.get('/product', function (요청, 응답) { // 1. DB에 있는 상품명 보여주려면 이런 API 작성 2.리액트는 여기로 GET 요청
    응답.json({ name: 'black shoes'})
  });
  






app.get('*', function (요청, 응답) { // 최하단 작성
    응답.sendFile(path.join(__dirname, '/react-project/build/index.html')); //리액트 라우터를 사용해서 링크 이동을 할 경우 작성필요. * 는 모든 경로를 의미함
  });
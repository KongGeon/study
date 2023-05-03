const express = require('express');
const app = express();

app.listen(8081, function () {
    //8080 서버 열렸을때 함수실행

    console.log('8081')
});

app.get('/pet', function (요청, 응답) {
    응답.send('펫용품 쇼핑')
})
app.get('/beauty', function (요청, 응답) {
    응답.send('뷰티용품 사세요!')
})
const express = require("express");
const app = express();
app.use(express.urlencoded({extended: true})); //body-parser 불러오기

app.listen(8081, function () {
  //8080 서버 열렸을때 함수실행

  console.log("8081");
});

//get 요청
app.get("/pet", function (요청, 응답) {
  응답.send("펫용품 쇼핑");
});
app.get("/beauty", function (요청, 응답) {
  응답.send("뷰티용품 사세요!");
});
app.get("/", function (요청, 응답) {
  응답.sendFile(__dirname + "/index.html");
});
app.get("/write", function (요청, 응답) {
  응답.sendFile(__dirname + "/write.html");
});

//post 요쳥
app.post("/add", function (요청, 응답) {
  응답.send(요청.body);
});

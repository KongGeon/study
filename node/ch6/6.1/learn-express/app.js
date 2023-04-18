const express = require("express");
const path = require("path");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const app = express(); //express에서 app을 하나 가져옴
app.set("port", process.env.PORT || 3000); //app.set('@@@') : @@@ 속성을 전역변수로 넣음
//process.env.PORT : 설정된 포트 번호
//터미널에서 SET PORT=80 이런식으로 포트를 변경할 수 있지만 그렇게 하면 다른 프로젝트의 포트도 고정되므로 지양해야함

app.use(morgan("dev")); //요청과 응답을 기록하는 라우터
app.use(morgan("combined")); //개발시에는 dev 실제에는 combined

// 쿠키
app.use(cookieParser()); //쿠키 전달해줌

// bodtparser가 express안으로 들어왔음
app.use(express.json()); //얘를 넣어두면 알아서 데이터를 파싱해줌 : json형식
app.use(express.urlencoded({extended: true})); //얘를 넣어두면 알아서 데이터를 파싱해줌 : form 형식, 이미지 형식은 제외

app.use((req, res, next) => {
  //모든 곳에서 실행하려면 이렇게
  console.log("모든 요청에 실행하고 싶어요"); //안에 함수를 미들웨어 하고 함
  next(); // 다음으로 함수 전달
}),
  (req, res, next) => {
    // 이런식으로 연결도 가능
    try {
      throw new Error("에러가 났어요"); //에러 만드는 코드
    } catch (error) {
      next(error); // next 안에 아무 것도 없으면 다음 미들웨어로 이동, 안에 인수 들어있으면 바로 에러처리 미들웨어로 이동
    }
  };

app.use("about", (req, res, next) => {
  //about에서만 실행하려면 이렇게
  console.log("about에서만 실행하고 싶어요"); //안에 함수를 미들웨어 하고 함
  next(); // 다음 /about에 함수 전달
});

app.get("/", (req, res) => {
  // 쿠키
  req.cookies; //{mycookie:'test'} 이런식으로 쿠키 전달 cookieParser
  req.signedCookies; //암호화된(서명) 쿠키
  res.cookies("name", encodeURIComponent(name), {
    //setcookie와 같음
    expires: new Date(),
    httpOnly: true,
    path: "/",
  });
  res.clearCookie("name", encodeURIComponent(name), {
    //쿠키 삭제
    httpOnly: true,
    path: "/",
  });

  // res.send('Hello, Express');
  res.sendFile(path.join(__dirname, "/index.html"));
  //sendFile 알아서 fs모듈을 사용해서 Html을 부름
  //__dirname : 현재폴더

  res.send("안녕"); //위에 샌드파일 했는데
  res.json({hello: "hi"}); // 한 라이터에서 이런식으로 샌드나 제이슨을 사용해서 데이터를 전달하려고 하면 에러가 뜸
}),
  (req, res, next) => {
    //이런 식으로 이어서 진행도 가능
    next("router"); // next 안에 인수가 'router' 면 아래 동일 아우터의 다른 미들웨어인 아래 미들웨어가 실행되지 않고 다음 라우터로 이동
  },
  app.listen(app.get("port"), () => {
    //app.get('@@@') : @@@ 속성을 가져옴
    console.log(app.get("port"), "번 포트에서 대기 중,");
  });

app.listen("/java", () => {
  // '/java' 일 경우 노출
  res.send(`hello`);
});

app.listen("/:name", () => {
  // 위에 정의한 주소 외에 주소일 경오 노출 마지막에 정의해야함
  res.send(`hello wildcard`);
});

app.listen("*", () => {
  // 위에 정의한 주소 외에 주소일 경오 노출 마지막에 정의해야함, /:name 보다 더 범용
  res.send(`hello evreybody`);
});

app.use((err, res, next) => {
  //404처리 미들웨어
  res.send("404");
  // res.status(200).send("200");  이렇게하면 스테이터스가 404인데 200으로 속일수 있음. 해커 대응용 ^^, 특히 400, 500 대는 잘 쓰면 안됨
});

app.use((err, req, res, next) => {
  //***** 에러 미들웨어에는 4개 다 넣어줘야 함 ******** 중요!!!
  console.log(err);
  res.send("에러났어영");
});

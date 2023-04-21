const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");

dotenv.config();
// dotenv가 .env를 읽어서 process.env 객체에 대입, 처음 한번만 하면됨
// .env 파일을 만들어 주고 키 값 형식으로 만들어준다. 세미클론은 적지 않는다.
// *** 절대 git에 올리면 안됨 ***
// 최상단에 둬야 함. 예를 들어서  mogandl이 dotenv 값에 따라서 바뀐다고 하면 아래 처럼 require 밑에 놔야 함
// const dotenv = require("dotenv");
// dotenv.config();
// const morgan = require("morgan");

const app = express();
app.set("port", process.env.PORT || 3000);

app.use(morgan("dev"));
app.use("/", express.static(path.join(__dirname, "public")));
//static : 보안상 사용함, public은 너무 유명하니까 public-3030이런식으로 사용하면 좋음
//실제로는 learn-express/public/hello.css 이지만
//보여줄때는 localhost:3000/hello.css 로 보여주게 만들어줘서 파일 구조를 파악하기 힘들게 해줌

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));//서명
//dotenv 를 통해서 키를 환경변수에 숨겨두고 사용함, 보안상 필요, 소스코드가 털려도 비밀키는 털리지 않을 수 있음

app.use(
  session({
    //session : 개인의 저장공간을 만들어줌
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true, //자바스크립트 공격 방지
      secure: false,
    },
    name: "session-cookie", //서명되어있어서 읽을 수 없는 문자열로 나타남
  })
);

//**** 전역변수로 개인적인 데이터가 들어간 것을 만들면 안됨 나중에 나오면 안될 곳에서 나올 수 있음. ex. 비밀번호 */

const multer = require("multer");
const fs = require("fs");

try {
  fs.readdirSync("uploads"); //서버 시작전에 업로드 폴더가 없으면
} catch (error) {
  console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다.");
  fs.mkdirSync("uploads"); // 업로드 폴더를 만든다. // 서버 시작 전 이럴때는 sync 써도 됨
}
const upload = multer({
  storage: multer.diskStorage({
    //storage : 업로드할 파일을 어디에 저장 할 것 인가 설정, diskStorage : 디스크에 저장
    destination(req, file, done) {
      done(null, "uploads/");
      // null : 이자리에 에러처리 미들웨어로 넘기려면 error를 넣어줘야 함
      // uploads 폴더에 저장, 없으면 에러가 남으로 폴더 만들어줘야함
    },
    filename(req, file, done) {
      const ext = path.extname(file.originalname); // 확장자 추출
      done(null, path.basename(file.originalname, ext) + Date.now() + ext); // 날짜를 껴 놓는 이유는 이름이 같을때 덮어 씌울 수 있기 때문임
    },
  }),
  limits: {fileSize: 5 * 1024 * 1024}, //파일 사이즈 // 5메가바이트 이상을 하면 400번대 에러 발생
});
app.get("/upload", (req, res) => {
  res.sendFile(path.join(__dirname, "multipart.html"));
});
app.post("/upload", upload.single("image"), (req, res) => {
  //upload.single : 1개의 파일만 업로드 할때, 'image'는 가져올 input의 Name과 일치해야함
  //input이 multiple일 경우 upload.array를 사용해야함 , 이럴경우는 req.file 말고 req.files 안에 데이터가 배열로 들어있음
  //input이 여러개일 경우에는 upload.fields([{name:'image1', limits:5},{name:'image2'}]) 이런식으로 넣어줘야 함, req.files.image1 이런식으로 데이터가 들어있음
  console.log(req.file);
  res.send("ok");
});

app.get(
  "/",
  (req, res, next) => {
    console.log("GET / 요청에서만 실행됩니다.");
    next(); //다음으로 함수 넘김
  },
  (req, res) => {
    throw new Error("에러는 에러 처리 미들웨어로 갑니다.");
  }
);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message);
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});

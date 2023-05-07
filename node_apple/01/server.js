const express = require("express");
const app = express();
app.use(express.urlencoded({extended: true})); //body-parser 불러오기

app.set("view engine", "ejs"); //EJS 불러오기

app.use("/public", express.static("public")); //css나 그런 폴더 넣을때 이런식으로 넣어야 인식함

const methodOverride = require("method-override"); //PUT 요청하기 위한 라이브러리
app.use(methodOverride("_method"));

const passport = require("passport"); //세션을 이용한 회원가입
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
app.use(session({secret: "비밀코드", resave: true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

let db;
const MongoClient = require("mongodb").MongoClient; // 몽고db 불러오기
MongoClient.connect(
  "mongodb+srv://admin:qwe1234@cluster0.ir2oe4d.mongodb.net/?retryWrites=true&w=majority",
  function (에러, client) {
    //몽고db 접속되면

    if (에러) return console.log(에러);
    db = client.db("todoapp");

    app.listen(8081, function () {
      //8081 서버 열렸을때 함수실행

      console.log("8081");
    });

    //get 요청
    app.get("/", function (요청, 응답) {
      //   응답.sendFile(__dirname + "/index.html");
      응답.render("index.ejs");
    });
    app.get("/write", function (요청, 응답) {
      // 응답.sendFile(__dirname + "/write.html");
      응답.render("write.ejs");
    });

    //post 요쳥
    app.post("/add", function (요청, 응답) {
      // db.collection('콜랙션').insertOne('저장할데이터(오브젝트형식)', function(에러,결과){}); //데이터 저장
      let 총게시물개수;
      db.collection("counter").findOne(
        {name: "게시물개수"},
        function (에러, 결과) {
          총게시물개수 = 결과.totalPost;

          db.collection("post").insertOne(
            {
              _id: 총게시물개수 + 1,
              제목: 요청.body.title,
              날짜: 요청.body.date,
            }, //id값 만들어줘야함, 컬랙션을 하나 더 만들어서 사용
            function (에러, 결과) {
              console.log("저장완료");
              // db.collection('counter').updateOne({수정할데이터},{?? : {수정값}},function(){}) //id에 1더하기 // ?? == 오퍼레이터
              db.collection("counter").updateOne(
                {name: "게시물개수"},
                {$inc: {totalPost: 1}},
                function (에러, 결과) {
                  // 업데이트**********
                  // $inc == 지금있는데이터에 추가로 증가시킴
                  if (에러) return console.log(에러);
                }
              );
            }
          );
        }
      );

      응답.send("저장완료");
    });

    // get요청 접속하면 post로 전달한 데이터를 리스트로 보여줌
    app.get("/list", function (요청, 응답) {
      // 컬랙션이 post인 db 안에 모든 데이터 꺼내기
      db.collection("post")
        .find()
        .toArray(function (에러, 결과) {
          응답.render("list.ejs", {posts: 결과});
        });
    });

    app.delete("/delete", function (요청, 응답) {
      요청.body._id = parseInt(요청.body._id); //자료형 안맞아서 변환, 타입스크립트랑 연동해보자
      db.collection("post").deleteOne(요청.body, function (에러, 결과) {
        //요청.body 이자리가 조건자리, 자료형 잘 맞춰줘야 삭제됨
        //delete 성공했을때 실행

        응답.status(200).send({message: "성공했어요"}); //참고용: 스테이터스 변경
        // 응답.send('<p>some html</p>') 참고용: 이런식으로 많음
        // 응답.status(404).send('Sorry, we cannot find that!')
        // 응답.sendFile('/uploads/logo.png')
        // 응답.render('list.ejs', { ejs에 보낼 데이터 })
        // 응답.json(제이슨데이터)
        // 응답.status(400).send({ message: '실패했어요' });
      });
    });

    app.get("/detail/:id", function (요청, 응답) {
      // : 뒤에 아무 파라미터가 들어가도 실행
      db.collection("post").findOne(
        {_id: parseInt(요청.params.id)}, //요청.params.id 이런식으로 주소의 id를 가져옴, 자료형 잘 맞추고..
        function (에러, 결과) {
          console.log(결과);
          응답.render("detail.ejs", {data: 결과});
        }
      );
    });

    app.get("/edit/:id", function (요청, 응답) {
      //글수정
      db.collection("post").findOne(
        {_id: parseInt(요청.params.id)}, //요청.params.id 이런식으로 주소의 id를 가져옴, 자료형 잘 맞추고..
        function (에러, 결과) {
          console.log(결과);
          응답.render("edit.ejs", {data: 결과});
        }
      );
    });

    app.put("/edit", function (요청, 응답) {
      //글수정
      // db.collection("post").updateOne({_id: ??},{$set: {제목: ??, 날짜: ??}},function(에러,결과){})
      //   $set == 업데이트해주세요~ 그런데 없으면 추가해주세여
      db.collection("post").updateOne(
        {_id: parseInt(요청.body.id)},
        {$set: {제목: 요청.body.title, 날짜: 요청.body.date}},
        function (에러, 결과) {
          응답.redirect("/list"); //응답은 필수
        }
      );
    });

    app.get("/login", function (요청, 응답) {
      응답.render("login.ejs");
    });
    app.post(
      "/login",
      passport.authenticate("local", {
        failureRedirect: "/fail", //실패하면 여기로 이동
      }),
      function (요청, 응답) {
        //passport : 로그인 쉽게 해줌, authenticate() : 인증
        응답.redirect("/"); //로그인 성공하면 메인으로
      }
    );

    //아이디 비번 인증 코드
    passport.use(
      new LocalStrategy(
        {
          usernameField: "id", //form id name
          passwordField: "pw",
          session: true, //세션에 저장할것인지 여부
          passReqToCallback: false,
        },
        function (입력한아이디, 입력한비번, done) {
          //console.log(입력한아이디, 입력한비번);
          db.collection("login").findOne(
            {id: 입력한아이디},
            function (에러, 결과) {
              if (에러) return done(에러);

              if (!결과)
                return done(null, false, {message: "존재하지않는 아이디요"});
              if (입력한비번 == 결과.pw) {
                return done(null, 결과);
              } else {
                return done(null, false, {message: "비번틀렸어요"});
              }
            }
          );
        }
      )
    );
  }
);

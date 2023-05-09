const express = require("express");
const app = express();
require("dotenv").config(); //env

app.use(express.urlencoded({ extended: true })); //body-parser 불러오기

app.set("view engine", "ejs"); //EJS 불러오기

app.use("/public", express.static("public")); //css나 그런 폴더 넣을때 이런식으로 넣어야 인식함

const methodOverride = require("method-override"); //PUT 요청하기 위한 라이브러리
app.use(methodOverride("_method"));

const passport = require("passport"); //세션을 이용한 회원가입
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
app.use(
  session({ secret: "비밀코드", resave: true, saveUninitialized: false })
);
app.use(passport.initialize());
app.use(passport.session());

let db;
const MongoClient = require("mongodb").MongoClient; // 몽고db 불러오기
MongoClient.connect(process.env.DB_URL, function (에러, client) {
  //몽고db 접속되면

  if (에러) return console.log(에러);
  db = client.db("todoapp");

  app.listen(process.env.PORT, function () {
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
      { name: "게시물개수" },
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
              { name: "게시물개수" },
              { $inc: { totalPost: 1 } },
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
        응답.render("list.ejs", { posts: 결과 });
      });
  });

  //검색
  app.get("/search", function (요청, 응답) {
    var 검색조건 = [
      {
        $search: {
          index: "titleSearch",
          text: {
            query: 요청.query.value,
            path: "제목", // 제목날짜 둘다 찾고 싶으면 ['제목', '날짜']
          },
        },
      },
      { $sort: { _id: 1 } }, //정렬, 1, -1 로 오름 내림 선택 가능
      {
        $project: { 제목: 1, _id: 1, 날짜: 1, score: { $meta: "searchScore" } },
      }, // 데이터 결과 나타내는 방법, 0이거나 안적으면 안가져오기 1이면 가져오기, 다 보여줄거면 없어도됨, score(검색어랑 결과랑 유사정도) 같은건 내가 정의 안한건데도 가져올 수 있음
    ];
    // get방식으로 들어간 내용은 요청.query 에 다 들어있음
    db.collection("post")
      // .find({제목: 요청.query.value}) //조건, 하지만 find로 하면 하나씩 다 검색해야해서 느림,
      // .find({ $text: { $search: 요청.query.value } }) // 몽고db 컬랙션 만들고 indexes 탭 들어가서 CREATE INDEX 클릭 , 필드 한줄만 남기고 내용 적기 ex {"제목": "text"} ==> 이렇게 했으면 이런식으로 조건 검색 가능, 하지만 띄어쓰기 단위로 검색되어서 한글 친화적이지 않음
      .aggregate(검색조건) // collections 탭 옆에 search 탭 클릭 > 그후에 뭐 이런거 하고 나서 할것, 검색조건 여러개 입력 가능, 한국어옵션을 넣어서 '입니다' '를' 이런거 없어도 검색 되도록 할 수 있음
      .toArray(function (에러, 결과) {
        응답.render("search.ejs", { posts: 결과 });
      });
  });

  // 삭제
  app.delete("/delete", function (요청, 응답) {
    요청.body._id = parseInt(요청.body._id); //자료형 안맞아서 변환, 타입스크립트랑 연동해보자
    db.collection("post").deleteOne(요청.body, function (에러, 결과) {
      //요청.body 이자리가 조건자리, 자료형 잘 맞춰줘야 삭제됨
      //delete 성공했을때 실행

      응답.status(200).send({ message: "성공했어요" }); //참고용: 스테이터스 변경
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
      { _id: parseInt(요청.params.id) }, //요청.params.id 이런식으로 주소의 id를 가져옴, 자료형 잘 맞추고..
      function (에러, 결과) {
        console.log(결과);
        응답.render("detail.ejs", { data: 결과 });
      }
    );
  });

  app.get("/edit/:id", function (요청, 응답) {
    //글수정
    db.collection("post").findOne(
      { _id: parseInt(요청.params.id) }, //요청.params.id 이런식으로 주소의 id를 가져옴, 자료형 잘 맞추고..
      function (에러, 결과) {
        console.log(결과);
        응답.render("edit.ejs", { data: 결과 });
      }
    );
  });

  app.put("/edit", function (요청, 응답) {
    //글수정
    // db.collection("post").updateOne({_id: ??},{$set: {제목: ??, 날짜: ??}},function(에러,결과){})
    //   $set == 업데이트해주세요~ 그런데 없으면 추가해주세여
    db.collection("post").updateOne(
      { _id: parseInt(요청.body.id) },
      { $set: { 제목: 요청.body.title, 날짜: 요청.body.date } },
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

  app.get("/mypage", 로그인했니, function (요청, 응답) {
    //마이페이지에 올때마다 로그인했니 함수를 실행시켜줌

    //deserializeUser를 이용해서 요청.user를 가져올 수 있음
    응답.render("mypage.ejs", { 사용자: 요청.user });
    //사용자 정보를 mypage로 데이터 넘겨줌
  });

  function 로그인했니(요청, 응답, next) {
    //마이페이지 로그인 여부 미들웨어
    if (요청.user) {
      //로그인한 상태라면 요청.user 가 늘 있음
      next();
    } else {
      응답.send("로그인안하셨는데요?");
    }
  }

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
        //사용자 아이디 비번 검증하는 함수, 복붙 고고
        //console.log(입력한아이디, 입력한비번);
        db.collection("login").findOne(
          { id: 입력한아이디 },
          function (에러, 결과) {
            if (에러) return done(에러);

            if (!결과)
              //결과가 없을때
              return done(null, false, { message: "존재하지않는 아이디요" });
            if (입력한비번 == 결과.pw) {
              //근데 이렇게 하면 보안이 쓰레기임, 알아서 찾아서 해시함수든 뭐든 쓸것.
              return done(null, 결과);
              //done(서버에러, 성공시 사용자 DB데이터, 에러메시지)
            } else {
              return done(null, false, { message: "비번틀렸어요" });
            }
          }
        );
      }
    )
  );

  passport.serializeUser(function (user, done) {
    // serializeUser: 세션을 저장시키는 코드
    //로그인 성공시 발동
    done(null, user.id);
    //user.id 정보로 세션을 만듦
  });

  passport.deserializeUser(function (아이디, done) {
    //마이페이지 접속시 발동
    db.collection("login").findOne({ id: 아이디 }, function (에러, 결과) {
      done(null, 결과);
    });
  });
});

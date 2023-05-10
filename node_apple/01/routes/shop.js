let router = require("express").Router();

function 로그인했니(요청, 응답, next) {
  //마이페이지 로그인 여부 미들웨어
  if (요청.user) {
    //로그인한 상태라면 요청.user 가 늘 있음
    next();
  } else {
    응답.send("로그인안하셨는데요?");
  }
}

router.use(로그인했니);
//아래 모든 라우터들에 적용할 미들웨어를 적용
// router.get('/shirts', 로그인했니,  function(요청, 응답){
//    응답.send('셔츠 파는 페이지입니다.');
// }); 그럼 이제 이런식으로 안써도 됨
router.use("/shirts", 로그인했니); // 특정 페이지에서만 미들웨어 일괄 적용할 거면 이런식으로 적으면 됨

router.get("/shirts", function (요청, 응답) {
  응답.send("셔츠 파는 페이지입니다.");
});
router.get("/pants", function (요청, 응답) {
  응답.send("바지 파는 페이지입니다.");
});

module.exports = router;

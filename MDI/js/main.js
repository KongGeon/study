// 탭이 하나라도 있으면 분할 버튼 노출
function showDivideBtn() {
  const hasTabs =
    ($("#sortable01 > div").length !== 0 &&
      $("#sortable02 > div").length === 0) ||
    ($("#sortable01 > div").length === 0 &&
      $("#sortable02 > div").length !== 0);
  $("#btnMoveRight").css("display", hasTabs ? "block" : "none");
}

// 좌측 메뉴 클릭
function leftMenuClick() {
  const tabWrap = $(".tabs");
  const tabContents = $(".tab-contents");

  $(".left-menu a").on("click", function (e) {
    e.preventDefault();
    const page = $(this).attr("href");
    const pageName = $(this).text();
    const pageID = $(this).attr("id");

    const alreadyOpenedTab = $(`#${pageID}contents`).length !== 0;

    if (alreadyOpenedTab) {
      // 이미 열린 창이라면
      let thisParent;
      if ($(`#${pageID}contents`).closest("#contents01").length === 1) {
        thisParent = "#contents01";
      } else if ($(`#${pageID}contents`).closest("#contents02").length === 1) {
        thisParent = "#contents02";
      }
      $(`${thisParent} .tab-inner`).removeClass("on");
      $(`#${pageID}contents`).addClass("on");
      $(`${thisParent} .tab-name`).removeClass("on");
      $(`${thisParent} .tab-name-${pageID}`).addClass("on");
    } else {
      // 처음 열린 것이라면
      const tab = `
        <div class="tab-name tab-name-${pageID}" data-name="${pageID}">
          <a href="#" data-name="${pageID}">${pageName}</a>
          <button class="close-btn" data-name="${pageID}">종료</button>
        </div>
      `;
      tabWrap.append(tab);
      $("#contents01 .tab-inner").removeClass("on");

      const tabInnerAdd = `
        <div id="${pageID}contents" class="tab-inner on">
          <p>${pageName}</p>
          <iframe class="iframetab" src="${page}" user-data="${pageID}" width="100%" scrolling="no" frameborder="0" marginwidth="0" marginheight="0" style="width: 1641px; height: 1182px;"></iframe>
        </div>
      `;
      tabContents.append(tabInnerAdd);

      $("#contents01 .tab-name").removeClass("on");
      $(`#contents01 .tab-name-${pageID}`).addClass("on");
    }

    // 분할 버튼 활성화
    showDivideBtn();
  });
}

// 상단 탭 클릭
$(document).on("click", ".tab-name > a", function () {
  let thisParent;
  if ($(this).closest("#contents02").length === 1) {
    thisParent = "#contents02";
  } else if ($(this).closest("#contents01").length === 1) {
    thisParent = "#contents01";
  }

  $(`${thisParent} .tab-inner`).removeClass("on");
  const thisName = $(this).data("name");
  $(`${thisParent} #${thisName}contents`).addClass("on");
  $(`${thisParent} .tab-name`).removeClass("on");
  $(this).parent().addClass("on");
});

// 빈쪽 삭제하는 이벤트
function deletePage() {
  if ($("#sortable01 > div").length === 0) {
    $("#contents01").remove();
    $(".right-on").removeClass("right-on");
    setTimeout(() => {
      $("#contents02").attr("id", "contents01");
      $("#sortable02").attr("id", "sortable01");
    }, 100);
    setTimeout(() => {
      // 좌측 메뉴 클릭 이벤트 재생성
      leftMenuClick();
    }, 200);
    $("#btnMoveRight").css("display", "block");
    // 사이 간격 드래그로 조절 이벤트 삭제
    $(".contents").split().destroy();
  } else if ($("#sortable02 > div").length === 0) {
    $("#contents02").remove();
    $(".right-on").removeClass("right-on");
    $("#btnMoveRight").css("display", "block");

    // 사이 간격 드래그로 조절 이벤트 삭제
    $(".contents").split().destroy();
  }
}

// 삭제
$(document).on("click", ".close-btn", function () {
  let thisParent;
  if ($(this).closest("#contents01").length === 1) {
    thisParent = "#contents01";
  } else if ($(this).closest("#contents02").length === 1) {
    thisParent = "#contents02";
  }

  const thisName = $(this).data("name");
  $(`#${thisName}contents`).remove();
  $(this).parent().remove();

  // 마지막 창 노출
  const lastName = $(`${thisParent} .tab-name:last-child`).data("name");
  $(`${thisParent} .tab-name`).removeClass("on");
  $(`${thisParent} .tab-inner`).removeClass("on");
  $(`${thisParent} .tab-name-${lastName}`).addClass("on");
  $(`${thisParent} #${lastName}contents`).addClass("on");

  if (
    ($("#sortable01 > div").length !== 0 &&
      $("#sortable02 > div").length === 0) ||
    ($("#sortable01 > div").length === 0 && $("#sortable02 > div").length !== 0)
  ) {
    deletePage(); // 양쪽 중 한 페이지만 없을 때 이벤트 실행
  }

  // 분할 버튼 활성화
  showDivideBtn();
});

// 드래그
$(function () {
  $("#sortable01").sortable({
    //너무 짧게 드래그 할 경우 드래그 안되도록 설정
    distance: 10,
    //좌우로만 드래그
    axis: "x",
  });
});

// 오른쪽 분할 버튼 클릭
$("#btnMoveRight").on("click", function () {
  const rightWrap = document.querySelector("#contents02");
  if (rightWrap) {
    // 이미 오른쪽 분할이 있다면
  } else {
    // 오른쪽 분할이 없었으면
    $(".contents").addClass("right-on");
    $("#btnMoveRight").css("display", "none");

    const text = `
    <div id="contents02" class="contents-inner">
      <div id="sortable02" class="tabs">
      </div>
      <div class="tab-contents">
      </div>
    </div>
  `;

    // 분할 화면 생성
    $(".contents").append(text);

    // 켜져있던 화면 오른쪽으로 이동
    const thisName = $(".tab-name.on").data("name") + "contents";
    $("#sortable02").append(document.querySelector(".tab-name.on").outerHTML);
    document.querySelector(".tab-name.on").remove();

    $("#contents02 .tab-contents").append(
      document.getElementById(thisName).outerHTML
    );
    document.getElementById(thisName).remove();

    // 왼쪽 화면 마지막 화면 노출
    const lastName = $("#contents01 .tab-name:last-child").data("name");
    $(`#contents01 .tab-name-${lastName}`).addClass("on");
    $(`#contents01 #${lastName}contents`).addClass("on");

    // 오른쪽 탭 드래그 가능, 탭 좌우간 이동 가능
    $("#sortable01, #sortable02").sortable({
      connectWith: ".tabs", // 탭끼리 연동
      //너무 짧게 드래그 할 경우 드래그 안되도록 설정
      distance: 10,
      //좌우로만 드래그
      axis: "x",
      receive: function (event, ui) {
        // 이동한 탭이 왼쪽 탭이면
        if (ui.item.closest("#contents01").length === 1) {
          thisParent = "#contents01";
          anotherParent = "#contents02";
        }
        // 이동한 탭이 오른쪽 탭이면
        else if (ui.item.closest("#contents02").length === 1) {
          thisParent = "#contents02";
          anotherParent = "#contents01";
        }

        // 이동한 탭 활성화 되면서 탭 내용 이동
        const thisName = ui.item.data("name") + "contents";
        $(`#${thisName}`).addClass("on");
        const thisHTML = document.getElementById(thisName).outerHTML;
        document.getElementById(thisName).remove();
        $(`${thisParent} .tab-inner`).removeClass("on");
        $(`${thisParent} .tab-name`).removeClass("on");
        $(`${thisParent} .tab-contents`).append(thisHTML);
        ui.item.addClass("on");

        // 왼쪽 화면 마지막 화면 노출
        if ($(`${anotherParent} .tab-name.on`).length === 0) {
          const lastName = $(`${anotherParent} .tab-name:last-child`).data(
            "name"
          );
          $(`${anotherParent} .tab-name-${lastName}`).addClass("on");
          $(`${anotherParent} #${lastName}contents`).addClass("on");
        }

        // 한쪽으로 모두 이동되었다면 나머지 쪽은 제거
        deletePage();
      },
    });
  }
  // 사이 간격 드래그로 조절
  $(".contents").split({ orientation: "vertical", limit: 500 });
});

// 초기화: 분할 버튼 활성화
leftMenuClick();
showDivideBtn();

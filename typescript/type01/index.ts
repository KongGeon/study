type aa = number | string | boolean;
function 함수([a, b, c]: aa[]) {
  console.log(a, b, c);
}

함수([40, "wine", false]);

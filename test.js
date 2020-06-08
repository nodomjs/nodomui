let reg = new RegExp("^(?!/user/(aaa|bbb))$");
// let reg1 = new RegExp("^(?!/api/xxx/b)");

let s = '/user/bbb1';
console.log(reg.test(s));
let func = function(r){
    console.log(r);
}

let foo = eval('(' + func.toString() + ')');
foo('a');

console.log(/^[1-9]\d{3}\-\d{1,2}\-\d{1,2}$/.test('0980-2-30'));
console.log(new Date('20:12:12'));
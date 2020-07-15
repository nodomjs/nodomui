let func = function(r){
    console.log(r);
}

let foo = eval('(' + func.toString() + ')');
foo('a');
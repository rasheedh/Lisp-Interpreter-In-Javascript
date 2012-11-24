//Operations
Math.add = function (a, b) {
    return a + b;
};

Math.sub = function (a, b) {
    return a - b;
};

Math.mul = function (a, b) {
    return a * b;
};

Math.div = function (a, b) {
    return a / b;
};

Math.grtn = function (a, b) {
    return a > b;
};

Math.lstn = function (a, b) {
    return a < b;
};

Math.geql = function (a, b) {
    return a >= b;
};

Math.leql = function (a, b) {
    return a <= b;
};

Math.eql = function (a, b) {
    return a === b;
};

Math.mod = function (a, b) {
    return a % b;
};
//Symbol,Env Class
var Symbol = String;
function Env(pao) {
    var i, e = {}, outer = pao.outer || {};
        
    function get_outer() {
                return outer;
    };
        
    function find(variable) {
                if (e.hasOwnProperty(variable)) {
                        return e;
                } else {
            return outer.find(variable);
        }
    };
    
    if (0 !== pao.pars.length) {
        for (i = 0; i < pao.pars.length; i += 1) {
            e[pao.pars[i]] = pao.args[i];
        }
    }

    e.get_outer = get_outer;
    e.find = find;
    
    return e;
};
function add_globals(e) {
    
    var Methods = ['abs', 'acos', 'asin', 'atan', 'atan2', 'ceil', 'cos', 'exp', 'floor', 'log', 'max', 'min', 'pow', 'random', 'round', 'sin', 'sqrt', 'tan'], i;

    for (i = 0; i < Methods.length; i += 1) {
        e[Methods[i]] = Math[Methods[i]];
    }
    e['+'] = Math.add;
    e['-'] = Math.sub;
    e['*'] = Math.mul;
    e['/'] = Math.div;
    e['>'] = Math.grtn;
    e['<'] = Math.lstn;
    e['>='] = Math.geql;
    e['<='] = Math.leql;
    e['='] = Math.eql;
    e['remainder'] = Math.mod;
    e['equal?'] = Math.eql;
    e['eq?'] = Math.eql; 
    e['length'] = function (x) { return x.length; };
    e['cons'] = function (x, y) { var arr = [x]; return arr.concat(y); };
    e['car'] = function (x) { return (x.length !== 0) ? x[0] : null; };
    e['cdr'] = function (x) { return (x.length > 1) ? x.slice(1) : null; }; 
    e['append'] = function (x, y) { return x.concat(y); };
    e['list'] = function () { return Array.prototype.slice.call(arguments); }; 
    e['list?'] = function (x) { return x && typeof x === 'object' && x.constructor === Array ; };
    e['null?'] = function (x) { return (!x || x.length === 0); };
    e['symbol?'] = function (x) { return typeof x === 'string'; };
    return e;
};

var global_env = add_globals(Env({pars: [], args: []}));

//Eval
function eval(x, e) {
    var i;
    e = e || global_env;

    if (typeof x === 'string') {        
        return e.find(x.valueOf())[x.valueOf()];
    } else if (typeof x === 'number') { 
        return x;
    } else if (x[0] === 'quote') {      
        return x[1];
    } else if (x[0] === 'if') {         
        var test = x[1];
        var conseq = x[2];
        var alt = x[3];
        if (eval(test, e)) {
            return eval(conseq, e);
        } else {
            return eval(alt, e);
        }
    } else if (x[0] === 'set!') {                    
        e.find(x[1])[x[1]] = eval(x[2], e);
    } else if (x[0] === 'define') {    
        e[x[1]] = eval(x[2], e);
    } else if (x[0] === 'lambda') {    
        var vars = x[1];
        var exp = x[2];
        return function () {
                return eval(exp, Env({pars: vars, args: arguments, outer: e }));
        };
    } else if (x[0] === 'begin') {     
        var val;
        for (i = 1; i < x.length; i += 1) {
            val = eval(x[i], e);
        }
        return val;
    } else {                           
        var exps = [];
        for (i = 0; i < x.length; i += 1) {
            exps[i] = eval(x[i], e);
        }
        var proc = exps.shift();
        return proc.apply(e, exps);
    }
};

//read,parse,user interaction
function read(s){
    return read_from(tokenize(s));
}
function tokenize(s){
    return s.replace(/\(/g,' ( ').replace(/\)/g,' ) ').trim().replace(/\s+/g,' ').split(' ')
}
function read_from(tokens)
{
    if(0 === tokens.length){
        console.log("Unexpected EOF while reading");
        }
    var token = tokens.shift();
    if ('(' == token){
        var L = [];
        while (')' !==tokens[0]){
            L.push(read_from(tokens));
        }
        tokens.shift();
        return L;
        }
    else {
       if(')' === token){
	console.log("Unexpected");
	}
    else{
	return atom(token);
	}
        }
}
function atom(token)
{
    if (isNaN(token)){
	return token;
	}
    else{
	return parseFloat(token);
	}
}
var parse = read;
function repl(){
  process.stdin.resume();
  process.stdout.write('Enter the scheme:- ');
  process.stdin.on('data',function(input){
  input = input.toString();
  var val = eval(parse(input))
  if (val != undefined)
  {
    process.stdout.write('Result:'+val);
  }
  else {process.stdout.write('Enter the valu:- ');
  }
  }
  )
  }
  
repl()


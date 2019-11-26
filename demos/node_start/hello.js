var sobj1 = new String('abc');
var sobj2 = new String('abc');
console.log(sobj1 == sobj2); // false 2者不是同一个 String 对象的引用
console.log(sobj1 === sobj2); // false 理由同上
console.log(sobj1 + '' == sobj2 + ''); // true 2者都是 string，且内容相同
console.log(sobj1 + '' === sobj2 + ''); // true 2者都是 string，且内容相同
var sobj = new String('abc'); 
var s = 'abc';
console.log(sobj == s); // true 2者转换后的值相等
console.log(sobj === s); // false 2者类型不等

var sobj = new String('abc');
console.log(typeof sobj); // object
console.log(typeof 'sobj') // string

var abc = String(123);
console.log(typeof abc) // string

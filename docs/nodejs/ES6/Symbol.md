---
id: Symbol
title: 本文内容
sidebar_label: Symbol
---



## 简述

在 ES 5 之前，一共有 5 种原始类型

- string
- number
- bool
- null
- undefined

加上 Object 对象类型

ES 6 引入了 Symbol 这第 6 种**原始类型**



## 创建 Symbol

```javascript
let first = Symbol();
let person = {};
person[first] = 'czp';
console.log(person[first]); // czp
```

当我们想要访问 `person[first]` 时，一定要用到 `first` 这个最初定义的 Symbol，可以理解为私有的变量

Symbol 函数接收一个可选参数，用来添加这个 Symbol 的描述信息

```javascript
let first = Symbol('first value');
let person = {};
person[first] = 'czp';
console.log(person[first]); // czp
console.log(first); //  Symbol(first value)
```

可以使用 typeof 来检测 Symbol

```javascript
let first = Symbol('first value');
console.log(typeof first); // symbol
```



## 使用方法

所有使用可计算属性名的地方，都可以使用 Symbol

```javascript
let first = Symbol('first value');
let person = {
    [first]: 'czp'
};
// 将属性设置为只读
Object.defineProperty(person, first, {writable: false});
let last = Symbol('last value');
Object.defineProperties(person, {
    [last]: {
        value: 'hhh',
        writable: false
    }
});
console.log(person[first]); // czp
console.log(person[last]); // hhh
```



## Symbol 共享

ES 6 提供了一个全局的 Symbol 注册表

```javascript
let symbol1 = Symbol.for('111');
let symbol2 = Symbol.for('111');
let symbol3 = Symbol.for('1112222');
console.log(symbol1 === symbol2); // true
console.log(symbol3 === symbol2); // false
```

`Symbol.for(id)` 返回 id 对应的唯一 Symbol，如果不存在，则创建一个 Symbol 绑定到这个 id

其实有点类似于 Java 的字符串的 `intern()` 方法，说白了就是有个地方存储了全局的变量，然后让你去找，找不到就创建

另外还有一个方法 `Symbol.keyFor` 用来搜索与该 Symbol 有关的 key

```javascript
let symbol1 = Symbol.for('111');
let symbol2 = Symbol.for('111');
let symbol3 = Symbol.for('1112222');
let symbol4 = Symbol('23');
console.log(Symbol.keyFor(symbol1)); // 111
console.log(Symbol.keyFor(symbol2)); // 111
console.log(Symbol.keyFor(symbol3)); // 1112222
console.log(Symbol.keyFor(symbol4)); // undefined
```

说白了，双向绑定，一个 key 对应一个 symbol，一个 symbol 对应一个 key

如果我们没有使用 `Symbol.for` ，直接使用 `Symbol()` 函数创建的，那么将不会注册到全局的 Symbol 注册表，从而也没有对应的 key，返回的就是 undefined



## Symbol 属性枚举

ES 5 之前的枚举方式都不支持 Symbol 类型，要枚举 Symbol 类型的属性，只能使用 `Object.getOwnPropertySymbols()` 方法

```javascript
let uid = Symbol.for('uid');
let obj = {
    [uid]: '12345'
};
let symbols = Object.getOwnPropertySymbols(obj);
console.log(symbols.length); // 1
console.log(symbols[0]); // Symbol(uid)
console.log(obj[symbols[0]]); // 12345
```



## 使用 Symbol 实现的一些语言内部机制

Symbol对象下有一些属性，这些属性对应的值本身也是一个 symbol，通过这些 symbol 完成了一些语言的内部机制，包括有：

- Symbol.hasInstance：一个在执行 instanceof 时调用的内部方法，用于检测对象的继承信息
- Symbol.isConcatSpreadable：一个布尔值，用于表示当传递一个集合作为 Array.prototype.concat() 方法的参数时，是否应该将集合内的元素规整到同一层级
- Symbol.iterator：一个返回迭代器的方法
- Symbol.match：一个在调用 String.prototype.match() 方法时调用的方法，用于比较字符串
- Symbol.replace：一个在调用 String.prototype.replace() 方法时调用的方法，用于替换字符串的子串
- Symbol.search：一个在调用 String.prototype.search() 方法时调用的方法，用于在字符串中定位子串
- Symbol.species：用于创建派生类的构造函数
- Symbol.split：一个在调用 String.prototype.split() 方法时调用的方法，用于分割字符串
- Symbol.toPrimitive：一个返回对象原始值的方法
- Symbol.toStringTag：一个在调用 String.prototype.toString() 方法时使用的字符串，用于创建对象描述
- Symbol.unscopables：一个定义了一些不可被 with 语句引用的对象属性名称的对象集合

重写这些 Symbol 对应的属性，我们就可以改变一个对象的默认行为，这在以前是做不到的



## Symbol.hasInstance

每个函数中都有一个 Symbol.hasInstance 方法，用于确定对象是否是函数的实例，这个方法是在 Function.prototype 中定义的。这个属性被定义为不可写、不可配置、不可枚举。

该方法接收一个参数，也就是要检查的值，如果该值是函数的实例，则返回 true，例如

```javascript
obj instanceof Array;
// 等价于
Array[Symbol.hasInstance](obj)
```

因此我们可以尝试改写出一个没有实例的函数，将这个方法的返回值硬编码为 false

```javascript
function MyObject() {
    // 空函数
}

Object.defineProperty(MyObject, Symbol.hasInstance, {
    value: function (v) {
        return false;
    }
});
let obj = new MyObject();
console.log(obj instanceof MyObject); // false
```



## Symbol.isConcatSpreadable

concat 是数组的连接方法，对于数组元素，将会被碾平添加，例如

```javas
let nums = [1, 2, 3];
console.log(nums.concat([4, 5])); // [ 1, 2, 3, 4, 5 ]
```

对于非数组元素将不会碾平，例如

```javascript
let nums = [1, 2, 3];
console.log(nums.concat([4, 5], "asd")); // [ 1, 2, 3, 4, 5, "asd" ]
```

我们可以通过 Symbol.isConcatSpreadable 改变这个行为

```javascript
let nums = [1, 2, 3];
let likeAnArray = {
    0: 0,
    1: 1,
    length: 2,
    [Symbol.isConcatSpreadable]: true
};
console.log(nums.concat(likeAnArray)); // [ 1, 2, 3, 0, 1]
```

这样就可以将一个对象当成数组来解析，只要这个对象具有数字键和 length，并且 `[Symbol.isConcatSpreadable]: true`

我们也可以强制将一个数组当成普通对象，不被碾平

```javascript
let nums = [1, 2, 3];
let newNums = [4, 5];
console.log(nums.concat(newNums)); // [ 1, 2, 3, 4, 5]
console.log(nums.concat([newNums])); // [ 1, 2, 3, [ 4, 5 ] ]
newNums[Symbol.isConcatSpreadable] = false;
console.log(nums.concat(newNums)); // [ 1, 2, 3, [ 4, 5, [Symbol(Symbol.isConcatSpreadable)]: false ] ]
```

可以看出来，其实我们多添加一个 `[]` 的方式更优雅一点



## match、replace、search、split

这四个 Symbol 属性的暴露，让我们可以自定义对于正则的操作了
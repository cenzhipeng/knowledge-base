---
id: 常用API
title: 本文内容
sidebar_label: 常用 API
todo
---

本文记录一些 `Javascript` 中常用的 API。



## Object 类

函数以及构造函数的调用

- `Object()`，生成 `Object` 实例，例如：

  ```javascript
  var a = Object(); // 效果如同 var a = {};
  console.log(a); // 输出 {}
  ```

- `Object(arg)`，将参数转换成 Object 对象，例如：

  ```javascript
  var a = Object(3);
  console.log(a); // [Number: 3]
  var b = Object('3');
  console.log(b); // [String: '3']
  ```

- `new Object()`，等同于 `Object()`
- `new Object(arg)`，等同于 `Object(arg)`



属性

| 属性名                           | 说明                                                         |
| -------------------------------- | ------------------------------------------------------------ |
| create(o[,properties])           | 以对象 o 为原型并返回具有指定属性的实例，第二个参数是一个对象，它里面的属性的 key 是新对象的属性名，value 是这个新对象的属性的属性描述符，例如：`{ a: { value: 5, writable: true, enumerable: true, configurable: true }, b: { value: 8, writable: true, enumerable: true, configurable: true } }` |
| defineProperty(o, p, attributes) | 向对象 o 增加 / 更新具有特定信息的属性 p，o 是现有对象，p 是这个对象的某个属性的名称，p 是这个属性的属性（元属性），例如：`{value: 8, writable: true, enumerable: true, configurable: true}` |
| defineProperties(o, properties)  | 向对象 o 增加 / 更新具有特定信息的属性，`properties` 类同于上面的 `create` 方法的 `properties` 属性 |
| freeze(o)                        | 让一个对象完全冻结，对象不能修改任何属性和元属性，也不能添加和删除属性。（如果属性是个对象，可以修改对象里面的属性，除非它也是个不可变对象） |
| getPrototypeOf(o)                | 返回对象 o 的原型对象，等同于 `o.__proto__`                  |
| getOwnPropertyDescriptor(o, p)   | 在对象 o 的自有属性（也就是不含原型继承的属性）上寻找属性 p，返回一个描述符对象，该对象记录了 p 的一些信息。例如：`{ value: 1, writable: true, enumerable: true, configurable: true }`，value 表示属性值，其余的是属性的元属性。 |
| getOwnPropertyNames(o)           | 返回一个数组，该数组对元素是 `o`自身拥有的枚举或不可枚举属性名称字符串。 数组中枚举属性的顺序与通过 [`for...in`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...in) 循环（或 [`Object.keys`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)）迭代该对象属性时一致。数组中不可枚举属性的顺序未定义。（原型链上继承来的属性不参与进来） |
| isSealed(o)                      | 对象是否密封                                                 |
| isFrozen(o)                      | 对象是否冻结                                                 |
| isExtensible(o)                  | 对象是否可扩展                                               |
| keys(o)                          | 遍历对象自有的可枚举属性，不包括继承自原型的属性和不可枚举的属性。 |
| length                           | 值为 1                                                       |
| preventExtensions(o)             | 让一个对象不可扩展，这个对象永远不能添加新的属性（但可以删除已有属性）。我们还是可以通过扩展对象的原形对象的方式扩展该对象。也可以从原型链上继承新属性，但是属性不可改变 |
| prototype                        | 用于原型链，包含有下方的另一个表格里的那些属性，通常的对象原型链的顶层都是这个 `prototype` 对象，因此都具有下方表格的属性 |
| seal(o)                          | 让一个对象密封，密封对象不能添加删除属性，不能修改元属性，但可以修改已有属性的值。 |



Object.prototype 对象的属性

| 属性名                  | 说明                                                         |
| ----------------------- | ------------------------------------------------------------ |
| constructor             | Object 类对象的引用                                          |
| hasOwnProperty(v)       | 如果字符串 v 是实例的直接属性名，则返回真                    |
| isPrototypeOf(v)        | 如果对象 v 是实例的原型，则返回真                            |
| propertyIsEnumerable(v) | 如果字符串 v 是实例中可枚举的属性名，则返回真                |
| toSource()              | JavaScript 的增强功能。其求值结果将返回用于生成实例的字符串  |
| toLocaleString()        | 将实例转换为与位置相关的字符串值。一般由开发者根据需要实现   |
| toString()              | 将实例转换为字符串值。一般由开发者根据需要实现               |
| unwatch(p)              | JavaScript 的增强功能。删除属性 p 的观察点                   |
| valueOf()               | 将实例转换为恰当的值。如有必要，由开发者实现                 |
| watch(p, handle)        | JavaScript 的增强功能。对属性 p 设置观察点（一个会在值发生改变时被调用的函数） |
| defineGetter(p, getter) | JavaScript 的增强功能。对属性 p 设置 getter 属性（*1）       |
| defineSetter(p, setter) | JavaScript 的增强功能。对属性 p 设置 setter 属性（*1）       |
| lookupGetter(p)         | JavaScript 的增强功能。返回属性 p 的 getter 属性（*1）       |
| lookupSetter(p)         | JavaScript 的增强功能。返回属性 p 的 setter 属性（*1）       |
| noSuchMethod            | JavaScript 的增强功能。如果对对象调用了不存在的方法，该挂钩函数将会被调用（*2） |
| proto                   | JavaScript 的增强功能。（*3）                                |



## Math 类

| 属性名      | 说明                                        |
| ----------- | ------------------------------------------- |
| E           | 自然对数的底（2.7182818284590452354）       |
| LN2         | 2 的自然对数（0.6931471805599453）          |
| LN10        | 10 的自然对数（2.302585092994046）          |
| LOG2E       | 以 2 为底的 E 的对数（1.44269504088899634） |
| LOG10E      | 以 10 为底的 E 的对数（0.4342944819032518） |
| PI          | 圆周率（3.1415926535897932）                |
| SQRT1_2     | 1/2 的平方根（0.7071067811865476）          |
| SQRT2       | 2 的平方根（1.4142135623730951）            |
| abs(x)      | x 的绝对值                                  |
| acos(x)     | x 的 arccos                                 |
| asin(x)     | x 的 arcsin                                 |
| atan(x)     | x 的 arctan                                 |
| atan2(y, x) | y/x 的 arctan（坐标 x,y 的弧度制角度）      |
| ceil(x)     | 大于等于 x 的最小整数                       |
| cos(x)      | x 的 cos                                    |
| exp(x)                                | e 的 x 次方                                  |
| floor(x)                              | 小于等于 x 的最大整数                        |
| log(x)                                | x 的自然对数（底为 e）                       |
| max([value0, [value1, value2,  …  ]]) | 参数中的最大值                               |
| min([value0, [value1, value2,  …  ]]) | 参数中的最小值                               |
| pox(x, y)                             | x 的 y 次方                                  |
| random()                              | 大于等于 0 小于 1 的随机数                   |
| round(x)                              | x 四舍五入后的整数                           |
| sin(x)                                | x 的 sin                                     |
| sqrt(x)                               | x 的平方根                                   |
| tan(x)                                | x 的 tan                                     |
| toSource                              | JavaScript 自带的增强功能。返回字符串 "Math" |



## Error

Error 类的函数以及构造函数调用

| 函数或构造函数                          | 说明                                           |
| --------------------------------------- | ---------------------------------------------- |
| Error(message)                          | 生成一个 Error 实例                            |
| new Error(message)                      | 生成一个 Error 实例                            |
| Error(message, fileName, lineNumber)    | JavaScript 自带的增强功能。生成一个 Error 实例 |
| new Error(message, fileName, lineNumer) | JavaScript 自带的增强功能。生成一个 Error 实例 |



Error 类的属性

| 属性名    | 说明       |
| --------- | ---------- |
| length    | 值为 1     |
| prototype | 用于原型链 |



Error.prototype 对象的属性

| 属性名      | 说明                                                         |
| ----------- | ------------------------------------------------------------ |
| constructor | 对 String 类对象的引用                                       |
| message     | 错误信息                                                     |
| name        | 表示错误类型的字符串。例如，是 EvalError 的话则是 "EvalError"， 是 RangeError 的话则是 "RangeError" 等 |
| fileName    | JavaScript 自带的增强功能。发生错误的文件名                  |
| lineNumber  | JavaScript 自带的增强功能。发生错误的行号                    |
| stack       | JavaScript 自带的增强功能。发生错误时的调用栈                |
| toSource()  | JavaScript 自带的增强功能。其求值结果将返回生成了这一 Error 实例的字符串 |
| toString()  | 将 Error 实例转换为字符串值                                  |
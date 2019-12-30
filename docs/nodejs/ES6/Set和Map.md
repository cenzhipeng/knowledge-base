---
id: Set和Map
title: 本文内容
sidebar_label: Set和Map
---



## Set

ES 6 中添加了对 Set 的支持，它是一种有序集合，它里面包含的值不能重复

```javascript
let set = new Set();
set.add(5);
set.add('5');
console.log(set.size); // 2
console.log(set.has(5)); // true
console.log(set.has(6)); // false
```



## Set 移除元素

- delete 删除某个元素
- clear 清空整个 Set



## Set 的 forEach

forEach 回调函数接收 3 个参数

- 当前迭代的元素
- 与第一个参数一样的值
- 被遍历的 Set 本身

例如

```javas
let set = new Set();
set.add(5);
set.add('6');
set.forEach((k, v, s) => {
    console.log(k);
    console.log(v);
});
```

输出

```bash
(py3.5) czp@:~/workspace/knowledge-base/demos/node_start$ node hello.js
5
5
6
6
```

回调函数的前两个参数是一样的，看起来很奇怪，实际是因为兼容 Map 的回调函数，可以将 Set 当成是 value 等于 key 本身的 Map

如果需要在回调函数中使用 this 引用，可以将其传入到 forEach 函数的第二个参数（或者使用箭头函数来定义回调函数）



## Set 和数组相互转换

数组转 Set 很简单，如下

```javas
let set = new Set([1,2,2,3,4,4,5]);
console.log(set); //  Set { 1, 2, 3, 4, 5 }
```

集合会自动去重（这个特性经常用）

Set 转数组也很简单，如下

```javas
let set = new Set([1, 2, 2, 3, 4, 4, 5]);
console.log([...set]); // [ 1, 2, 3, 4, 5 ]
```

这种语法就是之前说过的，参数展开



## Weak Set 集合

先看强引用

```javascript
let set = new Set();
let k = {};
set.add(k);
k = null;
console.log(set.size); // 1
```

再看弱引用

```javascript
let set = new WeakSet();
let k = {};
set.add(k);
k = null;
console.log(set.has(k)); // false
```

当然，其实弱引用最后的那个测试，一定是 false，这里测试也是白测试的。但是记住，只要我们将 k 置为 null 之后，弱引用的 Set 一定会将其垃圾回收

WeakSet 和 Set 有以下区别

- add、has、delete 方法传入非对象参数会报错（WeakSet 只能接收对象参数）
- WeakSet 不能迭代，所以不能用于 for-of 循环，也不能 forEach
- WeakSet 不支持 size 方法



## Map

```javascript
let map = new Map();
map.set('k1', 'v1');
map.set('k2', 'v2');
map.set('k3', 'v3');
console.log(map.get('k1')); // v1
```



## Map 集合的初始化方法

上面的 3 个键值对可以在初始化时就传进来，例如

```javascript
let map = new Map([['k1', 'v1'], ['k2', 'v2'], ['k3', 'v3']]);
console.log(map.get('k1')); // v1
console.log(map.size); // 3
```



## Map 的 forEach

forEach 回调函数接收 3 个参数

- 当前迭代的元素值
- 当前迭代的元素值的 key
- 被遍历的 Map 本身

```javascript
let map = new Map([['k1', 'v1'], ['k2', 'v2'], ['k3', 'v3']]);
map.forEach((v, k, m) => {
    console.log(k);
    console.log(v);
});
```

输出

```bash
(py3.5) czp@:~/workspace/knowledge-base/demos/node_start$ node hello.js
k1
v1
k2
v2
k3
v3
```



## WeakMap

不多说了，跟 WeakSet 差不多，只不过只支持键名的弱引用，值依然是强引用
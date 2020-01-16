---
id: JSX
title: 本文内容
sidebar_label: JSX
---



## JSX 简介

一个 JSX 可以理解成一个有点类似于 DOM 元素的对象，但是它不会进行渲染，仅仅有一些状态值，所以生成一个 JSX 对象的开销并不大

如下语法

```javascript
const element = <h1>Hello, world!</h1>;
```

这就是一个 JSX，JSX 语法中 `<h1>Hello, world!</h1>;` 实际上就代表了一个 JavaScript 对象，类似于一个字符串字面量的含义

> **一个 JSX 就是一个 JavaScript 对象**
>
> **JSX 生成后就不可更改，因此我们想改变节点内容时，应该生成新的 JSX 对象然后去渲染**



## JSX 嵌入表达式

```javascript
const name = 'Josh Perez';
const element = <h1>Hello, {name}</h1>;
```

我们可以在 JSX 里使用 `{JavaScript表达式}` 的语法，大括号里的内容可以是任意的 JavaScript 表达式，用起来很像模板字符串

```javascript
function formatName(user) {
  return user.firstName + ' ' + user.lastName;
}

const user = {
  firstName: 'Harper',
  lastName: 'Perez'
};

const element = (
  <h1>
    Hello, {formatName(user)}!
  </h1>
);

ReactDOM.render(
  element,
  document.getElementById('root')
);
```

如上，在 JSX 里调用了函数 `{formatName(user)}`



## 带有属性值的 JSX

```javascript
const element = <img src={user.avatarUrl}></img>;
```

```javascript
const element = <div tabIndex="0"></div>;
```

属性值中也可以使用字面量或者是大括号 JavaScript 表达式，这里不需要再加引号

>**警告：**
>
>因为 JSX 语法上更接近 JavaScript 而不是 HTML，所以 React DOM 使用 `camelCase`（小驼峰命名）来定义属性的名称，而不使用 HTML 属性名称的命名约定。
>
>例如，JSX 里的 `class` 变成了 [`className`](https://developer.mozilla.org/en-US/docs/Web/API/Element/className)，而 `tabindex` 则变为 [`tabIndex`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/tabIndex)。



## 使用 JSX 指定子元素

```javascript
const element = (
  <div>
    <h1>Hello!</h1>
    <h2>Good to see you here.</h2>
  </div>
);
```

说白了，就是带上一个小括号在外面就可以了

另外，可以使用单个闭合

```javascript
const element = <img src={user.avatarUrl} />;
```

有点类似于XML



## JSX 防止注入

```javascript
const title = response.potentiallyMaliciousInput;
// 直接使用是安全的：
const element = <h1>{title}</h1>;
```

JSX 里的内容会被转换成普通字符串，不会发生XSS攻击



## JSX 的底层对象

当我们定义

```javascript
const element = (
  <h1 className="greeting">
    Hello, world!
  </h1>
);
```

实际上就是调用了

```javascript
const element = React.createElement(
  'h1',
  {className: 'greeting'},
  'Hello, world!'
);
```

生成了一个 JSX 元素对象如下（`React.createElement` 会有一些额外的检查步骤）

```javascript
// 注意：这是简化过的结构
const element = {
  type: 'h1',
  props: {
    className: 'greeting',
    children: 'Hello, world!'
  }
};
```


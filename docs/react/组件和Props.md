---
id: 组件和Props
title: 本文内容
sidebar_label: 组件和Props
---



## 组件和元素

React 元素，就是我们定义的 JSX 对象，例如

```javascript
const element = <h1> hello </hello>;
```

这个 element 就是一个 React 元素

而组件，则是类似于一个接收参数，然后返回 React 元素的**函数**，例如

```javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

这个 Welcome 就是一个组件，它接收 props 参数，返回一个 React 元素

**一个组件类似于一个 DOM 标签**



## 函数组件

```javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
```

如上所述，这就是一个函数组件



## class 组件

```javascript
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

这与上面的函数组件是等效的



## 自定义组件

我们之前使用 React 元素时，都是使用的规范定义的 DOM 元素，例如

```javascript
const element = <div />;
```

我们有了组件之后，就可以使用我们自己定义的组件，来定义一个HTML标签生成 React 元素了

```javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

const element = <Welcome name="Sara" />;
ReactDOM.render(
  element,
  document.getElementById('root')
);
```

将会在页面上打印 Hello, Sara

要点：

- 当 React 元素为自定义组件时，它会将 JSX 所接收的属性（attributes）转换为单个对象传递给组件，这个对象被称之为 “props”
- 所以 name 属性将成为 Welcome 函数的参数 props.name

让我们来回顾一下这个例子中发生了什么：

- 我们调用 `ReactDOM.render()` 函数，并传入 `<Welcome name="Sara" />` 作为参数
- React 调用 `Welcome` 组件，并将 `{name: 'Sara'}` 作为 props 传入
- `Welcome` 组件将 `<h1>Hello, Sara</h1>` 元素作为返回值
- React DOM 将 DOM 高效地更新为 `<h1>Hello, Sara</h1>`

>**注意：** 组件名称必须以大写字母开头。
>
>React 会将以小写字母开头的组件视为原生 DOM 标签。例如，`<div />` 代表 HTML 的 div 标签，而 `<WelCome />` 则代表一个组件，并且需在作用域内使用 `Welcome`



## 组合组件

组件里可以引用其他组件

```javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

function App() {
  return (
    <div>
      <Welcome name="Sara" />
      <Welcome name="Cahal" />
      <Welcome name="Edite" />
    </div>
  );
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
);
```

显然，这种用法，基本就是我们 HTML 的普通标签的用法，我们利用这些特性可以开发一些高度完成化的组件进行复用了



## Props 的只读性

**组件无论是使用函数声明还是通过 class 声明，都绝对不能修改自身的 props，所有 React 组件都必须像纯函数一样保护它们的 props 不被更改。**
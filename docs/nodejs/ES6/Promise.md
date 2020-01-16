---
id: Promise
title: 本文内容
sidebar_label: Promise
---

本文主要记录 JavaScript 中的 Promise 与异步编程的相关内容，其中关系到 node.js 事件循环模型的内容，可以参考我之前写过的文章  [事件循环机制](../node基础/事件循环机制.md) 



## 回调地狱

回调地狱其实很容易理解，当我们使用回调函数时，我们有可能需要在任务1完成时开始任务2，任务2完成后执行任务3...这些任务的逻辑必须是有序的，那么我们的回调里面就会继续嵌套回调，一直套十几层也是常有的事，这就是回调地狱，Promise 就是来解决回调模式的局限性的



## Promise

一个 Promise 就是一个异步操作的结果的占位符，它总共有 3 种状态

- pending：表示这个异步操作还在进行中，还未完成
- fulfilled：表示这个异步操作已经完成并且获取了结果
- rejected：表示这个异步操作失败了，出现了错误

当我们使用 Promise 时，一个 Promise 从最开始的 pending，一直执行到 fulfilled 或者是 rejected。一旦执行到了 fulfilled 或者是 rejected，这个 Promise 的状态就不可改变了（因为内部的异步操作已经执行结束了，不论是执行完毕获取了结果，还是执行到一半出错，都算作执行结束）。

我们可以在一个 Promise 上定义后续的操作，后续的操作可以获取前面的异步操作的结果，这就是 Promise 真正的用处，可以用来定义一段连续的异步操作逻辑（使用回调模式的话，连续的异步操作必须写在一层一层的回调里）。

下面我们来看看例子



## fulfilled 状态

下面是一个最简单的例子

```javas
let p1 = new Promise(function (resolve, reject) {
    //异步操作
    setTimeout(() => resolve(3), 2000);
});

p1.then(function (id) {
    console.log(`获取id时间：${process.uptime()}，id：${id}`);
});
console.log(`第一次输出时间：${process.uptime()}`);
```

输出是

```bash
(py3.5) czp@:~/workspace/knowledge-base/demos/node_start$ node hello.js
第一次输出时间：0.055265643
获取id时间：2.061154694，id：3
```

要点：

- 当我们定义 `new Promise(function (resolve, reject){})` 时，就会立刻执行里面的这个函数
- 当里面的函数执行了 `resolve(xxx)` 时，就表示通知这个 Promise，说我这个异步操作完成了，此时这个 Promise 的状态就会改变成 fulfilled，表示异步操作完成
- 很显然，按照代码逻辑，一直到 2 秒后，才会执行 `resolve(xxx)` ，也就是说，这个 Promise 要 2 秒后才会进入 fulfilled 状态
- 当我们执行 `p1.then(function (id) {})` 时，p1 的状态依然是 pending，所以我们这句代码的真正含义是：当 p1 变成 fulfilled 状态时，执行这个回调函数
- 接下来我们输出一个日志，打印了一下时间
- 2 秒后，p1 终于完成了，并且获取到的结果是 3（`resolve(3)`），此时 p1 进入 fulfilled 状态
- 由于我们定义了 p1 后续的处理逻辑，因此，立刻执行 `function (id) {}`，这里的 id 就是 p1 最终的异步结果 3

> 这种构造函数的方式中，我们回调里必须调用 resolve，如果不调用 resolve，则不会进入 fulfilled 状态
>
> 如果也不调用 reject，则也不会进入 rejected 状态（如果抛出了错误则也会进入 rejected 状态），那么这个 Promise 将一直是 pending
>
> 在 then 方法中，如果不调用这两个函数执行结束了回调的话，默认当做执行了 resolve(undefined)，所以会进入 fulfilled 状态

## rejected 状态

```javascript
let p1 = new Promise(function (resolve, reject) {
    //异步操作
    setTimeout(() => reject(new Error('自定义的error')), 2000);
});

p1.catch(function (err) {
    console.log(`执行出错时间：${process.uptime()}，错误信息：${err.message}`);
});
console.log(`第一次输出时间：${process.uptime()}`);
```

输出是

```bash
(py3.5) czp@:~/workspace/knowledge-base/demos/node_start$ node hello.js
第一次输出时间：0.104552064
执行出错时间：2.106530248，错误信息：自定义的error
```

要点：

- 当我们定义 `new Promise(function (resolve, reject){})` 时，就会立刻执行里面的这个函数
- 当里面的函数执行了 `reject(new Error('自定义的error'))` 时，就表示通知这个 Promise，说我这个异步操作出错了，此时这个 Promise 的状态就会改变成 rejected，表示异步操作出错了
- 很显然，2 秒后才会进入 rejected 状态
- 当我们执行 `p1.catch(function (err) {})` 时，Promise 的状态仍然是 pending，所以我们这句话的真正含义是：当 p1 变成 rejected 状态时，执行这个回调函数，里面的 err 参数，就是 p1 最终出错时候的那个错误
- 接下来我们输出一个日志，打印了一下时间
- 2 秒后，p1 终于出错了，错误对象是 `new Error('自定义的error')`， 此时 p1 进入 rejected 状态
- 由于我们定义了 p1 进入 rejected 的后续的处理逻辑，因此，立刻执行 `function (err) {}`，这里的 err 就是 p1 最终的错误对象

> 回调里调用 reject，或者是抛出了错误，就会进入 rejected 状态



## 多次处理同一个 Promise

对于一个 Promise，我们可以进行多个后续的异步操作。

这种场景其实很常见，例如：我们通过网络获取了一个学生的ID，然后我们需要根据这个ID获取学生的姓名，还需要根据这个ID获取他的年龄，这两个信息可能来自两个接口，也就是我们需要发送 2 个请求，这就是 2 个后续的异步操作了，它们都需要第一个异步操作的结果，也就是请求获取到的学生的ID

```javascript
let p1 = new Promise(function (resolve, reject) {
    //异步操作
    setTimeout(() => resolve(3), 2000);
});

p1.then(function (id) {
    console.log(`获取id时间：${process.uptime()}，id + 1 = ${id + 1}`);
});
p1.then(function (id) {
    console.log(`获取id时间：${process.uptime()}，id + 10 = ${id + 10}`);
});
console.log(`第一次输出时间：${process.uptime()}`);
```

输出是

```bash
(py3.5) czp@:~/workspace/knowledge-base/demos/node_start$ node hello.js
第一次输出时间：0.118611816
获取id时间：2.123034401，id + 1 = 4
获取id时间：2.123242512，id + 10 = 13
```

> 可以看出来，这两个后续处理逻辑，都获取了上一步的异步结果，并且它们的执行顺序，就是我们定义的顺序



## 同时处理结果和异常

一个异步操作，它的最终状态可能是顺利完成，也可能是出错了。

这个是很正常的，比如我们请求一个接口时，顺利完成的情况当然就是正常获取了接口返回的信息了，而出错的情况则很多了，比如服务器炸了、网络炸了等等。所以说，一个 Promise 最终要么会进入 fulfilled，要么进入 rejected 状态。我们一般需要同时处理这两个状态

```javascript
let p1 = new Promise(function (resolve, reject) {
    // 随机 0 到 2 秒，1秒内则正常返回，1秒后则表示出错
    var timeOut = Math.random() * 2;
    console.log('set timeout to: ' + timeOut + ' seconds.');
    setTimeout(function () {
        if (timeOut < 1) {
            console.log('call resolve()...');
            resolve('200 OK');
        } else {
            console.log('call reject()...');
            reject('timeout in ' + timeOut + ' seconds.');
        }
    }, timeOut * 1000);
});

p1.catch(function (reason) {
    console.log('失败：' + reason);
});
p1.then(function (result) {
    console.log('成功：' + result);
});
```

连续执行 2 次，输出如下

```bash
(py3.5) czp@:~/workspace/knowledge-base/demos/node_start$ node hello.js
set timeout to: 0.747976999086402 seconds.
call resolve()...
成功：200 OK

(py3.5) czp@:~/workspace/knowledge-base/demos/node_start$ node hello.js
set timeout to: 1.8850179221911745 seconds.
call reject()...
失败：timeout in 1.8850179221911745 seconds.
(node:17229) UnhandledPromiseRejectionWarning: timeout in 1.8850179221911745 seconds.
(node:17229) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 1)
(node:17229) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```

要点：

- 我们对同一个 Promise 既调用了 catch，也调用了 then
- 当 Promise 顺利完成时，会忽略掉 catch，执行 then 里面的后续
- 当 Promise 出错了进入 rejected 时，会忽略掉 then，执行 catch 里面的后续
- 第二次调用时，Promise 进入 rejected，输出里有一些警告信息，这是因为 `p1.then(function (result) {})` ，它又新生成了一个 Promise，并且这个 Promise 最终的状态是 rejected，并且没有被使用 catch 捕获该错误



所以我们最佳的方式是这样的

```javascript
let p1 = new Promise(function (resolve, reject) {
    // 随机 0 到 2 秒，1秒内则正常返回，1秒后则表示出错
    var timeOut = Math.random() * 2;
    console.log('set timeout to: ' + timeOut + ' seconds.');
    setTimeout(function () {
        if (timeOut < 1) {
            console.log('call resolve()...');
            resolve('200 OK');
        } else {
            console.log('call reject()...');
            reject('timeout in ' + timeOut + ' seconds.');
        }
    }, timeOut * 1000);
});


p1.then(function (result) {
    console.log('成功：' + result);
}).catch(function (reason) {
    console.log('失败：' + reason);
});
```

输出

```javascript
(py3.5) czp@:~/workspace/knowledge-base/demos/node_start$ node hello.js
set timeout to: 0.1580341394446627 seconds.
call resolve()...
成功：200 OK

(py3.5) czp@:~/workspace/knowledge-base/demos/node_start$ node hello.js
set timeout to: 1.2513693174457026 seconds.
call reject()...
失败：timeout in 1.2513693174457026 seconds.
```

要点：

- 这种链式调用的方式不会报错，因为我们最终捕获了该 rejected 的错误 (`p1.then.catch`)



实际上，then 也可以同时接受 2 个参数，同时处理结果和异常

```javas
let p1 = new Promise(function (resolve, reject) {
    // 随机 0 到 2 秒，1秒内则正常返回，1秒后则表示出错
    var timeOut = Math.random() * 2;
    console.log('set timeout to: ' + timeOut + ' seconds.');
    setTimeout(function () {
        if (timeOut < 1) {
            console.log('call resolve()...');
            resolve('200 OK');
        } else {
            console.log('call reject()...');
            reject('timeout in ' + timeOut + ' seconds.');
        }
    }, timeOut * 1000);
});


p1.then(function (result) {
    console.log('成功：' + result);
}, function (reason) {
    console.log('失败：' + reason);
});
```

跟上面的结果是一样的



## then 和 catch

- then 方法接收 2 个参数，每个参数都是一个函数，第一个参数表示的是对 Promise 的结果的处理逻辑，第二个参数表示的是对 Promise 的错误的处理逻辑，这两个参数都是可选的。

  ```javas
  let p1 = new Promise(function (resolve, reject) {
      // 随机 0 到 2 秒，1秒内则正常返回，1秒后则表示出错
      var timeOut = Math.random() * 2;
      console.log('set timeout to: ' + timeOut + ' seconds.');
      setTimeout(function () {
          if (timeOut < 1) {
              console.log('call resolve()...');
              resolve('200 OK');
          } else {
              console.log('call reject()...');
              reject('timeout in ' + timeOut + ' seconds.');
          }
      }, timeOut * 1000);
  });
  
  p1.then(function (result) {
      console.log('成功：' + result);
  }, function (reason) {
      console.log('失败：' + reason);
  });
  ```

- catch 方法接收 1 个参数，这个参数是一个函数，表示的是对 Promise 的错误的处理逻辑，它的含义等同于 then 方法的第二个参数，只不过是一种语义更清晰的方式，也就是上述代码等同于下面的

  ```javascript
  let p1 = new Promise(function (resolve, reject) {
      // 随机 0 到 2 秒，1秒内则正常返回，1秒后则表示出错
      var timeOut = Math.random() * 2;
      console.log('set timeout to: ' + timeOut + ' seconds.');
      setTimeout(function () {
          if (timeOut < 1) {
              console.log('call resolve()...');
              resolve('200 OK');
          } else {
              console.log('call reject()...');
              reject('timeout in ' + timeOut + ' seconds.');
          }
      }, timeOut * 1000);
  });
  
  
  p1.then(function (result) {
      console.log('成功：' + result);
  }).catch(function (reason) {
      console.log('失败：' + reason);
  });
  ```

- then 方法会返回一个新的 Promise 对象，例如 `promise2 = promise1.then(onFulfilled, onRejected)` 具有以下的规则

  - 如果 `onRejected` 不是函数（或者说没传这个参数）且 `promise1` 拒绝执行， `promise2` 会拒绝执行并返回相同的据因（这也就是我们之前的例子中，单独对一个最终会拒绝执行的 promise 进行单个参数的 then 调用时，最后会返回警告我们没有捕获错误的原因）

    ```javascript
    let error = new Error('同一个错误');
    let p1 = new Promise((resolve, reject) => reject(error));
    let p2 = p1.then('x');
    p2.catch(err => {
        console.log(err === error); // 将会输出 true，表示输出同一个错误
    });
    ```

  - 如果 `onFulfilled` 不是函数且 `promise1` 成功执行， `promise2` 会成功执行并返回相同的值，例如 `promise2 = promise1.then('hhh')`，这里的 `'hhh'` 不是函数，将会被替换成一个函数：`(value) => value`，也就是原样返回

    ```javascript
    let p1 = new Promise((resolve, reject) => resolve(3));
    let p2 = p1.then('hhh');
    p2.then(value => {
        console.log(value);  // 将会输出 3
    });
    ```

  - 如果 `onFulfilled, onRejected` 最终执行的那个回调，返回了一个值，那么 `promise2` 将会成为接受状态，并且将返回的值作为接受状态的回调函数的参数值。

    ```javascript
    let p1 = new Promise((resolve, reject) => resolve(3));
    let p2 = p1.then(value => value + 10);
    p2.then(value => {
        console.log(value);  // 将会输出 13
    });
    ```

  - 如果 `onFulfilled, onRejected` 最终执行的那个回调，没有返回值，那么 `promise2` 将会成为接受状态，并且 `promise2` 的结果就是 undefined

    ```javascript
    let p1 = new Promise((resolve, reject) => resolve(3));
    let p2 = p1.then(value => {
        // 没有返回值
    });
    p2.then(value => {
        console.log(value);  // 将会输出 undefined
    });
    ```

  - 如果 `onFulfilled, onRejected` 最终执行的那个回调，抛出一个错误，那么 `promise2` 将会成为拒绝状态，并且 `promise2` 的拒绝原因就是这个错误

    ```javas
    let error = new Error('同一个错误');
    let p1 = new Promise((resolve, reject) => resolve(3));
    let p2 = p1.then(value => {
        // 抛出错误
        throw error;
    });
    p2.catch(err => {
        console.log(err === error);  // 将会输出 true
    });
    ```

  - 如果 `onFulfilled, onRejected` 最终执行的那个回调，返回一个已经是接受状态的 Promise，那么 `promise2` 将会成为接受状态，并且 `promise2` 的结果值就是这个回调里返回 Promise 的结果

    ```javascript
    let error = new Error('同一个错误');
    let p1 = new Promise((resolve, reject) => resolve(3));
    let p2 = p1.then(value => {
        // 返回一个已经是接受状态的 Promise
        return new Promise(resolve => resolve(100));
    });
    p2.then(value => {
        console.log(value);  // 将会输出 100
    });
    ```

  - 如果 `onFulfilled, onRejected` 最终执行的那个回调，返回一个已经是拒绝状态的 Promise，那么 `promise2` 将会成为拒绝状态，并且 `promise2` 的错误原因就是这个回调里返回 Promise 的错误原因

    ```javas
    let error = new Error('同一个错误');
    let p1 = new Promise((resolve, reject) => resolve(3));
    let p2 = p1.then(value => {
        // 返回一个已经是拒绝状态的 Promise
        return new Promise((resolve, rejected) => rejected(error));
    });
    p2.catch(err => {
        console.log(err === error);  // 将会输出 true
    });
    ```

  - 如果 `onFulfilled, onRejected` 最终执行的那个回调，返回一个 pending 状态的 Promise，那么 `promise2` 将会成为 pending 状态，并且 `promise2` 的最终状态就是这个回调里返回 Promise 的最终状态

    ```javascript
    let error = new Error('同一个错误');
    let p1 = new Promise((resolve, reject) => resolve(3));
    let p2 = p1.then(value => {
        // 返回一个 pending 状态的 Promise
        return new Promise(resolve => {
            setTimeout(() => resolve(200), 300);
        });
    });
    p2.then(value => {
        console.log(value);  // 将会输出 200
    });
    ```

    ```javascript
    let error = new Error('同一个错误');
    let p1 = new Promise((resolve, reject) => resolve(3));
    let p2 = p1.then(value => {
        // 返回一个 pending 状态的 Promise
        return new Promise((resolve, rejected) => {
            setTimeout(() => rejected(error), 300);
        });
    });
    p2.catch(err => {
        console.log(err === error);  // 将会输出 true
    });
    ```

    > 说白了，如果 then 方法的回调函数里返回 Promise（或者是 Thenable 对象），那么 then 方法返回的 Promise 与之等价（但并不是同一个 Promise 对象）
    >
    > 这样一来，我们就可以进行一个链式的异步调用，Promise1 返回 Promise2，Promise2 返回 Promise3，这样就将几个异步操作串联起来，定义了一个异步的执行顺序（比如这个举例中，最后的顺序一定是 Promise1 --> Promise2 --> Promise3，这三个异步操作的顺序是明确的，但是具体的执行时间点是不确定的）

- catch 方法也会返回一个新的 Promise 对象，它的行为与 then 方法基本相同，唯一的区别是这个方法只处理 rejected 状态的 Promise
- 实际上 `obj.catch(onRejected)` 完全等价于 `obj.then(undefined, onRejected)`，catch 只是一种更加语义化的方法



## resolve 和 reject

创建 Promise 的语法是

`new Promise( function(resolve, reject) {...} /* executor */  );`

- resolve：回调函数中，resolve 被调用时，将这个 Promise 的状态改为 fulfilled

  ```javascript
  let p1 = new Promise((resolve, reject) => resolve(3)); // fulfilled
  ```

- reject：回调函数中，reject 被调用时，将这个 Promise 的状态改为 rejected

  ```javascript
  let p1 = new Promise((resolve, reject) => reject(new Error(''))); // rejected
  ```

- 参数：传递给 resolve 和 reject 函数的参数，将会分别作为 fuiflled 和 rejected 状态的处理函数的参数

  ```javascript
  let p1 = new Promise((resolve, reject) => resolve(3));
  p1.then(v => {
      console.log(v); // 3
  })
  ```

  ```javascript
  let p1 = new Promise((resolve, reject) => reject(3));
  p1.catch(v => {
      console.log(v); // 3
  })
  ```



## 创建 Promise

### 通用方式

`new Promise( function(resolve, reject) {...} /* executor */  );`

我们在回调里调用 resolve 还是 reject，决定 Promise 最终是 fulfilled 还是 reject 状态。

### Promise.resolve()

通过这种方式直接创建一个 fulfilled 的 Promise

```javascript
let p = Promise.resolve(44);
p.then(value => {
    console.log(value); // 44
});
```

可以看到，我们直接创建了一个完成状态的 Promise

### Promise.rejected()

通过这种方式直接创建一个 rejected 的 Promise

```javascript
let p = Promise.reject(new Error('自定义错误'));
p.catch(err => {
    console.log(err.message); // 自定义错误
});
```

### 非 Promise 的 Thenable 对象

拥有 then 方法，并且接收 resolve 和 reject 两个函数的对象就是 Thenable 对象（鸭子类型），例如

```javascript
let thenable = {
    then(resolve, reject) {
        resolve(42);
    }
};
let p1 = Promise.resolve(thenable);
p1.then(value => {
    console.log(value);
});
```

> 这里的逻辑就是返回了一个跟 thenable 等价的 Promise，类似于 then 方法的回调里返回 Promise 一样



## 串联 Promise

Promise 最大的价值就是定义了异步操作的执行顺序，这在以前只能通过回调里嵌套回调来定义，下面我写一个例子，模拟一些常见的逻辑：先请求一个 URL 去获取一个用户的ID，根据用户ID，去请求另一个 URL，获取用户的名称

```javascript
function getUserID() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(100);
        }, 200); // 模拟一个异步请求，0.2秒后获取到一个 user id
    });
}

function getUserNameByID(id) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`czp:${id}`);
        }, 200); // 模拟一个异步请求，0.2秒后获取到一个 user name
    });
}

let p1 = getUserID();
p1.then(getUserNameByID)
    .then(name => {
        console.log(name); // czp:100
    });
```

可以看到，Promise 被串联了起来，一个 Promise 返回另一个 Promise，然后等第一个执行完毕了才执行第二个

> 最好在最后加上一个 Promise 的 catch 方法进行错误处理

这种模式让我们定义了一个个异步操作的顺序，在以后会非常有用，比如我们想写完第一个文件后才写第二个文件，然后才写第三个文件，这种有严格顺序要求的时候，就需要用到这种模式



## 响应多个 Promise

### Promise.all(iterable)

返回一个 Promise，当迭代器里的所有 Promise 都完成时，这个 Promise 才完成。如果迭代器中有任意一个 Promise 最终是 rejected 状态，那么这个返回的 Promse 就是 rejected 状态，失败原因的是第一个失败 `promise` 的原因，值是所有的值组成的数组

```javascript
let p1 = Promise.resolve(3);
let p2 = Promise.resolve(33);
let p3 = Promise.resolve(333);
let p4 = Promise.all([p1, p2, p3]);
p4.then(v => {
    console.log(v); // [ 3, 33, 333 ]
});
```

```javascript
let p1 = Promise.resolve(3);
let p2 = Promise.resolve(33);
let p3 = Promise.reject(333);
let p4 = Promise.all([p1, p2, p3]);
p4.catch(v => {
    console.log(v); // 输出 333
});
```

### Promise.any(iterable) **实验性功能**

返回一个 Promise，当迭代器里的任意一个 Promise 完成时，这个 Promise 就完成，并且就是那个已完成的 Promise。如果迭代器中所有 Promise 最终都是 rejected 状态，那么这个返回的 Promse 就是 rejected 状态，失败原因就是所有错误组成的错误数组，本质上来说就是 `Promise.all` 的反义词

> 这个方法在浏览器中尚未完全支持，所以最好还是别用，用下面的 Promise.race 方法

### Promise.race(iterable)

返回一个 Promise，一旦迭代器中的某个 Promise 解决或拒绝，返回的 Promise就会解决或拒绝。（也就是返回一个与**最先完成或者拒绝的 Promise** 等价的 Promise）

也就是说，有点类似于 any，但是并不完全与 all 相反

```javascript
let p1 = Promise.resolve(3);
let p2 = Promise.resolve(33);
let p3 = Promise.reject(333);
let p4 = Promise.race([p1, p2, p3]);
p4.then(v => {
    console.log(v); // 输出 3
});
```

```javascript
let p1 = Promise.resolve(3);
let p2 = Promise.resolve(33);
let p3 = Promise.reject(333);
let p4 = Promise.race([p3, p1, p2]);
p4.catch(v => {
    console.log(v); // 输出 333
});
```

> 注意 2 段代码里传入的 p1,p2,p3 的顺序



## async 和 await

ES 7 标准，添加了 async 和 await 关键字，这两个关键字涵盖了异步编程的功能，它们与 Promise 相辅相成，简化了 Promise 的使用，但本质还是 Promise

```javascript
function resolveAfter2Seconds() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('resolved');
        }, 2000);
    });
}

async function asyncCall() {
    console.log('calling');
    var result = await resolveAfter2Seconds();
    console.log(result);
    // expected output: 'resolved'
}

asyncCall();
```

输出

```bash
(py3.5) czp@:~/workspace/knowledge-base/demos/node_start$ node hello.js
calling
resolved
```

要点：

- async 定义的函数叫做异步函数，执行这个函数后，将会返回一个 Promise

  ```javascript
  async function test() {
  
  }
  console.log(test() instanceof Promise); // true
  ```

- await 关键字只能在 async 定义的异步函数中使用，在其它地方使用将会报错

  ```javascript
  function resolveAfter2Seconds() {
      return new Promise(resolve => {
          setTimeout(() => {
              resolve('resolved');
          }, 2000);
      });
  }
  await resolveAfter2Seconds();
  // 以上将会报错
  ```

- await 后面如果接收的是一个 Promise 对象，则将会等待该 Promise 完成（接受或者拒绝），也就是说，`await promise` 将会获取到这个 promise 的结果

  ```javascript
  function resolveAfter2Seconds() {
      return new Promise(resolve => {
          setTimeout(() => {
              resolve('resolved');
          }, 2000);
      });
  }
  
  async function asyncCall() {
      var result = await resolveAfter2Seconds();
      console.log(result); // resolved
  }
  
  asyncCall();
  ```

- `var result = await resolveAfter2Seconds();` 这里就获取到了 promise 的结果 `resolve('resolved');`，也就是字符串 `resolved`

  > 参考上面的例子

- 实际上来说，`await promise` 定义了一个语义：外层的异步函数执行到这里将会停止，直到这个内层 promise 执行完成，这样就相当于确定了 2 个 promise 的执行顺序

- 异步函数内部抛出错误，这个异步函数返回的 Promise 将会进入 rejected 状态

  ```javascript
  async function test() {
      throw new Error('出错了');
  }
  
  test().catch(err => {
      console.log(err.message); // 出错了
  });
  ```

- 异步函数内部返回了一个值，这个值就是返回的 Promise 的最终的结果值

  ```javascript
  async function test() {
      return 333
  }
  
  test().then(v => {
      console.log(v); // 333
  });
  ```

> 可以看出来，这种 async 和 await 就是语法糖，本质还是 Promise

### 并行和串行

使用 async 和 await 很容易就可以达到串行的目的

```javascript
let resolveAfter2Seconds = function () {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`slow promise is done at : ${process.uptime()}`);
        }, 2000);
    });
};

let resolveAfter1Second = function () {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`fast promise is done at : ${process.uptime()}`);
        }, 1000);
    });
};

let sequentialStart = async function () {
    const slow = await resolveAfter2Seconds();
    console.log(slow); // 执行到这里时，已经经过了 2 秒

    const fast = await resolveAfter1Second();
    console.log(fast); // 执行到这里时，又经过了 1 秒，也就是此刻是 3 秒
};
sequentialStart();
```

输出

```bash
(py3.5) czp@:~/workspace/knowledge-base/demos/node_start$ node hello.js
slow promise is done at : 2.043946858
fast promise is done at : 3.057041464
```

> 这里，我们 sequentialStart 方法中，执行第一个 Promise 时，第二个 Promise 并没有被调用，所以都没有开始执行，所以当我们执行第二个 Promise 时，还需要再等待 1 秒

下面看看如何来定义并行的逻辑

```javascript
let resolveAfter2Seconds = function () {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`slow promise is done at : ${process.uptime()}`);
        }, 2000);
    });
};

let resolveAfter1Second = function () {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`fast promise is done at : ${process.uptime()}`);
        }, 1000);
    });
};

let concurrentStart = async function () {
    const slowPromise = resolveAfter2Seconds();
    const fastPromise = resolveAfter1Second();
    // 以上同时启动了 2 个 Promise
    const slow = await slowPromise;
    console.log(slow);
    // 执行到这里时，已经经过了 2 秒，此时 slowPromise 已经完成了
    // 同时，此时 fastPromise 也已经完成了，因为它 2 秒前就启动了，而完成它只需要 1 秒
    const fast = await fastPromise; // 这一行代码瞬间就返回了，因为 fastPromise 早就返回了
    console.log(fast);
};
concurrentStart();
```

输出

```bash
(py3.5) czp@:~/workspace/knowledge-base/demos/node_start$ node hello.js
slow promise is done at : 2.050631249
fast promise is done at : 1.047641309
```

换一种方式

```javas
let resolveAfter2Seconds = function () {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`slow promise is done at : ${process.uptime()}`);
        }, 2000);
    });
};

let resolveAfter1Second = function () {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(`fast promise is done at : ${process.uptime()}`);
        }, 1000);
    });
};

let concurrentStart = async function () {
    await Promise.all([
        (async () => console.log(await resolveAfter2Seconds()))(),
        (async () => console.log(await resolveAfter1Second()))()
    ])
};
concurrentStart();
```










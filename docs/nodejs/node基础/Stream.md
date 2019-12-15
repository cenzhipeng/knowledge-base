---
id: Stream
title: 本文内容
sidebar_label: Stream
---

本文主要记录关于 node 中的流的一些内容。有关更详细的内容，请参考博客里 `stream系列` 的内容



## 什么是流

可以把一个流当成是一个具有方向的管道。

想想我们的 UNIX 进程的标准，规定一个进程有 3 个流，分别是标准输入、标准输出、标准错误。对于一个进程来说，标准输入是可以读取的流，标准输出和标准错误都是可以写入的流。

我们来想一想我们不使用流的时候，最简单的读取和写入（伪代码）：

```javascript
// 读取文件
var content = read(xxxFile);
//输出内容
console.log(content);
```

这段代码当然很直观，读取文件，并且输出到控制台(标准输出)，但是有一些问题：

- **必须一次读完和写完所有的内容**：从 API 也能看出来，当我们读取时，必须把内容全部读完才能返回，当输出时也是一次性输出所有内容。那么当文件较大时，可能就会读取很久，表现就是进程暂时卡住一段时间，然后又是输出很久，表现也是进程卡住一段时间。
- **读取大文件时内存占用爆炸**：这个也很明显了，`content` 就是文件的整个内容，相当于整个文件都加载进了内存，万一是个大文件，几个 G 甚至更高的，内存直接就撑爆炸了



## 流和缓冲区

那么使用流的话，是怎么解决上面的问题呢，答案就是缓冲区（Buffer）。

使用流的时候，我们每次读取一小部分，读取了之后就进行处理（输出），处理完毕之后接着读后续的部分，这样就保证了我们不需要一次读完所有内容，并且内存占用仅仅是缓冲区的大小，不论是多大的文件都可以正常工作。例如：

```javascript
var fs = require('fs');
var rs = fs.createReadStream('test.md');
rs.on("data", function (chunk){
		console.log(chunk); 
}); 
// 注意：本段代码只能读取单字节编码，例如 ascii
// 如果包含中文这种多字节编码的，可能会输出乱码
```

可读流和可写流内部都有一个缓冲区 BufferList，可以分别使用的 `writable.writableBuffer` 或 `readable.readableBuffer` 来获取。这两个属性都是一个 `BufferList`，当我们在底层读取或者写入时，`highWaterMark` 的大小实际上表示底层的系统调用，一次读取或者写入多少数据，每次读取或者写入的数据就以一个 `buffer` 的形式挂在 `BufferList` 尾部，形成了一长串的 `Buffer`。

也就是说，`highWaterMark` 只是规定了一次底层读取的大小(或者说流内部的单个缓冲区 Buffer 的大小)，而不是规定这个流的缓冲区内存区域（BufferList）的大小，一个是单个 Buffer，一个是 BufferList，好好品一下。

实际上来说，我们好像没有单纯的控制流的内存大小的参数，之前我在这里纠结了很久，后来做了一系列实验才明白。



当调用 `stream.push(chunk)` 时，数据会被缓冲在可读流的内部 BufferList 中。 如果流的消费者没有调用 `stream.read()`，则数据会保留在内部队列中直到被消费。 `stream.push(chunk)` 在流的消费者不给力的时候（估计是通过 BufferList 长度、BufferList 内存总量、本次读取的字节数量等经过某种逻辑来确定的）会返回 `false` ，这个时候就是告诉我们：别再往流里发了，下面读不过来。

一旦我们在外部调用 `stream.read()`，首先就会消费缓冲区，缓冲区没有数据，就会调用底层调用去读取。具体的读取策略比较复杂，我通过实验有一定的想法，但是感觉帮助不大，就不说了



## readable.pipe(destination[, options])

`readable.pipe()` 方法绑定可写流到可读流，将可读流自动切换到流动模式，并将可读流的所有数据推送到绑定的可写流。 数据流会被自动管理，所以即使可读流更快，目标可写流也不会超负荷。

可以理解成 `bash` 中的管道，数据输出到一个管道，然后另一个进程从管道中读取数据，操作系统会控制速率，保证两边的生产和消费速率保持一致(也就是写满的时候阻塞，读不了的时候阻塞)

例子，将可读流的所有数据通过管道推送到 `file.txt` 文件：

```js
const readable = getReadableStreamSomehow();
const writable = fs.createWriteStream('file.txt');
// readable 的所有数据都推送到 'file.txt'。
readable.pipe(writable);
```

`readable.pipe()` 会返回目标流的引用，这样就可以对流进行链式地管道操作：

```javascript
const fs = require('fs');
const r = fs.createReadStream('file.txt');
const z = zlib.createGzip();
const w = fs.createWriteStream('file.txt.gz');
r.pipe(z).pipe(w);
// 在 Bash 中，等价于：
// $ r | z | w
```

实际上就是说，`z` 对于 `r` 是一个可写流，`z` 对于 `w` 是一个可读流，所以可以这样链式调用

默认情况下，当来源可读流触发 `'end'`事件时，目标可写流也会调用 `stream.end()`结束写入。 若要禁用这种默认行为， `end` 选项应设为 `false`，这样目标流就会保持打开：

```javascript
reader.pipe(writer, { end: false });
reader.on('end', () => {
  writer.end('结束');
});
```

这种行为的用途就是：一个输出可能需要聚集多个地方的输入。比如像 `wc` 程序，可能需要读取很多输入，并且输出到同一个输出流去，所以在一个流读取完毕的时候，不能就将输出的流都关闭了

如果可读流在处理期间发送错误，则可写流目标不会自动关闭。 如果发生错误，则需要手动关闭每个流以防止内存泄漏。

`process.stderr`和 `process.stdout` 可写流在 Node.js 进程退出之前永远不会关闭，无论指定的选项如何。

`pipe` 方法是使用流最简单的方式。通常的建议是要么使用 `pipe` 方法、要么使用事件来读取流，要避免混合使用两者。一般情况下使用 `pipe` 方法时你就不必再使用事件了。但如果你想以一种更加自定义的方式使用流，就要用到事件了。



## 流的类型

一共有 4 种流：

- `Readable`：可读流，例如 `fs.createReadStream()`，我们可以从流中读取数据
- `Writable`：可写流，例如 `fs.createWriteStream()`，我们可以往其中写入数据
- `Duplex`：可读又可以写的流，例如 `net.Socket`
- `Transform`：在读写过程中可以修改或转换数据的 `Duplex` 流，它转换正在写入的数据，并使转换后的数据可从该流中读出。我们称这些为转换流。转换流的一个示例可以是gzip流，它压缩写入其中的输入数据



## 流的两种读取模式

流动模式(Flowing)和暂停模式(Paused)：

- 在流动模式中，数据自动从底层系统读取，并通过 `EventEmitter` 接口的事件尽可能快地被提供给应用程序。
- 在暂停模式中，必须显式调用 `stream.read()` 读取数据块。

两种模式本质上的区别其实是在于 **推送** 和 **拉取**。

流动模式中，node 的后台线程自动去读取数据，然后当到达 `highwatermark` 时（也就是缓冲区满了的时候）或者是到达流的末尾的时候，就发送一个 `data` 事件。这样我们去消费该事件就读取到数据了，这就是流动模式。

可以看出，流动模式中，我们不需要控制数据的读取，只需要不停的消费 `data` 事件即可，换句话说，我们是无法实现数据读取的控制的。

暂停模式中，node 的后台线程自动去读取数据，然后当到达 `highwatermark` 时（也就是缓冲区满了的时候）或者到达流的末尾的时候，停止读取。也就是说，后台线程仅仅是自动读取到缓冲区，而不会将其发送出去。

我们使用 `stream.read()` 去读取数据时，首先去流的 `Buffer` 中读取，如果 `Buffer` 读完了，就调用底层的系统调用去读取数据。

这样，我们就可以控制流的读取方式，例如常见的 **TLV协议（type-length-value）**中，我们首先读取 1 个字节的数据，表示数据的类型，再读取 4 个字节的数据，表示数据的内容长度（length），最后再去读取 `length` 个字节，表示数据的内容。使用暂停模式就可以很容易做到这样的读取控制，而流动模式则无法做到。

或者是有时我们想读到某个数据就结束读取，例如查找流中的某串字符，中途找到了就不再去读取了，使用流动模式的话都会有些麻烦。



## 读取模式切换

所有可读流都开始于暂停模式，可以通过以下方式切换到流动模式：

- 添加 `'data'` 事件句柄，也就是调用了 `stream.on('data',processFn(chunk){})`
- 调用 `stream.resume()` 方法。
- 调用 `stream.pipe()` 方法将数据发送到可写流。

可读流可以通过以下方式切换回暂停模式：

- 如果没有管道目标，也就是没有使用过 `stream.pipe(target)`，则调用 `stream.pause()`
- 如果有管道目标，则移除所有管道目标。调用 `stream.unpipe()` 可以移除多个管道目标。

只有提供了消费或忽略数据的机制后，可读流才会产生数据。 如果消费的机制被禁用或移除，则可读流会停止产生数据。

为了向后兼容，移除 `'data'` 事件句柄不会自动地暂停流。 如果有管道目标，一旦目标变为 `drain` 状态并请求接收数据时，则调用 `stream.pause()` 也不能保证流会保持暂停模式。

如果可读流切换到流动模式，且没有可用的消费者来处理数据，则数据将会丢失。例如，当调用 `readable.resume()` 时，没有监听 `'data'` 事件或 `'data'` 事件句柄已移除。

添加 `'readable'`事件句柄会使流自动停止流动，并通过 `readable.read()` 消费数据。 如果 `'readable'` 事件句柄被移除，且存在 `'data'` 事件句柄，则流会再次开始流动。



流动模式：

```javas
const fs = require('fs')
const rs = fs.createReadStream('/dev/urandom')
var size = 0
rs.on('data', (data) => {
    size += data.length
    console.log('File size:', size)
})
```

暂停模式：

```javascript
const fs = require('fs')
const rs = fs.createReadStream(__filename);
var readerCall = function () {
    var stage = 0;
    return function () {
        var data = this.read(nextReadSize(stage));
        while (data !== null) {
            stage++;
            console.log('File size:', data.length);
            data = this.read(nextReadSize(stage));
        }
    }
}
rs.on('readable', readerCall());
function nextReadSize(stage) {
    return ((stage % 3) + 1) * 10;
}
// 10 20 30 的循环读取，使用闭包来保存读取状态
```

重点在于 3 处：

- 暂停模式触发 `readable` 事件后，我们必须要一直循环读取数据，一直读到 `null` 为止，所以这种处理模式中一定有一个类似于 `while(data !== null){... data = stream.read()}` 的循环结构，保证触发 `readable` 事件后将数据读取完毕
- 每次读取数据后，都要考虑下次数据如何进行读取
- 当到达流数据的尽头时， `'readable'` 事件也会触发，但是在 `'end'` 事件之前触发。
- `'readable'` 事件表明流有新的动态：要么有新的数据，要么到达流的尽头。 对于前者，`stream.read()` 会返回可用的数据。 对于后者，`stream.read()` 会返回 `null`。



## 流事件

除了从可读流中读取数据写入可写流以外，`pipe` 方法还自动帮你处理了一些其他情况。例如，错误处理，文件结尾，以及两个流读取/写入速度不一致的情况。

然而，流也可以通过事件来读取，这个就是 node 的异步所在了，在 Java 中，BIO 是阻塞读取，因此固定的模式是 `读取-处理-下一次读取`。而 node 中的模式是 `创建读取流-监听事件-接收到事件通知-处理事件`，我们只需要声明自己关注的事件，node 的后台线程自己去使用**非阻塞方法读取**，然后发现我们声明的事件后，就将其转交给我们的主线程去处理。

例如：

```javascript
// readable.pipe(writable)
readable.on('data', (chunk) => {
  writable.write(chunk);
});

readable.on('end', () => {
  writable.end();
});
```

以上监听了 `data` 事件，也就是读取到数据时，就将其写入到 `writable` ，然后是 `end` 事件，就关闭 `writable`

可以看出来，其实 Java 的 NIO 也是这种类似的模式。

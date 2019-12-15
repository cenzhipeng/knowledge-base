---
id: Buffer
title: 本文内容
sidebar_label: Buffer
---

本文主要是记录关于 node 中的 Buffer 的内容的

参考：[Buffer](http://nodejs.cn/api/buffer.html#buffer_buffer)

## Buffer 是什么

- Buffer 是一个全局对象，挂在 `global.Buffer` 下，这个是 js 方面的含义
- 一个 Buffer 是**一段内存**，或者可以当做是一个**字节数组**，使用的是 V8 的**堆外内存**，这个是后端语言方面的含义
- Buffer 的大小在创建时确定，无法更改
- Buffer 可以读和写
- Buffer 在读写的时候都有字符编码，一般默认值是 utf8



## 示例

有 3 种常见的创建 buffer 的方式：

- Buffer.from()：从已有数据创建 buffer
- Buffer.alloc()：创建一个使用某个固定值填充的 buffer
- Buffer.allocUnsafe()：创建一个 buffer，但是 buffer 可能含有旧数据（内存空间没有进行清零）
- ~~new Buffer()~~ 已废弃，此方法不安全，不建议使用

```javascript
// 创建一个长度为 10、且用零填充的 Buffer。
const buf1 = Buffer.alloc(10);

// 创建一个长度为 10、且用 0x1 填充的 Buffer。 
const buf2 = Buffer.alloc(10, 1);

// 创建一个长度为 10、且未初始化的 Buffer。
// 这个方法比调用 Buffer.alloc() 更快，
// 但返回的 Buffer 实例可能包含旧数据，
// 因此需要使用 fill() 或 write() 重写。
const buf3 = Buffer.allocUnsafe(10);

// 创建一个包含 [0x1, 0x2, 0x3] 的 Buffer。
const buf4 = Buffer.from([1, 2, 3]);

// 创建一个包含 UTF-8 字节 [0x74, 0xc3, 0xa9, 0x73, 0x74] 的 Buffer。
const buf5 = Buffer.from('tést');

// 创建一个包含 Latin-1 字节 [0x74, 0xe9, 0x73, 0x74] 的 Buffer。
const buf6 = Buffer.from('tést', 'latin1');
```

| api                                            | 说明                                                         |
| ---------------------------------------------- | ------------------------------------------------------------ |
| Buffer.from(array)                             | 传入数字数组，返回一个新的 `Buffer`，数组的每个数字最终都强制转换成 `0-255` 例如：`const buf4 = Buffer.from([1, 2, 257]); //<Buffer 01 02 01>`，最后的 `01 = 257 - 256` |
| Buffer.from(arrayBuffer[,byteOffset[,length]]) | 返回一个新的 `Buffer`，它与给定的 [`ArrayBuffer`](http://nodejs.cn/s/mUbfvF) 共享相同的已分配内存。简单来说就是传入一段字节，包装成 Buffer，两者是同一块内存，所以经过修改的话两处都发生变化 |
| Buffer.from(buffer)                            | 使用原来的 buffer，创建一个新的 buffer，两者是独立的，不共享内存。 |
| Buffer.from(string[,encoding])                 | 使用相应的编码，将其编码成字节来创建 buffer，默认 utf8       |
| Buffer.alloc(size[,fill[,encoding]])           | 创建一个 buffer。第一个参数表示字节的数量，第二个参数表示用什么内容填充，第二个参数如果是字符串时，第三个参数表示字符串的编码格式，用这种格式的编码来填充 buffer。如果没有传入 fill，默认用 0 填充 buffer。 |
| Buffer.allocUnsafe(size)                       | 创建 buffer，buffer 各处的值是随机的（原来的内存不会被清空） |
| Buffer.allocUnsafeSlow(size)                   | `Buffer.allocUnsafe()`返回的缓冲区实例的大小小于或等于`Buffer.poolSize`的一半(4kB)那么可以在内部共享内存池中进行分配。 而`Buffer.allocUnsafeSlow()`返回的实例不会使用内部共享内存池。也就是说分配小型 buffer 的时候是使用的预先分配了的 buffer 池，这样就减少了频繁回收和分配内存的系统调用次数 |



## --zero-fill-buffers 命令行选项

强制将 buffer 创建时使用 0 进行填充，可能会对性能造成重大影响，仅在需要确保 buffer 不包含敏感数据时才应该使用这个命令行选项



## Buffer 与字符编码

当字符串数据被存储入 `Buffer` 实例或从 `Buffer` 实例中被提取时，可以指定一个字符编码。

```javascript
const buf = Buffer.from('hello world', 'ascii');

console.log(buf.toString('hex'));
// 打印: 68656c6c6f20776f726c64
console.log(buf.toString('base64'));
// 打印: aGVsbG8gd29ybGQ=

console.log(Buffer.from('fhqwhgads', 'ascii'));
// 打印: <Buffer 66 68 71 77 68 67 61 64 73>
console.log(Buffer.from('fhqwhgads', 'utf16le'));
// 打印: <Buffer 66 00 68 00 71 00 77 00 68 00 67 00 61 00 64 00 73 00>
```

支持的字符编码：

- ascii
- utf8
- utf16le
- ucs2，它是 utf16le 的别名
- base64
- latin1
- binary，它是 latin1 的别名
- hex：将每个字节编码成两个十六进制的字符。



## Buffer 与 TypedArray

todo



## Buffer 与迭代器

`Buffer` 实例可以使用 `for..of` 语法进行迭代：

```js
const buf = Buffer.from([1, 2, 3]);

for (const b of buf) {
  console.log(b);
}
// 打印:
//   1
//   2
//   3
```

此外，`buf.values()`、`buf.keys()`、和 `buf.entries()` 方法也可用于创建迭代器。



## API

### Buffer.byteLength(string[, encoding])

返回字符串的实际字节长度。



### Buffer.compare(buf1, buf2)

相当于 `buf1.compare(buf2)` ，对两个 buffer 进行比较



### Buffer.concat(list[, totalLength])

- list：Buffer[] | Uint8Array[] 要合并的 `Buffer` 数组
- totalLength：integer 合并后的 `Buffer` 的总长度

如果 totalLength 小于所有 Buffer 的总长度，则会截断到 totalLength

```javascript
// 用含有三个 `Buffer` 实例的数组创建一个单一的 `Buffer`。

const buf1 = Buffer.alloc(10);
const buf2 = Buffer.alloc(14);
const buf3 = Buffer.alloc(18);
const totalLength = buf1.length + buf2.length + buf3.length;

console.log(totalLength);
// 打印: 42

const bufA = Buffer.concat([buf1, buf2, buf3], totalLength);

console.log(bufA);
// 打印: <Buffer 00 00 00 00 ...>
console.log(bufA.length);
// 打印: 42
```



### Buffer.isBuffer(obj)

判断对象是否是一个 buffer



### Buffer.isEncoding(encoding)

判断是否是支持的字符编码



### Buffer.poolSize

这是用于缓冲池的预分配的内部 `Buffer` 实例的大小（以字节为单位）。 该值可以修改。



### buf[index]

获取或者设置该索引上的值



### buf.buffer

返回 buffer 的底层对象 ArrayBuffer

```javascript
const arrayBuffer = new ArrayBuffer(16);
const buffer = Buffer.from(arrayBuffer);

console.log(buffer.buffer === arrayBuffer);
// 打印: true
```



### buf.byteOffset

返回 buffer 的底层对象 ArrayBuffer 的偏移量 (buffer 是 ArrayBuffer 的一个视图，有可能没有使用完整的 ArrayBuffer 对象，而是使用的某个区间范围)

```javascript
// 创建一个小于 `Buffer.poolSize` 的 buffer。
const nodeBuffer = new Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

// 当将 Node.js Buffer 赋值给一个 Int8 的 TypedArray 时，记得使用 byteOffset。
new Int8Array(nodeBuffer.buffer, nodeBuffer.byteOffset, nodeBuffer.length);
```



### buf.equals(otherBuffer)

如果两个 buffer 具有完全相同的字节才返回 true



## buf.fill(value[,offset[,end]] [,encoding])

填充 buffer：

- value 填充的值
- offset 从哪个偏移量开始填充
- end 结束偏移量，不包含在内
- encoding value的编码

```javascript
// 用 ASCII 字符 'h' 填充 `Buffer`。

const b = Buffer.allocUnsafe(50).fill('h');

console.log(b.toString());
// 打印: hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
```



### buf.includes(value[, byteOffset] [, encoding])

在 buffer 里是否包含 value



### buf.indexOf(value[, byteOffset] [, encoding])

返回首次出现 value 的索引，没包含就返回 -1



### buf.lastIndexOf(value[, byteOffset] [, encoding])

返回最后一次出现 value 的索引，没包含返回 -1



### buf.length

返回 buffer 分配的字节数量，不一定等于数据的字节数量

```javascript
// 创建一个 `Buffer`，并写入一个 ASCII 字符串。

const buf = Buffer.alloc(1234);

console.log(buf.length);
// 打印: 1234

buf.write('http://nodejs.cn/', 0, 'ascii');

console.log(buf.length);
// 打印: 1234
```

如果想改变一个 `Buffer` 的长度，应该将 `length` 视为只读的，且使用 `buf.slice()`创建一个新的 `Buffer`。

```javascript
let buf = Buffer.allocUnsafe(10);

buf.write('abcdefghj', 0, 'ascii');

console.log(buf.length);
// 打印: 10

buf = buf.slice(0, 5);

console.log(buf.length);
// 打印: 5
```



### buf.readBigInt64LE([offset]) buf.readBigInt64BE([offset])

- offset 开始读取之前要跳过的字节数。必须满足`0 <= offset <= buf.length - 8`。**默认值:** `0`。
- 之所以是 `0 <= offset <= buf.length - 8` ，因为至少得留 8 个字节去读

一个是小端读取整数，一个是大端读取整数，网络字节序是大端



### buf.readBigUInt64BE([offset]) buf.readBigUInt64LE([offset])

读取一个无符号的 64 位整数值。



### buf.readDoubleBE([offset]) buf.readDoubleLE([offset])

读取一个 64 位双精度值。



### buf.readFloatBE([offset]) buf.readFloatLE([offset])

读取一个 32 位浮点值。



### buf.readInt8([offset])

读取一个有符号的 8 位整数值。



### buf.readInt16BE([offset]) buf.readInt16LE([offset])

读取一个有符号的 16 位整数值。



### buf.readInt32BE([offset]) buf.readInt32LE([offset])

读取一个有符号的 32 位整数值。



### buf.readIntBE(offset, byteLength) buf.readIntLE(offset, byteLength)

- offset 开始读取之前要跳过的字节数。必须满足`0 <= offset <= buf.length - byteLength`。
- byteLength 要读取的字节数。必须满足`0 < byteLength <= 6`。

也就是说读取 1 到 6 位的整数



### buf.readUInt8([offset])

读取一个无符号的 8 位整数值。



### buf.readUInt16BE([offset]) buf.readUInt16LE([offset])

读取一个无符号的 16 位整数值。



### buf.readUInt32BE([offset]) buf.readUInt32LE([offset])

读取一个无符号的 32 位整数值。



### buf.readUIntBE([offset]) buf.readUIntLE([offset])

读取一个无符号的 32 位整数值。



### buf.readUIntBE(offset, byteLength) buf.readUIntLE(offset, byteLength)

- offset 开始读取之前要跳过的字节数。必须满足`0 <= offset <= buf.length - byteLength`。
- byteLength 要读取的字节数。必须满足`0 < byteLength <= 6`。

也就是说读取 1 到 6 位的无符号整数



### buf.subarray([start[, end]])

返回一个新的 `Buffer`，它引用与原始的 Buffer **相同的内存**，但是由 `start` 和 `end` 索引进行偏移和裁剪。（不包含 end，end 超过 length 按照 length 来计算）

```javascript
// 使用 ASCII 字母创建一个 `Buffer`，然后进行切片，再修改原始 `Buffer` 中的一个字节。

const buf1 = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 是 'a' 的十进制 ASCII 值。
  buf1[i] = i + 97;
}

const buf2 = buf1.subarray(0, 3);

console.log(buf2.toString('ascii', 0, buf2.length));
// 打印: abc

buf1[0] = 33;

console.log(buf2.toString('ascii', 0, buf2.length));
// 打印: !bc
```

指定负的索引会导致切片的生成是相对于 `buf` 的末尾而不是开头。

```javascript
const buf = Buffer.from('buffer');

console.log(buf.subarray(-6, -1).toString());
// 打印: buffe
// (相当于 buf.subarray(0, 5)。)

console.log(buf.subarray(-6, -2).toString());
// 打印: buff
// (相当于 buf.subarray(0, 4)。)

console.log(buf.subarray(-5, -2).toString());
// 打印: uff
// (相当于 buf.subarray(1, 4)。)
```



### buf.slice([start[, end]])

与 subArray 相同，也是切片，共享内存



### buf.swap16()

将 buf 两两转换

如果 buf.length 不是 2 的倍数，报错

```javascript
const buf1 = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]);

console.log(buf1);
// 打印: <Buffer 01 02 03 04 05 06 07 08>

buf1.swap16();

console.log(buf1);
// 打印: <Buffer 02 01 04 03 06 05 08 07>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap16();
// 抛出异常 ERR_INVALID_BUFFER_SIZE。
```



### buf.swap32()

buf 每 4 个字节进行转换

如果 buf.length 不是 4 的倍数，报错

```javas
const buf1 = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8]);

console.log(buf1);
// 打印: <Buffer 01 02 03 04 05 06 07 08>

buf1.swap32();

console.log(buf1);
// 打印: <Buffer 04 03 02 01 08 07 06 05>

const buf2 = Buffer.from([0x1, 0x2, 0x3]);

buf2.swap32();
// 抛出异常 ERR_INVALID_BUFFER_SIZE。
```



### buf.swap64()

同上类似



### buf.toJSON()

返回 `buf` 的 JSON 格式。 当字符串化 `Buffer` 实例时，`JSON.stringify()`会调用该函数。

```javascript
const buf = Buffer.from([0x1, 0x2, 0x3, 0x4, 0x5]);
const json = JSON.stringify(buf);

console.log(json);
// 打印: {"type":"Buffer","data":[1,2,3,4,5]}

const copy = JSON.parse(json, (key, value) => {
  return value && value.type === 'Buffer' ?
    Buffer.from(value.data) :
    value;
});

console.log(copy);
// 打印: <Buffer 01 02 03 04 05>
```



### buf.toString([encoding[, start[, end]]])

根据 `encoding` 指定的字符编码将 `buf` 解码成字符串。 传入 `start` 和 `end` 可以只解码 `buf` 的子集。默认使用 utf8

```javascript
const buf1 = Buffer.allocUnsafe(26);

for (let i = 0; i < 26; i++) {
  // 97 是 'a' 的十进制 ASCII 值。
  buf1[i] = i + 97;
}

console.log(buf1.toString('ascii'));
// 打印: abcdefghijklmnopqrstuvwxyz
console.log(buf1.toString('ascii', 0, 5));
// 打印: abcde

const buf2 = Buffer.from('tést');

console.log(buf2.toString('hex'));
// 打印: 74c3a97374
console.log(buf2.toString('utf8', 0, 3));
// 打印: té
console.log(buf2.toString(undefined, 0, 3));
// 打印: té
```



### buf.write(string[, offset[, length]] [, encoding])

- `string` 要写入 `buf` 的字符串
- `offset` 开始写入 `string` 之前要跳过的字节数。**默认值:** `0`
- `length` 要写入的字节数。**默认值:** `buf.length - offset`
- `encoding` `string` 的字符编码。**默认值:** `'utf8'`
- 返回已写入的字节数

根据 `encoding` 指定的字符编码将 `string` 写入到 `buf` 中的 `offset` 位置。 `length` 参数是要写入的字节数。 如果 `buf` 没有足够的空间保存整个字符串，则只会写入 `string` 的一部分。 只编码了一部分的字符不会被写入。

```javascript
const buf = Buffer.alloc(256);

const len = buf.write('\u00bd + \u00bc = \u00be', 0);

console.log(`${len} 个字节: ${buf.toString('utf8', 0, len)}`);
// 打印: 12 个字节: ½ + ¼ = ¾
```



### buf.writeBigInt64BE(value[, offset]) buf.writeBigInt64LE(value[, offset])

- `value` 要写入 `buf` 的数值
- `offset` 开始写入之前要跳过的字节数。必须满足`0 <= offset <= buf.length - 8`。**默认值:** `0`
- 返回 `offset` 加上已写入的字节数

用指定的字节序格式（`writeBigInt64BE()` 写入大端序， `writeBigInt64LE()` 写入小端序）将 `value` 写入到 `buf` 中指定的 `offset` 位置。

`value` 会被解析并写入为二进制补码的有符号整数。

```javascript
const buf = Buffer.allocUnsafe(8);

buf.writeBigInt64BE(0x0102030405060708n, 0);

console.log(buf);
// 打印: <Buffer 01 02 03 04 05 06 07 08>
```



### buf.writeBigUInt64BE(value[, offset]) buf.writeBigUInt64LE(value[, offset])

基本同上



### buf.writeDoubleBE(value[, offset]) buf.writeDoubleLE(value[, offset])

基本同上



### buf.writeFloatBE(value[, offset]) buf.writeFloatLE(value[, offset])

基本同上



### buf.writeInt8(value[, offset])

基本同上



### buf.writeInt16BE(value[, offset]) buf.writeInt16LE(value[, offset])

基本同上



### buf.writeInt32BE(value[, offset]) buf.writeInt32LE(value[, offset])

基本同上



### buf.writeIntBE(value, offset, byteLength) buf.writeIntLE(value, offset, byteLength)

基本同上



### buf.writeUInt8(value[, offset])

基本同上



### buf.writeUInt16BE(value[, offset]) buf.writeUInt16LE(value[, offset])

基本同上



### buf.writeUInt32BE(value[, offset]) buf.writeUInt32LE(value[, offset])

基本同上



### buf.writeUIntBE(value, offset, byteLength) buf.writeUIntLE(value, offset, byteLength)

- `value` 要写入 `buf` 的数值
- `offset` 开始写入之前要跳过的字节数。必须满足`0 <= offset <= buf.length - byteLength`
- `byteLength` 要写入的字节数。必须满足`0 < byteLength <= 6`。
- 返回 `offset` 加上已写入的字节数

也就是说写入 1 到 6 个字节的无符号整数



### buffer.transcode(source, fromEnc, toEnc)

将指定的 `Buffer` 或 `Uint8Array` 实例从一个字符编码重新编码到另一个字符。 返回新的 `Buffer` 实例。

如果指定的字节序列无法用目标字符编码表示，则转码过程会使用替代的字符。 例如：

```javascript
const buffer = require('buffer');

const newBuf = buffer.transcode(Buffer.from('€'), 'utf8', 'ascii');
console.log(newBuf.toString('ascii'));
// 打印: '?'
```

该属性是在 `require('buffer')` 返回的 `buffer` 模块上，而不是在 `Buffer` 全局变量或 `Buffer` 实例上。


---
id: IO相关
title: 本文内容
sidebar_label: IO相关
---

本文介绍一些跟 IO 相关的内容 todo



## TTY 检测

我们可以使用 isTTY 来检测标准输入标准输出是否连接到了一个 TTY 终端，这对于我们决定是否要输出彩色文字等具有一定帮助。

例如：

- 当我们使用常规的 `node xxx.js` 时，标准输入连接到了 TTY 终端，因此 `process.stdin.isTTY === true` 
- 当我们使用类似于 `echo "xxx | node xxx.js"` 时，标准输入是经过了重定向的，因此 `process.stdin.isTTY === false` 



## 操作文件

首先，创建一个 1MB 的随机文件

```bash
$ node -p "Buffer.allocUnsafe(1e6).toString()" > file.dat
```

创建一个文件，`null-byte-remover.js`，它的作用是清空文件里的 0 字节，内容如下：

```javascript
const fs = require('fs') 
const path = require('path')
const cwd = process.cwd()
const bytes = fs.readFileSync(path.join(cwd, 'file.dat'))
const clean = bytes.filter(n => n) 
fs.writeFileSync(path.join(cwd, 'clean.dat'), clean)
fs.appendFileSync( path.join(cwd, 'log.txt'), (new Date) + ' ' + (bytes.length - clean.length) + ' bytes removed\n' ) // 这个方法，不存在文件时会自动创建
```

最后

```bash
$ node null-byte-remover.js
```



## 异步文件操作

我们把源码改成这样：

```javascript
setInterval(() => process.stdout.write('.'), 10).unref()
const fs = require('fs')
const path = require('path')
const cwd = process.cwd()
fs.readFile(path.join(cwd, 'file.dat'), (err, bytes) => {
    if (err) { console.error(err); process.exit(1); }
    const clean = bytes.filter(n => n)
    fs.writeFile(path.join(cwd, 'clean.dat'), clean, (err) => {
        if (err) { console.error(err); process.exit(1); }
        fs.appendFile(
            path.join(cwd, 'log.txt'),
            (new Date) + ' ' + (bytes.length - clean.length) + ' bytes removed\n',
            () => { }
        )
    })
})
```

实际执行了大概 200ms，但是却只输出了 2-3 个点号，这是因为 `const clean = bytes.filter(n => n)` 也是个稍微耗时的同步操作。



## 使用 Stream 增量处理

首先我们安装第三方包 `strip-bytes-stream`

```javascript
npm install --save strip-bytes-stream
```

修改代码为：

```javascript
setInterval(() => process.stdout.write('.'), 10).unref()
const fs = require('fs')
const path = require('path')
const cwd = process.cwd()
const sbs = require('strip-bytes-stream')
fs.createReadStream(path.join(cwd, 'file.dat'))
    .pipe(sbs((n) => n))
    .on('end', function () { log(this.total) })
    .pipe(fs.createWriteStream(path.join(cwd, 'clean.dat')))

function log(total) {
    fs.appendFile(
        path.join(cwd, 'log.txt'),
        (new Date) + ' ' + total + ' bytes removed\n',
        () => { }
    )
}
```

这次应该输出的点号会多一点(我的多了3个点)

通常来说 `fs.createReadStream` 和 `fs.createWriteStream` 是最适合用来读写文件的方式



## 处理元数据

这里我们将编写一个命令行小工具，用来处理文件系统的元数据，例如权限、时间等

输出格式化：使用 `npm install --save tableaux` ，这个第三方包帮助我们格式化输出

创建文件：`meta.js` 

```javascript
const fs = require('fs')
const path = require('path')
const tableaux = require('tableaux')
// 创建表头
const write = tableaux(
    { name: 'Name', size: 20 },
    { name: 'Created', size: 30 },
    { name: 'DeviceId', size: 10 },
    { name: 'Mode', size: 8 },
    { name: 'Lnks', size: 4 },
    { name: 'Size', size: 6 }
)

function print(dir) {
    fs.readdirSync(dir)
        .map((file) => ({ file, dir }))
        .map(toMeta)
        .forEach(output)
    write.newline()
}

function toMeta({ file, dir }) {
    const stats = fs.statSync(path.join(dir, file))
    var { birthtime, ino, mode, nlink, size } = stats
    birthtime = birthtime.toUTCString()
    mode = mode.toString(8)
    size += 'B'
    return {
        file,
        dir,
        info: [birthtime, ino, mode, nlink, size],
        isDir: stats.isDirectory()
    }
}

function output({ file, dir, info, isDir }) {
    write(file, ...info)
    if (!isDir) { return }
    const p = path.join(dir, file)
    write.arrow()
    fs.readdirSync(p)
        .forEach((f) => {
            const stats = fs.statSync(path.join(p, f))
            const style = stats.isDirectory() ? 'bold' : 'dim'
            write[style](f)
        })
    write.newline()
}

print(process.argv[2] || '.')
```

接着创建一个目录结构，用来测试我们的工具：

```bash
$ mkdir -p my-folder/my-subdir/my-subsubdir 
$ cd my-folder 
$ touch my-file my-private-file 
$ chmod 000 my-private-file 
$ echo "my edit" > my-file 
$ ln -s my-file my-symlink 
$ touch my-subdir/another-file 
$ touch my-subdir/my-subsubdir/too-deep
```


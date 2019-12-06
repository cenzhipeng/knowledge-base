---
id: npm脚本的使用
title: 本文内容
sidebar_label: npm脚本的使用
---

本文主要记录 package.json 中 npm scripts 脚本的功能和使用方式

参考：

- [npm scripts 指南](http://www.ruanyifeng.com/blog/2016/10/npm_scripts.html)





## scripts

scripts 字段是一个由脚本命令组成的字典，这些命令运行在包的各个生命周期中。这里的键是命令名，值是要运行的命令。例如：

```javascript
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "hh":"./test.sh"
  }
```

```bash
#!/bin/bash
# test.sh
echo $2
```

当我们使用 `npm run hh xxx yyy` 的时候，实际就是执行了 `echo yyy` （这里 $2 就是 yyy）



`npm run` 后面没有任何命令的时候，会列举出能够执行的命令，例如：

```javascript
(py3.5) czp@:~/workspace/knowledge-base/demos/node_start$ npm run
Lifecycle scripts included in node_start:
  test
    echo "Error: no test specified" && exit 1

available via `npm run-script`:
  hh
    ./test.sh
```

实际上分 2 种，一种是生命周期命令，一种是附加命令。我们这里只说自定义的附加命令



`npm run hh arg1 arg2` 这种方式是我们常用的方式。它做了以下事情：

- 首先启动一个 shell 进程
- 在 shell 进程里将当前目录 `node_modules/.bin` 加入到进程的 PATH 变量
- 在 shell 中执行 `scripts` 中 `hh` 对应的命令，也就是 `./test.sh`
- 将参数传入，也就是说，这里实际上执行了 `./test.sh arg1 arg2`

注意：

- 如果退出码不是`0`，npm 就认为这个脚本执行失败。

- 由于 `node_modules/.bin` 加入到了 shell 的 PATH 变量，所以我们 `npm install` 安装在项目路径的 `node_modules` 下的包中的可执行文件，在 `scripts` 里是可以直接使用的

- 如果是并行执行（即同时的平行执行），可以使用`&`符号。例如：

  ```javascript
  npm run script1.js & npm run script2.js
  ```

- 如果是继发执行（即只有前一个任务成功，才执行下一个任务），可以使用`&&`符号。例如：

  ```javas
  npm run script1.js && npm run script2.js
  ```

### 传参

[getopt风格参数](https://goo.gl/KxMmtG)

向 npm 脚本传入参数，要使用`--`标明。

```javas
"lint": "jshint **.js"
```

向上面的`npm run lint`命令传入参数，必须写成下面这样。

```javascript
npm run lint --  --reporter checkstyle > checkstyle.xml
```

也可以在`package.json`里面再封装一个命令。

```javascript
"lint": "jshint **.js",
"lint:checkstyle": "npm run lint -- --reporter checkstyle > checkstyle.xml"
```



### 默认值

一般来说，npm 脚本由用户提供。但是，npm 对两个脚本提供了默认值。也就是说，这两个脚本不用定义，就可以直接使用。

```javascript
"start": "node server.js"，
"install": "node-gyp rebuild"
```

默认值的前提是目录下有这两个文件

### 钩子

npm 脚本有 `pre` 和 `post` 两个钩子。举例来说，`build `脚本命令的钩子就是 `prebuild` 和 `postbuild`。

```javascript
"prebuild": "echo I run before the build script",
"build": "cross-env NODE_ENV=production webpack",
"postbuild": "echo I run after the build script"
```

用户执行`npm run build`的时候，会自动按照下面的顺序执行。

```javascript
npm run prebuild && npm run build && npm run postbuild
```

因此，可以在这两个钩子里面，完成一些准备工作和清理工作。下面是一个例子。

```javas
"clean": "rimraf ./dist && mkdir dist",
"prebuild": "npm run clean",
"build": "cross-env NODE_ENV=production webpack"
```

自定义的脚本命令也可以加上`pre`和`post`钩子。比如，`myscript`这个脚本命令，也有`premyscript`和`postmyscript`钩子。不过，双重的`pre`和`post`无效，比如`prepretest`和`postposttest`是无效的。

npm 提供一个`npm_lifecycle_event`变量，返回当前正在运行的脚本名称，比如`pretest`、`test`、`posttest`等等。所以，可以利用这个变量，在同一个脚本文件里面，为不同的`npm scripts`命令编写代码。请看下面的例子。

```javascript
const TARGET = process.env.npm_lifecycle_event;

if (TARGET === 'test') {
  console.log(`Running the test task!`);
}

if (TARGET === 'pretest') {
  console.log(`Running the pretest task!`);
}

if (TARGET === 'posttest') {
  console.log(`Running the posttest task!`);
}
```

注意，`prepublish`这个钩子不仅会在`npm publish`命令之前运行，还会在`npm install`（不带任何参数）命令之前运行。这种行为很容易让用户感到困惑，所以 npm 4 引入了一个新的钩子`prepare`，行为等同于`prepublish`，而从 npm 5 开始，`prepublish`将只在`npm publish`命令之前运行。



### 简写形式

四个常用的 npm 脚本有简写形式。

```javascript
npm start是npm run start
npm stop是npm run stop的简写
npm test是npm run test的简写
npm restart是npm run stop && npm run restart && npm run start的简写
```

`npm start`、`npm stop`和`npm restart`都比较好理解，而`npm restart`是一个复合命令，实际上会执行三个脚本命令：`stop`、`restart`、`start`。具体的执行顺序如下。

```javascript
prerestart
prestop
stop
poststop
restart
prestart
start
poststart
postrestart
```



### 变量

npm 脚本有一个非常强大的功能，就是可以使用 npm 的内部变量。

首先，通过`npm_package_`前缀，npm 脚本可以拿到`package.json`里面的字段。比如，下面是一个`package.json`。

```javascript
{
  "name": "foo", 
  "version": "1.2.5",
  "scripts": {
    "view": "node view.js"
  }
}
```

那么，变量`npm_package_name`返回`foo`，变量`npm_package_version`返回`1.2.5`。

```javascript
// view.js
console.log(process.env.npm_package_name); // foo
console.log(process.env.npm_package_version); // 1.2.5
```

上面代码中，我们通过环境变量`process.env`对象，拿到`package.json`的字段值。如果是 Bash 脚本，可以用`$npm_package_name`和`$npm_package_version`取到这两个值。

`npm_package_`前缀也支持嵌套的`package.json`字段。

```javascript
  "repository": {
    "type": "git",
    "url": "xxx"
  },
  scripts: {
    "view": "echo $npm_package_repository_type"
  }
```

上面代码中，`repository`字段的`type`属性，可以通过`npm_package_repository_type`取到。

下面是另外一个例子。

```javascript
"scripts": {
  "install": "foo.js"
}
```

上面代码中，`npm_package_scripts_install`变量的值等于`foo.js`。

然后，npm 脚本还可以通过`npm_config_`前缀，拿到 npm 的配置变量，即`npm config get xxx`命令返回的值。比如，当前模块的发行标签，可以通过`npm_config_tag`取到。

```javascript
"view": "echo $npm_config_tag",
```

注意，`package.json`里面的`config`对象，可以被环境变量覆盖。

```javascript
{ 
  "name" : "foo",
  "config" : { "port" : "8080" },
  "scripts" : { "start" : "node server.js" }
}
```

上面代码中，`npm_package_config_port`变量返回的是`8080`。这个值可以用下面的方法覆盖。

```javas
npm config set foo:port 80
```

最后，`env`命令可以列出所有环境变量。

```javascript
  "scripts" : { "env" : "env" }
```



### 常用脚本示例

```javascript
// 删除目录
"clean": "rimraf dist/*",

// 本地搭建一个 HTTP 服务
"serve": "http-server -p 9090 dist/",

// 打开浏览器
"open:dev": "opener http://localhost:9090",

// 实时刷新
 "livereload": "live-reload --port 9091 dist/",

// 构建 HTML 文件
"build:html": "jade index.jade > dist/index.html",

// 只要 CSS 文件有变动，就重新执行构建
"watch:css": "watch 'npm run build:css' assets/styles/",

// 只要 HTML 文件有变动，就重新执行构建
"watch:html": "watch 'npm run build:html' assets/html",

// 部署到 Amazon S3
"deploy:prod": "s3-cli sync ./dist/ s3://example-com/prod-site/",

// 构建 favicon
"build:favicon": "node scripts/favicon.js",
```


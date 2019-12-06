---
id: package.json
title: 本文内容
sidebar_label: package.json
---

本文主要是记录 package.json 的一些字段和内容

参考：

- [package.json 详解](https://www.cnblogs.com/paris-test/p/9760308.html)
- [npm scripts 指南](http://www.ruanyifeng.com/blog/2016/10/npm_scripts.html)



## 理解

首先谈谈我对 `package.json` 的理解

- 这个文件其实是 npm 来使用的，node 本身其实并不需要这个文件（其实还是需要的，例如需要里面的 main 字段）。类似于 maven 需要的 `pom.xml`，实际上 java 本身是不需要这个文件的，都是包管理器需要用的
- 文件定义了一些配置，供给 npm 使用，npm 按照这个文件来管理依赖或者包等内容，并且提供相关的命令
- 一个 `package.json` 定义了一个 npm 包，如果是使用别的包管理器，比如 yarn，它可能会使用别的文件来管理，例如 `yarn.lock` ，只不过它们都会把依赖下载到 `node_modules`，这个目录才是 node 真正需要的内容，node 默认会去这个目录下找依赖，至于依赖是使用什么包管理器下载的，不重要。



## name 必填

`name` 是必须要有的字段，表示我们的 npm 包名。有以下规则：

- 长度小于等于 214 个字符
- 不能以 `.` 和 `_` 开头
- 不能包含大写字母
- 最终将被用作 URL 的一部分、命令行的参数和文件夹名。因此不能含有非 URL 安全的字符。
- 总之就是包名别搞事就完事儿了



## version 必填

表示包的版本号。

name 和 version 字段被假定组合成一个唯一的标识符。包内容的更改和包版本的更改是同步的。



## description

包的描述，可以帮助人们在 `npm search` 时找到这个包



## keywords

关键词，是一个字符串数组，可以帮助人们在 `npm search` 时找到这个包



## homepage

项目主页的 URL

这个是项目主页的地址，不是下载项目的地址，也就是说这是个用来展示的地址



## bugs

项目的 issue 跟踪页面或者报告 issue 的 email 地址，这对使用这个包遇到问题的用户会有帮助，例如：

```javascript
{ 
　　"url" : "https://github.com/owner/project/issues",
　　"email" : "project@hostname.com"
}
```

你可以择其一或者两个都写上。如果只想提供一个url，你可以对"bugs"字段指定一个字符串而不是object。

如果提供了一个url，它会被用于npm bugs命令。



## license

太复杂了，看上面的参考链接原文吧。。



## author 和 contributors

author 是一个人，contributors 是一些人的数组。person 是一个对象，拥有必须的 name 字段和可选的 url 和 email 字段，像这样：

```javascript
{
    "name": "Barney Rubble",
    "email": "b@rubble.com",
    "url": "http://barnyrubble.tumblr.com/"
}
```



## files

项目包含的文件名的数组，如果里面是文件夹，那么文件夹下的所有文件都会被项目包含(除非是其它规则，例如 .npmignore 文件中指定忽略的文件)

说白了就是，一个包中，开发的时候可能用到了一大堆文件，而在发布的时候不应该上传上去，例如目录下的 `.svn .git` 之类的。

总是包含的文件：

- package.json
- README (and its variants)
- CHANGELOG (and its variants)
- LICENSE / LICENCE

总是被忽略的文件：

- .git
- CVS
- .svn
- .hg
- .lock-wscript
- .wafpickle-N
- *.swp
- .DS_Store
- ._*
- npm-debug.log



## main

指定模块的入口文件，实际上来说，默认的值是 `index.js`，也就是说，当我们在使用 `require('foo')` 的时候，实际上就是在使用 `require('foo/index.js')`，我们可以使用 main 字段修改入口文件，例如修改为 `main: 'app.js'`，此时 `require('foo')` 就相当于是 `require('foo/app.js')`



## bin

我们有时候希望使用包的一些可执行文件，希望它被安装到 path 上，就可以使用这个字段。

这个字段是命令名称和文件的映射，例如 @vue/cli 的 bin 字段：

```javascript
  "bin": {
    "vue": "bin/vue.js"
  },
```

将 @vue/cli 包的 bin/vue.js 文件 映射为 vue 命令了。

当我们使用 `npm install -g @vue/cli` 的时候，npm 就会将 `bin/vue.js` 映射到 path，它在 `prefix/bin` 路径下新建一个软连接 `vue` 指向 `bin/vue.js` (`npm config ls` 查看 `prefix` 路径)，例如：

```javascript
(py3.5) czp@:/usr/local/bin$ ll vue
lrwxr-xr-x  1 czp  admin  39 12  6 09:46 vue@ -> ../lib/node_modules/@vue/cli/bin/vue.js
```

当我们使用 `npm install@vue/cli ` 时，会建立软连接在 `./node_modules/.bin/`

如果你只有一个可执行文件，那么它的名字应该和包名相同，此时只需要提供这个文件路径(字符串)，比如：

```javascript
{
    "name": "my-program",
    "version": "1.2.5",
    "bin": "./path/to/program"
}
```



## repository

指明你的代码被托管在何处，这对那些想要参与到这个项目中的人来说很有帮助。如果 git 仓库在 github 上，用 npm docs 命令将会找到你。例如：

```javascript
{
    "repository": {
        "type": "git",
        "url": "https://github.com/npm/npm.git"
    }
}
```

这个 url 应该可以被版本控制系统不经修改地处理。不应该是一个在浏览器中打开的 html 项目页面



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

命令参考：[npm脚本的使用](npm脚本的使用.md)



## config

config 字段是一个对象，可以用来配置参数，例如：

```javascript
{
    "name": "foo",
    "config": {
        "port": "8080"
    }
}
```

那么我们在 npm 脚本中就可以通过 `process.env.npm_package_config_port` 来访问这个参数变量，这样子我们就可以将脚本一些需要的配置写在这个字段里

我们可以覆盖这个值：`npm config set foo:port 80`，这样，在本次 shell 中就变成了 80



## dependencies 和 devdependencies

`dependencies`字段指定了项目运行所依赖的模块，`devDependencies`指定项目开发所需要的模块。

它们都指向一个对象。该对象的各个成员，分别由模块名和对应的版本要求组成，表示依赖的模块及其版本范围。

```javascript
{
  "devDependencies": {
    "browserify": "~13.0.0",
    "karma-browserify": "~5.0.1"
  }
}
```

版本号有以下几种方式：

- **指定版本**：比如`1.2.2`，遵循“大版本.次要版本.小版本”的格式规定，安装时只安装指定版本。

- **波浪号（tilde）+指定版本**：比如`~1.2.2`，表示安装1.2.x的最新版本（不低于1.2.2），但是不安装1.3.x，也就是说安装时不改变大版本号和次要版本号。

- **插入号（caret）+指定版本**：比如ˆ1.2.2，表示安装1.x.x的最新版本（不低于1.2.2），但是不安装2.x.x，也就是说安装时不改变大版本号。需要注意的是，如果大版本号为0，则插入号的行为与波浪号相同，这是因为此时处于开发阶段，即使是次要版本号变动，也可能带来程序的不兼容。

- **latest**：安装最新版本。

- **URL**：除了版本号，也可以填入压缩包的 URL，当执行 `npm install`，压缩包会被下载并且安装

- **Git URLs**：可以是以下形式之一

  ```http
  git://github.com/user/project.git#commit-ish
  git+ssh://user@hostname:project.git#commit-ish
  git+ssh://user@hostname/project.git#commit-ish
  git+http://user@hostname/project/blah.git#commit-ish
  git+https://user@hostname/project/blah.git#commit-ish
  ```

  commit-ish可以是任何tag、sha或者branch，并作为一个参数提供给git进行checkout，默认值是master。

- **GitHub URLs**：从1.1.65版本开始，你可以引用Github urls作为版本号，比如"foo": "user/foo-project"。也可以包含一个commit-ish后缀，举个例子：

  ```javascript
  {
      "name": "foo",
      "version": "0.0.0",
      "dependencies": {
          "express": "visionmedia/express",
          "mocha": "visionmedia/mocha#4727d357ea"
      }
  }
  ```
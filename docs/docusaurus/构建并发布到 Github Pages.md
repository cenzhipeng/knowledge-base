---
id: build
title: 本文内容
sidebar_label: 构建并发布到 Github Pages
todo
---

本篇介绍 docusaurus 构建静态页面，并且发布到 Github Pages的方法



## 构建静态 HTML

之前我们的使用方式都是本地提供web服务，实际上 docusaurus 可以将 markdown 编译成 HTML，这样我们就可以使用这些 HTML 静态页面托管在 Github Pages 上了。



### 操作

```bash
cd website
# npm run build 也可以
yarn run build
```

执行上述命令后，在 `website` 目录下会生成一个 `build` 文件夹, 它包含了所有我们构建出来的 HTML 文件。



## 推送到 Github Pages

Github Pages 分为用户级仓库和项目级仓库。用户级仓库只能使用`[用户名].github.io`作为仓库名称，并且只有master分支可以用作 Github Pages 内容。项目级仓库可以用任意名称作为仓库名称，并且使用 gh-pages 分支作为 Github Pages 内容。

也就是说，项目级仓库使用 master 分支写文档，gh-pages 分支发布静态 HTML，用户级使用 master 分支发布静态 HTML，其它分支（例如 source）写文档。本文只介绍项目级的发布方式。



### 修改 siteConfig.js

我们需要修改 siteConfig.js，修改如下属性：

- organizationName：将其修改为自己的 github 用户名
- projectName：将其修改为 github 中的这个仓库的名称
- url：站点的URL，例如我是用我自己的域名`cenzhipeng.com`，那么 url 就是`'https://cenzhipeng.com'`，如果没有自定义域名，那么这里应该是`https://[用户名].github.io/[仓库名]`，也就是 Github Pages 项目级别的默认发布路径
- baseUrl：这里就填`/`就行了，表示站点的前缀，`/`就是不需要前缀



### 构建并且推送到 gh-pages 分支

linux、mac环境：

```bash
GIT_USER=<GIT_USER> \
  CURRENT_BRANCH=master \
  USE_SSH=true \
  yarn run publish-gh-pages # or `npm run publish-gh-pages`
```

windows环境：

```powershell
cmd /C "set GIT_USER=<GIT_USER> && set CURRENT_BRANCH=master && set USE_SSH=true && yarn run publish-gh-pages"
```



> GIT_USER 就填我们 github 的账户名即可，或者其它可以有权限推送到这个仓库的账户也可以。
>
> USE_SSH 表示使用 SSH 而不是 HTTPS 的方式访问 github
>
> CURRENT_BRANCH 表示用哪个分支进行构建，不填的话就是我们执行命令的时候的当前分支
>
> 该命令的执行路径不是项目根目录，而是出于 website 目录下，也就是我们必须出于这个目录才能推送成功




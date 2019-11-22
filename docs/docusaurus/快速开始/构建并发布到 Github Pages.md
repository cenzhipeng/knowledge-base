---
id: build
title: 本文内容
sidebar_label: 构建并发布到 Github Pages
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



### 使用 Github Actions 自动发布

#### Github Actions 介绍

Github Actions 的功能类似于 travis，主要作用也是 CI/CD，我们可以在仓库的根目录下建立 `.github/workflows/*.yml` 文件来定义我们的 Actions，这些配置文件定义了项目的 CI 过程。



#### 预期目的

本地编写 markdown 文档，然后推送到 github，github 自动触发流程，对 markdown 进行编译然后推送到 gh-pages 分支作为 Github Pages 发布。



#### 思路

定义 Github Actions，监听 master 分支的 push 事件，在 master 分支 push 时，就进行 docusaurus 的构建和发布工作，推送到 gh-pages 分支。



#### 工作流配置

文件路径：`.github/workflows/publish.yml`

```yaml
name: publish

# 只在master分支有push的时候，进行构建和发布
on: 
  push:
    branches: master

env:
  GIT_USER: cenzhipeng
  CURRENT_BRANCH: master
  USE_SSH: false
  CUSTOM_DOMAIN: cenzhipeng.com

jobs:
  build-publish:

    runs-on: ubuntu-18.04

    steps:
      - uses: actions/checkout@v1
      - uses: actions/setup-node@v1
        with:
            node-version: '10.x'
      - name: config git
        run:  |
          git config --global user.email "cenzhipeng@aliyun.com"
          git config --global user.name "cenzhipeng"
      - name: install yarn
        run: npm install yarn
      - name: install dependencies
        run: yarn install
        working-directory: ./website
      - name: build and publish
        working-directory: ./website
        run: |
          echo "machine github.com login ${GIT_USER} password ${{ secrets.GT_TOKEN }}" > ~/.netrc
          yarn run publish-gh-pages
      - name: change language
        run: |
          git checkout gh-pages
          git stash
          git pull
          # echo $CUSTOM_DOMAIN > CNAME
          for var in $(find .  -iname "*.html" |grep -v /en/); \
          do \
          sed -i 's/html lang=""/html lang="zh-CN"/' $var; \
          sed -i 's/html lang="en"/html lang="zh-CN"/' $var; \
          done
          # git add ./CNAME
          find .  -iname "*.html" |grep -v /en/ | xargs git add
          git commit -m "Deploy website"
          git push
```



> ${{ secrets.GT_TOKEN }} 是 Github Actions的语法，引用了 GT_TOKEN，GT_TOKEN 是我在仓库 settings/secrets 中创建的，它的值是我创建的 github 的 token，这个 token 的创建路径在你个人的 Settings/Developer settings/Personal access tokens
>
> 
>
> 另外，Github Actions 其实本身提供了${{ secrets.GITHUB_TOKEN }}，这个 token 不需要配置，但是无法触发 Github Pages 的构建，所以还是使用我们自己创建的 token 最好。
>
> 
>
> 最后有一个步骤是修改 html 文件的语言种类，这个是 docusaurus 的国际化还没有做好，所以我自己写的一个脚本将所有生成的 html 文件的语言修改为了中文，不然每次 chrome 浏览页面的时候都会提示你是否要翻译。在即将发布的 docusaurus 2 中，会对国际化做更好的支持，到时候应该就不用这么 hack 的方式来支持中文页面了


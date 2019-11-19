---
id: build
title: 本文内容
sidebar_label: 目录结构和配置
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
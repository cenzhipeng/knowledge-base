---
id: mysql面试题
title: 本文内容
sidebar_label: mysql面试题
---



## 1.count(*) 的实现方式

- MyISAM 直接存储了记录的总数，所以是 O(1) 的时间
- InnoDB 需要去读取叶子节点进行统计
  - 由于 MVCC 所以不能简单的存储一个数字，因为是不确定的
  - 普通索引的叶子节点较小，对于统计数据来说是优先的选择

>- MyISAM 表虽然 `count(*)` 很快，但是不支持事务；
>- show table status 命令虽然返回很快，但是不准确；
>- InnoDB 表直接 `count(*)` 会遍历全表，虽然结果准确，但会导致性能问题。



## 2.redoLog 和 binLog

- 更新记录时，先写 redo log，然后更新内存。在适当的时候将 redo log 所书写的更改写到磁盘里
- redo log 是 InnoDB 引擎的日志，bin log 是 MySQL 服务自带的日志（也就是说 bin log 一定会有，redo log 不一定会有）
- redo log 是物理日志，记录的是在某个数据页上做了什么修改；binlog 是逻辑日志，记录的是这个语句的原始逻辑，比如“给 ID=2 这一行的 c 字段加 1 ”。
- 写入的时候
  - redo log prepare
  - bin log
  - redo log commit
- 如果在 bin log 写入之前崩溃了，事务就回滚了，如果写入 bin log 之后，redo log commit 之前崩溃了，再次启动时会自动 commit
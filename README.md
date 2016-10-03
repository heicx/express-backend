# express-backend

## 构建组成
- 服务端部分 `Express.js + node-orm2 + Jade + Redis + MySQL`。
- 前端部分 `require.js + semantic UI + JQuery`。

## 安装/更新
- 安装并配置 [`node.js`](https://nodejs.org/en)。
- 安装并配置 [`redis`](http://redis.io/)。
- 安装并创建项目所需数据库，这里推荐使用 [`Navicat Premium`](http://xclient.info/s/navicat-premium.html)，导入 [`contract.sql`](/contract.sql)。
- 最新版本的依赖关系可以通过 `npm` & `bower` 安装，具体依赖关系请查阅根目录相关 `json` 配置文件。

## 启动运行
- 启动 `redis` 服务。  
- 启动 `node` 服务。 

> `src/redis-server`  
> `sudo node|supervisor|forever [start] app.js`

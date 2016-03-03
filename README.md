# express-backend

## 组成
- 前端部分由 require.js + semantic ui + JQuery + JQuery Plugins 组成.
- 服务端部分由 Express.js + node-orm2 + Jade + Redis + MySQL + when.js + moment.js + crypto.js 组成.

## 缺点
- 为方便测试,目前没有对session做超时限制.
- 需要增加log的处理.
- 将部分业务从router中拆分出来
- 需要捕捉处理无法try catch到的node异常.[domain模块](https://github.com/nodejs/node-v0.x-archive/blob/v0.10.4/lib/domain.js#L44)
- 前端代码验证模块复用性3颗星.
- 命名方式不是特别统一,需要进一步规范化.
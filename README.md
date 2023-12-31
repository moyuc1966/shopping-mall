# 商城系统配置及启动手册
``` 本项目共分为三个部分，启动顺序为 api后端-->admin管理端-->小程序 ```
---
``` 如果想测试或使用支付相关的功能，后端必须公网可访问且访问地址配置https，且后端api配置中的pay_config配置中系统域名必须是配置https后的公网地址，受影响的功能包括用户下单支付，管理员发货，以及管理员退款```
## 后端api搭建及其启动
### 1. 配置数据库
修改文件`config.js`
```
let config = {
    host: 'localhost',  //数据库地址
    user: 'root', //数据库用户名
    password: 'admin',  //数据库密码
    database: 'mo_mall', //数据库名称
}
```
### 2. 微信支付配置
修改文件`pay_config.js`，需要提前准备认证的小程序账号以及开通小程序支付

```
let config = {
    appid: 'wx9c.....f7321', //小程序appid
    mchid: '商户号', //商户号
    publicKey: '/key/one.pem', //公钥，绝对路径
    privateKey: '/key/two.pem', //私钥，绝对路径
    system_url: 'http://127.0.0.1:3200', //系统域名
    key: '',//APIv3密钥
    secret: '7f6be687c7.....2084' //小程序后台管理的secret，可登录小程序后台查看
}
```
微信支付相关配置不配置将无法进行支付，也无法关闭超时订单，系统域名是指后端api地址，可以是ip可以是域名，不携带末尾/<br>
申请证书，放置在/key目录下，申请方法参考官方文档[《接入前准备》](https://pay.weixin.qq.com/wiki/doc/apiv3/open/pay/chapter2_8_1.shtml)
### 3. 启动项目
在api后端根目录执行`node index.js` <br> 然后输出`Service started successfully, running on http://localhost:3200`表示启动成功，然后访问`//api/public/product`接口看是否能正常输出

## 管理员后端配置及其启动
进入文件`/src/main.js`中，找到代码
```
Vue.prototype.$api = 'http://localhost:3200';
```
修改为后端地址，结尾不携带/<br>
然后回到admin管理后端根目录，执行`npm run serve`，等待编译完成后输入
```
App running at:
  - Local:   http://localhost:8080
  - Network: http://192.168.0.109:8080
```
任意地址进入管理后台，默认账号admin，密码123456

## 小程序端搭建及其运行
小程序使用uniapp开发编译得到微信小程序，需要在HBuilder中编辑代码，然后运行到微信小程序，具体运行方法参考官方文档<br>
进入到小程序根目录`main.js`文件
```
const $url = 'http://192.168.0.109:3200'
```
修改 `http://192.168.0.109:3200` 为后端地址，结尾不携带/，然后运行到小程序

```
Vue.prototype.$merchant_id = '1********9'
```
修改'1********9'为商户号，用来确认收货，小程序部分否后端地址建议填写局域网地址，本地地址在小程序调试时会不方便

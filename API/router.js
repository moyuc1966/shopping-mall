const express = require('express');
const app = express();

//首页开放接口
app.use('/api/public', require('./api/public.js'));

//用户登录接口
app.use('/api', require('./api/login.js'));

//管理员登录接口
app.use('/admin', require('./admin/login.js'));

//管理员管理接口
app.use('/admin', require('./admin/commodity.js'));

//管理员管理用户相关接口
app.use('/admin/user', require('./admin/user.js'));

//管理员管理系统相关接口
app.use('/admin/system', require('./admin/system.js'));

//管理员管理订单相关接口
app.use('/admin/order', require('./admin/order.js'));

//用户订单部分接口
app.use('/api/order', require('./api/order.js'));

// 用户账号部分接口
app.use('/api/user', require('./api/user.js'));


//用户创建订单支付订单接口
app.use('/api/purchase', require('./api/purchase.js'));

//用户准备购买商品相关
app.use('/api/commodity', require('./api/commodity.js'));

module.exports = app;
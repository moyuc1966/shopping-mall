const express = require('express');
const router = express.Router();
const db = require('../link/link.js');
const WxPay = require('wechatpay-node-v3');
const fs = require('fs');
const request = require('superagent');
const path = require('path');

const config = require('../pay_config.js');

const tw = (res, code, msg) => {
    res.send({
        'code': code,
        'msg': msg
    })
}

function isEmptyStr(s) {
    if (s == null || s === '') {
        return false
    }
    return true
}

function sqlerr(res, err) {
    console.log(err);
    tw(res, 500, '服务器错误');
}

//订单号生成
function generateOrderNumber() {
    const timestamp = Math.floor(Date.now() / 1000); // 获取当前时间戳（秒级）
    function generateRandomChars() {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let randomString = '';
        // 生成5位随机字符串，包含至少2个数字和2个字母
        for (let i = 0; i < 2; i++) {
            randomString += characters[Math.floor(Math.random() * 26)]; // 随机字母
            randomString += Math.floor(Math.random() * 10); // 随机数字
        }
        // 随机补充一位字母或数字。，
        const randomIndex = Math.floor(Math.random() * 2);
        randomString += characters[Math.floor(Math.random() * 36)]; // 随机字母或数字
        function shuffleString(str) {
            // 将字符串内部字符随机打乱
            return str.split('').sort(() => Math.random() - 0.5).join('');
        }
        return shuffleString(randomString);
    }
    const randomChars = generateRandomChars();
    return `D${timestamp}${randomChars}`;
}

//订单号效验
function isValidOrder(orderNumber, create_time) {
    // 从订单号中提取时间戳和create_time
    const timestampFromOrder = parseInt(orderNumber.substring(1, 11), 10);
    const createTimestamp = new Date(create_time).getTime() / 1000; // 将create_time转换为秒级时间戳
    // 计算时间戳的误差
    const timestampDifference = Math.abs(timestampFromOrder - createTimestamp);
    // 如果误差在1秒之内，则订单有效
    return timestampDifference <= 1;
}

//用户创建订单
router.post('/create', (req, res) => {
    //开始创建订单记录
    let order_no = generateOrderNumber();
    let user_id = req.auth.id
    let { p_name, total_price, actual_price, address, remark, product_id, product_specification_id, coupon_id, count, name, phone } = req.body

    //获取user_id和product_id以及product_specification_id和当前请求一致且status为0的订单，如果存在则返回错误
    let sql = 'select * from `order` where user_id = ? and product_id = ? and product_specification_id = ? and delete_status = 0  and status = 0';
    db.query(sql, [user_id, product_id, product_specification_id], (err, result) => {
        if (err) {
            sqlerr(res, err);
            return; // 结束函数执行
        } else if (result.length > 0) {
            tw(res, 400, '订单已存在');
            return; // 结束函数执行
        } else {
            //获取并且格式化用户ip
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
            ip = ip.match(/\d+.\d+.\d+.\d+/);
            ip = ip ? ip.join('.') : '获取失败';
            remark = isEmptyStr(remark) ? remark : '无';
            coupon_id = isEmptyStr(coupon_id) ? coupon_id : 0;
            count = isEmptyStr(count) ? count : 1;
            if (!isEmptyStr(p_name) || !isEmptyStr(total_price) || !isEmptyStr(actual_price) || !isEmptyStr(address) || !isEmptyStr(product_id) || !isEmptyStr(product_specification_id) || !isEmptyStr(name) || !isEmptyStr(phone)) {
                return tw(res, 400, '参数错误')
            }
            //order表中插入数据，并且修改product表中sales和actual_sales以及popularity + 1
            //然后减少product_specification表中的库存
            let insertSql = `insert into \`order\` 
    (order_no,user_id,total_price,actual_price,create_time,status,address,delete_status,ip,remark,product_id,product_specification_id,coupon_id,count,name,phone)
    values (?,?,?,?,now(),?,?,?,?,?,?,?,?,?,?,?)`;
            let sqlParams = [order_no, user_id, total_price, actual_price, 0, address, 0, ip, remark, product_id, product_specification_id, coupon_id, count, name, phone];
            db.query(insertSql, sqlParams, (err, result) => {
                if (err) return sqlerr(res, err);
                //减少product_specification表中的库存
                let sql = 'update `product_specification` set stock = stock - ? where id = ?';
                db.query(sql, [count, product_specification_id], (err, updateResult) => {
                    if (err) return sqlerr(res, err);
                    //修改product表中sales和actual_sales以及popularity + 1
                    let sql = 'update `product` set sales = sales + ?,actual_sales = actual_sales + ?,popularity = popularity + 1 where id = ?';

                    //使用优惠券
                    if (coupon_id != 0) {
                        let sql = 'update `coupon` set status = 2,use_time = now() where id = ?';
                        db.query(sql, [coupon_id], (err, updateCouponResult) => {
                            if (err) return sqlerr(res, err);
                            db.query(sql, [count, count, product_id], (err, updateProductResult) => {
                                if (err) return sqlerr(res, err);
                                try {
                                    wxPay(req, res);
                                } catch (error) {
                                    console.log(error);
                                    tw(res, 500, '发起支付错误');
                                }
                            })
                        })

                    } else {
                        db.query(sql, [count, count, product_id], (err, updateProductResult) => {
                            if (err) return sqlerr(res, err);
                            try {
                                wxPay(req, res);
                            } catch (error) {
                                console.log(error);
                                tw(res, 500, '发起支付错误');
                            }
                        })
                    }
                })
            })

            //微信支付部分
            function wxPay(req, res) {
                const pay = new WxPay({
                    appid: config.appid,
                    mchid: config.mchid,
                    publicKey: fs.readFileSync(path.join(__dirname, '../', config.publicKey)), // 公钥
                    privateKey: fs.readFileSync(path.join(__dirname, '../', config.privateKey)), // 秘钥
                });

                async function payInfo(req, res) {
                    const params = {
                        description: req.body.p_name, // 订单描述
                        out_trade_no: order_no, // 订单号，一般每次发起支付都要不一样，可使用随机数生成
                        notify_url: config.system_url + '/api/purchase/notify', // 支付结果通知地址，如果不设置则会使用配置文件中的地址
                        amount: {
                            total: req.body.actual_price * 100, // 支付金额，单位为分
                        },
                        payer: {
                            openid: req.auth.openid, // 微信小程序用户的openid，一般需要前端发送过来
                        },
                        scene_info: {
                            payer_client_ip: ip, // 支付者ip，这个不用理会也没有问题
                        },
                    };
                    const result = await pay.transactions_jsapi(params);
                    // console.log(result);
                    res.send({
                        code: 200,
                        msg: '订单已创建',
                        data: result
                    })
                }
                payInfo(req, res);
            }
        }
    })
})

//支付订单，回调地址
// /api/purchase/notify
router.post('/notify', async (req, res) => {
    if (res.body == null) return tw(res, 300, '服务运行正常')


    const pay = new WxPay({
        appid: config.appid,
        mchid: config.mchid,
        publicKey: fs.readFileSync(path.join(__dirname, '../', config.publicKey)), // 公钥
        privateKey: fs.readFileSync(path.join(__dirname, '../', config.privateKey)), // 秘钥
    });

    let { ciphertext, associated_data, nonce } = req.body.resource;
    const result = await pay.decipher_gcm(ciphertext, associated_data, nonce, config.key);
    let { out_trade_no } = result;
    if (result.trade_state == 'SUCCESS') {
        //修改order表中对应订单的status为1，pay_time为当前时间，transaction_id为微信支付订单号
        let sql = 'update `order` set status = 1,pay_time = now(),transaction_id = ? where order_no = ?';
        db.query(sql, [result.transaction_id, out_trade_no], (err, updateResult) => {
            if (err) {
                console.log(err);
                return tw(res, 500, '服务器错误')
            }
            res.send({
                code: 200,
                msg: '支付成功'
            })
        })
    } else {
        let sql = 'select create_time from `order` where order_no = ?';
        db.query(sql, [out_trade_no], (err, result) => {
            if (err) {
                console.log(err);
                return tw(res, 500, '服务器错误')
            }
            //如果订单创建时间超过30分钟，则逻辑删除订单
            if (new Date().getTime() - new Date(result[0].create_time).getTime() > 30 * 60 * 1000) {

                //关闭微信订单
                pay.close(out_trade_no);

                let sql = 'update `order` set delete_status = 1 where order_no = ?';
                db.query(sql, [out_trade_no], (err, updateResult) => {
                    if (err) {
                        console.log(err);
                        return tw(res, 500, '服务器错误')
                    }
                    res.send({
                        code: 200,
                        msg: '订单已取消'
                    })
                })
            }
        })
    }
})

module.exports = router;
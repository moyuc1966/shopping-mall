const express = require('express');
const router = express.Router();
const db = require('../link/link.js');

const WxPay = require('wechatpay-node-v3');
const fs = require('fs');
const request = require('superagent');
const path = require('path');

const config = require('../pay_config.js');

const sendModel = require('./fun_sendoutgoods.js')

const sendMessage = require('./fun_sendMessage.js')

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
    tw(res, 500, '系统错误');
}




// 获取订单列表
router.get('/getOrderList', (req, res) => {
    let { page, limit } = req.query;
    page = page ? page : 1;
    limit = limit ? limit : 10;
    //分页按create_time排序，最新的在前面输出，并且输出product表中和product_specification表中对应的数据
    let sql = `
        SELECT
            \`order\`.*,
            product.name AS product_name,
            product.icon AS product_icon,
            product.brief AS product_brief,
            product.category AS product_category,
            product.postage AS product_postage,
            specification.name AS product_specification_name,
            specification.value AS product_specification_value,
            specification.stock AS product_specification_stock,
            user.uuid AS user_uuid,
            user.username AS user_username,
            user.phone AS user_phone
        FROM
            \`order\`
        LEFT JOIN
            product ON \`order\`.product_id = product.id
        LEFT JOIN
            product_specification AS specification ON \`order\`.product_specification_id = specification.id
        LEFT JOIN
            user ON \`order\`.user_id = user.id
        ORDER BY
            \`order\`.create_time DESC
        LIMIT
            ${(page - 1) * limit},${limit}`;
    let sql2 = `SELECT COUNT(*) FROM \`order\``;

    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
        } else {
            db.query(sql2, (err, result2) => {
                if (err) {
                    sqlerr(res, err);
                } else {
                    res.send({
                        code: 200,
                        msg: '获取订单列表成功',
                        'data': result,
                        'total': result2[0]['COUNT(*)']
                    })
                }
            })
        }
    })
})

// 获取订单详情
router.get('/getOrderDetail', (req, res) => {
    let { id, order_no } = req.query;
    if (!isEmptyStr(id) && !isEmptyStr(order_no)) {
        tw(res, 400, '请选择订单');
        return;
    }
    let where = ''
    if (isEmptyStr(id)) {
        where = `where \`order\`.id = '${id}'`
    } else {
        where = `where \`order\`.order_no = '${order_no}'`
    }
    let sql = `
        SELECT
            \`order\`.*,
            product.name AS product_name,
            product.icon AS product_icon,
            product.brief AS product_brief,
            product.category AS product_category,
            product.postage AS product_postage,
            specification.name AS product_specification_name,
            specification.value AS product_specification_value,
            specification.stock AS product_specification_stock,
            user.uuid AS user_uuid,
            user.username AS user_username,
            user.phone AS user_phone
        FROM
            \`order\`
        LEFT JOIN
            product ON \`order\`.product_id = product.id
        LEFT JOIN
            product_specification AS specification ON \`order\`.product_specification_id = specification.id
        LEFT JOIN
            user ON \`order\`.user_id = user.id
        ${where}`;

    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
        } else {
            res.send({
                code: 200,
                msg: '获取订单详情成功',
                'data': result[0]
            })
        }
    })
})

// 搜索订单列表
router.get('/searchOrderList', (req, res) => {
    let page = req.query.page ? req.query.page : 1;
    let limit = req.query.limit ? req.query.limit : 10;
    let { user_id, pay_time, order_no, create_time, delete_status, ip, product_id, product_specification_id, coupon_id, name, coupon } = req.query;
    //pay_time和create_time是格式化的时间，精确到天，如果有次参数查询，查找数据库中pay_time和create_time字段时间在这一天的数据
    //如果有多个参数，使用and连接
    // coupon是优惠券，如果有此参数，需要先去coupon表中查找优惠券的id，然后再去order表中查找优惠券id为此id的数据
    let where = 'where ';
    let whereArr = [];
    if (isEmptyStr(user_id)) {
        whereArr.push(`\`order\`.user_id = '${user_id}'`)
    }
    if (isEmptyStr(pay_time)) {
        // 查询pay_time字段在传入的pay_time这一天的数据
        whereArr.push(`DATE(\`order\`.pay_time) = '${pay_time}'`)
    }
    if (isEmptyStr(create_time)) {
        whereArr.push(`DATE(\`order\`.create_time) = '${create_time}'`)
    }
    if (isEmptyStr(delete_status)) {
        whereArr.push(`\`order\`.delete_status = '${delete_status}'`)
    }
    if (isEmptyStr(ip)) {
        whereArr.push(`\`order\`.ip = '${ip}'`)
    }
    if (isEmptyStr(order_no)) {
        whereArr.push(`\`order\`.order_no = '${order_no}'`)
    }
    if (isEmptyStr(product_id)) {
        whereArr.push(`\`order\`.product_id = '${product_id}'`)
    }
    if (isEmptyStr(product_specification_id)) {
        whereArr.push(`\`order\`.product_specification_id = '${product_specification_id}'`)
    }
    if (isEmptyStr(coupon_id)) {
        whereArr.push(`\`order\`.coupon_id = '${coupon_id}'`)
    }
    if (isEmptyStr(name)) {
        whereArr.push(`\`order\`.name like '%${name}%'`)
    }
    if (isEmptyStr(coupon)) {
        let sql = `select id from coupon where name like '%${coupon}%'`;
        db.query(sql, (err, result) => {
            if (err) {
                sqlerr(res, err);
            } else {
                let id = result[0]?.id;
                if (result.length === 0) id = 0
                whereArr.push(`\`order\`.coupon_id = '${id}'`)


                let whereClause = whereArr.length > 0 ? where + whereArr.join(' AND ') : '';
                let sql = `
        SELECT
            \`order\`.*,
            product.name AS product_name,
            product.icon AS product_icon,
            product.brief AS product_brief,
            product.category AS product_category,
            product.postage AS product_postage,
            specification.name AS product_specification_name,
            specification.value AS product_specification_value,
            specification.stock AS product_specification_stock,
            user.uuid AS user_uuid,
            user.username AS user_username,
            user.phone AS user_phone
        FROM
            \`order\`
        LEFT JOIN
            product ON \`order\`.product_id = product.id
        LEFT JOIN
            product_specification AS specification ON \`order\`.product_specification_id = specification.id
        LEFT JOIN
            user ON \`order\`.user_id = user.id
        ${whereClause}
        ORDER BY
            \`order\`.create_time DESC
        LIMIT
            ${(page - 1) * limit},${limit}`;
                let sql2 = `SELECT COUNT(*) FROM \`order\` ${whereClause}`;
                db.query(sql, (err, result) => {
                    if (err) {
                        sqlerr(res, err);
                    } else {
                        db.query(sql2, (err, result2) => {
                            if (err) {
                                sqlerr(res, err);
                            } else {
                                res.send({
                                    code: 200,
                                    msg: '搜索订单列表成功',
                                    'data': result,
                                    'total': result2[0]['COUNT(*)']
                                })
                            }
                        })
                    }
                })
            }
        })
    } else {

        let whereClause = whereArr.length > 0 ? where + whereArr.join(' AND ') : '';
        let sql = `
        SELECT
            \`order\`.*,
            product.name AS product_name,
            product.icon AS product_icon,
            product.brief AS product_brief,
            product.category AS product_category,
            product.postage AS product_postage,
            specification.name AS product_specification_name,
            specification.value AS product_specification_value,
            specification.stock AS product_specification_stock,
            user.uuid AS user_uuid,
            user.username AS user_username,
            user.phone AS user_phone
        FROM
            \`order\`
        LEFT JOIN
            product ON \`order\`.product_id = product.id
        LEFT JOIN
            product_specification AS specification ON \`order\`.product_specification_id = specification.id
        LEFT JOIN
            user ON \`order\`.user_id = user.id
        ${whereClause}
        ORDER BY
            \`order\`.create_time DESC
        LIMIT
            ${(page - 1) * limit},${limit}`;
        let sql2 = `SELECT COUNT(*) FROM \`order\` ${whereClause}`;
        db.query(sql, (err, result) => {
            if (err) {
                sqlerr(res, err);
            } else {
                db.query(sql2, (err, result2) => {
                    if (err) {
                        sqlerr(res, err);
                    } else {
                        res.send({
                            code: 200,
                            msg: '搜索订单列表成功',
                            'data': result,
                            'total': result2[0]['COUNT(*)']
                        })
                    }
                })
            }
        })
    }
})

// 修改订单地址，收货人姓名，手机号
router.put('/updateOrder', (req, res) => {
    let { id, name, phone, address } = req.body;
    if (!isEmptyStr(id) && !isEmptyStr(order_no)) {
        tw(res, 400, '请选择订单');
        return;
    }
    let querySql = `select * from \`order\` where id = '${id}'`;
    db.query(querySql, (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) return tw(res, 400, '订单不存在');
        name = isEmptyStr(name) ? name : result[0].name;
        phone = isEmptyStr(phone) ? phone : result[0].phone;
        address = isEmptyStr(address) ? address : result[0].address;
        let sql = `update \`order\` set name = '${name}', phone = '${phone}', address = '${address}' where id = '${id}'`;
        db.query(sql, (err, result) => {
            if (err) return sqlerr(res, err);
            res.send({
                code: 200,
                msg: '修改订单成功'
            })
        })
    })
})

//修改订单备注
router.put('/updateOrderRemark', (req, res) => {
    let { id, remark } = req.body;
    if (!isEmptyStr(id)) {
        tw(res, 400, '请选择订单');
        return;
    }
    let querySql = `select * from \`order\` where id = '${id}'`;
    db.query(querySql, (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) return tw(res, 400, '订单不存在');
        let sql = `update \`order\` set remark = '${remark}' where id = '${id}'`;
        db.query(sql, (err, result) => {
            if (err) return sqlerr(res, err);
            res.send({
                code: 200,
                msg: '修改订单备注成功'
            })
        })
    })
})

// 修改订单状态，不支持修改为状态3
router.put('/updateOrderStatus', (req, res) => {
    let { id, status } = req.body;
    if (!isEmptyStr(id)) {
        tw(res, 400, '请选择订单');
        return;
    }
    if (status == 3) {
        tw(res, 400, '不支持修改为待收货');
        return;
    }
    let querySql = `select * from \`order\` where id = '${id}'`;
    db.query(querySql, (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) return tw(res, 400, '订单不存在');
        let sql = `update \`order\` set status = '${status}' where id = '${id}'`;
        db.query(sql, (err, result) => {
            if (err) return sqlerr(res, err);
            res.send({
                code: 200,
                msg: '修改订单状态成功'
            })
        })
    })
})

// 订单发货
router.post('/deliverOrder', (req, res) => {
    let { id, express_company, express_no } = req.body;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择订单');
    if (!isEmptyStr(express_company)) return tw(res, 400, '请选择快递公司');
    if (!isEmptyStr(express_no)) return tw(res, 400, '请输入快递单号');
    let sql = `update \`order\` set express_company = '${express_company}', express_no = '${express_no}', status = 3,express_time = now() where id = '${id}'`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        let querySqlSend = `select order_no,transaction_id,phone,
        (select openid from  \`user\` where id = \`order\`.user_id) as openid,
        (select name from product where id = \`order\`.product_id) as item_desc
    from \`order\` where id = '${req.body.id}'`;
        db.query(querySqlSend, [req.body.id], (err, result) => {
            let { order_no, transaction_id, phone, openid, item_desc } = result[0];
            sendModel(order_no, transaction_id, req.body.express_no, item_desc, phone, openid, req.body.express_company)
        })
        res.send({
            code: 200,
            msg: '订单发货成功'
        })
    })
})

// 逻辑删除订单
router.delete('/deleteOrder', (req, res) => {
    let { id } = req.query;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择订单');
    let sql = `update \`order\` set delete_status = 1 where id = '${id}'`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        res.send({
            code: 200,
            msg: '订单删除成功'
        })
    })
})

// 恢复订单
router.post('/recoverOrder', (req, res) => {
    let { id } = req.body;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择订单');
    let sql = `update \`order\` set delete_status = 0 where id = '${id}'`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        res.send({
            code: 200,
            msg: '订单恢复成功'
        })
    })
})

// 实际删除订单 
router.delete('/deleteOrderReal', (req, res) => {
    let { id } = req.query;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择订单');
    let sql = `delete from \`order\` where id = '${id}'`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        res.send({
            code: 200,
            msg: '订单删除成功'
        })
    })
})

//用户订单退款
router.post('/orderRefund', async (req, res) => {
    let orderId = req.body.orderId; //订单号
    let money = req.body.money; //退款金额

    let sql = `select * from \`order\` where order_no = '${orderId}'`;
    db.query(sql, async (err, result) => {

        const pay = new WxPay({
            appid: config.appid,
            mchid: config.mchid,
            publicKey: fs.readFileSync(path.join(__dirname, '../', config.publicKey)), // 公钥
            privateKey: fs.readFileSync(path.join(__dirname, '../', config.privateKey)), // 秘钥
        });

        if (err) return sqlerr(res, err);
        if (result.length === 0) return tw(res, 400, '订单不存在');
        if (result[0].status == 0 || result[0].status == 6) return tw(res, 400, '订单状态不正确');
        if (result[0].actual_price < money) return tw(res, 400, '退款金额不能大于订单实际支付金额');

        //将订单号首字母D修改为T
        let orderNumber = orderId.replace('D', 'T');

        let params = {
            out_trade_no: orderId,//原订单号
            out_refund_no: orderNumber,
            notify_url: config.system_url + '/admin/order/notify_refund',
            amount: {
                refund: Math.ceil(Number(req.body.refund_amount) * 100),
                total: Math.ceil(Number(result[0].actual_price) * 100),
                currency: 'CNY'
            }
        }
        const payResult = await pay.refunds(params);
        if (payResult.status == 400) {
            return tw(res, 400, '退款失败，' + payResult.message);
        } else {
            res.send({
                code: 200,
                data: payResult,
                message: "退款中,请等待退款结果",
            });
        }

    })

});

//微信支付退款回调通知
router.post('/notify_refund', async (req, res) => {
    let ord = ''
    try {
        const pay = new WxPay({
            appid: config.appid,
            mchid: config.mchid,
            publicKey: fs.readFileSync(path.join(__dirname, '../', config.publicKey)), // 公钥
            privateKey: fs.readFileSync(path.join(__dirname, '../', config.privateKey)), // 秘钥
        });
        // 申请的APIv3
        let key = config.key;
        let {
            ciphertext,
            associated_data,
            nonce
        } = req.body.resource;
        // 解密回调信息
        const result = await pay.decipher_gcm(ciphertext, associated_data, nonce, key);
        ord = result.out_trade_no
        // logger.info("解密回调参数 result==",result)
        if (result.refund_status === 'SUCCESS') {
            // 修改订单状态
            let sql = `update \`order\` set status = 6 where order_no = '${result.out_trade_no}'`;
            db.query(sql, (err, ttt) => {
                if (err) return sqlerr(res, err);
                sendMessage('退款成功', '已退款成功，退款完成时间：' + result.success_time, 'success', result.out_trade_no);
                res.send({
                    code: 200,
                    msg: '退款成功'
                })
            })
        } else {
            res.send({
                code: 200,
                msg: '提交微信退款失败'
            })
            sendMessage('退款异常', '退款申请提交微信异常，请前往微信商户后台手动退款', 'error', result.out_trade_no);
        }

    } catch (error) {
        console.log(error);
        sendMessage('退款失败', '疑似系统配置异常，请联系开发者', 'error', ord);
        res.send({
            code: 500,
            message: "失败",
        });
    }
});

module.exports = router;
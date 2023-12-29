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

//用户是否被封禁中间件
router.use((req, res, next) => {
    let sql = 'select status from `user` where id = ?';
    db.query(sql, [req.auth.id], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result[0].status === 1) return tw(res, 405, '您已被封禁，无法操作');
        next();
    })
})


//获取用户订单列表
router.get('/orderList', (req, res) => {
    let id = req.auth.id;
    let page = req.query.page || 1;
    let limit = req.query.pageSize || 10;
    let sql = `select id,order_no,create_time,transaction_id,status,actual_price,address,count,name,phone,express_no,express_company,product_id,product_specification_id,
    (select name from product where id=product_id) as product_name,
    (select icon from product where id=product_id) as product_img,
    (select name from product_specification where id=product_specification_id) as product_specification_name,
    (select value from product_specification where id=product_specification_id) as product_specification_price
    from \`order\` where user_id=? and delete_status != 1 order by create_time desc LIMIT
            ${(page - 1) * limit},${limit}`;
    db.query(sql, [id], (err, result) => {
        if (err) return sqlerr(res, err);

        let sql2 = 'select count(*) as total from `order` where user_id=? and delete_status != 1';
        db.query(sql2, [id], (err, result2) => {
            if (err) return sqlerr(res, err);
            res.send({
                code: 200,
                msg: '获取成功',
                data: result,
                total: result2[0].total
            })
        })
    })
});

//分状态获取用户订单列表
router.get('/orderListByStatus', (req, res) => {
    let id = req.auth.id;
    let page = req.query.page || 1;
    let limit = req.query.pageSize || 10;
    let status = req.query.status;
    if (!isEmptyStr(status)) return tw(res, 400, '请选择订单状态')
    //status只能是0,1,2,3,4，5,6
    if (status < 0 || status > 6) return tw(res, 400, '订单状态错误')
    let sql = `select id,order_no,create_time,status,transaction_id,actual_price,address,count,name,phone,express_no,express_company,product_id,product_specification_id,
    (select name from product where id=product_id) as product_name,
    (select icon from product where id=product_id) as product_img,
    (select name from product_specification where id=product_specification_id) as product_specification_name,
    (select value from product_specification where id=product_specification_id) as product_specification_price
    from \`order\` where user_id=? and status=? and delete_status != 1 order by create_time desc LIMIT
            ${(page - 1) * limit},${limit}`;
    db.query(sql, [id, status], (err, result) => {
        if (err) return sqlerr(res, err);

        let sql2 = 'select count(*) as total from `order` where user_id=? and status=? and delete_status != 1';
        db.query(sql2, [id, status], (err, result2) => {
            if (err) return sqlerr(res, err);
            res.send({
                code: 200,
                msg: '获取成功',
                data: result,
                total: result2[0].total
            })
        })
    })
});

//获取订单详情
router.get('/orderDetail', (req, res) => {
    let id = req.auth.id;
    let orderId = req.query.orderId;
    if (!isEmptyStr(orderId)) return tw(res, 400, '请输入订单id')
    let sql = `select id,order_no,create_time,pay_time,status,actual_price,total_price,address,remark,count,name,phone,express_no,express_company,express_time,
    sign_time,product_id,transaction_id,product_specification_id,
    (select name from coupon where id=coupon_id) as coupon_name,
    (select amount from coupon where id=coupon_id) as coupon_amount,
    (select name from product where id=product_id) as product_name,
    (select icon from product where id=product_id) as product_img,
    (select brief from product where id=product_id) as product_brief,
    (select postage from product where id=product_id) as product_postage,
    (select if(coupon_id=0,'false','true') from \`order\` where id=?) as is_coupon,
    (select name from product_specification where id=product_specification_id) as product_specification_name,
    (select value from product_specification where id=product_specification_id) as product_specification_price
    from \`order\` where user_id=? and id=? and delete_status != 1`;
    db.query(sql, [id, id, orderId], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) return tw(res, 404, '订单不存在')
        result[0].is_coupon = result[0].is_coupon === 'true' ? true : false;
        res.send({
            code: 200,
            msg: '获取成功',
            data: result[0]
        })
    })
});

//订单收货
router.post('/signOrder', (req, res) => {
    let id = req.auth.id;
    let orderId = req.body.orderId;
    if (!isEmptyStr(orderId)) return tw(res, 400, '请输入订单id')
    let sql = 'update `order` set status=4,sign_time=now() where user_id=? and id=?';
    db.query(sql, [id, orderId], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.affectedRows === 0) return tw(res, 404, '订单不可关闭')
        res.send({
            code: 200,
            msg: '收货成功'
        })
    })
});


//用户逻辑删除订单
router.delete('/deleteOrder', (req, res) => {
    let id = req.auth.id;
    let orderId = req.query.orderId;
    if (!isEmptyStr(orderId)) return tw(res, 400, '请输入订单id')
    let querySql = 'select * from `order` where id=?';
    db.query(querySql, [orderId], (err, result) => {
        if (result[0].status == 0) {
            try {
                const pay = new WxPay({
                    appid: config.appid,
                    mchid: config.mchid,
                    publicKey: fs.readFileSync(path.join(__dirname, '../', config.publicKey)), // 公钥
                    privateKey: fs.readFileSync(path.join(__dirname, '../', config.privateKey)), // 秘钥
                });
                pay.close(result[0].order_no)
                let sql = 'update `order` set delete_status=1 where user_id=? and id=?';
                db.query(sql, [id, orderId], (err, result) => {
                    if (err) return sqlerr(res, err);
                    if (result.affectedRows === 0) return tw(res, 404, '订单不存在')
                    res.send({
                        code: 200,
                        msg: '取消成功'
                    })
                })

            } catch (error) {
                res.send({
                    code: 500,
                    msg: "关闭微信订单失败",
                });
            }

        } else {
            let sql = 'update `order` set delete_status=1 where user_id=? and id=?';
            db.query(sql, [id, orderId], (err, result) => {
                if (err) return sqlerr(res, err);
                if (result.affectedRows === 0) return tw(res, 404, '订单不存在')
                res.send({
                    code: 200,
                    msg: '删除成功'
                })
            })
        }
    })
});

//用户评价订单
router.post('/commentOrder', (req, res) => {
    let { orderId, content, star, is_anonymous } = req.body;
    if (!isEmptyStr(orderId)) return tw(res, 400, '请输入订单id')
    if (!isEmptyStr(content)) return tw(res, 400, '请输入评价内容')
    if (!isEmptyStr(star)) return tw(res, 400, '请输入评价星级')
    //star只能是1,2,3,4,5
    if (star < 1 || star > 5) return tw(res, 400, '评价星级错误')
    is_anonymous = isEmptyStr(is_anonymous) ? is_anonymous : 0;
    let querySql = 'select * from `order` where id=?';
    db.query(querySql, [orderId], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) return tw(res, 404, '订单不存在')
        if (result[0].status < 4) return tw(res, 400, '订单未完成，无法评价')
        if (result[0].status > 4) return tw(res, 400, '此订单不可评价')
        let sql = 'insert into product_comment (product_id,user_id,content,create_time,star,is_anonymous) values (?,?,?,now(),?,?)';
        db.query(sql, [result[0].product_id, req.auth.id, content, star, is_anonymous], (err, result) => {
            if (err) return sqlerr(res, err);

            let updateSql = 'update `order` set status=5 where id=?';
            db.query(updateSql, [orderId], (err, result) => {
                if (err) return sqlerr(res, err);
            })

            res.send({
                code: 200,
                msg: '评价成功'
            })
        })
    })

})

// 我的所有评价列表
router.get('/myCommentList', (req, res) => {
    let { page, limit } = req.query;
    page = page || 1;
    limit = limit || 10;
    let id = req.auth.id;
    let sql = `select id,product_id,content,create_time,star,is_anonymous,
    (select name from product where id=product_id) as product_name,
    (select icon from product where id=product_id) as product_img
    from product_comment where user_id=? order by create_time desc LIMIT
            ${(page - 1) * limit},${limit}`;
    db.query(sql, [id], (err, result) => {
        if (err) return sqlerr(res, err);

        let sql2 = 'select count(*) as total from product_comment where user_id=?';
        db.query(sql2, [id], (err, result2) => {
            if (err) return sqlerr(res, err);
            res.send({
                code: 200,
                msg: '获取成功',
                data: result,
                total: result2[0].total
            })
        })
    })

})

//删除评价
router.delete('/deleteComment', (req, res) => {
    let id = req.auth.id;
    let commentId = req.query.commentId;
    if (!isEmptyStr(commentId)) return tw(res, 400, '请输入评价id')
    let sql = 'delete from product_comment where user_id=? and id=?';
    db.query(sql, [id, commentId], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.affectedRows === 0) return tw(res, 404, '评价不存在')
        res.send({
            code: 200,
            msg: '删除成功'
        })
    })

})

//获取用户优惠券列表
router.get('/couponList', (req, res) => {
    let id = req.auth.id;
    let page = req.query.page || 1;
    let limit = req.query.pageSize || 10;
    let status = req.query.status;
    status = isEmptyStr(status) ? status : 0;
    if (status == 0) {
        //获取coupon表中user_id为当前用户id以及为0的，且end_time大于当前时间status为0的
        let sql = `select id,name,amount,start_time,end_time,min,create_time,use_time,if(user_id=0,'false','true') as is_used 
    from coupon where (user_id=? or user_id=0) and end_time>now() and status=? order by end_time desc LIMIT
            ${(page - 1) * limit},${limit}`;
        db.query(sql, [id, status], (err, result) => {
            if (err) return sqlerr(res, err);

            let sql2 = 'select count(*) as total from coupon where (user_id=? or user_id=0) and end_time>now() and status=?';
            db.query(sql2, [id, status], (err, result2) => {
                if (err) return sqlerr(res, err);
                res.send({
                    code: 200,
                    msg: '获取成功',
                    data: result,
                    total: result2[0].total
                })
            })
        })
    } else if (status == 1) {
        //已过期的优惠券，获取coupon表中user_id为当前用户id以及为0的，且end_time小于当前时间且status不等于2的
        let sql = `select id,name,amount,start_time,end_time,min,create_time,use_time,if(user_id=0,'false','true') as is_used 
        from coupon where (user_id=? or user_id=0) and end_time<now() and status!=2 order by end_time desc LIMIT
                ${(page - 1) * limit},${limit}`;
        db.query(sql, [id, status], (err, result) => {
            if (err) return sqlerr(res, err);
            let sql2 = 'select count(*) as total from coupon where (user_id=? or user_id=0) and end_time<now() and status!=2';
            db.query(sql2, [id, status], (err, result2) => {
                if (err) return sqlerr(res, err);
                res.send({
                    code: 200,
                    msg: '获取成功',
                    data: result,
                    total: result2[0].total
                })
            })
        })

    } else {
        // 已使用的优惠券，获取coupon表中user_id为当前用户id以及为0的，且status为2的
        let sql = `select id,name,amount,start_time,end_time,min,create_time,use_time,if(user_id=0,'false','true') as is_used
        from coupon where (user_id=? or user_id=0) and status=? order by end_time desc LIMIT
                ${(page - 1) * limit},${limit}`;
        db.query(sql, [id, status], (err, result) => {
            if (err) return sqlerr(res, err);
            let sql2 = 'select count(*) as total from coupon where (user_id=? or user_id=0) and status=?';
            db.query(sql2, [id, status], (err, result2) => {
                if (err) return sqlerr(res, err);
                res.send({
                    code: 200,
                    msg: '获取成功',
                    data: result,
                    total: result2[0].total
                })
            })
        })
    }
})

//获取用户优惠券详情
router.get('/couponDetail', (req, res) => {
    let id = req.auth.id;
    let couponId = req.query.couponId;
    if (!isEmptyStr(couponId)) return tw(res, 400, '请输入优惠券id')
    let sql = 'select id,name,amount,start_time,end_time,create_time,use_time,if(user_id=0,"false","true") as is_used from coupon where id=? and (user_id=? or user_id=0)';
    db.query(sql, [couponId, id], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) return tw(res, 404, '优惠券不存在')
        res.send({
            code: 200,
            msg: '获取成功',
            data: result[0]
        })
    })
})

//添加购物车物品
router.post('/addCart', (req, res) => {
    let user_id = req.auth.id;
    let product_id = req.body.product_id;
    let specification_id = req.body.specification_id;
    let count = req.body.count;
    if (!isEmptyStr(product_id)) return tw(res, 400, '请选择商品')
    if (!isEmptyStr(specification_id)) return tw(res, 400, '请选择规格')
    count = isEmptyStr(count) ? count : 1;
    let querySql = 'select * from cart where user_id=? and product_id=? and product_specification_id=?';
    db.query(querySql, [user_id, product_id, specification_id], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) {
            let sql = 'insert into cart (user_id,product_id,product_specification_id,count,create_time) values (?,?,?,?,now())';
            db.query(sql, [user_id, product_id, specification_id, count], (err, result) => {
                if (err) return sqlerr(res, err);
                res.send({
                    code: 200,
                    msg: '添加成功'
                })
            })
        } else {
            //以下是收藏逻辑，多次添加份数不变
            res.send({
                code: 400,
                msg: '已经被收藏过了'
            })

            //以下是购物车逻辑，多次添加份数加一
            // let sql = 'update cart set count=count+? where user_id=? and product_id=? and product_specification_id=?';
            // db.query(sql, [count, user_id, product_id, specification_id], (err, result) => {
            //     if (err) return sqlerr(res, err);
            //     res.send({
            //         code: 200,
            //         msg: '添加成功'
            //     })
            // })
        }
    })

})

//获取购物车列表
router.get('/cartList', (req, res) => {
    let user_id = req.auth.id;
    let sql = `select id,count,product_id,
    (select name from product where id=product_id) as product_name,
    (select icon from product where id=product_id) as product_img,
    (select name from product_specification where id=product_specification_id) as product_specification_name,
    (select value from product_specification where id=product_specification_id) as product_specification_price
    from cart where user_id=?`;
    db.query(sql, [user_id], (err, result) => {
        if (err) return sqlerr(res, err);
        res.send({
            code: 200,
            msg: '获取成功',
            data: result
        })
    })
})

//修改购物车物品数量
router.put('/editCart', (req, res) => {
    let user_id = req.auth.id;
    let cartId = req.body.cartId;
    let count = req.body.count;
    if (!isEmptyStr(cartId)) return tw(res, 400, '请选择修改的数据')
    if (!isEmptyStr(count)) return tw(res, 400, '请输入数量')
    let sql = 'update cart set count=? where user_id=? and id=?';
    db.query(sql, [count, user_id, cartId], (err, result) => {
        if (err) return sqlerr(res, err);
        res.send({
            code: 200,
            msg: '修改成功'
        })
    })
})


//获取购物车物品数量
router.get('/cartCount', (req, res) => {
    let user_id = req.auth.id;
    //数量为商品份数总和
    let sql = 'select sum(count) as count from cart where user_id=?';
    db.query(sql, [user_id], (err, result) => {
        if (err) return sqlerr(res, err);
        res.send({
            code: 200,
            msg: '获取成功',
            data: result[0].count
        })
    })
})

//删除购物车物品
router.delete('/delCart', (req, res) => {
    let user_id = req.auth.id;
    let cartId = req.query.cartId;
    if (!isEmptyStr(cartId)) return tw(res, 400, '请选择删除的数据')
    let sql = 'delete from cart where user_id=? and id=?';
    db.query(sql, [user_id, cartId], (err, result) => {
        if (err) return sqlerr(res, err);
        res.send({
            code: 200,
            msg: '删除成功'
        })
    })
})


module.exports = router;

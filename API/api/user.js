const express = require('express');
const router = express.Router();
const db = require('../link/link.js');



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


let isStatus = (req, res, next) => {
    let sql = 'select status from `user` where id = ?';
    db.query(sql, [req.auth.id], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result[0].status === 1) return tw(res, 405, '您已被封禁，无法操作');
        next();
    })
}



//获取用户账号信息
router.get('/userInfo', (req, res) => {
    let uuid = req.auth.uuid;
    let sql = 'select uuid,username,openid,phone,create_time from user where uuid=?';
    db.query(sql, [uuid], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) {
            tw(res, 404, '用户不存在');
            return;
        }
        res.send({
            code: 200,
            msg: '获取成功',
            data: result[0]
        })
    })
});

// 获取用户页统计信息
router.get('/userCount', (req, res) => {
    let uuid = req.auth.uuid;
    let queryIdSql = 'select id from user where uuid=?';
    db.query(queryIdSql, [uuid], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) {
            tw(res, 404, '用户不存在');
            return;
        }
        let id = result[0].id;
        //获取在order表中user_id为用户id且status分别为0,1,2,3,4,5,6的订单数量
        // 分别代表0未支付1已支付2待发货3待收货4待评价5已完成6已退款
        //获取coupon表中user_id为用户id和0且status为0，1,2的优惠券数量，其中0正常1过期2已使用
        //获取cart表中user_id为用户id的商品数量
        let queryOrderSql = `select 
        (select count(*) from \`order\` where user_id=? and status=0 and delete_status = 0 and create_time>=date_sub(now(),interval 30 minute)) as order_status0,
        (select count(*) from \`order\` where user_id=? and status=1 and delete_status = 0) as order_status1,
        (select count(*) from \`order\` where user_id=? and status=2 and delete_status = 0) as order_status2,
        (select count(*) from \`order\` where user_id=? and status=3 and delete_status = 0) as order_status3,
        (select count(*) from \`order\` where user_id=? and status=4 and delete_status = 0) as order_status4,
        (select count(*) from \`order\` where user_id=? and status=5 and delete_status = 0) as order_status5,
        (select count(*) from \`order\` where user_id=? and status=6 and delete_status = 0) as order_status6,
        (select count(*) from coupon where user_id=? and status=0) as coupon_status0,
        (select count(*) from coupon where user_id=? and status=1) as coupon_status1,
        (select count(*) from coupon where user_id=? and status=2) as coupon_status2,
        (select count(*) from cart where user_id=?) as cart_count`;
        db.query(queryOrderSql, [id, id, id, id, id, id, id, id, id, id, id], (err, result) => {
            if (err) return sqlerr(res, err);
            res.send({
                code: 200,
                msg: '获取成功',
                data: result[0]
            })
        })
    })
});

//添加用户地址
router.post('/addAddress', isStatus, (req, res) => {
    let uuid = req.auth.uuid;
    let { name, phone, province, city, county, address_detail } = req.body;
    if (!isEmptyStr(name) || !isEmptyStr(phone) || !isEmptyStr(province) || !isEmptyStr(city) || !isEmptyStr(county) || !isEmptyStr(address_detail)) return tw(res, 400, '请输入完整')
    let queryIdSql = 'select id from user where uuid=?';
    db.query(queryIdSql, [uuid], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) {
            tw(res, 404, '用户不存在');
            return;
        }
        let id = result[0].id;
        let isDefsql = 'select id from user_address where user_id = ? and is_default=1';
        db.query(isDefsql, [id], (err, result) => {
            if (err) return sqlerr(res, err);
            let is_default = result.length === 0 ? 1 : 0;
            console.log(is_default);
            let sql = 'insert into user_address (user_id,name,phone,province,city,county,address_detail,is_default) values (?,?,?,?,?,?,?,?)';
            db.query(sql, [id, name, phone, province, city, county, address_detail, is_default], (err, result) => {
                if (err) return sqlerr(res, err);
                res.send({
                    code: 200,
                    msg: '添加成功',
                    data: result.insertId
                })
            })
        })
    })

});

//获取用户地址列表
router.get('/addressList', isStatus, (req, res) => {
    let id = req.auth.id;
    let sql = 'select id,name,phone,province,city,county,address_detail,is_default from user_address where user_id=?';
    db.query(sql, [id], (err, result) => {
        if (err) return sqlerr(res, err);
        res.send({
            code: 200,
            msg: '获取成功',
            data: result
        })
    })
})

//获取用户地址详情
router.get('/addressDetail', isStatus, (req, res) => {
    let id = req.query.id;
    let user_id = req.auth.id;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择查看的数据')
    let sql = 'select id,name,phone,province,city,county,address_detail,is_default from user_address where id=? and user_id=?';
    db.query(sql, [id, user_id], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) {
            tw(res, 404, '信息错误');
            return;
        }
        res.send({
            code: 200,
            msg: '获取成功',
            data: result[0]
        })
    })
})

//修改用户地址
router.put('/editAddress', isStatus, (req, res) => {
    let id = req.body.id;
    let user_id = req.auth.id;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择修改的数据')
    let { name, phone, province, city, county, address_detail } = req.body;
    let querySql = 'select * from user_address where id=? and user_id=?';
    db.query(querySql, [id, user_id], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) {
            tw(res, 404, '信息错误');
            return;
        }
        name = isEmptyStr(name) ? name : result[0].name;
        phone = isEmptyStr(phone) ? phone : result[0].phone;
        province = isEmptyStr(province) ? province : result[0].province;
        city = isEmptyStr(city) ? city : result[0].city;
        county = isEmptyStr(county) ? county : result[0].county;
        address_detail = isEmptyStr(address_detail) ? address_detail : result[0].address_detail;
        let sql = 'update user_address set name=?,phone=?,province=?,city=?,county=?,address_detail=? where id=?';
        db.query(sql, [name, phone, province, city, county, address_detail, id], (err, result) => {
            if (err) return sqlerr(res, err);
            res.send({
                code: 200,
                msg: '修改成功'
            })
        })
    })
})

//删除用户地址
router.delete('/delAddress', isStatus, (req, res) => {
    let id = req.query.id;
    let user_id = req.auth.id;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择删除的数据')
    let querySql = 'select * from user_address where id=? and user_id=?';
    db.query(querySql, [id, user_id], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) {
            tw(res, 404, '信息错误');
            return;
        }
        //如果删除的是默认地址，将用户的最新添加（id最大的）地址设置为默认地址
        if (result[0].is_default === 1) {
            let sql = 'update user_address set is_default=1 where id=(select id from user_address where user_id=? order by id desc limit 1)';
            db.query(sql, [user_id], (err, result) => {
                if (err) return sqlerr(res, err);
            })
        }
        let sql = 'delete from user_address where id=?';
        db.query(sql, [id], (err, result) => {
            if (err) return sqlerr(res, err);
            res.send({
                code: 200,
                msg: '删除成功'
            })
        })
    })
})

//设置默认地址
router.put('/setDefaultAddress', isStatus, (req, res) => {
    let id = req.body.id;
    let user_id = req.auth.id;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择设置的数据')
    let querySql = 'select * from user_address where id=? and user_id=?';
    db.query(querySql, [id, user_id], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) {
            tw(res, 404, '信息错误');
            return;
        }
        let sql = 'update user_address set is_default=0 where user_id=?';
        db.query(sql, [user_id], (err, result) => {
            if (err) return sqlerr(res, err);
            let sql = 'update user_address set is_default=1 where id=?';
            db.query(sql, [id], (err, result) => {
                if (err) return sqlerr(res, err);
                res.send({
                    code: 200,
                    msg: '设置成功'
                })
            })
        })
    })
})

//修改账号
router.put('/editUsername', isStatus, (req, res) => {
    let uuid = req.auth.uuid;
    let username = req.body.username;
    if (!isEmptyStr(username)) return tw(res, 400, '请输入修改的昵称')
    let sql = 'update user set username=? where uuid=?';
    db.query(sql, [username, uuid], (err, result) => {
        if (err) return sqlerr(res, err);
        res.send({
            code: 200,
            msg: '修改成功'
        })
    })
})


module.exports = router;

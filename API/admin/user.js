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


// 封禁/解封用户
router.put('/prohibitedUsers', (req, res) => {
    let { id, status } = req.body;
    if (!isEmptyStr(id) || !isEmptyStr(status)) {
        tw(res, 400, '参数错误');
        return;
    }
    //status 0:解封 1:封禁，且只能是这两个值
    if (status != 0 && status != 1) {
        tw(res, 400, '参数错误');
        return;
    }
    let sql = `update user set status=${status} where id=${id}`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        tw(res, 200, (status == 0 ? '解封' : '封禁') + '成功');
    })
})

// 获取用户列表
router.get('/userList', (req, res) => {
    let { page, limit, name, phone, status, uuid } = req.query;
    page = page || 1;
    limit = limit || 10;
    let sql = `select *,(select count(*) from cart where user_id = user.id) as cart_count,(select count(*) from \`order\` where user_id = user.id) as order_count from user where 1=1`;
    if (name) {
        sql += ` and username like '%${name}%'`;
    }
    if (phone) {
        sql += ` and phone like '%${phone}%'`;
    }
    if (status) {
        sql += ` and status=${status}`;
    }
    if (uuid) {
        sql += ` and uuid='${uuid}'`;
    }
    sql += ` limit ${(page - 1) * limit},${limit}`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        let sql2 = `select count(*) as count from user where 1=1`;
        if (name) {
            sql2 += ` and username like '%${name}%'`;
        }
        if (phone) {
            sql2 += ` and phone like '%${phone}%'`;
        }
        if (status) {
            sql2 += ` and status=${status}`;
        }
        if (uuid) {
            sql2 += ` and uuid='${uuid}'`;
        }
        db.query(sql2, (err, result2) => {
            if (err) {
                sqlerr(res, err);
                return;
            }
            res.send({
                'code': 200,
                'msg': '获取成功',
                'data': result,
                'total': result2[0].count

            })
        })
    })
})

// 删除用户
router.delete('/userDel', (req, res) => {
    let { id } = req.query;
    if (!isEmptyStr(id)) {
        tw(res, 400, '参数错误');
        return;
    }
    let sql = `delete from user where id=${id}`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        tw(res, 200, '删除成功');
    })
})

// 获取用户地址
router.get('/userAddress', (req, res) => {
    let { id, page, limit } = req.query;
    page = page || 1;
    limit = limit || 10;
    let initSql = `select *,(select uuid from user where id = user_address.user_id) as user_uuid from user_address `
    if (id) {
        initSql += `where user_id=${id} `
    }
    initSql += `limit ${(page - 1) * limit},${limit}`;
    db.query(initSql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        let sql2 = `select count(*) as count from user_address `
        if (id) {
            sql2 += `where user_id=${id} `
        }
        db.query(sql2, (err, result2) => {
            if (err) {
                sqlerr(res, err);
                return;
            }
            res.send({
                'code': 200,
                'msg': '获取成功',
                'data': result,
                'total': result2[0].count
            })
        })
    })
})

// 删除用户地址
router.delete('/userAddressDel', (req, res) => {
    let { id } = req.query;
    if (!isEmptyStr(id)) {
        tw(res, 400, '参数错误');
        return;
    }
    let sql = `delete from user_address where id=${id}`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        tw(res, 200, '删除成功');
    })
})

// 查看用户购物车
router.get('/userCart', (req, res) => {
    let { id, page, limit } = req.query;
    page = page || 1;
    limit = limit || 10;


    let initSql = `
        SELECT 
            cart.*, 
            (select uuid from user where id = cart.user_id) as user_uuid,
            product.name AS product_name, 
            product.icon AS product_icon, 
            COALESCE(specification.name, first_specification.name) AS specification_name,
            COALESCE(specification.value, first_specification.value) AS specification_value,
            COALESCE(specification.stock, first_specification.stock) AS specification_stock
        FROM cart
        LEFT JOIN product ON cart.product_id = product.id
        LEFT JOIN product_specification AS specification ON cart.product_specification_id = specification.id
        LEFT JOIN (
            SELECT product_id, MIN(id) AS id, name, value, stock
            FROM product_specification
            GROUP BY product_id
        ) AS first_specification ON cart.product_id = first_specification.product_id
    `;
    if (!isEmptyStr(id)) {
        initSql += ` LIMIT ${(page - 1) * limit},${limit}`;
    } else {
        initSql += ` WHERE user_id = ${id} LIMIT ${(page - 1) * limit},${limit}`;
    }
    db.query(initSql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }

        let sql2 = `SELECT COUNT(*) AS count FROM cart`;
        if (isEmptyStr(id)) {
            sql2 += ` WHERE user_id = ${id}`;
        }
        db.query(sql2, (err, result2) => {
            if (err) {
                sqlerr(res, err);
                return;
            }
            res.send({
                'code': 200,
                'msg': '获取成功',
                'data': result,
                'total': result2[0].count
            });
        });
    });
});


// 移除购物车物品
router.delete('/userCartDel', (req, res) => {
    let { id } = req.query;
    if (!isEmptyStr(id)) {
        tw(res, 400, '参数错误');
        return;
    }
    let sql = `delete from cart where id=${id}`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        tw(res, 200, '移除成功');
    })
})

module.exports = router;
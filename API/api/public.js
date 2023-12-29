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

//获取系统设置
router.get('/index', (req, res) => {
    let sql = 'select swiper,notice,notice_switch,notice_content,category from `system`';
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        let categoryQuerySql = 'select * from `product_category` where id in (?)';
        db.query(categoryQuerySql, [result[0].category.split(',')], (err, categoryResult) => {
            if (err) return sqlerr(res, err);
            result[0].category = categoryResult;
            res.send({
                code: 200,
                msg: '获取成功',
                data: result[0]
            })
        })
    })
});

//获取商品分类
router.get('/category', (req, res) => {
    let sql = 'select * from `product_category`';
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        res.send({
            code: 200,
            msg: '获取成功',
            data: result
        })
    })
})

//获取商品列表
router.get('/product', (req, res) => {
    let { page, limit, sort, name, category, sortType } = req.query;
    page = isEmptyStr(page) ? page : 1;
    limit = isEmptyStr(limit) ? limit : 10;
    //sort只能取值popularity(人气)、sales(销量)、price(价格)
    if (sort !== 'popularity' && sort !== 'sales' && sort !== 'price') {
        sort = 'popularity';
    }
    sort = isEmptyStr(sort) ? sort : 'popularity';
    sortType = isEmptyStr(sortType) ? sortType : 'desc';
    let sql = `select id,uuid,name,category,brief,sales,icon,status,category_id,postage,popularity,
    (SELECT MIN(value)
FROM product_specification
WHERE product_id = product.id) as price
    from \`product\` where 1=1`;
    let sqlCount = 'select count(*) as count from `product` where 1=1';
    let sqlParams = [];
    let sqlCountParams = [];

    sql += ' and product.status != 1';
    sqlCount += ' and product.status != 1';


    if (isEmptyStr(name)) {
        sql += ' and name like ?';
        sqlCount += ' and name like ?';
        sqlParams.push('%' + name + '%');
        sqlCountParams.push('%' + name + '%');
    }
    if (isEmptyStr(category)) {
        sql += ' and category_id = ?';
        sqlCount += ' and category_id = ?';
        sqlParams.push(category);
        sqlCountParams.push(category);
    }
    sql += ` order by ${sort} ${sortType}`;
    sql += ' limit ?,?';
    sqlParams.push((page - 1) * limit);
    sqlParams.push(Number(limit));
    db.query(sql, sqlParams, (err, result) => {
        if (err) return sqlerr(res, err);
        db.query(sqlCount, sqlCountParams, (err, countResult) => {
            if (err) return sqlerr(res, err);

            res.send({
                code: 200,
                msg: '获取成功',
                total: countResult[0].count,
                data: result
            })
        })
    })
})





module.exports = router;
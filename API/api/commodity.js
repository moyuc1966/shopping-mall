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


//获取客服二维码
router.get('/service', (req, res) => {
    let sql = 'select service_qr_code from `system`';
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        res.send({
            code: 200,
            msg: '获取成功',
            data: result[0].service_qr_code
        })
    })
})


//用户是否被封禁中间件
router.use((req, res, next) => {
    let sql = 'select status from `user` where id = ?';
    db.query(sql, [req.auth.id], (err, result) => {
        if (err) return sqlerr(res, err);
        if (result[0].status === 1) return tw(res, 405, '您已被封禁，无法操作');
        next();
    })
})

//获取商品详情
router.get('/product/:id', (req, res) => {
    if (!isEmptyStr(req.params.id)) return tw(res, 400, '参数错误')
    let sql = `select id,uuid,name,category,brief,sales,icon,status,category_id,postage,popularity,
    description
    from \`product\` where id = ?`;
    let sqlParams = [req.params.id];
    db.query(sql, sqlParams, (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) return tw(res, 404, '商品不存在');
        let product = result[0];
        db.query('update `product` set popularity = popularity + 1,views = views + 1 where id = ?', [product.id], (err, updateResult) => {
            if (err) return sqlerr(res, err);
        })
        //获取分类数据
        let categoryQuerySql = 'select * from `product_category` where id = ?';
        if (product.category_id == 0) {
            product.category_id = null
        } else {
            db.query(categoryQuerySql, [product.category_id], (err, categoryResult) => {
                if (err) return sqlerr(res, err);
                product.category_id = categoryResult[0];
            })
        }

        let sqlSpecification = 'select id,name,value as price, stock from `product_specification` where product_id = ?';
        db.query(sqlSpecification, [product.id], (err, specificationResult) => {
            if (err) return sqlerr(res, err);
            product.specification = specificationResult;
            res.send({
                code: 200,
                msg: '获取成功',
                data: product
            })
        })
    })
})

//获取用户收货地址
router.get('/address', (req, res) => {
    let sql = 'select id,name,phone,province,city,county,address_detail,is_default from `user_address` where user_id = ?';
    if (isEmptyStr(req.query.is_default)) sql += ' and is_default = 1';
    db.query(sql, [req.auth.id], (err, result) => {
        if (err) return sqlerr(res, err);
        res.send({
            code: 200,
            msg: '获取成功',
            data: result
        })
    })
})

//分页获取商品评价
router.get('/comment', (req, res) => {
    let { page, limit, product_id } = req.query;
    page = isEmptyStr(page) ? page : 1;
    limit = isEmptyStr(limit) ? limit : 10;
    let sql = `select id,product_id,content,star,create_time ,is_anonymous,
    (select username from \`user\` where id = user_id) as username
    from \`product_comment\` where product_id = ? limit ?,?`;
    let sqlParams = [product_id, (page - 1) * limit, Number(limit)];
    db.query(sql, sqlParams, (err, result) => {
        if (err) return sqlerr(res, err);
        let countSql = `select count(*) as count from \`product_comment\` where product_id = ?`; //总条数
        db.query(countSql, [product_id], (err, countResult) => {
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

//获取商品详情
router.get('/easyproduct/:id', (req, res) => {
    if (!isEmptyStr(req.params.id)) return tw(res, 400, '参数错误')
    let sql = `select id,uuid,name,category,brief,icon,category_id,postage
    from \`product\` where id = ?`;
    let sqlParams = [req.params.id];
    db.query(sql, sqlParams, (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length === 0) return tw(res, 404, '商品不存在');

        res.send({
            code: 200,
            msg: '获取成功',
            data: result[0]
        })
    })
})

//获取商品推荐
router.get('/recommend', (req, res) => {
    let pid = req.query.product_id;
    let querySql = `select * from \`product\` where id = ?`;
    db.query(querySql, [pid], (err, result) => {
        let sql = `select id,uuid,name,category,brief,sales,icon,status,category_id,postage,popularity,
    (SELECT MIN(value)
FROM product_specification
WHERE product_id = product.id) as price
    from \`product\` where name like ? and id != ?`;
        //取result[0]的name的第一个字符
        let name = '%'
        if (result.length > 0) name = result[0].name.substr(0, 1);
        db.query(sql, [name + '%', pid], (err, result) => {
            if (err) return sqlerr(res, err);
            if (result.length < 3) {
                //获取popularity最高的5个商品
                let sql = `select id,uuid,name,category,brief,sales,icon,status,category_id,postage,popularity,
                (SELECT MIN(value)
            FROM product_specification
            WHERE product_id = product.id) as price
                from \`product\` where id != ? order by popularity desc limit 5`;
                db.query(sql, [pid], (err, result2) => {
                    if (err) return sqlerr(res, err);
                    let data = [...result, ...result2]
                    res.send({
                        code: 200,
                        msg: '获取成功',
                        data: data
                    })
                })
            } else {
                res.send({
                    code: 200,
                    msg: '获取成功',
                    data: result
                })
            }
        })
    })
})

module.exports = router;
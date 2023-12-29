const express = require('express');
const router = express.Router();
const db = require('../link/link.js');
const multer = require('multer');
const path = require('path');
const md5 = require('../enc.js');

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



// 获取管理员信息
router.get('/getAdminInfo', (req, res) => {
    let sql = 'select id,username,create_time from admin where id = 1';
    db.query(sql, (err, result) => {
        res.send({ code: 200, msg: '获取管理员信息成功', data: result[0] })
    })
})

// 修改管理员账号
router.put('/updateAdmin', (req, res) => {
    let { username } = req.body;
    if (!isEmptyStr(username)) {
        tw(res, 400, '参数错误');
        return;
    }
    let sql = `update admin set username='${username}' where id=1`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        tw(res, 200, '修改成功');
    })
})

// 修改管理员密码
router.put('/updateAdminPwd', (req, res) => {
    let { oldPwd, newPwd } = req.body;
    if (!isEmptyStr(oldPwd) || !isEmptyStr(newPwd)) {
        tw(res, 400, '参数错误');
        return;
    }
    //新密码长度6-22位，只能包含数字、字母、-_.@$%&!#?中的一种或多种
    let reg = /^[a-zA-Z0-9-_.@$%&!#?]{6,22}$/;
    if (!reg.test(newPwd)) {
        tw(res, 400, '新密码不合法');
        return;
    }
    oldPwd = md5(oldPwd);
    newPwd = md5(newPwd);
    let sql = `select password from admin where id=1`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        if (result[0].password !== oldPwd) {
            tw(res, 400, '原密码错误');
            return;
        }
        if (oldPwd === newPwd) {
            tw(res, 400, '新密码不能与原密码相同');
            return;
        }
        sql = `update admin set password='${newPwd}' where id=1`;
        db.query(sql, (err, result) => {
            if (err) {
                sqlerr(res, err);
                return;
            }
            tw(res, 200, '修改成功');
        })
    })
})


// 获取系统设置
router.get('/getSystem', (req, res) => {
    let sql = 'select * from `system` where id = 1';
    db.query(sql, (err, result) => {
        let data = result[0]
        let sql = `select * from product_category where id in (${[data.category].join(',')})`;
        console.log(data.category);
        db.query(sql, (err, result) => {
            data.category = result;
            res.send({ code: 200, msg: '获取系统设置成功', data: data })
        })
    })
})

//多文件上传中间件
const uploadFilesFun = (req, res, next) => {
    let storage = multer.diskStorage({
        //指定保存位置
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../public/swiper'))
        },
        //指定保存文件名
        filename: (req, file, cb) => {
            let extname = path.extname(file.originalname);
            filename = file.fieldname + "-" + Date.now() + extname;
            cb(null, filename);
        }
    })
    let limits = {
        //设置上传数量，大小
        fileSize: 1024 * 1024 * 3 // 3MB
    }
    const upload = multer({
        storage: storage,
        //限制文件大小
        limits: limits,
        fileFilter: function (req, file, cb) {
            // 限制文件上传类型，仅可上传png格式图片
            if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg') {
                cb(null, true)
            } else {
                cb(null, false)
                let err = new Error();
                err.code = 'LIMIT_FILE_TYPES';
                cb(err)
            }
        }
    }).array('icon', 10);
    upload(req, res, (err) => {
        if (err) {
            if (err.code == 'LIMIT_FILE_SIZE') {
                res.send({
                    code: '500',
                    msg: '上传失败，文件过大',
                })
            } else if (err.code == 'LIMIT_FILE_TYPES') {
                res.send({
                    code: '500',
                    msg: '文件类型不合法',
                })
            } else if (err.code == 'ENOENT') {
                res.send({
                    code: '500',
                    msg: '权限不足',
                })
            } else {
                res.send({
                    code: '500',
                    msg: '其他错误',
                    Error: err
                })
            }
        } else {
            //将文件名单独拿出来
            next()
        }
    })
};

// 修改轮播图
router.post('/updateSwiper', uploadFilesFun, (req, res) => {
    let icon = []
    req.files.forEach((item, index) => {
        icon.push('/public/swiper/' + item.filename)
    })
    icon = icon.join(',')
    let sql = `update \`system\` set swiper='${icon}' where id=1`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        tw(res, 200, '修改成功');
    })
})

// 修改首页滚动公告
router.post('/updateNotice', (req, res) => {
    let { notice } = req.body;
    if (!isEmptyStr(notice)) {
        tw(res, 400, '参数错误');
        return;
    }
    let sql = `update \`system\` set notice='${notice}' where id=1`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        tw(res, 200, '修改成功');
    })
})

// 修改弹窗公告开关
router.post('/updatePopup', (req, res) => {
    let { popup } = req.body;
    if (popup !== 0 && popup !== 1) {
        tw(res, 400, '参数错误');
        return;
    }
    let sql = `update \`system\` set notice_switch='${popup}' where id=1`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        tw(res, 200, '修改成功,已' + (popup == 1 ? '开启' : '关闭'));
    })
})

// 修改弹窗公告内容
router.post('/updatePopupContent', (req, res) => {
    let { popupContent } = req.body;
    if (!isEmptyStr(popupContent)) {
        tw(res, 400, '参数错误');
        return;
    }
    let sql = `update \`system\` set notice_content='${popupContent}' where id=1`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        tw(res, 200, '修改成功');
    })
})

// 修改首页展示分类
router.post('/updateCategory', (req, res) => {
    let { category } = req.body;
    if (!category) {
        tw(res, 400, '参数错误');
        return;
    }
    //将category转换为数组之后判断元素个数是否超过9个
    category = category.split(',');
    if (category.length > 9) {
        tw(res, 400, '分类数量不能超过9个');
        return;
    }
    let sql = `update \`system\` set category='${category}' where id=1`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        tw(res, 200, '修改成功');
    })
})




// 上传文件中间件
const uploadFun = (req, res, next) => {
    let storage = multer.diskStorage({
        //指定保存位置
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../public/system'))
        },
        //指定保存文件名
        filename: (req, file, cb) => {
            //处理保存文件名
            let extname = path.extname(file.originalname);
            filename = file.fieldname + "-" + Date.now() + extname;
            cb(null, filename);
        }
    })

    let limits = {
        //设置上传数量，大小
        files: 1,
        fileSize: 1024 * 1024 * 3 // 3MB
    }
    const upload = multer({
        storage: storage,
        //限制文件大小
        limits: limits,
        fileFilter: function (req, file, cb) {
            // 限制文件上传类型，仅可上传png格式图片
            if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg') {
                cb(null, true)
            } else {
                cb(null, false)
                let err = new Error();
                err.code = 'LIMIT_FILE_TYPES';
                cb(err)
            }
        }
    }).single('icon');
    upload(req, res, (err) => {
        if (err) {
            if (err.code == 'LIMIT_FILE_SIZE') {
                res.send({
                    code: '500',
                    msg: '上传失败，文件过大',
                })
            } else if (err.code == 'LIMIT_FILE_TYPES') {
                res.send({
                    code: '500',
                    msg: '文件类型不合法',
                })
            } else if (err.code == 'ENOENT') {
                res.send({
                    code: '500',
                    msg: '权限不足',
                })
            } else {
                res.send({
                    code: '500',
                    msg: '其他错误',
                    Error: err
                })
            }
        } else {
            //将文件名单独拿出来
            req.filename = req.file.filename
            next()
        }
    })
}

// 修改客服二维码
router.post('/updateQrcode', uploadFun, (req, res) => {
    let icon = '/public/system/' + req.filename;
    let sql = `update \`system\` set service_qr_code='${icon}' where id=1`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        tw(res, 200, '修改成功');
    })
})

//获取系统统计数据
router.get('/getSystemData', (req, res) => {
    //统计用户总数，订单总数，商品总数，今日新增用户数，今日新增订单数，今日新增商品数，订单实付总额。订单今日实付
    //今日优惠券使用数，优惠券使用总额，订单待发货总数，待收货总数
    // 库存低于10的商品数量
    let sql = `select 
        (select count(*) from user) as user_count,  -- 用户总数
        (select count(*) from \`order\` where to_days(create_time) = to_days(now())) as today_order_count, -- 今日新增订单数
        (select count(*) from user where to_days(create_time) = to_days(now())) as today_user_count, -- 今日新增用户数
        (select count(*) from \`order\`) as order_count, -- 订单总数
        (select count(*) from product) as product_count, -- 商品总数
        (select count(*) from product where to_days(create_time) = to_days(now())) as today_product_count, -- 今日新增商品数
        (select sum(actual_price) from \`order\` where status != 0) as order_real_price_count, -- 订单实付总额
        (select sum(actual_price) from \`order\` where to_days(create_time) = to_days(now()) and status != 0) as today_order_real_price_count, -- 今日订单实付总额
        (select count(*) from \`order\` where status = 2) as order_wait_send_count, -- 待发货总数
        (select count(*) from \`order\` where status = 3) as order_wait_receive_count, -- 待收货总数
        (select count(*) from coupon where status = 2) as coupon_use_count, -- 优惠券使用数
        (select sum(amount) from coupon where status = 2) as coupon_use_price_count, -- 优惠券使用总额
        (select count(*) from product_specification where stock < 10) as product_stock_count -- 库存低于10的商品数量
        from user;
    `
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        //遍历得到的数据，将null转换为0
        for (let key in result[0]) {
            if (result[0][key] == null) {
                result[0][key] = 0;
            }
        }
        res.send({ code: 200, msg: '获取系统统计数据成功', data: result[0] })
    })
})

//通用图片上传中间件
const uploadFunAll = (req, res, next) => {
    let storage = multer.diskStorage({
        //指定保存位置
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../public/image'))
        },
        //指定保存文件名
        filename: (req, file, cb) => {
            //处理保存文件名
            let extname = path.extname(file.originalname);
            filename = file.fieldname + "-" + Date.now() + extname;
            cb(null, filename);
        }
    })

    let limits = {
        //设置上传数量，大小
        files: 1,
        fileSize: 1024 * 1024 * 3 // 3MB
    }
    const upload = multer({
        storage: storage,
        //限制文件大小
        limits: limits,
        fileFilter: function (req, file, cb) {
            // 限制文件上传类型，仅可上传png格式图片
            if (file.mimetype == 'image/png' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/jpg') {
                cb(null, true)
            } else {
                cb(null, false)
                let err = new Error();
                err.code = 'LIMIT_FILE_TYPES';
                cb(err)
            }
        }
    }).single('file');
    upload(req, res, (err) => {
        if (err) {
            if (err.code == 'LIMIT_FILE_SIZE') {
                res.send({
                    code: '500',
                    msg: '上传失败，文件过大',
                })
            } else if (err.code == 'LIMIT_FILE_TYPES') {
                res.send({
                    code: '500',
                    msg: '文件类型不合法',
                })
            } else if (err.code == 'ENOENT') {
                res.send({
                    code: '500',
                    msg: '权限不足',
                })
            } else {
                res.send({
                    code: '500',
                    msg: '其他错误',
                    Error: err
                })
            }
        } else {
            //将文件名单独拿出来
            req.filename = req.file.filename
            next()
        }
    })
}
//通用文件上传接口
router.post('/uploadFile', uploadFunAll, (req, res) => {
    let url = '/public/image/' + req.filename;
    res.send({ code: 200, msg: '上传成功', data: url })
})



router.get('/orders/count', (req, res) => {
    // 创建SQL查询
    const sql = `
    SELECT DATE(create_time) AS date, COUNT(*) AS count
    FROM \`order\`
    WHERE create_time >= NOW() - INTERVAL 30 DAY
    GROUP BY DATE(create_time)
  `;

    // 执行SQL查询
    db.query(sql, (err, results) => {
        if (err) throw err;

        // 创建一个日期数组，包含过去30天的每一天
        const dates = Array.from({ length: 30 }, (v, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        // 遍历日期数组，对于每一天，如果在查询结果中找到了对应的记录，就使用查询到的订单数量，否则使用0
        const counts = dates.map(date => {
            const result = results.find(result => result.date === date);
            return {
                date,
                count: result ? result.count : 0
            };
        });

        // 将结果发送回客户端
        res.send({
            code: 200,
            msg: '获取订单数量变化成功',
            data: counts
        })
    });
});

//获取未读消息条数
router.get('/getUnreadMsgCount', (req, res) => {
    let sql = `select count(*) as count from system_message where isread = 0`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        res.send({ code: 200, msg: '获取未读消息条数成功', data: result[0].count })
    })
})

//获取消息列表，排序要求：未读消息在前，已读消息在后，按时间倒序，支持分页
router.get('/getMsgList', (req, res) => {
    let { page, limit } = req.query;
    page = isEmptyStr(page) ? page : 1;
    limit = isEmptyStr(limit) ? limit : 10;
    let sql = `select * from system_message order by isread asc,create_time desc limit ${(page - 1) * limit},${limit}`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        let sql = `select count(*) as count from system_message`;
        db.query(sql, (err, result2) => {
            if (err) {
                sqlerr(res, err);
                return;
            }
            res.send({ code: 200, msg: '获取消息列表成功', data: result, total: result2[0].count })
        })
    })
})

//消息标记为已读，支持多个
router.post('/readMsg', (req, res) => {
    let { id } = req.body;
    if (!id) {
        tw(res, 400, '参数错误');
        return;
    }
    let sql = `update system_message set isread = 1 where id in (${id})`;
    db.query(sql, (err, result) => {
        if (err) {
            sqlerr(res, err);
            return;
        }
        tw(res, 200, '标记成功');
    })
})


module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../link/link.js');
const multer = require('multer');
const path = require('path');

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

function getUuid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    let uuid = []
    let i
    radix = radix || chars.length
    if (len) {
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
    } else {
        let r
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
        uuid[14] = '4'
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r]
            }
        }
    }
    return uuid.join('')
}

// 上传文件中间件
const uploadFun = (req, res, next) => {
    let filename = ''
    let storage = multer.diskStorage({
        //指定保存位置
        destination: (req, file, cb) => {
            let address = '../public'
            //如果请求来自于/addProductClassification接口，则保存到商品分类图标文件夹
            if (req.route.path == '/addProductClassification' || req.route.path == '/modifyProductClassification/icon') {
                address = '../public/class_icon'
            }
            cb(null, path.join(__dirname, address))
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
            try {
                req.filename = filename
                if (filename == '') return res.send({
                    code: '500',
                    msg: '文件上传失败',
                    // Error: err
                })
            } catch (error) {
                console.log(error);
                return res.send({
                    code: '500',
                    msg: '文件上传失败',
                    // Error: err
                })
            }
            next()
        }
    })
}



//添加商品分类
router.post('/addProductClassification', uploadFun, (req, res) => {
    let name = req.body.name;
    let icon = '/public/class_icon/' + req.filename
    if (!isEmptyStr(name)) return tw(res, 400, '请输入完整')
    //分类名称不可重复
    let sqlectSql = `select * from product_category where name = '${name}'`;
    db.query(sqlectSql, (err, result) => {
        if (err) return sqlerr(res, err)
        if (result.length > 0) return tw(res, 400, '该分类已存在')

        let sql = `insert into product_category (name, icon,create_time) values ('${name}', '${icon}',now())`;
        db.query(sql, (err, result) => {
            if (err) return sqlerr(res, err)
            tw(res, 200, '添加成功')
        })
    })
})


// 获取商品分类
router.get('/productClassificationList', (req, res) => {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    let name = req.query.name || '';
    let sqlinit = `
    select *,
        (select count(*) from product where category_id = product_category.id) as commodity_count,
        (select IF(FIND_IN_SET(product_category.id, category) > 0, 1, 0) from \`system\` where id = 1) as is_included
    from product_category
`;
    if (isEmptyStr(name)) {
        sqlinit += `where name like '%${name}%' `
    }
    let sql = sqlinit + ` limit ${(page - 1) * limit},${limit}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err)
        let sql2 = `select count(*) as total from product_category `;
        if (isEmptyStr(name)) {
            sql2 += `where name like '%${name}%' `
        }
        db.query(sql2, (err, result2) => {
            if (err) return sqlerr(res, err)
            res.send({
                code: 200,
                msg: '获取成功',
                data: result,
                total: result2[0].total
            })
        })
    })
})

//修改商品分类名称
router.put('/modifyProductClassification/name', (req, res) => {
    let { name, id } = req.body;
    if (!isEmptyStr(name)) return tw(res, 400, '请输入要修改的名称')
    let sql = `update product_category set name = '${name}' where id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err)
        tw(res, 200, '修改成功')
    })
})

//修改商品分类图片
router.post('/modifyProductClassification/icon', uploadFun, (req, res) => {
    let icon = '/public/class_icon/' + req.filename
    let id = req.body.id;
    let sql = `update product_category set icon = '${icon}' where id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err)
        tw(res, 200, '修改成功')
    })
})

//删除商品分类
router.delete('/deleteProductClassification', (req, res) => {
    let id = req.query.id;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择要删除的商品分类')

    // 删除 product_category 表中的记录
    let deleteCategorySql = `DELETE FROM product_category WHERE id = ${id}`;

    db.query(deleteCategorySql, (deleteCategoryErr, deleteCategoryResult) => {
        if (deleteCategoryErr) return sqlerr(res, deleteCategoryErr);

        // 更新 product 表中的记录，将 category_id 置为 0
        let updateProductSql = `UPDATE product SET category_id = 0 WHERE category_id = ${id}`;

        db.query(updateProductSql, (updateProductErr, updateProductResult) => {
            if (updateProductErr) return sqlerr(res, updateProductErr);

            // Both queries executed successfully
            tw(res, 200, '删除成功');
        });
    });
});


const uploadFilesFun = (req, res, next) => {


    let storage = multer.diskStorage({
        //指定保存位置
        destination: (req, file, cb) => {
            cb(null, path.join(__dirname, '../public/product_icon'))
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


//管理员添加商品
router.post('/addProduct', uploadFilesFun, (req, res) => {
    let uuid = getUuid(16, 16);
    let views = 0, actual_sales = 0, status = 0, category_id = 0;
    let sales = req.body.sales || 0;
    let popularity = req.body.popularity || 0;
    let postage = req.body.postage || 0;
    let { name, category, brief, description } = req.body;
    if (!isEmptyStr(name) || !isEmptyStr(category) || !isEmptyStr(brief) || !isEmptyStr(description)) return tw(res, 400, '请输入完整')
    let icon = []
    req.files.forEach((item, index) => {
        icon.push('/public/product_icon/' + item.filename)
    })
    icon = icon.join(',')
    let sql = `insert into product (uuid,category,name,category_id,icon,brief,description,views,actual_sales,status,sales,popularity,create_time,update_time,postage) values ('${uuid}','${category}','${name}',${category_id},'${icon}','${brief}','${description}',${views},${actual_sales},${status},${sales},${popularity},now(),now(),${postage})`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err)
        res.send({
            code: 200,
            msg: '添加成功',
            id: result.insertId
        })
    })
})

// 管理员创建商品规格
router.post('/addProductSpecifications', (req, res) => {
    let { product_id, name, value, stock } = req.body;
    if (!isEmptyStr(product_id) || !isEmptyStr(name) || !isEmptyStr(value) || !isEmptyStr(stock)) return tw(res, 400, '请输入完整')
    let sql = `insert into product_specification (product_id,name,value,stock) values (${product_id},'${name}',${value},${stock})`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err)
        tw(res, 200, '添加成功')
    })
})

// 管理员修改商品规格
router.put('/modifyProductSpecifications', (req, res) => {
    let { id, name, value, stock } = req.body;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择修改规格')
    if (!isEmptyStr(name) && !isEmptyStr(value) && !isEmptyStr(stock)) return tw(res, 400, '请输入要修改的内容')
    let querySql = `select * from product_specification where id = ${id}`;
    db.query(querySql, (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length == 0) return tw(res, 400, '该商品规格不存在');
        name = isEmptyStr(name) ? name : result[0].name;
        value = isEmptyStr(value) ? value : result[0].value;
        stock = isEmptyStr(stock) ? stock : result[0].stock;
        let sql = `update product_specification set name = '${name}',value = ${value},stock = ${stock} where id = ${id}`;
        db.query(sql, (err, result) => {
            if (err) return sqlerr(res, err);
            tw(res, 200, '修改成功');
        })
    })
})

// 管理员删除商品规格
router.delete('/deleteProductSpecifications', (req, res) => {
    let id = req.query.id;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择要删除的商品规格')
    let sql = `delete from product_specification where id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        tw(res, 200, '删除成功');
    })
})

// 管理员获取商品规格列表
router.get('/productSpecificationsList', (req, res) => {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    let product_id = req.query.product_id || '';
    let sqlinit = 'select * from product_specification '
    if (isEmptyStr(product_id)) {
        sqlinit += `where product_id = ${product_id} `
    }
    let sql = sqlinit + ` limit ${(page - 1) * limit},${limit}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err)
        let sql2 = `select count(*) as total from product_specification `;
        if (isEmptyStr(product_id)) {
            sql2 += `where product_id = ${product_id} `
        }
        db.query(sql2, (err, result2) => {
            if (err) return sqlerr(res, err)
            res.send({
                code: 200,
                msg: '获取成功',
                data: result,
                total: result2[0].total
            })
        })
    })
})

// 一键补充库存
router.post('/supplementStock', (req, res) => {
    // 接受四个参数，商品id（多个使用半角逗号分隔），商品规格id（多个使用半角都和分隔），补充到的库存数量，随机差值
    //以上参数均为可选，补充到的库存数量默认为100，随机差值默认为0，传入则使用传入的值，如果传入了随机差值，则补充到的库存数量为库存数量 + 0至随机差值中的随机数
    //如果不传入商品id且不传入商品规格id，则补充所有商品的库存
    //如果传入商品id且不传入商品规格id，则补充商品id对应的商品的所有库存
    //如果传入商品规格id且不传入商品id，则补充商品规格id对应的商品的所有库存
    //如果传入商品id且传入商品规格id，则补充商品id对应的商品的商品规格id对应的商品的库存

    let product_id = req.body.product_id || null;
    let specification_id = req.body.specification_id || null;
    let stock = req.body.stock || 100;
    let random = req.body.random || 0;

    // 修正isEmptyStr函数的逻辑
    function isEmptyStr(s) {
        if (s == null || s === '') {
            return true;
        }
        return false;
    }

    let sql = '';
    if (!isEmptyStr(product_id) && !isEmptyStr(specification_id)) {
        sql = `update product_specification set stock = stock + ${stock}`;
        sql += random > 0 ? ` + floor(rand()*${random})` : '';
        sql += ` where product_id in (${product_id}) and id in (${specification_id})`;
    } else if (!isEmptyStr(product_id) && isEmptyStr(specification_id)) {
        sql = `update product_specification set stock = stock + ${stock}`;
        sql += random > 0 ? ` + floor(rand()*${random})` : '';
        sql += ` where product_id in (${product_id})`;
    } else if (isEmptyStr(product_id) && !isEmptyStr(specification_id)) {
        sql = `update product_specification set stock = stock + ${stock}`;
        sql += random > 0 ? ` + floor(rand()*${random})` : '';
        sql += ` where id in (${specification_id})`;
    } else {
        // 如果 product_id 和 specification_id 都为空，则更新所有记录
        sql = `update product_specification set stock = stock + ${stock}`;
        sql += random > 0 ? ` + floor(rand()*${random})` : '';
    }

    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        tw(res, 200, '补充成功');
    });
})


//管理员获取商品列表
router.get('/productList', (req, res) => {
    //分页，可按照商品分类查看，同属输出该商品的所有规格
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    let category_id = req.query.category_id || '';
    let sqlinit = 'select *,(select count(*) from product_specification where product_id = product.id) as specification_count  from product '
    if (isEmptyStr(category_id)) {
        sqlinit += `where category_id = ${category_id} `
    }
    let sql = sqlinit + ` limit ${(page - 1) * limit},${limit}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err)
        let sql2 = `select count(*) as total from product `;
        if (isEmptyStr(category_id)) {
            sql2 += `where category_id = ${category_id} `
        }
        db.query(sql2, (err, result2) => {
            if (err) return sqlerr(res, err)
            res.send({
                code: 200,
                msg: '获取成功',
                data: result,
                total: result2[0].total
            })
        })
    })
})


//管理员获取商品详情
router.get('/productDetails', (req, res) => {
    let id = req.query.id;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择要查看的商品')
    let sql = `select *,(select name from product_category where id = product.category_id) as category_name  from product where id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        let sql2 = `select * from product_specification where product_id = ${id}`;
        db.query(sql2, (err, result2) => {
            if (err) return sqlerr(res, err);
            res.send({
                code: 200,
                msg: '获取成功',
                data: result[0],
                specification: result2
            })
        })
    })
})

//管理员搜索商品
router.get('/searchProduct', (req, res) => {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    //支持按照uuid，商品名称，商品分类，简介，标签搜索，支持模糊搜索，搜索条件不会叠加，搜索参数可选但是至少有一个
    //如果是分类搜索，则传入分类名称，需要在product_category表中查询出分类id，然后在product表中查询出分类id对应的商品

    let uuid = req.query.uuid || '';
    let name = req.query.name || '';
    let category_class = req.query.category_class || ''; //分类名称
    let brief = req.query.brief || '';
    let category = req.query.category || ''; //标签
    let sqlinit = 'select *,(select count(*) from product_specification where product_id = product.id) as specification_count from product ';

    let conditions = [];

    if (isEmptyStr(uuid)) {
        conditions.push(`uuid like '%${uuid}%'`);
    }

    if (isEmptyStr(name)) {
        conditions.push(`name like '%${name}%'`);
    }

    if (isEmptyStr(brief)) {
        conditions.push(`brief like '%${brief}%'`);
    }

    if (isEmptyStr(category)) {
        conditions.push(`category like '%${category}%'`);
    }

    if (isEmptyStr(category_class)) {
        let sql = 'SELECT id FROM product_category WHERE name LIKE ?';
        db.query(sql, [`%${category_class}%`], (err, result) => {
            let id = -1
            if (result.length > 0) id = result[0].id
            conditions.push(`category_id = ${id}`);

            if (conditions.length > 0) {
                sqlinit += 'where ' + conditions.join(' and ');
            }

            let sql = `${sqlinit} limit ${(page - 1) * limit},${limit}`;
            db.query(sql, (err, result) => {
                if (err) return sqlerr(res, err);

                let sql2 = `select count(*) as total from product `;
                if (conditions.length > 0) {
                    sql2 += 'where ' + conditions.join(' and ');
                }

                db.query(sql2, (err, result2) => {
                    if (err) return sqlerr(res, err);
                    res.send({
                        code: 200,
                        msg: '获取成功',
                        data: result,
                        total: result2[0].total
                    });
                });
            });
        });
    } else {
        if (conditions.length > 0) {
            sqlinit += 'where ' + conditions.join(' and ');
        }

        let sql = `${sqlinit} limit ${(page - 1) * limit},${limit}`;
        db.query(sql, (err, result) => {
            if (err) return sqlerr(res, err);

            let sql2 = `select count(*) as total from product `;
            if (conditions.length > 0) {
                sql2 += 'where ' + conditions.join(' and ');
            }

            db.query(sql2, (err, result2) => {
                if (err) return sqlerr(res, err);
                res.send({
                    code: 200,
                    msg: '获取成功',
                    data: result,
                    total: result2[0].total
                });
            });
        });
    }


});


//管理员修改商品信息
router.put('/modifyProduct', (req, res) => {
    let { id, name, category, brief, description, views, sales, status, postage, popularity } = req.body;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择要修改的商品')
    if (!isEmptyStr(name) && !isEmptyStr(category) && !isEmptyStr(brief) && !isEmptyStr(description) && !isEmptyStr(views) && !isEmptyStr(sales) && !isEmptyStr(status) && !isEmptyStr(postage) && !isEmptyStr(popularity)) return tw(res, 400, '请输入要修改的内容')
    let querySql = `select * from product where id = ${id}`;
    db.query(querySql, (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length == 0) return tw(res, 400, '该商品不存在');
        name = isEmptyStr(name) ? name : result[0].name;
        category = isEmptyStr(category) ? category : result[0].category;
        brief = isEmptyStr(brief) ? brief : result[0].brief;
        description = isEmptyStr(description) ? description : result[0].description;
        views = isEmptyStr(views) ? views : result[0].views;
        sales = isEmptyStr(sales) ? sales : result[0].sales;
        status = isEmptyStr(status) ? status : result[0].status;
        postage = isEmptyStr(postage) ? postage : result[0].postage;
        popularity = isEmptyStr(popularity) ? popularity : result[0].popularity;
        let sql = `update product set name = '${name}',category = '${category}',brief = '${brief}',description = '${description}',views = ${views},sales = ${sales},status = ${status},postage = ${postage},popularity = ${popularity},update_time=now() where id = ${id}`;
        db.query(sql, (err, result) => {
            if (err) return sqlerr(res, err);
            tw(res, 200, '修改成功');
        })
    })
})


// 管理员修改商品图片
router.post('/modifyProductIcon', uploadFilesFun, (req, res) => {
    let icon = []
    req.files.forEach((item, index) => {
        icon.push('/public/product_icon/' + item.filename)
    })
    icon = icon.join(',')
    let id = req.body.id;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择要修改的商品')
    let sql = `update product set icon = '${icon}' where id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err)
        tw(res, 200, '修改成功')
    })
})


//管理修改商品的分类
router.put('/modifyProductCategory', (req, res) => {
    let { id, category_id } = req.body;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择要修改的商品')
    if (!isEmptyStr(category_id)) return tw(res, 400, '请选择要修改的分类')
    let querySql = `select * from product where id = ${id}`;
    db.query(querySql, (err, result) => {
        if (err) return sqlerr(res, err);
        if (result.length == 0) return tw(res, 400, '该商品不存在');
        let sql = `update product set category_id = ${category_id} where id = ${id}`;
        db.query(sql, (err, result) => {
            if (err) return sqlerr(res, err);
            tw(res, 200, '修改成功');
        })
    })
})


//管理员删除商品
router.delete('/deleteProduct', (req, res) => {
    let id = req.query.id;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择要删除的商品')
    //删除商品表记录的同时，删除商品规格表中的记录
    let sql = `delete from product_specification where product_id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        let sql2 = `delete from product where id = ${id}`;
        db.query(sql2, (err, result) => {
            if (err) return sqlerr(res, err);
            tw(res, 200, '删除成功');
        })
    })
})

//管理员发布商品评论
router.post('/addProductComment', (req, res) => {
    let { product_id, user_id, content, star, is_anonymous } = req.body;
    if (!isEmptyStr(product_id) || !isEmptyStr(user_id) || !isEmptyStr(content) || !isEmptyStr(star)) return tw(res, 400, '请输入完整')
    if (star < 0 || star > 5) return tw(res, 400, '评分范围为0-5')
    let sql = `insert into product_comment (product_id,user_id,content,star,is_anonymous,create_time) values (${product_id},${user_id},'${content}',${star},${is_anonymous},now())`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err)
        tw(res, 200, '发布成功')
    })
})


//管理员查看商品评价
router.get('/productCommentList', (req, res) => {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    let product_id = req.query.product_id || '';
    let sqlinit = `select *,
(select uuid from product where id = product_comment.product_id ) as product_uuid ,
(select name from product where id = product_comment.product_id ) as product_name ,
(select brief from product where id = product_comment.product_id ) as product_brief,
(select icon from product where id = product_comment.product_id ) as product_icon,
(select uuid from user where id = product_comment.user_id ) as user_uuid,
(select category from product where id = product_comment.product_id ) as product_category from product_comment `
    if (isEmptyStr(product_id)) {
        sqlinit += `where product_id = ${product_id} `
    }
    let sql = sqlinit + ` limit ${(page - 1) * limit},${limit}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err)
        let sql2 = `select count(*) as total from product_comment `;
        if (isEmptyStr(product_id)) {
            sql2 += `where product_id = ${product_id} `
        }
        db.query(sql2, (err, result2) => {
            if (err) return sqlerr(res, err)
            res.send({
                code: 200,
                msg: '获取成功',
                data: result,
                total: result2[0].total
            })
        })
    })
})


//管理员获取商品评价详情
router.get('/productCommentDetails', (req, res) => {
    let id = req.query.id;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择要查看的商品评价')
    let sql = `select *,
(select uuid from product where id = product_comment.product_id ) as product_uuid ,
(select name from product where id = product_comment.product_id ) as product_name ,
(select brief from product where id = product_comment.product_id ) as product_brief,
(select icon from product where id = product_comment.product_id ) as product_icon,
(select category from product where id = product_comment.product_id ) as product_category
from product_comment where id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        res.send({
            code: 200,
            msg: '获取成功',
            data: result[0]
        })
    })
})

//管理员修改商品评价
router.put('/modifyProductComment', (req, res) => {
    let { id, content, star, is_anonymous } = req.body;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择要修改的商品评价')
    if (!isEmptyStr(content) && !isEmptyStr(star) && !isEmptyStr(is_anonymous)) return tw(res, 400, '请输入要修改的内容')
    if (!isEmptyStr(star) && (star < 0 || star > 5)) return tw(res, 400, '评分范围为0-5')
    let querySql = `select * from product_comment where id = ${id}`;
    db.query(querySql, (err, result) => {
        content = isEmptyStr(content) ? content : result[0].content;
        star = isEmptyStr(star) ? star : result[0].star;
        is_anonymous = isEmptyStr(is_anonymous) ? is_anonymous : result[0].is_anonymous;
        let sql = `update product_comment set content = '${content}',star = ${star},is_anonymous = ${is_anonymous} where id = ${id}`;
        db.query(sql, (err, result) => {
            if (err) return sqlerr(res, err);
            tw(res, 200, '修改成功');
        })
    })
})

//管理员删除商品评价
router.delete('/deleteProductComment', (req, res) => {
    let id = req.query.id;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择要删除的商品评价')
    let sql = `delete from product_comment where id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        tw(res, 200, '删除成功');
    })
})

//添加优惠券
router.post('/addCoupon', (req, res) => {
    let { user_id, name, amount, min, start_time, end_time, status } = req.body;
    status = isEmptyStr(status) ? status : 0;
    min = isEmptyStr(min) ? min : 0;
    user_id = isEmptyStr(user_id) ? user_id : 0;
    if (!isEmptyStr(name) || !isEmptyStr(amount) || !isEmptyStr(start_time) || !isEmptyStr(end_time)) return tw(res, 400, '请输入完整')
    if (min < 0) return tw(res, 400, '最低消费金额不能小于0')
    if (amount <= 0) return tw(res, 400, '优惠金额不能等于小于0')
    //传入的时间格式为yyyy-mm-dd hh:mm:ss，判断结束时间是否大于开始时间
    let start = new Date(start_time).getTime();
    let end = new Date(end_time).getTime();
    if (end <= start) return tw(res, 400, '结束时间不能小于开始时间')
    if (user_id == 0) {
        //所有用户发放优惠券
        let userSql = `select id from user`;
        db.query(userSql, (err, result) => {
            if (err) return sqlerr(res, err)
            result.forEach((item, index) => {
                let sql = `insert into coupon (user_id,name,amount,min,start_time,end_time,status,create_time) values (${item.id},'${name}',${amount},${min},'${start_time}','${end_time}',${status},now())`;
                db.query(sql, (err, result) => {
                    if (err) return sqlerr(res, err)
                })
            })
            tw(res, 200, '添加成功')
        })

    } else {
        //单个用户发放优惠券
        let sql = `insert into coupon (user_id,name,amount,min,start_time,end_time,status,create_time) values (${user_id},'${name}',${amount},${min},'${start_time}','${end_time}',${status},now())`;
        db.query(sql, (err, result) => {
            if (err) return sqlerr(res, err)
            tw(res, 200, '添加成功')
        })
    }
})

//修改优惠券
router.put('/modifyCoupon', (req, res) => {
    let { id, user_id, name, amount, min, start_time, end_time, status } = req.body;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择要修改的优惠券')
    if (!isEmptyStr(user_id) && !isEmptyStr(name) && !isEmptyStr(amount) && !isEmptyStr(min) && !isEmptyStr(start_time) && !isEmptyStr(end_time) && !isEmptyStr(status)) return tw(res, 400, '请输入要修改的内容')
    let querySql = `select * from coupon where id = ${id}`;
    db.query(querySql, (err, result) => {
        user_id = isEmptyStr(user_id) ? user_id : result[0].user_id;
        name = isEmptyStr(name) ? name : result[0].name;
        amount = isEmptyStr(amount) ? amount : result[0].amount;
        min = isEmptyStr(min) ? min : result[0].min;
        start_time = isEmptyStr(start_time) ? start_time : result[0].start_time;
        end_time = isEmptyStr(end_time) ? end_time : result[0].end_time;
        status = isEmptyStr(status) ? status : result[0].status;
        if (min <= 0) return tw(res, 400, '最低消费金额不能小于0')
        if (amount <= 0) return tw(res, 400, '优惠金额不能小于0')
        //传入的时间格式为yyyy-mm-dd hh:mm:ss，判断结束时间是否大于开始时间
        let start = new Date(start_time).getTime();
        let end = new Date(end_time).getTime();
        if (end <= start) return tw(res, 400, '结束时间不能小于开始时间')
        let sql = `update coupon set user_id = ${user_id},name = '${name}',amount = ${amount},min = ${min},start_time = '${start_time}',end_time = '${end_time}',status = ${status} where id = ${id}`;
        db.query(sql, (err, result) => {
            if (err) return sqlerr(res, err);
            tw(res, 200, '修改成功');
        })
    })
})

// 删除优惠券
router.delete('/deleteCoupon', (req, res) => {
    let id = req.query.id;
    if (!isEmptyStr(id)) return tw(res, 400, '请选择要删除的优惠券')
    let sql = `delete from coupon where id = ${id}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err);
        tw(res, 200, '删除成功');
    })
})

// 获取优惠券列表
router.get('/couponList', (req, res) => {
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;
    let status = req.query.status
    let user_id = req.query.user_id
    let sqlinit = `select *,
       (select uuid from user where id = coupon.user_id) as user_uuid,
       (select username from user where id = coupon.user_id) as user_name,
       (select phone from user where id = coupon.user_id) as user_phone
    from coupon where 1=1  `
    if (isEmptyStr(status)) {
        sqlinit += `and status = ${status} `
    }
    if (isEmptyStr(user_id)) {
        sqlinit += `and user_id = ${user_id} `
    }
    let sql = sqlinit + ` limit ${(page - 1) * limit},${limit}`;
    db.query(sql, (err, result) => {
        if (err) return sqlerr(res, err)
        let sql2 = `select count(*) as total from coupon where 1=1  `;
        if (isEmptyStr(status)) {
            sql2 += `and status = ${status} `
        }
        if (isEmptyStr(user_id)) {
            sql2 += `and user_id = ${user_id} `
        }
        db.query(sql2, (err, result2) => {
            if (err) return sqlerr(res, err)
            res.send({
                code: 200,
                msg: '获取成功',
                data: result,
                total: result2[0].total
            })
        })
    })
})


module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../link/link.js');
const config = require('../pay_config.js');

const jwt = require('jsonwebtoken');

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

var crypto = require('crypto');
const enc = require('../enc.js');

function WXBizDataCrypt(appId, sessionKey) {
    this.appId = appId
    this.sessionKey = sessionKey
}

WXBizDataCrypt.prototype.decryptData = function (encryptedData, iv) {
    // base64 decode
    var sessionKey = new Buffer(this.sessionKey, 'base64')
    encryptedData = new Buffer(encryptedData, 'base64')
    iv = new Buffer(iv, 'base64')

    try {
        // 解密
        var decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
        // 设置自动 padding 为 true，删除填充补位
        decipher.setAutoPadding(true)
        var decoded = decipher.update(encryptedData, 'binary', 'utf8')
        decoded += decipher.final('utf8')

        decoded = JSON.parse(decoded)

    } catch (err) {
        throw new Error('Illegal Buffer')
    }

    if (decoded.watermark.appid !== this.appId) {
        throw new Error('Illegal Buffer')
    }

    return decoded
}

//登录
router.post('/login', (req, res) => {

    let { code, username } = req.body;

    let appid = config.appid;//自己小程序后台管理的appid，可登录小程序后台查看
    let secret = config.secret;//小程序后台管理的secret，可登录小程序后台查看
    let grant_type = "authorization_code";// 授权（必填）默认值

    //请求获取openid
    let url = "https://api.weixin.qq.com/sns/jscode2session?grant_type=" + grant_type + "&appid=" + appid + "&secret=" + secret + "&js_code=" + code;

    let openid, sessionKey;

    let https = require("https");

    https.get(url, (ress) => {
        ress.on('data', (d) => {
            // console.log('返回的信息: ', JSON.parse(d));
            openid = JSON.parse(d).openid;//得到openid
            sessionKey = JSON.parse(d).session_key;//得到session_key
            username = isEmptyStr(username) ? username : openid;


            let querySql = "select * from user where openid = ?";
            let querySqlParams = [openid];
            db.query(querySql, querySqlParams, (err, result) => {
                if (err) return sqlerr(res, err);
                if (result.length == 0) {
                    //注册且登录
                    let insterSql = "insert into user (uuid,username,session_key,openid,phone,create_time) values (?,?,?,?,?,now())";
                    let uuid = getUuid(16, 16)

                    let insterSqlParams = [uuid, username, sessionKey, openid, '未绑定'];
                    db.query(insterSql, insterSqlParams, (err, result) => {
                        if (err) return sqlerr(res, err);
                        let data = {
                            uuid: uuid,
                            openid: openid,
                            id: result.insertId
                        }
                        let token = jwt.sign(data, 'moyc^_^', { expiresIn: 60 * 60 * 24 * 7 });
                        res.send({
                            code: 200,
                            msg: '登录成功',
                            token: token,
                            openid: openid
                        })
                    })

                } else {
                    //登录
                    let data = {
                        uuid: result[0].uuid,
                        openid: result[0].openid,
                        id: result[0].id
                    }
                    let token = jwt.sign(data, 'moyc^_^', { expiresIn: 60 * 60 * 24 * 7 });
                    let updateSql = "update user set session_key = ? where openid = ?";
                    let updateSqlParams = [sessionKey, openid];
                    db.query(updateSql, updateSqlParams, (err, result) => {
                        if (err) return sqlerr(res, err);
                    })
                    res.send({
                        code: 200,
                        msg: '登录成功',
                        token: token,
                        openid: result[0].openid,
                    })
                }
            })

        }).on('error', (e) => {
            console.error(e);
            tw(res, 500, '服务器错误');
        });
    });
})


// 绑定手机号
router.post('/bindPhone', (req, res) => {

    let { encryptedData, openid, iv } = req.body;

    let querySql = "select * from user where openid = ?";
    db.query(querySql, [openid], (err, result) => {
        if (err) return sqlerr(res, err);

        if (result.length == 0) return tw(res, 400, '用户不存在');
        if (!isEmptyStr(encryptedData)) return tw(res, 400, '数据错误');
        if (!isEmptyStr(iv)) return tw(res, 400, '数据错误');
        let pc = new WXBizDataCrypt(config.appid, result[0]?.session_key);
        let data = pc.decryptData(encryptedData, iv);

        let phoneNumber = data.phoneNumber;

        let updateSql = "update user set phone = ?,status = 0 where openid = ?";
        let updateSqlParams = [phoneNumber, openid];

        db.query(updateSql, updateSqlParams, (err, result) => {
            if (err) return sqlerr(res, err);
            res.send({
                code: 200,
                msg: '绑定成功',
            })
        })
    })
})


//判断token是否失效
router.get('/checkLogin', (req, res) => {
    return tw(res, 200, '登录中')
})

module.exports = router;
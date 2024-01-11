const config = require('./pay_config.js');
const request = require('request')
const fs = require('fs')

request.get({
    uri: 'https://api.weixin.qq.com/cgi-bin/token',
    json: true,
    qs: {
        grant_type: 'client_credential',
        appid: config.appid,
        secret: config.secret
    }
}, (err, res, body) => {
    if (err) {
        console.log(err)
        return
    }

    if(!body.access_token){
        return console.log('获取access_token失败，请检查appid和secret是否正确') 
    }
    let token = body.access_token
    //写入./token.txt
    fs.writeFile('./token.txt', token, (err) => {
        if (err) {
            console.log(err)
            return
        }
    })
})

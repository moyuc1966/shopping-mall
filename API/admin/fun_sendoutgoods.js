const request = require('request')
const fs = require('fs')

//获取token.txt中的token
let token = fs.readFileSync('./token.txt').toString()

const sendMessage = require('./fun_sendMessage.js')

//发货功能增加微信发货对接

/*
let orderno = '' //订单号
let transaction_id = '4200002102202312195825854723' //微信支付订单号
let tracking_no = 'SF123456465' //快递单号
let item_desc = '粉色仙人掌' //商品描述
let phone = '17251049296' //收货人手机号
let openid = 'owtWl66bNnFJcB9NAZ9YAQ-f4e8M' //用户openid
let express_name = '顺丰速运' //快递公司名称
*/

module.exports = function sendModel(orderno, transaction_id, tracking_no, item_desc, phone, openid, express_name) {
    //请求接口，获取快递公司名称对应的快递公司编码
    request.get({
        url: 'https://api.weixin.qq.com/cgi-bin/express/business/delivery/getall?access_token=' + token,
    }, (err, req, body) => {
        let list = JSON.parse(body).data
        //根据公司名称，查找对应的公司ID
        let deliveryID = list.filter(item => item.delivery_name === express_name)[0].delivery_id;

        let express_company = deliveryID

        const date = new Date();
        const time = date.getFullYear() + '-' +
            ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('0' + date.getDate()).slice(-2) + 'T' +
            ('0' + date.getHours()).slice(-2) + ':' +
            ('0' + date.getMinutes()).slice(-2) + ':' +
            ('0' + date.getSeconds()).slice(-2) + '.' +
            ('00' + date.getMilliseconds()).slice(-3) + '+08:00';

        let data = {
            order_key: {
                order_number_type: 2,
                transaction_id: transaction_id
            },
            logistics_type: 1,
            delivery_mode: 1,
            shipping_list: [{
                tracking_no: tracking_no,
                item_desc: item_desc,
                express_company: express_company,
                contact: {
                    receiver_contact: phone
                }
            }],
            upload_time: time,
            payer: {
                openid: openid
            }
        }
        request.post({
            url: 'https://api.weixin.qq.com/wxa/sec/order/upload_shipping_info?access_token=' + token,
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data
        }, (err, res, rfest) => {
            if (rfest.errcode != 0) {
                console.log(orderno + '微信发货错误：' + rfest.errmsg);
                sendMessage('发货异常', '微信推送发货消息异常，请前往小程序后台手动发货，以免影响资金结算，异常原因：' + rfest.errmsg, 'error', orderno);
            }
        })

    })
}

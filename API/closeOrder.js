const config = require('./pay_config.js');
const WxPay = require('wechatpay-node-v3');
const fs = require('fs');
const request = require('superagent');
const path = require('path');

const db = require(path.join(__dirname, 'link', 'link.js'));

let pay; // 声明在 try 块之外，确保在整个作用域内可访问

try {
    const publicKeyPath = path.join(__dirname, './', config.publicKey);
    const privateKeyPath = path.join(__dirname, './', config.privateKey);

    const publicKey = fs.readFileSync(publicKeyPath);
    const privateKey = fs.readFileSync(privateKeyPath);

    const payConfig = {
        appid: config.appid,
        mchid: config.mchid,
        publicKey: publicKey,
        privateKey: privateKey,
    };
    // 创建 WxPay 实例
    pay = new WxPay(payConfig);
} catch (error) {
    console.error('Error initializing pay:', error.message);
    return
}

async function closeTimeoutOrders() {
    try {
        // 查询超过30分钟且状态为0的订单
        // 查询满足条件的订单数据
        const selectQuery = 'SELECT id, create_time, status, delete_status FROM `order` WHERE status = 0 AND TIMESTAMPDIFF(MINUTE, create_time, NOW()) > 30;';
        const selectedRows = await db.query(selectQuery);


        // 执行更新操作
        const updateQuery = 'UPDATE `order` SET delete_status = 1 WHERE status = 0 AND TIMESTAMPDIFF(MINUTE, create_time, NOW()) > 30;';
        const result = await db.query(updateQuery);

        // 判断是否有数据被更新
        if (result.affectedRows > 0) {
            // 获取被修改的数据的order_no字段值
            for (const element of selectedRows) {
                console.log(`Order ${element.order_no} has been closed.`);
                await pay.close(element.order_no);
            }
        }

        //优惠券关闭，将coupon表中end_time小于当前时间的数据的status字段值改为2
        const updateCouponQuery = 'UPDATE coupon SET status = 2 WHERE status = 1 AND end_time < NOW();';
        await db.query(updateCouponQuery);


    } catch (error) {
        console.error('Error closing orders:', error.message);
    }
}

module.exports = { closeTimeoutOrders };
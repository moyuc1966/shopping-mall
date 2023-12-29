<template>
    <view class="main">
        <view class="content">
            <view class="info-product" @click="uigoInfo(info.product_id)">
                <image v-if="info && info.product_img" :src="apiUrl() + info.product_img.split(',')[0]" mode=""></image>
                <view class="info-content">
                    <text class="name">{{info.product_name}}</text>
                    <text class="des">{{info.product_specification_name}} * {{info.count}}</text>
                    <text class="price"> <text
                            class="do">￥</text>{{(Number(info.product_specification_price)).toFixed(2)}}
                    </text>
                </view>
            </view>

            <view class="button">
                <text class="sta">{{sta}}</text>
                <view class="button-customer" @click="customer(info.order_no)">
                    联系客服
                </view>
                <view class="button-del" @click="del()">
                    {{info.status == 0 ? '取消订单' : '删除订单'}}
                </view>
                <view class="button-pay" v-if="info.status == 0" @click="pay()">
                    立即支付
                </view>
                <view class="button-confirm" v-if="info.status == 3" @click="confirmQr()">
                    确认收货
                </view>
                <view class="button-evaluate" v-if="info.status == 4" @click="evaluate()">
                    前往评价
                </view>
            </view>


            <u-line margin="20px 0"></u-line>



            <view class="item" style="margin-top: 10px;">
                <text class="label">商品总价</text>
                <text class="value">
                    <text class="price"> <text class="do">￥</text>{{(Number(info.total_price)).toFixed(2)}}
                    </text>
                </text>
            </view>
            <view class="item">
                <text class="label">邮费</text>
                <text class="value">
                    <text class="price"> <text class="do">￥</text>{{(Number(info.product_postage)).toFixed(2)}}
                    </text>
                </text>
            </view>
            <view class="item">
                <text class="label">优惠费用</text>
                <text class="value">
                    <text class="price"> <text
                            class="do">￥</text>{{(Number(info.total_price) - Number(info.actual_price)).toFixed(2)}}
                    </text>
                </text>
            </view>
            <view class="item">
                <text class="label">实付款</text>
                <text class="value">
                    <text class="price" style="color: red;font-size: 16px;"> <text class="do"
                            style="font-size: 14px;">￥</text>{{Number(info.actual_price).toFixed(2) }}
                    </text>
                </text>
            </view>
            <u-line margin="20px 0" v-if="info.express_no != null && info.status >= 3"></u-line>
            <view class="item" v-if="info.express_no != null && info.status >= 3">
                <text class="label">物流信息</text>
                <text class="value">
                    <text>{{info.express_company}}：{{info.express_no}} </text>
                    <text class="copy" @click="copy(info.express_no)"> | 复制</text>
                </text>
            </view>
            <u-line margin="20px 0"></u-line>
            <view class="item" style="align-items: flex-start;height: auto; ">
                <text class="label" style="line-height: 18px;">收货信息：</text>
                <text class="value">
                    {{info.name}}，{{info.phone}}，{{info.address}}
                </text>
            </view>


            <view class="item">
                <text class="label">订单编号：</text>
                <text class="value">
                    <text>{{info.order_no}}</text>
                    <text class="copy" @click="copy(info.order_no)"> | 复制</text>
                </text>
            </view>
            <view class="item" v-if="info.transaction_id != null && info.status >= 1">
                <text class="label">微信交易号：</text>
                <text class="value">
                    {{info.transaction_id}}
                </text>
            </view>
            <view class="item">
                <text class="label">创建时间</text>
                <text class="value">
                    {{info.create_time}}
                </text>
            </view>
            <view class="item" v-if="info.pay_time != null && info.status >= 1">
                <text class="label">支付时间</text>
                <text class="value">
                    {{info.pay_time}}
                </text>
            </view>
            <view class="item" v-if="info.express_time != null && info.status >= 2">
                <text class="label">发货时间</text>
                <text class="value">
                    {{info.express_time}}
                </text>
            </view>
            <view class="item" v-if="info.sign_time != null && info.status >= 5">
                <text class="label">成交时间</text>
                <text class="value">
                    {{info.sign_time}}
                </text>
            </view>
            <view class="item" v-if="info.remark != null">
                <text class="label">订单备注</text>
                <text class="value">
                    {{info.remark}}
                </text>
            </view>

        </view>
        <u-modal @confirm="delEva" @cancel="closeDel" @close="closeDel" :closeOnClickOverlay="true" :show="show"
            :title="popTitle" :content='popCount' :showConfirmButton="true" :showCancelButton="true"
            :buttonReverse="true"></u-modal>
        <!-- <u-modal @confirm="confirmQr" @cancel="closeqr" @close="closeqr" :closeOnClickOverlay="true" :show="qrshow"
            title="收货提示" content='确认已经收到货了吗？' :showConfirmButton="true" :showCancelButton="true"></u-modal> -->

        <view style="height: 60px; width: 100%;"></view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                id: '',
                info: {},
                show: false,
                sta: '',
                popCount: '',
                popTitle: '',
            }
        },
        onLoad(e) {
            this.id = e.id
            this.hs(true, 'get', '/api/order/orderDetail?orderId=' + this.id, '', (res) => {
                this.info = res.data.data
                let map = {
                    0: '待支付',
                    1: '待发货',
                    3: '待收货',
                    4: '待评价',
                    5: '已完成',
                    2: '待发货'
                }
                this.sta = map[this.info.status]
            })


        },
        methods: {
            uigoInfo(id) {
                uni.navigateTo({
                    url: '/pages/commodityInfo/commodityInfo?id=' + id
                })
            },
            copy(text) {
                uni.setClipboardData({
                    data: text,
                    success: function() {
                        console.log('复制成功');
                    }
                });
            },
            del() {
                if (this.info.status == 0) {
                    this.popCount = '确认要取消此订单吗，下次需要重新购买'
                    this.popTitle = '确认取消此订单吗'
                } else {
                    this.popCount = '确认要删除此订单吗，删除后数据不可恢复'
                    this.popTitle = '确认删除此订单吗'
                }
                this.show = true
            },
            closeDel() {
                this.show = false
            },
            delEva() {
                this.hs(true, 'delete', '/api/order/deleteOrder?orderId=' + this.info.id, '', (res) => {
                    if (res.data.code == 200) {
                        this.tw(res.data.msg)
                        this.show = false
                        setTimeout(() => {
                            uni.navigateBack({
                                delta: 1
                            })
                        }, 800)

                    } else {
                        this.show = false
                        this.tw(res.data.msg)
                    }
                })
            },
            customer(no) {
                uni.setClipboardData({
                    data: no,
                    success: () => {
                        this.tw('已复制订单号')
                        setTimeout(() => {
                            uni.navigateTo({
                                url: '/pages/my/customer'
                            })
                        }, 800)
                    }
                });
            },
            pay() {
                this.hs(true, 'delete', '/api/order/deleteOrder?orderId=' + this.info.id, '', (res) => {
                    if (res.data.code == 200) {
                        let data = {
                            id: this.info.product_id,
                            pid: this.info.product_specification_id,
                            count: this.info.count,
                            aid: ''
                        }
                        let pr = uni.$u.queryParams(data)
                        uni.navigateTo({
                            url: '/pages/commodityInfo/pay' + pr
                        })

                    } else {
                        this.show = false
                        this.tw('订单关闭失败')
                    }
                })
            },
            confirmQr() {
                uni.showLoading({
                    title: '加载中..'
                })
                setTimeout(function() {
                    uni.hideLoading();
                }, 1700)

                let send = () => {
                    this.hs(true, 'post', '/api/order/signOrder', {
                        orderId: this.info.id
                    }, (res) => {
                        if (res.data.code == 200) {
                            this.hs(true, 'get', '/api/order/orderDetail?orderId=' + this.id, '', (res) => {
                                this.info = res.data.data
                                let map = {
                                    0: '待支付',
                                    1: '待发货',
                                    3: '待收货',
                                    4: '待评价',
                                    5: '已完成',
                                    2: '待发货'
                                }
                                this.sta = map[this.info.status]
                            })

                        } else {
                            this.tw(res.data.msg)
                        }
                    })
                }

                if (wx.openBusinessView) {
                    let on = this.info.order_no
                    let tid = this.info.transaction_id
                    wx.openBusinessView({
                        businessType: 'weappOrderConfirm',
                        extraData: {
                            merchant_id: '1622339089',
                            merchant_trade_no: on,
                            transaction_id: tid
                        },
                        success() {
                            send()
                        },
                        fail() {
                            uni.showToast({
                                title: '微信收货异常',
                                icon: 'none'
                            })
                        }
                    });
                } else {
                    this.tw('微信版本过低')
                }

            },
            // confirmQr() {
            //     this.hs(true, 'post', '/api/order/signOrder', {
            //         orderId: this.info.id
            //     }, (res) => {
            //         if (res.data.code == 200) {
            //             this.hs(true, 'get', '/api/order/orderDetail?orderId=' + this.id, '', (res) => {
            //                 this.info = res.data.data
            //                 let map = {
            //                     0: '待支付',
            //                     1: '待发货',
            //                     3: '待收货',
            //                     4: '待评价',
            //                     5: '已完成',
            //                     2: '待发货'
            //                 }
            //                 this.sta = map[this.info.status]
            //             })
            //             this.qrshow = false

            //         } else {
            //             this.qrshow = false
            //             this.tw(res.data.msg)
            //         }
            //     })
            // },
            evaluate(index) {
                uni.navigateTo({
                    url: '/pages/my/addEvaluate?id=' + this.info.id + '&pid=' + this.info
                        .product_id
                })
            },
        }
    }
</script>

<style lang="less">
    page,
    .main {
        width: 100%;
        height: 100%;
        background-color: #F5F5F5;
    }

    .button {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        position: relative;
        padding: 8px 10px;
        padding-top: 12px;
        box-sizing: border-box;

        .sta {
            font-size: 15px;
            color: #333;
            position: absolute;
            left: 10px;
            line-height: 32px;
        }

        view {
            height: 32px;
            padding: 0 7px;
            border-radius: 16px;
            border: 1px solid #aaa;
            font-size: 14px;
            text-align: center;
            line-height: 32px;
            margin-left: 10px;
        }

        .button-pay,
        .button-evaluate,
        .button-confirm {
            color: #00B26A;
            background-color: #fff;
            border-color: #00B26A;
        }

    }

    .item {
        width: 100%;
        min-height: 35px;
        display: flex;
        box-sizing: border-box;
        justify-content: space-between;
        padding: 0 12px;
        align-items: center;
        margin-bottom: 7px;


        .label {
            width: 84px;
            line-height: 35px;
            font-size: 14px;
            color: #333;
        }

        .value {
            font-size: 14px;
            color: #aaa;
            width: calc(100% - 90px);
            text-align: right;

            .copy {
                color: #333;
                font-size: 14px;
                display: inline-block;
                margin-left: 3px;
            }
        }
    }

    .price {
        color: #333;
        font-size: 15px;
        display: inline-block;
        font-weight: bold;

        .do {
            font-size: 13px;
            display: inline-block;
        }
    }

    .content {
        width: calc(100% - 20px);
        margin-left: 10px;
        margin-top: 10px;
        border-radius: 5px;
        background-color: #fff;
        min-height: 100px;
        box-sizing: border-box;
        padding: 20px 0;

        .info-product {
            width: 100%;
            display: flex;
            padding: 5px 10px;
            box-sizing: border-box;
            padding-bottom: 15px;
            border-bottom: 1px solid #e1e1e1;
            flex-wrap: wrap;

            image {
                width: 100px;
                height: 100px;
                display: block;
                margin-right: 10px;
                border-radius: 4px;
            }

            .info-content {
                width: calc(100% - 110px);

                .name {
                    font-size: 15px;
                    color: #333;
                    line-height: 25px;
                }

                .des {
                    font-size: 13px;
                    color: #aaa;
                    display: block;
                    margin-top: 5px;
                    margin-bottom: 5px;
                }
            }

            .price {
                width: 100%;
                color: red;
                font-size: 20px;
                font-weight: 300;
                display: inline-block;

                .do {
                    font-size: 14px;
                    display: inline-block;
                }
            }
        }
    }
</style>
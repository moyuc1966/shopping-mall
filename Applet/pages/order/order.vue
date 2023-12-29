<template>
    <view>
        <u-empty v-if="!list || list.length <= 0" icon="/static/nono.png" text="还没有订单哦" marginTop="100">
        </u-empty>
        <view v-for="(item,index) in list" :key="index" class="item">
            <view class="item-content" @click="uigopInfo(item.id)">
                <image :src="apiUrl() + item.product_img.split(',')[0]" mode=""></image>
                <view class="info">
                    <text class="name">{{item.product_name}}</text>
                    <text class="spe">{{item.product_specification_name}}</text>
                </view>
                <view class="count">
                    <text class="price"> <text
                            class="do">￥</text>{{(Number(item.product_specification_price) * item.count).toFixed(2)}}
                    </text>
                    <text class="count-info">x{{item.count}}</text>
                </view>
            </view>
            <view class="autual">
                <text class="time">{{item.create_time}}</text>
                <text>实付：</text>
                <text class="price"> <text class="do">￥</text>{{(Number(item.actual_price)).toFixed(2)}}
                </text>
            </view>
            <view class="button">
                <text class="tuikuan" v-if="item.status == 6">订单已退款</text>
                <view class="button-customer" @click="customer(item.order_no)">
                    联系客服
                </view>
                <view class="button-del" @click="del(index)">
                    {{item.status == 0 ? '取消订单' : '删除订单'}}
                </view>
                <view class="button-pay" v-if="item.status == 0" @click="pay(index)">
                    立即支付
                </view>
                <view class="button-confirm" v-if="item.status == 3" @click="confirmQr(index)">
                    确认收货
                </view>
                <view class="button-evaluate" v-if="item.status == 4" @click="evaluate(index)">
                    前往评价
                </view>
            </view>

        </view>



        <u-loadmore :status="status" v-if="list && list.length >= 10" :dashed="false" marginTop="30" :line="true"
            @loadmore="loadmore" />

        <u-modal @confirm="delEva" @cancel="closeDel" @close="closeDel" :closeOnClickOverlay="true" :show="show"
            :title="popTitle" :content='popCount' :showConfirmButton="true" :showCancelButton="true"
            :buttonReverse="true"></u-modal>

        <view style="height: 60px; width: 100%;"></view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                Ostatus: '',
                page: 1,
                total: 0,
                status: 'loadmore',
                name: '',
                list: [],
                popCount: '',
                popTitle: '',
                show: false,
                index: '',
                delId: '',
                sta: '&status=',
                urla: '/api/order/orderList'
            }
        },
        onShow() {
            this.sta = '&status='
            if (this.Ostatus == 'all') {
                this.sta = ''
                this.urla = '/api/order/orderList'
            } else {
                this.sta = this.sta + this.Ostatus
                this.urla = '/api/order/orderListByStatus'
            }

            this.hs(false, 'get', `${this.urla}?limit=10&page=${this.page}${this.sta}`, '',
                (
                    res) => {
                    this.list = res.data.data
                    this.total = res.data.total
                })
        },
        onLoad(e) {
            this.Ostatus = e.status
            let map = {
                'all': '我的订单',
                0: '待支付订单',
                1: '待发货订单',
                3: '待收货订单',
                4: '待评价订单'
            }
            uni.setNavigationBarTitle({
                title: map[this.Ostatus]
            })

            // if (this.Ostatus == 'all') {
            //     this.sta = ''
            //     this.url = '/api/order/orderList'
            // } else {
            //     this.sta = this.sta + this.Ostatus
            //     this.url = '/api/order/orderListByStatus'
            // }
            // this.hs(true, 'get', `${this.url}?limit=10&page=${this.page}${this.sta}`, '', (
            //     res) => {
            //     this.list = res.data.data
            //     this.total = res.data.total
            // })
        },
        methods: {
            uigopInfo(id) {
                uni.navigateTo({
                    url: './orderInfo?id=' + id
                })
            },
            del(index) {
                this.index = index
                this.delId = this.list[index].id
                if (this.list[index].status == 0) {
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
                this.hs(true, 'delete', '/api/order/deleteOrder?orderId=' + this.list[this.index].id, '', (res) => {
                    if (res.data.code == 200) {
                        this.tw(res.data.msg)
                        let arr = this.list.filter(item => {
                            return item.id != this.delId
                        })
                        this.list = arr
                        this.show = false

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
            pay(index) {

                this.hs(true, 'delete', '/api/order/deleteOrder?orderId=' + this.list[index].id, '', (res) => {
                    if (res.data.code == 200) {
                        let data = {
                            id: this.list[index].product_id,
                            pid: this.list[index].product_specification_id,
                            count: this.list[index].count,
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
            confirmQr(index) {
                this.index = index
                this.delId = this.list[this.index].id

                uni.showLoading({
                    title: '加载中..'
                })
                setTimeout(function() {
                    uni.hideLoading();
                }, 1700)

                let send = () => {
                    this.hs(true, 'post', '/api/order/signOrder', {
                        orderId: this.list[this.index].id
                    }, (res) => {
                        if (res.data.code == 200) {
                            this.tw(res.data.msg)
                            let arr = this.list.filter(item => {
                                return item.id != this.delId
                            })
                            this.list = arr

                        } else {
                            this.tw(res.data.msg)
                        }
                    })
                }

                if (wx.openBusinessView) {
                    let on = this.list[this.index].order_no
                    let tid = this.list[this.index].transaction_id
                    wx.openBusinessView({
                        businessType: 'weappOrderConfirm',
                        extraData: {
                            merchant_id: this.$merchant_id,
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
            evaluate(index) {
                uni.navigateTo({
                    url: '/pages/my/addEvaluate?id=' + this.list[index].id + '&pid=' + this.list[index]
                        .product_id
                })
            },
            loadmore() {
                if (this.list.length >= this.total) return this.status = 'nomore'
                this.page++
                this.status = 'loading'

                if (this.Ostatus == 'all') {
                    this.sta = ''
                    this.urla = '/api/order/orderList'
                } else {
                    this.sta = this.sta + this.Ostatus
                    this.urla = '/api/order/orderListByStatus'
                }
                this.hs(false, 'get',
                    `${this.urla}?limit=10&page=${this.page}${this.sta}`,
                    '', (res) => {
                        this.list = [...this.list, ...res.data.data]
                        if (this.list.length >= this.total) {
                            this.status = 'nomore'
                        } else {
                            this.status = 'loadmore'
                        }

                    })
            }

        },
        onReachBottom() {
            if (this.list.length >= this.total) return this.status = 'nomore'
            this.page++
            this.status = 'loading'

            if (this.Ostatus == 'all') {
                this.sta = ''
                this.urla = '/api/order/orderList'
            } else {
                this.sta = this.sta + this.Ostatus
                this.urla = '/api/order/orderListByStatus'
            }
            this.hs(false, 'get',
                `${this.urla}?limit=10&page=${this.page}${this.sta}`,
                '', (res) => {
                    this.list = [...this.list, ...res.data.data]
                    if (this.list.length >= this.total) {
                        this.status = 'nomore'
                    } else {
                        this.status = 'loadmore'
                    }

                })
        }
    }
</script>

<style lang="less">
    page,
    .main {
        width: 100%;
        height: 100%;
        background: #F5F5F5;
    }

    .tuikuan {
        position: absolute;
        font-size: 13px;
        color: #aaa;
        left: 10px;
    }

    .item {
        padding: 10px 12px;
        box-sizing: border-box;
        background-color: #fff;
        margin-bottom: 15px;

        .item-content {
            width: 100%;
            display: flex;
            position: relative;
            padding-bottom: 15px;
            box-sizing: border-box;
            border-bottom: 1px solid #eaeaea;

            image {
                width: 90px;
                height: 90px;
                display: block;
                margin-right: 10px;
            }

            .info {
                width: calc(100% - 150px);

                .name {
                    font-size: 14px;
                    line-height: 24px;
                    color: #333;
                    display: block;
                    margin-bottom: 3px;
                }

                .spe {
                    font-size: 13px;
                    color: #aaa;
                }
            }

            .count {
                width: 60px;
                text-align: right;

                .price {
                    color: #333;
                    font-size: 13px;
                    display: inline-block;

                    .do {
                        font-size: 12px;
                        display: inline-block;
                    }
                }

                .count-info {
                    display: block;
                    font-size: 13px;
                    color: #aaa;
                    margin-top: 2px;
                }
            }
        }

        .autual {
            width: 100%;
            height: 35px;
            border-bottom: 1px solid #eeeeee;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            position: relative;
            font-size: 14px;
            color: #333;

            .price {
                color: red;
                font-size: 15px;
                display: inline-block;

                .do {
                    font-size: 13px;
                    display: inline-block;
                }
            }

            .time {
                display: block;
                position: absolute;
                left: 0;
                line-height: 35px;
                font-size: 13px;
                color: #aaa;
            }
        }

        .button {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            position: relative;
            padding: 8px 0;
            padding-top: 12px;

            view {
                height: 32px;
                padding: 0 7px;
                border-radius: 3px;
                border: 1px solid #aaa;
                font-size: 14px;
                text-align: center;
                line-height: 32px;
                margin-left: 10px;
            }

            .button-pay,
            .button-evaluate,
            .button-confirm {
                color: #fff;
                background-color: #00B26A;
                border-color: #00B26A;
            }

        }
    }
</style>
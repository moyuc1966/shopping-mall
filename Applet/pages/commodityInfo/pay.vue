<template>
    <view class="main">
        <u-loading-page :loading="uLoadingPageShow" loading-text="loading..."></u-loading-page>
        <view v-if="!uLoadingPageShow" class="main">
            <view class="item-address" @click="addressShowClick" v-if="info" style="margin-top: 15px;">
                <view class="icon">
                    <view class="icon-img" v-if="address.is_default == 1">
                        <image src="/static/isdef.png" mode=""></image>
                    </view>
                    <view class="icon-img" v-else>
                        <text> {{ getIcon(address.name) }}</text>
                    </view>
                </view>
                <view class="content">
                    <view class="me">
                        <text>{{ address.name }}</text>
                        <text>{{ address.phone }}</text>
                        <view class="isdef" v-if="address.is_default == 1">
                            默认
                        </view>
                    </view>
                    <text class="address">{{ address.province + (address.city == address.province ? '' : address.city) +
                        address.county + address.address_detail }}</text>
                </view>
            </view>


            <u-popup :show="addressShow" @close="addressShowClose" mode="bottom" :round="10" @click.stop="1 + 1"
                :closeable="true">
                <view class="select_sp">
                    <text class="title-address">选择收货地址</text>
                    <u-empty v-if="addressList.length <= 0" icon="/static/nono.png" text="还没有收货地址"
                        marginTop="100"></u-empty>
                    <view class="address_list">
                        <view v-for="(item, index) in addressList" class="item" :key="index">
                            <view class="icon">
                                <view class="icon-img" v-if="item.is_default == 1">
                                    <image src="/static/isdef.png" mode=""></image>
                                </view>
                                <view class="icon-img" v-else>
                                    <text> {{ getIcon(item.name) }}</text>
                                </view>
                            </view>
                            <view class="content">
                                <view class="me">
                                    <text>{{ item.name }}</text>
                                    <text>{{ item.phone }}</text>
                                    <view class="isdef" v-if="item.is_default == 1">
                                        默认
                                    </view>
                                </view>
                                <text class="address">{{ item.province + (item.city == item.province ? '' : item.city) +
                                    item.county + item.address_detail }}</text>
                            </view>
                            <view class="edit" @click="addressChange(item)">
                                <radio color="#C7EEE6" :checked="item.id === address.id" />
                            </view>
                        </view>
                    </view>

                    <view class="select_sp_model">
                        <view class="add_address" @click="addAddress()">
                            添加收货地址
                        </view>
                    </view>
                </view>
            </u-popup>
            <image class="br" src="../../static/br.png" mode=""></image>
            <view class="info">
                <image :src="apiUrl() + info.icon.split(',')[0]" mode=""></image>
                <view class="info-content">
                    <text class="name">{{ info.name }}</text>
                    <text class="des">{{ specification.name }} * {{ count }}</text>
                    <text class="price"> <text class="do">￥</text>{{ (Number(specification.price)).toFixed(2) }}
                    </text>
                </view>
            </view>

            <view class="show-item">
                <text class="label">优惠券（{{ couNum }}）</text>
                <text class="value" @click="couponShowClick"
                    :style="{ color: couponList.length == 0 ? '#333' : 'red' }">{{ couponList.length == 0 ? '暂无可用优惠券' :
                        coupon.name }}</text>
            </view>
            <view class="show-item">
                <text class="label">商品金额</text>
                <text class="value">{{ '￥' + (Number(specification.price) * count).toFixed(2) }}</text>
            </view>
            <view class="show-item">
                <text class="label">运费</text>
                <text class="value">{{ info.postage == 0 ? '免运费' : '￥' + Number(info.postage).toFixed(2) }}</text>
            </view>
            <view class="show-item">
                <text class="label">总优惠</text>
                <text class="value">￥{{ Number(couponList.length == 0 ? '0' : coupon.amount).toFixed(2) }}</text>
            </view>
            <view class="show-item" style="height: 135px;" v-if="!uLoadingPageShow">
                <text class="label">订单备注</text>
                <textarea v-model="notes" placeholder="给商家留言,最多100字" maxlength="100"
                    style="width: 100%;height: 60px;position: relative;top: -10px;"></textarea>
            </view>
            <view class="show-item">
                <text class="label">支付方式</text>
                <text class="value" style="color: #333;">在线支付</text>
            </view>

            <u-popup :show="couponShow" @close="couponShowClose" mode="bottom" :round="10" @click.stop="1 + 1"
                :closeable="true">
                <view class="select_sp">
                    <text class="title-address">选择优惠券</text>
                    <u-empty v-if="couponList.length <= 0" icon="/static/nono.png" text="还没有优惠券" marginTop="100"></u-empty>

                    <view class="address_list">
                        <view v-for="(item, index) in couponList" class="co-item" :key="index" @click="couponChange(item)"
                            :style="{
                                background: item.min > (Number((Number(specification.price) * count).toFixed(2)) + Number(Number(info
                                    .postage).toFixed(2))) ? '#f3f3f3' : 'rgba(71,200,172,0.1)'
                            }">
                            <text class="name">{{ item.name }}</text>
                            <text class="time" v-if="item.name != '不使用优惠券'">有效期：{{ item.start_time }}至{{ item.end_time }}</text>
                            <text class="price">抵扣金额：{{ Number(item.amount).toFixed(2) }}元</text>
                            <text class="price" style="display: block;"
                                v-if="item.name != '不使用优惠券'">使用要求：运费加商品费用需大于{{ Number(item.min).toFixed(2) }}元</text>
                            <text class="zanno" v-if="item.min > (Number((Number(specification.price) * count).toFixed(2)) + Number(Number(info
                                .postage).toFixed(2)))">暂不可用</text>
                        </view>
                    </view>
                </view>
            </u-popup>
            <view style="width: 100%;height: 80px;"></view>
            <view class="bottom-main" v-if="!uLoadingPageShow">
                <text class="name">待付金额：</text>
                <text class="price">
                    <text class="do">￥</text>
                    {{
                        (Number((Number((Number(specification.price) * count).toFixed(2)) -
                            Number(Number(couponList.length == 0 ? 0 : coupon.amount).toFixed(2))).toFixed(2)) + Number(
                                Number(
                                    info.postage).toFixed(2))).toFixed(2)

                    }}</text>
                <view class="button" @click="pay">
                    提交订单
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            id: '',
            pid: '',
            count: 0,
            addressId: '',
            info: {},
            specification: {},
            address: {},
            addressList: [],
            coupon: {},
            couponList: {},
            notes: '',
            uLoadingPageShow: true,
            addressShow: false,
            couponShow: false,
            couNum: 0
        }
    },
    onLoad(e) {
        this.id = e.id
        this.pid = e.pid
        this.count = e.count
        this.addressId = e.aid
    },
    onShow() {

        this.hs(true, 'get', '/api/commodity/product/' + this.id, '', (res) => {
            this.info = res.data.data
            this.specification = this.info.specification.filter(item => {
                return item.id == this.pid
            })[0]
        })

        this.hs(true, 'get', '/api/user/addressList', '', (res) => {
            this.addressList = res.data.data.sort((a, b) => b.is_default - a.is_default);
            if (res.data.data.length == 0) return this.address = {
                county: '',
                city: '',
                province: '请添加收货地址',
                address_detail: '',
                name: '还没有收货地址'
            }
            if (this.addressId == '' || this.addressId == null) {
                this.address = this.addressList[0]
                this.addressId = this.addressList[0].id
            } else {
                let arr = this.addressList.filter(item => {
                    return item.id == this.addressId
                })
                if (arr.length == 0) {
                    this.address = this.addressList[0]
                    this.addressId = this.address.id
                } else {
                    this.address = arr[0]
                    this.addressId = this.address.id
                }
            }
        })

        this.hs(true, 'get', '/api/order/couponList', '', (res) => {
            this.hs(true, 'get', '/api/order/couponList?page=1&limit=' + res.data.total, '', (res) => {
                this.couponList = res.data.data
                res.data.data.forEach(item => {
                    if (item.min <= (Number((Number(this.specification.price) * this.count)
                        .toFixed(2)) + Number(Number(this.info
                            .postage).toFixed(2)))) this.couNum++
                })
                this.uLoadingPageShow = false
                if (this.couponList.length > 0) {
                    this.couponList.unshift({
                        amount: 0,
                        name: '不使用优惠券',
                        id: 0,
                        min: 0
                    })
                }
                this.coupon = this.couponList[0]
            })
        })
    },
    methods: {
        getIcon(name) {
            return name.trim().split('')[0]
        },
        addressShowClick() {
            this.addressShow = true
        },
        addressShowClose() {
            this.addressShow = false
        },
        addAddress() {
            uni.navigateTo({
                url: '/pages/my/addAddress'
            })
        },
        addressChange(item) {
            this.address = item
            this.addressShowClose()
        },
        couponShowClick() {
            this.couponShow = true
        },
        couponShowClose() {
            this.couponShow = false
        },
        couponChange(item) {

            let price = Number((Number(this.specification.price) * this.count).toFixed(2)) + Number(Number(this.info
                .postage).toFixed(2))

            if (price < item.min) return this.tw('此优惠不满最低金额')

            if (item.amount >= price) {
                if (price == 0.01) {
                    item.amount = 0
                } else {
                    item.amount = (price - 0.01).toFixed(2)
                }
                this.coupon = item
                this.couponShow = false


            } else {
                this.coupon = item
                this.couponShow = false
            }

        },
        pay() {
            if (this.addressList.length == 0) return this.tw('请先添加收货地址')
            let data = {
                p_name: this.info.name,
                actual_price: (Number((Number((Number(this.specification.price) * this.count).toFixed(2)) -
                    Number(Number(this
                        .couponList.length == 0 ? 0 : this.coupon.amount).toFixed(2))).toFixed(2)) +
                    Number(
                        Number(
                            this.info.postage).toFixed(2))).toFixed(2) <= 0 ? 0.01 : (Number((Number((
                                Number(this
                                    .specification.price) * this.count).toFixed(2)) -
                                Number(Number(this
                                    .couponList.length == 0 ? 0 : this.coupon.amount).toFixed(2))).toFixed(2)) +
                                Number(
                                    Number(
                                        this.info.postage).toFixed(2))).toFixed(2),
                total_price: (Number(this.specification.price) * this.count).toFixed(2),
                address: this.address.province + (this.address.city == this.address.province ? '' : this.address
                    .city) + this.address.county + this.address.address_detail,
                remark: (this.notes == '' || this.notes == null) ? '无' : this.notes,
                product_id: this.id,
                product_specification_id: this.pid,
                coupon_id: this.couponList.length == 0 ? 0 : this.coupon.id,
                count: this.count,
                name: this.address.name,
                phone: this.address.phone,
            }


            this.hs(true, 'post', '/api/purchase/create', data, (res) => {
                if (res.data.code == 200) {

                    uni.requestPayment({
                        provider: 'wxpay', // 服务提提供商
                        timeStamp: res.data.data.timeStamp, // 时间戳
                        nonceStr: res.data.data.nonceStr, // 随机字符串
                        package: res.data.data.package,
                        signType: res.data.data.signType, // 签名算法
                        paySign: res.data.data.paySign, // 签名
                        success: (res) => {
                            uni.redirectTo({
                                url: './payok'
                            })
                        },
                        fail: (err) => {
                            this.tw('支付失败')
                            console.log('支付失败', err);
                        }
                    });

                } else {
                    this.tw('创建订单失败：' + res.data.msg)
                }
            })
        }
    }
}
</script>

<style lang="less">
.bottom-main {
    width: 100%;
    height: 70px;
    padding-bottom: 10px;
    position: fixed;
    bottom: 0;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: 0 10px;
    box-sizing: border-box;

    .name {
        font-size: 15px;
        color: #333;
    }

    .price {
        color: red;
        font-size: 16px;
        display: inline-block;

        .do {
            font-size: 14px;
            display: inline-block;
        }
    }

    .button {
        width: 150px;
        height: 40px;
        line-height: 40px;
        border-radius: 20px;
        font-size: 14px;
        color: #fff;
        text-align: center;
        background-color: #F30300;
        margin-left: 10px;
    }
}

.co-item {
    width: calc(100% - 16px);
    margin-left: 8px;
    border-radius: 4px;
    margin-bottom: 8px;
    padding: 10px 6px;
    box-sizing: border-box;
    border: 1px dashed #eee;
    position: relative;

    .zanno {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 12px;
        color: #f3675d;
    }

    .name {
        display: block;
        color: #47C8AC;
        font-size: 15px;
        margin-bottom: 5px;
    }

    .time {
        font-size: 12px;
        display: block;
        margin-bottom: 5px;
        color: #333;
    }

    .price {
        font-size: 14px;
        color: #333;
    }
}

.show-item {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    height: 50px;
    font-size: 14px;
    border-bottom: 1px solid #ebebeb;
    padding: 0 10px;
    box-sizing: border-box;
    flex-wrap: wrap;

    textarea {
        display: block;
        background-color: #F5F5F5;
        border-radius: 3px;
        padding: 5px;
    }

    .label {
        width: 80px;
        line-height: 50px;
        color: #333;
    }

    .value {
        width: calc(100% - 90px);
        text-align: right;
        color: red;
    }
}

.info {
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

.br {
    width: 100%;
    display: block;
    margin-bottom: 12px;
    height: 5px;
}

.item-address {
    width: 100%;
    padding: 10px;
    box-sizing: border-box;
    margin-bottom: 15px;
    display: flex;
    position: relative;
    align-items: center;

    .icon {
        width: 32px;
        height: 32px;
        border-radius: 100%;
        overflow: hidden;
        margin-right: 10px;
        background-color: rgba(71, 200, 172, 0.4);
        display: flex;
        font-size: 15px;
        color: #47C8AC;
        align-items: center;
        justify-content: center;

        image {
            width: 18px;
            height: 18px;
        }
    }

    .content {
        width: calc(100% - 80px);

        .me {
            display: flex;
            align-items: center;

            text {
                font-size: 14px;
                color: #333;
                display: block;
                margin-right: 10px;
                font-weight: bold;
            }

            .isdef {
                border: 1px solid #47C8AC;
                padding: 2px 4px;
                font-size: 12px;
                color: #47C8AC;
                border-radius: 2px;
                font-weight: 300;
            }
        }

        .address {
            display: block;
            width: 100%;
            font-size: 14px;
            color: #555555;
            margin-top: 6px;
        }
    }

    .edit {
        width: 35px;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

.select_sp {
    width: 100%;
    margin-top: 10px;
    height: 1000rpx;
    padding: 10px;
    box-sizing: border-box;
    position: relative;
    padding-bottom: 60px;

    .title-address {
        display: block;
        width: 100%;
        text-align: center;
        font-size: 15px;
        color: #333;
        margin-bottom: 10px;
    }


    .select_sp_model {
        width: 100%;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        bottom: 10px;
        box-sizing: border-box;

        view {
            width: 320rpx;
            height: 40px;
            line-height: 40px;
            color: #fff;
            text-align: center;
        }

        .left {
            background-color: #FF821C;
            border-radius: 20px 0 0 20px;
        }

        .right {
            background-color: #F30300;
            border-radius: 0 20px 20px 0;
        }

        .add_address {
            width: 80%;
            background-color: #C7EEE6;
            color: #47c8ac;
            border-radius: 20px;

        }
    }

    .address_list {
        max-height: calc(100% - 50px);
        overflow: auto;

        .item {
            width: 100%;
            padding: 10px;
            box-sizing: border-box;
            margin-bottom: 15px;
            display: flex;
            position: relative;
            align-items: center;

            .icon {
                width: 32px;
                height: 32px;
                border-radius: 100%;
                overflow: hidden;
                margin-right: 10px;
                background-color: rgba(71, 200, 172, 0.4);
                display: flex;
                font-size: 15px;
                color: #47C8AC;
                align-items: center;
                justify-content: center;

                image {
                    width: 18px;
                    height: 18px;
                }
            }

            .content {
                width: calc(100% - 80px);

                .me {
                    display: flex;
                    align-items: center;

                    text {
                        font-size: 14px;
                        color: #333;
                        display: block;
                        margin-right: 10px;
                        font-weight: bold;
                    }

                    .isdef {
                        border: 1px solid #47C8AC;
                        padding: 2px 4px;
                        font-size: 12px;
                        color: #47C8AC;
                        border-radius: 2px;
                        font-weight: 300;
                    }
                }

                .address {
                    display: block;
                    width: 100%;
                    font-size: 14px;
                    color: #555555;
                    margin-top: 6px;
                }
            }

        }
    }
}
</style>
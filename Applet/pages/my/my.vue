<template>
    <view>
        <u-loading-page :loading="uLoadingPageShow" loading-text="loading..."></u-loading-page>
        <view class="login-no" v-if="!isLogin">
            <image class="def-no" src="../../static/def-no.png" mode=""></image>
            <button class="login" @click="login" v-if="!uLoadingPageShow">一键登录</button>
        </view>

        <view class="login-ok" v-else>
            <!-- 手机号绑定 -->
            <u-popup :show="isHavePhone" :closeOnClickOverlay="false" round="10" @close="popupClose">
                <view style="height: 700rpx;">
                    <text class="phoneTitle">绑定手机号激活账号</text>
                    <button open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber" class="gphone">绑定手机号</button>
                </view>
            </u-popup>
            <!-- 个人中心界面 -->
            <view class="bg"></view>
            <view class="my-info">
                <view class="info">
                    <image src="../../static/def-no.png" mode=""></image>
                    <view class="my-info-content">
                        <text class="name">{{info.username}}</text>
                        <text class="phone">{{info.phone}}</text>
                    </view>
                    <view style="margin-left: 15px;" class="edit" @click="editShow = true">
                        <u-icon name="edit-pen-fill" color="#47C8AC" size="22"></u-icon>
                    </view>
                </view>
                <view class="model">
                    <!-- 待付款，待发货，待收货，待评价，优惠券 -->
                    <view class="model-item" @click="order(0)">
                        <image src="../../static/d_pay.png" mode=""></image>
                        <text class="name">待付款</text>
                        <u-badge type="error" :absolute="true" :offset="[-4,10]" max="99" :value="count.order_status0"
                            :show="count.order_status0 > 0"></u-badge>
                    </view>
                    <view class="model-item" @click="order(1)">
                        <image src="../../static/d_fahuo.png" mode=""></image>
                        <text class="name">待发货</text>
                        <u-badge type="error" :absolute="true" :offset="[-4,10]" max="99" :value="count.order_status1"
                            :show="count.order_status1 > 0"></u-badge>
                    </view>
                    <view class="model-item" @click="order(3)">
                        <image src="../../static/d_shouhuo.png" mode=""></image>
                        <text class="name">待收货</text>
                        <u-badge type="error" :absolute="true" :offset="[-4,10]" max="99" :value="count.order_status3"
                            :show="count.order_status3 > 0"></u-badge>
                    </view>
                    <view class="model-item" @click="order(4)">
                        <image src="../../static/d_pjia.png" mode=""></image>
                        <text class="name">待评价</text>
                        <u-badge type="error" :absolute="true" :offset="[-4,10]" max="99" :value="count.order_status4"
                            :show="count.order_status4 > 0"></u-badge>
                    </view>
                    <view class="model-item" @click="coupon()">
                        <image src="../../static/d_yhq.png" mode=""></image>
                        <text class="name">优惠券</text>
                        <u-badge type="error" :absolute="true" :offset="[-4,10]" max="99" :value="count.coupon_status0"
                            :show="count.coupon_status0 > 0"></u-badge>
                    </view>
                </view>
            </view>
            <view class="list">
                <!-- 购物车，收货地址，我的订单，我的评价，我的优惠券，联系客服 -->
                <view class="list-item" @click="car()">
                    <image class="list-icon" src="/static/car.png" mode=""></image>
                    <text class="name">我的收藏</text>
                    <image class="next" src="/static/next.png" mode=""></image>
                    <u-badge type="error" :absolute="true" :offset="[20,40]" max="99"
                        bgColor="rgba(72, 202, 174 , 0.49)" :value="count.cart_count"
                        :show="count.cart_count > 0"></u-badge>
                </view>
                <view class="list-item" @click="address()">
                    <image class="list-icon" src="/static/address.png" mode=""></image>
                    <text class="name">收货地址</text>
                    <image class="next" src="/static/next.png" mode=""></image>
                </view>
                <view class="list-item" @click="order('all')">
                    <image class="list-icon" src="/static/order .png" mode=""></image>
                    <text class="name">我的订单</text>
                    <image class="next" src="/static/next.png" mode=""></image>
                </view>
                <view class="list-item" @click="evaluate()">
                    <image class="list-icon" src="/static/pjia.png" mode=""></image>
                    <text class="name">我的评价</text>
                    <image class="next" src="/static/next.png" mode=""></image>
                </view>
                <view class="list-item" @click="coupon()">
                    <image class="list-icon" src="/static/yhq.png" mode=""></image>
                    <text class="name">我的优惠券</text>
                    <image class="next" src="/static/next.png" mode=""></image>
                </view>
                <view class="list-item" @click="customer()">
                    <image class="list-icon" src="/static/kf.png" mode=""></image>
                    <text class="name">联系客服</text>
                    <image class="next" src="/static/next.png" mode=""></image>
                </view>
                <view class="list-item" @click="backLogin()">
                    <image class="list-icon" src="/static/out.png" mode=""></image>
                    <text class="name">退出登录</text>
                    <image class="next" src="/static/next.png" mode=""></image>
                </view>
            </view>

            <u-modal :show="back" title="提示" :showCancelButton="true" @cancel="backClose" :closeOnClickOverlay="true"
                @confirm="backout" @close="backClose" content='是否确认退出登录？'></u-modal>
            <u-popup :show="editShow" @close="editShowClose" :closeable='true' round="10">
                <view class="bbox" style="border-radius: 10px 0; height: 350px;">
                    <text class="edittitle">修改昵称</text>
                    <input class="editname" placeholder="请输入昵称" type="nickname" v-model="editInfo" />
                    <view class="button" @click="editnamepost">
                        提交
                    </view>
                </view>
            </u-popup>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                isLogin: true,
                openid: '',
                uLoadingPageShow: false,
                info: {},
                isHavePhone: false,
                count: {},
                back: false,
                editShow: false,
                editInfo: ''
            }
        },
        onShow() {
            this.openid = uni.getStorageSync('openid')
            this.hs(false, 'get', '/api/checkLogin', '', (res) => {
                if (res.data.code != 200) {
                    this.isLogin = false
                    return
                }
                this.isLogin = true
                this.hs(false, 'get', '/api/user/userInfo', '', (
                    res) => {
                    this.info = res.data.data
                    if (this.info.phone == '' || this.info.phone == '未绑定' || this.info.phone == null)
                        this.isHavePhone = true
                })
                this.hs(false, 'get', '/api/user/userCount', '', (res) => {
                    this.count = res.data.data
                })
            }, (err) => {
                this.tw('网络异常')
                this.isLogin = false
            })
        },
        methods: {
            login() {
                this.uLoadingPageShow = true

                uni.getUserProfile({
                    desc: '授权微信登录',
                    lang: 'zh_CN',
                    success: (res) => {
                        uni.login({
                            provider: 'weixin', //使用微信登录
                            success: (loginRes) => {
                                let code = loginRes.code
                                this.code = code
                                let username = res.userInfo.nickName + (Math.floor(Math
                                    .random() * 1000) + 100);
                                this.hs(true, 'post', '/api/login', {
                                    code: code,
                                    username: username
                                }, (res) => {
                                    uni.setStorageSync('token', res.data.token)
                                    this.openid = res.data.openid
                                    uni.setStorageSync('openid', this.openid)

                                    this.hs(false, 'get', '/api/user/userCount', '', (
                                        res) => {
                                        this.count = res.data.data
                                    })

                                    //获取用户信息
                                    this.hs(true, 'get', '/api/user/userInfo', '', (
                                        res) => {
                                        this.uLoadingPageShow = false
                                        this.info = res.data.data
                                        this.isLogin = true
                                        if (this.info.phone == '' || this.info
                                            .phone == '未绑定' || this.info
                                            .phone == null) this.isHavePhone =
                                            true
                                    })
                                })
                            }
                        });
                    },
                    fail: (res) => {
                        console.log(res);
                    }
                })
            },
            onGetPhoneNumber(e) {
                if (this.openid == '') {
                    this.login()
                    return this.tw('请先登录')
                }
                if (e.detail.errMsg == "getPhoneNumber:fail user deny") { //用户决绝授权  

                    this.tw('请完成手机号绑定')

                } else {

                    this.hs(true, 'post', '/api/bindPhone', {
                        openid: this.openid,
                        encryptedData: e.detail.encryptedData,
                        iv: e.detail.iv
                    }, (res) => {
                        if (res.data.code == 200) {
                            this.tw('账号激活成功')
                            this.popupClose()
                            this.hs(true, 'get', '/api/user/userInfo', '', (
                                res) => {
                                this.info = res.data.data
                            })
                        }
                    })

                }
            },
            popupClose() {
                this.isHavePhone = false
            },
            editShowClose() {
                this.editShow = false
            },
            order(status) {
                uni.navigateTo({
                    url: '/pages/order/order?status=' + status
                })
            },
            //优惠券
            coupon() {
                uni.navigateTo({
                    url: './coupon'
                })
            },
            //联系客服
            customer() {
                uni.navigateTo({
                    url: './customer'
                })
            },
            //购物车
            car() {
                uni.navigateTo({
                    url: './car'
                })
            },
            //收货地址
            address() {
                uni.navigateTo({
                    url: './address'
                })
            },
            //我的评价
            evaluate() {
                uni.navigateTo({
                    url: './evaluate'
                })
            },
            backLogin() {
                this.back = true
            },
            backClose() {
                this.back = false
            },
            backout() {
                uni.setStorageSync('openid', '')
                uni.setStorageSync('token', '')
                this.isLogin = false
                this.back = false
            },
            editnamepost() {
                if (this.editInfo == '') return this.tw('请输入昵称')
                if (this.editInfo == this.info.username) return
                this.hs(true, 'put', '/api/user/editUsername', {
                    username: this.editInfo
                }, (res) => {
                    if (res.data.code == 200) {
                        this.tw('修改成功')
                        this.info.username = this.editInfo
                        this.editShow = false
                    } else {
                        this.tw(res.data.msg)
                    }
                })
            }
        }
    }
</script>

<style lang="less">
    .login-no {
        .def-no {
            width: 72px;
            height: 72px;
            display: block;
            margin: 30px auto;
            margin-top: 35%;
        }

        .login {
            width: 150px;
            background-color: #00B26A;
            color: #fff;
            display: block;
            margin: 10px auto;
        }
    }

    .button {
        width: 90%;
        height: 45px;
        border-radius: 20px;
        text-align: center;
        line-height: 45px;
        font-size: 14px;
        background-color: #C7EEE6;
        color: #47c8ac;
        z-index: 10000;
        margin-left: 5%;
        margin-top: 30px;
    }

    .edittitle {
        display: block;
        margin-top: 20px;
        font-size: 15px;
        color: #333;
        width: 100%;
        box-sizing: border-box;
        padding-left: 5%;
    }

    .editname {
        display: block;
        width: 90%;
        box-sizing: border-box;
        padding: 2px 8px;
        margin-top: 8px;
        border-bottom: 1px solid #e1e1e1;
        background: #eeeeee;
        line-height: 45px;
        height: 45px;
        margin-left: 5%;
        border-radius: 3px;
        color: #333;

    }

    .list {
        box-shadow: rgba(0, 0, 0, 0.14) 0px 1px 4px;
        width: 690rpx;
        margin-left: 30rpx;
        background-color: #fff;
        box-sizing: border-box;
        padding: 10px;
        margin-top: 28px;

        .list-item {
            width: 100%;
            display: flex;
            position: relative;
            align-items: center;
            height: 55px;
            box-sizing: border-box;
            padding-left: 5px;

            .list-icon {
                width: 18px;
                height: 18px;
            }

            .name {
                font-size: 15px;
                color: #A2ADC1;
                display: block;
                margin-left: 8px;
            }

            .next {
                width: 15px;
                height: 15px;
                position: absolute;
                right: 15px;
            }
        }
    }

    .model {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        grid-gap: 5px;
        width: calc(100% - 12px);
        margin-top: 12px;

        .model-item {
            position: relative;
            width: 100%;

            image {
                width: 25px;
                height: 25px;
                border: none;
                display: block;
                margin: 0 auto;
            }

            .name {
                display: block;
                width: 100%;
                text-align: center;
                font-size: 13px;
                color: #47C8AC;
            }

        }
    }

    .gphone {
        width: 150px;
        background-color: #00B26A;
        color: #fff;
        display: block;
        margin: 10px auto;
        margin-top: 20px;
    }

    .phoneTitle {
        display: block;
        width: 100%;
        text-align: center;
        margin-top: 32px;
        padding: 0 15px;
        box-sizing: border-box;
        font-size: 17px;
    }

    .bg {
        width: 100%;
        height: 90px;
        background-color: #47C8AC;
        position: fixed;
        z-index: -1;
    }

    .my-info {
        background-color: #fff;
        width: 700rpx;
        border-radius: 4px;
        height: 170px;
        margin-left: 25rpx;
        padding-left: 12px;
        box-sizing: border-box;
        margin-top: 20px;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;

        .info {
            display: flex;
            align-items: center;
            height: 90px;
            position: relative;
        }

        .edit {
            position: absolute;
            right: 30px;
        }

        image {
            width: 60px;
            height: 60px;
            display: block;
            border: 1px solid #e1e1e1;
            border-radius: 100%;
        }

        .my-info-content {
            margin-left: 10px;

            .name {
                font-size: 17px;
                color: #333;
                display: block;
                margin-bottom: 1px;
            }

            .phone {
                font-size: 14px;
                color: #aaa;
            }
        }
    }
</style>
<template>
    <view class="content">
        <image class="logo" src="/static/logo.png" @click="login"></image>
        <view class="text-area">
            <text class="title" @click="getinfo">{{title}}</text>
        </view>
        <!-- <button @click="getPhoneNumber" plain="true">获取手机号</button> -->
        <button open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">唤起授权</button>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                title: 'Hello',
                code: '',
                openid: '',
                phone: '',
            }
        },
        onLoad() {

        },
        methods: {
            login() {
                uni.login({
                    provider: 'weixin', //使用微信登录
                    success: (loginRes) => {
                        let code = loginRes.code
                        this.code = code
                        uni.getUserInfo({
                            desc: '授权微信登录',
                            lang: 'zh_CN',
                            success: (res) => {
                                let username = res.userInfo.nickName
                                console.log(res);
                                this.hs(true, 'post', '/api/login', {
                                    code: code,
                                    username: res.userInfo.nickName
                                }, (res) => {
                                    console.log(res);
                                    this.openid = res.data.openid
                                })
                            }
                        })

                    }
                });
            },
            onGetPhoneNumber(e) {
                if (this.openid == '') return this.tw('请先登录')
                if (e.detail.errMsg == "getPhoneNumber:fail user deny") { //用户决绝授权  

                    this.tw('请完成手机号绑定')

                } else {

                    this.hs(true, 'post', '/api/bindPhone', {
                        openid: this.openid,
                        encryptedData: e.detail.encryptedData,
                        iv: e.detail.iv
                    }, (res) => {
                        console.log(res);
                        // this.openid = res.data.openid
                    })

                }
            },
        }
    }
</script>

<style>
    .content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    .logo {
        height: 200rpx;
        width: 200rpx;
        margin-top: 200rpx;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 50rpx;
    }

    .text-area {
        display: flex;
        justify-content: center;
    }

    .title {
        font-size: 36rpx;
        color: #8f8f94;
    }
</style>
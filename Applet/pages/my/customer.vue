<template>
    <view>
        <text class="title" style="margin-top: 25px;">您可以扫描下方二维码添加专属客服为您服务</text>
        <view class="box">
            <u--image :src="apiUrl() + url" width="620prx" height="620rpx">
                <view slot="error" style="font-size: 24rpx;">获取失败</view>
            </u--image>
        </view>
        <text class="title" style="margin-top: 25px;">或者您可以联系在线客服</text>
        <button open-type="contact" class="button">联系在线客服</button>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                url: ''
            }
        },
        onLoad() {
            this.hs(true, 'get', '/api/commodity/service', '', (res) => {
                this.url = res.data.data
            })
        },
        methods: {

        }
    }
</script>

<style>
    .box {
        width: 620rpx;
        height: 620rpx;
        margin: 3px auto;
        border-radius: 3px;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
    }

    .title {
        display: block;
        line-height: 30px;
        padding-left: 25px;
        font-size: 15px;
        color: #A2ADC1;
    }

    .button {
        width: 160px;
        display: block;
        margin: 10px auto;
        background-color: #00B26A;
        color: #fff;
    }
</style>
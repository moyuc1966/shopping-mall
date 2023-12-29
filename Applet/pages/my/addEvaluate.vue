<template>
    <view>
        <view class="shop" @click="uigo">
            <image v-if="item && item.icon" :src="apiUrl() + item.icon.split(',')[0]" mode=""></image>
            <view class="text">
                <u--text :lines="2" :text="item.name" size="14" color="#333" lineHeight="24"></u--text>
            </view>
        </view>
        <view class="form">
            <view class="star">
                <text class="star">综合评分：</text>
                <u-rate :count="5" v-model="info.star"></u-rate>
            </view>
            <textarea placeholder="说说你的商品感受" v-model="info.content"></textarea>
        </view>
        <view class="button" @click="postAdd()">
            提交评价
        </view>
        <view class="ano" @click="change">
            <radio :checked="info.is_anonymous == 1" color="#47C8AC" />
            <text :style="{color:info.is_anonymous == 1 ? '#47C8AC' : '#aaa'}">匿名评价</text>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                orderId: '',
                pid: '',
                item: {},
                info: {
                    orderId: '',
                    content: '',
                    star: 1,
                    is_anonymous: 0
                }
            }
        },
        onLoad(e) {
            this.info.orderId = e.id
            this.orderId = e.id
            this.pid = e.pid
            this.hs(true, 'get', '/api/commodity/easyproduct/' + this.pid, '', (res) => {
                this.item = res.data.data
            })
        },
        methods: {
            uigo() {
                uni.navigateTo({
                    url: '/pages/commodityInfo/commodityInfo?id=' + this.item.id
                })
            },
            change(e) {
                this.info.is_anonymous = this.info.is_anonymous == 0 ? 1 : 0
            },
            postAdd() {
                //根据星级匹配文案
                let perst = '很好'
                if (this.info.star == 1) perst = '较差'
                if (this.info.star == 2) perst = '有点差'
                if (this.info.star == 3) perst = '一般'
                if (this.info.star == 4) perst = '较好'
                if (this.info.content == '') this.info.content = '该用户觉得商品' + perst

                this.hs(true, 'post', '/api/order/commentOrder', this.info, (res) => {
                    this.tw(res.data.msg)
                    if (res.data.code == 200) {
                        setTimeout(() => {
                            uni.navigateBack({
                                delta: 1
                            })
                        }, 800)
                    }
                })
            }
        }
    }
</script>

<style lang="less">
    .shop {
        width: calc(100% - 20px);
        margin-left: 10px;
        box-sizing: border-box;
        border-radius: 4px;
        background-color: #F5F5F5;
        display: flex;
        overflow: hidden;
        align-items: center;
        margin-top: 10px;

        image {
            width: 65px;
            height: 65px;
            display: block;
            margin-right: 8px;
        }

        .text {
            width: calc(100% - 85px);
        }
    }

    .form {
        margin-top: 20px;
        width: 100%;
        padding: 0 10px;
        box-sizing: border-box;

        .star {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-start;

            .star {
                width: auto;
                font-size: 14px;
                color: #333;
            }
        }

        textarea {
            width: 100%;
            height: 150px;
            border-bottom: 1px solid #eee;
            padding: 10px 0;
            display: block;
            margin-top: 8px;
        }
    }

    .button {
        width: calc(100% - 20px);
        height: 40px;
        border-radius: 3px;
        margin-left: 10px;
        text-align: center;
        line-height: 40px;
        font-size: 14px;
        background-color: #47c8ac;
        color: #fff;
        margin-top: 25px;
    }

    .ano {
        margin-top: 15px;
        padding: 0 10px;
        box-sizing: border-box;
        display: flex;
        align-items: center;

        text {
            font-size: 14px;

        }
    }
</style>
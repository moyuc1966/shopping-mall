<template>
    <view class="main">
        <view class="button" v-if="list.length > 0" @click="add">
            新增收货地址
        </view>
        <view v-for="(item,index) in list" class="item" :key="index">
            <view class="icon">
                <view class="icon-img" v-if="item.is_default == 1">
                    <image src="/static/isdef.png" mode=""></image>
                </view>
                <view class="icon-img" v-else>
                    <text> {{getIcon(item.name)}}</text>
                </view>
            </view>
            <view class="content">
                <view class="me">
                    <text>{{item.name}}</text>
                    <text>{{item.phone}}</text>
                    <view class="isdef" v-if="item.is_default == 1">
                        默认
                    </view>
                </view>
                <text
                    class="address">{{item.province + (item.city == item.province ? '' : item.city) + item.county + item.address_detail}}</text>
            </view>
            <view class="edit" @click="edit(item.id)">
                <u-icon name="edit-pen" color="#aaa" size="20"></u-icon>
            </view>
        </view>

        <u-empty v-if="list.length <= 0" icon="/static/nono.png" text="还没有收货地址" marginTop="100">
            <view style="margin-top: 18px;">
                <u-button type="primary" text="添加收货地址" @click="add"></u-button>
            </view>
        </u-empty>

        <view style="height: 60px; width: 100%;"></view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                list: []
            }
        },
        onShow() {
            this.hs(true, 'get', '/api/user/addressList', '', (res) => {
                this.list = res.data.data.sort((a, b) => b.is_default - a.is_default);
            })
        },
        methods: {
            getIcon(name) {
                return name.trim().split('')[0]
            },
            add() {
                uni.navigateTo({
                    url: './addAddress'
                })
            },
            edit(id) {
                uni.navigateTo({
                    url: './addAddress?id=' + id
                })
            }
        }
    }
</script>

<style lang="less">
    .main {
        position: relative;
    }

    .button {
        width: 80%;
        height: 40px;
        border-radius: 20px;
        position: fixed;
        bottom: 35px;
        left: 10%;
        text-align: center;
        line-height: 40px;
        font-size: 14px;
        background-color: #C7EEE6;
        color: #47c8ac;
        z-index: 10000;
    }

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

        .edit {
            width: 35px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }
</style>
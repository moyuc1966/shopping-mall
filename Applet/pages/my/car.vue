<template>
    <view class="main">
        <view v-for="(item,index) in list" class="item" :key="index" @click="info(item.product_id)">
            <image :src="apiUrl() + item.product_img.split(',')[0]" mode=""></image>
            <view class="info">
                <u--text :lines="2" class="name" :text="item.product_name" :block="true" size="14" lineHeight="25px"
                    color="#333"></u--text>
                <text class="pre">{{item.product_specification_name}}</text>
                <text class="price">￥{{Number(item.product_specification_price).toFixed(2)}}</text>
                <view class="del" @click.stop="del(item.id)">
                    <u-icon name="trash" color="#aaa" size="17"></u-icon>
                </view>
            </view>
        </view>

        <u-empty v-if="list.length <= 0" icon="/static/nono.png" text="还没有商品收藏" marginTop="100"></u-empty>

        <u-modal @confirm="delEva" @cancel="closeDel" @close="closeDel" :closeOnClickOverlay="true" :show="show"
            title="确认移除收藏吗" content='确认要取消对这个商品的收藏吗!' :showConfirmButton="true" :showCancelButton="true"
            :buttonReverse="true"></u-modal>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                list: [],
                show: false,
                id: ''
            }
        },
        onLoad() {
            this.hs(true, 'get', '/api/order/cartList', '', (res) => {
                this.list = res.data.data
            })
        },
        methods: {
            info(id) {
                uni.navigateTo({
                    url: '/pages/commodityInfo/commodityInfo?id=' + id
                })
            },
            del(id) {
                this.id = id
                this.show = true
            },
            closeDel() {
                this.show = false
            },
            delEva() {
                this.hs(true, 'delete', '/api/order/delCart?cartId=' + this.id, '', (res) => {
                    let arr = this.list.filter(item => {
                        return item.id != this.id
                    })
                    this.list = arr
                    this.show = false
                    this.tw('已取消收藏')
                })
            }
        }
    }
</script>

<style lang="less">
    page,
    main {
        width: 100%;
        height: 100%;
        background-color: #F5F5F5;

        .item {
            width: 100%;
            padding: 10px;
            background-color: #fff;
            display: flex;
            margin-bottom: 15px;

            .del {
                width: 30px;
                height: 30px;
                position: absolute;
                display: flex;
                align-items: center;
                justify-content: center;
                bottom: -5px;
                right: 15px;
                font-size: 13px;
                color: #aaa;
            }

            image {
                width: 90px;
                height: 90px;
                display: block;
                margin-right: 10px;
            }

            .info {
                position: relative;
                width: calc(100% - 110px);

                .pre {
                    font-size: 13px;
                    color: #aaa;
                    display: block;
                }

                .price {
                    font-size: 17px;
                    color: red;
                    position: absolute;
                    bottom: 0px;
                    left: 0px;
                }
            }
        }
    }
</style>
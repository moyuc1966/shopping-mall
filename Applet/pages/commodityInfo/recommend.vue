<template>
    <view class="main">
        <u-swiper :list="swiper" :autoplay="false" radius="0" height="350" :indicator="true" @click="showIcon">
        </u-swiper>
        <view class="e-info">
            <text class="price"> <text class="do">￥</text>{{Number(specification.price).toFixed(2)}} </text>
            <text class="name">{{info.name}}</text>
            <text class="brief">{{info.brief}}</text>
            <text class="sales">已售{{info.sales}}</text>
        </view>

        <view class="e-info">
            <view class="select-item">
                <text class="lable">选择</text>
                <view class="text-spbox" @click="spShowClick">
                    <u--text :lines="1" size="15" color="#333" :block="true" :text="specification.name"></u--text>
                </view>
                <view class="icon" @click="spShowClick">
                    <u-icon name="arrow-right" color="#47c8ac" size="16"></u-icon>
                </view>

            </view>
            <view class="select-item">
                <text class="lable">送至</text>
                <view class="text-spbox" @click="addressShowClick">
                    <u--text :lines="1" size="15" color="#333" :block="true"
                        :text="address.province + (address.city == address.province ? '' : address.city) + address.county + address.address_detail"></u--text>
                </view>
                <view class="icon" @click="addressShowClick">
                    <u-icon name="arrow-right" color="#47c8ac" size="16"></u-icon>
                </view>
            </view>
            <text class="kuai">快递：{{Number(info.postage).toFixed(2)}}元</text>
        </view>
        <view class="e-info">
            <view class="com-box" @click="com()">
                <text class="title">商品评价</text>
                <text class="info">{{com_total == 0 ? '暂无好评' : com_total + '条评价'}}</text>
                <view class="icon">
                    <u-icon name="arrow-right" color="#47c8ac" size="16"></u-icon>
                </view>
            </view>
        </view>
        <u-divider text="商品详情" textPosition="center" textSize="16" textColor="#333"></u-divider>
        <view class="e-info">
            <u-parse :content="info.description" :domain="apiUrl()" errorImg="/static/nono.png"></u-parse>
        </view>

        <u-divider text="商品推荐" textPosition="center" textSize="16" textColor="#333"></u-divider>

        <view class="list-box" style="background-color: #fff;">
            <view v-for="(item,index) in list_t" class="list-item" v-if="item.price != null" :key="index"
                @click="recommend(item.id)">
                <image :src="apiUrl() + item.icon.split(',')[0]" mode=""></image>
                <view class="list-item-content">
                    <u--text class="shop-name" :lines="2" :text="item.name"></u--text>
                    <view class="list-item-price">
                        <text class="price"><text
                                style="font-size: 14px;">￥</text>{{Number(item.price).toFixed(2)}}</text>
                        <text class="sales">已售{{item.sales}}</text>
                    </view>
                </view>
                <view class="tag">
                    {{item.category}}
                </view>
            </view>
        </view>

        <!-- 弹窗 -->
        <u-popup :show="spShow" @close="spShowClose" mode="bottom" :round="10" @click.stop="1 + 1" :closeable="true">
            <view class="select_sp">
                <view class="select_sp_top">
                    <image :src="swiper[0]" mode=""></image>
                    <view class="select_top_content">
                        <text class="price"> <text class="do">￥</text>{{Number(specification.price).toFixed(2)}} </text>
                        <text class="er_select">已选规格：{{specification.name}},库存：{{specification.stock}}</text>
                    </view>
                </view>
                <view class="select_sp_bottom">
                    <text class="title">选择规格</text>
                    <view v-for="(item,index) in info.specification" :key="index" class="select_sp_item"
                        @click="sp_change(item)" :class="item.id == specification.id ? 'select_sp_ok' : 'select_sp_no'">
                        <text>{{item.name}}</text>
                    </view>
                </view>
                <view class="select_sp_num">
                    <text class="title">选择数量</text>
                    <u-number-box v-model="specification.count"></u-number-box>
                </view>
                <view class="select_sp_model">
                    <view class="left" @click="collect()">
                        加入收藏
                    </view>
                    <view class="right" @click="buy()">
                        立即购买
                    </view>
                </view>
            </view>
        </u-popup>

        <u-popup :show="addressShow" @close="addressShowClose" mode="bottom" :round="10" @click.stop="1 + 1"
            :closeable="true">
            <view class="select_sp">
                <text class="title-address">选择收货地址</text>
                <u-empty v-if="addressList.length <= 0" icon="/static/nono.png" text="还没有收货地址"
                    marginTop="100"></u-empty>
                <view class="address_list">
                    <view v-for="(item,index) in addressList" class="item" :key="index">
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

        <!-- 底部栏 -->
        <view class="bottom">
            <image src="../../static/kf-a.png" mode="" @click="kefu"></image>
            <image src="../../static/cang.png" mode="" @click="shou_all"></image>
            <view class="cang" @click="collect()">
                加入收藏
            </view>
            <view class="buy" @click="buy()">
                立即购买
            </view>
        </view>



        <u-modal @confirm="closeDel" @cancel="closeDel" @close="closeDel" :closeOnClickOverlay="true" :show="ok"
            title="提示" :content='content' :showConfirmButton="true" :showCancelButton="true"
            :buttonReverse="true"></u-modal>

        <view style="height: 60px; width: 100%;"></view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                id: '',
                info: {},
                swiper: [],
                ok: false,
                content: '',
                addressList: [],
                address: {},
                specification: {},
                spShow: false,
                addressShow: false,
                com_total: 0,
                list_t: []
            }
        },
        onLoad(e) {
            this.id = e.id
            this.hs(true, 'get', '/api/commodity/product/' + e.id, '', (res) => {
                if (res.data.code == 404) {
                    this.content = '此商品可能被删除了'
                    this.ok = true
                    return
                }
                this.info = res.data.data
                if (!this.info.specification || this.info.specification.length == 0) {
                    this.content = '此商品正在上架中，请稍后访问'
                    this.ok = true
                    return
                }
                if (this.info.status == 1) {
                    this.content = '此商品已下架'
                    this.ok = true
                    return
                }
                let url = this.$url
                this.specification = this.info.specification[0]

                if (this.specification.name == '' || this.specification.name == null) this.specification.name =
                    '此商品数据异常'
                this.specification.count = 1
                this.info.icon.split(',').forEach(item => {
                    this.swiper.push(url + item)
                })
            })
            this.hs(true, 'get', '/api/commodity/address', '', (res) => {
                this.addressList = res.data.data.sort((a, b) => b.is_default - a.is_default);
                this.address = this.addressList[0]
                if (this.addressList.length == 0) this.address = {
                    county: '',
                    city: '',
                    province: '请添加收货地址',
                    address_detail: ''
                }
            })
            this.hs(true, 'get', '/api/commodity/comment?product_id=' + this.id, '', (res) => {
                this.com_total = res.data.total
            })

            this.hs(true, 'get', '/api/commodity/recommend?product_id=' + this.id, '', (res) => {
                this.list_t = res.data.data
            })
        },
        methods: {
            showIcon(e) {
                uni.previewImage({
                    urls: this.swiper,
                    current: e
                })
            },
            getIcon(name) {
                return name.trim().split('')[0]
            },
            closeDel() {
                this.ok = false
                uni.navigateBack({
                    delta: 1
                })
            },
            kefu() {
                uni.navigateTo({
                    url: '/pages/my/customer'
                })
            },
            shou_all() {
                uni.navigateTo({
                    url: '/pages/my/car'
                })
            },
            spShowClick() {
                this.spShow = true
            },
            spShowClose() {
                this.spShow = false
            },
            buy() {
                if (this.specification.stock <= 0) return this.tw('所选规格库存不足')
                //购买事件
                uni.navigateTo({
                    url: './pay?id=' + this.id + '&pid=' + this.specification.id + '&count=' + this
                        .specification.count + '&aid=' + this.address.id
                })

            },
            collect() {
                //收藏事件
                let data = {
                    count: this.specification.count,
                    specification_id: this.specification.id,
                    product_id: this.id
                }
                this.hs(true, 'post', '/api/order/addCart', data, (res) => {
                    this.tw(res.data.msg)
                })
            },
            sp_change(item) {
                if (item.stock <= 0) return this.tw('此规格库存不足')
                this.specification = item
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
            com() {
                uni.navigateTo({
                    url: './comment?id=' + this.id
                })
            },
            recommend(id) {
                uni.navigateTo({
                    url: './commodityInfo?id=' + id
                })
            }
        }
    }
</script>

<style lang="less">
    page,
    .main {
        width: 100%;
        height: 100%;
        background-color: #F5F6F8;
    }

    .bottom {
        position: fixed;
        bottom: 0;
        width: 100%;
        height: 60px;
        background: #fff;
        border-top: 1px solid #eeeeee;
        display: flex;
        align-items: center;
        justify-content: space-around;

        image {
            width: 25px;
            height: 25px;
        }

        view {
            width: calc((100% - 120px) / 2);
            border-radius: 20px;
            height: 40px;
            text-align: center;
            line-height: 40px;
            border: 1px solid #FF8200;
        }

        .cang {
            background-color: #fff;
            color: #FF8200;
        }

        .buy {
            background-color: #FF8200;
            color: #fff;
        }
    }

    .com-box {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        position: relative;

        .title {
            font-size: 16px;
            color: #333;
        }

        .info {
            font-size: 14px;
            color: #aaa;
            display: block;
            margin-left: 10px;
        }

        .icon {
            height: 100%;
            width: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            right: 2px;
        }
    }

    .select-item {
        width: 100%;
        display: flex;
        align-items: center;
        position: relative;
        height: 36px;

        .lable {
            font-size: 15px;
            width: 45px;
            color: #aaa;
        }

        .text-spbox {
            width: calc(100% - 90px);
        }

        .icon {
            height: 100%;
            width: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            right: 2px;
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

        .select_sp_top {
            display: flex;
            width: 100%;

            image {
                width: 90px;
                height: 90px;
                display: block;
                margin-right: 10px;
            }

            .select_top_content {
                width: calc(100% - 100px);

                .price {
                    color: red;
                    font-size: 22px;
                    font-weight: bold;
                    display: inline-block;

                    .do {
                        font-size: 14px;
                        display: inline-block;
                    }
                }

                .er_select {
                    font-size: 15px;
                    color: #333;
                    margin-top: 5px;
                    display: block;
                    font-weight: 300;
                }

            }
        }

        .select_sp_bottom {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            max-height: calc(100% - 190px);
            box-sizing: border-box;
            padding-top: 10px;
            overflow: auto;

            .title {
                display: block;
                margin: 10px 0;
                width: 100%;
                font-size: 15px;
                color: #aaa;
            }

            .select_sp_item {
                padding: 4px 6px;
                font-size: 14px;
                border-radius: 4px;
                margin-right: 10px;
                max-width: 700rpx;
                margin-bottom: 15px;
            }

            .select_sp_ok {
                background-color: #C7EEE6;
                color: #47c8ac;
            }

            .select_sp_no {
                background-color: #F5F6F8;
                color: #333;
            }
        }

        .select_sp_num {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;
            width: 100%;
            padding-top: 10px;
            box-sizing: border-box;
            border-top: 1px solid #e1e1e1;

            .title {
                display: block;
                margin: 10px 0;
                width: 100%;
                font-size: 15px;
                color: #aaa;
            }
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

                .edit {
                    width: 35px;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            }
        }
    }


    .kuai {
        display: block;
        width: 100%;
        padding-left: 45px;
        font-size: 13px;
        color: #aaa;
    }

    .e-info {
        background-color: #fff;
        border-radius: 5px;
        padding: 10px;
        width: calc(100% - 20px);
        margin-left: 10px;
        margin-top: 10px;
        box-sizing: border-box;

        text {
            display: block;
        }

        .price {
            color: red;
            font-size: 22px;
            font-weight: bold;
            display: inline-block;

            .do {
                font-size: 14px;
                display: inline-block;
            }
        }

        .name {
            font-size: 15px;
            margin-top: 5px;
            line-height: 24px;
        }

        .brief {
            font-size: 13px;
            color: #aaa;
            margin-top: 5px;
        }

        .sales {
            font-size: 13px;
            color: #aaa;
            margin-top: 10px;
        }
    }

    .list-box {
        width: 100%;
        padding: 10px;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        box-sizing: border-box;

        .list-item {
            box-sizing: border-box;
            width: calc(50% - 5px);
            overflow: hidden;
            border-radius: 10px;
            background: #fff;
            box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
            margin-bottom: 22px;
            position: relative;

            .tag {
                box-sizing: border-box;
                background-color: #46CBB3;
                color: #fff;
                font-size: 12px;
                border-radius: 2px;
                padding: 2px 4px;
                position: absolute;
                font-weight: 300;
                top: 5px;
                right: 5px;
            }

            .list-item-content {
                padding: 6px;
                height: 88px;
                position: relative;

                .shop-name {
                    font-size: 14px;
                    color: #333;
                    line-height: 25px;
                    color: #333;
                    font-weight: 300;
                }

                .list-item-price {
                    position: absolute;
                    bottom: 10px;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-right: 22px;
                    box-sizing: border-box;

                    .price {
                        color: red;
                        font-size: 18px;
                    }

                    .sales {
                        font-size: 13px;
                        color: #aaa;
                    }
                }
            }

            image {
                width: 100%;
                height: 185px;
            }
        }
    }
</style>
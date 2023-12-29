<template>
    <view class="content">
        <u-loading-page :loading="uLoadingPageShow" loading-text="loading..."></u-loading-page>
        <u-sticky>
            <view class="hot" style="background-color: #fff;">
                <text class="title">商品热卖</text>
                <view class="sort" @click="sortChange('popularity')"
                    :class="sort == 'popularity' ? 'sort-change' : 'sortnochange'">
                    <text>人气</text>
                    <u-icon :name="sortType == 'asc' && sort == 'popularity'  ? 'arrow-down-fill' : 'arrow-up-fill'"
                        :color="sort == 'popularity' ? '#46CBB3' : '#aaa'" size="14"></u-icon>
                </view>
                <view class="sort" @click="sortChange('sales')"
                    :class="sort == 'sales' ? 'sort-change' : 'sortnochange'">
                    <text>销量</text>
                    <u-icon :name="sortType == 'asc' && sort == 'sales'  ? 'arrow-down-fill' : 'arrow-up-fill'"
                        :color="sort == 'sales' ? '#46CBB3' : '#aaa'" size="14"></u-icon>
                </view>
                <view class="sort" @click="sortChange('price')"
                    :class="sort == 'price' ? 'sort-change' : 'sortnochange'">
                    <text>价格</text>
                    <u-icon :name="sortType == 'asc' && sort == 'price'  ? 'arrow-down-fill' : 'arrow-up-fill'"
                        :color="sort == 'price' ? '#46CBB3' : '#aaa'" size="14"></u-icon>
                </view>
            </view>
        </u-sticky>


        <view class="list-box" style="background-color: #fff;">
            <view v-for="(item,index) in list" class="list-item" :key="index" @click="commodity(item.id)">
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

        <u-empty v-if="list.length <= 0" icon="/static/nono.png" text="这个分类还没有商品" marginTop="100"></u-empty>



        <u-loadmore :status="status" v-if="list.length >= 10" :dashed="false" marginTop="30" :line="true"
            @loadmore="loadmore" />
        <view style="height: 60px; width: 100%;"></view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                page: 1,
                total: 0,
                status: 'loadmore',
                list: [],
                sort: 'popularity',
                sortType: 'desc',
                uLoadingPageShow: false,
                categoryId: ''
            }
        },
        onLoad(e) {
            this.categoryId = e.id
            uni.setNavigationBarTitle({
                title: e.name
            })
            this.hs(false, 'get',
                `/api/public/product?limit=10&page=${this.page}&sort=${this.sort}&sortType=${this.sortType}&category=${this.categoryId}`,
                '', (res) => {
                    this.total = res.data.total
                    this.list = res.data.data
                    this.uLoadingPageShow = false
                })

        },
        methods: {
            commodity(id) {
                uni.navigateTo({
                    url: '/pages/commodityInfo/commodityInfo?id=' + id
                })
            },
            loadmore() {
                if (this.list.length >= this.total) return this.status = 'nomore'
                this.page++
                this.status = 'loading'
                this.hs(true, 'get',
                    `/api/public/product?limit=10&page=${this.page}&sort=${this.sort}&sortType=${this.sortType}&category=${this.categoryId}`,
                    '',
                    (res) => {
                        this.list = [...this.list, ...res.data.data]
                        if (this.list.length >= this.total) {
                            this.status = 'nomore'
                        } else {
                            this.status = 'loadmore'
                        }
                    })
            },
            sortChange(sort) {
                this.page = 1
                this.sort = sort
                if (sort == this.sort) this.sortType = this.sortType == 'desc' ? 'asc' : 'desc'
                this.hs(true, 'get',
                    `/api/public/product?limit=10&page=${this.page}&sort=${this.sort}&sortType=${this.sortType}&category=${this.categoryId}`,
                    '', (res) => {
                        this.total = res.data.total
                        this.list = res.data.data
                    })
            },
        },
        onReachBottom() {
            if (this.list.length >= this.total) return this.status = 'nomore'
            this.page++
            this.status = 'loading'
            this.hs(true, 'get',
                `/api/public/product?limit=10&page=${this.page}&sort=${this.sort}&sortType=${this.sortType}&category=${this.categoryId}`,
                '',
                (res) => {
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
    page {
        width: 100%;
        height: 100%;
    }

    .content {
        width: 100%;
        height: 100%;
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

    .hot {
        width: 100%;
        margin-top: 0px;
        display: flex;
        align-items: center;
        padding-top: 15px;
        padding: 10px 10px;

        .title {
            font-weight: bold;
            color: #47C8AC;
            font-size: 17px;
            display: block;
            margin-right: 25px;
        }

        .sort {
            box-sizing: border-box;
            font-size: 15px;
            border-radius: 10px;
            padding: 6px 11px;
            display: flex;
            margin-right: 12px;

            text {
                display: block;
                margin-right: 4px;
            }
        }

        .sort-change {
            background-color: rgba(71, 200, 172, 0.3);
            color: #47c8ac;
        }

        .sortnochange {
            background-color: #F5F6F8;
            color: #AAAAAA;
        }
    }
</style>
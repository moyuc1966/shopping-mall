<template>
    <view class="content">
        <u-loading-page :loading="uLoadingPageShow" loading-text="loading..."></u-loading-page>
        <view v-if="!uLoadingPageShow">
            <view class="bg"></view>
            <view class="search-box" style="background: none;width: calc(100% - 28px)">
                <u-search placeholder="搜索你感兴趣的" style="margin-top: 10px;" bgColor="#fff" :disabled="true"
                    @click="uigoSearch" :showAction="false"></u-search>
            </view>
            <swiper :indicator-dots="true" :autoplay="true" :interval="3000" :duration="1000">
                <swiper-item v-for="(item,index) in swiper" :key="index">
                    <image type="image" :src="(apiUrl() + item)" alt="" />
                </swiper-item>
            </swiper>
            <view class="search-box" v-if="notice.notice">
                <u-notice-bar :speed="notice.notice.split('').length < 18 ? 120 : 80" :text="notice.notice"
                    color="#47C8AC" bgColor="#fff"></u-notice-bar>
            </view>
            <view class="class-box">
                <view class="class-item" v-for="(item,index) in notice.category" :key="index"
                    @click="classification(item.id,item.name)">
                    <image :src="apiUrl() + item.icon + '?tid='+index" mode=""></image>
                    <text>{{item.name}}</text>
                </view>
                <view v-if="notice.category" class="class-item class-more" @click="classificationAll()">
                    <image :src="require('../../static/more.png')" mode=""></image>
                    <text>{{notice.category.length == 0 ? '商品分类' : '更多分类'}}</text>
                </view>
            </view>
            <u-sticky v-if="!uLoadingPageShow">
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
                <view v-for="(item,index) in list" class="list-item" v-if="item.price != null" :key="index"
                    @click="commodity(item.id)">
                    <!-- <image :src="apiUrl() + item.icon.split(',')[0]" mode="" @error="imgerror"></image> -->
                    <u--image :showLoading="true" v-if="item.icon" width="100%" height="185px" bgColor="#f8f9fa"
                        :src="apiUrl() + item.icon.split(',')[0] + '?tid='+index" :fade="true" duration="450"
                        mode="scaleToFill">
                        <template v-slot:loading>
                            <u-loading-icon color="#46CBB3"></u-loading-icon>
                        </template>
                    </u--image>
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

            <u-modal :show="noticeShow" title="公告" :closeOnClickOverlay="true" @close="noticeClose"
                @confirm="noticeClose" :content='notice.notice_content'></u-modal>


            <u-loadmore :status="status" v-if="list.length >= 10" :dashed="false" marginTop="30" :line="true"
                @loadmore="loadmore" />
            <view style="height: 60px; width: 100%;"></view>
        </view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                swiper: [],
                uLoadingPageShow: true,
                notice: {},
                sort: 'popularity',
                list: [],
                sortType: 'desc',
                page: 1,
                total: 0,
                status: 'loadmore',
                noticeShow: false
            }
        },
        onLoad() {
            this.getInfo()
        },
        methods: {
            imgerror(e) {
                console.log(e);
            },
            getInfo() {
                this.hs(false, 'get', '/api/public/index', '', (res) => {
                    this.swiper = (res.data.data.swiper).split(',')
                    this.notice = res.data.data
                    if (this.notice.notice_switch == 1) this.noticeShow = true
                })
                this.hs(false, 'get',
                    `/api/public/product?limit=10&page=${this.page}&sort=${this.sort}&sortType=${this.sortType}`,
                    '', (res) => {
                        this.total = res.data.total
                        this.list = res.data.data
                        this.uLoadingPageShow = false

                        //产生假数据
                        // function generateRandomChineseString() {
                        //     // 生成随机长度在10到20之间的整数
                        //     const length = Math.floor(Math.random() * (20 - 10 + 1)) + 10;

                        //     let result = '';
                        //     for (let i = 0; i < length; i++) {
                        //         // 生成Unicode范围内的汉字（0x4e00到0x9fff）
                        //         const randomUnicode = Math.floor(Math.random() * (0x9fff - 0x4e00 + 1)) + 0x4e00;
                        //         result += String.fromCharCode(randomUnicode);
                        //     }

                        //     return result;
                        // }
                        // this.total = 20
                        // for (let i = 0; i < 15; i++) {
                        //     let obj = JSON.parse(JSON.stringify(this.list[0]))
                        //     obj.name = generateRandomChineseString()
                        //     this.list.push(obj)
                        // }
                    })
            },
            sortChange(sort) {
                this.page = 1
                this.sort = sort
                this.sortType = this.sortType == 'desc' ? 'asc' : 'desc'
                this.hs(true, 'get',
                    `/api/public/product?limit=10&page=${this.page}&sort=${this.sort}&sortType=${this.sortType}`,
                    '', (res) => {
                        this.total = res.data.total
                        this.list = res.data.data
                    })
            },
            loadmore() {
                if (this.list.length >= this.total) return this.status = 'nomore'
                this.page++
                this.status = 'loading'
                this.hs(true, 'get',
                    `/api/public/product?limit=10&page=${this.page}&sort=${this.sort}&sortType=${this.sortType}`,
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
            uigoSearch() {
                uni.navigateTo({
                    url: './search'
                })
            },
            commodity(id) {
                uni.navigateTo({
                    url: '/pages/commodityInfo/commodityInfo?id=' + id
                })
            },
            noticeClose() {
                this.noticeShow = false
            },
            classification(id, name) {
                uni.navigateTo({
                    url: '/pages/classification/classification?id=' + id + '&name=' + name
                })
            },
            classificationAll() {
                uni.navigateTo({
                    url: '/pages/classification/classificationAll'
                })
            }
        },
        onReachBottom() {
            if (this.list.length >= this.total) return this.status = 'nomore'
            this.page++
            this.status = 'loading'
            this.hs(true, 'get',
                `/api/public/product?limit=10&page=${this.page}&sort=${this.sort}&sortType=${this.sortType}`, '',
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
    ::v-deep .u-tag {
        flex: none;
        width: auto;
    }

    swiper {
        width: calc(100% - 20px);
        margin-left: 10px;
        border-radius: 10px;
        height: 160px;
        overflow: hidden;
        margin-top: 18px;

        image {
            width: 100%;
            height: 100%;
            border-radius: 10px;
        }
    }

    .bg {
        width: 100%;
        height: 150px;
        background-color: #47C8AC;
        position: fixed;
        z-index: -1;
    }

    .search-box {
        width: 100%;
        padding: 0 14px;
        padding-top: 8px;
        background: #fff;
    }

    .class-box {
        width: 100%;
        display: grid;
        padding: 12px 4px;
        box-sizing: border-box;
        padding-top: 15px;
        background: #fff;
        grid-template-columns: repeat(5, 1fr);

        .class-item {
            width: 100%;
            padding: 0 6px;
            // margin-left: 5px;
            box-sizing: border-box;
            margin-bottom: 18px;

            image {
                width: 40px;
                height: 40px;
                border-radius: 100%;
                margin: 0 auto;
                display: block;
            }

            text {
                display: block;
                width: 100%;
                text-align: center;
                margin-top: 5px;
                font-size: 14px;
            }
        }

        .class-more {
            image {
                background-color: #47C8AC;
                padding: 8px;
                box-sizing: border-box;
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
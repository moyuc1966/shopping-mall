<template>
    <view class="content" @click="changeEdit">
        <view class="search-box" style="background: none;width: calc(100% - 28px);margin-bottom: 12px;">
            <u-search placeholder="搜索你感兴趣的" @search="searchFun" @custom="searchFun" :showAction="true"
                v-model="name"></u-search>
        </view>
        <view class="his-list" v-if="list.length == 0">
            <view class="tag-box" style="margin-right: 12px;" v-for="(item,index) in hisList" :key="index">
                <u-tag :text="item" @click="clickTag" @close="closeTag" @longpress="longpress(item)" :closable="isEdit"
                    :name="item" size="medium" borderColor="#f5f5f5" bgColor="#f5f5f5" color="#aaa"></u-tag>
            </view>

        </view>
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
                name: '',
                list: [],
                hisList: [],
                isEdit: false,
                islongPress: false,
            }
        },
        onLoad() {
            let his = uni.getStorageSync('searchHis')
            let arr = JSON.parse(his)
            if (arr.length > 12) arr = arr.slice(-12)
            this.hisList = arr

        },
        methods: {
            searchFun() {
                if (!this.hisList.find(item => this.name == item)) {
                    this.hisList.push(this.name)
                    uni.setStorageSync('searchHis', JSON.stringify(this.hisList))
                }
                this.hs(false, 'get',
                    `/api/public/product?limit=10&page=${this.page}&name=${this.name}`,
                    '', (res) => {
                        if (res.data.data.length == 0) {
                            this.tw('暂无搜索结果')
                            this.list = []
                        } else {
                            this.total = res.data.total
                            this.list = res.data.data
                        }

                    })

            },
            clickTag(item) {
                if (this.islongPress == false) {
                    this.name = item
                    this.searchFun(false)
                }

            },
            closeTag(e) {
                this.hisList = this.hisList.filter(item => item !== e);
                uni.setStorageSync('searchHis', JSON.stringify(this.hisList))
            },
            longpress() {
                this.isEdit = true
                this.islongPress = true;
            },
            changeEdit() {
                if (this.isEdit) this.isEdit = !this.isEdit
            },
            commodity(id) {
                uni.navigateTo({
                    url: '/pages/commodityInfo/commodityInfo?id=' + id
                })
            },
            loadmore() {
                if (this.list.length >= this.total) return this.status = 'nomore'
                this.page++
                this.status = 'loading'

                this.hs(false, 'get',
                    `/api/public/product?limit=10&page=${this.page}&name=${this.name}`,
                    '', (res) => {
                        this.list = [...this.list, ...res.data.data]
                        if (this.list.length >= this.total) {
                            this.status = 'nomore'
                        } else {
                            this.status = 'loadmore'
                        }

                    })
            }
        },
        onBackPress(e) {
            if (e.from === 'backbutton') {
                if (this.isEdit) this.isEdit = false
                return true // 阻止返回
            }
        },
        onReachBottom() {
            if (this.list.length >= this.total) return this.status = 'nomore'
            this.page++
            this.status = 'loading'

            this.hs(false, 'get',
                `/api/public/product?limit=10&page=${this.page}&name=${this.name}`,
                '', (res) => {
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

    .search-box {
        width: 100%;
        margin: 0 auto;
        margin-top: 15px;
    }

    .his-list {
        display: flex;
        align-items: center;
        flex-wrap: wrap;

        padding: 10px 20px;
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
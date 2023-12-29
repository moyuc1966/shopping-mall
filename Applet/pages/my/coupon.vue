<template>
    <view>
        <u-sticky>
            <view class="hot" style="background-color: #fff;margin-bottom: 10px;">
                <text class="title">我的优惠券</text>
                <view class="sort" @click="sortChange(0)" :class="sort == '0' ? 'sort-change' : 'sortnochange'">
                    <text>待使用</text>
                </view>
                <view class="sort" @click="sortChange(2)" :class="sort == '2' ? 'sort-change' : 'sortnochange'">
                    <text>已使用</text>
                </view>
                <view class="sort" @click="sortChange(1)" :class="sort == '1' ? 'sort-change' : 'sortnochange'">
                    <text>已过期</text>
                </view>
            </view>
        </u-sticky>
        <u-empty v-if="list.length <= 0" icon="/static/nono.png" text="还没有优惠券" marginTop="100"></u-empty>

        <!-- 待使用 -->
        <div class="stamp stamp01" v-for="(item,index) in list" :key="index" v-if="sort == 0">
            <div class="par">
                <p style="display: block;font-size: 12px;width: 100%;">{{item.name}}</p><sub
                    class="sign">￥</sub><span>{{Number(item.amount).toFixed(2)}}</span><sub>优惠券</sub>
            </div>
            <div class="copy">有效期<p>{{item.start_time}}<br>{{item.end_time}}<br>满{{item.min}}可用</p>
            </div>
            <i></i>
        </div>


        <!-- 已使用 -->
        <div class="stamp stamp02" v-for="(item,index) in list" :key="index" v-if="sort == 2">
            <div class="par">
                <p style="display: block;font-size: 12px;width: 100%;">{{item.name}}</p>
                <sub class="sign">￥</sub><span>{{Number(item.amount).toFixed(2)}}</span><sub>优惠券</sub>
            </div>
            <div class="copy">有效期<p>{{item.start_time}}<br>{{item.end_time}}<br>满{{item.min}}可用</p>
            </div>
            <i></i>
        </div>

        <!-- 已过期 -->
        <div class="stamp stamp03" v-for="(item,index) in list" :key="index" v-if="sort == 1">
            <div class="par">
                <p style="display: block;font-size: 12px;width: 100%;">{{item.name}}</p>
                <sub class="sign">￥</sub><span>{{Number(item.amount).toFixed(2)}}</span><sub>优惠券</sub>
            </div>
            <div class="copy">有效期<p>{{item.start_time}}<br>{{item.end_time}}<br>满{{item.min}}可用</p>
            </div>
            <i></i>
        </div>


        <u-loadmore :status="status" v-if="list.length >= 10" :dashed="false" marginTop="30" :line="true"
            @loadmore="loadmore" />
        <view style="height: 60px; width: 100%;"></view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                sort: 0,
                list: [],
                page: 1,
                total: '',
                status: 'loadmore',
            }
        },
        onLoad() {
            this.hs(true, 'get', `/api/order/couponList?limit=10&page=${this.page}&status=${this.sort}`, '', (res) => {
                this.list = res.data.data
            })
        },
        methods: {
            sortChange(state) {
                this.page = 1
                this.sort = state
                this.hs(true, 'get', `/api/order/couponList?limit=10&page=${this.page}&status=${this.sort}`, '', (
                    res) => {
                    this.list = res.data.data
                })
            },
            loadmore() {
                if (this.list.length >= this.total) return this.status = 'nomore'
                this.page++
                this.status = 'loading'

                this.hs(false, 'get',
                    `/api/order/couponList?limit=10&page=${this.page}&status=${this.sort}`,
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
        onReachBottom() {
            if (this.list.length >= this.total) return this.status = 'nomore'
            this.page++
            this.status = 'loading'

            this.hs(false, 'get',
                `/api/order/couponList?limit=10&page=${this.page}&status=${this.sort}`,
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


    .stamp * {
        padding: 0;
        margin: 0;
        list-style: none;
        font-family: "Microsoft YaHei", 'Source Code Pro', Menlo, Consolas, Monaco, monospace;
    }

    .stamp {
        width: 360px;
        height: 100px;
        padding: 0 10px;
        margin-left: calc(50% - 190px);
        margin-bottom: 20px;
        position: relative;
        overflow: hidden;
    }

    .stamp:before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 10px;
        right: 10px;
        z-index: -1;
    }

    .stamp i {
        position: absolute;
        left: 20%;
        top: 45px;
        height: 160px;
        width: 390px;
        background-color: rgba(255, 255, 255, .15);
        transform: rotate(-30deg);
    }

    .stamp .par {
        float: left;
        padding: 16px 15px;
        width: 160px;
        border-right: 2px dashed rgba(255, 255, 255, .3);
        text-align: left;
        display: flex;
        align-items: baseline;
        vertical-align: text-bottom;
        flex-wrap: wrap;
    }

    .stamp .par p {
        color: #fff;
        font-size: 16px;
        line-height: 21px;
    }

    .stamp .par span {
        font-size: 30px;
        color: #fff;
        margin-right: 5px;
        line-height: 60px;
    }

    .stamp .par .sign {
        font-size: 24px;
    }

    .stamp .par sub {
        position: relative;
        top: 0px;
        color: rgba(255, 255, 255, .8);
    }

    .stamp .copy {
        display: inline-block;
        padding: 11px 5px;
        width: 150px;
        vertical-align: text-bottom;
        font-size: 15px;
        color: rgb(255, 255, 255);
        text-align: center;
        line-height: initial;
    }

    .stamp .copy p {
        font-size: 13px;
        margin-top: 2px;
    }

    .stamp01 {
        background: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0) 5px, #F39B00 5px);
        background-size: 15px 15px;
        background-position: 9px 3px;
    }

    .stamp01:before {
        background-color: #F39B00;
    }

    .stamp02 {
        background: radial-gradient(transparent 0, transparent 5px, #D24161 5px);
        background-size: 15px 15px;
        background-position: 9px 3px;
    }

    .stamp02:before {
        background-color: #D24161;
    }

    .stamp03 {
        background: radial-gradient(transparent 0, transparent 5px, #7EAB1E 5px);
        background-size: 15px 15px;
        background-position: 9px 3px;
    }

    .stamp03:before {
        background-color: #7EAB1E;
    }



    .stamp03 .copy p {
        font-size: 14px;
        margin-top: 2px;
        // margin-bottom: 8px;
    }

    .stamp03 .copy a {
        background-color: #fff;
        color: #333;
        font-size: 14px;
        text-decoration: none;
        padding: 5px 10px;
        border-radius: 3px;
        display: block;
    }
</style>
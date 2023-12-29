<template>
    <view>

        <view v-for="(item,index) in list" class="item" :key="index">
            <view class="info">
                <image src="../../static/def-no.png" mode=""></image>
                <view class="my">
                    <u--text format="encrypt" class="text" :block="true" color="#333" size="14" :lines="1"
                        :text="item.username == null || item.username == '' ? '管理员发布' : item.username"
                        :mode="item.is_anonymous == 1 ? 'name' : 'text'"></u--text>
                    <text class="time">{{item.create_time}}评价</text>
                </view>
            </view>
            <view style="padding-left: 55px;box-sizing: border-box;">
                <text class="content">{{item.content}}</text>
                <view class="star">综合评分：<u-rate :count="5" :value="item.star" readonly></u-rate></view>
            </view>
        </view>


        <u-empty v-if="list.length <= 0" icon="/static/nono.png" text="还没有好评" marginTop="100"></u-empty>
        <u-loadmore :status="status" v-if="list.length >= 10" :dashed="false" marginTop="30" :line="true"
            @loadmore="loadmore" />
        <view style="height: 60px; width: 100%;"></view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                id: '',
                list: [],
                page: 1,
                total: '',
                status: 'loadmore',
            }
        },
        onLoad(e) {
            this.id = e.id
            this.hs(true, 'get', `/api/commodity/comment?limit=10&product_id=${this.id}&page=${this.page}`, '', (
                res) => {
                this.list = res.data.data
                this.total = res.data.total
            })
        },
        methods: {

            loadmore() {
                if (this.list.length >= this.total) return this.status = 'nomore'
                this.page++
                this.status = 'loading'

                this.hs(false, 'get',
                    `/api/commodity/comment?limit=10&product_id=${this.id}&page=${this.page}`,
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
                `/api/commodity/comment?limit=10&product_id=${this.id}&page=${this.page}`,
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
    page,
    .content {
        width: 100%;
        height: 100%;
        background-color: #F5F5F5;
    }

    .item {
        padding: 15px 10px;
        background-color: #fff;
        margin-bottom: 15px;
        width: 100%;
        box-sizing: border-box;
        position: relative;

        .del {
            position: absolute;
            top: 15px;
            right: 15px;
            font-size: 13px;
            color: #aaa;
        }

        .time {
            display: block;
            width: 100%;
            font-size: 12px;
            color: #aaa;
        }

        .content {
            display: block;
            margin: 5px 0;
            font-size: 15px;
            line-height: 25px;
            background-color: #fff;

        }

        .star {
            display: flex;
            width: 100%;
            font-size: 12px;
            color: #aaa;
            align-items: center;
        }

        .info {
            margin-bottom: 5px;
            height: 45px;
            width: 100%;
            display: flex;
            align-items: center;
            overflow: hidden;
            border-radius: 5px;

            image {
                width: 45px;
                height: 45px;
                display: block;
                margin-right: 10px;
            }

            .my {}

            .text {
                font-size: 14px;
                color: #333;
                display: block;
                margin-bottom: 4px;
            }
        }
    }
</style>
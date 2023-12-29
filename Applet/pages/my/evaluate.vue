<template>
    <view>
        <view v-for="(item,index) in list" class="item" :key="index">
            <text class="time">{{item.create_time}}评价</text>
            <text class="content">{{item.content}}</text>
            <text class="star">综合评分：{{item.star}}星 {{item.is_anonymous == 1 ? '|  匿名评论' : ''}}</text>
            <view class="info" @click="info(item.product_id)">
                <image :src="apiUrl() + item.product_img.split(',')[0]" mode=""></image>
                <!-- <text>{{item.product_name}}</text> -->
                <u--text class="text" :block="true" color="#333" size="14" :lines="1"
                    :text="item.product_name"></u--text>
            </view>
            <view class="del" @click="del(item.id)">
                <u-icon name="trash" color="#aaa" size="17"></u-icon>
            </view>
        </view>
        <u-empty v-if="list.length <= 0" icon="/static/nono.png" text="还没有发布过评价" marginTop="100"></u-empty>

        <u-modal @confirm="delEva" @cancel="closeDel" @close="closeDel" :closeOnClickOverlay="true" :show="show"
            title="确认删除吗" content='确认要删除这条评价吗,删除后不可恢复!' :showConfirmButton="true" :showCancelButton="true"
            :buttonReverse="true"></u-modal>
        <u-loadmore :status="status" v-if="list.length >= 10" :dashed="false" marginTop="30" :line="true"
            @loadmore="loadmore" />
        <view style="height: 60px; width: 100%;"></view>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                list: [],
                page: 1,
                total: '',
                status: 'loadmore',
                show: false,
                delId: ''
            }
        },
        onLoad() {
            this.hs(true, 'get', `/api/order/myCommentList?limit=10&page=${this.page}`, '', (res) => {
                this.list = res.data.data
                this.total = res.data.total
            })
        },
        methods: {
            info(id) {
                uni.navigateTo({
                    url: '/pages/commodityInfo/commodityInfo?id=' + id
                })
            },
            del(id) {
                this.delId = id
                this.show = true
            },
            closeDel() {
                this.show = false
            },
            delEva() {
                this.hs(true, 'delete', '/api/order/deleteComment?commentId=' + this.delId, '', (res) => {
                    let arr = this.list.filter(item => {
                        return item.id != this.delId
                    })
                    this.list = arr
                    this.show = false
                    this.tw('删除成功')
                })
            },
            loadmore() {
                if (this.list.length >= this.total) return this.status = 'nomore'
                this.page++
                this.status = 'loading'

                this.hs(false, 'get',
                    `/api/order/myCommentList?limit=10&page=${this.page}`,
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
                `/api/order/myCommentList?limit=10&page=${this.page}`,
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
            display: block;
            width: 100%;
            font-size: 12px;
            color: #aaa;
        }

        .info {
            margin-top: 8px;
            background-color: #F5F5F5;
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

            .text {
                font-size: 14px;
                color: #333;
                display: block;
                margin-left: 10px;
            }
        }
    }
</style>
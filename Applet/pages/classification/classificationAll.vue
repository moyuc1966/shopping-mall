<template>
    <view>
        <view class="search-box" style="background: none;width: calc(100% - 28px);margin-bottom: 12px;">
            <u-search placeholder="搜索分类" @change="searchFun" :showAction="false" v-model="name"></u-search>
        </view>
        <view class="box">
            <view v-for="(item,index) in list" class="item" :key="index" @click="classification(item.id,item.name)">
                <image :src="apiUrl() + item.icon" mode=""></image>
                <text>{{item.name}}</text>
            </view>
        </view>
        <u-empty v-if="list.length <= 0" icon="/static/nono.png" text="暂无商品分类" marginTop="100"></u-empty>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                list: [],
                name: '',
                datalist: []
            }
        },
        onLoad() {
            this.hs(true, 'get', '/api/public/category', '', (res) => {
                this.list = res.data.data

                this.datalist = this.list
            })
        },
        methods: {
            classification(id, name) {
                uni.navigateTo({
                    url: '/pages/classification/classification?id=' + id + '&name=' + name
                })
            },
            searchFun() {
                if (this.name == '' || this.name == ' ') return this.list = this.datalist
                const matchingElements = this.datalist.filter(obj =>
                    obj.name.includes(this.name)
                );
                this.list = matchingElements
            }
        }
    }
</script>

<style lang="less">
    .search-box {
        width: 100%;
        margin: 0 auto;
        margin-top: 15px;
    }

    .box {
        width: 100%;
        display: flex;
        padding: 12px 7px;
        padding-top: 15px;
        background: #fff;
        flex-wrap: wrap;

        .item {
            padding: 0 6px;
            margin-left: 8px;
            margin-bottom: 25px;

            image {
                width: 42px;
                height: 42px;
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
    }
</style>
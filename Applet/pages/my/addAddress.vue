<template>
    <view class="main">
        <view class="item" style="margin-top: 15px;">
            <text class="label">收货人</text>
            <input type="text" class="value" v-model="info.name" placeholder="请输入收货人姓名" />
        </view>
        <view class="item">
            <text class="label">手机号</text>
            <input type="number" class="value" v-model="info.phone" placeholder="请输入收货人手机号" />
        </view>
        <view class="item">
            <text class="label">所在地区</text>

            <picker @change="bindPickerChange" mode="region" class="value">
                <input type="text" class="value" :disabled="true"
                    :value="info.province + (info.city == info.province ? '' : info.city) + info.county"
                    placeholder="请选择所在地址" />
            </picker>
        </view>
        <view class="item other">
            <text class="label">详细地址</text>
            <textarea class="value" v-model="info.address_detail" placeholder="请输入详细地址" />
        </view>
        <text class="setDef" v-if="isEdit && info.is_default != 1" @click="setDef">设置为默认地址</text>




        <!-- 新增按钮 -->
        <view class="button" v-if="!isEdit" @click="post">
            提交
        </view>

        <!-- 修改按钮 -->
        <view class="editButton" v-else>
            <view class="button del" @click="del">
                删除
            </view>
            <view class="button b_edit" @click="put">
                保存
            </view>
        </view>
        <u-modal @confirm="relayDel" @cancel="closeDel" @close="closeDel" :closeOnClickOverlay="true" :show="show"
            title="确认删除吗" content='确认要删除这个地址吗,删除后不可恢复!' :showConfirmButton="true" :showCancelButton="true"
            :buttonReverse="true"></u-modal>
    </view>
</template>

<script>
    export default {
        data() {
            return {
                id: '',
                isEdit: false,
                info: {
                    address_detail: '',
                    county: '',
                    city: '',
                    province: '',
                    phone: '',
                    name: ''
                },
                show: false
            }
        },
        onLoad(e) {
            this.id = e.id
            if (this.id == '' || this.id == null) {
                this.isEdit = false
            } else {
                this.isEdit = true
                this.hs(true, 'get', '/api/user/addressDetail?id=' + e.id, '', (res) => {
                    this.info = res.data.data
                })
            }
        },
        methods: {
            //新增
            post() {
                if (this.info.name == '' || this.info.phone == '' || this.info.province == '' || this.info.city == '' ||
                    this.info.county == '' || this.info.address_detail == '') return this.tw('请输入完整')
                if (this.info.address_detail.length < 5) return this.tw('详细地址至少5个字')
                let reg = /^(?:(?:\+|00)86)?1[3-9]\d{9}$/
                if (!reg.test(this.info.phone)) return this.tw('请输入合法的手机号')
                this.hs(true, 'post', '/api/user/addAddress', this.info, (res) => {
                    if (res.data.code == 200) {
                        this.tw('添加成功')
                        setTimeout(() => {
                            uni.navigateBack({
                                delta: 1
                            })
                        }, 800)
                    } else {
                        this.tw(res.data.msg)
                    }
                })
            },

            //修改
            put() {
                this.hs(true, 'put', '/api/user/editAddress', this.info, (res) => {
                    if (res.data.code == 200) {
                        this.tw('修改成功')
                        setTimeout(() => {
                            uni.navigateBack({
                                delta: 1
                            })
                        }, 800)
                    } else {
                        this.tw(res.data.msg)
                    }
                })
            },
            setDef() {
                this.hs(true, 'put', '/api/user/setDefaultAddress', {
                    id: this.info.id
                }, (res) => {
                    if (res.data.code == 200) {
                        this.tw('修改成功')
                        this.hs(false, 'get', '/api/user/addressDetail?id=' + this.id, '', (res) => {
                            this.info = res.data.data
                        })
                    } else {
                        this.tw(res.data.msg)
                    }
                })
            },
            del() {
                this.show = true
            },
            closeDel() {
                this.show = false
            },
            relayDel() {
                this.hs(true, 'delete', '/api/user/delAddress?id=' + this.info.id, '', (res) => {
                    if (res.data.code == 200) {
                        this.tw('删除成功')
                        setTimeout(() => {
                            uni.navigateBack({
                                delta: 1
                            })
                        }, 800)
                    } else {
                        this.tw(res.data.msg)
                    }
                })
            },
            bindPickerChange(e) {
                this.info.province = e.detail.value[0]
                this.info.city = e.detail.value[1]
                this.info.county = e.detail.value[2]
            }
        }
    }
</script>

<style lang="less">
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

    .editButton {
        width: 100%;
        position: fixed;
        bottom: 35px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        box-sizing: border-box;

        .b_edit {
            width: 60%;
            position: relative;
            left: 0;
        }

        .del {
            width: calc(40% - 10px);
            position: relative;
            left: 0;
            margin-right: 10px;
            color: #e75b2c;
            background-color: #F8CDBF;
        }
    }

    .setDef {
        display: block;
        margin-top: 15px;
        width: 100%;
        padding-right: 20px;
        text-align: right;
        font-size: 15px;
        color: #47c8ac;
        box-sizing: border-box;
    }

    .item {
        width: 100%;
        margin-bottom: 18px;
        display: flex;
        justify-content: space-between;
        padding: 0 20px;
        box-sizing: border-box;
        align-items: center;

        .label {
            display: block;
            margin-right: 8px;
            font-weight: bold;
            color: #333;
            width: 80px;
        }

        .value {
            min-height: 40px;
            padding: 3px 5px;
            background-color: #F5F6F8;
            border-radius: 5px;
            width: calc(100% - 80px);
        }
    }

    .other {
        align-items: flex-start;

        .value {
            padding: 8px 5px;
        }
    }
</style>
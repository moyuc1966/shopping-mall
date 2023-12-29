<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-calendar"></i> 订单详情
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container" style="position: relative;">
            <div class="buttons">
                <el-button type="primary" plain style="height: 32px;" @click="deliverShowClick">订单发货</el-button>
                <el-button type="primary" plain v-if="info.status == 1 || info.status == 2" @click="deliverShowClick"
                    style="height: 32px;">订单发货</el-button>
                <el-button type="primary" plain @click="upStatus = true" style="height: 32px;">修改订单状态</el-button>
                <el-button type="primary" plain v-if="info.delete_status == 1" style="height: 32px;"
                    @click="recoverOrderClick">恢复订单显示</el-button>
                <el-dropdown style="margin-left: 12px;">
                    <el-button style="height: 32px;">
                        删除订单<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-if="info.delete_status != 1"><span
                                @click="deleteOrderClick">隐藏订单</span></el-dropdown-item>
                        <el-dropdown-item><span @click="deleteOrderDetailAllClick">完全删除</span></el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
                <el-tooltip class="item" effect="dark" placement="bottom">
                    <div slot="content">退款后订单状态切换以及消息通知存在延迟，约2分钟同步退款结果，请不要重复操作<br><br>退款后小程序待发货由于微信T+1结算，状态同步会延迟一天左右</div>
                    <el-button :disabled="disa" type="danger" plain v-if="info.status != 0 && info.status != 6"
                        style="margin-left: 12px; width: 80px; height: 32px;" @click="refundOrderClick">订单退款</el-button>
                </el-tooltip>
            </div>
            <el-descriptions title="订单信息" border>
                <template slot="extra">
                    <el-button type="text" plain size="small" icon="el-icon-edit" @click="upRemClick">修改订单备注</el-button>
                </template>
                <el-descriptions-item label="订单隐藏状态" span="3" style="position: relative;">
                    <el-tag size="small" :type="info.delete_status == 1 ? 'danger' : 'success'">{{
                        info.delete_status == 1 ? '已删除' : '正常' }}</el-tag>
                    <i class="el-icon-question" @click="showTotal('已删除表示用户不可见，相当于逻辑删除，逻辑删除后订单依然存在于系统中，但是用户端将无法查看到订单')"
                        style="margin-left: 20px;right: 10px;cursor: pointer; font-size: 15px; color: #aaa;"></i>
                </el-descriptions-item>
                <el-descriptions-item label="订单号">{{ info.order_no }}</el-descriptions-item>
                <el-descriptions-item label="购买商品"><span style="display: block;max-width: 400px;">{{ info.product_name
                }}</span></el-descriptions-item>
                <el-descriptions-item label="购买规格">{{ info.product_specification_name }}</el-descriptions-item>
                <el-descriptions-item label="购买份数">{{ info.count }}份</el-descriptions-item>
                <el-descriptions-item label="订单状态" span="1">
                    <el-tag size="small" v-if="info.order_no" :type="map[info.status].type">{{ map[info.status].name
                    }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="订单邮费" span="1"><span style="color: red;">￥{{
                    Number(info.product_postage).toFixed(2)
                }}</span></el-descriptions-item>
                <el-descriptions-item label="下单时间">{{ info.create_time }}</el-descriptions-item>
                <el-descriptions-item label="支付时间">{{ info.pay_time }}</el-descriptions-item>
                <el-descriptions-item label="下单备注"><span style="display: block;max-width: 400px;">{{ info.remark
                }}</span></el-descriptions-item>
                <el-descriptions-item label="订单总价"><span style="color: red;">￥{{ Number(info.total_price).toFixed(2)
                }}</span></el-descriptions-item>
                <el-descriptions-item label="实付价格"><span style="color: red;">￥{{ Number(info.actual_price).toFixed(2)
                }}</span></el-descriptions-item>
                <el-descriptions-item label="微信支付订单id">{{ info.transaction_id }}</el-descriptions-item>
            </el-descriptions>
            <el-descriptions title="下单信息" border style="margin-top: 20px;">
                <el-descriptions-item label="下单用户uuid">{{ info.user_uuid }}</el-descriptions-item>
                <el-descriptions-item label="下单用户手机号">{{ info.user_phone }}</el-descriptions-item>
                <el-descriptions-item label="下单用户昵称">{{ info.user_username }}</el-descriptions-item>
                <el-descriptions-item label="下单ip" span="3">{{ info.ip }}</el-descriptions-item>
            </el-descriptions>
            <el-descriptions title="收货信息" border style="margin-top: 20px;">
                <template slot="extra">
                    <el-button type="text" plain size="small" icon="el-icon-edit" @click="upShowClick">修改收货信息</el-button>
                </template>
                <el-descriptions-item label="收货人姓名">{{ info.name }}</el-descriptions-item>
                <el-descriptions-item label="收货手机号">{{ info.phone }}</el-descriptions-item>
                <el-descriptions-item label="收货地址">{{ info.address }}</el-descriptions-item>
                <el-descriptions-item label="发货快递公司">{{ info.express_company }}</el-descriptions-item>
                <el-descriptions-item label="发货快递单号">{{ info.express_no }}</el-descriptions-item>
                <el-descriptions-item label="发货时间">{{ info.express_time }}</el-descriptions-item>
                <el-descriptions-item label="签收时间" span="3">{{ info.sign_time }}</el-descriptions-item>
            </el-descriptions>
            <el-descriptions title="商品信息" border style="margin-top: 20px;">
                <el-descriptions-item label="商品名称" span="3">{{ info.product_name }}</el-descriptions-item>
                <el-descriptions-item label="商品标签">{{ info.product_category }}</el-descriptions-item>
                <el-descriptions-item label="商品规格单价">￥{{ Number(info.product_specification_value).toFixed(2)
                }}</el-descriptions-item>
                <el-descriptions-item label="商品规格库存">{{ info.product_specification_stock }}份</el-descriptions-item>
                <el-descriptions-item label="商品简介">{{ info.product_brief }}</el-descriptions-item>
            </el-descriptions>
        </div>

        <!-- 修改收货信息 -->
        <el-dialog title="修改收货信息" :visible.sync="upShow" width="600px">
            <el-form>
                <el-form-item label="收货人姓名" label-width="100px">
                    <el-input v-model="upaddress.name" placeholder="请输入用户收货人姓名" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="收货人手机号" label-width="100px">
                    <el-input v-model="upaddress.phone" placeholder="请输入用户收货手机号" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="收货地址" label-width="100px">
                    <el-input type="textarea" placeholder="请输入用户的收货地址" v-model="upaddress.address"
                        autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="upShow = false">取 消</el-button>
                <el-button type="primary" @click="upPost">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 修改订单备注 -->
        <el-dialog title="修改订单备注" :visible.sync="upRemShow" width="600px">
            <el-form>
                <el-form-item label="订单备注" label-width="80px">
                    <el-input type="textarea" placeholder="请输入订单备注" v-model="upRemIUnfo" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="upRemShow = false">取 消</el-button>
                <el-button type="primary" @click="upRemPost">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 订单发货 -->
        <el-dialog title="填写快递信息" :visible.sync="deliverShow" width="500px">
            <el-form>
                <el-form-item label="快递公司" label-width="80px">
                    <el-autocomplete style="width:300px" class="inline-input" v-model="deliverInfo.express_company"
                        :fetch-suggestions="querySearch" placeholder="请输入快递公司"></el-autocomplete>
                </el-form-item>
                <el-form-item label="快递单号" label-width="80px">
                    <el-input style="width:300px" v-model="deliverInfo.express_no" placeholder="请输入快递单号"
                        autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="deliverShow = false">取 消</el-button>
                <el-button type="primary" @click="deliverOrderPost">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 修改订单状态 -->
        <el-dialog title="修改订单状态" :visible.sync="upStatus" width="500px">
            <el-form>
                <el-form-item label="订单状态" label-width="80px">
                    <el-select v-model="upStatusInfo" placeholder="请选择订单状态">
                        <el-option v-for="(item, index) in filteredMap" :key="index" :label="item.name" :value="index">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="upStatus = false">取 消</el-button>
                <el-button type="primary" @click="upStatusPost">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import bus from '../common/bus';
import { getOrderDetail, modifyOrderAddress, modifyOrderRemark, deleteOrder, recoverOrder, refundOrder, deleteOrderDetailAll, deliverOrder, modifyOrderStatus } from '../../api/index'
export default {
    data() {
        return {
            id: '',
            info: {},
            map: {
                0: {
                    name: '待支付',
                    type: 'danger'
                },
                1: {
                    name: '待发货',
                    type: 'warning'
                },
                3: {
                    name: '待收货',
                    type: ''
                },
                4: {
                    name: '待评价',
                    type: ''
                },
                5: {
                    name: '已完成',
                    type: 'success'
                },
                6: {
                    name: '已退款',
                    type: 'info'
                }
            },
            upaddress: {
                name: '',
                phone: '',
                address: ''
            },
            upShow: false,
            upRemIUnfo: '',
            upRemShow: false,
            deliverShow: false,
            deliverInfo: {
                express_company: '',
                express_no: ''
            },
            upStatus: false,
            upStatusInfo: '',
            disa: false
        }
    },
    computed: {
        filteredMap() {
            return Object.entries(this.map)
                .filter(([key, value]) => key !== '0' && key !== '3')
                .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
        }
    },
    methods: {
        getData() {
            getOrderDetail(this.id).then(res => {
                this.info = res.data
            })
        },
        showTotal(text) {
            this.$confirm(text, '提示', {
                confirmButtonText: '确定'
            })
        },
        upShowClick() {
            this.upaddress.name = this.info.name
            this.upaddress.phone = this.info.phone
            this.upaddress.address = this.info.address
            this.upShow = true
        },
        upPost() {
            if (this.upaddress.name == '' || this.upaddress.phone == '' || this.upaddress.address == '') {
                this.$message.error('请填写完整信息')
                return
            }
            this.$confirm('确认修改收货信息？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let data = {
                    id: this.id,
                    name: this.upaddress.name,
                    phone: this.upaddress.phone,
                    address: this.upaddress.address
                }
                modifyOrderAddress(data).then(res => {
                    if (res.code == 200) {
                        this.$message.success('修改成功')
                        this.upShow = false
                        this.getData()
                    } else {
                        this.$message.error(res.msg)
                    }
                })
            })
        },
        upRemClick() {
            this.upRemIUnfo = this.info.remark
            this.upRemShow = true
        },
        upRemPost() {
            if (this.upRemIUnfo == '') {
                this.$message.error('请填写完整信息')
                return
            }
            this.$confirm('确认修改订单备注？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let data = {
                    id: this.id,
                    remark: this.upRemIUnfo
                }
                modifyOrderRemark(data).then(res => {
                    if (res.code == 200) {
                        this.$message.success('修改成功')
                        this.upRemShow = false
                        this.getData()
                    } else {
                        this.$message.error(res.msg)
                    }
                })
            })
        },
        //逻辑删除订单
        deleteOrderClick() {
            this.$confirm('确认隐藏订单？隐藏订单后用户端将无法获取到此数据', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteOrder(this.id).then(res => {
                    if (res.code == 200) {
                        this.$message.success('隐藏成功')
                        this.getData()
                    } else {
                        this.$message.error(res.msg)
                    }
                })
            })
        },
        //恢复订单显示
        recoverOrderClick() {
            this.$confirm('确认恢复订单？恢复订单后用户端将可以获取到此数据', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                recoverOrder({
                    id: this.id
                }).then(res => {
                    if (res.code == 200) {
                        this.$message.success('恢复成功')
                        this.getData()
                    } else {
                        this.$message.error(res.msg)
                    }
                })
            })
        },
        //删除订单
        deleteOrderDetailAllClick() {
            this.$confirm('确认删除订单？删除订单后将无法恢复', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteOrderDetailAll(this.id).then(res => {
                    if (res.code == 200) {
                        this.$message.success('删除成功')
                        bus.$emit('close_current_tags');
                    } else {
                        this.$message.error(res.msg)
                    }
                })
            })
        },
        deliverShowClick() {
            this.deliverInfo.express_no = ''
            this.deliverShow = true
        },
        deliverOrderPost() {
            if (this.deliverInfo.express_company == '' || this.deliverInfo.express_no == '') {
                this.$message.error('请填写完整信息')
                return
            }
            this.$confirm('确认发货？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let data = {
                    id: this.id,
                    express_company: this.deliverInfo.express_company,
                    express_no: this.deliverInfo.express_no
                }

                deliverOrder(data).then(res => {
                    if (res.code == 200) {
                        this.$message.success('发货成功')
                        this.deliverShow = false
                        this.getData()
                    } else {
                        this.$message.error(res.msg)
                    }
                })
            })
        },
        createFilter(queryString) {
            return (restaurant) => {
                return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
            };
        },
        querySearch(queryString, cb) {
            let restaurants = this.restaurants;
            let results = queryString ? restaurants.filter(this.createFilter(queryString)) : restaurants;
            // 调用 callback 返回建议列表的数据
            cb(results);
        },
        loadAll() {
            return [
                { "value": "顺丰速运" },
                { "value": '京东' },
                { "value": "韵达快递" },
                { "value": "中通快递" },
                { "value": "圆通速递" },
                { "value": "申通快递" },
                { "value": "邮政EMS" },
                { "value": "汇通快递" },
                { "value": "德邦快递" },
                { "value": "丰网速运" },
                { "value": "百世快递" },
                { "value": "极兔速递" },
                { "value": "安能物流" },
                { "value": "宅急送" },
            ];
        },
        upStatusPost() {
            this.$confirm('确认修改订单状态？强制修改订单状态会出现一些不可控问题', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let data = {
                    id: this.id,
                    status: this.upStatusInfo
                }
                modifyOrderStatus(data).then(res => {
                    if (res.code == 200) {
                        this.$message.success('修改成功')
                        this.upStatus = false
                        this.getData()
                    } else {
                        this.$message.error(res.msg)
                    }
                })
            })
        },
        //订单退款
        refundOrderClick() {
            this.$confirm('确认退款？退款后将无法恢复，且退款后订单状态和退款需要一段时间后生效', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$prompt('请输入退款金额，退款后订单状态需要一段时间等待退款到账后切换', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputPattern: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
                    inputErrorMessage: '请输入正确的退款金额'
                }).then(({ value }) => {
                    const refundAmount = Number(value);
                    if (refundAmount <= 0 || refundAmount > this.info.actual_price) {
                        this.$message({
                            type: 'error',
                            message: '退款金额必须大于0且不能超过实际价格'
                        });
                    } else {
                        //提交退款
                        refundOrder({
                            orderId: this.info.order_no,
                            refund_amount: refundAmount
                        }).then(res => {
                            if (res.code == 200) {
                                this.$message.success('退款成功')
                                this.disa = true
                                this.getData()
                            } else {
                                this.$message.error(res.msg)
                            }
                        })
                    }
                });
            })
        }
    },
    mounted() {
        this.id = this.$route.query.id
        this.getData()
        this.restaurants = this.loadAll();
    },
}
</script>

<style scoped>
.item {
    width: 100%;
    height: 40px;
    display: flex;
    align-content: center;
    margin-bottom: 20px;
}

.nono {
    display: block;
    width: 100%;
    line-height: 100px;
    text-align: center;
    font-size: 14px;
    background: #f0f0f0;
    color: #aaa;
}

.editor-btn {
    margin-top: 20px;
}

.my-label {
    display: block;
    width: 80px;
    text-align: right;
    font-size: 14px;
    color: #606266;
    padding: 0 12px 0 0;
    box-sizing: border-box;
}

.my- {
    display: block;
    font-size: 15px;
    font-weight: bold;
}

.flex {
    display: flex;
    width: 100%;
    height: 100%;
}

.spebox {
    border: 1px dashed #aaa;
    padding: 10px;
    box-sizing: border-box;
    min-height: 100px;
}

.buttons {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
}
</style>

<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 商品列表
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box" style="position: relative;">
                <el-button icon="el-icon-refresh-right" circle @click="getData"
                    style="position: absolute;right:0;"></el-button>
                <el-select @change="selectTypeChange" v-model="query.type" placeholder="选择搜索条件" class="handle-select mr10">
                    <el-option key="0" label="全部数据" value="all"></el-option>
                    <el-option key="6" label="订单号" value="order_no"></el-option>
                    <el-option key="1" label="收件人名称" value="name"></el-option>
                    <el-option key="2" label="下单ip地址" value="ip"></el-option>
                    <el-option key="3" label="优惠券名称" value="coupon"></el-option>
                    <el-option key="4" label="支付时间" value="pay_time"></el-option>
                    <el-option key="5" label="下单时间" value="create_time"></el-option>
                </el-select>
                <el-input clearable v-model="query.name" placeholder="搜索订单" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-dropdown style="position:absolute;right:60px;">
                    <el-button type="primary">
                        导出数据<i class="el-icon-arrow-down el-icon--right"></i>
                    </el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item><span @click="exproData('this')">导出当前页</span></el-dropdown-item>
                        <el-dropdown-item><span @click="exproData('all')">导出全部</span></el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>


            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
                <!-- <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column> -->
                <el-table-column prop="order_no" label="订单号" width="160" align="center"></el-table-column>
                <el-table-column prop="status" label="订单状态" width="90" align="center">
                    <template slot-scope="scope">
                        <el-tag size="small" :type="map[scope.row.status].type">{{ map[scope.row.status].name }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="商品名称" :show-overflow-tooltip="true" width="130">
                    <template slot-scope="scope">{{ scope.row.product_name }}</template>
                </el-table-column>
                <el-table-column label="商品图片" align="center" width="80">
                    <template slot-scope="scope">
                        <el-image class="table-td-thumb" :src="$api + scope.row.product_icon.split(',')[0]"
                            :preview-src-list="getImageUrlList(scope.row.product_icon)"></el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="product_specification_name" label="下单规格" :show-overflow-tooltip="true" width="100"
                    align="left"></el-table-column>
                <el-table-column prop="count" label="份数" width="70" align="center"></el-table-column>
                <el-table-column prop="total_price" label="订单总价" width="90" align="center"></el-table-column>
                <el-table-column prop="actual_price" label="实付金额" width="90" align="center"></el-table-column>
                <el-table-column prop="create_time" label="下单时间" width="156" align="center"></el-table-column>
                <el-table-column prop="remark" label="订单备注" :show-overflow-tooltip="true" width="120"
                    align="left"></el-table-column>
                <el-table-column prop="delete_status" label="删除状态" width="90" align="center">
                    <template slot-scope="scope">
                        <el-tag size="small" :type="scope.row.delete_status == 1 ? 'danger' : 'success'">{{
                            scope.row.delete_status == 1 ? '已删除' : '正常' }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="address" label="收货地址" :show-overflow-tooltip="true" width="130"
                    align="center"></el-table-column>
                <el-table-column prop="name" label="收货人姓名" :show-overflow-tooltip="true" width="100"
                    align="center"></el-table-column>
                <el-table-column prop="phone" label="收货手机号" :show-overflow-tooltip="true" width="110"
                    align="center"></el-table-column>



                <el-table-column label="操作" width="160" align="center" fixed="right">
                    <template slot-scope="scope">
                        <el-button type="text" v-if="scope.row.status == 1 || scope.row.status == 2" icon="el-icon-sell"
                            style="margin-right: 5px;" @click="deliverShowClick(scope.row)">订单发货</el-button>
                        <el-button type="text" icon="el-icon-circle-check" class="green"
                            @click="modifyOrderStatusOk(scope.row)" v-if="scope.row.status == 3 || scope.row.status == 4"
                            style="margin-right: 5px;">完成订单</el-button>
                        <el-button type="text" icon="el-icon-delete" class="red" @click="deleteOrderClick(scope.row)"
                            v-if="(scope.row.status == 5 || scope.row.status == 6 || scope.row.status == 0) && scope.row.delete_status == 0"
                            style="margin-right: 5px;">隐藏订单</el-button>
                        <el-button type="text" icon="el-icon-delete" class="orange" @click="recoverOrderClick(scope.row)"
                            v-if="(scope.row.status == 5 || scope.row.status == 6 || scope.row.status == 0) && scope.row.delete_status == 1"
                            style="margin-right: 5px;">取消隐藏</el-button>


                        <el-button type="text" icon="el-icon-tickets" style="margin-right: 5px;"
                            @click="info(scope.row.id)">详情</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next,sizes " :current-page="query.page"
                    :page-sizes="[10, 20, 30, 50]" :page-size="query.limit" :total="pageTotal"
                    @size-change="handleLimitChange" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

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
    </div>
</template>

<script>
import * as XLSX from 'xlsx'
import { getOrderList, searchOrderList, deliverOrder, recoverOrder, deleteOrder, modifyOrderStatus } from '../../api/index'
export default {
    name: 'basetable',
    data() {
        return {
            query: {
                type: 'all',
                name: '',
                page: 1,
                limit: 10,
                id: ''
            },
            pageTotal: 0,
            tableData: [],
            row: {},
            map: {
                0: {
                    name: '待支付',
                    type: 'danger'
                },
                1: {
                    name: '待发货',
                    type: 'warning'
                },
                2: {
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
            deliverShow: false,
            deliverInfo: {
                express_no: '',
                express_company: ''
            },
            restaurants: []
        };
    },
    activated() {
        this.restaurants = this.loadAll();
        this.getData();
    },
    methods: {
        // 获取数据
        getData() {
            let data = {
                page: this.query.page,
                limit: this.query.limit
            }
            getOrderList(data).then(res => {
                if (res.code == 200) {
                    this.tableData = res.data;
                    this.pageTotal = res.total;
                } else {
                    this.$message({
                        type: 'error',
                        message: res.msg
                    });
                }
            });
        },
        getImageUrlList(icon) {
            let arr = icon.split(',')
            arr = arr.map(item => {
                return this.$api + item
            })
            return arr
        },
        // 分页导航
        handlePageChange(val) {
            this.$set(this.query, 'page', val);
            this.getData();
        },
        handleLimitChange(val) {
            this.$set(this.query, 'limit', val);
            this.getData();
        },
        selectTypeChange(e) {
            if (e == 'all' && this.query.name != '') {
                this.getData()
                let query = {
                    type: 'all',
                    name: '',
                    id: '',
                    page: this.query.page,
                    limit: this.query.limit
                }
                this.query = query
                this.$message({
                    type: 'success',
                    message: '已切换为全部数据!'
                });
            }
        },
        // 触发搜索按钮
        handleSearch() {
            this.query.page = 1;
            if (this.query.name == '') {
                this.query.type = 'all';
                this.getData();
            } else {
                searchOrderList(this.query).then(res => {
                    if (res.code == 200) {
                        this.tableData = res.data;
                        this.pageTotal = res.total;
                        this.$message({
                            type: 'success',
                            message: '搜索完成!'
                        });
                    } else {
                        this.$message({
                            type: 'error',
                            message: res.msg
                        });
                    }
                });
            }
        },
        info(id) {
            this.$router.push({
                path: '/orderInfo',
                query: {
                    id: id
                }
            })
        },
        //逻辑删除订单
        deleteOrderClick(item) {
            this.$confirm('隐藏订单之后用户端将无法查看此订单, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteOrder(item.id).then(res => {
                    if (res.code == 200) {
                        this.$message.success('删除成功')
                        this.getData()
                    } else {
                        this.$message.console.error(res.msg);
                    }
                })
            })
        },
        //逻辑恢复订单
        recoverOrderClick(item) {
            this.$confirm('恢复订单之后用户端将可以重新查看此订单, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                recoverOrder({
                    id: item.id
                }).then(res => {
                    if (res.code == 200) {
                        this.$message.success('恢复成功')
                        this.getData()
                    } else {
                        this.$message.console.error(res.msg);
                    }
                })
            })
        },
        //完成订单
        modifyOrderStatusOk(item) {
            this.$confirm('完成订单后用户将无法评价订单，未收货的订单将会强制转换为已收货且无法评价，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                modifyOrderStatus({
                    id: item.id,
                    status: 5
                }).then(res => {
                    if (res.code == 200) {
                        this.$message.success('订单已完成')
                        this.getData()
                    } else {
                        this.$message.console.error(res.msg);
                    }
                })
            })
        },
        deliverShowClick(item) {
            this.row = item
            this.deliverInfo.express_no = ''
            this.deliverShow = true
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
        deliverOrderPost() {
            if (this.deliverInfo.express_company == '' || this.deliverInfo.express_no == '') return this.$message.error('请输入完整')
            this.$confirm(`请检查快递信息填写是否正确，操作订单号${this.row.order_no}，是否继续？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deliverOrder({
                    id: this.row.id,
                    express_no: this.deliverInfo.express_no,
                    express_company: this.deliverInfo.express_company
                }).then(res => {
                    if (res.code == 200) {
                        this.$message.success('发货完成')
                        this.getData()
                        this.deliverShow = false
                    } else {
                        this.$message.console.error(res.msg);
                    }
                })
            })
        },
        exproData(type) {
            console.log(111);
            let head = ['序号', '订单号', '下单用户uuid', '下单用户昵称', '下单用户手机号', '订单总价', '实付款',
                '订单状态', '创建时间', '支付时间', '下单ip', '订单备注', '商品名称', '所选规格', '下单份数',
                '所选规格库存', '商品图片', '商品邮费', '订单是否隐藏', '收货人姓名', '收货人手机号', '收货人地址',
                '快递公司', '快递单号', '发货时间', '签收时间', '微信支付订单号'] //表头

            let getDate = (data) => {
                let arr = []
                data.forEach((item, index) => {
                    let rowData = []
                    //导出内容的字段
                    rowData = [
                        index + 1,
                        item.order_no,
                        item.user_uuid,
                        item.user_username,
                        item.user_phone,
                        item.total_price,
                        item.actual_price,
                        this.map[item.status].name,
                        item.create_time,
                        item.pay_time,
                        item.ip,
                        item.remark,
                        item.product_name,
                        item.product_specification_name,
                        item.count,
                        item.product_specification_stock,
                        item.product_icon,
                        item.product_postage,
                        item.delete_status == 1 ? '已删除，用户不可见' : '正常',
                        item.name,
                        item.phone,
                        item.address,
                        item.express_company,
                        item.express_no,
                        item.express_time,
                        item.sign_time,
                        item.transaction_id

                    ]
                    arr.push(rowData)
                });
                return arr
            }


            if (type == 'all') {
                //导出全部
                getOrderList({
                    page: 1,
                    limit: this.pageTotal
                }).then(res => {
                    if (res.code != 200) return this.$message.error(res.msg)
                    if (res.data.length == 0) return thius.$message.error('导出数据为空')
                    let data = [head, ...getDate(res.data)]

                    let workSheet = XLSX.utils.aoa_to_sheet(data);
                    let bookNew = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(bookNew, workSheet, '系统订单') // 工作簿名称
                    let name = '系统订单-全部导出' + '.xlsx'
                    XLSX.writeFile(bookNew, name) // 保存的文件名
                })

            } else {
                //导出当前页
                let data = [head, ...getDate(this.tableData)]

                console.log(data);

                let workSheet = XLSX.utils.aoa_to_sheet(data);
                let bookNew = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(bookNew, workSheet, '系统订单') // 工作簿名称
                let name = '系统订单-当前页导出' + '.xlsx'
                XLSX.writeFile(bookNew, name) // 保存的文件名
            }
        }

    }
};
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
    position: relative;
}

.add-button {
    position: absolute;
    right: 15px;
}

.handle-select {
    width: 120px;
}

.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-uploader .el-upload:hover {
    border-color: #409EFF;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    line-height: 100px;
    text-align: center;
}

.avatar {
    width: 100px;
    height: 100px;
    display: block;
}

.avatar-uploader /deep/ .el-upload--text {
    width: 100px !important;
    height: 100px !important;
}

.handle-input {
    width: 300px;
    display: inline-block;
}

.table {
    width: 100%;
    font-size: 14px;
}

.red {
    color: #ff0000;
}

.green {
    color: #67c23a;
}

/* 橙色 */
.orange {
    color: #f5936c;
}

.mr10 {
    margin-right: 10px;
}

.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
</style>

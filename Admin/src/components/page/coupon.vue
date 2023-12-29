<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 系统优惠券管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box" style="position: relative;">
                <el-button icon="el-icon-refresh-right" circle @click="getData"
                    style="position: absolute;right:140px;"></el-button>
                <el-select v-model="query.type" @change="selectTypeChange" placeholder="选择搜索条件" class="handle-select mr10">
                    <el-option key="1" label="全部优惠券" value="all"></el-option>
                    <el-option key="2" label="指定用户" value="user"></el-option>
                </el-select>
                <el-input clearable v-model="query.name" placeholder="搜索用户" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="primary" class="add-button" icon="el-icon-circle-plus-outline"
                    style="position: absolute;right: 0;" @click="addShow = true">新增优惠券</el-button>
            </div>


            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
                <!-- <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column> -->
                <el-table-column label="优惠券名称" :show-overflow-tooltip="true" width="160">
                    <template slot-scope="scope">{{ scope.row.name }}</template>
                </el-table-column>
                <el-table-column prop="user_uuid" label="所属用户UUID" width="170">
                    <template slot-scope="scope">
                        {{ scope.row.user_uuid == null ? '全部用户' : scope.row.user_uuid }}
                    </template>
                </el-table-column>
                <el-table-column prop="user_phone" :show-overflow-tooltip="true" label="所属用户手机号" width="140">
                    <template slot-scope="scope">
                        {{ scope.row.user_phone == null ? '全部用户' : scope.row.user_phone }}
                    </template>
                </el-table-column>
                <el-table-column prop="user_name" :show-overflow-tooltip="true" label="所属用户昵称" width="170">
                    <template slot-scope="scope">
                        {{ scope.row.user_name == null ? '全部用户' : scope.row.user_name }}
                    </template>
                </el-table-column>

                <el-table-column prop="min" label="使用门槛" width="90">
                    <template slot-scope="scope">
                        ￥{{ Number(scope.row.min).toFixed(2) }}
                    </template>
                </el-table-column>
                <el-table-column prop="amount" label="减免金额" width="90">
                    <template slot-scope="scope">
                        ￥{{ Number(scope.row.amount).toFixed(2) }}
                    </template>
                </el-table-column>
                <el-table-column prop="start_time" label="有效期开始" width="160"></el-table-column>
                <el-table-column prop="end_time" label="有效期结束" width="160" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="use_time" label="使用时间" width="160">
                    <template slot-scope="scope">
                        {{ scope.row.use_time == null ? '未使用' : scope.row.use_time }}
                    </template>
                </el-table-column>


                <el-table-column label="状态" align="center" width="90">
                    <template slot-scope="scope">
                        <el-tag
                            :type="scope.row.status == '0' ? 'success' : scope.row.status == '1' ? 'info' : 'warning'">{{
                                scope.row.status == '0' ? '正常' : scope.row.status == '1' ? '已过期' : '已使用' }}</el-tag>
                    </template>
                </el-table-column>


                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-tickets" class="green" style="margin-right: 5px;"
                            @click="editClick(scope.row)">编辑</el-button>
                        <el-button type="text" icon="el-icon-delete" class="red"
                            @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next,sizes " :current-page="query.page"
                    :page-sizes="[10, 20, 30, 50]" :page-size="query.limit" :total="pageTotal"
                    @size-change="handleLimitChange" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <el-dialog title="选择需要查看的用户" :visible.sync="show" @close="selectCloseFun">
            <div class="handle-box">
                <el-select v-model="userQuery.type" placeholder="选择搜索条件" class="handle-select mr10">
                    <el-option key="1" label="账号" value="name"></el-option>
                    <el-option key="2" label="手机号" value="phone"></el-option>
                </el-select>
                <el-input v-model="userQuery.name" placeholder="搜索用户" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="userhandleSearch">搜索</el-button>
            </div>
            <el-table :data="userData">
                <el-table-column prop="uuid" label="UUID" width="150"></el-table-column>
                <el-table-column prop="username" label="账号" width="200"></el-table-column>
                <el-table-column prop="phone" label="手机号"></el-table-column>
                <el-table-column prop="create_time" label="注册时间" width="160"></el-table-column>
                <el-table-column label="操作" width="140" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" v-if="editShow" icon="el-icon-edit"
                            @click="selectEditUser(scope.row)">选择用户</el-button>
                        <el-button type="text" v-if="addShow" icon="el-icon-edit"
                            @click="selectEditAdd(scope.row)">选择用户</el-button>
                        <el-button type="text" v-if="!editShow && !addShow" icon="el-icon-edit"
                            @click="selectUserOK(scope.row)">选择</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next,sizes " :current-page="userQuery.page"
                    :page-sizes="[10, 20, 30, 50]" :page-size="userQuery.limit" :total="userQuery.pageTotal"
                    @size-change="userhandleLimitChange" @current-change="userhandlePageChange"></el-pagination>
            </div>
        </el-dialog>

        <!-- 编辑优惠券 -->
        <el-dialog title="编辑优惠券" :visible.sync="editShow" width="560px">
            <el-form>
                <el-form-item label="优惠券名称" label-width="90px">
                    <el-input v-model="row.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="减免金额" label-width="90px">
                    <el-input type="number" v-model="row.amount" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="使用门槛" label-width="90px">
                    <el-input v-model="row.min" type="number" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="使用状态" label-width="90px">
                    <el-select @change="statusChange" :value="row.status == 0 ? '未使用' : row.status == 1 ? '已过期' : '已使用'"
                        placeholder="请选择活动区域">
                        <el-option label="未使用" value="0"></el-option>
                        <el-option label="已使用" value="2"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="有效期" label-width="90px">
                    <el-date-picker v-model="time" type="datetimerange" @change="timeChange" :picker-options="pickerOptions"
                        range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" align="right">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="使用人" label-width="90px">
                    <el-input :value="row.user_name == null ? '全部用户' : row.user_name" @focus="editChangeUser"
                        autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="editShow = false">取 消</el-button>
                <el-button type="primary" @click="editPost">确 定</el-button>
            </div>
        </el-dialog>

        <!-- 添加优惠券 -->
        <el-dialog title="添加优惠券" :visible.sync="addShow" width="560px">
            <el-form>
                <el-form-item label="优惠券名称" label-width="90px">
                    <el-input v-model="addInfo.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="减免金额" label-width="90px">
                    <el-input type="number" v-model="addInfo.amount" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="使用门槛" label-width="90px">
                    <el-input v-model="addInfo.min" type="number" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="有效期" label-width="90px">
                    <el-date-picker v-model="time" type="datetimerange" @change="timeChangeAdd"
                        :picker-options="pickerOptions" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                        align="right">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="使用人" label-width="90px">
                    <el-input :value="addInfo.user_name == null ? '全部用户' : addInfo.user_name" @focus="editChangeUser"
                        autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addShow = false">取 消</el-button>
                <el-button type="primary" @click="addPost">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
         
<script>
import { getCouponList, deleteCoupon, getUserList, modifyCoupon, addCoupon } from '../../api/index'
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
            show: false,
            userData: [],
            userQuery: {
                type: 'name',
                name: '',
                page: 1,
                limit: 10,
                pageTotal: 0
            },
            row: {}, // 选中的行
            editShow: false,
            time: '',
            pickerOptions: {
                shortcuts: [{
                    text: '最近一周',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                        picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                        const end = new Date();
                        const start = new Date();
                        start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                        picker.$emit('pick', [start, end]);
                    }
                }]
            },
            addShow: false,
            addInfo: {
                name: '',
                amount: '',
                min: '',
                start_time: '',
                end_time: '',
                user_id: '',
                user_name: '',
                status: 0
            }
        };
    },
    activated() {
        this.getData();
    },
    methods: {
        // 获取数据
        getData() {
            getCouponList(this.query).then(res => {
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
        statusChange(e) {
            this.row.status = e
        },
        selectEditUser(item) {
            this.row.user_id = item.id
            this.row.user_name = item.username
            this.show = false
        },
        selectEditAdd(item) {
            this.addInfo.user_id = item.id
            this.addInfo.user_name = item.username
            this.show = false
        },
        timeChange(e) {
            //格式化时间函数，得到年-月-日 时:分:秒格式
            function formatTime(date) {
                var year = date.getFullYear()
                var month = date.getMonth() + 1
                var day = date.getDate()
                var hour = date.getHours()
                var minute = date.getMinutes()
                var second = date.getSeconds()
                return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
            }
            function formatNumber(n) {
                n = n.toString()
                return n[1] ? n : '0' + n
            }

            this.row.start_time = formatTime(e[0])
            this.row.end_time = formatTime(e[1])
        },
        timeChangeAdd(e) {
            function formatTime(date) {
                var year = date.getFullYear()
                var month = date.getMonth() + 1
                var day = date.getDate()
                var hour = date.getHours()
                var minute = date.getMinutes()
                var second = date.getSeconds()
                return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
            }
            function formatNumber(n) {
                n = n.toString()
                return n[1] ? n : '0' + n
            }

            this.addInfo.start_time = formatTime(e[0])
            this.addInfo.end_time = formatTime(e[1])
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
        handleDelete(index, row) {
            this.$confirm(`此操作将永久删除该数据, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteCoupon(row.id).then(res => {
                    if (res.code == 200) {
                        this.$message({
                            type: 'success',
                            message: '操作成功!'
                        });
                        this.getData(); // 刷新数据
                    } else {
                        this.$message({
                            type: 'error',
                            message: res.msg
                        });
                    }
                })
            })
        },
        getUserData() {
            getUserList(this.userQuery).then(res => {
                if (res.code == 200) {
                    this.userData = res.data;
                    this.userData.unshift({
                        "id": 0,
                        "uuid": "全部用户",
                        "username": "全部用户",
                        "openid": "全部用户",
                        "phone": "全部用户",
                        "create_time": "全部用户",
                        "status": 0,
                        "session_key": "",
                        "cart_count": 0,
                        "order_count": 0
                    })
                    this.userQuery.pageTotal = Number(res.total) + 1;
                } else {
                    this.$message({
                        type: 'error',
                        message: res.msg
                    });
                }
            });
        },
        editChangeUser() {
            this.getUserData()
            this.show = true
        },
        // 触发搜索按钮
        handleSearch() {
            if (this.query.type == 'all') {
                this.query.id = ''
                this.$set(this.query, 'page', 1);
                this.getData();
                this.$message({
                    type: 'success',
                    message: '已切换为全部优惠券数据'
                });
            } else {
                this.getUserData()
                this.show = true
            }
        },
        selectTypeChange(e) {
            this.handleSearch()
        },
        // 触发搜索按钮
        userhandleSearch() {
            this.$set(this.userQuery, 'page', 1);
            this.getUserData();
        },
        // 分页导航
        userhandlePageChange(val) {
            this.$set(this.userQuery, 'page', val);
            this.getUserData();
        },
        userhandleLimitChange(val) {
            this.$set(this.userQuery, 'limit', val);
            this.getUserData();
        },
        selectUserOK(row) {
            this.show = false
            this.query.name = row.username
            this.query.id = row.id

            this.getData()
        },
        editClick(row) {
            this.time = [new Date(row.start_time), new Date(row.end_time)]
            this.row = JSON.parse(JSON.stringify(row))
            this.editShow = true
        },
        editPost() {
            console.log(this.row);

            if (this.row.name == '' || this.row.amount === '' || this.row.min === '' || this.row.start_time == '' || this.row.end_time == '') {
                this.$message({
                    type: 'error',
                    message: '请填写完整信息'
                });
                return
            }
            modifyCoupon(this.row).then(res => {
                if (res.code == 200) {
                    this.$message({
                        type: 'success',
                        message: '操作成功!'
                    });
                    this.editShow = false
                    this.getData(); // 刷新数据
                } else {
                    this.$message({
                        type: 'error',
                        message: res.msg
                    });
                }
            })
        },
        addPost() {
            if (this.addInfo.name == '' || this.addInfo.amount === '' || this.addInfo.min === '' || this.addInfo.start_time == '' || this.addInfo.end_time == '') {
                this.$message({
                    type: 'error',
                    message: '请填写完整信息'
                });
                return
            }
            if (this.addInfo.min <= 0) {
                this.$message({
                    type: 'error',
                    message: '使用门槛必须大于0'
                });
                return
            }
            if (this.addInfo.amount <= 0) {
                this.$message({
                    type: 'error',
                    message: '减免金额必须大于0'
                });
                return
            }
            addCoupon(this.addInfo).then(res => {
                if (res.code == 200) {
                    this.$message({
                        type: 'success',
                        message: '操作成功!'
                    });
                    this.addShow = false
                    this.getData(); // 刷新数据
                } else {
                    this.$message({
                        type: 'error',
                        message: res.msg
                    });
                }
            })
        },
        selectCloseFun() {

            this.query.type = 'all'
            // this.handleSearch()
        }
    }
};
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
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

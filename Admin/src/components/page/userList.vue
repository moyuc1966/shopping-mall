<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 用户列表
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box" style="position: relative;">
                <el-button icon="el-icon-refresh-right" circle @click="getData"
                    style="position: absolute;right:0;"></el-button>
                <el-select v-model="query.type" placeholder="选择搜索条件" class="handle-select mr10">
                    <el-option key="1" label="账号" value="name"></el-option>
                    <el-option key="2" label="手机号" value="phone"></el-option>
                    <el-option key="3" label="UUID" value="uuid"></el-option>
                </el-select>
                <el-input clearable v-model="query.name" placeholder="搜索用户" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>


            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
                <!-- <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column> -->
                <el-table-column prop="uuid" label="UUID" width="170"></el-table-column>
                <el-table-column label="账号" width="150">
                    <template slot-scope="scope">{{ scope.row.username }}</template>
                </el-table-column>
                <el-table-column prop="openid" label="绑定微信id"></el-table-column>
                <el-table-column prop="phone" label="手机号" width="140"></el-table-column>
                <el-table-column label="状态" align="center" width="170">
                    <template slot-scope="scope">
                        <el-switch :value="scope.row.status" @change="userStatusChange(scope.row.status, scope.row.id)"
                            :active-value="0" :inactive-value="1" active-text="正常" inactive-text="封禁中">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column prop="cart_count" label="购物车" width="70"></el-table-column>
                <el-table-column prop="order_count" label="下单量" width="70"></el-table-column>
                <el-table-column prop="create_time" label="注册时间" width="160"></el-table-column>


                <el-table-column label="操作" width="140" align="center">
                    <template slot-scope="scope">
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
    </div>
</template>

<script>
import { getUserList, userStatus, userDelete } from '../../api/index'
export default {
    name: 'basetable',
    data() {
        return {
            query: {
                type: 'name',
                name: '',
                page: 1,
                limit: 10
            },
            tableData: [],
            pageTotal: 0,
        };
    },
    created() {
        this.getData();
    },
    methods: {
        // 获取数据
        getData() {
            getUserList(this.query).then(res => {
                this.tableData = res.data;
                this.pageTotal = res.total;
            });
        },
        // 触发搜索按钮
        handleSearch() {
            this.$set(this.query, 'page', 1);
            this.getData();
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
        // 用户状态切换
        userStatusChange(status, id) {
            let data = {
                status: status == 0 ? 1 : 0,
                id: id
            }
            let type = status == 0 ? '封禁' : '解封'
            this.$confirm(`此操作将${type}该用户, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                userStatus(data).then(res => {
                    this.$message({
                        type: 'success',
                        message: '操作成功!'
                    });
                    this.getData(); // 刷新数据
                })
            })
        },
        handleDelete(index, row) {

            this.$confirm(`此操作将永久删除该用户, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                userDelete(row.id).then(res => {
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

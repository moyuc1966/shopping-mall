<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 用户购物车管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box" style="position: relative;">
                <el-button icon="el-icon-refresh-right" circle @click="getData"
                    style="position: absolute;right:0;"></el-button>
                <el-select v-model="query.type" @change="selectTypeChange" placeholder="选择搜索条件" class="handle-select mr10">
                    <el-option key="1" label="全部用户" value="all"></el-option>
                    <el-option key="2" label="指定用户" value="user"></el-option>
                </el-select>
                <el-input clearable v-model="query.name" placeholder="搜索用户" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>


            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
                <!-- <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column> -->
                <el-table-column prop="user_uuid" label="所属用户UUID" width="170"></el-table-column>
                <el-table-column label="商品名称" :show-overflow-tooltip="true">
                    <template slot-scope="scope">{{ scope.row.product_name }}</template>
                </el-table-column>
                <el-table-column label="商品图片" align="center" width="80">
                    <template slot-scope="scope">
                        <el-image class="table-td-thumb" :src="$api + scope.row.product_icon.split(',')[0]"
                            :preview-src-list="getImageUrlList(scope.row.product_icon)"></el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="specification_name" label="规格"></el-table-column>
                <el-table-column prop="specification_value" label="价格" width="90"></el-table-column>
                <el-table-column prop="count" label="份数" width="80"></el-table-column>
                <el-table-column prop="specification_stock" label="规格库存" width="90"
                    :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="create_time" label="加入时间" width="170"
                    :show-overflow-tooltip="true"></el-table-column>
                <el-table-column label="是否勾选" align="center" width="120">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.checked == '1' ? 'success' : 'info'">{{ scope.row.checked == '1' ?
                            '已勾选' : '未勾选' }}</el-tag>
                    </template>
                </el-table-column>


                <el-table-column label="操作" width="170" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-tickets" class="green" style="margin-right: 5px;"
                            @click="info(scope.row.product_id)">查看商品</el-button>
                        <el-button type="text" icon="el-icon-delete" class="red"
                            @click="handleDelete(scope.$index, scope.row)">移除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next,sizes " :current-page="query.page"
                    :page-sizes="[1, 20, 30, 50]" :page-size="query.limit" :total="pageTotal"
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
                        <el-button type="text" icon="el-icon-edit" @click="selectUserOK(scope.row)">选择</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next,sizes " :current-page="userQuery.page"
                    :page-sizes="[10, 20, 30, 50]" :page-size="userQuery.limit" :total="userQuery.pageTotal"
                    @size-change="userhandleLimitChange" @current-change="userhandlePageChange"></el-pagination>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { getUserCart, userCartDelete, getUserList } from '../../api/index'
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
            }
        };
    },
    created() {
        this.getData();
    },
    methods: {
        // 获取数据
        getData() {
            getUserCart(this.query).then(res => {
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
        info(id) {
            this.$router.push({
                path: '/commodityInfo',
                query: {
                    id: id
                }
            })
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
        handleDelete(index, row) {

            this.$confirm(`此操作将该商品移除用户的购物车, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                userCartDelete(row.id).then(res => {
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
                    this.userQuery.pageTotal = res.total;
                } else {
                    this.$message({
                        type: 'error',
                        message: res.msg
                    });
                }
            });
        },


        // 触发搜索按钮
        handleSearch() {
            if (this.query.type == 'all') {
                this.query.id = ''
                this.$set(this.query, 'page', 1);
                this.getData();
                this.$message({
                    type: 'success',
                    message: '已切换为全部用户数据'
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

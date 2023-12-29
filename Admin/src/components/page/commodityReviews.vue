<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 商品评价管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box" style="position: relative;">
                <el-button icon="el-icon-refresh-right" circle @click="getData"
                    style="position: absolute;right:0;"></el-button>
                <el-select v-model="query.type" @change="selectTypeChange" placeholder="选择搜索条件" class="handle-select mr10">
                    <el-option key="1" label="全部商品" value="all"></el-option>
                    <el-option key="2" label="指定商品" value="user"></el-option>
                </el-select>
                <el-input clearable v-model="query.name" placeholder="搜索商品" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="selectTypeChange">搜索</el-button>
            </div>

            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
                <!-- <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column> -->
                <el-table-column prop="product_uuid" label="所属商品UUID" width="170"></el-table-column>
                <el-table-column label="商品名称" :show-overflow-tooltip="true" width="190">
                    <template slot-scope="scope">{{ scope.row.product_name }}</template>
                </el-table-column>
                <el-table-column label="商品图片" align="center" width="80">
                    <template slot-scope="scope">
                        <el-image class="table-td-thumb" :src="$api + scope.row.product_icon.split(',')[0]"
                            :preview-src-list="getImageUrlList(scope.row.product_icon)"></el-image>
                    </template>
                </el-table-column>
                <el-table-column label="发布用户UUID" align="center" width="170">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.user_id == 0">管理员发布</el-tag>
                        <span v-else>{{ scope.row.user_uuid }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="content" label="评价内容">
                    <!-- 保留一行，过长显示省略号 -->
                    <template slot-scope="scope">
                        <span class="overflow-ellipsis" @click="showInfo(scope.row.content)">{{ scope.row.content }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="star" label="评分" width="70"></el-table-column>
                <el-table-column prop="create_time" label="发布时间" width="165"
                    :show-overflow-tooltip="true"></el-table-column>
                <el-table-column label="是否匿名" align="center" width="100">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.is_anonymous == '1' ? 'info' : 'success'">{{ scope.row.is_anonymous == '1'
                            ?
                            '匿名' : '不匿名' }}</el-tag>
                    </template>
                </el-table-column>


                <el-table-column label="操作" width="240" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" class="green" style="margin-right: 5px;"
                            @click="editClick(scope.row, scope.$index)">编辑评价</el-button>
                        <el-button type="text" icon="el-icon-tickets" class="green" style="margin-right: 5px;"
                            @click="info(scope.row.product_id)">查看商品</el-button>
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
        <el-dialog title="修改商品评价" :visible.sync="editShow" width="400px">
            <el-form label-width="80px">
                <el-form-item label="评论内容">
                    <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="请输入评价内容" show-word-limit
                        v-model="edit.content" maxlength="200"></el-input>
                </el-form-item>
                <el-form-item label="商品评分">
                    <el-rate v-model="edit.star" :max="5"></el-rate>
                </el-form-item>
                <el-form-item label="是否匿名">
                    <el-radio-group v-model="edit.is_anonymous">
                        <el-radio :label="1">匿名</el-radio>
                        <el-radio :label="0">不匿名</el-radio>
                    </el-radio-group>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="editShow = false">取 消</el-button>
                <el-button type="primary" @click="editPost">提 交</el-button>
            </div>
        </el-dialog>

        <el-dialog title="选择需要查看的用户" :visible.sync="show" @close="selectCloseFun">
            <div class="handle-box">
                <el-select v-model="userQuery.type" placeholder="选择搜索条件" class="handle-select mr10">
                    <el-option key="1" label="商品名称" value="name"></el-option>
                    <el-option key="2" label="标签" value="category"></el-option>
                    <el-option key="3" label="UUID" value="uuid"></el-option>
                    <el-option key="4" label="简介" value="brief"></el-option>
                    <el-option key="5" label="分类名称" value="category_class"></el-option>
                </el-select>
                <el-input v-model="userQuery.name" placeholder="搜索商品" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="userhandleSearch">搜索</el-button>
            </div>
            <el-table :data="userData">
                <el-table-column prop="uuid" label="UUID" width="150"></el-table-column>
                <el-table-column label="商品名称" :show-overflow-tooltip="true">
                    <template slot-scope="scope">{{ scope.row.name }}</template>
                </el-table-column>
                <el-table-column label="商品图片" align="center" width="80">
                    <template slot-scope="scope">
                        <el-image class="table-td-thumb" :src="$api + scope.row.icon.split(',')[0]"></el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="category" label="商品标签" width="80" align="center"></el-table-column>
                <el-table-column prop="views" label="浏览量" width="80" align="center"></el-table-column>
                <el-table-column prop="actual_sales" label="真实销量" width="80" align="center"></el-table-column>
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
import { getProductCommentList, deleteProductComment, modifyProductComment, searchProduct } from '../../api/index'
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
            editShow: false,
            edit: {},
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
            getProductCommentList(this.query).then(res => {
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
            this.$confirm(`此操作将该评论删除，用户端也将看不到这条评价, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteProductComment(row.id).then(res => {
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
        showInfo(content) {
            this.$alert(content, '评价内容', {
                confirmButtonText: '确定'
            });
        },
        editClick(item, index) {
            this.edit = JSON.parse(JSON.stringify(item))
            this.editShow = true
        },
        editPost() {
            if (this.edit.content == '') return this.$message.error(('请输入评价内容'));
            modifyProductComment(this.edit).then(res => {
                if (res.code == 200) {
                    this.$message.success('修改成功')
                    this.editShow = false
                    this.getData()
                } else {
                    this.$message.error(res.msg)
                }
            })
        },
        selectTypeChange() {
            if (this.query.type == 'all') {
                this.query.id = ''
                this.$set(this.query, 'page', 1);
                this.getData();
                this.$message({
                    type: 'success',
                    message: '已切换为全部商品数据'
                });
                this.query.name = ''
            } else {
                this.getUserData()
                this.show = true
            }
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
        getUserData() {
            searchProduct(this.userQuery).then(res => {
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
        selectCloseFun() {

            this.query.type = 'all'
            // this.handleSearch()
        },


        selectUserOK(row) {
            this.show = false
            this.query.name = row.name
            this.query.id = row.id

            this.getData()
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

.overflow-ellipsis {
    display: block;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
}
</style>

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
                <el-button type="primary" @click="addShowClick" icon="el-icon-data-line"
                    class="handle-del mr10">一键补充库存</el-button>
                <el-select @change="selectTypeChange" v-model="query.type" placeholder="选择搜索条件" class="handle-select mr10">
                    <el-option key="0" label="全部数据" value="all"></el-option>
                    <el-option key="1" label="商品名称" value="name"></el-option>
                    <el-option key="2" label="标签" value="category"></el-option>
                    <el-option key="3" label="UUID" value="uuid"></el-option>
                    <el-option key="4" label="简介" value="brief"></el-option>
                    <el-option key="5" label="分类名称" value="category_class"></el-option>
                </el-select>
                <el-input clearable v-model="query.name" placeholder="搜索商品" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>


            <el-table @selection-change="handleSelectionChange" :data="tableData" border class="table" ref="multipleTable"
                header-cell-class-name="table-header">
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
                <el-table-column prop="uuid" label="UUID" width="170" align="center"></el-table-column>
                <el-table-column label="商品名称" :show-overflow-tooltip="true">
                    <template slot-scope="scope">{{ scope.row.name }}</template>
                </el-table-column>
                <el-table-column label="商品图片" align="center" width="80">
                    <template slot-scope="scope">
                        <el-image class="table-td-thumb" :src="$api + scope.row.icon.split(',')[0]"
                            :preview-src-list="getImageUrlList(scope.row.icon)"></el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="category" label="商品标签" width="80" align="center"></el-table-column>
                <el-table-column prop="views" label="浏览量" width="80" align="center"></el-table-column>
                <el-table-column prop="sales" label="展示销量" width="80" align="center"></el-table-column>
                <el-table-column prop="actual_sales" label="真实销量" width="80" align="center"></el-table-column>
                <el-table-column label="状态" align="center" width="170">
                    <template slot-scope="scope">
                        <el-switch :value="scope.row.status" @change="productStatusChange(scope.row.status, scope.row.id)"
                            :active-value="0" :inactive-value="1" active-text="上架中" inactive-text="已下架">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column prop="postage" label="邮费" width="95" align="center">
                    <template slot-scope="scope">
                        <span>{{ scope.row.postage == 0 ? '包邮' : '￥' + Number(scope.row.postage).toFixed(2) }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="popularity" label="人气" width="80" align="center"></el-table-column>
                <el-table-column prop="specification_count" label="规格数量" width="80" align="center"></el-table-column>
                <el-table-column prop="create_time" label="创建时间" width="160" align="center"></el-table-column>


                <el-table-column label="操作" width="130" align="center">
                    <template slot-scope="scope">
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
        <el-dialog title="一键补充商品规格库存" :visible.sync="addShow" width="400px">
            <el-form>
                <el-form-item label="补充数量" label-width="80px">
                    <el-tooltip class="item" effect="dark" content="增加数量，例如100，表示每个规格库存都增加100" placement="top-start">
                        <el-input v-model="stock" placeholder="请输入要增加的库存量" type="number" autocomplete="off"></el-input>
                    </el-tooltip>
                </el-form-item>
                <el-form-item label="随机差值" label-width="80px">
                    <el-tooltip class="item" effect="dark" content="非必选，例如填入10，表示会在库存增加时加1-10中的一个随机值"
                        placement="bottom-start">
                        <el-input v-model="random" placeholder="请输入随机差值" type="number" autocomplete="off"></el-input>
                    </el-tooltip>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addShow = false">取 消</el-button>
                <el-button type="primary" @click="handleAddStock">提 交</el-button>
            </div>
        </el-dialog>

    </div>
</template>

<script>
import { getProductList, productStatus, productStock, searchProduct } from '../../api/index'
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
            row: {},
            imageUrl: '',
            fileList: [],
            add: {
                name: '',
                icon: '',
                imgUrl: '',
                fileList: []
            },
            addShow: false,
            multipleSelection: [],
            random: '',
            stock: '',
            addShow: false,
            localQuery: {}
        };
    },
    activated() {
        let localQuery = this.$route.query
        if (localQuery.type != '' && localQuery.type != null) {
            this.query.type = localQuery.type
            this.query.name = localQuery.name
            this.query.id = localQuery.id
        } else {
            this.query.type = 'all'
            this.query.name = ''
            this.query.id = ''
        }
        this.getData();
    },
    methods: {
        // 获取数据
        getData() {
            let data = {
                page: this.query.page,
                limit: this.query.limit,
                category_id: ''
            }
            if (this.query.id != '' && this.query.id != null) {
                data.category_id = this.query.id
            }
            getProductList(data).then(res => {
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
        //商品上架下架
        productStatusChange(status, id) {
            let data = {
                status: status == 0 ? 1 : 0,
                id: id
            }
            let type = status == 0 ? '下架' : '恢复上架'
            this.$confirm(`此操作将${type}该商品, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                productStatus(data).then(res => {
                    this.$message({
                        type: 'success',
                        message: '操作成功!'
                    });
                    this.getData(); // 刷新数据
                })
            })
        },
        // 表格多选
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        addShowClick() {
            if (this.multipleSelection.length == 0) return this.$message.error('请先选择商品')
            this.addShow = true
        },
        // 一键补充库存
        handleAddStock() {
            if (this.multipleSelection.length == 0) return this.$message.error('请先选择商品')
            if (this.stock == '') return this.$message.error('请输入增加的库存量')
            let data = []
            this.multipleSelection.forEach(item => {
                data.push(item.id)
            })
            let postData = {
                product_id: data.join(','),
                random: this.random,
                stock: this.stock
            }
            productStock(postData).then(res => {
                if (res.code == 200) {
                    this.$message({
                        type: 'success',
                        message: '操作成功!'
                    });
                    this.addShow = false
                } else {
                    this.$message({
                        type: 'error',
                        message: res.msg
                    });
                }
            })
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
                searchProduct(this.query).then(res => {
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
                path: '/commodityInfo',
                query: {
                    id: id
                }
            })
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

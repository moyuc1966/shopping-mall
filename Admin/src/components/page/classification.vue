<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 商品分类管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box" style="position: relative;">
                <el-button icon="el-icon-refresh-right" circle @click="getData"
                    style="position: absolute;right:130px;"></el-button>
                <el-input clearable v-model="query.name" placeholder="搜索分类" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="primary" class="add-button" icon="el-icon-circle-plus-outline"
                    @click="addInit">新增分类</el-button>
            </div>


            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header">
                <!-- <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column> -->
                <el-table-column label="分类名称" :show-overflow-tooltip="true" width="200">
                    <template slot-scope="scope">{{ scope.row.name }}</template>
                </el-table-column>
                <el-table-column label="分类图片" align="center" width="100">
                    <template slot-scope="scope">
                        <el-image class="table-td-thumb" :src="$api + scope.row.icon.split(',')[0]"
                            :preview-src-list="getImageUrlList(scope.row.icon)"></el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="commodity_count" label="包含商品数量" width="170"></el-table-column>
                <el-table-column prop="create_time" label="创建时间" width="190"
                    :show-overflow-tooltip="true"></el-table-column>

                <el-table-column label="首页推荐" align="center" width="120">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.is_included == '1' ? 'success' : 'info'">{{ scope.row.is_included == '1' ?
                            '是' : '否' }}</el-tag>
                    </template>
                </el-table-column>

                <el-table-column label="操作" width="280" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" style="margin-right: 5px;"
                            @click="editShop(scope.row)">编辑</el-button>
                        <el-button type="text" icon="el-icon-tickets" class="green" @click="showProductList(scope.row)"
                            style="margin-right: 5px;">商品列表</el-button>
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
        <el-dialog title="修改商品分类消息" :visible.sync="show" width="600px">
            <el-form style="width: 400px;" :inline="true">
                <el-form-item label="分类名称" label-width="80px">
                    <el-input v-model="row.name" maxlength="6" placeholder="请输入商品分类名称" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="setClassName">保存名称</el-button>
                </el-form-item>
            </el-form>
            <el-form style="width: 400px;">
                <el-form-item label="分类图片" label-width="80px">
                    <el-upload class="centerImg" :action="' '" list-type="picture-card" :file-list="fileList"
                        :auto-upload="false" :limit="2" :on-change="imgChange" ref="uploadicon">
                        <i class="el-icon-plus"></i>
                    </el-upload>
                </el-form-item>
                <el-form-item label-width="100px">
                    <el-button type="primary" @click="setClassIcon">保存图片</el-button>
                </el-form-item>
            </el-form>
        </el-dialog>
        <!-- 新增 -->
        <el-dialog title="新增商品分类" :visible.sync="addShow" width="600px">
            <el-form style="width: 400px;" :inline="true">
                <el-form-item label="分类名称" label-width="80px">
                    <el-input maxlength="6" v-model="add.name" placeholder="请输入商品分类名称" autocomplete="off"></el-input>
                </el-form-item>
            </el-form>
            <el-form style="width: 400px;">
                <el-form-item label="分类图片" label-width="80px">
                    <el-upload class="centerImg" :action="' '" list-type="picture-card" :file-list="add.fileList"
                        :auto-upload="false" :limit="2" :on-change="addimgChange" ref="uploadicon">
                        <i class="el-icon-plus"></i>
                    </el-upload>
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
import { getCategory, categoryDelete, categoryUpdate, categoryUpdateImg, categoryAdd } from '../../api/index'
export default {
    name: 'basetable',
    data() {
        return {
            query: {
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
            addShow: false
        };
    },
    created() {
        this.getData();
    },
    methods: {
        // 获取数据
        getData() {
            getCategory(this.query).then(res => {
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
        handleDelete(index, row) {
            this.$confirm(`此操作将永久删除该数据，删除后该分类中的商品将被归属为无分类商品， 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                categoryDelete(row.id).then(res => {
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

        // 触发搜索按钮
        handleSearch() {
            this.query.page = 1;
            this.getData();
        },
        editShop(row) {
            this.row = row
            this.imageUrl = this.$api + row.icon.split(',')[0]
            this.fileList = [{
                name: 'food.jpg',
                url: this.$api + row.icon.split(',')[0]
            }]
            this.show = true
        },
        setClassName() {
            if (this.row.name == '') {
                this.$message({
                    type: 'error',
                    message: '分类名称不能为空!'
                });
                return
            }
            categoryUpdate(this.row).then(res => {
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
        },
        imgChange(file, fileList) {
            this.imageUrl = file.raw
            if (fileList.length > 1) {
                fileList.splice(0, 1)
            }
            this.fileList = fileList
        },
        setClassIcon() {
            if (this.imageUrl == '') {
                this.$message({
                    type: 'error',
                    message: '分类图片不能为空!'
                });
                return
            }
            let formData = new FormData();
            formData.append('id', this.row.id);
            formData.append('icon', this.imageUrl);
            console.log(formData);
            categoryUpdateImg(formData).then(res => {
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
        },
        addInit() {
            this.addShow = true
        },
        addimgChange(file, fileList) {
            this.add.imageUrl = file.raw
            this.add.icon = file.raw
            if (fileList.length > 1) {
                fileList.splice(0, 1)
            }
            this.add.fileList = fileList
        },
        addPost() {
            if (this.add.name == '' || this.add.icon == '') return this.$message({
                type: 'error',
                message: '请输入完整'
            })
            let formData = new FormData();
            formData.append('name', this.add.name);
            formData.append('icon', this.add.imageUrl);
            categoryAdd(formData).then(res => {
                if (res.code == 200) {
                    this.$message({
                        type: 'success',
                        message: '添加成功!'
                    });
                    this.addShow = false
                    this.add = {
                        name: '',
                        icon: '',
                        imgUrl: '',
                        fileList: []
                    }

                    this.getData(); // 刷新数据
                } else {
                    this.$message({
                        type: 'error',
                        message: res.msg
                    });
                }
            })

        },
        showProductList(row) {
            this.$router.push({
                path: '/commodityList',
                query: {
                    id: row.id,
                    name: row.name,
                    type: 'category_class'
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

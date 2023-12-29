<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-calendar"></i> 商品详情
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container" style="position: relative;">
            <div class="flex">
                <div class="form-box">
                    <el-form ref="form" label-width="80px">
                        <!-- <el-divider></el-divider> -->
                        <el-form-item label="商品名称">
                            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="请输入商品名称"
                                show-word-limit v-model="info.name" maxlength="50"></el-input>
                        </el-form-item>
                        <el-form-item label="商品标签">
                            <el-input type="text" v-model="info.category" show-word-limit maxlength="4"
                                placeholder="请输入商品标签">
                                <i class="el-icon-question el-input__icon" slot="suffix"
                                    @click="showTip('商品标签', '商品标签展示在商品列表右上角，可以不填，2-4字')">
                                </i>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="商品简介">
                            <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" show-word-limit
                                v-model="info.brief" maxlength="80" placeholder="墙输入商品简介">
                                <i class="el-icon-question el-input__icon" slot="suffix"
                                    @click="showTip('商品简介', '展示在商品详情页商品名称下方，简单描述商品')">
                                </i>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="展示销量">
                            <el-input type="number" style="width: 250px;" v-model="info.sales" maxlength="4"
                                placeholder="商品小程序端显示销量">
                                <i class="el-icon-question el-input__icon" slot="suffix"
                                    @click="showTip('商品销量', '销量会影响到小程序端商品排序，也会展示在商品详情页中')">
                                </i>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="邮费">
                            <el-input type="number" style="width: 250px;" v-model="info.postage" maxlength="4"
                                placeholder="请输入用户需支付邮递费用">
                                <template slot="suffix">元</template>
                                <i class="el-icon-question el-input__icon" slot="suffix"
                                    @click="showTip('邮费', '用户购买此商品需要另外支付的邮费，如果为0则表示包邮')">
                                </i>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="商品人气">
                            <el-input type="number" style="width: 250px;" v-model="info.popularity" placeholder="墙输入商品人气">
                                <i class="el-icon-question el-input__icon" slot="suffix"
                                    @click="showTip('商品人气', '表示商品的热度，用户在浏览和下单商品都会增加商品人气，此数值会邮箱商品在小程序端的商品排序')">
                                </i>
                            </el-input>
                        </el-form-item>
                        <el-form-item label="隶属分类">
                            <el-input @focus="editClassShow = true" :disabled="editClassShow" style="width: 250px;"
                                v-model="productCategory.name" placeholder="点击选择分类">
                                <i class="el-icon-question el-input__icon" slot="suffix"
                                    @click="showTip('隶属分类', '商品所属于的分类，可以不选择，依然会在列表中展示，只是用户无法通过指定分类来查看商品')">
                                </i>
                            </el-input>
                        </el-form-item>
                    </el-form>
                </div>
                <div class="form-box" style="margin-left: 50px;width: calc(100% - 650px);">
                    <div class="item" style="margin-bottom: 10px;height: 25px;">
                        <span class="my-label">商品图片</span>
                    </div>
                    <el-upload class="centerImg" :action="' '" list-type="picture-card" :file-list="fileList"
                        :auto-upload="false" :limit="10" :on-change="addimgChange" :on-remove="addimgChange"
                        ref="uploadicon" multiple>
                        <i class="el-icon-plus"></i>
                    </el-upload>
                    <el-divider></el-divider>
                    <div class="item" style="margin-bottom: 10px;height: 25px;">
                        <span class="my-label">商品规格</span>
                    </div>
                    <div class="spebox">
                        <span class="nono" v-if="id == '' || id == null">请先添加商品</span>
                        <span class="nono" v-if="id != '' && id != null && specification.length == 0">还没有商品规格，<span
                                @click="addClick" style="color:#409EFF;cursor: pointer;">点击添加</span></span>
                        <el-form :inline="true" class="demo-form-inline" v-for="(item, index) in specification"
                            :key="index">
                            <el-form-item label="规格名称:">
                                <el-input v-model="item.name" maxlength="12" show-word-limit type="text"
                                    placeholder="请输入规格名称"></el-input>
                            </el-form-item>
                            <el-form-item label="此规格价格:">
                                <el-input v-model="item.value" style="width: 100px;" type="number" placeholder="当前规格售价">
                                    <template slot="suffix">元</template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="库存:">
                                <el-input v-model="item.stock" style="width: 100px;" type="number"
                                    placeholder="当前规格库存数量"></el-input>
                            </el-form-item>
                            <el-form-item>
                                <i class="el-icon-edit" style="color: #409EFF;margin-left: 7px;cursor: pointer;"
                                    @click="editClick(item)"></i>
                                <i class="el-icon-delete" style="color: red; margin-left: 13px;cursor: pointer;"
                                    @click="delSpecification(item.id)"></i>
                                <i class="el-icon-circle-plus" style="color: #409EFF;margin-left: 15px;cursor: pointer;"
                                    @click="addClick"></i>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
            </div>
            <el-divider></el-divider>
            <div class="item" style="margin-bottom: 10px;height: 25px;">
                <span class="my-label">商品介绍</span>
            </div>
            <mavon-editor :toolbars="configs" v-model="content" ref="md" @imgAdd="$imgAdd" @change="change"
                style="min-height: 600px" />

            <div class="button-box" style="width: 100%;display: flex;margin-bottom: 40px;margin-top: 25px;">
                <el-button type="primary" plain @click="clearForm">重置清空</el-button>
                <el-button type="primary" style="margin-left: 20px;" @click="productAddition">立即添加商品</el-button>
            </div>
        </div>
        <el-dialog title="修改商品规格" :visible.sync="editShow" width="400px">
            <el-form label-width="80px">
                <el-form-item label="规格名称:">
                    <el-input v-model="edit.name" maxlength="12" show-word-limit type="text"
                        placeholder="请输入规格名称"></el-input>
                </el-form-item>
                <el-form-item label="规格价格:">
                    <el-input v-model="edit.value" type="number" placeholder="当前规格售价">
                        <template slot="suffix">元</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="库存:">
                    <el-input v-model="edit.stock" type="number" placeholder="当前规格库存数量"></el-input>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="editShow = false">取 消</el-button>
                <el-button type="primary" @click="editPost">提 交</el-button>
            </div>
        </el-dialog>

        <el-dialog title="新增商品规格" :visible.sync="addShow" width="400px">
            <el-form label-width="80px">
                <el-form-item label="规格名称:">
                    <el-input v-model="add.name" maxlength="12" show-word-limit type="text"
                        placeholder="请输入规格名称"></el-input>
                </el-form-item>
                <el-form-item label="规格价格:">
                    <el-input v-model="add.value" type="number" placeholder="当前规格售价">
                        <template slot="suffix">元</template>
                    </el-input>
                </el-form-item>
                <el-form-item label="库存:">
                    <el-input v-model="add.stock" type="number" placeholder="当前规格库存数量"></el-input>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addShow = false">取 消</el-button>
                <el-button type="primary" @click="addPost">提 交</el-button>
            </div>
        </el-dialog>

        <el-dialog title="选择商品所属分类" :visible.sync="editClassShow">
            <div class="handle-box">
                <el-input style="width: 200px;" v-model="userQuery.name" placeholder="搜索分类"
                    class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="userhandleSearch"
                    style="margin-left: 10px;">搜索</el-button>
            </div>
            <el-table :data="userQuery.tableData" style="margin-top: 8px;">
                <el-table-column label="分类名称" :show-overflow-tooltip="true" width="200">
                    <template slot-scope="scope">{{ scope.row.name }}</template>
                </el-table-column>
                <el-table-column label="分类图片" align="center" width="80">
                    <template slot-scope="scope">
                        <el-image style="width: 50px; height: 50px;" class="table-td-thumb"
                            :src="$api + scope.row.icon.split(',')[0]"></el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="create_time" label="创建时间" width="190"
                    :show-overflow-tooltip="true"></el-table-column>

                <el-table-column label="首页推荐" align="center" width="120">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.is_included == '1' ? 'success' : 'info'">{{ scope.row.is_included == '1' ?
                            '是' : '否' }}</el-tag>
                    </template>
                </el-table-column>
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

<script scoped>
import { uploadFile, getCategory, addProduct, productSpecificationsList, setProductCategory, deleteProductSpecifications, addProductSpecifications, modifyProductSpecifications } from '../../api/index'
import { mavonEditor } from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'
export default {
    name: 'markdown',
    data() {
        return {
            id: '',
            info: {
                name: '',
                category: '',
                brief: '',
                sales: '',
                postage: '',
                popularity: '',
                description: '',
                icon: ''
            },
            specification: [],
            fileList: [],
            addShow: false,
            editShow: false,
            edit: {},
            add: {
                name: '',
                value: '',
                stock: '',
                product_id: ''
            },
            content: '',
            html: '',
            configs: {
                bold: true, // 粗体
                italic: true, // 斜体
                header: true, // 标题
                underline: true, // 下划线
                strikethrough: true, // 中划线
                mark: true, // 标记
                superscript: true, // 上角标
                subscript: true, // 下角标
                quote: true, // 引用
                ol: true, // 有序列表
                ul: true, // 无序列表
                link: true, // 链接
                imagelink: true, // 图片链接
                code: true, // code
                table: true, // 表格
                fullscreen: true, // 全屏编辑
                readmodel: true, // 沉浸式阅读
                htmlcode: true, // 展示html源码
                help: true, // 帮助
                /* 1.3.5 */
                undo: true, // 上一步
                redo: true, // 下一步
                trash: true, // 清空
                /* 1.4.2 */
                navigation: true, // 导航目录
                /* 2.1.8 */
                alignleft: true, // 左对齐
                aligncenter: true, // 居中
                alignright: true, // 右对齐
                /* 2.2.1 */
                subfield: true, // 单双栏模式
                preview: true, // 预览
            },
            editClassShow: false,
            userQuery: {
                name: '',
                page: 1,
                limit: 10,
                id: '',
                tableData: [],
                pageTotal: 0,
            },
            productCategory: {
                id: 0,
                name: '不设置商品分类'
            }
        };
    },
    components: {
        mavonEditor
    },
    created() {
        this.usergetData()
    },
    methods: {
        showTip(title, content) {
            this.$alert(content, `${title}填写提示`, {
                confirmButtonText: '确定'
            });
        },
        usergetData() {
            getCategory(this.userQuery).then(res => {
                if (res.code == 200) {
                    this.userQuery.tableData = res.data;
                    this.userQuery.pageTotal = res.total;

                    this.userQuery.tableData.unshift({
                        commodity_count: 0,
                        create_time: "不设置商品分类",
                        icon: "",
                        id: 0,
                        is_included: 0,
                        name: "不设置商品分类"
                    })
                } else {
                    this.$message({
                        type: 'error',
                        message: res.msg
                    });
                }
            });
        },
        userhandleSearch() {
            this.userQuery.page = 1;
            this.usergetData();
        },
        userhandlePageChange(val) {
            this.$set(this.userQuery.query, 'page', val);
            this.usergetData();
        },
        userhandleLimitChange(val) {
            this.$set(this.userQuery.query, 'limit', val);
            this.usergetData();
        },

        addimgChange(file, fileList) {
            this.fileList = fileList
        },
        getSpecification() {
            productSpecificationsList(this.id).then(res => {
                this.specification = res.data
            })
        },
        delSpecification(id) {
            this.$confirm(`是否确认删除此规格?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                deleteProductSpecifications(id).then(res => {
                    if (res.code == 200) {
                        this.$message({
                            type: 'success',
                            message: '操作成功!'
                        });
                        this.getSpecification(); // 刷新数据
                    } else {
                        this.$message({
                            type: 'error',
                            message: res.msg
                        });
                    }
                })
            })
        },
        editClick(item) {
            this.edit = JSON.parse(JSON.stringify(item))
            this.editShow = true
        },
        editPost() {
            if (this.edit.name == '' || this.edit.value == '' || this.edit.stock == '') return this.$message.error('请输入完整')
            if (this.edit.value <= 0) {
                this.edit.value = 0.01
                return this.$message.error('价格最低0.01，已修改')
            }
            modifyProductSpecifications(this.edit).then(res => {
                if (res.code == 200) {
                    this.$message({
                        type: 'success',
                        message: '操作成功!'
                    });
                    this.editShow = false
                } else {
                    this.$message({
                        type: 'error',
                        message: res.msg
                    });
                }
            })
        },
        addClick() {
            this.addShow = true
            this.add = {
                name: '',
                value: '',
                stock: '',
                product_id: this.id
            }
        },
        addPost() {
            if (this.edit.name == '' || this.edit.value == '' || this.edit.stock == '') return this.$message.error('请输入完整')
            if (this.edit.value <= 0) {
                this.edit.value = 0.01
                return this.$message.error('价格最低0.01，已修改')
            }
            addProductSpecifications(this.add).then(res => {
                if (res.code == 200) {
                    this.$message({
                        type: 'success',
                        message: '操作成功!'
                    });
                    this.addShow = false
                    this.getSpecification(); // 刷新数据
                } else {
                    this.$message({
                        type: 'error',
                        message: res.msg
                    });
                }
            })
        },
        $imgAdd(pos, $file) {
            var formdata = new FormData();
            formdata.append('file', $file);

            uploadFile(formdata).then(res => {
                if (res.code == 200) {
                    this.content += `
                    `
                    console.log(this.content);
                    this.$refs.md.$img2Url(pos, this.$api + res.data);
                } else {
                    this.$message.error(res.msg)
                }
            })
        },
        change(value, render) {
            // render 为 markdown 解析后的结果
            this.html = render;
        },

        //提交商品添加事件
        productAddition() {
            if (this.info.name === '' || this.info.category === '' || this.info.brief === '' || this.info.sales === '' || this.info.postage === '' ||
                this.info.popularity === '' || this.html == ''
            ) return this.$message.error('请输入完整')
            if (this.fileList.length == 0) return this.$message.error('请上传图片')
            if (this.info.sales < 0) return this.$message.error('销量不可为负数')
            if (this.info.postage < 0) return this.$message.error('邮费不可为负数')
            if (this.info.popularity < 0) return this.$message.error('商品人气最小值为0')
            //处理商品介绍
            let html = this.html
            const imgSrcRegex = /<img\s+src="(?:https?:\/\/[^\/]+)?(\/public\/[^"]+)"\s+alt="([^"]+)"\s*\/?>/g;
            this.info.description = html.replace(imgSrcRegex, '<img src="$1" alt="$2">');
            let formData = new FormData();
            formData.append('name', this.info.name);
            formData.append('category', this.info.category);
            formData.append('brief', this.info.brief);
            formData.append('sales', this.info.sales);
            formData.append('description', this.info.description);
            formData.append('postage', this.info.postage);
            formData.append('popularity', this.info.popularity);
            this.fileList.forEach(item => {
                formData.append('icon', item.raw);
            })
            addProduct(formData).then(res => {
                if (res.code == 200) {
                    this.$message.success('添加成功')
                    this.id = res.id
                    if (this.productCategory.id != 0) {
                        setProductCategory({
                            id: this.id,
                            category_id: this.productCategory.id
                        }).then(res => {
                            if (res.code != 200) {
                                this.$message.error('设置分类错误：' + res.msg)
                            }
                        })
                    }
                } else {
                    this.$message.error(res.msg)
                }
            })

        },
        clearForm() {
            this.id = ''
            this.info = {
                name: '',
                category: '',
                brief: '',
                sales: '',
                postage: '',
                popularity: '',
                description: '',
                icon: ''
            }
            this.fileList = []
            this.content = ''
            this.specification = []
            this.addShow = false
            this.editShow = false
            this.edit = {}
            this.add = {
                name: '',
                value: '',
                stock: '',
                product_id: ''
            }
            this.content = '',
                this.productCategory = {
                    id: 0,
                    name: '不设置商品分类'
                }
        },
        selectUserOK(item) {
            this.productCategory.id = item.id
            this.productCategory.name = item.name
            this.editClassShow = false
        }

    }
};
</script>
<style>
.item {
    width: 100%;
    height: 40px;
    display: flex;
    align-content: center;
    margin-bottom: 20px;
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

.nono {
    display: block;
    width: 100%;
    line-height: 100px;
    text-align: center;
    font-size: 14px;
    background: #f0f0f0;
    color: #aaa;
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
</style>
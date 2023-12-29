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
            <el-dropdown style="position: absolute;right: 10px;top: 10px;">
                <el-button type="primary">
                    更多操作<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item><span style="color:#FF0073;" @click="commandDel">删除此商品</span></el-dropdown-item>
                    <el-dropdown-item><span @click="addCommentShow = true">创建评价</span></el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <div class="flex">
                <div class="form-box">
                    <el-form ref="form" label-width="80px">
                        <div class="item">
                            <span class="my-label">商品UUID</span>
                            <span class="my-value">{{ info.uuid }}</span>
                        </div>
                        <el-descriptions title="商品数据" border style="margin-bottom: 25px;">
                            <el-descriptions-item label="商品状态">{{ info.status == 0 ? '上架中' : '已下架' }}</el-descriptions-item>
                            <el-descriptions-item label="实际销量">{{ info.actual_sales }}</el-descriptions-item>
                            <el-descriptions-item label="商品浏览量">{{ info.views }}</el-descriptions-item>
                            <el-descriptions-item label="创建时间">{{ info.create_time }}</el-descriptions-item>
                            <el-descriptions-item label="所属分类">{{ info.category_name ? info.category_name : '无分类'
                            }}<i class="el-icon-edit" @click="editClassShow = true"
                                    style="color:#409EFF;cursor: pointer;margin-left: 10px;font-size: 16px;"></i></el-descriptions-item>
                        </el-descriptions>
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
                            <el-input type="number" style="width: 250px;" v-model="info.popularity" placeholder="请输入商品人气">
                                <i class="el-icon-question el-input__icon" slot="suffix"
                                    @click="showTip('商品人气', '表示商品的热度，用户在浏览和下单商品都会增加商品人气，此数值会邮箱商品在小程序端的商品排序')">
                                </i>
                            </el-input>
                        </el-form-item>


                        <el-form-item>
                            <el-button type="primary" @click="onSubmit">保存编辑</el-button>
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
                    <el-button type="primary" @click="onSubmitImg" style="margin-top: 15px;">保存图片</el-button>
                    <el-divider></el-divider>
                    <div class="item" style="margin-bottom: 10px;height: 25px;">
                        <span class="my-label">商品规格</span>
                    </div>
                    <div class="spebox">
                        <span class="nono" v-if="specification.length == 0">还没有商品规格，<span @click="addClick"
                                style="color:#409EFF;cursor: pointer;">点击添加</span></span>
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
            <el-button class="editor-btn" type="primary" @click="submit">保存商品详情</el-button>
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

        <el-dialog title="创建商品评价" :visible.sync="addCommentShow" width="400px">
            <el-form label-width="80px">
                <el-form-item label="评论内容">
                    <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" placeholder="请输入评价内容" show-word-limit
                        v-model="comment.content" maxlength="200"></el-input>
                </el-form-item>
                <el-form-item label="商品评分">
                    <el-rate v-model="comment.star" :max="5"></el-rate>
                </el-form-item>
                <el-form-item label="是否匿名">
                    <el-radio-group v-model="comment.is_anonymous">
                        <el-radio :label="1">匿名</el-radio>
                        <el-radio :label="0">不匿名</el-radio>
                    </el-radio-group>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="addCommentShow = false">取 消</el-button>
                <el-button type="primary" @click="addComment">提 交</el-button>
            </div>
        </el-dialog>

        <el-dialog title="选择需要修改的分类" :visible.sync="editClassShow">
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
import { getProductDetail, addProductEvaluation, setProductCategory, getCategory, uploadFile, productDelete, modifyProduct, modifyProductDescription, modifyProductIcon, productSpecificationsList, deleteProductSpecifications, addProductSpecifications, modifyProductSpecifications } from '../../api/index'
import { mavonEditor } from 'mavon-editor'
import bus from '../common/bus';
import 'mavon-editor/dist/css/index.css'
export default {
    name: 'markdown',
    data() {
        return {
            id: '',
            info: {},
            specification: [],
            fileList: [],
            back: [],
            addShow: false,
            editShow: false,
            edit: {},
            add: {
                name: '',
                value: '',
                stock: '',
                product_id: ''
            },
            editClassShow: false,


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
            userQuery: {
                name: '',
                page: 1,
                limit: 10,
                id: '',
                tableData: [],
                pageTotal: 0,
            },
            addCommentShow: false,
            comment: {
                content: '',
                star: 5,
                is_anonymous: 1
            }
        };
    },
    components: {
        mavonEditor
    },
    activated() {
        this.id = this.$route.query.id
        this.getInfo()
        this.usergetData()
        this.add.product_id = this.id
    },
    methods: {
        getInfo() {
            getProductDetail(this.id).then(res => {
                this.info = res.data
                let arr = this.info.icon.split(',')
                let content = res.data.description

                // 使用正则表达式匹配img标签中的src属性
                const imgSrcRegex = /<img\s+src="\/public\/([^"]+)"\s+alt="([^"]+)"\s*\/?>/g;

                // 替换img标签中的src属性为拼接后的值
                this.processedHtml = content.replace(imgSrcRegex, (_, src, alt) => {
                    return `<img src="${this.$api}/public/${src}" alt="${alt}">`;
                });
                this.content = this.processedHtml


                arr = arr.map(item => {
                    return {
                        url: this.$api + item,
                        name: item.substring(item.length - 5, item.length)
                    }
                })
                this.fileList = arr
                this.back = JSON.parse(JSON.stringify(arr))
                this.specification = res.specification
            })
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
        onSubmit() {
            for (let key in this.info) {
                if (this.info[key] === '' || this.info[key] == null) {
                    return this.$message.error('请输入完整')
                }
            }
            modifyProduct(this.info).then(res => {
                if (res.code == 200) {
                    this.$message.success('修改成功')
                } else {
                    this.$message.error(res.msg)
                }
            })
        },
        showTip(title, content) {
            this.$alert(content, `${title}填写提示`, {
                confirmButtonText: '确定'
            });
        },
        addimgChange(file, fileList) {
            this.fileList = fileList
        },
        checkChange() {
            if (this.fileList.length !== this.back.length) {
                // 如果两个数组的长度不同，那么肯定发生了改变
                return true;
            }
            for (let i = 0; i < this.fileList.length; i++) {
                if (this.fileList[i].url !== this.back[i].url) {
                    // 如果找到任何不同的元素，那么就认为 fileList 发生了改变
                    return true;
                }
            }
            return false;
        },
        async onSubmitImg() {
            if (this.fileList.length == 0) {
                return this.$message.error('请选择图片后提交')
            }
            if (!this.checkChange()) return this.$message.error('修改图片后提交')

            const loading = this.$loading({
                lock: true,
                text: '正在上传...',
                spinner: 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
            let formData = new FormData();
            formData.append('id', this.info.id);
            for (let i = 0; i < this.fileList.length; i++) {
                if (this.fileList[i].url.startsWith('http')) {
                    // 这是一个网络图片 URL，需要下载图片
                    let response = await fetch(this.fileList[i].url);
                    let blob = await response.blob();

                    // 使用 Blob 对象创建一个 File 对象
                    let extension = '';
                    switch (blob.type) {
                        case 'image/jpeg':
                            extension = '.jpg';
                            break;
                        case 'image/png':
                            extension = '.png';
                            break;
                        // 添加更多的 case 以支持更多的文件类型...
                    }

                    let file = new File([blob], `image${i}${extension}`, { type: blob.type });
                    // console.log(file);
                    formData.append('icon', file);
                } else {
                    // 这是一个 File 对象，可以直接添加到 FormData
                    formData.append('icon', this.fileList[i].raw);
                }
            }
            loading.close();
            modifyProductIcon(formData).then(res => {
                if (res.code == 200) {
                    this.$message.success('保存成功')
                    this.getInfo()
                } else {
                    this.$message.error(res.msg)
                    console.log(res);
                }
            })
        },
        getSpecification() {
            productSpecificationsList(this.info.id).then(res => {
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
                    productSpecificationsList(this.id).then(res => {
                        this.specification = res.data
                    })
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
        submit() {
            if (this.content == '') return this.$message.error('请输入商品介绍')
            let html = this.html

            const imgSrcRegex = /<img\s+src="(?:https?:\/\/[^\/]+)?(\/public\/[^"]+)"\s+alt="([^"]+)"\s*\/?>/g;

            // 替换img标签中的src属性
            const replacedHtmlText = html.replace(imgSrcRegex, '<img src="$1" alt="$2">');

            let data = {
                id: this.id,
                description: replacedHtmlText
            }
            modifyProductDescription(data).then(res => {
                if (res.code == 200) {
                    this.$message({
                        type: 'success',
                        message: '操作成功!'
                    });
                } else {
                    this.$message({
                        type: 'error',
                        message: res.msg
                    });
                }
            })
        },
        commandDel() {
            this.$confirm(`是否确认删除此数据?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //关闭tab页面返回上一页
                productDelete(this.id).then(res => {
                    if (res.code == 200) {
                        this.$message({
                            type: 'success',
                            message: '操作成功!'
                        });

                        bus.$emit('close_current_tags');
                    } else {
                        this.$message({
                            type: 'error',
                            message: res.msg
                        });
                    }
                })
            })
        },
        selectUserOK(item) {
            setProductCategory({
                category_id: item.id,
                id: this.id
            }).then(res => {
                if (res.code == 200) {
                    this.$message.success('修改成功')
                    this.editClassShow = false
                    this.info.category_name = item.name
                } else {
                    this.$message.error(res.msg)
                    console.log(res);
                }
            })
        },
        addComment() {
            if (this.comment.content == '') return this.$message.error('请输入评价内容')
            let data = {
                user_id: 0,
                product_id: this.id,
                content: this.comment.content,
                star: this.comment.star,
                is_anonymous: this.comment.is_anonymous
            }
            addProductEvaluation(data).then(res => {
                if (res.code == 200) {
                    this.$message.success('创建成功')
                    this.addCommentShow = false
                } else {
                    this.$message.error(res.msg)
                }
            })
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
</style>
<template>
    <div class="main">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 系统信息设置
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <el-tabs v-model="activeName">
                <el-tab-pane label="首页公告" name="notice">
                    <el-alert style="margin-bottom: 25px;width: 510px;margin-top: 30px;" title="修改小程序首页公告相关" type="warning"
                        description="首页有两种公告，第一种是首页在轮播图之下滚动播放的公告，无法关闭，第二种是每次进入小程序之后弹窗公告，弹窗公告可以选择关闭" show-icon
                        :closable="false">
                    </el-alert>
                    <el-form>
                        <el-form-item label="滚动公告内容" label-width="100px">
                            <el-input v-model="info.notice" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
                                placeholder="请输入公告内容" style="width: 410px;"></el-input>
                        </el-form-item>
                        <el-form-item label="" label-width="100px">
                            <el-button type="primary" @click="updateNoticeClick">保存滚动公告内容</el-button>
                        </el-form-item>
                    </el-form>
                    <div style="width: 510px;">
                        <el-divider></el-divider>
                    </div>
                    <el-form>
                        <el-form-item label="弹窗公告内容" label-width="100px">
                            <el-input v-model="info.notice_content" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea"
                                placeholder="请输入公告内容" style="width: 410px;"></el-input>
                        </el-form-item>
                        <el-form-item label="" label-width="100px">
                            <el-button type="primary" @click="updatePopupContentClick">保存弹窗公告内容</el-button>
                        </el-form-item>
                        <el-form-item label="弹窗公告开关" label-width="100px">
                            <el-switch v-model="info.notice_switch" @change="notice_switch_change" active-color="#13ce66"
                                inactive-color="#aaa" :active-value="1" :inactive-value="0">
                            </el-switch>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
                <el-tab-pane label="轮播图配置" name="swiper">
                    <el-upload class="centerImg" :action="' '" list-type="picture-card" :file-list="fileList"
                        :auto-upload="false" :limit="10" :on-change="addimgChange" :on-remove="addimgChange"
                        ref="uploadicon" multiple>
                        <i class="el-icon-plus"></i>
                    </el-upload>
                    <el-button type="primary" @click="onSubmitImg" style="margin-top: 15px;">保存轮播图</el-button>

                </el-tab-pane>
                <el-tab-pane label="首页展示分类" name="category">

                    <div class="category">
                        <div class="category-item" v-for="(item, index) in info.category" :key="index">
                            <img :src="$api + item.icon" alt="">
                            <div class="category-item-name">{{ item.name }}</div>
                        </div>
                        <el-button type="primary" plain style="width:50px;height:50px;margin-top: 18px;font-size: 20px;"
                            icon="el-icon-edit" circle @click="show = true"></el-button>
                    </div>

                </el-tab-pane>
                <el-tab-pane label="客服二维码" name="qrcode">
                    <el-dropdown>
                        <el-image :src="$api + info.service_qr_code" style="width: 200px;height: 200px;"
                            :preview-src-list="[$api + info.service_qr_code]">
                            <div slot="error" class="image-slot">
                                <i class="el-icon-picture-outline"></i>
                            </div>
                        </el-image>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item icon="el-icon-circle-plus-outline"><span
                                    @click="updateShow = true">修改</span></el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>
                </el-tab-pane>
            </el-tabs>
        </div>

        <el-dialog title="修改客服二维码" :visible.sync="updateShow" width="500px">
            <el-form>
                <el-form-item label="上传二维码" label-width="90px">
                    <el-upload class="centerImg" :action="' '" list-type="picture-card" :file-list="fileListKf"
                        :auto-upload="false" :limit="1" :on-change="addimgChangeKf" :on-remove="addimgChangeKf"
                        ref="uploadicon" multiple>
                        <i class="el-icon-plus"></i>
                    </el-upload>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="updateShow = false">取 消</el-button>
                <el-button type="primary" @click="kfImagePost">确 定</el-button>
            </div>
        </el-dialog>

        <el-dialog title="修改首页展示分类" :visible.sync="show" width="50%">
            <span class="nono" v-if="category.length == 0">还没有分类，请先添加商品分类</span>
            <div class="cateSelectBox category">
                <div class="select-item category-item" v-for="(item, index) in category" :key="index"
                    @click="selectClick(select.includes(item.id), item)">
                    <i class="icon" :class="select.includes(item.id) ? 'el-icon-success' : 'el-icon-circle-check'"
                        :style="{ color: select.includes(item.id) ? '#409EFF' : '#aaa' }"></i>
                    <img :src="$api + item.icon" alt="">
                    <div class="category-item-name">{{ item.name }}</div>
                </div>
                <div class="select-item category-item" @click="andmore" v-if="query.total > category.length"
                    style="border-color:#409EFF;">
                    <div class="category-item-name" style="color:#409EFF">显示更多</div>
                </div>
            </div>
            <el-divider content-position="left">已选列表</el-divider>
            <div class="category selectok">
                <div class="category-item" v-for="(item, index) in selectList" :key="index">
                    <img :src="$api + item.icon" alt="">
                    <div class="category-item-name">{{ item.name }}</div>
                </div>
            </div>
            <div slot="footer" class="dialog-footer">
                <el-button @click="show = false">取 消</el-button>
                <el-button type="primary" @click="updateShowCategoryClick">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { getSystemSetting, getCategory, updateNotice, updatePopupContent, updatePopup, updateSwiper, updateServiceQrCode, updateShowCategory } from '../../api/index.js'
export default {
    data() {
        return {
            info: {},
            activeName: 'notice',
            fileList: [],
            updateShow: false,
            imageUrl: '',
            fileListKf: [],
            show: false,
            query: {
                page: 1,
                limit: 20,
                total: 0
            },
            category: [],
            select: [],
            selectList: []
        }
    },
    methods: {
        getData() {
            getSystemSetting().then(res => {
                this.info = res.data
                let arr = this.info.swiper.split(',')
                arr = arr.map(item => {
                    return {
                        url: this.$api + item,
                        name: item.substring(item.length - 5, item.length)
                    }
                })
                this.back = JSON.parse(JSON.stringify(arr))
                this.fileList = arr
                this.info.category.forEach(item => {
                    this.select.push(item.id)
                })
                this.selectList = JSON.parse(JSON.stringify(this.info.category))
            })
        },
        getCategoryList() {
            getCategory(this.query).then(res => {
                this.category = res.data
                this.query.total = res.total
            })
        },
        updateNoticeClick() {
            if (this.info.notice == '') return this.$message.error('请输入滚动公告内容')
            updateNotice(this.info.notice).then(res => {
                if (res.code == 200) {
                    this.$message.success('修改成功')
                } else {
                    this.$message.error(res.msg)
                }
            })
        },
        updatePopupContentClick() {
            if (this.info.notice_content == '') return this.$message.error('请输入弹窗公告内容')
            updatePopupContent(this.info.notice_content).then(res => {
                if (res.code == 200) {
                    this.$message.success('修改成功')
                } else {
                    this.$message.error(res.msg)
                }
            })
        },
        notice_switch_change(e) {
            updatePopup(Number(e)).then(res => {
                if (res.code == 200) {
                    this.$message.success('修改成功')
                } else {
                    this.$message.error(res.msg)
                }
            })
        },
        addimgChange(file, fileList) {
            this.fileList = fileList
        },
        addimgChangeKf(file, fileList) {
            this.fileListKf = fileList
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
            updateSwiper(formData).then(res => {
                if (res.code == 200) {
                    this.$message.success('保存成功')
                    this.getData()
                } else {
                    this.$message.error(res.msg)
                    console.log(res);
                }
            })
        },
        kfImagePost() {
            if (this.fileListKf.length == 0) return this.$message.error('请选择图片后提交')
            let formData = new FormData();
            formData.append('icon', this.fileListKf[0].raw);
            updateServiceQrCode(formData).then(res => {
                if (res.code == 200) {
                    this.$message.success('保存成功')
                    this.getData()
                    this.updateShow = false
                    this.fileListKf = []
                } else {
                    this.$message.error(res.msg)
                }
            })
        },
        selectClick(is, item) {
            if (is) {
                //存在，将数据移除
                let index = this.select.indexOf(item.id);
                if (index !== -1) {
                    this.select.splice(index, 1);
                }
                index = this.selectList.findIndex(i => i.id === item.id);
                if (index !== -1) {
                    this.selectList.splice(index, 1);
                }

            } else {
                //不存在，加入数据
                this.select.push(item.id)
                this.selectList.push(item)

            }
        },
        updateShowCategoryClick() {
            let id = this.select.join(',')
            if (this.select.length == 0) {
                this.$confirm('您没有添加任何首页展示的分类, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    if (id == '' || id == ' ') id = '0'
                    updateShowCategory(id).then(res => {
                        if (res.code == 200) {
                            this.$message.success('修改成功')
                            this.getData()
                        } else {
                            this.$message.error(res.msg)
                        }
                    })
                })
            } else {
                updateShowCategory(id).then(res => {
                    if (res.code == 200) {
                        this.$message.success('修改成功')
                        this.getData()
                    } else {
                        this.$message.error(res.msg)
                    }
                })
            }
        },
        andmore() {
            if (this.query.total <= this.category.length) return
            this.query.page += 1
            this.getCategoryList()
        }
    },
    mounted() {
        this.getData()
        this.getCategoryList()
    },
}
</script>

<style scoped>
.category {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    margin-top: 20px;
}

.nono {
    display: block;
    font-size: 14px;
    color: #aaa;
    text-align: center;
    width: 100%;
    line-height: 160px;
}

.category-item {
    width: auto;
    min-width: 90px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    height: 100px;
}

.category-item img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
}

.category-item-name {
    margin-top: 5px;
}

.cateSelectBox {
    height: auto;
    max-height: 300px;
    overflow: auto;
}

.select-item {
    border: 1px solid #e6e6e6;
    margin-right: 10px;
    margin-bottom: 10px;
    width: 80px;
    position: relative;
    cursor: pointer;
}

.select-item .icon {
    position: absolute;
    left: 5px;
    top: 5px;
    font-size: 18px;
}

.select-item:hover {
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
}

.selectok img {
    width: 40px;
    height: 40px;
    font-size: 14px;
}

.selectok .category-item {
    width: auto;
    min-width: 80px;
}
</style>
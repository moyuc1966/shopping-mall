<template>
    <div class="main">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 管理员信息设置
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="username">
                <el-alert style="margin-bottom: 25px;width: 500px;" title="修改管理员账号" type="info"
                    description="修改账号后需要重新登录，请牢记您最新修改的账号和您的密码" show-icon :closable="false">
                </el-alert>
                <el-form>
                    <el-form-item label="管理员账号" label-width="90px">
                        <el-input v-model="username" placeholder="请输入账号" style="width: 320px;"></el-input>
                    </el-form-item>
                    <el-form-item label="" label-width="90px">
                        <el-button type="primary" @click="modifyAdminAccountClick">保存修改</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <el-divider></el-divider>
            <div class="password">
                <el-alert style="margin-bottom: 25px;width: 500px;" title="修改管理员密码" type="info"
                    :description="'修改密码后需要重新登录，请牢记您最新修改的密码和您当前的账号' + username" show-icon :closable="false">
                </el-alert>
                <el-form>
                    <el-form-item label="旧密码" label-width="90px">
                        <el-input show-password v-model="oldPwd" type="password" placeholder="请输入当前密码"
                            style="width: 320px;"></el-input>
                    </el-form-item>
                    <el-form-item label="新密码" label-width="90px">
                        <el-input show-password v-model="newPwd" type="password" placeholder="请输入新的密码"
                            style="width: 320px;"></el-input>
                    </el-form-item>
                    <el-form-item label="重复新密码" label-width="90px">
                        <el-input show-password v-model="newPwdTwo" type="password" placeholder="请再次输入新的密码"
                            style="width: 320px;"></el-input>
                    </el-form-item>
                    <el-form-item label="" label-width="90px">
                        <el-button type="primary" @click="modifyAdminPasswordClick">保存修改</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<script>
import { getAdminInfo, modifyAdminAccount, modifyAdminPassword } from '../../api/index.js'
export default {
    data() {
        return {
            info: {},
            username: '',
            newPwd: '',
            oldPwd: '',
            newPwdTwo: ''
        }
    },
    methods: {
        getData() {
            getAdminInfo().then(res => {
                this.info = res.data
                this.username = this.info.username
            })
        },
        modifyAdminAccountClick() {
            if (this.username == '') return this.$message.error('请输入管理员账号')
            if (this.username == this.info.username) return this.$message.error('请修改后再提交')

            this.$confirm('修改账号后需要重新登录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                modifyAdminAccount({
                    username: this.username
                }).then(res => {
                    if (res.code == 200) {
                        this.$message.success('修改成功，请重新登录')
                        setTimeout(() => {
                            localStorage.setItem('token', '')
                            this.$router.push('/login')
                        }, 900)
                    } else {
                        this.$message({
                            message: res.msg,
                            type: 'error'
                        })
                    }
                })
            })
        },
        modifyAdminPasswordClick() {
            if (this.newPwd == '' || this.oldPwd == '' || this.newPwdTwo == '') return this.$message.error('请输入完整')
            if (this.newPwd != this.newPwdTwo) return this.$message.error('两次新密码输入不一致')
            if (this.newPwd == this.oldPwd) return this.$message.error('新密码不能和旧密码一样')

            this.$confirm('修改账号后需要重新登录, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                modifyAdminPassword({
                    oldPwd: this.oldPwd,
                    newPwd: this.newPwd
                }).then(res => {
                    if (res.code == 200) {
                        this.$message.success('修改成功，请重新登录')
                        setTimeout(() => {
                            localStorage.setItem('token', '')
                            this.$router.push('/login')
                        }, 900)
                    } else {
                        this.$message({
                            message: res.msg,
                            type: 'error'
                        })
                    }
                })
            })
        }
    },
    mounted() {
        this.getData()
    },
}
</script>

<style scoped></style>
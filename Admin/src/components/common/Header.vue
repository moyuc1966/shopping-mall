<template>
    <div class="header">
        <!-- 折叠按钮 -->
        <div class="collapse-btn" @click="collapseChage">
            <i v-if="!collapse" class="el-icon-s-fold"></i>
            <i v-else class="el-icon-s-unfold"></i>
        </div>
        <div class="logo">后台管理系统</div>
        <div class="header-right">
            <div class="header-user-con">
                <!-- 消息 -->
                <div class="btn-fullscreen message" @click="showMessage">
                    <el-tooltip effect="dark" content="系统消息" placement="bottom">
                        <el-badge :hidden="readCount == 0" :value="readCount" class="custom-badge">
                            <i class="el-icon-message-solid"></i>
                        </el-badge>
                    </el-tooltip>
                </div>
                <!-- 全屏显示 -->
                <div class="btn-fullscreen" @click="handleFullScreen">
                    <el-tooltip effect="dark" :content="fullscreen ? `取消全屏` : `全屏`" placement="bottom">
                        <i class="el-icon-rank"></i>
                    </el-tooltip>
                </div>

                <!-- 用户头像 -->
                <div class="user-avator">
                    <img src="../../assets/img/img.jpg" />
                </div>
                <!-- 用户名下拉菜单 -->
                <el-dropdown class="user-name" trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{ username }}
                        <i class="el-icon-caret-bottom"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>

        <el-drawer size="500px" title="系统消息" @opened="msgopen" :visible.sync="show" direction="rtl">
            <template slot="title">
                <span class="title">系统消息</span>
                <div class="clear" @click="allClear">
                    <img src="../../assets/img/clear.png" alt="">
                    <span>全部已读</span>
                </div>
            </template>
            <span class="nono" v-if="list.length == 0">还没有系统消息</span>
            <div class="messageBox" ref="messageBox">
                <div class="msgitem" v-for="(item, index) in list" :key="index">
                    <div class="item-title">
                        <el-tag size="mini" :type="item.type == 'error' ? 'danger' : item.type">{{ item.title }}</el-tag>
                        <span class="time">{{ item.create_time }}</span>
                    </div>
                    <div class="msg-content">
                        <span class="copy" @click="copy(item.copy)">{{ item.copy }}</span>
                        <span class="con">{{ item.content }}</span>
                    </div>
                    <div class="isread" v-if="item.isread == 0"></div>
                    <span class="readok" @click="readok(item.id)" v-if="item.isread == 0">标记已读</span>
                </div>
                <span class="more" v-if="query.total > 10">{{ allLoaded ? '没有更多消息了' : loading ? '加载中' : '上滑加载更多' }}</span>
            </div>
        </el-drawer>
    </div>
</template>
<script>
import bus from '../common/bus';
import { getUnreadMessage, getMessageList, readMessage } from '../../api/index.js'
export default {
    data() {
        return {
            collapse: false,
            fullscreen: false,
            name: '管理员',
            message: 2,
            show: false,
            readCount: 0,
            query: {
                page: 1,
                limit: 10,
                total: 0
            },
            list: [],
            loading: false,  // 是否正在加载数据
            allLoaded: false,  // 是否已经加载完所有数据
        };
    },
    computed: {
        username() {
            let username = localStorage.getItem('ms_username');
            return username ? username : this.name;
        }
    },
    methods: {
        // 用户名下拉菜单选择事件
        handleCommand(command) {
            if (command == 'loginout') {
                localStorage.removeItem('token');
                this.$router.push('/login');
            }
        },
        // 侧边栏折叠
        collapseChage() {
            this.collapse = !this.collapse;
            bus.$emit('collapse', this.collapse);
        },
        // 全屏事件
        handleFullScreen() {
            let element = document.documentElement;
            if (this.fullscreen) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) {
                    // IE11
                    element.msRequestFullscreen();
                }
            }
            this.fullscreen = !this.fullscreen;
        },
        msgopen() {
            this.$refs.messageBox.addEventListener('scroll', this.handleScroll);
        },
        showMessage() {
            getMessageList(this.query).then(res => {
                if (res.code = 200) {
                    this.list = res.data
                    this.query.total = res.total

                    this.show = true
                } else {
                    this.$message.error('系统错误')
                }
            })
        },
        beforeDestroy() {
            // 移除滚动事件监听器
            this.$refs.messageBox.removeEventListener('scroll', this.handleScroll);
        },
        allClear() {
            this.$confirm('是否将所有消息标记为已读?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //获取this.list中所有isread=0的id
                let ids = this.list.filter(item => item.isread == 0).map(item => item.id)
                readMessage(ids.join(',')).then(res => {
                    if (res.code == 200) {
                        this.$message.success('操作成功')
                        this.readCount = 0
                        getMessageList(this.query).then(res => {
                            if (res.code = 200) {
                                this.list = res.data
                            } else {
                                this.$message.error('系统错误')
                            }
                        })
                    } else {
                        this.$message.error(res.msg)
                    }
                })
            })
        },
        handleScroll() {
            // 如果正在加载数据，或者已经加载完所有数据，就直接返回
            if (this.loading || this.allLoaded) {
                return;
            }

            // 检查是否已经滚动到底部
            let scrollTop = this.$refs.messageBox.scrollTop;
            let scrollHeight = this.$refs.messageBox.scrollHeight;
            let clientHeight = this.$refs.messageBox.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight) {
                // 如果已经滚动到底部，就加载更多数据
                this.loadMoreData();
            }
        },
        loadMoreData() {
            if (this.list.length < this.query.total) {
                this.loading = true;
                this.query.page++
                getMessageList(this.query).then(res => {
                    if (res.code = 200) {
                        this.list = this.list.concat(res.data)
                        this.loading = false
                    } else {
                        this.$message.error('系统错误')
                    }
                })
                return
            } else {
                this.allLoaded = true
            }
            // 加载更多数据的逻辑...
            // 注意：你需要在数据加载完毕后将this.loading设置为false
            // 如果已经加载完所有数据，你需要将this.allLoaded设置为true
        },
        copy(test) {
            let input = document.createElement('input');
            input.value = test;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            this.$message.success('复制成功')
        },
        readok(id) {
            readMessage(id).then(res => {
                if (res.code == 200) {
                    this.$message.success('操作成功')
                    this.readCount--
                    //找到当前id的索引，修改isread为1
                    let index = this.list.findIndex(item => item.id == id)
                    this.list[index].isread = 1

                } else {
                    this.$message.error(res.msg)
                }
            })
        }
    },
    mounted() {

        if (document.body.clientWidth < 1500) {
            this.collapseChage();
        }
        getUnreadMessage().then(res => {
            this.readCount = res.data;
            if (this.readCount > 0) {
                this.$notify({
                    title: '提示',
                    message: `您有${this.readCount}条未读消息`,
                    type: 'warning',
                    offset: 60
                });
            }
        });
        //轮询获取未读消息
        setInterval(() => {
            getUnreadMessage().then(res => {
                this.readCount = res.data;
                if (this.readCount > 0) {
                    this.$notify({
                        title: '提示',
                        message: `您有${this.readCount}条未读消息`,
                        type: 'warning',
                        offset: 60
                    });
                }
            });
        }, 60000);
    }
};
</script>
<style scoped>
.header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 70px;
    font-size: 22px;
    color: #fff;
}

.collapse-btn {
    float: left;
    padding: 0 21px;
    cursor: pointer;
    line-height: 70px;
}

.header .logo {
    float: left;
    width: 250px;
    line-height: 70px;
}

.header-right {
    float: right;
    padding-right: 50px;
}

.header-user-con {
    display: flex;
    height: 70px;
    align-items: center;
}

.btn-fullscreen {
    transform: rotate(45deg);
    margin-right: 5px;
    font-size: 24px;
}

.message {
    margin-right: 30px;
    transform: rotate(0deg);
    position: relative;
}

::v-deep .el-badge__content {
    border-color: red !important;
    background: red !important;
}

.btn-bell,
.btn-fullscreen {
    position: relative;
    width: 30px;
    height: 30px;
    text-align: center;
    border-radius: 15px;
    cursor: pointer;
}

.btn-bell-badge {
    position: absolute;
    right: 0;
    top: -2px;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: red;
    color: #fff;
}

.btn-bell .el-icon-bell {
    color: #fff;
}

.user-name {
    margin-left: 10px;
}

.user-avator {
    margin-left: 20px;
}

.user-avator img {
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.el-dropdown-link {
    color: #fff;
    cursor: pointer;
}

.el-dropdown-menu__item {
    text-align: center;
}

.clear {
    display: flex;
    align-items: center;
    font-size: 15px;
    color: #409EFF;
    cursor: pointer;
    padding-right: 25px;
}

.clear img {
    width: 15px;
    height: 15px;
    display: block;
    margin-right: 5px;
    position: relative;
    top: 2px;
}

.nono {
    display: block;
    text-align: center;
    color: #aaa;
    font-size: 14px;
    width: 100%;
    margin-top: 80px;
}

.messageBox {
    width: 100%;
    background: #fff;
    height: 100%;
    overflow: auto;
}

.more {
    display: block;
    text-align: center;
    color: #aaa;
    font-size: 14px;
    width: 100%;
    margin-top: 10px;
    margin-bottom: 10px;
}

.msgitem {
    /* margin-bottom: 20px; */
    border-bottom: 1px solid rgb(231, 234, 239);
    ;
    padding: 30px 20px 20px 28px;
    position: relative;
}

.msgitem:hover {
    background: rgb(231, 234, 239);
}

.msgitem:hover>.readok {
    display: block;
}

.msgitem .item-title {
    display: flex;
    align-items: center;
    width: 100%;
    margin-bottom: 6px;
}

.item-title .time {
    font-size: 14px;
    color: #aaa;
    display: block;
    margin-left: 10px;
}

.msgitem .msg-content {
    font-size: 15px;
    color: #333;
    display: block;
    line-height: 24px;
    margin-left: 10px;
}

.msg-content .copy {
    cursor: pointer;
    /* 蓝色下划线 */
    text-decoration: underline;
    color: #409EFF;
    display: inline-block;
}

.msgitem .isread {
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background: red;
    top: 35px;
    left: 10px;
}

.readok {
    font-size: 14px;
    color: #409EFF;
    cursor: pointer;
    position: absolute;
    right: 20px;
    top: 30px;
    display: none;
}
</style>

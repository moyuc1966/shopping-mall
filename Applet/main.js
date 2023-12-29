import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
Vue.config.productionTip = false
App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import {
    createSSRApp
} from 'vue'
export function createApp() {
    const app = createSSRApp(App)
    return {
        app
    }
}
// #endif

import uView from '@/uni_modules/uview-ui'
Vue.use(uView)

const $url = 'http://192.168.0.109:3200' //后端地址

Vue.prototype.$merchant_id = '1********9' // 商户号，用来确认收货

Vue.prototype.apiUrl = () => {
    return $url
}

Vue.prototype.$url = $url

Vue.prototype.hs = (islogin, md, url, data, fun, errFunctio = () => {}) => {
    if (islogin) {
        uni.showLoading({
            title: '加载中..'
        })
    }
    let head = {
        "Authorization": 'Bearer ' + uni.getStorageSync('token')
    }
    uni.request({
        url: $url + url,
        header: head,
        method: md,
        data: data,
        success: (res) => {
            uni.hideLoading()
            if (res.data.code == 403 && url != '/api/checkLogin') {
                uni.showToast({
                    title: '请先登录',
                    icon: 'error',
                    duration: 3000
                })
                setTimeout(() => {
                    uni.switchTab({
                        url: '/pages/my/my'
                    })
                }, 800)
            } else if (res.data.code == 405) {
                uni.showToast({
                    title: '未激活或被封禁',
                    icon: 'error',
                    duration: 5000
                })
            } else {
                fun(res)
            }
        },
        fail: (err) => {
            uni.hideLoading()
            console.log(err);
            if (err.data.code == 403) {
                uni.showToast({
                    title: '请先登录',
                    icon: 'error'
                })
                setTimeout(() => {
                    uni.switchTab({
                        url: '/pages/my/my'
                    })
                }, 800)
            } else {
                uni.showToast({
                    title: '网络异常',
                    icon: 'error',
                    duration: 2000
                })
                errFunctio(err)
            }
        }
    })
}


Vue.prototype.tw = (text) => {
    uni.showToast({
        title: text,
        icon: 'none',
        duration: 3000
    })
}
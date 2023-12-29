import axios from 'axios';
import Vue from 'vue';
import Router from 'vue-router';

import { Loading } from 'element-ui';

let loadingInstance = null;

const service = axios.create({
    baseURL: Vue.prototype.$api,
    timeout: 5000,
});

const router = new Router({
    // your routes configuration
})

// service.get('/admin/system/getUnreadMsgCount', { hideLoading: true })

service.interceptors.request.use(
    config => {
        if (!config.hideLoading) {
            loadingInstance = Loading.service({ fullscreen: true });
        }
        config.headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
        return config;
    },
    error => {
        if (loadingInstance) {
            loadingInstance.close();
        }
        console.log(error);
        return Promise.reject();
    }
);

service.interceptors.response.use(
    response => {
        if (loadingInstance) {
            loadingInstance.close();
        }
        if (response.data.code === 403) {
            // 403 登录过期，删除token并跳转到登录页面
            localStorage.removeItem('token');
            Vue.prototype.$message({
                message: '登录过期，请重新登录',
                type: 'error'
            });
            //跳转/login
            window.location.reload();
        } else {
            return response.data;
        }
    },
    error => {
        if (loadingInstance) {
            loadingInstance.close();
        }
        console.log(error);
        return Promise.reject();
    }
);

export default service;

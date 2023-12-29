import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/',
            component: () => import(/* webpackChunkName: "home" */ '../components/common/Home.vue'),
            meta: { title: '自述文件' },
            children: [
                {
                    path: '/404',
                    component: () => import(/* webpackChunkName: "404" */ '../components/page/404.vue'),
                    meta: { title: '404' }
                },
                {
                    path: '/403',
                    component: () => import(/* webpackChunkName: "403" */ '../components/page/403.vue'),
                    meta: { title: '403' }
                },
                {
                    path: '/dashboard',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/Dashboard.vue'),
                    meta: { title: '系统首页' }
                },
                {
                    path: '/userList',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/userList.vue'),
                    meta: { title: '用户列表' }
                },
                {
                    path: '/receivingAddress',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/userReceivingAddress.vue'),
                    meta: { title: '收货地址管理' }
                },
                {
                    path: '/shoppingCart',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/userShoppingCart.vue'),
                    meta: { title: '用户购物车' }
                },
                {
                    path: '/classification',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/classification.vue'),
                    meta: { title: '商品分类' }
                },
                {
                    path: '/commodityList',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/commodityList.vue'),
                    meta: { title: '商品列表' }
                },
                {
                    path: '/commodityInfo',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/commodityInfo.vue'),
                    meta: { title: '商品详情' }
                },
                {
                    path: '/commodityAdd',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/commodityAdd.vue'),
                    meta: { title: '发布商品' }
                },
                {
                    path: '/commodityReviews',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/commodityReviews.vue'),
                    meta: { title: '商品评价' }
                },
                {
                    path: '/order',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/order.vue'),
                    meta: { title: '系统订单' }
                },
                {
                    path: '/orderInfo',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/orderInfo.vue'),
                    meta: { title: '订单详情' }
                },
                {
                    path: '/coupon',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/coupon.vue'),
                    meta: { title: '优惠券' }
                },
                {
                    path: '/systemInfo',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/systemInfo.vue'),
                    meta: { title: '系统信息' }
                },
                {
                    path: '/systemAdmin',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/systemAdmin.vue'),
                    meta: { title: '管理员' }
                }
            ]
        },
        {
            path: '/login',
            component: () => import(/* webpackChunkName: "login" */ '../components/page/Login.vue'),
            meta: { title: '登录' }
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
});

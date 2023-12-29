import request from '../utils/request';

//管理员登录
export const login = data => {
    return request({
        url: '/admin/login',
        method: 'POST',
        data: data
    });
};

//获取首页统计数据
export const getHomeCount = () => {
    return request({
        url: '/admin/system/getSystemData',
        method: 'get'
    });
};

//获取用户列表
export const getUserList = (query) => {
    let select = ''
    if (query.type != '' && query.type != null && query.name != '' && query.name != null) select = `&${query.type}=${query.name}`
    return request({
        url: `/admin/user/userList?page=${query.page}&limit=${query.limit}${select}`,
        method: 'get'
    });
};

//用户状态切换
export const userStatus = (data) => {
    return request({
        url: `/admin/user/prohibitedUsers`,
        method: 'put',
        data: data
    });
};

//删除用户
export const userDelete = (id) => {
    return request({
        url: `/admin/user/userDel?id=${id}`,
        method: 'DELETE'
    })
}

//获取用户地址
export const getUserAddress = (query) => {
    let select = ''
    if (query.id != '' && query.id != null) select = `&id=${query.id}`
    return request({
        url: `/admin/user/userAddress?page=${query.page}&limit=${query.limit}${select}`,
        method: 'get'
    });
};

//删除用户地址
export const userAddressDelete = (id) => {
    return request({
        url: `/admin/user/userAddressDel?id=${id}`,
        method: 'DELETE'
    })
}

//获取用户购物车
export const getUserCart = (query) => {
    let select = ''
    if (query.id != '' && query.id != null) select = `&id=${query.id}`
    return request({
        url: `/admin/user/userCart?page=${query.page}&limit=${query.limit}${select}`,
        method: 'get'
    });
};

//删除用户地址
export const userCartDelete = (id) => {
    return request({
        url: `/admin/user/userCartDel?id=${id}`,
        method: 'DELETE'
    })
}

//获取商品分类
export const getCategory = (query) => {
    let select = ''
    if (query.name != '' && query.name != null) select = `&name=${query.name}`
    return request({
        url: `/admin/productClassificationList?page=${query.page}&limit=${query.limit}${select}`,
        method: 'get'
    });
};

//删除商品分类
export const categoryDelete = (id) => {
    return request({
        url: `/admin/deleteProductClassification?id=${id}`,
        method: 'DELETE'
    })
}

//修改商品分类名称
export const categoryUpdate = (data) => {
    return request({
        url: `/admin/modifyProductClassification/name`,
        method: 'put',
        data: data
    });
};

//修改商品分类图片
export const categoryUpdateImg = (data) => {
    return request({
        url: `/admin/modifyProductClassification/icon`,
        method: 'post',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

//添加商品分类
export const categoryAdd = (data) => {
    return request({
        url: `/admin/addProductClassification`,
        method: 'post',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

//获取商品列表
export const getProductList = (query) => {
    let select = ''
    if (query.category_id != '' && query.category_id != null) select = `&category_id=${query.category_id}`
    return request({
        url: `/admin/productList?page=${query.page}&limit=${query.limit}${select}`,
        method: 'get'
    });
}

//商品上下架
export const productStatus = (data) => {
    return request({
        url: `/admin/modifyProduct`,
        method: 'put',
        data: data
    });
};

//一键补充商品库存
export const productStock = (data) => {
    return request({
        url: `/admin/supplementStock`,
        method: 'post',
        data: data
    });
}

//商品搜索
export const searchProduct = (query) => {
    let select = ''
    if (query.type != '' && query.type != null && query.name != '' && query.name != null) select = `&${query.type}=${query.name}`
    return request({
        url: `/admin/searchProduct?page=${query.page}&limit=${query.limit}${select}`,
        method: 'get'
    });
};

//获取商品详情
export const getProductDetail = (id) => {
    return request({
        url: `/admin/productDetails?id=${id}`,
        method: 'get'
    });
}

//编辑商品
export const modifyProduct = (data) => {
    return request({
        url: `/admin/modifyProduct`,
        method: 'put',
        data: data
    });
}

//修改商品图片
export const modifyProductIcon = (data) => {
    return request({
        url: `/admin/modifyProductIcon`,
        method: 'post',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

//获取商品规格
export const productSpecificationsList = (id) => {
    return request({
        url: `/admin/productSpecificationsList?product_id=${id}`,
        method: 'get'
    });
}

//删除商品规格
export const deleteProductSpecifications = (id) => {
    return request({
        url: `/admin/deleteProductSpecifications?id=${id}`,
        method: 'DELETE'
    });
}

//修改商品规格
export const modifyProductSpecifications = (data) => {
    return request({
        url: `/admin/modifyProductSpecifications`,
        method: 'put',
        data: data
    });
}
//增加商品规格
export const addProductSpecifications = (data) => {
    return request({
        url: `/admin/addProductSpecifications`,
        method: 'post',
        data: data
    });
}

//修改商品介绍
export const modifyProductDescription = (data) => {
    return request({
        url: `/admin/modifyProduct`,
        method: 'put',
        data: data
    });
};
//文件上传接口
export const uploadFile = (data) => {
    return request({
        url: `/admin/system/uploadFile`,
        method: 'post',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

//删除商品
export const productDelete = (id) => {
    return request({
        url: `/admin/deleteProduct?id=${id}`,
        method: 'DELETE'
    });
}

//设置商品所属分类
export const setProductCategory = (data) => {
    return request({
        url: `/admin/modifyProductCategory`,
        method: 'put',
        data: data
    });
}

//添加商品
export const addProduct = (data) => {
    return request({
        url: `/admin/addProduct`,
        method: 'post',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

//发布商品评价
export const addProductEvaluation = (data) => {
    return request({
        url: `/admin/addProductComment`,
        method: 'post',
        data: data
    });
}

//获取商品评价
export const getProductCommentList = (query) => {
    let select = ''
    if (query.id != '' && query.id != null) select = `&product_id=${query.id}`
    return request({
        url: `/admin/productCommentList?page=${query.page}&limit=${query.limit}${select}`,
        method: 'get'
    });
};

//删除商品评价
export const deleteProductComment = (id) => {
    return request({
        url: `/admin/deleteProductComment?id=${id}`,
        method: 'DELETE'
    });
}

//修改商品评价
export const modifyProductComment = (data) => {
    return request({
        url: `/admin/modifyProductComment`,
        method: 'put',
        data: data
    });
}

//获取订单列表
export const getOrderList = (query) => {
    return request({
        url: `/admin/order/getOrderList?page=${query.page}&limit=${query.limit}`,
        method: 'get'
    });
};

//订单搜索
export const searchOrderList = (query) => {
    let select = ''
    if (query.type != '' && query.type != null && query.name != '' && query.name != null) select = `&${query.type}=${query.name}`
    return request({
        url: `/admin/order/searchOrderList?page=${query.page}&limit=${query.limit}${select}`,
        method: 'get'
    });
};

//修改订单状态
export const modifyOrderStatus = (data) => {
    return request({
        url: `/admin/order/updateOrderStatus`,
        method: 'put',
        data: data
    });
}

//逻辑删除订单
export const deleteOrder = (id) => {
    return request({
        url: `/admin/order/deleteOrder?id=${id}`,
        method: 'DELETE'
    });
}

//恢复订单
export const recoverOrder = (data) => {
    return request({
        url: `/admin/order/recoverOrder`,
        method: 'post',
        data: data
    });
}

//订单发货
export const deliverOrder = (data) => {
    return request({
        url: `/admin/order/deliverOrder`,
        method: 'post',
        data: data
    });
}

//获取订单详情
export const getOrderDetail = (id) => {
    return request({
        url: `/admin/order/getOrderDetail?id=${id}`,
        method: 'get'
    });
}

//修改收货信息
export const modifyOrderAddress = (data) => {
    return request({
        url: `/admin/order/updateOrder`,
        method: 'put',
        data: data
    });
}

//修改订单备注
export const modifyOrderRemark = (data) => {
    return request({
        url: `/admin/order/updateOrderRemark`,
        method: 'put',
        data: data
    });
}


//完全删除订单
export const deleteOrderDetailAll = (id) => {
    return request({
        url: `/admin/order/deleteOrderReal?id=${id}`,
        method: 'DELETE'
    });
}

//订单退款
export const refundOrder = (data) => {
    return request({
        url: `/admin/order/orderRefund`,
        method: 'post',
        data: data
    });
}

//获取优惠券列表
export const getCouponList = (query) => {
    let select = ''
    if (query.id != '' && query.id != null) select = `&user_id=${query.id}`
    return request({
        url: `/admin/couponList?page=${query.page}&limit=${query.limit}${select}`,
        method: 'get'
    });
};

//删除优惠券
export const deleteCoupon = (id) => {
    return request({
        url: `/admin/deleteCoupon?id=${id}`,
        method: 'DELETE'
    });
}

//修改优惠券
export const modifyCoupon = (data) => {
    return request({
        url: `/admin/modifyCoupon`,
        method: 'put',
        data: data
    });
}

//添加优惠券
export const addCoupon = (data) => {
    return request({
        url: `/admin/addCoupon`,
        method: 'post',
        data: data
    });
}

//获取系统设置
export const getSystemSetting = () => {
    return request({
        url: `/admin/system/getSystem`,
        method: 'get'
    });
}

//获取管理员信息
export const getAdminInfo = () => {
    return request({
        url: `/admin/system/getAdminInfo`,
        method: 'get'
    })
}

//修改管理员账号
export const modifyAdminAccount = (data) => {
    return request({
        url: `/admin/system/updateAdmin`,
        method: 'put',
        data: data
    });
}

//修改管理员密码
export const modifyAdminPassword = (data) => {
    return request({
        url: '/admin/system/updateAdminPwd',
        method: 'put',
        data: data
    })
}

//修改首页滚动公告
export const updateNotice = (notice) => {
    return request({
        url: '/admin/system/updateNotice',
        method: 'post',
        data: {
            notice: notice
        }
    })
}

//修改首页弹窗公告内容
export const updatePopupContent = (notice) => {
    return request({
        url: '/admin/system/updatePopupContent',
        method: 'post',
        data: {
            popupContent: notice
        }
    })
}

//修改弹窗公告开关
export const updatePopup = (notice) => {
    return request({
        url: '/admin/system/updatePopup',
        method: 'post',
        data: {
            popup: notice
        }
    })
}

//修改轮播图
export const updateSwiper = (data) => {
    return request({
        url: `/admin/system/updateSwiper`,
        method: 'post',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

//修改客服二维码
export const updateServiceQrCode = (data) => {
    return request({
        url: `/admin/system/updateQrcode`,
        method: 'post',
        data: data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

//修改首页展示分类
export const updateShowCategory = (data) => {
    return request({
        url: `/admin/system/updateCategory`,
        method: 'post',
        data: {
            category: data
        }
    });
}

//获取数据统计变化图
export const getStatistics = (data) => {
    return request({
        url: `/admin/system/orders/count`,
        method: 'get'
    });
}

//获取系统未读消息条数
export const getUnreadMessage = () => {
    return request({
        url: `/admin/system/getUnreadMsgCount`,
        method: 'get',
        hideLoading: true
    });
}

//获取系统消息列表
export const getMessageList = (query) => {
    return request({
        url: `/admin/system/getMsgList?page=${query.page}&limit=${query.limit}`,
        method: 'get',
        hideLoading: true
    });
}

//标记消息为已读
export const readMessage = (id) => {
    return request({
        url: `/admin/system/readMsg`,
        method: 'post',
        hideLoading: true,
        data: {
            id: id
        }
    });
}
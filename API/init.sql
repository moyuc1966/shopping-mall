-- 商城项目初始化数据库文件
-- 创建用户表
CREATE TABLE `user` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL COMMENT '用户唯一标识',
    `username` varchar(100) COMMENT '用户名',
    `openid` varchar(255) NOT NULL COMMENT '微信开放id',
    -- session_key，用于解密用户信息
    `session_key` varchar(255) NOT NULL COMMENT 'session_key',
    `phone` varchar(255) NOT NULL COMMENT '电话',
    -- 账号状态，0正常，1禁用
    `status` tinyint(3) NOT NULL DEFAULT '1' COMMENT '账号状态，0正常，1禁用',
    `create_time` datetime NOT NULL COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `user_uuid_unique` (`uuid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COMMENT = '用户表';


INSERT INTO user (id, uuid,username,openid,session_key,phone,status,create_time) VALUES (0, 'ABCDEF1234567890','系统管理员','system_init_info','123456789qwertyuiop==','12345678901',1,now());

-- 创建用户地址表
CREATE TABLE `user_address` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL COMMENT '用户id',
    `name` varchar(255) NOT NULL COMMENT '收货人姓名',
    `phone` varchar(255) NOT NULL COMMENT '收货人电话',
    `province` varchar(255) NOT NULL COMMENT '省份',
    `city` varchar(255) NOT NULL COMMENT '城市',
    `county` varchar(255) NOT NULL COMMENT '区县',
    `address_detail` varchar(255) NOT NULL COMMENT '详细地址',
    `is_default` tinyint(3) NOT NULL DEFAULT '0' COMMENT '是否默认地址',
    PRIMARY KEY (`id`),
    KEY `user_address_user_id_foreign` (`user_id`),
    CONSTRAINT `user_address_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COMMENT = '用户地址表';
-- 创建商品表
CREATE TABLE `product` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `uuid` varchar(36) NOT NULL COMMENT '商品唯一标识',
    `name` varchar(255) NOT NULL COMMENT '商品名称',
    `category` varchar(255) NOT NULL COMMENT '商品标签',
    `views` int(11) NOT NULL COMMENT '商品浏览量',
    `brief` varchar(512) NOT NULL COMMENT '商品简介',
    `sales` int(11) NOT NULL COMMENT '商品展示销量',
    `actual_sales` int(11) NOT NULL COMMENT '商品实际销量',
    `description` text NOT NULL COMMENT '商品描述',
    `icon` varchar(512) NOT NULL COMMENT '商品图片，半角逗号分隔',
    `status` tinyint(3) NOT NULL DEFAULT '0' COMMENT '商品状态,0正常1下架',
    -- 隶属分类，0则为未分类
    `category_id` int(11) NOT NULL DEFAULT '0' COMMENT '商品分类id',
    -- 邮费，如果为0则包邮
    `postage` DECIMAL(10, 2) NOT NULL DEFAULT '0.00' COMMENT '邮费',
    -- 商品人气，默认1，影响商品展示排序
    `popularity` int(11) NOT NULL DEFAULT '1' COMMENT '商品人气',
    `create_time` datetime NOT NULL COMMENT '创建时间',
    `update_time` datetime NOT NULL COMMENT '修改时间',
    PRIMARY KEY (`id`), -- 设置uuid为索引
    UNIQUE KEY `product_uuid_unique` (`uuid`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COMMENT = '商品表';
-- 创建购物车表
CREATE TABLE `cart` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL COMMENT '用户id',
    `product_id` int(11) NOT NULL COMMENT '商品id',
    -- 商品规格id，如果为0则为默认规格
    `product_specification_id` int(11) NOT NULL DEFAULT '0' COMMENT '商品规格id',
    `count` int(11) NOT NULL COMMENT '商品数量',
    `checked` tinyint(3) NOT NULL DEFAULT '1' COMMENT '是否选中',
    `create_time` datetime NOT NULL COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `cart_user_id_foreign` (`user_id`),
    KEY `cart_product_id_foreign` (`product_id`),
    CONSTRAINT `cart_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
    CONSTRAINT `cart_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COMMENT = '购物车表';
-- 创建商品规格表
CREATE TABLE `product_specification` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `product_id` int(11) NOT NULL COMMENT '商品id',
    `name` varchar(255) NOT NULL COMMENT '规格名称',
    `value` DECIMAL(10, 2) NOT NULL COMMENT '规格价格',
    `stock` int(11) NOT NULL COMMENT '商品库存',
    PRIMARY KEY (`id`),
    KEY `product_specification_product_id_foreign` (`product_id`),
    CONSTRAINT `product_specification_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COMMENT = '商品规格表';
-- 创建商品评价表
CREATE TABLE `product_comment` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `product_id` int(11) NOT NULL COMMENT '商品id',
    `user_id` int(11) NOT NULL COMMENT '用户id', -- 0表示管理员发布
    `content` varchar(255) NOT NULL COMMENT '评价内容',
    `create_time` datetime NOT NULL COMMENT '创建时间',
    `star` tinyint(3) NOT NULL DEFAULT '5' COMMENT '评价星级',
    `is_anonymous` tinyint(3) NOT NULL DEFAULT '0' COMMENT '是否匿名评价，0否1是',
    PRIMARY KEY (`id`),
    KEY `product_comment_product_id_foreign` (`product_id`),
    CONSTRAINT `product_comment_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
    CONSTRAINT `product_comment_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) -- 异常，删除
) ENGINE = InnoDB AUTO_INCREMENT = 3 DEFAULT CHARSET = utf8mb4 COMMENT = '商品评价表';
-- 创建商品分类表
CREATE TABLE `product_category` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL COMMENT '分类名称',
    `icon` varchar(255) NOT NULL COMMENT '分类图标',
    `create_time` datetime NOT NULL COMMENT '创建时间',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COMMENT = '商品分类表';
-- 创建订单表
CREATE TABLE `order` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `user_id` int(11) NOT NULL COMMENT '用户id',
    `order_no` varchar(255) NOT NULL COMMENT '订单号',
    `total_price` DECIMAL(10, 2) NOT NULL COMMENT '订单总价',
    `actual_price` DECIMAL(10, 2) NOT NULL COMMENT '实付价格',
    `status` tinyint(3) NOT NULL DEFAULT '0' COMMENT '状态,0未支付1已支付2待发货3待收货4待评价5已完成6已退款',
    `pay_time` datetime DEFAULT NULL COMMENT '支付时间',
    `create_time` datetime NOT NULL COMMENT '创建时间',
    `address` varchar(255) NOT NULL COMMENT '订单地址',
    `transaction_id` varchar(255) DEFAULT NULL COMMENT '微信支付订单号',
    -- 删除状态，0未删除，1已删除
    `delete_status` tinyint(3) NOT NULL DEFAULT '0' COMMENT '删除状态，0未删除，1已删除',
    `ip` varchar(255) NOT NULL COMMENT '下单ip',
    `remark` varchar(255) NOT NULL COMMENT '订单备注',
    `product_id` int(11) NOT NULL COMMENT '商品id',
    -- 商品规格id，如果为0则为默认规格
    `product_specification_id` int(11) NOT NULL DEFAULT '0' COMMENT '商品规格id',
    -- 优惠券id，如果为0则不使用优惠券
    `coupon_id` int(11) NOT NULL DEFAULT '0' COMMENT '优惠券id',
    `count` int(11) NOT NULL COMMENT '商品数量',
    -- 收货人信息
    `name` varchar(255) NOT NULL COMMENT '收货人姓名',
    `phone` varchar(255) NOT NULL COMMENT '收货人电话',
    -- 快递信息
    `express_no` varchar(255) DEFAULT NULL COMMENT '快递单号',
    `express_company` varchar(255) DEFAULT NULL COMMENT '快递公司',
    -- 快递发货时间 
    `express_time` datetime DEFAULT NULL COMMENT '快递发货时间',
    -- 签收时间
    `sign_time` datetime DEFAULT NULL COMMENT '签收时间',
    PRIMARY KEY (`id`),
    KEY `order_user_id_foreign` (`user_id`),
    CONSTRAINT `order_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COMMENT = '订单表';

CREATE INDEX idx_state ON `order` (status);
CREATE INDEX idx_create_time ON `order` (create_time);
-- 优惠券表
CREATE TABLE `coupon` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    -- 用户id，如果为0则为全局优惠券
    `user_id` int(11) NOT NULL DEFAULT '0' COMMENT '用户id',
    `name` varchar(255) NOT NULL COMMENT '优惠券名称',
    `amount` DECIMAL(10, 2) NOT NULL COMMENT '优惠券金额',
    `min` DECIMAL(10, 2) NOT NULL COMMENT '最低消费金额',
    `start_time` datetime NOT NULL COMMENT '开始时间',
    `end_time` datetime NOT NULL COMMENT '结束时间',
    `status` tinyint(3) NOT NULL DEFAULT '0' COMMENT '优惠券状态,0正常1过期2已使用',
    `create_time` datetime NOT NULL COMMENT '创建时间',
    -- 使用时间，未使用则为null
    `use_time` datetime DEFAULT NULL COMMENT '使用时间',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COMMENT = '优惠券表';
-- 管理员表
CREATE TABLE `admin` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `username` varchar(100) NOT NULL COMMENT '管理员用户名',
    `password` varchar(255) NOT NULL COMMENT '管理员密码',
    `create_time` datetime NOT NULL COMMENT '创建时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `admin_username_unique` (`username`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COMMENT = '管理员表';
-- 默认管理员
INSERT INTO `admin`
VALUES (1, 'admin', 'e50de14051afd6aacd8d1560f2f08579', now());
-- 系统设置表
CREATE TABLE `system` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    -- 轮播图，半角逗号分隔
    `swiper` varchar(512) NOT NULL COMMENT '轮播图',
    `notice` varchar(255) NOT NULL COMMENT '首页滚动公告',
    -- 首页弹窗公告开关
    `notice_switch` tinyint(3) NOT NULL DEFAULT '0' COMMENT '首页弹窗公告开关，0关闭，1开启',
    -- 首页弹窗公告内容
    `notice_content` varchar(255) NOT NULL COMMENT '首页弹窗公告内容',
    -- 首页展示分类，半角逗号分隔，最高支持5个分类,0则在首页不展示分类
    `category` varchar(50) NOT NULL COMMENT '首页展示分类',
    -- 客服二维码
    `service_qr_code` varchar(255) NOT NULL COMMENT '客服二维码',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COMMENT = '系统设置表';
-- 默认系统设置
INSERT INTO `system`
VALUES (
        1,
        '/public/swiper/swiper1.jpg',
        '欢迎来到商城',
        0,
        '欢迎来到商城',
        '1,2,3,4,5',
        '/public/system/qr.png'
    );

-- 系统消息表
CREATE TABLE `system_message` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL COMMENT '消息标题',
    `content` varchar(255) NOT NULL COMMENT '消息内容',
    `create_time` datetime NOT NULL COMMENT '创建时间',
    `type` varchar(10) DEFAULT 'error' COMMENT '消息类型，success，error',
    `isread` tinyint(3) NOT NULL DEFAULT '0' COMMENT '是否已读，0未读，1已读',
    `copy` varchar(255) DEFAULT NULL COMMENT '复制内容',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 2 DEFAULT CHARSET = utf8mb4 COMMENT = '系统消息表';


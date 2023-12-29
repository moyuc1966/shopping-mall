<template>
    <div>
        <el-row :gutter="20" class="mgb20">
            <el-col :span="4">
                <el-card shadow="hover" :body-style="{ padding: '0px' }">
                    <div class="grid-content grid-con-3">
                        <i class="el-icon-lx-shop grid-con-icon"></i>
                        <div class="grid-cont-right">
                            <div class="grid-num">{{ count.today_order_count }}</div>
                            <div>今日新增订单数</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="4">
                <el-card shadow="hover" :body-style="{ padding: '0px' }">
                    <div class="grid-content grid-con-2">
                        <i class="el-icon-lx-notice grid-con-icon"></i>
                        <div class="grid-cont-right">
                            <div class="grid-num">{{ count.today_order_real_price_count }}</div>
                            <div>今日订单实付总额</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="4">
                <el-card shadow="hover" :body-style="{ padding: '0px' }">
                    <div class="grid-content grid-con-1">
                        <i class="el-icon-lx-friendadd grid-con-icon"></i>
                        <div class="grid-cont-right">
                            <div class="grid-num">{{ count.today_user_count }}</div>
                            <div>今日注册用户数</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="4">
                <el-card shadow="hover" :body-style="{ padding: '0px' }">
                    <div class="grid-content grid-con-4">
                        <i class="el-icon-lx-exit grid-con-icon"></i>
                        <div class="grid-cont-right">
                            <div class="grid-num">{{ count.order_wait_send_count }}</div>
                            <div>待发货数量</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
            <el-col :span="4">
                <el-card shadow="hover" :body-style="{ padding: '0px' }">
                    <div class="grid-content grid-con-5">
                        <i class="el-icon-lx-recharge grid-con-icon"></i>
                        <div class="grid-cont-right">
                            <div class="grid-num">{{ count.order_real_price_count }}</div>
                            <div>订单实付总额</div>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
        <el-divider></el-divider>
        <div :gutter="15" style="background:#fff; width:calc(100% - 150px);padding:15px 0;">
            <el-row>
                <el-col :span="4">
                    <div>
                        <el-statistic group-separator="," :value="count.order_count" title="系统订单总数"></el-statistic>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div>
                        <el-statistic group-separator="," :value="count.coupon_use_count" title="优惠券使用数量"></el-statistic>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div>
                        <el-statistic group-separator="," :value="count.coupon_use_price_count" :precision="2" prefix="￥"
                            title="优惠券使用总额"></el-statistic>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div>
                        <el-statistic group-separator="," :value="count.order_wait_receive_count"
                            title="运送中订单量"></el-statistic>
                    </div>
                </el-col>
                <el-col :span="4">
                    <div>
                        <el-statistic group-separator="," :value="count.product_count" title="系统商品总数"></el-statistic>
                    </div>
                </el-col>
            </el-row>
        </div>
        <!-- <el-divider></el-divider> -->

        <div class="schart-box" ref="canvas"
            style="height:580px; width:calc(100% - 100px);background:#fff;margin-top:35px;">
        </div>

    </div>
</template>

<script>
import { getHomeCount, getStatistics } from '../../api/index';
export default {
    name: 'basecharts',
    data() {
        return {
            name: localStorage.getItem('ms_username'),
            count: {
                today_order_count: 0,
                order_real_price_count: 0,
                today_user_count: 0,
                order_wait_send_count: 0,
                order_real_price_count: 0
            },
            countData: [],
            options2: {
                backgroundColor: '#fff',
                xAxis: {
                    type: 'category',
                    data: [],
                    name: '日期'
                },
                yAxis: {
                    type: 'value',
                    name: '订单数量',
                    minInterval: 1,
                    axisLine: {
                        show: true
                    }
                },
                series: [
                    {
                        name: '订单数量',
                        data: [],
                        type: 'line',
                        label: {
                            show: true,
                            position: 'top',
                            textStyle: {
                                fontSize: 20
                            }
                        }
                    }
                ],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    },
                    // formatter: "{a} <br/>{b} : {c}"
                },
                grid: {
                    left: 50,
                    right: 70,
                    top: 100
                },
                title: {
                    show: true,
                    text: '近30天订单数量变化趋势图',
                    left: 20,
                    top: 20
                },
            }
        };
    },
    computed: {
        role() {
            return this.name === 'admin' ? '超级管理员' : '普通用户';
        }
    },
    created() {
        getHomeCount().then(res => {
            this.count = res.data
            if (this.count.product_stock_count > 0) {
                this.$alert(`有${this.count.product_stock_count}个商品规格库存低于10，请及时补充库存`, '标题名称', {
                    confirmButtonText: '确定',
                });
            }
        });
        getStatistics().then(res => {
            this.countData = res.data
            this.countData.forEach(item => {
                this.options2.xAxis.data.push(item.date)
                this.options2.series[0].data.push(item.count)
                let myChart = this.$echarts.init(this.$refs.canvas)
                myChart.setOption(this.options2)
                window.addEventListener('resize', function () {
                    myChart.resize();
                });
            });
        })

    },
    methods: {

    }
};
</script>


<style scoped>
.el-row {
    margin-bottom: 20px;
}

.grid-content {
    display: flex;
    align-items: center;
    height: 80px;
}

.grid-cont-right {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: #999;
}

.grid-num {
    font-size: 26px;
    font-weight: bold;
}

.grid-con-icon {
    font-size: 30px;
    width: 80px;
    height: 80px;
    text-align: center;
    line-height: 80px;
    color: #fff;
}

.grid-con-1 .grid-con-icon {
    background: rgb(45, 140, 240);
}

.grid-con-1 .grid-num {
    color: rgb(45, 140, 240);
}

.grid-con-2 .grid-con-icon {
    background: rgb(100, 213, 114);
}

.grid-con-2 .grid-num {
    color: rgb(45, 140, 240);
}

.grid-con-3 .grid-con-icon {
    background: rgb(242, 94, 67);
}

.grid-con-3 .grid-num {
    color: rgb(242, 94, 67);
}

.grid-con-4 .grid-con-icon {
    background: #E6A23C;
}

.grid-con-4 .grid-num {
    color: #E6A23C;
}

.grid-con-5 .grid-con-icon {
    background: rgb(242, 94, 67);
}

.grid-con-5 .grid-num {
    color: rgb(242, 94, 67);
}
</style>

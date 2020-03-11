<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 为echarts 准备一个具备大小(高度)的 Dom -->
      <div id="main" style="width: 750px;height: 400px;"></div>
    </el-card>
  </div>
</template>
<script>
// 1.导入echarts
import echarts from 'echarts'
import _ from 'lodash'

export default {
  data() {
    return {
      // 需要合并的数据
      options: {
        title: {
          text: 'ECharts 入门实例'
        },
        tooltip: {},
        legend: {
          // data: ['销量']
        },
        xAxis: {
          data: ['衬衫', '羊毛衫', '裤子', '袜子']
        },
        yAxis: {},
        series: [
          {
            name: '销量',
            type: 'bar',
            data: [5, 20, 34, 10]
          }
        ]
      }
    }
  },
  created() {},
  // 此时页面上元素已经被渲染完毕了
  async mounted() {
    // 3.基于准备好的dom, 初始化echarts 实例
    var myChart = echarts.init(document.getElementById('main'))
    // 获取报表数据
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败')
    }
    // 4.准备数据和配置项
    /* var option = {
      title: {
        text: 'ECharts 入门实例'
      },
      tooltip: {},
      legend: {
        data: ['销量']
      },
      xAxis: {
        data: ['衬衫', '羊毛衫', '裤子', '袜子']
      },
      yAxis: {},
      series: [
        {
          name: '销量',
          type: 'bar',
          data: [5, 20, 34, 10]
        }
      ]
    } */
    // 5.展示数据
    // 合并数据
    const result = _.merge(res.data, this.options)
    myChart.setOption(result)
  },
  methods: {}
}
</script>
<style lang="less" scoped></style>

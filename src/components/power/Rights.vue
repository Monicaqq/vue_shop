<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 渲染权限列表数据 -->
      <el-table :data="rightlist" style="width: 100%" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称" ></el-table-column>
        <el-table-column prop="path" label="路径" ></el-table-column>
        <el-table-column prop="level" label="权限等级" >
          <template slot-scope="slotProps">
            <el-tag v-model="slotProps.row" v-if="slotProps.row.level === '0' " type="success">一级</el-tag>
            <el-tag v-model="slotProps.row" v-if="slotProps.row.level === '1' " type="info">二级</el-tag>
            <el-tag v-model="slotProps.row" v-if="slotProps.row.level === '2' " type="warning">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      rightlist: [],
      //  权限等级标签
      rightTags: [
        { name: '0', type: 'success' },
        { name: '1', type: 'info' },
        { name: '2', type: 'warning' }
      ]
    }
  },
  created() {
    this.getRightsList()
  },
  methods: {
    // 获取权限列表数据
    async getRightsList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rightlist = res.data
      console.log(res)
    }
  }
}
</script>
<style lang="less" scope>
</style>

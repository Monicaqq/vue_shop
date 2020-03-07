<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 添加分类按钮 -->
      <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      <!-- 表格 -->
      <tree-table
        :data="cateslist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen;"
          ></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0" size="mini">一级</el-tag>
          <el-tag type="success" v-if="scope.row.cat_level === 1" size="mini">二级</el-tag>
          <el-tag type="warning" v-if="scope.row.cat_level === 2" size="mini">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="slotProps">
          <!-- 编辑按钮 -->
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(slotProps.row.id)"
          >编辑</el-button>
          <!-- 删除按钮 -->
          <el-button
            type="danger"
            icon="el-icon-edit"
            size="mini"
            @click="removeCateById(slotProps.row.id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 对话框内容主体区域 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- 级联选择器 options指定数据源, props指定配置对象-->
          <el-cascader
            expandTrigger="hover"
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 获取商品分类的参数对象
      queryInfo: {
        type: '',
        pagenum: 1,
        pagesize: 5
      },
      total: 0,
      // 商品分类的数据列表
      cateslist: [],
      // 为 table 指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 将当前列定义为模板列
          type: 'template',
          // 表示当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类的对话框
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 分类等级, 默认添加一级分类
        cat_level: 0
      },
      // 验证添加分类的表单规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请添加分类名称', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 指定级联选择器具体的配置对象
      cascaderProps: {
        // value: 选中绑定值 label:所看见的属性文字 children:父子嵌套的属性
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // selectedKeys是一个数组, 包括选中的父级分类数组
      selectedKeys: []
    }
  },
  created() {
    this.getCatesList()
  },
  methods: {
    // 获取商品分类列表, type 为 [1,2,3]
    async getCatesList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateslist = res.data.result
      // console.log(res.data)
      this.total = res.data.total
    },
    //  监听 pagesize 改变的事件, 获取新的pagesize 后需要重新获取列表数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCatesList()
    },
    // 监听页面值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCatesList()
    },
    // 点击按钮, 展示添加商品分类的对话框
    showAddCateDialog() {
      // 点击按钮, 就获取父级分类列表的数据
      this.getParentCateList()
      // 再展示出对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类的数据列表, type为 [1,2]
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: {
          type: 2
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      // console.log(res.data)
      this.parentCateList = res.data
      console.log(res)
    },
    // 选中项发生变化触发的事件
    parentCateChange() {
      // 如果selectedKeys 数组中length > 0,证明选中了父级分类
      // 反之没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 数组的最后一个就是父级,赋值给父级id
        this.addCateForm.car_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 默认level 是 0,选中一个父级level变为1,选中两级level变为2
        this.addCateForm.car_level = this.selectedKeys.length
      } else {
        // 如果lenght = 0, 选中的默认是父级分类id,level=0
        this.addCateForm.car_pid = 0
        this.addCateForm.car_level = 0
      }
    },
    // 监听添加用户对话框的关闭事件
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_pid = ''
      this.addCateForm.cat_level = ''
    },
    // 点击按钮,添加新的分类
    async addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCatesList()
        this.addCateDialogVisible = false
      })
    },
    // 编辑商品分类
    showEditCateDialog(id) {
      console.log('编辑商品分类')
    },
    // 删除商品分类
    removeCateById() {
      console.log('删除商品分类')
    }
  }
}
</script>
<style lang="less">
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
.el-cascader-panel {
  height: 240px;
}
</style>

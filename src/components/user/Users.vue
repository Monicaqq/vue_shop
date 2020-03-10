<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            class="input-with-select"
            @clear="getUsersList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 渲染用户列表数据 -->
      <el-table :data="userlist" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180"></el-table-column>
        <el-table-column prop="email" label="邮箱" width="180"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色" width="180"></el-table-column>
        <!-- 因为设置了插槽, 所以props 被覆盖了, 删除即可 -->
        <el-table-column label="状态">
          <!-- 通过插槽scope.row 获取该条记录的完整数据 -->
          <template slot-scope="slotProps">
            <el-switch v-model="slotProps.row.mg_state" @change="userStateChanged(slotProps.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="slotProps">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(slotProps.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(slotProps.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(slotProps.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination></el-pagination>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 对话框内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 对话框内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 对话框底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close='setRoleDialogClosed'>
      <div>
        <p>当前的用户: {{userInfo.username}}</p>
        <p>当前的角色: {{userInfo.role_name}}</p>
        <!-- 角色下拉菜单 -->
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <!-- 角色下拉菜单 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    // 邮箱和手机号的校验规则
    var checkEmail = (rules, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法邮箱
        return cb()
      }
      // 非法邮箱
      cb(new Error('请输入合法的邮箱'))
    }
    var checkMobile = (rules, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        //  当前的页数
        pagenum: 1,
        pagesize: 2
      },
      userlist: [],
      total: 0,
      //  控制是否弹出添加用户对话框
      addDialogVisible: false,
      // 控制修改用户对话框
      editDialogVisible: false,
      // 根据 id 查询到的用户数据
      editForm: {},
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户验证规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 3,
            max: 10,
            message: '用户名的长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '密码长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改用户验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框是否展示
      setRoleDialogVisible: false,
      // 需要被分配角色权限的用户信息
      userInfo: {},
      // 所有角色的数据列表
      roleList: [],
      selectedRoleId: ''
    }
  },
  created() {
    this.getUsersList()
  },
  methods: {
    async getUsersList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // console.log(res)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.userlist = res.data.users
      this.total = res.data.total
    },
    //  监听 pagesize 改变的事件, 获取新的pagesize 后需要重新获取列表数据
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUsersList()
    },
    // 监听页面值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUsersList()
    },
    // 监听switch 开关状态的改变
    async userStateChanged(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功！')
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮,添加用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        // 验证成功时 valid 为 true, 反之为false
        if (!valid) return
        // valide 为true, 调用添加用户的接口,传递数据
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        this.$message.success('添加用户成功！')
        // 添加成功后, 隐藏添加用户对话框
        this.addDialogVisible = false
        // 刷新用户列表
        this.getUsersList()
      })
    },
    // 展示编辑用户的对话框
    async showEditDialog(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      // console.log('--------', this.editForm)
    },
    // 修改对话框的重置操作
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息提交操作
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        // 发起修改用户信息的请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户信息失败')
        }
        // this.addUser()
        this.editDialogVisible = false
        this.getUsersList()
        this.$message.success('修改用户信息成功')
      })
    },
    // 删除操作
    async removeUserById(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 用户确认删除,返回字符串 confirm.反之返回字符串 cancle
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.info('删除用户成功')
      this.getUsersList()
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      // 在展示对话框前展示所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.roleList = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮,分配角色
    async saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.info('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRoleId
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('更新角色失败')
      }
      this.$message.success('更新角色成功')
      this.getUsersList()
      this.setRoleDialogVisible = false
    },
    // 监听分配角色对话框的关闭事件
    setRoleDialogClosed() {
      this.selectedRoleId = ''
      this.userInfo = ''
    }
  }
}
</script>
<style lang="less" scoped>
.text {
  font-size: 14px;
}
.item {
  padding: 18px 0;
}
</style>

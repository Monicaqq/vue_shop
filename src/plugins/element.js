import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 导入弹框提示, 挂载到了Vue 原型上, 每个组件都可以用 this 访问$message
Vue.prototype.$message = Message

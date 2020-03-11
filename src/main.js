import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入阿里字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式
import '../src/assets/css/global.css'

import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

import axios from 'axios'
// 配置请求的默认根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(function(config) {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // console.log(config)
  // 在最后必须 return config
  return config
})
// 挂载后可以直接通过this.$http 发送ajax请求
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
// 注册富文本编辑器为全局组件
Vue.use(VueQuillEditor)
Vue.filter('dateFormat', function(originVal) {
  const date = new Date(originVal)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1 + '').padStart(2, '0')
  const d = (date.getDate() + '').padStart(2, '0')
  const hh = (date.getHours() + '').padStart(2, '0')
  const mm = (date.getMinutes() + '').padStart(2, '0')
  const ss = (date.getSeconds() + '').padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

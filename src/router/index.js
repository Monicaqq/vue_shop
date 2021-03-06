import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Roles from '../components/power/Roles.vue'
import Rights from '../components/power/Rights.vue'
import GoodsList from '../components/goods/List.vue'
import Params from '../components/goods/Params.vue'
import Cate from '../components/goods/Cate.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'
import Report from '../components/report/Report.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/goods', component: GoodsList },
      { path: '/params', component: Params },
      { path: '/categories', component: Cate },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径, from :从哪个路径跳转而来
  // next: 是一个函数,表示放行
  // next() 放行 或 next('/login') 强制跳转
  // 用户访问的是登录页, 直接放行
  if (to.path === '/login') return next()
  // 先获取token
  const tokenStr = window.sessionStorage.getItem('token')
  // 没有token 强制跳转值登录页
  if (!tokenStr) return next('/login')
  // 有token 直接放行
  next()
})

export default router

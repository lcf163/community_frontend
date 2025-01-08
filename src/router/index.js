// 导入 Vue 和 VueRouter
import Vue from 'vue'
import VueRouter from 'vue-router'

// 导入各个视图组件
import Home from '../views/Home.vue'
import Content from '../views/Content.vue'
import Publish from '../views/Publish.vue'
import Login from '../views/Login.vue'
import SignUp from '../views/SignUp.vue'

// 解决 Vue Router 的 push 方法重复点击报错的问题
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
}

// 使用 VueRouter 插件
Vue.use(VueRouter)

// 定义路由配置
const routes = [
  {
    path: '/', // 根路径
    name: 'Home', // 路由名称
    component: Home // 对应的组件
  },
  {
    path: '/post/:id', // 带参数的路径
    name: 'Content', // 路由名称
    component: Content // 对应的组件
  },
  // {
  //   path: '/community/:id', // 社区页面的路径（注释掉的代码）
  //   name: 'Community',
  //   component: Community
  // },
  {
    path: '/publish', // 发布帖子路径
    name: 'Publish', // 路由名称
    component: Publish, // 对应的组件
    meta: { requireAuth: true } // 需要认证的路由
  },
  {
    path: '/login', // 登录路径
    name: "Login", // 路由名称
    component: Login // 对应的组件
  },
  {
    path: '/signup', // 注册路径
    name: "SignUp", // 路由名称
    component: SignUp // 对应的组件
  }
]

// 创建 VueRouter 实例
const router = new VueRouter({
  mode: 'history', // 使用 HTML5 History 模式
  base: process.env.BASE_URL, // 基础路径
  routes // 路由配置
})

// 导出 router 实例
export default router

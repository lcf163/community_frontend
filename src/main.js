// 导入 Vue 和其他依赖
import Vue from 'vue'
import App from './App.vue' // 主应用组件
import router from './router' // 路由配置
import store from './store' // Vuex 状态管理
import axios from './service/api' // Axios API 服务

// 将 Axios 实例挂载到 Vue 原型上，方便在组件中使用
Vue.prototype.$axios = axios;

// 关闭 Vue 的生产提示
Vue.config.productionTip = false

// 定义全局前置路由守卫
router.beforeEach((to, from, next) => {
  console.log(to); // 打印目标路由
  console.log(from); // 打印来源路由
  if (to.meta.requireAuth) { // 判断该路由是否需要登录权限
    if (localStorage.getItem("loginResult")) { // 判断本地是否存在 access_token
      next(); // 允许访问
    } else {
      if (to.path === '/login') {
        next(); // 允许访问登录页面
      } else {
        next({ path: '/login' }); // 重定向到登录页面
      }
    }
  } else {
    next(); // 允许访问
  }
  
  /* 如果本地存在 token 则不允许直接跳转到登录页面 */
  if (to.fullPath == "/login") {
    if (localStorage.getItem("loginResult")) {
      next({ path: from.fullPath }); // 重定向到之前的页面
    } else {
      next(); // 允许访问登录页面
    }
  }
})

// 创建 Vue 实例
new Vue({
  router, // 注入路由
  store, // 注入状态管理
  render: h => h(App) // 渲染主应用组件
}).$mount('#app') // 挂载到 DOM 中的 #app 元素

// 导入 Vue 和其他依赖
import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App.vue' // 主应用组件
import router from './router' // 路由配置
import store from './store' // Vuex 状态管理
import axios from '@/api' // Axios API 服务
import { marked } from 'marked' // 添加 marked 导入
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 配置 marked 选项
marked.setOptions({
  breaks: true,
  gfm: true
});

// 将 marked 添加到 Vue 原型上
Vue.prototype.$marked = marked;

// 将 Axios 实例挂载到 Vue 原型上，方便在组件中使用
Vue.prototype.$axios = axios;

// 配置 highlight.js
hljs.configure({
  ignoreUnescapedHTML: true
});

// 注册常用的编程语言
import cpp from 'highlight.js/lib/languages/cpp'
import javascript from 'highlight.js/lib/languages/javascript'
import python from 'highlight.js/lib/languages/python'
import java from 'highlight.js/lib/languages/java'
import xml from 'highlight.js/lib/languages/xml'
import bash from 'highlight.js/lib/languages/bash'

hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('python', python)
hljs.registerLanguage('java', java)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('bash', bash)

// 关闭 Vue 的生产提示
Vue.config.productionTip = false

Vue.use(ElementUI)  // 使用 Element UI

// 定义全局前置路由守卫
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', { to, from });

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

// 在 axios 配置后添加
axios.interceptors.response.use(
  response => {
    console.log("API响应拦截器:", response);
    return response;
  },
  error => {
    console.error("API错误拦截器:", error);
    return Promise.reject(error);
  }
);

// 创建 Vue 实例
new Vue({
  router, // 注入路由
  store, // 注入状态管理
  render: h => h(App) // 渲染主应用组件
}).$mount('#app') // 挂载到 DOM 中的 #app 元素

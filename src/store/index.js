// 导入 Vue 和 Vuex
import Vue from 'vue'
import Vuex from 'vuex'

// 使用 Vuex 插件
Vue.use(Vuex)

// 定义默认的登录结果状态
const defaultLoginResult = {
  token: null, // 存储用户的 token
  user_id: null, // 存储用户的 ID
  user_name: null, // 存储用户名
}

// 创建并导出 Vuex Store 实例
export default new Vuex.Store({
  state: {
    isLogin: false, // 用户登录状态
    loginResult: defaultLoginResult, // 存储登录结果
  },
  getters: {
    isLogin: state => state.loginResult.user_id !== null, // 判断用户是否登录
    userID: state => state.loginResult.user_id, // 获取用户 ID
    username: state => state.loginResult.user_name, // 获取用户名
    accessToken: state => state.loginResult.token, // 获取用户 token
  },
  mutations: {
    // 初始化登录状态
    init(state) {
      let loginResult = JSON.parse(localStorage.getItem("loginResult")); // 从 localStorage 获取登录结果
      if (loginResult != null) {
        state.loginResult = loginResult; // 更新登录结果状态
      }
    },
    // 更新登录状态
    login(state, loginResult) {
      state.loginResult = loginResult; // 设置新的登录结果
    },
    // 退出登录
    logout(state) {
      localStorage.removeItem("loginResult"); // 移除 localStorage 中的登录结果
      state.loginResult = defaultLoginResult; // 重置登录结果为默认状态
    }
  },
  actions: {
    // 可以在这里定义异步操作
  }
})

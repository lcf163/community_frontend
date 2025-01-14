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
    userInfoFetched: false, // 新增：标记是否已获取用户信息
  },
  getters: {
    isLogin: state => state.loginResult.user_id !== null, // 判断用户是否登录
    userID: state => state.loginResult.user_id, // 获取用户 ID
    username: state => state.loginResult.user_name, // 获取用户名
    accessToken: state => state.loginResult.token, // 获取用户 token
    avatar: state => state.loginResult.avatar || '', // 添加 avatar getter
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
      state.userInfoFetched = false; // 重置获取状态
    },
    // 添加新的 mutation 来更新用户信息
    updateUserInfo(state, userInfo) {
      state.loginResult = userInfo;
    },
    // 添加新的 mutation 来设置用户信息获取状态
    setUserInfoFetched(state, status) {
      state.userInfoFetched = status;
    }
  },
  actions: {
    // 获取用户信息
    getUserInfo({ commit, state }) {
      // 如果已经获取过用户信息且用户已登录，则不重复获取
      if (state.userInfoFetched && state.loginResult.user_id) {
        return Promise.resolve();
      }

      const userId = state.loginResult.user_id;
      if (!userId) return Promise.resolve();

      return Vue.prototype.$axios({
        method: 'get',
        url: `/user/${userId}`,
      })
      .then(response => {
        if (response.code === 1000 && response.data) {
          const updatedLoginResult = {
            ...state.loginResult,
            avatar: response.data.avatar || '',
          };
          
          localStorage.setItem("loginResult", JSON.stringify(updatedLoginResult));
          commit('updateUserInfo', updatedLoginResult);
          // 标记已获取用户信息
          commit('setUserInfoFetched', true);
        }
      })
      .catch(error => {
        console.error('获取用户信息失败:', error);
      });
    }
  }
})

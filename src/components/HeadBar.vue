<template>
  <header class="header">
    <span class="logo" @click="goIndex">XX社区</span>
    <div class="search">
      <!-- <label class="s-logo"></label> -->
      <!-- <input type="text" class="s-input" placeholder="搜索" /> -->
    </div>
    <div class="btns">
      <div v-show="!isLogin">
        <a class="login-btn" @click="goLogin">登录</a>
        <a class="login-btn" @click="goSignUp">注册</a>
      </div>
      <div class="user-box" v-show="isLogin">
        <user-avatar
          :username="currUsername"
          :avatar-src="currAvatar"
          :user-id="userId"
          :disable-link="true"
          class="header-user-info"
        />
        <div class="dropdown-content">
          <a @click="goToUserInfo">个人主页</a>
          <a @click="goLogout">登出</a>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import UserAvatar from './UserAvatar.vue'

export default {
  name: "HeadBar",
  components: {
    UserAvatar
  },
  computed: {
    isLogin() {
      return this.$store.getters.isLogin;
    },
    currUsername() {
      return this.$store.getters.username;
    },
    userId() {
      return this.$store.getters.userID;
    },
    currAvatar() {
      return this.$store.getters.avatar;
    }
  },
  created() {
    this.$store.commit("init");
    if (this.isLogin && !this.$store.state.userInfoFetched) {
      this.$store.dispatch("getUserInfo");
    }
  },
  methods: {
    goIndex() {
      this.$router.push({ name: "Home" });
    },
    goLogin() {
      this.$router.push({ name: "Login" });
    },
    goSignUp() {
      this.$router.push({ name: "SignUp" });
    },
    goLogout() {
      this.$store.commit("logout");
      this.$router.push({ name: "Login" });
    },
    goToUserInfo() {
      if (this.userId) {
        this.$router.push({ 
          name: 'UserInfo', 
          params: { id: this.userId }
        });
      }
    }
  }
}
</script>

<style scoped lang="less">
.header {
  width: 100%;
  height: 48px;
  position: fixed;
  background: #ffffff;
  display: flex;
  display: -webkit-flex;
  align-items: center;
  top: 0;
  z-index: 1;
  .logo {
    margin-left: 10px;
    height: 32px;
    background: url("../assets/images/logo.png") no-repeat;
    background-size: 32px 32px;
    background-position: left center;
    padding-left: 35px;
    line-height: 32px;
    flex-grow: 0;
    margin-right: 16px;
    cursor: pointer;
  }
  .search {
    flex-grow: 1;
    margin: 0 auto;
    max-width: 690px;
    position: relative;
    display: flex;
    display: -webkit-flex;
    .s-logo {
      width: 18px;
      height: 18px;
      background: url("../assets/images/search.png") no-repeat;
      background-size: cover;
      display: inline-block;
      position: absolute;
      top: 50%;
      margin-top: -9px;
      left: 15px;
    }
    .s-input {
      flex-grow: 1;
      -webkit-appearance: none;
      appearance: none;
      background-color: #f6f7f8;
      border-radius: 4px;
      border: 1px solid #edeff1;
      box-shadow: none;
      color: #c1c1c1;
      display: block;
      height: 36px;
      outline: none;
      padding: 0 16px 0 40px;
      width: 100%;
    }
  }
  .btns {
    flex-grow: 0;
    margin-left: 16px;
    margin-right: 10px;
    display: flex;
    display: -webkit-flex;
    align-items: center;
    .login-btn {
      border: 1px solid transparent;
      border-radius: 4px;
      box-sizing: border-box;
      text-align: center;
      letter-spacing: 1px;
      text-decoration: none;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      line-height: 24px;
      text-transform: uppercase;
      padding: 3px 16px;
      border-color: #0079d3;
      color: #0079d3;
      fill: #0079d3;
      display: inline-block;
      cursor: pointer;
      &:nth-child(1) {
        margin-right: 5px;
      }
      &:nth-child(2) {
        margin-right: 10px;
      }
    }
    .user-box {
      position: relative;
      cursor: pointer;

      &:hover .dropdown-content {
        display: block;
      }

      .header-user-info {
        background-color: transparent;
        padding: 0;
        
        .post-time {
          display: none;
        }
        
        .user-meta {
          .username {
            font-size: 14px;
            margin-right: 20px;
          }
        }
      }

      .dropdown-content {
        display: none;
        position: absolute;
        right: 0;
        background-color: #f9f9f9;
        min-width: 160px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
        z-index: 1;

        a {
          color: black;
          padding: 12px 16px;
          text-decoration: none;
          display: block;
          cursor: pointer;

          &:hover {
            background-color: #f1f1f1;
          }
        }
      }
    }
  }
}
</style>

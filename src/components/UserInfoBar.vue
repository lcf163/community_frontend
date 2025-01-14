<template>
  <div class="user-info">
    <img class="avatar" :src="computedAvatarSrc" alt="avatar"/>
    <div class="user-meta">
      <span class="username">{{ userInfo.username || author || '匿名用户' }}</span>
      <span v-if="time" class="post-time">发布于 {{ time }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserInfoBar',
  props: {
    author: String,
    time: String,
    userId: {
      type: [String, Number],
      required: true
    },
    avatarSrc: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      userInfo: {
        avatar: '',
        username: ''
      }
    }
  },
  computed: {
    computedAvatarSrc() {
      if (this.avatarSrc) {
        return this.avatarSrc;
      }
      return this.userInfo.avatar ? require(`@/assets/images/avatar/${this.userInfo.avatar}`) : require('@/assets/images/avatar.png');
    }
  },
  created() {
    if (!this.avatarSrc) {
      this.getUserInfo();
    }
  },
  methods: {
    getUserInfo() {
      this.$axios({
        method: 'get',
        url: `/user/${this.userId}`
      })
      .then(response => {
        if (response.code === 1000 && response.data) {
          this.userInfo = {
            avatar: response.data.avatar || '',
            username: response.data.username || this.author
          };
        }
      })
      .catch(error => {
        console.error('获取用户信息失败:', error);
      });
    }
  }
}
</script>

<style lang="less" scoped>
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 0;
  padding: 8px 0;
  background-color: transparent;
  border-radius: 0;
  min-height: 32px;

  .avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin-right: 8px;
  }

  .user-meta {
    display: flex;
    align-items: center;
    gap: 4px;
    
    .username {
      color: #1a1a1b;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
      
      &:hover {
        color: #0079d3;
        text-decoration: underline;
      }
    }

    .post-time {
      color: #878A8C;
      font-size: 12px;
      font-weight: 400;
    }
  }
}
</style> 
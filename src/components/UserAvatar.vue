<template>
  <div class="user-info">
    <img class="avatar" :src="computedAvatarSrc" alt="avatar"/>
    <div class="user-meta">
      <span class="username" @click.stop="goToUserInfo">{{ username || '匿名用户' }}</span>
      <span v-if="time" class="post-time">{{ time }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserAvatar',
  props: {
    username: String,
    time: String,
    avatarSrc: {
      type: String,
      default: ''
    },
    userId: {
      type: [String, Number],
      default: ''
    }
  },
  computed: {
    computedAvatarSrc() {
      return this.avatarSrc || require('@/assets/images/avatar.png');
    }
  },
  methods: {
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
      cursor: pointer;
      
      &:hover {
        color: #0079d3;
        text-decoration: underline;
      }
    }

    .post-time {
      color: #787c7e;
      font-size: 12px;
    }
  }
}
</style> 
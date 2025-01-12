<template>
  <div class="user-info">
    <img class="avatar" :src="avatarSrc" alt="avatar"/>
    <div class="user-meta">
      <span class="username">{{ author || '匿名用户' }}</span>
      <span class="post-time">发布于 {{ time }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserInfoBar',
  props: {
    author: String,
    time: String,
    avatarSrc: {
      type: String,
      default: require('@/assets/images/avatar.png')
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 0;
  padding: 8px 0;
  background-color: #f8f9fa;
  border-radius: 4px;
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
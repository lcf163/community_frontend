<template>
  <div class="user-info">
    <img class="avatar" :src="computedAvatarSrc" alt="avatar"/>
    <div class="user-meta">
      <span class="username" @click.stop="handleUsernameClick">{{ username || '匿名用户' }}</span>
      <span v-if="time" class="post-time">{{ time }}</span>
    </div>
  </div>
</template>

<script>
import { getAvatarUrl } from '@/utils';

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
    },
    disableLink: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    computedAvatarSrc() {
      return getAvatarUrl(this.avatarSrc);
    }
  },
  methods: {
    handleUsernameClick() {
      if (this.disableLink) {
        return;
      }
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
<template>
  <div class="post">
    <div class="l-container" @click="goDetail(post.post_id)">
      <user-avatar
        :username="post.author_name"
        :time="time"
        :user-id="post.author_id"
        :avatar-src="post.author_avatar"
      />
      <h4 class="post-title">{{ post.title }}</h4>
      <div class="post-content">
        <p>{{ post.content }}</p>
      </div>
    </div>
    <vote-info-bar
      :author="post.author_name"
      :time="time"
      :vote-num="post.vote_num"
      :is-author="isAuthor"
      @vote="handleVote"
      @edit="goDetail(post.post_id)"
    />
  </div>
</template>

<script>
import UserAvatar from './UserAvatar.vue'
import VoteInfoBar from './VoteInfoBar.vue'

export default {
  name: 'PostList',
  components: {
    UserAvatar,
    VoteInfoBar
  },
  props: {
    post: {
      type: Object,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    isAuthor: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    goDetail(postId) {
      this.$emit('detail', postId)
    },
    handleVote(direction) {
      // 确保 post_id 存在
      if (!this.post.post_id) {
        this.$message.error('无效的帖子ID');
        return;
      }

      // 发送一个对象作为事件参数
      this.$emit('vote', {
        target_id: String(this.post.post_id), // 确保是字符串类型
        target_type: 1, // 1表示帖子
        direction: direction // 投票方向：1(赞成)、0(取消)、-1(反对)
      });
    }
  }
}
</script>

<style lang="less" scoped>
.post {
  .l-container {
    padding: 15px;
    cursor: pointer;

    .post-title {
      font-size: 18px;
      font-weight: 500;
      line-height: 22px;
      color: #1a1a1b;
      margin: 8px 0;
      
      &:hover {
        color: #0079d3;
      }
    }

    .post-content {
      margin-bottom: 16px;
      
      p {
        font-size: 14px;
        line-height: 1.4;
        color: #4a4a4a;
        margin: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        max-height: 60px;
        word-break: break-word;
      }
    }
  }
}
</style> 
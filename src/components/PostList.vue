<template>
  <div class="post">
    <div class="l-container" @click="goDetail(post.post_id)">
      <user-info-bar
        :author="post.author_name"
        :time="time"
        :avatar-src="post.avatar_src"
      />
      <h4 class="post-title">{{ post.title }}</h4>
      <div class="post-content">
        <p>{{ post.content }}</p>
      </div>
    </div>
    <post-header-bar
      :author="post.author_name"
      :time="time"
      :vote-num="post.vote_num"
      :is-author="isAuthor"
      @vote="onVote"
      @edit="goDetail(post.post_id)"
    />
  </div>
</template>

<script>
import UserInfoBar from './UserInfoBar.vue'
import PostHeaderBar from './PostHeaderBar.vue'

export default {
  name: 'PostList',
  components: {
    UserInfoBar,
    PostHeaderBar
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
    onVote(type) {
      this.$emit('vote', { postId: this.post.post_id, type })
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
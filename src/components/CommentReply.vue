<template>
  <div class="comment-bar">
    <div class="comment-list">
      <div class="user-btn">
        <span class="btn-item">
          <i class="iconfont icon-comment"></i> 评论
          <span class="comment-num">{{ commentCount || 0 }}</span>
        </span>
      </div>
      <div v-if="comments.length === 0" class="no-comments">
        暂无评论，快来发表第一条评论吧！
      </div>
      <div v-else v-for="comment in comments" :key="comment.comment_id" class="comment">
        <user-avatar
          :username="comment.author_name"
          :time="formatTime(comment.create_time)"
          :user-id="comment.author_id"
          :avatar-src="comment.author_avatar"
        />
        <div class="c-right">
          <div class="c-content">{{ comment.content }}</div>
          <div class="comment-actions">
            <el-button 
              type="text" 
              class="reply-btn"
              @click.stop="$emit('show-reply', comment)">
              回复
            </el-button>
            <vote-info-bar
              :author="comment.author_name"
              :time="formatTime(comment.create_time)"
              :vote-num="comment.vote_num"
              @vote="handleVote(comment.comment_id, $event)"
            />
          </div>
          
          <!-- 回复列表 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="reply-list">
            <!-- 显示限制数量的回复 -->
            <div v-for="(reply, index) in limitedReplies(comment)" 
                 :key="reply.comment_id" 
                 class="reply-item"
                 :class="{ 'hidden': index >= replyLimit && !comment.showAllReplies }">
              <user-avatar
                :username="reply.author_name"
                :time="formatTime(reply.create_time)"
                :user-id="reply.author_id"
                :avatar-src="reply.author_avatar"
              />
              <div class="reply-content">
                <div class="reply-text">{{ reply.content }}</div>
                <div class="reply-actions">
                  <el-button 
                    type="text" 
                    class="reply-btn"
                    @click.stop="$emit('show-reply', reply, comment)">
                    回复
                  </el-button>
                  <vote-info-bar
                    :author="reply.author_name"
                    :time="formatTime(reply.create_time)"
                    :vote-num="reply.vote_num"
                    @vote="handleVote(reply.comment_id, $event)"
                  />
                </div>
              </div>
            </div>
            
            <!-- 展开/收起按钮 -->
            <div v-if="comment.replies.length > replyLimit" class="expand-btn">
              <el-button 
                type="text"
                @click="toggleReplies(comment)">
                {{ comment.showAllReplies ? '收起回复' : `展开其他 ${comment.replies.length - replyLimit} 条回复` }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserAvatar from './UserAvatar.vue'
import VoteInfoBar from './VoteInfoBar.vue';
import { formatTime } from '@/utils/timeFormat';

export default {
  name: 'CommentReply',
  components: {
    UserAvatar,
    VoteInfoBar,
  },
  props: {
    comments: {
      type: Array,
      default: () => []
    },
    commentCount: {
      type: Number,
      default: 0
    },
    submitting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      replyLimit: 3, // 默认显示的回复数量
    }
  },
  methods: {
    formatTime,
    showReplyInput(comment, parentComment = null) {
      this.$emit('show-reply', comment, parentComment);
    },
    cancelReply(comment) {
      this.$emit('cancel-reply', comment);
    },
    submitReply(formData, comment) {
      this.$emit('submit-reply', formData, comment);
    },
    voteComment(commentId, direction) {
      this.$emit('vote-comment', commentId, direction);
    },
    limitedReplies(comment) {
      return comment.showAllReplies ? comment.replies : comment.replies.slice(0, this.replyLimit);
    },
    toggleReplies(comment) {
      this.$set(comment, 'showAllReplies', !comment.showAllReplies);
    },
    handleVote(commentId, direction) {
      this.$emit('vote-comment', commentId, direction);
    }
  }
}
</script>

<style lang="less" scoped>
.comment-bar {
  .comment-list {
    padding: 20px;

    .user-btn {
      margin-bottom: 16px;
      
      .btn-item {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #878A8C;
        font-size: 14px;
        
        .comment-num {
          color: #1A1A1B;
          font-weight: 700;
        }
      }
    }

    .no-comments {
      text-align: center;
      color: #878A8C;
      padding: 20px 0;
    }
  }

  .comment {
    margin-bottom: 16px;
    
    .c-content {
      font-size: 14px;
      line-height: 1.4;
      margin: 8px 0;
      word-break: break-word;
    }

    .comment-actions {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      margin: 4px 0;
      gap: 16px;
      
      .reply-btn {
        padding: 0;
        margin: 0;
        height: auto;
        
        &:hover {
          color: #0079d3;
        }
      }
    }

    .reply-list {
      margin-left: 20px;
      margin-top: 10px;
      
      .reply-item {
        padding: 8px;
        border-left: 2px solid #e6e6e6;
        margin-bottom: 8px;
        
        &.hidden {
          display: none;
        }
        
        .reply-content {
          margin-left: 10px;
          
          .reply-text {
            font-size: 14px;
            line-height: 1.4;
            margin-bottom: 5px;
          }
          
          .reply-actions {
            display: flex;
            align-items: center;
            font-size: 12px;
            color: #8c8c8c;
          }
        }
      }
      
      .expand-btn {
        text-align: center;
        margin-top: 8px;
        
        .el-button {
          font-size: 13px;
          color: #8c8c8c;
          
          &:hover {
            color: #409EFF;
          }
        }
      }
    }

    .reply-input {
      margin: 8px 0;
      padding: 8px;
      background-color: #f6f7f8;
      border-radius: 4px;

      &.nested {
        margin-left: 20px;
      }
    }
  }
}
</style>
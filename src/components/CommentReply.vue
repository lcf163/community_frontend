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
            <button 
              class="action-btn"
              @click.stop="$emit('show-reply', comment)">
              回复
            </button>
            <template v-if="comment.author_id === currentUserId">
              <button class="action-btn" @click="$emit('edit-comment', comment)">编辑</button>
              <button class="action-btn delete-btn" @click="handleDelete(comment.comment_id, true)">删除</button>
            </template>
            <vote-info-bar
              :author="comment.author_name"
              :time="formatTime(comment.create_time)"
              :vote-num="comment.vote_num"
              @vote="$emit('vote-comment', comment.comment_id, $event)"
            />
          </div>

          <!-- 回复列表 -->
          <div v-if="comment.replies && comment.replies.length > 0" class="reply-list">
            <div v-for="reply in limitedReplies(comment)" :key="reply.reply_id" class="reply-item">
              <user-avatar
                :username="reply.author_name"
                :time="formatTime(reply.create_time)"
                :user-id="reply.author_id"
                :avatar-src="reply.author_avatar"
              />
              <div class="reply-content">
                <span class="reply-to">@{{ reply.reply_to_name }}：</span>
                {{ reply.content }}
                <div class="reply-actions">
                  <button class="action-btn" @click="$emit('show-reply', reply, comment)">回复</button>
                  <template v-if="reply.author_id === currentUserId">
                    <button class="action-btn" @click="$emit('edit-comment', reply)">编辑</button>
                    <button class="action-btn delete-btn" @click="handleDelete(reply.comment_id, false)">删除</button>
                  </template>
                  <vote-info-bar
                    :author="reply.author_name"
                    :time="formatTime(reply.create_time)"
                    :vote-num="reply.vote_num"
                    @vote="$emit('vote-comment', reply.comment_id, $event)"
                  />
                </div>
              </div>
              <!-- 二级回复的回复框 -->
              <div v-if="reply.showReplyInput" class="reply-input nested">
                <comment-dialog
                  type="comment"
                  :visible.sync="reply.showReplyInput"
                  :submitting="submitting"
                  :placeholder="`回复 @${reply.author_name}：`"
                  @submit="submitReply($event, reply)"
                  @cancel="cancelReply(reply)"
                />
              </div>
            </div>
            
            <!-- 添加展开/收起按钮 -->
            <div v-if="comment.replies.length > replyLimit" class="show-more">
              <el-button 
                type="text"
                class="show-more-btn"
                @click.stop="toggleReplies(comment)"
              >
                {{ expandedComments.has(comment.comment_id) ? 
                  '收起回复' : 
                  `展开更多${comment.replies.length - replyLimit}条回复` 
                }}
              </el-button>
            </div>
          </div>

          <!-- 一级评论的回复框 -->
          <div v-if="comment.showReplyInput" class="reply-input">
            <comment-dialog
              type="comment"
              :visible.sync="comment.showReplyInput"
              :submitting="submitting"
              :placeholder="`回复 @${comment.author_name}：`"
              @submit="submitReply($event, comment)"
              @cancel="cancelReply(comment)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserAvatar from './UserAvatar.vue'
import VoteInfoBar from './VoteInfoBar.vue';
import CommentDialog from './CommentDialog.vue';
import { formatTime } from '@/utils/timeFormat';

export default {
  name: 'CommentReply',
  components: {
    UserAvatar,
    VoteInfoBar,
    CommentDialog
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
    },
    currentUserId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      replyLimit: 3, // 默认显示3条回复
      expandedComments: new Set() // 记录已展开的评论ID
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
      // 确保 comment_id 存在
      if (!comment.comment_id) {
        console.warn('Comment ID is missing:', comment);
        return comment.replies || [];
      }
      
      if (this.expandedComments.has(comment.comment_id)) {
        return comment.replies;
      }
      return (comment.replies || []).slice(0, this.replyLimit);
    },
    toggleReplies(comment) {
      // 确保 comment_id 存在
      if (!comment.comment_id) {
        console.warn('Cannot toggle replies: Comment ID is missing');
        return;
      }

      // 使用 Vue.set 来确保响应性
      if (this.expandedComments.has(comment.comment_id)) {
        this.expandedComments.delete(comment.comment_id);
        // 强制更新组件
        this.$forceUpdate();
      } else {
        this.expandedComments.add(comment.comment_id);
        // 强制更新组件
        this.$forceUpdate();
      }
    },
    handleDelete(commentId, isParentComment = false) {
      const message = isParentComment ? 
        '确定要删除这条评论及其所有回复吗？' : 
        '确定要删除这条评论吗？';

      this.$confirm(message, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 根据是否为父评论选择不同的删除接口
        const url = isParentComment ? 
          `/comments/${commentId}` : 
          `/comment/${commentId}`;

        this.$axios({
          method: 'delete',
          url: url
        }).then(response => {
          if (response.code === 1000) {
            this.$message.success('删除成功');
            this.$emit('delete-success', commentId, isParentComment);
          } else {
            this.$message.error(response.message || '删除失败');
          }
        }).catch(error => {
          console.error('删除评论失败:', error);
          this.$message.error('删除失败');
        });
      }).catch(() => {
        // 取消删除操作
      });
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
      align-items: center;
      gap: 16px;
      margin: 8px 0;

      .action-btn {
        padding: 0;
        background: none;
        border: none;
        font-size: 12px;
        color: #878A8C;
        cursor: pointer;
        
        &:hover {
          color: #1890ff;
        }
      }
    }

    .reply-list {
      margin-left: 24px;
      margin-top: 8px;
      
      .reply-item {
        padding: 8px 0;
        
        .reply-content {
          margin-left: 8px;
          font-size: 14px;
          
          .reply-to {
            color: #0079d3;
            font-weight: 600;
          }

          .reply-actions {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-top: 4px;

            .action-btn {
              background: none;
              border: none;
              color: #878A8C;
              font-size: 12px;
              cursor: pointer;
              padding: 4px 8px;
              
              &:hover {
                color: #1A1A1B;
              }
            }
          }
        }
      }
    }

    .reply-input {
      margin: 8px 0;
      padding: 8px;
      background-color: #f6f7f8;
      border-radius: 4px;
    }

    .show-more {
      margin-top: 8px;
      padding-left: 24px;
      
      .show-more-btn {
        padding: 0;
        font-size: 12px;
        color: #0079d3;
        
        &:hover {
          color: #1484d7;
          text-decoration: underline;
        }
      }
    }
  }
}

.comment-actions, .reply-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 4px;

  .action-btn {
    background: none;
    border: none;
    color: #878A8C;
    font-size: 12px;
    cursor: pointer;
    padding: 4px 8px;
    
    &:hover {
      color: #1A1A1B;
    }

    &.delete-btn {
      &:hover {
        color: #ff4d4f;
      }
    }
  }

  :deep(.vote-info-bar) {
    display: flex;
    align-items: center;
    border: none;
    padding: 0;
  }
}
</style>
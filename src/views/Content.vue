<template>
  <div class="content">
    <div class="left">
      <div class="container">
        <div class="l-container">
          <div class="post-header">
            <user-avatar
              :username="post.author_name"
              :time="formatTime(post.create_time)"
              :avatar-src="post.avatar_url"
              :user-id="post.author_id"
            />
            <h4 class="post-title">{{ post.title }}</h4>
          </div>
          <div class="post-body">
            <div class="post-content markdown-body" v-html="parsedContent"></div>
          </div>
          <div class="post-bottom">
            <vote-info-bar
              :author="post.author_name"
              :time="formatTime(post.create_time)"
              :vote-num="post.vote_num"
              :is-author="isAuthor"
              @vote="votePost(post.post_id, $event)"
            />
            <div class="post-actions">
              <el-button 
                v-if="isAuthor" 
                type="text" 
                class="edit-btn"
                @click="showEditDialog">
                <i class="el-icon-edit"></i> 编辑帖子
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <comment-dialog
        type="comment"
        :visible.sync="showCommentInput"
        :submitting="submitting"
        @submit="submitComment"
        @cancel="cancelComment"
      />

      <comment-reply
        :comments="comments"
        :comment-count="post.comment_count"
        :submitting="submitting"
        :current-user-id="userId"
        @show-reply="showReplyInput"
        @cancel-reply="cancelReply"
        @submit-reply="submitReply"
        @edit-comment="handleEditComment"
        @vote-comment="voteComment"
      />
      <page-bar
        :current-page="pageNumber"
        :page-size="pageSize"
        :total="total"
        :page-sizes="PAGE_SIZES"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <div class="right">
      <div class="topic-info">
        <h5 class="t-header"></h5>
        <div class="t-info">
          <a class="avatar"></a>
          <span class="topic-name">社区名：{{ post.community.community_name }}</span>
        </div>
        <p class="t-desc">社区简介：{{ post.community.introduction }}</p>
        <p class="t-create-time">创建于：{{ formatTime(post.community.create_time) }}</p>
        <button class="topic-btn" @click="goCommunityDetail(post.community.community_id)">进入社区</button>
      </div>
    </div>

    <comment-dialog
      type="edit"
      :visible.sync="editDialogVisible"
      :initial-data="editForm"
      @submit="submitEdit"
    />

    <comment-dialog
      type="edit-comment"
      :visible.sync="commentEditDialogVisible"
      :initial-data="commentEditForm"
      @submit="submitEditComment"
    />
  </div>
</template>

<script>
import UserAvatar from '@/components/UserAvatar.vue'
import VoteInfoBar from '@/components/VoteInfoBar.vue';
import CommentDialog from '@/components/CommentDialog.vue';
import CommentReply from '@/components/CommentReply.vue';
import PageBar from '@/components/PageBar.vue'
import { formatTime } from '@/utils/timeFormat';
import { getAvatarUrl } from '@/config/api';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 使用 GitHub 风格的代码高亮主题

const PAGE_SIZES = [5, 10];  // 添加常量
const DEFAULT_PAGE_SIZE = PAGE_SIZES[0];  // 默认使用第一个值

export default {
  name: 'Content',
  components: {
    UserAvatar,
    VoteInfoBar,
    CommentDialog,
    CommentReply,
    PageBar
  },
  data() {
    return {
      post: {
        author_id: '',
        author_name: '',
        vote_num: 0,
        comment_count: 0,
        post_id: '',
        title: '',
        content: '',
        create_time: '',
        avatar_src: '',
        community: {
          community_id: '',
          community_name: '',
          introduction: '',
          create_time: ''
        }
      },
      comments: [],
      submitting: false,
      editDialogVisible: false,
      editForm: {
        title: '',
        content: ''
      },
      isAuthor: false,
      showCommentInput: true,
      loading: false,
      activeComment: null,
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE,  // 修改为使用常量
      total: 0,
      editingComment: null,
      commentEditDialogVisible: false,
      commentEditForm: {
        content: ''
      },
      userId: this.$store.getters.userID
    };
  },
  computed: {
    PAGE_SIZES() {  // 添加计算属性
      return PAGE_SIZES;
    },
    parsedContent() {
      return this.post.content ? marked(this.post.content) : '';
    }
  },
  methods: {
    goCommunityDetail(id) {
      this.$router.push({ name: "Community", params: { id: id }});
    },
    getPostDetail() {
      this.$axios({
        method: "get",
        url: "/post/" + this.$route.params.id,
      })
      .then(response => {
        if (response.code === 1000) {
          this.post = {
            ...response.data,
            avatar_url: getAvatarUrl(response.data.author_avatar)
          };
          this.checkIsAuthor();
        } else {
          this.$message.error(response.message || '获取帖子详情失败');
          this.$router.push({ name: "Home" });
        }
      })
      .catch(error => {
        console.error("getPostDetail error:", error);
        this.$message.error('获取帖子详情失败');
        this.$router.push({ name: "Home" });
      });
    },
    votePost(post_id, direction) {
      // post_id 可能来自 URL 参数、DOM事件等，默认都是字符串
      const numericPostId = parseInt(post_id, 10);
      if (isNaN(numericPostId)) {
        this.$message.error('无效的帖子ID');
        return;
      }

      this.$axios.post("/vote", {
        target_id: numericPostId, // 确保是数字类型
        target_type: 1,
        direction: direction
      })
      .then(response => {
        if (response.code === 1000) {
          this.getPostDetail();
        } else {
          this.$message.error(response.message || '投票失败');
        }
      })
      .catch(error => {
        console.error("votePost error:", error);
        this.$message.error('投票失败');
      });
    },
    voteComment(comment_id, direction) {
      // 确保 comment_id 是数字类型
      const numericCommentId = parseInt(comment_id, 10);
      if (isNaN(numericCommentId)) {
        this.$message.error('无效的评论ID');
        return;
      }

      this.$axios({
        method: "post",
        url: "/vote",
        data: {
          target_id: numericCommentId, // 确保是数字类型
          target_type: 2,
          direction: direction,
        }
      })
      .then(response => {
        if (response.code === 1000) {
          this.updateCommentVoteNum(comment_id, response.data.vote_num);
        } else {
          this.$message.error(response.message || '评论投票失败');
        }
      })
      .catch(error => {
        console.error("voteComment error:", error);
        this.$message.error('评论投票失败');
      });
    },
    updateCommentVoteNum(commentId, newVoteNum) {
      // 遍历一级评论
      const comment = this.comments.find(c => c.comment_id === commentId);
      if (comment) {
        // 如果是一级评论，直接更新
        this.$set(comment, 'vote_num', newVoteNum);
        return;
      }

      // 如果是回复，遍历所有评论的回复列表
      for (const comment of this.comments) {
        if (comment.replies && comment.replies.length > 0) {
          const replyIndex = comment.replies.findIndex(r => r.comment_id === commentId);
          if (replyIndex !== -1) {
            // 使用 $set 更新特定回复的点赞数
            this.$set(comment.replies[replyIndex], 'vote_num', newVoteNum);
            return;
          }
        }
      }
    },
    getComments() {
      const postId = this.$route.params.id;
      if (!postId) return;

      this.$axios({
        method: "get",
        url: `/comment/${postId}`,
        params: {
          page: this.pageNumber,
          size: this.pageSize
        }
      })
      .then(response => {
        if (response.code === 1000 && response.data) {
          this.total = response.data.page.total;
          const commentList = response.data.list || [];
          const comments = commentList.map(comment => {
            // 移除本地头像处理逻辑，直接使用后端返回的头像URL
            this.$set(comment, 'showReplyInput', false);
            this.$set(comment, 'replies', []);
            
            // 如果评论有回复数量且大于0，获取回复列表
            if (comment.reply_count && comment.reply_count > 0) {
              this.getCommentReplies(comment);
            }
            
            return comment;
          });
          
          this.comments = comments;
        } else {
          this.$message.error(response.message || '获取评论失败');
          this.comments = [];
        }
      })
      .catch(error => {
        console.error('getComments error:', error);
        this.$message.error('获取评论列表失败');
        this.comments = [];
      });
    },
    getCommentReplies(comment) {
      const commentId = parseInt(comment.comment_id, 10);
      if (isNaN(commentId)) return;

      this.$axios({
        method: 'get',
        url: `/comment/reply/${commentId}`,
      }).then(response => {
        if (response.code === 1000 && Array.isArray(response.data)) {
          const replies = response.data.map(reply => {
            this.$set(reply, 'showReplyInput', false);
            this.$set(reply, 'author_avatar', reply.author_avatar);
            return reply;
          });
          
          this.$set(comment, 'replies', replies);
        } else {
          this.$message.error(response.message || '获取回复列表失败');
          this.$set(comment, 'replies', []);
        }
      }).catch(error => {
        console.error('getCommentReplies error:', error);   
        this.$set(comment, 'replies', []);
      });
    },
    cancelComment() {
      this.showCommentInput = true
    },
    submitComment(formData) {
      if (!formData.content.trim()) return
      this.submitting = true
      
      // 确保 post_id 是数字类型
      const numericPostId = parseInt(this.post.post_id, 10);
      if (isNaN(numericPostId)) {
        this.$message.error('无效的帖子ID');
        return;
      }

      this.$axios({
        method: 'post',
        url: '/comment',
        data: {
          post_id: numericPostId,
          content: formData.content
        }
      })
      .then(response => {
        if (response.code === 1000) {
          this.$message.success('评论成功')
          // 更新评论列表
          this.getComments()
          // 更新帖子详情以刷新评论数量
          this.getPostDetail()
          this.showCommentInput = false
        } else {
          this.$message.error(response.message)
        }
      })
      .catch(() => {
        this.$message.error('评论失败')
      })
      .finally(() => {
        this.submitting = false
      })
    },
    formatTime,
    showEditDialog() {
      this.editForm = {
        title: this.post.title,
        content: this.post.content
      };
      this.editDialogVisible = true;
    },
    submitEdit(formData) {
      // 确保 post_id 是数字类型
      const numericPostId = parseInt(this.post.post_id, 10);
      if (isNaN(numericPostId)) {
        this.$message.error('无效的帖子ID');
        return;
      }

      this.$axios({
        method: 'put',
        url: "/post",
        data: {
          post_id: numericPostId, // 确保发送的是数字类型
          title: formData.title,
          content: formData.content
        }
      })
      .then(response => {
        if (response.code === 1000) {
          this.$message.success('修改成功')
          this.editDialogVisible = false
          this.getPostDetail()
        } else {
          this.$message.error(response.message || '修改失败')
        }
      })
      .catch(error => {
        console.error('editPost error:', error);
        this.$message.error('修改失败')
      });
    },
    checkIsAuthor() {
      const userId = this.$store.getters.userID;
      // console.log('Current userID:', userId);
      // console.log('Post author_id:', this.post.author_id);
      // 确保类型一致的比较
      this.isAuthor = userId && String(userId) === String(this.post.author_id);
    },
    // 显示回复输入框
    showReplyInput(comment, parentComment = null) {
      // 先重置所有评论的回复框状态
      this.comments.forEach(c => {
        this.$set(c, 'showReplyInput', false);
        if (c.replies) {
          c.replies.forEach(r => {
            this.$set(r, 'showReplyInput', false);
          });
        }
      });

      // 显示当前评论的回复框
      this.$set(comment, 'showReplyInput', true);
      if (parentComment) {
        this.$set(comment, 'parentComment', parentComment);
      }
      this.activeComment = comment;
    },

    // 取消回复
    cancelReply(comment) {
      this.$set(comment, 'showReplyInput', false);
      if (comment.parentComment) {
        this.$delete(comment, 'parentComment');
      }
      this.activeComment = null;
    },

    // 提交回复
    submitReply(formData, comment) {
      if (!formData.content.trim()) return;
      
      const parentComment = comment.parentComment || comment;
      
      // 确保所有 ID 都是数字类型
      const numericPostId = parseInt(this.post.post_id, 10);
      const numericParentId = parseInt(parentComment.comment_id, 10);
      const numericReplyToUid = parseInt(comment.author_id, 10);
      
      if (isNaN(numericPostId) || isNaN(numericParentId) || isNaN(numericReplyToUid)) {
        this.$message.error('无效的ID参数');
        return;
      }

      const replyData = {
        post_id: numericPostId,
        parent_id: numericParentId,
        content: formData.content,
        reply_to_uid: numericReplyToUid,
        reply_to_name: comment.author_name
      };

      this.submitting = true;
      this.$axios({
        method: 'post',
        url: '/comment/reply',
        data: replyData
      }).then(response => {
        if (response.code === 1000) {
          this.$message.success('回复成功');
          // 只更新当前评论的回复列表
          this.getCommentReplies(parentComment);
          this.$set(comment, 'showReplyInput', false);
          if (comment.parentComment) {
            this.$delete(comment, 'parentComment');
          }
          this.activeComment = null;
        } else {
          this.$message.error(response.message || '回复失败');
        }
      }).catch(error => {
        console.error('Reply error:', error);
        this.$message.error('回复失败，请稍后重试');
      }).finally(() => {
        this.submitting = false;
      });
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.pageNumber = 1; // 重置页码
      this.getComments();
    },
    handleCurrentChange(val) {
      this.pageNumber = val;
      this.getComments();
    },
    // 显示编辑评论对话框
    handleEditComment(comment) {
      this.editingComment = comment;
      this.commentEditForm = { content: comment.content };
      this.commentEditDialogVisible = true;
    },
    
    // 提交编辑后的评论
    submitEditComment(formData) {
      if (!this.editingComment || !formData.content.trim()) return;
      
      const commentId = parseInt(this.editingComment.comment_id, 10);
      if (isNaN(commentId)) {
        this.$message.error('无效的评论ID');
        return;
      }

      this.$axios({
        method: 'put',
        url: '/comment',
        data: {
          comment_id: commentId,
          content: formData.content
        }
      })
      .then(response => {
        if (response.code === 1000) {
          this.$message.success('修改成功');
          this.getComments(); // 刷新评论列表
          this.commentEditDialogVisible = false;
          this.editingComment = null;
        } else {
          this.$message.error(response.message || '修改失败');
        }
      })
      .catch(error => {
        console.error('editComment error:', error);
        this.$message.error('修改失败');
      });
    }
  },
  watch: {
    post: {
      handler() {
        this.checkIsAuthor();
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.getPostDetail();
    this.getComments();
  },
  created() {
    // 配置 marked 的代码高亮选项
    marked.setOptions({
      highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      },
      langPrefix: 'hljs language-', // 添加类名前缀
      breaks: true,
      gfm: true
    });
  },
};
</script>

<style lang="less" scoped>
.content {
  max-width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 0 auto;
  padding: 20px 24px;
  margin-top: 48px;
  .left {
    flex-grow: 1;
    max-width: 740px;
    border-radius: 4px;
    word-break: break-word;
    background: #ffffff;
    border: #edeff1;
    flex: 1;
    margin: 32px;
    margin-right: 12px;
    padding-bottom: 30px;
    position: relative;

    // 评论输入框样式
    .comment-input {
      width: calc(100% - 40px);
      margin: 20px;
      padding: 15px;
      background: #fff;
      border: 1px solid #edeff1;
      border-radius: 4px;
      box-sizing: border-box;

      .el-textarea {
        margin-bottom: 10px;
        
        /deep/ .el-textarea__inner {
          resize: none;
          border: 1px solid #edeff1;
          font-size: 14px;
          line-height: 21px;
          padding: 12px;
          min-height: 100px;
          
          &:focus {
            border-color: #0079d3;
            box-shadow: 0 0 0 1px #0079d3;
          }

          &::placeholder {
            color: #878a8c;
          }
        }
      }

      .btn-wrapper {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 10px;
        
        .btn-base {
          width: 120px;
          height: 32px;
          margin: 0;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .cancel-btn {
          .btn-base();
          background: #ffffff !important;
          border: 1px solid #edeff1 !important;
          color: #878a8c !important;
        }
        
        .submit-btn {
          .btn-base();
          background: #66b1ff !important;
          border: none !important;
          color: #ffffff !important;
        }
      }
    }

    // 评论列表样式
    .comment-list {
      width: 100%;
      margin: 20px 0;
      padding: 0 20px;
      box-sizing: border-box;

      .no-comments {
        text-align: center;
        padding: 20px;
        color: #666;
        font-size: 14px;
        background: #fff;
        border: 1px solid #edeff1;
        border-radius: 4px;
      }

      .comment {
        width: 100%;
        margin: 10px 0;
        padding: 15px;
        background: #fff;
        border: 1px solid #edeff1;
        border-radius: 4px;
        box-sizing: border-box;

        .c-right {
          margin-left: 0;
          padding-right: 0;

          .c-content {
            font-family: Noto Sans, Arial, sans-serif;
            font-size: 14px;
            font-weight: 400;
            line-height: 21px;
            word-break: break-word;
            color: #1a1a1b;
            padding: 8px 0;
            margin: 0 0 12px 0;
            width: 100%;
            white-space: pre-wrap;
            overflow-wrap: break-word;
          }

          .comment-actions {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 0;

            .c-reply {
              font-size: 12px;
              font-weight: 700;
              line-height: 16px;
              color: #878A8C;
              cursor: pointer;
              margin: 0;
              
              &:hover {
                color: #1a1a1b;
              }
            }

            .post-header-bar {
              margin: 0;
            }
          }
        }
      }

      .reply-list {
        margin-left: 20px;
        padding: 8px 0;
        border-left: 2px solid #f0f0f0;

        .reply-item {
          padding: 8px 16px;
          
          .reply-content {
            font-size: 14px;
            line-height: 1.4;
            margin: 8px 0;
            word-break: break-word;

            .reply-to {
              color: #0079d3;
              font-weight: 500;
              margin-right: 4px;
            }
          }

          .reply-actions {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 4px 0;

            .action-left {
              .reply-btn {
                padding: 4px 8px;
                font-size: 12px;
                color: #878a8c;
                
                &:hover {
                  color: #0079d3;
                }
              }
            }

            .action-right {
              display: flex;
              align-items: center;
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
          margin-left: 24px;
        }
      }

      .reply-btn {
        font-size: 12px;
        color: #878a8c;
        padding: 0;
        margin-right: 16px;

        &:hover {
          color: #0079d3;
        }
      }
    }

    .container {
      width: 100%;
      height: auto;
      position: relative;
      .post {
        align-items: center;
        box-sizing: border-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-direction: column;
        flex-direction: column;
        height: 100%;
        left: 0;
        padding: 8px 4px 8px 0;
        position: absolute;
        top: 0;
        width: 40px;
        border-left: 4px solid transparent;
        // background: #f8f9fa;
        .text {
          color: #1a1a1b;
          font-size: 12px;
          font-weight: 700;
          line-height: 16px;
          pointer-events: none;
          word-break: normal;
        }
      }
      .l-container {
        background: #fff;
        border-radius: 4px;
        border: 1px solid #ccc;
        margin-bottom: 16px;
        
        .post-header {
          padding: 8px 12px;
          border-bottom: 1px solid #edeff1;

          :deep(.user-info) {
            margin-bottom: 8px;
            
            .avatar {
              width: 32px;
              height: 32px;
            }

            .user-meta {
              .username {
                font-size: 14px;
                color: #1a1a1b;
              }

              .post-time {
                font-size: 12px;
                color: #787c7e;
              }
            }
          }

          .post-title {
            font-size: 24px;
            font-weight: 700;
            line-height: 32px;
            color: #1a1a1b;
            margin: 8px 0 0 0;
            padding: 0;
            word-break: break-word;
            overflow-wrap: break-word;
            letter-spacing: 0.5px;
          }

          .edit-btn {
            font-size: 12px;
            color: #878A8C;
            margin-left: 16px;
            padding: 4px 8px;
            
            &:hover {
              color: #0079d3;
            }
          }

          .post-header-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0;
            padding: 0 0;
          }
        }

        .post-body {
          padding: 10px 12px;
          min-height: 100px;
          
          .post-content {
            padding: 15px;
            font-size: 14px;
            line-height: 1.6;
            word-break: break-word;
            
            :deep(.markdown-body) {
              h1, h2, h3, h4, h5, h6 {
                margin-top: 24px;
                margin-bottom: 16px;
                font-weight: 600;
                line-height: 1.25;
              }
              
              h1 { font-size: 2em; }
              h2 { font-size: 1.5em; }
              h3 { font-size: 1.25em; }
              
              p {
                margin-bottom: 16px;
              }
              
              code {
                padding: 0.2em 0.4em;
                margin: 0;
                font-size: 85%;
                background-color: rgba(27,31,35,0.05);
                border-radius: 3px;
              }
              
              pre {
                margin: 16px 0;
                padding: 16px;
                overflow: auto;
                background-color: #f6f8fa;
                border-radius: 6px;
                
                code {
                  padding: 0;
                  margin: 0;
                  font-size: 85%;
                  background-color: transparent;
                  border-radius: 0;
                  white-space: pre;
                  font-family: SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;
                }
              }
              
              blockquote {
                padding: 0 1em;
                color: #6a737d;
                border-left: 0.25em solid #dfe2e5;
                margin: 0 0 16px;
              }
              
              ul, ol {
                padding-left: 2em;
                margin-bottom: 16px;
              }
              
              img {
                max-width: 100%;
                box-sizing: border-box;
              }
              
              a {
                color: #0366d6;
                text-decoration: none;
                
                &:hover {
                  text-decoration: underline;
                }
              }
              
              table {
                border-spacing: 0;
                border-collapse: collapse;
                margin-bottom: 16px;
                
                th, td {
                  padding: 6px 13px;
                  border: 1px solid #dfe2e5;
                }
                
                tr:nth-child(2n) {
                  background-color: #f6f8fa;
                }
              }
              
              .hljs {
                display: block;
                overflow-x: auto;
                padding: 0.5em;
                color: #333;
                background: #f8f8f8;
              }
            }
          }
        }

        .post-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 16px;
          border-top: 1px solid #edeff1;
          
          .post-actions {
            display: flex;
            align-items: center;
            
            .edit-btn {
              padding: 6px 12px;
              color: #878A8C;
              font-size: 14px;
              
              &:hover {
                color: #1A1A1B;
                background-color: rgba(26,26,27,0.1);
                border-radius: 4px;
              }
              
              .el-icon-edit {
                margin-right: 4px;
              }
            }
          }
        }

        .user-btn {
          margin-top: 12px;
          font-size: 12px;
          display: flex;
          align-items: center;
          color: #878a8c;
          padding: 4px 0;

          .btn-item {
            display: flex;
            align-items: center;
            margin-right: 10px;
            cursor: pointer;

            &:hover {
              color: #1a1a1b;
            }

            .iconfont {
              margin-right: 6px;
              font-size: 16px;
            }
          }
        }
      }
    }
  }
  .right {
    flex-grow: 0;
    width: 312px;
    margin-top: 32px;
    .topic-info {
      width: 100%;
      cursor: pointer;
      background-color: #ffffff;
      color: #1a1a1b;
      border: 1px solid #cccccc;
      border-radius: 4px;
      overflow: visible;
      word-wrap: break-word;
      padding-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      
      .t-header {
        width: 100%;
        height: 40px;
        background: #0079d3;
        margin-bottom: 15px;
      }
      
      .t-info {
        padding: 0 15px;
        display: flex;
        align-items: center;
        width: 100%;
        height: 60px;
        margin-bottom: 15px;
        
        .avatar {
          width: 50px;
          height: 50px;
          background: url("../assets/images/community.png") no-repeat center;
          background-size: cover;
          margin-right: 15px;
          border-radius: 25px;
        }
        
        .topic-name {
          height: 100%;
          line-height: 60px;
          font-size: 16px;
          font-weight: 500;
        }
      }
      
      .t-desc {
        font-family: Noto Sans, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.6;
        font-weight: 400;
        word-wrap: break-word;
        margin-bottom: 15px;
        padding: 0 15px;
      }
      
      .t-create-time {
        font-family: Noto Sans, Arial, sans-serif;
        font-size: 14px;
        font-weight: 400;
        line-height: 1.4;
        padding: 0 15px;
        margin-bottom: 20px;
        color: #666;
      }
      
      .topic-btn {
        width: calc(100% - 30px);
        height: 36px;
        line-height: 36px;
        color: #ffffff;
        margin: 0 15px;
        background: #0079d3;
        border-radius: 4px;
        border: none;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        
        &:hover {
          background: #005fa3;
        }
      }
    }
  }
}

.comment {
  .c-right {
    flex: 1;
    padding: 8px 16px;
    
    .c-content {
      font-size: 14px;
      line-height: 1.4;
      margin: 8px 0;
      word-break: break-word;
    }

    .comment-actions {
      display: flex;
      align-items: center;
      margin: 4px 0;
    }

    // 修改回复输入框样式
    .reply-input {
      margin: 8px 0;
      padding: 8px;
      background-color: #f6f7f8;
      border-radius: 4px;
    }
  }
}
</style>
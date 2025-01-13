<template>
  <div class="content">
    <div class="left">
      <div class="container">
        <div class="l-container">
          <div class="post-header">
            <user-info-bar
              :author="post.author_name"
              :time="formatTime(post.create_time)"
              :avatar-src="post.avatar_src"
            />
            <h4 class="post-title">{{ post.title }}</h4>
          </div>
          <div class="post-body">
            <div class="post-content">{{ post.content }}</div>
          </div>
          <div class="post-bottom">
            <vote-info-bar
              :author="post.author_name"
              :time="formatTime(post.create_time)"
              :vote-num="post.vote_num"
              :is-author="isAuthor"
              @vote="votePost(post.post_id, $event)"
            />
            <el-button 
              v-if="isAuthor" 
              type="text" 
              class="edit-btn"
              @click="showEditDialog">
              <i class="el-icon-edit"></i> 编辑
            </el-button>
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

      <div class="comment-list">
        <div class="user-btn">
          <span class="btn-item">
            <i class="iconfont icon-comment"></i> 评论
            <span class="comment-num">{{ post.comment_count || 0 }}</span>
          </span>
        </div>
        <div v-if="comments.length === 0" class="no-comments">
          暂无评论，快来发表第一条评论吧！
        </div>
        <div v-else v-for="comment in comments" :key="comment.comment_id" class="comment">
          <div class="c-right">
            <user-info-bar
              :author="comment.author_name"
              :time="formatTime(comment.create_time)"
              :avatar-src="comment.avatar_src"
            />
            <p class="c-content">{{ comment.content }}</p>
            <div class="comment-actions">
              <p class="c-reply">回复</p>
              <vote-info-bar
                :author="comment.author_name"
                :time="formatTime(comment.create_time)"
                :vote-num="comment.vote_num"
                @vote="voteComment(comment.comment_id, $event)"
              />
            </div>
            <div class="c-reply-list">
              <!-- <p class="c-reply">回复列表...</p> -->
            </div>
          </div>
        </div>
      </div>
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
  </div>
</template>

<script>
import UserInfoBar from '@/components/UserInfoBar.vue';
import VoteInfoBar from '@/components/VoteInfoBar.vue';
import CommentDialog from '@/components/CommentDialog.vue';
import { formatTime } from '@/utils/timeFormat';

export default {
  name: 'Content',
  components: {
    UserInfoBar,
    VoteInfoBar,
    CommentDialog
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
        content: '',
        post_id: ''
      },
      isAuthor: false,
      showCommentInput: true,
      loading: false
    };
  },
  methods: {
    goCommunityDetail(id) {
      this.$router.push({ name: "Community", params: { id: id }});
    },
    getPostDetail() {
      const postId = this.$route.params.id;
      if (!postId) {
        this.$router.push({ name: "Home" });
        return;
      }

      this.$axios({
        method: "get",
        url: "/post/" + postId,
      })
      .then(response => {
        if (response.code == 1000) {
          this.post = response.data;
          this.checkIsAuthor();
        } else {
          this.$message.error(response.message);
          this.$router.push({ name: "Home" });
        }
      })
      .catch(error => {
        this.$message.error('getPostDetail error：' + error);
        this.$router.push({ name: "Home" });
      }); 
    },
    votePost(post_id, direction) {
      this.$axios.post("/vote", {
        target_id: post_id,
        target_type: 1,
        direction: direction
      })
      .then(response => {
        if (response.code === 1000) {
          this.getPostDetail();
        } else {
          this.$message.error(response.message);
        }
      })
      .catch((error) => {
        this.$message.error('votePost error: ' + error);
      });
    },
    voteComment(comment_id, direction) {
      this.$axios({
        method: "post",
        url: "/vote",
        data: {
          target_id: comment_id,
          target_type: 2, // 投票目标类型(1:帖子 2:评论)
          direction: direction,
        }
      })
      .then(response => {
        if (response.code === 1000) {
          this.getComments();
        } else {
          this.$message.error(response.message);
        }
      })
      .catch(error => {
        this.$message.error('voteComment error:' + error);
      });
    },
    getComments() {
      const postId = this.$route.params.id;
      if (!postId) {
        return;
      }

      this.$axios({
        method: "get",
        url: `/comment/${postId}`,
      })
      .then(response => {
        if (response.code == 1000) {
          this.comments = response.data;
        } else {
          this.$message.error(response.message);
          this.comments = [];
        }
      })
      .catch(error => {
        this.$message.error('getComments error:' + error);
        this.comments = [];
      });
    },
    cancelComment() {
      this.showCommentInput = true
    },
    submitComment(formData) {
      if (!formData.content.trim()) return
      this.submitting = true
      this.$axios({
        method: 'post',
        url: '/comment',
        data: {
          post_id: this.post.post_id,
          content: formData.content
        }
      })
        .then(response => {
          if (response.code === 1000) {
            this.$message.success('评论成功')
            this.getComments()
            this.showCommentInput = true
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
      }
      this.editDialogVisible = true
    },
    submitEdit(formData) {
      this.$axios({
        method: 'put',
        url: "/post",
        data: {
          post_id: this.post.post_id,
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
          this.$message.error(response.message)
        }
      })
      .catch(() => {
        this.$message.error('修改失败')
      })
    },
    checkIsAuthor() {
      let loginResult = JSON.parse(localStorage.getItem("loginResult"));
      const userId = loginResult?.user_id;
      this.isAuthor = userId && parseInt(userId) === this.post.author_id;
    }
  },
  watch: {
    post: {
      handler() {
        this.checkIsAuthor();
      },
      immediate: true
    }
  },
  mounted() {
    this.getPostDetail();
    this.getComments();
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
            padding: 4px 0;

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
          padding: 2px 16px;
          border-bottom: 1px solid #edeff1;

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

          .post-title {
            font-size: 24px;
            font-weight: 700;
            line-height: 32px;
            color: #1a1a1b;
            margin: 0;
            padding: 0;
            word-break: break-word;
            overflow-wrap: break-word;
            letter-spacing: 0.5px;
          }
        }

        .post-body {
          padding: 10px 12px;
          min-height: 100px;
          
          .post-content {
            font-family: Noto Sans, Arial, sans-serif;
            font-size: 16px;
            font-weight: 400;
            line-height: 1.6;
            color: #1a1a1b;
            white-space: pre-wrap;
            word-break: break-word;
            overflow-wrap: break-word;
            padding: 0;
            margin: 0;
          }
        }

        .post-bottom {
          display: flex; /* 使用 flexbox 布局 */
          justify-content: space-between; /* 在两端对齐 */
          align-items: center; /* 垂直居中对齐 */
          padding: 10px; /* 添加内边距 */
          border: none; /* 去掉边框 */
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
</style>
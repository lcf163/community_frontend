<template>
  <div class="content">
    <div class="left">
      <div class="container">
        <div class="post">
          <a class="vote">
            <span class="iconfont icon-up" @click="votePost(post.post_id, 1)"></span>
          </a>
          <span class="text">{{ post.vote_num || 0 }}</span>
          <a class="vote">
            <span class="iconfont icon-down" @click="votePost(post.post_id, -1)"></span>
          </a>
        </div>
        <div class="l-container">
          <h4 class="con-title">{{post.title}}</h4>
          <div class="con-info">{{post.content}}</div>
        </div>
      </div>

      <div class="comment-input">
        <el-input
          type="textarea"
          :rows="2"
          placeholder="写下你的评论..."
          v-model="commentContent"
        >
        </el-input>
        <div class="btn-wrapper">
          <el-button class="cancel-btn" @click="cancelComment">取消评论</el-button>
          <el-button
            class="submit-btn"
            type="primary"
            @click="submitComment"
            :loading="submitting"
            :disabled="!commentContent.trim()"
          >
            {{ submitting ? '发表中...' : '发表评论' }}
          </el-button>
        </div>
      </div>

      <div class="comment-list">
        <div class="user-btn">
          <span class="btn-item">
            <i class="iconfont icon-comment"></i> 全部评论
          </span>
        </div>
        <div v-if="comments.length === 0" class="no-comments">
          暂无评论，快来发表第一条评论吧！
        </div>
        <div v-else v-for="comment in comments" :key="comment.comment_id" class="comment">
          <div class="c-left">
            <div class="c-arrow">
              <a class="vote">
                <span class="iconfont icon-up" @click="voteComment(comment.comment_id, 1)"></span>
              </a>
              <span class="text">{{ comment.vote_num || 0 }}</span>
              <a class="vote">
                <span class="iconfont icon-down" @click="voteComment(comment.comment_id, -1)"></span>
              </a>
            </div>
          </div>
          <div class="c-right">
            <div class="c-user-info">
              <span class="name">{{ comment.author_name || '匿名用户' }}</span>
              <span class="num">{{ comment.vote_num || 0 }} 点赞</span>
              <span class="num">· {{ formatTime(comment.create_time) }}</span>
            </div>
            <p class="c-content">{{ comment.content }}</p>
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
  </div>
</template>

<script>
export default {
  name: "Content",
  data(){
    return {
      post: {
        author_name: '',
        vote_num: 0,
        post_id: '',
        title: '',
        content: '',
        create_time: '',
        community: {
          community_id: '',
          community_name: '',
          introduction: '',
          create_time: ''
        }
      },
      comments: [],
      commentContent: '',
      submitting: false,
    }
  },
  methods:{
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
        } else {
          this.$message.error(response.message);
          this.$router.push({ name: "Home" });
        }
      })
      .catch(error => {
        this.$message.error('getPostDetail ：' + error);
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
      .catch(() => {
        this.$message.error('votePost error');
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
    goCommunityDetail(id) {
      this.$router.push({ name: "Community", params: { id: id }});
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
      if (this.commentContent.trim()) {
        this.$confirm('确定要取消评论吗？已输入的内容将会丢失', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.commentContent = '';
          this.$message({
            type: 'info',
            message: '已取消评论'
          });
        }).catch(() => {});
      } else {
        this.commentContent = '';
      }
    },
    submitComment() {
      if (!this.commentContent.trim()) {
        this.$message.warning('评论内容不能为空');
        return;
      }

      this.submitting = true;
      this.$axios({
        method: "post",
        url: "/comment",
        data: {
          post_id: this.post.post_id,
          content: this.commentContent
        }
      })
      .then(response => {
        if (response.code == 1000) {
          this.commentContent = '';
          this.getComments();
        } else {
          this.$message.error(response.message);
        }
      })
      .catch(error => {
        this.$message.error('submitComment error:' + error);
      })
      .finally(() => {
        this.submitting = false;
      });
    },
    formatTime(timestamp) {
      if (!timestamp) return '';
      
      // 直接解析 UTC 时间字符串，不进行时区转换
      const date = new Date(timestamp);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      const hours = String(date.getUTCHours()).padStart(2, '0');
      const minutes = String(date.getUTCMinutes()).padStart(2, '0');
      const seconds = String(date.getUTCSeconds()).padStart(2, '0');
      
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    },
  },
  mounted: function() {
    this.getPostDetail();
    this.getComments();
    this.cancelComment();
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
        position: relative;
        box-sizing: border-box;

        .c-left {
          .c-arrow {
            display: flex;
            flex-direction: column;
            position: absolute;
            z-index: 2;
            left: 12px;
            background: #ffffff;
            padding-bottom: 5px;
          }
        }

        .c-right {
          margin-left: 40px;
          padding-right: 10px;

          .c-user-info {
            margin-bottom: 10px;
            
            .name {
              color: #0079d3;
              font-size: 12px;
              font-weight: 500;
              line-height: 16px;
              &:hover {
                text-decoration: underline;
              }
            }
            
            .num {
              padding-left: 4px;
              font-size: 12px;
              font-weight: 400;
              line-height: 16px;
              color: #7c7c7c;
            }
          }

          .c-content {
            font-family: Noto Sans, Arial, sans-serif;
            font-size: 14px;
            font-weight: 400;
            line-height: 21px;
            word-break: break-word;
            color: #1a1a1b;
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
        padding: 15px;
        margin-left: 40px;
        border-bottom: 1px solid #edeff1;

        .con-title {
          color: #1a1a1b;
          font-size: 20px;
          font-weight: 600;
          line-height: 24px;
          text-decoration: none;
          word-break: break-word;
          margin-bottom: 15px;
          padding-bottom: 15px;
          border-bottom: 1px solid #edeff1;
        }

        .con-info {
          font-family: Noto Sans, Arial, sans-serif;
          font-size: 14px;
          font-weight: 400;
          line-height: 21px;
          word-break: break-word;
          color: #1a1a1b;
          margin: 15px 0;
          padding: 15px 0;
          border-bottom: 1px solid #edeff1;
          white-space: pre-wrap;
        }

        .user-btn {
          margin-top: 15px;
          font-size: 12px;
          display: flex;
          align-items: center;
          color: #878a8c;

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
<template>
  <div class="content">
    <div class="left">
      <div class="container">
        <div class="post">
          <a class="vote">
            <span class="iconfont icon-up" @click="vote(post.post_id, 1)"></span>
          </a>
          <span class="text">{{ post.vote_num }}</span>
          <a class="vote">
            <span class="iconfont icon-down" @click="vote(post.post_id, -1)"></span>
          </a>
        </div>
        <div class="l-container">
          <h4 class="con-title">{{post.title}}</h4>
          <div class="con-info">{{post.content}}</div>
          <div class="user-btn">
            <span class="btn-item">
              <i class="iconfont icon-comment"></i>comment
            </span>
          </div>
        </div>
      </div>

      <!-- <div class="comment">
        <div class="c-left">
          <div class="line"></div>
          <div class="c-arrow">
                            <a class="vote"><span class="iconfont icon-up"></span></a>
                            <a class="up down"></a>
          </div>
        </div>
        <div class="c-right">
          <div class="c-user-info">
            <span class="name">mahlerific</span>
            <span class="num">1.4k points</span>
            <span class="num">· 5 hours ago</span>
          </div>
          <p
            class="c-content"
          >We're having the same experience in Yerevan, Armenia. Though you can see mountains all around the city on good days, now you can see even farther into Turkey and Iran. Every crag on the mountains around us is now clearer than ever.</p>
        </div>
      </div> -->
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
import Vue from 'vue';

export default {
  name: "Content",
  data(){
    return {
      post: {
        vote_num: 0,
        post_id: '',
        title: '',
        content: '',
        create_time: '',
        community: {
          community_name: '',
          introduction: '',
          create_time: '',
          community_id: ''
        }
      },
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
          console.log("getPostDetail fail:", response.message);
          this.$router.push({ name: "Home" });
        }
      })
      .catch(error => {
        console.error("getPostDetail error:", error);
        this.$router.push({ name: "Home" });
      });
    },
    vote(post_id, direction){
      this.$axios({
        method: "post",
        url: "/vote",
        data: {
          post_id: post_id,
          direction: direction,
        }
      })
      .then(response => {
        if (response.code == 1000) {
          this.getPostDetail();
        } else {
          Vue.prototype.$message.error(response.message)
        }
      })
      .catch(error => {
        console.error("vote error:", error);
      })
    },
    goCommunityDetail(id) {
      this.$router.push({ name: "Community", params: { id: id }});
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
    }
  },
  mounted: function() {
    this.getPostDetail();
  }
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
        .con-title {
          color: #000000;
          font-size: 18px;
          font-weight: 500;
          line-height: 22px;
          text-decoration: none;
          word-break: break-word;
        }
        .con-info{
          margin: 25px 0;
          padding: 15px 0;
          border-bottom: 1px solid grey;
        }
        .con-cover {
          height: 512px;
          width: 100%;
          background: url("https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1585999647247&di=7e9061211c23e3ed9f0c4375bb3822dc&imgtype=0&src=http%3A%2F%2Fi1.hdslb.com%2Fbfs%2Farchive%2F04d8cda08e170f4a58c18c45a93c539375c22162.jpg")
            no-repeat;
          background-size: cover;
          margin-top: 10px;
          margin-bottom: 10px;
        }
        .user-btn {
          font-size: 12px;
          display: flex;
          display: -webkit-flex;
          .btn-item {
            display: flex;
            display: -webkit-flex;
            align-items: center;
            margin-right: 10px;
            .iconfont{
              margin-right: 4px;
            }
          }
        }
      }
    }
    .comment {
      width: 100%;
      height: auto;
      position: relative;
      .c-left {
        .line {
          border-right: 2px solid #edeff1;
          // width: 20px;
          height: 100%;
          position: absolute;
          left: 20px;
        }
        .c-arrow {
          display: flex;
          display: -webkit-flex;
          position: absolute;
          z-index: 2;
          flex-direction: column;
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
            color: #1c1c1c;
            font-size: 12px;
            font-weight: 400;
            line-height: 16px;
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
          color: rgb(26, 26, 27);
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
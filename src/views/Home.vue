<template>
  <div class="content">
    <div class="left">
      <!-- <h4 class="c-l-title">热门帖子</h4> -->
      <div class="c-l-header">
        <div class="new btn-iconfont" :class="{ active: timeOrder }" @click="selectOrder('time')">
          <i class="iconfont icon-polygonred"></i>New
        </div>
        <div class="top btn-iconfont" :class="{ active: scoreOrder }" @click="selectOrder('score')">
          <i class="iconfont icon-top"></i>Score
        </div>
        <div class="search">
          <i class="search-icon el-icon-search" @click="searchPost"></i>
          <input type="text" class="s-input" v-model="keyword" @keydown.enter="searchPost"/>
        </div>
        <button class="btn-publish" @click="goPublish">发表</button>
      </div>
      <ul class="c-l-list">
        <li class="c-l-item" v-for="post in postList" :key="post.post_id">
          <post-list
            :post="post"
            :time="formatTime(post.create_time)"
            :is-author="post.author_id === userId"
            @vote="handleVote"
            @detail="goDetail"
          />
        </li>
        <page-bar
          :current-page="pageNumber"
          :page-size="pageSize"
          :total="pageTotal?.total || 0"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </ul>
    </div>
    <div class="right">
      <div class="communities">
        <h2 class="r-c-title">社区分类列表</h2>
        <ul class="r-c-content" v-for="community in limitedCommunityList" :key="community.community_id" 
          @click="goCommunityDetail(community.community_id)">
          <li class="r-c-item">
            <span class="index">{{ community.community_id }}</span>
            <i class="icon"></i>
            <p>{{ community.community_name }}</p>
          </li>
        </ul>
        <button class="view-all" @click="viewAllCommunities">查看所有社区</button>
      </div>
    </div>
  </div>
</template>

<script>
import PostList from '@/components/PostList.vue';
import { formatTime } from '@/utils/timeFormat';
import PageBar from '@/components/PageBar.vue'

export default {
  name: "Home",
  components: {
    PostList,
    PageBar
  },
  data() {
    return {
      order: "time",
      postList: [],
      pageNumber: 1,
      pageSize: 5,
      pageTotal: {
        total: 0
      },
      keyword: '',
      isSearch: false,
      communityList: [],
      maxCommunities: 5,
      userId: ''
    };
  },
  methods: {
    selectOrder(order){
      this.order = order;
      this.getPostList()
    },
    handleCurrentChange(val) {
      this.pageNumber = val;
      if (!this.isSearch) {
        this.getPostList();
      } else {
        this.searchPost();
      }
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.pageNumber = 1;
      if (!this.isSearch) {
        this.getPostList();
      } else {
        this.searchPost();
      }
    },
    goPublish(){
      this.$router.push({ name: "Publish" });
    },
    goDetail(id){
      this.$router.push({ name: "Content", params: { id: id }});
    },
    goCommunityDetail(id) {
      this.$router.push({ name: "Community", params: { id: id }});
    },
    getPostList() {
      this.$axios({
        method: "get",
        url: "/posts2",
        params: {
          page: this.pageNumber,
          size: this.pageSize,
          order: this.order,
        }
      })
      .then(response => {
        if (response.code === 1000) {
          this.postList = response.data.list;
          this.pageTotal = {
            total: response.data.page.total
          };
        } else {
          console.log("getPostList fail:", response.message);
          this.postList = [];
          this.pageTotal = { total: 0 };
        }
      })
      .catch(error => {
        console.error("getPostList error:", error);
        this.postList = [];
        this.pageTotal = { total: 0 };
      });
    },
    getCommunityList() {      
      this.$axios({
        method: "get",
        url: "/community",
      })
      .then(response => {
        if (response.code === 1000) {
          this.communityList = response.data;
        } else {
          console.log("getCommunityList fail:", response.message);
          this.communityList = [];
        }
      })
      .catch(error => {
        console.error("getCommunityList error:", error);
        this.communityList = [];
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
          this.getPostList();
        } else {
          this.$message.error(response.message);
        }
      })
      .catch((error) => {
        this.$message.error('votePost error: ' + error);
      });
    },
    async searchPost() {
      if (!this.keyword) {
        this.isSearch = false;
        this.getPostList();
        return;
      }
      
      this.isSearch = true;
      const response = await this.$axios({
        method: "get",
        url: "/search",
        params: {
          page: this.pageNumber,
          size: this.pageSize,
          search: this.keyword
        }
      });
      if (response.code === 1000) {
        this.postList = response.data.list;
        this.pageTotal = response.data.page;
      } else {
        console.log("searchPost fail:", response.message);
      }
    },
    viewAllCommunities() {
      this.$router.push('/community/list');
    },
    goCommunityList() {
      this.$router.push({ name: 'CommunityList' });
    },
    formatTime,
    handleVote({ postId, type }) {
      this.votePost(postId, type)
    }
  },
  mounted() {
    this.getPostList();
    this.getCommunityList();
  },
  computed:{
    timeOrder(){
      return this.order == "time";
    },
    scoreOrder(){
      return this.order == "score";
    },
    limitedCommunityList() {
      return this.communityList.slice(0, this.maxCommunities);
    }
  }
};
</script>

<style scoped lang="less">
.content {
  max-width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 48px auto 0;
  padding: 20px 24px;
  
  .left {
    width: 640px;
    padding-bottom: 10px;
    .c-l-title {
      font-size: 14px;
      font-weight: 500;
      line-height: 18px;
      color: #1a1a1b;
      text-transform: unset;
      padding-bottom: 10px;
    }
    .c-l-header {
      align-items: center;
      background-color: #ffffff;
      border: 1px solid #ccc;
      border-radius: 4px;
      box-sizing: border-box;
      display: -ms-flexbox;
      display: flex;
      -ms-flex-flow: row nowrap;
      flex-flow: row nowrap;
      height: 56px;
      -ms-flex-pack: start;
      justify-content: flex-start;
      margin-bottom: 16px;
      padding: 0 12px;
      .iconfont {
        margin-right: 4px;
      }
      .btn-iconfont {
        display: flex;
        display: -webkit-flex;
      }
      .active {
        background: #f6f7f8;
        color: #0079d3;
        fill: #0079d3;
        border-radius: 20px;
        height: 32px;
        line-height: 32px;
        margin-right: 8px;
        padding: 0 10px;
      }
      .new {
        font-size: 14px;
        margin-right: 18px;
      }
      .top {
        font-size: 14px;
      }
      .search {
        flex-grow: 0.5;
        margin: 0 auto;
        max-width: 650px;
        position: relative;
        display: flex;
        display: -webkit-flex;
        align-items: center;
        border-radius: 4px;
        .search-icon {
          width: 18px;
          height: 18px;
          line-height: 18px;
          background-size: cover;
          display: inline-block;
          position: absolute;
          cursor: pointer;
          border-radius: 4px;
          right: 1rem;
          padding: 5px;

          &:hover {
            background: silver;
          }
        }
        .s-input {
          flex-grow: 1;
          -webkit-appearance: none;
          appearance: none;
          background-color: #f6f7f8;
          border-radius: 4px;
          border: 1px solid #edeff1;
          box-shadow: none;
          color: #c1c1c1;
          display: block;
          height: 36px;
          outline: none;
          width: 100%;
          text-indent: 1rem;
        }
      }
      .btn-publish {
        width: 64px;
        height: 32px;
        line-height: 32px;
        background-color: #54b351;
        color: #ffffff;
        border: 1px solid transparent;
        border-radius: 4px;
        box-sizing: border-box;
        text-align: center;
        margin-left: auto;
        cursor: pointer;
      }
      .sort {
        margin-left: 300px;
        display: flex;
        color: #0079d3;
        display: -webkit-flex;
        align-items: center;
        .sort-triangle {
          width: 0;
          height: 0;
          border-top: 5px solid #0079d3;
          border-right: 5px solid transparent;
          border-bottom: 5px solid transparent;
          border-left: 5px solid transparent;
          margin-top: 5px;
          margin-left: 10px;
        }
      }
    }
    .c-l-list {
      background-color: #ffffff;
      border-radius: 4px;

      .c-l-item {
        display: flex;
        padding: 12px;
        position: relative;
        background-color: #ffffff;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-bottom: 16px;
        transition: all 0.2s ease;
        
        &:hover {
          border-color: #0079d3;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .post {
          width: 100%;
          display: flex;
          flex-direction: column;
          
          .l-container {
            padding: 12px 0;
            cursor: pointer;
            flex: 1;
            
            .user-info-bar {
              margin-bottom: 12px;
              padding-left: 16px;
            }

            .post-title {
              font-size: 18px;
              font-weight: 500;
              color: #1a1a1b;
              margin: 0 0 12px 16px;
              line-height: 1.4;
              padding-right: 16px;
              
              &:hover {
                color: #0079d3;
              }
            }

            .post-content {
              margin-bottom: 16px;
              padding: 0 16px;
              
              p {
                font-size: 14px;
                line-height: 1.4;
                color: #4a4a4a;
                margin: 0;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                max-height: 40px;
                word-break: break-word;
              }
            }
          }

          .post-header-bar {
            padding: 8px 0;
            margin-top: 0;
            border-top: 1px solid #edeff1;
            display: flex;
            align-items: center;
            background-color: #f8f9fa;
            border-radius: 0 0 4px 4px;
            min-height: 32px;
            
            .vote-actions {
              display: flex;
              align-items: center;
              gap: 4px;
              margin-left: 0;
              padding-left: 16px;
              
              .vote {
                padding: 4px;
                cursor: pointer;
                color: #878A8C;
                
                &:hover {
                  color: #0079d3;
                }
              }
              
              .vote-num {
                font-size: 12px;
                font-weight: 600;
                margin: 0 4px;
                color: #1a1a1b;
              }
            }
          }
        }
      }
    }
    .pagination-block {
      background: #ffffff;
      padding: 16px;
      border-radius: 4px;
      border: 1px solid #ccc;
      margin-top: 20px;
      display: flex;
      justify-content: center;
      
      .el-pagination {
        font-weight: normal;
        
        .btn-prev,
        .btn-next {
          background-color: #f8f9fa;
          
          &:hover {
            color: #0079d3;
          }
        }
        
        .el-pager li {
          background-color: #f8f9fa;
          
          &.active {
            background-color: #0079d3;
            color: #ffffff;
          }
          
          &:hover:not(.active) {
            color: #0079d3;
          }
        }
      }
    }
  }
  .right {
    width: 310px;
    margin-left: 24px;
    align-self: flex-start;
    position: sticky;
    top: 48px;
    
    .communities {
      background-color: #ffffff;
      color: #1a1a1b;
      border: 1px solid #ccc;
      border-radius: 4px;
      overflow: visible;
      word-wrap: break-word;
      margin-bottom: 20px;
      position: sticky;
      top: 48px;
      
      .r-c-title {
        background-image: linear-gradient(
          0deg,
          rgba(0, 0, 0, 0.3) 0,
          transparent
        );
        background-color: #0079d3;
        height: 80px;
        width: 100%;
        color: #fff;
        font-size: 20px;
        line-height: 120px;
        padding-left: 10px;
        box-sizing: border-box;
        text-align: center;
      }
      .r-c-content {
        .r-c-item {
          align-items: center;
          display: flex;
          display: -webkit-flex;
          height: 48px;
          padding: 0 12px;
          border-bottom: thin solid #edeff1;
          font-size: 14px;
          .index {
            width: 20px;
            color: #1c1c1c;
            font-size: 14px;
            font-weight: 500;
            line-height: 18px;
          }
          .icon {
            width: 32px;
            height: 32px;
            background-image: url("../assets/images/community.png");
            background-repeat: no-repeat;
            background-size: cover;
            margin-right: 20px;
          }
          &:last-child {
            border-bottom: none;
          }
        }
      }
      .view-all {
        background-color: #0079d3;
        border: 1px solid transparent;
        border-radius: 4px;
        box-sizing: border-box;
        text-align: center;
        letter-spacing: 1px;
        text-decoration: none;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.5px;
        line-height: 24px;
        text-transform: uppercase;
        padding: 3px 0;
        width: 280px;
        color: #fff;
        margin: 20px 0 20px 16px;
      }
    }
  }
}
</style>

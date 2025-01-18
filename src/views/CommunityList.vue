<template>
  <div class="content">
    <div class="page-header">
      <!-- <button class="back-btn" @click="goBack">返回</button> -->
      <h2 class="page-title">社区列表</h2>
    </div>
    <div class="community-list">
      <ul class="community-grid">
        <li v-for="community in communityList" 
            :key="community.community_id" 
            class="community-item"
            @click="goCommunityDetail(community.community_id)">
          <div class="community-card">
            <div class="community-info">
              <h3 class="community-name">{{ community.community_name }}</h3>
              <p class="community-desc">{{ community.introduction || '暂无简介' }}</p>
            </div>
            <button class="join-btn" @click.stop="goCommunityDetail(community.community_id)">进入社区</button>
          </div>
        </li>
      </ul>
      <page-bar
        :current-page="pageNumber"
        :page-size="pageSize"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import PageBar from '@/components/PageBar.vue'

export default {
  name: 'CommunityList',
  components: {
    PageBar
  },
  data() {
    return {
      communityList: [],
      pageNumber: 1,
      pageSize: 3,
      total: 0
    }
  },
  methods: {
    handleCurrentChange(val) {
      this.pageNumber = val;
      this.getCommunityList();
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.pageNumber = 1;
      this.getCommunityList();
    },
    getCommunityList() {
      this.$axios({
        method: "get",
        url: "/community2",
        params: {
          page: this.pageNumber,
          size: this.pageSize
        }
      })
      .then(response => {
        if (response.code === 1000) {
          this.total = response.data.page.total;
          this.communityList = response.data.list || [];
        } else {
          this.$message.error(response.message || '获取社区列表失败');
        }
      })
      .catch(error => {
        console.error('获取社区列表失败:', error);
        this.$message.error('获取社区列表失败');
      });
    },
    goCommunityDetail(id) {
      this.$router.push({ name: "Community", params: { id: id }});
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push({ name: 'Home' });
      }
    }
  },
  mounted() {
    this.getCommunityList();
  }
}
</script>

<style lang="less" scoped>
.content {
  padding: 20px;
  margin-top: 48px;
  
  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-top: 10px;
    
    .page-title {
      font-size: 22px;
      margin: 0;
      flex-grow: 1;
      text-align: center;
      padding-right: 100px;
    }
  }

  .community-list {
    margin-top: 20px;
  }

  .community-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
    
    .community-item {
      cursor: pointer;
      
      .community-card {
        background: #fff;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        
        &:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .community-info {
          .community-name {
            font-size: 18px;
            margin-bottom: 10px;
          }

          .community-desc {
            color: #666;
            margin-bottom: 10px;
            font-size: 14px;
          }
        }

        .join-btn {
          margin-top: 15px;
          padding: 8px 16px;
          background-color: #0079d3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;

          &:hover {
            background-color: #006cbd;
          }
        }
      }
    }
  }
}

.pagination-block {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  background-color: #fff;
  padding: 16px;
  border-radius: 4px;
}
</style> 
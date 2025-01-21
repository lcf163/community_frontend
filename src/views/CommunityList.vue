<template>
  <div class="content">
    <h2 class="page-title">社区列表</h2>
    <div class="community-list">
      <ul class="community-grid">
        <li v-for="community in communityList" 
            :key="community.community_id" 
            class="community-item"
            @click="goCommunityDetail(community.community_id)">
          <div class="community-card">
            <div class="community-info">
              <h3>{{ community.community_name }}</h3>
              <p>{{ community.introduction || '暂无简介' }}</p>
            </div>
            <button @click.stop="goCommunityDetail(community.community_id)">进入社区</button>
          </div>
        </li>
      </ul>
      <page-bar
        :current-page="pageNumber"
        :page-size="pageSize"
        :total="total"
        :page-sizes="PAGE_SIZES"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import PageBar from '@/components/PageBar.vue'

const PAGE_SIZES = [5, 10];
const DEFAULT_PAGE_SIZE = PAGE_SIZES[0];

export default {
  name: 'CommunityList',
  components: {
    PageBar
  },
  data() {
    return {
      communityList: [],
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      total: 0
    }
  },
  computed: {
    PAGE_SIZES() {
      return PAGE_SIZES;
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
        console.error('getCommunityList error:', error);  
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

  .page-title {
    text-align: center;
    margin-bottom: 32px;
    font-size: 22px;
  }
}

.community-list {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;

  .community-grid {
    display: flex;
    flex-direction: column;
    list-style: none;
    gap: 16px;
    margin-bottom: 40px;
  }

  .community-card {
    display: flex;
    align-items: center;
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .community-info {
      flex: 1;
      padding-right: 24px;

      h3 {
        font-size: 20px;
        margin-bottom: 8px;
        color: #303133;
      }

      p {
        color: #606266;
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
    }

    button {
      padding: 8px 20px;
      background-color: #409eff;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: #66b1ff;
      }
    }
  }
}
</style> 
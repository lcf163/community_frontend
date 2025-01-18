<template>
  <div class="content">
    <div class="user-info">
      <div class="user-header">
        <img :src="userInfo.avatar_url" class="avatar" alt="用户头像">
        <div class="user-details">
          <h2 class="username">{{ userInfo.username }}</h2>
          <p class="user-id">ID: {{ userInfo.user_id }}</p>
        </div>
      </div>
    </div>

    <div class="user-posts">
      <h3 class="section-title">发布的帖子</h3>
      <ul class="post-list">
        <li v-for="post in postList" :key="post.post_id" class="post-item">
          <post-list
            :post="post"
            :time="formatTime(post.create_time)"
            :is-author="true"
            @vote="handleVote"
            @detail="goDetail"
          />
        </li>
      </ul>
      <div class="pagination-block">
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
  </div>
</template>

<script>
import PostList from '@/components/PostList.vue';
import PageBar from '@/components/PageBar.vue';
import { formatTime } from '@/utils/timeFormat';

const PAGE_SIZES = [5, 10];
const DEFAULT_PAGE_SIZE = PAGE_SIZES[0];  // 默认使用第一个值

export default {
  name: 'UserInfo',
  components: {
    PostList,
    PageBar
  },
  data() {
    return {
      userInfo: {
        user_id: '',
        username: '',
        avatar_url: require('@/assets/images/avatar.png')
      },
      postList: [],
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE,  // 使用常量
      total: 0
    };
  },
  computed: {
    PAGE_SIZES() {  // 添加计算属性以在模板中使用常量
      return PAGE_SIZES;
    }
  },
  methods: {
    // 获取用户信息
    getUserInfo() {
      const userId = this.$route.params.id;
      this.$axios({
        method: 'get',
        url: `/user/${userId}`
      })
      .then(response => {
        if (response.code === 1000) {
          // 处理头像路径
          const avatarUrl = response.data.avatar ? 
            require(`@/assets/images/avatar/${response.data.avatar}`) : 
            require('@/assets/images/avatar.png');
          
          this.userInfo = {
            ...response.data,
            avatar_url: avatarUrl
          };
        } else {
          this.$message.error(response.message || '获取用户信息失败');
        }
      })
      .catch(error => {
        console.error('getUserInfo error:', error);   
        this.$message.error('获取用户信息失败');
      });
    },
    // 获取用户发布的帖子
    getUserPosts() {
      const userId = this.$route.params.id;
      this.$axios({
        method: 'get',
        url: `/posts/user/${userId}`,
        params: {
          page: this.pageNumber,
          size: this.pageSize
        }
      })
      .then(response => {
        if (response.code === 1000) {
          // 确保从后端获取正确的总数
          this.total = response.data.page.total || 0;
          this.postList = response.data.list || [];
          
          // 如果当前页码大于最大页码，自动跳转到最后一页
          const maxPage = Math.ceil(this.total / this.pageSize);
          if (this.pageNumber > maxPage && maxPage > 0) {
            this.pageNumber = maxPage;
            this.getUserPosts();
          }
        } else {
          this.$message.error(response.message || '获取用户帖子失败');
        }
      })
      .catch(error => {
        console.error('getUserPosts error:', error);
        this.$message.error('获取用户帖子失败');
      });
    },
    handleVote(postId, direction) {
      this.$axios.post('/vote', {
        target_id: postId,
        target_type: 1,
        direction: direction
      })
      .then(response => {
        if (response.code === 1000) {
          this.getUserPosts();
        } else {
          this.$message.error(response.message || '投票失败');
        }
      })
      .catch(error => {
        console.error('handleVote error:', error);
        this.$message.error('投票失败');
      });
    },
    goDetail(id) {
      this.$router.push({ name: 'Content', params: { id } });
    },
    handleSizeChange(val) {
      console.log('每页条数:', val); // 添加日志
      if (val !== this.pageSize) {
        this.pageSize = val;
        this.pageNumber = 1; // 切换每页条数时重置为第一页
        this.getUserPosts();
      }
    },
    handleCurrentChange(val) {
      console.log('当前页:', val); // 添加日志
      if (val !== this.pageNumber) {
        this.pageNumber = val;
        this.getUserPosts();
      }
    },
    formatTime
  },
  mounted() {
    this.getUserInfo();
    this.getUserPosts();
  },
  watch: {
    '$route.params.id': {
      handler(newId) {
        if (newId) {
          this.pageNumber = 1;
          this.getUserInfo();
          this.getUserPosts();
        }
      },
      immediate: true
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  max-width: 1000px;
  margin: 48px auto 0;
  padding: 20px;

  .user-info {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .user-header {
      display: flex;
      align-items: center;
      
      .avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        margin-right: 20px;
      }

      .user-details {
        .username {
          font-size: 24px;
          margin: 0 0 8px;
        }

        .user-id {
          color: #666;
          margin: 0;
        }
      }
    }
  }

  .user-posts {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .section-title {
      margin: 0 0 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }

    .post-list {
      list-style: none;
      padding: 0;
      margin: 0;

      .post-item {
        margin-bottom: 20px;
      }
    }

    .pagination-block {
      margin-top: 20px;
      display: flex;
      justify-content: center;
      padding: 16px 0 0;
      border-top: 1px solid #eee;
    }
  }
}
</style>
<template>
  <div class="content">
    <div class="user-info">
      <div class="user-header">
        <img :src="getAvatarUrl(userInfo.avatar)" class="avatar" alt="用户头像">
        <div class="user-details">
          <h2 class="username">{{ userInfo.username }}</h2>
          <p class="user-id">ID: {{ userInfo.user_id }}</p>
          
          <div class="edit-buttons" v-if="isCurrentUser">
            <input
              type="file"
              ref="avatarInput"
              style="display: none"
              accept="image/*"
              @change="handleAvatarUpload"
            />
            <el-button size="small" @click="$refs.avatarInput.click()">
              修改头像
            </el-button>
            <el-button size="small" @click="showEditDialog('name')">
              修改用户名
            </el-button>
            <el-button size="small" @click="showEditDialog('password')">
              修改密码
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="user-posts">
      <h3 class="section-title">发布的帖子</h3>
      <div class="post-list">
        <ul class="post-items">
          <li v-for="post in postList" :key="post.post_id" class="post-item">
            <post-list
              :post="post"
              :time="formatTime(post.create_time)"
              :is-author="post.author_id === userId"
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

    <el-dialog
      :title="editType === 'username' ? '修改用户名' : '修改密码'"
      :visible="editDialogVisible"
      @close="editDialogVisible = false"
    >
      <el-form :model="formData" :rules="rules" ref="form">
        <template v-if="editType === 'name'">
          <el-form-item label="新用户名" prop="newName">
            <el-input v-model="formData.newName" placeholder="请输入新用户名"></el-input>
          </el-form-item>
        </template>
        
        <template v-else-if="editType === 'password'">
          <el-form-item label="旧密码" prop="oldPassword">
            <el-input
              v-model="formData.oldPassword"
              type="password"
              show-password
              placeholder="请输入旧密码">
            </el-input>
          </el-form-item>
          <el-form-item label="新密码" prop="newPassword">
            <el-input
              v-model="formData.newPassword"
              type="password"
              show-password
              placeholder="请输入新密码">
            </el-input>
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="formData.confirmPassword"
              type="password"
              show-password
              placeholder="请确认新密码">
            </el-input>
          </el-form-item>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import PostList from '@/components/PostList.vue';
import PageBar from '@/components/PageBar.vue';
import { formatTime } from '@/utils/timeFormat';
import { getAvatarUrl } from '@/config/api'

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
        avatar: ''
      },
      postList: [],
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE,  // 使用常量
      total: 0,
      userId: '',
      editDialogVisible: false,
      editType: '', // 'name', 'password', 'avatar'
      formData: {
        newName: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      avatarFile: null,
      rules: {
        newName: [
          { required: true, message: '请输入新用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' },
          { min: 1, message: '密码长度不能为空', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认新密码', trigger: 'blur' },
          { 
            validator: (rule, value, callback) => {
              if (value !== this.formData.newPassword) {
                callback(new Error('两次输入的密码不一致'));
              } else {
                callback();
              }
            }, 
            trigger: 'blur'
          }
        ]
      }
    };
  },
  computed: {
    PAGE_SIZES() {  // 添加计算属性以在模板中使用常量
      return PAGE_SIZES;
    },
    isCurrentUser() {
      return this.$store.getters.userID === this.userId;
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
          this.userInfo = response.data;
          this.userId = userId;
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
    handleVote({ postId, type }) {
      // 直接使用 postId 和 type
      const numericPostId = parseInt(postId, 10);
      if (isNaN(numericPostId)) {
        this.$message.error('无效的帖子ID');
        return;
      }

      this.$axios.post('/vote', {
        target_id: numericPostId,
        target_type: 1,
        direction: type
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
    formatTime,
    getAvatarUrl,
    // 显示编辑对话框
    showEditDialog(type) {
      this.editType = type;
      this.editDialogVisible = true;
      this.formData = {
        newName: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      };
      // 重置表单验证
      if (this.$refs.form) {
        this.$refs.form.clearValidate();
      }
    },
    // 处理头像上传
    handleAvatarUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      
      const isImage = /^image\/(jpeg|png|gif)$/.test(file.type);
      const isLt2M = file.size / 1024 / 1024 < 2;

      if (!isImage) {
        this.$message.error('只能上传图片文件!');
        return;
      }
      if (!isLt2M) {
        this.$message.error('图片大小不能超过 2MB!');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      this.$axios({
        method: 'post',
        url: '/user/avatar',
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        if (response.code === 1000) {
          this.$message.success('头像更新成功');
          this.getUserInfo();
          // 更新 Vuex store 中的用户信息
          this.$store.dispatch('getUserInfo');
        } else {
          this.$message.error(response.message || '头像更新失败');
        }
      })
      .catch(error => {
        console.error('updateAvatar error:', error);
        this.$message.error('头像更新失败');
      });
    },
    // 提交修改
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (!valid) {
          return;
        }

        if (this.editType === 'name') {
          this.$axios({
            method: 'put',
            url: '/user/name',
            data: {
              username: this.formData.newName
            }
          })
          .then(response => {
            if (response.code === 1000) {
              this.$message.success('用户名修改成功');
              this.editDialogVisible = false;
              this.getUserInfo();
              // 更新 Vuex store 中的用户信息
              this.$store.dispatch('getUserInfo');
            } else {
              this.$message.error(response.message || '用户名修改失败');
            }
          })
          .catch(error => {
            console.error('updateName error:', error);
            this.$message.error('用户名修改失败');
          });
        } else if (this.editType === 'password') {
          this.$axios({
            method: 'put',
            url: '/user/password',
            data: {
              old_password: this.formData.oldPassword,
              new_password: this.formData.newPassword
            }
          })
          .then(response => {
            if (response.code === 1000) {
              this.$message.success('密码修改成功');
              this.editDialogVisible = false;
              // 清空表单
              this.formData = {
                newName: '',
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
              };
            } else {
              this.$message.error(response.message || '密码修改失败');
            }
          })
          .catch(error => {
            console.error('updatePassword error:', error);
            this.$message.error('密码修改失败');
          });
        }
      });
    }
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

        .edit-buttons {
          margin-top: 12px;
          display: flex;
          gap: 8px;
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
      .post-items {
        list-style: none;
        padding: 0;
        margin: 0;

        .post-item {
          margin-bottom: 20px;
          list-style-type: none;
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
}
</style>
<template>
  <div>
    <!-- 编辑帖子对话框 -->
    <el-dialog
      v-if="type === 'edit'"
      title="编辑帖子"
      :visible.sync="visible"
      width="50%"
      @close="handleClose">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="form.title" maxlength="100"></el-input>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            type="textarea"
            :rows="6"
            v-model="form.content">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑评论对话框 -->
    <el-dialog
      v-else-if="type === 'edit-comment'"
      title="编辑评论"
      :visible.sync="visible"
      width="50%"
      @close="handleClose">
      <el-form :model="form">
        <el-form-item>
          <el-input
            type="textarea"
            :rows="4"
            placeholder="编辑你的评论..."
            v-model="form.content">
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 评论输入区域 -->
    <div v-else class="comment-input">
      <el-input
        type="textarea"
        :rows="2"
        placeholder="写下你的评论..."
        v-model="form.content"
      />
      <div class="btn-wrapper">
        <el-button class="cancel-btn" @click="handleClose">取消评论</el-button>
        <el-button
          class="submit-btn"
          type="primary"
          @click="handleSubmit"
          :loading="submitting"
          :disabled="!form.content.trim()"
        >
          {{ submitting ? '发表中...' : '发表评论' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommentDialog',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    initialData: {
      type: Object,
      default: () => ({
        title: '',
        content: ''
      })
    },
    type: {
      type: String,
      default: 'comment',
      validator: value => ['edit', 'comment', 'edit-comment'].includes(value)
    },
    submitting: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: {
        title: '',
        content: ''
      }
    }
  },
  watch: {
    visible(newVal) {
      if (newVal) {
        this.form = { ...this.initialData }
      }
    }
  },
  methods: {
    handleClose() {
      this.form.content = ''
      this.$emit('update:visible', false)
      this.$emit('cancel')
    },
    handleSubmit() {
      if (this.type === 'edit' && (!this.form.title.trim() || !this.form.content.trim())) {
        this.$message.error('标题和内容不能为空')
        return
      }
      if ((this.type === 'comment' || this.type === 'edit-comment') && !this.form.content.trim()) {
        this.$message.error('评论内容不能为空')
        return
      }
      this.$emit('submit', { ...this.form })
      this.resetForm()
      this.$emit('update:visible', false)
    },
    resetForm() {
      this.form = {
        title: '',
        content: ''
      }
    }
  }
}
</script>

<style lang="less" scoped>
.comment-input {
  width: 100%;
  margin: 20px 0;
  padding: 0 20px;
  box-sizing: border-box;

  .btn-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    gap: 10px;

    .btn-base() {
      height: 32px;
      padding: 4px 16px !important;
      border-radius: 4px !important;
      font-size: 12px !important;
      font-weight: 700 !important;
      line-height: 24px !important;
      text-transform: uppercase;
      min-width: 80px;
    }

    .cancel-btn {
      .btn-base();
      background: transparent !important;
      border: 1px solid #0079d3 !important;
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
</style> 
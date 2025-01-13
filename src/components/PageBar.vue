<template>
  <div class="pagination-block">
    <el-pagination 
      @size-change="handleSizeChange" 
      @current-change="handleCurrentChange" 
      :current-page="currentPage"
      :page-sizes="[5, 10, 20, 30]" 
      :page-size="pageSize" 
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>

<script>
export default {
  name: 'PageBar',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    pageSize: {
      type: Number,
      required: true  
    },
    total: {
      type: Number,
      required: true
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('size-change', val)
    },
    handleCurrentChange(val) {
      this.$emit('current-change', val) 
    }
  }
}
</script>

<style lang="less" scoped>
.pagination-block {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}
</style> 
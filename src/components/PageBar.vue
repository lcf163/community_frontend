<template>
  <div class="pagination">
    <el-pagination
      background
      layout="total, sizes, prev, pager, next"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
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
    },
    pageSizes: {
      type: Array,
      default: () => [5, 10, 20, 30]
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('size-change', val);
    },
    handleCurrentChange(val) {
      this.$emit('current-change', val);
    }
  }
};
</script>

<style scoped>
.pagination {
  text-align: center;
}
</style> 
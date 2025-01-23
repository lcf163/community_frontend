<template>
  <div class="go-to-top" v-show="visible" @click="backToTop">
    <button class="top-btn">
      <i class="el-icon-arrow-up"></i>
    </button>
  </div>
</template>


<script>
export default {
  name: "ToTop",
  data() {
    return {
      visible: false,
      scrollHandler: null
    }
  },
  mounted() {
    // 添加滚动监听
    this.scrollHandler = () => {
      this.visible = window.pageYOffset > 300;
    };
    window.addEventListener('scroll', this.scrollHandler);
  },
  beforeDestroy() {
    // 移除滚动监听
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  },
  methods: {
    backToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
};
</script>

<style lang="less" scoped>
.go-to-top {
  position: fixed;
  bottom: 60px;
  right: 60px;
  z-index: 999;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-3px);
    
    .top-btn {
      background-color: #005fa3;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

.top-btn {
  width: 40px;
  height: 40px;
  background-color: #0079d3;
  color: #fff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  i {
    font-size: 20px;
  }
}
</style>
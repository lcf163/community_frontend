<template>
  <div class="vote-info-bar">
    <div class="vote-actions">
        <a class="vote">
          <span class="iconfont icon-up" @click="onVote(1)"></span>
        </a>
        <span class="vote-num">{{ voteNum || 0 }}点赞</span>
        <a class="vote">
          <span class="iconfont icon-down" @click="onVote(-1)"></span>
        </a>
        <span class="vote-num">点踩</span>
      </div>
  </div>
</template>

<script>
export default {
  name: 'VoteInfoBar',
  props: {
    author: String,
    time: String,
    voteNum: Number
  },
  methods: {
    onVote(type) {
      this.$emit('vote', type);
    }
  }
}
</script>

<style lang="less" scoped>
.vote-info-bar {
    .vote-actions {
      display: flex;
      align-items: center;
      margin-left: 0;
      
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
</style> 
<template>
	<div class="content">
		<div class="center">
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
					:page-sizes="PAGE_SIZES"
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange"
				/>
			</ul>
		</div>
		<div class="right">
			<div class="topic-info">
				<h5 class="t-header"></h5>
				<div class="t-info">
					<a class="avatar"></a>
					<span class="topic-name">社区名: {{ community.community_name }}</span>
					<span class="publish" @click="goPublish(community.community_id)">发表</span>
				</div>
				<p class="t-desc">社区简介：{{ community.introduction }}</p>
				<p class="t-create-time">创建于：{{ formatTime(community.create_time) }}</p>
			</div>
		</div>
	</div>
</template>
  
<script>
import PostList from '@/components/PostList.vue';
import PageBar from '@/components/PageBar.vue';
import { formatTime } from '@/utils/timeFormat';

const PAGE_SIZES = [5, 10];
const DEFAULT_PAGE_SIZE = PAGE_SIZES[0];

export default {
	name: "Community",
	components: {
		PostList,
		PageBar
	},
	data() {
		return {
			postList: [],
			pageTotal: {},
			community: {},
			pageNumber: 1,
			pageSize: DEFAULT_PAGE_SIZE,
			userId: ''
		}
	},
	computed: {
		PAGE_SIZES() {
			return PAGE_SIZES;
		}
	},
	mounted() {
		this.userId = localStorage.getItem('user_id');
		this.getCommunityDetail();
		this.getCommunityPostList();
	},
	methods: {
		handleCurrentChange(val) {
			this.pageNumber = val;
			this.getCommunityPostList();
		},
		handleSizeChange(val) {
			this.pageSize = val;
			this.getCommunityPostList();
		},
		getCommunityDetail() {
			this.$axios({
				method: "get",
				url: "/community/" + this.$route.params.id,
			})
			.then(response => {
				if (response.code == 1000) {
					this.community = response.data;
				} else {
					this.$message.error(response.message || '获取社区详情失败');
				}
			})
			.catch(error => {
				console.error("getCommunityDetail error:", error);
				this.$message.error('获取社区详情失败');
			});
		},
		getCommunityPostList() {
			this.$axios({
				method: "get",
				url: "/posts2",
				params: {
					community_id: this.$route.params.id,
					page: this.pageNumber,
					size: this.pageSize,
					order: 'time'
				}
			})
			.then(response => {
				if (response.code == 1000) {
					this.postList = response.data.list;
					this.pageTotal = response.data.page;
				} else {
					this.$message.error(response.message || '获取帖子列表失败');
				}
			})
			.catch(error => {
				console.error("getCommunityPostList error:", error);
				this.$message.error('获取帖子列表失败');
			});
		},
		goDetail(id) {
			this.$router.push({ name: "Content", params: { id: id } });
		},
		goPublish(id) {
			this.$router.push({ 
				name: "Publish", 
				params: { 
					id: id,
					communityInfo: this.community
				} 
			});
		},
		formatTime,
		handleVote({ postId, type }) {
			// 确保 postId 是数字类型
			const numericPostId = parseInt(postId, 10);
			if (isNaN(numericPostId)) {
				this.$message.error('无效的帖子ID');
				return;
			}

			this.$axios({
				method: "post",
				url: "/vote",
				data: {
					target_id: numericPostId,
					target_type: 1,
					direction: type
				}
			})
			.then(response => {
				if (response.code == 1000) {
					this.getCommunityPostList();
				} else {
					this.$message.error(response.message || '投票失败');
				}
			})
			.catch(error => {
				console.error("vote error:", error);
				this.$message.error('投票失败');
			});
		}
	}
};
</script>

<style lang="less" scoped>
.content {
	max-width: 1200px;
	margin: 0 auto;
	display: flex;
	justify-content: space-between;
	padding: 20px;
	gap: 24px;
	margin-top: 48px;

	.center {
		flex-grow: 1;
		max-width: 850px;
		
		.c-l-list {
			background-color: transparent;
			border: none;
			border-radius: 4px;
			
			.c-l-item {
				list-style: none;
				background-color: #ffffff;
				border: 1px solid #ccc;
				border-radius: 4px;
				margin-bottom: 16px;
				
				&:hover {
					background-color: rgba(0, 0, 0, 0.02);
				}
			}

			.pagination-block {
				padding: 16px;
				display: flex;
				justify-content: center;
				background-color: #ffffff;
				border: 1px solid #ccc;
				border-radius: 4px;
			}
		}
	}

	.right {
		flex-grow: 0;
		width: 312px;

		.topic-info {
			width: 100%;
			background-color: #ffffff;
			color: #1a1a1b;
			border: 1px solid #cccccc;
			border-radius: 4px;
			overflow: visible;
			word-wrap: break-word;
			padding-bottom: 30px;

			.t-header {
				width: 100%;
				height: 34px;
				background: #0079d3;
			}

			.t-info {
				padding: 0 12px;
				display: flex;
				display: -webkit-flex;
				width: 100%;
				height: 54px;
				align-items: center;

				.avatar {
					width: 54px;
					height: 54px;
					background: url("../assets/images/community.png") no-repeat;
					background-size: cover;
					margin-right: 10px;
				}

				.topic-name {
					height: 100%;
					line-height: 54px;
					font-size: 16px;
					font-weight: 500;
				}

				.publish {
					border: 1px solid rgb(31, 148, 237);
					margin-left: auto;
					margin-right: 20px;
					padding: 5px 15px;
					border-color: #0079d3;
					color: #0079d3;
					fill: #0079d3;
					border-radius: 4px;
					font-size: 12px;
				}
			}

			.t-desc,
			.t-create-time {
				font-family: Noto Sans, Arial, sans-serif;
				font-size: 14px;
				line-height: 21px;
				font-weight: 400;
				word-wrap: break-word;
				margin-bottom: 8px;
				padding: 0 12px;
			}

		}
	}
}
</style>
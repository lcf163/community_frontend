# Community Frontend

## 项目简介
Community Frontend 是一个基于 Vue.js 的现代前端应用程序，提供一个用户友好的社区平台。用户可以在平台上发布帖子、评论、投票，与其他用户进行互动。该项目采用组件化开发，支持响应式设计，适用于各种设备。

## 项目预览
![image](./src/assets/images/1.png)
![image](./src/assets/images/2.png)
![image](./src/assets/images/3.png)

## 技术栈
- **Vue.js 2.x**: 核心前端框架
- **Vue Router**: 路由管理
- **Vuex**: 状态管理
- **Element UI**: UI组件库
- **Axios**: HTTP 请求库
- **Less**: CSS 预处理器
- **Marked**: Markdown 解析器
- **Highlight.js**: 代码语法高亮

## 主要功能

- **用户认证**：
  - 用户注册、登录和登出
  - Token 基于 JWT 认证
  - 路由守卫保护
  - 用户信息修改（头像、用户名、密码）
  - 个人主页查看（包含用户发布的帖子列表）

- **帖子管理**：
  - 帖子编辑
    - 支持代码块语法高亮（支持多种编程语言）
    - 支持图片、链接等 Markdown 语法
  - 帖子的发布、编辑和删除
  - 帖子列表和详情页面
    - 分页加载
    - 按时间排序（最新）
    - 按分数排序（最热）
  - 帖子投票（点赞/点踩）
  - 多级评论
    - 评论的发布、编辑和删除
    - 评论的回复功能

- **社区管理**：
  - 社区列表展示
  - 热门社区排行
  - 社区详情页面
    - 社区简介
    - 社区创建时间
    - 社区内帖子列表
  - 按社区分类浏览帖子

- **搜索与排序**：
  - 帖子关键词搜索
  - 帖子排序功能
    - 时间排序
    - 热度排序（基于投票）

- **用户界面**：
  - 响应式布局设计
  - 用户交互优化
    - 顶部导航栏
    - 返回顶部按钮
    - 分页控制
  - 状态反馈
    - 加载状态提示
    - 操作成功/失败提示
    - 确认对话框
  - 统一的设计风格
    - Element UI 组件库
    - 自定义主题样式

## 项目结构
```
/src
  ├── api                 # API 相关
  │   ├── config.js       # API 配置
  │   ├── interceptors.js # 拦截器
  │   └── index.js        # API 实例
  ├── assets              # 静态资源目录
  ├── components          # 公共组件
  ├── views               # 页面视图
  ├── router              # 路由配置
  ├── store               # Vuex 状态管理
  ├── utils               # 工具函数
  │   ├── time            # 时间相关工具
  │   ├── user            # 用户相关工具
  │   └── index.js        # 工具函数统一导出
  ├── App.vue             # 根组件
  └── main.js             # 入口文件
```

## 安装
1. 克隆该项目：
```bash
git clone <项目地址>
```
2. 进入项目目录：
```bash
cd community_frontend
```
3. 安装依赖：
```bash
npm install
```

## 使用
- 启动开发服务器：
```bash
npm run serve
```
打开浏览器访问 `http://localhost:8080` 查看应用。

- 构建生产版本：
```bash
npm run build
```
生成的文件将位于 `/dist` 目录中。

- 代码检查和修复：
```bash
npm run lint
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 发起 Pull Request

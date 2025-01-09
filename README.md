# Bluebell Frontend

## 项目简介
Bluebell Frontend 是一个基于 Vue.js 的现代前端应用程序，旨在提供一个用户友好的社区平台。用户可以在平台上发布帖子、评论、投票，并与其他用户进行互动。该项目采用组件化开发，支持响应式设计，适用于各种设备。

## 技术栈
- **Vue.js 2.x**: 核心前端框架
- **Vue Router**: 路由管理
- **Vuex**: 状态管理
- **Element UI**: UI组件库
- **Axios**: HTTP 请求库
- **Less**: CSS 预处理器

## 主要功能
- **用户认证**：
  - 用户注册、登录和登出
  - Token 基于 JWT 认证
  - 路由守卫保护
- **帖子管理**：
  - 发布新帖子
  - 查看帖子列表和详情
  - 帖子评论功能
  - 帖子投票系统
  - 分页加载
- **社区功能**：
  - 热门社区排行
  - 社区分类浏览
- **搜索功能**：
  - 帖子搜索
- **排序功能**：
  - 按时间排序
  - 按分数排序
- **响应式设计**：适配多种设备屏幕

## 项目结构
```
/src
  ├── components      # 组件目录
  ├── views           # 页面视图
  ├── store           # Vuex 状态管理
  ├── router          # 路由配置
  ├── service         # API 服务
  └── assets          # 静态资源
```

## 安装
1. 克隆该项目：
   ```bash
   git clone <项目地址>
   ```
2. 进入项目目录：
   ```bash
   cd bluebell_frontend
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

 Bluebell Frontend

## 项目简介
Bluebell Frontend 是一个基于 Vue.js 的现代前端应用程序，旨在提供一个用户友好的社区平台。用户可以在平台上发布帖子、评论、投票，并与其他用户进行互动。该项目采用组件化开发，支持响应式设计，适用于各种设备。

## 主要功能
- **用户认证**：支持用户注册、登录和登出功能。
- **帖子管理**：用户可以发布新帖子、查看帖子详情、评论和投票。
- **社区功能**：用户可以选择不同的社区进行讨论，查看热门社区和帖子。
- **响应式设计**：应用程序在不同设备上均能良好显示，提供优质的用户体验。
- **状态管理**：使用 Vuex 进行全局状态管理，简化组件间的数据传递。
- **路由管理**：集成 Vue Router，实现单页面应用的路由管理。

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

## 贡献
欢迎任何形式的贡献！请提交问题或拉取请求，或直接联系项目维护者。

## 许可证
该项目遵循 MIT 许可证。

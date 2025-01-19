// API 基础配置
export const API_BASE_URL = 'http://localhost:8081';
export const AVATAR_BASE_URL = `${API_BASE_URL}/static/img/avatar`;

// 获取头像完整URL
export function getAvatarUrl(avatarName) {
  if (!avatarName) {
    // 修改默认头像的路径，使用后端提供的默认头像
    return `${API_BASE_URL}/static/img/default-avatar.png`;
  }
  // 如果已经是完整URL，直接返回
  if (avatarName.startsWith('http')) {
    return avatarName;
  }
  // 如果是相对路径，拼接完整URL
  return `${AVATAR_BASE_URL}/${avatarName}`;
}

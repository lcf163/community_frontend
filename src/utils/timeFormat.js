export function formatTime(timestamp) {
  if (!timestamp) return '';
  
  try {
    // 解析 ISO 8601 格式的时间字符串
    const date = new Date(timestamp);
    
    // 检查是否是有效的日期
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // 获取本地时间各个部分
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('时间格式化错误:', error);
    return '';
  }
}

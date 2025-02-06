module.exports = {
    assetsDir: "static",
    productionSourceMap: false,
    
    // 开发环境配置
    devServer: {
        proxy: {
            '/api/v1': {
                target: process.env.VUE_APP_API_BASE_URL,
                changeOrigin: true,
            }
        },
        // historyApiFallback: true  // 开发环境支持 history 模式
    },

    // 生产环境配置
    publicPath: process.env.NODE_ENV === 'production'
        ? '/'  // 生产环境路径
        : '/', // 开发环境路径
}

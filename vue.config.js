const proxyTable = {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true
  },
}

module.exports = {
  devServer: {
    proxy: proxyTable,
    port: 8080
  }
}
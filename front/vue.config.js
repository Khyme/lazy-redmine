const proxyTable = {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true
  },
}

module.exports = {
  devServer: {
    proxy: proxyTable,
    port: 8080,
		watchOptions: {
      poll: true
		}
  },
  css: {
	requireModuleExtension: false,
    loaderOptions: {
      // by default the `sass` option will apply to both syntaxes
      // because `scss` syntax is also processed by sass-loader underlyingly
      // but when configuring the `data` option
      // `scss` syntax requires an semicolon at the end of a statement, while `sass` syntax requires none
      // in that case, we can target the `scss` syntax separately using the `scss` option
      scss: {
        prependData: `@import "~@/variables.scss";`,
      }
    }
  }
}
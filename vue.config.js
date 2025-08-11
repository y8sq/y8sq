const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  lintOnSave: false,
  transpileDependencies: true,
  devServer: {
    open: false, // 自动打开浏览器
    port: 12382,
  },
  publicPath: "/y8sq/",
});

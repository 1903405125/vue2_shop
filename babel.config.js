// 这是项目发布阶段需要用到的babel插件
const prodPlugins = []
// 如果process.env.NODE_ENV全等于production则说明处于生产阶段，因此将transform-remove-console加入进行使用，去除所有的console语句
if (process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}



module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    // 发布产品时候的插件数组
    ...prodPlugins,
    '@babel/plugin-syntax-dynamic-import'
  ]
}

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入阿里字体图标库，可以与element-ui搭配使用
import './assets/fonts/iconfont.css'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import TreeTable from 'vue-table-with-tree-grid'
Vue.config.productionTip = false

import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
// 导入axios，并存到Vue的原型库上的$http，这样所有组件就都可以用到了
import axios from 'axios'

// 配置请求的根路径，这样就不用每次都写了
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'

// 在request拦截器中，展示进度条 NProgress.start()
// 配置axios请求拦截器，在每次发起请求的时候为请求头对象添加token验证所需要的Authorization字段
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 必须将config返回，固定写法
  return config
})

// 在response拦截器中，隐藏进度条 NProgress.done()
axios.interceptors.response.use(config=>{
  NProgress.done()
  return config
})

Vue.prototype.$http = axios 
Vue.component('tree-table',TreeTable)
// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor)

// 一个用于转换时间戳的全局过滤器
Vue.filter('dateFormat', function(originVal) {
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

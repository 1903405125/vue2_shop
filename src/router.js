import Vue from "vue";
import Router from "vue-router";

// import Login from './components/Login.vue'
const UserLogin = () => import(/* webpackChunkName: "login_home_welcome" */ './components/UserLogin')
// import Home from './components/Home.vue'
const MyHome = () => import(/* webpackChunkName: "login_home_welcome" */ './components/MyHome')
// import Welcome from './components/Welcome.vue'
const WelcomeBack = () => import(/* webpackChunkName: "login_home_welcome" */ './components/WelcomeBack')

// import Users from './components/user/Users.vue'
const UserList = () => import(/* webpackChunkName: "Users_Rights_Roles" */ './components/user/UserList.vue')
// import Rights from './components/power/Rights.vue'
const MyRights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ './components/power/MyRights')
// import Roles from './components/power/Roles.vue'
const MyRoles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ './components/power/MyRoles.vue')

// import Cate from './components/goods/Cate.vue'
const GoodsCate = () => import(/* webpackChunkName: "Cate_Params" */ './components/goods/GoodsCate.vue')
// import Params from './components/goods/Params.vue'
const GoodsParams = () => import(/* webpackChunkName: "Cate_Params" */ './components/goods/GoodsParams.vue')

// import GoodsList from './components/goods/List.vue'
const GoodsList = () => import(/* webpackChunkName: "GoodsList_Add" */ './components/goods/GoodsList.vue')
// import Add from './components/goods/Add.vue'
const GoodsAdd = () => import(/* webpackChunkName: "GoodsList_Add" */ './components/goods/GoodsAdd.vue')

// import Order from './components/order/Order.vue'
const MyOrder = () => import(/* webpackChunkName: "Order_Report" */ './components/order/MyOrder.vue')
// import Report from './components/report/Report.vue'
const MyReport = () => import(/* webpackChunkName: "Order_Report" */ './components/report/MyReport.vue')
Vue.use(Router);

const router = new Router({
  routes: [
    // '/'路径重定位，默认访问的就是/login
    { path: "/", redirect: "/login" },
    { path: "/login", component: UserLogin },
    {
      path: "/home",
      component: MyHome,
      // '/home'重定位，只要用户访问了主页，那么默认就呈现欢迎组件
      redirect: "/welcome",
      children: [
        { path: "/welcome", component: WelcomeBack },
        { path: "/users", component: UserList },
        {path:'/rights',component:MyRights},
        {path:'/roles',component:MyRoles},
        {path:'/categories',component:GoodsCate},
        {path:'/params',component:GoodsParams},
        {path:'/goods',component:GoodsList},
        {path:'/goods/add',component:GoodsAdd},
        {path:'/orders',component:MyOrder},
        {path:'/reports',component:MyReport}
      ] 
      
    },
  ],
});
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //     next()  放行    next('/login')  强制跳转
  if (to.path === "/login") return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem("token");
  if (!tokenStr) return next("/login");
  next();
});

export default router;

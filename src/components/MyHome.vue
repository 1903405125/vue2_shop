<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <!-- 侧边栏的宽度会随着菜单的折叠而减小 -->
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区域 -->
        <!-- unique-opened是“是否只保持一个子菜单的展开”, collapse是“是否水平折叠收起菜单”，collapse-transition是“是否开启折叠动画	”，router是“是否使用 vue-router 的模式，启用该模式会在激活导航时以 index 作为 path 进行路由跳转，直接写上router即代表router=true”，default-active	是“设置当前 index 的菜单处于激活状态	”-->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <!-- :index是一级菜单的一个唯一标识符，相同的index在菜单触发时会同时触发，而+ ''是为了让值变成字符串 -->
          <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id" >
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <!-- 将index的值设置为每个二级菜单的path,搭配el-menu的router属性进行使用 -->
              <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                <template slot="title">
                  <div>
                    <!-- 图标 -->
                    <i class="el-icon-menu"></i>
                    <!-- 文本 -->
                    <span>{{subItem.authName}}</span>
                  </div>
                </template>
              </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: "MyHome",
  data() {
    return {
      menuList:[],
      // 将对应的二级菜单id所对应的字体图标进行存储，遍历的时候继续引用即可
      iconsObj:{
        '125':'iconfont icon-user',
        '103':'iconfont icon-tijikongjian',
        '101':'iconfont icon-shangpin',
        '102':'iconfont icon-danju',
        '145':'iconfont icon-baobiao',
      },
      // 是否折叠
      isCollapse:false,
      // 被激活的菜单地址，默认为空
      activePath:''
    }
  },
  methods: {
    logout() {
      // 当点击了退出按钮后，清空token，并跳转到登录页面
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    // 获取所有的菜单的执行函数
    async getMenuList(){
      const {data:res} = await this.$http.get('menus')
      if(res.meta.status !== 200) return this.$message.error(res.meta.error)
      this.menuList = res.data
    },
    // 菜单的折叠与展开
    toggleCollapse(){
      this.isCollapse = !this.isCollapse
    },
    // 改变激活的菜单的路径
    saveNavState(activePath){
      // 在每次点击二级菜单后将路径值保存至本地存储
      window.sessionStorage.setItem('activePath',activePath)
      // 在每次点击二级菜单后将被激活的菜单地址值进行设定
      this.activePath = activePath
    }
  },
  created(){
    // 通过钩子在创建之前先调用getMenuList方法获取到所有菜单的列表
    this.getMenuList()
    // 通过钩子在创建之前将激活菜单的路径设置浏览器本地存储的值
    this.activePath = window.sessionStorage.getItem('activePath')
  }
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  // 消除二级菜单右边框突出问题
  .el-menu{
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

// .iconfont是每个一级菜单内的图标自带的样式
.iconfont{
  margin-right: 8px;
}

.toggle-button{
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
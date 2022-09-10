<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" type="info" show-icon :closable="false">
      </el-alert>

      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <!-- 用一个el-form来进行包裹，方便数据的交互和表单元素的使用 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                expand-trigger="hover"
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateProps"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <!-- 复选框组 -->
              <!-- v-model的值可以让el-checkbox进行使用 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="cb"
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"> </el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <!-- 上面这个:headers的作用是在请求接口上传图片时带上配置好的请求头对象 -->
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览的对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewVisible"
      width="50%"

    >
        <img :src="previewPath" class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
    // 导入lodash来实现深拷贝
import _ from 'lodash'

export default {
  name: "GoodsAdd",
  data() {
    return {
        // 预览图片对话框是否可见
        previewVisible:false,
      // 预览图片的一个路径
      previewPath: "",
      headerObj: {
        Authorization: window.sessionStorage.getItem("token"),
      },
      // 上传图片的URL地址
      uploadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 静态属性列表数据
      onlyTableData: [],
      // 动态参数列表数据
      manyTableData: [],
      //  商品分类级联选择器的规则
      cateProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      // 商品分类列表
      catelist: [],
      // 步骤条所必需的响应式索引值
      activeIndex: 0,
      // 添加商品的表单数据对象
      addForm: {
        goods_name: "",
        goods_price: 1,
        goods_weight: 1,
        goods_number: 1,
        // 商品所属的分类数组
        goods_cat: [],
        // 商品图片的临时路径地址数组
        pics: [],
        // 商品的详情描述
        goods_introduce:'',
        // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
        attrs:[],
      },
      // 添加商品的表单数据验证对象
      addFormRules: {
        goods_name: [
          {
            required: true,
            message: "请输入商品名称",
            trigger: "blur",
          },
        ],
        goods_price: [
          {
            required: true,
            message: "请输入商品价格",
            trigger: "blur",
          },
        ],
        goods_weight: [
          {
            required: true,
            message: "请输入商品重量",
            trigger: "blur",
          },
        ],
        goods_number: [
          {
            required: true,
            message: "请输入商品数量",
            trigger: "blur",
          },
        ],
        goods_cat: [
          {
            required: true,
            message: "请选择商品分类",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 添加商品
    add(){
        // 再次校验数据
        this.$refs.addFormRef.validate(async valid=>{
            if(!valid){
                return this.$message.error('请填写必要的表单项！')
            }
            // 执行添加的业务逻辑
            // 处理商品分类级别：通过lodash包的cloneDeep(obj)深拷贝一份表单数据出来，然后通过该新的表单数据进行修改，这样就不会影响原数据了
            const form = _.cloneDeep(this.addForm)
            form.goods_cat = form.goods_cat.join(',')
            // 处理动态参数
            this.manyTableData.forEach(item=>{
                const newInfo = {
                    attr_id:item.attr_id,
                    attr_value:item.attr_vals.join('')
                }
                this.addForm.attrs.push(newInfo)
            })
            // 处理静态属性
            this.onlyTableData.forEach(item=>{
                const newInfo = {attr_id:item.attr_id,attr_value:item.attr_vals}
                this.addForm.attrs.push(newInfo)
            })
            form.attrs = this.addForm.attrs
            // 发起请求添加商品
            // 商品的名称，必须是唯一的
            const {data:res} = await this.$http.post('goods',form)
            console.log(res)
            console.log(form)
            if(res.meta.status !== 201){
                return this.$message.error('添加商品失败！')
            }
            this.$message.success('添加商品成功！')
            this.$router.push('/goods')
        })
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // 1. 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      // 2. 将图片信息对象，push到pics数组中
      this.addForm.pics.push(picInfo);
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2. 从pics数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex((x) => x.pic === filePath);
      // 3. 调用数组的splice方法，把图片信息对象，从pics数组中移除
      this.addForm.pics.splice(i, 1);
      console.log(this.addForm);
    },
    // 处理图片预览效果
    handlePreview(file) {
      // 将点击到的图片的路径存储到响应式数据中
      this.previewPath = file.response.data.url;
      this.previewVisible = true
    },
    async tabClicked() {
      // 证明访问的是动态参数面板
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败！");
        }
        // 获取成功
        // 在绑定前，依旧通过遍历将每个商品分类的attr_vals参数字符串转换为数组
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(",");
        });
        // 绑定响应式数据
        this.manyTableData = res.data;
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取静态属性列表失败！");
        }
        this.onlyTableData = res.data;
      }
    },
    // 在第一个页签要进入其他页签时，先判断是否已经选择了商品分类，没选择不让切换
    beforeTabLeave(activeName, oldActiveName) {
      if (
        oldActiveName === "0" &&
        this.addForm.goods_cat.length !== 3 &&
        this.addForm.goods_cat.length !== 2
      ) {
        this.$message.error("清先选择商品分类！");
        return false;
      }
    },
    // 获取所有商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败！");
      }

      this.catelist = res.data;
    },
  },
  computed: {
    // 实时获取到商品分类的id，主要用于接口参数
    cateId() {
      if (this.addForm.goods_cat.length > 1) {
        return this.addForm.goods_cat[this.addForm.goods_cat.length - 1];
      }
      return null;
    },
  },
};
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.previewImg{
    width: 100%;
}
.btnAdd{
    margin-top: 15px;
}
</style>

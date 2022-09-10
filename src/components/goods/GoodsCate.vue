<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 tree-table是第三方库的 -->
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
        class="treeTable"
      >
        <!-- 是否有效 -->
        <template slot-scope="scope" slot="isok">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot-scope="scope" slot="order">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            type="success"
            size="mini"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag
            type="warning"
            size="mini"
            v-else-if="scope.row.cat_level === 2"
            >三级</el-tag
          >
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-deit"
            size="mini"
            @click="showEditCateDialog(scope.row.cat_name, scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleteCate(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options用来指定数据源 -->
          <!-- props用来指定配置对象 -->
          <!-- v-model所绑定的对象必须是一个数组 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 取消与确定按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑商品分类的对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="cate"
        :rules="cateRules"
        ref="editCateRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="name">
          <el-input v-model="cate.name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部取消与确认区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "GoodsCate",
  data() {
    return {
      // 编辑商品分类的规则
      cateRules: {
        name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 存放编辑商品分类的
      cate: {
        id:0,
        name:''
      },
      // 编辑商品分类对话框是否可见
      editCateDialogVisible: false,
      // 选中的父级分类的Id数组
      selectedKeys: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        expandTrigger: "hover",
      },
      // 父级分类的列表
      parentCateList: [],
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类的名称
        cat_name: "",
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0,
      },
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          // 表示，将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "isok",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "opt",
        },
      ],
      // 总数据条数
      total: 0,
      // 查询商品分类数据的参数
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类的数据列表，默认为空
      catelist: [],
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 删除商品分类
    async deleteCate(id){
        // 先弹窗询问用户是否确定删除数据
        const confirmResult = await this.$confirm(
        "此操作将永久删除该分类，是否继续？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
        // 要通过catch对本次Promise的结果进行捕获，否则报错
      ).catch((err) => err);

      // 备注：
      // 如果用户确定删除，则返回值为字符串confirm
      // 如果用户取消了删除，则返回值为字符串cancel
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除");
      } else {
        // 用户确认，发起请求进行删除
        const {data:res} = await this.$http.delete(`categories/${id}`)
        if(res.meta.status !== 200){
          return this.$message.error("删除分类失败！");
        }
        this.$message.success("删除分类成功！");
        this.getCateList();
      }
    },
    // 编辑商品分类
    editCate(){
      // 再次校验数据
      this.$refs.editCateRef.validate(async (valid) => {
        if (!valid) return;
        // 数据没问题，发起请求
       const {data:res} =  await this.$http.put(`categories/${this.cate.id}`,{cat_name:this.cate.name})
        if(res.meta.status !== 200){
          console.log(res)
          return this.$message.error("编辑分类失败！");
        }
        this.getCateList()
        this.editCateDialogVisible = false
        return this.$message.success("编辑分类成功！")
      })
    },
    // 点击编辑按钮之后的函数
    showEditCateDialog(name,id) {
      this.cate.id = id
      this.cate.name = name;
      this.editCateDialogVisible = true;
    },
    // 监听对话框的关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加分类失败！");
        }
        this.$message.success("添加分类成功！");
        this.getCateList();
        this.addCateDialogVisible = false;
      });
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      // 如果 selectedKeys 数组中的 length 大于0，证明选中了父级分类
      // 反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的Id
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1];
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length;
        return;
      } else {
        // 父级分类的Id
        this.addCateForm.cat_pid = 0;
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = 0;
      }
    },

    // 获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败！");
      }
      // 获取成功，将值存到数组中
      this.parentCateList = res.data;
    },
    // 点击按钮，展示添加分类的对话框
    showAddCateDialog() {
      // 在展示对话框之前先把商品分类的数据列表给获取一下
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.querInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }
      // 获取成功，把数据赋值给catelist 和 total
      this.catelist = res.data.result;
      this.total = res.data.total;
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage;
      this.getCateList();
    },
  },
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>

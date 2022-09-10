<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片试图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRolesVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列，直接在索引列前面设置即可 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 通过遍历来渲染1、2、3级权限 -->
            <!-- 并且动态指定class -->
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 依旧通过for循环来嵌套渲染二级权限 -->
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <!-- 绑定closable来使得标签带有删除标志，绑定close响应函数来真正完成删除功能 -->
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      >{{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作"  width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-deit"
              @click="getRoles(scope.row)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRoles(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addRolesVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="addForm"
        :rules="addRolesRules"
        ref="addRolesRef"
        label-width="70px"
      >
        <el-form-item label="角色名称" prop="roleName" label-width="80px">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" label-width="80px">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户的对话框 -->
    <el-dialog
      title="编辑用户"
      :visible.sync="editRolesVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        :model="editForm"
        :rules="editRolesRules"
        ref="editRolesRef"
        label-width="70px"
      >
        <el-form-item label="角色ID" label-width="80px">
          <el-input v-model="editForm.roleId" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色名称" prop="roleName" label-width="80px">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc" label-width="80px">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
    <!-- 树形控件 -->
    <!-- show-checkbox让每个树节点前面都有一个复选框，node-key：	每个树节点用来作为唯一标识的属性，整棵树应该是唯一的，default-expand-all是否默认展开所有节点，default-checked-keys：默认勾选的节点的 key 的数组	 -->
    <el-tree show-checkbox node-key="id" :data="rightslist" :props="treeProps" :default-expand-all="true"
    :default-checked-keys="defKeys"
    ref="treeRef"
     ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "MyRoles",
  data() {
    return {
      // 角色列表数据
      rolelist: [],
      // 控制添加用户对话框的显示与隐藏
      addRolesVisible: false,
      // 控制编辑用户对话框的显示与隐藏
      editRolesVisible: false,
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible:false,
      // 添加角色的表单数据
      addForm: {
        roleName: "",
        roleDesc: "",
      },
      // 添加表单的验证规则对象
      addRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "角色名的长度在3~10个字符之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "角色描述的长度在6~15个字符之间",
            trigger: "blur",
          },
        ],
      },
      // 编辑角色的表单数据
      editForm: {
        roleId: "",
        roleName: "",
        roleDesc: "",
      },
      // 编辑表单的验证规则对象
      editRolesRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "角色名的长度在3~10个字符之间",
            trigger: "blur",
          },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "角色描述的长度在6~15个字符之间",
            trigger: "blur",
          },
        ],
      },
      // 所有权限的数据
      rightslist:[],
      // 树形控件的属性绑定对象
      treeProps:{
        // 后端传过来的数据格式正好符合要求，直接使用即可
        label:'authName',
        children:'children'
      },
      // 默认选中的节点Id值数组
      defKeys:[],
      // 当前即将分配权限的角色id
      roleId:''
    };
  },
  // 在初始化时就调用获取权限列表的函数
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      // 发起请求
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200)
        return this.$message.error("获取角色列表失败！");
      this.rolelist = res.data;
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      // 关闭之后，重置下对话框内的输入框
      this.$refs.addRolesRef.resetFields();
    },
    // 添加角色
    addRoles() {
      // 再次校验数据
      this.$refs.addRolesRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addForm);
        if (res.meta.status !== 201) {
          this.$message.error("添加角色失败！");
        }
        this.$message.success("添加角色成功！");
        this.addRolesVisible = false;
        this.getRolesList();
      });
    },
    // 获取要编辑的角色信息
    getRoles(Roles) {
      // 弹出对话框
      this.editRolesVisible = true;
      // 然后同步更新editRoles对象的数据
      this.editForm.roleId = Roles.id;
      this.editForm.roleName = Roles.roleName;
      this.editForm.roleDesc = Roles.roleDesc;
    },
    // 监听添加用户对话框的关闭事件
    editDialogClosed() {
      // 关闭之后，重置下对话框内的输入框
      this.$refs.editRolesRef.resetFields();
    },
    // 编辑角色
    editRoles() {
      // 再次校验数据
      this.$refs.editRolesRef.validate(async (valid) => {
        if (!valid) return;
        // 数据通过，开始发起请求
        const { data: res } = await this.$http.put(
          `roles/` + this.editForm.roleId,
          this.editForm
        );
        if (res.meta.status !== 200) {
          this.$message.error("编辑角色失败！");
        }
        this.$message.success("编辑角色成功！");
        this.editRolesVisible = false;
        this.getRolesList();
      });
    },
    async deleteRoles(id) {
      // 先弹窗询问用户是否确定删除数据
      const confirmResult = await this.$confirm(
        "此操作将永久删除该角色，是否继续？",
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
        // 用户确定删除，那么发起请求
        const { data: res } = await this.$http.delete("roles/" + id);
        // 判断结果
        if (res.meta.status !== 200) {
          return this.$message.error("删除角色失败！");
        }

        this.$message.success("删除角色成功！");
        this.getRolesList();
      }
    },
    // 根据Id删除对应的权限
    async removeRightById(role, id) {
      // 先弹窗询问用户是否确定删除数据
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限，是否继续？",
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
        // 用户确定删除，那么发起请求
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${id}`
        );
        if (res.meta.status !== 200) {
          return this.$message.error("删除权限失败！");
        }
        // 此处利用了浅拷贝，这样就不会解析整个页面，只会是局部刷新
        role.children = res.data;
      }
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role){
      this.roleId = role.id
      // 获取所有权限的数据
      const {data:res} = await this.$http.get('rights/tree')

      if(res.meta.status !== 200){
        return this.$message.error('获取权限数据失败！')
      }

      this.rightslist = res.data
      // 递归获取三级节点的Id
      this.getLeafKeys(role,this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys(node,arr){
      // 如果当前node节点不包含children属性，则是三级节点
      if(!node.children){
        return arr.push(node.id)
      }

      node.children.forEach(item => {
        this.getLeafKeys(item,arr)
        
      })
    },
    // 每次关闭树形对话框时就重置默认节点
    setRightDialogClosed(){
      this.defKeys = []
    },
    // 点击为角色分配权限
    async allotRights(){
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      // 将数组转换为字符串
      const idStr = keys.join(',')
      // 发起请求
       const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
       if(res.meta.status !== 200){
        return this.$message.error('分配权限失败！')
       }

       this.$message.success('分配权限成功！')
       this.getRolesList()
       this.setRightDialogVisible = false
    }
  },
};
</script>

<style lang="less" scope>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>

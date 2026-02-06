<template>
  <div class="box_bg">
    <div class="app_container">
      <!-- 顶部区域 -->
      <header class="header">
        <div class="logo">
          <h1>数据管理</h1>
          <p>管理所有导航数据</p>
        </div>
        <div class="back_to_home">
          <button class="back_btn" @click="goBack">
            <i class="fa fa-home" aria-hidden="true"></i> 返回首页
          </button>
        </div>
      </header>

      <!-- 主要内容区域 -->
      <main class="main_content">
        <!-- 数据管理操作区 -->
        <div class="manage_actions">
          <div class="action_buttons">
            <button class="add_data_btn" @click="openAddModal('category')">
              <i class="fa fa-plus" aria-hidden="true"></i> 新增分类
            </button>
            <button class="import_btn" @click="triggerFileInput">
              <i class="fa fa-upload" aria-hidden="true"></i> 导入数据
            </button>
            <button class="sort_btn" @click="sortAllData">
              <i class="fa fa-sort-amount-asc" aria-hidden="true"></i> 排序数据
            </button>
            <input
              type="file"
              ref="fileInput"
              class="file_input"
              accept=".json"
              @change="importData"
            />
          </div>
          <div class="export_buttons">
            <button class="export_btn" @click="exportData('json')">
              <i class="fa fa-download" aria-hidden="true"></i> 导出JSON
            </button>
          </div>
        </div>

        <!-- 分类列表 -->
        <div class="category_list">
          <div
            v-for="(category, catIndex) in sortedCategories"
            :key="catIndex"
            class="category_card"
            :class="{
              'sortable-category': !isCommonCategory(category),
              'non-sortable-category': isCommonCategory(category),
            }"
          >
            <!-- 分类标题和操作 -->
            <div class="category_header">
              <div class="category_title">
                <span
                  :class="{
                    'sort-value': !isCommonCategory(category),
                    'non-sort-value': isCommonCategory(category),
                  }"
                >
                  {{ category.sort || 0 }}
                  <i
                    v-if="isCommonCategory(category)"
                    class="fa fa-lock"
                    aria-hidden="true"
                  ></i>
                  <i v-else class="fa fa-arrows" aria-hidden="true"></i>
                </span>
                <h2>{{ category.category }}</h2>
                <span class="count">{{ category.sites.length }}</span>
              </div>
              <div class="category_actions">
                <button
                  class="move-btn"
                  @click="moveCategoryUp(catIndex)"
                  :disabled="catIndex === 0 || isCommonCategory(category)"
                  :title="
                    isCommonCategory(category)
                      ? '常用导航分类无法调整排序'
                      : '上移分类'
                  "
                >
                  <i class="fa fa-arrow-up" aria-hidden="true"></i> 上移
                </button>
                <button
                  class="move-btn"
                  @click="moveCategoryDown(catIndex)"
                  :disabled="
                    catIndex === navigationData.length - 1 ||
                    isCommonCategory(category)
                  "
                  :title="
                    isCommonCategory(category)
                      ? '常用导航分类无法调整排序'
                      : '下移分类'
                  "
                >
                  <i class="fa fa-arrow-down" aria-hidden="true"></i> 下移
                </button>
                <button
                  class="edit_btn"
                  @click="editCategory(category, catIndex)"
                  :disabled="isCommonCategory(category)"
                  :title="
                    isCommonCategory(category)
                      ? '常用导航分类无法编辑'
                      : '编辑分类'
                  "
                >
                  <i class="fa fa-pencil" aria-hidden="true"></i> 编辑分类
                </button>
                <button
                  class="delete_btn"
                  @click="deleteCategory(catIndex)"
                  :disabled="isCommonCategory(category)"
                  :title="
                    isCommonCategory(category)
                      ? '常用导航分类无法删除'
                      : '删除分类'
                  "
                >
                  <i class="fa fa-trash" aria-hidden="true"></i> 删除分类
                </button>
              </div>
            </div>

            <!-- 网站列表 -->
            <div class="site_manage_list">
              <table class="site_table">
                <thead>
                  <tr>
                    <th style="width: 80px;">排序</th>
                    <th style="width: 60px;">图标</th>
                    <th style="width: 200px;">网站名称</th>
                    <th style="width: 400px;">网站地址</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(site, siteIndex) in category.sites"
                    :key="siteIndex"
                    :class="{
                      'sortable-row':
                        !isCommonCategory(category) && !site.protected,
                      'non-sortable-row':
                        isCommonCategory(category) || site.protected,
                      'selected-row':
                        selectedRow.categoryIndex === catIndex &&
                        selectedRow.siteIndex === siteIndex,
                    }"
                    @click="selectRow(catIndex, siteIndex)"
                  >
                    <td>
                      <span
                        :class="{
                          'sort-value':
                            !isCommonCategory(category) && !site.protected,
                          'non-sort-value':
                            isCommonCategory(category) || site.protected,
                        }"
                      >
                        {{ site.sort || 0 }}
                        <i
                          v-if="isCommonCategory(category)"
                          class="fa fa-lock"
                          aria-hidden="true"
                        ></i>
                        <i
                          v-else-if="site.protected"
                          class="fa fa-shield"
                          aria-hidden="true"
                        ></i>
                        <i v-else class="fa fa-arrows" aria-hidden="true"></i>
                      </span>
                    </td>
                    <td class="icon_column">
                      <img :src="`${site.icon}`" :alt="site.name" class="site_icon" />
                    </td>
                    <td class="site_name_column">{{ site.name }}</td>
                    <td class="site_url_column">
                      <a :href="site.url" target="_blank">{{ site.url }}</a>
                    </td>
                    <td class="action_column">
                      <button
                        class="move-btn"
                        @click="moveSiteUp(category, siteIndex)"
                        :disabled="
                          siteIndex === 0 ||
                          isCommonCategory(category) ||
                          site.protected
                        "
                        :title="getUpButtonTitle(category, site)"
                      >
                        <i class="fa fa-arrow-up" aria-hidden="true"></i> 上移
                      </button>
                      <button
                        class="move-btn"
                        @click="moveSiteDown(category, siteIndex)"
                        :disabled="
                          siteIndex === category.sites.length - 1 ||
                          isCommonCategory(category) ||
                          site.protected
                        "
                        :title="getDownButtonTitle(category, site)"
                      >
                        <i class="fa fa-arrow-down" aria-hidden="true"></i> 下移
                      </button>
                      <button
                        class="edit_btn"
                        @click="editSite(category, site, siteIndex)"
                        :disabled="isCommonCategory(category) || site.protected"
                        :title="getEditButtonTitle(category, site)"
                      >
                        <i class="fa fa-pencil" aria-hidden="true"></i> 编辑
                      </button>
                      <button
                        class="delete_btn"
                        @click="deleteSite(category, siteIndex)"
                        :disabled="isCommonCategory(category) || site.protected"
                        :title="getDeleteButtonTitle(category, site)"
                      >
                        <i class="fa fa-trash" aria-hidden="true"></i> 删除
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="category.sites.length === 0" class="empty_sites">
                <i class="fa fa-info-circle" aria-hidden="true"></i>
                <span>该分类下暂无网站</span>
              </div>
            </div>

            <!-- 新增网站按钮 -->
            <div class="add_site_container">
              <button class="add_site_btn" @click="addSiteToCategory(category)">
                <i class="fa fa-plus" aria-hidden="true"></i> 新增网站
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div class="modal" v-if="showModal">
      <div class="modal_backdrop" @click="closeModal"></div>
      <div class="modal_content">
        <div class="modal_header">
          <h3>{{ modalTitle }}</h3>
          <button class="close_btn" @click="closeModal">
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div class="modal_body">
          <form @submit.prevent="submitForm" class="data_form">
            <!-- 分类名称 -->
            <div class="form_group" v-if="modalType !== 'site'">
              <label for="categoryName">分类名称</label>
              <input
                type="text"
                id="categoryName"
                v-model="formData.category"
                placeholder="请输入分类名称"
                required
              />
            </div>

            <!-- 网站信息（新增网站或编辑网站时显示） -->
            <div v-if="modalType === 'site'">
              <div class="form_group">
                <label for="siteName">网站名称</label>
                <input
                  type="text"
                  id="siteName"
                  v-model="formData.name"
                  placeholder="请输入网站名称"
                  required
                />
              </div>
              <div class="form_group">
                <label for="siteUrl">网站地址</label>
                <input
                  type="url"
                  id="siteUrl"
                  v-model="formData.url"
                  placeholder="请输入网站地址"
                  required
                />
              </div>
              <div class="form_group">
                <label for="siteIcon">图标名称</label>
                <input
                  type="text"
                  id="siteIcon"
                  v-model="formData.icon"
                  placeholder="请输入图标文件名（如：baidu_27.png）"
                  required
                />
              </div>
              <div class="form_group">
                <label for="siteSort">排序值</label>
                <input
                  type="number"
                  id="siteSort"
                  v-model.number="formData.sort"
                  placeholder="请输入排序值（数字越小，排序越靠前）"
                  min="0"
                  step="1"
                  required
                />
              </div>
            </div>

            <div class="form_actions">
              <button type="button" class="cancel_btn" @click="closeModal">
                取消
              </button>
              <button type="submit" class="submit_btn">
                {{ submitBtnText }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 提示消息 -->
    <div class="toast" v-if="toast.show" :class="toast.type">
      <i :class="toast.icon" aria-hidden="true"></i>
      <span>{{ toast.message }}</span>
    </div>

    <!-- 自定义确认对话框 -->
    <div class="confirm-dialog" v-if="showConfirmDialog">
      <div class="confirm-backdrop" @click="handleConfirmCancel"></div>
      <div class="confirm-content">
        <div class="confirm-header">
          <h3>{{ confirmConfig.title }}</h3>
        </div>
        <div class="confirm-body">
          <div class="confirm-message">{{ confirmConfig.message }}</div>
        </div>
        <div class="confirm-footer">
          <button class="btn-cancel" @click="handleConfirmCancel">
            {{ confirmConfig.cancelText || "取消" }}
          </button>
          <button class="btn-confirm" @click="handleConfirmOk">
            {{ confirmConfig.confirmText || "确认" }}
          </button>
        </div>
      </div>
    </div>

    <!-- 滚动到顶部按钮 -->
    <button
      v-if="showScrollTop"
      class="scroll-top-btn"
      @click="scrollToTop"
      title="滚动到顶部"
    >
      <i class="fa fa-arrow-up" aria-hidden="true"></i>
    </button>
  </div>
</template>

<script>
export default {
  name: "ManagePage",
  data() {
    return {
      navigationData: [],
      showModal: false,
      modalType: null, // 'category' or 'site'
      modalTitle: "",
      submitBtnText: "",
      editingItem: null,
      formData: {
        category: "",
        name: "",
        url: "",
        icon: "",
        sort: 0,
      },
      // 选中行数据，用于键盘快捷键
      selectedRow: {
        categoryIndex: -1,
        siteIndex: -1,
      },
      // 提示消息
      toast: {
        show: false,
        message: "",
        type: "success", // success, error, warning
        icon: "fa fa-check",
      },
      // 自定义确认对话框
      showConfirmDialog: false,
      confirmConfig: {
        title: "确认操作",
        message: "确定要执行此操作吗？",
        confirmText: "确认",
        cancelText: "取消",
        onConfirm: null,
        onCancel: null,
      },
      // 滚动到顶部按钮
      showScrollTop: false,
    };
  },
  mounted() {
    // 从localStorage加载数据
    this.loadData();

    // 添加键盘事件监听器
    window.addEventListener("keydown", this.handleKeyDown);
    // 添加滚动事件监听器
    window.addEventListener("scroll", this.handleScroll);
  },

  beforeDestroy() {
    // 移除键盘事件监听器
    window.removeEventListener("keydown", this.handleKeyDown);
    // 移除滚动事件监听器
    window.removeEventListener("scroll", this.handleScroll);
  },
  computed: {
    // 排序后的分类列表
    sortedCategories() {
      return [...this.navigationData].sort((a, b) => {
        const sortA = a.sort || 9999;
        const sortB = b.sort || 9999;
        return sortA - sortB;
      });
    },
    
    // 判断是否是常用导航分类
    isCommonCategory() {
      return (category) => category && category.category === "常用导航";
    },

    // 获取禁用状态
    getDisabledState() {
      return (category, site) => {
        if (this.isCommonCategory(category)) return true;
        if (site.protected) return true;
        return false;
      };
    },

    // 获取上移按钮提示
    getUpButtonTitle() {
      return (category, site) => {
        if (this.isCommonCategory(category)) return "常用导航项目无法调整排序";
        if (site.protected) return "受保护项目无法调整排序";
        return "上移";
      };
    },

    // 获取下移按钮提示
    getDownButtonTitle() {
      return (category, site) => {
        if (this.isCommonCategory(category)) return "常用导航项目无法调整排序";
        if (site.protected) return "受保护项目无法调整排序";
        return "下移";
      };
    },

    // 获取编辑按钮提示
    getEditButtonTitle() {
      return (category, site) => {
        if (this.isCommonCategory(category)) return "常用导航项目无法编辑";
        if (site.protected) return "受保护项目无法编辑";
        return "编辑";
      };
    },

    // 获取删除按钮提示
    getDeleteButtonTitle() {
      return (category, site) => {
        if (this.isCommonCategory(category)) return "常用导航项目无法删除";
        if (site.protected) return "受保护项目无法删除";
        return "删除";
      };
    },
  },
  methods: {
    // 返回首页
    goBack() {
      this.$router.push("/");
    },

    // 显示提示消息
    showToast(message, type = "success") {
      const iconMap = {
        success: "fa fa-check",
        error: "fa fa-exclamation-circle",
        warning: "fa fa-warning",
      };

      this.toast = {
        show: true,
        message,
        type,
        icon: iconMap[type] || iconMap.success,
      };

      // 3秒后自动隐藏
      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    },

    // 自定义确认对话框方法
    showConfirm(options) {
      return new Promise((resolve, reject) => {
        this.confirmConfig = {
          title: options.title || "确认操作",
          message: options.message || "确定要执行此操作吗？",
          confirmText: options.confirmText || "确认",
          cancelText: options.cancelText || "取消",
          onConfirm: resolve,
          onCancel: reject,
        };
        this.showConfirmDialog = true;
      });
    },

    // 处理确认按钮点击
    handleConfirmOk() {
      if (typeof this.confirmConfig.onConfirm === "function") {
        this.confirmConfig.onConfirm();
      }
      this.showConfirmDialog = false;
    },

    // 处理取消按钮点击
    handleConfirmCancel() {
      if (typeof this.confirmConfig.onCancel === "function") {
        this.confirmConfig.onCancel();
      }
      this.showConfirmDialog = false;
    },

    // 上移分类
    moveCategoryUp(catIndex) {
      if (catIndex === 0) return;

      const currentCategory = this.navigationData[catIndex];

      // 检查是否是常用导航分类
      if (this.isCommonCategory(currentCategory)) {
        this.showToast("常用导航分类无法调整排序", "warning");
        return;
      }

      try {
        const prevCategory = this.navigationData[catIndex - 1];

        // 检查前一个分类是否是常用导航
        if (this.isCommonCategory(prevCategory)) {
          this.showToast("常用导航分类无法调整排序", "warning");
          return;
        }

        // 交换sort值
        const tempSort = currentCategory.sort;
        currentCategory.sort = prevCategory.sort;
        prevCategory.sort = tempSort;

        // 重新排序分类数组
        this.navigationData.sort((a, b) => (a.sort || 9999) - (b.sort || 9999));

        // 保存数据
        this.saveData();
        this.showToast("分类上移成功", "success");
      } catch (error) {
        console.error("上移分类失败:", error);
        this.showToast("上移分类失败，请重试", "error");
      }
    },

    // 下移分类
    moveCategoryDown(catIndex) {
      if (catIndex === this.navigationData.length - 1) return;

      const currentCategory = this.navigationData[catIndex];

      // 检查是否是常用导航分类
      if (this.isCommonCategory(currentCategory)) {
        this.showToast("常用导航分类无法调整排序", "warning");
        return;
      }

      try {
        const nextCategory = this.navigationData[catIndex + 1];

        // 检查下一个分类是否是常用导航
        if (this.isCommonCategory(nextCategory)) {
          this.showToast("常用导航分类无法调整排序", "warning");
          return;
        }

        // 交换sort值
        const tempSort = currentCategory.sort;
        currentCategory.sort = nextCategory.sort;
        nextCategory.sort = tempSort;

        // 重新排序分类数组
        this.navigationData.sort((a, b) => (a.sort || 9999) - (b.sort || 9999));

        // 保存数据
        this.saveData();
        this.showToast("分类下移成功", "success");
      } catch (error) {
        console.error("下移分类失败:", error);
        this.showToast("下移分类失败，请重试", "error");
      }
    },

    // 从本地存储或JSON文件加载数据
    loadData() {
      try {
        // 1. 检查localStorage中是否有数据
        const localData = localStorage.getItem("navigationData");
        if (localData) {
          this.navigationData = JSON.parse(localData);
          this.showToast("数据加载成功", "success");
          return;
        }

        // 2. 如果localStorage中没有数据，从JSON文件加载
        const jsonData = require("@/assets/data/navigation.json");
        this.navigationData = jsonData;

        // 将JSON数据保存到localStorage，便于下次快速加载
        this.saveData();
        this.showToast("数据从JSON文件加载成功", "success");
      } catch (error) {
        console.error("加载数据失败:", error);
        this.navigationData = [];
        this.showToast("加载数据失败，请检查数据格式", "error");
      }
    },

    // 保存数据到本地存储
    saveData() {
      try {
        // 验证数据完整性
        if (!Array.isArray(this.navigationData)) {
          throw new Error("导航数据格式错误");
        }

        // 对每个分类下的网站进行排序，确保排序数据准确
        const sortedData = [...this.navigationData].map((category) => ({
          ...category,
          sites: [...category.sites].sort(
            (a, b) => (a.sort || 9999) - (b.sort || 9999),
          ),
        }));

        // 保存到本地存储
        localStorage.setItem("navigationData", JSON.stringify(sortedData));

        // 验证保存是否成功
        const savedData = localStorage.getItem("navigationData");
        if (!savedData) {
          throw new Error("数据保存失败，本地存储不可用");
        }

        // 更新当前数据，确保数据一致性
        this.navigationData = JSON.parse(savedData);

        this.showToast("数据保存成功", "success");
      } catch (error) {
        console.error("保存数据失败:", error);
        this.showToast(`保存数据失败: ${error.message}`, "error");
      }
    },

    // 打开模态框
    openAddModal(type) {
      this.modalType = type;
      this.modalTitle = type === "category" ? "新增分类" : "新增网站";
      this.submitBtnText = "添加";
      this.editingItem = null;
      this.resetForm();
      this.showModal = true;
    },

    // 关闭模态框
    closeModal() {
      this.showModal = false;
      this.modalType = null;
      this.editingItem = null;
      this.resetForm();
    },

    // 重置表单
    resetForm() {
      this.formData = {
        category: "",
        name: "",
        url: "",
        icon: "",
        sort: 0,
      };
    },

    // 编辑分类
    editCategory(category, index) {
      this.modalType = "category";
      this.modalTitle = "编辑分类";
      this.submitBtnText = "保存修改";
      this.editingItem = { index };
      this.formData = {
        category: category.category,
      };
      this.showModal = true;
    },

    // 删除分类
    deleteCategory(index) {
      this.showConfirm({
        title: "删除确认",
        message: "确定要删除这个分类吗？删除后该分类下的所有网站也会被删除。",
        confirmText: "删除",
        cancelText: "取消",
      })
        .then(() => {
          try {
            this.navigationData.splice(index, 1);
            this.saveData();
            this.showToast("分类删除成功", "success");
          } catch (error) {
            console.error("删除分类失败:", error);
            this.showToast("删除分类失败，请重试", "error");
          }
        })
        .catch(() => {
          // 用户取消删除操作
        });
    },

    // 编辑网站
    editSite(category, site, siteIndex) {
      // 检查是否是常用导航分类或受保护项目
      if (category.category === "常用导航" || site.protected) {
        this.showToast(
          category.category === "常用导航"
            ? "常用导航项目无法编辑"
            : "受保护项目无法编辑",
          "warning",
        );
        return;
      }

      this.modalType = "site";
      this.modalTitle = "编辑网站";
      this.submitBtnText = "保存修改";
      this.editingItem = { category, siteIndex };
      this.formData = {
        name: site.name,
        url: site.url,
        icon: site.icon,
        sort: site.sort || 0,
      };
      this.showModal = true;
    },

    // 删除网站
    deleteSite(category, index) {
      // 检查是否是常用导航分类或受保护项目
      if (category.category === "常用导航" || category.sites[index].protected) {
        this.showToast(
          category.category === "常用导航"
            ? "常用导航项目无法删除"
            : "受保护项目无法删除",
          "warning",
        );
        return;
      }

      this.showConfirm({
        title: "删除确认",
        message: "确定要删除这个网站吗？",
        confirmText: "删除",
        cancelText: "取消",
      })
        .then(() => {
          try {
            category.sites.splice(index, 1);
            this.saveData();
            this.showToast("网站删除成功", "success");
          } catch (error) {
            console.error("删除网站失败:", error);
            this.showToast("删除网站失败，请重试", "error");
          }
        })
        .catch(() => {
          // 用户取消删除操作
        });
    },

    // 新增网站到分类
    addSiteToCategory(category) {
      this.modalType = "site";
      this.modalTitle = "新增网站";
      this.submitBtnText = "添加";
      this.editingItem = { category };
      this.resetForm();
      this.showModal = true;
    },

    // 提交表单
    submitForm() {
      try {
        if (this.modalType === "category") {
          // 编辑分类
          if (this.editingItem && this.editingItem.index !== undefined) {
            this.navigationData[this.editingItem.index].category =
              this.formData.category;
            this.showToast("分类修改成功", "success");
          } else {
            // 新增分类
            this.navigationData.push({
              category: this.formData.category,
              sites: [],
              sort: 0,
              protected: false,
            });
            this.showToast("分类添加成功", "success");
          }
        } else if (this.modalType === "site") {
          const { category } = this.editingItem;

          // 排序值唯一性验证
          const existingSites = category.sites;
          const isDuplicate = existingSites.some((site, index) => {
            // 编辑模式下排除当前编辑的网站
            if (
              this.editingItem.siteIndex !== undefined &&
              index === this.editingItem.siteIndex
            ) {
              return false;
            }
            return site.sort === this.formData.sort;
          });

          if (isDuplicate) {
            this.showToast("排序值已存在，请使用不同的排序值", "warning");
            return;
          }

          // 编辑网站
          if (this.editingItem && this.editingItem.siteIndex !== undefined) {
            const { siteIndex } = this.editingItem;
            category.sites[siteIndex] = {
              name: this.formData.name,
              url: this.formData.url,
              icon: this.formData.icon,
              sort: this.formData.sort,
              protected: category.sites[siteIndex].protected || false,
            };
            this.showToast("网站修改成功", "success");
          } else if (this.editingItem && this.editingItem.category) {
            // 新增网站
            this.editingItem.category.sites.push({
              name: this.formData.name,
              url: this.formData.url,
              icon: this.formData.icon,
              sort: this.formData.sort,
              protected: false,
            });
            this.showToast("网站添加成功", "success");
          }
        }

        this.saveData();
        this.closeModal();
      } catch (error) {
        console.error("提交表单失败:", error);
        this.showToast("操作失败，请重试", "error");
      }
    },

    // 触发文件选择
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    // 导入数据
    importData(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.name.endsWith(".json")) {
        this.showToast("请选择JSON格式文件", "warning");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);

          // 验证数据格式
          if (!Array.isArray(importedData)) {
            throw new Error("导入的数据格式不正确，必须是数组格式");
          }

          // 确认是否覆盖现有数据
          this.showConfirm({
            title: "导入确认",
            message: "确定要导入数据吗？这将覆盖现有数据。",
            confirmText: "导入",
            cancelText: "取消",
          })
            .then(() => {
              this.navigationData = importedData;
              this.saveData();
              this.showToast("数据导入成功", "success");
            })
            .catch(() => {
              // 用户取消导入操作
            });
        } catch (error) {
          console.error("导入数据失败:", error);
          this.showToast(`导入数据失败: ${error.message}`, "error");
        }
      };

      reader.onerror = () => {
        this.showToast("读取文件失败，请重试", "error");
      };

      reader.readAsText(file);

      // 清空文件输入
      event.target.value = "";
    },

    // 导出数据
    exportData(format) {
      try {
        if (format === "json") {
          this.exportAsJSON();
        }
      } catch (error) {
        console.error("导出数据失败:", error);
        this.showToast("导出数据失败，请重试", "error");
      }
    },

    // 上移网站
    moveSiteUp(category, siteIndex) {
      // 检查是否是常用导航分类
      if (category.category === "常用导航") {
        this.showToast("常用导航项目无法调整排序", "warning");
        return;
      }

      if (siteIndex === 0) return;

      const currentSite = category.sites[siteIndex];
      const prevSite = category.sites[siteIndex - 1];

      // 检查保护机制
      if (currentSite.protected || prevSite.protected) {
        this.showToast("受保护的项目无法调整排序", "warning");
        return;
      }

      try {
        // 交换sort值
        const tempSort = currentSite.sort;
        currentSite.sort = prevSite.sort;
        prevSite.sort = tempSort;

        // 重新排序网站数组，确保界面更新
        category.sites.sort((a, b) => (a.sort || 9999) - (b.sort || 9999));

        // 保存数据
        this.saveData();
        this.showToast("网站上移成功", "success");
      } catch (error) {
        console.error("上移网站失败:", error);
        this.showToast("上移网站失败，请重试", "error");
      }
    },

    // 下移网站
    moveSiteDown(category, siteIndex) {
      // 检查是否是常用导航分类
      if (category.category === "常用导航") {
        this.showToast("常用导航项目无法调整排序", "warning");
        return;
      }

      if (siteIndex === category.sites.length - 1) return;

      const currentSite = category.sites[siteIndex];
      const nextSite = category.sites[siteIndex + 1];

      // 检查保护机制
      if (currentSite.protected || nextSite.protected) {
        this.showToast("受保护的项目无法调整排序", "warning");
        return;
      }

      try {
        // 交换sort值
        const tempSort = currentSite.sort;
        currentSite.sort = nextSite.sort;
        nextSite.sort = tempSort;

        // 重新排序网站数组，确保界面更新
        category.sites.sort((a, b) => (a.sort || 9999) - (b.sort || 9999));

        // 保存数据
        this.saveData();
        this.showToast("网站下移成功", "success");
      } catch (error) {
        console.error("下移网站失败:", error);
        this.showToast("下移网站失败，请重试", "error");
      }
    },

    // 选择行，用于键盘快捷键
    selectRow(categoryIndex, siteIndex) {
      this.selectedRow = {
        categoryIndex,
        siteIndex,
      };
    },

    // 处理键盘事件
    handleKeyDown(event) {
      const { categoryIndex, siteIndex } = this.selectedRow;

      // 只有在选中行的情况下才处理键盘事件
      if (categoryIndex === -1 || siteIndex === -1) return;

      const category = this.navigationData[categoryIndex];
      if (!category) return;

      // 处理上下箭头键
      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          if (siteIndex > 0) {
            this.moveSiteUp(category, siteIndex);
            this.selectRow(categoryIndex, siteIndex - 1);
          }
          break;
        case "ArrowDown":
          event.preventDefault();
          if (siteIndex < category.sites.length - 1) {
            this.moveSiteDown(category, siteIndex);
            this.selectRow(categoryIndex, siteIndex + 1);
          }
          break;
      }
    },

    // 导出为JSON格式
    exportAsJSON() {
      try {
        const dataStr = JSON.stringify(this.navigationData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        this.downloadFile(dataBlob, "navigation_data.json");
        this.showToast("JSON数据导出成功", "success");
      } catch (error) {
        console.error("导出JSON数据失败:", error);
        throw error;
      }
    },

    // 通用下载方法
    downloadFile(blob, filename) {
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    // 处理滚动事件
    handleScroll() {
      this.showScrollTop = window.scrollY > 300;
    },

    // 滚动到顶部
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    },

    // 排序所有数据
    sortAllData() {
      try {
        // 1. 对分类进行排序（按照sort值升序）
        const sortedCategories = [...this.navigationData].sort((a, b) => (a.sort || 9999) - (b.sort || 9999));

        // 2. 对每个分类下的网站进行排序和序号调整
        const finalData = sortedCategories.map((category, catIndex) => {
          // 2.1 对网站按照sort值升序排序
          let sortedSites = [...category.sites].sort((a, b) => (a.sort || 9999) - (b.sort || 9999));

          // 2.2 处理序号相同和空缺的情况
          sortedSites = this.adjustSiteSortValues(sortedSites);

          // 2.3 更新分类的sort值，确保分类序号连续
          const adjustedCategory = {
            ...category,
            sort: catIndex + 1, // 分类序号从1开始
            sites: sortedSites
          };

          return adjustedCategory;
        });

        // 3. 更新数据并保存
        this.navigationData = finalData;
        this.saveData();
        this.showToast("数据排序成功", "success");
      } catch (error) {
        console.error("排序数据失败:", error);
        this.showToast("排序数据失败，请重试", "error");
      }
    },

    // 调整网站的排序值，确保连续且无重复
    adjustSiteSortValues(sites) {
      if (!sites || sites.length === 0) return sites;

      // 创建一个新数组来存储调整后的数据
      const adjustedSites = [];
      const usedSortValues = new Set();

      // 遍历排序后的网站，调整序号
      sites.forEach((site, index) => {
        // 计算应该的序号（从1开始）
        let expectedSort = index + 1;
        
        // 检查当前序号是否已被使用或小于等于0
        while (usedSortValues.has(expectedSort) || expectedSort <= 0) {
          expectedSort++;
        }

        // 标记此序号为已使用
        usedSortValues.add(expectedSort);

        // 创建调整后的网站对象
        const adjustedSite = {
          ...site,
          sort: expectedSort
        };

        adjustedSites.push(adjustedSite);
      });

      return adjustedSites;
    },
  },
};
</script>

<style lang="scss" scoped>
.box_bg {
  max-width: 1200px;
  margin: 0 auto;
}
/* 管理页面样式 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) 0;

  .logo {
    h1 {
      font-size: 28px;
      color: #fff;
      margin-bottom: var(--spacing-xs);
      text-shadow: 1px 1px 8px #504b4b;
    }

    p {
      color: #fff;
      font-size: 14px;
    }
  }

  .back_to_home {
    .back_btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-md);
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 14px;
      cursor: pointer;

      &:hover {
        background-color: var(--primary-hover);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
    }
  }
}

/* 管理操作区 */
.manage_actions {
  background-color: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;

  .action_buttons {
    display: flex;
    gap: var(--spacing-sm);

    .add_data_btn,
    .import_btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-md);
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 14px;
      cursor: pointer;

      &:hover {
        background-color: var(--primary-hover);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
    }

    .import_btn {
      background-color: var(--success-color);

      &:hover {
        background-color: var(--success-hover);
      }
    }

    .sort_btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: var(--spacing-xs) var(--spacing-md);
      background-color: var(--warning-color);
      color: var(--text-primary);
      border: none;
      border-radius: var(--radius-md);
      font-size: 14px;
      cursor: pointer;

      &:hover {
        background-color: var(--warning-hover);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
    }

    .file_input {
      display: none;
    }
  }

  .export_buttons {
    display: flex;
    gap: var(--spacing-sm);

    .export_btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: 6px 12px;
      background-color: var(--success-color);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 13px;
      cursor: pointer;

      &:hover {
        background-color: var(--success-hover);
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
    }
  }
}

/* 分类列表 */
.category_list {
  .category_card {
    background-color: var(--bg-white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    margin-bottom: var(--spacing-xl);
    overflow: hidden;
    transition: all 0.2s ease;

    &:hover {
      box-shadow: var(--shadow-lg);
    }

    &.sortable-category {
      border-left: 4px solid var(--primary-color);
    }
    
    &.non-sortable-category {
      border-left: 4px solid var(--error-color);
      opacity: 0.9;
    }
  }

  .category_header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-lg);
    background-color: var(--primary-light);
    border-bottom: 1px solid var(--border-light);
  }

  .category_title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);

    .sort-value,
    .non-sort-value {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      font-size: 14px;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }

    .sort-value {
      color: var(--primary-color);
      background-color: rgba(66, 133, 244, 0.1);

      i {
        color: var(--primary-hover);
      }
    }

    .non-sort-value {
      color: var(--error-color);
      background-color: rgba(220, 53, 69, 0.1);

      i {
        color: var(--error-color);
      }
    }

    h2 {
      font-size: 18px;
      color: var(--text-primary);
      font-weight: 600;
      margin: 0;
    }

    .count {
      font-size: 14px;
      color: var(--text-secondary);
      background-color: rgba(66, 133, 244, 0.1);
      padding: 2px 8px;
      border-radius: var(--radius-xl);
    }
  }

  .category_actions {
    display: flex;
    gap: var(--spacing-xs);

    .move-btn,
    .edit_btn,
    .delete_btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: 4px 10px;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 12px;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
      }

      i {
        font-size: 10px;
      }
    }

    .move-btn {
      background-color: var(--warning-color);
      color: var(--text-primary);

      &:hover:not(:disabled) {
        background-color: var(--warning-hover);
      }
    }

    .edit_btn {
      background-color: var(--primary-color);
      color: white;

      &:hover:not(:disabled) {
        background-color: var(--primary-hover);
      }
    }

    .delete_btn {
      background-color: var(--error-color);
      color: white;

      &:hover:not(:disabled) {
        background-color: var(--error-hover);
      }
    }
  }
}

/* 网站管理列表 */
.site_manage_list {
  padding: var(--spacing-lg);

  .site_table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;

    th,
    td {
      padding: var(--spacing-sm);
      text-align: left;
      border-bottom: 1px solid var(--border-light);
    }

    th {
      background-color: var(--bg-light);
      font-weight: 600;
      color: var(--text-primary);
    }

    tr {
      &:hover {
        background-color: var(--primary-light);
      }
    }

    .action_column {
      display: flex;
      gap: var(--spacing-xs);

      .move-btn,
      .edit_btn,
      .delete_btn {
        padding: 4px 8px;
        border: none;
        border-radius: var(--radius-sm);
        font-size: 12px;
        cursor: pointer;

        box-shadow: var(--shadow-sm);

        i {
          font-size: 10px;
        }

        &:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
          transition: all 0.2s ease;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }
      }

      .move-btn {
        background-color: var(--warning-color);
        color: var(--text-primary);

        &:hover:not(:disabled) {
          background-color: var(--warning-hover);
        }
      }

      .edit_btn {
        background-color: var(--primary-color);
        color: white;

        &:hover:not(:disabled) {
          background-color: var(--primary-hover);
        }
      }

      .delete_btn {
        background-color: var(--error-color);
        color: white;

        &:hover:not(:disabled) {
          background-color: var(--error-hover);
        }
      }
    }

    /* 可排序行样式 */
    .sortable-row {
      background-color: var(--bg-white);
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--primary-light);
        transform: scale(1.01);
      }
    }

    /* 不可排序行样式 */
    .non-sortable-row {
      background-color: var(--bg-light);
      opacity: 0.8;
    }

    /* 图标列样式 */
    .icon_column {
      width: 60px;
      text-align: left;
      vertical-align: middle;

      .site_icon {
        width: 32px;
        height: 32px;
        object-fit: contain;
        border-radius: 4px;
      }
    }

    /* 网站名称和地址列样式 */
    .site_name_column,
    .site_url_column {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .site_name_column {
      width: 200px;
    }

    .site_url_column {
      width: 400px;
    }

    .site_url_column a {
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--primary-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    /* 排序值样式 */
    .sort-value {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--primary-color);
      font-weight: 600;

      i {
        color: var(--primary-hover);
      }
    }

    /* 不可排序值样式 */
    .non-sort-value {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--text-secondary);

      i {
        color: var(--error-color);
      }
    }

    /* 选中行样式 */
    .selected-row {
      background-color: var(--primary-hover) !important;
      color: white;
      transition: all 0.2s ease;

      td a {
        color: white;
        text-decoration: underline;
      }

      .sort-value,
      .non-sort-value {
        color: white;

        i {
          color: white;
        }
      }
    }
  }

  .empty_sites {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-secondary);
    font-size: 14px;

    i {
      margin-right: var(--spacing-xs);
    }
  }
}

/* 新增网站按钮 */
.add_site_container {
  padding: 0 var(--spacing-lg) var(--spacing-lg);

  .add_site_btn {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: 6px 12px;
    background-color: var(--success-color);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: 13px;
    cursor: pointer;

    &:hover {
      background-color: var(--success-hover);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
  }
}

/* 弹窗样式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  .modal_backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }

  .modal_content {
    position: relative;
    background-color: var(--bg-white);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    width: 90%;
    max-width: 500px;
    z-index: 1001;

    .modal_header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-md) var(--spacing-lg);
      border-bottom: 1px solid var(--border-light);
      background-color: var(--primary-light);
      border-radius: var(--radius-lg) var(--radius-lg) 0 0;

      h3 {
        font-size: 18px;
        color: var(--text-primary);
        font-weight: 600;
        margin: 0;
      }

      .close_btn {
        background: none;
        border: none;
        font-size: 18px;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 4px;
        border-radius: var(--radius-sm);

        &:hover {
          background-color: var(--border-light);
          color: var(--text-primary);
        }
      }
    }

    .modal_body {
      padding: var(--spacing-lg);

      .data_form {
        .form_group {
          margin-bottom: var(--spacing-md);

          label {
            display: block;
            font-size: 14px;
            color: var(--text-primary);
            margin-bottom: var(--spacing-xs);
            font-weight: 500;
          }

          input {
            width: 100%;
            height: 40px;
            padding: 0 var(--spacing-md);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-md);
            font-size: 14px;

            &:focus {
              outline: none;
              border-color: var(--primary-color);
              box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
            }
          }
        }

        .form_actions {
          display: flex;
          gap: var(--spacing-sm);
          justify-content: flex-end;
          margin-top: var(--spacing-xl);

          .cancel_btn {
            padding: var(--spacing-xs) var(--spacing-md);
            border: 1px solid var(--border-light);
            background-color: var(--bg-white);
            color: var(--text-secondary);
            border-radius: var(--radius-md);
            font-size: 14px;
            cursor: pointer;

            &:hover {
              background-color: var(--bg-light);
              border-color: var(--border-hover);
              color: var(--text-primary);
            }
          }

          .submit_btn {
            padding: var(--spacing-xs) var(--spacing-md);
            border: none;
            background-color: var(--primary-color);
            color: white;
            border-radius: var(--radius-md);
            font-size: 14px;
            cursor: pointer;

            &:hover {
              background-color: var(--primary-hover);
              transform: translateY(-1px);
              box-shadow: var(--shadow-md);
            }
          }
        }
      }
    }
  }
}

/* 提示消息样式 */
.toast {
  position: fixed;
  top: var(--spacing-lg);
  right: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  z-index: 2000;
  box-shadow: var(--shadow-md);

  i {
    font-size: 16px;
  }

  &.success {
    background-color: var(--success-color);
  }

  &.error {
    background-color: var(--error-color);
  }

  &.warning {
    background-color: var(--warning-color);
    color: var(--text-primary);
  }
}

/* 管理页面响应式布局 */

/* 平板设备 (768px - 1023px) */
@media (max-width: 1023px) {
  .header {
    padding: var(--spacing-lg) 0;
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;

    .logo {
      h1 {
        font-size: 26px;
      }
    }
  }

  .manage_actions {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: stretch;
    padding: var(--spacing-sm) var(--spacing-md);
    margin-bottom: var(--spacing-lg);

    .action_buttons {
      justify-content: center;
    }

    .export_buttons {
      justify-content: center;
    }
  }

  .category_list {
    .category_card {
      margin-bottom: var(--spacing-lg);

      .category_header {
        flex-direction: column;
        gap: var(--spacing-xs);
        padding: var(--spacing-sm) var(--spacing-md);
        align-items: flex-start;
      }

      .category_title {
        h2 {
          font-size: 17px;
        }
      }

      .category_actions {
        align-self: stretch;
        justify-content: center;
        flex-wrap: wrap;
      }

      .site_manage_list {
        padding: var(--spacing-sm);

        .site_table {
          overflow-x: auto;
          display: block;

          th,
          td {
            padding: var(--spacing-xs) var(--spacing-sm);
            font-size: 14px;
          }

          .icon_column {
            width: 55px;

            .site_icon {
              width: 28px;
              height: 28px;
            }
          }

          .site_name_column {
            width: 180px;
          }

          .site_url_column {
            width: 250px;
          }

          .action_column {
            flex-direction: column;
            gap: 4px;
          }

          .move-btn,
          .edit_btn,
          .delete_btn {
            padding: 6px 10px;
            font-size: 13px;
            min-height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .add_site_container {
        padding: 0 var(--spacing-sm) var(--spacing-sm);
      }
    }
  }

  .modal {
    .modal_content {
      width: 90%;
      max-width: 500px;
      margin: 20px auto;

      .modal_header {
        padding: var(--spacing-xs) var(--spacing-sm);

        h3 {
          font-size: 17px;
        }
      }

      .modal_body {
        padding: var(--spacing-sm);
      }
    }
  }

  .toast {
    top: 20px;
    right: 20px;
    left: 20px;
    font-size: 14px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .scroll-top-btn {
    bottom: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
}

/* 小型平板和大型手机 (576px - 767px) */
@media (max-width: 767px) {
  .header {
    padding: var(--spacing-md) 0;

    .logo {
      h1 {
        font-size: 24px;
      }

      p {
        font-size: 13px;
      }
    }

    .back_btn {
      font-size: 13px;
      padding: var(--spacing-xs) var(--spacing-sm);
      min-height: 36px;
      display: flex;
      align-items: center;
    }
  }

  .manage_actions {
    padding: var(--spacing-xs) var(--spacing-sm);

    .action_buttons,
    .export_buttons {
      flex-wrap: wrap;
      gap: var(--spacing-xs);
    }

    .add_data_btn,
    .import_btn,
    .export_btn {
      font-size: 13px;
      padding: var(--spacing-xs) var(--spacing-sm);
      min-height: 36px;
      display: flex;
      align-items: center;
    }
  }

  .category_list {
    .category_card {
      .category_header {
        padding: var(--spacing-xs) var(--spacing-sm);
      }

      .category_title {
        h2 {
          font-size: 16px;
        }

        .count {
          font-size: 13px;
          padding: 1px 6px;
        }
      }

      .category_actions {
        gap: var(--spacing-xs);

        .move-btn,
        .edit_btn,
        .delete_btn {
          font-size: 11px;
          padding: 3px 8px;
          min-height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .site_manage_list {
        padding: var(--spacing-xs);

        .site_table {
          th,
          td {
            padding: var(--spacing-xs);
            font-size: 13px;
          }

          .icon_column {
            width: 50px;

            .site_icon {
              width: 24px;
              height: 24px;
            }
          }

          .site_name_column {
            width: 150px;
          }

          .site_url_column {
            width: 200px;
          }

          .action_column {
            gap: 2px;
          }

          .move-btn,
          .edit_btn,
          .delete_btn {
            padding: 4px 8px;
            font-size: 12px;
            min-height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }

      .add_site_container {
        padding: 0 var(--spacing-xs) var(--spacing-xs);

        .add_site_btn {
          font-size: 12px;
          padding: 5px 10px;
          min-height: 32px;
          display: flex;
          align-items: center;
        }
      }
    }
  }

  .modal {
    .modal_content {
      width: 95%;
      margin: 10px;

      .modal_header {
        h3 {
          font-size: 16px;
        }
      }

      .modal_body {
        padding: var(--spacing-sm);

        .form_group {
          margin-bottom: var(--spacing-sm);

          label {
            font-size: 13px;
          }

          input {
            font-size: 13px;
            height: 36px;
          }
        }

        .form_actions {
          margin-top: var(--spacing-lg);

          .cancel_btn,
          .submit_btn {
            font-size: 13px;
            padding: var(--spacing-xs) var(--spacing-sm);
            min-height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
  }

  .toast {
    top: 10px;
    right: 10px;
    left: 10px;
    font-size: 13px;
    padding: var(--spacing-xs) var(--spacing-sm);
  }

  .scroll-top-btn {
    bottom: 15px;
    right: 15px;
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}

/* 小型手机 (576px 以下) */
@media (max-width: 576px) {
  .header {
    .logo {
      h1 {
        font-size: 22px;
      }
    }
  }

  .category_list {
    .category_card {
      .site_manage_list {
        .site_table {
          th,
          td {
            font-size: 12px;
          }

          .site_name_column {
            width: 120px;
          }

          .site_url_column {
            width: 180px;
          }

          .action_column {
            .move-btn,
            .edit_btn,
            .delete_btn {
              font-size: 11px;
              padding: 3px 6px;
              min-height: 26px;
              display: flex;
              align-items: center;
              justify-content: center;

              i {
                font-size: 9px;
              }
            }
          }
        }
      }
    }
  }

  .modal {
    .modal_content {
      .modal_body {
        .form_group {
          label {
            font-size: 12px;
          }

          input {
            font-size: 12px;
            height: 34px;
          }
        }

        .form_actions {
          flex-direction: column;

          .cancel_btn,
          .submit_btn {
            width: 100%;
            justify-content: center;
            min-height: 34px;
            display: flex;
            align-items: center;
          }
        }
      }
    }
  }

  .toast {
    font-size: 12px;
    padding: var(--spacing-xs);
  }

  .scroll-top-btn {
    bottom: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
}

/* 超小型手机 (480px 以下) */
@media (max-width: 480px) {
  .category_list {
    .category_card {
      .category_actions {
        flex-direction: column;
        align-items: stretch;

        .move-btn,
        .edit_btn,
        .delete_btn {
          justify-content: center;
          min-height: 32px;
          display: flex;
          align-items: center;
        }
      }

      .site_manage_list {
        .site_table {
          .site_name_column {
            width: 100px;
          }

          .site_url_column {
            width: 150px;
          }
        }
      }
    }
  }
}

/* 滚动到顶部按钮 */
.scroll-top-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: translateY(-1px);
  }
}


</style>

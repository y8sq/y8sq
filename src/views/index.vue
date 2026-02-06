<template>
  <div class="box_bg">
    <div class="bg_image_container">
      <img
        src="@/assets/images/bg.jpg"
        alt="顶部背景图，展示自然风景"
        class="bg_image"
      />
    </div>

    <div class="app_container">
      <!-- 顶部区域 -->
      <header class="header">
        <div class="header_top">
          <div class="logo">
            <h1>网址导航</h1>
            <p></p>
          </div>
        </div>

        <!-- 搜索框与搜索引擎选择（优化：按钮组放在搜索框上方） -->
        <div class="search_container">
          <!-- 1. 搜索引擎按钮组（新增） -->
          <div class="engine_buttons">
            <!-- 本地资源搜索按钮（默认选中） -->
            <button
              class="engine_btn"
              :class="{ active: selectedEngine === 'local' }"
              @click="selectedEngine = 'local'"
            >
              <i class="fa fa-database" aria-hidden="true"></i> 本地资源
            </button>
            <!-- 第三方搜索引擎按钮 -->
            <button
              v-for="engine in searchEngines"
              :key="engine.id"
              class="engine_btn"
              :class="{ active: selectedEngine === engine.id }"
              @click="selectedEngine = engine.id"
            >
              <i :class="`fa fa-${engine.icon}`" aria-hidden="true"></i>
              {{ engine.name }}
            </button>
          </div>

          <!-- 2. 搜索框（位置下移） -->
          <div class="search_box">
            <div class="search_input_container">
              <input
                type="text"
                v-model="searchQuery"
                @keyup.enter="handleSearch"
                placeholder="搜索本地资源或网络内容..."
                class="search_input"
              />
              <!-- 清空按钮，只在有内容时显示 -->
              <button
                class="clear_search_btn"
                @click="clearSearchInput"
                v-if="searchQuery.trim()"
                title="清空搜索"
              >
                <i class="fa fa-times" aria-hidden="true"></i>
              </button>
            </div>
            <button class="search_btn" @click="handleSearch">
              <i class="fa fa-search" aria-hidden="true"></i> 搜索
            </button>
          </div>

          <!-- 合并后的搜索历史和热门搜索功能 -->
          <div class="hot_tags">
            <span class="tag_title">搜索推荐:</span>
            <!-- 合并去重后的搜索推荐标签 -->
            <a
              href="#"
              class="hot_tag"
              v-for="(item, index) in combinedSearchRecommendations"
              :key="index"
              @click.prevent="searchWithText(item)"
            >
              {{ item }}
            </a>
            <!-- 清空历史按钮 -->
            <a
              href="#"
              class="hot_tag clear_history"
              @click.prevent="clearSearchHistory"
              v-if="searchHistory.length > 0"
            >
              <i class="fa fa-trash" aria-hidden="true"></i> 清空历史
            </a>
            <!-- 暂无搜索历史提示 -->
            <span
              v-if="combinedSearchRecommendations.length === 0"
              class="no_history"
              >暂无搜索推荐</span
            >
          </div>
        </div>
      </header>

      <!-- 主要内容区域（新增：本地搜索结果展示区） -->
      <main class="main_content">
        <!-- 本地搜索结果（有搜索词且选中本地资源时显示） -->
        <div
          class="local_search_result"
          v-if="
            searchQuery &&
            selectedEngine === 'local' &&
            localSearchResult.length
          "
        >
          <div class="result_title">
            <i class="fa fa-search" aria-hidden="true"></i>
            <h2>
              本地搜索结果：{{ searchQuery }}（共{{
                localSearchResult.length
              }}条）
            </h2>
          </div>
          <ul class="result_list">
            <li
              v-for="(item, index) in localSearchResult"
              :key="index"
              class="result_item"
            >
              <a
                :href="item.url"
                target="_blank"
                class="result_link"
                :title="item.name"
              >
                <div class="result_icon">
                  <img
                    :src="item.icon"
                    :alt="item.name"
                    class="result_favicon"
                  />
                </div>
                <div class="result_info">
                  <div class="result_name">{{ item.name }}</div>
                  <div class="result_category">分类：{{ item.category }}</div>
                </div>
              </a>
            </li>
          </ul>
        </div>

        <!-- 无搜索结果提示 -->
        <div
          class="no_result"
          v-if="
            searchQuery &&
            selectedEngine === 'local' &&
            !localSearchResult.length
          "
        >
          <i class="fa fa-info-circle" aria-hidden="true"></i>
          <p>
            未找到与「{{
              searchQuery
            }}」相关的本地资源，可切换搜索引擎搜索网络内容
          </p>
        </div>

        <!-- 导航分类列表（无搜索词或未选中本地资源时显示） -->
        <div
          v-if="!searchQuery || selectedEngine !== 'local'"
          class="navigation_list"
        >
          <div
            v-for="(category, catIndex) in sortedNavigationData"
            :key="catIndex"
            class="category_card"
            :class="{ 'protected-category': category.protected }"
          >
            <!-- 分类标题 -->
            <div class="category_title">
              <div class="title-content">
                <h2>{{ category.category }}</h2>
                <span v-if="category.protected" class="protected-badge"
                  >保护</span
                >
              </div>
              <div class="title-actions">
                <!-- 新增数据按钮（排除常用导航） -->
                <button
                  v-if="category.category !== '常用导航'"
                  class="add_data_btn"
                  @click="openAddModal(category)"
                  title="新增数据"
                >
                  <i class="fa fa-plus" aria-hidden="true"></i>
                </button>
                <span class="count">{{ category.sites.length }}</span>
              </div>
            </div>

            <!-- 网站链接列表 -->
            <ul class="site_list">
              <li
                v-for="(site, siteIndex) in category.category === '常用导航'
                  ? category.sites.slice(0, 16)
                  : category.sites"
                :key="siteIndex"
                class="site_item"
                :class="{ 'protected-site': site.protected }"
              >
                <a
                  :href="site.url"
                  target="_blank"
                  class="site_link"
                  :title="site.name"
                  @click.prevent="addToHistoryAndOpen(site, category)"
                >
                  <div class="site_icon">
                    <img :src="site.icon" :alt="site.name" class="favicon" />
                  </div>
                  <span class="site_name">{{ site.name }}</span>
                  <span v-if="site.protected" class="protected-site-badge"
                    >保护</span
                  >
                </a>
                <!-- 操作按钮 -->
                <div class="site_actions">
                  <button
                    v-if="!site.protected"
                    class="edit_btn"
                    @click.stop="editSite(category, site, siteIndex)"
                    title="编辑"
                  >
                    <i class="fa fa-edit" aria-hidden="true"></i>
                  </button>
                  <button
                    v-if="!site.protected"
                    class="delete_btn"
                    @click.stop="deleteSite(category, siteIndex)"
                    title="删除"
                  >
                    <i class="fa fa-trash-o" aria-hidden="true"></i>
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>

      <!-- 新增/编辑数据弹窗 -->
      <div class="modal" v-if="showAddModal">
        <div class="modal_backdrop" @click="closeModal"></div>
        <div class="modal_content">
          <div class="modal_header">
            <h3>{{ editingItem ? "编辑数据" : "新增数据" }}</h3>
            <button class="close_btn" @click="closeModal">
              <i class="fa fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <div class="modal_body">
            <form @submit.prevent="submitForm" class="data_form">
              <div class="form_group">
                <label for="category">分类</label>
                <input
                  type="text"
                  id="category"
                  v-model="formData.category"
                  placeholder="请输入分类名称"
                  :readonly="editingItem !== null"
                  required
                  disabled
                />
              </div>
              <div class="form_group">
                <label for="name">网站名称</label>
                <input
                  type="text"
                  id="name"
                  v-model="formData.name"
                  placeholder="请输入网站名称"
                  required
                />
              </div>
              <div class="form_group">
                <label for="url">网站地址</label>
                <input
                  type="url"
                  id="url"
                  v-model="formData.url"
                  placeholder="请输入网站地址"
                  required
                />
              </div>
              <div class="form_group">
                <label for="icon">图标名称</label>
                <input
                  type="text"
                  id="icon"
                  v-model="formData.icon"
                  placeholder="请输入图标文件名（如：baidu_27.png）"
                  required
                />
              </div>
              <div class="form_group">
                <label for="sort">排序值</label>
                <input
                  type="number"
                  id="sort"
                  v-model.number="formData.sort"
                  placeholder="请输入排序值（数字越小，排序越靠前）"
                  min="0"
                  step="1"
                  required
                  disabled
                />
              </div>
              <div class="form_actions">
                <button type="button" class="cancel_btn" @click="closeModal">
                  取消
                </button>
                <button type="submit" class="submit_btn">
                  {{ editingItem ? "保存修改" : "添加数据" }}
                </button>
              </div>
            </form>
          </div>
        </div>
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
    </div>

    <div class="header_actions" @click="goToManagePage">管理</div>

    <!-- 滚动到顶部按钮 -->
    <button
      class="scroll-to-top"
      v-if="showScrollTop"
      @click="scrollToTop"
      title="滚动到顶部"
    >
      <i class="fa fa-arrow-up" aria-hidden="true"></i>
    </button>

    <!-- 提示消息 -->
    <div class="toast" v-if="toast.show" :class="toast.type">
      <i :class="toast.icon" aria-hidden="true"></i>
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      navigationData: [],
      searchQuery: "",
      // 搜索引擎配置（新增icon字段用于按钮图标）
      searchEngines: [
        {
          id: "baidu",
          name: "百度",
          url: "https://www.baidu.com/s?wd=",
          icon: "baidu", // 需确保Font Awesome有该图标（若无可替换为"search"）
        },
        {
          id: "google",
          name: "谷歌",
          url: "https://www.google.com/search?q=",
          icon: "google",
        },
        {
          id: "bing",
          name: "必应",
          url: "https://www.bing.com/search?q=",
          icon: "bing",
        },
        {
          id: "sougou",
          name: "搜狗",
          url: "https://www.sogou.com/web?query=",
          icon: "sougou", // 若无该图标可替换为"search"
        },
        {
          id: "360",
          name: "360搜索",
          url: "https://www.so.com/s?q=",
          icon: "360", // 若无该图标可替换为"search"
        },
      ],
      selectedEngine: "local", // 默认选中本地资源搜索
      localSearchResult: [], // 本地搜索结果存储
      // 新增数据弹窗相关
      showAddModal: false,
      editingItem: null,
      formData: {
        category: "",
        name: "",
        url: "",
        icon: "",
        sort: 0,
      },
      // 搜索历史功能
      searchHistory: [],
      hotKeywords: ["Github", "W3school", "字节跳动CDN", "CSDN", "码云Gitee"],
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
      // 滚动到顶部按钮状态
      showScrollTop: false,
      // 提示消息
      toast: {
        show: false,
        message: "",
        type: "success", // success, error, warning
        icon: "fa fa-check",
      },
    };
  },
  computed: {
    // 合并搜索历史和热门搜索，并去除重复数据
    combinedSearchRecommendations() {
      // 合并搜索历史和热门搜索
      const combined = [...this.searchHistory, ...this.hotKeywords];
      // 使用Set去除重复项，然后转回数组
      return [...new Set(combined)];
    },
    // 排序后的导航分类
    sortedNavigationData() {
      // 对分类进行排序
      const sortedCategories = [...this.navigationData].sort((a, b) => {
        // 如果没有sort字段，默认放在后面
        const sortA = a.sort || 9999;
        const sortB = b.sort || 9999;
        return sortA - sortB;
      });

      // 对每个分类下的网站进行排序
      return sortedCategories.map((category) => ({
        ...category,
        sites: category.category === '常用导航'
          ? [...category.sites] // 常用导航保持原始顺序（最新添加的在前面）
          : [...category.sites].sort((a, b) => {
              const sortA = a.sort || 9999;
              const sortB = b.sort || 9999;
              return sortA - sortB;
            }),
      }));
    },
  },
  mounted() {
    // 加载导航数据：优先从localStorage，其次从JSON文件
    this.loadNavigationData();

    // 从localStorage恢复菜单状态
    const savedState = localStorage.getItem("navigationState");
    if (savedState) {
      const state = JSON.parse(savedState);
      this.selectedEngine = state.selectedEngine;
      this.searchQuery = state.searchQuery;
      // 如果有搜索词，自动执行搜索
      if (state.searchQuery) {
        this.handleSearch();
      }
    }

    // 加载搜索历史
    this.loadSearchHistory();

    // 添加滚动事件监听器
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    // 移除滚动事件监听器
    window.removeEventListener("scroll", this.handleScroll);
  },
  watch: {
    // 监听搜索引擎选择变化，保存到localStorage
    selectedEngine() {
      this.saveMenuState();
    },
    // 监听搜索词变化，保存到localStorage
    searchQuery() {
      this.saveMenuState();
    },
  },
  methods: {
    // 保存菜单状态到localStorage
    saveMenuState() {
      const state = {
        selectedEngine: this.selectedEngine,
        searchQuery: this.searchQuery,
      };
      localStorage.setItem("navigationState", JSON.stringify(state));
    },
    // 处理搜索（区分本地搜索和第三方搜索）
    handleSearch() {
      const query = this.searchQuery.trim();
      if (!query) return;

      // 记录搜索历史
      this.addSearchHistory(query);

      // 1. 本地资源搜索（默认）
      if (this.selectedEngine === "local") {
        this.searchLocalResources(query);
      }
      // 2. 第三方搜索引擎搜索
      else {
        const engine = this.searchEngines.find(
          (item) => item.id === this.selectedEngine,
        );
        if (engine) {
          const encodedQuery = encodeURIComponent(query);
          const searchUrl = engine.url + encodedQuery;
          window.open(searchUrl, "_blank");
        }
      }
    },

    // 搜索本地导航资源（匹配网站名称或分类）
    searchLocalResources(query) {
      const result = [];
      // 遍历所有分类，匹配网站名称包含搜索词的资源
      this.navigationData.forEach((category) => {
        const matchedSites = category.sites.filter((site) =>
          site.name.toLowerCase().includes(query.toLowerCase()),
        );
        // 给匹配的网站添加分类信息，便于展示
        const formattedSites = matchedSites.map((site) => ({
          ...site,
          category: category.category,
        }));
        result.push(...formattedSites);
      });
      // 存储搜索结果
      this.localSearchResult = result;
    },

    // 使用热门标签搜索
    searchWithText(text) {
      this.searchQuery = text;
      this.handleSearch();
    },

    // 加载搜索历史
    loadSearchHistory() {
      const history = localStorage.getItem("searchHistory");
      if (history) {
        this.searchHistory = JSON.parse(history);
      }
    },

    // 添加搜索历史
    addSearchHistory(query) {
      // 移除重复项
      this.searchHistory = this.searchHistory.filter((item) => item !== query);
      // 添加到开头
      this.searchHistory.unshift(query);
      // 限制历史记录数量（最多10条）
      if (this.searchHistory.length > 10) {
        this.searchHistory = this.searchHistory.slice(0, 10);
      }
      // 保存到本地存储
      localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
    },

    // 清空搜索历史
    clearSearchHistory() {
      this.showConfirm({
        title: "清空确认",
        message: "确定要清空所有搜索历史吗？",
        confirmText: "清空",
        cancelText: "取消",
      })
        .then(() => {
          this.searchHistory = [];
          localStorage.removeItem("searchHistory");
        })
        .catch(() => {
          // 用户取消清空操作
        });
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

    // 跳转到数据管理页面
    goToManagePage() {
      // 直接跳转到管理页面，不需要确认
      // window.location.href = "/y8sq/manage";
      this.$router.push("/manage");
    },

    // 清空搜索输入框
    clearSearchInput() {
      this.searchQuery = "";
    },
    // 打开新增数据弹窗
    openAddModal(category) {
      this.editingItem = null;
      // 计算默认排序值：当前条目总数 + 1
      const defaultSort = category.sites.length + 1;
      this.formData = {
        category: category.category,
        name: "",
        url: "",
        icon: "",
        sort: defaultSort,
      };
      this.showAddModal = true;
    },
    // 关闭新增数据弹窗
    closeModal() {
      this.showAddModal = false;
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
    // 编辑网站
    editSite(category, site, index) {
      if (site.protected || category.protected) {
        alert("该项目受保护，无法编辑");
        return;
      }
      this.editingItem = {
        category: category,
        site: site,
        index: index,
      };
      this.formData = {
        category: category.category,
        name: site.name,
        url: site.url,
        icon: site.icon,
        sort: site.sort || 0,
      };
      this.showAddModal = true;
    },
    // 删除网站
    deleteSite(category, index) {
      if (category.protected || category.sites[index].protected) {
        alert("该项目受保护，无法删除");
        return;
      }
      this.showConfirm({
        title: "删除确认",
        message: "确定要删除这个网站吗？",
        confirmText: "删除",
        cancelText: "取消",
      })
        .then(() => {
          // 创建新的数组副本，确保Vue能检测到变化
          const updatedCategory = {
            ...category,
            sites: [...category.sites],
          };
          updatedCategory.sites.splice(index, 1);

          // 更新navigationData
          const updatedNavigationData = [...this.navigationData];
          const categoryIndex = updatedNavigationData.findIndex(
            (cat) => cat.category === category.category,
          );

          if (updatedCategory.sites.length === 0) {
            // 如果分类下没有网站了，删除该分类
            updatedNavigationData.splice(categoryIndex, 1);
          } else {
            // 否则更新分类
            updatedNavigationData[categoryIndex] = updatedCategory;
          }

          // 重新赋值触发Vue响应式更新
        this.navigationData = updatedNavigationData;
        // 保存数据到本地存储
        this.saveDataToLocal();
        // 执行排序操作，确保数据序号连续
        this.sortAllData();
        // 显示删除成功提示
        this.showToast("数据删除成功");
        })
        .catch(() => {
          // 用户取消删除操作
        });
    },
    // 提交表单
    submitForm() {
      // 表单验证
      if (
        !this.formData.category ||
        !this.formData.name ||
        !this.formData.url ||
        !this.formData.icon
      ) {
        alert("请填写完整的表单信息");
        return;
      }

      // 构建数据对象
      const siteData = {
        name: this.formData.name,
        url: this.formData.url,
        icon: this.formData.icon,
        sort: this.formData.sort,
        protected: this.editingItem ? this.editingItem.site.protected : false,
      };

      // 查找目标分类
      let targetCategory;
      if (this.editingItem) {
        // 编辑模式
        if (this.formData.category === this.editingItem.category.category) {
          targetCategory = this.editingItem.category;
        } else {
          // 分类改变，查找新分类
          targetCategory = this.navigationData.find(
            (cat) => cat.category === this.formData.category,
          );
          // 如果新分类不存在，创建一个
          if (!targetCategory) {
            targetCategory = {
              category: this.formData.category,
              sites: [],
              sort: 0,
              protected: false,
            };
            this.navigationData.push(targetCategory);
          }
        }
      } else {
        // 新增模式，查找或创建分类
        targetCategory = this.navigationData.find(
          (cat) => cat.category === this.formData.category,
        );
        if (!targetCategory) {
          targetCategory = {
            category: this.formData.category,
            sites: [],
            sort: 0,
            protected: false,
          };
          this.navigationData.push(targetCategory);
        }
      }

      // 排序值唯一性验证
      const existingSites = targetCategory.sites;
      const isDuplicate = existingSites.some((site, index) => {
        // 编辑模式下排除当前编辑的网站
        if (
          this.editingItem &&
          this.formData.category === this.editingItem.category.category &&
          index === this.editingItem.index
        ) {
          return false;
        }
        return site.sort === this.formData.sort;
      });

      if (isDuplicate) {
        alert("排序值已存在，请使用不同的排序值");
        return;
      }

      if (this.editingItem) {
        // 编辑现有数据
        const { category: oldCategory, index: oldIndex } = this.editingItem;
        // 创建navigationData的副本
        const updatedNavigationData = [...this.navigationData];

        // 如果分类名称改变了
        if (this.formData.category !== oldCategory.category) {
          // 从原分类中删除
          const oldCategoryIndex = updatedNavigationData.findIndex(
            (cat) => cat.category === oldCategory.category,
          );
          const updatedOldCategory = {
            ...updatedNavigationData[oldCategoryIndex],
            sites: [...updatedNavigationData[oldCategoryIndex].sites],
          };
          updatedOldCategory.sites.splice(oldIndex, 1);

          if (updatedOldCategory.sites.length === 0) {
            // 如果原分类下没有网站了，删除该分类
            updatedNavigationData.splice(oldCategoryIndex, 1);
          } else {
            // 否则更新原分类
            updatedNavigationData[oldCategoryIndex] = updatedOldCategory;
          }

          // 添加到新分类
          const newCategoryIndex = updatedNavigationData.findIndex(
            (cat) => cat.category === this.formData.category,
          );
          if (newCategoryIndex !== -1) {
            const updatedNewCategory = {
              ...updatedNavigationData[newCategoryIndex],
              sites: [...updatedNavigationData[newCategoryIndex].sites],
            };
            updatedNewCategory.sites.push(siteData);
            updatedNavigationData[newCategoryIndex] = updatedNewCategory;
          }
        } else {
          // 只更新网站信息
          const categoryIndex = updatedNavigationData.findIndex(
            (cat) => cat.category === oldCategory.category,
          );
          const updatedCategory = {
            ...updatedNavigationData[categoryIndex],
            sites: [...updatedNavigationData[categoryIndex].sites],
          };
          updatedCategory.sites[oldIndex] = siteData;
          updatedNavigationData[categoryIndex] = updatedCategory;
        }

        // 重新赋值触发Vue响应式更新
        this.navigationData = updatedNavigationData;
        this.showToast("数据更新成功");
      } else {
        // 添加新数据
        // 创建navigationData的副本
        const updatedNavigationData = [...this.navigationData];
        const categoryIndex = updatedNavigationData.findIndex(
          (cat) => cat.category === this.formData.category,
        );

        // 添加到现有分类
        const updatedCategory = {
          ...updatedNavigationData[categoryIndex],
          sites: [...updatedNavigationData[categoryIndex].sites],
        };
        // 对于常用导航分类，新添加的项目放在列表开头
        if (this.formData.category === '常用导航') {
          updatedCategory.sites.unshift(siteData);
        } else {
          updatedCategory.sites.push(siteData);
        }
        updatedNavigationData[categoryIndex] = updatedCategory;

        // 重新赋值触发Vue响应式更新
        this.navigationData = updatedNavigationData;
        this.showToast("数据添加成功");
      }

      // 关闭弹窗并重置表单
      this.closeModal();
      // 保存数据到localStorage（模拟持久化）
      this.saveDataToLocal();
    },
    // 保存数据到localStorage（模拟持久化）
    saveDataToLocal() {
      localStorage.setItem(
        "navigationData",
        JSON.stringify(this.navigationData),
      );
    },
    // 导出数据
    exportData(format) {
      if (format === "json") {
        this.exportAsJSON();
      } else if (format === "csv") {
        this.exportAsCSV();
      }
    },
    // 导出为JSON格式
    exportAsJSON() {
      const dataStr = JSON.stringify(this.navigationData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      this.downloadFile(dataBlob, "navigation_data.json");
    },
    // 导出为CSV格式
    exportAsCSV() {
      // CSV表头
      let csvContent = "分类,网站名称,网站地址,图标名称\n";

      // 遍历数据生成CSV内容
      this.navigationData.forEach((category) => {
        category.sites.forEach((site) => {
          const row = [category.category, site.name, site.url, site.icon];
          // 处理CSV中的特殊字符
          const formattedRow = row.map((field) => {
            // 如果字段包含逗号、换行符或双引号，需要用双引号包裹
            if (
              field.includes(",") ||
              field.includes("\n") ||
              field.includes('"')
            ) {
              return '"' + field.replace(/"/g, '""') + '"';
            }
            return field;
          });
          csvContent += formattedRow.join(",") + "\n";
        });
      });

      const dataBlob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      this.downloadFile(dataBlob, "navigation_data.csv");
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
    // 将当前页面添加到常用导航
    addCurrentPageToFavorites() {
      const currentPage = {
        name: "当前网站导航",
        url: window.location.href,
        icon: "icon-home00.png",
        sort: 0,
        protected: false,
      };

      // 创建navigationData的副本
      const updatedNavigationData = [...this.navigationData];

      // 查找常用导航分类
      let commonCategoryIndex = updatedNavigationData.findIndex(
        (cat) => cat.category === "常用导航",
      );

      if (commonCategoryIndex === -1) {
        // 如果没有常用导航分类，创建一个
        const newCommonCategory = {
          category: "常用导航",
          sites: [currentPage],
          sort: 0,
          protected: false,
        };
        updatedNavigationData.unshift(newCommonCategory);
      } else {
        // 检查是否已存在相同的页面
        const commonCategory = updatedNavigationData[commonCategoryIndex];
        const exists = commonCategory.sites.some(
          (site) => site.url === currentPage.url,
        );

        if (exists) {
          alert("当前页面已在常用导航中");
          return;
        }

        // 创建分类副本并添加页面
        const updatedCommonCategory = {
          ...commonCategory,
          sites: [...commonCategory.sites, currentPage],
        };
        updatedNavigationData[commonCategoryIndex] = updatedCommonCategory;
      }

      // 重新赋值触发Vue响应式更新
      this.navigationData = updatedNavigationData;
      // 保存到本地存储
      this.saveDataToLocal();

      alert("当前页面已添加到常用导航");
    },
    // 将网站添加到历史记录（常用导航）并打开
    addToHistoryAndOpen(site) {
      // 构建网站数据对象
      const websiteData = {
        name: site.name,
        url: site.url,
        icon: site.icon,
        sort: 0,
        protected: false,
      };

      // 创建navigationData的副本
      const updatedNavigationData = [...this.navigationData];

      // 查找常用导航分类
      let commonCategoryIndex = updatedNavigationData.findIndex(
        (cat) => cat.category === "常用导航",
      );

      if (commonCategoryIndex === -1) {
        // 如果没有常用导航分类，创建一个
        const newCommonCategory = {
          category: "常用导航",
          sites: [websiteData],
          sort: 0,
          protected: false,
        };
        updatedNavigationData.unshift(newCommonCategory);
      } else {
        // 检查是否已存在相同的网站
        const commonCategory = updatedNavigationData[commonCategoryIndex];
        const existingIndex = commonCategory.sites.findIndex(
          (existingSite) => existingSite.url === websiteData.url,
        );

        if (existingIndex === -1) {
          // 网站不存在，添加到开头
          const updatedCommonCategory = {
            ...commonCategory,
            sites: [websiteData, ...commonCategory.sites],
          };

          // 如果常用导航网站数量超过16个，保留最新的16个
          if (updatedCommonCategory.sites.length > 16) {
            updatedCommonCategory.sites = updatedCommonCategory.sites.slice(
              0,
              16,
            );
          }

          updatedNavigationData[commonCategoryIndex] = updatedCommonCategory;
        } else if (existingIndex > 0) {
          // 网站已存在但不在第一位，移到开头
          const updatedSites = [...commonCategory.sites];
          updatedSites.splice(existingIndex, 1);
          updatedSites.unshift(websiteData);

          const updatedCommonCategory = {
            ...commonCategory,
            sites: updatedSites,
          };

          updatedNavigationData[commonCategoryIndex] = updatedCommonCategory;
        }
        // 如果网站已在第一位，无需操作
      }

      // 重新赋值触发Vue响应式更新
      this.navigationData = updatedNavigationData;
      // 保存到本地存储
      this.saveDataToLocal();

      // 打开网站
      window.open(site.url, "_blank");
    },
    // 跳转到管理页面
    goToManage() {
      this.$router.push("/manage");
    },
    // 加载导航数据：优先从localStorage，其次从JSON文件
    loadNavigationData() {
      try {
        // 1. 检查localStorage中是否有数据
        const localData = localStorage.getItem("navigationData");
        if (localData) {
          this.navigationData = JSON.parse(localData);
          return;
        }

        // 2. 如果localStorage中没有数据，从JSON文件加载
        const jsonData = require("@/assets/data/navigation.json");
        this.navigationData = jsonData;

        // 将JSON数据保存到localStorage，便于下次快速加载
        localStorage.setItem("navigationData", JSON.stringify(jsonData));
      } catch (error) {
        console.error("Failed to load navigation data:", error);
        // 3. 如果JSON文件加载失败，使用默认空数据
        this.navigationData = [];
      }
    },
    // 处理滚动事件，显示/隐藏滚动到顶部按钮
    handleScroll() {
      // 当滚动超过300px时显示按钮
      this.showScrollTop = window.pageYOffset > 300;
    },
    // 滚动到顶部
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: "smooth", // 平滑滚动
      });
    },

    // 排序所有数据
    sortAllData() {
      try {
        // 1. 对分类进行排序（按照sort值升序）
        const sortedCategories = [...this.navigationData].sort((a, b) => (a.sort || 9999) - (b.sort || 9999));

        // 2. 对每个分类下的网站进行排序和序号调整
        const finalData = sortedCategories.map((category, catIndex) => {
          let sortedSites;
          
          // 2.1 对网站进行排序：常用导航保持原始顺序，其他分类按sort值排序
          if (category.category === '常用导航') {
            // 常用导航保持原始顺序（最新添加的在前面）
            sortedSites = [...category.sites];
            // 为常用导航的网站设置连续的排序值，从1开始
            sortedSites = sortedSites.map((site, index) => ({
              ...site,
              sort: index + 1
            }));
          } else {
            // 其他分类按sort值升序排序
            sortedSites = [...category.sites].sort((a, b) => (a.sort || 9999) - (b.sort || 9999));
            // 处理序号相同和空缺的情况
            sortedSites = this.adjustSiteSortValues(sortedSites);
          }

          // 2.2 更新分类的sort值，确保分类序号连续
          const adjustedCategory = {
            ...category,
            sort: catIndex + 1, // 分类序号从1开始
            sites: sortedSites
          };

          return adjustedCategory;
        });

        // 3. 更新数据并保存
        this.navigationData = finalData;
        this.saveDataToLocal();
      } catch (error) {
        console.error("排序数据失败:", error);
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
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", sans-serif;
}
.box_bg {
  .header_actions {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
    color: #fff;
    cursor: pointer;
  }
  .bg_image_container {
    position: absolute;
    overflow: hidden;
    width: 100%;
    height: 100vh;
    z-index: -1;

    .bg_image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
    }

    // 渐变遮罩层 - 覆盖图片下方1/3
    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 70%;
      background: linear-gradient(to top, white 0%, transparent 100%);
      pointer-events: none;
    }
  }
}

/* 滚动到顶部按钮样式 */
.scroll-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  z-index: 999;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  i {
    margin: 0;
  }
}

/* 提示消息样式 */
.toast {
  position: fixed;
  top: 20px;
  right: 30px;
  padding: 12px 20px;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  i {
    font-size: 16px;
  }

  &.success {
    background-color: #28a745;
  }

  &.error {
    background-color: #dc3545;
  }

  &.warning {
    background-color: #ffc107;
    color: #212529;
  }
}
.app_container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

/* 头部样式（重点：新增搜索引擎按钮组样式） */
.header {
  padding: var(--spacing-2xl) 0;
  text-align: center;

  .logo {
    h1 {
      font-size: 36px;
      color: #fff;
      margin-bottom: var(--spacing-xs);
      letter-spacing: 2px;
      text-shadow: 1px 1px 8px #504b4b;
    }

    p {
      color: #fff;
      font-size: 16px;
      margin-bottom: var(--spacing-lg);
    }
  }

  .search_container {
    max-width: 800px;
    margin: 0 auto;

    // 1. 搜索引擎按钮组样式（新增）
    .engine_buttons {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      justify-content: center;
      margin-bottom: var(--spacing-sm);

      .engine_btn {
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        padding: var(--spacing-xs) var(--spacing-md);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-xl);
        background-color: white;
        color: var(--text-primary);
        font-size: 14px;
        cursor: pointer;

        // 选中状态样式
        &.active {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }

        //  hover效果
        &:hover:not(.active) {
          border-color: var(--primary-color);
          color: var(--primary-color);
          box-shadow: var(--shadow-sm);
        }

        i {
          font-size: 14px;
        }
      }
    }

    // 2. 搜索框样式（移除原下拉框相关样式）
    .search_box {
      display: flex;
      justify-content: center;
      width: 100%;

      /* 搜索输入框容器 */
      .search_input_container {
        position: relative;
        flex: 1;
        display: flex;
        align-items: center;
      }

      .search_input {
        width: 100%;
        height: 48px;
        padding: 0 45px 0 var(--spacing-md);
        border: 2px solid var(--primary-color);
        border-right: none;
        border-radius: var(--radius-md) 0 0 var(--radius-md);
        font-size: 16px;
        outline: none;

        &:focus {
          border-color: var(--primary-hover);
        }
      }

      /* 清空搜索按钮 */
      .clear_search_btn {
        position: absolute;
        right: 10px;
        width: 24px;
        height: 24px;
        border: none;
        background-color: transparent;
        color: var(--text-light);
        cursor: pointer;
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;

        &:hover {
          background-color: var(--bg-light);
          color: var(--text-secondary);
        }
      }

      .search_btn {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 0 25px;
        border-radius: 0 var(--radius-md) var(--radius-md) 0;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
        box-shadow: var(--shadow-sm);

        &:hover {
          background-color: var(--primary-hover);
          box-shadow: var(--shadow-md);
        }
      }
    }

    /* 热门搜索标签 */
    .hot_tags {
      margin-top: var(--spacing-lg);
      text-align: left;
      padding-left: 5px;

      .tag_title {
        color: var(--bg-white);
        font-size: 14px;
        margin-right: var(--spacing-md);
        font-weight: 500;
      }

      .hot_tag {
        display: inline-block;
        color: var(--text-primary);
        font-size: 14px;
        text-decoration: none;
        margin: 0 var(--spacing-md) var(--spacing-md) 0;
        padding: var(--spacing-xs) var(--spacing-lg);
        background-color: var(--bg-white);
        border-radius: var(--radius-xl);
        border: 1px solid var(--border-light);
        box-shadow: var(--shadow-sm);

        &:hover {
          background-color: var(--primary-light);
          color: var(--primary-color);
          border-color: var(--primary-border);
          box-shadow: var(--shadow-md);
        }
      }
    }
  }
}

/* 主要内容区域（新增：本地搜索结果样式） */
.main_content {
  margin-bottom: 40px;

  // 1. 本地搜索结果样式（新增）
  .local_search_result {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 25px;
    overflow: hidden;

    .result_title {
      background-color: #f0f3f9;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e1e5eb;

      i {
        color: #4285f4;
        margin-right: 10px;
        font-size: 18px;
      }

      h2 {
        font-size: 18px;
        color: #333;
        font-weight: 600;
      }
    }

    .result_list {
      padding: 15px 20px;
      list-style: none;

      .result_item {
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .result_link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #333;

          &:hover {
            color: #4285f4;
          }

          .result_icon {
            width: 36px;
            height: 36px;
            background-color: #f0f3f9;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            overflow: hidden;

            .result_favicon {
              width: 20px;
              height: 20px;
              object-fit: contain;
            }
          }

          .result_info {
            .result_name {
              font-size: 16px;
              margin-bottom: 4px;
            }

            .result_category {
              font-size: 12px;
              color: #666;
            }
          }
        }
      }
    }
  }

  // 2. 无搜索结果提示（新增）
  .no_result {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 40px 20px;
    text-align: center;
    margin-bottom: 25px;

    i {
      color: #4285f4;
      font-size: 24px;
      margin-bottom: 10px;
    }

    p {
      color: #666;
      font-size: 16px;
    }
  }

  // 3. 原有导航分类样式（保留）
  .navigation_list {
    .category_card {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      margin-bottom: 25px;
      overflow: hidden;

      .category_title {
        background-color: #f0f3f9;
        padding: 12px 20px;
        display: flex;
        align-items: center;
        border-bottom: 1px solid #e1e5eb;
        justify-content: space-between;

        .title-content {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-grow: 1;

          h2 {
            font-size: 18px;
            color: #333;
            font-weight: 600;
            display: flex;
            align-items: center;
            margin: 0;
          }

          .protected-badge {
            margin-left: 8px;
          }
        }

        .title-actions {
          display: flex;
          align-items: center;
          gap: 10px;

          .add_data_btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background-color: #4285f4;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 18px;
            cursor: pointer;

            &:hover {
              background-color: #3367d6;
              box-shadow: 0 2px 6px rgba(66, 133, 244, 0.3);
            }

            i {
              font-size: 16px;
            }
          }

          .count {
            font-size: 14px;
            color: #666;
            background-color: rgba(66, 133, 244, 0.1);
            padding: 2px 8px;
            border-radius: 12px;
          }
        }
      }

      .site_list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: var(--spacing-lg);
        padding: var(--spacing-md) var(--spacing-lg);
        list-style: none;

        .site_item {
          position: relative;
          display: flex;
          justify-content: center;
          &:hover {
            .site_link {
              background-color: var(--primary-light);
              color: var(--primary-color);
              box-shadow: var(--shadow-md);
              border-color: var(--primary-border);
            }
            .favicon {
              transform: scale(1.5);
            }
          }

          .site_link {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-decoration: none;
            color: var(--text-primary);
            padding: var(--spacing-md);
            border-radius: var(--radius-lg);
            height: 100%;
            min-height: 100px;
            justify-content: center;
            width: 100%;
            background-color: var(--bg-white);
            border: 2px solid transparent;

            .site_icon {
              width: 48px;
              height: 48px;
              background-color: var(--bg-white);
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: var(--spacing-sm);
              overflow: hidden;
              transition: all var(--transition-fast);

              .favicon {
                width: 28px;
                height: 28px;
                object-fit: contain;
                transition: all var(--transition-fast);
              }
            }

            .site_name {
              font-size: 14px;
              text-align: center;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              width: 100%;
              font-weight: 500;
            }
          }

          /* 操作按钮样式 */
          .site_actions {
            position: absolute;
            top: 8px;
            right: 8px;
            display: flex;
            gap: var(--spacing-xs);
            opacity: 0;
            z-index: 10;

            .edit_btn,
            .delete_btn {
              width: 24px;
              height: 24px;
              border: none;
              border-radius: 50%;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              color: white;
              box-shadow: var(--shadow-md);
              backdrop-filter: blur(4px);

              &:hover {
                box-shadow: var(--shadow-lg);
              }
            }

            /* 确保 Font Awesome 字体应用到图标上 */
            .edit_btn i,
            .delete_btn i {
              font-family: "FontAwesome" !important;
              font-style: normal;
              font-weight: normal;
              text-decoration: inherit;
            }

            .edit_btn {
              background-color: var(--primary-color);
              color: white;

              &:hover {
                background-color: var(--primary-hover);
              }
            }

            .delete_btn {
              background-color: var(--error-color);
              color: white;

              &:hover {
                background-color: var(--error-hover);
              }
            }
          }

          /* 悬停时显示操作按钮 */
          &:hover .site_actions {
            opacity: 1;
          }
        }
      }
    }
  }
}

/* 操作按钮区样式 */
.operation_buttons {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .add_data_btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    background-color: #4285f4;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background-color: #3367d6;
      box-shadow: 0 2px 6px rgba(66, 133, 244, 0.3);
    }

    i {
      font-size: 14px;
    }
  }

  .export_buttons {
    display: flex;
    gap: 10px;

    .export_btn,
    .apply_btn,
    .manage_btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;

      i {
        font-size: 12px;
      }
    }

    .export_btn {
      background-color: #28a745;
      color: white;

      &:hover {
        background-color: #218838;
        box-shadow: 0 2px 6px rgba(40, 167, 69, 0.3);
      }
    }

    .apply_btn {
      background-color: #ffc107;
      color: #212529;

      &:hover {
        background-color: #e0a800;
        box-shadow: 0 2px 6px rgba(255, 193, 7, 0.3);
      }
    }

    .manage_btn {
      background-color: #6c757d;
      color: white;

      &:hover {
        background-color: #5a6268;
        box-shadow: 0 2px 6px rgba(108, 117, 125, 0.3);
      }
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
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 500px;
    z-index: 1001;

    .modal_header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #e1e5eb;
      background-color: #f0f3f9;
      border-radius: 8px 8px 0 0;

      h3 {
        font-size: 18px;
        color: #333;
        font-weight: 600;
        margin: 0;
      }

      .close_btn {
        background: none;
        border: none;
        font-size: 18px;
        color: #666;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;

        &:hover {
          background-color: #e9ecef;
          color: #333;
        }
      }
    }

    .modal_body {
      padding: 20px;

      .data_form {
        .form_group {
          margin-bottom: 16px;

          label {
            display: block;
            font-size: 14px;
            color: #333;
            margin-bottom: 6px;
            font-weight: 500;
          }

          input {
            width: 100%;
            height: 40px;
            padding: 0 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;

            &:focus {
              outline: none;
              border-color: #4285f4;
              box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.1);
            }
          }
        }

        .form_actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;

          .cancel_btn {
            padding: 8px 16px;
            border: 1px solid #ddd;
            background-color: white;
            color: #666;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;

            &:hover {
              background-color: #f5f5f5;
              border-color: #ccc;
            }
          }

          .submit_btn {
            padding: 8px 16px;
            border: none;
            background-color: #4285f4;
            color: white;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;

            &:hover {
              background-color: #3367d6;
              box-shadow: 0 2px 6px rgba(66, 133, 244, 0.3);
            }
          }
        }
      }
    }
  }
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .main_content {
    .navigation_list {
      .category_card {
        .site_list {
          .site_item {
            width: 16.666%; /* 每行6个 */
          }
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .main_content {
    .navigation_list {
      .category_card {
        .site_list {
          .site_item {
            width: 20%; /* 每行5个 */
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .header {
    padding: var(--spacing-xl) 0;

    .logo {
      h1 {
        font-size: 28px;
      }
    }

    .search_container {
      .engine_buttons {
        .engine_btn {
          padding: 4px 8px;
          font-size: 12px;

          i {
            font-size: 12px;
          }
        }
      }

      .search_box {
        .search_input {
          font-size: 14px;
          height: 44px;
        }

        .search_btn {
          font-size: 14px;
          padding: 0 16px;
          height: 44px;
        }
      }

      .hot_tags {
        text-align: center;

        .tag_title {
          display: block;
          margin-bottom: var(--spacing-sm);
        }
      }
    }
  }

  .main_content {
    margin-bottom: var(--spacing-xl);

    .navigation_list {
      .category_card {
        margin-bottom: var(--spacing-lg);

        .category_title {
          padding: var(--spacing-xs) var(--spacing-md);

          h2 {
            font-size: 16px;
          }
        }

        .site_list {
          padding: var(--spacing-xs) var(--spacing-md);

          .site_item {
            width: 25%; /* 每行4个 */
            padding: var(--spacing-xs);

            .site_link {
              padding: var(--spacing-xs) 0;
              min-height: 70px;

              .site_icon {
                width: 36px;
                height: 36px;
                margin-bottom: var(--spacing-xs);

                .favicon {
                  width: 20px;
                  height: 20px;
                }
              }

              .site_name {
                font-size: 12px;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 576px) {
  .header {
    padding: var(--spacing-lg) 0;

    .logo {
      h1 {
        font-size: 24px;
        margin-bottom: 5px;
      }

      p {
        font-size: 14px;
      }
    }

    .search_container {
      max-width: 100%;

      .engine_buttons {
        gap: 4px;
        margin-bottom: 8px;
      }

      .search_box {
        flex-direction: column;
        gap: var(--spacing-xs);

        .search_input_container {
          width: 100%;

          .search_input {
            border-right: 2px solid var(--primary-color);
            border-radius: var(--radius-md);
            height: 44px;
          }
        }

        .search_btn {
          width: 100%;
          border-radius: var(--radius-md);
          height: 44px;
          justify-content: center;
        }
      }
    }
  }

  .main_content {
    .local_search_result {
      margin-bottom: var(--spacing-lg);

      .result_title {
        padding: var(--spacing-xs) var(--spacing-md);

        h2 {
          font-size: 16px;
        }
      }

      .result_list {
        padding: var(--spacing-xs) var(--spacing-md);

        .result_item {
          padding: var(--spacing-xs) 0;
        }
      }
    }

    .no_result {
      margin-bottom: var(--spacing-lg);
      padding: var(--spacing-lg) var(--spacing-md);
    }

    .navigation_list {
      .category_card {
        .site_list {
          .site_item {
            width: 33.333%; /* 每行3个 */
          }
        }
      }
    }
  }
}
</style>

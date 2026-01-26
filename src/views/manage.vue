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
            <input 
              type="file" 
              ref="fileInput" 
              class="file_input" 
              accept=".json" 
              @change="importData"
            >
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
            v-for="(category, catIndex) in navigationData"
            :key="catIndex"
            class="category_card"
          >
            <!-- 分类标题和操作 -->
            <div class="category_header">
              <div class="category_title">
                <h2>{{ category.category }}</h2>
                <span class="count">{{ category.sites.length }}</span>
              </div>
              <div class="category_actions">
                <button class="edit_btn" @click="editCategory(category, catIndex)">
                  <i class="fa fa-pencil" aria-hidden="true"></i> 编辑分类
                </button>
                <button class="delete_btn" @click="deleteCategory(catIndex)">
                  <i class="fa fa-trash" aria-hidden="true"></i> 删除分类
                </button>
              </div>
            </div>

            <!-- 网站列表 -->
            <div class="site_manage_list">
              <table class="site_table">
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>网站名称</th>
                    <th>网站地址</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(site, siteIndex) in category.sites" :key="siteIndex">
                    <td>{{ siteIndex + 1 }}</td>
                    <td>{{ site.name }}</td>
                    <td><a :href="site.url" target="_blank">{{ site.url }}</a></td>
                    <td class="action_column">
                      <button class="edit_btn" @click="editSite(category, site, siteIndex)">
                        <i class="fa fa-pencil" aria-hidden="true"></i> 编辑
                      </button>
                      <button class="delete_btn" @click="deleteSite(category, siteIndex)">
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
              >
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
                >
              </div>
              <div class="form_group">
                <label for="siteUrl">网站地址</label>
                <input 
                  type="url" 
                  id="siteUrl" 
                  v-model="formData.url" 
                  placeholder="请输入网站地址" 
                  required
                >
              </div>
              <div class="form_group">
                <label for="siteIcon">图标名称</label>
                <input 
                  type="text" 
                  id="siteIcon" 
                  v-model="formData.icon" 
                  placeholder="请输入图标文件名（如：baidu_27.png）" 
                  required
                >
              </div>
            </div>
            
            <div class="form_actions">
              <button type="button" class="cancel_btn" @click="closeModal">取消</button>
              <button type="submit" class="submit_btn">{{ submitBtnText }}</button>
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
          <button 
            class="btn-cancel" 
            @click="handleConfirmCancel"
          >
            {{ confirmConfig.cancelText || '取消' }}
          </button>
          <button 
            class="btn-confirm" 
            @click="handleConfirmOk"
          >
            {{ confirmConfig.confirmText || '确认' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import navigationData from "@/assets/js/data.js";

export default {
  name: "Manage",
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
        icon: ""
      },
      // 提示消息
      toast: {
        show: false,
        message: "",
        type: "success", // success, error, warning
        icon: "fa fa-check"
      },
      // 自定义确认对话框
      showConfirmDialog: false,
      confirmConfig: {
        title: "确认操作",
        message: "确定要执行此操作吗？",
        confirmText: "确认",
        cancelText: "取消",
        onConfirm: null,
        onCancel: null
      }
    };
  },
  mounted() {
    // 从localStorage加载数据
    this.loadData();
  },
  methods: {
    // 返回首页
    goBack() {
      this.$router.push('/');
    },
    
    // 显示提示消息
    showToast(message, type = 'success') {
      const iconMap = {
        success: 'fa fa-check',
        error: 'fa fa-exclamation-circle',
        warning: 'fa fa-warning'
      };
      
      this.toast = {
        show: true,
        message,
        type,
        icon: iconMap[type] || iconMap.success
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
          title: options.title || '确认操作',
          message: options.message || '确定要执行此操作吗？',
          confirmText: options.confirmText || '确认',
          cancelText: options.cancelText || '取消',
          onConfirm: resolve,
          onCancel: reject
        };
        this.showConfirmDialog = true;
      });
    },
    
    // 处理确认按钮点击
    handleConfirmOk() {
      if (typeof this.confirmConfig.onConfirm === 'function') {
        this.confirmConfig.onConfirm();
      }
      this.showConfirmDialog = false;
    },
    
    // 处理取消按钮点击
    handleConfirmCancel() {
      if (typeof this.confirmConfig.onCancel === 'function') {
        this.confirmConfig.onCancel();
      }
      this.showConfirmDialog = false;
    },
    
    // 从本地存储加载数据
    loadData() {
      try {
        const localData = localStorage.getItem('navigationData');
        if (localData) {
          this.navigationData = JSON.parse(localData);
        } else {
          // 如果本地没有数据，使用初始数据
          this.navigationData = JSON.parse(JSON.stringify(navigationData));
          this.saveData();
        }
        this.showToast('数据加载成功', 'success');
      } catch (error) {
        console.error('加载数据失败:', error);
        this.navigationData = [];
        this.showToast('加载数据失败，请检查数据格式', 'error');
      }
    },
    
    // 保存数据到本地存储
    saveData() {
      try {
        localStorage.setItem('navigationData', JSON.stringify(this.navigationData));
        this.showToast('数据保存成功', 'success');
      } catch (error) {
        console.error('保存数据失败:', error);
        this.showToast('保存数据失败，请重试', 'error');
      }
    },
    
    // 打开模态框
    openAddModal(type) {
      this.modalType = type;
      this.modalTitle = type === 'category' ? '新增分类' : '新增网站';
      this.submitBtnText = '添加';
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
        icon: ""
      };
    },
    
    // 编辑分类
    editCategory(category, index) {
      this.modalType = 'category';
      this.modalTitle = '编辑分类';
      this.submitBtnText = '保存修改';
      this.editingItem = { index };
      this.formData = {
        category: category.category
      };
      this.showModal = true;
    },
    
    // 删除分类
    deleteCategory(index) {
      this.showConfirm({
        title: '删除确认',
        message: '确定要删除这个分类吗？删除后该分类下的所有网站也会被删除。',
        confirmText: '删除',
        cancelText: '取消'
      }).then(() => {
        try {
          this.navigationData.splice(index, 1);
          this.saveData();
          this.showToast('分类删除成功', 'success');
        } catch (error) {
          console.error('删除分类失败:', error);
          this.showToast('删除分类失败，请重试', 'error');
        }
      }).catch(() => {
        // 用户取消删除操作
      });
    },
    
    // 编辑网站
    editSite(category, site, siteIndex) {
      this.modalType = 'site';
      this.modalTitle = '编辑网站';
      this.submitBtnText = '保存修改';
      this.editingItem = { category, siteIndex };
      this.formData = {
        name: site.name,
        url: site.url,
        icon: site.icon
      };
      this.showModal = true;
    },
    
    // 删除网站
    deleteSite(category, index) {
      this.showConfirm({
        title: '删除确认',
        message: '确定要删除这个网站吗？',
        confirmText: '删除',
        cancelText: '取消'
      }).then(() => {
        try {
          category.sites.splice(index, 1);
          this.saveData();
          this.showToast('网站删除成功', 'success');
        } catch (error) {
          console.error('删除网站失败:', error);
          this.showToast('删除网站失败，请重试', 'error');
        }
      }).catch(() => {
        // 用户取消删除操作
      });
    },
    
    // 新增网站到分类
    addSiteToCategory(category) {
      this.modalType = 'site';
      this.modalTitle = '新增网站';
      this.submitBtnText = '添加';
      this.editingItem = { category };
      this.resetForm();
      this.showModal = true;
    },
    
    // 提交表单
    submitForm() {
      try {
        if (this.modalType === 'category') {
          // 编辑分类
          if (this.editingItem && this.editingItem.index !== undefined) {
            this.navigationData[this.editingItem.index].category = this.formData.category;
            this.showToast('分类修改成功', 'success');
          } else {
            // 新增分类
            this.navigationData.push({
              category: this.formData.category,
              sites: []
            });
            this.showToast('分类添加成功', 'success');
          }
        } else if (this.modalType === 'site') {
          // 编辑网站
          if (this.editingItem && this.editingItem.siteIndex !== undefined) {
            const { category, siteIndex } = this.editingItem;
            category.sites[siteIndex] = {
              name: this.formData.name,
              url: this.formData.url,
              icon: this.formData.icon
            };
            this.showToast('网站修改成功', 'success');
          } else if (this.editingItem && this.editingItem.category) {
            // 新增网站
            this.editingItem.category.sites.push({
              name: this.formData.name,
              url: this.formData.url,
              icon: this.formData.icon
            });
            this.showToast('网站添加成功', 'success');
          }
        }
        
        this.saveData();
        this.closeModal();
      } catch (error) {
        console.error('提交表单失败:', error);
        this.showToast('操作失败，请重试', 'error');
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
      
      if (!file.name.endsWith('.json')) {
        this.showToast('请选择JSON格式文件', 'warning');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          // 验证数据格式
          if (!Array.isArray(importedData)) {
            throw new Error('导入的数据格式不正确，必须是数组格式');
          }
          
          // 确认是否覆盖现有数据
          this.showConfirm({
            title: '导入确认',
            message: '确定要导入数据吗？这将覆盖现有数据。',
            confirmText: '导入',
            cancelText: '取消'
          }).then(() => {
            this.navigationData = importedData;
            this.saveData();
            this.showToast('数据导入成功', 'success');
          }).catch(() => {
            // 用户取消导入操作
          });
        } catch (error) {
          console.error('导入数据失败:', error);
          this.showToast(`导入数据失败: ${error.message}`, 'error');
        }
      };
      
      reader.onerror = () => {
        this.showToast('读取文件失败，请重试', 'error');
      };
      
      reader.readAsText(file);
      
      // 清空文件输入
      event.target.value = '';
    },
    
    // 导出数据
    exportData(format) {
      try {
        if (format === 'json') {
          this.exportAsJSON();
        }
      } catch (error) {
        console.error('导出数据失败:', error);
        this.showToast('导出数据失败，请重试', 'error');
      }
    },
    
    // 导出为JSON格式
    exportAsJSON() {
      try {
        const dataStr = JSON.stringify(this.navigationData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        this.downloadFile(dataBlob, 'navigation_data.json');
        this.showToast('JSON数据导出成功', 'success');
      } catch (error) {
        console.error('导出JSON数据失败:', error);
        throw error;
      }
    },
    
    // 通用下载方法
    downloadFile(blob, filename) {
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }
};
</script>

<style lang="scss" scoped>
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
    
    .add_data_btn, .import_btn {
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


    
    &:hover {
      box-shadow: var(--shadow-lg);
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
      margin-left: var(--spacing-sm);
    }
  }
  
  .category_actions {
    display: flex;
    gap: var(--spacing-xs);
    
    .edit_btn, .delete_btn {
      display: flex;
      align-items: center;
      gap: var(--spacing-xs);
      padding: 4px 10px;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 12px;
      cursor: pointer;

      box-shadow: var(--shadow-sm);
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: var(--shadow-md);
      }
      
      i {
        font-size: 10px;
      }
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
}

/* 网站管理列表 */
.site_manage_list {
  padding: var(--spacing-lg);
  
  .site_table {
    width: 100%;
    border-collapse: collapse;
    
    th, td {
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
      
      .edit_btn, .delete_btn {
        padding: 4px 8px;
        border: none;
        border-radius: var(--radius-sm);
        font-size: 12px;
        cursor: pointer;
  
        box-shadow: var(--shadow-sm);
        
        i {
          font-size: 10px;
        }
        
        &:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }
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
@media (max-width: 768px) {
  .header {
    padding: var(--spacing-lg) 0;
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
    
    .logo {
      h1 {
        font-size: 24px;
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
          font-size: 16px;
        }
      }
      
      .category_actions {
        align-self: stretch;
        justify-content: center;
      }
      
      .site_manage_list {
        padding: var(--spacing-sm);
        
        .site_table {
          overflow-x: auto;
          display: block;
          
          th,
          td {
            padding: var(--spacing-xs) var(--spacing-sm);
            font-size: 13px;
          }
          
          .action_column {
            flex-direction: column;
            gap: 2px;
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
      width: 95%;
      margin: 10px;
      
      .modal_header {
        padding: var(--spacing-xs) var(--spacing-sm);
        
        h3 {
          font-size: 16px;
        }
      }
      
      .modal_body {
        padding: var(--spacing-sm);
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
}

@media (max-width: 576px) {
  .category_list {
    .category_card {
      .site_manage_list {
        .site_table {
          th:nth-child(3),
          td:nth-child(3) {
            min-width: 150px;
          }
        }
      }
    }
  }
}
</style>
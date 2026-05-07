<template>
  <div class="tree-view">
    <div class="tree-header">
      <div class="header-title">视图</div>
      <div class="search-bar">
        <span class="search-label">查找:</span>
        <input
          type="text"
          v-model="searchKeyword"
          class="search-input"
          placeholder="输入关键词..."
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">GO!</button>
        <button class="nav-btn" @click="goNext" title="下一个">下一个</button>
        <button class="nav-btn" @click="goPrev" title="上一个">上一个</button>
        <button class="expand-btn" @click="expandAll" title="全部展开">全部展开</button>
        <button class="expand-btn" @click="collapseAll" title="全部收缩">全部收缩</button>
        <button class="home-btn" @click="goHome" title="回到首页">回到首页</button>
      </div>
    </div>
    <div class="tree-body">
      <div v-if="!nodes || nodes.length === 0" class="empty-state">
        请在左侧输入有效的JSON数据
      </div>
      <div v-else class="tree-container">
        <div class="tree-root">
          <div class="root-node" @click="handleNodeClick(rootNode)">
            <span class="expand-btn" @click.stop="toggleRoot">
              {{ isRootExpanded ? '−' : '+' }}
            </span>
            <span class="root-icon">{ }</span>
            <span class="root-label">JSON</span>
          </div>
          <div v-if="isRootExpanded" class="tree-nodes">
            <TreeNode
              v-for="node in nodes"
              :key="node.path"
              :node="node"
              :level="0"
              :search-results="searchResults"
              :current-index="currentIndex"
              :selected-path="selectedPath"
              @toggle="handleToggle"
              @click="handleNodeClick"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import TreeNode from './TreeNode.vue';
import { searchNodes } from '../utils/jsonParser';

export default {
  name: 'TreeView',
  components: { TreeNode },
  props: {
    nodes: {
      type: Array,
      default: () => []
    },
    selectedPath: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      searchKeyword: '',
      searchResults: [],
      currentIndex: -1,
      isRootExpanded: true
    };
  },
  computed: {
    rootNode() {
      return {
        key: 'JSON',
        path: '',
        type: 'object',
        value: {},
        children: this.nodes
      };
    }
  },
  methods: {
    toggleRoot() {
      this.isRootExpanded = !this.isRootExpanded;
    },
    handleSearch() {
      if (!this.searchKeyword.trim()) {
        this.searchResults = [];
        this.currentIndex = -1;
        return;
      }
      
      this.searchResults = searchNodes(this.nodes, this.searchKeyword);
      this.currentIndex = this.searchResults.length > 0 ? 0 : -1;
      
      if (this.searchResults.length > 0) {
        this.expandToPath(this.searchResults[0].path);
        this.$emit('select', this.searchResults[0].path);
      }
    },
    goNext() {
      if (this.searchResults.length === 0) return;
      
      this.currentIndex = (this.currentIndex + 1) % this.searchResults.length;
      const node = this.searchResults[this.currentIndex];
      this.expandToPath(node.path);
      this.$emit('select', node.path);
    },
    goPrev() {
      if (this.searchResults.length === 0) return;
      
      this.currentIndex = (this.currentIndex - 1 + this.searchResults.length) % this.searchResults.length;
      const node = this.searchResults[this.currentIndex];
      this.expandToPath(node.path);
      this.$emit('select', node.path);
    },
    expandAll() {
      this.isRootExpanded = true;
      this.toggleAll(this.nodes, true);
    },
    collapseAll() {
      this.toggleAll(this.nodes, false);
    },
    toggleAll(nodes, expanded) {
      nodes.forEach(node => {
        node.isExpanded = expanded;
        if (node.children && node.children.length > 0) {
          this.toggleAll(node.children, expanded);
        }
      });
      this.$emit('update:nodes', [...this.nodes]);
    },
    goHome() {
      this.isRootExpanded = true;
      this.collapseAll();
      this.searchKeyword = '';
      this.searchResults = [];
      this.currentIndex = -1;
      this.$emit('select', '');
    },
    handleToggle(path) {
      this.toggleNode(this.nodes, path);
      this.$emit('update:nodes', [...this.nodes]);
    },
    toggleNode(nodes, path) {
      nodes.forEach(node => {
        if (node.path === path) {
          node.isExpanded = !node.isExpanded;
        } else if (node.children && node.children.length > 0) {
          this.toggleNode(node.children, path);
        }
      });
    },
    handleNodeClick(node) {
      this.$emit('select', node.path);
    },
    expandToPath(path) {
      if (!path) return;
      
      this.isRootExpanded = true;
      
      const parts = path.split(/[\.\[\]]/).filter(p => p);
      let currentPath = '';
      
      parts.forEach((part, index) => {
        if (!isNaN(parseInt(part))) {
          currentPath += `[${part}]`;
        } else {
          currentPath += (index > 0 && !currentPath.endsWith('[')) ? `.${part}` : part;
        }
        this.expandNode(this.nodes, currentPath);
      });
      
      this.$emit('update:nodes', [...this.nodes]);
    },
    expandNode(nodes, path) {
      nodes.forEach(node => {
        if (node.path === path) {
          node.isExpanded = true;
        }
        if (node.children && node.children.length > 0) {
          this.expandNode(node.children, path);
        }
      });
    }
  }
};
</script>

<style scoped>
.tree-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid #ccc;
}

.tree-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(180deg, #f5f7fa 0%, #e4e8ec 100%);
  border-bottom: 1px solid #ccc;
  flex-wrap: wrap;
  gap: 8px;
}

.header-title {
  font-weight: bold;
  color: #333;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.search-label {
  font-size: 12px;
  color: #666;
}

.search-input {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 3px;
  width: 120px;
}

.search-btn, .nav-btn, .expand-btn, .home-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover, .nav-btn:hover, .expand-btn:hover, .home-btn:hover {
  background: #e8f0fe;
  border-color: #4a90d9;
}

.search-btn {
  background: #4a90d9;
  color: #fff;
  border-color: #4a90d9;
}

.search-btn:hover {
  background: #3a7fc8;
}

.tree-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  background: #fff;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}

.tree-container {
  padding: 8px;
  min-width: fit-content;
}

.tree-root {
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
}

.root-node {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-weight: bold;
  color: #333;
  background: #f0f4f8;
  border-radius: 3px;
  margin-bottom: 4px;
}

.root-node:hover {
  background: #e4e8ec;
}

.root-node .expand-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 11px;
  font-weight: bold;
  color: #666;
  cursor: pointer;
  border-radius: 2px;
  background: #e4e8ec;
  user-select: none;
}

.root-node .expand-btn:hover {
  background: #c8d5e3;
}

.root-icon {
  color: #4a90d9;
}

.root-label {
  color: #333;
}

.tree-nodes {
  padding-left: 8px;
}
</style>
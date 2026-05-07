<template>
  <div class="tree-node-wrapper">
    <div
      class="tree-node"
      :class="{
        'is-selected': selectedPath === node.path,
        'is-search-match': isSearchMatch,
        'is-current-match': isCurrentMatch
      }"
      :style="{ paddingLeft: `${12 + level * 16}px` }"
      @click="handleClick"
    >
      <span class="expand-btn" v-if="hasChildren" @click.stop="handleToggle">
        {{ node.isExpanded ? '−' : '+' }}
      </span>
      <span class="expand-placeholder" v-else></span>
      
      <span class="node-icon" :class="getNodeIconClass()">
        {{ getNodeIcon() }}
      </span>
      
      <span class="node-key">{{ node.key }}</span>
      <span class="node-separator" v-if="!isArrayIndex">:</span>
      <span class="node-value" :class="getValueClass()">
        {{ getDisplayValue() }}
      </span>
    </div>
    
    <div v-if="hasChildren && node.isExpanded" class="node-children">
      <TreeNode
        v-for="child in node.children"
        :key="child.path"
        :node="child"
        :level="level + 1"
        :search-results="searchResults"
        :current-index="currentIndex"
        :selected-path="selectedPath"
        @toggle="$emit('toggle', $event)"
        @click="$emit('click', $event)"
      />
    </div>
  </div>
</template>

<script>
import { detectValueType, getNodeValue } from '../utils/jsonParser';

export default {
  name: 'TreeNode',
  props: {
    node: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    },
    searchResults: {
      type: Array,
      default: () => []
    },
    currentIndex: {
      type: Number,
      default: -1
    },
    selectedPath: {
      type: String,
      default: ''
    }
  },
  computed: {
    hasChildren() {
      return this.node.children && this.node.children.length > 0;
    },
    isArrayIndex() {
      return !isNaN(parseInt(this.node.key));
    },
    isSearchMatch() {
      return this.searchResults.some(r => r.path === this.node.path);
    },
    isCurrentMatch() {
      return this.isSearchMatch && 
             this.searchResults[this.currentIndex]?.path === this.node.path;
    }
  },
  methods: {
    handleToggle() {
      this.$emit('toggle', this.node.path);
    },
    handleClick() {
      this.$emit('click', this.node);
    },
    getNodeIcon() {
      if (this.node.type === 'array') {
        return '[]';
      } else if (this.node.type === 'object') {
        return '{}';
      }
      return '';
    },
    getNodeIconClass() {
      if (this.node.type === 'array') {
        return 'icon-array';
      } else if (this.node.type === 'object') {
        return 'icon-object';
      }
      return '';
    },
    getDisplayValue() {
      if (this.node.type === 'array' || this.node.type === 'object') {
        const count = this.node.children.length;
        return this.node.type === 'array' ? `Array[${count}]` : `Object[${count}]`;
      }
      return getNodeValue(this.node);
    },
    getValueClass() {
      const valueType = detectValueType(this.node.value);
      return `value-${valueType}`;
    }
  }
};
</script>

<style scoped>
.tree-node-wrapper {
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 12px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 4px;
  margin: 1px 0;
  cursor: pointer;
  border-radius: 2px;
  transition: background-color 0.15s;
  white-space: nowrap;
}

.tree-node:hover {
  background-color: #e8f0fe;
}

.tree-node.is-selected {
  background-color: #b3d9ff;
}

.tree-node.is-search-match {
  background-color: #fff3cd;
}

.tree-node.is-current-match {
  background-color: #ffeeba;
  border-left: 2px solid #f0ad4e;
}

.expand-btn {
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
  flex-shrink: 0;
}

.expand-btn:hover {
  background: #c8d5e3;
}

.expand-placeholder {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.node-icon {
  font-size: 10px;
  font-weight: bold;
  flex-shrink: 0;
}

.icon-array {
  color: #10b981;
}

.icon-object {
  color: #4a90d9;
}

.node-key {
  color: #37352f;
  font-weight: 500;
}

.node-separator {
  color: #666;
}

.node-value {
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.value-string {
  color: #0d9446;
}

.value-number {
  color: #0a7bff;
}

.value-boolean {
  color: #7c4dff;
}

.value-null {
  color: #999;
}

.value-date, .value-datetime {
  color: #ff6b35;
}

.value-url, .value-image_url {
  color: #00bcd4;
  text-decoration: underline;
}

.value-timestamp {
  color: #ff5722;
}

.node-children {
  position: relative;
}

.node-children::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: #e4e8ec;
}
</style>
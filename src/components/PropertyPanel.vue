<template>
  <div class="property-panel">
    <div class="panel-header">
      <div class="header-title">属性</div>
    </div>
    <div class="panel-body">
      <div v-if="!selectedNode && !selectedPath" class="empty-state">
        请在中间视图选择节点
      </div>
      
      <div v-else-if="!selectedNode" class="loading-state">
        加载中...
      </div>
      
      <div v-else class="property-content">
        <table class="property-table">
          <thead>
            <tr>
              <th class="col-name">Name</th>
              <th class="col-value">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span class="label">路径</span></td>
              <td><span class="value path-value">{{ selectedNode.path }}</span></td>
            </tr>
            <tr>
              <td><span class="label">类型</span></td>
              <td><span class="value type-value">{{ formatType(selectedNode.type) }}</span></td>
            </tr>
            <tr>
              <td><span class="label">值</span></td>
              <td><span class="value" :class="getValueClass()">{{ formatValue(selectedNode.value) }}</span></td>
            </tr>
            <tr v-if="selectedNode.children && selectedNode.children.length > 0">
              <td><span class="label">子节点数量</span></td>
              <td><span class="value">{{ selectedNode.children.length }}</span></td>
            </tr>
          </tbody>
        </table>
        
        <div v-if="selectedNode.children && selectedNode.children.length > 0" class="children-section">
          <div class="section-title">子属性</div>
          <table class="children-table">
            <thead>
              <tr>
                <th class="col-name">Name</th>
                <th class="col-value">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="child in selectedNode.children"
                :key="child.path"
                class="child-row"
                @click="$emit('selectChild', child.path)"
              >
                <td><span class="child-name">{{ child.key }}</span></td>
                <td>
                  <span class="child-value" :class="getChildValueClass(child)">
                    {{ formatChildValue(child) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="actions-section">
          <button class="action-btn" @click="copyKey">复制键名</button>
          <button class="action-btn" @click="copyValue">复制值</button>
          <button class="action-btn" @click="copyPath">复制路径</button>
          <button class="action-btn" @click="copyJson">复制JSON</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { detectValueType } from '../utils/jsonParser';

export default {
  name: 'PropertyPanel',
  props: {
    selectedNode: {
      type: Object,
      default: null
    },
    selectedPath: {
      type: String,
      default: ''
    }
  },
  methods: {
    formatType(type) {
      const typeMap = {
        'string': '字符串',
        'number': '数字',
        'boolean': '布尔值',
        'object': '对象',
        'array': '数组',
        'null': 'Null'
      };
      return typeMap[type] || type;
    },
    formatValue(value) {
      if (value === null) return 'null';
      if (typeof value === 'boolean') return value ? 'true' : 'false';
      if (typeof value === 'object') {
        return JSON.stringify(value, null, 2);
      }
      if (typeof value === 'number' && value.toString().length === 13) {
        return `${value} (${new Date(value).toLocaleString()})`;
      }
      if (typeof value === 'string' && value.length > 100) {
        return value.substring(0, 100) + '...';
      }
      return value;
    },
    formatChildValue(child) {
      if (child.type === 'object' || child.type === 'array') {
        const count = child.children.length;
        return child.type === 'array' ? `Array[${count}]` : `Object[${count}]`;
      }
      if (child.value === null) return 'null';
      if (typeof child.value === 'boolean') return child.value ? 'true' : 'false';
      if (typeof child.value === 'string') {
        const displayValue = child.value.length > 50 ? child.value.substring(0, 50) + '...' : child.value;
        return `"${displayValue}"`;
      }
      return child.value;
    },
    getValueClass() {
      if (!this.selectedNode) return '';
      const valueType = detectValueType(this.selectedNode.value);
      return `value-${valueType}`;
    },
    getChildValueClass(child) {
      const valueType = detectValueType(child.value);
      return `value-${valueType}`;
    },
    copyKey() {
      if (!this.selectedNode) return;
      navigator.clipboard.writeText(this.selectedNode.key).then(() => {
        this.$emit('showToast', '复制成功', 'success');
      });
    },
    copyValue() {
      if (!this.selectedNode) return;
      const value = typeof this.selectedNode.value === 'object' 
        ? JSON.stringify(this.selectedNode.value, null, 2)
        : String(this.selectedNode.value);
      navigator.clipboard.writeText(value).then(() => {
        this.$emit('showToast', '复制成功', 'success');
      });
    },
    copyPath() {
      if (!this.selectedNode) return;
      navigator.clipboard.writeText(this.selectedNode.path).then(() => {
        this.$emit('showToast', '复制成功', 'success');
      });
    },
    copyJson() {
      if (!this.selectedNode) return;
      const data = this.buildJsonFromNode(this.selectedNode);
      navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
        this.$emit('showToast', '复制成功', 'success');
      });
    },
    buildJsonFromNode(node) {
      if (node.type === 'object') {
        const obj = {};
        node.children.forEach(child => {
          obj[child.key] = this.buildJsonFromNode(child);
        });
        return obj;
      }
      if (node.type === 'array') {
        return node.children.map(child => this.buildJsonFromNode(child));
      }
      return node.value;
    }
  }
};
</script>

<style scoped>
.property-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: linear-gradient(180deg, #f5f7fa 0%, #e4e8ec 100%);
  border-bottom: 1px solid #ccc;
}

.header-title {
  font-weight: bold;
  color: #333;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  background: #fff;
  padding: 12px;
}

.empty-state, .loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 14px;
}

.property-content {
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 12px;
}

.property-table, .children-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.property-table th, .children-table th {
  text-align: left;
  padding: 6px 8px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e8ec;
  font-weight: 600;
  color: #666;
}

.property-table td, .children-table td {
  padding: 6px 8px;
  border-bottom: 1px solid #f0f0f0;
}

.label {
  color: #666;
  font-weight: 500;
}

.value {
  color: #333;
  word-break: break-all;
}

.path-value {
  color: #4a90d9;
}

.type-value {
  color: #7c4dff;
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
  cursor: pointer;
}

.value-timestamp {
  color: #ff5722;
}

.children-section {
  margin-top: 16px;
}

.section-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e4e8ec;
}

.child-row {
  cursor: pointer;
}

.child-row:hover {
  background: #f8fafc;
}

.child-name {
  color: #37352f;
  font-weight: 500;
}

.child-value {
  color: #666;
}

.actions-section {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e8ec;
}

.action-btn {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background: #fff;
  cursor: pointer;
  color: #333;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e8f0fe;
  border-color: #4a90d9;
}
</style>
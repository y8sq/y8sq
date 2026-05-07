<template>
  <div class="json-editor">
    <div class="editor-header">
      <div class="header-title">JSON数据</div>
      <div class="toolbar">
        <button class="tool-btn" @click="handleCopy" title="复制">复制</button>
        <button class="tool-btn" @click="handleFormat" title="格式化">格式化</button>
        <button class="tool-btn" @click="handleCompress" title="删除空格">删除空格</button>
        <button class="tool-btn" @click="handleEscape" title="删除空格并转义">删除空格并转义</button>
        <button class="tool-btn" @click="handleUnescape" title="去除转义">去除转义</button>
      </div>
    </div>
    <div class="editor-body">
      <textarea
        ref="textArea"
        v-model="localText"
        class="json-textarea"
        placeholder="请输入JSON文本..."
        @input="handleInput"
        @change="handleInput"
      ></textarea>
    </div>
    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
import { formatJson, compressJson, escapeJson, unescapeJson, validateJson } from '../utils/jsonParser';

export default {
  name: 'JsonEditor',
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      localText: this.value,
      error: ''
    };
  },
  watch: {
    value(newVal) {
      if (newVal !== this.localText) {
        this.localText = newVal;
      }
    }
  },
  methods: {
    handleInput() {
      const validation = validateJson(this.localText);
      this.error = validation.valid ? '' : validation.error;
      this.$emit('input', this.localText, validation);
    },
    handleCopy() {
      navigator.clipboard.writeText(this.localText).then(() => {
        this.$emit('showToast', '复制成功', 'success');
      }).catch(() => {
        this.$emit('showToast', '复制失败', 'error');
      });
    },
    handleFormat() {
      const formatted = formatJson(this.localText, 2);
      this.localText = formatted;
      this.handleInput();
    },
    handleCompress() {
      const compressed = compressJson(this.localText);
      this.localText = compressed;
      this.handleInput();
    },
    handleEscape() {
      const escaped = escapeJson(this.localText);
      this.localText = escaped;
      this.handleInput();
    },
    handleUnescape() {
      const unescaped = unescapeJson(this.localText);
      this.localText = unescaped;
      this.handleInput();
    },
    highlightText(path) {
      const textarea = this.$refs.textArea;
      if (!textarea || !path) return;
      
      const text = textarea.value;
      const parts = path.split(/[\.\[\]]/).filter(p => p);
      let searchStr = '';
      
      parts.forEach((part, index) => {
        if (!isNaN(parseInt(part))) {
          searchStr += `[${part}]`;
        } else {
          if (index > 0 && !searchStr.endsWith('[')) {
            searchStr += '.';
          }
          searchStr += `"${part}"`;
        }
      });
      
      const index = text.indexOf(searchStr);
      if (index !== -1) {
        textarea.focus();
        textarea.setSelectionRange(index, index + searchStr.length);
        textarea.scrollTop = this.getScrollTopForIndex(index);
      }
    },
    getScrollTopForIndex(index) {
      const textarea = this.$refs.textArea;
      const lines = textarea.value.substring(0, index).split('\n');
      return lines.length * 16;
    }
  }
};
</script>

<style scoped>
.json-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid #ccc;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: linear-gradient(180deg, #f5f7fa 0%, #e4e8ec 100%);
  border-bottom: 1px solid #ccc;
}

.header-title {
  font-weight: bold;
  color: #333;
}

.toolbar {
  display: flex;
  gap: 4px;
}

.tool-btn {
  padding: 4px 10px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 3px;
  background: #fff;
  cursor: pointer;
  color: #333;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #e8f0fe;
  border-color: #4a90d9;
}

.editor-body {
  flex: 1;
  overflow: hidden;
}

.json-textarea {
  width: 100%;
  height: 100%;
  padding: 12px;
  font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
  border: none;
  outline: none;
  resize: none;
  background: #fff;
  color: #333;
}

.json-textarea::placeholder {
  color: #999;
}

.error-message {
  padding: 8px 12px;
  background: #ffeaea;
  color: #d93026;
  font-size: 12px;
  border-top: 1px solid #ffccc7;
}
</style>
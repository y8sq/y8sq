<template>
  <div class="json-preview-container">
    <Toast ref="toastRef" />
    <div class="preview-layout" ref="layoutRef">
      <div class="panel panel-left" :style="{ width: leftWidth + 'px' }">
        <JsonEditor
          ref="editorRef"
          :value="jsonText"
          @input="handleJsonInput"
          @showToast="showToast"
        />
      </div>
      
      <div 
        class="resizer resizer-left" 
        @mousedown="startResizeLeft"
        :class="{ 'is-resizing': isResizingLeft }"
      ></div>
      
      <div class="panel panel-center" :style="{ width: centerWidth + 'px' }">
        <TreeView
          :nodes="treeNodes"
          :selected-path="selectedPath"
          @select="handleNodeSelect"
        />
      </div>
      
      <div 
        class="resizer resizer-right" 
        @mousedown="startResizeRight"
        :class="{ 'is-resizing': isResizingRight }"
      ></div>
      
      <div class="panel panel-right" :style="{ width: rightWidth + 'px' }">
        <PropertyPanel
          :selected-node="selectedNode"
          :selected-path="selectedPath"
          @select-child="handleNodeSelect"
          @showToast="showToast"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import JsonEditor from '../components/JsonEditor.vue';
import TreeView from '../components/TreeView.vue';
import PropertyPanel from '../components/PropertyPanel.vue';
import Toast from '../components/Toast.vue';
import { parseJsonToTree, getNodeByPath } from '../utils/jsonParser';

export default {
  name: 'JsonPreview',
  components: {
    JsonEditor,
    TreeView,
    PropertyPanel,
    Toast
  },
  setup() {
    const jsonText = ref('');
    const treeNodes = ref([]);
    const selectedPath = ref('');
    const leftWidth = ref(0);
    const centerWidth = ref(0);
    const rightWidth = ref(0);
    const editorRef = ref(null);
    const layoutRef = ref(null);
    const toastRef = ref(null);
    const isResizingLeft = ref(false);
    const isResizingRight = ref(false);
    
    const selectedNode = computed(() => {
      if (!selectedPath.value || treeNodes.value.length === 0) {
        return null;
      }
      return getNodeByPath(treeNodes.value, selectedPath.value);
    });
    
    const handleJsonInput = (text, validation) => {
      jsonText.value = text;
      
      if (validation.empty) {
        treeNodes.value = [];
        selectedPath.value = '';
      } else if (validation.valid) {
        treeNodes.value = parseJsonToTree(text) || [];
        selectedPath.value = '';
      } else {
        treeNodes.value = [];
        selectedPath.value = '';
      }
    };
    
    const handleNodeSelect = (path) => {
      selectedPath.value = path;
      if (editorRef.value) {
        editorRef.value.highlightText(path);
      }
    };
    
    const showToast = (message, type = 'success') => {
      if (toastRef.value) {
        toastRef.value.addToast(message, type);
      }
    };
    
    const startResizeLeft = (e) => {
      e.preventDefault();
      isResizingLeft.value = true;
      
      const startX = e.clientX;
      const startLeftWidth = leftWidth.value;
      
      const handleMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        const newLeftWidth = Math.max(200, Math.min(startLeftWidth + deltaX, 600));
        const containerWidth = layoutRef.value?.offsetWidth || window.innerWidth;
        
        const remainingWidth = containerWidth - newLeftWidth - 12;
        const centerRatio = 2 / 3;
        const rightRatio = 1 / 3;
        
        leftWidth.value = newLeftWidth;
        centerWidth.value = Math.max(200, Math.floor(remainingWidth * centerRatio));
        rightWidth.value = Math.max(250, remainingWidth - centerWidth.value);
      };
      
      const handleMouseUp = () => {
        isResizingLeft.value = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    const startResizeRight = (e) => {
      e.preventDefault();
      isResizingRight.value = true;
      
      const startX = e.clientX;
      const startCenterWidth = centerWidth.value;
      
      const handleMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        const containerWidth = layoutRef.value?.offsetWidth || window.innerWidth;
        const remainingWidth = containerWidth - leftWidth.value - 12;
        
        const newCenterWidth = Math.max(200, Math.min(startCenterWidth + deltaX, remainingWidth - 250));
        centerWidth.value = newCenterWidth;
        rightWidth.value = Math.max(250, remainingWidth - newCenterWidth);
      };
      
      const handleMouseUp = () => {
        isResizingRight.value = false;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleWindowResize = () => {
      const containerWidth = layoutRef.value?.offsetWidth || window.innerWidth;
      const totalResizerWidth = 12;
      const remainingWidth = containerWidth - totalResizerWidth;
      
      const leftRatio = 1 / 4;
      const centerRatio = 2 / 4;
      const rightRatio = 1 / 4;
      
      leftWidth.value = Math.max(200, Math.floor(remainingWidth * leftRatio));
      centerWidth.value = Math.max(200, Math.floor(remainingWidth * centerRatio));
      rightWidth.value = Math.max(250, remainingWidth - leftWidth.value - centerWidth.value);
    };
    
    onMounted(() => {
      const defaultJson = `{
  "data": [
    {
      "id": 31,
      "sampleOrderId": 26,
      "sampleClothesDtlId": 102,
      "sampleClothesStockId": 419,
      "borrowStart": "2026-05-11",
      "borrowEnd": "2026-05-13",
      "purpose": "见客",
      "status": 1,
      "createdAt": 1778124282068,
      "updatedAt": 1778124282068,
      "series": "LAB | loomina102",
      "gauge": "16gg、松字码",
      "weaveName": "单边、挑孔",
      "styleNo": "FW26-L17-2",
      "styleImg1": "https://resources-cn.upwhk.com.cn/pre-test/image/sample/1776742909120.jpg",
      "borrowDay": 3
    },
    {
      "id": 30,
      "sampleOrderId": 26,
      "sampleClothesDtlId": 98,
      "sampleClothesStockId": 390,
      "borrowStart": "2026-05-13",
      "borrowEnd": "2026-05-15",
      "purpose": "国内展会",
      "status": 1,
      "createdAt": 1778124282068,
      "updatedAt": 1778124282068,
      "series": "LAB | loomina103",
      "gauge": "16gg、松字码",
      "weaveName": "单边、挑孔",
      "styleNo": "FW26-L17",
      "styleImg1": "https://resources-cn.upwhk.com.cn/pre-test/image/sample/1776742879627.jpg",
      "borrowDay": 10
    }
  ],
  "total": 2,
  "success": true
}`;
      
      jsonText.value = defaultJson;
      treeNodes.value = parseJsonToTree(defaultJson) || [];
      
      window.addEventListener('resize', handleWindowResize);
      setTimeout(() => {
        handleWindowResize();
      }, 100);
    });
    
    onUnmounted(() => {
      window.removeEventListener('resize', handleWindowResize);
    });
    
    return {
      jsonText,
      treeNodes,
      selectedPath,
      selectedNode,
      leftWidth,
      centerWidth,
      rightWidth,
      editorRef,
      layoutRef,
      toastRef,
      isResizingLeft,
      isResizingRight,
      handleJsonInput,
      handleNodeSelect,
      showToast,
      startResizeLeft,
      startResizeRight
    };
  }
};
</script>

<style scoped>
.json-preview-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.preview-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.panel-left {
  min-width: 200px;
  max-width: 600px;
}

.panel-center {
  min-width: 200px;
  max-width: 800px;
}

.panel-right {
  min-width: 250px;
  flex: 1;
}

.resizer {
  width: 6px;
  cursor: col-resize;
  background: #e4e8ec;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.resizer:hover,
.resizer.is-resizing {
  background: #4a90d9;
}

.resizer::after {
  content: '';
  width: 2px;
  height: 20px;
  background: #999;
  border-radius: 1px;
}

.resizer:hover::after,
.resizer.is-resizing::after {
  background: #fff;
}
</style>
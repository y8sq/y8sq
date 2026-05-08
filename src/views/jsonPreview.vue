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
        class="resizer"
        @mousedown="startResizeLeft"
        :class="{ 'is-dragging': isDragging === 'left' }"
      ></div>

      <div 
        class="ghost-line ghost-left" 
        v-if="isDragging === 'left'" 
        :style="{ left: (targetLeftWidth + 6) + 'px' }"
      ></div>

      <div class="panel panel-center" :style="{ width: centerWidth + 'px' }">
        <TreeView
          :nodes="treeNodes"
          :selected-path="selectedPath"
          @select="handleNodeSelect"
        />
      </div>

      <div
        class="resizer"
        @mousedown="startResizeRight"
        :class="{ 'is-dragging': isDragging === 'right' }"
      ></div>

      <div 
        class="ghost-line ghost-right" 
        v-if="isDragging === 'right'" 
        :style="{ left: targetRightLine + 'px' }"
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
import JsonEditor from "../components/JsonEditor.vue";
import TreeView from "../components/TreeView.vue";
import PropertyPanel from "../components/PropertyPanel.vue";
import Toast from "../components/Toast.vue";
import { parseJsonToTree, getNodeByPath } from "../utils/jsonParser";

export default {
  name: "JsonPreview",
  components: {
    JsonEditor,
    TreeView,
    PropertyPanel,
    Toast,
  },
  data() {
    return {
      jsonText: "",
      treeNodes: [],
      selectedPath: "",
      leftWidth: 0,
      centerWidth: 0,
      rightWidth: 0,
      targetLeftWidth: 0,
      targetCenterWidth: 0,
      targetRightWidth: 0,
      targetRightLine: 0,
      isDragging: false,
    };
  },
  computed: {
    selectedNode() {
      if (!this.selectedPath || this.treeNodes.length === 0) {
        return null;
      }
      return getNodeByPath(this.treeNodes, this.selectedPath);
    },
  },
  mounted() {
    window.addEventListener("resize", this.handleWindowResize);
    this.$nextTick(() => {
      this.handleWindowResize();
    });
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleWindowResize);
  },
  methods: {
    handleJsonInput(text, validation) {
      this.jsonText = text;

      if (validation.empty) {
        this.treeNodes = [];
        this.selectedPath = "";
      } else if (validation.valid) {
        this.treeNodes = parseJsonToTree(text) || [];
        this.selectedPath = "";
      } else {
        this.treeNodes = [];
        this.selectedPath = "";
      }
    },
    handleNodeSelect(path) {
      this.selectedPath = path;
      if (this.$refs.editorRef) {
        this.$refs.editorRef.highlightText(path);
      }
    },
    showToast(message, type = "success") {
      if (this.$refs.toastRef) {
        this.$refs.toastRef.addToast(message, type);
      }
    },
    startResizeLeft(e) {
      e.preventDefault();
      this.isDragging = 'left';
      this.targetLeftWidth = this.leftWidth;
      this.targetCenterWidth = this.centerWidth;

      const startX = e.clientX;
      const startLeftWidth = this.leftWidth;
      const startCenterWidth = this.centerWidth;
      const containerWidth = this.$refs.layoutRef?.offsetWidth || window.innerWidth;

      const handleMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        const newLeftWidth = Math.max(300, Math.min(startLeftWidth + deltaX, containerWidth - 700));
        const delta = newLeftWidth - startLeftWidth;
        const newCenterWidth = Math.max(400, startCenterWidth - delta);
        
        this.targetLeftWidth = newLeftWidth;
        this.targetCenterWidth = newCenterWidth;
      };

      const handleMouseUp = () => {
        this.leftWidth = this.targetLeftWidth;
        this.centerWidth = this.targetCenterWidth;
        this.isDragging = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    startResizeRight(e) {
      e.preventDefault();
      this.isDragging = 'right';
      this.targetCenterWidth = this.centerWidth;
      this.targetRightWidth = this.rightWidth;
      this.targetRightLine = this.leftWidth + 6 + this.centerWidth + 6;

      const startX = e.clientX;
      const startRightLine = this.leftWidth + 6 + this.centerWidth + 6;

      const handleMouseMove = (e) => {
        const newRightLine = Math.max(this.leftWidth + 6 + 400 + 6, Math.min(e.clientX, this.leftWidth + 6 + this.centerWidth + 6 + this.rightWidth - 300));
        const newCenterWidth = newRightLine - this.leftWidth - 6 - 6;
        const newRightWidth = this.leftWidth + 6 + this.centerWidth + 6 + this.rightWidth - newRightLine;
        
        this.targetRightLine = newRightLine;
        this.targetCenterWidth = newCenterWidth;
        this.targetRightWidth = newRightWidth;
      };

      const handleMouseUp = () => {
        this.centerWidth = this.targetCenterWidth;
        this.rightWidth = this.targetRightWidth;
        this.isDragging = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    handleWindowResize() {
      const containerWidth = this.$refs.layoutRef?.offsetWidth || window.innerWidth;
      const totalResizerWidth = 12;
      const remainingWidth = containerWidth - totalResizerWidth;
      
      const leftRatio = 1 / 4;
      const centerRatio = 2 / 4;
      
      this.leftWidth = Math.floor(remainingWidth * leftRatio);
      this.centerWidth = Math.floor(remainingWidth * centerRatio);
      this.rightWidth = remainingWidth - this.leftWidth - this.centerWidth;
      
      this.targetLeftWidth = this.leftWidth;
      this.targetCenterWidth = this.centerWidth;
      this.targetRightWidth = this.rightWidth;
      this.targetRightLine = this.leftWidth + 6 + this.centerWidth + 6;
    },
  },
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
  position: relative;
}

.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.panel-left {
  min-width: 300px;
}

.panel-center {
  min-width: 400px;
}

.panel-right {
  min-width: 300px;
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
  z-index: 10;
}

.resizer:hover,
.resizer.is-dragging {
  background: #4a90d9;
}

.resizer::after {
  content: "";
  width: 2px;
  height: 20px;
  background: #999;
  border-radius: 1px;
}

.resizer:hover::after,
.resizer.is-dragging::after {
  background: #fff;
}

.ghost-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #4a90d9;
  z-index: 100;
  pointer-events: none;
  opacity: 0.8;
}

.ghost-line::before,
.ghost-line::after {
  content: "";
  position: absolute;
  left: -5px;
  width: 0;
  height: 0;
  border-style: solid;
}

.ghost-left::before,
.ghost-left::after {
  border-width: 8px 5px 8px 0;
  border-color: transparent #4a90d9 transparent transparent;
}

.ghost-left::before {
  top: 0;
}

.ghost-left::after {
  bottom: 0;
}

.ghost-right::before,
.ghost-right::after {
  border-width: 8px 0 8px 5px;
  border-color: transparent transparent transparent #4a90d9;
}

.ghost-right::before {
  top: 0;
}

.ghost-right::after {
  bottom: 0;
}
</style>

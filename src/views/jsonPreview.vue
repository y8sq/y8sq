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
      isResizingLeft: false,
      isResizingRight: false,
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
    const defaultJson = ``;
    this.jsonText = defaultJson;
    this.treeNodes = parseJsonToTree(defaultJson) || [];

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
      this.isResizingLeft = true;

      const startX = e.clientX;
      const startLeftWidth = this.leftWidth;

      const handleMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        const newLeftWidth = Math.max(
          200,
          Math.min(startLeftWidth + deltaX, 600),
        );
        const containerWidth =
          this.$refs.layoutRef?.offsetWidth || window.innerWidth;

        const remainingWidth = containerWidth - newLeftWidth - 12;
        const centerRatio = 2 / 3;

        this.leftWidth = newLeftWidth;
        this.centerWidth = Math.max(
          200,
          Math.floor(remainingWidth * centerRatio),
        );
        this.rightWidth = Math.max(250, remainingWidth - this.centerWidth);
      };

      const handleMouseUp = () => {
        this.isResizingLeft = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    startResizeRight(e) {
      e.preventDefault();
      this.isResizingRight = true;

      const startX = e.clientX;
      const startCenterWidth = this.centerWidth;

      const handleMouseMove = (e) => {
        const deltaX = e.clientX - startX;
        const containerWidth =
          this.$refs.layoutRef?.offsetWidth || window.innerWidth;
        const remainingWidth = containerWidth - this.leftWidth - 12;

        const newCenterWidth = Math.max(
          200,
          Math.min(startCenterWidth + deltaX, remainingWidth - 250),
        );
        this.centerWidth = newCenterWidth;
        this.rightWidth = Math.max(250, remainingWidth - newCenterWidth);
      };

      const handleMouseUp = () => {
        this.isResizingRight = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    handleWindowResize() {
      const containerWidth =
        this.$refs.layoutRef?.offsetWidth || window.innerWidth;
      const totalResizerWidth = 12;
      const remainingWidth = containerWidth - totalResizerWidth;

      const leftRatio = 1 / 4;
      const centerRatio = 2 / 4;

      this.leftWidth = Math.max(200, Math.floor(remainingWidth * leftRatio));
      this.centerWidth = Math.max(
        200,
        Math.floor(remainingWidth * centerRatio),
      );
      this.rightWidth = Math.max(
        250,
        remainingWidth - this.leftWidth - this.centerWidth,
      );
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
  content: "";
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

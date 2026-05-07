<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="toast.type"
      >
        <span class="toast-icon">{{ getIcon(toast.type) }}</span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" @click="removeToast(toast.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
import { ref } from 'vue';

const toasts = ref([]);
let toastId = 0;

export default {
  name: 'Toast',
  setup() {
    const addToast = (message, type = 'success', duration = 3000) => {
      const id = ++toastId;
      toasts.value.push({ id, message, type });
      
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      
      return id;
    };
    
    const removeToast = (id) => {
      const index = toasts.value.findIndex(t => t.id === id);
      if (index !== -1) {
        toasts.value.splice(index, 1);
      }
    };
    
    const getIcon = (type) => {
      const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
      };
      return icons[type] || icons.info;
    };
    
    return {
      toasts,
      addToast,
      removeToast,
      getIcon
    };
  },
  provide() {
    return {
      $toast: {
        success: (msg) => this.addToast(msg, 'success'),
        error: (msg) => this.addToast(msg, 'error'),
        warning: (msg) => this.addToast(msg, 'warning'),
        info: (msg) => this.addToast(msg, 'info')
      }
    };
  }
};
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  max-width: 400px;
  background: #fff;
}

.toast-icon {
  font-size: 16px;
  font-weight: bold;
}

.toast-success {
  border-left: 4px solid #10b981;
}

.toast-success .toast-icon {
  color: #10b981;
}

.toast-error {
  border-left: 4px solid #ef4444;
}

.toast-error .toast-icon {
  color: #ef4444;
}

.toast-warning {
  border-left: 4px solid #f59e0b;
}

.toast-warning .toast-icon {
  color: #f59e0b;
}

.toast-info {
  border-left: 4px solid #3b82f6;
}

.toast-info .toast-icon {
  color: #3b82f6;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.toast-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #999;
  padding: 0;
  line-height: 1;
}

.toast-close:hover {
  color: #333;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
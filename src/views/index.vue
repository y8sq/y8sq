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
        <div class="logo">
          <h1>网址导航</h1>
          <p></p>
        </div>

        <!-- 搜索框与搜索引擎选择 -->
        <div class="search_container">
          <div class="search_box">
            <select v-model="selectedEngine" class="engine_select">
              <option
                v-for="engine in searchEngines"
                :key="engine.id"
                :value="engine"
              >
                {{ engine.name }}
              </option>
            </select>
            <input
              type="text"
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              placeholder="搜索内容..."
              class="search_input"
            />
            <button class="search_btn" @click="handleSearch">
              <i class="fa fa-search" aria-hidden="true"></i> 搜索
            </button>
          </div>

          <!-- 热门搜索标签 -->
          <div class="hot_tags" v-if="!searchQuery">
            <span class="tag_title">热门搜索:</span>
            <a
              href="#"
              class="hot_tag"
              @click.prevent="searchWithText('AI工具')"
              >AI工具</a
            >
            <a
              href="#"
              class="hot_tag"
              @click.prevent="searchWithText('免费软件')"
              >免费软件</a
            >
            <a
              href="#"
              class="hot_tag"
              @click.prevent="searchWithText('学习资源')"
              >学习资源</a
            >
            <a
              href="#"
              class="hot_tag"
              @click.prevent="searchWithText('影视推荐')"
              >影视推荐</a
            >
            <a
              href="#"
              class="hot_tag"
              @click.prevent="searchWithText('游戏下载')"
              >游戏下载</a
            >
          </div>
        </div>
      </header>

      <!-- 主要内容区域 -->
      <main class="main_content">
        <!-- 遍历所有分类 -->
        <div
          v-for="(category, catIndex) in navigationData"
          :key="catIndex"
          class="category_card"
        >
          <!-- 分类标题 -->
          <div class="category_title">
            <i class="fa fa-folder-open" aria-hidden="true"></i>
            <h2>{{ category.category }}</h2>
            <span class="count">{{ category.sites.length }}</span>
          </div>

          <!-- 网站链接列表 -->
          <ul class="site_list">
            <li
              v-for="(site, siteIndex) in category.sites"
              :key="siteIndex"
              class="site_item"
            >
              <a
                :href="site.url"
                target="_blank"
                class="site_link"
                :title="site.name"
              >
                <div class="site_icon">
                  <img :src="site.icon" :alt="site.name" class="favicon" />
                </div>
                <span class="site_name">{{ site.name }}</span>
              </a>
            </li>
          </ul>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import navigationData from "@/assets/js/data.js";

export default {
  name: "App",
  data() {
    return {
      navigationData,
      searchQuery: "",
      // 搜索引擎配置
      searchEngines: [
        {
          id: "baidu",
          name: "百度",
          url: "https://www.baidu.com/s?wd=",
        },
        {
          id: "google",
          name: "谷歌",
          url: "https://www.google.com/search?q=",
        },
        {
          id: "bing",
          name: "必应",
          url: "https://www.bing.com/search?q=",
        },
        {
          id: "sougou",
          name: "搜狗",
          url: "https://www.sogou.com/web?query=",
        },
        {
          id: "360",
          name: "360搜索",
          url: "https://www.so.com/s?q=",
        },
      ],
      selectedEngine: null,
    };
  },
  created() {
    // 默认选择百度搜索引擎
    this.selectedEngine = this.searchEngines.find(
      (engine) => engine.id === "baidu"
    );
  },
  methods: {
    // 处理搜索，跳转到对应的搜索引擎
    handleSearch() {
      if (!this.searchQuery.trim() || !this.selectedEngine) return;

      const encodedQuery = encodeURIComponent(this.searchQuery.trim());
      const searchUrl = this.selectedEngine.url + encodedQuery;

      // 跳转到搜索引擎结果页
      window.open(searchUrl, "_blank");
    },

    // 使用热门标签搜索
    searchWithText(text) {
      this.searchQuery = text;
      this.handleSearch();
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
.app_container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 头部样式 */
.header {
  padding: 30px 0;
  text-align: center;

  .logo {
    h1 {
      font-size: 36px;
      color: #fff;
      margin-bottom: 10px;
      letter-spacing: 2px;
      text-shadow: 1px 1px 8px #504b4b;
    }

    p {
      color: #fff;
      font-size: 16px;
      margin-bottom: 20px;
    }
  }

  .search_container {
    max-width: 800px;
    margin: 0 auto;

    .search_box {
      display: flex;
      justify-content: center;
      width: 100%;

      .engine_select {
        background-color: white;
        border: 2px solid #4285f4;
        border-right: none;
        padding: 0 15px;
        font-size: 16px;
        border-radius: 6px 0 0 6px;
        outline: none;
        color: #333;
        cursor: pointer;
      }

      .search_input {
        flex: 1;
        height: 48px;
        padding: 0 20px;
        border: 2px solid #4285f4;
        border-right: none;
        border-left: none;
        font-size: 16px;
        outline: none;
      }

      .search_btn {
        background-color: #4285f4;
        color: white;
        border: none;
        padding: 0 25px;
        border-radius: 0 6px 6px 0;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s;
        display: flex;
        align-items: center;
        gap: 8px;

        &:hover {
          background-color: #3367d6;
        }
      }
    }

    /* 热门搜索标签 */
    .hot_tags {
      margin-top: 15px;
      text-align: left;
      padding-left: 5px;

      .tag_title {
        color: #fff;
        font-size: 14px;
        margin-right: 10px;
      }

      .hot_tag {
        display: inline-block;
        color: #333;
        font-size: 14px;
        text-decoration: none;
        margin: 0 8px 8px 0;
        padding: 3px 10px;
        background-color: white;
        border-radius: 12px;
        transition: all 0.2s;
        border: 1px solid #eee;

        &:hover {
          background-color: #f0f7ff;
          color: #4285f4;
          border-color: #dbeaff;
        }
      }
    }
  }
}

/* 主要内容区域 */
.main_content {
  margin-bottom: 40px;

  .category_card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 25px;
    overflow: hidden;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .category_title {
      background-color: #f0f3f9;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e1e5eb;
      justify-content: space-between;

      i {
        color: #4285f4;
        margin-right: 10px;
        font-size: 18px;
      }

      h2 {
        font-size: 18px;
        color: #333;
        font-weight: 600;
        display: flex;
        align-items: center;
      }

      .count {
        font-size: 14px;
        color: #666;
        background-color: rgba(66, 133, 244, 0.1);
        padding: 2px 8px;
        border-radius: 12px;
      }
    }

    .site_list {
      display: flex;
      flex-wrap: wrap;
      padding: 15px 20px;
      list-style: none;

      .site_item {
        width: 12.5%;
        padding: 10px 5px;

        .site_link {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: #333;
          padding: 12px 5px;
          border-radius: 6px;
          transition: all 0.2s;
          height: 100%;
          min-height: 80px;
          justify-content: center;

          &:hover {
            background-color: #f0f7ff;
            color: #4285f4;
            transform: translateY(-2px);
          }

          .site_icon {
            width: 40px;
            height: 40px;
            background-color: #f0f3f9;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 8px;
            overflow: hidden;

            .favicon {
              width: 24px;
              height: 24px;
              object-fit: contain;
            }
          }

          .site_name {
            font-size: 14px;
            text-align: center;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
          }
        }
      }
    }
  }
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .main_content {
    .category_card {
      .site_list {
        .site_item {
          width: 16.666%;
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .main_content {
    .category_card {
      .site_list {
        .site_item {
          width: 20%;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .header {
    .search_container {
      .search_box {
        .engine_select {
          padding: 0 10px;
          font-size: 14px;
        }
      }
    }
  }

  .main_content {
    .category_card {
      .site_list {
        .site_item {
          width: 25%;
        }
      }
    }
  }
}

@media (max-width: 576px) {
  .header {
    .logo {
      h1 {
        font-size: 28px;
      }
    }

    .search_container {
      .search_box {
        .search_btn {
          span {
            display: none;
          }
          padding: 0 15px;
        }

        .engine_select {
          min-width: 60px;
        }
      }
    }
  }

  .main_content {
    .category_card {
      .site_list {
        .site_item {
          width: 33.333%;
        }
      }
    }
  }
}
</style>

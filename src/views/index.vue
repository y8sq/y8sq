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

        <!-- 搜索框与搜索引擎选择（优化：按钮组放在搜索框上方） -->
        <div class="search_container">
          <!-- 1. 搜索引擎按钮组（新增） -->
          <div class="engine_buttons">
            <!-- 本地资源搜索按钮（默认选中） -->
            <button 
              class="engine_btn" 
              :class="{ active: selectedEngine === 'local' }"
              @click="selectedEngine = 'local'"
            >
              <i class="fa fa-database" aria-hidden="true"></i> 本地资源
            </button>
            <!-- 第三方搜索引擎按钮 -->
            <button 
              v-for="engine in searchEngines" 
              :key="engine.id"
              class="engine_btn"
              :class="{ active: selectedEngine === engine.id }"
              @click="selectedEngine = engine.id"
            >
              <i :class="`fa fa-${engine.icon}`" aria-hidden="true"></i> {{ engine.name }}
            </button>
          </div>

          <!-- 2. 搜索框（位置下移） -->
          <div class="search_box">
            <input
              type="text"
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              placeholder="搜索本地资源或网络内容..."
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

      <!-- 主要内容区域（新增：本地搜索结果展示区） -->
      <main class="main_content">
        <!-- 本地搜索结果（有搜索词且选中本地资源时显示） -->
        <div 
          class="local_search_result" 
          v-if="searchQuery && selectedEngine === 'local' && localSearchResult.length"
        >
          <div class="result_title">
            <i class="fa fa-search" aria-hidden="true"></i>
            <h2>本地搜索结果：{{ searchQuery }}（共{{ localSearchResult.length }}条）</h2>
          </div>
          <ul class="result_list">
            <li 
              v-for="(item, index) in localSearchResult" 
              :key="index"
              class="result_item"
            >
              <a 
                :href="item.url" 
                target="_blank" 
                class="result_link"
                :title="item.name"
              >
                <div class="result_icon">
                  <img 
                    :src="require(`@/assets/images/${item.icon}`)" 
                    :alt="item.name"
                    class="result_favicon"
                  >
                </div>
                <div class="result_info">
                  <div class="result_name">{{ item.name }}</div>
                  <div class="result_category">分类：{{ item.category }}</div>
                </div>
              </a>
            </li>
          </ul>
        </div>

        <!-- 无本地搜索结果提示 -->
        <div 
          class="no_result" 
          v-if="searchQuery && selectedEngine === 'local' && !localSearchResult.length"
        >
          <i class="fa fa-info-circle" aria-hidden="true"></i>
          <p>未找到与「{{ searchQuery }}」相关的本地资源，可切换搜索引擎搜索网络内容</p>
        </div>

        <!-- 导航分类列表（无搜索词或未选中本地资源时显示） -->
        <div 
          v-if="!searchQuery || selectedEngine !== 'local'"
          class="navigation_list"
        >
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
                    <img
                      :src="require(`@/assets/images/${site.icon}`)"
                      :alt="site.name"
                      class="favicon"
                    />
                  </div>
                  <span class="site_name">{{ site.name }}</span>
                </a>
              </li>
            </ul>
          </div>
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
      // 搜索引擎配置（新增icon字段用于按钮图标）
      searchEngines: [
        {
          id: "baidu",
          name: "百度",
          url: "https://www.baidu.com/s?wd=",
          icon: "baidu" // 需确保Font Awesome有该图标（若无可替换为"search"）
        },
        {
          id: "google",
          name: "谷歌",
          url: "https://www.google.com/search?q=",
          icon: "google"
        },
        {
          id: "bing",
          name: "必应",
          url: "https://www.bing.com/search?q=",
          icon: "bing"
        },
        {
          id: "sougou",
          name: "搜狗",
          url: "https://www.sogou.com/web?query=",
          icon: "sougou" // 若无该图标可替换为"search"
        },
        {
          id: "360",
          name: "360搜索",
          url: "https://www.so.com/s?q=",
          icon: "360" // 若无该图标可替换为"search"
        },
      ],
      selectedEngine: "local", // 默认选中本地资源搜索
      localSearchResult: [] // 本地搜索结果存储
    };
  },
  methods: {
    // 处理搜索（区分本地搜索和第三方搜索）
    handleSearch() {
      const query = this.searchQuery.trim();
      if (!query) return;

      // 1. 本地资源搜索（默认）
      if (this.selectedEngine === "local") {
        this.searchLocalResources(query);
      } 
      // 2. 第三方搜索引擎搜索
      else {
        const engine = this.searchEngines.find(item => item.id === this.selectedEngine);
        if (engine) {
          const encodedQuery = encodeURIComponent(query);
          const searchUrl = engine.url + encodedQuery;
          window.open(searchUrl, "_blank");
        }
      }
    },

    // 搜索本地导航资源（匹配网站名称或分类）
    searchLocalResources(query) {
      const result = [];
      // 遍历所有分类，匹配网站名称包含搜索词的资源
      this.navigationData.forEach(category => {
        const matchedSites = category.sites.filter(site => 
          site.name.toLowerCase().includes(query.toLowerCase())
        );
        // 给匹配的网站添加分类信息，便于展示
        const formattedSites = matchedSites.map(site => ({
          ...site,
          category: category.category
        }));
        result.push(...formattedSites);
      });
      // 存储搜索结果
      this.localSearchResult = result;
    },

    // 使用热门标签搜索
    searchWithText(text) {
      this.searchQuery = text;
      this.handleSearch();
    }
  }
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

/* 头部样式（重点：新增搜索引擎按钮组样式） */
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

    // 1. 搜索引擎按钮组样式（新增）
    .engine_buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-bottom: 12px;

      .engine_btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border: 1px solid #ddd;
        border-radius: 20px;
        background-color: white;
        color: #333;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;

        // 选中状态样式
        &.active {
          background-color: #4285f4;
          color: white;
          border-color: #4285f4;
        }

        //  hover效果
        &:hover:not(.active) {
          border-color: #4285f4;
          color: #4285f4;
        }

        i {
          font-size: 14px;
        }
      }
    }

    // 2. 搜索框样式（移除原下拉框相关样式）
    .search_box {
      display: flex;
      justify-content: center;
      width: 100%;

      .search_input {
        flex: 1;
        height: 48px;
        padding: 0 20px;
        border: 2px solid #4285f4;
        border-right: none;
        border-radius: 6px 0 0 6px;
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

/* 主要内容区域（新增：本地搜索结果样式） */
.main_content {
  margin-bottom: 40px;

  // 1. 本地搜索结果样式（新增）
  .local_search_result {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 25px;
    overflow: hidden;

    .result_title {
      background-color: #f0f3f9;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      border-bottom: 1px solid #e1e5eb;

      i {
        color: #4285f4;
        margin-right: 10px;
        font-size: 18px;
      }

      h2 {
        font-size: 18px;
        color: #333;
        font-weight: 600;
      }
    }

    .result_list {
      padding: 15px 20px;
      list-style: none;

      .result_item {
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .result_link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #333;
          transition: all 0.2s;

          &:hover {
            color: #4285f4;
          }

          .result_icon {
            width: 36px;
            height: 36px;
            background-color: #f0f3f9;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            overflow: hidden;

            .result_favicon {
              width: 20px;
              height: 20px;
              object-fit: contain;
            }
          }

          .result_info {
            .result_name {
              font-size: 16px;
              margin-bottom: 4px;
            }

            .result_category {
              font-size: 12px;
              color: #666;
            }
          }
        }
      }
    }
  }

  // 2. 无搜索结果提示（新增）
  .no_result {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 40px 20px;
    text-align: center;
    margin-bottom: 25px;

    i {
      color: #4285f4;
      font-size: 24px;
      margin-bottom: 10px;
    }

    p {
      color: #666;
      font-size: 16px;
    }
  }

  // 3. 原有导航分类样式（保留）
  .navigation_list {
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
}

/* 响应式调整（新增按钮组适配） */
@media (max-width: 1200px) {
  .main_content {
    .navigation_list {
      .category_card {
        .site_list {
          .site_item {
            width: 16.666%;
          }
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .main_content {
    .navigation_list {
      .category_card {
        .site_list {
          .site_item {
            width: 20%;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .header {
    .search_container {
      // 按钮组适配：减少内边距
      .engine_buttons {
        .engine_btn {
          padding: 4px 10px;
          font-size: 12px;

          i {
            font-size: 12px;
          }
        }
      }

      .search_box {
        .search_input {
          font-size: 14px;
        }

        .search_btn {
          font-size: 14px;
          padding: 0 20px;
        }
      }
    }
  }

  .main_content {
    .navigation_list {
      .category_card {
        .site_list {
          .site_item {
            width: 25%;
          }
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
      // 按钮组适配：一行显示不下时自动换行
      .engine_buttons {
        gap: 6px;
      }

      .search_box {
        .search_btn {
          span {
            display: none;
          }
          padding: 0 15px;
        }
      }
    }
  }

  .main_content {
    .navigation_list {
      .category_card {
        .site_list {
          .site_item {
            width: 33.333%;
          }
        }
      }
    }

    // 本地搜索结果适配
    .local_search_result {
      .result_list {
        .result_item {
          .result_info {
            .result_name {
              font-size: 14px;
            }
          }
        }
      }
    }
  }
}
</style>
const fs = require("fs").promises;
const path = require("path"); // 添加path模块导入
const cheerio = require("cheerio");

/**
 * 书签解析器 - 严格按照<DT><H3>标签划分层级
 * 每个<DT><H3>标签下的内容直到下一个<DT><H3>都作为其子级
 */
class StrictHierarchyBookmarkParser {
  constructor(inputFilePath, outputFilePath) {
    this.inputPath = path.resolve(inputFilePath);
    this.outputPath = path.resolve(outputFilePath);
    this.$ = null;
    this.result = [];
  }

  /**
   * 加载HTML文件
   */
  async loadFile() {
    try {
      const htmlContent = await fs.readFile(this.inputPath, "utf8");
      this.$ = cheerio.load(htmlContent);
      console.log(`成功加载文件: ${this.inputPath}`);
      // 打印加载的HTML内容片段（前500字符），确认文件内容正确
      console.log("加载的HTML内容片段:", htmlContent.substring(0, 500));
      return true;
    } catch (error) {
      throw new Error(`加载文件失败: ${error.message}`);
    }
  }

  /**
   * 解析单个书签项
   * @param {Cheerio} aElement - A标签元素
   * @returns {Object} 书签信息
   */
  parseBookmark(aElement) {
    const bookmark = {
      name: aElement.text().trim(),
      url: aElement.attr("href") || "",
      icon: aElement.attr("icon") || "",
    };
    console.log("解析到书签:", bookmark); // 打印单个书签信息
    return bookmark;
  }

  /**
   * 处理一组DT元素，从起始索引开始直到遇到下一个H3标签
   * @param {Array} dtElements - 所有DT元素数组
   * @param {number} startIndex - 起始索引
   * @returns {Object} 包含处理结果和下一个H3索引的对象
   */
  processDTElements(dtElements, startIndex) {
    const items = [];
    let currentIndex = startIndex;
    console.log(
      `开始处理DT元素，起始索引: ${startIndex}，总DT数量: ${dtElements.length}`
    );

    while (currentIndex < dtElements.length) {
      const dtElement = dtElements[currentIndex];
      const $dt = this.$(dtElement);
      const h3 = $dt.find("h3").first();
      const a = $dt.find("a").first();

      // 打印当前处理的DT元素内容（简化版）
      console.log(`处理DT索引: ${currentIndex}`);
      console.log("  包含H3标签?", h3.length > 0);
      console.log("  包含A标签?", a.length > 0);

      if (h3.length) {
        console.log(
          `  遇到H3标签，终止当前层级处理，下一个H3索引: ${currentIndex}`
        );
        break;
      }

      if (a.length) {
        const bookmark = this.parseBookmark(a);
        items.push(bookmark);
      }

      currentIndex++;
    }

    console.log(`处理完成，当前层级共解析书签: ${items.length}个`);
    return {
      items,
      nextH3Index: currentIndex,
    };
  }

  /**
   * 解析所有层级结构
   */
  parseHierarchy() {
    if (!this.$) {
      throw new Error("请先加载HTML文件");
    }

    // 获取所有DT元素并打印数量
    const dtElements = this.$("dt").get();
    console.log(`共找到DT元素数量: ${dtElements.length}`);

    let currentIndex = 0;

    while (currentIndex < dtElements.length) {
      const dtElement = dtElements[currentIndex];
      const $dt = this.$(dtElement);
      const h3 = $dt.find("h3").first();

      console.log(`当前主循环处理DT索引: ${currentIndex}`);
      console.log("  主循环中是否包含H3标签?", h3.length > 0);

      if (h3.length) {
        const categoryName = h3.text().trim();
        console.log(`  发现分类: ${categoryName}`);

        const { items, nextH3Index } = this.processDTElements(
          dtElements,
          currentIndex + 1
        );

        const category = {
          category: categoryName,
          sites: items,
        };
        this.result.push(category);
        console.log(
          `  分类${categoryName}添加完成，包含书签: ${items.length}个`
        );

        currentIndex = nextH3Index;
      } else {
        const a = $dt.find("a").first();
        if (a.length) {
          console.log("  发现顶级书签，添加到未分类");
          let uncategorized = this.result.find(
            (item) => item.category === "未分类"
          );
          if (!uncategorized) {
            uncategorized = { category: "未分类", sites: [] };
            this.result.push(uncategorized);
          }
          uncategorized.sites.push(this.parseBookmark(a));
        } else {
          console.log("  当前DT元素既无H3也无A标签，跳过");
        }
        currentIndex++;
      }
    }

    console.log("层级解析完成，最终分类列表:");
    this.result.forEach((cat) => {
      console.log(`  分类: ${cat.category}，包含书签: ${cat.sites.length}个`);
    });
    return this.result;
  }

  /**
   * 保存解析结果到JSON文件
   */
  async saveResult() {
    if (!this.result || this.result.length === 0) {
      throw new Error("没有可保存的解析结果");
    }

    try {
      await fs.writeFile(
        this.outputPath,
        JSON.stringify(this.result, null, 2),
        "utf8"
      );
      console.log(`解析结果已保存到: ${this.outputPath}`);
      return true;
    } catch (error) {
      throw new Error(`保存文件失败: ${error.message}`);
    }
  }

  /**
   * 执行完整的解析流程
   */
  async execute() {
    try {
      await this.loadFile();
      console.log("开始解析书签层级结构...");
      const parsedResult = this.parseHierarchy();
      console.log(`解析完成，共发现 ${parsedResult.length} 个分类`);
      await this.saveResult();
      console.log("操作完成");
      return parsedResult;
    } catch (error) {
      console.error("处理过程出错:", error.message);
      throw error;
    }
  }
}

// 执行入口
async function main() {
  const parser = new StrictHierarchyBookmarkParser(
    "bookmarks_2025_8_25.html", // 输入HTML文件路径
    "organized_bookmarks.json" // 输出JSON文件路径
  );
  await parser.execute();
}

// 运行主函数
main();

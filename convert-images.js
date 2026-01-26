const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

// 图片目录路径
const imagesDir = path.join(__dirname, 'src', 'assets', 'images');
// data.js文件路径
const dataFilePath = path.join(__dirname, 'src', 'assets', 'js', 'data.js');

// 读取并解析data.js文件内容
let data;
try {
  const dataContent = fs.readFileSync(dataFilePath, 'utf8');
  // 移除可能存在的export default语句，只保留JSON数据
  let jsonContent = dataContent.replace(/^export\s+default\s+/, '');
  
  // 处理可能的JavaScript对象语法（如单引号、尾部逗号）
  jsonContent = jsonContent
    // 替换单引号为双引号
    .replace(/'/g, '"')
    // 移除尾部逗号
    .replace(/,\s*([}\]])/g, '$1')
    // 移除注释
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  
  data = JSON.parse(jsonContent);
  console.log('成功读取data.js文件');
} catch (error) {
  console.error('读取或解析data.js文件失败:', error.message);
  // 尝试使用eval作为备选方案
  try {
    const dataContent = fs.readFileSync(dataFilePath, 'utf8');
    const module = { exports: {} };
    const require = () => {};
    eval(dataContent.replace('export default', 'module.exports ='));
    data = module.exports;
    console.log('使用eval成功读取data.js文件');
  } catch (evalError) {
    console.error('使用eval读取data.js文件失败:', evalError.message);
    process.exit(1);
  }
}

// 图片数据映射
const imageBase64Map = {};

// 转换图片为base64格式
async function convertImageToBase64(file) {
  if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.gif')) {
    const imagePath = path.join(imagesDir, file);
    
    try {
      const image = await Jimp.read(imagePath);
      
      // 获取图片原始类型
      const originalType = file.endsWith('.png') ? Jimp.MIME_PNG : Jimp.MIME_JPEG;
      
      // 处理背景图片
      if (file === 'bg.jpg') {
        const bgBase64Image = await image
          .quality(70) // 背景图质量70%，平衡大小和清晰度
          .getBase64Async(Jimp.MIME_JPEG);
        return bgBase64Image;
      }
      
      // 处理普通图片，保持原始分辨率和彩色效果
      // 只做轻微优化，不改变尺寸和颜色
      const base64Image = await image
        .quality(80) // 保持较高质量，确保图片清晰
        // 移除greyscale()，保持彩色效果
        // 移除resize()，保持原始分辨率
        .getBase64Async(originalType); // 使用原始图片类型
      
      return base64Image;
    } catch (error) {
      console.error(`转换失败: ${file}`, error.message);
      return null;
    }
  }
  return null;
}

// 更新数据中的图片路径为base64
async function updateDataWithBase64() {
  // 收集所有需要转换的图片文件名
  const imageFiles = fs.readdirSync(imagesDir);
  
  // 转换所有图片
  for (const file of imageFiles) {
    const base64 = await convertImageToBase64(file);
    if (base64) {
      imageBase64Map[file] = base64;
      console.log(`转换完成: ${file}`);
    }
  }
  
  // 更新数据中的图标路径
  for (const category of data) {
    for (const site of category.sites) {
      const iconFile = site.icon;
      if (imageBase64Map[iconFile]) {
        site.icon = imageBase64Map[iconFile];
        console.log(`更新图标: ${site.name} -> ${iconFile}`);
      }
    }
  }
  
  // 将更新后的数据写入data.js文件，并添加export default语句
  const dataWithExport = `export default ${JSON.stringify(data, null, 2)}`;
  fs.writeFileSync(dataFilePath, dataWithExport, 'utf8');
  console.log('\n所有图片已转换为base64格式并更新到data.js文件');
  console.log('已添加export default语句，便于在Vue组件中导入');
}

// 执行转换和更新
updateDataWithBase64();

export function formatJson(text, indent = 2) {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, indent);
  } catch (e) {
    return text;
  }
}

export function compressJson(text) {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed);
  } catch (e) {
    return text.replace(/\s+/g, '');
  }
}

export function escapeJson(text) {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(JSON.stringify(parsed));
  } catch (e) {
    return JSON.stringify(text.replace(/\s+/g, ''));
  }
}

export function unescapeJson(text) {
  try {
    const unescaped = JSON.parse(text);
    return typeof unescaped === 'string' ? unescaped : text;
  } catch (e) {
    return text;
  }
}

export function parseJsonToTree(text) {
  try {
    const data = JSON.parse(text);
    return buildTree(data, '');
  } catch (e) {
    return null;
  }
}

function buildTree(data, path) {
  const nodes = [];
  
  if (Array.isArray(data)) {
    data.forEach((value, index) => {
      const nodePath = path ? `${path}[${index}]` : `[${index}]`;
      const node = {
        key: index.toString(),
        value,
        type: Array.isArray(value) ? 'array' : typeof value,
        path: nodePath,
        isExpanded: false,
        children: []
      };
      
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        node.children = buildTree(value, nodePath);
        node.isExpanded = node.children.length > 0;
      }
      
      nodes.push(node);
    });
  } else if (typeof data === 'object' && data !== null) {
    Object.keys(data).forEach(key => {
      const value = data[key];
      const nodePath = path ? `${path}.${key}` : key;
      const node = {
        key,
        value,
        type: Array.isArray(value) ? 'array' : typeof value,
        path: nodePath,
        isExpanded: false,
        children: []
      };
      
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        node.children = buildTree(value, nodePath);
        node.isExpanded = node.children.length > 0;
      }
      
      nodes.push(node);
    });
  }
  
  return nodes;
}

export function validateJson(text) {
  if (!text || text.trim() === '') {
    return { valid: true, error: null, empty: true };
  }
  
  try {
    JSON.parse(text);
    return { valid: true, error: null, empty: false };
  } catch (e) {
    let errorMsg = e.message;
    
    errorMsg = errorMsg.replace(/Unexpected token.*in JSON at position (\d+)/i, 'JSON格式错误，位置 $1 处存在非法字符');
    errorMsg = errorMsg.replace(/Unexpected end of JSON input/i, 'JSON格式不完整，缺少闭合括号或引号');
    errorMsg = errorMsg.replace(/Unexpected number in JSON at position (\d+)/i, 'JSON格式错误，位置 $1 处数字格式不正确');
    errorMsg = errorMsg.replace(/Invalid or unexpected token/i, 'JSON格式错误，包含无效字符');
    errorMsg = errorMsg.replace(/Unexpected string in JSON at position (\d+)/i, 'JSON格式错误，位置 $1 处字符串格式不正确');
    errorMsg = errorMsg.replace(/Unexpected property name in JSON at position (\d+)/i, 'JSON格式错误，位置 $1 处属性名格式不正确');
    errorMsg = errorMsg.replace(/JSON.parse: expected property name or '{'/i, 'JSON格式错误，缺少属性名或起始括号');
    errorMsg = errorMsg.replace(/JSON.parse: bad control character in string literal/i, 'JSON格式错误，字符串中包含非法控制字符');
    errorMsg = errorMsg.replace(/JSON.parse: unterminated string literal/i, 'JSON格式错误，字符串未闭合');
    errorMsg = errorMsg.replace(/JSON.parse: expected ',' or '}' after property value/i, 'JSON格式错误，属性值后缺少逗号或闭合括号');
    errorMsg = errorMsg.replace(/JSON.parse: expected ',' or ']' after array element/i, 'JSON格式错误，数组元素后缺少逗号或闭合括号');
    
    return {
      valid: false,
      error: errorMsg,
      empty: false
    };
  }
}

export function searchNodes(nodes, keyword) {
  const results = [];
  
  function search(node) {
    const keyMatch = node.key && node.key.toLowerCase().includes(keyword.toLowerCase());
    const valueStr = typeof node.value === 'string' ? node.value : JSON.stringify(node.value);
    const valueMatch = valueStr.toLowerCase().includes(keyword.toLowerCase());
    
    if (keyMatch || valueMatch) {
      results.push(node);
    }
    
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => search(child));
    }
  }
  
  nodes.forEach(node => search(node));
  return results;
}

export function getNodeByPath(nodes, path) {
  if (!path) return null;
  
  const parts = path.split(/[\.\[\]]/).filter(p => p);
  
  let currentNodes = nodes;
  let currentNode = null;
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const isIndex = !isNaN(parseInt(part));
    
    currentNode = currentNodes.find(n => {
      if (isIndex) {
        return n.key === part;
      }
      return n.key === part;
    });
    
    if (!currentNode) return null;
    
    if (i < parts.length - 1) {
      currentNodes = currentNode.children || [];
    }
  }
  
  return currentNode;
}

export function getNodeValue(node) {
  if (node.type === 'array' || node.type === 'object') {
    return node.children.length > 0 ? (node.type === 'array' ? '[]' : '{}') : (node.type === 'array' ? '[]' : '{}');
  }
  if (node.type === 'string') {
    return `"${node.value}"`;
  }
  return String(node.value);
}

export function detectValueType(value) {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') {
    if (Number.isInteger(value) && value.toString().length === 13) {
      return 'timestamp';
    }
    return 'number';
  }
  if (typeof value === 'string') {
    if (/^https?:\/\/.*\.(jpg|jpeg|png|gif|svg|webp)$/i.test(value)) {
      return 'image_url';
    }
    if (/^https?:\/\//i.test(value)) {
      return 'url';
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return 'date';
    }
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
      return 'datetime';
    }
    return 'string';
  }
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return 'unknown';
}
import os
import re
import json
from html.parser import HTMLParser

class BookmarkParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.folders = []
        self.current_folder = []
        self.bookmarks = []
        self.in_folder = False
        self.folder_name = ""
        self.folder_sort = 1
    
    def handle_starttag(self, tag, attrs):
        if tag == 'h3':
            self.in_folder = True
            folder_attrs = dict(attrs)
            self.folder_name = folder_attrs.get('__content__', '')
        elif tag == 'a' and not self.in_folder:
            bookmark_attrs = dict(attrs)
            name = bookmark_attrs.get('__content__', '')
            url = bookmark_attrs.get('href', '')
            icon = bookmark_attrs.get('icon', '')
            if name and url:
                bookmark = {
                    "name": name,
                    "url": url,
                    "icon": icon,
                    "sort": len(self.current_folder) + 1
                }
                self.current_folder.append(bookmark)
        elif tag == 'dl' and self.in_folder:
            self.in_folder = False
    
    def handle_endtag(self, tag):
        if tag == 'dl' and self.current_folder:
            if self.folder_name:
                folder = {
                    "category": self.folder_name,
                    "sites": self.current_folder,
                    "sort": self.folder_sort
                }
                self.folders.append(folder)
                self.folder_sort += 1
            self.current_folder = []
            self.folder_name = ""
    
    def handle_data(self, data):
        if self.in_folder:
            self.folder_name = data

# 读取HTML文件并提取内容
def read_bookmark_html(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    return content

# 解析HTML内容，提取标签和属性
def parse_html_content(content):
    # 处理HTML标签，提取内容和属性
    parser = BookmarkParser()
    
    # 预处理HTML，处理标签内容
    content = re.sub(r'<DT><H3(.*?)>(.*?)</H3>', r'<DT><H3\1 __content__="\2"></H3>', content, flags=re.DOTALL)
    content = re.sub(r'<DT><A(.*?)>(.*?)</A>', r'<DT><A\1 __content__="\2"></A>', content, flags=re.DOTALL)
    
    parser.feed(content)
    return parser.folders

# 生成JSON文件
def generate_json(folders, output_path):
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(folders, f, ensure_ascii=False, indent=2)

# 主函数
def main():
    html_path = r'c:\Users\upw\Desktop\github_y8sq\src\assets\js\bookmarks_2026_1_30.html'
    output_path = r'c:\Users\upw\Desktop\github_y8sq\src\assets\data\navigation_from_bookmarks.json'
    
    # 读取HTML文件
    content = read_bookmark_html(html_path)
    
    # 解析HTML内容
    folders = parse_html_content(content)
    
    # 生成JSON文件
    generate_json(folders, output_path)
    
    print(f"转换完成！JSON文件已生成到: {output_path}")

if __name__ == "__main__":
    main()
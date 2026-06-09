# Term6 期末复习站

这是一个用于期末复习的静态网站, 集中展示三门课的讲解、题目和速查表:

- Compile 编译原理
- Network 计算机网络
- RISC-V 组成与体系结构

## 本地预览

在本目录启动本地服务:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

然后访问:

```text
http://127.0.0.1:4173/
```

## 内容结构

- `index.html`: 复习入口和阅读器
- `styles.css`: 页面样式
- `script.js`: Markdown 资料加载和渲染
- `content/`: 复习资料 Markdown
- `assets/hero-tech.png`: 首页视觉图

## 更新复习资料

把新的 Markdown 文件放进 `content/`, 然后在 `script.js` 的 `documents` 中登记标题和路径即可。

## 线上地址

GitHub Pages:

```text
https://clear-winding.github.io/personal-site/
```

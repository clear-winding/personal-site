# 赵劲博个人网站

这是一个静态个人主页, 可直接部署到 GitHub Pages、Vercel、Netlify 或任何静态托管服务。

## 本地预览

直接打开 `index.html` 即可。

也可以在本目录启动一个本地服务:

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

然后访问:

```text
http://127.0.0.1:4173/
```

## 修改个人信息

主要内容在 `index.html`:

- 页面标题和姓名: `<title>`、`.brand`、`h1`
- 介绍文字: `#about`
- 项目内容: `#work`
- 技能列表: `#skills`
- 联系方式: `#contact`

首页视觉图在:

```text
assets/hero-tech.png
```

## 部署到 GitHub Pages

如果仓库名是 `username.github.io`, 推送到 `main` 后通常会自动作为个人主页。

如果是普通仓库:

1. 进入 GitHub 仓库页面。
2. 打开 `Settings -> Pages`。
3. Source 选择 `Deploy from a branch`。
4. Branch 选择 `main` 和 `/root`。
5. 保存后等待 Pages 构建完成。

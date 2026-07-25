# jianyiflow-website

GitHub 仓库，通过 Cloudflare Pages 发布至 **jianyiflow.com**。

## 域名策略

**jianyiflow.com 全站 301 重定向至 [jianyiflow.cn](https://jianyiflow.cn/)**（主站、宝塔部署）。

根目录 `_redirects` 由 Cloudflare Pages 读取，所有路径保留并跳转到 `.cn` 对应地址。

## 内容维护

- **官网内容**：只编辑 `jianyiflow.cn/`，上传宝塔。
- **勿**对本仓库执行自 `jianyiflow.cn/` 的全量 rsync（`--delete` 会删掉 `_redirects`）。
- 若需改重定向规则，只改本仓库的 `_redirects` 并 `git push`。

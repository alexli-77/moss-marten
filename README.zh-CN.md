# Moss Marten

Moss Marten 是一个可配置的每日工作流 Agent，用于个人计划和复盘。它作为一个轻量服务运行，把每日 review 和今日计划发送到配置好的 Discord 频道。

这是一个通用项目。仓库中不包含个人 memory、token、频道 ID、私人笔记或历史数据。

## 它能做什么

- 在配置时间自动运行每日复盘。
- 在配置时间自动生成今日计划。
- 支持命令行手动触发单次运行。
- 支持在配置好的 Discord 频道中用文字命令触发。
- 读取 Discord 频道近期消息作为上下文。
- 可选读取 GitHub assigned issues。
- 可选读取本地 JSON 日程和任务快照。
- 把工作流结果写入 SQLite 和本地 markdown memory。
- 数据源不可用时明确标记缺源，不编造上下文。

## 快速开始

```bash
git clone <repository-url>
cd moss-marten
cp .env.example .env
cp config/config.example.yaml config/config.yaml
npm install
npm run build
npm start
```

手动触发：

```bash
npm run run:review
npm run run:plan
npm run smoke
```

Discord 触发规则在 `triggers.discord_commands` 中配置。例如默认模板支持用户在指定频道发送 `start review` 来立即运行 review。

使用 Docker：

```bash
cp .env.example .env
cp config/config.example.yaml config/config.yaml
docker compose up -d --build
```

## 必填配置

编辑 `.env`：

```bash
OPENAI_API_KEY=
DISCORD_BOT_TOKEN=
DISCORD_REVIEW_CHANNEL_ID=
TZ=UTC
```

编辑 `config/config.yaml`：

```yaml
user:
  display_name: "User"
  timezone: "UTC"

workflows:
  daily_review:
    enabled: true
    time: "21:30"
    channel: "review"
  daily_plan:
    enabled: true
    time: "08:00"
    channel: "review"
```

## 隐私原则

不要提交这些文件：

- `.env`
- `config/config.yaml`
- `data/`
- SQLite 数据库
- 生成的 memory 文件
- snapshot 文件
- 日志

项目已经在 `.gitignore` 中默认排除了这些路径。

## 数据源

除 Discord 频道访问外，所有数据源都是可选的。

- `discord_history`：近期频道消息
- `github`：分配给自己的 GitHub issues，需要 `GITHUB_TOKEN`
- `calendar_snapshot`：本地 JSON 日程快照
- `tasks_snapshot`：本地 JSON 任务快照
- `apple_calendar_snapshot`：本地 JSON 日历快照
- `chrome_snapshot`：本地文本/JSON 浏览器快照
- `vault_snapshots`：来自 `_snapshots` 或 `snapshots` 目录的按日期活动快照
- `vault_markdown`：本地 vault 目录中的 markdown 笔记，作为稳定知识库
- `vault_gate`：预留给通过 HTTP gateway 暴露笔记的集成
- `codex_history`：本地 Codex session/history 文件

不可用的数据源会作为缺源传给模型；关闭的数据源会标记为 disabled。

## 项目状态

这是一个 MVP runtime，可以本地部署并继续扩展。第一版暂不包含审批卡片、多用户支持和 dashboard。

## License

MIT

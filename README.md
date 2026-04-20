# 会议记录小程序（商用版骨架）

这个版本已从 Demo 升级为**可商用扩展架构**：

- 后端支持 **ASR/纪要双 Provider**（可切到阿里云 ASR + LLM）
- 会议数据支持持久化存储（文件落盘，可换 DB）
- 支持会中追加转写、会后生成纪要、历史查询
- 支持内部 API Key 鉴权（可接网关）

## 一、项目结构

```text
.
├── miniprogram/
│   ├── app.js
│   ├── app.json
│   ├── pages/
│   │   ├── index/
│   │   ├── meeting/
│   │   └── summary/
│   └── utils/api.js
├── server/
│   ├── config.js
│   ├── index.js
│   ├── lib/httpClient.js
│   ├── data/                # 默认会议持久化目录
│   └── services/
│       ├── meetingStore.js
│       ├── asr/
│       │   ├── index.js
│       │   ├── mockAsrService.js
│       │   └── aliyunAsrService.js
│       └── summary/
│           ├── index.js
│           ├── ruleSummaryService.js
│           └── llmSummaryService.js
└── README.md
```

## 二、后端能力

### 1) 会议生命周期 API

- `POST /api/meetings/start`：创建会议
- `POST /api/meetings/:meetingId/transcript`：会中追加转写
- `POST /api/meetings/finish`：结束会议并生成纪要
- `GET /api/meetings`：最近会议列表
- `GET /api/meetings/:meetingId`：会议详情

### 2) Provider 切换（商用关键）

通过环境变量切换：

- `ASR_PROVIDER=mock | aliyun`
- `SUMMARY_PROVIDER=rule | llm`

默认值为 `mock + rule`，可本地无外部依赖跑通。生产可切 `aliyun + llm`。

### 3) 鉴权与安全

设置 `INTERNAL_API_KEY` 后，服务会校验请求头 `x-api-key`。

### 4) 持久化

默认 `PERSIST_MEETINGS=true`，会写入 `server/data/meetings.json`。可替换为 MySQL / PostgreSQL。

## 三、环境变量（生产建议）

```bash
PORT=3000
NODE_ENV=production

# 鉴权
INTERNAL_API_KEY=replace-with-random-token

# Provider 选择
ASR_PROVIDER=aliyun
SUMMARY_PROVIDER=llm

# ASR 网关配置（建议通过你自己的后端网关统一鉴权）
ASR_API_URL=https://your-gateway.example.com/asr
ASR_API_KEY=your_asr_token

# LLM 网关配置
LLM_API_URL=https://your-gateway.example.com/llm/chat/completions
LLM_API_KEY=your_llm_token
LLM_MODEL=qwen-plus

# 数据持久化
PERSIST_MEETINGS=true
DB_FILE=./data/meetings.json
```

## 四、本地启动

```bash
cd server
npm install
npm run check
npm run start
```

默认服务地址：`http://127.0.0.1:3000`

## 五、小程序端当前状态

小程序已包含：

1. 首页：会议标题+参会人输入
2. 会议页：录音按钮、文本转写输入、结束并生成纪要
3. 纪要页：结构化展示 + 一键复制

> 当前仍以“文本转写输入”打通流程。真实音频上传/流式回传可在下一步接入。

## 六、商用落地建议（下一步）

1. 把 `meetingStore` 从 JSON 文件替换为数据库（并加索引）
2. 增加租户维度（企业 ID / 用户 ID）
3. 把 `transcript` 和 `summary` 拆分表，支持审计与版本回溯
4. 异步任务化（队列）处理长会议，避免请求超时
5. 增加纪要确认流（编辑/审批/发布）

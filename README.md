# 会议记录小程序（Meeting Minutes MiniApp）

这次不是只写方案了，已经给你搭好一个**可跑通的 MVP 骨架**：

- 小程序端：开始会议 → 录音页 → 生成纪要页
- 服务端：创建会议、接收转写文本、输出结构化纪要 JSON
- 纪要逻辑：按关键词自动归类议题，提取结论/风险/待办

## 目录结构

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
│   ├── index.js
│   ├── package.json
│   └── services/
│       ├── mockAsrService.js
│       └── summaryService.js
└── README.md
```

## 功能说明（当前版本）

### 1) 首页（`pages/index`）
- 输入会议标题、参会角色
- 点击「开始会议」进入会议页

### 2) 会议页（`pages/meeting`）
- 提供录音开始/停止按钮（已接入 `RecorderManager`）
- 提供“手动粘贴转写文本”输入框（用于先打通完整流程）
- 点击「结束会议并生成纪要」请求后端

> 说明：真实音频上传到 ASR 的链路可在下一步接入（通义听悟/腾讯云ASR）。

### 3) 纪要页（`pages/summary`）
- 展示结构化会议纪要：议题、结论、风险、待办
- 一键复制纪要

## 本地启动

### 启动后端

```bash
cd server
npm install
npm run start
```

默认地址：`http://127.0.0.1:3000`

### 导入小程序

1. 用微信开发者工具导入项目目录
2. 确保 `miniprogram/utils/api.js` 的服务地址为本机后端地址
3. 在开发者工具里配置合法 request 域名（或本地调试放开校验）

## API 说明

### `POST /api/meetings/start`

请求：

```json
{
  "title": "需求评审会",
  "attendees": ["产品", "研发", "测试"]
}
```

响应：

```json
{
  "meetingId": "mtg_1713571200000"
}
```

### `POST /api/meetings/finish`

请求：

```json
{
  "meetingId": "mtg_1713571200000",
  "transcriptText": "产品：本周要确认活动方案\n研发：需要先评估短信通道容量"
}
```

响应：

```json
{
  "meetingId": "mtg_1713571200000",
  "segments": [],
  "summary": {
    "title": "需求评审会",
    "date": "2026-04-20",
    "attendees": ["产品", "研发", "测试"],
    "topics": []
  }
}
```

## 下一步（我可以继续帮你做）

1. 接入真实 ASR：上传音频到阿里云通义听悟并回填实时转写。
2. 把“规则纪要”升级为“大模型 JSON Schema 输出”。
3. 增加会议列表、历史检索、导出 Word/PDF。

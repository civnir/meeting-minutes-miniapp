# 会议记录小程序 Meeting Minutes MiniApp

**功能**  
- 开会实时录音 + 语音识别  
- 自动说话人分离（区分张三、李四在说什么）  
- 会议结束一键生成结构化纪要（需求会议自动提取需求点）  
- 支持阿里云通义听悟（推荐）

**技术栈**  
- 前端：微信小程序  
- 语音识别：阿里云通义听悟 SDK（支持小程序）  
- 智能纪要：大模型 + 提示词  
- 部署：微信云开发 / 阿里云函数

**快速开始**  
1. 克隆本仓库 → 用微信开发者工具导入  
2. 在阿里云开通通义听悟，获取 AK/SK  
3. 配置 `utils/config.js`  
4. 用 GitHub Copilot 继续开发（推荐）

**项目结构**
├── pages/
│   ├── index/          # 首页（开始会议按钮）
│   ├── meeting/        # 会议中页面（实时转写）
│   └── summary/        # 纪要生成页面
├── utils/
│   ├── aliSpeech.js    # 阿里云SDK封装
│   └── config.js       # 配置
├── app.js
├── project.config.json
└── README.md
text

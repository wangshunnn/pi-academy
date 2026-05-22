/**
 * 🏰 Pi Academy — 终端闯关游戏
 * 
 * 在 pi 里运行: /academy
 * 每个关卡教你一个 pi 框架核心概念
 * 
 * 🥉 基础之路 (如何使用):
 *   Lv.0  入门大厅 — pi 是什么
 *   Lv.1  锻造工坊 — 写第一个 Extension
 *   Lv.2  工具祭坛 — 自定义 Tool
 *   Lv.3  事件之眼 — 生命周期事件
 *   Lv.4  守护者之门 — tool_call 拦截与权限
 *   Lv.5  UI 高塔 — TUI 组件与渲染
 *   Lv.6  会话迷宫 — Session & 分支
 *   Lv.7  SDK 圣殿 — 程序化使用
 *   Lv.8  渡口 — 打包与发布
 *   ⚔️ Boss  大建筑师 — 综合实战
 * 
 * 🥇 进阶熔炉 (源码思想):
 *   Lv.9  事件熔炉 — 事件总线架构
 *   Lv.10 编译烈焰 — Extension 加载引擎
 *   Lv.11 树之根脉 — 会话树算法
 *   Lv.12 压缩之炉 — Compaction 算法
 *   Lv.13 并行之流 — 流式与并行执行
 *   Lv.14 抽象之镜 — Provider & Resource 模式
 *   ⚔️ Boss2 架构师之战 — 核心引擎实战
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { DynamicBorder } from "@earendil-works/pi-coding-agent";
import { Container, type SelectItem, SelectList, Text, matchesKey, Key, visibleWidth, truncateToWidth } from "@earendil-works/pi-tui";
import { Type } from "typebox";

// ─── 故事与关卡数据 ───────────────────────────────────

interface Room {
  id: string;
  chapter: string;
  title: string;
  description: string;
  story: string[];
  concept: { title: string; body: string[] }[];
  codeExample: { lang: string; code: string; explanation: string };
  challenge: { question: string; options: string[]; answer: number; explanation: string };
  boss?: boolean;
}

const LEVELS: Room[] = [
  {
    id: "0",
    chapter: "序章",
    title: "入门大厅",
    description: "了解 Pi Coding Agent 是什么",
    story: [
      "你推开厚重的橡木门，走进一座古老的城堡……",
      "大厅中央悬浮着一颗发光的水晶，投射出 codes 和 tools 的光影。",
      "一位银发老者微笑着走来：「欢迎，旅行者。这里是 Pi Academy。」",
      "",
      "「Pi 是一个极简的终端 AI 编程助手。它给你四个工具：」",
      "「read · write · edit · bash」",
      "「剩下的，都由你自己锻造。」",
    ],
    concept: [
      { title: "Pi 是什么？", body: [
        "Pi 是一个 terminal-native 的 AI 编程 agent。",
        "默认只有 4 个工具，没有 MCP、sub-agent、plan mode。",
        "一切高级功能通过 Extension/Skill/Package 按需加载。",
        "四种运行模式: interactive / print / JSON / RPC / SDK。",
      ]},
      { title: "核心哲学", body: [
        "🔌 极度可扩展 — 不 fork 就能改变一切",
        "🎯 最小核心 — 不内置意见强烈的功能",
        "📦 生态驱动 — 功能由社区包提供",
        "🕹️  终端原生 — TUI 组件系统与终端深度集成",
      ]}
    ],
    codeExample: {
      lang: "bash",
      code: `# 快速开始
npm install -g @earendil-works/pi-coding-agent
export ANTHROPIC_API_KEY=sk-ant-...
pi "帮我看看这个项目"

# 四种模式
pi                  # 交互模式
pi -p "一些问题"     # 单次打印
pi --mode json      # JSON 流输出
pi --mode rpc       # RPC 模式`,
      explanation: "最简单的上手方式：安装 → 配置 API Key → 对话。"
    },
    challenge: {
      question: "pi 默认提供几个内置工具？",
      options: ["2个", "4个", "7个", "10个"],
      answer: 1,
      explanation: "默认 4 个: read, write, edit, bash。grep/find/ls 需显式启用。"
    }
  },
  {
    id: "1",
    chapter: "第一关",
    title: "锻造工坊",
    description: "编写第一个 Extension",
    story: [
      "穿过大厅，你来到一间炽热的锻造工坊。铁砧上火星四溅。",
      "",
      "「Extension 是 pi 最强大的自定义方式，」铁匠大师举着一把",
      "泛着蓝光的剑说。「每个 Extension 都是一个 TypeScript 模块，」",
      "「它通过 export default function(pi) 接入 pi 的生命线。」",
      "",
      "他递给你一块粗铁：「来，锻造你的第一个 Extension。」",
    ],
    concept: [
      { title: "Extension 是什么？", body: [
        "TypeScript 模块，export default 一个工厂函数。",
        "接收 ExtensionAPI 对象，注册工具、命令、快捷键、事件监听。",
        "放在 ~/.pi/agent/extensions/ 或 .pi/extensions/。",
        "用 jiti 即时编译，不需要 build 步骤。",
      ]},
      { title: "三种组织方式", body: [
        "单文件: ~/.pi/agent/extensions/my-ext.ts",
        "目录: ~/.pi/agent/extensions/my-ext/index.ts",
        "包: 带 package.json + node_modules 的目录",
        "通过 pi -e ./my-ext.ts 快速测试",
      ]}
    ],
    codeExample: {
      lang: "typescript",
      code: `// ~/.pi/agent/extensions/hello.ts
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.on("session_start", async (_event, ctx) => {
    ctx.ui.notify("🎉 扩展已加载!", "info");
  });
  
  pi.registerCommand("wave", {
    description: "打招呼",
    handler: async (_args, ctx) => {
      ctx.ui.notify("👋 Hello from extension!", "info");
    }
  });
}`,
      explanation: "最简 Extension: 监听到 session_start，注册 /wave 命令。"
    },
    challenge: {
      question: "Extension 的入口是什么？",
      options: [
        "export class MyExtension { ... }",
        "export default function(pi: ExtensionAPI) { ... }",
        "export const extension = { ... }",
        "module.exports = function(pi) { ... }"
      ],
      answer: 1,
      explanation: "export default function(pi: ExtensionAPI) { ... } — 接收 ExtensionAPI，注册一切。"
    }
  },
  {
    id: "2",
    chapter: "第二关",
    title: "工具祭坛",
    description: "注册 LLM 可调用的自定义 Tool",
    story: [
      "你登上旋转楼梯，来到一座刻满符文的高台。",
      "",
      "「这里是工具祭坛，」一位符文法师指向中央的石板。",
      "「你可以在上面铭刻新的 Tool——LLM 将能调用它。」",
      "",
      "「铭刻需要三样东西：名称(name)、描述(description)、参数(parameters)。」",
      "「还有最重要的——执行的咒语(execute)。」",
    ],
    concept: [
      { title: "Tool 五要素", body: [
        "name — 唯一标识符，snake_case 风格",
        "description — 告诉 LLM 何时使用 (要具体!)",
        "parameters — TypeBox schema (Type.Object, Type.String... )",
        "execute — 实际执行逻辑，返回 { content, details }",
        "可选: renderCall / renderResult — 自定义 TUI 渲染",
      ]},
      { title: "Tool 与 LLM 的交互", body: [
        "LLM 看到 description → 决定是否调用 → 传 parameters",
        "execute 返回的 content 发回 LLM 作为工具结果",
        "details 用于 TUI 渲染，不发给 LLM",
        "onUpdate 支持流式更新进度",
      ]}
    ],
    codeExample: {
      lang: "typescript",
      code: `import { Type } from "typebox";

pi.registerTool({
  name: "weather",
  label: "Weather",
  description: "获取城市天气。当用户询问天气时使用。",
  parameters: Type.Object({
    city: Type.String({ description: "城市名" }),
  }),
  async execute(_id, params, _signal, _onUpdate) {
    const w = await fetch(\`https://wttr.in/\${params.city}?format=3\`);
    return {
      content: [{ type: "text", text: await w.text() }],
      details: { city: params.city },
    };
  },
});`,
      explanation: "Tool 注册后，LLM 在需要时会自动调用。Execute 可以是任意异步操作。"
    },
    challenge: {
      question: "Tool 的 execute 返回的 details 字段有什么作用？",
      options: [
        "发送给 LLM 作为上下文",
        "用于 TUI 渲染，不发给 LLM",
        "记录到日志文件",
        "作为下次调用的默认参数"
      ],
      answer: 1,
      explanation: "details 只用于 TUI 渲染和扩展内部使用，不会发送给 LLM。"
    }
  },
  {
    id: "3",
    chapter: "第三关",
    title: "事件之眼",
    description: "掌握生命周期事件系统",
    story: [
      "你走进一间四壁都是眼睛的诡异房间……",
      "",
      "「每一只眼睛都注视着不同的时刻，」一个声音在你脑海中响起。",
      "「session_start · agent_start · turn_start · tool_call ·」",
      "「tool_result · message_end · agent_end · session_shutdown……」",
      "",
      "「学会在正确的时机睁开正确的眼睛，你就能掌控一切。」",
    ],
    concept: [
      { title: "事件生命周期", body: [
        "session_start → 会话启动/重载",
        "input → 用户输入（可在 skill 展开前拦截）",
        "before_agent_start → 注入上下文或修改 system prompt",
        "agent_start → agent_end 包裹每次 prompt 处理",
        "turn_start → turn_end 包裹每次 LLM 往返",
        "tool_call → 可拦截阻止 (block: true)",
        "tool_result → 可修改工具结果",
        "context → 每次 LLM 调用前修改消息列表",
        "before_provider_request → 检查 HTTP 请求体",
        "session_shutdown → 清理资源",
      ]},
      { title: "五大最常用事件", body: [
        "tool_call — 安全门控 (block rm -rf)",
        "before_agent_start — 注入项目上下文",
        "session_start — 初始化扩展状态",
        "context — 裁剪/修改消息",
        "message_end — 记录、后处理",
      ]}
    ],
    codeExample: {
      lang: "typescript",
      code: `// 拦截危险操作
pi.on("tool_call", async (event, ctx) => {
  if (event.toolName === "bash") {
    const cmd = event.input.command || "";
    if (cmd.includes("rm -rf") || cmd.includes("sudo")) {
      const ok = await ctx.ui.confirm(
        "⚠️ 危险操作",
        \`确认执行: \${cmd}\`
      );
      if (!ok) return { block: true, reason: "用户取消" };
    }
  }
});

// 注入上下文
pi.on("before_agent_start", async (event) => {
  return {
    message: {
      customType: "project-context",
      content: "项目使用 React + TypeScript",
      display: true,
    }
  };
});`,
      explanation: "tool_call 可以做安全门控; before_agent_start 可注入持久化消息。"
    },
    challenge: {
      question: "要在 LLM 调用前修改消息列表，应该监听哪个事件？",
      options: [
        "before_agent_start",
        "context",
        "tool_call",
        "message_end"
      ],
      answer: 1,
      explanation: "context 事件在每次 LLM 调用前触发，可非破坏性地修改消息列表。"
    }
  },
  {
    id: "4",
    chapter: "第四关",
    title: "守护者之门",
    description: "工具拦截与安全模式",
    story: [
      "两尊石像守卫着一道刻满符咒的青铜门。",
      "",
      "「要通过此门，你必须学会守护的法则。」石像低吼道。",
      "「isToolCallEventType 精准识别工具类型……」",
      "「block: true 阻止执行……」",
      "「event.input 可以原地修改参数……」",
      "",
      "记住：你不是阻止一切，而是让一切可控。」",
    ],
    concept: [
      { title: "tool_call 深度用法", body: [
        "isToolCallEventType('bash', event) 可类型窄化",
        "event.input 是 mutable 的 — 修改会生效到实际调用",
        "return { block: true, reason: '...' } 阻止执行",
        "自定义 Tool 也可被拦截 (需要 export 类型)",
        "并联工具模式下 tool_call 顺序执行但工具并行",
      ]},
      { title: "实战模式", body: [
        "权限门控: rm -rf / sudo / curl | sh 需要确认",
        "路径保护: 禁止写 .env / node_modules / ~/.ssh",
        "命令注入: 自动 source ~/.profile",
        "沙箱: 将 bash 命令转发到 Docker/SSH",
        "记录: 记录所有操作到日志",
      ]}
    ],
    codeExample: {
      lang: "typescript",
      code: `import { isToolCallEventType } from "@earendil-works/pi-coding-agent";

pi.on("tool_call", async (event, ctx) => {
  // 类型安全的 bash 拦截
  if (isToolCallEventType("bash", event)) {
    // 修改参数 — 自动注入 source
    event.input.command = 
      \`source ~/.profile 2>/dev/null\\n\${event.input.command}\`;
  }
  
  // 保护敏感文件
  if (isToolCallEventType("write", event)) {
    const p = event.input.path || "";
    if (p.includes(".env") || p.includes("node_modules")) {
      return { block: true, reason: "受保护路径" };
    }
  }
});`,
      explanation: "isToolCallEventType 提供类型安全; event.input 可原地修改。"
    },
    challenge: {
      question: "并联工具模式下 tool_call 的执行顺序是怎样的？",
      options: [
        "所有 tool_call 同时并行执行",
        "tool_call 预检顺序执行，工具实际并行",
        "按字母顺序串行执行",
        "随机顺序执行"
      ],
      answer: 1,
      explanation: "预检(preflight)顺序执行，但工具实际执行是并发的。同一轮的 tool_call 不保证能看到兄弟 tool 的结果。"
    }
  },
  {
    id: "5",
    chapter: "第五关",
    title: "UI 高塔",
    description: "TUI 组件系统与自定义渲染",
    story: [
      "你攀上一座高耸入云的塔楼。墙壁上流动着五彩的 ANSI escape codes，",
      "窗户里展示着各种终端界面的幻影。",
      "",
      "「欢迎来到 UI 高塔，」一位身披像素斗篷的艺术家说。",
      "「这里的组件可以组合成任何界面。SelectList · SettingsList · Markdown ·」",
      "「Box · Container · DynamicBorder · Overlay……」",
      "",
      "「ctx.ui.custom() 给你全部画布，你可以画任何东西。」",
    ],
    concept: [
      { title: "TUI 组件层次", body: [
        "基础组件: Text, Box, Container, Spacer, Markdown, Image",
        "交互组件: SelectList, SettingsList, Input",
        "高级组件: DynamicBorder, BorderedLoader",
        "布局: Container 垂直排列, Box 带 padding/bg",
        "Overlay: 浮层组件不清理屏幕",
      ]},
      { title: "三种 UI 模式", body: [
        "简单替换: setEditorComponent / setFooter / setWidget / setStatus",
        "全屏自定义: ctx.ui.custom(myComponent)",
        "浮层: ctx.ui.custom(dialog, { overlay: true })",
        "所有模式都需要: render(width), handleInput(data), invalidate()",
      ]}
    ],
    codeExample: {
      lang: "typescript",
      code: `// 自定义选择器
pi.registerCommand("pick-fruit", {
  handler: async (_args, ctx) => {
    const result = await ctx.ui.custom<string | null>(
      (tui, theme, _kb, done) => {
        const items = [
          { value: "🍎", label: "Apple", description: "红富士" },
          { value: "🍌", label: "Banana", description: "进口香蕉" },
        ];
        const container = new Container();
        container.addChild(
          new DynamicBorder(s => theme.fg("accent", s))
        );
        container.addChild(
          new Text(theme.bold("选一个水果"), 1, 0)
        );
        
        const list = new SelectList(items, 5, {
          selectedPrefix: t => theme.fg("accent", t),
          selectedText: t => theme.fg("accent", t),
        });
        list.onSelect = item => done(item.value);
        list.onCancel = () => done(null);
        container.addChild(list);
        
        return {
          render: w => container.render(w),
          invalidate: () => container.invalidate(),
          handleInput: d => { list.handleInput(d); tui.requestRender(); },
        };
      }
    );
    ctx.ui.notify(\`选了: \${result}\`, "info");
  }
});`,
      explanation: "SelectList + DynamicBorder + Container = 专业的选择界面。"
    },
    challenge: {
      question: "TUI 组件接口必须实现的三个方法是什么？",
      options: [
        "mount, update, unmount",
        "render, handleInput, invalidate",
        "init, draw, cleanup",
        "onMount, render, dispose"
      ],
      answer: 1,
      explanation: "render(width) → string[], handleInput(data) → void, invalidate() → void。"
    }
  },
  {
    id: "6",
    chapter: "第六关",
    title: "会话迷宫",
    description: "Session 管理与树形分支",
    story: [
      "你发现自己置身于一个没有尽头的迷宫，墙壁上刻满了",
      "id、parentId、timestamp 的数字。",
      "",
      "「Session 不是线性的，」迷宫管理员说。",
      "「它是一棵树。每个 JSONL 行是一个节点，parentId 连接树叶。」",
      "「/tree 让你在树上跳转，/fork 让你从历史分叉。」",
      "「/compact 帮你修剪过长的枝丫。」",
    ],
    concept: [
      { title: "Session 文件结构", body: [
        "JSONL 格式，每行一种 entry 类型。",
        "树形结构: id + parentId 实现就地分支。",
        "Entry 类型: message / compaction / branch_summary / custom / label / session_info / model_change",
        "SessionManager API: getEntries, getBranch, getLeafId, branch, buildSessionContext",
      ]},
      { title: "关键操作", body: [
        "/tree — 树内导航 (折叠/展开/搜索/过滤/标签)",
        "/fork — 从用户消息分叉到新文件",
        "/clone — 复制当前分支到新文件",
        "/compact — 手动/自动压缩上下文",
        "pi.appendEntry() — 扩展持久化状态",
        "pi.sendMessage() — 注入自定义消息",
      ]}
    ],
    codeExample: {
      lang: "typescript",
      code: `// 持久化扩展状态
pi.on("session_start", async (_event, ctx) => {
  // 恢复状态
  for (const entry of ctx.sessionManager.getEntries()) {
    if (entry.type === "custom" && entry.customType === "my-state") {
      loadState(entry.data);
    }
  }
});

// 保存状态
pi.appendEntry("my-state", { counter: 42, mode: "dark" });

// 注入消息到 LLM 上下文
pi.sendMessage({
  customType: "status-report",
  content: "已完成第3步",
  display: true,  // 在 TUI 中显示
}, { triggerTurn: true });`,
      explanation: "custom entry 不进入 LLM 上下文; custom_message 会进入。"
    },
    challenge: {
      question: "custom entry 和 custom_message entry 的关键区别是什么？",
      options: [
        "custom entry 更小",
        "custom entry 不进入 LLM 上下文，custom_message 进入",
        "custom entry 自动压缩",
        "没有区别，只是名字不同"
      ],
      answer: 1,
      explanation: "custom entry 只做状态持久化，不进入 LLM 上下文; custom_message 会发送给 LLM。"
    }
  },
  {
    id: "7",
    chapter: "第七关",
    title: "SDK 圣殿",
    description: "程序化集成与嵌入",
    story: [
      "一座由纯代码构成的神殿矗立在云端，光线穿过 import 语句折射出彩虹。",
      "",
      "「这里是 SDK 圣殿，」大祭司展开一卷 TypeScript 类型的羊皮纸。",
      "「createAgentSession() 是入口，SessionManager 管理存储，」",
      "「ModelRegistry 管理模型，ResourceLoader 加载一切资源。」",
      "",
      "「把它嵌入你的应用，构建你自己的 agent 界面。」",
    ],
    concept: [
      { title: "SDK 核心 API", body: [
        "createAgentSession(options) → { session, extensionsResult }",
        "session.prompt(text) — 发送 prompt",
        "session.subscribe(listener) — 订阅事件流",
        "session.setModel / setThinkingLevel / abort / compact",
        "AgentSessionRuntime — 支持 session 替换 (/new, /fork, /resume)",
        "InteractiveMode / runPrintMode / runRpcMode — 完整运行模式",
      ]},
      { title: "事件类型", body: [
        "message_update — 流式文本 (assistantMessageEvent.type: text_delta)",
        "tool_execution_start/end — 工具执行",
        "agent_start/end — Agent 生命周期",
        "turn_start/end — Turn 生命周期",
        "compaction_start/end — 压缩",
        "auto_retry_start/end — 自动重试",
      ]}
    ],
    codeExample: {
      lang: "typescript",
      code: `import {
  AuthStorage, createAgentSession,
  ModelRegistry, SessionManager
} from "@earendil-works/pi-coding-agent";

const auth = AuthStorage.create();
const registry = ModelRegistry.create(auth);

const { session } = await createAgentSession({
  sessionManager: SessionManager.inMemory(),
  authStorage: auth,
  modelRegistry: registry,
  tools: ["read", "bash", "write"],
  thinkingLevel: "medium",
});

session.subscribe((event) => {
  if (event.type === "message_update") {
    if (event.assistantMessageEvent.type === "text_delta") {
      process.stdout.write(event.assistantMessageEvent.delta);
    }
  }
});

await session.prompt("列出当前目录的文件");
session.dispose();`,
      explanation: "最简 SDK 集成: 创建 session → 订阅事件 → 发送 prompt → 清理。"
    },
    challenge: {
      question: "SDK 中获取流式文本输出需要监听哪个事件？",
      options: [
        "message_start",
        "message_update 且 assistantMessageEvent.type === 'text_delta'",
        "tool_execution_update",
        "agent_end"
      ],
      answer: 1,
      explanation: "message_update 事件中的 assistantMessageEvent.type === 'text_delta' 承载流式文本。"
    }
  },
  {
    id: "8",
    chapter: "第八关",
    title: "渡口",
    description: "Pi Package 打包与发布",
    story: [
      "你来到城堡后方的渡口，一艘艘写着 @npm 和 @git 的船停靠在岸边。",
      "",
      "「所有冒险的终点是分享，」码头老船长说。",
      "「你的 Extension + Skill + Prompt + Theme 可以打包成 Pi Package，」",
      "「通过 npm 或 git 分享给全世界的开发者。」",
      "",
      "「pi install 一行命令，就能让别人用上你的杰作。」",
    ],
    concept: [
      { title: "Package 结构", body: [
        "package.json 中加 pi 字段声明资源。",
        "pi.extensions / pi.skills / pi.prompts / pi.themes",
        "keywords: ['pi-package'] 用于 npm 发现",
        "也可用约定目录: extensions/ skills/ prompts/ themes/",
      ]},
      { title: "安装与管理", body: [
        "pi install npm:@foo/bar — npm 包",
        "pi install git:github.com/user/repo — git 仓库",
        "pi install ./local-path — 本地路径",
        "pi remove / update / list / config",
        "-l 参数安装到项目本地 (.pi/settings.json)",
      ]},
      { title: "依赖管理", body: [
        "核心包 (@earendil-works/pi-*) 放在 peerDependencies",
        "第三方依赖放在 dependencies + bundledDependencies",
        "git 包自动 npm install",
      ]}
    ],
    codeExample: {
      lang: "json",
      code: `{
  "name": "my-pi-tools",
  "version": "1.0.0",
  "keywords": ["pi-package"],
  "pi": {
    "extensions": ["./extensions"],
    "skills": ["./skills"],
    "prompts": ["./prompts"],
    "themes": ["./themes"]
  },
  "peerDependencies": {
    "@earendil-works/pi-coding-agent": "*",
    "typebox": "*"
  }
}`,
      explanation: "package.json 中声明 pi 字段和 pi-package 关键词即可被 pi 发现。"
    },
    challenge: {
      question: "pi 核心包在 package dependencies 中应该如何声明？",
      options: [
        "放在 dependencies 中",
        "放在 devDependencies 中",
        "放在 peerDependencies 中, 版本写 *",
        "不需要声明"
      ],
      answer: 2,
      explanation: "核心包放在 peerDependencies 中，版本写 *，并且不打包进你的包里。"
    }
  },
  {
    id: "boss",
    chapter: "⚔️ BOSS 战",
    title: "大建筑师",
    description: "综合实战：从零构建一个完整的 Extension",
    story: [
      "城堡最高的塔顶，大建筑师端坐在王座上。",
      "",
      "「你已经遍历了所有关卡。现在，让我看看你能不能把一切串联起来。」",
      "",
      "「挑战：构建一个『项目守护者』Extension——」",
      "「——它监控文件变更，拦截危险操作，注入项目规则，并持久化操作日志。」",
      "",
      "「这会用到 event 拦截、tool 注册、UI 提示、session 持久化。」",
      "「所有你学过的知识。」",
    ],
    concept: [
      { title: "综合需求", body: [
        "tool_call 事件 → 拦截危险 bash 命令 + 保护敏感文件",
        "before_agent_start → 读取项目 AGENTS.md 注入上下文",
        "session_start → 从 custom entry 恢复日志",
        "message_end → 记录每次操作",
        "自定义 tool → 提供 /guardian-stats 查看统计",
        "UI → setStatus 在 footer 显示守护状态",
        "持久化 → appendEntry 保存操作日志",
      ]},
      { title: "你的工具箱 (回顾)", body: [
        "✅ pi.registerTool() — 注册自定义工具",
        "✅ pi.on('tool_call') — 拦截所有工具调用",
        "✅ pi.on('before_agent_start') — 注入上下文",
        "✅ pi.on('session_start') — 恢复状态",
        "✅ pi.appendEntry() — 持久化数据",
        "✅ ctx.ui.setStatus() — Footer 状态栏",
        "✅ ctx.ui.notify() — 通知",
        "✅ pi.registerCommand() — 注册命令",
      ]}
    ],
    codeExample: {
      lang: "typescript",
      code: `// 🛡️ 项目守护者 — 完整示例
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { isToolCallEventType } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface LogEntry { time: string; tool: string; action: string; }

export default function (pi: ExtensionAPI) {
  let logs: LogEntry[] = [];

  // 恢复日志
  pi.on("session_start", (_event, ctx) => {
    for (const e of ctx.sessionManager.getEntries()) {
      if (e.type === "custom" && e.customType === "guardian-log") {
        logs = e.data || [];
      }
    }
    ctx.ui.notify("🛡️ 守护者已激活", "info");
    ctx.ui.setStatus("guardian", 
      ctx.ui.theme.fg("success", "🛡️ 守护中"));
  });

  // 注入项目规则
  pi.on("before_agent_start", async (event, ctx) => {
    const agentsPath = join(ctx.cwd, "AGENTS.md");
    if (existsSync(agentsPath)) {
      return {
        systemPrompt: event.systemPrompt + 
          "\\n\\n<project-rules>\\n" + 
          readFileSync(agentsPath, "utf-8") +
          "\\n</project-rules>",
      };
    }
  });

  // 拦截危险操作
  pi.on("tool_call", async (event, ctx) => {
    if (isToolCallEventType("bash", event)) {
      const cmd = event.input.command || "";
      const dangerous = ["rm -rf", "sudo", "> /dev/", "mkfs"];
      if (dangerous.some(d => cmd.includes(d))) {
        const ok = await ctx.ui.confirm(
          "⚠️ 危险命令",
          \`允许执行: \${cmd.slice(0, 100)}\`
        );
        if (!ok) {
          logs.push({ time: new Date().toISOString(), 
            tool: "bash", action: \`BLOCKED: \${cmd}\` });
          pi.appendEntry("guardian-log", logs);
          return { block: true, reason: "守护者拦截" };
        }
      }
    }
    if (isToolCallEventType("write", event)) {
      const p = event.input.path || "";
      if (p.includes(".env") || p.includes(".env.local")) {
        logs.push({ time: new Date().toISOString(), 
          tool: "write", action: \`BLOCKED: \${p}\` });
        pi.appendEntry("guardian-log", logs);
        return { block: true, reason: "禁止修改环境文件" };
      }
    }
  });

  // 记录操作
  pi.on("tool_result", (event) => {
    logs.push({ time: new Date().toISOString(), 
      tool: event.toolName, 
      action: event.isError ? "FAILED" : "OK" });
    pi.appendEntry("guardian-log", logs);
  });

  // 查看统计
  pi.registerTool({
    name: "guardian_stats",
    label: "Guardian Stats",
    description: "查看守护者拦截统计",
    parameters: Type.Object({}),
    async execute() {
      const blocked = logs.filter(l => l.action.includes("BLOCKED")).length;
      return {
        content: [{ type: "text", 
          text: \`🛡️ 守护者统计: 总记录 \${logs.length}, 拦截 \${blocked} 次\` }],
        details: { logs },
      };
    },
  });
}`,
      explanation: "综合运用 event 拦截、状态恢复、上下文注入、工具注册、UI 反馈。这就是 pi 的力量。"
    },
    challenge: {
      question: "你学会了所有 pi 核心概念。下一步做什么？",
      options: [
        "🎉 构建自己的 Extension，贡献给社区!",
        "📖 阅读所有 examples/extensions/ 源码",
        "🔧 在真实项目中写一个守护者 Extension",
        "以上全部!"
      ],
      answer: 3,
      explanation: "🎊 恭喜通关! 你已经掌握了 pi 框架的核心能力。去构建吧！",
    },
    boss: true,
  },

  // ═══════════════════════════════════════════════════════
  // 🥇 进阶熔炉 — 源码思想篇
  // ═══════════════════════════════════════════════════════

  {
    id: "9",
    chapter: "第九关",
    title: "事件熔炉",
    description: "深入事件总线架构 — pub/sub、中间件链、异步编排",
    story: [
      "基础之路的尽头，你发现城堡地下还有一座熔炉。",
      "铁砧上的金属不是铁，而是流动的 event 流。",
      "",
      "「欢迎来到进阶熔炉，」一位戴着眼镜的矮人工匠说。",
      "「使用 API 只是皮毛。真正的力量来自理解引擎内部的」",
      "「——模式。今天我们从事件总线开始。」",
      "",
      "他拿起一块烧红的金属：「pi 的事件系统不是简单的 pub/sub。」",
      "「它是一组精密的中间件链。」",
    ],
    concept: [
      { title: "事件总线的三层设计", body: [
        "第一层 — Pub/Sub 基础: createEventBus() 返回一个 EventEmitter",
        "  · pi.on(name, handler) 注册处理器",
        "  · 每次事件触发，所有注册的 handler 按序执行",
        "  · pi.events.emit() 可用于扩展间通信",
        "",
        "第二层 — 中间件链: 某些事件的 handler 可以影响后续 handler",
        "  · tool_call: input 在原地被修改，后一个 handler 看到前一个的改动",
        "  · before_agent_start: systemPrompt 在 handler 间链式传递",
        "  · tool_result: content/details/isError 可以打补丁",
        "  · 这是有向无环的管道模式，不是树形",
        "",
        "第三层 — 生命周期保证:",
        "  · session_start 在所有资源加载前触发",
        "  · tool_call 运行前确保 sessionManager 已同步到当前消息",
        "  · session_shutdown 总是最后一个事件",
      ]},
      { title: "为什么不用 typed event discriminator？", body: [
        "pi 用字符串标识事件名而非 TypeScript discriminated union。",
        "原因1: 扩展性 — 第三方扩展可以 emit 自定义事件",
        "  pi.events.emit('my-ext:status', data)",
        "原因2: 弱耦合 — 事件生产者和消费者不需要 import 同一个类型",
        "原因3: 向后兼容 — 新增事件不需要改类型定义",
        "",
        "代价: 类型安全靠 isToolCallEventType() 手动窄化。",
        "这是框架设计的经典取舍: 灵活性 vs 类型安全。",
      ]},
      { title: "handler 返回值的语义", body: [
        "不同事件对 handler 返回值有不同处理:",
        "  · tool_call → { block: true } 阻止执行",
        "  · tool_result → { content, details, isError } 打补丁",
        "  · before_agent_start → { message, systemPrompt } 注入",
        "  · context → { messages } 替换消息列表",
        "  · session_before_compact → { compaction: {...} } 自定义摘要",
        "  · input → { action: 'handled' | 'transform' | 'continue' }",
        "",
        "这种设计让事件不仅仅是通知，而是控制流的一部分。",
        "这叫做 '事件驱动的控制反转' — handler 可以改变引擎的行为。",
      ]},
    ],
    codeExample: {
      lang: "typescript",
      code: `// 🔬 深入: 事件总线如何实现中间件链
// 简化版的 pi 事件总线核心逻辑:

class EventBus {
  private handlers = new Map<string, Function[]>();

  on(event: string, handler: Function) {
    const list = this.handlers.get(event) || [];
    list.push(handler);
    this.handlers.set(event, list);
  }

  // 关键: emit 是异步串行的 — 每个 handler 的结果
  // 会影响下一个 handler 的输入
  async emit(event: string, payload: any) {
    const handlers = this.handlers.get(event) || [];
    let currentPayload = payload;
    
    for (const handler of handlers) {
      const result = await handler(currentPayload);
      
      // 中间件链的核心: 合并结果到 payload
      if (result) {
        if (result.block) return { blocked: true, ...result };
        // tool_call 场景: 修改 input
        if (result.input !== undefined) {
          Object.assign(currentPayload.input, result.input);
        }
        // tool_result 场景: 打补丁
        if (result.content) currentPayload.content = result.content;
        // before_agent_start 场景: 链式 systemPrompt
        if (result.systemPrompt) currentPayload.systemPrompt = result.systemPrompt;
      }
    }
    return currentPayload;
  }
}`,
      explanation: "这不是 pi 的真实源码，但展现了核心设计模式: 异步串行 + 结果合并 = 中间件链。"
    },
    challenge: {
      question: "为什么 tool_call 的 input 是可变的(mutable)而不是返回新对象？",
      options: [
        "性能考虑 — 避免频繁创建新对象",
        "中间件链语义 — 让后面的 handler 看到前面 handler 的修改",
        "JavaScript 限制 — 无法深拷贝复杂对象",
        "历史遗留 — 早期设计没考虑不可变性"
      ],
      answer: 1,
      explanation: "原地修改让后一个 handler 看到前一个 handler 的改动，实现真正的中间件管道。这也是为什么 handler 的注册顺序很重要。"
    }
  },
  {
    id: "10",
    chapter: "第十关",
    title: "编译烈焰",
    description: "深入 Extension 加载引擎 — jiti、工厂模式、生命周期管理",
    story: [
      "你走进一间到处是翻飞书页的房间。书页上的 TypeScript 代码",
      "在空气中自动编译成 JavaScript，然后像蝴蝶一样飞向执行引擎。",
      "",
      "「这里是编译烈焰，」一位白袍编译法师挥舞着魔杖。",
      "「pi 使用 jiti 进行即时编译。没有 webpack，没有 tsc，没有 build。」",
      "「你写的 .ts 文件直接被执行。但魔法背后是精妙的设计。」",
    ],
    concept: [
      { title: "jiti 即时编译的工作原理", body: [
        "jiti 是 unjs 生态的 TS 运行时编译器:",
        "  · 使用 esbuild 做超快速转译 (不是类型检查)",
        "  · 拦截 Node.js 的 require/import 钩子",
        "  · 转译结果缓存在内存中",
        "  · 支持 JSX、ESM、CJS 互操作",
        "",
        "为什么不用 ts-node? ts-node 太重，启动慢。",
        "为什么不用 tsx? jiti 的模块解析更精准。",
        "为什么不用 bun? bun 不能完全兼容 Node.js 生态。",
        "",
        "关键洞察: jiti 只转译，不做类型检查。",
        "类型安全完全交给你的 IDE (tsserver)。",
      ]},
      { title: "工厂函数模式的设计理由", body: [
        "为什么 Extension 的入口是 export default function(pi)？",
        "",
        "1. 延迟初始化: 传入 ExtensionAPI 而非全局单例",
        "  每个 session 有自己的 ExtensionAPI 实例",
        "  多 session 场景 (SDK) 下互不干扰",
        "",
        "2. 依赖注入: pi 对象是框架注入给你的",
        "  你不 import，框架传入 — 控制反转",
        "  测试时可以 mock pi 对象",
        "",
        "3. 异步支持: async function(pi) 表示初始化需要 I/O",
        "  pi 会 await 工厂函数的返回值",
        "  加载远程模型列表、初始化连接池等场景",
        "",
        "这不是偶然，这是精心选择的工厂+依赖注入模式。",
      ]},
      { title: "完整生命周期时序", body: [
        "1. pi 扫描 extensions/ 目录 → 用 jiti 加载模块",
        "2. 调用 export default function(pi) → 注册 handlers",
        "3. 如果返回 Promise → await 完成",
        "4. 触发 session_start { reason: 'startup' }",
        "5. 触发 resources_discover { reason: 'startup' }",
        "",
        "正常运行:",
        "6. 用户输入 → input 事件 → agent 循环",
        "7. /reload → session_shutdown → 重新加载 → session_start",
        "",
        "结束:",
        "8. /new / /fork → session_shutdown → 新 session_start",
        "9. Ctrl+C → session_shutdown { reason: 'quit' }",
        "",
        "记住: session_shutdown 是你清理资源的唯一时机。",
      ]},
    ],
    codeExample: {
      lang: "typescript",
      code: `// 🔬 Extension 加载引擎的简化实现
// pi 内部大致是这样加载 Extension 的:

import { createJiti } from "jiti";
import { join } from "path";

async function loadExtensions(extDir: string) {
  const jiti = createJiti(import.meta.url, {
    // jiti 配置: 允许 JSX、别名等
    transformOptions: { jsx: true },
  });

  for (const file of scanDir(extDir)) {
    // jiti 即时编译并导入 TypeScript 模块
    const mod = jiti(file);
    
    // 工厂模式: 调用 default export
    // 注意: 这里 await 了 — 支持异步初始化!
    await mod.default(createExtensionAPI());
  }
}

// 延迟加载策略:
// - 不在启动时加载所有扩展
// - 按需发现 (lazy discovery)
// - 缓存已编译的模块
// - 只有 /reload 才重新扫描

// 为什么这样做？
// 启动性能: 你有 20 个扩展时，jiti 缓存让加载几乎瞬时
// 内存效率: 不加载用不到的扩展
// 开发体验: 修改 .ts 后 /reload 即可生效`,
      explanation: "jiti 的即时编译 + 工厂模式 + 延迟加载 = pi 的扩展加载引擎。没有 build 步骤，没有 dist 目录，写了就能跑。"
    },
    challenge: {
      question: "为什么 pi 在加载 Extension 时会 await 工厂函数？",
      options: [
        "为了确保初始化代码 (如 fetch 远程数据) 在 session_start 前完成",
        "为了限制并发加载的扩展数量",
        "为了收集所有扩展的错误日志",
        "为了防止循环依赖"
      ],
      answer: 0,
      explanation: "async 工厂函数用于一次性初始化 (如 registerProvider、fetch 模型列表等)。await 确保初始化在 session_start 之前完成，后续的 handler 才能正常使用。"
    }
  },
  {
    id: "11",
    chapter: "第十一关",
    title: "树之根脉",
    description: "深入会话树数据结构 — JSONL 追加、id/parentId 分支、上下文构建",
    story: [
      "穿过一道数学公式构成的门，你进入了一个几何空间。",
      "节点闪烁，边缘延伸，整棵会话树在三维空间中旋转。",
      "",
      "「会话不是线性的，」树之守护者指着空中漂浮的 JSONL 行说。",
      "「每一行是一个节点，parentId 连接成树。分支只是改变了」",
      "「某个节点的父指针。不需要复制任何数据。」",
      "",
      "她伸手触碰一个节点：「看看它的 id …… 8 位 hex。」",
      "「从同一个 parentId 指向两个 id，这就是分叉。」",
    ],
    concept: [
      { title: "JSONL 追加与树形结构", body: [
        "Session 文件是 JSONL (每行一个 JSON):",
        "  · 第一行: SessionHeader (version, id, cwd)",
        "  · 后续每行: SessionEntryBase { type, id, parentId, timestamp }",
        "  · Entry 类型: message / compaction / branch_summary / custom / label / ...",
        "",
        "内核设计:",
        "  · 追加写 (append-only) — 永远不改旧行，只有新行",
        "  · 崩溃安全 — 即使写入中断，已写入的行不丢失",
        "  · 分支 = 改变 parentId — 不是复制文件",
        "  · /tree 选择不同叶子 → 沿着不同的 parentId 链回溯",
        "",
        "为什么不用数据库？",
        "  · JSONL 是纯文本，git diff 友好",
        "  · 无需 DAO 层，直接读文件",
        "  · 一个文件 = 一个会话，管理简单",
      ]},
      { title: "buildSessionContext() 算法", body: [
        "这是将树形结构展开为 LLM 线性上下文的算法:",
        "",
        "1. 从当前 leaf 出发，沿 parentId 回溯到 root",
        "2. 收集路径上的所有 entry",
        "3. 遇到 CompactionEntry → 输出 summary + 跳过已压缩的 entry",
        "4. 遇到 BranchSummaryEntry → 转换为 custom_message",
        "5. message entry → 直接输出",
        "6. custom_message entry → 进入 LLM 上下文",
        "7. custom entry → 跳过 (不进入上下文)",
        "",
        "关键细节: firstKeptEntryId 机制",
        "  · CompactionEntry 记录 firstKeptEntryId — 被保留的第一个消息",
        "  · 回溯时遇到 CompactionEntry，从 firstKeptEntryId 重新开始",
        "  · 这形成了 '摘要 → 保留消息 → 新消息' 的三层结构",
      ]},
      { title: "分支不会复制数据", body: [
        "/tree 选一个旧节点，继续发消息:",
        "  · 新消息的 parentId 指向旧节点",
        "  · 旧的分支 (被放弃的路径) 仍然在文件中",
        "  · 两条路径共享共同的祖先节点",
        "",
        "/fork 创建新文件:",
        "  · 走向是从 root 到选中点的所有节点",
        "  · 在新文件里写入这些节点 (通过 SessionManager.createBranchedSession)",
        "  · 原文件不受影响",
        "",
        "这是典型的 '不可变数据结构' 思想:",
        "  append-only + 指针修改 = 零拷贝分支",
      ]},
    ],
    codeExample: {
      lang: "typescript",
      code: `// 🔬 会话树的简化实现

interface TreeNode {
  id: string;
  parentId: string | null;
  // ... entry 数据
}

class SessionTree {
  private nodes = new Map<string, TreeNode>();
  private leafId: string | null = null;

  // 追加新节点 — 只需修改 parentId 指向
  append(node: TreeNode) {
    this.nodes.set(node.id, node);
    this.leafId = node.id; // 默认新节点是叶子
  }

  // 分支 — 只改 leafId 指针，不复制数据
  branch(targetId: string) {
    if (!this.nodes.has(targetId)) throw new Error("Not found");
    this.leafId = targetId;
  }

  // 构建 LLM 上下文 — 从叶子回溯到根
  buildContext(): TreeNode[] {
    if (!this.leafId) return [];
    const path: TreeNode[] = [];
    let currentId: string | null = this.leafId;
    
    while (currentId) {
      const node = this.nodes.get(currentId);
      if (!node) break;
      
      // 遇到压缩节点，跳过已压缩的条目
      if (node.type === "compaction") {
        path.push(node); // 摘要
        currentId = node.firstKeptEntryId; // 跳到保留的起点
        continue;
      }
      
      path.unshift(node); // 插入到开头 (反向构建)
      currentId = node.parentId;
    }
    return path;
  }
}`,
      explanation: "核心思想: 树 = Map<id, node> + leafId 指针。branch() 只改指针。buildContext() 沿链回溯。零拷贝分支。"
    },
    challenge: {
      question: "为什么 JSONL append-only + id/parentId 比存完整对话副本更好？",
      options: [
        "更省磁盘空间 — 分支节点共享祖先",
        "更强的崩溃安全性 — 写入中断不损坏已有数据",
        "git diff 友好 — 纯文本格式",
        "以上都是"
      ],
      answer: 3,
      explanation: "这三个都是 JSONL append-only 设计的核心优势。这是典型的 '选择正确的数据结构胜过优化算法' 的案例。"
    }
  },
  {
    id: "12",
    chapter: "第十二关",
    title: "压缩之炉",
    description: "深入 Compaction 算法 — 回溯切分、split turn、迭代摘要",
    story: [
      "一座巨大的压力机在你面前运转，吞入几十条对话，",
      "吐出一段精炼的摘要。",
      "",
      "「Compaction 不是简单的 '取后 N 条'，」压力机旁的工程师说。",
      "「它要找到安全的切分点。你不能从一条 tool result 切，」",
      "「必须从完整的一轮对话边界切。」",
      "",
      "「但有时候一轮对话太长了，超过了保留预算……」",
      "「那就要 split turn — 在一轮中间切。」",
    ],
    concept: [
      { title: "Compaction 三步算法", body: [
        "Step 1 — 找切分点 (findCutPoint):",
        "  · 从最新消息向前走，累计 token 估算",
        "  · keepRecentTokens (默认 20k) 触达时停止",
        "  · 安全切分点在: user / assistant / bashExecution / custom_message",
        "  · 绝不能切在: toolResult (必须和它的 toolCall 在一起)",
        "",
        "Step 2 — 提取消息:",
        "  · messagesToSummarize: 从上次保留点到切分点",
        "  · 如果第一轮就超预算 → isSplitTurn = true",
        "  · turnPrefixMessages: split turn 时，前缀部分需单独摘要",
        "",
        "Step 3 — 生成摘要:",
        "  · serializeConversation() 序列化为文本 (防止 LLM 续写)",
        "  · 传入 previousSummary 作为迭代上下文",
        "  · LLM 生成结构化摘要: Goal / Progress / Decisions / Next Steps",
        "  · 追加 CompactionEntry { summary, firstKeptEntryId, tokensBefore }",
      ]},
      { title: "Split Turn 详解", body: [
        "正常情况: 切分点恰好在 user message (turn 边界)",
        "  · messagesToSummarize = 若干完整 turn",
        "  · 无 turnPrefixMessages",
        "",
        "Split Turn: 第一个 turn 本身超过了 keepRecentTokens",
        "  · messagesToSummarize = [] (没有完整 turn)",
        "  · turnPrefixMessages = 超长 turn 的前缀部分",
        "  · 系统分别生成 history summary + turn prefix summary",
        "",
        "为什么会发生 split turn？",
        "  · LLM 一次读了 300 个文件 (大量 tool_result)",
        "  · 单次 bash 命令输出 5000 行",
        "  · token 估算误差累积",
        "",
        "这是异常优雅的边界处理: 不切割 turn → split turn 双摘要。",
      ]},
      { title: "迭代摘要与文件追踪", body: [
        "迭代摘要:",
        "  · 第二次 compact 时，previousSummary 传入第一次的摘要",
        "  · LLM 看到 '在此之前发生了什么' → 生成连贯的摘要",
        "  · 不是独立摘要，而是增量更新",
        "",
        "文件追踪 (累积式):",
        "  · 每次 compact 提取 readFiles / modifiedFiles",
        "  · 下次 compact 时合并上次的列表",
        "  · 多次 compact 后的文件列表是完整的项目影响范围",
        "",
        "reserveTokens (16k) vs keepRecentTokens (20k) 的权衡:",
        "  · reserveTokens: 留给 LLM 响应的空间",
        "  · keepRecentTokens: 保留最近对话的 token 量",
        "  · 触发条件: contextTokens > contextWindow - reserveTokens",
      ]},
    ],
    codeExample: {
      lang: "typescript",
      code: `// 🔬 Compaction 切分点查找的简化实现

function findCutPoint(
  entries: Entry[], 
  keepRecentTokens: number
): CutPointResult {
  let accumulatedTokens = 0;
  
  // 从最新到最旧遍历
  for (let i = entries.length - 1; i >= 0; i--) {
    accumulatedTokens += estimateTokens(entries[i]);
    
    if (accumulatedTokens >= keepRecentTokens) {
      // 找到 token 预算耗尽点
      // 向前搜索安全切分点
      for (let j = i; j < entries.length; j++) {
        const entry = entries[j];
        // 安全切分点: 不能在 toolResult 处切
        if (isSafeCutPoint(entry)) {
          return {
            cutIndex: j,
            isSplitTurn: entries[j-1]?.role === "assistant",
            messagesToSummarize: entries.slice(0, j - 1),
            turnPrefixMessages: [], // split turn 时单独处理
          };
        }
      }
    }
  }
  
  // 全部保留 (不需要压缩)
  return { cutIndex: entries.length, ... };
}

function isSafeCutPoint(entry: Entry): boolean {
  // 安全点: user / assistant / bashExecution / custom_message
  // 不安全: toolResult (必须紧跟其 toolCall)
  return entry.role !== "toolResult";
}

// 为什么这样设计？
// LLM 需要完整的 toolCall → toolResult 对
// 如果 toolResult 被摘要而 toolCall 保留 → 上下文断裂
// 如果 toolCall 被摘要而 toolResult 保留 → LLM 困惑`,
      explanation: "回溯 + 安全切分点 + split turn = pi 的 compaction 算法。这不是简单的 '截断尾部'，而是一个考虑了对话语义结构的精密压缩器。"
    },
    challenge: {
      question: "为什么 compaction 的切分点不能在 toolResult 处？",
      options: [
        "toolResult 不包含 parentId",
        "LLM 需要看到完整的 toolCall→toolResult 对才能理解上下文",
        "toolResult 的 token 数太多",
        "toolResult 存在单独的文件中"
      ],
      answer: 1,
      explanation: "toolCall 和 toolResult 是配对的。切在 toolResult 意味着摘要包含 toolResult 但保留 toolCall (或反之)，LLM 会看到一个无上下文的工具结果，无法理解。"
    }
  },
  {
    id: "13",
    chapter: "第十三关",
    title: "并行之流",
    description: "深入流式处理与并行工具执行 — preflight、SSE/WS、AbortSignal 传播",
    story: [
      "一座巨大的水车在河流中转动，每片桨叶同时处理不同的 task。",
      "水流代表 SSE 事件流，水车代表并行工具执行。",
      "",
      "「表面看 pi 的工具是串行的，」水车管理员说。",
      "「但实际上，当 LLM 返回多个 tool_call 时，」",
      "「它们的预检 (preflight) 是串行的，但实际执行是并发的。」",
      "",
      "「理解这个 —— 你就能理解 pi 的整个异步模型。」",
    ],
    concept: [
      { title: "Preflight + 并发执行的秘密", body: [
        "当 LLM 在一个 turn 中返回多个 tool_call:",
        "",
        "第一阶段 — Preflight (串行):",
        "  · tool_call 事件逐个触发 (在 assistant source order 中)",
        "  · 每个 handler 可以修改 event.input",
        "  · 后面的 handler 能看到前面 handler 的修改",
        "  · 这是串行的 — 确保中间件链的有序性",
        "",
        "第二阶段 — 执行 (并发):",
        "  · 所有通过 preflight 的工具同时启动",
        "  · tool_execution_update 可能交错出现",
        "  · tool_result 按完成顺序触发",
        "",
        "第三阶段 — 组装 (按序):",
        "  · 最终 toolResult 消息按 assistant source order 排列",
        "  · 保证 LLM 看到的顺序一致",
        "",
        "核心保证: 同一轮 tool_call 看不到兄弟 tool 的结果。",
        "(所以你不能在一个 tool_call handler 里读取另一个 tool 的结果)",
      ]},
      { title: "流式架构: SSE vs WebSocket", body: [
        "文本流:",
        "  · message_update 事件每次携带一个 text_delta",
        "  · 在 SDK 中: subscribe(listener) → text_delta → 渲染",
        "  · 在 TUI 中: 同样的 event → 渲染到终端",
        "",
        "传输层:",
        "  · SSE (Server-Sent Events): HTTP 长连接，单向流",
        "  · WebSocket: 双向通信，某些 provider 支持",
        "  · transport 设置: sse / websocket / auto",
        "",
        "AbortSignal 传播:",
        "  · ctx.signal 贯穿整个 turn 生命周期",
        "  · Esc → abort() → signal 被标记为 aborted",
        "  · tool_call 中的 fetch() 应该传 signal 以支持取消",
        "  · 并行工具中，一个工具的错误不影响其他工具",
      ]},
      { title: "消息队列模型", body: [
        "Steering (steer) vs Follow-up (followUp):",
        "  · steer: 当前 tool 执行完后立即发送",
        "  · followUp: agent 完全停止后才发送",
        "  · nextTurn: 下次用户输入时发送",
        "",
        "为什么需要这个区分？",
        "  · steer = 实时修正: '不要改那个文件，改这个'",
        "  · followUp = 后续任务: '完成后也格式化一下'",
        "  · 如果不区分，steering 可能在工具执行中被忽略",
        "",
        "这本质上是一个优先级队列 + 生命周期感知的消息调度器。",
      ]},
    ],
    codeExample: {
      lang: "typescript",
      code: `// 🔬 并行工具执行的简化实现

async function executeToolsInParallel(
  toolCalls: ToolCall[],
  handlers: ToolCallHandler[]
) {
  // 第一阶段: Preflight — 串行运行 tool_call handlers
  const preflighted: ToolCall[] = [];
  
  for (const call of toolCalls) {
    let blocked = false;
    let mutatedInput = { ...call.input };
    
    for (const handler of handlers) {
      const result = await handler({
        toolName: call.name,
        toolCallId: call.id,
        input: mutatedInput, // 注意: 原地修改
      });
      
      if (result?.block) {
        blocked = true;
        break;
      }
    }
    
    if (!blocked) {
      preflighted.push({ ...call, input: mutatedInput });
    }
  }
  
  // 第二阶段: 并发执行
  const results = await Promise.all(
    preflighted.map(call => 
      executeTool(call).catch(err => ({
        toolCallId: call.id,
        isError: true,
        content: [{ type: "text", text: err.message }],
      }))
    )
  );
  
  // 第三阶段: 按原始顺序排列结果
  // (保持 assistant source order)
  return results;
}

// 设计思想:
// 1. Preflight 串行 = 中间件链可预测
// 2. 执行并发 = 最大化 I/O 利用率
// 3. 结果按序 = LLM 看到一致的顺序`,
      explanation: "preflight 串行 (handler 有序性) + 执行并发 (性能) + 结果排序 (LLM 一致性) = pi 的并行工具模型。三个阶段的分离是深思熟虑的设计。"
    },
    challenge: {
      question: "为什么同一个 turn 的 tool_call handler 看不到兄弟 tool 的结果？",
      options: [
        "因为并行工具实际执行前，结果还不存在",
        "因为 pi 刻意避免了工具间的耦合",
        "因为 LLM 的 tool_call 本来就是独立的",
        "以上都是"
      ],
      answer: 3,
      explanation: "preflight 阶段工具还没执行; 设计上避免工具间隐式依赖; LLM 每个 tool_call 应该 self-contained。三重原因。"
    }
  },
  {
    id: "14",
    chapter: "第十四关",
    title: "抽象之镜",
    description: "深入 Provider 抽象与 Resource Loader — 多模型统一、认证链、延迟发现",
    story: [
      "最后一面镜子悬浮在空中。你看到镜中有无数个 LLM provider",
      "通过同一条管道连接到 pi。Anthropic、OpenAI、Google、Groq……",
      "",
      "「这就是 pi 的抽象之镜，」镜中倒影说道。",
      "「每个 provider 说不同的 API 方言，但 pi 把它们统一映射到」",
      "「同一套接口。ModelRegistry → AuthStorage → Provider Adapter。」",
      "",
      "「同时，ResourceLoader 用同样的抽象哲学处理扩展、技能、提示词。」",
      "「一切都是可替换的接口 + 默认实现。」",
    ],
    concept: [
      { title: "Provider 抽象的三层架构", body: [
        "第一层 — ModelRegistry:",
        "  · 管理所有 provider 的模型列表",
        "  · 内置模型 (随 pi 发布更新) + 自定义模型 (models.json)",
        "  · find(provider, modelId) — 精确查找",
        "  · getAvailable() — 只返回有 API key 的模型",
        "",
        "第二层 — AuthStorage:",
        "  · API key 的四级解析链:",
        "    1. setRuntimeApiKey() (运行时覆盖，不持久化)",
        "    2. auth.json (持久化存储)",
        "    3. 环境变量 (ANTHROPIC_API_KEY 等)",
        "    4. Fallback resolver (models.json 中声明的解析器)",
        "  · OAuth token 管理: /login → auth.json",
        "",
        "第三层 — Provider Adapter:",
        "  · 每个 provider 有一个 adapter 将通用请求转为 provider 格式",
        "  · API 类型: openai-completions / anthropic-messages / google-genai",
        "  · 统一输出: AgentMessage 格式 (跨 provider 一致)",
      ]},
      { title: "ResourceLoader 的延迟发现模式", body: [
        "DefaultResourceLoader 的设计哲学: 按需发现 + 缓存:",
        "",
        "发现顺序:",
        "  1. 全局 (~/.pi/agent/extensions/)",
        "  2. 项目 (.pi/extensions/)",
        "  3. 包 (settings.json packages)",
        "  4. CLI flag (--extension / -e)",
        "",
        "延迟策略:",
        "  · reload() 触发全量重新扫描",
        "  · /reload 命令 → 调用 reload()",
        "  · 主题文件用 fs.watch 实时热更新 (不触发 reload)",
        "  · 其他资源需要显式 /reload",
        "",
        "为什么不是自动监听文件变更？",
        "  · 文件监听器的开销",
        "  · 扩展可能需要按顺序重载",
        "  · 用户主动控制重载时机更可预测",
      ]},
      { title: "依赖注入 vs 全局单例", body: [
        "pi 核心使用依赖注入而非全局单例:",
        "",
        "SDK:",
        "  · AuthStorage.create(path) — 可自定义路径",
        "  · ModelRegistry.create(authStorage) — 注入认证",
        "  · SessionManager.create(cwd) — 注入工作目录",
        "  · createAgentSession({...}) — 组装所有依赖",
        "",
        "Extension API:",
        "  · function(pi: ExtensionAPI) — pi 是注入的",
        "  · ctx.sessionManager — 从上下文获取",
        "  · ctx.ui — 从上下文获取",
        "",
        "好处:",
        "  · 测试: mock AuthStorage 即可模拟认证",
        "  · 多租户: 每个 SDK session 有自己的依赖",
        "  · 可替换: 用自己的 ResourceLoader 替换默认",
      ]},
    ],
    codeExample: {
      lang: "typescript",
      code: `// 🔬 抽象设计模式在 pi 中的体现

// ─── 模式1: 策略模式 (Provider Adapter) ───
interface ProviderAdapter {
  readonly api: "openai-completions" | "anthropic-messages" | "google-genai";
  buildRequest(params: AgentParams): ProviderRequest;
  parseResponse(raw: ProviderResponse): AgentMessage;
}

// 每个 provider 实现自己的 adapter
const anthropicAdapter: ProviderAdapter = {
  api: "anthropic-messages",
  buildRequest(params) { /* 转换系统提示 + 工具定义 */ },
  parseResponse(raw) { /* 解析 content blocks + tool_use */ },
};

// ─── 模式2: 责任链模式 (Auth 解析) ───
class AuthStorage {
  async resolveApiKey(provider: string): Promise<string | undefined> {
    // 1. 运行时覆盖
    if (this.runtimeKeys[provider]) return this.runtimeKeys[provider];
    // 2. 持久化存储
    const stored = await this.loadFromFile(provider);
    if (stored) return stored;
    // 3. 环境变量
    const envKey = this.resolveFromEnv(provider);
    if (envKey) return envKey;
    // 4. 自定义回退
    return this.fallbackResolver?.(provider);
  }
}

// ─── 模式3: 工厂 + 依赖注入 ───
const { session } = await createAgentSession({
  authStorage: AuthStorage.create("/custom/path"), // 注入
  modelRegistry: ModelRegistry.create(authStorage), // 注入
  resourceLoader: new DefaultResourceLoader({...}), // 注入
  sessionManager: SessionManager.inMemory(),        // 注入
});

// 每个组件都可以独立替换、测试、mock`,
      explanation: "策略模式 (Provider) + 责任链 (Auth) + 工厂/DI (Session) = pi 的架构三要素。理解这些模式，你就能举一反三。"
    },
    challenge: {
      question: "pi 使用依赖注入而非全局单例的主要原因是什么？",
      options: [
        "全局单例在 JavaScript 中性能差",
        "每个 SDK session 需要独立的 Auth/Session/ResourceLoader 实例",
        "TypeScript 不支持全局单例",
        "为了减少包体积"
      ],
      answer: 1,
      explanation: "多 session 场景下 (SDK 嵌入)，每个 session 有自己的认证、模型、资源加载器实例。全局单例会导致状态污染。依赖注入让每个 session 互相隔离。"
    }
  },
  {
    id: "boss2",
    chapter: "⚔️ BOSS 战 2",
    title: "架构师之战",
    description: "综合实战：构建一个'迷你 pi 引擎' — 事件总线 + 树形会话 + 工具并行",
    story: [
      "熔炉最深处，大架构师坐在地核中央的代码王座上。",
      "",
      "「你已遍历了使用之法和设计之道。最后的考验是：」",
      "「在一个文件里，构建一个迷你版 pi 引擎的核心。」",
      "",
      "「它要有一个事件总线 (pub/sub + 中间件链)，」",
      "「一个树形会话存储器 (append-only + id/parentId)，」",
      "「一个并行工具执行器 (preflight + concurrent)，」",
      "「和一个可扩展的工具注册系统。」",
      "",
      "「你会看到，200 行代码就能概括 pi 的全部核心理念。」",
    ],
    concept: [
      { title: "你需要实现的四个子系统", body: [
        "1. EventBus: on/emit，支持中间件链 (返回值合并)",
        "2. SessionTree: addNode/branch/buildPath",
        "3. ToolExecutor: preflight 串行 + 执行并发 + 结果排序",
        "4. ToolRegistry: register/execute",
        "",
        "目标: 把这些组合成一个 MiniAgent:",
        "  · 用户输入 → 模拟 LLM 返回 tool_calls",
        "  · 工具通过 preflight 拦截",
        "  · 并行执行工具",
        "  · 结果写入会话树",
      ]},
      { title: "架构设计原则回顾", body: [
        "1. 事件驱动: 所有行为通过事件总线通信",
        "2. 中间件链: handler 可以修改/阻止后续流程",
        "3. 追加写: 会话数据永远只追加不修改",
        "4. 指针分支: 分支只用指针，不复制数据",
        "5. 预检+并发: 安全检查串行，执行并发",
        "6. 依赖注入: 每个组件通过构造函数接收依赖",
        "7. 工厂模式: 用工厂函数创建而非 new 暴露",
        "",
        "这些不是 pi 的独有设计，而是几乎所有框架的共同智慧。",
      ]},
    ],
    codeExample: {
      lang: "typescript",
      code: `// 🏗️ MiniPi — 200 行概括 pi 核心架构

// ─── 1. 事件总线 ───
type Handler = (event: any) => Promise<any>;

class EventBus {
  private handlers = new Map<string, Handler[]>();
  
  on(event: string, handler: Handler) {
    const list = this.handlers.get(event) || [];
    list.push(handler);
    this.handlers.set(event, list);
  }
  
  async emit(event: string, payload: any) {
    let current = payload;
    for (const h of this.handlers.get(event) || []) {
      const r = await h(current);
      if (r?.block) return { blocked: true, ...r };
      if (r) Object.assign(current, r);
    }
    return current;
  }
}

// ─── 2. 树形会话 (append-only) ───
interface Node { id: string; parentId: string | null; type: string; data: any; }

class SessionTree {
  private nodes = new Map<string, Node>();
  leafId: string | null = null;
  
  append(node: Node) { this.nodes.set(node.id, node); this.leafId = node.id; }
  branch(id: string) { if (this.nodes.has(id)) this.leafId = id; }
  
  buildPath(): Node[] {
    const path: Node[] = [];
    let id = this.leafId;
    while (id) {
      const n = this.nodes.get(id);
      if (!n) break;
      path.unshift(n);
      id = n.parentId;
    }
    return path;
  }
}

// ─── 3. 工具系统 + 并行执行 ───
interface Tool { name: string; execute(params: any): Promise<any>; }

class ToolExecutor {
  private tools = new Map<string, Tool>();
  private eventBus: EventBus;
  
  constructor(eventBus: EventBus) { this.eventBus = eventBus; }
  register(tool: Tool) { this.tools.set(tool.name, tool); }
  
  async executeBatch(calls: { name: string; id: string; input: any }[]) {
    // Preflight (串行)
    const approved: typeof calls = [];
    for (const call of calls) {
      const result = await this.eventBus.emit("tool_call", {
        toolName: call.name, input: call.input,
      });
      if (!result.blocked) approved.push(call);
    }
    
    // 执行 (并发)
    return Promise.all(approved.map(async call => {
      const tool = this.tools.get(call.name);
      if (!tool) return { id: call.id, error: "Unknown tool" };
      try {
        const result = await tool.execute(call.input);
        return { id: call.id, result, error: null };
      } catch (e: any) {
        return { id: call.id, result: null, error: e.message };
      }
    }));
  }
}

// ─── 4. MiniAgent 组装 ───
class MiniAgent {
  eventBus = new EventBus();
  session = new SessionTree();
  executor = new ToolExecutor(this.eventBus);
  
  constructor() {
    // 注册自定义工具
    this.executor.register({
      name: "read",
      async execute(params) { return \`Read: \${params.path}\`; },
    });
    this.executor.register({
      name: "bash",
      async execute(params) { return \`Ran: \${params.command}\`; },
    });
    
    // 注册安全拦截器
    this.eventBus.on("tool_call", async (event) => {
      if (event.toolName === "bash" && 
          event.input.command?.includes("rm -rf")) {
        return { block: true, reason: "危险操作" };
      }
    });
    
    // 记录所有工具调用
    this.eventBus.on("tool_call", async (event) => {
      console.log(\`[TRACE] \${event.toolName}: \`, event.input);
    });
  }
  
  async run(userInput: string) {
    // 追加用户消息
    this.session.append({
      id: randomId(), parentId: this.session.leafId,
      type: "message", data: { role: "user", content: userInput },
    });
    
    // 模拟 LLM 返回 tool_calls
    const toolCalls = this.parseToolCalls(userInput);
    
    // 并行执行
    const results = await this.executor.executeBatch(toolCalls);
    
    // 写入结果
    for (const r of results) {
      this.session.append({
        id: randomId(), parentId: this.session.leafId,
        type: "message", data: { role: "toolResult", ...r },
      });
    }
  }
  
  private parseToolCalls(input: string) {
    // 简化: 从输入中解析工具调用
    if (input.includes("read")) return [{
      name: "read", id: randomId(),
      input: { path: "/tmp/test.ts" },
    }];
    if (input.includes("bash")) return [{
      name: "bash", id: randomId(),
      input: { command: "ls -la" },
    }];
    return [];
  }
}

function randomId() { return Math.random().toString(36).slice(2, 10); }

// 🎉 使用
const agent = new MiniAgent();
await agent.run("read the config file");
await agent.run("run ls command");
console.log("Session path:", agent.session.buildPath().length, "nodes");`,
      explanation: "200 行代码，四个子系统: EventBus (中间件链)、SessionTree (追加写+指针分支)、ToolExecutor (预检+并发)、MiniAgent (组装)。这就是 pi 的灵魂。"
    },
    challenge: {
      question: "你理解了 pi 的全部核心设计。下一步做什么？",
      options: [
        "🔬 阅读 pi-mono 源码 (github.com/earendil-works/pi-mono)",
        "🏗️ 用这些模式构建自己的工具/框架",
        "📝 给 pi 贡献 Extension 或文档",
        "以上全部 — 你已经是一名架构师了!"
      ],
      answer: 3,
      explanation: "🎊 恭喜! 你已从使用者进化为架构师。事件驱动、中间件链、追加写、指针分支、预检并发 — 这些模式将伴随你构建一切。",
    },
    boss: true,
  },
];

// ─── 游戏引擎 ────────────────────────────────────────

interface GameState {
  currentLevel: number;
  completedLevels: Set<number>;
  lives: number;
  knowledgeTokens: number;
}

function createGameState(): GameState {
  return {
    currentLevel: 0,
    completedLevels: new Set(),
    lives: 3,
    knowledgeTokens: 0,
  };
}

// ASCII Art 标题
const BANNER = [
  "  ╔══════════════════════════════════╗",
  "  ║  🏰  Pi Academy  终端冒险者学院  ║",
  "  ║                                ║",
  "  ║  学习 Pi 框架 · 闯关挑战 ·     ║",
  "  ║  收集知识令牌 · 击败Boss       ║",
  "  ╚══════════════════════════════════╝",
];

function renderText(content: string, theme: any): Text {
  // 处理特殊格式
  let text = content;
  // 替换格式标记
  text = text.replace(/\*\*(.+?)\*\*/g, (_, t) => theme.bold(t));
  return new Text(text, 1, 0);
}

export default function (pi: ExtensionAPI) {
  let gameState = createGameState();

  // 从 session 恢复进度
  pi.on("session_start", (_event, ctx) => {
    for (const entry of ctx.sessionManager.getEntries()) {
      if (entry.type === "custom" && entry.customType === "pi-academy-save") {
        const saved = entry.data as GameState;
        gameState.currentLevel = saved.currentLevel || 0;
        gameState.completedLevels = new Set(saved.completedLevels || []);
        gameState.lives = saved.lives ?? 3;
        gameState.knowledgeTokens = saved.knowledgeTokens || 0;
      }
    }
  });

  function saveProgress() {
    pi.appendEntry("pi-academy-save", {
      currentLevel: gameState.currentLevel,
      completedLevels: [...gameState.completedLevels],
      lives: gameState.lives,
      knowledgeTokens: gameState.knowledgeTokens,
    });
  }

  // 注册命令
  pi.registerCommand("academy", {
    description: "🏰 启动 Pi Academy 学习冒险",
    handler: async (_args, ctx) => {
      await ctx.waitForIdle();

      const result = await ctx.ui.custom<"playing" | "quit">(
        (tui, theme, _kb, done) => {
          let screen: "menu" | "map" | "concept" | "code" | "challenge" | "story" | "complete" = "menu";
          let storyLine = 0;
          let conceptIndex = 0;
          let challengeResult: boolean | null = null;
          let challengeSelected = 0;

          function gotoMenu() { screen = "menu"; tui.requestRender(); }
          function gotoMap() { screen = "map"; tui.requestRender(); }
          function gotoStory() { storyLine = 0; screen = "story"; tui.requestRender(); }
          function gotoConcept() { conceptIndex = 0; screen = "concept"; tui.requestRender(); }
          function gotoCode() { screen = "code"; tui.requestRender(); }
          function gotoChallenge() { challengeResult = null; challengeSelected = 0; screen = "challenge"; tui.requestRender(); }

          function startLevel(levelIndex: number) {
            gameState.currentLevel = levelIndex;
            saveProgress();
            gotoStory();
          }

          function completeLevel() {
            gameState.completedLevels.add(gameState.currentLevel);
            gameState.knowledgeTokens += 10;
            saveProgress();
            screen = "complete";
            tui.requestRender();
          }

          function render(width: number): string[] {
            const lines: string[] = [];
            const level = LEVELS[gameState.currentLevel];
            const pad = 2;

            // Helper: truncate a themed string to fit within visible width
            function fit(text: string, maxWidth: number = width - pad): string {
              if (visibleWidth(text) <= maxWidth) return text;
              return truncateToWidth(text, maxWidth, "…");
            }

            switch (screen) {
              case "menu": {
                // 标题
                for (const bline of BANNER) {
                  lines.push(" ".repeat(pad) + theme.fg("accent", bline));
                }
                lines.push("");
                lines.push(" ".repeat(pad) + theme.fg("muted", `进度: ${gameState.completedLevels.size}/${LEVELS.length - 1} 关 | 💎 ${gameState.knowledgeTokens} 令牌 | ❤️ ${"❤️".repeat(gameState.lives)}`));
                lines.push("");
                lines.push(" ".repeat(pad) + theme.fg("accent", theme.bold("按 Enter 开始冒险 · m 选关 · Esc 退出")));
                lines.push("");
                lines.push(" ".repeat(pad) + theme.fg("muted", "──────────── 关卡预览 ────────────"));
                for (let i = 0; i < LEVELS.length; i++) {
                  const lv = LEVELS[i];
                  const done = gameState.completedLevels.has(i);
                  const current = gameState.currentLevel === i;
                  const marker = done ? theme.fg("success", "✓") : current ? theme.fg("accent", "▶") : theme.fg("dim", "○");
                  const nameColor = done ? "muted" : current ? "accent" : "dim";
                  lines.push(" ".repeat(pad) + `  ${marker} ${theme.fg(nameColor, `${lv.chapter}: ${lv.title}`)}`);
                  if (i < LEVELS.length - 1) lines.push(" ".repeat(pad) + `  ${theme.fg("dim", "│")}`);
                }
                break;
              }

              case "map": {
                lines.push(" ".repeat(pad) + theme.fg("accent", theme.bold("🗺️ 关卡地图 — 选择关卡")));
                lines.push("");
                const items: SelectItem[] = LEVELS.map((lv, i) => {
                  const locked = i > 0 && !gameState.completedLevels.has(i - 1);
                  const done = gameState.completedLevels.has(i);
                  return {
                    value: String(i),
                    label: `${done ? "✓" : locked ? "🔒" : "○"} ${lv.chapter}: ${lv.title}`,
                    description: locked ? "先完成前一关" : lv.description,
                  };
                });

                const selectedIdx = gameState.currentLevel;
                for (let i = 0; i < items.length; i++) {
                  const item = items[i];
                  const isSelected = i === selectedIdx;
                  const locked = i > 0 && !gameState.completedLevels.has(i - 1);
                  const done = gameState.completedLevels.has(i);
                  const prefix = isSelected ? theme.fg("accent", "▶") : " ";
                  const color = done ? "muted" : locked ? "dim" : isSelected ? "accent" : "text";
                  const innerPad = pad + 2;
                  const label = item.label!.length > width - innerPad - 5
                    ? item.label!.slice(0, width - innerPad - 8) + "..."
                    : item.label;
                  lines.push(" ".repeat(innerPad) + `${prefix} ${theme.fg(color, label!)}`);
                }
                lines.push("");
                lines.push(" ".repeat(pad) + theme.fg("dim", "↑↓ 导航 · Enter 进入 · Ctrl+Enter 强制跳转 · Esc 返回"));
                break;
              }

              case "story": {
                const story = level.story;
                const visible = story.slice(0, storyLine + 6);
                const totalLines = story.length;
                lines.push(" ".repeat(pad) + theme.fg("accent", theme.bold(`📜 ${level.chapter} — ${level.title}`)));
                lines.push(" ".repeat(pad) + theme.fg("accent", "─".repeat(Math.min(width - 4, 40))));
                lines.push("");
                for (const sline of visible) {
                  if (sline === "") { lines.push(""); continue; }
                  // 处理引号内容
                  if (sline.startsWith("「") || sline.startsWith("「")) {
                    lines.push(" ".repeat(pad) + theme.fg("accent", sline));
                  } else {
                    lines.push(" ".repeat(pad) + theme.fg("text", sline));
                  }
                }
                lines.push("");
                if (storyLine + 6 < totalLines) {
                  lines.push(" ".repeat(pad) + theme.fg("dim", `(${storyLine + 6}/${totalLines} — Enter 继续阅读)`));
                } else {
                  lines.push(" ".repeat(pad) + theme.fg("success", "Enter → 学习概念 · Esc → 返回"));
                }
                break;
              }

              case "concept": {
                const concepts = level.concept;
                const currentConcept = concepts[conceptIndex];
                lines.push(" ".repeat(pad) + theme.fg("accent", theme.bold(`📚 概念 (${conceptIndex + 1}/${concepts.length}): ${currentConcept.title}`)));
                lines.push(" ".repeat(pad) + theme.fg("accent", "─".repeat(Math.min(width - 4, 40))));
                lines.push("");
                for (const b of currentConcept.body) {
                  const trimmed = b.length > width - 6 ? b.slice(0, width - 9) + "..." : b;
                  lines.push(" ".repeat(pad) + theme.fg("text", "  • " + trimmed));
                }
                lines.push("");
                if (conceptIndex + 1 < concepts.length) {
                  lines.push(" ".repeat(pad) + theme.fg("dim", "Enter → 下一个概念 · Tab → 看代码"));
                } else {
                  lines.push(" ".repeat(pad) + theme.fg("success", "Enter → 查看代码示例 · Esc → 返回"));
                }
                break;
              }

              case "code": {
                const example = level.codeExample;
                lines.push(" ".repeat(pad) + theme.fg("accent", theme.bold(`💻 代码示例: ${example.lang}`)));
                lines.push(" ".repeat(pad) + theme.fg("accent", "─".repeat(Math.min(width - 4, 40))));
                lines.push("");
                const codeLines = example.code.split("\n");
                for (const cl of codeLines) {
                  const trimmed = cl.length > width - 6 ? cl.slice(0, width - 9) + "…" : cl;
                  lines.push(" ".repeat(pad) + theme.fg("mdCode", "  " + trimmed));
                }
                lines.push("");
                lines.push(" ".repeat(pad) + theme.fg("muted", example.explanation));
                lines.push("");
                lines.push(" ".repeat(pad) + theme.fg("success", "Enter → 挑战答题 · Esc → 返回"));
                break;
              }

              case "challenge": {
                const ch = level.challenge;
                lines.push(" ".repeat(pad) + theme.fg("warning", theme.bold("❓ 挑战答题")));
                lines.push("");
                lines.push(" ".repeat(pad) + theme.fg("text", ch.question));
                lines.push("");
                for (let i = 0; i < ch.options.length; i++) {
                  const opt = ch.options[i];
                  const marker = challengeSelected === i ? theme.fg("accent", "▶") : " ";
                  const letter = String.fromCharCode(65 + i);
                  let color = "text";
                  if (challengeResult !== null) {
                    if (i === ch.answer) color = "success";
                    else if (i === challengeSelected && !challengeResult) color = "error";
                    else color = "muted";
                  }
                  const optText = `${marker} ${theme.fg(color, `${letter}. ${opt}`)}`;
                  lines.push(" ".repeat(pad + 2) + optText);
                }
                lines.push("");
                if (challengeResult === null) {
                  lines.push(" ".repeat(pad) + theme.fg("dim", "↑↓ 选择 · Enter 确认 · Esc 返回"));
                } else if (challengeResult) {
                  lines.push(" ".repeat(pad) + theme.fg("success", `✅ 正确! ${ch.explanation}`));
                  lines.push("");
                  lines.push(" ".repeat(pad) + theme.fg("success", "Enter → 通关! Esc → 返回"));
                } else {
                  lines.push(" ".repeat(pad) + theme.fg("error", `❌ 错误! ${ch.explanation}`));
                  lines.push("");
                  lines.push(" ".repeat(pad) + theme.fg("warning", "Enter → 重试 · Esc → 返回"));
                }
                break;
              }

              case "complete": {
                lines.push(" ".repeat(pad) + theme.fg("success", theme.bold("🎉 关卡通关！")));
                lines.push("");
                lines.push(" ".repeat(pad) + theme.fg("accent", `💎 +10 知识令牌 (总计: ${gameState.knowledgeTokens})`));
                lines.push(" ".repeat(pad) + theme.fg("accent", `🏆 进度: ${gameState.completedLevels.size}/${LEVELS.length - 1}`));
                lines.push("");
                if (gameState.currentLevel + 1 < LEVELS.length) {
                  lines.push(" ".repeat(pad) + theme.fg("success", "Enter → 下一关 · Esc → 返回菜单"));
                } else {
                  lines.push(" ".repeat(pad) + theme.fg("accent", theme.bold("🏆 全部通关! 你已是大建筑师!")));
                  lines.push("");
                  lines.push(" ".repeat(pad) + theme.fg("success", "Enter → 返回菜单 · Esc → 退出"));
                }
                break;
              }
            }
            // Ensure no line exceeds terminal width
            return lines.map(line => truncateToWidth(line, width));
          }

          function handleInput(data: string) {
            switch (screen) {
              case "menu": {
                if (matchesKey(data, Key.enter)) { gotoStory(); }
                else if (matchesKey(data, Key.escape)) { done("quit"); }
                else if (matchesKey(data, "m")) { gotoMap(); }
                break;
              }
              case "map": {
                const levelCount = LEVELS.length;
                if (matchesKey(data, Key.up)) {
                  gameState.currentLevel = Math.max(0, gameState.currentLevel - 1);
                  saveProgress();
                  tui.requestRender();
                } else if (matchesKey(data, Key.down)) {
                  gameState.currentLevel = Math.min(levelCount - 1, gameState.currentLevel + 1);
                  saveProgress();
                  tui.requestRender();
                } else if (matchesKey(data, Key.enter)) {
                  // 检查是否锁定
                  if (gameState.currentLevel > 0 && !gameState.completedLevels.has(gameState.currentLevel - 1)) {
                    // 锁定 — 返回菜单，提示用 Ctrl+Enter 跳转
                    gotoMenu();
                  } else {
                    startLevel(gameState.currentLevel);
                  }
                } else if (matchesKey(data, Key.ctrl("enter"))) {
                  // Ctrl+Enter: 无视锁定，直接跳到任意关卡
                  startLevel(gameState.currentLevel);
                } else if (matchesKey(data, Key.escape)) {
                  gotoMenu();
                }
                break;
              }
              case "story": {
                const totalLines = LEVELS[gameState.currentLevel].story.length;
                if (matchesKey(data, Key.enter)) {
                  if (storyLine + 6 < totalLines) {
                    storyLine += 6;
                    tui.requestRender();
                  } else {
                    gotoConcept();
                  }
                } else if (matchesKey(data, Key.escape)) {
                  gotoMenu();
                }
                break;
              }
              case "concept": {
                const concepts = LEVELS[gameState.currentLevel].concept;
                if (matchesKey(data, Key.enter)) {
                  if (conceptIndex + 1 < concepts.length) {
                    conceptIndex++;
                    tui.requestRender();
                  } else {
                    gotoCode();
                  }
                } else if (matchesKey(data, Key.tab)) {
                  gotoCode();
                } else if (matchesKey(data, Key.escape)) {
                  gotoStory();
                }
                break;
              }
              case "code": {
                if (matchesKey(data, Key.enter)) {
                  gotoChallenge();
                } else if (matchesKey(data, Key.escape)) {
                  gotoConcept();
                }
                break;
              }
              case "challenge": {
                const ch = LEVELS[gameState.currentLevel].challenge;
                if (challengeResult === null) {
                  if (matchesKey(data, Key.up) && challengeSelected > 0) {
                    challengeSelected--;
                    tui.requestRender();
                  } else if (matchesKey(data, Key.down) && challengeSelected < ch.options.length - 1) {
                    challengeSelected++;
                    tui.requestRender();
                  } else if (matchesKey(data, Key.enter)) {
                    challengeResult = challengeSelected === ch.answer;
                    if (challengeResult) {
                      gameState.knowledgeTokens += 5;
                    }
                    tui.requestRender();
                  } else if (matchesKey(data, Key.escape)) {
                    gotoCode();
                  }
                } else {
                  if (matchesKey(data, Key.enter)) {
                    if (challengeResult) {
                      completeLevel();
                    } else {
                      // 重试
                      challengeResult = null;
                      challengeSelected = 0;
                      tui.requestRender();
                    }
                  } else if (matchesKey(data, Key.escape)) {
                    gotoCode();
                  }
                }
                break;
              }
              case "complete": {
                if (matchesKey(data, Key.enter)) {
                  if (gameState.currentLevel + 1 < LEVELS.length) {
                    startLevel(gameState.currentLevel + 1);
                  } else {
                    gotoMenu();
                  }
                } else if (matchesKey(data, Key.escape)) {
                  gotoMenu();
                }
                break;
              }
            }
          }

          return {
            render,
            handleInput,
            invalidate() {},
          };
        }
      );

      if (result === "quit") {
        ctx.ui.notify("👋 下次再来冒险!", "info");
      }
    },
  });

  // 注册一个简单的状态查看工具
  pi.registerTool({
    name: "academy_progress",
    label: "Academy Progress",
    description: "查看 Pi Academy 学习进度",
    parameters: Type.Object({}),
    async execute() {
      const completed = gameState.completedLevels.size;
      const total = LEVELS.filter(l => !l.boss).length;
      const tokens = gameState.knowledgeTokens;
      const hearts = "❤️".repeat(gameState.lives);
      return {
        content: [{ type: "text", text: `🏰 Pi Academy 进度: ${completed}/${total} 关 | 💎 ${tokens} 令牌 | ${hearts}` }],
        details: {
          completed: [...gameState.completedLevels].map(i => LEVELS[i].title),
          current: LEVELS[gameState.currentLevel].title,
        },
      };
    },
  });

  // 启动时在 status 栏显示
  pi.on("session_start", (_event, ctx) => {
    if (gameState.completedLevels.size > 0) {
      ctx.ui.setStatus("academy", ctx.ui.theme.fg("accent", `🏰 ${gameState.completedLevels.size}/${LEVELS.filter(l => !l.boss).length}关`));
    }
  });
}

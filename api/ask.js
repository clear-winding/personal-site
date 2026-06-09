const DEEPSEEK_API_URL =
  process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function send(res, status, body) {
  Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.status(status).json(body);
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (item) =>
        item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string",
    )
    .slice(-8)
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, 2000),
    }));
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    Object.entries(corsHeaders).forEach(([key, value]) => res.setHeader(key, value));
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    send(res, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    send(res, 500, {
      error: "Missing DEEPSEEK_API_KEY. Set it as a server environment variable.",
    });
    return;
  }

  const { question, contextTitle, context, history } = req.body || {};
  if (!question || typeof question !== "string") {
    send(res, 400, { error: "Missing question" });
    return;
  }

  const safeQuestion = question.slice(0, 2000);
  const safeContextTitle =
    typeof contextTitle === "string" ? contextTitle.slice(0, 120) : "当前复习资料";
  const safeContext = typeof context === "string" ? context.slice(0, 12000) : "";

  const systemPrompt = [
    "你是一个期末复习助教，回答对象是正在复习计算机专业课程的学生。",
    "请优先依据用户当前打开的复习资料回答；资料不足时，可以补充通用知识，但要说明这是补充。",
    "回答要清楚、可复习、适合考试前理解。遇到计算题时给步骤；遇到概念题时先讲直觉再给定义。",
    "不要编造课件没有的具体考试范围。不要输出无关寒暄。",
  ].join("\n");

  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `当前资料: ${safeContextTitle}\n\n资料摘录:\n${safeContext}`,
    },
    ...normalizeHistory(history),
    { role: "user", content: safeQuestion },
  ];

  try {
    const upstream = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages,
        stream: false,
        temperature: 0.2,
      }),
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }

    if (!upstream.ok) {
      send(res, upstream.status, {
        error:
          data?.error?.message ||
          data?.message ||
          "DeepSeek request failed. Check the server logs.",
      });
      return;
    }

    const answer = data?.choices?.[0]?.message?.content;
    send(res, 200, { answer: answer || "没有拿到有效回答。" });
  } catch {
    send(res, 500, {
      error: "AI backend request failed. Check network or server configuration.",
    });
  }
}

#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const API_BASE = process.env.GLOWPOST_API_URL || "https://api.glowpost.kr";
const API_KEY = process.env.GLOWPOST_API_KEY || "";

if (!API_KEY) {
  console.error("GLOWPOST_API_KEY environment variable is required.");
  console.error("Get your API key at https://glowpost.kr/account");
  process.exit(1);
}

async function apiCall(endpoint: string, method = "GET", body?: unknown) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "User-Agent": "glowpost-mcp/1.0.0",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json();

  if (!res.ok) {
    const msg = data.message || data.error || `API error ${res.status}`;
    if (res.status === 402) {
      throw new Error(`${msg}\n\nBuy credits at https://glowpost.kr/pricing`);
    }
    if (res.status === 401) {
      throw new Error(`${msg}\n\nCheck your API key at https://glowpost.kr/account`);
    }
    throw new Error(msg);
  }

  return data;
}

const server = new McpServer({
  name: "glowpost",
  version: "1.0.0",
});

// Tool: generate_content
server.tool(
  "generate_content",
  "Generate optimized content for multiple platforms from a single topic. Uses 1 credit per generation.",
  {
    topic: z.string().min(1).max(500).describe("The topic or subject to write about"),
    context: z.string().max(2000).optional().describe("Additional context, key points, or reference material"),
    platforms: z
      .array(z.enum(["blog", "twitter", "linkedin", "newsletter", "instagram"]))
      .optional()
      .describe("Platforms to generate for. Defaults to all 5."),
    tone: z
      .enum(["professional", "casual", "humorous", "inspirational", "educational"])
      .optional()
      .describe("Writing tone. Default: professional"),
    language: z.enum(["en", "ko", "ja"]).optional().describe("Content language. Default: en"),
    blog_length: z
      .enum(["short", "medium", "long"])
      .optional()
      .describe("Blog post length: short (~800 words), medium (~1500), long (~3000). Default: medium"),
  },
  async ({ topic, context, platforms, tone, language, blog_length }) => {
    const result = await apiCall("/api/v1/generate", "POST", {
      topic,
      context: context || "",
      platforms: platforms || ["blog", "twitter", "linkedin", "newsletter", "instagram"],
      tone: tone || "professional",
      language: language || "en",
      blog_length: blog_length || "medium",
    });

    const parts: string[] = [];
    parts.push(`Generated content for: ${topic}`);
    parts.push(`Credits used: ${result.credits_used} | Remaining: ${result.credits_remaining}`);
    parts.push("");

    for (const [platform, content] of Object.entries(result.results || {})) {
      parts.push(`--- ${platform.toUpperCase()} ---`);
      if (platform === "blog" && typeof content === "object" && content !== null) {
        const blog = content as Record<string, unknown>;
        parts.push(`Title: ${blog.title}`);
        parts.push(`Meta: ${blog.meta_description}`);
        parts.push(`Slug: ${blog.slug}`);
        parts.push("");
        parts.push(String(blog.content_md || blog.content || ""));
      } else if (platform === "twitter" && typeof content === "object" && content !== null) {
        const tw = content as { tweets?: string[] };
        (tw.tweets || []).forEach((tweet, i) => parts.push(`${i + 1}/ ${tweet}`));
      } else if (platform === "instagram" && typeof content === "object" && content !== null) {
        const ig = content as { caption?: string; hashtags?: string[] };
        parts.push(ig.caption || "");
        if (ig.hashtags) parts.push("\n" + ig.hashtags.join(" "));
      } else if (typeof content === "object" && content !== null) {
        const c = content as Record<string, unknown>;
        parts.push(String(c.content || c.subject || JSON.stringify(c)));
      }
      parts.push("");
    }

    return { content: [{ type: "text" as const, text: parts.join("\n") }] };
  }
);

// Tool: get_balance
server.tool(
  "get_balance",
  "Check your GlowPost credit balance.",
  {},
  async () => {
    const result = await apiCall("/api/v1/balance");
    return {
      content: [
        {
          type: "text" as const,
          text: `GlowPost credits: ${result.credits}\n\nBuy more at https://glowpost.kr/pricing`,
        },
      ],
    };
  }
);

// Tool: get_history
server.tool(
  "get_history",
  "View your recent content generation history.",
  {
    limit: z.number().min(1).max(50).optional().describe("Number of items. Default: 5"),
  },
  async ({ limit }) => {
    const result = await apiCall(`/api/v1/history?limit=${limit || 5}`);
    const generations = result.generations || [];

    if (generations.length === 0) {
      return { content: [{ type: "text" as const, text: "No generation history yet." }] };
    }

    const lines = generations.map(
      (g: { topic: string; platforms: string[]; language: string; created_at: string; id: string }) =>
        `• ${g.topic} (${g.platforms.join(", ")}) — ${new Date(g.created_at).toLocaleDateString()}`
    );

    return {
      content: [{ type: "text" as const, text: `Recent generations:\n\n${lines.join("\n")}` }],
    };
  }
);

// Start
const transport = new StdioServerTransport();
server.connect(transport);

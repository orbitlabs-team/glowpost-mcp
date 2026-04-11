# GlowPost MCP Server

MCP server for [GlowPost](https://glowpost.kr) — generate AI content for Blog, X/Twitter, LinkedIn, Newsletter & Instagram from a single topic.

Use GlowPost directly in **Claude Code**, **Cursor**, or any MCP-compatible AI tool.

## Quick Start

### 1. Get your API Key

Sign up at [glowpost.kr](https://glowpost.kr) and generate an API key in **Account → API Keys**.

### 2. Add to your MCP config

**Claude Code** (`~/.claude.json`):
```json
{
  "mcpServers": {
    "glowpost": {
      "command": "npx",
      "args": ["-y", "glowpost-mcp"],
      "env": {
        "GLOWPOST_API_KEY": "gp_your_api_key"
      }
    }
  }
}
```

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "glowpost": {
      "command": "npx",
      "args": ["-y", "glowpost-mcp"],
      "env": {
        "GLOWPOST_API_KEY": "gp_your_api_key"
      }
    }
  }
}
```

### 3. Use it

Just ask Claude:
- *"Write a blog post about remote work productivity"*
- *"Create a Twitter thread about AI trends"*
- *"Generate LinkedIn + Newsletter content about our product launch"*
- *"How many credits do I have?"*

## Tools

| Tool | Description |
|------|-------------|
| `generate_content` | Generate content for multiple platforms from a topic. Uses 1 credit. |
| `get_balance` | Check your GlowPost credit balance. |
| `get_history` | View your recent content generation history. |

### generate_content

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | The topic to write about (max 500 chars) |
| `context` | string | No | Additional context or key points (max 2000 chars) |
| `platforms` | string[] | No | Platforms to generate for. Default: all 5. Options: `blog`, `twitter`, `linkedin`, `newsletter`, `instagram` |
| `tone` | string | No | Writing tone. Default: `professional`. Options: `casual`, `humorous`, `inspirational`, `educational` |
| `language` | string | No | Content language. Default: `en`. Options: `ko`, `ja` |
| `blog_length` | string | No | Blog post length. Default: `medium`. Options: `short` (~800 words), `long` (~3000 words) |

## Pricing

GlowPost uses a credit system — **1 credit = 1 topic, all platforms included**.

| Pack | Credits | Price |
|------|---------|-------|
| Starter | 5 | $4.99 |
| Creator | 20 | $14.99 |
| Pro | 50 | $29.99 |

New users get 1 free credit to try.

Buy credits at [glowpost.kr/pricing](https://glowpost.kr/pricing).

## API Documentation

Full API docs at [glowpost.kr/docs](https://glowpost.kr/docs).

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GLOWPOST_API_KEY` | **(Required)** Your GlowPost API key. Get it at [glowpost.kr/account](https://glowpost.kr/account). |
| `GLOWPOST_API_URL` | API base URL. Default: `https://api.glowpost.kr` |

## License

MIT

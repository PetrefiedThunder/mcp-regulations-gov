# mcp-regulations-gov

MCP server for [Regulations.gov](https://www.regulations.gov) API. Search federal regulatory documents, dockets, and public comments. Free API key required.

## Tools

| Tool | Description |
|------|-------------|
| `search_documents` | Search proposed rules, final rules, notices, public submissions |
| `get_document` | Get details for a specific regulatory document |
| `search_dockets` | Search regulatory dockets (rulemaking collections) |
| `get_docket` | Get details for a specific docket |
| `get_comments` | Get public comments on a document |

## Setup

Get a free API key at https://api.data.gov/signup/ and set:
```
REGULATIONS_GOV_API_KEY=your_key
```

## Install

```bash
npm install
npm run build
```

## Usage with Claude Desktop

```json
{
  "mcpServers": {
    "regulations": {
      "command": "node",
      "args": ["/path/to/mcp-regulations-gov/dist/index.js"],
      "env": { "REGULATIONS_GOV_API_KEY": "your_key" }
    }
  }
}
```

## License

MIT

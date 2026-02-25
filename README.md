# mcp-regulations-gov

Search and retrieve federal regulations, proposed rules, and public comments.

## Tools

| Tool | Description |
|------|-------------|
| `search_documents` | Search federal regulatory documents (proposed rules, final rules, notices, public submissions). |
| `get_document` | Get detailed information about a specific regulatory document. |
| `search_dockets` | Search regulatory dockets (collections of documents for a rulemaking). |
| `get_docket` | Get detailed information about a specific docket. |
| `get_comments` | Get public comments submitted on a document. |

## Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `REGULATIONS_GOV_API_KEY` | Yes | regulations gov api key |

## Installation

```bash
git clone https://github.com/PetrefiedThunder/mcp-regulations-gov.git
cd mcp-regulations-gov
npm install
npm run build
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "regulations-gov": {
      "command": "node",
      "args": ["/path/to/mcp-regulations-gov/dist/index.js"],
      "env": {
        "REGULATIONS_GOV_API_KEY": "your-regulations-gov-api-key"
      }
    }
  }
}
```

## Usage with npx

```bash
npx mcp-regulations-gov
```

## License

MIT

#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = "https://api.regulations.gov/v4";
const USER_AGENT = "mcp-regulations-gov/1.0.0";
const RATE_LIMIT_MS = 1000; // regulations.gov is strict

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<any> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed));
  }
  lastRequestTime = Date.now();

  const apiKey = process.env.REGULATIONS_GOV_API_KEY;
  if (!apiKey) throw new Error("REGULATIONS_GOV_API_KEY is required. Get a free key at https://api.data.gov/signup/");

  const separator = url.includes("?") ? "&" : "?";
  const fullUrl = `${url}${separator}api_key=${apiKey}`;

  const res = await fetch(fullUrl, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Regulations.gov API error: ${res.status} — ${body.slice(0, 500)}`);
  }
  return res.json();
}

const server = new McpServer({
  name: "mcp-regulations-gov",
  version: "1.0.0",
});

server.tool(
  "search_documents",
  "Search federal regulatory documents (proposed rules, final rules, notices, public submissions).",
  {
    query: z.string().describe("Search terms"),
    documentType: z.enum(["Proposed Rule", "Rule", "Notice", "Public Submission", "Other"]).optional(),
    agencyId: z.string().optional().describe("Agency acronym (e.g. 'EPA', 'FDA', 'FCC', 'SEC')"),
    dateFrom: z.string().optional().describe("Start date (YYYY-MM-DD)"),
    dateTo: z.string().optional().describe("End date (YYYY-MM-DD)"),
    pageSize: z.number().min(1).max(250).default(25),
    pageNumber: z.number().min(1).default(1),
  },
  async ({ query, documentType, agencyId, dateFrom, dateTo, pageSize, pageNumber }) => {
    const params = new URLSearchParams({
      "filter[searchTerm]": query,
      "page[size]": String(pageSize),
      "page[number]": String(pageNumber),
      sort: "-postedDate",
    });
    if (documentType) params.set("filter[documentType]", documentType);
    if (agencyId) params.set("filter[agencyId]", agencyId);
    if (dateFrom) params.set("filter[postedDate][ge]", dateFrom);
    if (dateTo) params.set("filter[postedDate][le]", dateTo);

    const data = await rateLimitedFetch(`${BASE_URL}/documents?${params}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_document",
  "Get detailed information about a specific regulatory document.",
  {
    documentId: z.string().describe("Document ID (e.g. 'EPA-HQ-OAR-2021-0317-0001')"),
  },
  async ({ documentId }) => {
    const data = await rateLimitedFetch(`${BASE_URL}/documents/${documentId}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "search_dockets",
  "Search regulatory dockets (collections of documents for a rulemaking).",
  {
    query: z.string().describe("Search terms"),
    agencyId: z.string().optional().describe("Agency acronym"),
    docketType: z.enum(["Rulemaking", "Nonrulemaking"]).optional(),
    pageSize: z.number().min(1).max(250).default(25),
  },
  async ({ query, agencyId, docketType, pageSize }) => {
    const params = new URLSearchParams({
      "filter[searchTerm]": query,
      "page[size]": String(pageSize),
    });
    if (agencyId) params.set("filter[agencyId]", agencyId);
    if (docketType) params.set("filter[docketType]", docketType);

    const data = await rateLimitedFetch(`${BASE_URL}/dockets?${params}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_docket",
  "Get detailed information about a specific docket.",
  {
    docketId: z.string().describe("Docket ID (e.g. 'EPA-HQ-OAR-2021-0317')"),
  },
  async ({ docketId }) => {
    const data = await rateLimitedFetch(`${BASE_URL}/dockets/${docketId}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

server.tool(
  "get_comments",
  "Get public comments submitted on a document.",
  {
    documentId: z.string().describe("The document ID to get comments for"),
    pageSize: z.number().min(1).max(250).default(25),
    pageNumber: z.number().min(1).default(1),
  },
  async ({ documentId, pageSize, pageNumber }) => {
    const params = new URLSearchParams({
      "filter[commentOnId]": documentId,
      "page[size]": String(pageSize),
      "page[number]": String(pageNumber),
      sort: "-postedDate",
    });

    const data = await rateLimitedFetch(`${BASE_URL}/comments?${params}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

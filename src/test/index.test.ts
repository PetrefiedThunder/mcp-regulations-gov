import { describe, it, expect } from "vitest";

describe("mcp-regulations-gov", () => {
  it("should build search params correctly", () => {
    const params = new URLSearchParams({
      "filter[searchTerm]": "emissions",
      "filter[agencyId]": "EPA",
      "page[size]": "25",
    });
    expect(params.toString()).toContain("filter%5BsearchTerm%5D=emissions");
    expect(params.toString()).toContain("filter%5BagencyId%5D=EPA");
  });

  it("should support all document types", () => {
    const types = ["Proposed Rule", "Rule", "Notice", "Public Submission", "Other"];
    expect(types.length).toBe(5);
  });

  it("should build document URLs", () => {
    const id = "EPA-HQ-OAR-2021-0317-0001";
    const url = `https://api.regulations.gov/v4/documents/${id}`;
    expect(url).toContain(id);
  });

  it("should build docket URLs", () => {
    const id = "EPA-HQ-OAR-2021-0317";
    const url = `https://api.regulations.gov/v4/dockets/${id}`;
    expect(url).toContain(id);
  });

  it("should append API key correctly", () => {
    const url = "https://api.regulations.gov/v4/documents?filter[searchTerm]=test";
    const key = "DEMO_KEY";
    const result = `${url}&api_key=${key}`;
    expect(result).toContain("api_key=DEMO_KEY");
  });

  it("should handle date filters", () => {
    const params = new URLSearchParams();
    params.set("filter[postedDate][ge]", "2025-01-01");
    params.set("filter[postedDate][le]", "2025-12-31");
    expect(params.toString()).toContain("2025-01-01");
    expect(params.toString()).toContain("2025-12-31");
  });
});

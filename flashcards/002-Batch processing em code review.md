Title: Técnica para batch processing em code review iterativo com Claude
---
The code review component works iteratively: Claude analyzes a changed file, then may request related files (imports, base classes, tests) via tool calling to understand context before providing final feedback. Your application defines a tool that lets Claude request file contents; Claude invokes this tool, receives results, and continues its analysis. You're evaluating batch processing to reduce API costs.
What is the primary technical constraint when considering batch processing for this workflow?
---
[ ] A - Batch processing lacks request correlation identifiers for matching outputs to input requests.
[ ] B - The batch API doesn't support tool definitions in request parameters.
[ ] C - The asynchronous model prevents executing tools mid-request and returning results for Claude to continue analysis.
[ ] D - Batch processing latency of up to 24 hours is too slow for pull request feedback, though the workflow could otherwise function.
---
Tags: Domain_2::Tool_Design_MCP_Integration Domain_1::Agentic_Architecture_Orchestration Domain_5::Context_Management_Reliability

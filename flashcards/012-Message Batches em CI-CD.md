Title: Otimizar custos com Message Batches API em pipelines CI/CD
---
Your CI pipeline includes two Claude-powered code review modes: a pre-merge-commit hook that blocks PR merging until complete, and "deep analysis" that runs overnight, polls for batch completion, then posts detailed suggestions to the PR. You want to reduce API costs using the Message Batches API, which offers 50% cost savings but requires polling and may take up to 24 hours to complete. Which mode should use batch processing?
---
[ ] A - Neither mode
[ ] B - Deep analysis only
[ ] C - Both modes
[ ] D - Pre-merge-commit hook only
---
Tags: Domain_1::Agentic_Architecture_Orchestration Domain_2::Tool_Design_MCP_Integration Domain_5::Context_Management_Reliability

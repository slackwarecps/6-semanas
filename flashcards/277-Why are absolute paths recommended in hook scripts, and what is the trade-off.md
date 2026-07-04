Title: Why are absolute paths recommended in hook scripts, and what is the trade-off?
---

Why are absolute paths recommended in hook scripts, and what is the trade-off?
[Resposta correta: Caminhos absolutos mitigam path interception e binary planting, mas dificultam compartilhar o settings.json (o caminho varia por máquina). As demais erram o motivo de segurança ou a existência do trade-off.]

---
[ ] A - To improve read performance; with no downside
[ ] B - To mitigate path interception and binary planting; the trade-off is that it makes sharing settings.json across machines harder
[ ] C - Because relative paths are not supported on Windows
[ ] D - To reduce the hook's token consumption

---
Tags: Domain_3::Claude_Code_Configuration_Workflows

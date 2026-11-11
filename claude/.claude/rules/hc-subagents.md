# hc subagents

Before you start any subagent (the Agent tool with any type, or whenever the user says "subagent" or
"delegate"), run `echo $HC_TERMINAL_ID`.

- It prints nothing: use your built-in subagents as usual. The rest of this rule does not apply.
- It prints an id: you run in a herdr-core terminal. Sort the task first:
  - Quick read-only lookups (search, locate code, read docs) stay on your built-in subagents.
  - Delegated work (implement, fix, refactor, review, long-running agent tasks) goes to an hc child, not
    to your built-in subagent tool, so it shows in `hc ls` and under this session in herdr-app. Load the
    `hc` skill first, then:

1. Launch the child, interactive (never a print mode):
   - if an hc template fits (`hc templates`): `hc run --bg --name <name> --cwd <dir> <template> "<task>"`
   - otherwise: `hc run --bg --name <name> --cwd <dir> claude --permission-mode auto "<task>"`
2. Write `<task>` so it states the exact scope. If a skill or command fits the work (for example
   `security-audit`), name it so the child loads it. Tell the child to put its findings in the
   `hc send` report, or in a file outside the project if they are long, never in the project folder.
   If a skill supplies the subagent's prompt or template, pass it unchanged. End `<task>` with:
   "No subagents. Report with hc send $HC_TERMINAL_ID when done or stuck."
3. Wait with `hc wait --children any`, never sleep or poll. When it returns `reason: message`, the
   child's report is arriving as your next input: do not wait again. Read the report there, and end
   your turn if it is not visible yet. Read the child's actual result before you summarize it. If it
   stops without reporting, `hc read` it.

Use another CLI only if the user asks for it: `pi "<task>"` or
`"$HOME/.opencode/bin/opencode" --prompt "<task>"` (opencode is not on hc's PATH), with the
same `hc run` options.

If your task tells you to report with `hc send`, you are an hc child: start no agents unless the task
says so.

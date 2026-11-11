import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "github-collab/gh-repo": {
    plain: [
      "A repository (repo) on GitHub is more than a folder of code. It is also the place where a team talks about work, tracks bugs and plans what comes next. A new visitor should understand what the project is and how to help within a minute of landing on it.",
      "The README is the front page. It says what the project does, how to install and run it, and where to ask questions. The LICENSE file says what others are allowed to do with the code. Without one, nobody else may legally copy or change it, even if the repo is public.",
      "Issues are the to-do list. Each issue is one bug, task or idea, with a discussion thread under it. Labels are colored tags like bug or good first issue that help you sort and filter. Templates turn the \"New issue\" button into a short form, so reporters give you the details you need.",
      "Projects is GitHub's planning tool. It pulls issues and pull requests from one or more repos into a board or table, where you can drag cards between columns like Todo, In progress and Done, or add your own fields like priority or sprint.",
    ],
    deepDive: [
      {
        heading: "Community health files",
        body: "GitHub recognises a set of standard files and links to them in the right places. README.md shows on the repo home page. LICENSE is detected and shown in the sidebar. CONTRIBUTING.md is linked when someone opens an issue or pull request. SECURITY.md tells people how to report a vulnerability privately instead of in a public issue. CODE_OF_CONDUCT.md sets the rules for behaviour.\n\nThese files can live in the repo root, in docs/ or in .github/. An organization can also create a repository named .github and put default versions there; every repo in the org without its own copy then uses those defaults. That is the easy way to give 50 repos the same issue templates and security policy.",
        bullets: [
          "MIT: short and permissive",
          "Apache-2.0: permissive plus an explicit patent grant",
          "GPL-3.0: changes must stay open source when distributed",
          "choosealicense.com compares licenses in plain words",
        ],
      },
      {
        heading: "Issue forms instead of blank issues",
        body: "An issue form is a YAML file in .github/ISSUE_TEMPLATE/, for example bug_report.yml. It defines a name, description, default title, default labels and a body made of fields. Field types are markdown (help text), input (one line), textarea (long text, can render logs as code), dropdown and checkboxes. Any field can be marked required, so nobody can submit a bug without steps to reproduce.\n\nA config.yml in the same folder controls the chooser page. blank_issues_enabled: false removes the free-text option, and contact_links can send questions to Discussions or a support site instead of the issue tracker. Labels named in a form should already exist in the repo.",
      },
      {
        heading: "Labels and triage that people actually use",
        body: "GitHub creates default labels such as bug, documentation, duplicate, enhancement, good first issue, help wanted, invalid, question and wontfix. Keep the set small and give each label one clear meaning. A common pattern is prefixed groups: type: bug, priority: high, area: api, status: needs-triage.\n\nTriage is the habit of looking at new issues regularly, adding labels, asking for missing details and closing duplicates. Issue forms can add needs-triage automatically, so the triage queue is simply that label's filter. Milestones group issues for a release and show a progress bar. Large pieces of work can be broken into sub-issues, which show their progress on the parent issue.",
      },
      {
        heading: "How Projects works under the hood",
        body: "A project belongs to a user or an organization, not to a single repo, so it can track work from many repos at once. Each item is an issue, a pull request or a draft issue that lives only in the project. Items keep their real state: closing the issue updates the project.\n\nYou add custom fields: single select (like Status or Priority), text, number, date and iteration (repeating time boxes such as two-week sprints). Views are saved layouts of the same items: a table for planning, a board grouped by Status, or a roadmap on a timeline. Built-in workflows automate the boring parts, for example setting Status to Done when an issue is closed or a PR is merged, and auto-adding new issues that match a filter.",
        visual: {
          type: "layers",
          title: "Projects from data to views",
          layers: [
            { label: "Views", detail: "Table, board and roadmap layouts" },
            { label: "Workflows", detail: "Auto-add items, set Status on close or merge" },
            { label: "Custom fields", detail: "Status, Priority, Iteration, Estimate" },
            { label: "Items", detail: "Issues, pull requests and draft issues" },
            { label: "Repositories", detail: "One or many repos feed the same project" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Life of an issue",
        steps: [
          { label: "Reported", detail: "Issue form fills in the details" },
          { label: "Triaged", detail: "Labels, priority, milestone added" },
          { label: "Planned", detail: "Added to the project, assigned" },
          { label: "In progress", detail: "A linked pull request is opened" },
          { label: "Closed", detail: "Fixes #N closes it on merge" },
        ],
      },
    ],
    examples: [
      {
        title: "A bug report form that gets useful reports",
        explanation: "Your issues keep arriving as one line: \"the API is broken\". Step 1: create .github/ISSUE_TEMPLATE/bug_report.yml. Step 2: add required fields for steps to reproduce and the version, plus a dropdown for the environment. Step 3: set default labels so every new bug lands in the triage queue. Step 4: add config.yml with blank_issues_enabled: false so the form cannot be skipped.",
        code: {
          lang: "yaml",
          code: "name: Bug report\ndescription: Something is not working\ntitle: \"[Bug]: \"\nlabels: [\"bug\", \"needs-triage\"]\nbody:\n  - type: textarea\n    id: steps\n    attributes: { label: Steps to reproduce }\n    validations: { required: true }\n  - type: input\n    id: version\n    attributes: { label: Version, placeholder: \"1.4.2\" }\n  - type: dropdown\n    id: env\n    attributes: { label: Environment, options: [production, staging, local] }",
        },
      },
      {
        title: "Set up a sprint board from the terminal",
        explanation: "You want a board for the next release. Step 1: give gh the project scope (Projects need it). Step 2: create a project in the organization. Step 3: add existing issues to it by URL. Step 4: open it in the browser to add a Priority field and a board view grouped by Status. From then on, the built-in workflow moves merged and closed items to Done.",
        code: {
          lang: "bash",
          code: "gh auth refresh -s project\ngh project create --owner acme --title \"Release 2.0\"\ngh project list --owner acme          # note the project number, e.g. 7\ngh project item-add 7 --owner acme --url https://github.com/acme/api/issues/12\ngh project item-add 7 --owner acme --url https://github.com/acme/api/issues/15\ngh project view 7 --owner acme --web",
        },
      },
    ],
    cheatSheet: [
      "Issue forms go in .github/ISSUE_TEMPLATE/*.yml; config.yml controls the chooser",
      "blank_issues_enabled: false forces reporters to use a template",
      "A repo named .github holds default community files for a whole organization",
      "Fixes #12 in a PR closes issue 12 when the PR merges into the default branch",
      "gh label create area:api --color 1D76DB --description \"API work\" adds a label",
      "gh issue list --label bug --state open filters issues from the terminal",
      "gh project item-add NUMBER --owner ORG --url ISSUE_URL adds an issue to a project",
      "SECURITY.md tells people how to report vulnerabilities privately",
    ],
    quiz: [
      {
        q: "A public repo has no LICENSE file. What may others do with the code?",
        options: ["Anything, because it is public", "Use it, but not sell it", "View and fork it on GitHub, but not legally reuse or modify it elsewhere", "Only use it for education"],
        answer: 2,
        why: "Without a license, normal copyright applies, and GitHub's terms only allow viewing and forking on GitHub.",
      },
      {
        q: "Where do issue forms live?",
        options: [".github/ISSUE_TEMPLATE/ as YAML files", "docs/issues.md", "The repo settings page only", ".github/workflows/"],
        answer: 0,
        why: "GitHub reads .yml files in .github/ISSUE_TEMPLATE/ and shows them in the new-issue chooser.",
      },
      {
        q: "Which statement about GitHub Projects is true?",
        options: ["A project can only show issues from one repo", "Closing an issue in a project deletes it", "Projects cannot have custom fields", "A project can track issues and PRs from many repos"],
        answer: 3,
        why: "Projects belong to a user or organization and can pull items from any of their repos.",
      },
      {
        q: "A PR description says Closes #40, but the issue stays open after merge. What is the most likely reason?",
        options: ["The PR was merged into a branch other than the default branch", "The keyword must be in capitals", "Issues never close automatically", "The PR had too many commits"],
        answer: 0,
        why: "Closing keywords only take effect when the PR targets the default branch.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a new public repo with a README, an MIT license and a Python .gitignore, all from the terminal.",
        hint: "gh repo create has flags for each of these.",
        solution: "gh repo create my-api --public --add-readme --license mit --gitignore Python --clone\ncd my-api && ls -a   # README.md LICENSE .gitignore",
      },
      {
        level: "medium",
        task: "Replace the default labels with a small prefixed set: type: bug, type: feature, priority: high, status: needs-triage.",
        hint: "gh label delete needs --yes to skip the prompt; gh label create sets color and description.",
        solution: "for l in bug enhancement question invalid wontfix duplicate; do\n  gh label delete \"$l\" --yes\ndone\ngh label create \"type: bug\" --color D73A4A\ngh label create \"type: feature\" --color A2EEEF\ngh label create \"priority: high\" --color B60205\ngh label create \"status: needs-triage\" --color FBCA04\ngh label list",
      },
      {
        level: "hard",
        task: "Add a feature request form with a required problem field and a checkbox confirming the user searched existing issues, and disable blank issues.",
        hint: "Checkboxes use attributes.options with label and required per option.",
        solution: "# .github/ISSUE_TEMPLATE/feature_request.yml\nname: Feature request\ndescription: Suggest an idea\nlabels: [\"type: feature\", \"status: needs-triage\"]\nbody:\n  - type: textarea\n    attributes: { label: What problem does this solve? }\n    validations: { required: true }\n  - type: checkboxes\n    attributes:\n      label: Checks\n      options: [{ label: I searched existing issues, required: true }]\n# .github/ISSUE_TEMPLATE/config.yml\nblank_issues_enabled: false",
      },
    ],
    faq: [
      { q: "What is the difference between Issues and Discussions?", a: "Issues are for actionable work that can be closed, like bugs and tasks. Discussions are for open-ended questions, ideas and announcements that do not need a fix." },
      { q: "Is GitHub Projects free?", a: "Yes, Projects is available on the free plan for both personal accounts and organizations." },
      { q: "Which license should I pick for an open source project?", a: "MIT is the most common simple choice. Apache-2.0 adds an explicit patent grant, which companies often prefer. GPL-3.0 requires that distributed changes stay open source." },
      { q: "What is the difference between a milestone and a project?", a: "A milestone groups issues in one repo toward a release or date and shows percent complete. A project is a flexible planning view across repos with custom fields and layouts." },
    ],
  },

  "github-collab/gh-pr": {
    plain: [
      "A pull request (PR) is a request to merge your branch into another branch, usually main. It shows the changes as a diff (lines removed in red, lines added in green), runs the automated checks, and gives teammates a place to comment before anything lands.",
      "Small PRs are the secret to fast reviews. A PR that changes 50 lines gets read carefully in ten minutes. A PR that changes 2,000 lines gets skimmed or ignored for days. If a feature is big, split it into several PRs that each make sense alone.",
      "The description is your message to the reviewer. Say what changed, why it was needed and how to check it. Link the issue it solves. A reviewer who understands the goal finds real problems instead of guessing.",
      "Reviewing is a skill too. Good comments point at specific lines, explain the reason, and make clear whether something must change or is just a suggestion. The goal is better code and a team that learns from each other, not proving who is smarter.",
    ],
    deepDive: [
      {
        heading: "What makes a PR easy to review",
        body: "Reviewers find more bugs in smaller changes. Studies of code review often quote a few hundred lines as the point where attention drops sharply. So keep a PR to one purpose: a refactor, a feature or a fix, not all three. Move formatting changes or file renames into their own PR, because they bloat the diff and hide the real change.\n\nTell a story with commits if the team keeps them, and always in the description. Include screenshots for UI changes, sample requests and responses for APIs, and the exact commands to test. Open a draft PR early to share direction or get CI feedback, then mark it ready for review when it is done.",
        bullets: [
          "One purpose per PR",
          "Separate refactors and formatting from behaviour changes",
          "Self-review your own diff before asking anyone",
          "Use a draft PR to ask early questions",
        ],
      },
      {
        heading: "Templates, linked issues and stacked PRs",
        body: "A file at .github/pull_request_template.md pre-fills every new PR description, so What, Why and How to test are always there. For several templates, put them in .github/PULL_REQUEST_TEMPLATE/ and choose one with ?template=name.md in the compare URL.\n\nWords like Fixes #42, Closes #42 or Resolves #42 link the issue and close it when the PR merges into the default branch. For large features, stack PRs: PR 2 targets PR 1's branch instead of main, so each diff stays small. When PR 1 merges and its branch is deleted, GitHub automatically retargets PR 2 to main.",
      },
      {
        heading: "Review states and suggestions",
        body: "When you submit a review you choose one of three states. Comment gives feedback without a verdict. Approve says it is ready. Request changes blocks the merge (if branch protection requires approvals) until you approve or the review is dismissed. Start a review instead of single comments so the author gets one notification with everything.\n\nA suggestion is a special comment containing replacement code for the selected lines. The author can click Commit suggestion, or batch several suggestions into one commit. Mark files as Viewed to track your progress, and use the hide whitespace option when indentation changed. The author should reply to or resolve each conversation, then click re-request review.",
        visual: {
          type: "sequence",
          title: "One review round on GitHub",
          actors: ["Author", "Pull request", "Reviewer"],
          messages: [
            { from: 0, to: 1, label: "Mark ready for review" },
            { from: 1, to: 2, label: "Review requested" },
            { from: 2, to: 1, label: "Comments and suggestions, Request changes" },
            { from: 0, to: 1, label: "Commit suggestions, push fixes" },
            { from: 0, to: 2, label: "Re-request review" },
            { from: 2, to: 1, label: "Approve" },
          ],
        },
      },
      {
        heading: "Writing review comments people can act on",
        body: "Review the important things first: does it work, is it safe, is the design right, are there tests. Style and naming come last, and a linter should catch most of them. Ask questions when you are unsure (\"What happens if items is empty here?\") rather than stating guesses as facts.\n\nMany teams use labels at the start of comments, sometimes called Conventional Comments: nit: for optional polish, suggestion: for an improvement, issue: for a real problem, question: for clarification, praise: for something done well. The prefix tells the author what blocks the merge. Praise matters too; pointing out a good test teaches as much as pointing out a bug.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "What to check, most important first",
        layers: [
          { label: "Correctness", detail: "Does it do what the issue asks, including edge cases?" },
          { label: "Security", detail: "Input validation, secrets, permissions" },
          { label: "Design", detail: "Right place, right abstraction, easy to change" },
          { label: "Tests", detail: "Cover the new behaviour and the bug fixed" },
          { label: "Readability", detail: "Names, comments, small functions" },
          { label: "Nits", detail: "Optional polish, never blocking" },
        ],
      },
    ],
    examples: [
      {
        title: "Splitting a big change into reviewable PRs",
        explanation: "You built CSV export: a new database query, a service function, an API endpoint and a button, 1,400 lines in total. Step 1: PR 1 adds the query and its tests. Step 2: PR 2, based on PR 1's branch, adds the service and the endpoint behind a feature flag. Step 3: PR 3 adds the button and turns the flag on. Each PR is under 500 lines, can be reviewed in one sitting, and is safe to merge on its own.",
        code: {
          lang: "bash",
          code: "git switch -c export/query main      # commit query + tests\ngh pr create --fill --base main\ngit switch -c export/api             # branch off export/query\ngh pr create --fill --base export/query\ngit switch -c export/ui              # branch off export/api\ngh pr create --fill --base export/api",
        },
      },
      {
        title: "Turning a vague comment into an actionable one",
        explanation: "A reviewer writes: \"This is wrong.\" The author cannot tell what to fix. A better comment names the problem, explains why it matters and proposes a fix, as a suggestion the author can commit in one click. Compare the two below. The second takes 30 seconds longer to write and saves a round trip.",
        code: {
          lang: "markdown",
          code: "Bad:  This is wrong.\n\nGood: issue: if `items` is empty, `items[0]` raises IndexError\nand the endpoint returns 500. Could we return 404 instead?\n\n```suggestion\nif not items:\n    raise HTTPException(status_code=404)\nfirst = items[0]\n```",
        },
      },
    ],
    cheatSheet: [
      ".github/pull_request_template.md pre-fills every new PR description",
      "Fixes #42 or Closes #42 closes the issue when the PR merges into the default branch",
      "Draft PRs run CI but cannot be merged; gh pr ready marks them ready",
      "Request changes blocks merging when approvals are required",
      "Start a review and submit once, instead of many single comments",
      "Prefix comments with nit:, suggestion:, issue: or question: to show what blocks",
      "Add ?w=1 to a PR files URL to hide whitespace-only changes",
      "gh pr merge --auto --squash merges by itself once checks and reviews pass",
    ],
    quiz: [
      {
        q: "Why are small PRs reviewed better?",
        options: ["GitHub limits PR size", "Reviewers keep their attention and find more problems in a short diff", "Small PRs skip CI", "They do not need a description"],
        answer: 1,
        why: "Review quality drops as the diff grows, so focused PRs get careful reviews.",
      },
      {
        q: "PR 2 targets PR 1's branch. PR 1 is merged and its branch deleted. What happens to PR 2?",
        options: ["It is closed", "It must be recreated", "It merges automatically", "GitHub retargets it to the branch PR 1 merged into"],
        answer: 3,
        why: "GitHub retargets PRs whose base branch was merged and deleted.",
      },
      {
        q: "Which review state blocks merging when branch protection requires approvals?",
        options: ["Comment", "Approve", "Request changes", "Viewed"],
        answer: 2,
        why: "An outstanding change request stops the merge until it is dismissed or the reviewer approves.",
      },
      {
        q: "What does the prefix nit: tell the author?",
        options: ["It is optional polish, not a blocker", "It is a security problem", "The reviewer will fix it", "The PR must be split"],
        answer: 0,
        why: "nit marks small preferences so the author knows it does not block the merge.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add a PR template to your repo with What, Why and How to test sections, then open a PR and check it is pre-filled.",
        hint: "The template goes in .github/ and must be on the default branch to apply.",
        solution: "mkdir -p .github\nprintf '## What\\n\\n## Why\\n\\nFixes #\\n\\n## How to test\\n1. \\n' > .github/pull_request_template.md\ngit add .github && git commit -m \"Add PR template\" && git push\n# open a new PR in the browser: the description is pre-filled",
      },
      {
        level: "medium",
        task: "Open a draft PR from the terminal, push one more commit, then mark it ready and request a review from a teammate.",
        hint: "gh pr create has --draft and --reviewer; gh pr ready changes the state.",
        solution: "gh pr create --draft --fill --base main\ngit commit -am \"Handle empty list\" && git push\ngh pr ready\ngh pr edit --add-reviewer alice\ngh pr view --web",
      },
      {
        level: "hard",
        task: "Review a teammate's PR from the terminal: check it out, run the tests, then submit a Request changes review with a clear, prefixed comment.",
        hint: "gh pr checkout, then gh pr review with --request-changes and a body.",
        solution: "gh pr checkout 57\nnpm ci && npm test\ngh pr diff 57 | less\ngh pr review 57 --request-changes \\\n  -b \"issue: export fails when the list is empty (IndexError at api.py line 41). Could it return 404? Rest looks good.\"",
      },
    ],
    faq: [
      { q: "How big should a pull request be?", a: "Small enough to review in one sitting, often under a few hundred changed lines. Generated files and lockfiles count less, but behaviour changes should stay focused." },
      { q: "What is a draft pull request for?", a: "It shares work in progress: CI runs and people can comment, but it cannot be merged and reviewers are not asked to review until you mark it ready." },
      { q: "Should the author or the reviewer click merge?", a: "Teams differ, but a common rule is that the author merges after approval, because they know when the change is safe to ship." },
      { q: "What does \"dismiss review\" do?", a: "It removes an approval or change request so it no longer counts toward the merge rules, for example when the reviewer is away and the issue was fixed." },
    ],
  },

  "github-collab/gh-protect": {
    plain: [
      "Without protection, anyone with write access can push straight to main, skip review and break the build for everybody. Branch protection is a set of rules GitHub enforces on a branch, such as \"changes must come through a reviewed pull request\" and \"tests must pass first\".",
      "Rulesets are the newer, more flexible way to write those rules. One ruleset can cover many branches by pattern, like main and every release/ branch. Several rulesets can apply at once, and each has a clear list of who, if anyone, may bypass it.",
      "Status checks are the green ticks and red crosses that CI posts on a pull request. When you mark a check as required, the merge button stays disabled until that check passes. This is how \"main is always green\" becomes a rule instead of a hope.",
      "CODEOWNERS is a file that says who owns which part of the code. When a PR touches those files, GitHub asks the owners to review automatically. Combined with the rule \"require review from code owners\", the platform team must approve changes to infrastructure, and so on.",
    ],
    deepDive: [
      {
        heading: "The rules worth turning on",
        body: "Require a pull request before merging, with at least one approval. Turn on dismiss stale approvals when new commits are pushed, so an approval covers the code that actually merges. Require approval of the most recent reviewable push, so the last push must be approved by someone other than the person who pushed it. Require conversation resolution so no review thread is ignored.\n\nRequire status checks to pass, and pick the exact CI jobs. Block force pushes and deletions on main. Optional extras: require linear history (only squash or rebase merges), require signed commits, and require a merge queue for busy repos. Finally, decide on bypass: by default administrators may be exempt, so remove that unless you have a documented break-glass reason.",
        bullets: [
          "Required approvals: 1 for most teams, 2 for critical repos",
          "Dismiss stale approvals on new pushes",
          "Block force pushes and branch deletion",
          "Free plan: protection works on public repos; private repos need a paid plan",
        ],
      },
      {
        heading: "Rulesets vs classic branch protection",
        body: "Classic branch protection is one rule per branch pattern, and only one rule applies to a given branch. Rulesets are named, can target branches or tags by patterns such as ~DEFAULT_BRANCH or release/*, and can stack: when several rulesets apply to the same branch, all of their rules apply and the most restrictive setting wins. They can also be defined once at organization level for many repos.\n\nEach ruleset has an enforcement status (Active or Disabled, plus Evaluate on Enterprise to test without blocking) and an explicit bypass list of roles, teams or apps. Anyone with read access can see which rulesets apply, which makes \"why can I not merge?\" easy to answer. Rulesets and classic rules can coexist; both are enforced.",
        visual: {
          type: "compare",
          title: "Classic protection vs rulesets",
          columns: [
            { title: "Classic branch protection", points: ["One rule per branch pattern", "Branches only", "Per repository", "Admins exempt unless told otherwise"] },
            { title: "Rulesets", points: ["Many rulesets stack, strictest wins", "Branches, tags and pushes", "Repo or organization level", "Explicit bypass list, visible to readers"] },
          ],
        },
      },
      {
        heading: "Required checks: names and traps",
        body: "A required check is matched by its name, which for GitHub Actions is the job name, not the workflow name. A matrix job reports one check per combination, like test (ubuntu-latest, 3.12). Renaming a job or changing a matrix silently creates new check names, and the old required name then waits forever. A common fix is a small final job that needs all the others and is the only required check.\n\nTwo more traps. If a whole workflow is skipped because of a paths or branches filter, its checks stay Pending and block the PR. A job skipped by an if condition, however, reports success. And require branches to be up to date makes every PR rebase or merge main before merging, which is safe but slow on busy repos; a merge queue solves that.",
      },
      {
        heading: "How CODEOWNERS is matched",
        body: "GitHub looks for CODEOWNERS in .github/, then the repo root, then docs/, and uses the first one it finds. The file on the PR's base branch is the one that counts. Each line is a pattern followed by one or more owners: @user, @org/team or an email. Patterns work mostly like .gitignore, but ! negation and [ ] ranges are not supported.\n\nThe last matching line wins, and only its owners apply. So put the catch-all * line first and specific paths below. An owner must have write access to the repo, and a team must be visible and have write access, or the line is ignored. Without the rule require review from code owners, CODEOWNERS only auto-requests reviews; it does not block anything.",
        bullets: [
          "A line with a pattern and no owner removes ownership for those paths",
          "/docs/ matches the folder at the root; docs/ matches any docs folder",
          "GitHub shows errors in CODEOWNERS when you view the file on the web",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "What the merge button waits for",
        steps: [
          { label: "PR opened", detail: "CODEOWNERS requests owner reviews" },
          { label: "Required checks", detail: "Each named check must report success" },
          { label: "Approvals", detail: "Enough approvals, including code owners" },
          { label: "Conversations", detail: "All review threads resolved" },
          { label: "Up to date", detail: "Optional: branch includes latest main" },
          { label: "Merge enabled", detail: "Or the PR joins the merge queue" },
        ],
      },
    ],
    examples: [
      {
        title: "One stable required check for a matrix",
        explanation: "Your CI has a test matrix of 6 combinations that changes often, and updating required checks every time is painful. Step 1: add a final job named ci-ok that needs every other job and runs even if they fail. Step 2: make it fail if any needed job did not succeed. Step 3: mark only ci-ok as required in the ruleset. Now you can change the matrix freely and the rule stays correct.",
        code: {
          lang: "yaml",
          code: "  ci-ok:\n    if: always()\n    needs: [lint, test]\n    runs-on: ubuntu-latest\n    steps:\n      - name: Fail if any needed job failed or was cancelled\n        if: contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled')\n        run: exit 1\n      - run: echo \"All required jobs passed\"",
        },
      },
      {
        title: "CODEOWNERS for a monorepo",
        explanation: "A repo holds the API, the web app and Terraform. Step 1: set a default owner team on the first line. Step 2: add specific paths below it, because the last match wins. Step 3: make the platform team own .github/ itself, so nobody can quietly change CI or remove owners. Step 4: turn on require review from code owners in the ruleset.",
        code: {
          lang: "text",
          code: "# .github/CODEOWNERS (last match wins)\n*                 @acme/maintainers\n/api/             @acme/backend\n/web/             @acme/frontend\n/infra/           @acme/platform\n*.tf              @acme/platform\n/.github/         @acme/platform\n/docs/            @acme/docs @alice",
        },
      },
    ],
    cheatSheet: [
      "Required check names are job names; a matrix makes one check per combination",
      "A workflow skipped by paths filters leaves required checks Pending",
      "A job skipped by an if condition reports success",
      "Turn on dismiss stale approvals so approvals match the merged code",
      "CODEOWNERS: .github/, then root, then docs/; first file found is used",
      "In CODEOWNERS the last matching pattern wins, so put * first",
      "Rulesets stack: if several apply, the most restrictive rule wins",
      "gh api repos/OWNER/REPO/rulesets lists rulesets from the terminal",
    ],
    quiz: [
      {
        q: "You require the check test, then rename the job to unit-tests. What happens to new PRs?",
        options: ["They merge without checks", "GitHub renames the rule for you", "They wait forever for a check called test", "The ruleset is disabled"],
        answer: 2,
        why: "Required checks are matched by name, and no job reports test any more.",
      },
      {
        q: "Two CODEOWNERS lines match infra/main.tf: * @acme/maintainers then *.tf @acme/platform. Who owns it?",
        options: ["Both teams", "@acme/maintainers", "Nobody", "@acme/platform"],
        answer: 3,
        why: "The last matching line wins and replaces earlier owners.",
      },
      {
        q: "Two rulesets apply to main: one needs 1 approval, the other 2. How many are required?",
        options: ["2, the most restrictive", "1, the first created", "3, they add up", "It is an error"],
        answer: 0,
        why: "Rulesets layer and the strictest version of each rule applies.",
      },
      {
        q: "What does dismiss stale pull request approvals do?",
        options: ["Deletes old PRs", "Removes approvals when new commits are pushed", "Closes PRs with no activity", "Hides old review comments"],
        answer: 1,
        why: "It makes sure an approval always covers the latest code.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add a CODEOWNERS file that makes you the default owner and a teammate the owner of docs/. Open a PR touching docs/ and check who is requested.",
        hint: "Put the file in .github/ on the default branch first.",
        solution: "mkdir -p .github\nprintf '*        @me\\n/docs/   @teammate\\n' > .github/CODEOWNERS\ngit add .github/CODEOWNERS && git commit -m \"Add CODEOWNERS\" && git push\n# replace @me and @teammate with real usernames with write access\n# a PR changing docs/ requests @teammate automatically",
      },
      {
        level: "medium",
        task: "Create a ruleset on the default branch that requires a pull request with 1 approval, blocks force pushes and deletion, and requires the check ci-ok.",
        hint: "Settings, Rules, Rulesets, New branch ruleset. Target: Include default branch.",
        solution: "Settings > Rules > Rulesets > New branch ruleset\nName: protect-main, Enforcement: Active\nTarget branches: Include default branch\nRestrict deletions: on\nBlock force pushes: on\nRequire a pull request: on, approvals 1, dismiss stale approvals\nRequire status checks: add ci-ok\nBypass list: empty\nSave, then try git push origin main: it is rejected",
      },
      {
        level: "hard",
        task: "A docs workflow has a paths filter so it only runs when files in docs/ change, and its check is required. Code-only PRs are stuck on Pending. Fix it without removing the requirement.",
        hint: "Drop the paths filter so the job always runs and reports, then skip only the expensive steps when docs did not change.",
        solution: "on: pull_request   # no paths filter, so the check always reports\njobs:\n  docs-check:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n        with: { fetch-depth: 0 }\n      - id: f\n        run: git diff --quiet origin/${{ github.base_ref }}...HEAD -- docs/ || echo \"docs=true\" >> \"$GITHUB_OUTPUT\"\n      - if: steps.f.outputs.docs == 'true'\n        run: echo build docs here",
      },
    ],
    faq: [
      { q: "Should I use rulesets or classic branch protection?", a: "Use rulesets for new setups. They stack, cover tags, can be shared across an organization and show their bypass list clearly. Classic rules still work and are enforced alongside them." },
      { q: "Why is my required check stuck on Expected or Waiting?", a: "No job with that exact name reported on the latest commit. Usually the job was renamed, a matrix changed, or the workflow was skipped by a paths or branches filter." },
      { q: "Can repository admins bypass branch protection?", a: "With classic protection, admins can bypass unless you enable the setting that includes administrators. With rulesets, only roles or teams on the bypass list can bypass." },
      { q: "Does CODEOWNERS require approval by itself?", a: "No. It only requests reviews. You must also turn on require review from code owners in branch protection or a ruleset." },
    ],
  },

  "github-collab/gh-cli": {
    plain: [
      "gh is GitHub's official command-line tool. Git handles commits and branches; gh handles the GitHub side: pull requests, issues, workflow runs, releases and repo settings. You can do your whole review-and-merge loop without opening a browser.",
      "You sign in once with gh auth login. It opens the browser, you approve, and gh stores a token safely (in your system's keyring when one is available). From then on, gh knows which account you are and can also act as the credential helper for git push over HTTPS.",
      "gh works out which repo you mean from the folder you are in, by looking at your git remotes. Run it inside a clone and gh pr list shows that repo's pull requests. Use -R owner/repo to point at any other repo.",
      "The most powerful part is scripting. Almost every command can print JSON with --json and filter it with --jq. gh api can call any GitHub API endpoint with your login, so anything the website can do, a script can do too.",
    ],
    deepDive: [
      {
        heading: "Installing and authenticating",
        body: "Install with your package manager: brew install gh on macOS, winget install --id GitHub.cli on Windows, and the official apt or dnf repositories from cli.github.com on Linux. Then run gh auth login, pick GitHub.com, HTTPS, and log in with the browser. gh auth status shows which account and scopes you have.\n\nSome features need extra scopes. Projects need the project scope: gh auth refresh -s project. In scripts and CI, gh skips the login and reads a token from the GH_TOKEN environment variable (GITHUB_TOKEN also works). gh is preinstalled on GitHub-hosted runners, so a workflow step only needs env: GH_TOKEN: ${{ github.token }}.",
        bullets: [
          "gh auth setup-git makes git use gh for HTTPS credentials",
          "gh auth switch changes between logged-in accounts",
          "GH_REPO=owner/repo sets the target repo for every command",
        ],
      },
      {
        heading: "The pull request workflow from the terminal",
        body: "gh pr create --fill uses your commit messages for the title and body; add --draft, --base, --reviewer and --label as needed. gh pr status shows your PRs and the ones waiting for your review. gh pr view opens the details, --comments shows the discussion, and --web opens the browser.\n\nTo review someone else's work, gh pr checkout 123 fetches the branch (even from a fork) and switches to it. gh pr diff shows the changes. gh pr review 123 --approve, --comment or --request-changes with -b submits a review. To finish, gh pr merge with --squash, --merge or --rebase, plus --delete-branch. Add --auto to merge automatically once required checks and reviews pass.",
        visual: {
          type: "sequence",
          title: "Reviewing a teammate's PR with gh",
          actors: ["You", "gh", "GitHub"],
          messages: [
            { from: 0, to: 1, label: "gh pr list --search review-requested:@me" },
            { from: 1, to: 2, label: "Search API query" },
            { from: 0, to: 1, label: "gh pr checkout 123" },
            { from: 1, to: 2, label: "Fetch PR branch, even from a fork" },
            { from: 0, to: 1, label: "gh pr review 123 --approve" },
            { from: 1, to: 2, label: "Submit review" },
          ],
        },
      },
      {
        heading: "Working with Actions runs",
        body: "gh run list shows recent workflow runs with their status; filter with --workflow ci.yml, --branch or --status failure. gh run watch follows a run live, and --exit-status makes the command fail if the run fails, which is handy in scripts. gh run view ID --log-failed prints only the logs of failed steps, usually exactly what you need.\n\ngh run rerun ID --failed retries just the failed jobs, and gh run download ID -n dist fetches an artifact. For workflows with a workflow_dispatch trigger, gh workflow run deploy.yml -f environment=staging starts a run with inputs, and --ref chooses the branch. gh workflow disable and enable pause a noisy scheduled workflow.",
      },
      {
        heading: "gh api, JSON output and extensions",
        body: "gh api repos/{owner}/{repo}/pulls calls the REST API with your token; {owner} and {repo} are filled from the current repo. Use -X for the method, -f for string fields and -F for typed ones (numbers, booleans, @file). --paginate follows every page, and --jq filters the result. gh api graphql -f query='...' runs GraphQL queries.\n\nFor normal commands, --json lists the fields you want and --jq or --template shapes them, so you never scrape human output. gh alias set lets you save long commands under a short name. gh extension install adds community commands, for example gh extension install dlvhdr/gh-dash for a terminal dashboard of PRs and issues.",
        bullets: [
          "gh pr list --json number,title,author --jq '.[] | \"\\(.number) \\(.title)\"'",
          "gh alias set mine 'pr list --author @me'",
          "gh api rate_limit shows how many API calls you have left",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "gh command groups you will use most",
        root: "gh",
        children: [
          { label: "auth", children: ["login", "status", "refresh -s scope"] },
          { label: "pr", children: ["create", "checkout", "review", "merge", "checks"] },
          { label: "issue", children: ["create", "list", "close"] },
          { label: "run and workflow", children: ["run list", "run watch", "run view --log-failed", "workflow run"] },
          { label: "repo and release", children: ["repo clone", "repo fork", "release create"] },
          { label: "api", children: ["REST calls", "graphql", "--paginate"] },
        ],
      },
    ],
    examples: [
      {
        title: "Debug a red CI run in under a minute",
        explanation: "Your PR shows a red cross. Step 1: list the checks on the PR to see which job failed. Step 2: list the latest failed runs on your branch. Step 3: print only the failed step's logs. Step 4: fix, push, and watch the new run until it finishes. If the failure was a flaky network call, rerun only the failed jobs instead of the whole run.",
        code: {
          lang: "bash",
          code: "gh pr checks\ngh run list --branch \"$(git branch --show-current)\" --status failure --limit 3\ngh run view 9876543210 --log-failed\n# ...fix the bug, commit, push...\ngh run watch --exit-status\n# flaky? retry only what failed:\ngh run rerun 9876543210 --failed",
        },
      },
      {
        title: "A script that finds stale pull requests",
        explanation: "Your team lead wants a weekly list of open PRs not updated for 14 days. Step 1: ask gh for open PRs with the fields you need as JSON. Step 2: use a jq filter to compare updatedAt with a cutoff date. Step 3: print number, author and title. Run it from cron or a scheduled workflow with GH_TOKEN set.",
        code: {
          lang: "bash",
          code: "cutoff=$(date -u -d '14 days ago' +%Y-%m-%dT%H:%M:%SZ)   # GNU date\ngh pr list --state open --limit 200 \\\n  --json number,title,author,updatedAt \\\n  --jq \".[] | select(.updatedAt < \\\"$cutoff\\\") | \\\"#\\(.number) @\\(.author.login) \\(.title)\\\"\"",
        },
      },
    ],
    cheatSheet: [
      "gh auth status shows the account, token source and scopes in use",
      "gh pr create --fill --draft opens a draft PR from your commits",
      "gh pr checkout 123 fetches and switches to PR 123, even from a fork",
      "gh pr merge --squash --delete-branch --auto merges once everything passes",
      "gh run view ID --log-failed prints only the failed steps' logs",
      "gh workflow run deploy.yml -f environment=staging starts a workflow_dispatch run",
      "gh api repos/{owner}/{repo}/pulls --paginate --jq '.[].title' calls the REST API",
      "In Actions, set env GH_TOKEN: ${{ github.token }} before using gh",
    ],
    quiz: [
      {
        q: "How does gh know which repository a command applies to?",
        options: ["It asks every time", "It reads the git remotes of the current folder, unless -R is given", "It always uses your most recent repo", "It reads a gh.yml file"],
        answer: 1,
        why: "gh detects the repo from the clone you are in; -R or GH_REPO overrides it.",
      },
      {
        q: "Which command retries only the failed jobs of a run?",
        options: ["gh run watch --failed", "gh workflow run --retry", "gh pr checks --rerun", "gh run rerun ID --failed"],
        answer: 3,
        why: "gh run rerun with --failed reruns just the failed jobs and their dependents.",
      },
      {
        q: "In a GitHub Actions step, how should gh get its credentials?",
        options: ["Run gh auth login in the step", "Commit a token to the repo", "Set the GH_TOKEN environment variable, for example to github.token", "gh cannot run in Actions"],
        answer: 2,
        why: "gh reads GH_TOKEN automatically, and the runner's token is available as github.token.",
      },
      {
        q: "What does --json number,title do on gh pr list?",
        options: ["Prints machine-readable JSON with just those fields", "Saves the list to a file", "Filters PRs by number", "Converts the PR to JSON format on GitHub"],
        answer: 0,
        why: "--json selects fields and outputs JSON, which --jq can filter further.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Install gh, log in, and list the five most recent issues and pull requests in a repo you use.",
        hint: "gh issue list and gh pr list both accept --limit.",
        solution: "gh auth login          # GitHub.com, HTTPS, browser\ngh auth status\ngh issue list --limit 5\ngh pr list --limit 5 --state all",
      },
      {
        level: "medium",
        task: "Create an alias called review that lists PRs waiting for your review, and another called mine that lists your open PRs with their check status.",
        hint: "gh alias set takes a name and the command after gh; gh pr status covers checks.",
        solution: "gh alias set review 'pr list --search \"review-requested:@me\"'\ngh alias set mine 'pr list --author @me'\ngh review\ngh mine\ngh pr status   # also shows checks for your PRs",
      },
      {
        level: "hard",
        task: "Write a workflow step that comments the test coverage number on the current pull request using gh, with the least permissions needed.",
        hint: "PR comments use the issues API, so the job needs pull-requests: write; gh pr comment takes a PR number.",
        solution: "permissions:\n  contents: read\n  pull-requests: write\nsteps:\n  - run: gh pr comment \"$PR\" --body \"Coverage: $COVERAGE%\"\n    env:\n      GH_TOKEN: ${{ github.token }}\n      PR: ${{ github.event.pull_request.number }}\n      COVERAGE: ${{ steps.test.outputs.coverage }}",
      },
    ],
    faq: [
      { q: "Is gh the same as git?", a: "No. git manages your local repository and talks to any Git server. gh talks to GitHub's API for pull requests, issues, Actions and settings; you use both together." },
      { q: "Does gh work with GitHub Enterprise Server?", a: "Yes. Log in with gh auth login --hostname your.github.host and gh will use that server for repos cloned from it." },
      { q: "Where does gh store my token?", a: "In your operating system's credential store when one is available, otherwise in a config file under ~/.config/gh. gh auth token prints the token if a script needs it." },
    ],
  },
};

export default extra;

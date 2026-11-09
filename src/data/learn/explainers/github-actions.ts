import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  "git-core/git-model": {
    summary:
      "Git stores your project as a small set of objects: blobs for file contents, trees for folders and commits for snapshots. Branches and HEAD are just pointers to commits, which is why Git operations are fast and recoverable.",
    analogy: "Commits are photos in an album; branches are sticky notes marking a page.",
    visuals: [
      {
        type: "layers",
        title: "From HEAD down to file contents",
        layers: [
          { label: "HEAD", detail: "Points to the current branch, e.g. refs/heads/main." },
          { label: "Branch main", detail: "A file holding one commit hash; moves on each commit." },
          { label: "Commit object", detail: "Author, message, parent commit hash and one root tree." },
          { label: "Tree object", detail: "A folder listing: names mapped to blobs and subtrees." },
          { label: "Blob object", detail: "Raw file contents, named by the hash of that content." },
        ],
      },
    ],
    keyPoints: [
      "Every object is named by a hash of its content, so identical files are stored once.",
      "A commit points to one tree and to its parent commit, forming a history chain.",
      "A branch is a pointer to a commit; creating one is nearly free.",
      "Detached HEAD means HEAD points straight at a commit instead of a branch.",
    ],
    terms: [
      { term: "Blob", meaning: "Object storing one file's contents, without its name." },
      { term: "Tree", meaning: "Object listing file names and subfolders of a directory." },
      { term: "Commit", meaning: "Object pointing to a tree, parents, author and message." },
      { term: "HEAD", meaning: "Pointer to what you have checked out, usually a branch." },
      { term: "Ref", meaning: "A named pointer to a commit, like a branch or tag." },
    ],
    example: {
      lang: "bash",
      code: "cat .git/HEAD                 # ref: refs/heads/main\ncat .git/refs/heads/main      # a commit hash\ngit cat-file -t HEAD          # commit\ngit cat-file -p HEAD          # tree, parent, author, message\ngit cat-file -p HEAD^{tree}   # files and subtrees\ngit cat-file -p HEAD:README.md",
      caption: "Walk from HEAD down to a file's contents.",
    },
    pitfalls: [
      "Thinking a branch contains commits; it only points at the newest one.",
      "Panicking in detached HEAD; create a branch there to keep new work.",
    ],
    check: [
      { q: "What is a branch, physically?", a: "A small ref file containing the hash of one commit." },
      { q: "Why does an unchanged file cost no extra space in a new commit?", a: "Its content hash is the same, so the new tree points to the existing blob." },
    ],
  },

  "git-core/git-branch": {
    summary:
      "Feature branches isolate work until it is ready. How you merge them decides what history looks like: a straight line, a visible merge commit or a single squashed commit.",
    visuals: [
      {
        type: "compare",
        title: "Three ways to merge",
        columns: [
          { title: "Fast-forward", points: ["Main had no new commits", "Pointer just moves forward", "No merge commit", "Linear history"] },
          { title: "Merge commit", points: ["Branches diverged", "New commit with two parents", "Keeps full branch history", "git merge --no-ff forces one"] },
          { title: "Squash merge", points: ["All branch commits combined", "One new commit on main", "Clean, readable main history", "Loses individual commits"] },
        ],
      },
    ],
    keyPoints: [
      "Create one branch per feature or fix, named like feature/login or fix/timeout.",
      "Fast-forward is only possible when main has not moved since you branched.",
      "Squash merges keep main tidy but hide the step-by-step history.",
      "Delete merged branches and prune stale remote refs to keep things clean.",
    ],
    terms: [
      { term: "Feature branch", meaning: "Short-lived branch for one piece of work." },
      { term: "Fast-forward", meaning: "Merge that just moves the branch pointer ahead." },
      { term: "Merge commit", meaning: "A commit with two parents joining two histories." },
      { term: "Squash", meaning: "Combine several commits into one." },
      { term: "Prune", meaning: "Remove local references to deleted remote branches." },
    ],
    example: {
      lang: "bash",
      code: "git switch -c feature/login\ngit commit -am \"Add login form\"\ngit switch main\ngit merge --ff-only feature/login   # fails if main moved\ngit merge --no-ff feature/login     # always a merge commit\ngit merge --squash feature/login && git commit -m \"Add login\"\ngit branch -d feature/login\ngit fetch --prune",
      caption: "The same branch merged three different ways.",
    },
    pitfalls: [
      "Keeping a branch alive for weeks, so it drifts far from main.",
      "Deleting an unmerged branch with -D and losing work (reflog can still help).",
    ],
    check: [
      { q: "When is a fast-forward merge possible?", a: "When the target branch has no commits that the feature branch lacks." },
      { q: "What does a squash merge give up?", a: "The individual commits of the branch; main gets one combined commit instead." },
    ],
  },

  "git-core/git-history": {
    summary:
      "Rebase, cherry-pick and reset rewrite or copy commits to tidy local history. The reflog records where HEAD has been, so almost any 'lost' commit can be recovered.",
    visuals: [
      {
        type: "compare",
        title: "git reset modes",
        columns: [
          { title: "--soft", points: ["Moves the branch pointer", "Changes stay staged", "Good for recommitting"] },
          { title: "--mixed (default)", points: ["Moves the branch pointer", "Changes kept but unstaged", "Good for re-splitting commits"] },
          { title: "--hard", points: ["Moves the branch pointer", "Discards working changes", "Destructive; check first"] },
        ],
      },
      {
        type: "flow",
        title: "Recover a lost commit",
        steps: [
          { label: "Run git reflog", detail: "Lists every position HEAD has held, newest first." },
          { label: "Find the entry", detail: "Look for the commit message before the mistake." },
          { label: "Create a branch", detail: "git branch rescue HEAD@{3} keeps it safe." },
          { label: "Merge or reset", detail: "Bring the rescued commits back where needed." },
        ],
      },
    ],
    keyPoints: [
      "Rebase replays your commits on a new base, creating new commits with new hashes.",
      "Interactive rebase lets you squash, reword, reorder or drop local commits.",
      "Cherry-pick copies one commit onto another branch, such as a hotfix to release.",
      "Never rewrite commits others already pulled; rewrite only local or private branches.",
    ],
    terms: [
      { term: "Rebase", meaning: "Move a branch's commits so they start from a new base." },
      { term: "Interactive rebase", meaning: "git rebase -i to edit a list of commits." },
      { term: "Cherry-pick", meaning: "Apply the change from one commit onto the current branch." },
      { term: "Reset", meaning: "Move the current branch pointer to another commit." },
      { term: "Reflog", meaning: "Local log of where HEAD and branches have pointed." },
    ],
    example: {
      lang: "bash",
      code: "git fetch origin\ngit rebase origin/main\ngit rebase -i HEAD~3          # mark commits as squash or fixup\ngit cherry-pick 4f2a9c1       # copy a fix onto this branch\ngit reset --soft HEAD~1       # undo last commit, keep changes staged\ngit reflog\ngit branch rescue HEAD@{2}\ngit push --force-with-lease",
      caption: "Tidy, copy, undo and recover.",
    },
    pitfalls: [
      "Using git push --force on shared branches; prefer --force-with-lease and only on your own.",
      "Running reset --hard with uncommitted work, which reflog cannot recover.",
    ],
    check: [
      { q: "Why do rebased commits get new hashes?", a: "Their parent changes, and the parent is part of the content that is hashed." },
      { q: "What can reflog not recover?", a: "Changes that were never committed, such as edits wiped by reset --hard." },
    ],
  },

  "git-core/git-conflicts": {
    summary:
      "A conflict happens when two branches change the same lines and Git cannot choose. Git marks the conflicting region in the file; you edit it to the correct result, then tell Git it is resolved.",
    visuals: [
      {
        type: "flow",
        title: "Resolving a merge conflict",
        steps: [
          { label: "Merge stops", detail: "git status lists files as both modified." },
          { label: "Read the markers", detail: "Compare the ours and theirs sections in each file." },
          { label: "Edit the result", detail: "Keep, combine or rewrite; delete all marker lines." },
          { label: "Test it", detail: "Run the app or tests before finishing." },
          { label: "Stage and continue", detail: "git add, then git commit or git rebase --continue." },
        ],
      },
    ],
    keyPoints: [
      "Conflict markers are <<<<<<<, ======= and >>>>>>> around the two versions.",
      "During a rebase, ours is the branch you rebase onto, theirs is your commit.",
      "You can always back out with git merge --abort or git rebase --abort.",
      "Small, frequent merges from main mean small, easy conflicts.",
    ],
    terms: [
      { term: "Conflict markers", meaning: "Lines Git inserts to show both competing versions." },
      { term: "Ours", meaning: "The version from the branch you are currently on." },
      { term: "Theirs", meaning: "The version from the branch being merged in." },
      { term: "--abort", meaning: "Cancels the merge or rebase and restores the previous state." },
    ],
    example: {
      lang: "text",
      code: "<<<<<<< HEAD\nTIMEOUT = 30\n=======\nTIMEOUT = 60\n>>>>>>> feature/slow-api\n\n# after editing, the file just says:\nTIMEOUT = 60\n\n$ git add config.py\n$ git commit",
      caption: "A conflict in config.py and its resolution.",
    },
    pitfalls: [
      "Leaving a stray ======= or <<<<<<< line in the file and committing it.",
      "Resolving by blindly picking one side and silently dropping a teammate's change.",
    ],
    check: [
      { q: "How do you tell Git a file's conflict is resolved?", a: "Remove the markers, save the file and stage it with git add." },
      { q: "How do you safely give up on a rebase midway?", a: "Run git rebase --abort to return the branch to its state before the rebase." },
    ],
  },

  "github-collab/gh-repo": {
    summary:
      "A well-run repo explains itself with a README and license, captures work as issues, and shows progress on a Projects board. Templates and labels keep issues consistent and easy to triage.",
    visuals: [
      {
        type: "tree",
        title: "What a tidy repo contains",
        root: "acme/api",
        children: [
          { label: "README.md", children: ["What it does", "How to run it", "How to contribute"] },
          { label: "LICENSE", children: ["Says how others may use it"] },
          { label: ".github/ISSUE_TEMPLATE", children: ["bug_report.yml", "feature_request.yml"] },
          { label: "Labels", children: ["bug", "enhancement", "good first issue"] },
          { label: "Projects board", children: ["Todo", "In progress", "Done"] },
        ],
      },
    ],
    keyPoints: [
      "A README answers what this is, how to run it and how to contribute.",
      "Without a license, others have no legal right to reuse your code.",
      "Issue forms ask the right questions up front, like steps to reproduce.",
      "Projects boards track issues and PRs across columns, fields and views.",
    ],
    terms: [
      { term: "Issue", meaning: "A tracked task, bug or idea in a repository." },
      { term: "Issue template", meaning: "A preset form or text for new issues." },
      { term: "Label", meaning: "A tag used to categorise and filter issues and PRs." },
      { term: "Projects", meaning: "GitHub's planning boards and tables built from issues." },
      { term: "Milestone", meaning: "A group of issues targeted at one release or date." },
    ],
    example: {
      lang: "bash",
      code: "gh repo create acme/api --public --add-readme --license mit\ngh label create needs-triage --color FBCA04\ngh issue create --title \"Health check returns 500\" --label bug\ngh issue list --label bug\ngh project create --owner acme --title \"API roadmap\"",
      caption: "Set up a repo, labels, an issue and a project with the GitHub CLI.",
    },
    pitfalls: [
      "Vague issues like 'it's broken' with no steps, logs or expected result.",
      "Dozens of overlapping labels that nobody applies consistently.",
    ],
    check: [
      { q: "Why add issue templates?", a: "They prompt reporters for the details you need, so issues are actionable." },
      { q: "What happens if a public repo has no license?", a: "Default copyright applies, so others cannot legally reuse or modify it." },
    ],
  },

  "github-collab/gh-pr": {
    summary:
      "A pull request proposes merging one branch into another and is where review happens. Small, focused PRs with a clear description get faster, better reviews.",
    visuals: [
      {
        type: "cycle",
        title: "The review loop",
        steps: [
          { label: "Open small PR", detail: "One focused change with a clear description." },
          { label: "CI runs", detail: "Checks report pass or fail on the PR." },
          { label: "Reviewer comments", detail: "Specific, actionable suggestions or questions." },
          { label: "Author updates", detail: "Push fixes and reply to each comment." },
          { label: "Re-review", detail: "Approve, or loop again until ready." },
        ],
      },
    ],
    keyPoints: [
      "Aim for PRs a reviewer can read in under 20 minutes.",
      "Describe what changed, why, and how to test it; link the issue.",
      "Comment on the code, not the person, and explain the reason for each request.",
      "Mark optional suggestions as nits so authors know what is blocking.",
    ],
    terms: [
      { term: "Pull request", meaning: "A proposal to merge changes from one branch into another." },
      { term: "Draft PR", meaning: "A PR marked as not ready for review yet." },
      { term: "Request changes", meaning: "A review status that blocks merge until addressed." },
      { term: "Suggestion", meaning: "A review comment with a code change the author can apply." },
      { term: "Closing keyword", meaning: "Text like Fixes #12 that closes the issue on merge." },
    ],
    example: {
      lang: "markdown",
      code: "## What\nAdd /health endpoint returning app and DB status.\n\n## Why\nThe load balancer needs a real health check. Fixes #42.\n\n## How to test\n1. docker compose up\n2. curl localhost:8000/health\n3. Stop the db container and expect status 503",
      caption: "A PR description that is quick to review.",
    },
    pitfalls: [
      "Giant PRs mixing refactors, features and formatting changes.",
      "Approving without running or reading the code because CI is green.",
    ],
    check: [
      { q: "What should a PR description include?", a: "What changed, why it was needed, and how a reviewer can test it." },
      { q: "What makes a review comment actionable?", a: "It points to specific code, says what to change and explains why." },
    ],
  },

  "github-collab/gh-protect": {
    summary:
      "Branch protection and rulesets stop anyone from pushing straight to main. They require reviews and passing checks, and CODEOWNERS automatically requests review from the right people.",
    visuals: [
      {
        type: "sequence",
        title: "Merging into protected main",
        actors: ["Developer", "GitHub", "CI", "Code owner"],
        messages: [
          { from: 0, to: 1, label: "Open PR to main" },
          { from: 1, to: 2, label: "Trigger required checks" },
          { from: 1, to: 3, label: "Request review via CODEOWNERS" },
          { from: 2, to: 1, label: "Checks passed" },
          { from: 3, to: 1, label: "Approve" },
          { from: 1, to: 0, label: "Merge button enabled" },
        ],
      },
    ],
    keyPoints: [
      "Protect main so changes land only through reviewed pull requests.",
      "Mark CI jobs as required status checks so failing code cannot merge.",
      "Rulesets can target many branches and stack, with explicit bypass lists.",
      "In CODEOWNERS the last matching pattern wins, so put broad rules first.",
    ],
    terms: [
      { term: "Branch protection", meaning: "Rules that restrict how a branch can be changed." },
      { term: "Ruleset", meaning: "Named set of rules for branches or tags, with bypass control." },
      { term: "Status check", meaning: "A CI result reported on a commit or PR." },
      { term: "CODEOWNERS", meaning: "File mapping paths to required reviewers." },
    ],
    example: {
      lang: "text",
      code: "# .github/CODEOWNERS\n*               @acme/backend\n/infra/         @acme/platform\n/.github/       @acme/platform\n/docs/          @acme/docs @alice",
      caption: "Default owners first, specific paths after.",
    },
    pitfalls: [
      "Requiring a check by a job name that never runs, so every PR waits forever.",
      "Letting admins bypass rules by default, which quietly defeats them.",
    ],
    check: [
      { q: "How do you stop merges when tests fail?", a: "Add the test job as a required status check in the branch rule." },
      { q: "If two CODEOWNERS lines match a file, which applies?", a: "The last matching line in the file takes precedence." },
    ],
  },

  "github-collab/gh-cli": {
    summary:
      "The GitHub CLI, gh, brings pull requests, issues and Actions runs to your terminal. It saves context switching and makes GitHub tasks easy to script.",
    visuals: [
      {
        type: "flow",
        title: "A PR without leaving the terminal",
        steps: [
          { label: "gh auth login", detail: "Authenticate once through the browser or a token." },
          { label: "gh pr create", detail: "Open a PR from the current branch." },
          { label: "gh pr checks", detail: "See CI status for the PR." },
          { label: "gh run watch", detail: "Follow a workflow run live in the terminal." },
          { label: "gh pr merge", detail: "Merge with squash or rebase and delete the branch." },
        ],
      },
    ],
    keyPoints: [
      "gh pr checkout 123 fetches a teammate's PR branch so you can test it locally.",
      "gh run list and gh run view --log-failed find why CI broke.",
      "gh api calls any GitHub REST or GraphQL endpoint with your login.",
      "Most commands accept --json for output you can pipe into scripts.",
    ],
    terms: [
      { term: "gh", meaning: "GitHub's official command-line tool." },
      { term: "gh pr", meaning: "Commands for creating, reviewing and merging pull requests." },
      { term: "gh run", meaning: "Commands for listing, watching and rerunning workflow runs." },
      { term: "gh api", meaning: "Makes authenticated calls to the GitHub API." },
    ],
    example: {
      lang: "bash",
      code: "gh auth login\ngh pr create --fill --base main\ngh pr checks --watch\ngh pr checkout 123\ngh run list --limit 5\ngh run view --log-failed\ngh pr merge --squash --delete-branch\ngh pr list --json number,title --jq '.[].title'",
      caption: "Day-to-day PR and CI work from the terminal.",
    },
    pitfalls: [
      "Running gh in the wrong directory, so it targets a different repo.",
      "Pasting tokens into scripts instead of relying on gh auth.",
    ],
    check: [
      { q: "How do you see why the last CI run failed?", a: "Run gh run view --log-failed to show logs from the failed steps." },
      { q: "How do you test a teammate's PR locally?", a: "Run gh pr checkout with the PR number to fetch and switch to its branch." },
    ],
  },

  "actions-basics/gha-anatomy": {
    summary:
      "A workflow is a YAML file in .github/workflows. Events trigger it, it contains jobs that run on runners, and each job is a list of steps that run commands or reusable actions.",
    visuals: [
      {
        type: "tree",
        title: "Anatomy of a workflow",
        root: ".github/workflows/ci.yml",
        children: [
          { label: "on: events", children: ["push", "pull_request", "workflow_dispatch", "schedule"] },
          { label: "job: test", children: ["runs-on: ubuntu-latest", "step: actions/checkout", "step: run tests"] },
          { label: "job: build", children: ["needs: test", "step: build package"] },
        ],
      },
    ],
    keyPoints: [
      "Jobs run in parallel on separate runners unless linked with needs.",
      "Steps in one job share the same machine and workspace, in order.",
      "uses runs a published action; run executes shell commands.",
      "Write step outputs to $GITHUB_OUTPUT and read them via steps.id.outputs.",
    ],
    terms: [
      { term: "Workflow", meaning: "An automated process defined in one YAML file." },
      { term: "Event", meaning: "Something that triggers a workflow, like push." },
      { term: "Job", meaning: "A group of steps run on one runner." },
      { term: "Step", meaning: "A single command or action inside a job." },
      { term: "Action", meaning: "A reusable unit of work, like actions/checkout." },
    ],
    example: {
      lang: "yaml",
      code: "name: ci\non:\n  push: { branches: [main] }\n  pull_request:\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 22 }\n      - run: npm ci && npm test\n      - id: ver\n        run: echo \"version=$(jq -r .version package.json)\" >> \"$GITHUB_OUTPUT\"\n      - run: echo \"Tested ${{ steps.ver.outputs.version }}\"",
      caption: "Test on push to main and on PRs, then pass a step output.",
    },
    pitfalls: [
      "Placing the YAML outside .github/workflows, so it never runs.",
      "Expecting files from one job to exist in another; jobs do not share disks.",
    ],
    check: [
      { q: "Do two jobs in one workflow run in sequence by default?", a: "No, they run in parallel unless one declares needs on the other." },
      { q: "What is the difference between uses and run?", a: "uses calls a packaged action; run executes shell commands directly." },
    ],
  },

  "actions-basics/gha-matrix": {
    summary:
      "Runners are the machines that execute jobs, either hosted by GitHub or run by you. A matrix fans one job out into many parallel copies, such as every Python version on every OS.",
    visuals: [
      {
        type: "compare",
        title: "Runner types",
        columns: [
          { title: "GitHub-hosted", points: ["Fresh VM every job", "Ubuntu, Windows, macOS", "No maintenance", "Billed by minutes on private repos"] },
          { title: "Self-hosted", points: ["Your machine or cluster", "Custom hardware or network access", "You patch and secure it", "Avoid for public repos"] },
        ],
      },
      {
        type: "tree",
        title: "matrix: os x python = 4 jobs",
        root: "test job",
        children: [
          { label: "ubuntu-latest", children: ["python 3.11", "python 3.12"] },
          { label: "windows-latest", children: ["python 3.11", "python 3.12"] },
        ],
      },
    ],
    keyPoints: [
      "Each matrix combination is its own job running in parallel.",
      "include adds extra combinations or variables; exclude removes specific ones.",
      "fail-fast: true cancels the rest when one combination fails; set false to see all.",
      "Self-hosted runners on public repos can run untrusted code from forks.",
    ],
    terms: [
      { term: "Runner", meaning: "Machine that picks up and executes workflow jobs." },
      { term: "Matrix", meaning: "Set of variables that expands one job into many." },
      { term: "include", meaning: "Adds combinations or extra values to a matrix." },
      { term: "exclude", meaning: "Removes combinations from a matrix." },
      { term: "fail-fast", meaning: "Cancels in-progress matrix jobs after the first failure." },
    ],
    example: {
      lang: "yaml",
      code: "jobs:\n  test:\n    runs-on: ${{ matrix.os }}\n    strategy:\n      fail-fast: false\n      matrix:\n        os: [ubuntu-latest, windows-latest]\n        python: [\"3.11\", \"3.12\"]\n        exclude:\n          - { os: windows-latest, python: \"3.11\" }\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-python@v5\n        with: { python-version: \"${{ matrix.python }}\" }\n      - run: python -m pytest",
      caption: "Three combinations after the exclude, all reported even if one fails.",
    },
    pitfalls: [
      "Writing 3.10 unquoted in YAML, which becomes the number 3.1.",
      "A huge matrix that burns minutes when a few combinations would do.",
    ],
    check: [
      { q: "How many jobs does a 3 by 2 matrix create?", a: "Six jobs, one for each combination, before include or exclude." },
      { q: "Why avoid self-hosted runners on public repos?", a: "Pull requests from forks could run malicious code on your machine." },
    ],
  },

  "actions-basics/gha-secrets": {
    summary:
      "Secrets hold sensitive values like API keys and are masked in logs; variables hold plain configuration. Environments group secrets for one target and can pause deployments until a reviewer approves.",
    visuals: [
      {
        type: "compare",
        title: "Secrets vs variables",
        columns: [
          { title: "Secrets", points: ["Encrypted, write-only in UI", "Masked as *** in logs", "${{ secrets.NAME }}", "API keys, tokens, passwords"] },
          { title: "Variables", points: ["Plain text, readable", "Shown in logs", "${{ vars.NAME }}", "Region, URLs, feature switches"] },
        ],
      },
      {
        type: "sequence",
        title: "Deploy gated by an environment",
        actors: ["Workflow", "GitHub", "Reviewer", "Runner"],
        messages: [
          { from: 0, to: 1, label: "Job uses environment: production" },
          { from: 1, to: 2, label: "Approval requested" },
          { from: 2, to: 1, label: "Approve deployment" },
          { from: 1, to: 3, label: "Start job with prod secrets" },
          { from: 3, to: 1, label: "Deployment status: success" },
        ],
      },
    ],
    keyPoints: [
      "Secrets exist at organization, repository and environment level; the narrowest wins.",
      "Environment secrets are only available to jobs that reference that environment.",
      "Required reviewers and branch rules make production deploys deliberate.",
      "Workflows from forked PRs do not receive your secrets.",
    ],
    terms: [
      { term: "Secret", meaning: "Encrypted value injected into workflows and masked in logs." },
      { term: "Variable", meaning: "Non-sensitive configuration value available as vars.NAME." },
      { term: "Environment", meaning: "A deployment target with its own secrets and protection rules." },
      { term: "Required reviewers", meaning: "People who must approve before an environment job runs." },
    ],
    example: {
      lang: "yaml",
      code: "jobs:\n  deploy:\n    runs-on: ubuntu-latest\n    environment: production\n    steps:\n      - run: ./deploy.sh --region \"${{ vars.AWS_REGION }}\"\n        env:\n          API_TOKEN: ${{ secrets.API_TOKEN }}",
      caption: "Pauses for approval, then gets production's secrets.",
    },
    pitfalls: [
      "Echoing transformed secrets, like base64, which are no longer masked.",
      "Putting production secrets at repo level, available to every workflow.",
    ],
    check: [
      { q: "When should a value be a variable instead of a secret?", a: "When it is not sensitive, like a region or URL, and readable logs help debugging." },
      { q: "How do you require approval before deploying to production?", a: "Create a production environment with required reviewers and reference it in the job." },
    ],
  },

  "actions-basics/gha-cache": {
    summary:
      "Caches reuse files like downloaded dependencies across workflow runs to save time. Artifacts are files a run produces, such as build output or reports, shared between jobs or downloaded later.",
    visuals: [
      {
        type: "cycle",
        title: "Cache across runs",
        steps: [
          { label: "Compute key", detail: "OS plus a hash of the lockfile." },
          { label: "Restore", detail: "Exact key hit, or nearest restore-keys match." },
          { label: "Install deps", detail: "Fast when cached; only missing pieces download." },
          { label: "Save on miss", detail: "New key saved at job end for next run." },
        ],
      },
      {
        type: "compare",
        title: "Cache vs artifact",
        columns: [
          { title: "Cache", points: ["Speeds up later runs", "Dependencies, build caches", "Keyed and may be evicted", "Not for build outputs"] },
          { title: "Artifact", points: ["Output of this run", "Pass files between jobs", "Download from run page", "Kept for a retention period"] },
        ],
      },
    ],
    keyPoints: [
      "Base cache keys on lockfile hashes so they change only when dependencies change.",
      "setup-node, setup-python and others have a built-in cache option.",
      "Use upload-artifact and download-artifact to hand files from build to deploy jobs.",
      "A cache miss must still work; caches are a speed-up, not a guarantee.",
    ],
    terms: [
      { term: "Cache key", meaning: "String identifying a cache entry, often with a file hash." },
      { term: "restore-keys", meaning: "Fallback prefixes used when the exact key is missing." },
      { term: "Artifact", meaning: "Files uploaded from a run for other jobs or people." },
      { term: "hashFiles", meaning: "Expression that hashes files to build cache keys." },
    ],
    example: {
      lang: "yaml",
      code: "  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/cache@v4\n        with:\n          path: ~/.cache/pip\n          key: pip-${{ runner.os }}-${{ hashFiles('requirements.txt') }}\n          restore-keys: pip-${{ runner.os }}-\n      - run: pip install -r requirements.txt && python -m build\n      - uses: actions/upload-artifact@v4\n        with: { name: dist, path: dist/ }",
      caption: "Cache pip downloads, then upload the built package for a later job.",
    },
    pitfalls: [
      "Caching build outputs instead of passing them as artifacts between jobs.",
      "A static cache key that never changes, so new dependencies are never saved.",
    ],
    check: [
      { q: "Why include hashFiles of the lockfile in a cache key?", a: "The key changes when dependencies change, so a fresh cache is saved." },
      { q: "How does a deploy job get files built by an earlier job?", a: "The build job uploads an artifact and the deploy job downloads it." },
    ],
  },

  "actions-advanced/gha-reuse": {
    summary:
      "Reusable workflows let many repos call one shared pipeline, while composite actions bundle several steps into one reusable step. Both stop you copying the same YAML everywhere.",
    visuals: [
      {
        type: "compare",
        title: "Two ways to reuse",
        columns: [
          { title: "Reusable workflow", points: ["Triggered by workflow_call", "Called at job level with uses", "Can contain many jobs", "Takes inputs and secrets"] },
          { title: "Composite action", points: ["runs: using: composite", "Called as a step with uses", "Bundles several steps", "Runs inside the caller's job"] },
        ],
      },
    ],
    keyPoints: [
      "Use a reusable workflow to standardise a whole pipeline across repos.",
      "Use a composite action for a small repeated sequence of steps.",
      "Pass secrets explicitly, or with secrets: inherit inside the same organization.",
      "Reference shared workflows by tag or commit SHA so updates are deliberate.",
    ],
    terms: [
      { term: "workflow_call", meaning: "Trigger that makes a workflow callable by others." },
      { term: "Caller workflow", meaning: "The workflow that uses a reusable workflow." },
      { term: "Composite action", meaning: "An action made of steps, defined in action.yml." },
      { term: "secrets: inherit", meaning: "Passes all the caller's secrets to the called workflow." },
    ],
    example: {
      lang: "yaml",
      code: "# acme/shared/.github/workflows/python-ci.yml\non:\n  workflow_call:\n    inputs:\n      python-version: { type: string, default: \"3.12\" }\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps: [{ uses: actions/checkout@v4 }, { run: pytest }]\n\n# caller repo\njobs:\n  ci:\n    uses: acme/shared/.github/workflows/python-ci.yml@v1\n    with: { python-version: \"3.13\" }",
      caption: "One shared CI workflow, called with an input.",
    },
    pitfalls: [
      "Pointing at @main of a shared workflow, so a change breaks every repo at once.",
      "Forgetting shell: on run steps in a composite action, which is required.",
    ],
    check: [
      { q: "Where in the caller is a reusable workflow referenced?", a: "At the job level, with uses instead of runs-on and steps." },
      { q: "When is a composite action the better choice?", a: "When you only need to reuse a few steps inside existing jobs." },
    ],
  },

  "actions-advanced/gha-custom": {
    summary:
      "A custom action packages logic behind a simple interface of inputs and outputs, defined in action.yml. JavaScript actions start fastest, Docker actions bring any toolchain, and composite actions just chain steps.",
    visuals: [
      {
        type: "compare",
        title: "Action types",
        columns: [
          { title: "JavaScript", points: ["Runs on Node directly", "Fast startup", "All runner OSes", "Use @actions/core toolkit"] },
          { title: "Docker", points: ["Runs in a container", "Any language or tools", "Linux runners only", "Slower to start"] },
          { title: "Composite", points: ["A list of steps", "No build needed", "Calls other actions", "Good for glue"] },
        ],
      },
      {
        type: "flow",
        title: "Build and publish a JS action",
        steps: [
          { label: "Write action.yml", detail: "Name, inputs, outputs and runs entry point." },
          { label: "Code with toolkit", detail: "getInput, setOutput and setFailed from @actions/core." },
          { label: "Bundle to dist", detail: "Compile code and dependencies into one file." },
          { label: "Test in workflow", detail: "uses: ./ runs it from the same repo." },
          { label: "Tag a release", detail: "Push v1.0.0 and move the v1 tag." },
        ],
      },
    ],
    keyPoints: [
      "action.yml declares inputs, outputs and how the action runs.",
      "Commit the bundled dist file; runners do not install your node_modules.",
      "Fail clearly with core.setFailed so the step and job turn red.",
      "Publish semver tags and a moving major tag like v1 for users.",
    ],
    terms: [
      { term: "action.yml", meaning: "Metadata file defining an action's interface and runtime." },
      { term: "@actions/core", meaning: "Toolkit package for inputs, outputs, logs and failures." },
      { term: "Bundling", meaning: "Combining code and dependencies into one distributable file." },
      { term: "Major tag", meaning: "A tag like v1 moved to the latest compatible release." },
    ],
    example: {
      lang: "yaml",
      code: "# action.yml\nname: greet\ndescription: Say hello and output the time\ninputs:\n  who: { description: Name to greet, required: true }\noutputs:\n  time: { description: When we greeted }\nruns:\n  using: node24\n  main: dist/index.js\n\n# src/index.js\n# const core = require(\"@actions/core\");\n# core.info(`Hello ${core.getInput(\"who\")}`);\n# core.setOutput(\"time\", new Date().toISOString());",
      caption: "Metadata plus the core of a JavaScript action.",
    },
    pitfalls: [
      "Forgetting to rebuild dist before tagging, so users run old code.",
      "Choosing a Docker action when users need Windows or macOS runners.",
    ],
    check: [
      { q: "Why must a JavaScript action commit its bundled code?", a: "The runner downloads the repo and runs the entry file without installing dependencies." },
      { q: "What is a Docker action's main limitation?", a: "It only runs on Linux runners and starts slower because the image must be built or pulled." },
    ],
  },

  "actions-advanced/gha-oidc": {
    summary:
      "With OIDC, a workflow proves its identity to a cloud provider using a short-lived token signed by GitHub. The cloud trusts that token and returns temporary credentials, so no long-lived keys are stored in secrets.",
    visuals: [
      {
        type: "sequence",
        title: "OIDC login to AWS",
        actors: ["Workflow job", "GitHub OIDC", "AWS STS", "AWS service"],
        messages: [
          { from: 0, to: 1, label: "Request ID token" },
          { from: 1, to: 0, label: "Signed JWT with repo and ref" },
          { from: 0, to: 2, label: "AssumeRoleWithWebIdentity" },
          { from: 2, to: 0, label: "Trust policy OK: temp credentials" },
          { from: 0, to: 3, label: "Deploy using temporary creds" },
        ],
      },
    ],
    keyPoints: [
      "The job needs permissions: id-token: write to request an OIDC token.",
      "The cloud trust policy should match the sub claim to your repo and branch or environment.",
      "Credentials expire on their own, so there is nothing to rotate or leak.",
      "AWS, Azure and Google Cloud all support this via official login actions.",
    ],
    terms: [
      { term: "OIDC", meaning: "OpenID Connect, a standard for proving identity with signed tokens." },
      { term: "ID token", meaning: "A signed JWT describing who the workflow is." },
      { term: "sub claim", meaning: "Token field such as repo:acme/api:ref:refs/heads/main." },
      { term: "Trust policy", meaning: "Cloud rule saying which tokens may assume a role." },
      { term: "STS", meaning: "AWS Security Token Service, which issues temporary credentials." },
    ],
    example: {
      lang: "yaml",
      code: "permissions:\n  id-token: write\n  contents: read\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    environment: production\n    steps:\n      - uses: aws-actions/configure-aws-credentials@v4\n        with:\n          role-to-assume: arn:aws:iam::123456789012:role/gha-deploy\n          aws-region: us-east-1\n      - run: aws s3 sync ./site s3://acme-site --delete",
      caption: "No AWS keys in secrets: the role is assumed via OIDC.",
    },
    pitfalls: [
      "A trust policy matching repo:acme/* lets every repo in the org assume the role.",
      "Forgetting id-token: write, which makes the token request fail.",
    ],
    check: [
      { q: "Why is OIDC safer than storing access keys?", a: "Credentials are short-lived and issued per run, so there is no static key to steal." },
      { q: "What stops another repo from using your AWS role?", a: "The trust policy only accepts tokens whose sub claim matches your repo and branch or environment." },
    ],
  },

  "actions-advanced/gha-release": {
    summary:
      "Release automation turns a version tag into a changelog, a GitHub Release and published packages or images. Semantic versions tell users whether an upgrade is safe.",
    visuals: [
      {
        type: "flow",
        title: "Tag to published release",
        steps: [
          { label: "Merge to main", detail: "Conventional commit messages like feat: and fix:." },
          { label: "Push tag v1.4.0", detail: "Major.minor.patch based on the changes." },
          { label: "Workflow triggers", detail: "on: push: tags: ['v*']" },
          { label: "Generate notes", detail: "Changelog built from merged PRs and commits." },
          { label: "Publish", detail: "Package to GitHub Packages, image to GHCR." },
          { label: "GitHub Release", detail: "Notes plus attached build files." },
        ],
      },
    ],
    keyPoints: [
      "Bump major for breaking changes, minor for features, patch for fixes.",
      "Tools like release-please or semantic-release derive versions from commit messages.",
      "GITHUB_TOKEN with packages: write can push to GHCR without a personal token.",
      "Build once per tag so the release, package and image all match.",
    ],
    terms: [
      { term: "Semantic versioning", meaning: "MAJOR.MINOR.PATCH numbers that signal compatibility." },
      { term: "Conventional commits", meaning: "Commit format like feat: or fix: that tools can parse." },
      { term: "GitHub Release", meaning: "A tag with notes and downloadable assets on GitHub." },
      { term: "GHCR", meaning: "GitHub Container Registry, part of GitHub Packages." },
    ],
    example: {
      lang: "yaml",
      code: "on: { push: { tags: [\"v*\"] } }\npermissions: { contents: write, packages: write }\njobs:\n  release:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: echo \"${{ secrets.GITHUB_TOKEN }}\" | docker login ghcr.io -u ${{ github.actor }} --password-stdin\n      - run: docker build -t ghcr.io/${{ github.repository }}:${{ github.ref_name }} .\n      - run: docker push ghcr.io/${{ github.repository }}:${{ github.ref_name }}\n      - run: gh release create ${{ github.ref_name }} --generate-notes\n        env: { GH_TOKEN: \"${{ github.token }}\" }",
      caption: "A tag push builds, pushes to GHCR and creates the release.",
    },
    pitfalls: [
      "Re-tagging a published version with different code, confusing every user.",
      "Messy commit messages that make generated changelogs useless.",
    ],
    check: [
      { q: "A release removes an API endpoint. Which number changes?", a: "The major version, because it is a breaking change." },
      { q: "What permission lets GITHUB_TOKEN push images to GHCR?", a: "packages: write in the workflow or job permissions." },
    ],
  },

  "actions-advanced/gha-security": {
    summary:
      "Workflows run with a GITHUB_TOKEN and can pull in third-party code, so they need guarding like production. Least-privilege permissions, Dependabot and CodeQL cover the main risks.",
    visuals: [
      {
        type: "layers",
        title: "Layers of workflow security",
        layers: [
          { label: "Least-privilege token", detail: "Default permissions: contents: read; add more per job." },
          { label: "Pinned actions", detail: "Third-party actions pinned to a full commit SHA." },
          { label: "Dependabot", detail: "Alerts and update PRs for vulnerable dependencies and actions." },
          { label: "CodeQL scanning", detail: "Finds bugs like injection in your own code." },
          { label: "Branch protection", detail: "Workflow changes need review before they run on main." },
        ],
      },
    ],
    keyPoints: [
      "Set permissions at the top of each workflow and widen only for jobs that need it.",
      "Pin third-party actions to a commit SHA; tags can be moved by their owner.",
      "Dependabot can update the github-actions ecosystem as well as package managers.",
      "Never interpolate untrusted input like PR titles directly into run scripts.",
    ],
    terms: [
      { term: "GITHUB_TOKEN", meaning: "Automatic per-run token with configurable permissions." },
      { term: "Dependabot", meaning: "GitHub bot that alerts on and updates vulnerable dependencies." },
      { term: "CodeQL", meaning: "GitHub's code analysis engine for finding security bugs." },
      { term: "SHA pinning", meaning: "Referencing an action by exact commit instead of a tag." },
      { term: "Script injection", meaning: "Untrusted text executed as shell code in a run step." },
    ],
    example: {
      lang: "yaml",
      code: "# .github/dependabot.yml\nversion: 2\nupdates:\n  - package-ecosystem: pip\n    directory: \"/\"\n    schedule: { interval: weekly }\n  - package-ecosystem: github-actions\n    directory: \"/\"\n    schedule: { interval: weekly }\n\n# top of every workflow\npermissions:\n  contents: read",
      caption: "Weekly update PRs plus a read-only default token.",
    },
    pitfalls: [
      "Using run: echo \"${{ github.event.pull_request.title }}\", which allows injection.",
      "Granting write-all permissions because one step needed to comment on a PR.",
    ],
    check: [
      { q: "Why pin actions to a SHA instead of a tag like v4?", a: "A tag can be moved to malicious code; a commit SHA cannot change." },
      { q: "What does CodeQL add beyond Dependabot?", a: "It analyses your own code for vulnerabilities, while Dependabot covers dependencies." },
    ],
  },

  "gh-project/gh-capstone": {
    summary:
      "The project combines everything into one repo: protected main, CI on every PR, automated releases and an OIDC deployment behind an approval gate, all documented in the README.",
    visuals: [
      {
        type: "flow",
        title: "End-to-end pipeline",
        steps: [
          { label: "Open pull request", detail: "CODEOWNERS review requested automatically." },
          { label: "CI checks", detail: "Lint and tests across a small matrix." },
          { label: "Merge to main", detail: "Allowed only with approval and green checks." },
          { label: "Release", detail: "Version tag, changelog and image pushed to GHCR." },
          { label: "Deploy staging", detail: "OIDC login, automatic deploy, smoke test." },
          { label: "Approve production", detail: "Environment reviewers approve the same image." },
        ],
      },
      {
        type: "tree",
        title: "Files that make it work",
        root: ".github/",
        children: [
          { label: "CODEOWNERS", children: ["Required reviewers by path"] },
          { label: "dependabot.yml", children: ["Weekly dependency updates"] },
          { label: "workflows/", children: ["ci.yml", "release.yml", "deploy.yml"] },
        ],
      },
    ],
    keyPoints: [
      "Build order: protection rules, CI, release automation, then deployment.",
      "Deploy the image built at release time; never rebuild per environment.",
      "Use OIDC and environments so production needs no stored keys and a human approval.",
      "The README should show the pipeline and how to cut a release.",
    ],
    terms: [
      { term: "Pipeline", meaning: "The automated path from pull request to production." },
      { term: "Environment gate", meaning: "Approval rule that pauses a deploy job." },
      { term: "Smoke test", meaning: "Quick check that a deployment basically works." },
      { term: "Promotion", meaning: "Moving the same build from staging to production." },
    ],
    example: {
      lang: "yaml",
      code: "# deploy.yml\non: { release: { types: [published] } }\npermissions: { id-token: write, contents: read }\njobs:\n  staging:\n    uses: ./.github/workflows/deploy-env.yml\n    with: { environment: staging, tag: \"${{ github.event.release.tag_name }}\" }\n  production:\n    needs: staging\n    uses: ./.github/workflows/deploy-env.yml\n    with: { environment: production, tag: \"${{ github.event.release.tag_name }}\" }",
      caption: "One release deploys to staging, then waits for production approval.",
    },
    pitfalls: [
      "Starting with deployment before CI is reliable, so broken code ships faster.",
      "Allowing admins to bypass protection, making the gates optional.",
    ],
    check: [
      { q: "Why deploy the same image to staging and production?", a: "So production runs exactly what was tested in staging." },
      { q: "What stops an unreviewed change reaching production?", a: "Protected main with required reviews, plus a production environment that needs approval." },
    ],
  },
};

export default explainers;

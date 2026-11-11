import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "actions-basics/gha-anatomy": {
    plain: [
      "GitHub Actions is a robot that does work for you whenever something happens in your repo. You describe the work in a YAML file inside .github/workflows. When the event you chose happens, such as a push or a new pull request, GitHub starts a fresh machine and follows your instructions.",
      "The file has a simple shape. on: says which events start it. jobs: lists the pieces of work. Each job says which kind of machine to use (runs-on) and lists steps. A step either runs shell commands (run:) or uses a ready-made action from the Marketplace (uses:), like actions/checkout, which downloads your code onto the machine.",
      "The machine is called a runner. GitHub gives you a clean one for every job and throws it away afterwards. That is great for reliability, because nothing is left over from yesterday, but it also means jobs cannot share files on disk. You pass data between them on purpose.",
      "Every run shows up on the Actions tab with live logs, and on pull requests as a green tick or red cross. Most teams start with one workflow: on every pull request, install dependencies and run the tests. That alone catches a huge number of bugs before they reach main.",
    ],
    deepDive: [
      {
        heading: "Events and filters",
        body: "push runs when commits are pushed, and you can limit it with branches, tags and paths filters, for example only when files in src/ change. pull_request runs by default for the activity types opened, synchronize (new commits pushed) and reopened. It tests the merge result: GitHub checks out refs/pull/N/merge, a temporary merge of the PR into its base, so you test what main would look like after merging.\n\nworkflow_dispatch adds a Run workflow button with typed inputs. schedule takes cron syntax in UTC; the shortest interval is every 5 minutes, runs can be delayed when GitHub is busy, and scheduled workflows only run from the default branch. In public repos, scheduled workflows are disabled automatically after 60 days without repository activity.",
        bullets: [
          "pull_request from a fork gets a read-only token and no secrets",
          "A paths-ignore filter skips runs when only docs files change",
          "workflow_dispatch and schedule workflows must exist on the default branch",
        ],
      },
      {
        heading: "What happens when a run starts",
        body: "When an event fires, GitHub reads the workflow files at that commit, checks each file's on: section and filters, and creates a run for every match. Jobs with no needs are queued at once; the rest wait for their dependencies. A runner with matching labels picks up each job.\n\nFor every job, GitHub creates a fresh GITHUB_TOKEN with the permissions you set, downloads the actions the job uses, and then runs the steps in order. If a step fails, later steps are skipped unless they use if: always() or failure(). A job on a GitHub-hosted runner may run for at most 6 hours; the default timeout-minutes is 360, and setting a lower one stops a stuck job from burning minutes.",
        visual: {
          type: "flow",
          title: "From event to green tick",
          steps: [
            { label: "Event fires", detail: "push, pull_request, schedule, manual" },
            { label: "Match workflows", detail: "on: section and filters at that commit" },
            { label: "Queue jobs", detail: "needs decides the order" },
            { label: "Runner picks up job", detail: "Fresh VM and a new GITHUB_TOKEN" },
            { label: "Run steps", detail: "In order; a failure skips the rest" },
            { label: "Report", detail: "Logs, check status on commit and PR" },
          ],
        },
      },
      {
        heading: "Expressions, contexts and conditions",
        body: "Anything inside ${{ }} is an expression, evaluated before the step runs. Contexts are the objects you can read: github (event, ref, sha, actor), env, vars, secrets, inputs, matrix, steps, needs, runner and job. Functions include contains, startsWith, format, toJSON, fromJSON and hashFiles.\n\nif: conditions are expressions too, and the ${{ }} is optional there: if: github.ref == 'refs/heads/main'. Every step and job has an implicit success() check. Use always() to run cleanup no matter what, failure() to send an alert only when something broke, and cancelled() to react to cancellations. One more surprise: each run: step is a new shell process, so a cd or a shell variable does not carry over to the next step.",
        bullets: [
          "Default shell on Linux and macOS: bash -e (stops on the first failing command)",
          "shell: bash adds -o pipefail, so a failing command in a pipe also fails the step",
          "defaults: run: working-directory: app sets the folder for every run step",
        ],
      },
      {
        heading: "Passing data between steps and jobs",
        body: "Inside a job, steps share the workspace, so files written by one step are there for the next. For values, write name=value lines to the file in $GITHUB_OUTPUT and read them as steps.ID.outputs.name. To set an environment variable for all later steps, append NAME=value to $GITHUB_ENV. To add a folder to PATH, append it to $GITHUB_PATH. Markdown appended to $GITHUB_STEP_SUMMARY appears on the run's summary page.\n\nBetween jobs, map step outputs to job outputs, then read them in another job as needs.JOB.outputs.name. Job outputs are strings, limited to 1 MB per job, and are meant for small values like a version or a tag. For files, upload an artifact in one job and download it in the next.",
        visual: {
          type: "tree",
          title: "Where data can travel",
          root: "A workflow run",
          children: [
            { label: "Step to step (same job)", children: ["Files in the workspace", "$GITHUB_OUTPUT values", "$GITHUB_ENV variables", "$GITHUB_PATH entries"] },
            { label: "Job to job", children: ["Job outputs via needs", "Artifacts for files"] },
            { label: "Run to run", children: ["Caches", "Artifacts by run ID", "Releases and packages"] },
            { label: "To people", children: ["Logs", "$GITHUB_STEP_SUMMARY", "Check status on the PR"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A push to a pull request branch",
        actors: ["Developer", "GitHub", "Runner"],
        messages: [
          { from: 0, to: 1, label: "git push to feature branch" },
          { from: 1, to: 1, label: "pull_request synchronize matches ci.yml" },
          { from: 1, to: 2, label: "Job assigned with a fresh token" },
          { from: 2, to: 1, label: "Checkout, install, test; stream logs" },
          { from: 2, to: 1, label: "Job result: success" },
          { from: 1, to: 0, label: "Green check on the pull request" },
        ],
      },
    ],
    examples: [
      {
        title: "Compute a version once, use it in two jobs",
        explanation: "Your build job and your docker job both need the same version string. Step 1: a version job writes it to $GITHUB_OUTPUT. Step 2: the job maps that step output to a job output. Step 3: the other jobs declare needs: version and read needs.version.outputs.tag. Both later jobs run in parallel and are guaranteed to use the same value.",
        code: {
          lang: "yaml",
          code: `jobs:
  version:
    runs-on: ubuntu-latest
    outputs:
      tag: \${{ steps.v.outputs.tag }}
    steps:
      - id: v
        run: echo "tag=1.0.\${{ github.run_number }}" >> "$GITHUB_OUTPUT"
  build:
    needs: version
    runs-on: ubuntu-latest
    steps:
      - run: echo "Building \${{ needs.version.outputs.tag }}"
  docker:
    needs: version
    runs-on: ubuntu-latest
    steps:
      - run: echo "Tagging image \${{ needs.version.outputs.tag }}"`,
        },
      },
      {
        title: "Stop wasting minutes on outdated runs",
        explanation: "Developers push to a PR five times in ten minutes, and five CI runs pile up. Step 1: add a concurrency group per workflow and branch. Step 2: set cancel-in-progress so a new push cancels the older run on the same branch. Step 3: add a timeout so a hung test cannot run for 6 hours. Step 4: add workflow_dispatch so you can also start it by hand.",
        code: {
          lang: "yaml",
          code: `name: ci
on:
  pull_request:
  push: { branches: [main] }
  workflow_dispatch:
concurrency:
  group: ci-\${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - run: make test`,
        },
      },
    ],
    cheatSheet: [
      "pull_request default types: opened, synchronize, reopened",
      "echo \"name=value\" >> \"$GITHUB_OUTPUT\" sets a step output; read it as steps.ID.outputs.name",
      "echo \"NAME=value\" >> \"$GITHUB_ENV\" sets an env var for all later steps in the job",
      "if: always() runs a step even after failures; if: failure() only after one",
      "timeout-minutes defaults to 360; set it lower on every job",
      "concurrency with cancel-in-progress: true cancels older runs in the same group",
      "schedule cron is UTC, runs only on the default branch, minimum every 5 minutes",
      "Each run: step is a new shell; cd and shell variables do not carry over",
    ],
    quiz: [
      {
        q: "Which commit does a pull_request workflow test by default?",
        options: ["The base branch tip", "The first commit of the PR", "A temporary merge of the PR into its base branch", "The last commit on main"],
        answer: 2,
        why: "GitHub checks out refs/pull/N/merge, the would-be merge result.",
      },
      {
        q: "Step 1 runs cd app. Step 2 runs npm test. Where does npm test run?",
        options: ["In the workspace root, because each step is a new shell", "In app/", "In the home folder", "It fails because cd is not allowed"],
        answer: 0,
        why: "Each run step starts a new shell process in the default working directory.",
      },
      {
        q: "How does job B read a value produced by a step in job A?",
        options: ["steps.A.outputs.value", "env.value", "Read a file job A wrote to disk", "needs.A.outputs.value, after A maps the step output to a job output"],
        answer: 3,
        why: "Jobs run on different machines, so values travel through job outputs and needs.",
      },
      {
        q: "A cleanup step must run even if the tests failed. What do you add?",
        options: ["continue-on-error: true on the cleanup", "if: always()", "needs: test", "timeout-minutes: 0"],
        answer: 1,
        why: "always() overrides the implicit success() check on the step.",
      },
      {
        q: "You add a schedule trigger on a feature branch, but it never runs. Why?",
        options: ["Cron must be in local time", "Schedules need a self-hosted runner", "Scheduled workflows only run from the default branch", "Schedules only work in private repos"],
        answer: 2,
        why: "GitHub only runs schedule triggers from workflow files on the default branch.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a workflow that runs on every pull request and on pushes to main, checks out the code and prints the event name and the commit SHA.",
        hint: "Use the github context: github.event_name and github.sha.",
        solution: `name: hello
on:
  pull_request:
  push: { branches: [main] }
jobs:
  info:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Event \${{ github.event_name }} at \${{ github.sha }}"`,
      },
      {
        level: "medium",
        task: "Add a manual trigger with a choice input called level (debug or info) and print it. Also write a line to the job summary.",
        hint: "workflow_dispatch inputs support type: choice; read them as inputs.level.",
        solution: `on:
  workflow_dispatch:
    inputs:
      level: { type: choice, options: [debug, info], default: info }
jobs:
  show:
    runs-on: ubuntu-latest
    steps:
      - run: |
          echo "Level is \${{ inputs.level }}"
          echo "### Ran with level \${{ inputs.level }}" >> "$GITHUB_STEP_SUMMARY"`,
      },
      {
        level: "hard",
        task: "Create two jobs, lint and test, that run in parallel, and a third job notify that runs only if either one failed.",
        hint: "notify needs both, and needs a condition that runs on failure instead of the implicit success().",
        solution: `jobs:
  lint: { runs-on: ubuntu-latest, steps: [{ run: echo lint }] }
  test: { runs-on: ubuntu-latest, steps: [{ run: exit 1 }] }
  notify:
    needs: [lint, test]
    if: failure()
    runs-on: ubuntu-latest
    steps:
      - run: echo "lint=\${{ needs.lint.result }} test=\${{ needs.test.result }}"`,
      },
    ],
    faq: [
      { q: "Is GitHub Actions free?", a: "Public repositories get free minutes on standard GitHub-hosted runners. Private repositories get a monthly allowance of minutes and storage that depends on the plan, then pay per minute." },
      { q: "What is the difference between an action and a workflow?", a: "A workflow is your whole automation file with events and jobs. An action is a reusable building block, like actions/checkout, that you call from a step." },
      { q: "Why does my workflow not appear in the Actions tab?", a: "The file must be in .github/workflows with a .yml or .yaml extension and valid YAML. If it has a syntax error, GitHub shows the error on the Actions tab instead of running it." },
      { q: "Can I run GitHub Actions locally?", a: "Not officially. The community tool act runs many workflows in Docker on your machine, but it does not perfectly match GitHub-hosted runners." },
    ],
  },

  "actions-basics/gha-matrix": {
    plain: [
      "A runner is the computer that runs your job. GitHub-hosted runners are virtual machines that GitHub starts for you: Linux, Windows or macOS, with many tools already installed. Self-hosted runners are machines you own and connect to GitHub, such as a server in your data centre or a box with a GPU.",
      "A matrix is a shortcut for testing many setups. Instead of writing one job for Python 3.12 on Linux, another for 3.13 on Linux, and so on, you list the values once. GitHub creates every combination and runs them all at the same time.",
      "Why bother? Your users run different versions and operating systems. A bug that only appears on Windows, or only on the newest Node version, is cheap to catch in CI and expensive to catch in production.",
      "Matrices also need control. You can leave out combinations that do not make sense (exclude), add special ones (include), and decide whether one failure should cancel the rest (fail-fast). Each combination costs runner minutes, so test what matters, not everything.",
    ],
    deepDive: [
      {
        heading: "GitHub-hosted runners in practice",
        body: "Each job gets a brand-new virtual machine that is destroyed afterwards. Common labels are ubuntu-latest (currently Ubuntu 24.04), ubuntu-24.04-arm for ARM64, windows-latest and macos-latest. The -latest labels move to new OS versions over time, so pin a version like ubuntu-24.04 if a change in the image would break you. The installed software for each image is listed in the actions/runner-images repository.\n\nPublic repositories use standard runners for free. Private repositories spend included minutes, and Windows and macOS minutes cost more than Linux minutes, so run most of your matrix on Linux. Larger runners with more CPU, more memory or GPUs are available on paid plans.",
        bullets: [
          "runner.os is Linux, Windows or macOS inside a job",
          "Pin ubuntu-24.04 instead of ubuntu-latest for reproducible builds",
          "Hosted runners give you passwordless sudo, and Docker on Linux images",
        ],
      },
      {
        heading: "How self-hosted runners connect",
        body: "A self-hosted runner is a small agent program you install from Settings, Actions, Runners. ./config.sh registers it with a short-lived token, and ./run.sh (or ./svc.sh install for a service) starts it. The runner opens an outbound HTTPS connection and long-polls GitHub for work, so you do not need to open any inbound ports.\n\nRunners get default labels such as self-hosted, linux and x64, plus custom ones like gpu. runs-on: [self-hosted, linux, gpu] picks a runner that has all of those labels. A normal self-hosted runner keeps its disk between jobs, which can leak files or secrets from one job to the next. Use --ephemeral so it takes one job and then unregisters, or run autoscaling ephemeral runners on Kubernetes with Actions Runner Controller.",
        visual: {
          type: "sequence",
          title: "An ephemeral self-hosted runner",
          actors: ["Runner agent", "GitHub", "Workflow job"],
          messages: [
            { from: 0, to: 1, label: "Register with labels (config.sh --ephemeral)" },
            { from: 0, to: 1, label: "Long-poll over HTTPS: any work?" },
            { from: 1, to: 0, label: "Job matching [self-hosted, linux, gpu]" },
            { from: 0, to: 2, label: "Run steps on this machine" },
            { from: 0, to: 1, label: "Upload logs and result" },
            { from: 0, to: 1, label: "Unregister; machine is recycled" },
          ],
        },
      },
      {
        heading: "How include and exclude really work",
        body: "GitHub first builds every combination of the matrix lists, then removes the ones that match an exclude entry, then processes include. For each include entry, GitHub tries to add its keys to existing combinations, but only where doing so would not overwrite any original matrix value. If the entry fits nowhere, it becomes a new combination of its own.\n\nSo include: [{ python: \"3.13\", coverage: true }] adds coverage: true to every combination that already has python 3.13. include: [{ os: macos-latest, python: \"3.13\" }] with no macOS in the matrix creates one extra job. A single matrix can generate at most 256 jobs per workflow run.",
        visual: {
          type: "flow",
          title: "Expanding a matrix",
          steps: [
            { label: "Cross product", detail: "Every value of every list" },
            { label: "Apply exclude", detail: "Remove matching combinations" },
            { label: "Apply include", detail: "Add keys, or add new combinations" },
            { label: "Schedule jobs", detail: "Up to max-parallel at once" },
            { label: "Report checks", detail: "One check per combination" },
          ],
        },
      },
      {
        heading: "fail-fast, max-parallel and dynamic matrices",
        body: "fail-fast is true by default: when one matrix job fails, GitHub cancels the ones still running. That saves minutes but hides whether the failure is everywhere or only on one OS, so many teams set fail-fast: false. max-parallel limits how many matrix jobs run at once, useful when tests hit a shared test server. continue-on-error: true on a job lets a combination fail without failing the run, perfect for a pre-release version you only want to watch.\n\nThe matrix does not have to be written by hand. A first job can output a JSON array and the matrix can read it with fromJSON(needs.plan.outputs.list). This is how monorepos test only the packages that changed. Guard against an empty list, because an empty matrix makes the job fail.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Choosing where jobs run",
        columns: [
          { title: "Standard hosted", points: ["Zero setup", "Clean VM every job", "Linux, Windows, macOS", "Free for public repos"] },
          { title: "Larger hosted", points: ["More CPU, RAM or a GPU", "Still managed by GitHub", "Paid per minute", "Good for heavy builds"] },
          { title: "Self-hosted", points: ["Your hardware and network", "Reach private services", "You patch and secure it", "Use ephemeral runners"] },
        ],
      },
    ],
    examples: [
      {
        title: "A focused matrix with one extra job",
        explanation: "You support Python 3.12 and 3.13 on Linux, want coverage measured once, and want to watch macOS without blocking merges. Step 1: list python versions and one OS. Step 2: an include entry adds coverage: true to the 3.13 job. Step 3: another include entry creates a new macOS job marked experimental. Step 4: continue-on-error reads that flag, and fail-fast is off so every result is visible. Result: three jobs.",
        code: {
          lang: "yaml",
          code: `jobs:
  test:
    runs-on: \${{ matrix.os }}
    continue-on-error: \${{ matrix.experimental == true }}
    strategy:
      fail-fast: false
      matrix:
        python: ["3.12", "3.13"]
        os: [ubuntu-latest]
        include:
          - { python: "3.13", coverage: true }
          - { python: "3.13", os: macos-latest, experimental: true }
    steps:
      - uses: actions/checkout@v4
      - run: echo "py=\${{ matrix.python }} cov=\${{ matrix.coverage }}"`,
        },
      },
      {
        title: "A dynamic matrix for a monorepo",
        explanation: "Your repo has a services/ folder with one subfolder per service. Step 1: a plan job lists the folders and turns them into a JSON array with jq. Step 2: it exposes the array as a job output. Step 3: the test job builds its matrix with fromJSON, so adding a new service folder adds a new test job with no YAML change.",
        code: {
          lang: "yaml",
          code: `jobs:
  plan:
    runs-on: ubuntu-latest
    outputs: { services: "\${{ steps.ls.outputs.services }}" }
    steps:
      - uses: actions/checkout@v4
      - id: ls
        run: echo "services=$(ls services | jq -R . | jq -s -c .)" >> "$GITHUB_OUTPUT"
  test:
    needs: plan
    runs-on: ubuntu-latest
    strategy: { matrix: { service: "\${{ fromJSON(needs.plan.outputs.services) }}" } }
    steps:
      - uses: actions/checkout@v4
      - run: make -C "services/\${{ matrix.service }}" test`,
        },
      },
    ],
    cheatSheet: [
      "ubuntu-latest is Ubuntu 24.04; pin ubuntu-24.04 for stable builds",
      "Quote versions in YAML: \"3.10\" stays a string, 3.10 becomes 3.1",
      "fail-fast is true by default; set false to see every failing combination",
      "max-parallel: 2 limits how many matrix jobs run at once",
      "A matrix can create at most 256 jobs per workflow run",
      "runs-on: [self-hosted, linux, gpu] needs a runner with all those labels",
      "config.sh --ephemeral makes a self-hosted runner take exactly one job",
      "fromJSON(needs.plan.outputs.list) builds a matrix from a previous job",
    ],
    quiz: [
      {
        q: "Matrix: os has 2 values, node has 3 values, and one exclude entry matches one combination. How many jobs run?",
        options: ["6", "5", "7", "3"],
        answer: 1,
        why: "2 times 3 is 6 combinations, minus 1 excluded, gives 5.",
      },
      {
        q: "An include entry adds a key that matches no existing combination without overwriting a value. What happens?",
        options: ["It is ignored", "The workflow fails", "It overwrites the first combination", "It becomes a new combination"],
        answer: 3,
        why: "Include entries that cannot be merged into any existing combination are added as new jobs.",
      },
      {
        q: "Why is a non-ephemeral self-hosted runner risky?",
        options: ["Files and credentials from one job can remain for the next job", "It cannot run Docker", "It is slower than hosted runners", "It needs inbound firewall ports"],
        answer: 0,
        why: "The machine is reused, so leftovers from earlier jobs can leak or interfere.",
      },
      {
        q: "One combination fails and the other matrix jobs are cancelled. Which setting caused that?",
        options: ["max-parallel", "continue-on-error", "fail-fast: true (the default)", "timeout-minutes"],
        answer: 2,
        why: "fail-fast cancels in-progress matrix jobs after the first failure.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run your tests on Node 20, 22 and 24 on Linux with a matrix.",
        hint: "Use actions/setup-node with node-version from the matrix.",
        solution: `jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix: { node: [20, 22, 24] }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "\${{ matrix.node }}" }
      - run: npm ci && npm test`,
      },
      {
        level: "medium",
        task: "Test on Linux and Windows with Python 3.12 and 3.13, but skip Windows with 3.12, and make sure all results are reported even if one fails.",
        hint: "Use exclude and turn off fail-fast.",
        solution: `strategy:
  fail-fast: false
  matrix:
    os: [ubuntu-latest, windows-latest]
    python: ["3.12", "3.13"]
    exclude:
      - { os: windows-latest, python: "3.12" }
runs-on: \${{ matrix.os }}
# 3 jobs: ubuntu 3.12, ubuntu 3.13, windows 3.13`,
      },
      {
        level: "hard",
        task: "Make the matrix job names readable in the PR checks list and protect against an empty dynamic matrix.",
        hint: "Jobs accept a name with expressions; skip the matrix job with an if when the list is [].",
        solution: `  test:
    needs: plan
    if: needs.plan.outputs.services != '[]'
    name: test \${{ matrix.service }}
    runs-on: ubuntu-latest
    strategy:
      matrix: { service: "\${{ fromJSON(needs.plan.outputs.services) }}" }
    steps:
      - run: echo "Testing \${{ matrix.service }}"`,
      },
    ],
    faq: [
      { q: "How many jobs can run at the same time?", a: "It depends on your plan's concurrency limit for hosted runners, and on how many self-hosted runners you have. Within one matrix you can lower it further with max-parallel." },
      { q: "Should I use self-hosted runners for a public repo?", a: "Generally no. Anyone can open a pull request, and a fork's workflow code could run on your machine. Use GitHub-hosted runners, or tightly controlled ephemeral runners with approval for outside contributors." },
      { q: "How do I see what software is installed on ubuntu-latest?", a: "Open the Set up job step in any run log; it links to the image version. The full list is in the actions/runner-images repository on GitHub." },
    ],
  },

  "actions-basics/gha-secrets": {
    plain: [
      "Workflows often need passwords: an API token to deploy, a key to publish a package. Putting them in the YAML would show them to everyone who can read the repo. Secrets solve this. You save the value in GitHub's settings once, and workflows refer to it by name.",
      "GitHub encrypts secrets, never shows them again in the web page, and hides them in logs. If a secret's value appears in output, the log shows asterisks instead. Secrets are not given to pull requests from forks, so a stranger cannot write a workflow that prints them.",
      "Not everything is secret. The cloud region, a server URL or a feature switch are configuration. Store those as variables: they are readable, show up in logs and are easy to change without editing code.",
      "Environments are named deploy targets like staging and production. Each can have its own secrets and its own rules, such as \"a team lead must approve\" or \"only the main branch may deploy here\". The job waits at the gate until the rules are met, and only then receives the production secrets.",
    ],
    deepDive: [
      {
        heading: "How secrets are stored and injected",
        body: "When you save a secret, it is encrypted with a public key before it is stored (gh and the web UI do this for you), and only decrypted when a job that needs it starts. The runner registers each secret value with the log masker, so exact matches are replaced by asterisks. Masking is string matching: if you base64-encode, reverse or split a secret, the new form is not masked. Use echo \"::add-mask::$VALUE\" to mask a derived value yourself.\n\nSecret names may contain only letters, numbers and underscores, cannot start with a number or with GITHUB_, and are not case-sensitive. Each secret can be up to 48 KB. Secrets cannot be used directly in an if: condition; copy them into env and test the env value instead.",
        bullets: [
          "Workflows triggered by Dependabot only get Dependabot secrets",
          "Forked PRs get no secrets and a read-only GITHUB_TOKEN",
          "Pass secrets to commands through env, not inside the command text",
        ],
      },
      {
        heading: "Three levels, and which one wins",
        body: "Secrets and variables can be defined for an organization, a repository or an environment. Organization secrets can be shared with all repos, only private repos, or a selected list, which is ideal for something like a shared package registry token. Repository secrets are for one repo. Environment secrets are only given to jobs that reference that environment and pass its protection rules.\n\nIf the same name exists at more than one level, the most specific one wins: environment beats repository, and repository beats organization. A good rule: production credentials belong at environment level only, so no ordinary CI job on a feature branch can ever read them.",
        visual: {
          type: "layers",
          title: "Secret lookup, most specific first",
          layers: [
            { label: "Environment", detail: "Only jobs with environment: NAME, after its rules pass" },
            { label: "Repository", detail: "Any workflow in this repo (not forks)" },
            { label: "Organization", detail: "Repos chosen by the access policy" },
          ],
        },
      },
      {
        heading: "Variables and the env keyword",
        body: "Configuration variables are set in the same places as secrets (organization, repository, environment) and read with vars.NAME. They are stored in plain text and printed normally in logs. Do not confuse them with env:, which you write in the YAML at workflow, job or step level, or with the default variables every runner sets, such as GITHUB_SHA, GITHUB_REF and RUNNER_OS.\n\nA useful pattern is the same variable name in each environment. vars.API_URL can be https://staging.api.example.com in staging and https://api.example.com in production, and one deploy job works for both, depending only on which environment it targets. Variables can also be used in if: conditions, which secrets cannot.",
      },
      {
        heading: "Environment protection rules",
        body: "Required reviewers: up to six people or teams, and one approval is enough; you can also block the person who started the run from approving it. Wait timer: delays the job by up to 43,200 minutes (30 days). Deployment branches and tags: limit which refs can deploy, for example only main or tags matching v*. Custom deployment protection rules let a GitHub App approve or reject, for example based on monitoring.\n\nThe job pauses before it starts, so no runner minutes are used while waiting. Approved deployments appear in the repo's Deployments list with history and an optional URL. Plans matter: environments work on every plan for public repos, while private repos need a paid plan, and required reviewers and wait timers in private repos need GitHub Enterprise.",
        visual: {
          type: "flow",
          title: "A job that targets production",
          steps: [
            { label: "Job starts", detail: "environment: production" },
            { label: "Branch rule", detail: "Is this ref allowed to deploy?" },
            { label: "Wait timer", detail: "Optional delay" },
            { label: "Reviewer approves", detail: "One required reviewer is enough" },
            { label: "Secrets released", detail: "Environment secrets and vars" },
            { label: "Deployment recorded", detail: "History and URL on GitHub" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Where to put which value",
        columns: [
          { title: "Org secret", points: ["Shared by many repos", "Registry or bot tokens", "Access policy limits repos", "Managed by org owners"] },
          { title: "Repo secret or variable", points: ["One repo, any workflow", "CI tokens, test service URLs", "Not given to forked PRs", "Managed by repo admins"] },
          { title: "Environment secret or variable", points: ["Only jobs in that environment", "Production credentials", "Behind reviewers and branch rules", "Same names per environment"] },
        ],
      },
    ],
    examples: [
      {
        title: "Staging deploys automatically, production waits",
        explanation: "You want every push to main deployed to staging, and production only after a lead approves. Step 1: create environments staging and production; give production a required reviewer and restrict it to the main branch. Step 2: set API_URL as an environment variable and DEPLOY_TOKEN as an environment secret in each. Step 3: two jobs use the same steps with different environments; production needs staging. Step 4: the environment URL shows as a link on the run page.",
        code: {
          lang: "yaml",
          code: `jobs:
  staging:
    runs-on: ubuntu-latest
    environment: { name: staging, url: "\${{ vars.API_URL }}" }
    steps:
      - run: ./deploy.sh "$API_URL"
        env: { API_URL: "\${{ vars.API_URL }}", TOKEN: "\${{ secrets.DEPLOY_TOKEN }}" }
  production:
    needs: staging
    runs-on: ubuntu-latest
    environment: { name: production, url: "\${{ vars.API_URL }}" }
    steps:
      - run: ./deploy.sh "$API_URL"
        env: { API_URL: "\${{ vars.API_URL }}", TOKEN: "\${{ secrets.DEPLOY_TOKEN }}" }`,
        },
      },
      {
        title: "Using a multi-line secret file safely",
        explanation: "A deploy needs a kubeconfig file. Step 1: store the file content as a secret from the terminal, so it never lands in shell history or the repo. Step 2: in the job, write it to a file that only the runner user can read. Step 3: point the tool at it with an env variable. Step 4: never cat the file or print it; masking works line by line for multi-line secrets, but derived values like a base64 copy would leak.",
        code: {
          lang: "bash",
          code: "# once, on your laptop\ngh secret set KUBECONFIG_DATA --env production < ~/.kube/prod-config\n\n# in the workflow step (env: KUBECONFIG_DATA: ${{ secrets.KUBECONFIG_DATA }})\numask 077\nprintf '%s' \"$KUBECONFIG_DATA\" > \"$RUNNER_TEMP/kubeconfig\"\nexport KUBECONFIG=\"$RUNNER_TEMP/kubeconfig\"\nkubectl get nodes",
        },
      },
    ],
    cheatSheet: [
      "gh secret set NAME --env production < file stores a secret from a file",
      "gh variable set AWS_REGION --body eu-west-1 creates a repository variable",
      "Precedence: environment, then repository, then organization",
      "echo \"::add-mask::$VALUE\" hides a derived value in later logs",
      "Secrets max 48 KB each; names cannot start with GITHUB_",
      "Use vars.NAME in if: conditions; secrets cannot be used there directly",
      "Restrict production to the main branch in the environment's deployment branches",
      "Forked PRs and Dependabot runs do not get your normal repository secrets",
    ],
    quiz: [
      {
        q: "API_KEY exists as an organization secret and as a production environment secret. A job with environment: production reads secrets.API_KEY. Which value does it get?",
        options: ["The organization value", "Whichever was updated last", "The workflow fails with a conflict", "The production environment value"],
        answer: 3,
        why: "The most specific level wins: environment beats repository and organization.",
      },
      {
        q: "A workflow prints the base64 form of a secret. What appears in the log?",
        options: ["Asterisks in place of the value", "The base64 text in clear, because masking only matches the exact secret value", "Nothing, the step fails", "A warning only"],
        answer: 1,
        why: "Masking is string matching on registered values; transformed values need ::add-mask::.",
      },
      {
        q: "Which value should be a variable rather than a secret?",
        options: ["The AWS region to deploy to", "A database password", "An npm publish token", "A private SSH key"],
        answer: 0,
        why: "A region is not sensitive, and readable logs help debugging.",
      },
      {
        q: "A deploy job waits for an environment reviewer. Is it using runner minutes while waiting?",
        options: ["Yes, the runner is reserved", "Only on self-hosted runners", "No, the job does not start until the rules pass", "Only after 30 minutes"],
        answer: 2,
        why: "Protection rules are checked before the job is sent to a runner.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a repository secret and a variable from the terminal, then use both in a workflow step without printing the secret.",
        hint: "gh secret set and gh variable set; pass the secret through env.",
        solution: "gh secret set API_TOKEN          # paste the value when asked\ngh variable set API_URL --body https://api.example.com\n# workflow step:\n# - run: curl -fsS -H \"Authorization: Bearer $TOKEN\" \"$URL/health\"\n#   env:\n#     TOKEN: ${{ secrets.API_TOKEN }}\n#     URL: ${{ vars.API_URL }}",
      },
      {
        level: "medium",
        task: "Run a step only when a secret is configured, so forks and new clones skip it instead of failing.",
        hint: "Secrets cannot be tested in if: directly. Put the secret in job env and test env.",
        solution: `jobs:
  notify:
    runs-on: ubuntu-latest
    env:
      SLACK_URL: \${{ secrets.SLACK_WEBHOOK_URL }}
    steps:
      - if: env.SLACK_URL != ''
        run: curl -fsS -X POST -d '{"text":"Build done"}' "$SLACK_URL"`,
      },
      {
        level: "hard",
        task: "Make a production environment that only main can deploy to, needs approval, and gives its URL. Show the workflow job and the settings you would choose.",
        hint: "Settings, Environments, production. Deployment branches: Selected branches, main.",
        solution: `# Settings > Environments > New environment: production
#   Required reviewers: @acme/leads (prevent self-review on)
#   Deployment branches and tags: Selected, rule "main"
#   Secret DEPLOY_TOKEN, variable API_URL
deploy:
  runs-on: ubuntu-latest
  environment: { name: production, url: "\${{ vars.API_URL }}" }
  steps:
    - run: ./deploy.sh
      env: { DEPLOY_TOKEN: "\${{ secrets.DEPLOY_TOKEN }}" }`,
      },
    ],
    faq: [
      { q: "Can I read a secret's value back from GitHub?", a: "No. The UI and API only let you create, update or delete secrets. If you lose the value, generate a new one at the source and update the secret." },
      { q: "Why is my secret empty in a pull request workflow?", a: "If the pull request comes from a fork, GitHub does not pass secrets to the workflow. Dependabot-triggered runs also only get Dependabot secrets." },
      { q: "Are GitHub secrets safe enough for production keys?", a: "They are encrypted and access-controlled, but any workflow that can read them can leak them. For cloud access, prefer OIDC with short-lived credentials, and keep remaining production secrets at environment level behind reviewers." },
    ],
  },

  "actions-basics/gha-cache": {
    plain: [
      "Every CI job starts on a clean machine, so it downloads all your dependencies again: hundreds of npm or pip packages, every time. A cache saves those downloads at the end of one run and restores them at the start of the next. Builds that took 4 minutes can drop to 1.",
      "A cache needs a name, called the key. A good key changes only when your dependencies change, so it usually includes a fingerprint (hash) of your lockfile. Same lockfile, same key, reuse the cache. New lockfile, new key, build a fresh cache.",
      "Artifacts are different. They are files your run produces and wants to keep or hand over: a built app, a test report, coverage results. One job uploads them, and a later job in the same run downloads them. People can also download them from the run page.",
      "A simple way to remember: a cache is a speed-up for future runs and may disappear at any time. An artifact is a result of this run that you actually need. Never rely on a cache for correctness.",
    ],
    deepDive: [
      {
        heading: "What actions/cache does, exactly",
        body: "At the start, actions/cache looks for an entry whose key matches exactly. If there is none, it tries each restore-keys prefix in order and takes the newest entry that starts with it. On an exact hit, the output cache-hit is 'true' and nothing is saved at the end. On a miss or a partial (prefix) hit, a post step at the end of the job saves the path under the new key, but only if the job succeeded.\n\nCache entries are immutable: you cannot overwrite a key, which is why the key must change when the content should. To save even when tests fail, or to save from a different step, split it into actions/cache/restore and actions/cache/save.",
        bullets: [
          "key: deps-${{ runner.os }}-${{ hashFiles('package-lock.json') }}",
          "restore-keys: deps-${{ runner.os }}- gives a partial hit after a lockfile change",
          "Check steps.ID.outputs.cache-hit to skip an install on an exact hit",
        ],
      },
      {
        heading: "Scope, size limits and eviction",
        body: "Caches are scoped to branches for safety. A run can restore caches created on its own branch or on the default branch. A pull_request run can also use caches from the PR's base branch. Runs on one feature branch cannot see caches made by another feature branch. So a cache saved on main warms up every new branch, which is why it pays to run the workflow on push to main too.\n\nEach repository has a cache limit (10 GB by default). When it is full, GitHub evicts the least recently used entries, and entries not accessed for 7 days are removed anyway. gh cache list shows entries and their sizes, and gh cache delete removes one, handy when a broken cache keeps getting restored.",
        visual: {
          type: "tree",
          title: "Which caches a PR run can restore",
          root: "Run for PR #42 (feature/x into main)",
          children: [
            { label: "Allowed", children: ["Caches from this PR's own runs", "Caches from base branch main", "Caches from the default branch"] },
            { label: "Not allowed", children: ["Caches from feature/y", "Caches from other PRs"] },
            { label: "Saved by this run", children: ["Scoped to refs/pull/42/merge"] },
          ],
        },
      },
      {
        heading: "Built-in caching in setup actions",
        body: "Most setup actions can cache for you with one line. actions/setup-node takes cache: npm, yarn or pnpm. actions/setup-python takes cache: pip, pipenv or poetry. actions/setup-java takes cache: maven, gradle or sbt. actions/setup-go caches modules and the build cache by default. They build the key from your lockfile automatically; for a monorepo, set cache-dependency-path to the right lockfile or a glob.\n\nNote what is cached: setup-node caches the package manager's download cache (like ~/.npm), not node_modules. That is deliberate. npm ci deletes node_modules before installing, so caching it would be wasted work, while the download cache still saves the network time. Use actions/cache directly for anything else, such as Playwright browsers or a compiler cache.",
      },
      {
        heading: "Artifacts between jobs and after the run",
        body: "actions/upload-artifact@v4 zips the files and stores them with the run; actions/download-artifact@v4 fetches them in a later job. In v4, artifacts are immutable and names must be unique within a run, so in a matrix give each upload a name with the matrix values, then download with pattern: and merge-multiple: true to combine them.\n\nArtifacts are kept for 90 days by default; set retention-days lower for big or temporary files to save storage. Zip does not keep file permissions, so an executable comes back without its x bit; tar it first if that matters. To download an artifact from a different run, pass run-id and a github-token with actions: read.",
        visual: {
          type: "sequence",
          title: "Build once, use the files twice",
          actors: ["build job", "Artifact storage", "test job", "deploy job"],
          messages: [
            { from: 0, to: 1, label: "upload-artifact name: dist" },
            { from: 2, to: 1, label: "download-artifact name: dist" },
            { from: 2, to: 2, label: "Run end-to-end tests" },
            { from: 3, to: 1, label: "download-artifact name: dist" },
            { from: 3, to: 3, label: "Deploy the exact tested files" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Cache key with fallback",
        steps: [
          { label: "Exact key", detail: "npm-Linux- plus the lockfile hash: full hit" },
          { label: "restore-keys prefix", detail: "npm-Linux-: newest partial match" },
          { label: "Nothing found", detail: "Install from the network" },
          { label: "Job succeeds", detail: "Save under the exact key" },
        ],
      },
    ],
    examples: [
      {
        title: "Cache npm and Playwright browsers",
        explanation: "Your end-to-end tests spend 90 seconds downloading browsers. Step 1: let setup-node cache npm downloads. Step 2: read the installed Playwright version and use it in a cache key, because browsers only change when Playwright changes. Step 3: cache ~/.cache/ms-playwright with actions/cache. Step 4: install browsers only on a miss; on a hit, install just the system packages they need.",
        code: {
          lang: "yaml",
          code: `      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - id: pw
        run: echo "version=$(npx playwright --version | awk '{print $2}')" >> "$GITHUB_OUTPUT"
      - id: cache
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: pw-\${{ runner.os }}-\${{ steps.pw.outputs.version }}
      - if: steps.cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps
      - if: steps.cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps
      - run: npx playwright test`,
        },
      },
      {
        title: "Combine coverage reports from a matrix",
        explanation: "Each of three matrix jobs writes a coverage file, and a final job should merge them. Step 1: each matrix job uploads with a unique name that includes the matrix value. Step 2: a report job needs the matrix job. Step 3: it downloads every artifact whose name matches coverage-* into one folder with merge-multiple. Step 4: it merges and publishes the combined report.",
        code: {
          lang: "yaml",
          code: `      # in each matrix job
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-\${{ matrix.python }}
          path: .coverage.*
          include-hidden-files: true
          retention-days: 5
  report:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { pattern: coverage-*, merge-multiple: true }
      - run: pip install coverage && coverage combine && coverage report`,
        },
      },
    ],
    cheatSheet: [
      "Key on the lockfile: hashFiles('package-lock.json') or hashFiles('requirements.txt')",
      "Exact hit means cache-hit is 'true' and no save happens at the end",
      "Caches are immutable, scoped to branch, 10 GB per repo by default, removed after 7 unused days",
      "setup-node with cache: npm caches ~/.npm, not node_modules",
      "gh cache list and gh cache delete KEY manage caches from the terminal",
      "upload-artifact v4 names must be unique per run; use the matrix value in the name",
      "retention-days: 5 on uploads saves storage; the default is 90 days",
      "Artifacts drop file permissions; tar files first to keep executable bits",
    ],
    quiz: [
      {
        q: "Your cache key is deps-v1 and never changes. What problem does this cause?",
        options: ["The cache is deleted every run", "Builds fail", "After dependencies change, the old cache is restored and the new one is never saved", "Nothing, it is best practice"],
        answer: 2,
        why: "Caches are immutable, so an exact hit on deps-v1 means no new save ever happens.",
      },
      {
        q: "A run on feature/a wants a cache saved by a run on feature/b. Can it restore it?",
        options: ["No, only caches from its own branch and the default (or base) branch", "Yes, all caches are shared", "Only if the key matches exactly", "Only on self-hosted runners"],
        answer: 0,
        why: "Cache access is scoped to the current branch plus the default and base branches.",
      },
      {
        q: "Which belongs in an artifact rather than a cache?",
        options: ["~/.npm download cache", "pip wheels", "Gradle dependency cache", "The built dist/ folder the deploy job needs"],
        answer: 3,
        why: "Build outputs must be reliable; caches can be evicted at any time.",
      },
      {
        q: "Why does setup-node not cache node_modules?",
        options: ["It is too large to upload", "npm ci deletes node_modules anyway, so the download cache is what helps", "node_modules cannot be zipped", "GitHub forbids it"],
        answer: 1,
        why: "npm ci always starts from a clean node_modules; caching ~/.npm still saves network time.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Turn on built-in caching for a Python project that uses requirements.txt and check the logs for a cache hit on the second run.",
        hint: "actions/setup-python has a cache input.",
        solution: `      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.13", cache: pip }
      - run: pip install -r requirements.txt
# second run log: "Cache restored from key: setup-python-Linux-..."`,
      },
      {
        level: "medium",
        task: "Build once in a build job and run the tests in a separate job using the same built files.",
        hint: "upload-artifact in build, needs: build and download-artifact in test.",
        solution: `jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist/, retention-days: 3 }
  test:
    needs: build
    runs-on: ubuntu-latest
    steps: [{ uses: actions/download-artifact@v4, with: { name: dist, path: dist } }, { run: ls dist }]`,
      },
      {
        level: "hard",
        task: "Save a compiler cache even when tests fail, so the next run is still fast.",
        hint: "Split actions/cache into restore and save, and run the save step with if: always().",
        solution: `      - uses: actions/cache/restore@v4
        id: restore
        with:
          path: ~/.cache/ccache
          key: ccache-\${{ runner.os }}-\${{ github.sha }}
          restore-keys: ccache-\${{ runner.os }}-
      - run: make test
      - if: always()
        uses: actions/cache/save@v4
        with: { path: ~/.cache/ccache, key: "\${{ steps.restore.outputs.cache-primary-key }}" }`,
      },
    ],
    faq: [
      { q: "Why is my cache never restored on a new branch?", a: "A new branch can only use caches from itself and the default branch. Run the workflow on push to main as well, so main has a warm cache to share." },
      { q: "How long are caches and artifacts kept?", a: "Caches not used for 7 days are removed, and older ones can be evicted when the repo hits its size limit. Artifacts are kept for 90 days by default, or the retention-days you set." },
      { q: "Can I share a cache between workflows?", a: "Yes. Caches are per repository and branch, not per workflow, so any workflow on an allowed branch can restore an entry by its key." },
      { q: "How do I clear a broken cache?", a: "Delete it on the Actions tab under Caches, or run gh cache delete with its key. Changing a version prefix in the key, like v2-, also forces a fresh cache." },
    ],
  },
};

export default extra;

import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "cicd/cicd-concepts": {
    plain: [
      "CI/CD is a set of habits plus automation. CI means continuous integration: everyone merges small changes into the main branch often, and a robot checks each change right away. CD means continuous delivery or continuous deployment: the checked change is packaged and pushed towards production automatically.",
      "Think of a pipeline as a factory line. Your code goes in at one end. Each station does one job: check the style, run the tests, build the image, scan it for known security holes, deploy it to a test server. If a station fails, the line stops and you get a message within minutes.",
      "Delivery and deployment differ in one place. With continuous delivery, a person presses the final button to release to production. With continuous deployment, there is no button: if every check passes, the change goes live by itself.",
      "Branching strategy is how a team uses Git branches. Trunk-based development keeps branches tiny and merges them into main every day. GitFlow keeps long-lived develop and release branches for planned releases. Most modern web teams choose trunk-based, because CI works best when changes are small.",
    ],
    deepDive: [
      {
        heading: "Why small, frequent merges matter",
        body: "The core idea of CI is that integration pain grows faster than the size of the change. Two developers who each work alone for three weeks will have a huge, risky merge. Two developers who merge every day have tiny merges that rarely conflict, and if a test breaks, the cause is in the last few hours of work.\n\nThis is why CI is a practice, not just a tool. Running Jenkins on a branch that nobody merges for a month is not continuous integration. The rules teams follow are simple: merge to main at least daily, keep main green (passing), and if main breaks, fixing it is the top priority before new work.\n\nThe DORA research program measures delivery performance with four key metrics: deployment frequency, lead time for changes (commit to production), change failure rate, and time to restore service after a failure. Teams that deploy small changes often tend to score better on all four, including stability.",
        bullets: ["Merge to main at least once a day", "A red main branch is fixed before anything else", "Small changes are easier to review, test and roll back"],
      },
      {
        heading: "Trunk-based development vs GitFlow",
        body: "In trunk-based development, main (the trunk) is always releasable. Developers create short-lived branches, open a pull request, and merge within a day or two. Unfinished features are hidden behind feature flags, so code can be merged before the feature is switched on. Releases are cut from main, often many times a day.\n\nGitFlow, described by Vincent Driessen in 2010, uses more branches. develop collects finished features. A release branch is cut from develop to stabilise a version, then merged into main and tagged. Hotfix branches start from main for urgent fixes and are merged back into both main and develop. It fits software shipped in versions, like desktop apps or libraries with several supported releases.\n\nGitHub Flow is a light middle ground: main plus feature branches and pull requests, with deploys from main. Driessen himself later noted that GitFlow is often too heavy for continuously delivered web apps.",
        visual: {
          type: "compare",
          title: "Branching models side by side",
          columns: [
            { title: "Trunk-based", points: ["main plus branches that live 1 to 2 days", "Feature flags hide unfinished work", "Deploy from main many times a day"] },
            { title: "GitHub Flow", points: ["main plus feature branches", "Every change goes through a PR", "Deploy after merge to main"] },
            { title: "GitFlow", points: ["main, develop, feature, release, hotfix", "Release branches stabilise a version", "Fits versioned, scheduled releases"] },
          ],
        },
      },
      {
        heading: "Designing the stages",
        body: "A good pipeline gives fast feedback and builds trust. Put cheap checks first: formatting and lint (ruff) take seconds, type checks (mypy) take a little longer, unit tests next, then slower integration tests that need a database. Run independent checks in parallel jobs to save time. A common target is feedback on a pull request in under ten minutes.\n\nThe build stage creates one artifact, for us a Docker image tagged with the git commit SHA. Then scanning checks dependencies and the image for known vulnerabilities (CVEs) with tools like pip-audit or Trivy, and can block high-severity findings.\n\nAfter the build, nothing is rebuilt. The same image goes to staging, gets smoke tests (a few quick requests to check it starts and answers), and is then promoted to production. Only configuration changes between environments, through environment variables or secrets. This way, production runs exactly the bytes you tested.",
        bullets: ["Fast and cheap checks first, slow ones later", "Pull requests run checks; only main builds and deploys", "Build once, promote the same image everywhere"],
      },
      {
        heading: "Promotion, approvals and safe releases",
        body: "Promotion means moving one tested build from one environment to the next: dev, then staging, then production. Each step can have a gate. A gate can be automatic (smoke tests pass, error rate is normal) or manual (a named person approves). GitHub Actions supports this with environments that have required reviewers; Jenkins uses an input step.\n\nHow you switch traffic also matters. A rolling deployment replaces old instances a few at a time. Blue-green runs a full new copy next to the old one and switches all traffic at once, so rollback is just switching back. A canary release sends a small share of traffic, say 5 percent, to the new version and watches metrics before going further.\n\nAlways plan the rollback before you deploy. With immutable, SHA-tagged images, rolling back is simply deploying the previous tag. Database migrations need extra care: make them backward compatible so the old version still works if you roll back.",
        visual: {
          type: "flow",
          title: "Promoting one image through environments",
          steps: [
            { label: "Build api:3f9c2ab", detail: "Created once on merge to main" },
            { label: "Dev", detail: "Deployed automatically" },
            { label: "Staging", detail: "Smoke tests must pass" },
            { label: "Approval gate", detail: "Reviewer or automated checks" },
            { label: "Production", detail: "Same image, prod config" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "The CI/CD feedback loop",
        steps: [
          { label: "Small change", detail: "A branch that lives hours, not weeks" },
          { label: "Automated checks", detail: "Lint, tests, build, scan" },
          { label: "Merge and deploy", detail: "Same image promoted through environments" },
          { label: "Monitor", detail: "Errors, latency, user impact" },
          { label: "Learn", detail: "Fix or improve in the next small change" },
        ],
      },
    ],
    examples: [
      {
        title: "Sketch a pipeline for the FastAPI service",
        explanation: "Step 1: on every pull request, run ruff and pytest in parallel jobs; these must pass before merge. Step 2: on merge to main, build the image once and tag it with the short git SHA. Step 3: scan it with Trivy and fail on CRITICAL findings. Step 4: deploy it to staging and call /health as a smoke test. Step 5: a reviewer approves, and the same tag is deployed to production. The outline below is tool-neutral; any CI system can run it.",
        code: {
          lang: "text",
          code: `on pull_request:
  lint:   ruff check .                      (~10 s)
  test:   pytest -q                         (~2 min)
on push to main:
  build:  docker build -t api:$SHA .
  scan:   trivy image --exit-code 1 --severity CRITICAL api:$SHA
  push:   docker push registry/api:$SHA
  deploy staging  -> curl -f https://staging.example.com/health
  manual approval
  deploy production (same api:$SHA, prod config)`,
        },
      },
      {
        title: "Merge unfinished work safely with a feature flag",
        explanation: "You are building a new export endpoint that will take a week. With trunk-based development you still merge daily. Step 1: wrap the new route in a flag read from an environment variable, off by default. Step 2: merge each small piece to main; tests cover both flag states. Step 3: turn the flag on in staging and test. Step 4: turn it on in production. Step 5: once stable, delete the flag and the old code path, so flags do not pile up.",
        code: {
          lang: "python",
          code: `import os
from fastapi import FastAPI, HTTPException

app = FastAPI()
EXPORT_ENABLED = os.getenv("FEATURE_EXPORT", "false") == "true"

@app.get("/export")
def export():
    if not EXPORT_ENABLED:
        raise HTTPException(status_code=404)
    return {"status": "export started"}`,
        },
      },
    ],
    cheatSheet: [
      "CI: merge small changes often and test each one automatically",
      "Continuous delivery keeps a human approval before prod; continuous deployment does not",
      "Order stages from fastest to slowest: lint, unit tests, integration tests, build, scan",
      "Tag images with the git SHA and promote that exact image; never rebuild per environment",
      "Keep branches short-lived; use feature flags for work that is not ready",
      "DORA metrics: deploy frequency, lead time, change failure rate, time to restore",
      "Rollback with immutable images is just deploying the previous tag",
    ],
    quiz: [
      {
        q: "Your pipeline rebuilds the Docker image separately for staging and production. What is the main risk?",
        options: ["Builds take a little longer", "Production may run an image that was never tested", "The registry fills up faster", "Tags become too long"],
        answer: 1,
        why: "Dependencies or base images can change between builds, so the prod image is not the one that passed staging.",
      },
      {
        q: "Which branching model uses separate develop, release and hotfix branches?",
        options: ["Trunk-based development", "GitHub Flow", "Feature flags", "GitFlow"],
        answer: 3,
        why: "GitFlow adds long-lived develop plus release and hotfix branches for versioned releases.",
      },
      {
        q: "What lets a trunk-based team merge a half-finished feature to main safely?",
        options: ["A feature flag that keeps it switched off", "A long-lived feature branch", "Skipping the tests for that code", "A separate production repository"],
        answer: 0,
        why: "The code is merged and tested but stays hidden from users until the flag is turned on.",
      },
      {
        q: "A release sends 5 percent of traffic to the new version and watches error rates before going further. What is this called?",
        options: ["Blue-green deployment", "Rolling restart", "Canary release", "Hotfix"],
        answer: 2,
        why: "A canary exposes a small slice of traffic first, so problems affect few users.",
      },
      {
        q: "Which is one of the four DORA metrics?",
        options: ["Lines of code per day", "Number of branches", "Test coverage percentage", "Change failure rate"],
        answer: 3,
        why: "DORA tracks deployment frequency, lead time, change failure rate and time to restore.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "For a small Python API, list the checks you would run on a pull request and the extra steps you would run only on main. Put them in order.",
        hint: "Fast and cheap first. Building and pushing images only makes sense for code that is merged.",
        solution: `Pull request: ruff check, mypy, pytest (unit), pytest (integration with Postgres)
main only: build image tagged with SHA, scan with Trivy,
push to registry, deploy to staging, smoke test, approve, deploy prod`,
      },
      {
        level: "medium",
        task: "Your PR pipeline takes 25 minutes. Lint 1 min, unit tests 6 min, integration tests 12 min, docker build 6 min, all in one sequential job. Redesign it to give feedback faster.",
        hint: "Which steps depend on each other? Does a PR need the image at all? Can you cache anything?",
        solution: `Split into parallel jobs: lint (1 min), unit (6 min), integration (12 min).
Cache pip downloads and Docker layers to cut install and build time.
Skip the image build on PRs, or build without pushing only if the
Dockerfile changed. Wall time is now about 12 minutes (the longest job),
and lint failures show up after 1 minute instead of at the end.`,
      },
      {
        level: "hard",
        task: "Design a rollback plan for a release that adds a new NOT NULL column to the orders table and code that writes it. The rollback must work without data loss.",
        hint: "Old code does not know the new column. Split the change into steps that are each backward compatible (expand and contract).",
        solution: `Release 1 (expand): add the column as NULLable with a default; old code still works.
Release 2: new code writes the column; backfill old rows in batches.
Rollback of release 2 = deploy previous image tag; schema still fits old code.
Release 3 (contract): once stable, set NOT NULL.
Never combine the schema change and the code that needs it in one irreversible step.`,
      },
    ],
    faq: [
      { q: "Is CI/CD a tool?", a: "No. CI/CD is a set of practices: small frequent merges, automated checks and automated releases. Tools like GitHub Actions, GitLab CI and Jenkins run the automation, but the habits matter more." },
      { q: "Should I use GitFlow or trunk-based development?", a: "For a web service deployed continuously, trunk-based or GitHub Flow is usually simpler and faster. GitFlow suits products released in numbered versions that you must support in parallel." },
      { q: "How long should a CI pipeline take?", a: "Aim for pull request feedback in about 10 minutes or less. Longer pipelines push people to batch changes and skip waiting, which defeats the point of CI." },
      { q: "What is the difference between a deploy and a release?", a: "A deploy puts new code on servers. A release makes a feature available to users. Feature flags let you deploy code now and release the feature later." },
    ],
  },

  "cicd/gha-python": {
    plain: [
      "GitHub Actions is the CI/CD system built into GitHub. You describe what to do in a YAML file inside the folder .github/workflows. GitHub reads the file and, when something happens (a push, a pull request, a schedule), it starts a fresh virtual machine and runs your steps.",
      "A workflow has jobs, and a job has steps. Each step either runs a shell command with run, or uses a ready-made action with uses, such as actions/checkout to download your code. Jobs run in parallel unless you tell one to wait for another.",
      "For our Python service, every push and pull request should run the linter and the tests. Only when code lands on main should the workflow build the Docker image and push it to a registry. That keeps untested or untrusted code out of your registry.",
      "Passwords and tokens never go in the YAML file. You store them as repository secrets in the GitHub settings and refer to them by name. GitHub hides their values in the logs.",
    ],
    deepDive: [
      {
        heading: "Triggers, jobs and runners",
        body: "The on key lists the events that start a workflow. push and pull_request are the common ones, and both can be filtered by branches or paths. workflow_dispatch adds a manual Run button, and schedule runs on a cron expression in UTC.\n\nEach job runs on a runner named by runs-on. GitHub-hosted runners like ubuntu-latest are fresh virtual machines: nothing survives from one run to the next, which is why caching exists. Steps in one job share the same machine and files. Different jobs get different machines, so pass files between them with actions/upload-artifact and actions/download-artifact, or rebuild.\n\nneeds makes a job wait for others and skip if they fail. A matrix runs the same job for several values, for example Python 3.11, 3.12 and 3.13, in parallel. concurrency with cancel-in-progress cancels older runs on the same branch when you push again, which saves minutes.",
        bullets: ["on: push, pull_request, workflow_dispatch, schedule", "needs: test makes a job wait for the test job", "strategy.matrix runs one job across many versions", "Each job starts on a clean machine"],
      },
      {
        heading: "Lint, test and cache in CI",
        body: "actions/setup-python installs the exact Python version you ask for and puts it on the PATH. Pin a version like \"3.12\" rather than relying on whatever the runner image ships. Quote it in YAML, because 3.10 without quotes is read as the number 3.1.\n\nWith cache: pip, setup-python saves pip's download cache at the end of a run and restores it at the start of the next one. The cache key includes a hash of your requirements files, so changing a dependency creates a new cache automatically. Packages still install, but from local files instead of the internet.\n\nMake test output useful. pytest -q keeps logs short, --maxfail=1 stops early, and --cov with pytest-cov reports coverage. If your tests need Postgres, a job can declare services: postgres, and GitHub starts that container next to the job, reachable on localhost when you map the port.",
        bullets: ["Quote Python versions in YAML: \"3.10\", not 3.10", "cache: pip is keyed on your requirements file hash", "services: starts Postgres or Redis containers for tests"],
      },
      {
        heading: "Building and pushing the image only on main",
        body: "Keep the image build in its own job that needs the test job and has an if condition: github.event_name == 'push' && github.ref == 'refs/heads/main'. Pull requests then run tests but never publish.\n\nFor GitHub Container Registry (ghcr.io) you do not need a personal token. Give the job permissions: packages: write and log in with the built-in GITHUB_TOKEN. Docker Hub or ECR need their own credentials stored as secrets, or for AWS, an OIDC role.\n\nThe official Docker actions do the heavy work: docker/setup-buildx-action enables BuildKit, docker/login-action logs in, and docker/build-push-action builds and pushes. Add cache-from: type=gha and cache-to: type=gha,mode=max to reuse layers between runs through the GitHub Actions cache. Tag with github.sha so every image maps to exactly one commit.\n\nSecurity note: pull requests from forks get a read-only GITHUB_TOKEN and no repository secrets, by design.",
        visual: {
          type: "flow",
          title: "Jobs in the workflow",
          steps: [
            { label: "Event", detail: "push or pull_request" },
            { label: "test job", detail: "ruff and pytest, on every event" },
            { label: "if: push to main", detail: "PR runs stop here" },
            { label: "build job", detail: "needs: test; buildx with GHA cache" },
            { label: "Push to GHCR", detail: "Tagged with github.sha" },
          ],
        },
      },
      {
        heading: "Status badges, permissions and good hygiene",
        body: "A status badge is an image that shows whether the workflow passes on a branch. The URL pattern is https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg, and adding ?branch=main shows main only. Put it at the top of the README as an image linked to the Actions page.\n\nSet the least permissions the workflow needs. A top-level permissions: contents: read makes GITHUB_TOKEN read-only, and the build job can add packages: write for itself.\n\nPin actions to a version tag like actions/checkout@v4, or to a full commit SHA for third-party actions, because a tag can be moved by the action's owner. Set timeout-minutes on jobs; the default limit is 360 minutes, which can burn minutes on a hung test. Finally, protect main with a branch rule that requires the test job to pass before merging.",
        bullets: ["Badge: /actions/workflows/ci.yml/badge.svg?branch=main", "Top-level permissions: contents: read", "Pin third-party actions to a commit SHA", "Add timeout-minutes to every job"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Anatomy of a workflow file",
        root: ".github/workflows/ci.yml",
        children: [
          { label: "on", children: ["push", "pull_request", "workflow_dispatch"] },
          { label: "permissions", children: ["contents: read", "packages: write (build job)"] },
          { label: "jobs.test", children: ["runs-on: ubuntu-latest", "steps: checkout, setup-python, pytest"] },
          { label: "jobs.build", children: ["needs: test", "if: push to main", "steps: login, build-push"] },
        ],
      },
    ],
    examples: [
      {
        title: "Run tests against a real Postgres in CI",
        explanation: "Your integration tests need a database. Step 1: declare a postgres service; GitHub starts the container before the steps run. Step 2: map port 5432 and add a health check so steps wait until Postgres is ready. Step 3: pass the connection string as an environment variable. Step 4: run pytest. The job runs directly on the runner, so localhost reaches the mapped port.",
        code: {
          lang: "yaml",
          code: `jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_PASSWORD: test }
        ports: ["5432:5432"]
        options: --health-cmd pg_isready --health-interval 5s --health-retries 10
    env: { DATABASE_URL: "postgresql://postgres:test@localhost:5432/postgres" }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12", cache: pip }
      - run: pip install -r requirements.txt && pytest -q`,
        },
      },
      {
        title: "Build and push to GHCR on main",
        explanation: "Step 1: the build job waits for test with needs. Step 2: the if condition skips it for pull requests. Step 3: permissions give the token write access to packages. Step 4: log in to ghcr.io with GITHUB_TOKEN. Step 5: build and push, tagged with the commit SHA and latest, reusing layers from the GitHub Actions cache. No checkout step is needed, because build-push-action builds from the Git context by default. Image names on GHCR must be lowercase.",
        code: {
          lang: "yaml",
          code: `  build:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions: { contents: read, packages: write }
    steps:
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: "\${{ github.actor }}", password: "\${{ secrets.GITHUB_TOKEN }}" }
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: ghcr.io/acme/api:\${{ github.sha }},ghcr.io/acme/api:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max`,
        },
      },
    ],
    cheatSheet: [
      "Workflows live in .github/workflows/*.yml and start on events listed under on",
      "Quote Python versions in YAML, for example \"3.10\", or YAML reads it as 3.1",
      "setup-python with cache: pip restores pip downloads keyed on your requirements files",
      "needs: test makes a job wait; if: github.ref == 'refs/heads/main' limits it to main",
      "GHCR login works with GITHUB_TOKEN when the job has permissions: packages: write",
      "concurrency with cancel-in-progress: true stops outdated runs on the same branch",
      "Badge URL: https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg",
      "Fork pull requests get no secrets and a read-only token",
    ],
    quiz: [
      {
        q: "Two jobs in the same workflow need the same built file. Why can the second job not just read it from disk?",
        options: ["Files are deleted after each step", "Each job runs on its own fresh machine", "Jobs run as different users on one machine", "The file system is read-only"],
        answer: 1,
        why: "Jobs get separate runners, so files must be passed with artifacts or rebuilt.",
      },
      {
        q: "What happens if you write python-version: 3.10 without quotes?",
        options: ["YAML reads it as the number 3.1", "It installs the newest 3.x", "The workflow fails to parse", "It works the same as with quotes"],
        answer: 0,
        why: "YAML treats 3.10 as a float, which becomes 3.1, an old Python version.",
      },
      {
        q: "What is the simplest way to log in to ghcr.io from a workflow in the same repository?",
        options: ["Store your GitHub password as a secret", "Create an AWS access key", "Use GITHUB_TOKEN with permissions: packages: write", "No login is needed to push"],
        answer: 2,
        why: "The built-in token can push packages for the repository when given that permission.",
      },
      {
        q: "Which key makes the build job run only after the test job succeeds?",
        options: ["after: test", "depends_on: test", "requires: test", "needs: test"],
        answer: 3,
        why: "needs sets job order, and the job is skipped if a needed job fails.",
      },
      {
        q: "Why pin a third-party action to a full commit SHA?",
        options: ["It runs faster", "A version tag can be moved to different code by its owner", "GitHub requires it", "It enables caching"],
        answer: 1,
        why: "A SHA is immutable, so the code you reviewed is the code that runs.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add a status badge for ci.yml on main to the top of your README, linked to the workflow runs.",
        hint: "The badge is an image at /actions/workflows/FILE/badge.svg; wrap it in a link to /actions/workflows/FILE.",
        solution: `[![ci](https://github.com/acme/api/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/acme/api/actions/workflows/ci.yml)`,
      },
      {
        level: "medium",
        task: "Make the workflow cancel older runs when you push again to the same branch, give the token read-only access by default, and stop any job after 15 minutes.",
        hint: "concurrency and permissions can sit at the top level; timeout-minutes goes on each job.",
        solution: `concurrency:
  group: \${{ github.workflow }}-\${{ github.ref }}
  cancel-in-progress: true
permissions:
  contents: read
jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 15`,
      },
      {
        level: "hard",
        task: "Only run the expensive integration test job when files under app/ or requirements.txt changed, but always run lint. Keep it working for both push and pull_request.",
        hint: "Workflow-level paths filters affect the whole workflow. For one job, use a separate workflow file with paths, or a step that detects changes such as dorny/paths-filter.",
        solution: `# integration.yml (separate file, so ci.yml with lint always runs)
on:
  push:
    branches: [main]
    paths: ["app/**", "requirements.txt"]
  pull_request:
    paths: ["app/**", "requirements.txt"]
jobs:
  integration:
    runs-on: ubuntu-latest
    steps: [{ uses: actions/checkout@v4 }, { run: "pytest -q tests/integration" }]`,
      },
    ],
    faq: [
      { q: "Is GitHub Actions free?", a: "Public repositories get free minutes on standard GitHub-hosted runners. Private repositories get a monthly allowance of free minutes depending on the plan, then pay per minute." },
      { q: "Why does my workflow not run on a pull request from a fork?", a: "It usually does run, but with a read-only token and without secrets, and first-time contributors may need a maintainer to approve the run. Steps that need secrets, like pushing images, will fail by design." },
      { q: "How do I run a workflow by hand?", a: "Add workflow_dispatch under on. A Run workflow button then appears on the Actions tab, and you can also start it with gh workflow run ci.yml." },
      { q: "Where do I store secrets for GitHub Actions?", a: "In the repository or organization settings under Secrets and variables, Actions. Reference them as secrets.NAME inside an expression; their values are masked in logs." },
    ],
  },

  "cicd/jenkins": {
    plain: [
      "Jenkins is an open-source automation server. Companies install it on their own machines and use it to build, test and deploy code. It has been around since 2011 (it started as Hudson), so many banks, telecoms and large enterprises still run it.",
      "Jenkins has a main server, called the controller, and worker machines, called agents. The controller shows the web interface, stores job settings and decides what runs where. Agents do the actual work, like running tests or building images.",
      "Today, the pipeline is written as code in a file named Jenkinsfile, stored in the same Git repository as the app. The file lists stages, such as Test and Build, and the steps inside each stage. Changes to the pipeline then go through normal code review.",
      "Almost everything in Jenkins comes from plugins: Git support, Docker agents, credentials, Slack messages. Plugins make Jenkins very flexible, but you must keep them updated, because old plugins are a common security risk.",
    ],
    deepDive: [
      {
        heading: "Controller, agents, executors and jobs",
        body: "The controller is a Java web application (it runs on Java 17 or newer, by default on port 8080). Its home directory, usually /var/jenkins_home in the official Docker image, holds job configs, build history and plugins, so it must be backed up.\n\nAgents connect to the controller in two main ways: the controller opens an SSH connection to the agent, or the agent connects inbound to the controller (over TCP port 50000 or WebSocket). Each agent has a number of executors, the slots that run builds at the same time. Labels like linux or docker let a pipeline choose suitable agents. Agents can also be created on demand as Docker containers or Kubernetes pods and thrown away after the build.\n\nRun builds on agents, not the controller. Builds on the controller can read its files, including secrets, so the recommended setting is zero executors on the controller.",
        visual: {
          type: "layers",
          title: "Jenkins from the user down to the build",
          layers: [
            { label: "Web UI and webhooks", detail: "Users and GitHub trigger jobs" },
            { label: "Controller", detail: "Schedules builds, stores config and history" },
            { label: "Plugins", detail: "Git, credentials, Docker, Kubernetes agents" },
            { label: "Agents", detail: "Machines, containers or pods with labels" },
            { label: "Executors", detail: "Slots on an agent that each run one build" },
          ],
        },
      },
      {
        heading: "Declarative pipeline structure",
        body: "A declarative Jenkinsfile starts with pipeline and must contain agent and stages. agent any runs on any available agent; agent { label 'docker' } picks by label; agent { docker { image 'python:3.12-slim' } } runs the steps inside a container. You can also set agent none at the top and choose an agent per stage.\n\nOptional blocks give control. environment sets variables. options can add timeout(time: 30, unit: 'MINUTES') or disableConcurrentBuilds(). parameters adds inputs for manual runs. triggers can poll or run on a cron schedule, though webhooks from GitHub are better than polling.\n\nInside stages, each stage has steps such as sh, echo or junit. when decides whether a stage runs: when { branch 'main' } works in multibranch pipelines. parallel runs stages side by side. input pauses for a human to approve, which is how many teams gate production.\n\nThe older scripted pipeline (node { ... }) is plain Groovy: more freedom, but harder to read and validate.",
        bullets: ["Required: pipeline, agent, stages, stage, steps", "when { branch 'main' } limits a stage to main", "input pauses for manual approval", "options { timeout(...) } stops hung builds"],
      },
      {
        heading: "Post steps and credentials",
        body: "The post block runs after the pipeline or a stage, depending on the result. always runs every time, success and failure run on those results, unstable runs when tests failed but the build finished, changed runs when the result differs from the previous build, and cleanup runs last of all. Typical uses: publish JUnit test reports in always, send a chat message in failure, and delete the workspace in cleanup.\n\nSecrets live in the Jenkins credentials store, not in the Jenkinsfile. There are two common ways to use them. In environment, CREDS = credentials('dockerhub') for a username and password credential sets CREDS_USR and CREDS_PSW. In steps, withCredentials binds them only inside a block.\n\nJenkins masks secret values in the console log. Use single quotes in sh steps, like sh 'echo $PASS | docker login -u $USER --password-stdin', so the shell expands the variable and Groovy never puts the secret into the command string.",
        visual: {
          type: "tree",
          title: "post conditions",
          root: "post { }",
          children: [
            { label: "always", children: ["Publish test reports"] },
            { label: "success", children: ["Tag or announce the build"] },
            { label: "failure", children: ["Notify the team"] },
            { label: "unstable", children: ["Tests failed, build finished"] },
            { label: "changed", children: ["Result differs from last build"] },
            { label: "cleanup", children: ["Runs last, delete workspace"] },
          ],
        },
      },
      {
        heading: "Jenkins vs GitHub Actions in practice",
        body: "The biggest difference is who runs it. With Jenkins you own the server: installing, scaling agents, upgrading Jenkins and plugins, backups and security. In return you get full control, it works with any Git host, and it can run inside a private network with access to internal systems.\n\nGitHub Actions is hosted, needs no maintenance for GitHub-hosted runners, and shows results right on the pull request. Reusable logic is shared as actions or reusable workflows; in Jenkins it is shared as plugins or shared libraries (Groovy code loaded with @Library).\n\nConcepts map closely, which helps in interviews: a Jenkinsfile is like a workflow file, a stage is like a job or a group of steps, an agent is like a runner, credentials are like secrets, post failure is like if: failure(), and a multibranch pipeline is like on: push for every branch. Many companies migrate from Jenkins to Actions or GitLab CI, so being able to read both is valuable.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A push triggers a multibranch pipeline",
        actors: ["GitHub", "Controller", "Agent"],
        messages: [
          { from: 0, to: 1, label: "Webhook: push to feature/login" },
          { from: 1, to: 0, label: "Fetch Jenkinsfile from that branch" },
          { from: 1, to: 2, label: "Schedule build on an agent with label docker" },
          { from: 2, to: 0, label: "Checkout the code" },
          { from: 2, to: 1, label: "Stream logs and test results" },
          { from: 1, to: 0, label: "Report commit status: success" },
        ],
      },
    ],
    examples: [
      {
        title: "A Jenkinsfile with tests, credentials and test reports",
        explanation: "Step 1: a timeout stops builds that hang. Step 2: Test installs dependencies into a virtualenv, runs pytest and writes a JUnit XML report. Step 3: Push runs only on main and logs in with a stored username and password credential. Step 4: the shell, not Groovy, expands $P because the sh string uses single quotes, and Jenkins masks the value in the log. Step 5: post always publishes test results even when tests fail. The junit step comes from the JUnit plugin.",
        code: {
          lang: "groovy",
          code: `pipeline {
  agent { label 'docker' }
  options { timeout(time: 30, unit: 'MINUTES') }
  environment { IMAGE = "acme/api:\${env.GIT_COMMIT}" }
  stages {
    stage('Test') { steps { sh 'python3 -m venv .venv && .venv/bin/pip install -r requirements.txt && .venv/bin/pytest -q --junitxml=report.xml' } }
    stage('Push') {
      when { branch 'main' }
      steps { withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'U', passwordVariable: 'P')]) {
        sh 'echo $P | docker login -u $U --password-stdin && docker build -t $IMAGE . && docker push $IMAGE'
      } }
    }
  }
  post { always { junit 'report.xml' } }
}`,
        },
      },
      {
        title: "Translate the Jenkinsfile to GitHub Actions",
        explanation: "An interviewer asks how you would migrate. Step 1: the Jenkinsfile becomes .github/workflows/ci.yml. Step 2: agent label docker becomes runs-on: ubuntu-latest. Step 3: when branch main becomes an if on the job. Step 4: the credentials store becomes repository secrets. Step 5: input becomes a GitHub environment named production with required reviewers. Step 6: post always junit becomes a step with if: always() that uploads the report.",
        code: {
          lang: "text",
          code: `Jenkins                          GitHub Actions
pipeline { stages { ... } }   -> jobs: in .github/workflows/ci.yml
agent { label 'docker' }      -> runs-on: ubuntu-latest
when { branch 'main' }        -> if: github.ref == 'refs/heads/main'
withCredentials(...)          -> secrets.DOCKERHUB_TOKEN
input 'Deploy?'               -> environment: production (required reviewers)
post { always { junit } }     -> a step with if: always()
post { failure { ... } }      -> a step with if: failure()`,
        },
      },
    ],
    cheatSheet: [
      "Controller schedules and stores; agents run builds; set controller executors to 0",
      "Declarative skeleton: pipeline { agent any; stages { stage('X') { steps { ... } } } }",
      "when { branch 'main' } runs a stage only on main in a multibranch pipeline",
      "post conditions: always, success, failure, unstable, changed, cleanup",
      "environment { C = credentials('id') } gives C_USR and C_PSW for username and password",
      "Use single quotes in sh with secrets so Groovy does not interpolate them",
      "Initial admin password: /var/jenkins_home/secrets/initialAdminPassword",
      "Validate a Jenkinsfile with the Replay button or the declarative linter before committing",
    ],
    quiz: [
      {
        q: "Why should the controller have zero executors?",
        options: ["It makes the UI faster", "Builds on the controller can read its files and secrets", "Jenkins does not allow it", "Agents cannot connect otherwise"],
        answer: 1,
        why: "Isolating builds on agents protects the controller's configuration and credentials.",
      },
      {
        q: "Which post condition runs when tests failed but the build itself completed?",
        options: ["failure", "changed", "always only", "unstable"],
        answer: 3,
        why: "Jenkins marks a build UNSTABLE when test reports contain failures but the steps succeeded.",
      },
      {
        q: "In environment { CREDS = credentials('dockerhub') } with a username and password credential, which variables are created?",
        options: ["CREDS_USR and CREDS_PSW", "USER and PASS", "DOCKERHUB_USER and DOCKERHUB_TOKEN", "Only CREDS"],
        answer: 0,
        why: "Jenkins adds _USR and _PSW variables (CREDS itself holds user:password).",
      },
      {
        q: "Which step pauses a pipeline until a person approves?",
        options: ["wait", "approve", "input", "pause"],
        answer: 2,
        why: "The input step shows Proceed and Abort buttons and waits.",
      },
      {
        q: "What is the GitHub Actions equivalent of a Jenkins agent?",
        options: ["An action", "A runner", "A secret", "A workflow"],
        answer: 1,
        why: "Both are the machine that executes the steps.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run Jenkins locally in Docker, find the initial admin password and open the UI.",
        hint: "Use the jenkins/jenkins:lts image, publish port 8080, and keep jenkins_home in a volume.",
        solution: `docker run -d --name jenkins -p 8080:8080 -p 50000:50000 \\
  -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
# open http://localhost:8080 and paste the password`,
      },
      {
        level: "medium",
        task: "Write a declarative Jenkinsfile that runs lint and tests in parallel inside a python:3.12-slim container and always publishes the JUnit report.",
        hint: "A parallel block goes inside a stage; post always with junit. Docker agents run as the Jenkins user, not root, so install packages into a virtualenv in the workspace.",
        solution: `pipeline {
  agent { docker { image 'python:3.12-slim' } }
  stages {
    stage('Install') { steps { sh 'python -m venv .venv && .venv/bin/pip install -r requirements.txt ruff pytest' } }
    stage('Checks') { parallel {
      stage('Lint') { steps { sh '.venv/bin/ruff check .' } }
      stage('Test') { steps { sh '.venv/bin/pytest -q --junitxml=report.xml' } }
    } }
  }
  post { always { junit 'report.xml' } }
}`,
      },
      {
        level: "hard",
        task: "Add a production deploy stage that runs only on main, asks for approval with a 1-hour limit, and sends a failure notice if anything in the pipeline fails.",
        hint: "Wrap input in timeout inside the stage; put failure in the top-level post block.",
        solution: `stage('Deploy prod') {
  when { branch 'main' }
  steps {
    timeout(time: 1, unit: 'HOURS') { input message: 'Deploy to production?', ok: 'Deploy' }
    sh './deploy.sh prod'
  }
}
// at pipeline level:
post { failure { echo "Build \${env.BUILD_NUMBER} failed: \${env.BUILD_URL}" } }`,
      },
    ],
    faq: [
      { q: "Is Jenkins still worth learning in 2026?", a: "Yes, as a second CI tool. Many large companies still run Jenkins, and interviews often ask about Jenkinsfiles, but new projects more often start on GitHub Actions or GitLab CI." },
      { q: "What is the difference between declarative and scripted pipelines?", a: "Declarative pipelines use a fixed structure (pipeline, agent, stages, post) that is easier to read and validate. Scripted pipelines are plain Groovy inside node blocks and allow any logic, at the cost of readability." },
      { q: "What is a multibranch pipeline?", a: "A job type that scans a repository and creates a pipeline for every branch (and pull request) that has a Jenkinsfile. It is what makes when { branch 'main' } meaningful." },
      { q: "How do I keep Jenkins secure?", a: "Keep Jenkins and its plugins updated, run builds only on agents, store secrets in the credentials store, and limit who can configure jobs. Remove plugins you do not use." },
    ],
  },
};

export default extra;

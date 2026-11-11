import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "actions-advanced/gha-reuse": {
    plain: [
      "Once a team has ten repos, it often has ten nearly identical CI files. When you want to change one thing, like the Python version or a security scan, you edit ten files and forget two. Reuse fixes that: write the pipeline once, and let every repo call it.",
      "GitHub offers two tools. A reusable workflow is a whole workflow (one or more jobs) that other workflows can call, like a function. A composite action is a bundle of steps that you use as a single step inside your own job.",
      "Think of it like cooking. A reusable workflow is ordering the full set menu: the kitchen runs every course for you. A composite action is a spice mix: you still cook your own meal, you just add the same blend every time.",
      "Both take inputs, so each repo can adjust details like the version or the folder. Both should be versioned with tags, so a change in the shared copy reaches each repo only when that repo chooses to upgrade.",
    ],
    deepDive: [
      {
        heading: "What happens when a workflow calls another",
        body: "A caller job has uses: OWNER/REPO/.github/workflows/FILE.yml@REF (or ./.github/workflows/FILE.yml for the same repo) instead of runs-on and steps. GitHub loads the called file at that ref and runs its jobs as part of the caller's run; in the UI they appear nested under the caller job.\n\nThe called workflow sees the caller's world. The github context is the caller's, so github.repository is the calling repo and actions/checkout checks out the caller's code. The GITHUB_TOKEN permissions can only stay the same or be reduced inside the called workflow, never raised. Environment variables set with env: in the caller are not passed down; use inputs instead.",
        visual: {
          type: "sequence",
          title: "Calling a shared workflow",
          actors: ["Caller repo", "GitHub", "Shared repo", "Runner"],
          messages: [
            { from: 0, to: 1, label: "Job uses acme/ci/...python-ci.yml@v1" },
            { from: 1, to: 2, label: "Load workflow file at tag v1" },
            { from: 1, to: 1, label: "Check inputs, secrets, permissions" },
            { from: 1, to: 3, label: "Run called jobs in the caller's context" },
            { from: 3, to: 1, label: "Job outputs and results" },
            { from: 1, to: 0, label: "Outputs available via needs" },
          ],
        },
      },
      {
        heading: "Inputs, secrets and outputs",
        body: "Under on: workflow_call you declare inputs with a type (string, number or boolean), plus required or default. Secrets are declared separately and the caller passes them with secrets:, or with secrets: inherit to pass all of its secrets (only within the same organization or enterprise). Outputs map to job outputs: value: ${{ jobs.build.outputs.image }}.\n\nThe caller job may also use with, needs, if, permissions, concurrency and strategy, so a matrix can call the same workflow several times. One subtle rule: if the called job sets environment:, it receives that environment's secrets from the caller repo, not values passed through workflow_call. That is actually convenient for deploy workflows.",
        bullets: [
          "Caller keys: uses, with, secrets, needs, if, permissions, strategy, concurrency",
          "Not allowed on a caller job: runs-on and steps",
          "Inputs are typed; workflow_call has no choice type",
        ],
      },
      {
        heading: "Composite actions in detail",
        body: "A composite action is a folder with an action.yml whose runs: section says using: composite and lists steps. Each run: step must set shell: explicitly, because there is no default inside a composite action. Steps read inputs with ${{ inputs.NAME }}, and outputs map a step output with value:. Scripts stored next to action.yml are reachable through ${{ github.action_path }}.\n\nComposite actions run inside the caller's job, on the same runner and workspace, so they see the checked-out files and the job's environment. They cannot read the secrets context directly; pass secrets in as inputs. In the log they show as one step that you can expand. Reference them as OWNER/REPO/PATH@REF, or ./path/to/action for a local one, which requires actions/checkout to run first.",
      },
      {
        heading: "Sharing across repos and versioning",
        body: "A reusable workflow or action in a public repo can be used by anyone. For private or internal repos, open the shared repo's Settings, Actions, General, and under Access allow repositories in the organization (or enterprise) to use it. The calling repos need no extra token.\n\nTreat the shared repo like a library. Tag releases like v1.3.0 and move a major tag v1 to the newest compatible one. Callers on @v1 get fixes automatically; breaking changes go to v2. Security-sensitive callers can pin a full commit SHA instead, and Dependabot can keep that pin up to date. Avoid @main: one bad commit would break every repo at the same moment.",
        visual: {
          type: "tree",
          title: "A shared CI repository",
          root: "acme/ci",
          children: [
            { label: ".github/workflows/", children: ["python-ci.yml (workflow_call)", "deploy.yml (workflow_call)"] },
            { label: "actions/setup-app/", children: ["action.yml (composite)", "install.sh"] },
            { label: "Tags", children: ["v1.3.0, v1.3.1", "v1 moves to the latest 1.x"] },
            { label: "Settings, Actions, Access", children: ["Allow repos in the organization"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Levels of reuse, from big to small",
        layers: [
          { label: "Reusable workflow", detail: "Whole pipeline: jobs, runners, environments" },
          { label: "Job in your workflow", detail: "Your own runs-on and steps" },
          { label: "Composite action", detail: "A bundle of steps used as one step" },
          { label: "JavaScript or Docker action", detail: "Custom code behind one step" },
          { label: "Shell script in the repo", detail: "Smallest reuse: run: ./scripts/x.sh" },
        ],
      },
    ],
    examples: [
      {
        title: "A shared deploy workflow with inputs, secrets and an output",
        explanation: "Every service deploys the same way. Step 1: in acme/ci, declare a required environment input, a required secret and an output. Step 2: the job uses environment: from the input, so the caller repo's environment rules and secrets apply. Step 3: a step writes the deployed URL as an output. Step 4: each service calls it with a single job (shown in the last comment line) and can read needs.prod.outputs.url.",
        code: {
          lang: "yaml",
          code: `on:
  workflow_call:
    inputs: { environment: { type: string, required: true } }
    secrets: { DEPLOY_TOKEN: { required: true } }
    outputs: { url: { value: "\${{ jobs.deploy.outputs.url }}" } }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: \${{ inputs.environment }}
    outputs: { url: "\${{ steps.d.outputs.url }}" }
    steps:
      - uses: actions/checkout@v4
      - id: d
        run: ./deploy.sh "\${{ inputs.environment }}" && echo "url=https://\${{ inputs.environment }}.example.com" >> "$GITHUB_OUTPUT"
        env: { TOKEN: "\${{ secrets.DEPLOY_TOKEN }}" }
# caller: prod: { uses: acme/ci/.github/workflows/deploy.yml@v1, with: { environment: production }, secrets: inherit }`,
        },
      },
      {
        title: "A composite action that sets up a Python app",
        explanation: "Five workflows start with the same three steps. Step 1: create .github/actions/setup-app/action.yml with an input for the Python version. Step 2: list the steps; the run step needs shell: bash. Step 3: expose setup-python's output as the action's output. Step 4: in each workflow, after actions/checkout, replace the three steps with one uses: ./.github/actions/setup-app.",
        code: {
          lang: "yaml",
          code: `name: Setup app
description: Install Python, cache pip and install dependencies
inputs:
  python-version: { description: Python version, default: "3.13" }
outputs:
  python-path: { description: Python used, value: "\${{ steps.py.outputs.python-path }}" }
runs:
  using: composite
  steps:
    - id: py
      uses: actions/setup-python@v5
      with: { python-version: "\${{ inputs.python-version }}", cache: pip }
    - run: pip install -r requirements.txt
      shell: bash`,
        },
      },
    ],
    cheatSheet: [
      "Call a reusable workflow at job level: uses: OWNER/REPO/.github/workflows/FILE.yml@v1",
      "A caller job cannot have runs-on or steps; it can have with, secrets, needs, if, strategy",
      "secrets: inherit passes all caller secrets, within the same organization or enterprise",
      "Every run step in a composite action needs shell:",
      "${{ github.action_path }} points to the composite action's own folder",
      "Private shared repos: Settings, Actions, General, Access, allow the organization",
      "Pin shared workflows to a tag or SHA, never @main",
      "Caller env: values are not passed to the called workflow; use inputs",
    ],
    quiz: [
      {
        q: "In a called reusable workflow, what does github.repository contain?",
        options: ["The shared repo that holds the workflow", "The calling repository", "Nothing, the github context is empty", "The organization name only"],
        answer: 1,
        why: "The github context always belongs to the caller, so checkout gets the caller's code.",
      },
      {
        q: "Your composite action's run step fails validation. What is the most likely cause?",
        options: ["It uses inputs", "It runs a script", "It is in a subfolder", "It is missing shell:"],
        answer: 3,
        why: "Composite run steps have no default shell, so shell: is required.",
      },
      {
        q: "The caller sets permissions: contents: read. The called workflow asks for contents: write. What happens?",
        options: ["The called workflow cannot raise permissions above the caller's", "It gets write", "It gets admin", "Permissions are ignored in reusable workflows"],
        answer: 0,
        why: "Permissions can only be kept or reduced down the call chain.",
      },
      {
        q: "You need the same three setup steps inside many existing jobs. Which tool fits best?",
        options: ["A reusable workflow", "A new repository per job", "A composite action", "A scheduled workflow"],
        answer: 2,
        why: "Composite actions bundle steps and run inside the job that uses them.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Turn your repo's test job into a reusable workflow in the same repo and call it from ci.yml.",
        hint: "Move the job into .github/workflows/test.yml with on: workflow_call, then call it with uses: ./.github/workflows/test.yml.",
        solution: `# .github/workflows/test.yml
on: workflow_call
jobs:
  test:
    runs-on: ubuntu-latest
    steps: [{ uses: actions/checkout@v4 }, { run: make test }]
# .github/workflows/ci.yml
on: [pull_request]
jobs:
  test:
    uses: ./.github/workflows/test.yml`,
      },
      {
        level: "medium",
        task: "Call the same reusable workflow for three Python versions using a matrix in the caller.",
        hint: "Caller jobs can use strategy.matrix and pass the value with with:.",
        solution: `jobs:
  test:
    strategy:
      matrix: { python: ["3.11", "3.12", "3.13"] }
    uses: acme/ci/.github/workflows/python-ci.yml@v1
    with:
      python-version: \${{ matrix.python }}`,
      },
      {
        level: "hard",
        task: "Return the built image tag from a reusable build workflow and use it in a deploy job of the caller.",
        hint: "Map a step output to a job output, then to on.workflow_call.outputs; read it with needs.",
        solution: `# called: on.workflow_call.outputs:
#   image: { value: "\${{ jobs.build.outputs.image }}" }
# and in jobs.build: outputs: { image: "\${{ steps.b.outputs.image }}" }
# caller:
jobs:
  build:
    uses: acme/ci/.github/workflows/build.yml@v1
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: echo "Deploying \${{ needs.build.outputs.image }}"`,
      },
    ],
    faq: [
      { q: "Reusable workflow or composite action: which should I use?", a: "Use a reusable workflow to share a whole pipeline, including runners and environments. Use a composite action to share a few steps that run inside jobs you already have." },
      { q: "Can a reusable workflow call another reusable workflow?", a: "Yes, nesting is allowed up to a fixed depth. Keep it shallow, because deep chains are hard to debug and permissions can only shrink at each level." },
      { q: "Do I need a token to use workflows from a private repo in my organization?", a: "No. Allow access in the shared repo's Actions settings, and repos in the organization can reference it directly." },
    ],
  },

  "actions-advanced/gha-custom": {
    plain: [
      "Sometimes no Marketplace action does exactly what you need, and a long shell script in every workflow is hard to maintain. A custom action packages your logic behind a clean interface: a few named inputs go in, a few outputs come out, and users write a single uses: line.",
      "Every action has a metadata file called action.yml. It is the action's label: name, description, inputs, outputs, and how it runs. GitHub reads this file to know what to start.",
      "There are three kinds. JavaScript actions run directly with the Node.js that is already on the runner, so they start fast and work on Linux, Windows and macOS. Docker actions run in a container, so you can use any language, but only on Linux. Composite actions are just a list of steps.",
      "When it works, you tag a version and others can use it, either from your organization or from the public GitHub Marketplace. Like any library, you keep it stable, document the inputs, and use version numbers so users know when an upgrade might break them.",
    ],
    deepDive: [
      {
        heading: "action.yml in detail",
        body: "inputs: each has a description and may have required and default. Inside the action they arrive as environment variables named INPUT_ plus the input name in capitals with spaces turned into underscores, which is what core.getInput reads. All inputs are strings; getBooleanInput accepts true or false in the usual YAML spellings. outputs: list names and descriptions (composite actions also need value:).\n\nruns: for JavaScript says using: node20 or node24 and main: dist/index.js, with optional pre: and post: scripts that run before and after the job, handy for cleanup. For Docker it says using: docker and image:, plus optional args and entrypoint. branding: sets an icon and color for the Marketplace listing.",
        bullets: [
          "Input who-to-greet becomes env INPUT_WHO-TO-GREET",
          "post: runs at the end of the job, even after failures by default",
          "core.saveState and core.getState pass data from main to post",
        ],
      },
      {
        heading: "The toolkit and bundling",
        body: "GitHub publishes npm packages for action authors. @actions/core reads inputs, sets outputs, fails the step (setFailed), masks values (setSecret), writes warning and error annotations that show on the PR, groups log lines and writes job summaries. @actions/github gives you the event context and an authenticated Octokit client. @actions/exec runs commands, @actions/io moves files, and @actions/tool-cache downloads and caches tools.\n\nThe runner does not run npm install for your action. It downloads the repo at the tag and runs the main file. So you bundle your code and all dependencies into one file with a tool such as @vercel/ncc, esbuild or Rollup, and commit dist/. A small CI check that rebuilds and runs git diff --exit-code dist/ catches a forgotten rebuild.",
        visual: {
          type: "layers",
          title: "What runs when a JavaScript action is used",
          layers: [
            { label: "Workflow step", detail: "uses: acme/size-label@v1 with inputs" },
            { label: "action.yml", detail: "runs: using: node24, main: dist/index.js" },
            { label: "dist/index.js", detail: "Your code bundled with its dependencies" },
            { label: "Toolkit calls", detail: "getInput, Octokit, setOutput" },
            { label: "Runner", detail: "INPUT_* env vars, GITHUB_OUTPUT file, token" },
          ],
        },
      },
      {
        heading: "Docker actions: rules that trip people up",
        body: "With image: Dockerfile, the runner builds the image at the start of every job that uses the action, which adds time. With image: docker://ghcr.io/acme/tool:1.2, it only pulls a prebuilt image, which is faster. Either way, Docker actions need a Linux runner with Docker.\n\nThe runner mounts the workspace into the container at /github/workspace and sets the working directory itself, so GitHub recommends not using WORKDIR in your Dockerfile. The container must run as the default user (root), because the mounted files and the GITHUB_OUTPUT file must be writable. Inputs reach the container as INPUT_* variables, and you can also pass them as args in action.yml. Write outputs by appending to $GITHUB_OUTPUT, just like in a run step.",
      },
      {
        heading: "Testing and releasing an action",
        body: "Test at two levels. Unit tests (for example with Jest or Vitest) call your functions with a mocked @actions/core. Integration tests run the real action in a workflow of its own repo with uses: ./, then check its outputs in a later step. For a JavaScript action, run that workflow on a matrix of ubuntu, windows and macos to catch path and shell differences.\n\nRelease with semantic version tags. Push v1.4.0, then move the major tag: git tag -f v1 v1.4.0 and git push -f origin v1. Users on @v1 get the update. Publishing to the Marketplace needs a public repo with action.yml at the root and a unique action name; you tick the publish option when drafting a GitHub Release.",
        visual: {
          type: "cycle",
          title: "Action maintenance loop",
          steps: [
            { label: "Change code", detail: "Plus unit tests" },
            { label: "Rebuild dist", detail: "CI checks dist is current" },
            { label: "Test with uses: ./", detail: "Matrix of runner OSes" },
            { label: "Tag v1.x.y", detail: "Move v1 to it" },
            { label: "Users upgrade", detail: "Issues and feedback" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A JavaScript action at run time",
        actors: ["Runner", "Action code", "GitHub API"],
        messages: [
          { from: 0, to: 0, label: "Download action repo at tag v1" },
          { from: 0, to: 1, label: "node dist/index.js with INPUT_* vars" },
          { from: 1, to: 2, label: "Octokit call with the token input" },
          { from: 2, to: 1, label: "API response" },
          { from: 1, to: 0, label: "setOutput writes to GITHUB_OUTPUT" },
          { from: 0, to: 0, label: "Exit code 0 is success; setFailed is failure" },
        ],
      },
    ],
    examples: [
      {
        title: "A JavaScript action that labels pull requests by size",
        explanation: "Reviewers want to see at a glance how big a PR is. Step 1: action.yml declares a required token input and a label output, using node24 with main: dist/index.js. Step 2: the code reads the PR from the event payload and counts added plus deleted lines. Step 3: it adds size/S, size/M or size/L through Octokit. Step 4: any error fails the step clearly. The package uses \"type\": \"module\" so top-level await works; bundle with npx @vercel/ncc build src/index.js -o dist.",
        code: {
          lang: "javascript",
          code: `import * as core from "@actions/core";
import * as github from "@actions/github";

try {
  const octokit = github.getOctokit(core.getInput("token", { required: true }));
  const pr = github.context.payload.pull_request;
  if (!pr) throw new Error("Run this action on pull_request events");
  const size = pr.additions + pr.deletions;
  const label = size < 100 ? "size/S" : size < 500 ? "size/M" : "size/L";
  await octokit.rest.issues.addLabels({ ...github.context.repo, issue_number: pr.number, labels: [label] });
  core.setOutput("label", label);
} catch (err) {
  core.setFailed(err instanceof Error ? err.message : String(err));
}`,
        },
      },
      {
        title: "A small Docker action that runs ShellCheck",
        explanation: "You want a reusable linter for shell scripts. Step 1: action.yml says using: docker with image: Dockerfile and passes the path input as an argument. Step 2: the Dockerfile installs shellcheck on a small Alpine image, with no WORKDIR. Step 3: entrypoint.sh (executable, starting with #!/bin/sh) finds every .sh file under the path and runs shellcheck on them. A non-zero exit fails the step.",
        code: {
          lang: "text",
          code: `# action.yml
name: shellcheck-dir
description: Run ShellCheck on every .sh file in a folder
inputs:
  path: { description: Folder to scan, default: "." }
runs:
  using: docker
  image: Dockerfile
  args: ["\${{ inputs.path }}"]
# Dockerfile
FROM alpine:3.20
RUN apk add --no-cache shellcheck findutils
COPY entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
# entrypoint.sh: find "$1" -name '*.sh' -print0 | xargs -0 -r shellcheck`,
        },
      },
    ],
    cheatSheet: [
      "Inputs reach the action as INPUT_NAME env vars; core.getInput reads them",
      "runs.using: node20 or node24 for JavaScript, docker for containers, composite for steps",
      "Commit the bundled dist/ file; the runner never installs your dependencies",
      "npx @vercel/ncc build src/index.js -o dist bundles code and node_modules",
      "core.setFailed(message) marks the step failed with a clear error",
      "Docker actions: Linux runners only, run as root, avoid WORKDIR",
      "Release: tag v1.2.3, then git tag -f v1 v1.2.3 && git push -f origin v1",
      "Test locally in the action's repo with uses: ./",
    ],
    quiz: [
      {
        q: "Which action type works on Linux, Windows and macOS runners and starts fastest?",
        options: ["Docker action", "JavaScript action", "Any action with a Dockerfile", "Only composite actions"],
        answer: 1,
        why: "JavaScript actions run on the Node.js already on every runner, with no container to build or pull.",
      },
      {
        q: "Users of your JavaScript action get \"Cannot find module @actions/core\". What went wrong?",
        options: ["The runner is too old", "The input name is wrong", "The token lacks permissions", "dist was not bundled and committed, so dependencies are missing"],
        answer: 3,
        why: "The runner runs your main file directly and does not run npm install.",
      },
      {
        q: "How does a Docker action write an output?",
        options: ["Append name=value to the file in $GITHUB_OUTPUT", "Print it to stderr", "Set an environment variable OUTPUT_NAME", "Write to /github/outputs.json"],
        answer: 0,
        why: "The output file is available inside the container, the same as in run steps.",
      },
      {
        q: "Why move a major tag like v1 after each release?",
        options: ["GitHub requires it", "It deletes old releases", "Users on @v1 receive compatible fixes without editing their workflows", "It speeds up the action"],
        answer: 2,
        why: "A moving major tag is the convention for delivering non-breaking updates.",
      },
      {
        q: "Your action must clean up a temporary resource even if later steps fail. Where does that code go?",
        options: ["In main, at the end", "In a post: script declared in action.yml", "In a separate workflow", "In branding:"],
        answer: 1,
        why: "post: runs at the end of the job, which makes it the place for cleanup.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write action.yml for a JavaScript action called hello with a required input name and an output greeting.",
        hint: "You need name, description, inputs, outputs and runs with using and main.",
        solution: `name: hello
description: Greets someone
inputs:
  name: { description: Who to greet, required: true }
outputs:
  greeting: { description: The greeting text }
runs:
  using: node24
  main: dist/index.js`,
      },
      {
        level: "medium",
        task: "Implement the hello action, bundle it, and test it in the same repo, printing the output in a later step.",
        hint: "Use core.getInput and core.setOutput, bundle with ncc, then uses: ./ with an id.",
        solution: `// src/index.js
import * as core from "@actions/core";
const g = \`Hello, \${core.getInput("name", { required: true })}!\`;
core.info(g);
core.setOutput("greeting", g);
// npm i @actions/core && npx @vercel/ncc build src/index.js -o dist
// .github/workflows/test.yml steps:
//   - uses: actions/checkout@v4
//   - { id: hi, uses: ./, with: { name: Ada } }
//   - run: echo "\${{ steps.hi.outputs.greeting }}"`,
      },
      {
        level: "hard",
        task: "Add a CI job that fails if dist/ is out of date, and write the commands to release v1.1.0 and move v1.",
        hint: "Rebuild in CI and compare with git diff --exit-code.",
        solution: `# .github/workflows/check-dist.yml job steps:
#   - uses: actions/checkout@v4
#   - uses: actions/setup-node@v4
#     with: { node-version: 24, cache: npm }
#   - run: npm ci && npm run build && git diff --exit-code dist/
# release:
git tag -a v1.1.0 -m "v1.1.0"
git push origin v1.1.0
git tag -f v1 v1.1.0
git push -f origin v1
gh release create v1.1.0 --generate-notes`,
      },
    ],
    faq: [
      { q: "Should I write my action in JavaScript or TypeScript?", a: "TypeScript is popular because the toolkit ships with types; it compiles to JavaScript before bundling. GitHub's official action templates offer both." },
      { q: "Can a Docker action run on Windows or macOS runners?", a: "No. Docker container actions only run on Linux runners. Use a JavaScript or composite action if users need other operating systems." },
      { q: "How do users get a token into my action?", a: "Declare an input like token with default ${{ github.token }}, so it works out of the box but can be overridden with a different token." },
      { q: "Does publishing to the Marketplace cost anything?", a: "No. You need a public repo with action.yml at the root and a unique name, and you choose to publish when you draft a release." },
    ],
  },

  "actions-advanced/gha-oidc": {
    plain: [
      "The old way to deploy from CI was to create a cloud access key, paste it into a GitHub secret, and hope it never leaks. Those keys often live for years. If one is copied from a log or a laptop, an attacker can use it until someone notices.",
      "OIDC (OpenID Connect) replaces the stored key with a short-lived ID card. When a job needs cloud access, it asks GitHub for a signed token that says, in effect, \"I am a workflow in repo acme/api, running on main, for the production environment\". The token is valid only for a few minutes.",
      "The cloud provider checks GitHub's signature and compares the details with a trust rule you wrote, like \"only acme/api in the production environment may use this role\". If they match, it hands back temporary credentials, usually valid for an hour.",
      "So nothing permanent is stored in GitHub, there is nothing to rotate, and a stolen token is useless minutes later. AWS, Azure and Google Cloud all support this, and each has an official login action that does the exchange for you.",
    ],
    deepDive: [
      {
        heading: "What is inside the token",
        body: "The ID token is a JWT (JSON Web Token): a small JSON document signed by GitHub. Its issuer (iss) is https://token.actions.githubusercontent.com, and GitHub publishes the public keys at that address so any cloud can verify the signature. The audience (aud) says who the token is for, such as sts.amazonaws.com for AWS.\n\nThe claims describe the run: repository, repository_owner, ref, event_name, environment, actor, workflow and job_workflow_ref (the exact reusable workflow file and ref), plus numeric IDs like repository_id. The most important claim is sub (subject), which combines the repo with the branch, tag, environment or pull request. Trust rules usually match on sub and aud.",
        visual: {
          type: "tree",
          title: "Key claims in a GitHub OIDC token",
          root: "ID token (JWT)",
          children: [
            { label: "iss", children: ["https://token.actions.githubusercontent.com"] },
            { label: "aud", children: ["sts.amazonaws.com for AWS", "Set per cloud or action"] },
            { label: "sub", children: ["repo:acme/api:environment:production", "repo:acme/api:ref:refs/heads/main"] },
            { label: "Context claims", children: ["repository, ref, event_name", "environment, actor", "job_workflow_ref"] },
            { label: "Stable IDs", children: ["repository_id", "repository_owner_id"] },
          ],
        },
      },
      {
        heading: "How the sub claim is built",
        body: "The format depends on the job. If the job uses an environment, sub is repo:OWNER/REPO:environment:NAME, and the branch is not part of it. Otherwise, for a branch push it is repo:OWNER/REPO:ref:refs/heads/BRANCH, for a tag repo:OWNER/REPO:ref:refs/tags/TAG, and for a pull_request event repo:OWNER/REPO:pull_request.\n\nThis matters when you write trust rules. If your deploy job has environment: production, a rule that expects ref:refs/heads/main never matches. Matching on the environment is usually best, because the environment's own branch rules and reviewers then also guard the cloud role. Organizations can customise the sub template through the API, for example to add repository_id, which protects against someone recreating a deleted repo with the same name.",
        bullets: [
          "Environment job: repo:acme/api:environment:production",
          "Branch: repo:acme/api:ref:refs/heads/main",
          "Tag: repo:acme/api:ref:refs/tags/v1.2.0",
          "Pull request: repo:acme/api:pull_request",
        ],
      },
      {
        heading: "Setting it up on AWS, Azure and Google Cloud",
        body: "AWS: create an IAM OIDC identity provider for https://token.actions.githubusercontent.com with audience sts.amazonaws.com, then an IAM role whose trust policy allows sts:AssumeRoleWithWebIdentity with conditions on the aud and sub claims. Use aws-actions/configure-aws-credentials with role-to-assume. Sessions last one hour by default (role-duration-seconds changes it).\n\nAzure: add a federated credential to an app registration or a user-assigned managed identity, with the GitHub issuer, the exact subject and audience api://AzureADTokenExchange, then use azure/login with client-id, tenant-id and subscription-id. Google Cloud: create a Workload Identity Pool with an OIDC provider, map claims such as google.subject=assertion.sub and attribute.repository=assertion.repository, add an attribute condition that limits it to your organization, and use google-github-actions/auth.",
        visual: {
          type: "compare",
          title: "Trust setup by cloud",
          columns: [
            { title: "AWS", points: ["IAM OIDC identity provider", "Role trust policy on aud and sub", "aud: sts.amazonaws.com", "configure-aws-credentials"] },
            { title: "Azure", points: ["Federated credential on app or identity", "Exact subject match", "aud: api://AzureADTokenExchange", "azure/login"] },
            { title: "Google Cloud", points: ["Workload Identity Pool and provider", "Attribute mapping and condition", "Grant roles to the pool principal", "google-github-actions/auth"] },
          ],
        },
      },
      {
        heading: "Permissions and other gotchas",
        body: "The job needs permissions: id-token: write. But once you write a permissions block, every permission you do not list becomes none. So add contents: read as well, or actions/checkout fails on a private repo. In a reusable workflow, the caller must grant id-token: write, because a called workflow cannot raise permissions.\n\nPull requests from forks never get id-token: write, so they cannot reach your cloud, which is what you want. Be careful with wildcards: a trust condition like repo:acme/* lets every repo in the org, including any new one, assume the role. Give each role only the cloud permissions that one deployment needs, and use separate roles for staging and production.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Stored keys vs OIDC",
        columns: [
          { title: "Long-lived access keys", points: ["Created by hand, live for months", "Stored as GitHub secrets", "Anyone who reads it can use it anywhere", "Must be rotated and audited"] },
          { title: "OIDC federation", points: ["Token minted per job", "Nothing stored in GitHub", "Only works for matching repo and environment", "Credentials expire on their own"] },
        ],
      },
    ],
    examples: [
      {
        title: "An AWS trust policy locked to one environment",
        explanation: "Only the production environment of acme/api may deploy. Step 1: the Principal is the GitHub OIDC provider in your account. Step 2: StringEquals checks the audience is sts.amazonaws.com. Step 3: StringEquals checks sub is exactly the production environment of this repo; because the job uses environment: production, the branch is not in sub. Step 4: in the workflow, grant id-token: write and pass this role's ARN to configure-aws-credentials.",
        code: {
          lang: "json",
          code: `{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Federated": "arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com" },
    "Action": "sts:AssumeRoleWithWebIdentity",
    "Condition": {
      "StringEquals": {
        "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
        "token.actions.githubusercontent.com:sub": "repo:acme/api:environment:production"
      }
    }
  }]
}`,
        },
      },
      {
        title: "Deploy to Cloud Run with Workload Identity Federation",
        explanation: "The same idea on Google Cloud. Step 1: permissions grant id-token: write and contents: read. Step 2: google-github-actions/auth exchanges the GitHub token using your pool provider and impersonates a deployer service account. Step 3: setup-gcloud installs the CLI, which picks up the temporary credentials. Step 4: gcloud deploys the image built for this commit. No JSON key file is stored anywhere.",
        code: {
          lang: "yaml",
          code: `permissions: { contents: read, id-token: write }
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          workload_identity_provider: projects/123456789/locations/global/workloadIdentityPools/github/providers/acme
          service_account: deployer@acme-prod.iam.gserviceaccount.com
      - uses: google-github-actions/setup-gcloud@v2
      - run: gcloud run deploy api --image "$IMAGE" --region europe-west1
        env: { IMAGE: "europe-west1-docker.pkg.dev/acme-prod/app/api:\${{ github.sha }}" }`,
        },
      },
    ],
    cheatSheet: [
      "OIDC needs permissions: id-token: write; add contents: read for checkout",
      "Issuer: https://token.actions.githubusercontent.com; AWS audience: sts.amazonaws.com",
      "With environment: set, sub is repo:OWNER/REPO:environment:NAME",
      "Without an environment, sub is repo:OWNER/REPO:ref:refs/heads/BRANCH",
      "Azure federated credentials use audience api://AzureADTokenExchange",
      "Never trust repo:ORG/* in a production role; match one repo and environment",
      "Forked pull requests cannot get an OIDC token",
      "AWS sessions from configure-aws-credentials last 1 hour by default",
    ],
    quiz: [
      {
        q: "A deploy job has environment: production. Which sub value will its token carry?",
        options: ["repo:acme/api:ref:refs/heads/main", "repo:acme/api:pull_request", "repo:acme/api", "repo:acme/api:environment:production"],
        answer: 3,
        why: "When a job targets an environment, the sub claim uses the environment instead of the ref.",
      },
      {
        q: "You add permissions: id-token: write and now actions/checkout fails on a private repo. Why?",
        options: ["OIDC disables checkout", "Listing any permission sets all unlisted ones to none, so contents is no longer readable", "The token expired", "Checkout needs id-token: read"],
        answer: 1,
        why: "Add contents: read alongside id-token: write.",
      },
      {
        q: "Which part of the setup decides which repos may assume an AWS role?",
        options: ["The trust policy conditions on aud and sub", "The GitHub repository secret", "The permissions policy on S3", "The runner label"],
        answer: 0,
        why: "STS only issues credentials when the token's claims satisfy the role's trust policy.",
      },
      {
        q: "Why is a trust condition of repo:acme/* risky?",
        options: ["It is not valid syntax", "It only works for public repos", "Every repo in the org, including new ones, could assume the role", "It blocks the main branch"],
        answer: 2,
        why: "A wildcard on the repo name gives any repository under acme the same cloud access.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write the permissions block for a job that checks out a private repo and logs in to AWS with OIDC, with nothing extra.",
        hint: "Two permissions are needed.",
        solution: "permissions:\n  contents: read\n  id-token: write",
      },
      {
        level: "medium",
        task: "Change the AWS trust policy so that pushes to main and any tag starting with v can assume the role, but nothing else.",
        hint: "Use StringLike with a list of sub values; wildcards are allowed there.",
        solution: `"Condition": {
  "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
  "StringLike": {
    "token.actions.githubusercontent.com:sub": [
      "repo:acme/api:ref:refs/heads/main",
      "repo:acme/api:ref:refs/tags/v*"
    ]
  }
}`,
      },
      {
        level: "hard",
        task: "Your role assumption fails with \"Not authorized to perform sts:AssumeRoleWithWebIdentity\". Print the token's sub and aud claims in a debug run without printing the token itself.",
        hint: "The runner exposes ACTIONS_ID_TOKEN_REQUEST_URL and ACTIONS_ID_TOKEN_REQUEST_TOKEN when id-token: write is granted. Decode the JWT payload.",
        solution: `- run: |
    JWT=$(curl -sS -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \\
      "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=sts.amazonaws.com" | jq -r .value)
    python3 -c '
    import sys, json, base64
    p = sys.argv[1].split(".")[1]; p += "=" * (-len(p) % 4)
    c = json.loads(base64.urlsafe_b64decode(p))
    print("sub:", c["sub"]); print("aud:", c["aud"])' "$JWT"
# compare the printed sub with the trust policy condition`,
      },
    ],
    faq: [
      { q: "Do I still need any secrets with OIDC?", a: "Not for the cloud credentials. You pass identifiers such as a role ARN or client ID, which are not secret, though many teams store them as variables for convenience." },
      { q: "Does OIDC work with self-hosted runners?", a: "Yes. The token comes from GitHub's service, not from the runner, so any runner can request it when the job has id-token: write." },
      { q: "How long do the credentials last?", a: "The GitHub token itself is short-lived. The cloud credentials depend on the provider and settings; on AWS the default session from configure-aws-credentials is one hour." },
      { q: "Can I use OIDC with services other than the big three clouds?", a: "Yes. Vault, PyPI trusted publishing, npm trusted publishing and many other services accept GitHub's OIDC tokens." },
    ],
  },

  "actions-advanced/gha-release": {
    plain: [
      "A release is a named, frozen version of your software that people can rely on. Instead of \"whatever is on main today\", users get v1.4.0, with a list of what changed and files or images they can download. Automating releases makes them boring, which is exactly what you want.",
      "Version numbers carry a promise. In semantic versioning, MAJOR.MINOR.PATCH, a patch (1.4.1) only fixes bugs, a minor (1.5.0) adds features without breaking anything, and a major (2.0.0) may break existing users. Users decide whether to upgrade based on that number.",
      "A changelog tells people what changed. Writing it by hand is easy to forget, so tools build it from commit messages or merged pull requests. That only works if commit messages follow a simple pattern, like feat: for features and fix: for fixes.",
      "Publishing is the last step: push a package to a registry or a container image to GitHub Container Registry (GHCR), and create the GitHub Release page. A workflow does it the same way every time, triggered by a tag or by merging a release pull request.",
    ],
    deepDive: [
      {
        heading: "Semantic versioning details",
        body: "Below 1.0.0, anything may change at any time, so 0.x versions make no stability promise. Pre-releases add a hyphen: 2.0.0-rc.1 comes before 2.0.0, and package managers do not install pre-releases unless asked. Build metadata after a plus, like 1.4.0+build.42, is ignored when comparing versions.\n\nGit tags carry the version. Use annotated tags (git tag -a v1.4.0 -m \"v1.4.0\") because they record who tagged and when, and can be signed with -s. The v prefix is a convention, not part of semver. Once a version is published, never move or reuse its tag: people and caches have already pulled it, and a different artifact under the same version causes confusing bugs.",
        bullets: [
          "Breaking change: bump MAJOR, reset MINOR and PATCH to 0",
          "New feature: bump MINOR, reset PATCH",
          "Bug fix: bump PATCH",
          "git describe --tags shows the latest tag reachable from HEAD",
        ],
      },
      {
        heading: "From commits to a changelog",
        body: "Conventional Commits is a message format: type, optional scope, colon, summary. feat(api): add export means a minor bump, fix: means a patch, and either feat!: or a BREAKING CHANGE: footer means a major bump. Other types like docs, chore, refactor and test usually do not trigger a release. With squash merging, the PR title becomes the commit, so check PR titles in CI.\n\nrelease-please keeps an open release PR that updates the version file and CHANGELOG.md as commits land; merging that PR creates the tag and the GitHub Release. semantic-release releases on every qualifying push to main without a PR. If you prefer labels to commit formats, GitHub's generated release notes group merged PRs into sections configured in .github/release.yml.",
        visual: {
          type: "flow",
          title: "The release-please loop",
          steps: [
            { label: "Merge feat: and fix: PRs", detail: "Conventional PR titles on main" },
            { label: "Release PR updated", detail: "Next version and changelog proposed" },
            { label: "Merge the release PR", detail: "A human decides when to ship" },
            { label: "Tag and Release", detail: "v1.5.0 with generated notes" },
            { label: "Publish job", detail: "Runs because release_created is true" },
          ],
        },
      },
      {
        heading: "GitHub Packages and GHCR",
        body: "GitHub Packages hosts npm, Maven, Gradle, NuGet and RubyGems registries plus the container registry at ghcr.io. A workflow in the same repo can publish with GITHUB_TOKEN if the job has packages: write. For npm, the package name must be scoped to the owner, like @acme/utils, and setup-node with registry-url: https://npm.pkg.github.com plus NODE_AUTH_TOKEN does the login. Installing from GitHub's npm registry needs a token even for public packages.\n\nFor images, use docker/login-action, docker/metadata-action and docker/build-push-action. metadata-action turns the tag v1.4.0 into image tags 1.4.0, 1.4 and latest, and adds an org.opencontainers.image.source label that links the image to the repo. Image names must be lowercase, so github.repository with capitals breaks a hand-written docker tag. A new container package starts private; change its visibility in the package settings.",
      },
      {
        heading: "The GITHUB_TOKEN trigger trap",
        body: "To prevent endless loops, events caused by GITHUB_TOKEN do not start new workflow runs, except workflow_dispatch and repository_dispatch. So if release-please (running with GITHUB_TOKEN) creates a tag and a release, a separate workflow with on: release or on: push: tags never fires. Many teams lose an afternoon to this.\n\nThere are two clean fixes. One: publish in the same workflow, in a job that runs only when the release step reports release_created. Two: create the release with a GitHub App installation token (actions/create-github-app-token), whose events do trigger workflows. Avoid personal access tokens for this; they are tied to one person and usually have far more access than needed.",
        visual: {
          type: "sequence",
          title: "Why the publish workflow did not start",
          actors: ["release workflow", "GitHub", "publish workflow"],
          messages: [
            { from: 0, to: 1, label: "Create tag v1.5.0 with GITHUB_TOKEN" },
            { from: 1, to: 1, label: "Event made by GITHUB_TOKEN: no new runs" },
            { from: 1, to: 2, label: "on: push tags is NOT triggered" },
            { from: 0, to: 0, label: "Fix: publish job in the same run" },
            { from: 0, to: 1, label: "Or create the tag with an App token" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "One tag, many release outputs",
        root: "tag v1.4.0",
        children: [
          { label: "GitHub Release", children: ["Generated notes", "Attached binaries and checksums"] },
          { label: "Container image", children: ["ghcr.io/acme/api:1.4.0", ":1.4 and :latest"] },
          { label: "Package", children: ["@acme/api-client 1.4.0 on npm.pkg.github.com"] },
          { label: "Changelog", children: ["CHANGELOG.md section for 1.4.0"] },
        ],
      },
    ],
    examples: [
      {
        title: "release-please with publishing in the same run",
        explanation: "You want a release PR and automatic publishing, without the GITHUB_TOKEN trap. Step 1: run release-please on every push to main. Step 2: expose release_created and tag_name as job outputs. Step 3: a publish job calls your reusable publish workflow only when a release was actually created. Step 4: grant packages: write at the top, because a called workflow cannot raise permissions.",
        code: {
          lang: "yaml",
          code: `on: { push: { branches: [main] } }
permissions: { contents: write, pull-requests: write, packages: write }
jobs:
  release:
    runs-on: ubuntu-latest
    outputs:
      created: \${{ steps.rp.outputs.release_created }}
      tag: \${{ steps.rp.outputs.tag_name }}
    steps:
      - id: rp
        uses: googleapis/release-please-action@v4
        with: { release-type: node }
  publish:
    needs: release
    if: needs.release.outputs.created == 'true'
    uses: ./.github/workflows/publish.yml
    with: { tag: "\${{ needs.release.outputs.tag }}" }`,
        },
      },
      {
        title: "Push a correctly tagged image to GHCR on a version tag",
        explanation: "This workflow runs on push of tags matching v*.*.*. Step 1: log in to ghcr.io with GITHUB_TOKEN (packages: write). Step 2: metadata-action computes lowercase image names and semver tags, so v1.4.0 becomes 1.4.0, 1.4 and latest, plus OCI labels. Step 3: build-push-action builds and pushes with those tags and labels. The labels link the package to the repo on GitHub.",
        code: {
          lang: "yaml",
          code: `permissions: { contents: read, packages: write }
jobs:
  image:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: "\${{ github.actor }}", password: "\${{ secrets.GITHUB_TOKEN }}" }
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/\${{ github.repository }}
          tags: "type=semver,pattern={{version}}\\ntype=semver,pattern={{major}}.{{minor}}"
      - uses: docker/build-push-action@v6
        with: { context: ., push: true, tags: "\${{ steps.meta.outputs.tags }}", labels: "\${{ steps.meta.outputs.labels }}" }`,
        },
      },
    ],
    cheatSheet: [
      "feat: is a minor bump, fix: a patch, feat!: or a BREAKING CHANGE: footer a major",
      "git tag -a v1.4.0 -m \"v1.4.0\" && git push origin v1.4.0 creates an annotated release tag",
      "gh release create v1.4.0 --generate-notes builds notes from merged PRs",
      ".github/release.yml groups generated release notes by PR labels",
      "packages: write lets GITHUB_TOKEN push to ghcr.io and GitHub Packages",
      "Image names must be lowercase; docker/metadata-action handles that",
      "Tags and releases made with GITHUB_TOKEN do not trigger other workflows",
      "Never re-tag a published version; release a new patch instead",
    ],
    quiz: [
      {
        q: "Which version comes first when sorted by semver precedence?",
        options: ["2.0.0", "2.0.0+build.7", "2.0.0-rc.1", "2.0.1"],
        answer: 2,
        why: "A pre-release sorts before its normal version; build metadata is ignored.",
      },
      {
        q: "A commit message says fix(auth)!: drop legacy tokens. What release does it trigger?",
        options: ["Major", "Minor", "Patch", "None"],
        answer: 0,
        why: "The ! marks a breaking change, which means a major bump.",
      },
      {
        q: "release-please creates a release with GITHUB_TOKEN, but your on: release workflow never runs. Why?",
        options: ["Release events are disabled by default", "The workflow needs packages: write", "Releases only trigger on schedule", "Events caused by GITHUB_TOKEN do not start new workflow runs"],
        answer: 3,
        why: "GitHub blocks these runs to avoid loops; publish in the same run or use an App token.",
      },
      {
        q: "docker push ghcr.io/Acme/API:1.0.0 fails. What is the likely cause?",
        options: ["GHCR does not accept tags", "The repository name contains uppercase letters, which image names cannot", "You need a paid plan", "Only Docker Hub supports versions"],
        answer: 1,
        why: "OCI image names must be lowercase; metadata-action lowercases them for you.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create an annotated tag v0.1.0 for the current commit, push it, and create a GitHub Release with generated notes.",
        hint: "git tag -a, git push origin TAG, gh release create.",
        solution: "git tag -a v0.1.0 -m \"v0.1.0\"\ngit push origin v0.1.0\ngh release create v0.1.0 --generate-notes\ngh release view v0.1.0",
      },
      {
        level: "medium",
        task: "Configure generated release notes with sections for features, fixes and everything else, and exclude PRs labelled skip-changelog.",
        hint: "The file is .github/release.yml with changelog.categories and exclude.labels.",
        solution: `# .github/release.yml
changelog:
  exclude:
    labels: [skip-changelog]
  categories:
    - { title: New features, labels: [enhancement, feature] }
    - { title: Bug fixes, labels: [bug] }
    - { title: Other changes, labels: ["*"] }`,
      },
      {
        level: "hard",
        task: "Publish an npm package @acme/utils to GitHub Packages when a GitHub Release is published.",
        hint: "setup-node with registry-url and scope, NODE_AUTH_TOKEN from GITHUB_TOKEN, packages: write.",
        solution: `on: { release: { types: [published] } }
permissions: { contents: read, packages: write }
jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, registry-url: "https://npm.pkg.github.com", scope: "@acme" }
      - run: npm ci && npm publish
        env: { NODE_AUTH_TOKEN: "\${{ secrets.GITHUB_TOKEN }}" }
# note: create the release by hand or with an App token so this triggers`,
      },
    ],
    faq: [
      { q: "Should I use release-please or semantic-release?", a: "release-please gives you a release PR to review and merge when you are ready. semantic-release ships automatically on every qualifying push. Both read Conventional Commits." },
      { q: "Is GitHub Container Registry free?", a: "Public container images are free to store and pull. Private packages use your plan's included storage and data transfer, then are billed." },
      { q: "What is the difference between a tag and a release?", a: "A tag is a Git pointer to a commit. A GitHub Release is built on a tag and adds notes, downloadable assets and a page users can follow." },
      { q: "How do I link a GHCR image to my repository?", a: "Add the label org.opencontainers.image.source with the repo URL, which docker/metadata-action does automatically, or connect it in the package settings." },
    ],
  },

  "actions-advanced/gha-security": {
    plain: [
      "A workflow is code that runs with real power: it can push to your repo, publish packages and deploy to production. If an attacker can change what a workflow runs, they get that power. So workflows deserve the same care as production servers.",
      "Every job gets an automatic key called GITHUB_TOKEN. It is created for the job and stops working when the job ends. What it can do depends on its permissions. The safest default is read-only, with extra rights added only to the jobs that need them.",
      "Most of your code is other people's code: libraries and third-party actions. Dependabot watches them. It warns you when a dependency has a known security hole and opens pull requests to update it. It can also keep your actions up to date.",
      "CodeQL looks at your own code. It understands how data flows through your program and finds patterns like user input reaching an SQL query without escaping. Results show up as alerts in the Security tab and as comments on pull requests.",
    ],
    deepDive: [
      {
        heading: "GITHUB_TOKEN permissions in practice",
        body: "The token is created when a job starts and expires when the job finishes (at most after 24 hours). Its default permissions come from the repo or organization setting: new repos and organizations default to read-only for contents and packages. Override it with a permissions: block at workflow level and, where needed, at job level.\n\nTwo rules matter. As soon as you list any permission, every permission you did not list becomes none. And permissions: {} removes all of them. Common scopes are contents (code and releases), pull-requests, issues, packages, id-token (OIDC), security-events (upload scan results), checks, statuses and actions. Give write only to the one job that comments, releases or pushes.",
        bullets: [
          "Top of every workflow: permissions: contents: read",
          "Widen per job, for example pull-requests: write for a commenting job",
          "Forked PRs always get a read-only token",
        ],
      },
      {
        heading: "Script injection and dangerous triggers",
        body: "Expressions in ${{ }} are pasted into the script text before the shell runs. If a step contains run: echo \"${{ github.event.pull_request.title }}\", a PR titled with a quote followed by a command runs that command on your runner, with your token. Treat titles, branch names, issue bodies and commit messages as untrusted. The fix is simple: pass them through env: and use the shell variable, so the value stays data.\n\npull_request_target and workflow_run run in the context of the base repo, with secrets and a write token, even for PRs from forks. That is fine for labelling or commenting. It is dangerous if the workflow checks out and runs the PR's code, a pattern often called a pwn request. Never build or test untrusted PR code in those triggers.",
        visual: {
          type: "sequence",
          title: "How script injection steals a token",
          actors: ["Attacker", "GitHub", "Runner"],
          messages: [
            { from: 0, to: 1, label: "Open PR with a crafted title" },
            { from: 1, to: 2, label: "Workflow pastes title into run: script" },
            { from: 2, to: 2, label: "Shell runs the attacker's command" },
            { from: 2, to: 0, label: "Token or secrets sent out" },
            { from: 1, to: 2, label: "Fix: title passed via env, used as \"$TITLE\"" },
          ],
        },
      },
      {
        heading: "Third-party actions and the supply chain",
        body: "uses: someone/action@v3 runs whatever commit the tag v3 points to today, and tags can be moved. In March 2025 the popular tj-actions/changed-files action was compromised this way: its tags were repointed to code that dumped secrets into build logs. Pinning to a full 40-character commit SHA protects you, because a SHA cannot be changed. Keep the version in a comment, and let Dependabot propose SHA updates.\n\nOrganizations can also restrict which actions are allowed (GitHub-made, verified creators, or an allow list). Static checkers help: actionlint catches syntax and expression mistakes, and zizmor flags security problems like injection and over-broad permissions. CodeQL can scan workflow files too.",
      },
      {
        heading: "Dependabot: alerts, security updates and version updates",
        body: "Dependabot alerts use the dependency graph and the GitHub Advisory Database to tell you which dependencies have known vulnerabilities. Dependabot security updates go one step further and open PRs that upgrade just enough to fix them. Version updates, configured in .github/dependabot.yml, keep everything current on a schedule, including the github-actions ecosystem.\n\nUseful keys: groups to bundle related updates into one PR, ignore to skip packages or major versions, open-pull-requests-limit (5 by default) and labels. Workflows triggered by Dependabot PRs run with a read-only token and only Dependabot secrets, so CI that needs a secret must use one stored under Dependabot secrets. Patch updates can auto-merge once CI passes.",
      },
      {
        heading: "CodeQL code scanning",
        body: "CodeQL builds a database of your code and runs queries over it to find bugs like SQL injection, cross-site scripting, path traversal and unsafe deserialization. It supports languages including C and C++, C#, Go, Java and Kotlin, JavaScript and TypeScript, Python, Ruby, Swift, and GitHub Actions workflows.\n\nDefault setup is one click in Settings, Code security: GitHub picks languages and runs on pushes, PRs and a weekly schedule. Advanced setup is a workflow you control, using github/codeql-action init and analyze with security-events: write; you can add the security-extended query suite or custom queries. Alerts appear in the Security tab and on PRs, and you can require code scanning results in a ruleset. It is free for public repos; private repos need GitHub Code Security.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Unsafe vs safe workflow patterns",
        columns: [
          { title: "Unsafe", points: ["permissions: write-all", "uses: some/action@main", "run: echo \"${{ github.event.issue.title }}\"", "pull_request_target plus checkout of PR head"] },
          { title: "Safe", points: ["permissions: contents: read, widen per job", "uses: some/action@FULL_SHA # v2.1.0", "env: TITLE, then echo \"$TITLE\"", "pull_request for untrusted code"] },
        ],
      },
    ],
    examples: [
      {
        title: "Fixing a script injection in a triage workflow",
        explanation: "A workflow greets new issues by echoing their title. Step 1: notice that the title is pasted into the script, so a title containing $(curl ...) would run. Step 2: move the value into env: so GitHub sets it as an environment variable. Step 3: quote the shell variable in the script. Step 4: limit the token to issues: write for this job only.",
        code: {
          lang: "yaml",
          code: `# before (vulnerable):
#   - run: echo "New issue: \${{ github.event.issue.title }}"
on: { issues: { types: [opened] } }
permissions: {}
jobs:
  greet:
    runs-on: ubuntu-latest
    permissions: { issues: write }
    steps:
      - run: gh issue comment "$NUMBER" --body "Thanks! We got: $TITLE"
        env:
          TITLE: \${{ github.event.issue.title }}
          NUMBER: \${{ github.event.issue.number }}
          GH_TOKEN: \${{ github.token }}
          GH_REPO: \${{ github.repository }}`,
        },
      },
      {
        title: "CodeQL advanced setup for a two-language repo",
        explanation: "You want extra security queries and a scan of your workflow files. Step 1: run on pushes to main, on PRs and weekly. Step 2: grant security-events: write so results can be uploaded (private repos also need actions: read). Step 3: use a matrix of languages; for interpreted languages no build step is needed. Step 4: init with the security-extended suite, then analyze.",
        code: {
          lang: "yaml",
          code: `name: codeql
on:
  push: { branches: [main] }
  pull_request:
  schedule: [{ cron: "27 3 * * 1" }]
permissions: { contents: read, security-events: write }
jobs:
  analyze:
    runs-on: ubuntu-latest
    strategy: { matrix: { language: [javascript-typescript, python, actions] } }
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with: { languages: "\${{ matrix.language }}", queries: security-extended }
      - uses: github/codeql-action/analyze@v3`,
        },
      },
    ],
    cheatSheet: [
      "permissions: contents: read at the top; add write scopes only on the jobs that need them",
      "Listing any permission sets all unlisted ones to none; permissions: {} removes all",
      "Pin third-party actions: uses: owner/action@FULL_40_CHAR_SHA # v2.1.0",
      "Pass untrusted event text through env:, never straight into run: with ${{ }}",
      "Never check out and run PR code in pull_request_target or workflow_run",
      "Dependabot github-actions ecosystem keeps actions and SHA pins current",
      "CodeQL upload needs security-events: write; free on public repos",
      "actionlint and zizmor catch workflow mistakes and security issues before merge",
    ],
    quiz: [
      {
        q: "A workflow sets permissions: pull-requests: write and nothing else. What can the token do with contents?",
        options: ["Read and write", "Read only", "Nothing; unlisted permissions become none", "Whatever the repo default is"],
        answer: 2,
        why: "Once a permissions block exists, every unlisted scope is set to none.",
      },
      {
        q: "Why is run: echo \"${{ github.event.pull_request.title }}\" dangerous?",
        options: ["The title is substituted into the script text, so a crafted title can run commands", "Titles are secret", "echo is not allowed in Actions", "It uses too many minutes"],
        answer: 0,
        why: "Expressions are expanded before the shell runs, turning data into code.",
      },
      {
        q: "What does pinning an action to a full commit SHA protect against?",
        options: ["Slow downloads", "Breaking changes in your own code", "Dependabot PRs", "The tag being moved to malicious code later"],
        answer: 3,
        why: "A commit SHA is immutable, while tags can be repointed, as in the tj-actions incident.",
      },
      {
        q: "Which tool finds an SQL injection in your own application code?",
        options: ["Dependabot version updates", "CodeQL code scanning", "Branch protection", "GITHUB_TOKEN permissions"],
        answer: 1,
        why: "CodeQL analyses data flow in your code; Dependabot covers dependencies.",
      },
      {
        q: "A CI step needs a secret but fails only on Dependabot PRs. Why?",
        options: ["Dependabot PRs cannot run CI", "Dependabot PRs use a write token", "Dependabot-triggered runs only receive Dependabot secrets", "Secrets expire after 24 hours"],
        answer: 2,
        why: "Store the value under Dependabot secrets as well if those runs need it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add a read-only default token to a workflow that has none, and give only its comment job permission to write PR comments.",
        hint: "Workflow-level permissions plus a job-level override.",
        solution: `permissions:
  contents: read
jobs:
  test: { runs-on: ubuntu-latest, steps: [{ uses: actions/checkout@v4 }, { run: make test }] }
  comment:
    needs: test
    runs-on: ubuntu-latest
    permissions: { pull-requests: write }
    steps: [{ run: echo "comment here" }]`,
      },
      {
        level: "medium",
        task: "Configure Dependabot to update npm weekly with minor and patch updates grouped into one PR, and GitHub Actions monthly.",
        hint: "Use groups with update-types inside an npm entry.",
        solution: `version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule: { interval: weekly }
    groups:
      minor-and-patch: { update-types: [minor, patch] }
  - package-ecosystem: github-actions
    directory: "/"
    schedule: { interval: monthly }`,
      },
      {
        level: "hard",
        task: "Auto-merge Dependabot patch updates once required checks pass, and nothing else.",
        hint: "dependabot/fetch-metadata gives update-type; gh pr merge --auto waits for checks. Enable auto-merge in repo settings.",
        solution: `on: pull_request
permissions: { contents: write, pull-requests: write }
jobs:
  automerge:
    if: github.event.pull_request.user.login == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - id: meta
        uses: dependabot/fetch-metadata@v2
      - if: steps.meta.outputs.update-type == 'version-update:semver-patch'
        run: gh pr merge --auto --squash "$PR_URL"
        env: { PR_URL: "\${{ github.event.pull_request.html_url }}", GH_TOKEN: "\${{ secrets.GITHUB_TOKEN }}" }`,
      },
    ],
    faq: [
      { q: "What is the difference between Dependabot alerts and Dependabot security updates?", a: "Alerts tell you a dependency has a known vulnerability. Security updates also open a pull request that upgrades it to a fixed version." },
      { q: "Is CodeQL free?", a: "Yes for public repositories. For private repositories it requires GitHub Code Security, a paid add-on." },
      { q: "Should I pin GitHub's own actions like actions/checkout to a SHA too?", a: "Pinning everything is the strictest option and some organizations require it. Many teams pin third-party actions to SHAs and accept major tags for actions from GitHub itself." },
      { q: "When is pull_request_target safe to use?", a: "When the workflow never checks out or runs the pull request's code, for example to add labels or post a comment based on metadata." },
    ],
  },
};

export default extra;

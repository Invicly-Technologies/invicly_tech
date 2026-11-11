import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "gh-project/gh-capstone": {
    plain: [
      "This project turns one repository into a small software factory. A change starts as a pull request, gets checked by robots and reviewed by a person, is merged, packaged as a numbered release, and is deployed, first to a test environment and then, after a human says yes, to production.",
      "Each stage is a gate. Protected main stops anyone from pushing straight to the main branch. CI (continuous integration) runs the tests on every pull request. A release workflow stamps a version number and writes the changelog. A deploy workflow ships that exact version.",
      "Security is built in, not added later. The deploy job logs in to the cloud with OIDC (OpenID Connect): GitHub hands it a short-lived identity token, and the cloud trusts that token for a few minutes. No long-lived password is stored anywhere in the repo.",
      "Finally, the README explains the whole pipeline: what runs when, how to cut a release, and how to roll back. If a new teammate can ship a change by reading it, the project is done.",
    ],
    deepDive: [
      {
        heading: "Protecting main with rulesets and CODEOWNERS",
        body: "Create a branch ruleset (Settings, Rules, Rulesets) that targets the default branch. Turn on: require a pull request before merging, at least one approval, dismiss stale approvals when new commits are pushed, require review from code owners, require status checks to pass, and block force pushes and deletions. Leave the bypass list empty so admins follow the same rules.\n\nThe status check names you require must match the job names that CI reports, for example test (ubuntu-latest, 22). A check that never runs, such as one skipped by a paths filter, leaves the pull request stuck waiting, so keep required jobs always running.\n\nCODEOWNERS lives in .github/, the repo root or docs/. Each line is a pattern followed by owners, and the last matching line wins. A line like /infra/ @org/platform means any change under infra needs a review from the platform team.",
        bullets: ["* @org/maintainers sets a default owner for everything", "/.github/workflows/ @org/platform guards the pipeline itself", "Require branches to be up to date, or use a merge queue on busy repos"],
      },
      {
        heading: "CI on every pull request",
        body: "The CI workflow runs on pull_request and on push to main. Keep it fast and trustworthy: cache dependencies with the setup action's built-in cache, run lint and tests, and use a small matrix only where versions really differ. Set permissions: contents: read at the top so the token can only read the code.\n\nAdd concurrency with a group based on the branch and cancel-in-progress: true, so a new push cancels the outdated run instead of queueing behind it. Upload test reports or coverage with actions/upload-artifact when a run fails, so reviewers can see why without rerunning.\n\nPull requests from forks run with a read-only token and no access to secrets. That is a safety feature; never switch such workflows to pull_request_target and check out the fork's code, which would run untrusted code with secrets.",
      },
      {
        heading: "Automated releases and changelogs",
        body: "Release automation reads your commit history and decides the next version. With Conventional Commits, fix: means a patch bump, feat: a minor bump, and a ! or BREAKING CHANGE footer a major bump. Tools such as release-please open a release pull request that updates the version and CHANGELOG.md; merging it creates the tag and the GitHub release.\n\nThe release workflow then builds the container image once, tags it with the version (for example ghcr.io/org/app:1.4.0) and pushes it to GitHub Container Registry using the GITHUB_TOKEN with packages: write.\n\nOne trap catches many people: events caused by the GITHUB_TOKEN do not start new workflow runs (apart from workflow_dispatch and repository_dispatch). If a release is created with GITHUB_TOKEN, a separate workflow listening for release: published will not fire. Either deploy from the same workflow as a later job, or create the release with a GitHub App token.",
        visual: {
          type: "flow",
          title: "From commits to a release",
          steps: [
            { label: "feat: and fix: commits", detail: "Merged to main through pull requests" },
            { label: "Release PR opened", detail: "Next version and changelog proposed" },
            { label: "Merge the release PR", detail: "Tag v1.4.0 and GitHub release created" },
            { label: "Build image once", detail: "Pushed as ghcr.io/org/app:1.4.0" },
            { label: "Deploy jobs start", detail: "Same workflow, so no trigger trap" },
          ],
        },
      },
      {
        heading: "Deploying with OIDC and environment gates",
        body: "A job that sets permissions: id-token: write can ask GitHub for an OIDC token. The token's sub claim describes where it came from; for a job tied to an environment it looks like repo:org/app:environment:production. In AWS you create an IAM role whose trust policy accepts tokens from token.actions.githubusercontent.com only with that exact sub, and aws-actions/configure-aws-credentials exchanges the token for temporary keys.\n\nEnvironments add the human gate. Under Settings, Environments, give production required reviewers, optionally a wait timer, and a deployment branch rule so only main or version tags can deploy. A job with environment: production pauses until a reviewer approves, and environment secrets are only released to it after approval.\n\nAdd concurrency per environment so two deploys never run at once, and finish each deploy with a smoke test that calls the health endpoint and fails the job if it does not answer.",
        visual: {
          type: "sequence",
          title: "Production deploy with OIDC",
          actors: ["Deploy job", "GitHub", "Reviewer", "AWS STS"],
          messages: [
            { from: 0, to: 1, label: "Job targets environment production" },
            { from: 1, to: 2, label: "Approval requested" },
            { from: 2, to: 1, label: "Approved" },
            { from: 0, to: 1, label: "Request OIDC token" },
            { from: 1, to: 0, label: "Token, sub ends environment:production" },
            { from: 0, to: 3, label: "AssumeRoleWithWebIdentity" },
            { from: 3, to: 0, label: "Temporary credentials, about 1 hour" },
          ],
        },
      },
      {
        heading: "Documenting the pipeline",
        body: "The README is part of the deliverable. Start with status badges: each workflow has one at https://github.com/ORG/REPO/actions/workflows/ci.yml/badge.svg. Then a short pipeline section: a diagram or list of what happens on a pull request, on merge, on release and on deploy.\n\nAdd the procedures people actually need. How to cut a release (merge the release pull request). How to promote to production (approve the waiting job in the Actions tab). How to roll back (rerun the deploy job of the previous release, or trigger a workflow_dispatch with an older tag). Where secrets and roles live, without the values.\n\nKeep the pipeline itself reviewable too: pin third-party actions to a full commit SHA, enable Dependabot for the github-actions ecosystem, and make /.github/ owned by a CODEOWNERS team.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Gates a change passes through",
        layers: [
          { label: "Ruleset on main", detail: "PR, approval, code owners, no force push" },
          { label: "Required CI checks", detail: "Lint and tests must be green" },
          { label: "Release PR", detail: "Version and changelog reviewed like code" },
          { label: "Staging deploy", detail: "Automatic, ends with a smoke test" },
          { label: "Production environment", detail: "Reviewer approval, main or tags only" },
        ],
      },
    ],
    examples: [
      {
        title: "CI that is safe to require",
        explanation: "This workflow runs on every pull request and every push to main. The token is read-only, an outdated run on the same branch is cancelled, and the job name (test) is what you add as a required status check in the ruleset. Because there is no paths filter, the check always reports, so pull requests never get stuck waiting.",
        code: {
          lang: "yaml",
          code: "name: ci\non:\n  pull_request:\n  push: { branches: [main] }\npermissions: { contents: read }\nconcurrency: { group: \"ci-${{ github.ref }}\", cancel-in-progress: true }\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with: { node-version: 22, cache: npm }\n      - run: npm ci\n      - run: npm run lint && npm test",
        },
      },
      {
        title: "Trust policy that only production can use",
        explanation: "The AWS role for production should accept only OIDC tokens from this repo's production environment. The condition checks the audience and the exact sub. A workflow on a feature branch, or a job targeting staging, gets a different sub and is refused. Create a second role with the staging sub for staging deploys.",
        code: {
          lang: "json",
          code: "{\n  \"Effect\": \"Allow\",\n  \"Principal\": { \"Federated\": \"arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com\" },\n  \"Action\": \"sts:AssumeRoleWithWebIdentity\",\n  \"Condition\": {\n    \"StringEquals\": {\n      \"token.actions.githubusercontent.com:aud\": \"sts.amazonaws.com\",\n      \"token.actions.githubusercontent.com:sub\": \"repo:org/app:environment:production\"\n    }\n  }\n}",
        },
      },
    ],
    cheatSheet: [
      "Required status check names must match the job names CI reports",
      "CODEOWNERS: last matching pattern wins; put it in .github/CODEOWNERS",
      "fix: = patch, feat: = minor, feat!: or BREAKING CHANGE = major (Conventional Commits)",
      "Events made with GITHUB_TOKEN do not trigger new workflow runs",
      "OIDC needs permissions: id-token: write on the job or workflow",
      "Environment sub claim: repo:ORG/REPO:environment:NAME",
      "Build the image once at release; deploy that same tag everywhere",
      "Badge URL: github.com/ORG/REPO/actions/workflows/ci.yml/badge.svg",
    ],
    quiz: [
      {
        q: "release-please creates a GitHub release using the GITHUB_TOKEN, but your deploy.yml on release: published never runs. Why?",
        options: ["Releases cannot trigger workflows", "deploy.yml needs contents: write", "Events caused by GITHUB_TOKEN do not start new workflow runs", "OIDC is not configured"],
        answer: 2,
        why: "GitHub blocks this to prevent loops; deploy in the same workflow or use a GitHub App token.",
      },
      {
        q: "A required check is skipped by a paths filter on a docs-only pull request. What happens?",
        options: ["The pull request waits forever for the check to report", "The check counts as passed", "The pull request is closed", "GitHub runs the check anyway"],
        answer: 0,
        why: "A workflow that does not run never reports, so the required check stays pending.",
      },
      {
        q: "Which OIDC sub claim should the production role's trust policy require?",
        options: ["repo:org/app:*", "repo:org/app:pull_request", "repo:org/app:ref:refs/heads/feature", "repo:org/app:environment:production"],
        answer: 3,
        why: "Matching the environment means only jobs that passed the production gate can assume the role.",
      },
      {
        q: "Why should the bypass list on the main ruleset be empty?",
        options: ["Rulesets fail with a bypass list", "Otherwise admins can skip reviews and checks, making the gates optional", "It speeds up CI", "It is required for CODEOWNERS"],
        answer: 1,
        why: "Gates only protect production if nobody can quietly go around them.",
      },
      {
        q: "Which commit message leads release automation to a minor version bump?",
        options: ["fix: handle empty cart", "chore: update deps", "feat: add discount codes", "docs: fix typo"],
        answer: 2,
        why: "In Conventional Commits, feat: adds a feature and bumps the minor version.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a CODEOWNERS file: maintainers own everything, the platform team owns workflows and infra, and the frontend team owns web/.",
        hint: "Put the general rule first, because the last match wins.",
        solution: "# .github/CODEOWNERS\n*                    @org/maintainers\n/web/                @org/frontend\n/infra/              @org/platform\n/.github/workflows/  @org/platform",
      },
      {
        level: "medium",
        task: "Add a release job that pushes the image to GHCR tagged with the release version, after release-please creates the release in the same workflow.",
        hint: "release-please-action outputs release_created and tag_name; the job needs packages: write.",
        solution: "  image:\n    needs: release\n    if: ${{ needs.release.outputs.release_created }}\n    runs-on: ubuntu-latest\n    permissions: { contents: read, packages: write }\n    steps:\n      - uses: actions/checkout@v4\n      - uses: docker/login-action@v3\n        with: { registry: ghcr.io, username: \"${{ github.actor }}\", password: \"${{ secrets.GITHUB_TOKEN }}\" }\n      - uses: docker/build-push-action@v6\n        with: { push: true, tags: \"ghcr.io/${{ github.repository }}:${{ needs.release.outputs.tag_name }}\" }",
      },
      {
        level: "hard",
        task: "Write a reusable deploy workflow that takes an environment and tag, logs in to AWS with OIDC, deploys, runs a smoke test, and never runs twice at once for the same environment.",
        hint: "on: workflow_call with inputs; concurrency keyed on the environment input.",
        solution: "on: { workflow_call: { inputs: { environment: { type: string, required: true }, tag: { type: string, required: true } } } }\npermissions: { id-token: write, contents: read }\nconcurrency: { group: \"deploy-${{ inputs.environment }}\", cancel-in-progress: false }\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    environment: ${{ inputs.environment }}\n    steps:\n      - uses: aws-actions/configure-aws-credentials@v4\n        with: { role-to-assume: \"${{ vars.DEPLOY_ROLE_ARN }}\", aws-region: eu-west-1 }\n      - run: ./deploy.sh \"${{ inputs.tag }}\"\n      - run: curl -fsS --retry 5 --retry-delay 5 \"${{ vars.APP_URL }}/health\"",
      },
    ],
    faq: [
      { q: "Branch protection rules or rulesets?", a: "Both work. Rulesets are the newer system: several can apply at once, they can target many branches or tags by pattern, and they show who can bypass them more clearly." },
      { q: "Can I require approvals for environments on a private repo?", a: "Required reviewers for environments are available on public repositories and, for private repositories, on paid plans such as Team or Enterprise." },
      { q: "How do I roll back a bad release?", a: "Redeploy the previous version's image tag, for example by rerunning that release's deploy job or a workflow_dispatch with the old tag. Then fix forward with a new release." },
      { q: "Should I use release-please or semantic-release?", a: "Both read Conventional Commits. release-please adds a reviewable release pull request before tagging; semantic-release publishes directly on every qualifying merge." },
    ],
  },
};

export default extra;

import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "capstone/capstone": {
    plain: [
      "The capstone is one project that uses everything from this path. You write a small web service in Python with FastAPI, package it with Docker, test and build it automatically with GitHub Actions, create the cloud servers with Terraform, run it on Kubernetes with Helm, and watch it with Grafana.",
      "Think of it as a production line. Code goes in at one end. Each stage checks or packages it and hands it to the next. A running, monitored service comes out at the other end. Your job is to build each stage and connect them.",
      "Do not try to build it all in one weekend. Make the thinnest version work from start to finish first: one endpoint, one test, one image, one deploy. Then improve each stage. A simple pipeline that works beats a fancy one that is half done.",
      "The result is a public repository you can show in interviews. A clear README with a diagram lets you walk someone through the whole system in ten minutes and answer questions about every choice you made.",
    ],
    deepDive: [
      {
        heading: "Repository layout: everything as code in one place",
        body: "Keep the app and its delivery in one repository, so a single pull request can change code, image, chart and infrastructure together and reviewers see the full picture. A clear layout also makes your README easier to write.\n\nPut the Python package in app/ and tests in tests/. The Dockerfile and a .dockerignore sit at the root. The pipeline lives in .github/workflows/. Terraform goes in infra/, split into modules/ (reusable pieces like the VPC) and envs/dev and envs/prod (small root configs with their own state and tfvars). The Helm chart lives in charts/api with one values file per environment. Dashboards are JSON files in observability/dashboards, and alert rules sit next to them.\n\nAdd a Makefile or a few scripts with the commands you run most (make test, make build, make deploy-dev). Interviewers notice when a repo can be run by a stranger with three commands from the README.",
        visual: {
          type: "tree",
          title: "Capstone repository layout",
          root: "capstone-repo/",
          children: [
            { label: "app/ and tests/", children: ["main.py with /healthz and /readyz", "test_api.py with pytest"] },
            { label: "Dockerfile", children: ["Multi-stage, non-root", ".dockerignore"] },
            { label: ".github/workflows/", children: ["ci.yml: lint, test, build, push", "deploy.yml: helm upgrade"] },
            { label: "infra/", children: ["modules/vpc", "envs/dev", "envs/prod"] },
            { label: "charts/api/", children: ["templates/", "values-dev.yaml", "values-prod.yaml"] },
            { label: "observability/", children: ["dashboards/*.json", "alerts.yml"] },
          ],
        },
      },
      {
        heading: "Make the service production-shaped from day one",
        body: "The service can be tiny, but it should behave like a real one, because every later stage depends on it. Give it two health endpoints. /healthz (liveness) only says the process is alive, and never checks the database, or a database outage would make Kubernetes restart every Pod. /readyz (readiness) checks that the app can serve traffic, for example that the database answers.\n\nRead all settings from environment variables (pydantic-settings is a clean way), so the same image runs in dev and prod with different config. Log JSON to stdout with a request ID, and expose /metrics with a request counter and a latency histogram. Handle SIGTERM gracefully: uvicorn finishes in-flight requests on shutdown, which matters during rolling updates.\n\nTests come first in the pipeline, so make them fast and independent of the network. FastAPI's TestClient calls the app in-process, and dependency overrides let you swap the real database for a fake one.",
        bullets: [
          "Liveness: am I alive? Readiness: can I take traffic right now?",
          "Same image everywhere; only environment variables differ",
          "Pin dependencies in requirements.txt or a lock file for repeatable builds",
        ],
      },
      {
        heading: "The pipeline: from merge to running Pods",
        body: "On every pull request, the workflow runs lint (ruff), tests (pytest) and a Docker build without pushing. On a merge to main it does the same, then pushes the image tagged with the git commit SHA, so every running Pod can be traced to an exact commit. Avoid deploying latest: it hides which version runs and breaks rollbacks.\n\nDo not store AWS access keys in GitHub secrets. Use OpenID Connect (OIDC): the workflow gets a short-lived token from GitHub (it needs permissions: id-token: write), and aws-actions/configure-aws-credentials exchanges it for temporary credentials by assuming an IAM role whose trust policy only allows your repository and branch.\n\nThe deploy job then runs aws eks update-kubeconfig and helm upgrade --install with --set image.tag set to the SHA and --wait, so the job fails if the new Pods never become ready. Use a GitHub environment for prod with required reviewers, which gives you a manual approval gate.",
        visual: {
          type: "sequence",
          title: "Merge to main, keyless deploy",
          actors: ["GitHub Actions", "AWS STS", "ECR", "EKS cluster"],
          messages: [
            { from: 0, to: 0, label: "Lint, test, build image" },
            { from: 0, to: 1, label: "AssumeRoleWithWebIdentity (OIDC token)" },
            { from: 1, to: 0, label: "Temporary credentials, about 1 hour" },
            { from: 0, to: 2, label: "Push api:SHA" },
            { from: 0, to: 3, label: "helm upgrade --install --set image.tag=SHA --wait" },
            { from: 3, to: 2, label: "Nodes pull api:SHA" },
            { from: 3, to: 0, label: "Rollout ready, job passes" },
          ],
        },
      },
      {
        heading: "Infrastructure with Terraform, and keeping the bill small",
        body: "Terraform creates the network, the cluster, the registry and the IAM roles. Use well-known registry modules (terraform-aws-modules/vpc/aws and terraform-aws-modules/eks/aws) rather than writing an EKS cluster by hand; they encode many details that are easy to get wrong. Keep state in an S3 bucket with versioning; since Terraform 1.10 the S3 backend can lock with use_lockfile = true, without a DynamoDB table.\n\nCloud costs are real. In us-east-1, an EKS control plane costs about 0.10 USD per hour (around 73 USD per month) before any nodes, and a NAT gateway about 0.045 USD per hour plus data charges. Use small node types, one NAT gateway in dev, and run terraform destroy when you finish a session. Set an AWS Budget alert on day one.\n\nA fully valid alternative: run Kubernetes locally with kind, and use Terraform only for cheap pieces like the ECR repository and the IAM role for OIDC. Say so in the README; it shows judgment.",
        visual: {
          type: "compare",
          title: "Where to run the cluster",
          columns: [
            { title: "kind on your laptop", points: ["Free", "Fast to create and delete", "No real load balancer or IAM", "Great for building the chart"] },
            { title: "EKS via Terraform", points: ["About 73 USD per month for control plane alone", "Real ALB, IAM roles and nodes", "Closest to what employers run", "Destroy after each session"] },
          ],
        },
      },
      {
        heading: "Telling the story: README and interview walkthrough",
        body: "The README is the front door. Start with one sentence about what the service does, then the architecture diagram, then a Quick start (run locally with Docker Compose), then How it deploys (the pipeline and the Helm release), then Observability (a screenshot of the dashboard), then Decisions and trade-offs. Draw the diagram with a tool that stores text, such as Mermaid in the README itself, so it can be reviewed and updated like code.\n\nIn an interview, follow one change through the system: a developer opens a pull request, CI runs tests, merge pushes an image tagged with the SHA, Helm rolls it out with probes guarding the rollout, and Grafana shows traffic moving to the new version. Then be ready for why questions: why Helm rather than raw manifests, why OIDC instead of keys, how you would roll back (helm rollback), what happens if a Pod crashes, and what you would add next (autoscaling, canary releases, tracing). Honest notes about limitations score better than pretending it is perfect.",
        bullets: [
          "Include one screenshot of the Grafana dashboard with real traffic",
          "List the exact commands to reproduce, and to destroy, everything",
          "Write down 3 to 5 decisions with the alternative you rejected",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "The loop you demo: change, ship, observe",
        steps: [
          { label: "Open a PR", detail: "Code change plus test" },
          { label: "CI checks", detail: "Lint, pytest, image build" },
          { label: "Merge and push", detail: "Image tagged with the commit SHA" },
          { label: "Helm rollout", detail: "Probes gate the new Pods" },
          { label: "Watch Grafana", detail: "Errors and latency stay flat, or roll back" },
        ],
      },
    ],
    examples: [
      {
        title: "Build the thinnest end-to-end slice first",
        explanation: "Step 1: write a FastAPI app with a single /healthz endpoint and one pytest test. Step 2: build the image and run it locally. Step 3: create a kind cluster and load the image into it, so no registry is needed yet. Step 4: create a minimal chart with helm create and set the image to the local tag. Step 5: install and port-forward to prove the whole path works. Only after this slice runs do you add the database, the real pipeline, Terraform and dashboards. Each new stage then breaks one thing at a time.",
        code: {
          lang: "bash",
          code: `pytest -q                                   # 1 test passes
docker build -t api:dev .
docker run --rm -p 8000:8000 api:dev        # curl localhost:8000/healthz
kind create cluster --name capstone
kind load docker-image api:dev --name capstone
helm create charts/api                       # then edit values.yaml
helm upgrade --install api charts/api \\
  --set image.repository=api --set image.tag=dev --set image.pullPolicy=Never --wait
kubectl port-forward svc/api 8080:80         # curl localhost:8080/healthz`,
        },
      },
      {
        title: "The deploy job in GitHub Actions with OIDC and Helm",
        explanation: "Step 1: grant the job permission to request an OIDC token. Step 2: assume the deploy role (its trust policy allows only this repo's main branch). Step 3: log in to ECR and build and push the image tagged with the SHA. Step 4: fetch kubeconfig for the cluster. Step 5: helm upgrade --install with the SHA tag and --wait, so a broken release fails the job. The role ARN and names are placeholders to replace with your own.",
        code: {
          lang: "yaml",
          code: `deploy:
  runs-on: ubuntu-latest
  environment: prod
  permissions: { id-token: write, contents: read }
  steps:
    - uses: actions/checkout@v4
    - uses: aws-actions/configure-aws-credentials@v4
      with: { role-to-assume: "arn:aws:iam::123456789012:role/gha-deploy", aws-region: us-east-1 }
    - id: ecr
      uses: aws-actions/amazon-ecr-login@v2
    - run: |
        IMAGE=\${{ steps.ecr.outputs.registry }}/api:\${{ github.sha }}
        docker build -t "$IMAGE" . && docker push "$IMAGE"
        aws eks update-kubeconfig --name capstone --region us-east-1
        helm upgrade --install api charts/api -n prod --create-namespace -f charts/api/values-prod.yaml \\
          --set image.repository=\${{ steps.ecr.outputs.registry }}/api --set image.tag=\${{ github.sha }} --wait`,
        },
      },
    ],
    cheatSheet: [
      "Get one thin slice working end to end before improving any single stage",
      "Tag images with the git SHA; never deploy latest",
      "Use GitHub OIDC with an IAM role instead of storing AWS keys as secrets",
      "/healthz for liveness (process only), /readyz for readiness (dependencies)",
      "helm upgrade --install ... --wait fails the job if new Pods never become ready",
      "helm history api lists revisions; helm rollback api 3 returns to revision 3",
      "Set an AWS Budget alert on day one and run terraform destroy after each session",
      "README order: what it does, diagram, quick start, deploy, observability, decisions",
    ],
    quiz: [
      {
        q: "Why should the liveness probe not check the database?",
        options: ["Liveness probes cannot make network calls", "A database outage would make Kubernetes restart every healthy Pod", "It makes the image larger", "Helm does not allow it"],
        answer: 1,
        why: "Liveness failures cause restarts, which cannot fix a database that is down.",
      },
      {
        q: "What is the main benefit of tagging images with the git commit SHA?",
        options: ["Images build faster", "Registries require it", "Every running Pod can be traced to an exact commit, and rollbacks are precise", "It removes the need for tests"],
        answer: 2,
        why: "An immutable tag ties each deployment to one known version of the code.",
      },
      {
        q: "How should the GitHub Actions workflow authenticate to AWS?",
        options: ["Assume an IAM role through OIDC and get short-lived credentials", "Store the root account keys as a secret", "Commit an access key to the repo", "Use a personal IAM user's long-lived key"],
        answer: 0,
        why: "OIDC gives temporary credentials, and nothing long-lived can leak.",
      },
      {
        q: "Which order of work is most likely to succeed?",
        options: ["Write all Terraform first, then the app", "Polish the Grafana dashboard before anything deploys", "Build every stage fully, then connect them at the end", "A minimal slice through every stage first, then improve each stage"],
        answer: 3,
        why: "A thin working path means each later change breaks only one thing at a time.",
      },
      {
        q: "What does --wait add to helm upgrade --install in the deploy job?",
        options: ["It waits for a manual approval", "It waits until the resources are ready, so a failing rollout fails the job", "It delays the deploy by one minute", "It waits for the image to build"],
        answer: 1,
        why: "Without it, Helm returns as soon as manifests are applied, even if Pods crash.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add /healthz and /readyz endpoints to the FastAPI app and a pytest test for each.",
        hint: "Use fastapi.testclient.TestClient (it needs httpx installed). Readiness can return 503 when a dependency is down.",
        solution: `# app/main.py
from fastapi import FastAPI, Response
app = FastAPI()
def db_ok() -> bool: return True        # replace with a real check
@app.get("/healthz")
def healthz(): return {"status": "ok"}
@app.get("/readyz")
def readyz(response: Response):
    ok = db_ok()
    if not ok: response.status_code = 503
    return {"ready": ok}
# tests/test_health.py
# from fastapi.testclient import TestClient; from app.main import app
# def test_health(): assert TestClient(app).get("/healthz").status_code == 200`,
      },
      {
        level: "medium",
        task: "Write values-dev.yaml and values-prod.yaml for the chart so dev runs 1 replica with small limits and prod runs 3 replicas with larger limits, then install dev.",
        hint: "Put only the differences in each file; defaults stay in values.yaml. Use -f to choose one.",
        solution: `# charts/api/values-dev.yaml
replicaCount: 1
resources: { requests: { cpu: 50m, memory: 64Mi }, limits: { memory: 128Mi } }
# charts/api/values-prod.yaml
replicaCount: 3
resources: { requests: { cpu: 200m, memory: 256Mi }, limits: { memory: 512Mi } }
# install dev
helm upgrade --install api charts/api -n dev --create-namespace -f charts/api/values-dev.yaml --wait
helm get values api -n dev`,
      },
      {
        level: "hard",
        task: "Write a Python smoke test that the pipeline runs after deploy: it calls /healthz and /readyz on the public URL, retries for up to 2 minutes, and exits non-zero on failure so the job can trigger helm rollback.",
        hint: "Loop with a deadline, catch request errors, and use sys.exit(1). In the workflow, run helm rollback api if the step fails.",
        solution: `import sys, time, requests
base = sys.argv[1].rstrip("/")
deadline = time.monotonic() + 120
while time.monotonic() < deadline:
    try:
        if all(requests.get(f"{base}{p}", timeout=5).ok for p in ("/healthz", "/readyz")):
            print("smoke test passed"); sys.exit(0)
    except requests.RequestException as e:
        print("not ready yet:", e)
    time.sleep(5)
print("smoke test failed"); sys.exit(1)
# workflow: run: python smoke.py https://api.example.com || (helm rollback api -n prod && exit 1)`,
      },
    ],
    faq: [
      { q: "Do I need to pay for AWS to finish the capstone?", a: "Not necessarily. You can run the cluster locally with kind and use Terraform only for low-cost pieces, or create the EKS stack for a few hours and destroy it. Set a budget alert either way." },
      { q: "How long does the capstone take?", a: "Plan for around 14 focused hours if you have done the earlier modules, more if you debug cloud networking for the first time. Getting the thin slice working usually takes the first third." },
      { q: "What do interviewers look for in a DevOps portfolio project?", a: "A repo they can understand quickly: a clear diagram, reproducible commands, automated tests and deploys, secrets handled properly, and honest notes about trade-offs and next steps." },
      { q: "Should I use Helm or plain Kubernetes manifests?", a: "Write plain manifests first so you understand them, then convert to a Helm chart for per-environment values and easy rollbacks. Mentioning that you know both is a plus." },
    ],
  },
};

export default extra;

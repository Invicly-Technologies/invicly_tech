import type { LearningPath, Module } from "./types";
import { morePaths } from "./paths-more";
import cyberSecurityFundamentalsPath from "./more/cyber-security-fundamentals";
import ethicalHackingPath from "./more/ethical-hacking";
import linuxSystemProgrammingPath from "./more/linux-system-programming";
import linuxAdministrationPath from "./more/linux-administration";
import dataStructuresAlgorithmsPath from "./more/data-structures-algorithms";
import computerNetworkingPath from "./more/computer-networking";

export type { LearningPath, Module, Topic, Resource, PathCategory } from "./types";
export { PATH_CATEGORIES } from "./types";

const L = (label: string, url: string) => ({ label, url });

const devops: LearningPath = {
  slug: "devops-with-python",
  title: "Full DevOps with Python",
  tagline: "Linux to Kubernetes, automated with Python.",
  description:
    "Go from shell basics to shipping a Python service through Docker, GitHub Actions, Terraform and Kubernetes on AWS, with monitoring. Python is the glue: you write the automation yourself instead of copying commands.",
  level: "Beginner → Intermediate",
  category: "DevOps & Cloud",
  icon: "server",
  outcomes: [
    "Write Python scripts and CLIs that automate servers, files and cloud APIs",
    "Containerise apps and run them with Docker Compose and Kubernetes",
    "Build CI/CD pipelines that test, build and deploy on every push",
    "Provision AWS infrastructure with Terraform and configure it with Ansible",
    "Monitor services with Prometheus and Grafana",
  ],
  tools: ["Linux", "Bash", "Python", "Docker", "GitHub Actions", "AWS", "Terraform", "Ansible", "Kubernetes", "Helm", "Prometheus", "Grafana"],
  modules: [
    {
      key: "linux",
      title: "Linux & networking foundations",
      summary: "The operating system and network every DevOps tool sits on.",
      links: [L("Linux Journey", "https://linuxjourney.com/"), L("roadmap.sh DevOps", "https://roadmap.sh/devops")],
      topics: [
        { key: "fs-perms", title: "Filesystem, users & permissions", hours: 4, goal: "Navigate the filesystem and fix ownership and permission problems without guessing.", subtopics: ["Navigate with ls, cd, find and du", "Read rwx bits and octal modes", "Fix ownership with chown and chmod", "Manage users, groups and sudo"] },
        { key: "processes", title: "Processes, services & systemd", hours: 3, goal: "Inspect processes, read logs with journalctl and write a systemd unit.", subtopics: ["Inspect processes with ps, top and htop", "Send signals and kill stuck processes", "Read service logs with journalctl", "Write and enable a systemd unit"] },
        { key: "bash", title: "Bash scripting essentials", hours: 5, goal: "Write Bash scripts with variables, loops, conditionals and exit codes.", subtopics: ["Use variables, quoting and arguments", "Write if tests and case statements", "Loop over files and command output", "Check exit codes and use set -euo pipefail", "Write a backup script with functions"], links: [L("Bash manual", "https://www.gnu.org/software/bash/manual/bash.html")] },
        { key: "networking", title: "Networking: TCP/IP, DNS, HTTP, SSH", hours: 5, goal: "Explain how a request reaches a server and debug it with curl, dig, ss and ssh.", subtopics: ["Learn TCP/IP layers, ports and subnets", "Trace DNS lookups with dig", "Inspect HTTP requests with curl -v", "List listening sockets with ss", "Set up SSH keys and config"] },
      ],
    },
    {
      key: "python",
      title: "Python for automation",
      summary: "Enough Python to replace fragile shell scripts with tested tools.",
      links: [L("Python tutorial", "https://docs.python.org/3/tutorial/")],
      topics: [
        { key: "py-core", title: "Python core: types, control flow, data structures", hours: 8, goal: "Write idiomatic Python with lists, dicts, comprehensions and functions.", subtopics: ["Practice strings, numbers and booleans", "Use lists, dicts, sets and tuples", "Write loops, conditionals and functions", "Rewrite loops as comprehensions", "Use *args, **kwargs and default arguments", "Solve 10 small automation exercises"] },
        { key: "py-env", title: "Modules, packages, venv & pip", hours: 3, goal: "Structure a project into modules and manage dependencies in a virtual environment.", subtopics: ["Split code into modules and packages", "Create and activate a venv", "Install and pin packages with pip", "Freeze dependencies to requirements.txt"], links: [L("venv", "https://docs.python.org/3/library/venv.html")] },
        { key: "py-files", title: "Files, JSON, YAML & CLIs with argparse", hours: 5, goal: "Build a command-line tool that reads config files and takes arguments.", subtopics: ["Read and write text files safely", "Parse and emit JSON and YAML", "Define arguments and flags with argparse", "Load config with CLI overrides", "Build a config-driven CLI tool"], links: [L("argparse", "https://docs.python.org/3/library/argparse.html")] },
        { key: "py-os", title: "subprocess, pathlib & OS automation", hours: 4, goal: "Run and check system commands safely from Python.", subtopics: ["Build paths portably with pathlib", "Run commands with subprocess.run", "Capture output and check return codes", "Avoid shell=True and injection risks", "Script a disk-cleanup task"], links: [L("subprocess", "https://docs.python.org/3/library/subprocess.html"), L("pathlib", "https://docs.python.org/3/library/pathlib.html")] },
        { key: "py-http", title: "Calling HTTP APIs with requests", hours: 4, goal: "Call REST APIs with auth, retries and error handling.", subtopics: ["Make GET and POST calls with requests", "Send auth headers and tokens", "Handle status codes and timeouts", "Add retries with backoff", "Paginate through a public API"], links: [L("Requests docs", "https://requests.readthedocs.io/en/latest/")] },
        { key: "py-test", title: "Logging, error handling & pytest", hours: 5, goal: "Add logging and tests so your automation fails loudly and predictably.", subtopics: ["Configure the logging module and levels", "Raise and catch specific exceptions", "Write pytest tests with assertions", "Use fixtures and parametrize", "Mock subprocess and HTTP calls"], links: [L("pytest", "https://docs.pytest.org/en/stable/"), L("logging HOWTO", "https://docs.python.org/3/howto/logging.html")] },
        { key: "py-web", title: "A small web service with FastAPI", hours: 5, goal: "Build the service you will containerise and deploy in later modules.", subtopics: ["Create a FastAPI app with routes", "Validate requests with Pydantic models", "Add a health check endpoint", "Read settings from environment variables", "Test endpoints with TestClient"], links: [L("FastAPI tutorial", "https://fastapi.tiangolo.com/tutorial/")] },
      ],
    },
    {
      key: "git",
      title: "Git for DevOps",
      summary: "Version control for code and infrastructure.",
      links: [L("Pro Git book", "https://git-scm.com/book/en/v2")],
      topics: [
        { key: "git-basics", title: "Commits, branches, merges & pull requests", hours: 4, goal: "Work on branches and open pull requests confidently. (The GitHub path goes deeper.)", subtopics: ["Stage, commit and write good messages", "Create and switch branches", "Merge branches and resolve simple conflicts", "Push and open a pull request", "Review and merge a teammate's PR"] },
      ],
    },
    {
      key: "containers",
      title: "Containers with Docker",
      summary: "Package the app once, run it anywhere.",
      links: [L("Docker docs", "https://docs.docker.com/get-started/")],
      topics: [
        { key: "docker-basics", title: "Images, containers, volumes & networks", hours: 6, goal: "Run, inspect and debug containers and understand image layers.", subtopics: ["Run, stop and remove containers", "Inspect logs and exec into containers", "Understand image layers and caching", "Persist data with volumes and bind mounts", "Connect containers on a user network"] },
        { key: "dockerfile", title: "Dockerfiles & multi-stage builds for Python", hours: 4, goal: "Write a small, cache-friendly image for your FastAPI service.", subtopics: ["Write a Dockerfile for the FastAPI app", "Order layers for cache hits", "Add a multi-stage build", "Run as a non-root user", "Shrink the image with a slim base"], links: [L("Multi-stage builds", "https://docs.docker.com/build/building/multi-stage/")] },
        { key: "compose", title: "Docker Compose for local stacks", hours: 3, goal: "Run the app with a database and cache using one compose file.", subtopics: ["Define app, Postgres and Redis services", "Wire services with networks and env vars", "Add volumes and health checks", "Start and debug the stack with compose up"], links: [L("Compose docs", "https://docs.docker.com/compose/")] },
        { key: "registry", title: "Registries & image tagging", hours: 2, goal: "Push versioned images to Docker Hub, GHCR or ECR.", subtopics: ["Tag images with semver and git SHA", "Push to Docker Hub or GHCR", "Authenticate and push to ECR"] },
      ],
    },
    {
      key: "cicd",
      title: "CI/CD pipelines",
      summary: "Every push is tested, built and shippable.",
      links: [L("GitHub Actions docs", "https://docs.github.com/en/actions")],
      topics: [
        { key: "cicd-concepts", title: "CI/CD concepts & branching strategies", hours: 2, goal: "Design a pipeline: lint, test, build, scan, deploy, with promotion between environments.", subtopics: ["Learn CI vs continuous delivery vs deployment", "Compare trunk-based and GitFlow branching", "Sketch stages from lint to deploy"] },
        { key: "gha-python", title: "GitHub Actions pipeline for the Python service", hours: 5, goal: "Run tests, build the image and push it on every merge to main.", subtopics: ["Write a workflow triggered on push and PR", "Run lint and pytest in CI", "Cache pip dependencies", "Build and push the image on main", "Add a status badge to the README"] },
        { key: "jenkins", title: "Jenkins pipelines (for interviews and legacy shops)", hours: 4, goal: "Read and write a declarative Jenkinsfile.", subtopics: ["Learn Jenkins agents, jobs and plugins", "Write a declarative Jenkinsfile", "Add stages, post steps and credentials", "Compare Jenkins with GitHub Actions"], links: [L("Jenkins docs", "https://www.jenkins.io/doc/")] },
      ],
    },
    {
      key: "aws",
      title: "Cloud with AWS",
      summary: "The core services most teams actually use.",
      links: [L("AWS documentation", "https://docs.aws.amazon.com/"), L("Boto3 docs", "https://boto3.amazonaws.com/v1/documentation/api/latest/index.html")],
      topics: [
        { key: "aws-iam", title: "IAM, accounts & least privilege", hours: 4, goal: "Create users, roles and policies without handing out admin.", subtopics: ["Secure the root account with MFA", "Create IAM users, groups and roles", "Write a least-privilege JSON policy", "Use roles instead of long-lived keys", "Test access with the policy simulator"] },
        { key: "aws-compute", title: "VPC, EC2, security groups & load balancers", hours: 6, goal: "Launch a reachable, locked-down server in your own VPC.", subtopics: ["Build a VPC with public and private subnets", "Configure route tables and gateways", "Launch EC2 with a key pair", "Lock down security groups", "Put an ALB in front of instances"] },
        { key: "aws-data", title: "S3, RDS & Lambda", hours: 5, goal: "Store files, run a managed database and deploy a function.", subtopics: ["Create an S3 bucket with lifecycle rules", "Launch an RDS Postgres instance", "Connect the app to RDS securely", "Deploy a Python Lambda function", "Trigger Lambda from S3 events"] },
        { key: "boto3", title: "Automating AWS with boto3", hours: 5, goal: "Write Python scripts that audit and clean up AWS resources.", subtopics: ["Configure credentials and sessions", "List EC2 instances and S3 buckets", "Handle pagination and errors", "Find untagged or idle resources", "Write a dry-run clean-up script"] },
      ],
    },
    {
      key: "iac",
      title: "Infrastructure as Code",
      summary: "Servers and networks described in files you can review.",
      topics: [
        { key: "tf-basics", title: "Terraform basics: providers, resources, plan/apply", hours: 6, goal: "Provision a VPC and EC2 instance from code.", subtopics: ["Install Terraform and configure the AWS provider", "Write resources for a VPC", "Run init, plan and apply", "Use outputs and data sources", "Launch an EC2 instance from code", "Destroy everything cleanly"], links: [L("Terraform tutorials", "https://developer.hashicorp.com/terraform/tutorials")] },
        { key: "tf-modules", title: "Terraform modules, variables & remote state", hours: 5, goal: "Reuse modules and keep state safely in S3 with locking.", subtopics: ["Use input variables and tfvars files", "Extract a reusable VPC module", "Consume a registry module", "Store state in S3 with locking", "Separate dev and prod environments"] },
        { key: "ansible", title: "Ansible playbooks & roles", hours: 6, goal: "Configure servers idempotently with playbooks.", subtopics: ["Set up an inventory and SSH access", "Run ad-hoc commands", "Write a playbook with tasks and handlers", "Use variables and Jinja2 templates", "Organise tasks into roles", "Verify idempotency with a second run"], links: [L("Ansible docs", "https://docs.ansible.com/")] },
      ],
    },
    {
      key: "k8s",
      title: "Kubernetes",
      summary: "Run containers at scale with self-healing and rollouts.",
      links: [L("Kubernetes basics", "https://kubernetes.io/docs/tutorials/kubernetes-basics/")],
      topics: [
        { key: "k8s-arch", title: "Architecture, kubectl & a local cluster", hours: 5, goal: "Explain control plane vs nodes and run workloads on kind or minikube.", subtopics: ["Learn control plane and node components", "Create a local cluster with kind", "Use kubectl get, describe and logs", "Run a Pod and inspect it", "Understand namespaces and contexts"] },
        { key: "k8s-workloads", title: "Deployments, Services, Ingress, ConfigMaps & Secrets", hours: 7, goal: "Deploy the FastAPI service with config, secrets and an ingress.", subtopics: ["Write a Deployment for the FastAPI app", "Expose it with a Service", "Route traffic with an Ingress", "Inject config with ConfigMaps", "Store credentials in Secrets", "Add readiness and liveness probes"] },
        { key: "helm", title: "Helm charts", hours: 4, goal: "Package your manifests into a chart with per-environment values.", subtopics: ["Learn chart structure and templates", "Convert manifests into a chart", "Add per-environment values files", "Install, upgrade and roll back releases"], links: [L("Helm docs", "https://helm.sh/docs/")] },
        { key: "k8s-python", title: "Kubernetes Python client", hours: 3, goal: "Script cluster checks and clean-ups in Python.", subtopics: ["Load kubeconfig with the Python client", "List pods and their statuses", "Script a clean-up of failed pods"], links: [L("kubernetes-client/python", "https://github.com/kubernetes-client/python")] },
      ],
    },
    {
      key: "observability",
      title: "Monitoring & observability",
      summary: "Know when it breaks before users do.",
      topics: [
        { key: "prometheus", title: "Prometheus & custom Python metrics", hours: 4, goal: "Expose metrics from your app and write alerting rules.", subtopics: ["Run Prometheus and scrape a target", "Expose metrics with prometheus_client", "Add counters and histograms", "Write PromQL queries", "Define an alerting rule"], links: [L("Prometheus docs", "https://prometheus.io/docs/introduction/overview/"), L("client_python", "https://github.com/prometheus/client_python")] },
        { key: "grafana", title: "Grafana dashboards", hours: 3, goal: "Build a dashboard for latency, errors and saturation.", subtopics: ["Connect Grafana to Prometheus", "Chart latency percentiles and error rate", "Add saturation panels and variables", "Export the dashboard as JSON"], links: [L("Grafana docs", "https://grafana.com/docs/grafana/latest/")] },
        { key: "logging", title: "Centralised logging", hours: 3, goal: "Ship container logs to Loki or ELK and query them.", subtopics: ["Log structured JSON from the app", "Ship container logs to Loki or ELK", "Query and filter logs by label", "Correlate logs with request IDs"] },
      ],
    },
    {
      key: "capstone",
      title: "Capstone project",
      summary: "One repo that shows everything end to end.",
      topics: [
        { key: "capstone", title: "FastAPI → Docker → Actions → Terraform → Kubernetes → Grafana", hours: 14, goal: "A public repo with a README diagram that you can walk an interviewer through.", subtopics: ["Build and test the FastAPI service", "Containerise it with a multi-stage image", "Add a GitHub Actions build pipeline", "Provision infrastructure with Terraform", "Deploy to Kubernetes with Helm", "Add Grafana dashboards and a README diagram"] },
      ],
    },
  ],
};

const github: LearningPath = {
  slug: "github-actions",
  title: "Git, GitHub & GitHub Actions",
  tagline: "Collaborate cleanly and automate everything.",
  description:
    "Master Git beyond add-commit-push, run a GitHub repo like a professional team, then automate testing, releases and cloud deployments with GitHub Actions, including reusable workflows and your own custom actions.",
  level: "Beginner → Intermediate",
  category: "DevOps & Cloud",
  icon: "git",
  outcomes: [
    "Use rebase, cherry-pick and reflog without fear",
    "Set up branch protection, reviews and CODEOWNERS",
    "Write workflows with matrices, caching, environments and secrets",
    "Build reusable workflows and custom actions",
    "Deploy to the cloud with OIDC instead of long-lived keys",
  ],
  tools: ["Git", "GitHub", "GitHub CLI", "GitHub Actions", "Dependabot", "CodeQL"],
  modules: [
    {
      key: "git-core",
      title: "Git, properly",
      summary: "How Git really works, so nothing surprises you.",
      links: [L("Pro Git book", "https://git-scm.com/book/en/v2"), L("Learn Git Branching", "https://learngitbranching.js.org/")],
      topics: [
        { key: "git-model", title: "How Git works: objects, commits, HEAD", hours: 2, goal: "Explain what a commit, branch and HEAD actually are.", subtopics: ["Learn blobs, trees and commit objects", "Explore .git with cat-file", "Understand branches and HEAD as pointers"] },
        { key: "git-branch", title: "Branching & merging", hours: 3, goal: "Use feature branches and understand fast-forward vs merge commits.", subtopics: ["Create and switch feature branches", "Compare fast-forward and merge commits", "Try squash merges", "Delete merged branches and prune remotes"] },
        { key: "git-history", title: "Rebase, cherry-pick, reset & reflog", hours: 3, goal: "Rewrite local history and recover 'lost' commits.", subtopics: ["Rebase a branch onto main", "Squash commits with interactive rebase", "Cherry-pick a fix across branches", "Compare soft, mixed and hard reset", "Recover lost commits with reflog"] },
        { key: "git-conflicts", title: "Resolving conflicts", hours: 2, goal: "Resolve merge and rebase conflicts calmly.", subtopics: ["Read conflict markers and diffs", "Resolve a merge conflict", "Resolve conflicts during a rebase"] },
      ],
    },
    {
      key: "github-collab",
      title: "Collaborating on GitHub",
      summary: "Run a repo the way good teams do.",
      links: [L("GitHub Docs", "https://docs.github.com/en")],
      topics: [
        { key: "gh-repo", title: "Repos, issues, labels & Projects", hours: 2, goal: "Plan work with issues and a Projects board.", subtopics: ["Create a repo with README and license", "Write issues with templates and labels", "Plan work on a Projects board"] },
        { key: "gh-pr", title: "Pull requests & code review", hours: 2, goal: "Open small reviewable PRs and give useful reviews.", subtopics: ["Open a small, focused PR", "Write a clear PR description", "Leave actionable review comments"] },
        { key: "gh-protect", title: "Branch protection, rulesets & CODEOWNERS", hours: 1.5, goal: "Require reviews and passing checks before merge.", subtopics: ["Protect main with required reviews", "Require passing status checks", "Add a CODEOWNERS file"] },
        { key: "gh-cli", title: "GitHub CLI", hours: 1.5, goal: "Manage PRs, issues and runs from the terminal.", subtopics: ["Install gh and authenticate", "Create and check out PRs from the terminal", "Watch workflow runs with gh run"], links: [L("gh manual", "https://cli.github.com/manual/")] },
      ],
    },
    {
      key: "actions-basics",
      title: "GitHub Actions fundamentals",
      summary: "Workflows, jobs and steps.",
      links: [L("GitHub Actions docs", "https://docs.github.com/en/actions")],
      topics: [
        { key: "gha-anatomy", title: "Workflows, events, jobs & steps", hours: 3, goal: "Write a CI workflow that runs tests on push and pull_request.", subtopics: ["Learn workflows, jobs, steps and runners", "Trigger on push and pull_request", "Use marketplace actions like checkout", "Pass data between steps with outputs", "Write a test workflow for a project"] },
        { key: "gha-matrix", title: "Runners & matrix builds", hours: 2, goal: "Test across versions and operating systems in parallel.", subtopics: ["Compare GitHub-hosted and self-hosted runners", "Add a matrix of versions and OSes", "Use include, exclude and fail-fast"] },
        { key: "gha-secrets", title: "Secrets, variables & environments", hours: 2, goal: "Gate deployments with environment protection rules.", subtopics: ["Store repo and org secrets", "Use configuration variables", "Add environments with required reviewers"] },
        { key: "gha-cache", title: "Caching & artifacts", hours: 2, goal: "Cut build times with caches and pass files between jobs.", subtopics: ["Cache dependencies with actions/cache", "Use built-in setup-* caching", "Upload and download artifacts between jobs"] },
      ],
    },
    {
      key: "actions-advanced",
      title: "Advanced Actions",
      summary: "Reuse, extend and secure your automation.",
      topics: [
        { key: "gha-reuse", title: "Reusable workflows & composite actions", hours: 3, goal: "Share one pipeline across many repos.", subtopics: ["Write a reusable workflow with workflow_call", "Pass inputs and secrets to it", "Build a composite action", "Call shared workflows from other repos"] },
        { key: "gha-custom", title: "Build a custom JavaScript or Docker action", hours: 4, goal: "Publish your own action with inputs and outputs.", subtopics: ["Compare JavaScript, Docker and composite actions", "Define inputs and outputs in action.yml", "Build a JavaScript action with the toolkit", "Test the action in a workflow", "Tag and publish a release"] },
        { key: "gha-oidc", title: "OIDC deployments to AWS/Azure/GCP", hours: 3, goal: "Deploy without storing cloud keys in secrets.", subtopics: ["Learn how OIDC tokens replace keys", "Configure a cloud trust policy", "Request id-token permission in workflows", "Deploy to the cloud with no stored secrets"] },
        { key: "gha-release", title: "Release automation & GitHub Packages", hours: 3, goal: "Tag, build changelogs and publish packages or images on release.", subtopics: ["Tag releases with semantic versions", "Generate changelogs automatically", "Publish packages to GitHub Packages", "Push images to GHCR on release"] },
        { key: "gha-security", title: "Dependabot, CodeQL & workflow permissions", hours: 2, goal: "Lock down GITHUB_TOKEN and scan code and dependencies.", subtopics: ["Set least-privilege GITHUB_TOKEN permissions", "Enable Dependabot updates and alerts", "Run CodeQL code scanning"] },
      ],
    },
    {
      key: "gh-project",
      title: "Project",
      summary: "Put it all together on a real repo.",
      topics: [
        { key: "gh-capstone", title: "Full pipeline: test → build → release → deploy", hours: 5, goal: "A repo with protected main, CI, automated releases and a deployment.", subtopics: ["Protect main with rules and CODEOWNERS", "Add CI tests on every pull request", "Automate releases and changelogs", "Deploy via OIDC with environment gates", "Document the pipeline in the README"] },
      ],
    },
  ],
};

const java: LearningPath = {
  slug: "backend-java",
  title: "Backend Java Development",
  tagline: "Modern Java and Spring Boot, production ready.",
  description:
    "Learn modern Java (17–21), SQL, and Spring Boot to build secure, tested REST APIs, then add caching, messaging and microservice patterns. Ends with a capstone backend you can deploy and show.",
  level: "Beginner → Intermediate",
  category: "Backend",
  icon: "coffee",
  outcomes: [
    "Write clean, modern Java with collections, streams and concurrency",
    "Design relational schemas and write efficient SQL",
    "Build REST APIs with Spring Boot, JPA, validation and Spring Security",
    "Test with JUnit 5, Mockito and Testcontainers",
    "Use Redis, Kafka and Docker in a microservice setup",
  ],
  tools: ["Java 21", "Maven", "Gradle", "JUnit 5", "Mockito", "PostgreSQL", "Spring Boot", "Hibernate", "Spring Security", "Redis", "Kafka", "Docker"],
  modules: [
    {
      key: "java-core",
      title: "Core Java",
      summary: "The language, done well.",
      links: [L("dev.java Learn", "https://dev.java/learn/"), L("roadmap.sh Java", "https://roadmap.sh/java")],
      topics: [
        { key: "java-syntax", title: "Syntax, types & control flow", hours: 6, goal: "Write and run small Java programs comfortably.", subtopics: ["Install a JDK and run a program", "Learn primitives, strings and operators", "Write if, switch and loops", "Use arrays and methods", "Solve 10 small console exercises"] },
        { key: "java-oop", title: "OOP: classes, interfaces, inheritance, composition", hours: 8, goal: "Model a domain with classes and interfaces, and know when to prefer composition.", subtopics: ["Write classes, fields and constructors", "Encapsulate state with access modifiers", "Use interfaces and abstract classes", "Apply inheritance and polymorphism", "Prefer composition over inheritance", "Implement equals, hashCode and toString"] },
        { key: "java-exceptions", title: "Exceptions & generics", hours: 5, goal: "Write type-safe generic code and handle errors deliberately.", subtopics: ["Compare checked and unchecked exceptions", "Close resources with try-with-resources", "Create custom exception types", "Write generic classes and methods", "Use bounded types and wildcards"] },
        { key: "java-collections", title: "Collections framework", hours: 6, goal: "Pick the right List, Set, Map or Queue and know their costs.", subtopics: ["Compare ArrayList and LinkedList", "Use HashSet, TreeSet and LinkedHashSet", "Use HashMap, TreeMap and LinkedHashMap", "Work with Queue, Deque and PriorityQueue", "Learn Big-O costs of common operations"] },
        { key: "java-streams", title: "Lambdas, streams & Optional", hours: 6, goal: "Transform data with streams instead of manual loops where it reads better.", subtopics: ["Write lambdas and method references", "Use map, filter and reduce", "Group data with Collectors.groupingBy", "Return Optional instead of null", "Refactor loops into streams"] },
        { key: "java-modern", title: "Modern Java: records, sealed types, pattern matching", hours: 4, goal: "Use Java 17–21 features to write less boilerplate.", subtopics: ["Replace POJOs with records", "Model hierarchies with sealed types", "Use pattern matching for instanceof", "Write switch expressions with patterns"] },
        { key: "java-concurrency", title: "Concurrency, executors & virtual threads", hours: 8, goal: "Write thread-safe code and use executors, CompletableFuture and virtual threads.", subtopics: ["Create threads and runnables", "Prevent races with synchronized and locks", "Use atomic and concurrent collections", "Run tasks with ExecutorService", "Chain async work with CompletableFuture", "Try virtual threads in Java 21"] },
        { key: "jvm", title: "JVM memory & garbage collection basics", hours: 4, goal: "Explain heap, stack and GC well enough to debug memory issues.", subtopics: ["Learn heap, stack and metaspace", "Compare common GC algorithms", "Read GC logs and heap dumps", "Diagnose a memory leak with VisualVM"] },
      ],
    },
    {
      key: "build-test",
      title: "Build tools & testing",
      summary: "Professional project setup.",
      topics: [
        { key: "maven-gradle", title: "Maven & Gradle", hours: 4, goal: "Manage dependencies, plugins and multi-module builds.", subtopics: ["Learn the Maven lifecycle and pom.xml", "Manage dependencies and scopes", "Write a Gradle build script", "Split a project into modules"], links: [L("Maven guide", "https://maven.apache.org/guides/getting-started/")] },
        { key: "junit", title: "Unit testing with JUnit 5", hours: 4, goal: "Write clear, fast unit tests.", subtopics: ["Write tests with @Test and assertions", "Use lifecycle annotations", "Write parameterized tests", "Name and structure tests clearly"], links: [L("JUnit 5 guide", "https://junit.org/junit5/docs/current/user-guide/")] },
        { key: "mockito", title: "Mocking with Mockito", hours: 3, goal: "Isolate units with mocks and verify interactions.", subtopics: ["Create mocks with @Mock and @InjectMocks", "Stub calls with when and thenReturn", "Verify interactions and capture arguments", "Know when not to mock"], links: [L("Mockito", "https://site.mockito.org/")] },
      ],
    },
    {
      key: "databases",
      title: "Databases & SQL",
      summary: "Most backend bugs are data bugs.",
      links: [L("SQLBolt", "https://sqlbolt.com/"), L("PostgreSQL tutorial", "https://www.postgresql.org/docs/current/tutorial.html")],
      topics: [
        { key: "sql", title: "SQL: joins, grouping, subqueries, window functions", hours: 8, goal: "Answer real questions from a schema with SQL.", subtopics: ["Write SELECT queries with filters and sorting", "Combine tables with inner and outer joins", "Aggregate with GROUP BY and HAVING", "Use subqueries and CTEs", "Rank rows with window functions", "Practise 20 queries on a sample schema"] },
        { key: "db-design", title: "Schema design, normalisation & indexes", hours: 5, goal: "Design tables and indexes and read an EXPLAIN plan.", subtopics: ["Model entities and relationships", "Normalise tables to 3NF", "Add primary, foreign and unique keys", "Create indexes for common queries", "Read an EXPLAIN plan"] },
        { key: "jdbc", title: "JDBC & connection pools", hours: 3, goal: "Understand what JPA does under the hood.", subtopics: ["Connect and query with JDBC", "Use PreparedStatement against SQL injection", "Configure a HikariCP connection pool"] },
      ],
    },
    {
      key: "spring",
      title: "Spring Boot",
      summary: "The framework most Java backend jobs use.",
      links: [L("Spring guides", "https://spring.io/guides"), L("Spring Boot reference", "https://docs.spring.io/spring-boot/index.html")],
      topics: [
        { key: "spring-di", title: "Spring core: IoC, beans & dependency injection", hours: 5, goal: "Explain how Spring wires beans and manages their lifecycle.", subtopics: ["Learn IoC and the application context", "Define beans with @Component and @Bean", "Use constructor injection", "Understand bean scopes and lifecycle"] },
        { key: "spring-boot", title: "Spring Boot: starters, config & profiles", hours: 4, goal: "Configure an app for dev, test and prod.", subtopics: ["Create a project with Spring Initializr", "Learn starters and auto-configuration", "Configure with application.yml", "Set up dev, test and prod profiles"] },
        { key: "spring-rest", title: "REST APIs with Spring MVC", hours: 8, goal: "Design and build a REST API with proper status codes and DTOs.", subtopics: ["Design resource URLs and HTTP methods", "Build controllers with @RestController", "Map entities to DTOs", "Return correct status codes", "Add pagination and sorting", "Build a CRUD API end to end"] },
        { key: "spring-validation", title: "Validation & global error handling", hours: 3, goal: "Validate input and return consistent error responses.", subtopics: ["Validate DTOs with Bean Validation annotations", "Handle errors with @ControllerAdvice", "Return a consistent error response body"] },
        { key: "spring-jpa", title: "Spring Data JPA & Hibernate", hours: 10, goal: "Map entities and relations and avoid N+1 queries.", subtopics: ["Map entities with @Entity and @Id", "Define one-to-many and many-to-many relations", "Write repository and derived queries", "Use JPQL and native queries", "Compare lazy and eager loading", "Fix N+1 queries with fetch joins"], links: [L("Spring Data JPA", "https://spring.io/projects/spring-data-jpa")] },
        { key: "spring-tx", title: "Transactions & database migrations (Flyway)", hours: 3, goal: "Use @Transactional correctly and version your schema.", subtopics: ["Use @Transactional and propagation", "Understand rollback rules", "Version the schema with Flyway migrations"] },
        { key: "spring-security", title: "Spring Security & JWT auth", hours: 8, goal: "Secure endpoints with authentication and role-based access.", subtopics: ["Learn the security filter chain", "Configure authentication with a user store", "Hash passwords with BCrypt", "Issue and validate JWTs", "Add role-based access to endpoints"], links: [L("Spring Security reference", "https://docs.spring.io/spring-security/reference/index.html")] },
        { key: "spring-testing", title: "Testing Spring apps & Testcontainers", hours: 5, goal: "Write slice and integration tests against a real database.", subtopics: ["Test controllers with @WebMvcTest", "Test repositories with @DataJpaTest", "Write @SpringBootTest integration tests", "Run Postgres with Testcontainers", "Test secured endpoints"], links: [L("Testcontainers", "https://testcontainers.com/")] },
        { key: "openapi", title: "API documentation with OpenAPI", hours: 2, goal: "Generate interactive API docs.", subtopics: ["Add springdoc-openapi to the project", "Annotate endpoints and schemas", "Explore the API in Swagger UI"] },
      ],
    },
    {
      key: "production",
      title: "Production backend",
      summary: "What separates a demo from a real service.",
      topics: [
        { key: "redis", title: "Caching with Redis", hours: 4, goal: "Cache hot reads and choose expiry and invalidation strategies.", subtopics: ["Run Redis and learn core data types", "Enable Spring caching with @Cacheable", "Set TTLs and eviction policies", "Invalidate caches on writes"], links: [L("Redis docs", "https://redis.io/docs/latest/")] },
        { key: "kafka", title: "Messaging with Kafka", hours: 6, goal: "Produce and consume events and understand partitions and consumer groups.", subtopics: ["Learn topics, partitions and offsets", "Run Kafka locally with Docker", "Produce events with KafkaTemplate", "Consume events with @KafkaListener", "Scale with consumer groups", "Handle retries and dead-letter topics"], links: [L("Kafka docs", "https://kafka.apache.org/documentation/")] },
        { key: "microservices", title: "Microservice patterns", hours: 8, goal: "Explain API gateways, service discovery, sagas and circuit breakers.", subtopics: ["Compare monoliths and microservices", "Route traffic through an API gateway", "Use service discovery and config servers", "Add circuit breakers with Resilience4j", "Coordinate transactions with sagas", "Design a small two-service system"], links: [L("microservices.io patterns", "https://microservices.io/patterns/")] },
        { key: "java-docker", title: "Docker & deployment for Java", hours: 3, goal: "Containerise a Spring Boot app and run it with its database.", subtopics: ["Write a multi-stage Dockerfile for Spring Boot", "Build layered jars for faster builds", "Run app and database with Compose"] },
        { key: "actuator", title: "Observability: Actuator & Micrometer", hours: 3, goal: "Expose health checks and metrics.", subtopics: ["Enable Actuator health and info endpoints", "Expose metrics with Micrometer", "Scrape metrics with Prometheus"] },
      ],
    },
    {
      key: "java-capstone",
      title: "Capstone project",
      summary: "A backend you can deploy and talk through.",
      topics: [
        { key: "java-capstone", title: "Build a secure REST backend (e.g. booking or expense API)", hours: 15, goal: "Auth, JPA, tests, Redis cache, Docker and a CI pipeline in one repo.", subtopics: ["Design the domain and REST endpoints", "Implement JPA entities and Flyway migrations", "Secure the API with JWT and roles", "Add Redis caching for hot reads", "Write unit and Testcontainers tests", "Dockerise it and add a CI pipeline"] },
      ],
    },
  ],
};

const interview: LearningPath = {
  slug: "interview-preparation",
  title: "Interview Preparation",
  tagline: "DSA, system design and stories that land offers.",
  description:
    "A structured plan for software engineering interviews: data structures and algorithms by pattern, system design, CS fundamentals, role-specific questions for Java and DevOps, and behavioural practice with mock interviews.",
  level: "Intermediate",
  category: "Career",
  icon: "target",
  outcomes: [
    "Recognise the common problem patterns and solve medium problems in 30–40 minutes",
    "Explain time and space complexity for any solution you write",
    "Run a system design interview from requirements to trade-offs",
    "Answer Java, Spring and DevOps questions with depth",
    "Tell clear STAR stories about your own work",
  ],
  tools: ["LeetCode", "NeetCode", "System Design Primer", "STAR method"],
  modules: [
    {
      key: "dsa",
      title: "Data structures & algorithms",
      summary: "Learn patterns, not individual problems.",
      links: [L("NeetCode roadmap", "https://neetcode.io/roadmap"), L("LeetCode", "https://leetcode.com/"), L("Big-O cheat sheet", "https://www.bigocheatsheet.com/")],
      topics: [
        { key: "big-o", title: "Big-O, time & space complexity", hours: 3, goal: "State the complexity of any solution you write.", subtopics: ["Learn Big-O, Big-Theta and Big-Omega", "Analyse loops and recursion costs", "Compare time and space trade-offs"] },
        { key: "arrays", title: "Arrays & strings", hours: 8, goal: "Solve prefix sums, in-place updates and string manipulation problems.", subtopics: ["Learn in-place updates and swaps", "Build prefix sums for range queries", "Practise string building and parsing", "Practice: Two Sum, Best Time to Buy Stock", "Practice: Product of Array Except Self", "Solve 15 easy and medium problems"] },
        { key: "hashing", title: "Hash maps & sets", hours: 5, goal: "Use hashing to turn O(n²) into O(n).", subtopics: ["Learn how hash maps work internally", "Count frequencies with maps", "Use sets for membership checks", "Practice: Group Anagrams, Contains Duplicate", "Practice: Longest Consecutive Sequence"] },
        { key: "two-pointers", title: "Two pointers & sliding window", hours: 6, goal: "Recognise and apply window and pointer patterns.", subtopics: ["Learn the opposite-ends pointer pattern", "Learn fixed and variable sliding windows", "Practice: Valid Palindrome, 3Sum", "Practice: Container With Most Water", "Practice: Longest Substring Without Repeating Characters"] },
        { key: "stacks", title: "Stacks, queues & monotonic stacks", hours: 5, goal: "Solve bracket, next-greater and queue problems.", subtopics: ["Implement stacks and queues from scratch", "Learn the monotonic stack pattern", "Practice: Valid Parentheses, Min Stack", "Practice: Daily Temperatures, Next Greater Element"] },
        { key: "linked-lists", title: "Linked lists", hours: 5, goal: "Reverse, merge and detect cycles without bugs.", subtopics: ["Implement a singly linked list", "Use dummy heads and fast/slow pointers", "Practice: Reverse Linked List, Merge Two Lists", "Practice: Linked List Cycle, Remove Nth Node"] },
        { key: "binary-search", title: "Binary search (including on answers)", hours: 5, goal: "Apply binary search to sorted data and to monotonic answer spaces.", subtopics: ["Write a bug-free binary search template", "Find first and last positions", "Search rotated sorted arrays", "Binary search on the answer space", "Practice: Koko Eating Bananas"] },
        { key: "recursion", title: "Recursion & backtracking", hours: 8, goal: "Generate subsets, permutations and combinations.", subtopics: ["Trace the call stack and base cases", "Learn the choose-explore-unchoose pattern", "Generate subsets and permutations", "Prune branches early", "Practice: Combination Sum, N-Queens", "Practice: Word Search"] },
        { key: "trees", title: "Trees & BSTs", hours: 8, goal: "Traverse trees and solve depth, path and BST problems.", subtopics: ["Implement DFS traversals recursively and iteratively", "Use BFS for level order", "Solve depth and path sum problems", "Validate and search a BST", "Practice: Max Depth, Lowest Common Ancestor", "Practice: Validate Binary Search Tree"] },
        { key: "heaps", title: "Heaps & priority queues", hours: 4, goal: "Solve top-k and merge-k problems.", subtopics: ["Learn heap operations and their costs", "Use PriorityQueue with comparators", "Practice: Kth Largest Element, Top K Frequent", "Practice: Merge K Sorted Lists"] },
        { key: "graphs", title: "Graphs: BFS, DFS, topological sort, Dijkstra", hours: 9, goal: "Model problems as graphs and pick the right traversal.", subtopics: ["Represent graphs with adjacency lists", "Traverse grids and graphs with BFS and DFS", "Detect cycles and order with topological sort", "Find shortest paths with Dijkstra", "Practice: Number of Islands, Course Schedule", "Practice: Network Delay Time"] },
        { key: "dp", title: "Dynamic programming", hours: 12, goal: "Go from recursion to memoisation to tabulation on 1D and 2D problems.", subtopics: ["Identify states and transitions", "Convert recursion to memoisation", "Convert memoisation to tabulation", "Solve 1D problems: Climbing Stairs, House Robber", "Solve 2D problems: LCS, Unique Paths", "Practice knapsack and Coin Change"] },
        { key: "greedy", title: "Greedy & intervals", hours: 5, goal: "Solve interval scheduling and greedy choice problems.", subtopics: ["Learn when greedy choice is safe", "Sort and merge intervals", "Practice: Merge Intervals, Non-overlapping Intervals", "Practice: Jump Game, Gas Station"] },
        { key: "tries", title: "Tries & union-find", hours: 4, goal: "Use tries for prefixes and union-find for connectivity.", subtopics: ["Implement a trie with insert and search", "Implement union-find with path compression", "Practice: Implement Trie, Word Search II", "Practice: Number of Connected Components"] },
      ],
    },
    {
      key: "system-design",
      title: "System design",
      summary: "Structured thinking about large systems.",
      links: [L("System Design Primer", "https://github.com/donnemartin/system-design-primer")],
      topics: [
        { key: "sd-basics", title: "Fundamentals: scaling, load balancing, CAP", hours: 6, goal: "Explain horizontal scaling, consistency and availability trade-offs.", subtopics: ["Compare vertical and horizontal scaling", "Learn load balancers and algorithms", "Explain CAP and consistency models", "Estimate traffic and storage needs", "Use a step-by-step design framework"] },
        { key: "sd-data", title: "Caching, replication, sharding & databases", hours: 5, goal: "Choose storage and caching strategies and justify them.", subtopics: ["Compare SQL and NoSQL stores", "Learn cache-aside and write-through caching", "Explain leader-follower replication", "Shard data with consistent hashing", "Justify storage choices with trade-offs"] },
        { key: "sd-async", title: "Queues, async processing & rate limiting", hours: 3, goal: "Design background processing and protect services from overload.", subtopics: ["Decouple work with message queues", "Design idempotent background workers", "Compare token bucket and leaky bucket"] },
        { key: "sd-practice", title: "Practice: URL shortener, chat, news feed, rate limiter", hours: 10, goal: "Run a 45-minute design interview end to end.", subtopics: ["Design a URL shortener", "Design a chat system", "Design a news feed", "Design a rate limiter", "Run timed 45-minute mock designs"] },
      ],
    },
    {
      key: "cs",
      title: "CS fundamentals",
      summary: "The theory questions that still come up.",
      topics: [
        { key: "os", title: "Operating systems: processes, threads, memory, deadlocks", hours: 5, goal: "Answer OS questions with concrete examples.", subtopics: ["Compare processes and threads", "Learn CPU scheduling algorithms", "Explain virtual memory and paging", "Explain deadlock conditions and prevention", "Prepare examples for mutexes and semaphores"], links: [L("OSTEP (free book)", "https://pages.cs.wisc.edu/~remzi/OSTEP/")] },
        { key: "cn", title: "Computer networks: TCP/UDP, HTTP, DNS, TLS", hours: 4, goal: "Explain what happens when you type a URL.", subtopics: ["Compare TCP and UDP with handshakes", "Explain DNS resolution step by step", "Explain HTTP versions and TLS handshakes", "Answer: what happens when you type a URL"] },
        { key: "dbms", title: "DBMS: ACID, isolation levels, indexes, normalisation", hours: 4, goal: "Explain transactions and indexes with trade-offs.", subtopics: ["Explain ACID properties with examples", "Compare isolation levels and anomalies", "Explain B-tree indexes and their trade-offs", "Walk through normal forms"] },
      ],
    },
    {
      key: "role",
      title: "Role-specific questions",
      summary: "Depth in your own stack.",
      topics: [
        { key: "java-qs", title: "Java & Spring Boot interview questions", hours: 6, goal: "Explain collections internals, concurrency, JVM and Spring internals.", subtopics: ["Explain HashMap and ConcurrentHashMap internals", "Review equals, hashCode and immutability", "Answer threading and synchronization questions", "Explain JVM memory and GC", "Explain Spring beans, proxies and @Transactional"] },
        { key: "devops-qs", title: "DevOps, Docker, Kubernetes & CI/CD questions", hours: 6, goal: "Walk through troubleshooting and design scenarios.", subtopics: ["Explain Docker images, layers and networking", "Debug a CrashLoopBackOff pod", "Design a CI/CD pipeline aloud", "Walk through a production outage scenario", "Compare deployment strategies like blue-green and canary"] },
        { key: "sql-qs", title: "SQL interview problems", hours: 4, goal: "Solve ranking, aggregation and join puzzles quickly.", subtopics: ["Practice ranking with ROW_NUMBER and DENSE_RANK", "Practice: Second Highest Salary, Nth Highest", "Solve aggregation and self-join puzzles", "Practise timed SQL problems"] },
      ],
    },
    {
      key: "behavioral",
      title: "Behavioural & job search",
      summary: "Get the interview, then close it.",
      topics: [
        { key: "resume", title: "Resume, LinkedIn & GitHub profile", hours: 3, goal: "A one-page resume with measurable impact and pinned projects.", subtopics: ["Rewrite bullets with measurable impact", "Fit the resume on one page", "Update LinkedIn headline and summary", "Pin projects and polish GitHub READMEs"] },
        { key: "star", title: "STAR stories for common questions", hours: 3, goal: "Six to eight polished stories: conflict, failure, leadership, impact.", subtopics: ["Learn the STAR structure", "Write stories for conflict and failure", "Write stories for leadership and impact", "Rehearse each story in two minutes"] },
        { key: "mocks", title: "Mock interviews & timed practice", hours: 8, goal: "Do at least four timed mocks and fix what they expose.", subtopics: ["Schedule four or more timed mocks", "Mix DSA, system design and behavioural rounds", "Record feedback after each mock", "Drill weak areas between mocks", "Practise thinking aloud while coding"] },
      ],
    },
  ],
};

export const paths: LearningPath[] = [
  devops,
  github,
  java,
  interview,
  ...morePaths,
  cyberSecurityFundamentalsPath,
  ethicalHackingPath,
  linuxSystemProgrammingPath,
  linuxAdministrationPath,
  dataStructuresAlgorithmsPath,
  computerNetworkingPath,
];

export function getPath(slug: string): LearningPath | undefined {
  return paths.find((p) => p.slug === slug);
}

export function pathHours(p: { modules: Module[] }): number {
  return p.modules.reduce((s, m) => s + m.topics.reduce((t, x) => t + x.hours, 0), 0);
}

export function pathTopicCount(p: { modules: Module[] }): number {
  return p.modules.reduce((s, m) => s + m.topics.length, 0);
}

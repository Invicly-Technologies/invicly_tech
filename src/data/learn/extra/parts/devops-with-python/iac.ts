import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "iac/tf-basics": {
    plain: [
      "Terraform lets you describe servers, networks and databases in text files instead of clicking in a web console. You write what you want, for example one network and one server, and Terraform works out the API calls needed to make the cloud look like that.",
      "The files use a language called HCL (HashiCorp Configuration Language). It is made of blocks: a provider block says which cloud to talk to, resource blocks describe things to create, and output blocks print useful values such as an IP address.",
      "The daily work is three commands. terraform init downloads the plugins. terraform plan shows a preview: what will be created, changed or deleted. terraform apply does it. Because the files live in Git, every change to your infrastructure can be reviewed like code.",
      "Terraform remembers what it created in a state file. Next time, it compares your code, the state and the real cloud, and changes only the differences. When you are done, terraform destroy removes everything it made, so a test environment costs nothing overnight.",
    ],
    deepDive: [
      {
        heading: "Installing Terraform and configuring the AWS provider",
        body: "Install Terraform from HashiCorp's package repository (apt, dnf or brew via the hashicorp/tap) and check it with terraform version. Since version 1.6, Terraform uses the Business Source License; OpenTofu is a community fork with the same commands under the name tofu.\n\nIn a terraform block, declare required_providers with a source (hashicorp/aws) and a version constraint such as ~> 6.0, which allows 6.x updates but not 7.0. terraform init downloads the provider and writes .terraform.lock.hcl with the exact version and checksums. Commit that lock file so everyone and CI use the same provider build; do not commit the .terraform folder.\n\nThe AWS provider finds credentials the same way the AWS CLI does: environment variables, a profile in ~/.aws (including SSO logins), or an IAM role on the machine running Terraform. Never write access keys into .tf files. Set the region in the provider block and add default_tags so every resource gets owner and project tags automatically.",
        bullets: ["Commit .terraform.lock.hcl; ignore .terraform/ and *.tfstate", "~> 6.0 means at least 6.0 and below 7.0", "Credentials come from env vars, profiles or roles, never .tf files"],
      },
      {
        heading: "How Terraform decides what to do",
        body: "Terraform reads all .tf files in the folder as one configuration; file names only help humans. When one resource refers to another, like vpc_id = aws_vpc.main.id, Terraform records a dependency. From all these references it builds a graph and creates resources in the right order, running independent ones in parallel (10 at a time by default).\n\nDuring plan, Terraform refreshes: it asks AWS for the current settings of every resource in state. It then compares three things: your code (desired), the state (what it created before) and reality (what AWS reports). Any difference becomes a planned action.\n\nThe plan uses symbols. A plus sign means create, a minus sign means destroy, a tilde means update in place, and -/+ means the resource must be replaced: destroyed and created again. Replacement happens when you change an attribute that AWS cannot modify on a live resource, such as a subnet's CIDR block. That is the line to look for before you type yes.",
        visual: {
          type: "flow",
          title: "What happens inside terraform plan",
          steps: [
            { label: "Parse .tf files", detail: "All files in the folder form one config" },
            { label: "Build the graph", detail: "References decide the order" },
            { label: "Refresh", detail: "Read real settings from AWS" },
            { label: "Diff", detail: "Code vs state vs reality" },
            { label: "Show actions", detail: "+ create, ~ update, -/+ replace, - destroy" },
          ],
        },
      },
      {
        heading: "Building a VPC that actually routes traffic",
        body: "An aws_vpc alone is an empty private network. To make a public subnet that can reach the internet you need four more pieces. An aws_subnet with a CIDR inside the VPC range and an availability zone. An aws_internet_gateway attached to the VPC. An aws_route_table with a route for 0.0.0.0/0 pointing to that gateway. And an aws_route_table_association that links the subnet to the route table. A subnet is called public only because its route table sends traffic to an internet gateway.\n\nSet map_public_ip_on_launch = true on the public subnet so instances there get a public IP. Private subnets use a separate route table with no internet gateway route; if they need outbound access, they route to a NAT gateway, which costs money per hour.\n\nUse the aws_availability_zones data source instead of typing zone names, so the code works in any region.",
        visual: {
          type: "tree",
          title: "Resources behind one public subnet",
          root: "aws_vpc.main (10.0.0.0/16)",
          children: [
            { label: "aws_subnet.public", children: ["10.0.1.0/24 in one AZ", "map_public_ip_on_launch = true"] },
            { label: "aws_internet_gateway.gw", children: ["Attached to the VPC"] },
            { label: "aws_route_table.public", children: ["0.0.0.0/0 to the gateway"] },
            { label: "aws_route_table_association", children: ["Links subnet to route table"] },
            { label: "aws_security_group.web", children: ["Allow 22 from your IP, 80 from anywhere"] },
          ],
        },
      },
      {
        heading: "Outputs, data sources and launching EC2",
        body: "A data source reads something that already exists without managing it. The classic example is finding the latest Ubuntu image: data \"aws_ami\" with most_recent = true, owners set to Canonical's account 099720109477, and a name filter. You then use data.aws_ami.ubuntu.id as the instance's ami. Because the lookup runs on each plan, a new Ubuntu release can trigger an instance replacement, so production teams often pin the AMI ID.\n\nAn aws_instance needs at least an ami and an instance_type, such as t3.micro. Place it with subnet_id, protect it with vpc_security_group_ids, and set key_name to an existing EC2 key pair for SSH. user_data runs a script on first boot.\n\nOutputs print values after apply, for example the public IP, and terraform output -raw public_ip gives just the value for scripts. Outputs marked sensitive = true are hidden in the console but still stored in state as plain text.",
        bullets: ["data sources read; resources create and manage", "terraform output -raw name prints one value for scripts", "sensitive hides output on screen, not in state"],
      },
      {
        heading: "Destroying cleanly and avoiding drift",
        body: "terraform destroy builds the dependency graph in reverse and deletes everything in state: instances before subnets, subnets before the VPC. Run terraform plan -destroy first to see the list. If something fails, often because a resource created outside Terraform (like a hand-made security group) still uses the VPC, delete that blocker and run destroy again.\n\nFor important resources, add lifecycle { prevent_destroy = true }; Terraform will then refuse any plan that deletes it. create_before_destroy makes Terraform build the replacement before removing the old one, which avoids downtime for some resources.\n\nDrift is when reality no longer matches the code, usually because someone changed a setting in the console. Plan will show it as a change back to the code. terraform plan -refresh-only shows drift without proposing fixes. The rule that prevents drift is simple: once a resource is managed by Terraform, change it only through Terraform.",
        bullets: ["terraform plan -destroy previews a destroy", "lifecycle { prevent_destroy = true } guards key resources", "terraform state list shows everything Terraform manages"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "From your .tf file to a running server",
        layers: [
          { label: "Your HCL code", detail: "resource aws_instance web" },
          { label: "Terraform core", detail: "Builds the graph, plans, keeps state" },
          { label: "AWS provider plugin", detail: "Turns resources into API calls" },
          { label: "AWS APIs", detail: "EC2 RunInstances, CreateVpc and more" },
          { label: "Real infrastructure", detail: "The VPC and instance in your account" },
        ],
      },
    ],
    examples: [
      {
        title: "Launch an Ubuntu EC2 instance in your public subnet",
        explanation: "This continues the explainer's VPC. Step 1: a data source finds the newest Ubuntu 24.04 image from Canonical. Step 2: the instance uses it and sits in the public subnet (add key_name with an existing key pair if you want SSH). Step 3: user_data installs nginx on first boot. Step 4: an output prints the public IP. Run terraform plan, check it says 1 to add, then apply and open the IP in a browser (the security group must allow port 80).",
        code: {
          lang: "hcl",
          code: `data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }
}
resource "aws_instance" "web" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = "t3.micro"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.web.id]
  user_data              = "#!/bin/bash\\napt-get update && apt-get install -y nginx"
}`,
        },
      },
      {
        title: "Read a plan that wants to replace something",
        explanation: "You changed the subnet CIDR from 10.0.1.0/24 to 10.0.2.0/24 and ran plan. Step 1: look at the summary line: 1 to add, 0 to change, 1 to destroy. Step 2: find the resource marked -/+ and the attribute with the comment forces replacement. Step 3: notice the instance in that subnet is also replaced, because its subnet_id will change. Step 4: decide: if this is not what you want, revert the code. Saving the plan with -out and applying that file guarantees apply does exactly what you reviewed.",
        code: {
          lang: "bash",
          code: `terraform fmt && terraform validate
terraform plan -out=tfplan
#  -/+ resource "aws_subnet" "public" {
#        ~ cidr_block = "10.0.1.0/24" -> "10.0.2.0/24" # forces replacement
#  Plan: 2 to add, 0 to change, 2 to destroy.
terraform show tfplan          # review the saved plan again
terraform apply tfplan         # applies exactly this plan, no new prompt`,
        },
      },
    ],
    cheatSheet: [
      "terraform init downloads providers; rerun after adding a provider or module",
      "terraform fmt formats files; terraform validate checks syntax and references",
      "terraform plan -out=tfplan then terraform apply tfplan applies exactly what you reviewed",
      "Plan symbols: + create, ~ update in place, -/+ replace, - destroy",
      "Commit .terraform.lock.hcl; never commit .terraform/ or terraform.tfstate",
      "Canonical's AWS account ID for official Ubuntu AMIs is 099720109477",
      "terraform state list shows managed resources; terraform output -raw x prints one value",
      "terraform plan -destroy previews what terraform destroy would delete",
    ],
    quiz: [
      {
        q: "In a plan, what does -/+ next to a resource mean?",
        options: ["It will be updated in place", "It will be destroyed and created again", "It will be imported", "It is drifted but left alone"],
        answer: 1,
        why: "Some attributes cannot be changed on a live resource, so Terraform must replace it.",
      },
      {
        q: "Which file should you commit so everyone uses the same provider versions?",
        options: [".terraform.lock.hcl", "terraform.tfstate", ".terraform/providers", "terraform.tfvars"],
        answer: 0,
        why: "The lock file records exact provider versions and checksums chosen at init.",
      },
      {
        q: "What makes a subnet public in AWS?",
        options: ["Its name contains public", "It has a /24 CIDR", "Its route table sends 0.0.0.0/0 to an internet gateway", "It is in the first availability zone"],
        answer: 2,
        why: "Public or private is decided by routing, not by any subnet setting name.",
      },
      {
        q: "What does a data source do?",
        options: ["Creates a resource only once", "Stores state remotely", "Encrypts sensitive outputs", "Reads existing information without managing it"],
        answer: 3,
        why: "Data sources are read-only lookups, like finding the latest AMI.",
      },
      {
        q: "A teammate changed a security group rule in the console. What will the next terraform plan show?",
        options: ["Nothing, Terraform ignores console changes", "A change to put the rule back as the code says", "An error that state is corrupted", "A request to import the rule"],
        answer: 1,
        why: "Refresh detects the drift and the plan proposes restoring the configured value.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Add a terraform block that pins the AWS provider to version 6.x and requires Terraform 1.10 or newer, then initialise and confirm the versions.",
        hint: "required_version and required_providers both live in the terraform block.",
        solution: `terraform {
  required_version = ">= 1.10"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 6.0" }
  }
}
# then: terraform init && terraform version`,
      },
      {
        level: "medium",
        task: "Make the public subnet actually reach the internet: add an internet gateway, a route table with a default route and the association.",
        hint: "Three resources; each refers to the VPC, the gateway or the subnet by .id.",
        solution: `resource "aws_internet_gateway" "gw" { vpc_id = aws_vpc.main.id }
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
}
resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}`,
      },
      {
        level: "hard",
        task: "Create one public subnet per availability zone (first two zones in the region) using a data source and count, with CIDRs 10.0.0.0/24 and 10.0.1.0/24 computed, and output all subnet IDs.",
        hint: "data aws_availability_zones gives names; cidrsubnet(prefix, newbits, netnum) computes ranges; a splat [*] collects IDs.",
        solution: `data "aws_availability_zones" "available" { state = "available" }
resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  cidr_block              = cidrsubnet(aws_vpc.main.cidr_block, 8, count.index)
  map_public_ip_on_launch = true
}
output "public_subnet_ids" { value = aws_subnet.public[*].id }`,
      },
    ],
    faq: [
      { q: "What is the difference between Terraform and Ansible?", a: "Terraform creates and deletes infrastructure such as networks, servers and databases, and tracks them in state. Ansible configures what runs inside servers, such as packages and config files. Many teams use Terraform to build the server and Ansible to set it up." },
      { q: "Is Terraform still free to use?", a: "Yes for normal use: the Business Source License lets you use Terraform to manage your own infrastructure. It restricts building competing commercial products. OpenTofu is an open-source fork if your company needs that." },
      { q: "What happens if I delete the state file?", a: "Terraform forgets the resources but they keep running in AWS. A new apply would try to create duplicates, so you would have to import them back. This is why state belongs in a versioned remote backend." },
      { q: "Can Terraform manage resources I created by hand?", a: "Yes. Add an import block (or run terraform import) with the resource address and its real ID, write matching configuration, and run plan until it shows no changes." },
    ],
  },

  "iac/tf-modules": {
    plain: [
      "As your Terraform code grows, you will copy the same network setup into dev, staging and prod. A module stops that copying. A module is simply a folder of .tf files that you call from somewhere else, passing in values, like calling a function.",
      "Variables are the inputs of a module, and outputs are its return values. A tfvars file holds the input values for one environment: dev might use small servers and one zone, prod bigger servers and three zones, all with the same module code.",
      "State is Terraform's memory of what it built. On a laptop, it gets lost or overwritten. In a team, you store it remotely in an S3 bucket, with locking so two people cannot apply at the same moment.",
      "Finally, keep each environment separate: its own folder, its own variable values and its own state file. Then a mistake while testing in dev cannot delete anything in prod.",
    ],
    deepDive: [
      {
        heading: "Variables, types and where values come from",
        body: "A variable block can set a type (string, number, bool, list(string), map(string), object({...})), a default, a description, and validation rules with a condition and error message. A variable without a default is required. sensitive = true hides the value in plan output.\n\nValues can come from several places, and later sources win. From lowest to highest priority: TF_VAR_name environment variables, terraform.tfvars, terraform.tfvars.json, any *.auto.tfvars files (in alphabetical order), and finally -var and -var-file options on the command line, in the order given. terraform.tfvars and *.auto.tfvars load automatically; other files need -var-file=prod.tfvars.\n\nlocals are internal named values, good for building names or common tags once (local.name_prefix). They are not inputs, so callers cannot override them. Keep secrets out of tfvars files in Git; pass them with TF_VAR_ variables from your CI secret store or read them from a secrets manager with a data source.",
        bullets: ["No default means the variable is required", "-var and -var-file override everything else", "Use validation blocks to reject bad values early"],
        visual: {
          type: "layers",
          title: "Variable value precedence (top wins)",
          layers: [
            { label: "-var and -var-file", detail: "Command line, in the order given" },
            { label: "*.auto.tfvars", detail: "Loaded automatically, alphabetical order" },
            { label: "terraform.tfvars.json", detail: "Loaded automatically" },
            { label: "terraform.tfvars", detail: "Loaded automatically" },
            { label: "TF_VAR_name", detail: "Environment variables" },
            { label: "default in the variable block", detail: "Used only if nothing else is set" },
          ],
        },
      },
      {
        heading: "Writing your own VPC module",
        body: "A good module has a small, clear interface. variables.tf declares the inputs (name, cidr, az_count), main.tf holds the resources, and outputs.tf exposes what callers need (vpc_id, public_subnet_ids, private_subnet_ids). Callers can only see outputs; they cannot reach into the module's resources directly.\n\nInside the module, use variables instead of fixed values and count or for_each to create one subnet per zone. Do not put a provider block with credentials inside a reusable module; the root configuration configures providers and passes them down.\n\nWhen you move existing resources into a module, their addresses change, for example from aws_vpc.main to module.vpc.aws_vpc.this. Without help, Terraform would plan to destroy the old one and create a new one. A moved block (from and to addresses) tells Terraform it is the same object, so the plan shows a move with no real changes. Run plan and confirm 0 to destroy before applying.",
        bullets: ["Inputs in variables.tf, outputs in outputs.tf", "Root config owns provider settings", "moved blocks refactor without recreating resources"],
      },
      {
        heading: "Using registry modules safely",
        body: "The public Terraform Registry hosts community modules. The popular terraform-aws-modules/vpc/aws module builds a VPC with public and private subnets, route tables and optional NAT gateways from a dozen inputs. Its source is written as namespace/name/provider, and you set a version constraint next to it.\n\nAlways pin the version. Without it, terraform init picks the newest release, and a major version can rename inputs or change resources. Use an exact version or a pessimistic constraint like ~> 6.0, and upgrade on purpose with terraform init -upgrade followed by a careful plan. Git sources can be pinned with ?ref=v1.2.0 at the end of the URL.\n\nBefore adopting a module, read its inputs, outputs and examples on the registry page, check that it is maintained, and look at what it creates in the plan. A registry module saves time, but you still own every resource it makes, including its costs (one NAT gateway per zone adds up).",
      },
      {
        heading: "Remote state in S3 with locking",
        body: "The state file maps every resource in your code to a real ID, and it can contain secrets such as database passwords in plain text. So it must be shared, protected and never lost.\n\nThe s3 backend stores it in a bucket. Turn on bucket versioning so you can recover an older state, block all public access, enable encryption (encrypt = true), and limit IAM access to the people and pipelines that run Terraform. Use a key per environment and stack, like prod/network.tfstate.\n\nLocking stops two applies at once. Since Terraform 1.10, use_lockfile = true locks by writing a .tflock object next to the state in S3. Older setups used a DynamoDB table (dynamodb_table), which is now deprecated. If a run crashes and leaves a lock, terraform force-unlock LOCK_ID releases it, but only after you are sure nobody is still running.\n\nThe backend block cannot use variables. For different settings per environment, use partial configuration: terraform init -backend-config=dev.s3.tfbackend.",
        bullets: ["Versioning on, public access blocked, encryption on", "use_lockfile = true needs Terraform 1.10 or newer", "terraform init -migrate-state moves local state into S3"],
      },
      {
        heading: "Separating dev and prod",
        body: "There are two common patterns. Directory per environment: envs/dev and envs/prod each have their own main.tf that calls the shared modules, their own tfvars and their own backend key. It is explicit and easy to understand, and a plan in envs/dev can only touch dev state. Its downside is a little repeated wiring.\n\nCLI workspaces: one folder, and terraform workspace new prod creates a second state in the same backend (in S3 under the env:/ prefix). It is quick, but it is easy to forget which workspace is selected, and both environments share the same backend credentials. HashiCorp recommends workspaces for short-lived copies, not for strong isolation between dev and prod.\n\nFor real isolation, many teams go further and use separate AWS accounts for dev and prod, each with its own state bucket and IAM role. Promote changes the same way as code: apply in dev, then the same commit in prod.",
        visual: {
          type: "compare",
          title: "Two ways to split environments",
          columns: [
            { title: "Directory per environment", points: ["envs/dev and envs/prod folders", "Own backend key and tfvars each", "Clear and hard to mix up", "Some repeated wiring"] },
            { title: "CLI workspaces", points: ["One folder, many states", "terraform workspace select prod", "Fast for temporary copies", "Easy to apply in the wrong one"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "How values flow through a module call",
        steps: [
          { label: "prod.tfvars", detail: "vpc_cidr = 10.20.0.0/16" },
          { label: "Root variables", detail: "var.vpc_cidr in envs/prod" },
          { label: "module vpc call", detail: "cidr = var.vpc_cidr" },
          { label: "Module resources", detail: "aws_vpc.this uses var.cidr" },
          { label: "Module outputs", detail: "module.vpc.vpc_id back to the root" },
        ],
      },
    ],
    examples: [
      {
        title: "Use the registry VPC module for dev",
        explanation: "Step 1: call the module with a pinned version. Step 2: give it a name, CIDR, two zones and subnet ranges. Step 3: use a single NAT gateway in dev to save money (prod can set one per zone). Step 4: run terraform init to download it, then plan; you will see around 20 resources to add. Step 5: other code reads module.vpc.private_subnets for databases and servers.",
        code: {
          lang: "hcl",
          code: `module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 6.0"

  name               = "dev"
  cidr               = "10.10.0.0/16"
  azs                = ["us-east-1a", "us-east-1b"]
  public_subnets     = ["10.10.1.0/24", "10.10.2.0/24"]
  private_subnets    = ["10.10.11.0/24", "10.10.12.0/24"]
  enable_nat_gateway = true
  single_nat_gateway = true
}

output "private_subnet_ids" { value = module.vpc.private_subnets }`,
        },
      },
      {
        title: "Move local state to S3 without recreating anything",
        explanation: "Your team has been running Terraform from one laptop. Step 1: create the state bucket once (by hand or a tiny bootstrap config) with versioning and public access blocked. Step 2: add the backend block with use_lockfile. Step 3: run terraform init -migrate-state; Terraform asks to copy the existing state into S3, answer yes. Step 4: run terraform plan; it must show no changes. Step 5: delete the local terraform.tfstate files so nobody uses them by mistake.",
        code: {
          lang: "bash",
          code: `aws s3api create-bucket --bucket acme-tf-state --region us-east-1
aws s3api put-bucket-versioning --bucket acme-tf-state \\
  --versioning-configuration Status=Enabled
aws s3api put-public-access-block --bucket acme-tf-state \\
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
# add backend "s3" { bucket, key, region, encrypt = true, use_lockfile = true }
terraform init -migrate-state
terraform plan        # expect: No changes.
rm terraform.tfstate terraform.tfstate.backup`,
        },
      },
    ],
    cheatSheet: [
      "Variable precedence, low to high: TF_VAR_, terraform.tfvars, *.auto.tfvars, -var and -var-file",
      "terraform plan -var-file=prod.tfvars loads a non-default tfvars file",
      "Pin modules: version = \"~> 6.0\" for registry, ?ref=v1.2.0 for Git sources",
      "terraform init -upgrade fetches newer module and provider versions within constraints",
      "S3 backend: use_lockfile = true (Terraform 1.10+); dynamodb_table is deprecated",
      "Backend blocks cannot use variables; use -backend-config for per-environment settings",
      "moved { from = aws_vpc.main to = module.vpc.aws_vpc.this } refactors without recreating",
      "terraform force-unlock LOCK_ID only when you are sure no run is active",
    ],
    quiz: [
      {
        q: "A variable is set in terraform.tfvars and also with -var on the command line. Which value is used?",
        options: ["The terraform.tfvars value", "The -var value", "The default in the variable block", "Terraform reports a conflict"],
        answer: 1,
        why: "Command-line -var and -var-file have the highest precedence.",
      },
      {
        q: "You moved aws_vpc.main into a module and plan wants to destroy and recreate the VPC. What fixes this?",
        options: ["terraform destroy first", "Renaming the module", "A moved block from the old address to the new one", "Deleting the state file"],
        answer: 2,
        why: "moved tells Terraform both addresses are the same real object.",
      },
      {
        q: "Why can you not write bucket = var.state_bucket in a backend block?",
        options: ["Backends are configured before variables are evaluated", "S3 bucket names are case sensitive", "Variables are only allowed in modules", "It works, but only with workspaces"],
        answer: 0,
        why: "The backend is set up during init, before Terraform reads variables; use -backend-config instead.",
      },
      {
        q: "What does use_lockfile = true do in the S3 backend?",
        options: ["Encrypts the state with KMS", "Keeps a copy of state on disk", "Pins the provider versions", "Writes a lock object in S3 so two runs cannot apply at once"],
        answer: 3,
        why: "S3 native locking (Terraform 1.10+) replaces the older DynamoDB lock table.",
      },
      {
        q: "Why should the S3 state bucket have versioning enabled?",
        options: ["It makes Terraform faster", "It is required for locking", "So you can restore an older state if one gets corrupted or overwritten", "So the state can be public"],
        answer: 2,
        why: "Versioning keeps previous state files, which is your undo button.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Declare a required variable environment that only accepts dev or prod, and an instance_type variable with default t3.micro.",
        hint: "Use a validation block with contains().",
        solution: `variable "environment" {
  type = string
  validation {
    condition     = contains(["dev", "prod"], var.environment)
    error_message = "environment must be dev or prod."
  }
}
variable "instance_type" {
  type    = string
  default = "t3.micro"
}`,
      },
      {
        level: "medium",
        task: "Turn your VPC code into modules/vpc with inputs name and cidr and outputs vpc_id and public_subnet_id, then call it from envs/dev.",
        hint: "Callers only see outputs; reference them as module.vpc.vpc_id.",
        solution: `# modules/vpc/variables.tf and outputs.tf
variable "name" { type = string }
variable "cidr" { type = string }
output "vpc_id" { value = aws_vpc.this.id }
output "public_subnet_id" { value = aws_subnet.public.id }
# modules/vpc/main.tf: aws_vpc.this (cidr_block = var.cidr) and aws_subnet.public
# envs/dev/main.tf
module "vpc" {
  source = "../../modules/vpc"
  name   = "dev"
  cidr   = "10.10.0.0/16"
}`,
      },
      {
        level: "hard",
        task: "Configure envs/dev and envs/prod to share one backend block but use different state keys, without using variables in the backend.",
        hint: "Partial backend configuration: leave key out of the block and pass a file at init time.",
        solution: `# backend.tf (same in both folders)
terraform {
  backend "s3" {
    bucket       = "acme-tf-state"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
# envs/dev/dev.s3.tfbackend contains:  key = "dev/network.tfstate"
# envs/prod/prod.s3.tfbackend contains: key = "prod/network.tfstate"
terraform init -backend-config=dev.s3.tfbackend`,
      },
    ],
    faq: [
      { q: "Should I use Terraform workspaces for dev and prod?", a: "HashiCorp's own guidance is that CLI workspaces are not a good fit for strong separation such as dev and prod. Separate directories (or separate AWS accounts) with their own state are safer and clearer." },
      { q: "Do I still need a DynamoDB table for Terraform locking?", a: "Not with Terraform 1.10 or newer: set use_lockfile = true and the S3 backend locks with an object in the bucket. The dynamodb_table option still works but is deprecated." },
      { q: "Can I put secrets in tfvars files?", a: "Avoid it. Pass secrets as TF_VAR_ environment variables from your CI secret store or read them from Secrets Manager. Remember that values still end up in state, so protect the state bucket." },
      { q: "What is the difference between a module and a provider?", a: "A provider is a plugin that knows how to talk to an API such as AWS. A module is your own (or a shared) folder of Terraform code that uses providers to build a group of resources." },
    ],
  },

  "iac/ansible": {
    plain: [
      "Ansible is a tool that sets up servers for you. Instead of logging in to ten machines and typing the same commands, you write the steps once in a YAML file and Ansible runs them on all ten over SSH.",
      "Nothing needs to be installed on the servers except SSH and Python, which most Linux systems already have. You install Ansible only on your own machine (the control node) or in your CI.",
      "You describe the result you want, not the commands. For example: nginx should be installed, this config file should look like this, the service should be running. If a server is already in that state, Ansible leaves it alone and reports ok instead of changed.",
      "That property is called idempotency: running the same playbook again is safe and changes nothing. It means you can run Ansible every day to fix any server that drifted, and you can trust it on new and old machines alike.",
    ],
    deepDive: [
      {
        heading: "Inventory, SSH access and ad-hoc commands",
        body: "The inventory lists your hosts. In INI format, a [web] section lists web servers, and each line can set connection variables like ansible_host=10.0.1.10 and ansible_user=ubuntu. Groups can contain groups with [prod:children]. Shared settings go in group_vars/web.yml and host_vars/web1.yml next to the inventory. ansible-inventory -i inventory.ini --graph shows how Ansible understands it.\n\nAnsible uses your normal SSH setup: keys, ~/.ssh/config and the SSH agent. Test connectivity with ansible all -i inventory.ini -m ping, which logs in and checks that Python works (it is not an ICMP ping).\n\nAd-hoc commands run one module without a playbook, useful for quick checks: ansible web -a \"uptime\" runs a command, and ansible web -m ansible.builtin.apt -a \"name=htop state=present\" --become installs a package with sudo. By default Ansible works on 5 hosts in parallel (forks = 5), which you can raise with -f or in ansible.cfg.",
        bullets: ["ansible all -m ping tests SSH and Python", "--become runs tasks with sudo", "ansible-inventory --graph shows groups and hosts"],
      },
      {
        heading: "How a playbook runs",
        body: "A playbook is a list of plays; each play targets hosts and lists tasks. Ansible first gathers facts (OS, IPs, memory) from each host unless gather_facts: false. Then it runs each task on all targeted hosts before moving to the next task. For each task, it copies a small Python module to the host, runs it, and gets back JSON saying ok, changed, failed or skipped.\n\nHandlers are special tasks. A task with notify: Reload nginx queues the handler only if that task reported changed. Queued handlers run once at the end of the play, even if notified ten times. If a later task needs the restart to have happened, add meta: flush_handlers.\n\nAt the end, the PLAY RECAP lists counts per host: ok, changed, unreachable, failed, skipped, rescued and ignored. Before touching production, use --check (dry run) with --diff to see which files would change, and --limit web1 to try one host first.",
        visual: {
          type: "sequence",
          title: "One task with a handler, on one host",
          actors: ["Control node", "Web server"],
          messages: [
            { from: 0, to: 1, label: "SSH: gather facts" },
            { from: 0, to: 1, label: "Run template module for site.conf" },
            { from: 1, to: 0, label: "JSON: changed, so queue Reload nginx" },
            { from: 0, to: 1, label: "End of play: run service reload" },
            { from: 1, to: 0, label: "JSON: changed" },
          ],
        },
      },
      {
        heading: "Variables and Jinja2 templates",
        body: "Variables can be defined in many places: role defaults, inventory group_vars and host_vars, the play's vars, registered results, and extra vars on the command line with -e. There are over 20 precedence levels; remember the two ends. Role defaults (defaults/main.yml) are the lowest, meant to be overridden. Extra vars (-e) are the highest and always win.\n\nTemplates are files with Jinja2 placeholders, such as server_name {{ server_name }}; inside a .j2 file. The template module renders them on the control node and copies the result, reporting changed only when the content differs. Jinja2 also gives filters, for example {{ port | default(8000) }}, and loops, like {% for host in groups['app'] %} to list backend servers in an nginx upstream.\n\nIn YAML, a value that starts with {{ must be quoted: \"{{ app_dir }}/config\". Facts are variables too, such as ansible_facts['distribution']. For secrets, use Ansible Vault: ansible-vault encrypt_string creates an encrypted value you can commit, decrypted at run time with --ask-vault-pass.",
        bullets: ["Role defaults lowest, -e extra vars highest", "Quote YAML values that start with {{", "ansible-vault encrypt_string for secrets in Git"],
      },
      {
        heading: "Roles and real idempotency",
        body: "A role is a standard folder layout that bundles everything for one job, like nginx or app. ansible-galaxy role init roles/nginx creates tasks/, handlers/, templates/, files/, vars/, defaults/ and meta/, each with a main.yml where needed. A playbook then just lists roles: [common, nginx, app]. Ansible Galaxy shares roles and collections; collections such as community.general and amazon.aws add modules, and you install them with ansible-galaxy collection install.\n\nIdempotency comes from modules that check before acting. apt, copy, template, user, file and service all compare current with desired state. command and shell do not: they run every time and always report changed. If you must use them, add creates: /path so the task is skipped when the file exists, or changed_when to describe what counts as a change.\n\nThe test is simple: run the playbook twice. The second run must show changed=0 on every host. Molecule automates this check for roles in CI.",
        visual: {
          type: "compare",
          title: "Idempotent vs not",
          columns: [
            { title: "Module-based task", points: ["apt: name=nginx state=present", "Checks first, acts only if needed", "Second run: ok", "Works with --check"] },
            { title: "Raw shell task", points: ["shell: apt-get install -y nginx", "Runs every time", "Second run: changed", "Needs creates or changed_when"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "How Ansible content is organised",
        layers: [
          { label: "Playbook site.yml", detail: "Which roles run on which host groups" },
          { label: "Play", detail: "hosts: web, become: true" },
          { label: "Roles", detail: "common, nginx, app" },
          { label: "Tasks and handlers", detail: "Ordered steps inside each role" },
          { label: "Modules", detail: "apt, template, service do the work on the host" },
        ],
      },
    ],
    examples: [
      {
        title: "Deploy the FastAPI app as a systemd service",
        explanation: "Step 1: create a dedicated system user. Step 2: copy the code and install requirements into a virtualenv with the pip module, which is idempotent. Step 3: render a systemd unit from a template; if it changes, notify a handler. Step 4: make sure the service is enabled and started. Step 5: the handler restarts the app only when something changed. Run with ansible-playbook -i inventory.ini app.yml, then run it again and expect changed=0.",
        code: {
          lang: "yaml",
          code: `- hosts: app
  become: true
  tasks:
    - ansible.builtin.user: { name: api, system: true }
    - ansible.builtin.copy: { src: app/, dest: /opt/api/, owner: api }
      notify: Restart api
    - ansible.builtin.pip: { requirements: /opt/api/requirements.txt, virtualenv: /opt/api/.venv, virtualenv_command: python3 -m venv }
    - ansible.builtin.template: { src: api.service.j2, dest: /etc/systemd/system/api.service }
      notify: Restart api
    - ansible.builtin.systemd_service: { name: api, enabled: true, state: started, daemon_reload: true }
  handlers:
    - name: Restart api
      ansible.builtin.systemd_service: { name: api, state: restarted, daemon_reload: true }`,
        },
      },
      {
        title: "Turn a shell task into an idempotent one",
        explanation: "Your playbook downloads a binary with shell: curl ... and the recap always says changed. Step 1: notice that the second run is not clean. Step 2: replace curl with the get_url module, which skips the download when the file already exists with the right checksum. Step 3: for a command you cannot replace, add creates so it runs only once. Step 4: run twice and confirm changed=0.",
        code: {
          lang: "yaml",
          code: `# Before: always changed
- ansible.builtin.shell: curl -L -o /usr/local/bin/tool https://example.com/tool && chmod +x /usr/local/bin/tool

# After: idempotent
- ansible.builtin.get_url:
    url: https://example.com/tool
    dest: /usr/local/bin/tool
    mode: "0755"
- ansible.builtin.command: /usr/local/bin/tool init
  args:
    creates: /etc/tool/initialized`,
        },
      },
    ],
    cheatSheet: [
      "ansible all -i inventory.ini -m ping checks SSH login and Python on every host",
      "ansible-playbook site.yml --check --diff shows what would change without changing it",
      "--limit web1 runs on one host; -f 20 raises parallel hosts from the default 5",
      "Handlers run once at the end of the play, only if a notifying task changed",
      "command and shell always report changed; add creates or changed_when",
      "ansible-galaxy role init roles/nginx creates the standard role layout",
      "Role defaults have the lowest precedence; -e extra vars have the highest",
      "ansible-vault encrypt_string 'secret' --name db_password gives a value safe to commit",
    ],
    quiz: [
      {
        q: "What does ansible all -m ping actually test?",
        options: ["ICMP reachability", "That SSH login works and Python runs on the host", "That port 80 is open", "That the inventory file is valid YAML"],
        answer: 1,
        why: "The ping module logs in over SSH and runs a tiny Python module.",
      },
      {
        q: "Three tasks notify the same handler and all report changed. How many times does the handler run?",
        options: ["Three times, right after each task", "Never, handlers need flush_handlers", "Twice", "Once, at the end of the play"],
        answer: 3,
        why: "Handlers are queued and run once at the end of the play.",
      },
      {
        q: "Which variable source has the highest precedence?",
        options: ["Extra vars passed with -e", "Role defaults", "group_vars/all", "Facts"],
        answer: 0,
        why: "Extra vars always win; role defaults are the lowest.",
      },
      {
        q: "Why does a task using shell show changed on every run?",
        options: ["The host has no Python", "Handlers were not defined", "Ansible cannot know whether the command changed anything", "SSH reconnects each time"],
        answer: 2,
        why: "shell and command do not check state, so they assume a change unless told otherwise.",
      },
      {
        q: "What must a second run of a correct playbook report?",
        options: ["failed=0 only", "changed=0", "skipped=0", "ok=0"],
        answer: 1,
        why: "No changes on the second run shows the playbook is idempotent.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write an inventory with two web servers and one database, all logging in as ubuntu, then check you can reach them and see their uptime.",
        hint: "Group sections in INI, [all:vars] for shared settings, then ping and an ad-hoc command.",
        solution: `# inventory.ini
[web]
web1 ansible_host=10.0.1.10
web2 ansible_host=10.0.1.11
[db]
db1 ansible_host=10.0.2.10
[all:vars]
ansible_user=ubuntu

ansible all -i inventory.ini -m ping
ansible all -i inventory.ini -a "uptime"`,
      },
      {
        level: "medium",
        task: "Write a template for an nginx upstream that lists every host in the app group on port app_port (default 8000), and a task that installs it and reloads nginx only when it changes.",
        hint: "Loop over groups['app'] in Jinja2 and use the default filter; notify a handler.",
        solution: `# templates/upstream.conf.j2
upstream api {
{% for h in groups['app'] %}
  server {{ hostvars[h]['ansible_host'] }}:{{ app_port | default(8000) }};
{% endfor %}
}
# task
- ansible.builtin.template: { src: upstream.conf.j2, dest: /etc/nginx/conf.d/upstream.conf }
  notify: Reload nginx`,
      },
      {
        level: "hard",
        task: "Convert a single nginx playbook into a role with defaults, a template and a handler, use it from site.yml, and prove idempotency.",
        hint: "ansible-galaxy role init creates the folders. Move vars to defaults/main.yml, tasks to tasks/main.yml, the handler to handlers/main.yml.",
        solution: `ansible-galaxy role init roles/nginx
# roles/nginx/defaults/main.yml:  server_name: example.com
# roles/nginx/tasks/main.yml:     apt + template tasks, notify: Reload nginx
# roles/nginx/handlers/main.yml:  - name: Reload nginx
#                                   ansible.builtin.service: { name: nginx, state: reloaded }
# roles/nginx/templates/site.conf.j2
# site.yml:
#   - hosts: web
#     become: true
#     roles: [nginx]
ansible-playbook -i inventory.ini site.yml   # first run: changed > 0
ansible-playbook -i inventory.ini site.yml   # second run: changed=0`,
      },
    ],
    faq: [
      { q: "Does Ansible need an agent on the servers?", a: "No. It connects over SSH and needs Python on the managed Linux hosts. Windows hosts are managed over WinRM or SSH with PowerShell modules instead." },
      { q: "Can I run Ansible from Windows?", a: "Not natively: the control node must be Linux, macOS or another Unix-like system. On Windows, run Ansible inside WSL." },
      { q: "Ansible or Terraform?", a: "Use Terraform to create cloud resources and keep track of them in state. Use Ansible to configure the operating system and apps on servers. They work well together." },
      { q: "What is the difference between a role and a collection?", a: "A role bundles tasks, handlers, templates and defaults for one job. A collection is a larger package that can contain roles, modules and plugins, such as amazon.aws, installed with ansible-galaxy collection install." },
    ],
  },
};

export default extra;

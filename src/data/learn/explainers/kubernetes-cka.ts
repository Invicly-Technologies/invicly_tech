import type { ExplainerMap } from "./types";

const explainers: ExplainerMap = {
  // ───────────── Prerequisites & exam setup ─────────────
  "cka-prereqs/exam-format": {
    summary:
      "The CKA is a 2-hour, hands-on exam where you solve tasks on live Kubernetes clusters from a command line. Troubleshooting carries the most weight, and you may use the official Kubernetes documentation during the exam. Knowing the domains and the environment rules removes surprises on exam day.",
    analogy: "It is a driving test, not a written quiz: you prove skill at the wheel.",
    visuals: [
      {
        type: "tree",
        title: "CKA curriculum domains",
        root: "CKA exam",
        children: [
          { label: "Troubleshooting 30%", children: ["Pods and apps", "Nodes and kubelet", "Control plane", "Networking"] },
          { label: "Cluster architecture 25%", children: ["kubeadm install and upgrade", "RBAC", "Helm, Kustomize, CRDs"] },
          { label: "Services and networking 20%", children: ["Services and DNS", "Ingress and Gateway API", "NetworkPolicies"] },
          { label: "Workloads and scheduling 15%", children: ["Deployments", "ConfigMaps and Secrets", "Scheduling and autoscaling"] },
          { label: "Storage 10%", children: ["PV and PVC", "StorageClasses"] },
        ],
      },
      {
        type: "flow",
        title: "Routine for every task",
        steps: [
          { label: "Read the task", detail: "Note namespace, names and exact requirements." },
          { label: "Switch context", detail: "Run the kubectl config use-context command given." },
          { label: "Solve", detail: "Imperative command or generated YAML, then apply." },
          { label: "Verify", detail: "get, describe or auth can-i to confirm." },
        ],
      },
    ],
    keyPoints: [
      "Troubleshooting is 30 percent, the single largest domain.",
      "You may open kubernetes.io docs and a few other listed sites in the exam browser.",
      "Each task names a cluster context; working in the wrong one scores zero.",
      "Tasks carry different weights, so skip long low-value tasks and return later.",
    ],
    terms: [
      { term: "Performance-based exam", meaning: "You complete real tasks instead of answering multiple choice." },
      { term: "Context", meaning: "kubeconfig entry selecting cluster, user and namespace." },
      { term: "Curriculum", meaning: "Official CNCF list of domains and competencies." },
      { term: "Simulator", meaning: "Practice environment such as killer.sh included with registration." },
    ],
    pitfalls: [
      "Forgetting to switch context at the start of a task.",
      "Spending 20 minutes on one task worth a few percent.",
    ],
    check: [
      { q: "Which CKA domain has the highest weight?", a: "Troubleshooting, at 30 percent." },
      { q: "What is the first command to run for each task?", a: "The kubectl config use-context command shown in the task, so you work on the right cluster." },
    ],
  },

  "cka-prereqs/linux-containers": {
    summary:
      "Kubernetes nodes are Linux machines where systemd runs the kubelet and the container runtime. The kubelet talks to runtimes like containerd through the Container Runtime Interface. On the exam you use systemctl, journalctl and crictl to fix nodes when kubectl cannot help.",
    visuals: [
      {
        type: "layers",
        title: "Node runtime stack",
        layers: [
          { label: "kubelet", detail: "Node agent run by systemd; asks the runtime for containers." },
          { label: "CRI (gRPC)", detail: "Standard API between kubelet and container runtimes." },
          { label: "containerd", detail: "High-level runtime: pulls images, manages containers." },
          { label: "runc", detail: "Low-level OCI runtime that creates the process." },
          { label: "Linux kernel", detail: "Namespaces isolate, cgroups limit CPU and memory." },
        ],
      },
    ],
    keyPoints: [
      "kubelet and containerd are systemd services; check them with systemctl status.",
      "journalctl -u kubelet shows why the kubelet fails to start.",
      "crictl talks to the CRI runtime and works even when the API server is down.",
      "Docker Engine support via dockershim was removed in Kubernetes 1.24.",
    ],
    terms: [
      { term: "systemd", meaning: "Linux init system that starts and supervises services." },
      { term: "journalctl", meaning: "Reads logs collected by systemd." },
      { term: "CRI", meaning: "Container Runtime Interface used by the kubelet." },
      { term: "containerd", meaning: "Common CRI container runtime." },
      { term: "crictl", meaning: "CLI for inspecting CRI pods, containers and images." },
      { term: "cgroups", meaning: "Kernel feature that limits process resources." },
    ],
    example: {
      lang: "bash",
      code: "systemctl status kubelet\nsudo systemctl restart containerd\nsudo journalctl -u kubelet --since \"10 min ago\" | tail -20\n\n# Inspect containers through the CRI\nsudo crictl ps -a\nsudo crictl pods\nsudo crictl logs <container-id>\nsudo crictl images",
    },
    pitfalls: [
      "Editing a unit file and forgetting systemctl daemon-reload.",
      "Using docker commands on a node that runs only containerd.",
    ],
    check: [
      { q: "kubectl hangs because the API server is down. How do you see control plane containers?", a: "SSH to the control plane node and run crictl ps -a, then crictl logs on the failing container." },
      { q: "Which command shows recent kubelet errors?", a: "journalctl -u kubelet, optionally with -f or --since." },
    ],
  },

  "cka-prereqs/kubectl-speed": {
    summary:
      "Speed with kubectl is the biggest time saver on the CKA. Imperative commands create simple objects instantly, and --dry-run=client -o yaml generates a manifest you can edit for anything more complex. kubectl explain shows field names without leaving the terminal.",
    visuals: [
      {
        type: "flow",
        title: "Generate, edit, apply",
        steps: [
          { label: "Generate YAML", detail: "kubectl create or run with --dry-run=client -o yaml." },
          { label: "Save to file", detail: "Redirect output to a file like pod.yaml." },
          { label: "Edit in vim", detail: "Add fields; check names with kubectl explain." },
          { label: "Apply", detail: "kubectl apply -f pod.yaml." },
          { label: "Verify", detail: "kubectl get, describe or logs." },
        ],
      },
    ],
    keyPoints: [
      "kubectl run creates Pods; kubectl create deployment creates Deployments.",
      "kubectl expose creates a Service from an existing Pod or Deployment.",
      "kubectl explain pod.spec.containers --recursive lists every nested field.",
      "Set vim to two-space indentation with expandtab to avoid YAML tab errors.",
    ],
    terms: [
      { term: "Imperative command", meaning: "Tells kubectl what to create directly, without a file." },
      { term: "--dry-run=client", meaning: "Builds the object locally without sending it." },
      { term: "-o yaml", meaning: "Prints the object as YAML." },
      { term: "kubectl explain", meaning: "Shows documentation for resource fields." },
      { term: "kubectl edit", meaning: "Edits a live object in your editor." },
    ],
    example: {
      lang: "bash",
      code: "alias k=kubectl\nexport do=\"--dry-run=client -o yaml\"\n\nk run web --image=nginx:1.27 --port=80 $do > pod.yaml\nk create deployment api --image=httpd --replicas=3 $do > deploy.yaml\nk expose deployment api --port=80 --target-port=8080\nk create configmap app --from-literal=MODE=prod\nk create job once --image=busybox -- echo hi\nk explain deployment.spec.strategy",
    },
    pitfalls: [
      "Writing YAML from scratch when a generated skeleton takes seconds.",
      "Mixing tabs into YAML, which kubectl rejects.",
    ],
    check: [
      { q: "How do you get a Deployment manifest without creating it?", a: "kubectl create deployment NAME --image=IMAGE --dry-run=client -o yaml > file.yaml." },
      { q: "How do you find the field name for a Pod's security context?", a: "Run kubectl explain pod.spec.securityContext, or add --recursive for all fields." },
    ],
  },

  "cka-prereqs/lab-cluster": {
    summary:
      "You need two kinds of practice clusters. kind runs Kubernetes nodes as containers, so you can create and destroy multi-node clusters in a minute. A kubeadm cluster on VMs gives real nodes with systemd, kubelet and static Pods, which the exam's install and troubleshooting tasks require.",
    visuals: [
      {
        type: "compare",
        title: "kind vs kubeadm on VMs",
        columns: [
          { title: "kind", points: ["Nodes are Docker containers", "Cluster in about a minute", "Great for workloads and networking", "Not realistic for node repair"] },
          { title: "kubeadm on VMs", points: ["Real Linux nodes", "Practice install and upgrade", "etcd backup and kubelet fixes", "Slower to build, snapshot VMs"] },
        ],
      },
    ],
    keyPoints: [
      "Use kind for fast drills on Deployments, Services and NetworkPolicies.",
      "Use kubeadm VMs for install, upgrade, etcd and node troubleshooting.",
      "Snapshot VMs after a clean install so you can reset quickly.",
      "kubeadm reset tears down a node so you can practice init again.",
    ],
    terms: [
      { term: "kind", meaning: "Kubernetes IN Docker: runs nodes as containers." },
      { term: "kubeadm", meaning: "Official tool to bootstrap clusters." },
      { term: "VM snapshot", meaning: "Saved machine state you can roll back to." },
      { term: "kubeadm reset", meaning: "Reverts changes made by kubeadm init or join." },
    ],
    example: {
      lang: "yaml",
      code: "# kind.yaml\nkind: Cluster\napiVersion: kind.x-k8s.io/v1alpha4\nnodes:\n  - role: control-plane\n  - role: worker\n  - role: worker\n# kind create cluster --name cka --config kind.yaml\n# kind delete cluster --name cka",
      caption: "Three-node kind cluster config.",
    },
    pitfalls: [
      "Practicing only on kind and never touching systemd or static Pod manifests.",
      "Using default kind networking to test NetworkPolicies; install Calico or Cilium.",
    ],
    check: [
      { q: "Why practice on kubeadm VMs as well as kind?", a: "Exam tasks like upgrades, etcd restore and kubelet fixes need real nodes with systemd." },
      { q: "How do you rebuild a kind cluster quickly?", a: "kind delete cluster, then kind create cluster with the same config file." },
    ],
  },

  // ───────────── Cluster architecture ─────────────
  "cka-architecture/components": {
    summary:
      "The control plane stores and decides cluster state, and worker nodes run Pods. The API server is the only component that talks to etcd, and every other component watches the API server. In kubeadm clusters the control plane runs as static Pods defined in /etc/kubernetes/manifests.",
    visuals: [
      {
        type: "layers",
        title: "Control plane and nodes",
        layers: [
          { label: "kube-apiserver", detail: "Front door: authenticates, validates and stores objects." },
          { label: "etcd", detail: "Key-value store holding all cluster state." },
          { label: "Scheduler and controllers", detail: "Assign Pods to nodes; reconcile desired state." },
          { label: "kubelet", detail: "Node agent that runs Pods via the container runtime." },
          { label: "kube-proxy and CNI", detail: "Service routing rules and Pod networking." },
        ],
      },
      {
        type: "sequence",
        title: "Creating a Deployment",
        actors: ["kubectl", "API server", "Controllers and scheduler", "kubelet"],
        messages: [
          { from: 0, to: 1, label: "POST Deployment" },
          { from: 1, to: 1, label: "Persist to etcd" },
          { from: 2, to: 1, label: "Controller creates ReplicaSet, Pods" },
          { from: 2, to: 1, label: "Scheduler binds Pod to node" },
          { from: 3, to: 1, label: "Watch sees Pod for its node" },
          { from: 3, to: 3, label: "Start containers via CRI" },
          { from: 3, to: 1, label: "Report Pod status" },
        ],
      },
    ],
    keyPoints: [
      "Only the API server reads and writes etcd.",
      "The scheduler only picks a node; the kubelet actually starts containers.",
      "kube-controller-manager runs many controllers, such as Deployment and Node controllers.",
      "Static Pod manifests live in /etc/kubernetes/manifests on control plane nodes.",
      "The kubelet runs as a systemd service, not as a Pod.",
    ],
    terms: [
      { term: "kube-apiserver", meaning: "REST API front end for all cluster operations." },
      { term: "etcd", meaning: "Consistent distributed key-value store for cluster data." },
      { term: "kube-scheduler", meaning: "Assigns unscheduled Pods to suitable nodes." },
      { term: "kube-controller-manager", meaning: "Runs controllers that reconcile state." },
      { term: "kubelet", meaning: "Agent on each node that runs and reports Pods." },
      { term: "kube-proxy", meaning: "Programs node rules for Service traffic." },
    ],
    example: {
      lang: "bash",
      code: "kubectl get pods -n kube-system -o wide\nls /etc/kubernetes/manifests\n# etcd.yaml  kube-apiserver.yaml\n# kube-controller-manager.yaml  kube-scheduler.yaml\ngrep staticPodPath /var/lib/kubelet/config.yaml\nsystemctl status kubelet",
    },
    pitfalls: [
      "Looking for the kubelet in kube-system Pods; it is a systemd service.",
      "Deleting a static mirror Pod with kubectl and expecting it to stay gone.",
    ],
    check: [
      { q: "Which component decides which node a new Pod runs on?", a: "kube-scheduler, which writes the node name into the Pod's binding." },
      { q: "Where are control plane manifests on a kubeadm node?", a: "In /etc/kubernetes/manifests, the kubelet's staticPodPath." },
    ],
  },

  "cka-architecture/kubeadm-install": {
    summary:
      "kubeadm bootstraps a cluster: init sets up the control plane and join adds nodes. Before that, every node needs a container runtime, kernel networking settings, and matching kubeadm, kubelet and kubectl packages. Pods stay Pending and nodes NotReady until you install a CNI plugin.",
    visuals: [
      {
        type: "flow",
        title: "Building a kubeadm cluster",
        steps: [
          { label: "Prepare nodes", detail: "Disable swap, load br_netfilter, enable IP forwarding." },
          { label: "Install runtime", detail: "containerd with SystemdCgroup = true." },
          { label: "Install packages", detail: "kubeadm, kubelet, kubectl from pkgs.k8s.io; hold versions." },
          { label: "kubeadm init", detail: "Creates certs, static Pods and admin kubeconfig." },
          { label: "Install CNI", detail: "Apply Calico, Cilium or Flannel manifests." },
          { label: "kubeadm join", detail: "Run the join command on each worker." },
        ],
      },
    ],
    keyPoints: [
      "Set --pod-network-cidr to match what your CNI plugin expects.",
      "Copy /etc/kubernetes/admin.conf to ~/.kube/config to use kubectl.",
      "kubeadm token create --print-join-command regenerates an expired join command.",
      "The kubelet and runtime must use the same cgroup driver, normally systemd.",
    ],
    terms: [
      { term: "kubeadm init", meaning: "Bootstraps the first control plane node." },
      { term: "kubeadm join", meaning: "Adds a worker or control plane node." },
      { term: "Bootstrap token", meaning: "Short-lived token used by joining nodes." },
      { term: "CNI plugin", meaning: "Network plugin that gives Pods IPs and connectivity." },
      { term: "cgroup driver", meaning: "How kubelet and runtime manage cgroups." },
    ],
    example: {
      lang: "bash",
      code: "# Control plane\nsudo kubeadm init --pod-network-cidr=192.168.0.0/16\nmkdir -p ~/.kube\nsudo cp /etc/kubernetes/admin.conf ~/.kube/config\nsudo chown $(id -u):$(id -g) ~/.kube/config\nkubectl apply -f calico.yaml\nkubeadm token create --print-join-command\n\n# Each worker\nsudo kubeadm join 10.0.0.10:6443 --token abc.123 \\\n  --discovery-token-ca-cert-hash sha256:<hash>",
    },
    pitfalls: [
      "Forgetting the CNI, leaving nodes NotReady and CoreDNS Pending.",
      "Mismatched cgroup drivers, making the kubelet crash loop.",
    ],
    check: [
      { q: "After kubeadm init, nodes are NotReady. What is the usual cause?", a: "No CNI plugin is installed yet; apply one and the nodes become Ready." },
      { q: "The join token expired. How do you add a worker?", a: "Run kubeadm token create --print-join-command on the control plane and use the output." },
    ],
  },

  "cka-architecture/upgrade": {
    summary:
      "kubeadm clusters upgrade one minor version at a time, control plane first, then workers. On each node you upgrade kubeadm, apply the upgrade, then drain, upgrade kubelet and kubectl, restart kubelet and uncordon. The official docs page lists every command and is allowed in the exam.",
    visuals: [
      {
        type: "flow",
        title: "Upgrade order",
        steps: [
          { label: "Upgrade kubeadm", detail: "Point repo at new minor; install exact version." },
          { label: "kubeadm upgrade plan", detail: "Shows target versions and checks the cluster." },
          { label: "kubeadm upgrade apply", detail: "First control plane node upgrades its components." },
          { label: "Drain and upgrade kubelet", detail: "Install kubelet and kubectl, restart kubelet." },
          { label: "Uncordon", detail: "Node accepts Pods again." },
          { label: "Workers: upgrade node", detail: "kubeadm upgrade node, then drain, kubelet, uncordon." },
        ],
      },
    ],
    keyPoints: [
      "You cannot skip minor versions; go 1.33 to 1.34, not 1.33 to 1.35.",
      "Use kubeadm upgrade apply on the first control plane node only.",
      "Other control plane nodes and workers use kubeadm upgrade node.",
      "Drain with --ignore-daemonsets so DaemonSet Pods do not block eviction.",
      "Run systemctl daemon-reload then restart kubelet after upgrading it.",
    ],
    terms: [
      { term: "Minor version", meaning: "Middle number in 1.34.2; upgrades step one at a time." },
      { term: "kubectl drain", meaning: "Cordons a node and evicts its Pods." },
      { term: "kubectl cordon", meaning: "Marks a node unschedulable." },
      { term: "kubectl uncordon", meaning: "Makes a node schedulable again." },
      { term: "Version skew", meaning: "Allowed version gaps between components." },
    ],
    example: {
      lang: "bash",
      code: "# On the control plane (Debian/Ubuntu)\nsudo apt-mark unhold kubeadm\nsudo apt-get update && sudo apt-get install -y kubeadm='1.34.2-*'\nsudo apt-mark hold kubeadm\nsudo kubeadm upgrade plan\nsudo kubeadm upgrade apply v1.34.2\nkubectl drain cp1 --ignore-daemonsets\nsudo apt-mark unhold kubelet kubectl\nsudo apt-get install -y kubelet='1.34.2-*' kubectl='1.34.2-*'\nsudo apt-mark hold kubelet kubectl\nsudo systemctl daemon-reload && sudo systemctl restart kubelet\nkubectl uncordon cp1",
      caption: "Update the pkgs.k8s.io repo to the new minor first.",
    },
    pitfalls: [
      "Forgetting to switch the pkgs.k8s.io repo to the new minor version.",
      "Running drain or uncordon from the worker, which has no admin kubeconfig.",
    ],
    check: [
      { q: "Which command upgrades the first control plane node?", a: "kubeadm upgrade apply vX.Y.Z, after upgrading the kubeadm package." },
      { q: "What do you run on a worker before upgrading its kubelet?", a: "kubeadm upgrade node on the worker, and kubectl drain from the control plane." },
    ],
  },

  "cka-architecture/etcd-backup": {
    summary:
      "etcd holds all cluster state, so a snapshot is a full cluster backup. You save a snapshot with etcdctl using the etcd certificates, and restore it into a new data directory. Then you point the etcd static Pod at that directory and the cluster returns to the snapshot state.",
    visuals: [
      {
        type: "flow",
        title: "Backup and restore etcd",
        steps: [
          { label: "Find certs and endpoint", detail: "Read flags in /etc/kubernetes/manifests/etcd.yaml." },
          { label: "Snapshot save", detail: "etcdctl with cacert, cert, key and endpoint." },
          { label: "Verify snapshot", detail: "etcdutl snapshot status shows hash and keys." },
          { label: "Restore to new dir", detail: "etcdutl snapshot restore --data-dir /var/lib/etcd-new." },
          { label: "Update etcd manifest", detail: "Point the hostPath volume at the new directory." },
          { label: "Wait and verify", detail: "etcd and API server restart; kubectl get works." },
        ],
      },
    ],
    keyPoints: [
      "etcdctl needs --endpoints, --cacert, --cert and --key for TLS.",
      "Copy cert paths from the etcd manifest instead of guessing.",
      "Restore always writes a fresh data directory; never overwrite the live one.",
      "etcdutl handles offline restore; etcdctl snapshot restore is deprecated.",
      "The kubelet recreates etcd automatically when its manifest changes.",
    ],
    terms: [
      { term: "Snapshot", meaning: "Point-in-time copy of the etcd keyspace." },
      { term: "etcdctl", meaning: "Client for talking to a running etcd." },
      { term: "etcdutl", meaning: "Offline utility for snapshot status and restore." },
      { term: "--data-dir", meaning: "Directory where etcd stores its data." },
      { term: "hostPath", meaning: "Volume that mounts a node directory into the Pod." },
    ],
    example: {
      lang: "bash",
      code: "export ETCDCTL_API=3\nsudo etcdctl --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key \\\n  snapshot save /opt/etcd-backup.db\n\nsudo etcdutl snapshot status /opt/etcd-backup.db -w table\nsudo etcdutl snapshot restore /opt/etcd-backup.db \\\n  --data-dir /var/lib/etcd-restore\n# Edit etcd.yaml: hostPath path -> /var/lib/etcd-restore",
    },
    pitfalls: [
      "Restoring over /var/lib/etcd while etcd is running.",
      "Changing only --data-dir but not the hostPath volume, or vice versa.",
    ],
    check: [
      { q: "Where do you find etcd's certificate paths on a kubeadm node?", a: "In the command flags of /etc/kubernetes/manifests/etcd.yaml, usually under /etc/kubernetes/pki/etcd." },
      { q: "After restoring to /var/lib/etcd-restore, what must change?", a: "The etcd static Pod's hostPath volume for etcd data must point to /var/lib/etcd-restore." },
    ],
  },

  "cka-architecture/rbac": {
    summary:
      "RBAC grants permissions by binding roles to subjects. A Role or ClusterRole lists allowed verbs on resources, and a RoleBinding or ClusterRoleBinding attaches it to users, groups or service accounts. Permissions are purely additive, and kubectl auth can-i verifies the result.",
    visuals: [
      {
        type: "tree",
        title: "RBAC building blocks",
        root: "RBAC",
        children: [
          { label: "Role", children: ["Namespaced rules", "verbs on resources"] },
          { label: "ClusterRole", children: ["Cluster-wide or reusable", "Nodes, PVs, all namespaces"] },
          { label: "RoleBinding", children: ["Grants in one namespace", "Can reference a ClusterRole"] },
          { label: "ClusterRoleBinding", children: ["Grants across the cluster"] },
          { label: "Subjects", children: ["User", "Group", "ServiceAccount"] },
        ],
      },
    ],
    keyPoints: [
      "RBAC has no deny rules; anything not allowed is forbidden.",
      "A RoleBinding to a ClusterRole limits that ClusterRole to one namespace.",
      "Cluster-scoped resources like nodes need a ClusterRole and ClusterRoleBinding.",
      "Test as another identity with kubectl auth can-i --as.",
      "Service account subjects use the form system:serviceaccount:NAMESPACE:NAME.",
    ],
    terms: [
      { term: "Verb", meaning: "Action such as get, list, watch, create, delete." },
      { term: "Subject", meaning: "User, group or service account receiving permissions." },
      { term: "ServiceAccount", meaning: "Namespaced identity for Pods." },
      { term: "kubectl auth can-i", meaning: "Checks whether an action is allowed." },
      { term: "kubeconfig", meaning: "File with clusters, users and contexts for kubectl." },
    ],
    example: {
      lang: "bash",
      code: "kubectl create namespace dev\nkubectl create serviceaccount app -n dev\nkubectl create role pod-reader -n dev \\\n  --verb=get,list,watch --resource=pods\nkubectl create rolebinding app-reads-pods -n dev \\\n  --role=pod-reader --serviceaccount=dev:app\n\nkubectl auth can-i list pods -n dev \\\n  --as=system:serviceaccount:dev:app   # yes\nkubectl auth can-i delete pods -n dev \\\n  --as=system:serviceaccount:dev:app   # no",
    },
    pitfalls: [
      "Using a ClusterRoleBinding when access should be limited to one namespace.",
      "Writing --serviceaccount=app without the namespace prefix.",
    ],
    check: [
      { q: "A user needs to list nodes. Is a Role enough?", a: "No. Nodes are cluster-scoped, so use a ClusterRole with a ClusterRoleBinding." },
      { q: "How do you verify a service account can create Deployments in prod?", a: "kubectl auth can-i create deployments -n prod --as=system:serviceaccount:prod:NAME." },
    ],
  },

  "cka-architecture/ha-control-plane": {
    summary:
      "A highly available control plane runs several API servers behind a load balancer and an etcd cluster with an odd number of members. etcd can be stacked on the control plane nodes or run on separate hosts. etcd needs a majority, or quorum, to accept writes.",
    visuals: [
      {
        type: "compare",
        title: "Stacked vs external etcd",
        columns: [
          { title: "Stacked etcd", points: ["etcd on each control plane node", "Fewer machines to run", "kubeadm default for HA", "Losing a node loses etcd and API"] },
          { title: "External etcd", points: ["etcd on dedicated hosts", "Failures are decoupled", "More hosts to manage", "Better isolation for large clusters"] },
        ],
      },
      {
        type: "layers",
        title: "HA control plane",
        layers: [
          { label: "Clients and kubelets", detail: "Use the shared control plane endpoint." },
          { label: "Load balancer", detail: "Spreads TCP 6443 across API servers." },
          { label: "API servers x3", detail: "Stateless; any can serve any request." },
          { label: "Scheduler and controllers", detail: "One active leader each, chosen by leader election." },
          { label: "etcd cluster x3", detail: "Raft consensus; tolerates one member failure." },
        ],
      },
    ],
    keyPoints: [
      "Quorum is a majority: 3 members tolerate 1 failure, 5 tolerate 2.",
      "Even member counts add cost without adding failure tolerance.",
      "kubeadm init --control-plane-endpoint sets the shared load balancer address.",
      "Scheduler and controller manager use leader election, so only one is active.",
    ],
    terms: [
      { term: "Quorum", meaning: "Majority of etcd members needed to commit writes." },
      { term: "Stacked topology", meaning: "etcd runs on the control plane nodes." },
      { term: "External topology", meaning: "etcd runs on separate dedicated hosts." },
      { term: "Leader election", meaning: "Picks one active instance among replicas." },
      { term: "Raft", meaning: "Consensus algorithm used by etcd." },
    ],
    pitfalls: [
      "Running two etcd members, which tolerates zero failures.",
      "Pointing kubelets at one API server instead of the load balancer.",
    ],
    check: [
      { q: "How many etcd member failures can a 5-member cluster tolerate?", a: "Two, because three members still form a majority." },
      { q: "What is the main trade-off of stacked etcd?", a: "It needs fewer machines, but losing a node removes both an API server and an etcd member." },
    ],
  },

  "cka-architecture/helm-kustomize": {
    summary:
      "Helm packages applications as charts with templated manifests and configurable values. Kustomize customizes plain YAML with overlays and is built into kubectl. CRDs add new resource types, and operators are controllers that manage those custom resources automatically.",
    visuals: [
      {
        type: "compare",
        title: "Helm vs Kustomize",
        columns: [
          { title: "Helm", points: ["Templated charts", "values.yaml and --set overrides", "Releases with history and rollback", "Install from chart repositories"] },
          { title: "Kustomize", points: ["Template-free YAML", "Base plus overlays", "Built into kubectl apply -k", "Patches, prefixes, image tags"] },
        ],
      },
      {
        type: "cycle",
        title: "Operator reconcile loop",
        steps: [
          { label: "Watch custom resource", detail: "Operator watches objects of its CRD kind." },
          { label: "Compare states", detail: "Desired spec versus actual cluster resources." },
          { label: "Act", detail: "Create, update or delete Pods, Services and more." },
          { label: "Update status", detail: "Write results to the resource's status field." },
        ],
      },
    ],
    keyPoints: [
      "helm install RELEASE CHART creates a release; helm upgrade changes it.",
      "Override values with -f values.yaml or --set key=value.",
      "kubectl apply -k DIR builds and applies a kustomization.",
      "A CRD alone only stores data; a controller gives it behavior.",
    ],
    terms: [
      { term: "Chart", meaning: "Helm package of templates and default values." },
      { term: "Release", meaning: "An installed instance of a chart." },
      { term: "Overlay", meaning: "Kustomize directory that patches a base." },
      { term: "CRD", meaning: "CustomResourceDefinition that adds a new API type." },
      { term: "Operator", meaning: "Controller encoding operational knowledge for an app." },
    ],
    example: {
      lang: "bash",
      code: "helm repo add bitnami https://charts.bitnami.com/bitnami\nhelm repo update\nhelm install web bitnami/nginx -n web --create-namespace \\\n  --set replicaCount=2\nhelm list -n web\nhelm upgrade web bitnami/nginx -n web -f values.yaml\nhelm rollback web 1 -n web\n\nkubectl kustomize overlays/prod   # preview\nkubectl apply -k overlays/prod\nkubectl get crd",
    },
    pitfalls: [
      "Forgetting -n on helm commands, so the release lands in default.",
      "Deleting a CRD, which deletes all of its custom resources.",
    ],
    check: [
      { q: "How do you change one chart value during install?", a: "Pass --set key=value, or provide a values file with -f." },
      { q: "What turns a CRD into an operator?", a: "A controller that watches the custom resources and reconciles cluster state to match them." },
    ],
  },

  // ───────────── Workloads & scheduling ─────────────
  "cka-workloads/deployments": {
    summary:
      "A Deployment manages ReplicaSets, which keep a set number of identical Pods running. Changing the Pod template triggers a rolling update that replaces Pods gradually. Each change is a revision, so you can pause, resume or roll back.",
    visuals: [
      {
        type: "layers",
        title: "Deployment ownership",
        layers: [
          { label: "Deployment", detail: "Desired replicas, Pod template and update strategy." },
          { label: "ReplicaSet", detail: "One per template revision; keeps the Pod count." },
          { label: "Pods", detail: "Running copies labeled to match the selector." },
        ],
      },
      {
        type: "flow",
        title: "Rolling update",
        steps: [
          { label: "Change image", detail: "kubectl set image updates the Pod template." },
          { label: "New ReplicaSet", detail: "Scales up within maxSurge." },
          { label: "Old ReplicaSet", detail: "Scales down within maxUnavailable." },
          { label: "Repeat until done", detail: "Only after new Pods become Ready." },
          { label: "Old RS kept at 0", detail: "Enables kubectl rollout undo." },
        ],
      },
    ],
    keyPoints: [
      "maxSurge and maxUnavailable both default to 25 percent.",
      "Only Pod template changes create a new revision; scaling does not.",
      "kubectl rollout undo returns to the previous revision or --to-revision=N.",
      "Readiness probes keep a broken version from replacing healthy Pods.",
    ],
    terms: [
      { term: "ReplicaSet", meaning: "Keeps a stable number of matching Pods running." },
      { term: "Revision", meaning: "Recorded version of the Deployment's Pod template." },
      { term: "maxSurge", meaning: "Extra Pods allowed above desired during an update." },
      { term: "maxUnavailable", meaning: "Pods allowed to be unavailable during an update." },
      { term: "Recreate strategy", meaning: "Kills all old Pods before creating new ones." },
    ],
    example: {
      lang: "bash",
      code: "kubectl create deployment web --image=nginx:1.26 --replicas=3\nkubectl scale deployment web --replicas=5\nkubectl set image deployment/web nginx=nginx:1.27\nkubectl rollout status deployment/web\nkubectl rollout pause deployment/web\nkubectl rollout resume deployment/web\nkubectl rollout history deployment/web\nkubectl rollout undo deployment/web --to-revision=1",
    },
    pitfalls: [
      "Using a container name that does not match in kubectl set image.",
      "Editing a ReplicaSet directly; the Deployment will overwrite it.",
    ],
    check: [
      { q: "A new image is broken. How do you go back quickly?", a: "kubectl rollout undo deployment/NAME, which restores the previous revision." },
      { q: "With 4 replicas, maxSurge 1 and maxUnavailable 0, how many Pods can exist during a rollout?", a: "Up to 5, and never fewer than 4 available." },
    ],
  },

  "cka-workloads/config-secrets": {
    summary:
      "ConfigMaps hold non-sensitive configuration and Secrets hold sensitive values like passwords and tokens. Both can be injected as environment variables or mounted as files. Secret values are only base64 encoded by default, so protect them with RBAC and encryption at rest.",
    visuals: [
      {
        type: "compare",
        title: "Env vars vs mounted files",
        columns: [
          { title: "Environment variables", points: ["env or envFrom in the container", "Read once at start", "Changes need a Pod restart", "Simple key-value settings"] },
          { title: "Volume files", points: ["One file per key", "Updated automatically after a delay", "Not updated when using subPath", "Good for config files and certs"] },
        ],
      },
    ],
    keyPoints: [
      "kubectl create secret generic encodes values to base64 for you.",
      "Base64 is encoding, not encryption; enable EncryptionConfiguration for etcd.",
      "A Pod stays in CreateContainerConfigError if a referenced key is missing.",
      "ConfigMaps and Secrets must be in the same namespace as the Pod.",
    ],
    terms: [
      { term: "ConfigMap", meaning: "API object storing non-secret key-value data." },
      { term: "Secret", meaning: "API object storing sensitive data, base64 encoded." },
      { term: "envFrom", meaning: "Imports all keys as environment variables." },
      { term: "secretKeyRef", meaning: "Pulls one Secret key into an env var." },
      { term: "Immutable", meaning: "Flag preventing changes to a ConfigMap or Secret." },
    ],
    example: {
      lang: "yaml",
      code: "# kubectl create configmap app --from-literal=MODE=prod\n# kubectl create secret generic db --from-literal=PASS=s3cret\nspec:\n  containers:\n    - name: app\n      image: busybox:1.36\n      command: [\"sh\", \"-c\", \"env; sleep 3600\"]\n      envFrom:\n        - configMapRef: { name: app }\n      env:\n        - name: DB_PASS\n          valueFrom: { secretKeyRef: { name: db, key: PASS } }\n      volumeMounts: [{ name: cfg, mountPath: /etc/app }]\n  volumes: [{ name: cfg, configMap: { name: app } }]",
    },
    pitfalls: [
      "Committing Secret YAML to Git thinking base64 hides the value.",
      "Expecting env vars to update after editing the ConfigMap.",
    ],
    check: [
      { q: "How do you inject every key of a ConfigMap as env vars?", a: "Use envFrom with a configMapRef in the container spec." },
      { q: "Are Secrets encrypted by default?", a: "No. They are base64 encoded; encryption at rest must be configured on the API server." },
    ],
  },

  "cka-workloads/resources": {
    summary:
      "Requests reserve CPU and memory for scheduling, and limits cap what a container may use. Exceeding a CPU limit causes throttling, while exceeding a memory limit gets the container OOM-killed. ResourceQuotas cap totals per namespace and LimitRanges set per-container defaults and bounds.",
    visuals: [
      {
        type: "compare",
        title: "QoS classes",
        columns: [
          { title: "Guaranteed", points: ["Every container sets CPU and memory", "Requests equal limits", "Evicted last"] },
          { title: "Burstable", points: ["At least one request or limit", "Not Guaranteed", "Evicted after BestEffort"] },
          { title: "BestEffort", points: ["No requests or limits at all", "Uses spare capacity", "Evicted first under pressure"] },
        ],
      },
    ],
    keyPoints: [
      "The scheduler uses requests, not limits or actual usage, to place Pods.",
      "CPU over limit is throttled; memory over limit is OOMKilled, exit code 137.",
      "With a CPU or memory quota, new Pods must declare those values or get LimitRange defaults.",
      "1 CPU equals 1000m; memory uses Mi and Gi suffixes.",
    ],
    terms: [
      { term: "Request", meaning: "Amount reserved for the container at scheduling." },
      { term: "Limit", meaning: "Maximum the container may use." },
      { term: "ResourceQuota", meaning: "Caps total resources or object counts in a namespace." },
      { term: "LimitRange", meaning: "Default, min and max values per container in a namespace." },
      { term: "QoS class", meaning: "Guaranteed, Burstable or BestEffort; drives eviction order." },
    ],
    example: {
      lang: "yaml",
      code: "apiVersion: v1\nkind: ResourceQuota\nmetadata: { name: team-quota, namespace: dev }\nspec:\n  hard: { requests.cpu: \"4\", requests.memory: 8Gi, pods: \"20\" }\n---\napiVersion: v1\nkind: LimitRange\nmetadata: { name: defaults, namespace: dev }\nspec:\n  limits:\n    - type: Container\n      defaultRequest: { cpu: 100m, memory: 128Mi }\n      default: { cpu: 500m, memory: 256Mi }",
    },
    pitfalls: [
      "Setting requests larger than any node, leaving Pods Pending forever.",
      "Adding a quota without a LimitRange, so Pods without requests are rejected.",
    ],
    check: [
      { q: "A container exceeds its memory limit. What happens?", a: "It is OOMKilled and restarted according to the Pod's restart policy." },
      { q: "Which QoS class does a Pod with requests equal to limits for all containers get?", a: "Guaranteed, as long as both CPU and memory are set for every container." },
    ],
  },

  "cka-workloads/autoscaling": {
    summary:
      "The HorizontalPodAutoscaler changes a workload's replica count to keep a metric near a target, most often CPU utilization. It reads metrics from metrics-server, which collects usage from kubelets. CPU-based scaling only works when containers set CPU requests.",
    visuals: [
      {
        type: "cycle",
        title: "HPA control loop",
        steps: [
          { label: "Collect metrics", detail: "metrics-server scrapes kubelets for Pod usage." },
          { label: "Compare to target", detail: "Usage as percent of requests vs target, e.g. 50%." },
          { label: "Compute replicas", detail: "desired = ceil(current x actual / target)." },
          { label: "Scale workload", detail: "Updates replicas within min and max." },
          { label: "Stabilize", detail: "Scale-down waits a 5-minute window by default." },
        ],
      },
    ],
    keyPoints: [
      "Install metrics-server first; kubectl top proves it works.",
      "Utilization is measured against requests, so Pods need CPU requests.",
      "autoscaling/v2 supports CPU, memory, custom and external metrics.",
      "TARGETS showing unknown usually means missing metrics or requests.",
    ],
    terms: [
      { term: "HPA", meaning: "HorizontalPodAutoscaler: scales replica count." },
      { term: "metrics-server", meaning: "Cluster add-on providing CPU and memory usage." },
      { term: "Target utilization", meaning: "Desired average usage as percent of requests." },
      { term: "Stabilization window", meaning: "Delay that smooths scale-down decisions." },
      { term: "VPA", meaning: "VerticalPodAutoscaler: adjusts requests, not replicas." },
    ],
    example: {
      lang: "yaml",
      code: "apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata: { name: web }\nspec:\n  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: web }\n  minReplicas: 2\n  maxReplicas: 10\n  metrics:\n    - type: Resource\n      resource:\n        name: cpu\n        target: { type: Utilization, averageUtilization: 50 }\n# kubectl get hpa web --watch",
    },
    pitfalls: [
      "Creating an HPA for Pods without CPU requests; it cannot compute utilization.",
      "Also setting replicas in the Deployment via CI, fighting the HPA.",
    ],
    check: [
      { q: "kubectl get hpa shows unknown for TARGETS. Two likely causes?", a: "metrics-server is missing or unhealthy, or the Pods have no CPU requests." },
      { q: "4 Pods average 100% CPU with a 50% target. How many replicas will the HPA want?", a: "8, because ceil(4 x 100 / 50) = 8, capped at maxReplicas." },
    ],
  },

  "cka-workloads/scheduling": {
    summary:
      "The scheduler filters nodes that can run a Pod, scores the rest and binds the Pod to the best one. nodeSelector and affinity attract Pods to nodes, while taints repel Pods that lack a matching toleration. Combining them lets you dedicate nodes to specific workloads.",
    visuals: [
      {
        type: "flow",
        title: "How a Pod gets a node",
        steps: [
          { label: "Pod created", detail: "spec.nodeName is empty, so it is Pending." },
          { label: "Filter", detail: "Drop nodes lacking resources, labels or tolerations." },
          { label: "Score", detail: "Rank nodes by spread, affinity and balance." },
          { label: "Bind", detail: "Write the chosen node into the Pod." },
          { label: "kubelet starts it", detail: "Node's kubelet pulls images and runs containers." },
        ],
      },
      {
        type: "compare",
        title: "Attract vs repel",
        columns: [
          { title: "nodeSelector and affinity", points: ["Set on the Pod", "Pulls Pods to labeled nodes", "Required or preferred rules", "Pod anti-affinity spreads replicas"] },
          { title: "Taints and tolerations", points: ["Taint set on the node", "Repels Pods without a toleration", "NoSchedule, PreferNoSchedule, NoExecute", "Toleration allows, never forces"] },
        ],
      },
    ],
    keyPoints: [
      "requiredDuringScheduling is a hard rule; preferredDuringScheduling is a weighted wish.",
      "NoExecute also evicts running Pods that do not tolerate the taint.",
      "Dedicated nodes need both a taint and an affinity or nodeSelector.",
      "Control plane nodes carry node-role.kubernetes.io/control-plane:NoSchedule.",
      "Remove a taint by adding a trailing minus to the kubectl taint command.",
    ],
    terms: [
      { term: "nodeSelector", meaning: "Simple label match a node must have." },
      { term: "Node affinity", meaning: "Expressive rules about node labels." },
      { term: "Pod anti-affinity", meaning: "Keeps Pods away from Pods with certain labels." },
      { term: "Taint", meaning: "Node mark that repels Pods." },
      { term: "Toleration", meaning: "Pod setting that allows scheduling onto a tainted node." },
    ],
    example: {
      lang: "bash",
      code: "kubectl label node node1 disktype=ssd\nkubectl taint node node1 gpu=true:NoSchedule\n# Pod spec:\n#   nodeSelector: { disktype: ssd }\n#   tolerations:\n#     - key: gpu\n#       operator: Equal\n#       value: \"true\"\n#       effect: NoSchedule\nkubectl taint node node1 gpu=true:NoSchedule-   # remove",
    },
    pitfalls: [
      "Adding only a toleration and expecting the Pod to land on the tainted node.",
      "Typos in label keys, leaving Pods Pending with no matching nodes.",
    ],
    check: [
      { q: "A Pod must only run on nodes labeled zone=east. What do you use?", a: "A nodeSelector or required node affinity matching zone=east." },
      { q: "Which taint effect evicts Pods already running on the node?", a: "NoExecute, unless the Pods have a matching toleration." },
    ],
  },

  "cka-workloads/pod-patterns": {
    summary:
      "Different controllers run Pods in different ways. DaemonSets run one Pod per node, static Pods are run directly by a kubelet from a local file, and Jobs and CronJobs run tasks to completion. Init containers run before app containers, and native sidecars keep running alongside them.",
    visuals: [
      {
        type: "compare",
        title: "Pick a workload type",
        columns: [
          { title: "DaemonSet", points: ["One Pod per matching node", "Log agents, CNI, kube-proxy", "New nodes get a Pod automatically"] },
          { title: "Static Pod", points: ["Manifest file on one node", "Run by kubelet, no API needed", "Control plane components"] },
          { title: "Job and CronJob", points: ["Run to completion", "completions, parallelism, backoffLimit", "CronJob runs Jobs on a schedule"] },
        ],
      },
      {
        type: "flow",
        title: "Pod container startup",
        steps: [
          { label: "Init containers", detail: "Run one by one; each must succeed." },
          { label: "Sidecar containers", detail: "Init containers with restartPolicy Always; keep running." },
          { label: "App containers", detail: "Start after inits finish and sidecars start." },
        ],
      },
    ],
    keyPoints: [
      "Edit or delete the file in the staticPodPath to change a static Pod.",
      "Static Pods appear in the API as mirror Pods with the node name suffix.",
      "Native sidecars are declared in initContainers with restartPolicy: Always.",
      "Jobs need restartPolicy OnFailure or Never.",
    ],
    terms: [
      { term: "DaemonSet", meaning: "Ensures a Pod runs on every matching node." },
      { term: "Static Pod", meaning: "Pod managed by a kubelet from a local manifest." },
      { term: "Mirror Pod", meaning: "Read-only API copy of a static Pod." },
      { term: "Job", meaning: "Runs Pods until a set number complete successfully." },
      { term: "CronJob", meaning: "Creates Jobs on a cron schedule." },
      { term: "Init container", meaning: "Runs to completion before app containers start." },
    ],
    example: {
      lang: "bash",
      code: "kubectl create job pi --image=perl:5.40 -- perl -Mbignum=bpi -wle \"print bpi(100)\"\nkubectl create cronjob backup --image=busybox \\\n  --schedule=\"0 2 * * *\" -- sh -c \"echo backup\"\n\n# Static Pod on a node\nkubectl run static-web --image=nginx --dry-run=client -o yaml \\\n  | sudo tee /etc/kubernetes/manifests/static-web.yaml\nkubectl get pods   # static-web-<nodename>",
    },
    pitfalls: [
      "Deleting a mirror Pod with kubectl; the kubelet recreates it from the file.",
      "Using restartPolicy Always in a Job, which the API rejects.",
    ],
    check: [
      { q: "How do you permanently remove a static Pod?", a: "Delete its manifest from the kubelet's staticPodPath on that node, usually /etc/kubernetes/manifests." },
      { q: "A log agent must run on every node, including new ones. Which workload?", a: "A DaemonSet." },
    ],
  },

  // ───────────── Services & networking ─────────────
  "cka-networking/pod-networking": {
    summary:
      "Kubernetes gives every Pod its own IP, and every Pod can reach every other Pod without NAT. The cluster does not implement this itself; a CNI plugin such as Calico, Cilium or Flannel wires up Pod interfaces and routes. If the CNI is broken, Pods stay ContainerCreating and nodes go NotReady.",
    visuals: [
      {
        type: "flow",
        title: "Pod-to-Pod across nodes",
        steps: [
          { label: "Pod A eth0", detail: "Sends to Pod B's IP." },
          { label: "veth pair", detail: "Connects the Pod namespace to the node." },
          { label: "Node A routing", detail: "CNI routes or encapsulates by Pod CIDR." },
          { label: "Network or overlay", detail: "Direct routes, VXLAN or eBPF." },
          { label: "Node B to Pod B", detail: "Delivered through Pod B's veth." },
        ],
      },
    ],
    keyPoints: [
      "Each node usually gets a Pod CIDR slice from the cluster Pod range.",
      "CNI config lives in /etc/cni/net.d and plugin binaries in /opt/cni/bin.",
      "Pod IPs are ephemeral; use Services for stable addresses.",
      "Flannel does not enforce NetworkPolicies; Calico and Cilium do.",
    ],
    terms: [
      { term: "CNI", meaning: "Container Network Interface spec for Pod networking plugins." },
      { term: "Pod CIDR", meaning: "IP range from which Pods get addresses." },
      { term: "veth pair", meaning: "Virtual cable linking Pod and node namespaces." },
      { term: "Overlay", meaning: "Encapsulated network such as VXLAN over node network." },
      { term: "Network namespace", meaning: "Isolated network stack for a Pod." },
    ],
    example: {
      lang: "bash",
      code: "kubectl get pods -n kube-system -o wide | grep -Ei \"calico|cilium|flannel\"\nls /etc/cni/net.d/\nkubectl get nodes -o jsonpath='{.items[*].spec.podCIDR}'\nkubectl -n kube-system get cm kubeadm-config -o yaml | grep -i subnet\nkubectl get pods -o wide   # Pod IPs and nodes",
    },
    pitfalls: [
      "Confusing the Pod CIDR with the Service CIDR.",
      "Choosing a Pod CIDR that overlaps the node network.",
    ],
    check: [
      { q: "Where is the CNI configuration on a node?", a: "In /etc/cni/net.d, with plugin binaries in /opt/cni/bin." },
      { q: "Name two rules of the Kubernetes network model.", a: "Every Pod has its own IP, and Pods can reach all other Pods without NAT." },
    ],
  },

  "cka-networking/services": {
    summary:
      "A Service gives a stable virtual IP and DNS name to a changing set of Pods chosen by a label selector. ClusterIP is internal only, NodePort opens a port on every node, and LoadBalancer asks the cloud for an external load balancer. kube-proxy programs node rules that forward Service traffic to ready endpoints.",
    visuals: [
      {
        type: "compare",
        title: "Service types",
        columns: [
          { title: "ClusterIP", points: ["Default type", "Internal virtual IP", "Reached via DNS name", "Pod-to-Pod traffic"] },
          { title: "NodePort", points: ["Builds on ClusterIP", "Opens 30000-32767 on every node", "NodeIP:nodePort from outside", "Simple external testing"] },
          { title: "LoadBalancer", points: ["Builds on NodePort", "Cloud provisions external LB", "Public IP or hostname", "Needs cloud or MetalLB"] },
        ],
      },
      {
        type: "flow",
        title: "Traffic to a ClusterIP",
        steps: [
          { label: "Client Pod", detail: "Calls web.default.svc:80." },
          { label: "Service IP", detail: "Virtual IP from the Service CIDR." },
          { label: "kube-proxy rules", detail: "iptables, IPVS or nftables pick an endpoint." },
          { label: "EndpointSlice", detail: "Ready Pod IPs matching the selector." },
          { label: "Pod targetPort", detail: "Container receives the request." },
        ],
      },
    ],
    keyPoints: [
      "A Service with no endpoints usually has a selector that matches no labels.",
      "port is the Service port; targetPort is the container port.",
      "Only Ready Pods appear as endpoints, so failing readiness empties the Service.",
      "Headless Services (clusterIP: None) return Pod IPs directly via DNS.",
    ],
    terms: [
      { term: "Selector", meaning: "Labels a Service uses to find its Pods." },
      { term: "EndpointSlice", meaning: "Object listing the Pod IPs behind a Service." },
      { term: "targetPort", meaning: "Container port that receives Service traffic." },
      { term: "nodePort", meaning: "Port opened on every node for NodePort Services." },
      { term: "Headless Service", meaning: "Service with no cluster IP; DNS returns Pod IPs." },
    ],
    example: {
      lang: "bash",
      code: "kubectl expose deployment web --port=80 --target-port=8080\nkubectl expose deployment web --name=web-np \\\n  --type=NodePort --port=80 --target-port=8080\nkubectl get svc web -o wide\nkubectl get endpointslices -l kubernetes.io/service-name=web\nkubectl get pods --show-labels   # compare with selector",
    },
    pitfalls: [
      "Mismatched selector labels, leaving the Service with zero endpoints.",
      "Setting targetPort to the Service port instead of the container port.",
    ],
    check: [
      { q: "A Service has no endpoints. What do you check first?", a: "Whether the Service selector matches the Pod labels, and whether those Pods are Ready." },
      { q: "What range do NodePorts use by default?", a: "30000 to 32767." },
    ],
  },

  "cka-networking/ingress-gateway": {
    summary:
      "Ingress routes external HTTP and HTTPS traffic to Services by host and path, but only works with an Ingress controller installed. Gateway API is the newer, role-oriented successor with GatewayClass, Gateway and HTTPRoute objects. Both terminate TLS and forward to ordinary Services.",
    visuals: [
      {
        type: "tree",
        title: "Gateway API roles",
        root: "Gateway API",
        children: [
          { label: "GatewayClass", children: ["Infrastructure provider", "Names the controller"] },
          { label: "Gateway", children: ["Cluster operator", "Listeners: ports, TLS"] },
          { label: "HTTPRoute", children: ["App developer", "Hosts, paths, backendRefs"] },
          { label: "Ingress (older API)", children: ["ingressClassName", "rules and tls"] },
        ],
      },
      {
        type: "flow",
        title: "External HTTP request",
        steps: [
          { label: "Client", detail: "GET https://shop.example.com/cart." },
          { label: "Controller or Gateway", detail: "Terminates TLS, matches host and path." },
          { label: "Service", detail: "Route forwards to backend Service and port." },
          { label: "Pods", detail: "Ready endpoints serve the response." },
        ],
      },
    ],
    keyPoints: [
      "An Ingress without a running controller does nothing.",
      "pathType must be Prefix, Exact or ImplementationSpecific.",
      "TLS uses a kubernetes.io/tls Secret in the same namespace as the Ingress.",
      "HTTPRoute attaches to a Gateway through parentRefs.",
      "The Ingress API is frozen; new features go into Gateway API.",
    ],
    terms: [
      { term: "Ingress controller", meaning: "Proxy that implements Ingress rules." },
      { term: "IngressClass", meaning: "Selects which controller handles an Ingress." },
      { term: "GatewayClass", meaning: "Cluster-scoped type of Gateway and its controller." },
      { term: "Gateway", meaning: "Load balancer instance with listeners." },
      { term: "HTTPRoute", meaning: "HTTP routing rules attached to a Gateway." },
    ],
    example: {
      lang: "yaml",
      code: "apiVersion: gateway.networking.k8s.io/v1\nkind: HTTPRoute\nmetadata: { name: shop, namespace: web }\nspec:\n  parentRefs: [{ name: main-gw, namespace: infra }]\n  hostnames: [\"shop.example.com\"]\n  rules:\n    - matches: [{ path: { type: PathPrefix, value: /cart } }]\n      backendRefs: [{ name: cart-svc, port: 80 }]\n    - backendRefs: [{ name: web-svc, port: 80 }]",
      caption: "Route /cart to one Service and everything else to another.",
    },
    pitfalls: [
      "Omitting ingressClassName when no default IngressClass exists.",
      "Pointing a route at a Service port that does not exist.",
    ],
    check: [
      { q: "You created an Ingress but nothing responds. What is likely missing?", a: "An Ingress controller, or a matching ingressClassName for the installed controller." },
      { q: "Which Gateway API object do app teams usually own?", a: "HTTPRoute, which attaches to a shared Gateway." },
    ],
  },

  "cka-networking/network-policies": {
    summary:
      "NetworkPolicies are Pod-level firewalls enforced by the CNI plugin. Once a policy selects a Pod for a direction, only traffic explicitly allowed by some policy is permitted. A common pattern is default deny for the namespace, then narrow allow rules by Pod and namespace labels.",
    visuals: [
      {
        type: "tree",
        title: "Anatomy of a NetworkPolicy",
        root: "NetworkPolicy",
        children: [
          { label: "podSelector", children: ["Pods the policy applies to", "Empty selects all Pods"] },
          { label: "policyTypes", children: ["Ingress", "Egress"] },
          { label: "ingress.from", children: ["podSelector", "namespaceSelector", "ipBlock"] },
          { label: "egress.to", children: ["Same peer types", "Allow DNS on port 53"] },
          { label: "ports", children: ["protocol and port"] },
        ],
      },
    ],
    keyPoints: [
      "Policies are additive allow lists; there are no deny rules.",
      "podSelector and namespaceSelector in one from item are ANDed; separate items are ORed.",
      "Default-deny egress also blocks DNS unless you allow UDP and TCP 53.",
      "Select namespaces by the kubernetes.io/metadata.name label.",
      "Policies need a CNI that enforces them, such as Calico or Cilium.",
    ],
    terms: [
      { term: "Default deny", meaning: "Policy selecting all Pods with no allow rules." },
      { term: "podSelector", meaning: "Chooses Pods by label." },
      { term: "namespaceSelector", meaning: "Chooses namespaces by label." },
      { term: "ipBlock", meaning: "Allows a CIDR range, with optional exceptions." },
      { term: "policyTypes", meaning: "Directions the policy restricts." },
    ],
    example: {
      lang: "yaml",
      code: "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: { name: api-allow-frontend, namespace: prod }\nspec:\n  podSelector: { matchLabels: { app: api } }\n  policyTypes: [Ingress]\n  ingress:\n    - from:\n        - podSelector: { matchLabels: { app: frontend } }\n      ports: [{ protocol: TCP, port: 8080 }]\n# Default deny: podSelector: {} with policyTypes: [Ingress]",
      caption: "Only frontend Pods may reach api Pods on port 8080.",
    },
    pitfalls: [
      "Splitting podSelector and namespaceSelector into two items, which allows far more.",
      "Applying default-deny egress and breaking DNS lookups.",
    ],
    check: [
      { q: "How do you deny all ingress to every Pod in a namespace?", a: "Create a policy with podSelector: {} and policyTypes: [Ingress] and no ingress rules." },
      { q: "Pods lose name resolution after a default-deny egress policy. Why?", a: "Egress to CoreDNS on port 53 is blocked; add an egress rule allowing UDP and TCP 53." },
    ],
  },

  "cka-networking/coredns": {
    summary:
      "CoreDNS is the cluster DNS server that turns Service names into cluster IPs. Every Pod's resolv.conf points at the kube-dns Service and includes search domains for its namespace. Its configuration is the Corefile stored in the coredns ConfigMap in kube-system.",
    visuals: [
      {
        type: "sequence",
        title: "Resolving a Service name",
        actors: ["Client Pod", "CoreDNS", "API server"],
        messages: [
          { from: 2, to: 1, label: "Watch Services and EndpointSlices" },
          { from: 0, to: 1, label: "Query db.prod" },
          { from: 1, to: 1, label: "Expand to db.prod.svc.cluster.local" },
          { from: 1, to: 0, label: "Answer with ClusterIP" },
          { from: 0, to: 0, label: "Connect to ClusterIP" },
        ],
      },
    ],
    keyPoints: [
      "Service FQDN format is NAME.NAMESPACE.svc.cluster.local.",
      "Within the same namespace, the short Service name is enough.",
      "The kube-dns Service fronts the CoreDNS Pods in kube-system.",
      "Debug with nslookup from a temporary busybox Pod.",
    ],
    terms: [
      { term: "CoreDNS", meaning: "Pluggable DNS server used as cluster DNS." },
      { term: "Corefile", meaning: "CoreDNS configuration file in a ConfigMap." },
      { term: "kube-dns Service", meaning: "ClusterIP Service in front of CoreDNS." },
      { term: "Search domain", meaning: "Suffixes appended to short names in resolv.conf." },
      { term: "FQDN", meaning: "Fully qualified domain name." },
    ],
    example: {
      lang: "bash",
      code: "kubectl run dnstest --image=busybox:1.36 --rm -it --restart=Never \\\n  -- nslookup kubernetes.default\nkubectl exec web-0 -- cat /etc/resolv.conf\nkubectl -n kube-system get pods -l k8s-app=kube-dns\nkubectl -n kube-system get cm coredns -o yaml\nkubectl -n kube-system logs -l k8s-app=kube-dns",
    },
    pitfalls: [
      "Using the short name from a different namespace; add the namespace.",
      "Editing the Corefile and not checking CoreDNS logs for reload errors.",
    ],
    check: [
      { q: "What is the FQDN of Service db in namespace prod?", a: "db.prod.svc.cluster.local." },
      { q: "Where is CoreDNS configured?", a: "In the coredns ConfigMap in kube-system, which holds the Corefile." },
    ],
  },

  // ───────────── Storage ─────────────
  "cka-storage/volumes": {
    summary:
      "Volumes give containers storage that outlives a container restart. emptyDir is scratch space shared by containers in one Pod, hostPath mounts a directory from the node, and projected volumes combine Secrets, ConfigMaps, downward API data and service account tokens into one mount.",
    visuals: [
      {
        type: "compare",
        title: "Common volume types",
        columns: [
          { title: "emptyDir", points: ["Created empty with the Pod", "Deleted when Pod is removed", "Shared between containers", "medium: Memory for tmpfs"] },
          { title: "hostPath", points: ["Mounts a node path", "Data tied to that node", "Security risk on shared nodes", "Used by static Pods and agents"] },
          { title: "projected", points: ["Merges several sources", "Secret, ConfigMap, downwardAPI", "Service account tokens", "One mount directory"] },
        ],
      },
    ],
    keyPoints: [
      "emptyDir survives container restarts but not Pod deletion.",
      "Declare volumes under spec.volumes and mount them per container.",
      "hostPath data stays on the node when the Pod moves elsewhere.",
      "Use PersistentVolumeClaims for data that must survive Pods.",
    ],
    terms: [
      { term: "Volume", meaning: "Directory available to containers in a Pod." },
      { term: "volumeMounts", meaning: "Where a container mounts a volume." },
      { term: "emptyDir", meaning: "Temporary volume living as long as the Pod." },
      { term: "hostPath", meaning: "Volume backed by a node's filesystem." },
      { term: "Downward API", meaning: "Exposes Pod metadata to containers." },
    ],
    example: {
      lang: "yaml",
      code: "spec:\n  containers:\n    - name: writer\n      image: busybox:1.36\n      command: [\"sh\", \"-c\", \"while true; do date >> /data/log; sleep 5; done\"]\n      volumeMounts: [{ name: shared, mountPath: /data }]\n    - name: reader\n      image: busybox:1.36\n      command: [\"sh\", \"-c\", \"tail -f /data/log\"]\n      volumeMounts: [{ name: shared, mountPath: /data }]\n  volumes:\n    - name: shared\n      emptyDir: {}",
      caption: "Two containers share files through emptyDir.",
    },
    pitfalls: [
      "Storing database data in emptyDir and losing it when the Pod is rescheduled.",
      "Using hostPath for app data on a multi-node cluster.",
    ],
    check: [
      { q: "Two containers in one Pod must share temporary files. Which volume?", a: "An emptyDir volume mounted in both containers." },
      { q: "Does emptyDir data survive Pod deletion?", a: "No. It is deleted when the Pod is removed from the node." },
    ],
  },

  "cka-storage/pv-pvc": {
    summary:
      "A PersistentVolume is a piece of storage in the cluster, and a PersistentVolumeClaim is a request for storage by a user. The control plane binds a claim to a PV that matches its size, access mode and storage class. The reclaim policy decides what happens to the PV after the claim is deleted.",
    visuals: [
      {
        type: "flow",
        title: "Static provisioning lifecycle",
        steps: [
          { label: "Admin creates PV", detail: "Capacity, access modes, storageClassName, backend." },
          { label: "User creates PVC", detail: "Requests size, access mode and class." },
          { label: "Bound", detail: "Controller binds PVC to a matching PV one-to-one." },
          { label: "Pod mounts PVC", detail: "References the claim by name in volumes." },
          { label: "PVC deleted", detail: "Retain keeps PV Released; Delete removes it." },
        ],
      },
      {
        type: "compare",
        title: "Access modes and reclaim",
        columns: [
          { title: "Access modes", points: ["RWO: one node read-write", "ROX: many nodes read-only", "RWX: many nodes read-write", "RWOP: one Pod read-write"] },
          { title: "Reclaim policies", points: ["Retain: keep data, manual cleanup", "Delete: remove PV and backend", "Recycle: deprecated"] },
        ],
      },
    ],
    keyPoints: [
      "PVs are cluster-scoped; PVCs are namespaced.",
      "Binding needs matching storageClassName, enough capacity and a supported access mode.",
      "A Pending PVC usually has no matching PV or a class mismatch.",
      "A Released PV with Retain cannot rebind until you clear its claimRef.",
    ],
    terms: [
      { term: "PersistentVolume", meaning: "Cluster storage resource with a lifecycle independent of Pods." },
      { term: "PersistentVolumeClaim", meaning: "Namespaced request for storage." },
      { term: "Access mode", meaning: "How the volume can be mounted by nodes or Pods." },
      { term: "Reclaim policy", meaning: "What happens to a PV after release." },
      { term: "claimRef", meaning: "PV field recording which PVC it is bound to." },
    ],
    example: {
      lang: "yaml",
      code: "apiVersion: v1\nkind: PersistentVolume\nmetadata: { name: pv-data }\nspec:\n  capacity: { storage: 1Gi }\n  accessModes: [ReadWriteOnce]\n  persistentVolumeReclaimPolicy: Retain\n  storageClassName: manual\n  hostPath: { path: /mnt/data }  # lab only\n---\napiVersion: v1\nkind: PersistentVolumeClaim\nmetadata: { name: data, namespace: app }\nspec: { storageClassName: manual, accessModes: [ReadWriteOnce],\n  resources: { requests: { storage: 500Mi } } }",
    },
    pitfalls: [
      "Leaving storageClassName empty on the PVC so the default class provisions a new volume.",
      "Requesting RWX from a backend that only supports RWO.",
    ],
    check: [
      { q: "A PVC is stuck in Pending. Name three things to check.", a: "That a PV exists with the same storageClassName, enough capacity and a compatible access mode; also check events with kubectl describe pvc." },
      { q: "What happens to a Retain PV when its PVC is deleted?", a: "It becomes Released and keeps its data, but must be manually cleaned before reuse." },
    ],
  },

  "cka-storage/storageclasses": {
    summary:
      "A StorageClass describes a kind of storage and the provisioner that creates it. When a PVC names a class, the provisioner creates a matching PV automatically. One class can be marked default so PVCs without a class still get storage.",
    visuals: [
      {
        type: "sequence",
        title: "Dynamic provisioning",
        actors: ["User", "API server", "CSI provisioner", "Storage backend"],
        messages: [
          { from: 0, to: 1, label: "Create PVC, class fast" },
          { from: 2, to: 1, label: "Watch sees unbound PVC" },
          { from: 2, to: 3, label: "Create volume" },
          { from: 3, to: 2, label: "Volume ID returned" },
          { from: 2, to: 1, label: "Create PV for the claim" },
          { from: 1, to: 0, label: "PVC is Bound" },
        ],
      },
    ],
    keyPoints: [
      "Mark the default with annotation storageclass.kubernetes.io/is-default-class: true.",
      "WaitForFirstConsumer delays provisioning until a Pod is scheduled, matching its zone.",
      "Dynamically provisioned PVs inherit the class reclaimPolicy, which defaults to Delete.",
      "allowVolumeExpansion lets you grow a PVC by editing its request.",
      "storageClassName: \"\" on a PVC disables dynamic provisioning.",
    ],
    terms: [
      { term: "StorageClass", meaning: "Template for dynamically provisioned volumes." },
      { term: "Provisioner", meaning: "Driver that creates volumes, usually a CSI driver." },
      { term: "CSI", meaning: "Container Storage Interface standard for storage drivers." },
      { term: "volumeBindingMode", meaning: "Immediate or WaitForFirstConsumer." },
      { term: "Default StorageClass", meaning: "Class used when a PVC names none." },
    ],
    example: {
      lang: "yaml",
      code: "apiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata:\n  name: fast\n  annotations:\n    storageclass.kubernetes.io/is-default-class: \"true\"\nprovisioner: rancher.io/local-path\nreclaimPolicy: Delete\nvolumeBindingMode: WaitForFirstConsumer\nallowVolumeExpansion: true",
      caption: "Default class using the local-path provisioner.",
    },
    pitfalls: [
      "Marking two classes as default, which makes the choice ambiguous.",
      "Waiting for a WaitForFirstConsumer PVC to bind before creating the Pod.",
    ],
    check: [
      { q: "How do you make a StorageClass the default?", a: "Set the annotation storageclass.kubernetes.io/is-default-class to \"true\" and remove it from any other class." },
      { q: "A PVC with WaitForFirstConsumer stays Pending. Is it broken?", a: "Not necessarily; it binds once a Pod using it is scheduled." },
    ],
  },

  // ───────────── Troubleshooting ─────────────
  "cka-troubleshooting/debug-apps": {
    summary:
      "Most failing Pods reveal the cause in their status, events and logs. CrashLoopBackOff means the container keeps exiting, ImagePullBackOff means the image cannot be pulled, and Pending means the scheduler cannot place the Pod. Read describe output from the bottom up, starting with Events.",
    visuals: [
      {
        type: "tree",
        title: "Pod status to cause",
        root: "Failing Pod",
        children: [
          { label: "Pending", children: ["Insufficient CPU or memory", "Taints or node selectors", "Unbound PVC"] },
          { label: "ImagePullBackOff", children: ["Typo in image or tag", "Private registry, no pull secret"] },
          { label: "CrashLoopBackOff", children: ["App error or bad command", "Missing env or config", "Failing liveness probe"] },
          { label: "CreateContainerConfigError", children: ["Missing ConfigMap or Secret key"] },
          { label: "OOMKilled", children: ["Memory limit too low", "Exit code 137"] },
        ],
      },
    ],
    keyPoints: [
      "kubectl describe pod shows events, exit codes and last state.",
      "kubectl logs --previous shows output from the crashed container.",
      "Fix the owner (Deployment), not the Pod, or your change is lost.",
      "kubectl get events --sort-by=.lastTimestamp shows the recent timeline.",
    ],
    terms: [
      { term: "CrashLoopBackOff", meaning: "Container keeps exiting; restarts back off exponentially." },
      { term: "ImagePullBackOff", meaning: "Image pull failed; retries back off." },
      { term: "Pending", meaning: "Pod accepted but not yet running on a node." },
      { term: "Exit code", meaning: "Process result; 137 means killed, often OOM." },
      { term: "imagePullSecrets", meaning: "Registry credentials referenced by a Pod." },
    ],
    example: {
      lang: "bash",
      code: "kubectl get pods -o wide\nkubectl describe pod web-7d9c   # read Events at the bottom\nkubectl logs web-7d9c --previous\nkubectl get pod web-7d9c -o jsonpath='{.status.containerStatuses[0].lastState}'\nkubectl get events --sort-by=.lastTimestamp | tail\nkubectl edit deployment web   # fix image, command or resources",
    },
    pitfalls: [
      "Reading only current logs of a crash-looping container instead of --previous.",
      "Editing the Pod when a Deployment will recreate it unchanged.",
    ],
    check: [
      { q: "A Pod shows ImagePullBackOff. First two checks?", a: "Verify the image name and tag, then whether the registry needs an imagePullSecret." },
      { q: "How do you see why a container crashed before its last restart?", a: "kubectl logs POD --previous, plus the lastState in kubectl describe." },
      { q: "A Pod is Pending with Insufficient memory in events. Fixes?", a: "Lower the memory request, free capacity, or add nodes." },
    ],
  },

  "cka-troubleshooting/debug-control-plane": {
    summary:
      "In kubeadm clusters, the API server, scheduler, controller manager and etcd are static Pods. A typo in their manifests breaks the component, and if it is the API server, kubectl stops working. You then debug on the node with crictl, container logs and the manifests directly.",
    visuals: [
      {
        type: "flow",
        title: "Fixing a broken component",
        steps: [
          { label: "Spot symptoms", detail: "kubectl refused, Pods Pending, or ReplicaSets not acting." },
          { label: "Check containers", detail: "crictl ps -a on the control plane node." },
          { label: "Read logs", detail: "crictl logs or /var/log/pods for the component." },
          { label: "Fix the manifest", detail: "Edit /etc/kubernetes/manifests/COMPONENT.yaml." },
          { label: "Wait for restart", detail: "kubelet recreates the static Pod automatically." },
        ],
      },
    ],
    keyPoints: [
      "Pods stuck Pending with no events often mean the scheduler is down.",
      "Deployments not creating Pods often mean the controller manager is down.",
      "If crictl shows nothing for a component, check kubelet logs for manifest errors.",
      "Back up a manifest outside the manifests directory before editing it.",
    ],
    terms: [
      { term: "Static Pod manifest", meaning: "YAML file the kubelet runs directly." },
      { term: "crictl ps -a", meaning: "Lists all containers including exited ones." },
      { term: "/var/log/pods", meaning: "Node directory with container log files." },
      { term: "Mirror Pod", meaning: "API view of a static Pod." },
    ],
    example: {
      lang: "bash",
      code: "kubectl get pods -n kube-system   # may fail if API server is down\nsudo crictl ps -a | grep -E \"apiserver|scheduler|controller|etcd\"\nsudo crictl logs <container-id> 2>&1 | tail -20\nls /var/log/pods/ | grep kube-apiserver\nsudo journalctl -u kubelet | grep -i apiserver | tail\nsudo cp /etc/kubernetes/manifests/kube-apiserver.yaml /root/\nsudo vim /etc/kubernetes/manifests/kube-apiserver.yaml",
    },
    pitfalls: [
      "Leaving a backup copy inside /etc/kubernetes/manifests, which kubelet also runs.",
      "Restarting kubelet repeatedly instead of reading the component logs.",
    ],
    check: [
      { q: "New Pods stay Pending with no scheduling events. Which component is suspect?", a: "kube-scheduler; check its static Pod manifest and logs." },
      { q: "kubectl returns connection refused on port 6443. Where do you look?", a: "On the control plane node: crictl ps -a and logs for kube-apiserver, then its manifest." },
    ],
  },

  "cka-troubleshooting/debug-nodes": {
    summary:
      "A node goes NotReady when its kubelet stops posting healthy status to the API server. The usual causes are a stopped or misconfigured kubelet, a broken container runtime, expired certificates or a missing CNI. You fix it on the node with systemctl, journalctl and the kubelet config files.",
    visuals: [
      {
        type: "flow",
        title: "NotReady node checklist",
        steps: [
          { label: "Describe node", detail: "Read Conditions and recent events." },
          { label: "SSH to node", detail: "Check systemctl status kubelet." },
          { label: "Read kubelet logs", detail: "journalctl -u kubelet for the exact error." },
          { label: "Check runtime", detail: "systemctl status containerd; crictl info." },
          { label: "Fix config or certs", detail: "config.yaml, kubelet.conf, PKI, then restart." },
        ],
      },
    ],
    keyPoints: [
      "Node conditions include Ready, MemoryPressure, DiskPressure and PIDPressure.",
      "A stopped kubelet makes the node NotReady within about a minute.",
      "Kubelet config is /var/lib/kubelet/config.yaml; its kubeconfig is /etc/kubernetes/kubelet.conf.",
      "After editing service drop-ins run daemon-reload, then restart and enable kubelet.",
    ],
    terms: [
      { term: "NotReady", meaning: "Node's kubelet is not reporting healthy status." },
      { term: "Node condition", meaning: "Status flag describing node health." },
      { term: "kubelet.conf", meaning: "Kubeconfig the kubelet uses to reach the API server." },
      { term: "config.yaml", meaning: "KubeletConfiguration file with node agent settings." },
      { term: "systemctl enable", meaning: "Starts a service automatically at boot." },
    ],
    example: {
      lang: "bash",
      code: "kubectl get nodes\nkubectl describe node worker1 | sed -n \"/Conditions/,/Addresses/p\"\nssh worker1\nsudo systemctl status kubelet\nsudo journalctl -u kubelet -n 50 --no-pager\nsudo systemctl status containerd\nsudo vim /var/lib/kubelet/config.yaml\nsudo systemctl daemon-reload\nsudo systemctl enable --now kubelet",
    },
    pitfalls: [
      "Restarting kubelet without enabling it, so it fails again after reboot.",
      "Fixing the wrong file; check which config path the kubelet unit actually uses.",
    ],
    check: [
      { q: "A worker is NotReady and kubelet is inactive. What do you run?", a: "systemctl enable --now kubelet, then check journalctl -u kubelet if it fails to stay up." },
      { q: "Where is the kubelet's main configuration on a kubeadm node?", a: "/var/lib/kubelet/config.yaml, with flags in the systemd drop-in and /var/lib/kubelet/kubeadm-flags.env." },
    ],
  },

  "cka-troubleshooting/debug-network": {
    summary:
      "When a request fails, trace it hop by hop: DNS name, Service, endpoints, Pod port and the app itself. Most failures are a selector mismatch, a wrong targetPort, a NetworkPolicy, or broken kube-proxy or CoreDNS. A temporary debug Pod lets you test each hop from inside the cluster.",
    visuals: [
      {
        type: "flow",
        title: "Trace a failed request",
        steps: [
          { label: "DNS", detail: "nslookup the Service name from a debug Pod." },
          { label: "Service", detail: "Check ports, targetPort and selector." },
          { label: "Endpoints", detail: "EndpointSlice must list Ready Pod IPs." },
          { label: "Pod directly", detail: "curl PodIP:port to bypass the Service." },
          { label: "Policies and proxy", detail: "Check NetworkPolicies and kube-proxy Pods." },
        ],
      },
    ],
    keyPoints: [
      "If the Pod IP works but the Service does not, suspect selector, ports or kube-proxy.",
      "If neither works, check the app, container port and NetworkPolicies.",
      "If names fail but IPs work, debug CoreDNS.",
      "kube-proxy runs as a DaemonSet in kube-system; check its logs.",
    ],
    terms: [
      { term: "Debug Pod", meaning: "Throwaway Pod with network tools for testing." },
      { term: "kube-proxy", meaning: "Programs Service routing rules on each node." },
      { term: "EndpointSlice", meaning: "Lists backend Pod addresses for a Service." },
      { term: "kubectl debug", meaning: "Adds an ephemeral debug container or node shell." },
    ],
    example: {
      lang: "bash",
      code: "kubectl run tmp --image=nicolaka/netshoot --rm -it --restart=Never -- bash\n# inside the Pod:\nnslookup web.prod\ncurl -s -m 3 web.prod:80\ncurl -s -m 3 10.244.1.15:8080   # Pod IP directly\nexit\nkubectl get svc web -n prod -o yaml | grep -A3 selector\nkubectl get endpointslices -n prod -l kubernetes.io/service-name=web\nkubectl get networkpolicy -n prod\nkubectl -n kube-system logs ds/kube-proxy | tail",
    },
    pitfalls: [
      "Testing from your laptop instead of from inside the cluster.",
      "Forgetting that NetworkPolicies can silently drop traffic.",
    ],
    check: [
      { q: "curl to the Pod IP works but curl to the Service fails. Likely causes?", a: "Wrong selector or targetPort on the Service, or kube-proxy is not programming rules." },
      { q: "IPs work but names do not resolve. What do you check?", a: "CoreDNS Pods and logs, the kube-dns Service, and the Pod's resolv.conf." },
    ],
  },

  "cka-troubleshooting/monitoring": {
    summary:
      "kubectl gives three quick views of a running cluster: logs show what containers print, top shows live CPU and memory from metrics-server, and events show what the control plane did and why. Combining them finds resource-starved or misbehaving workloads fast.",
    visuals: [
      {
        type: "compare",
        title: "Logs vs top vs events",
        columns: [
          { title: "kubectl logs", points: ["Container stdout and stderr", "-c for one container", "--previous after crashes", "-l selects many Pods"] },
          { title: "kubectl top", points: ["Live CPU and memory", "Needs metrics-server", "--sort-by=cpu or memory", "--containers for detail"] },
          { title: "Events", points: ["Scheduling, pulls, kills", "Kept about one hour", "--sort-by timestamp", "Filter type=Warning"] },
        ],
      },
    ],
    keyPoints: [
      "kubectl logs --all-containers shows every container in the Pod.",
      "kubectl top pods -A --sort-by=memory finds the heaviest Pods.",
      "Warning events surface OOMKills, failed mounts and failed scheduling.",
      "Write answers to the exact file path the task requests.",
    ],
    terms: [
      { term: "stdout and stderr", meaning: "Streams container logs are collected from." },
      { term: "metrics-server", meaning: "Provides the resource metrics behind kubectl top." },
      { term: "Event", meaning: "Short-lived record of something that happened to an object." },
      { term: "--field-selector", meaning: "Filters objects by field values." },
    ],
    example: {
      lang: "bash",
      code: "kubectl logs web-0 -c app --since=1h --tail=50\nkubectl logs -l app=web --all-containers --prefix\nkubectl top nodes\nkubectl top pods -A --sort-by=cpu | head -5\nkubectl top pod web-0 --containers\nkubectl get events -A --field-selector type=Warning \\\n  --sort-by=.metadata.creationTimestamp\nkubectl events --for pod/web-0",
    },
    pitfalls: [
      "Expecting kubectl top to work without metrics-server.",
      "Relying on events from yesterday; they expire after about an hour.",
    ],
    check: [
      { q: "Find the Pod using the most CPU across all namespaces.", a: "kubectl top pods -A --sort-by=cpu and read the first row." },
      { q: "How do you list only Warning events?", a: "kubectl get events --field-selector type=Warning, optionally with -A." },
    ],
  },

  // ───────────── Mock exams ─────────────
  "cka-exam-prep/drills": {
    summary:
      "Drills turn common exam tasks into muscle memory. Repeat RBAC, etcd backup, NetworkPolicy and upgrade tasks against a timer until each takes under six minutes. Speed comes from knowing the command and the docs page, not from typing faster.",
    visuals: [
      {
        type: "cycle",
        title: "Drill loop",
        steps: [
          { label: "Pick a task", detail: "RBAC, etcd, NetworkPolicy or upgrade." },
          { label: "Start timer", detail: "Work from a fresh cluster or namespace." },
          { label: "Solve and verify", detail: "Prove it with get, can-i or curl." },
          { label: "Note slow steps", detail: "Which flag or doc page cost time?" },
          { label: "Repeat tomorrow", detail: "Until under six minutes, twice in a row." },
        ],
      },
    ],
    keyPoints: [
      "Bookmark the exact docs page for each drill topic.",
      "Always finish with a verification command; unverified work may be wrong.",
      "Reset the environment so you do not rely on leftover objects.",
      "Track times to see real progress.",
    ],
    terms: [
      { term: "Drill", meaning: "Short, repeated, timed practice of one task." },
      { term: "Verification", meaning: "Command proving the task is done correctly." },
      { term: "Muscle memory", meaning: "Doing steps without having to think them through." },
    ],
    pitfalls: [
      "Drilling only easy tasks you already know.",
      "Copying old answers instead of typing them from memory.",
    ],
    check: [
      { q: "Why add a verification step to every drill?", a: "The exam grades the resulting state, so you must confirm it is correct." },
      { q: "What target time per common task is a good goal?", a: "Under six minutes, consistently." },
    ],
  },

  "cka-exam-prep/simulator": {
    summary:
      "Exam registration includes two killer.sh simulator sessions that are harder than the real exam. Each session stays available for 36 hours, so you can finish, review every solution and redo missed tasks. Treat the score as a learning tool, not a prediction.",
    visuals: [
      {
        type: "cycle",
        title: "Simulator session cycle",
        steps: [
          { label: "Sit under exam rules", detail: "Two hours, only allowed docs." },
          { label: "Review solutions", detail: "Compare every task with the official answer." },
          { label: "Redo misses", detail: "Solve them again from scratch." },
          { label: "Log weak spots", detail: "Group by domain and command." },
          { label: "Drill, then retest", detail: "Second session after targeted practice." },
        ],
      },
    ],
    keyPoints: [
      "The simulator is intentionally harder; a lower score there is normal.",
      "Use the 36-hour window to redo tasks, not just read answers.",
      "Save the second session for after you have fixed weak spots.",
      "Recurring mistakes matter more than the total score.",
    ],
    terms: [
      { term: "killer.sh", meaning: "Exam simulator bundled with CKA registration." },
      { term: "Session", meaning: "One activation lasting 36 hours." },
      { term: "Weak spot log", meaning: "List of repeated mistakes to drill." },
    ],
    pitfalls: [
      "Using both sessions in the same week with no study in between.",
      "Reading solutions without redoing the tasks.",
    ],
    check: [
      { q: "How long does each killer.sh session stay open?", a: "36 hours from activation." },
      { q: "When should you take the second session?", a: "After reviewing the first and drilling the weak areas it revealed." },
    ],
  },

  "cka-exam-prep/final-review": {
    summary:
      "The final review sets up a calm, repeatable exam start. Practice a short terminal setup, know where key docs pages live, and plan to skip long tasks and return. Small habits like switching context first save many points.",
    visuals: [
      {
        type: "flow",
        title: "First five minutes of the exam",
        steps: [
          { label: "Check tools", detail: "kubectl alias k and completion are usually preset." },
          { label: "Set shortcuts", detail: "export do and now variables." },
          { label: "Configure vim", detail: "expandtab, tabstop 2, shiftwidth 2." },
          { label: "Scan task list", detail: "Note weights; do quick wins first." },
        ],
      },
    ],
    keyPoints: [
      "Switch context at the start of every task, every time.",
      "Skip any task stuck beyond about 8 minutes and flag it.",
      "Copy names from the task text to avoid typos.",
      "Leave 10 minutes at the end to revisit flagged tasks.",
    ],
    terms: [
      { term: "Alias", meaning: "Short name for a command, like k for kubectl." },
      { term: "Skip-and-return", meaning: "Move past hard tasks and come back later." },
      { term: "Quick win", meaning: "High-weight task you can finish fast." },
    ],
    example: {
      lang: "bash",
      code: "# ~/.bashrc\nalias k=kubectl\nsource <(kubectl completion bash)\ncomplete -o default -F __start_kubectl k\nexport do=\"--dry-run=client -o yaml\"\nexport now=\"--force --grace-period=0\"\n\n# ~/.vimrc\nset expandtab tabstop=2 shiftwidth=2",
      caption: "Usage: k run x --image=nginx $do > x.yaml",
    },
    pitfalls: [
      "Spending ten minutes perfecting the shell setup.",
      "Forgetting the context switch on a late task when tired.",
    ],
    check: [
      { q: "What vim settings prevent YAML indentation errors?", a: "set expandtab tabstop=2 shiftwidth=2, so tabs become two spaces." },
      { q: "What should you do with a task that has taken 10 minutes and is not close?", a: "Flag it, move on, and return if time remains." },
    ],
  },
};

export default explainers;

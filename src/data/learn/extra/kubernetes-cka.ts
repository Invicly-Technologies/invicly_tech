import type { ExtraMap } from "./types";

// Filled in module by module; topics without an entry simply hide the extra sections.
const extra: ExtraMap = {
  "cka-prereqs/exam-format": {
    plain: [
      "The CKA (Certified Kubernetes Administrator) exam has no multiple-choice questions. You get a remote Linux desktop with a terminal and a browser, plus a list of about 15 to 20 tasks. Each task asks you to change a real cluster: create a Deployment, fix a broken node, back up etcd.",
      "Think of it as a driving test, not a written test. Nobody asks you to define a Service. They ask you to make one work. When time is up, a grading script looks at the final state of each cluster and gives points for what is actually there.",
      "You may open the official Kubernetes documentation during the exam. That sounds generous, but there is no time to read whole pages. The real skill is knowing which page holds the YAML you need, finding it with the search box, and copying it fast.",
      "You need 66 percent to pass. The exam fee includes one free retake and two practice sessions on the killer.sh simulator. A pass is valid for two years, so plan to renew if you need the badge for work.",
    ],
    deepDive: [
      {
        heading: "How tasks are graded",
        body: "The grader never sees the commands you typed. It only checks the cluster afterwards: does a Pod called exactly web-1 exist in namespace prod, does the file /opt/out.txt contain the right text, is the node Ready? Many tasks give partial credit, because the checker tests several conditions separately.\n\nThis has two big consequences. First, details are points: a typo in a name or the wrong namespace scores zero for that check, even if your idea was perfect. Second, a task you solved in the wrong cluster does not count at all. That is why every task starts with a context or ssh command, and why you should paste it before anything else.",
        bullets: ["Copy object names from the task text instead of typing them", "Check the namespace in every task", "Verify the end state with get or describe before moving on"],
      },
      {
        heading: "What the exam desktop looks like",
        body: "You connect through a secure browser from the proctoring company. Inside it runs a small Linux desktop with a terminal and Firefox for the docs. A proctor watches through your webcam, so your desk must be clear and you must stay in view.\n\nThe terminal already has kubectl, the alias k and bash completion. Some tasks ask you to ssh into a specific node and use sudo for root work, such as editing static Pod manifests or restarting the kubelet. Copy and paste inside the terminal use Ctrl+Shift+C and Ctrl+Shift+V, which trips up many people on their first try.",
        bullets: ["One screen only; the desktop can feel small", "Your own browser bookmarks are not available", "Practise in a small window so the real one feels normal"],
        visual: {
          type: "layers",
          title: "What sits between you and the cluster",
          layers: [
            { label: "Your computer and webcam", detail: "Proctor watches; one screen, clear desk" },
            { label: "Secure browser", detail: "From the proctoring company" },
            { label: "Remote Linux desktop", detail: "Terminal plus Firefox for the docs" },
            { label: "Terminal", detail: "kubectl, alias k, bash completion" },
            { label: "Task nodes", detail: "ssh in, sudo for root work" },
          ],
        },
      },
      {
        heading: "The five domains in practice",
        body: "The curriculum lists five domains with fixed weights. Knowing what each looks like as a task helps you plan study time.",
        bullets: [
          "Troubleshooting 30%: broken Pods, nodes, control plane, Services, DNS",
          "Cluster architecture 25%: kubeadm, upgrades, etcd, RBAC, Helm, Kustomize, CRDs",
          "Services and networking 20%: Services, Ingress, Gateway API, NetworkPolicies, CoreDNS",
          "Workloads and scheduling 15%: Deployments, ConfigMaps, autoscaling, affinity, taints",
          "Storage 10%: StorageClasses, PVs, PVCs, access modes, reclaim policies",
        ],
      },
      {
        heading: "Which documentation you may open",
        body: "You may use kubernetes.io/docs and kubernetes.io/blog, plus a short list of other project docs that the Linux Foundation publishes in the exam handbook, such as the Helm docs. The list changes now and then, so read the current handbook a week before your exam.\n\nOnly one browser tab of allowed content at a time is the safe habit. Clicking a link that leaves the allowed sites can be treated as a rule break, so search inside the docs site rather than using a general search engine.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Multiple-choice exam vs the CKA",
        columns: [
          { title: "Typical multiple-choice exam", points: ["Pick one of four answers", "Tests recall of facts", "No docs allowed", "Score known per question"] },
          { title: "CKA performance exam", points: ["Change a live cluster", "Tests doing, not recalling", "Kubernetes docs allowed", "Partial credit per task", "Wrong cluster means zero"] },
        ],
      },
      {
        type: "sequence",
        title: "Life of one exam task",
        actors: ["You", "Terminal", "Cluster", "Grader"],
        messages: [
          { from: 0, to: 1, label: "Paste the context or ssh command" },
          { from: 0, to: 1, label: "Create or fix objects" },
          { from: 1, to: 2, label: "kubectl apply, edit, systemctl" },
          { from: 0, to: 2, label: "Verify with get and describe" },
          { from: 3, to: 2, label: "After the exam: check final state" },
          { from: 3, to: 0, label: "Points per passed check" },
        ],
      },
    ],
    examples: [
      {
        title: "Turning task weights into a time budget",
        explanation: "The exam lasts 120 minutes and the weights add up to 100 percent, so each percent is worth about 1.2 minutes. Step 1: read the weight shown on each task. Step 2: multiply by 1.2. A 4 percent task deserves about 5 minutes; a 12 percent task about 14 minutes. Step 3: if a task runs well past its budget, flag it and move on. Coming back later with fresh eyes is cheaper than losing three easy tasks at the end.",
      },
      {
        title: "Reading a task like a checklist",
        explanation: "Take this task: \"Use context k8s-c2. In namespace finance create a Deployment named ledger with image nginx:1.27 and 2 replicas. Write the Pod names to /opt/answers/ledger.txt.\" Step 1: switch context. Step 2: create the object with the exact names. Step 3: write the file. Step 4: verify both. Each sentence in the task is a separate check the grader will run.",
        code: {
          lang: "bash",
          code: "kubectl config use-context k8s-c2\nk -n finance create deployment ledger --image=nginx:1.27 --replicas=2\nk -n finance get pods -l app=ledger -o name > /opt/answers/ledger.txt\nk -n finance get deploy ledger\ncat /opt/answers/ledger.txt",
        },
      },
    ],
    cheatSheet: [
      "2 hours, about 15 to 20 hands-on tasks, 66 percent to pass",
      "Weights: Troubleshooting 30, Architecture 25, Networking 20, Workloads 15, Storage 10",
      "Run the task's context or ssh command first, every single time",
      "Terminal copy and paste: Ctrl+Shift+C and Ctrl+Shift+V",
      "Fee includes one free retake and two killer.sh simulator sessions",
      "Certification is valid for 2 years",
      "Budget roughly 1.2 minutes per percent of task weight",
    ],
    quiz: [
      {
        q: "You solve a task perfectly but forget to switch context first. What score do you get for it?",
        options: ["Full marks, because the commands were correct", "Zero, because the grader checks the intended cluster", "Half marks", "The proctor fixes it for you"],
        answer: 1,
        why: "Grading checks the state of the cluster named in the task, so work done elsewhere does not count.",
      },
      {
        q: "Which domain carries the most weight on the CKA?",
        options: ["Storage", "Workloads and scheduling", "Services and networking", "Troubleshooting"],
        answer: 3,
        why: "Troubleshooting is worth 30 percent, more than any other domain.",
      },
      {
        q: "How do you paste text into the exam terminal?",
        options: ["Ctrl+Shift+V", "Ctrl+V", "Cmd+V only", "Pasting is disabled"],
        answer: 0,
        why: "Linux terminals use Ctrl+Shift+V because Ctrl+V means something else to the shell.",
      },
      {
        q: "A task is worth 4 percent and you have spent 15 minutes on it. What is the best move?",
        options: ["Keep going until it works", "Restart the cluster", "Flag it and move to the next task", "Delete the namespace and start over"],
        answer: 2,
        why: "A 4 percent task deserves about 5 minutes, so skipping protects time for higher-value tasks.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find the current CKA curriculum on GitHub (cncf/curriculum) and write each domain with its weight on one line.",
        hint: "The repository has a PDF per exam version; open the latest CKA one.",
        solution: "Troubleshooting 30%\nCluster Architecture, Installation and Configuration 25%\nServices and Networking 20%\nWorkloads and Scheduling 15%\nStorage 10%",
      },
      {
        level: "medium",
        task: "Write a time budget for a mock exam with tasks weighted 4, 4, 5, 6, 7, 7, 8, 8, 10, 12, 13 and 16 percent.",
        hint: "Multiply each weight by 1.2 minutes and leave a buffer at the end.",
        solution: "4% -> 5 min, 5% -> 6 min, 6% -> 7 min, 7% -> 8 min,\n8% -> 10 min, 10% -> 12 min, 12% -> 14 min, 13% -> 16 min, 16% -> 19 min.\nTotal is about 120 min, so aim to finish each task slightly under budget\nand keep 10 minutes for flagged tasks.",
      },
      {
        level: "hard",
        task: "Set up a practice terminal that mimics the exam: small window, only kubernetes.io open, alias k and completion, then complete 3 tasks without using any other website.",
        hint: "Completion for the alias needs one extra line after sourcing kubectl completion.",
        solution: "cat >> ~/.bashrc <<'EOF'\nalias k=kubectl\nsource <(kubectl completion bash)\ncomplete -o default -F __start_kubectl k\nEOF\nsource ~/.bashrc\n# Resize the terminal to about 100x30 and keep one Firefox window\n# on kubernetes.io/docs. Time yourself on 3 tasks from your notes.",
      },
    ],
    faq: [
      { q: "Is the CKA open book?", a: "Partly. You may use the Kubernetes docs and blog plus a few listed project sites, but nothing else, and there is little time to read." },
      { q: "How hard is the CKA for a beginner?", a: "It is very doable with about two months of steady hands-on practice. Most people who fail run out of time, not knowledge, so drill speed." },
      { q: "Which Kubernetes version is the exam on?", a: "The exam tracks a recent minor version and is updated a few weeks after each Kubernetes release. The current version is listed on the Linux Foundation exam page." },
    ],
  },
  "cka-prereqs/linux-containers": {
    plain: [
      "Every Kubernetes node is just a Linux machine. On it, a program called systemd starts background services when the machine boots. Two of those services matter most: the kubelet, which is the Kubernetes agent on the node, and the container runtime, usually containerd, which actually runs containers.",
      "Picture a restaurant kitchen. The kubelet is the head chef reading orders from the API server. containerd is the cook who actually makes each dish. systemd is the manager who makes sure both show up for work and restarts them if they walk out.",
      "When kubectl stops working, you go to the node itself. systemctl tells you if a service is running, journalctl shows its logs, and crictl lists and inspects containers directly through the runtime. These three tools let you fix a cluster that cannot fix itself.",
    ],
    deepDive: [
      {
        heading: "From kubelet to a running process",
        body: "When a Pod is assigned to a node, the kubelet calls the runtime through the Container Runtime Interface (CRI), a standard gRPC API. First it asks for a Pod sandbox: a small pause container that owns the Pod's network namespace, so every container in the Pod shares one IP. Then it asks the runtime to pull images and create each container inside that sandbox.\n\ncontainerd does not start processes itself. It hands the job to a low-level runtime called runc, which uses Linux kernel features: namespaces to give the process its own view of the system, and cgroups (control groups) to limit its CPU and memory. A container is really just a normal Linux process with these walls around it.",
        bullets: ["CRI: the API between kubelet and runtime", "Pause container: holds the Pod's shared network", "runc: creates the actual process", "Namespaces isolate; cgroups limit"],
      },
      {
        heading: "systemd units and drop-in files",
        body: "systemd describes each service in a unit file. The kubelet unit on kubeadm nodes is small, and most of its settings come from a drop-in file such as /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf, which adds flags and points to /var/lib/kubelet/config.yaml.\n\nAfter changing any unit or drop-in, run systemctl daemon-reload so systemd reads the new files, then restart the service. systemctl enable makes a service start at boot; forgetting it means a fixed node breaks again after a reboot. systemctl cat kubelet prints the unit plus all its drop-ins in one view.",
        bullets: ["systemctl status kubelet: running or failed, plus last log lines", "systemctl cat kubelet: show unit and drop-ins", "systemctl enable --now kubelet: start now and at boot"],
        visual: {
          type: "flow",
          title: "Changing kubelet settings safely",
          steps: [
            { label: "Edit unit or drop-in", detail: "e.g. 10-kubeadm.conf" },
            { label: "systemctl daemon-reload", detail: "systemd rereads unit files" },
            { label: "systemctl restart kubelet", detail: "Apply the change" },
            { label: "systemctl enable kubelet", detail: "Also start at boot" },
            { label: "Check", detail: "systemctl status, journalctl -u kubelet" },
          ],
        },
      },
      {
        heading: "Reading logs with journalctl",
        body: "systemd collects service output in the journal. journalctl -u kubelet shows the kubelet's log from the start, which is usually far too long. Add -n 50 for the last 50 lines, -f to follow live output, --since \"10 min ago\" to narrow the time, and --no-pager to print straight to the terminal.\n\nThe first error after a restart is usually the real cause. Look for lines with \"failed\", \"error\" or \"unable to\", such as a missing certificate file or a bad flag. Later lines often just repeat the same failure every few seconds.",
      },
      {
        heading: "Using crictl well",
        body: "crictl talks to the runtime's CRI socket, so it works even when the API server is down. It finds the socket from /etc/crictl.yaml, which usually says runtime-endpoint: unix:///run/containerd/containerd.sock.\n\ncrictl ps -a lists all containers, including ones that exited, which is how you spot a crashing kube-apiserver. crictl logs ID shows a container's output. crictl pods lists sandboxes, crictl inspect ID shows full details, and crictl images lists pulled images. These look like Docker commands, but they only see Kubernetes-managed containers.",
        bullets: ["crictl ps -a | grep kube-apiserver", "crictl logs CONTAINER_ID", "crictl pods --name etcd"],
        visual: {
          type: "compare",
          title: "kubectl vs crictl",
          columns: [
            { title: "kubectl", points: ["Talks to the API server", "Fails if the API server is down", "Sees objects across the cluster"] },
            { title: "crictl", points: ["Talks to the node's CRI socket", "Works when the API server is down", "Sees only that node's containers"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "How a Pod's container gets started",
        actors: ["kubelet", "containerd", "runc", "Linux kernel"],
        messages: [
          { from: 0, to: 1, label: "RunPodSandbox (CRI)" },
          { from: 1, to: 2, label: "Start pause container" },
          { from: 0, to: 1, label: "PullImage, CreateContainer" },
          { from: 1, to: 2, label: "Create app process" },
          { from: 2, to: 3, label: "Set up namespaces and cgroups" },
          { from: 0, to: 1, label: "ContainerStatus (every few seconds)" },
        ],
      },
    ],
    examples: [
      {
        title: "A node is NotReady after a reboot",
        explanation: "kubectl get nodes shows worker1 NotReady. Step 1: ssh to worker1 and run systemctl status kubelet; it says inactive (dead). Step 2: the service was never enabled, so it did not start at boot. Step 3: enable and start it. Step 4: back on the control plane, the node turns Ready within a minute.",
        code: {
          lang: "bash",
          code: "ssh worker1\nsudo systemctl status kubelet      # Active: inactive (dead)\nsudo systemctl enable --now kubelet\nsudo journalctl -u kubelet -n 20 --no-pager\nexit\nkubectl get nodes -w",
        },
      },
      {
        title: "Finding why the API server keeps dying",
        explanation: "kubectl returns \"connection refused\". Step 1: ssh to the control plane and list all containers, including exited ones. Step 2: the kube-apiserver container shows Exited and a high attempt count. Step 3: read its logs. Step 4: the log names a wrong flag, which you then fix in the static Pod manifest.",
        code: {
          lang: "bash",
          code: "sudo crictl ps -a | grep kube-apiserver\n# 3f2a... Exited  kube-apiserver  attempt 7\nsudo crictl logs 3f2a\n# Error: unknown flag: --etcd-servrs\nsudo vi /etc/kubernetes/manifests/kube-apiserver.yaml",
        },
      },
    ],
    cheatSheet: [
      "systemctl status|restart|enable --now kubelet",
      "systemctl daemon-reload after editing any unit or drop-in file",
      "journalctl -u kubelet -n 50 --no-pager shows recent kubelet logs",
      "crictl ps -a lists all containers, including exited ones",
      "crictl logs ID works even when the API server is down",
      "Runtime socket: unix:///run/containerd/containerd.sock (set in /etc/crictl.yaml)",
      "containerd cgroup setting: SystemdCgroup = true in /etc/containerd/config.toml",
    ],
    quiz: [
      {
        q: "You edited a kubelet systemd drop-in file. What must you run before restarting the kubelet?",
        options: ["kubectl apply -f", "systemctl daemon-reload", "crictl rmi --prune", "kubeadm reset"],
        answer: 1,
        why: "systemd only rereads unit files after daemon-reload.",
      },
      {
        q: "Which tool can list control plane containers when the API server is down?",
        options: ["kubectl get pods", "kubectl logs", "crictl ps -a", "helm list"],
        answer: 2,
        why: "crictl talks directly to the container runtime, not to the API server.",
      },
      {
        q: "What does the pause container in every Pod do?",
        options: ["Holds the Pod's shared network namespace", "Pauses the Pod during upgrades", "Collects logs", "Runs liveness probes"],
        answer: 0,
        why: "The sandbox container owns the network namespace that all containers in the Pod join.",
      },
      {
        q: "Which kernel feature limits how much memory a container may use?",
        options: ["Namespaces", "systemd units", "iptables", "cgroups"],
        answer: 3,
        why: "Control groups enforce CPU and memory limits; namespaces only isolate what a process can see.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "On a node, show whether containerd and kubelet are running and enabled at boot.",
        hint: "systemctl has commands that print just one word.",
        solution: "systemctl is-active containerd kubelet\nsystemctl is-enabled containerd kubelet",
      },
      {
        level: "medium",
        task: "Print only the kubelet log lines from the last 15 minutes that contain the word error, ignoring case.",
        hint: "Combine journalctl time filters with grep.",
        solution: "sudo journalctl -u kubelet --since \"15 min ago\" --no-pager | grep -i error",
      },
      {
        level: "hard",
        task: "Find the etcd container on a control plane node with crictl, print its last 20 log lines, and show which host directory it uses for data.",
        hint: "crictl inspect prints JSON that includes mounts; the data directory is a hostPath.",
        solution: "ID=$(sudo crictl ps --name etcd -q)\nsudo crictl logs --tail 20 $ID\nsudo crictl inspect $ID | grep -A2 '\"hostPath\"'\n# or read it from the manifest:\ngrep -A3 hostPath /etc/kubernetes/manifests/etcd.yaml",
      },
    ],
    faq: [
      { q: "Can I still use Docker with Kubernetes?", a: "Images built with Docker run fine anywhere. But the kubelet no longer talks to Docker Engine directly since 1.24; clusters use containerd or CRI-O, or Docker via the separate cri-dockerd adapter." },
      { q: "Why does crictl show different containers from docker ps?", a: "crictl only sees containers in the CRI runtime's Kubernetes namespace. Docker, if installed, keeps its own separate list." },
      { q: "Why must kubelet and containerd use the same cgroup driver?", a: "If one uses systemd and the other cgroupfs, two managers fight over the same resources and the node becomes unstable. On modern systems both should use systemd." },
    ],
  },
  "cka-prereqs/kubectl-speed": {
    plain: [
      "On the CKA you type a lot of kubectl. Writing YAML from scratch is slow and easy to get wrong, so experts let kubectl write the first draft. Imperative commands like kubectl create deployment build an object in one line, and the dry-run flag turns that line into YAML you can edit.",
      "It is like using a form letter instead of a blank page. You fill in the name and image on the command line, get a correct skeleton, then add the two or three fields the task wants. Less typing means fewer indentation mistakes.",
      "A handful of habits make you fast: a short alias, shell completion, a variable for the dry-run flags, and a vim setup that uses spaces instead of tabs. Together they can save twenty minutes over a whole exam.",
    ],
    deepDive: [
      {
        heading: "The commands that cover most tasks",
        body: "kubectl run makes a single Pod, and kubectl create makes almost everything else: deployment, service, configmap, secret, serviceaccount, role, rolebinding, clusterrole, job, cronjob, ingress, quota and priorityclass. kubectl expose builds a Service from an existing Deployment or Pod, reusing its labels as the selector.\n\nFor changes, kubectl set image, set env and set resources edit a Deployment's template without opening an editor. kubectl scale changes replicas, and kubectl label and annotate add metadata. Each of these is one line, and each one is faster and safer than editing YAML by hand.",
        bullets: ["k run tmp --image=busybox:1.36 --rm -it --restart=Never -- sh", "k create cronjob c --image=busybox:1.36 --schedule=\"*/5 * * * *\" -- date", "k set resources deploy web --requests=cpu=100m,memory=64Mi"],
      },
      {
        heading: "Dry-run and the edit loop",
        body: "--dry-run=client asks kubectl to build the object locally without sending it, and -o yaml prints it. Redirect that into a file, open it in vim, add what the command line cannot express (volumes, probes, affinity), then kubectl apply -f.\n\nMany people store the flags in a variable: export do=\"--dry-run=client -o yaml\". Then k create deploy web --image=nginx $do > web.yaml is short and hard to mistype. --dry-run=server is different: it sends the object to the API server for full validation but still does not save it, which is handy for catching admission errors.",
        visual: {
          type: "compare",
          title: "Client vs server dry-run",
          columns: [
            { title: "--dry-run=client", points: ["Object built by kubectl locally", "Nothing sent to the API server", "Fast way to generate YAML"] },
            { title: "--dry-run=server", points: ["Sent to the API server", "Full validation and admission checks", "Still not saved"] },
          ],
        },
      },
      {
        heading: "Changing fields that cannot be edited",
        body: "Some fields are immutable on a running Pod, such as most of the container spec. kubectl edit then refuses to save and writes your version to a file in /tmp. The fastest fix is kubectl replace --force -f that file, which deletes the old Pod and creates the new one in one step.\n\nTo delete Pods fast in drills, add --force --grace-period=0 so kubectl does not wait the default 30 seconds. Use it only on Pods you do not care about, because the app gets no time to shut down cleanly.",
        visual: {
          type: "flow",
          title: "Fixing an immutable Pod field",
          steps: [
            { label: "kubectl edit pod", detail: "Change a container field" },
            { label: "Save is refused", detail: "Field cannot change on a running Pod" },
            { label: "Copy kept in /tmp", detail: "kubectl prints the file path" },
            { label: "kubectl replace --force -f", detail: "Deletes the old Pod, creates the new one" },
          ],
        },
      },
      {
        heading: "Getting just the data you need",
        body: "Tasks often ask you to write information to a file. -o wide adds node and IP columns. -o jsonpath picks fields, for example the image of every Pod. --sort-by sorts by any field, and custom-columns builds a neat table. -l filters by label and --field-selector filters by fields such as status.phase.\n\nkubectl explain is your offline field reference: kubectl explain deploy.spec.strategy describes one field, and adding --recursive prints the whole tree under it.",
        bullets: ["-o jsonpath='{.items[*].spec.containers[*].image}'", "--sort-by=.metadata.creationTimestamp", "-o custom-columns=NAME:.metadata.name,NODE:.spec.nodeName"],
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Which kubectl verb for which job",
        root: "kubectl",
        children: [
          { label: "Create", children: ["run (Pod)", "create (most kinds)", "expose (Service)", "apply -f (from YAML)"] },
          { label: "Change", children: ["set image/env/resources", "scale", "label, annotate", "edit, replace --force"] },
          { label: "Read", children: ["get -o wide/yaml/jsonpath", "describe", "logs", "explain"] },
          { label: "Remove", children: ["delete", "delete --force --grace-period=0"] },
        ],
      },
    ],
    examples: [
      {
        title: "A Pod with a volume in under a minute",
        explanation: "Task: create Pod cache with image redis:7 that mounts an emptyDir at /data. Step 1: generate the skeleton with kubectl run and dry-run. Step 2: open it and add volumeMounts under the container and volumes under spec. Step 3: apply and check the mount.",
        code: {
          lang: "bash",
          code: "export do=\"--dry-run=client -o yaml\"\nk run cache --image=redis:7 $do > cache.yaml\nvi cache.yaml\n#   containers[0]: volumeMounts: [{name: data, mountPath: /data}]\n#   spec:          volumes: [{name: data, emptyDir: {}}]\nk apply -f cache.yaml\nk exec cache -- df -h /data",
        },
      },
      {
        title: "Writing sorted data to a file",
        explanation: "Task: write the names of all Pods in namespace web, oldest first, to /opt/pods.txt. Step 1: sort by creation time. Step 2: print only names using custom-columns with no header. Step 3: check the file.",
        code: {
          lang: "bash",
          code: "k -n web get pods --sort-by=.metadata.creationTimestamp \\\n  -o custom-columns=NAME:.metadata.name --no-headers > /opt/pods.txt\ncat /opt/pods.txt",
        },
      },
    ],
    cheatSheet: [
      "export do=\"--dry-run=client -o yaml\"  then  k create deploy x --image=nginx $do > x.yaml",
      "export now=\"--force --grace-period=0\" for instant Pod deletes in practice",
      "k replace --force -f /tmp/kubectl-edit-xxxx.yaml when edit refuses a change",
      "k explain pod.spec --recursive | less to browse every field",
      "vim: set expandtab tabstop=2 shiftwidth=2 in ~/.vimrc",
      "k get pods -A -o wide shows node and IP for every Pod",
      "--dry-run=server validates on the API server without saving",
    ],
    quiz: [
      {
        q: "Which command prints Deployment YAML without creating anything?",
        options: ["k create deploy web --image=nginx --dry-run=client -o yaml", "k get deploy web -o yaml", "k apply deploy web --image=nginx", "k explain deploy web"],
        answer: 0,
        why: "Client-side dry-run builds the object locally and -o yaml prints it.",
      },
      {
        q: "kubectl edit refuses to save a change to a running Pod's container. What is the quickest fix?",
        options: ["Restart the kubelet", "Delete the namespace", "kubectl replace --force -f with the saved temp file", "kubectl scale --replicas=0"],
        answer: 2,
        why: "replace --force deletes and recreates the Pod using the file kubectl saved for you.",
      },
      {
        q: "What creates a ClusterIP Service for an existing Deployment named api on port 80 forwarding to 8080?",
        options: ["k create service api --port=80", "k expose deploy api --port=80 --target-port=8080", "k run api --port=80", "k set service api 80:8080"],
        answer: 1,
        why: "expose copies the Deployment's selector and sets port and targetPort.",
      },
      {
        q: "What does --dry-run=server add over --dry-run=client?",
        options: ["It saves the object", "It skips validation", "It works offline", "It runs full API server validation and admission without saving"],
        answer: 3,
        why: "Server dry-run sends the request through validation and admission but does not persist it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a Pod named web with image nginx:1.27 and label tier=front using a single command.",
        hint: "kubectl run accepts --labels.",
        solution: "k run web --image=nginx:1.27 --labels=tier=front\nk get pod web --show-labels",
      },
      {
        level: "medium",
        task: "Generate a CronJob named backup that runs busybox:1.36 with the command \"echo done\" every 15 minutes, save it to backup.yaml, and add successfulJobsHistoryLimit: 2 before applying.",
        hint: "Everything after -- becomes the container command.",
        solution: "k create cronjob backup --image=busybox:1.36 --schedule=\"*/15 * * * *\" \\\n  --dry-run=client -o yaml -- echo done > backup.yaml\n# in vi, under spec: add  successfulJobsHistoryLimit: 2\nk apply -f backup.yaml\nk get cronjob backup -o jsonpath='{.spec.successfulJobsHistoryLimit}'",
      },
      {
        level: "hard",
        task: "Print a table of every Pod in the cluster with columns NAMESPACE, NAME, NODE and the first container's image, sorted by node.",
        hint: "custom-columns supports array indexes like containers[0].",
        solution: "k get pods -A --sort-by=.spec.nodeName -o custom-columns=\\\nNAMESPACE:.metadata.namespace,NAME:.metadata.name,\\\nNODE:.spec.nodeName,IMAGE:.spec.containers[0].image",
      },
    ],
    faq: [
      { q: "Should I memorise YAML for every resource?", a: "No. Memorise which kubectl command generates each skeleton and where the docs example lives. Then you only add a few fields by hand." },
      { q: "Is the alias k already set up in the exam?", a: "Yes, the exam terminal has the k alias and kubectl completion ready. Practise with the same setup so it feels familiar." },
      { q: "What is the difference between apply and create -f?", a: "create fails if the object already exists. apply creates it or updates it to match the file, so it is safer to rerun." },
    ],
  },
  "cka-prereqs/lab-cluster": {
    plain: [
      "You cannot learn Kubernetes administration from reading alone. You need clusters you are allowed to break. The good news is that practice clusters are free: kind runs a whole cluster inside Docker containers on your laptop, and a few small virtual machines (VMs) can host a real kubeadm cluster.",
      "Think of kind as a flight simulator and the VMs as a real training plane. The simulator starts in seconds and is perfect for practising routine moves. The training plane is slower to prepare, but it is the only place to practise engine trouble: broken kubelets, upgrades and etcd restores.",
      "The secret to fast practice is fast reset. If rebuilding takes an hour you will avoid risky drills. Keep a config file for kind and a VM snapshot or script for kubeadm, so a broken cluster is a two-minute problem, not an evening lost.",
    ],
    deepDive: [
      {
        heading: "Multi-node kind clusters",
        body: "kind (Kubernetes IN Docker) starts each node as a Docker container that runs systemd, containerd and the kubelet inside it. A small YAML config lists the nodes and their roles. kind create cluster --config kind.yaml builds it, and kind delete cluster removes it.\n\nYou can pick the Kubernetes version with --image kindest/node:vX.Y.Z, which is useful to match the exam version. kind's default CNI does not enforce NetworkPolicies, so for policy drills set disableDefaultCNI: true in the config and install Calico or Cilium yourself.",
        bullets: ["One control-plane and two workers is enough for most drills", "docker exec -it kind-worker bash gets you onto a node", "Set disableDefaultCNI to practise CNI installs and NetworkPolicies"],
        visual: {
          type: "layers",
          title: "Inside a kind cluster",
          layers: [
            { label: "Your machine" },
            { label: "Docker", detail: "Runs one container per node" },
            { label: "Node containers", detail: "kind-control-plane, kind-worker, kind-worker2" },
            { label: "Inside each node", detail: "systemd, containerd, kubelet" },
            { label: "Your Pods" },
          ],
        },
      },
      {
        heading: "VMs for a kubeadm cluster",
        body: "For real nodes, create two or three Ubuntu VMs with a tool like Multipass, Vagrant or any hypervisor. kubeadm wants at least 2 CPUs and 2 GB of RAM on the control plane, unique hostnames and MAC addresses, and network access between nodes.\n\nGive the VMs fixed IP addresses so certificates and join commands stay valid after reboots. Make sure the Pod network range you will use (for example 192.168.0.0/16 for Calico, or 10.244.0.0/16) does not overlap the VM network, or routing will break in confusing ways.",
      },
      {
        heading: "Resetting quickly",
        body: "kubeadm reset undoes what init or join did on a node: it stops static Pods, removes /etc/kubernetes files and clears etcd data on a control plane. It does not clean everything. You should also delete /etc/cni/net.d, flush iptables or IPVS rules if needed, and remove ~/.kube/config.\n\nThe fastest option of all is a VM snapshot taken after packages are installed but before kubeadm init. Restoring that snapshot gives you clean nodes ready for a fresh install drill in seconds.",
        bullets: ["sudo kubeadm reset -f", "sudo rm -rf /etc/cni/net.d $HOME/.kube/config", "Snapshot name idea: pre-init-v1.34"],
        visual: {
          type: "flow",
          title: "Back to clean nodes",
          steps: [
            { label: "sudo kubeadm reset -f", detail: "Stops static Pods, removes /etc/kubernetes" },
            { label: "Remove CNI config", detail: "rm -rf /etc/cni/net.d" },
            { label: "Flush rules if needed", detail: "iptables or IPVS" },
            { label: "Remove ~/.kube/config" },
            { label: "Or restore a snapshot", detail: "Taken before kubeadm init: fastest" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "The practice loop that builds skill",
        steps: [
          { label: "Build", detail: "kind config or VM snapshot" },
          { label: "Break", detail: "Stop kubelet, edit a manifest, delete a CNI" },
          { label: "Fix", detail: "Use only kubectl, systemctl, crictl, docs" },
          { label: "Reset", detail: "kind delete or snapshot restore" },
        ],
      },
    ],
    examples: [
      {
        title: "A three-node kind cluster ready for NetworkPolicy drills",
        explanation: "Step 1: write a config with one control plane, two workers and the default CNI disabled. Step 2: create the cluster. Step 3: install Calico so nodes become Ready and policies are enforced. Step 4: confirm all nodes are Ready.",
        code: {
          lang: "yaml",
          code: "# kind.yaml\nkind: Cluster\napiVersion: kind.x-k8s.io/v1alpha4\nnetworking:\n  disableDefaultCNI: true\n  podSubnet: 192.168.0.0/16\nnodes:\n- role: control-plane\n- role: worker\n- role: worker\n# kind create cluster --config kind.yaml\n# then apply the Calico manifest from its docs\n# kubectl get nodes",
        },
      },
      {
        title: "Planning a VM lab without overlaps",
        explanation: "Say your VMs get 10.0.0.10, 10.0.0.11 and 10.0.0.12. Step 1: keep the default Service range 10.96.0.0/12; it does not touch 10.0.0.0/24. Step 2: choose a Pod CIDR like 10.244.0.0/16 for Flannel or 192.168.0.0/16 for Calico. Step 3: pass it to kubeadm init with --pod-network-cidr. Step 4: snapshot the VMs before init so you can repeat the install as often as you want.",
      },
    ],
    cheatSheet: [
      "kind create cluster --name lab --config kind.yaml",
      "kind delete cluster --name lab",
      "kind create cluster --image kindest/node:v1.34.0 pins the Kubernetes version",
      "docker exec -it lab-worker bash opens a shell on a kind node",
      "kubeadm needs 2 CPU and 2 GB RAM on the control plane",
      "kubeadm reset -f, then remove /etc/cni/net.d and ~/.kube/config",
      "Pod CIDR must not overlap node or Service networks",
    ],
    quiz: [
      {
        q: "You want to practise restoring etcd and fixing a stopped kubelet. Which lab fits best?",
        options: ["A kubeadm cluster on VMs", "A kind cluster", "A managed cloud cluster", "Minikube with Docker driver only"],
        answer: 0,
        why: "Real nodes with systemd and static Pods match the exam's architecture and troubleshooting tasks.",
      },
      {
        q: "NetworkPolicies have no effect in your default kind cluster. Why?",
        options: ["kind does not support namespaces", "Policies need a LoadBalancer", "kind's default CNI does not enforce NetworkPolicies", "You must restart the API server"],
        answer: 2,
        why: "Enforcement is done by the CNI plugin, so install Calico or Cilium with the default CNI disabled.",
      },
      {
        q: "What does kubeadm reset NOT clean up for you?",
        options: ["Static Pod manifests", "Local etcd data", "Certificates in /etc/kubernetes/pki", "CNI configuration in /etc/cni/net.d"],
        answer: 3,
        why: "kubeadm reset leaves CNI config and iptables rules, which you remove yourself.",
      },
      {
        q: "Why give lab VMs fixed IP addresses?",
        options: ["kubeadm refuses DHCP", "Certificates and the API endpoint are tied to the IP used at init", "It makes Pods start faster", "kind requires it"],
        answer: 1,
        why: "If the control plane IP changes, certificates and kubeconfigs point to the wrong address.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a kind cluster named lab with one control plane and two workers, then list the nodes.",
        hint: "Use a config file with a nodes list.",
        solution: "cat > kind.yaml <<'EOF'\nkind: Cluster\napiVersion: kind.x-k8s.io/v1alpha4\nnodes:\n- role: control-plane\n- role: worker\n- role: worker\nEOF\nkind create cluster --name lab --config kind.yaml\nkubectl get nodes",
      },
      {
        level: "medium",
        task: "In your kind cluster, stop the kubelet on one worker and watch the node become NotReady, then fix it.",
        hint: "kind nodes are containers that run systemd.",
        solution: "docker exec lab-worker systemctl stop kubelet\nkubectl get nodes -w     # NotReady after about 40 seconds\ndocker exec lab-worker systemctl start kubelet\nkubectl get nodes",
      },
      {
        level: "hard",
        task: "Write a reset script for a kubeadm VM node that leaves it ready for a fresh kubeadm init or join.",
        hint: "Think about what kubeadm reset leaves behind.",
        solution: "#!/bin/bash\nset -e\nsudo kubeadm reset -f\nsudo rm -rf /etc/cni/net.d $HOME/.kube\nsudo iptables -F && sudo iptables -t nat -F && sudo iptables -X\nsudo ipvsadm --clear 2>/dev/null || true\nsudo systemctl restart containerd\necho \"Node reset. Ready for kubeadm init or join.\"",
      },
    ],
    faq: [
      { q: "Can I prepare for the CKA with only minikube or kind?", a: "You can cover most workload and networking tasks, but you also need real nodes for kubeadm install, upgrade, etcd and kubelet troubleshooting." },
      { q: "How much computer do I need for a VM lab?", a: "About 8 GB of free RAM runs a control plane and two small workers. Cloud VMs for a few hours are a fine alternative." },
      { q: "Which Kubernetes version should my lab use?", a: "Use the version the exam currently uses, and one minor version older so you can practise upgrades." },
    ],
  },
  "cka-architecture/components": {
    plain: [
      "A Kubernetes cluster has a brain and a body. The brain is the control plane: it stores what you asked for and decides what should happen. The body is the worker nodes: they run your containers. The two talk only through one front door, the API server.",
      "Picture a busy office with one reception desk. Every request, from you or from any internal team, goes through reception (the API server). Reception writes everything in one ledger (etcd). Teams like scheduling and maintenance keep checking the ledger for new work and act on it.",
      "This design means no component gives orders directly to another. Each one watches for changes it cares about and quietly does its own job. That is why Kubernetes heals itself: if reality drifts from the ledger, some component notices and fixes it.",
    ],
    deepDive: [
      {
        heading: "What happens inside one API request",
        body: "Every request to the API server passes the same checkpoints. Authentication works out who you are, from a client certificate, a token or another method. Authorization, usually RBAC, decides if that identity may perform this verb on this resource. Admission controllers then run: mutating ones may change the object (for example, adding a default StorageClass), and validating ones may reject it (for example, a ResourceQuota that would be exceeded).\n\nOnly after all checks pass does the API server write the object to etcd and send back a reply. A failure at each step gives a different error: 401 for authentication, 403 for authorization, and a descriptive admission error for policy problems.",
        bullets: ["401 Unauthorized: unknown identity", "403 Forbidden: RBAC said no", "Admission errors name the controller that refused"],
      },
      {
        heading: "Watches and controllers",
        body: "Components do not poll the API server over and over. They open a watch: a long-lived connection that streams every change to the resources they care about. The scheduler watches for Pods with no node. The kubelet watches for Pods assigned to its node. Each controller in kube-controller-manager watches its own kinds.\n\nA controller runs a reconcile loop: compare desired state with actual state, then act to close the gap. The ReplicaSet controller counts Pods and creates or deletes some. The Node controller marks nodes NotReady when they stop reporting. Because loops repeat forever, a missed event is fixed on the next pass.",
        visual: {
          type: "cycle",
          title: "ReplicaSet controller's reconcile loop",
          steps: [
            { label: "Watch", detail: "Stream of Pod and ReplicaSet changes" },
            { label: "Count", detail: "Pods matching the selector" },
            { label: "Compare", detail: "Actual count vs spec.replicas" },
            { label: "Act", detail: "Create or delete Pods to close the gap" },
          ],
        },
      },
      {
        heading: "Leader election and Leases",
        body: "In a cluster with several control plane nodes, you get several schedulers and controller managers. If all of them acted at once they would fight. So they elect a leader using a Lease object in kube-system. Only the leader works; the others wait and take over if the leader stops renewing its lease.\n\nNodes also use Leases: each kubelet renews a Lease in kube-node-lease every few seconds as a cheap heartbeat. You can see these with kubectl get lease -A.",
        visual: {
          type: "sequence",
          title: "Leader election with a Lease",
          actors: ["Scheduler A", "Lease in kube-system", "Scheduler B"],
          messages: [
            { from: 0, to: 1, label: "Acquire: A is leader" },
            { from: 2, to: 1, label: "Try: held by A, so wait" },
            { from: 0, to: 1, label: "Renew regularly" },
            { from: 2, to: 1, label: "A stopped renewing: take over" },
            { from: 1, to: 2, label: "B is now leader" },
          ],
        },
      },
      {
        heading: "Ports worth recognising",
        body: "Port numbers show up in manifests, firewall tasks and error messages, so it helps to know the defaults.",
        bullets: ["6443: kube-apiserver", "2379 and 2380: etcd clients and etcd peers", "10250: kubelet API (logs, exec)", "10257 and 10259: controller manager and scheduler", "30000 to 32767: NodePort range"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Inside one API request",
        steps: [
          { label: "Request", detail: "kubectl sends HTTPS to port 6443" },
          { label: "Authentication", detail: "Who is this? Cert or token" },
          { label: "Authorization", detail: "RBAC: may they do this?" },
          { label: "Mutating admission", detail: "Add defaults, inject fields" },
          { label: "Validating admission", detail: "Quotas, policies, schema" },
          { label: "Store in etcd", detail: "Then watchers are notified" },
        ],
      },
      {
        type: "tree",
        title: "How each component runs on a kubeadm cluster",
        root: "kubeadm cluster",
        children: [
          { label: "Static Pods (control plane)", children: ["kube-apiserver", "etcd", "kube-scheduler", "kube-controller-manager"] },
          { label: "systemd services (every node)", children: ["kubelet", "containerd"] },
          { label: "DaemonSets", children: ["kube-proxy", "CNI agent (Calico, Cilium)"] },
          { label: "Deployment", children: ["CoreDNS"] },
        ],
      },
    ],
    examples: [
      {
        title: "Spotting which component is missing",
        explanation: "You create a Deployment, but no Pods appear and no ReplicaSet exists. Step 1: the API server accepted the object, so it is up. Step 2: creating a ReplicaSet is the job of the Deployment controller inside kube-controller-manager. Step 3: check that Pod in kube-system. If ReplicaSets exist but Pods stay Pending with no events, suspect the scheduler instead.",
        code: {
          lang: "bash",
          code: "k create deploy demo --image=nginx\nk get rs -l app=demo                     # nothing\nk -n kube-system get pods | grep controller-manager\nk -n kube-system logs kube-controller-manager-cp1 --tail=20",
        },
      },
      {
        title: "Reading the static Pod manifest of the API server",
        explanation: "Step 1: on the control plane, list /etc/kubernetes/manifests. Step 2: grep the API server manifest for the flags you care about, such as the etcd address and the Service IP range. This is how you answer questions like \"what is the cluster's Service CIDR\" without guessing.",
        code: {
          lang: "bash",
          code: "ls /etc/kubernetes/manifests\n# etcd.yaml kube-apiserver.yaml kube-controller-manager.yaml kube-scheduler.yaml\ngrep -E 'etcd-servers|service-cluster-ip-range' \\\n  /etc/kubernetes/manifests/kube-apiserver.yaml",
        },
      },
    ],
    cheatSheet: [
      "Only kube-apiserver talks to etcd; everything else talks to the API server",
      "Request order: authentication, authorization, admission, then etcd",
      "Scheduler down: new Pods Pending with no scheduling events",
      "Controller manager down: Deployments create no ReplicaSets or Pods",
      "k get lease -n kube-system shows scheduler and controller manager leaders",
      "Ports: 6443 API, 2379/2380 etcd, 10250 kubelet",
    ],
    quiz: [
      {
        q: "A request fails with 403 Forbidden. Which stage rejected it?",
        options: ["Authentication", "Authorization", "Mutating admission", "etcd"],
        answer: 1,
        why: "403 means the identity is known but lacks permission.",
      },
      {
        q: "Which component creates the ReplicaSet when you create a Deployment?",
        options: ["kube-scheduler", "kubelet", "kube-controller-manager", "kube-proxy"],
        answer: 2,
        why: "The Deployment controller runs inside kube-controller-manager.",
      },
      {
        q: "How do kubelets send a cheap heartbeat to the control plane?",
        options: ["By renewing a Lease in kube-node-lease", "By writing to etcd directly", "By pinging the scheduler", "Through kube-proxy"],
        answer: 0,
        why: "Each node renews its own Lease object every few seconds.",
      },
      {
        q: "On a kubeadm cluster, how does CoreDNS run?",
        options: ["As a static Pod", "As a systemd service", "Inside the API server", "As a Deployment in kube-system"],
        answer: 3,
        why: "kubeadm installs CoreDNS as a normal Deployment behind the kube-dns Service.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List every Pod in kube-system with the node it runs on, and say which ones are static Pods.",
        hint: "Static Pods have the node name appended to their name.",
        solution: "k -n kube-system get pods -o wide\n# kube-apiserver-cp1, etcd-cp1, kube-scheduler-cp1 and\n# kube-controller-manager-cp1 end with the node name: static Pods.",
      },
      {
        level: "medium",
        task: "Find out which control plane node currently holds the scheduler leader lease.",
        hint: "The Lease spec has a holderIdentity field.",
        solution: "k -n kube-system get lease kube-scheduler \\\n  -o jsonpath='{.spec.holderIdentity}{\"\\n\"}'",
      },
      {
        level: "hard",
        task: "Write the cluster's Service CIDR and Pod CIDR to /opt/cidrs.txt using only information on the control plane node.",
        hint: "The API server has the Service range; the controller manager has the cluster CIDR.",
        solution: "M=/etc/kubernetes/manifests\ngrep -h service-cluster-ip-range $M/kube-apiserver.yaml > /opt/cidrs.txt\ngrep -h cluster-cidr $M/kube-controller-manager.yaml >> /opt/cidrs.txt\ncat /opt/cidrs.txt",
      },
    ],
    faq: [
      { q: "Why is the kubelet not a Pod like the other components?", a: "The kubelet is what starts Pods, including static Pods, so it has to exist before any Pod can run. That is why systemd runs it." },
      { q: "What happens to running apps if the control plane goes down?", a: "Running containers keep running, because kubelets and runtimes work locally. But nothing new can be scheduled, scaled or healed until the control plane is back." },
      { q: "Can I talk to etcd directly to change objects?", a: "You should not. Always go through the API server so authentication, validation and watchers all work. etcdctl is for backup, restore and health checks." },
    ],
  },
  "cka-architecture/kubeadm-install": {
    plain: [
      "kubeadm is the official tool that turns a few prepared Linux machines into a Kubernetes cluster. It does not install packages or the container runtime for you. It creates certificates, writes the control plane manifests, and gives you a command for other nodes to join.",
      "Building a cluster is like opening a new branch office. First you prepare each building: power, plumbing and locks (runtime, kernel settings, packages). Then you set up headquarters (kubeadm init). Then each branch signs in with a one-day pass (kubeadm join). Finally you connect the phone lines between them (the CNI plugin).",
      "On the exam you may need to install or join a node with the docs open. Knowing the order of steps by heart, and why each step exists, means you only look up exact commands, never the plan.",
    ],
    deepDive: [
      {
        heading: "Preparing every node",
        body: "Kubernetes needs a few kernel settings. Load the overlay and br_netfilter modules, and set net.ipv4.ip_forward = 1 so the node can route Pod traffic. Turn swap off, or the kubelet will refuse to start with its default settings.\n\nInstall containerd and set SystemdCgroup = true in /etc/containerd/config.toml, so it uses the same cgroup driver as the kubelet. Then add the pkgs.k8s.io package repository for your exact minor version, install kubeadm, kubelet and kubectl, and hold them with apt-mark hold so a routine system update cannot upgrade them by accident.",
        bullets: ["modprobe overlay and br_netfilter", "sysctl net.ipv4.ip_forward=1", "swapoff -a and remove swap from /etc/fstab", "apt-mark hold kubelet kubeadm kubectl"],
      },
      {
        heading: "What kubeadm init actually does",
        body: "kubeadm init runs a series of phases. Preflight checks catch problems like swap or a busy port 6443. Then it creates a certificate authority and all certificates in /etc/kubernetes/pki, writes kubeconfig files (admin.conf, kubelet.conf and others), and writes static Pod manifests for etcd and the control plane to /etc/kubernetes/manifests.\n\nThe kubelet sees those manifests and starts the components. kubeadm then waits for the API server, taints the node so normal Pods avoid it, creates a bootstrap token and installs the CoreDNS and kube-proxy add-ons. At the end it prints the join command.",
        visual: {
          type: "flow",
          title: "Phases of kubeadm init",
          steps: [
            { label: "Preflight", detail: "Swap, ports like 6443, runtime" },
            { label: "Certificates", detail: "CA and certs in /etc/kubernetes/pki" },
            { label: "kubeconfig files", detail: "admin.conf, kubelet.conf and others" },
            { label: "Static Pod manifests", detail: "etcd and control plane; kubelet starts them" },
            { label: "Taint control plane", detail: "Normal Pods stay off" },
            { label: "Bootstrap token", detail: "For kubeadm join" },
            { label: "Add-ons", detail: "CoreDNS and kube-proxy" },
          ],
        },
      },
      {
        heading: "How joining works",
        body: "kubeadm join needs three things: the API server address, a bootstrap token, and a hash of the cluster CA certificate. The token proves the node is allowed to join. The CA hash lets the node verify it is talking to the real cluster and not an impostor.\n\nThe new kubelet then sends a certificate signing request, which is approved automatically, and gets its own client certificate. Tokens expire after 24 hours by default, so print a fresh command with kubeadm token create --print-join-command when you need one.",
      },
      {
        heading: "The CNI step and the Pod CIDR",
        body: "After init, the node is NotReady and CoreDNS is Pending. That is normal: there is no Pod network yet. Install a CNI plugin such as Calico, Cilium or Flannel by applying its manifest or Helm chart.\n\nThe --pod-network-cidr you gave kubeadm must match what the plugin expects, or must be configured in the plugin. Flannel defaults to 10.244.0.0/16, and Calico's sample manifests commonly use 192.168.0.0/16. A mismatch shows up as Pods that cannot reach each other across nodes.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A worker joining the cluster",
        actors: ["kubeadm join", "API server", "kubelet", "Controller manager"],
        messages: [
          { from: 0, to: 1, label: "Fetch cluster info with bootstrap token" },
          { from: 0, to: 2, label: "Write bootstrap kubeconfig, start kubelet" },
          { from: 2, to: 1, label: "Submit certificate signing request" },
          { from: 3, to: 1, label: "Auto-approve and sign the CSR" },
          { from: 2, to: 1, label: "Register Node object" },
          { from: 2, to: 1, label: "Report Ready once CNI is present" },
        ],
      },
    ],
    examples: [
      {
        title: "Bootstrapping the control plane",
        explanation: "Step 1: on the prepared control plane node, run kubeadm init with the Pod CIDR your CNI wants. Step 2: copy admin.conf so kubectl works for your user. Step 3: install the CNI. Step 4: wait until the node is Ready and CoreDNS is Running.",
        code: {
          lang: "bash",
          code: "sudo kubeadm init --pod-network-cidr=192.168.0.0/16 \\\n  --apiserver-advertise-address=10.0.0.10\nmkdir -p $HOME/.kube\nsudo cp /etc/kubernetes/admin.conf $HOME/.kube/config\nsudo chown $(id -u):$(id -g) $HOME/.kube/config\nkubectl apply -f calico.yaml     # manifest from the Calico docs\nkubectl get nodes -w",
        },
      },
      {
        title: "Joining a worker the next day",
        explanation: "The original token has expired. Step 1: on the control plane, print a fresh join command. Step 2: run it with sudo on the worker. Step 3: back on the control plane, watch the node appear and turn Ready once the CNI Pods start on it.",
        code: {
          lang: "bash",
          code: "kubeadm token create --print-join-command\n# kubeadm join 10.0.0.10:6443 --token abcdef.0123456789abcdef \\\n#   --discovery-token-ca-cert-hash sha256:5c1f...\nssh worker1 'sudo kubeadm join 10.0.0.10:6443 --token abcdef.0123456789abcdef \\\n  --discovery-token-ca-cert-hash sha256:5c1f...'\nkubectl get nodes -w",
        },
      },
    ],
    cheatSheet: [
      "Before init: modules overlay and br_netfilter, ip_forward=1, swap off, containerd with SystemdCgroup",
      "Repo per minor version: pkgs.k8s.io/core:/stable:/v1.34/deb/",
      "sudo apt-mark hold kubelet kubeadm kubectl",
      "kubeadm init --pod-network-cidr=CIDR --apiserver-advertise-address=IP",
      "kubeadm token create --print-join-command",
      "Certificates live in /etc/kubernetes/pki; manifests in /etc/kubernetes/manifests",
      "kubeadm config print init-defaults shows every init option",
    ],
    quiz: [
      {
        q: "kubeadm init fails preflight saying swap is on. What do you do?",
        options: ["Add more RAM", "Turn swap off with swapoff -a and remove it from /etc/fstab", "Ignore it with --force", "Install a CNI first"],
        answer: 1,
        why: "With default settings the kubelet will not run with swap enabled.",
      },
      {
        q: "What does the --discovery-token-ca-cert-hash flag protect against?",
        options: ["Expired tokens", "Joining with the wrong Kubernetes version", "Too many nodes", "Joining a fake control plane"],
        answer: 3,
        why: "The node checks the cluster CA against the hash before trusting it.",
      },
      {
        q: "Right after kubeadm init, CoreDNS Pods are Pending. What is the usual reason?",
        options: ["No CNI plugin is installed yet", "CoreDNS needs a LoadBalancer", "etcd is down", "The token expired"],
        answer: 0,
        why: "Without a Pod network the node is NotReady and normal Pods cannot start.",
      },
      {
        q: "Why hold the kubelet, kubeadm and kubectl packages?",
        options: ["To save disk space", "To make the install faster", "So routine apt upgrades cannot change cluster versions by surprise", "It is required by containerd"],
        answer: 2,
        why: "Kubernetes upgrades must follow a controlled order, not happen during system updates.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "On a node, check the three most common kubeadm preflight problems: swap, IP forwarding and the containerd service.",
        hint: "Each check is a one-line command.",
        solution: "swapon --show                       # should print nothing\nsysctl net.ipv4.ip_forward          # should be 1\nsystemctl is-active containerd      # should be active",
      },
      {
        level: "medium",
        task: "Write the sysctl and module config files that make the networking settings survive a reboot.",
        hint: "Use /etc/modules-load.d and /etc/sysctl.d, then reload.",
        solution: "cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf\noverlay\nbr_netfilter\nEOF\nsudo modprobe overlay && sudo modprobe br_netfilter\ncat <<EOF | sudo tee /etc/sysctl.d/k8s.conf\nnet.ipv4.ip_forward = 1\nnet.bridge.bridge-nf-call-iptables = 1\nEOF\nsudo sysctl --system",
      },
      {
        level: "hard",
        task: "Install a full cluster (one control plane, one worker) from memory, using the docs only for the package repository and CNI URLs. Time yourself.",
        hint: "Order: prepare both nodes, init, kubeconfig, CNI, join, verify.",
        solution: "# both nodes: modules, sysctl, swapoff, containerd (SystemdCgroup=true),\n#   pkgs.k8s.io repo, apt install kubelet kubeadm kubectl, apt-mark hold\n# control plane:\nsudo kubeadm init --pod-network-cidr=192.168.0.0/16\nmkdir -p ~/.kube && sudo cp /etc/kubernetes/admin.conf ~/.kube/config\nsudo chown $(id -u):$(id -g) ~/.kube/config\nkubectl apply -f <calico manifest>\nkubeadm token create --print-join-command   # run output on worker\nkubectl get nodes   # both Ready; target under 25 minutes",
      },
    ],
    faq: [
      { q: "Can I run Pods on the control plane node?", a: "Yes, by removing the node-role.kubernetes.io/control-plane:NoSchedule taint. That is fine for a one-node lab but not for production." },
      { q: "What if I lose the join command?", a: "Run kubeadm token create --print-join-command on the control plane. It creates a new token and prints the full command with the CA hash." },
      { q: "Which CNI plugin should I learn for the exam?", a: "Any common one works. Calico is a good choice because it is widely documented and enforces NetworkPolicies." },
    ],
  },
  "cka-architecture/upgrade": {
    plain: [
      "Kubernetes releases a new minor version about three times a year, and each one is supported for roughly fourteen months. So upgrading clusters is routine admin work. With kubeadm you move one minor version at a time, for example from 1.33 to 1.34.",
      "Think of it like renovating a hotel while guests stay there. You never close the whole building. You fix the management office first (the control plane), then empty one floor at a time (drain a node), renovate it, and let guests back in (uncordon).",
      "The order matters because of version rules. Newer control planes understand older kubelets, but not the other way round. Upgrading the control plane first keeps every part of the cluster able to talk to every other part during the process.",
    ],
    deepDive: [
      {
        heading: "The version skew rules",
        body: "Version skew means the allowed difference between component versions. The API server is the reference point. kubelets and kube-proxy may be up to three minor versions older than the API server, but never newer. The controller manager and scheduler may be at most one minor version older. kubectl may be one minor version older or newer.\n\nIn a cluster with several control plane nodes, the API servers may differ by at most one minor version. These rules are why you upgrade the control plane first and why you cannot jump two versions in one step.",
        bullets: ["kubelet: up to 3 minors older than API server, never newer", "scheduler and controller manager: up to 1 minor older", "kubectl: within 1 minor either way"],
        visual: {
          type: "layers",
          title: "Allowed versions vs API server N",
          layers: [
            { label: "kube-apiserver", detail: "N: the reference point" },
            { label: "Controller manager, scheduler", detail: "N or N-1" },
            { label: "kubelet, kube-proxy", detail: "N down to N-3, never newer" },
            { label: "kubectl", detail: "N-1, N or N+1" },
          ],
        },
      },
      {
        heading: "Changing the package repository",
        body: "Since the move to pkgs.k8s.io, each minor version has its own package repository. Before upgrading from 1.33 to 1.34 you edit /etc/apt/sources.list.d/kubernetes.list (or the yum repo file) and change v1.33 to v1.34 in the URL, then run apt update.\n\nThis step is easy to forget, and the symptom is that apt cannot find the new kubeadm version. apt-cache madison kubeadm lists the versions the configured repository offers, so you can pick the exact patch release.",
        visual: {
          type: "flow",
          title: "Pointing apt at the next minor",
          steps: [
            { label: "Edit kubernetes.list", detail: "Change v1.33 to v1.34 in the URL" },
            { label: "apt update", detail: "Fetch the new repository index" },
            { label: "apt-cache madison kubeadm", detail: "List available patch versions" },
            { label: "Install the exact version", detail: "Then hold the package again" },
          ],
        },
      },
      {
        heading: "What drain really does",
        body: "kubectl drain first cordons the node, marking it unschedulable so no new Pods land there. Then it evicts each Pod through the Eviction API, which respects PodDisruptionBudgets (PDBs). A PDB like minAvailable: 2 can make drain wait until enough replicas are healthy elsewhere.\n\nDaemonSet Pods would just be recreated on the same node, so drain refuses to continue unless you pass --ignore-daemonsets. Pods using emptyDir need --delete-emptydir-data because their scratch data will be lost. Bare Pods with no controller need --force, since nothing will recreate them.",
        bullets: ["--ignore-daemonsets for DaemonSet Pods", "--delete-emptydir-data for Pods with emptyDir", "--force for Pods without a controller"],
      },
      {
        heading: "After the upgrade",
        body: "kubeadm upgrade apply also renews the control plane certificates, which quietly fixes clusters near their one-year expiry. After all nodes are done, check kubectl get nodes: the VERSION column shows kubelet versions, and every node should show the new one.\n\nAlso check that control plane Pods are Running and that a test Deployment can still schedule Pods. If a node stays on the old version, you probably upgraded the packages but forgot to restart the kubelet.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "First control plane node vs every other node",
        columns: [
          { title: "First control plane node", points: ["Upgrade kubeadm package", "kubeadm upgrade plan", "kubeadm upgrade apply v1.34.x", "Then drain, kubelet, uncordon"] },
          { title: "Other control planes and workers", points: ["Upgrade kubeadm package", "kubeadm upgrade node", "Drain from the control plane", "Upgrade kubelet and kubectl, restart", "Uncordon"] },
        ],
      },
      {
        type: "sequence",
        title: "Draining a worker",
        actors: ["Admin", "API server", "Pods on worker", "Other nodes"],
        messages: [
          { from: 0, to: 1, label: "Cordon: mark worker unschedulable" },
          { from: 0, to: 1, label: "Evict each Pod (respect PDBs)" },
          { from: 1, to: 2, label: "Terminate gracefully" },
          { from: 1, to: 3, label: "Controllers create replacements" },
          { from: 0, to: 1, label: "Uncordon after upgrade" },
        ],
      },
    ],
    examples: [
      {
        title: "Upgrading the first control plane node to 1.34",
        explanation: "Step 1: point the package repo at v1.34 and install the new kubeadm. Step 2: run upgrade plan to see the target and check for blockers. Step 3: apply the upgrade. Step 4: drain the node, upgrade kubelet and kubectl, restart the kubelet, then uncordon.",
        code: {
          lang: "bash",
          code: "sudo sed -i 's/v1.33/v1.34/' /etc/apt/sources.list.d/kubernetes.list\nsudo apt update && sudo apt-mark unhold kubeadm\nsudo apt install -y kubeadm='1.34.1-*' && sudo apt-mark hold kubeadm\nsudo kubeadm upgrade plan\nsudo kubeadm upgrade apply v1.34.1\nkubectl drain cp1 --ignore-daemonsets\nsudo apt-mark unhold kubelet kubectl\nsudo apt install -y kubelet='1.34.1-*' kubectl='1.34.1-*'\nsudo apt-mark hold kubelet kubectl\nsudo systemctl daemon-reload && sudo systemctl restart kubelet\nkubectl uncordon cp1",
        },
      },
      {
        title: "Upgrading a worker",
        explanation: "Step 1: drain the worker from the control plane. Step 2: ssh to the worker, upgrade kubeadm and run kubeadm upgrade node, which updates the local kubelet config. Step 3: upgrade kubelet and kubectl and restart. Step 4: uncordon from the control plane and check the VERSION column.",
        code: {
          lang: "bash",
          code: "kubectl drain worker1 --ignore-daemonsets --delete-emptydir-data\nssh worker1\n# (repo already switched to v1.34)\nsudo apt-mark unhold kubeadm kubelet kubectl\nsudo apt install -y kubeadm='1.34.1-*'\nsudo kubeadm upgrade node\nsudo apt install -y kubelet='1.34.1-*' kubectl='1.34.1-*'\nsudo apt-mark hold kubeadm kubelet kubectl\nsudo systemctl daemon-reload && sudo systemctl restart kubelet\nexit\nkubectl uncordon worker1 && kubectl get nodes",
        },
      },
    ],
    cheatSheet: [
      "One minor version per upgrade; control plane first, then workers",
      "Switch the pkgs.k8s.io repo URL to the new minor before apt update",
      "First control plane: kubeadm upgrade apply vX.Y.Z; all others: kubeadm upgrade node",
      "kubectl drain NODE --ignore-daemonsets --delete-emptydir-data",
      "systemctl daemon-reload && systemctl restart kubelet after upgrading kubelet",
      "kubectl get nodes VERSION column shows the kubelet version",
      "apt-cache madison kubeadm lists available patch versions",
    ],
    quiz: [
      {
        q: "Your cluster runs 1.32. You need 1.34. What is the correct path?",
        options: ["Upgrade straight to 1.34", "Upgrade workers to 1.34, then the control plane", "Upgrade to 1.33, then to 1.34", "Reinstall the cluster"],
        answer: 2,
        why: "kubeadm supports only one minor version per upgrade.",
      },
      {
        q: "On a second control plane node, which command upgrades its components?",
        options: ["kubeadm upgrade node", "kubeadm upgrade apply", "kubeadm init", "kubeadm join --upgrade"],
        answer: 0,
        why: "apply runs once on the first control plane; every other node uses upgrade node.",
      },
      {
        q: "kubectl drain stops with an error about DaemonSet-managed Pods. What flag fixes it?",
        options: ["--force", "--grace-period=0", "--delete-emptydir-data", "--ignore-daemonsets"],
        answer: 3,
        why: "DaemonSet Pods would be recreated on the node, so drain must be told to skip them.",
      },
      {
        q: "After upgrading the kubelet package, kubectl get nodes still shows the old version. What was missed?",
        options: ["Uncordoning the node", "Restarting the kubelet", "Running kubeadm upgrade plan", "Upgrading kubectl"],
        answer: 1,
        why: "The running kubelet process keeps the old binary until it is restarted.",
      },
      {
        q: "Which version may a kubelet NOT run against a 1.34 API server?",
        options: ["1.31", "1.33", "1.35", "1.34"],
        answer: 2,
        why: "A kubelet may be older than the API server, but never newer.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show the current version of every node and of the control plane.",
        hint: "Nodes show kubelet versions; kubectl version shows the server.",
        solution: "kubectl get nodes\nkubectl version",
      },
      {
        level: "medium",
        task: "A drain hangs because of a PodDisruptionBudget. Find the PDB and explain your options.",
        hint: "Look at ALLOWED DISRUPTIONS.",
        solution: "kubectl get pdb -A\n# ALLOWED DISRUPTIONS = 0 means eviction would break the budget.\n# Options: scale the Deployment up so more replicas run elsewhere,\n# wait for unhealthy replicas to recover, or (last resort, if allowed)\n# temporarily edit or delete the PDB.",
      },
      {
        level: "hard",
        task: "Upgrade a two-node lab cluster by one minor version and prove that a Deployment with 3 replicas stayed available throughout.",
        hint: "Run a loop that curls the Service while you work.",
        solution: "k create deploy web --image=nginx --replicas=3\nk expose deploy web --port=80\nk run probe --image=busybox:1.36 -- sh -c \\\n  'while true; do wget -qO- -T1 web >/dev/null && echo ok || echo FAIL; sleep 1; done'\n# upgrade control plane (apply) then worker (upgrade node) with drain/uncordon\nk logs probe | sort | uniq -c   # expect only ok (or very few FAIL)\nk get nodes                       # all on the new version",
      },
    ],
    faq: [
      { q: "How often do I need to upgrade?", a: "Each minor version gets about 14 months of patches. Upgrading every one or two minor releases keeps you supported." },
      { q: "Do I need to upgrade etcd separately?", a: "No. On kubeadm clusters with stacked etcd, kubeadm upgrade apply upgrades etcd to the matching version for you." },
      { q: "Can I roll back a failed kubeadm upgrade?", a: "kubeadm keeps backups of manifests and etcd data under /etc/kubernetes/tmp and rolls back automatically if the apply fails. For full safety, take an etcd snapshot before you start." },
    ],
  },
  "cka-architecture/etcd-backup": {
    plain: [
      "etcd is the cluster's memory. Every Deployment, Secret, Service and RBAC rule lives there as a key and value. If etcd's data is lost, the cluster forgets everything, even though containers may keep running for a while.",
      "A snapshot is a photo of that memory at one moment. Restoring it is like turning the clock back: objects created after the photo disappear, and objects deleted after it come back. That makes snapshots a powerful undo button and a disaster recovery tool.",
      "The exam loves this task because it mixes three skills: finding certificate paths, using etcdctl correctly, and editing a static Pod manifest without breaking it. Practise it until the steps feel automatic.",
    ],
    deepDive: [
      {
        heading: "Why etcdctl needs so many flags",
        body: "etcd only accepts clients that prove who they are with a TLS certificate. So etcdctl needs four pieces: --endpoints (where etcd listens, usually https://127.0.0.1:2379), --cacert (to trust etcd's certificate), and --cert plus --key (your client identity).\n\nOn kubeadm nodes those files are in /etc/kubernetes/pki/etcd. The safest way to get exact paths is to read them from /etc/kubernetes/manifests/etcd.yaml: --trusted-ca-file is the CA, and --cert-file and --key-file are a pair that works for clients too. Exam clusters sometimes use non-default paths on purpose, so never assume.",
        bullets: ["--endpoints=https://127.0.0.1:2379", "--cacert=/etc/kubernetes/pki/etcd/ca.crt", "--cert=/etc/kubernetes/pki/etcd/server.crt", "--key=/etc/kubernetes/pki/etcd/server.key"],
        visual: {
          type: "tree",
          title: "Reading etcdctl flags from etcd.yaml",
          root: "etcd.yaml flag -> etcdctl flag",
          children: [
            { label: "--listen-client-urls", children: ["--endpoints (https://127.0.0.1:2379)"] },
            { label: "--trusted-ca-file", children: ["--cacert"] },
            { label: "--cert-file", children: ["--cert"] },
            { label: "--key-file", children: ["--key"] },
          ],
        },
      },
      {
        heading: "Checking a snapshot is good",
        body: "A snapshot file can be truncated if the disk fills up or the command is interrupted. Before trusting it, run etcdutl snapshot status FILE -w table. It prints a hash, the revision, the number of keys and the total size. A file with a sensible key count and size is a usable backup.\n\netcdutl works on files offline, so it needs no certificates. In recent etcd versions, status and restore moved from etcdctl to etcdutl; the old etcdctl forms still work in many installs but print deprecation warnings.",
      },
      {
        heading: "Restore without breaking the live cluster",
        body: "etcdutl snapshot restore never touches the running etcd. It builds a brand-new data directory, for example /var/lib/etcd-from-backup. You then tell etcd to use it.\n\nOn kubeadm clusters the simplest change is in etcd.yaml: edit the hostPath of the volume named etcd-data to the new directory. The container still sees it at /var/lib/etcd, so the --data-dir flag can stay as it is. When you save, the kubelet notices the changed manifest and recreates etcd. The API server reconnects within a minute or two. For extra safety, many admins move the API server manifest out first and back afterwards, so nothing writes during the switch.",
      },
      {
        heading: "Snapshots in real life",
        body: "In production, snapshots run on a schedule, for example a CronJob or systemd timer every hour, and copies go off the node to object storage. A backup stored only on the node it protects is lost together with that node.\n\nSnapshots contain every Secret in the cluster, so treat the files as highly sensitive. Encrypt them at rest and restrict who can read them.",
        visual: {
          type: "flow",
          title: "A production backup routine",
          steps: [
            { label: "Scheduled snapshot", detail: "CronJob or systemd timer, e.g. hourly" },
            { label: "Check it", detail: "etcdutl snapshot status" },
            { label: "Copy off the node", detail: "Object storage, not local disk only" },
            { label: "Protect it", detail: "Encrypt at rest; it holds every Secret" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "What a snapshot contains",
        root: "/registry (etcd keys)",
        children: [
          { label: "Workloads", children: ["deployments", "replicasets", "pods", "daemonsets"] },
          { label: "Config", children: ["configmaps", "secrets"] },
          { label: "Networking", children: ["services", "endpointslices", "networkpolicies"] },
          { label: "Access", children: ["roles", "rolebindings", "serviceaccounts"] },
          { label: "Cluster", children: ["namespaces", "nodes", "persistentvolumes", "leases"] },
        ],
      },
      {
        type: "sequence",
        title: "Restoring a snapshot on kubeadm",
        actors: ["Admin", "etcdutl", "kubelet", "etcd Pod"],
        messages: [
          { from: 0, to: 1, label: "snapshot restore --data-dir NEW" },
          { from: 1, to: 0, label: "New data directory written" },
          { from: 0, to: 2, label: "Edit etcd.yaml hostPath to NEW" },
          { from: 2, to: 3, label: "Stop old etcd, start with new data" },
          { from: 0, to: 3, label: "kubectl get pods to verify" },
        ],
      },
    ],
    examples: [
      {
        title: "Taking and checking a snapshot",
        explanation: "Task: save a snapshot to /opt/backup/etcd.db. Step 1: read the cert paths from the manifest. Step 2: run snapshot save with all four TLS flags. Step 3: check it with etcdutl snapshot status.",
        code: {
          lang: "bash",
          code: "grep -E 'listen-client|trusted-ca|cert-file|key-file' /etc/kubernetes/manifests/etcd.yaml\nsudo ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key \\\n  snapshot save /opt/backup/etcd.db\nsudo etcdutl snapshot status /opt/backup/etcd.db -w table",
        },
      },
      {
        title: "Undoing a deleted namespace",
        explanation: "Someone deleted namespace shop after your backup. Step 1: restore the snapshot into a new directory. Step 2: point the etcd-data hostPath at it. Step 3: wait for etcd and the API server to come back. Step 4: the namespace and its objects are back.",
        code: {
          lang: "bash",
          code: "sudo etcdutl snapshot restore /opt/backup/etcd.db \\\n  --data-dir /var/lib/etcd-from-backup\nsudo vi /etc/kubernetes/manifests/etcd.yaml\n#  volumes:\n#  - name: etcd-data\n#    hostPath:\n#      path: /var/lib/etcd-from-backup   # was /var/lib/etcd\nwatch sudo crictl ps --name etcd\nkubectl get ns shop",
        },
      },
    ],
    cheatSheet: [
      "Cert paths: read --trusted-ca-file, --cert-file, --key-file in /etc/kubernetes/manifests/etcd.yaml",
      "etcdctl snapshot save FILE with --endpoints --cacert --cert --key",
      "etcdutl snapshot status FILE -w table checks a snapshot offline",
      "etcdutl snapshot restore FILE --data-dir NEW_DIR (never the live dir)",
      "Point the etcd-data hostPath to NEW_DIR; kubelet restarts etcd automatically",
      "Store snapshot copies off the node; they contain every Secret",
    ],
    quiz: [
      {
        q: "Where is the most reliable place to find etcd's certificate paths on a kubeadm node?",
        options: ["The kubelet config", "The etcd static Pod manifest", "~/.kube/config", "The CoreDNS ConfigMap"],
        answer: 1,
        why: "The manifest lists the exact files etcd uses, even if they are non-default.",
      },
      {
        q: "Which command checks a snapshot file without needing certificates?",
        options: ["etcdctl member list", "kubectl get etcd", "etcdctl endpoint health", "etcdutl snapshot status"],
        answer: 3,
        why: "etcdutl reads the file offline, so no TLS connection is involved.",
      },
      {
        q: "After restoring to /var/lib/etcd-new, what is the simplest change on kubeadm?",
        options: ["Change the etcd-data volume hostPath to /var/lib/etcd-new", "Restart the API server with systemctl", "Run kubeadm init again", "Copy the folder into the etcd Pod with kubectl cp"],
        answer: 0,
        why: "The container keeps mounting at /var/lib/etcd, now backed by the restored directory.",
      },
      {
        q: "You created Deployment api after taking a snapshot, then restored it. What happens to api?",
        options: ["It is kept", "It is renamed", "It disappears, because it was not in the snapshot", "It becomes read-only"],
        answer: 2,
        why: "A restore returns the cluster's stored state to the moment of the snapshot.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print the etcd client URL and the three certificate paths from the etcd manifest.",
        hint: "grep for listen-client-urls and file flags.",
        solution: "sudo grep -E 'listen-client-urls|trusted-ca-file|cert-file|key-file' \\\n  /etc/kubernetes/manifests/etcd.yaml | grep -v peer",
      },
      {
        level: "medium",
        task: "Save a snapshot to /srv/etcd-snap.db and record its key count to /srv/keys.txt.",
        hint: "Use the json or table output from etcdutl snapshot status.",
        solution: "sudo etcdctl --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key snapshot save /srv/etcd-snap.db\nsudo etcdutl snapshot status /srv/etcd-snap.db -w json | \\\n  grep -o '\"totalKey\":[0-9]*' > /srv/keys.txt",
      },
      {
        level: "hard",
        task: "Take a snapshot, delete a namespace with a Deployment in it, restore the snapshot, and prove the Deployment is back with Pods Running.",
        hint: "Restore into a new directory and change the hostPath; give etcd and the API server time to restart.",
        solution: "k create ns demo && k -n demo create deploy web --image=nginx\n# snapshot save /opt/snap.db (with TLS flags)\nk delete ns demo\nsudo etcdutl snapshot restore /opt/snap.db --data-dir /var/lib/etcd-restore\nsudo sed -i 's#path: /var/lib/etcd$#path: /var/lib/etcd-restore#' \\\n  /etc/kubernetes/manifests/etcd.yaml\n# wait 1-2 minutes, then:\nk -n demo get deploy,pods",
      },
    ],
    faq: [
      { q: "Do I need to stop etcd before taking a snapshot?", a: "No. snapshot save takes a consistent copy from a running member over the network." },
      { q: "Does an etcd snapshot back up my application data?", a: "No. It holds Kubernetes objects only. Data inside PersistentVolumes needs its own backup, such as volume snapshots or a tool like Velero." },
      { q: "What is ETCDCTL_API=3 for?", a: "Old etcdctl versions defaulted to the v2 API. Setting it to 3 is harmless today and guarantees the v3 commands are used." },
    ],
  },
  "cka-architecture/rbac": {
    plain: [
      "RBAC (role-based access control) decides who may do what in a cluster. You never give permissions to a person directly. Instead you write a role, which is a list of allowed actions, and then bind that role to a user, a group or a service account.",
      "It works like key cards in an office building. A role is a key card type, such as \"can open meeting rooms on floor 3\". A binding hands that card type to specific people. If nobody gave you a card for a door, the door stays shut.",
      "Service accounts are identities for programs running in Pods, like a CI tool or a monitoring agent. They get permissions the same way as people. Granting the smallest set that still works, called least privilege, limits the damage if a token ever leaks.",
    ],
    deepDive: [
      {
        heading: "What a rule really matches",
        body: "Each rule in a Role lists apiGroups, resources and verbs. The core group is written as an empty string, so Pods use apiGroups: [\"\"], while Deployments use [\"apps\"]. kubectl api-resources shows the group and the short name of every resource.\n\nVerbs map to HTTP actions: get, list and watch for reading, create, update, patch and delete for changes. Subresources are separate: reading logs needs pods/log, and kubectl exec needs create on pods/exec. A rule can also be narrowed to specific object names with resourceNames.",
        bullets: ["Read-only set: get, list, watch", "Logs: resource pods/log, verb get", "Exec: resource pods/exec, verb create", "kubectl api-resources -o wide shows supported verbs"],
        visual: {
          type: "tree",
          title: "Parts of one Role rule",
          root: "rule",
          children: [
            { label: "apiGroups", children: ["\"\" for core (pods, services)", "\"apps\" for deployments"] },
            { label: "resources", children: ["pods", "pods/log", "pods/exec"] },
            { label: "verbs", children: ["get, list, watch", "create, update, patch, delete"] },
            { label: "resourceNames", children: ["Optional: only named objects"] },
          ],
        },
      },
      {
        heading: "Built-in ClusterRoles you can reuse",
        body: "Kubernetes ships with useful ClusterRoles: view (read most things except Secrets), edit (change most things, but not roles), admin (full control within a namespace, including RoleBindings) and cluster-admin (everything everywhere).\n\nBinding a built-in ClusterRole with a RoleBinding is a quick, safe way to give a team admin rights in just their namespace. Use cluster-admin rarely; it bypasses every limit.",
        visual: {
          type: "layers",
          title: "Built-in ClusterRoles, most power first",
          layers: [
            { label: "cluster-admin", detail: "Everything, everywhere" },
            { label: "admin", detail: "Full control in a namespace, incl. RoleBindings" },
            { label: "edit", detail: "Change most things, but not roles" },
            { label: "view", detail: "Read most things, not Secrets" },
          ],
        },
      },
      {
        heading: "Users come from certificates, not from Kubernetes",
        body: "Kubernetes has no User object. A user is just a name the API server trusts from a credential, most simply a client certificate signed by the cluster CA. The certificate's Common Name (CN) becomes the username and Organization (O) fields become groups.\n\nTo create one, generate a key and a certificate request with openssl, submit it as a CertificateSigningRequest object with signerName kubernetes.io/kube-apiserver-client, approve it with kubectl certificate approve, and read back the signed certificate. Then put the key and certificate into a kubeconfig.",
      },
      {
        heading: "Service account tokens today",
        body: "Since Kubernetes 1.24, service accounts no longer get a long-lived token Secret created automatically. Pods receive a short-lived token through a projected volume, rotated by the kubelet. For a quick token outside a Pod, kubectl create token SA_NAME prints one that expires after an hour by default.\n\nYou can stop a Pod from receiving a token at all with automountServiceAccountToken: false, which is good practice for Pods that never call the API.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "How RBAC answers one request",
        steps: [
          { label: "Request arrives", detail: "user jane: list pods in dev" },
          { label: "Find bindings", detail: "RoleBindings in dev, all ClusterRoleBindings" },
          { label: "Collect rules", detail: "From every bound Role or ClusterRole" },
          { label: "Match", detail: "apiGroup, resource, verb, namespace" },
          { label: "Decide", detail: "Any match allows; none means 403" },
        ],
      },
      {
        type: "sequence",
        title: "Creating a certificate user",
        actors: ["New user", "Admin", "API server"],
        messages: [
          { from: 0, to: 1, label: "Send CSR file (key stays private)" },
          { from: 1, to: 2, label: "Create CertificateSigningRequest" },
          { from: 1, to: 2, label: "kubectl certificate approve" },
          { from: 2, to: 1, label: "Signed certificate in status" },
          { from: 1, to: 0, label: "Certificate + kubeconfig" },
        ],
      },
    ],
    examples: [
      {
        title: "A CI service account that may only deploy",
        explanation: "Task: in namespace ci, service account deployer may create, update and get Deployments, nothing else. Step 1: create the service account. Step 2: create a Role with those verbs on deployments in the apps group. Step 3: bind it. Step 4: check allowed and denied actions with can-i.",
        code: {
          lang: "bash",
          code: "k -n ci create sa deployer\nk -n ci create role deploy-only --verb=get,create,update,patch \\\n  --resource=deployments.apps\nk -n ci create rolebinding deployer-rb --role=deploy-only \\\n  --serviceaccount=ci:deployer\nk -n ci auth can-i create deployments --as=system:serviceaccount:ci:deployer  # yes\nk -n ci auth can-i delete deployments --as=system:serviceaccount:ci:deployer  # no\nk -n ci auth can-i get secrets --as=system:serviceaccount:ci:deployer        # no",
        },
      },
      {
        title: "Giving user jane a working kubeconfig",
        explanation: "Step 1: create a key and CSR with CN=jane and O=dev. Step 2: submit and approve it. Step 3: extract the certificate. Step 4: add credentials and a context to a kubeconfig. Step 5: test with the new context.",
        code: {
          lang: "bash",
          code: "openssl genrsa -out jane.key 2048\nopenssl req -new -key jane.key -subj \"/CN=jane/O=dev\" -out jane.csr\ncat <<EOF | k apply -f -\napiVersion: certificates.k8s.io/v1\nkind: CertificateSigningRequest\nmetadata: {name: jane}\nspec: {request: $(base64 -w0 jane.csr), signerName: kubernetes.io/kube-apiserver-client, usages: [client auth]}\nEOF\nk certificate approve jane\nk get csr jane -o jsonpath='{.status.certificate}' | base64 -d > jane.crt\nk config set-credentials jane --client-key=jane.key --client-certificate=jane.crt --embed-certs\nk config set-context jane --cluster=kubernetes --user=jane --namespace=dev",
        },
      },
    ],
    cheatSheet: [
      "Core group is \"\"; Deployments are apps; Ingress is networking.k8s.io",
      "k create role NAME --verb=get,list,watch --resource=pods -n NS",
      "k create rolebinding NAME --clusterrole=view --user=jane -n NS",
      "k auth can-i --list --as=jane -n NS shows everything jane can do",
      "SA subject: system:serviceaccount:NAMESPACE:NAME",
      "k create token SA prints a short-lived token for a service account",
      "Logs need pods/log get; exec needs pods/exec create",
    ],
    quiz: [
      {
        q: "A Role needs to allow reading Deployments. Which apiGroups value is correct?",
        options: ["\"\"", "\"apps\"", "\"extensions\"", "\"core\""],
        answer: 1,
        why: "Deployments live in the apps API group.",
      },
      {
        q: "A user can get Pods but kubectl exec is forbidden. What must be added?",
        options: ["verb exec on pods", "verb update on pods", "verb get on pods/log", "verb create on pods/exec"],
        answer: 3,
        why: "exec is a subresource, and opening a session is a create on pods/exec.",
      },
      {
        q: "Where does Kubernetes get a certificate user's group membership?",
        options: ["The Organization (O) fields of the certificate", "A Group object", "The user's kubeconfig context name", "The namespace label"],
        answer: 0,
        why: "The API server maps CN to the username and O fields to groups.",
      },
      {
        q: "You want team-a to have full control only in namespace team-a. What is the simplest grant?",
        options: ["ClusterRoleBinding to cluster-admin", "A RoleBinding in team-a to the built-in admin ClusterRole", "A Role in kube-system", "Add them to system:masters"],
        answer: 1,
        why: "A RoleBinding scopes the reusable admin ClusterRole to one namespace.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Give user bob read-only access to Pods and their logs in namespace web.",
        hint: "Two resources in one Role: pods and pods/log.",
        solution: "k -n web create role pod-reader --verb=get,list,watch \\\n  --resource=pods,pods/log\nk -n web create rolebinding bob-read --role=pod-reader --user=bob\nk -n web auth can-i get pods/log --as=bob   # yes",
      },
      {
        level: "medium",
        task: "Service account monitor in namespace ops must list nodes and Pods in every namespace. Grant it and verify.",
        hint: "Nodes are cluster-scoped, so you need a ClusterRole and a ClusterRoleBinding.",
        solution: "k -n ops create sa monitor\nk create clusterrole node-pod-reader --verb=get,list,watch --resource=nodes,pods\nk create clusterrolebinding monitor-crb --clusterrole=node-pod-reader \\\n  --serviceaccount=ops:monitor\nk auth can-i list nodes --as=system:serviceaccount:ops:monitor     # yes\nk auth can-i list pods -A --as=system:serviceaccount:ops:monitor   # yes",
      },
      {
        level: "hard",
        task: "Create user alice in group qa with a working kubeconfig file /opt/alice.kubeconfig that can only view resources in namespace qa.",
        hint: "Bind the built-in view ClusterRole to the group, and build the kubeconfig with --kubeconfig on every config command.",
        solution: "# key, CSR (CN=alice/O=qa), CertificateSigningRequest, approve, extract alice.crt\nk -n qa create rolebinding qa-view --clusterrole=view --group=qa\nK=/opt/alice.kubeconfig\nk config view --raw --minify -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' \\\n  | base64 -d > ca.crt\nk config set-cluster kubernetes --server=https://10.0.0.10:6443 \\\n  --certificate-authority=ca.crt --embed-certs --kubeconfig=$K\nk config set-credentials alice --client-key=alice.key \\\n  --client-certificate=alice.crt --embed-certs --kubeconfig=$K\nk config set-context alice --cluster=kubernetes --user=alice --namespace=qa --kubeconfig=$K\nk config use-context alice --kubeconfig=$K && k get pods --kubeconfig=$K",
      },
    ],
    faq: [
      { q: "Can I deny a single action with RBAC?", a: "No, RBAC only allows. To block something, remove the rule or binding that grants it, or use an admission policy for deny-style checks." },
      { q: "How do I see who has access to Secrets?", a: "kubectl auth can-i tests one identity at a time. To audit everyone, inspect RoleBindings and ClusterRoleBindings or use a plugin such as rbac-tool or kubectl who-can." },
      { q: "Why does a Pod get 403 when calling the API?", a: "It runs as its namespace's default service account unless you set serviceAccountName, and the default account has almost no permissions. Bind a role to the account the Pod actually uses." },
    ],
  },
  "cka-architecture/ha-control-plane": {
    plain: [
      "A cluster with one control plane node has a single point of failure. If that machine dies, nothing new can be scheduled, scaled or repaired. High availability (HA) means running the control plane on several machines so one failure does not stop the cluster.",
      "It is like a company with three managers instead of one. If one is sick, the other two keep making decisions. But decisions need a majority vote, so with only two managers a single absence would freeze everything. That is why HA setups use odd numbers like three or five.",
      "Two parts need care. The API servers are stateless, so you simply run several and put a load balancer in front. etcd holds the data and must agree on every write, so its size and placement decide how many failures you can survive.",
    ],
    deepDive: [
      {
        heading: "How etcd agrees on writes",
        body: "etcd uses the Raft consensus algorithm. One member is the leader and every write goes through it. The leader sends the write to the followers, and the write is committed only when a majority, called the quorum, has saved it. Quorum is floor(n/2) + 1.\n\nIf the leader fails, the remaining members hold an election and pick a new leader within seconds, as long as a majority is still alive. If quorum is lost, etcd stops accepting writes to stay consistent, and the API server cannot change anything. Running Pods keep running, but the cluster is frozen.",
        bullets: ["3 members: quorum 2, tolerates 1 failure", "5 members: quorum 3, tolerates 2 failures", "4 members: quorum 3, still tolerates only 1"],
      },
      {
        heading: "The shared endpoint",
        body: "Every kubelet, every kubeconfig and the certificates themselves point at one API address. In HA that address must be a load balancer or a virtual IP in front of all API servers, set at install time with kubeadm init --control-plane-endpoint. Choosing a DNS name rather than a raw IP makes later changes easier.\n\nAdding this endpoint later is painful, because certificates must include it. So even a one-node lab that might grow should be initialised with a control-plane-endpoint.",
      },
      {
        heading: "Joining more control plane nodes",
        body: "kubeadm init --upload-certs stores the control plane certificates, encrypted, in a Secret in kube-system. It prints a certificate key. Other nodes then run kubeadm join with --control-plane and --certificate-key, download the certificates, and start their own API server, scheduler, controller manager and, in a stacked setup, a new etcd member.\n\nThe uploaded certificates are deleted after two hours for safety. To add another control plane later, run kubeadm init phase upload-certs --upload-certs to get a fresh key.",
        visual: {
          type: "sequence",
          title: "Adding a second control plane node",
          actors: ["First control plane", "Secret in kube-system", "New node", "etcd cluster"],
          messages: [
            { from: 0, to: 1, label: "init --upload-certs: encrypted certs, key printed" },
            { from: 2, to: 1, label: "join --control-plane --certificate-key" },
            { from: 1, to: 2, label: "Certificates downloaded" },
            { from: 2, to: 3, label: "Add etcd member (stacked setup)" },
            { from: 3, to: 2, label: "Member joined" },
          ],
        },
      },
      {
        heading: "Choosing stacked or external",
        body: "Stacked etcd runs on the control plane nodes themselves. It needs fewer machines and is the kubeadm default. External etcd runs on its own hosts, so losing a control plane node does not also remove an etcd member, and etcd load does not compete with the API server.\n\nMost teams start stacked with three nodes and move to external etcd only for large or very critical clusters.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "etcd cluster size and failure tolerance",
        columns: [
          { title: "3 members", points: ["Quorum: 2", "Survives 1 failure", "Common default", "Lowest cost for HA"] },
          { title: "4 members", points: ["Quorum: 3", "Survives 1 failure", "More cost, no extra safety", "Avoid even sizes"] },
          { title: "5 members", points: ["Quorum: 3", "Survives 2 failures", "For critical clusters", "Slightly slower writes"] },
        ],
      },
      {
        type: "sequence",
        title: "One write with Raft",
        actors: ["API server", "etcd leader", "Follower A", "Follower B"],
        messages: [
          { from: 0, to: 1, label: "Put /registry/pods/web" },
          { from: 1, to: 2, label: "Append entry" },
          { from: 1, to: 3, label: "Append entry" },
          { from: 2, to: 1, label: "Saved (majority reached)" },
          { from: 1, to: 0, label: "Committed" },
          { from: 3, to: 1, label: "Saved (late, still fine)" },
        ],
      },
    ],
    examples: [
      {
        title: "Building a three-node stacked control plane",
        explanation: "Step 1: create a load balancer or DNS name k8s-api.lab:6443 pointing at all three nodes. Step 2: init the first node with that endpoint and --upload-certs. Step 3: run the printed control plane join command on nodes two and three. Step 4: check that three etcd and three API server Pods are Running.",
        code: {
          lang: "bash",
          code: "sudo kubeadm init --control-plane-endpoint \"k8s-api.lab:6443\" \\\n  --upload-certs --pod-network-cidr=192.168.0.0/16\n# on cp2 and cp3:\nsudo kubeadm join k8s-api.lab:6443 --token <t> \\\n  --discovery-token-ca-cert-hash sha256:<h> \\\n  --control-plane --certificate-key <key>\nkubectl -n kube-system get pods -l component=etcd -o wide",
        },
      },
      {
        title: "Reasoning about a failure",
        explanation: "A stacked cluster has three control plane nodes and two of them lose power. Step 1: only one of three etcd members is alive, below the quorum of two. Step 2: etcd refuses writes, so kubectl create and scale fail or hang. Step 3: running Pods keep serving traffic. Step 4: bringing back one more node restores quorum and the cluster recovers by itself.",
      },
    ],
    cheatSheet: [
      "Quorum = floor(n/2) + 1; tolerated failures = n - quorum",
      "Use 3 or 5 etcd members; even numbers add cost, not safety",
      "kubeadm init --control-plane-endpoint LB:6443 --upload-certs",
      "kubeadm join ... --control-plane --certificate-key KEY",
      "Uploaded certs expire after 2 hours: kubeadm init phase upload-certs --upload-certs",
      "Scheduler and controller manager are active-passive via Leases",
    ],
    quiz: [
      {
        q: "A 5-member etcd cluster loses 3 members. What happens?",
        options: ["Writes continue normally", "It becomes faster", "Quorum is lost, so writes stop", "Pods are deleted"],
        answer: 2,
        why: "Only 2 of 5 remain, below the quorum of 3.",
      },
      {
        q: "Why should you set --control-plane-endpoint even for a single control plane lab you may grow later?",
        options: ["Certificates and kubeconfigs are tied to the endpoint, which is hard to change later", "It enables Ingress", "It is needed for CNI", "It speeds up etcd"],
        answer: 0,
        why: "Changing the API address later means reissuing certificates and reconfiguring every node.",
      },
      {
        q: "What is the main benefit of external etcd over stacked etcd?",
        options: ["Fewer machines", "No certificates needed", "Simpler kubeadm install", "A control plane node failure does not also remove an etcd member"],
        answer: 3,
        why: "External etcd separates the failure of the two layers.",
      },
      {
        q: "In an HA cluster, how many kube-scheduler instances actively schedule Pods at once?",
        options: ["All of them", "One, the elected leader", "Two", "None; the API server schedules"],
        answer: 1,
        why: "Leader election through a Lease makes exactly one scheduler active.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Fill in the table: for 1, 3, 5 and 7 etcd members, what is the quorum and how many failures are tolerated?",
        hint: "Quorum is a strict majority.",
        solution: "1 member: quorum 1, tolerates 0\n3 members: quorum 2, tolerates 1\n5 members: quorum 3, tolerates 2\n7 members: quorum 4, tolerates 3",
      },
      {
        level: "medium",
        task: "On a stacked HA cluster, list the etcd members using etcdctl from one control plane node.",
        hint: "Use the same TLS flags as a snapshot.",
        solution: "sudo etcdctl --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key \\\n  member list -w table",
      },
      {
        level: "hard",
        task: "Your three-node HA cluster's uploaded certificates expired and you need to add a fourth control plane node. Get a working join command.",
        hint: "Two pieces: a new certificate key and a new token.",
        solution: "sudo kubeadm init phase upload-certs --upload-certs\n# prints: certificate key abc123...\nkubeadm token create --print-join-command\n# on the new node, run the printed command and append:\n#   --control-plane --certificate-key abc123...\n# Note: 4 members still tolerate only 1 failure; add a 5th soon.",
      },
    ],
    faq: [
      { q: "Do I need HA for the CKA exam?", a: "You will not usually build one, but you must explain stacked vs external etcd, quorum, and how the load balancer fits in." },
      { q: "Can etcd members be in different data centres?", a: "Yes, but every write waits for a majority, so high latency between sites slows the whole cluster. Keep members within low-latency links, such as zones in one region." },
      { q: "What load balancer should I use for the API servers?", a: "Any TCP load balancer works: a cloud load balancer, HAProxy with keepalived, or kube-vip. It only needs to forward port 6443 to healthy API servers." },
    ],
  },
  "cka-architecture/helm-kustomize": {
    plain: [
      "Real applications need many YAML files: Deployments, Services, ConfigMaps, RBAC rules. Copying and editing them by hand for every environment gets messy. Helm and Kustomize are two tools that package and customise those files so installs are repeatable.",
      "Helm is like an app store with installers. A chart is a package with templates and a list of settings called values. You install it with your own values. Kustomize is more like tracing paper: you keep plain base YAML and lay small patches over it for dev or prod.",
      "Custom Resource Definitions (CRDs) let you add your own object types, such as a Database or a Certificate. An operator is a program that watches those objects and does the real work, like creating Pods and backups. Many Helm charts install exactly this pair.",
    ],
    deepDive: [
      {
        heading: "Helm day-to-day",
        body: "A typical flow is: helm repo add to register a chart repository, helm repo update to refresh its index, helm search repo to find a chart, and helm show values to see what you can configure. Then helm install NAME CHART -n NS --create-namespace -f my-values.yaml installs a release.\n\nhelm upgrade --install is handy because it installs if missing and upgrades if present. helm history and helm rollback NAME REVISION undo a bad change. helm template renders the YAML without installing, which is great for checking what a chart will create.",
        bullets: ["helm list -A shows releases in all namespaces", "helm get values NAME shows the values you set", "helm uninstall NAME -n NS removes a release"],
      },
      {
        heading: "Where Helm keeps its memory",
        body: "Helm 3 has no server component. It stores each release revision as a Secret in the release's namespace, named like sh.helm.release.v1.web.v3. That record holds the rendered manifests and values, which is how upgrade and rollback know what to change.\n\nThis also explains a common surprise: helm list without -n only shows releases in your current namespace. If a release seems missing, add -A.",
        visual: {
          type: "flow",
          title: "Release history stored as Secrets",
          steps: [
            { label: "helm install web", detail: "Secret sh.helm.release.v1.web.v1" },
            { label: "helm upgrade web", detail: "Revision 2, new Secret .v2" },
            { label: "helm rollback web 1", detail: "Reads revision 1's manifests" },
            { label: "Revision 3", detail: "Rollback is recorded as a new revision" },
          ],
        },
      },
      {
        heading: "Kustomize building blocks",
        body: "A folder with a kustomization.yaml file is a kustomization. It lists resources (YAML files or other folders) and transformations: namespace sets the namespace on everything, namePrefix adds a prefix, labels adds labels, images changes image tags, and patches applies strategic merge or JSON patches.\n\nconfigMapGenerator builds ConfigMaps from files or literals and adds a hash suffix to the name. When the content changes, the name changes, and Deployments that use it roll out automatically. kubectl kustomize DIR previews the output; kubectl apply -k DIR applies it.",
        visual: {
          type: "flow",
          title: "Why configMapGenerator triggers a rollout",
          steps: [
            { label: "Edit the source file" },
            { label: "New hash suffix", detail: "Name changes, e.g. app-config-7f9k2m" },
            { label: "References updated", detail: "Deployment now points at the new name" },
            { label: "Pod template changed", detail: "Deployment rolls out new Pods" },
          ],
        },
      },
      {
        heading: "CRDs and validation",
        body: "A CRD registers a new resource type with a group, version, kind and an OpenAPI schema. The schema validates objects and powers kubectl explain for the new kind. Once a CRD exists, kubectl get, describe and apply work on its objects like any built-in resource.\n\nDeleting a CRD deletes every object of that type, so be careful. Use kubectl get crd to list them and kubectl api-resources --api-group=GROUP to see the kinds they add.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "A Kustomize layout with overlays",
        root: "app/",
        children: [
          { label: "base/", children: ["deployment.yaml", "service.yaml", "kustomization.yaml"] },
          { label: "overlays/dev/", children: ["kustomization.yaml (namespace: dev)", "replicas-patch.yaml (1 replica)"] },
          { label: "overlays/prod/", children: ["kustomization.yaml (namespace: prod)", "replicas-patch.yaml (5 replicas)", "images: tag 2.1.0"] },
        ],
      },
      {
        type: "flow",
        title: "What helm install does",
        steps: [
          { label: "Load chart", detail: "Templates and default values" },
          { label: "Merge values", detail: "Defaults, then -f files, then --set" },
          { label: "Render", detail: "Templates become plain YAML" },
          { label: "Apply", detail: "Objects sent to the API server" },
          { label: "Record", detail: "Release stored as a Secret" },
        ],
      },
    ],
    examples: [
      {
        title: "Installing ingress-nginx with Helm and one override",
        explanation: "Step 1: add and update the repository. Step 2: check the available values. Step 3: install into its own namespace with a NodePort Service, because a lab has no cloud load balancer. Step 4: confirm the release and its Pods.",
        code: {
          lang: "bash",
          code: "helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx\nhelm repo update\nhelm show values ingress-nginx/ingress-nginx | grep -A3 'type: LoadBalancer'\nhelm install ingress ingress-nginx/ingress-nginx -n ingress-nginx \\\n  --create-namespace --set controller.service.type=NodePort\nhelm list -n ingress-nginx\nkubectl -n ingress-nginx get pods,svc",
        },
      },
      {
        title: "A prod overlay with Kustomize",
        explanation: "Step 1: the base folder holds a plain Deployment named web. Step 2: the prod overlay points at the base, sets the namespace, raises replicas and pins the image tag. Step 3: preview with kubectl kustomize, then apply with -k.",
        code: {
          lang: "yaml",
          code: "# overlays/prod/kustomization.yaml\napiVersion: kustomize.config.k8s.io/v1beta1\nkind: Kustomization\nresources:\n- ../../base\nnamespace: prod\nimages:\n- name: nginx\n  newTag: \"1.27\"\npatches:\n- target: {kind: Deployment, name: web}\n  patch: |-\n    - {op: replace, path: /spec/replicas, value: 5}\n# kubectl kustomize overlays/prod && kubectl apply -k overlays/prod",
        },
      },
    ],
    cheatSheet: [
      "helm upgrade --install NAME CHART -n NS --create-namespace -f values.yaml",
      "helm show values CHART > values.yaml to see every setting",
      "helm rollback NAME REV; helm history NAME shows revisions",
      "helm template NAME CHART renders YAML without installing",
      "kubectl kustomize DIR previews; kubectl apply -k DIR applies",
      "configMapGenerator adds a hash suffix so config changes roll Pods",
      "k get crd; k explain KIND works when the CRD has a schema",
    ],
    quiz: [
      {
        q: "helm list shows nothing, but you know a release exists. What is the likely reason?",
        options: ["Helm needs a server", "The chart was deleted from the repo", "The release is in another namespace; use -A", "helm list needs --all-versions"],
        answer: 2,
        why: "helm list only shows the current namespace by default.",
      },
      {
        q: "In which order does Helm merge values?",
        options: ["Chart defaults, then -f files, then --set", "--set first, then defaults", "Only the last -f file is used", "Alphabetically by key"],
        answer: 0,
        why: "Later sources override earlier ones, and --set wins over files.",
      },
      {
        q: "Why does configMapGenerator add a hash to the ConfigMap name?",
        options: ["To encrypt it", "To make the name unique per namespace", "Kubernetes requires hashes", "So a content change creates a new name and triggers a rollout"],
        answer: 3,
        why: "Changing the referenced name changes the Pod template, so Deployments roll.",
      },
      {
        q: "You apply a CRD named backups.example.com. What do you still need for backups to actually happen?",
        options: ["Nothing, the CRD runs backups", "A controller or operator that acts on Backup objects", "A StorageClass named backups", "A Helm release"],
        answer: 1,
        why: "A CRD only stores objects; a controller gives them behaviour.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Install the bitnami/nginx chart as release web in namespace web with 2 replicas, then list the release.",
        hint: "Use --set replicaCount=2 and --create-namespace.",
        solution: "helm repo add bitnami https://charts.bitnami.com/bitnami && helm repo update\nhelm install web bitnami/nginx -n web --create-namespace --set replicaCount=2\nhelm list -n web\nkubectl -n web get deploy",
      },
      {
        level: "medium",
        task: "Upgrade release web to 3 replicas, then roll back to the previous revision and confirm the replica count.",
        hint: "--reuse-values keeps earlier settings during the upgrade.",
        solution: "helm upgrade web bitnami/nginx -n web --reuse-values --set replicaCount=3\nhelm history web -n web\nhelm rollback web 1 -n web\nkubectl -n web get deploy -o custom-columns=NAME:.metadata.name,R:.spec.replicas",
      },
      {
        level: "hard",
        task: "Create a CRD for kind Website (group demo.io, version v1, namespaced) with a required string field spec.url, then create one Website and list it.",
        hint: "Use apiextensions.k8s.io/v1 with an openAPIV3Schema.",
        solution: "apiVersion: apiextensions.k8s.io/v1\nkind: CustomResourceDefinition\nmetadata: {name: websites.demo.io}\nspec:\n  group: demo.io\n  scope: Namespaced\n  names: {plural: websites, singular: website, kind: Website}\n  versions:\n  - name: v1\n    served: true\n    storage: true\n    schema: {openAPIV3Schema: {type: object, properties: {spec: {type: object, required: [url], properties: {url: {type: string}}}}}}",
      },
    ],
    faq: [
      { q: "Should I use Helm or Kustomize?", a: "Use Helm to install third-party software that ships as a chart. Use Kustomize for your own plain YAML across environments. Many teams use both." },
      { q: "Is Kustomize a separate install?", a: "No. It is built into kubectl through kubectl kustomize and kubectl apply -k. A standalone kustomize binary exists if you want a newer version." },
      { q: "What is the difference between a CRD and an operator?", a: "A CRD adds a new object type to the API. An operator is a controller that watches those objects and performs actions to make reality match them." },
    ],
  },
};

export default extra;

import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "cka-exam-prep/drills": {
    plain: [
      "The CKA is a hands-on exam. You get a real terminal and real clusters, and about two hours to finish a list of tasks. There are no multiple-choice questions. A grader checks the final state of the cluster, so what counts is whether the thing works, not how you got there.",
      "Most people who fail know enough Kubernetes. They run out of time. A task that takes 15 minutes because you are searching for a flag costs you two easier tasks later. That is why you drill: you repeat the same kinds of tasks against a timer until they feel automatic.",
      "Four task types come up again and again and are worth drilling first: RBAC (who may do what), etcd backup and restore, NetworkPolicy (which pods may talk to which), and upgrading a cluster with kubeadm. Each has a fixed recipe you can learn by heart.",
      "A good drill is short and honest. Start from a clean namespace or a fresh practice cluster, start a timer, solve the task without looking at your old answer, and finish with a command that proves it worked. Write down your time and the step that slowed you down.",
    ],
    deepDive: [
      {
        heading: "RBAC drills: create, bind, prove",
        body: "RBAC tasks almost always follow the same pattern: create a Role (or ClusterRole) with some verbs on some resources, bind it to a user, group or ServiceAccount, and prove it works. Imperative commands are much faster than writing YAML: kubectl create role, kubectl create rolebinding, and kubectl create clusterrolebinding all take --verb, --resource, --user, --group and --serviceaccount flags.\n\nThe proof is kubectl auth can-i. With --as you can impersonate a user, or a ServiceAccount using the full form system:serviceaccount:NAMESPACE:NAME. Always test one action that should be allowed and one that should be denied, in the right namespace.\n\nCommon slips: binding a Role from another namespace (a RoleBinding can only reference a Role in its own namespace, or a ClusterRole), using the plural pods in can-i but the wrong API group in the role, and forgetting -n.",
        bullets: ["k create role r --verb=get,list,watch --resource=pods,deployments -n dev", "k create rolebinding rb --role=r --serviceaccount=dev:app -n dev", "k auth can-i list pods --as=system:serviceaccount:dev:app -n dev", "k auth can-i delete pods --as=system:serviceaccount:dev:app -n dev  # no"],
      },
      {
        heading: "etcd backup and restore",
        body: "etcd holds the whole cluster state. On a kubeadm cluster it runs as a static pod on the control plane node, and its certificates are in /etc/kubernetes/pki/etcd. To take a snapshot, run etcdctl snapshot save with the endpoint https://127.0.0.1:2379 and three TLS flags: --cacert (ca.crt), --cert (server.crt) and --key (server.key). If you forget the paths, read them from /etc/kubernetes/manifests/etcd.yaml; the drill is partly about knowing where to look.\n\nRestore with etcdutl snapshot restore into a new data directory, for example /var/lib/etcd-restore (older guides use etcdctl snapshot restore, which is deprecated). Then edit the etcd static pod manifest so its hostPath data volume points at the new directory. The kubelet notices the change and restarts etcd; the API server may be unavailable for a minute.\n\nVerify the backup with etcdutl snapshot status FILE -w table, and verify the restore by checking that objects created after the backup are gone.",
        visual: {
          type: "flow",
          title: "etcd restore on a kubeadm control plane",
          steps: [
            { label: "Find cert paths", detail: "Read /etc/kubernetes/manifests/etcd.yaml" },
            { label: "Restore snapshot", detail: "etcdutl snapshot restore into a new data dir" },
            { label: "Edit manifest", detail: "hostPath for etcd-data points to the new dir" },
            { label: "Wait for restart", detail: "Kubelet recreates the etcd static pod" },
            { label: "Verify", detail: "k get pods -A works; newer objects are gone" },
          ],
        },
      },
      {
        heading: "NetworkPolicy drills",
        body: "NetworkPolicies only take effect if the cluster's network plugin enforces them (Calico and Cilium do; plain flannel does not), and exam clusters are set up to enforce them. A policy selects pods with podSelector, and as soon as a pod is selected for a direction (Ingress or Egress), everything in that direction not explicitly allowed is blocked.\n\nThe tricky part is the from and to lists. Two selectors in the same list item (namespaceSelector and podSelector together) mean AND: pods with that label in namespaces with that label. Two separate list items mean OR. One misplaced dash changes the meaning completely.\n\nWhen you restrict egress, remember DNS. Pods look up service names over UDP and TCP port 53, so an egress policy without a DNS rule breaks name resolution. Verify with a throwaway pod: kubectl run tmp --rm -it --image=busybox -- wget -qO- -T 2 http://svc.ns, once from an allowed pod and once from a blocked one.",
        visual: {
          type: "compare",
          title: "One dash changes the meaning",
          columns: [
            { title: "Same list item (AND)", points: ["- namespaceSelector: team=web", "  podSelector: app=front", "Only front pods in web namespaces", "Usually what the task wants"] },
            { title: "Two list items (OR)", points: ["- namespaceSelector: team=web", "- podSelector: app=front", "Any pod in web namespaces", "Or front pods in this namespace"] },
          ],
        },
      },
      {
        heading: "Cluster upgrade with kubeadm",
        body: "You can only upgrade one minor version at a time, for example 1.33 to 1.34, and the control plane goes first. Since 2023 packages come from pkgs.k8s.io, which has one repository per minor version, so the first step is often to change the version in /etc/apt/sources.list.d/kubernetes.list and run apt-get update.\n\nOn the control plane: unhold and install the new kubeadm, run kubeadm upgrade plan, then kubeadm upgrade apply v1.34.x. Drain the node with --ignore-daemonsets, upgrade kubelet and kubectl, run systemctl daemon-reload and systemctl restart kubelet, then uncordon. On each worker: upgrade kubeadm, run kubeadm upgrade node, drain from the control plane, upgrade kubelet and kubectl, restart kubelet, uncordon.\n\nThis is the longest drill, often 10 minutes at first. Most time is lost on package versions: apt-cache madison kubeadm lists the exact strings, such as 1.34.2-1.1.",
        bullets: ["Hold packages again with apt-mark hold after installing", "Drain and uncordon run where kubectl works, usually the control plane", "Verify with k get nodes: VERSION shows the kubelet version"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "What each drill touches",
        layers: [
          { label: "API objects", detail: "RBAC and NetworkPolicy: kubectl only" },
          { label: "Static pod manifests", detail: "etcd restore: edit files in /etc/kubernetes/manifests" },
          { label: "Node packages", detail: "Upgrade: apt, kubeadm, kubelet" },
          { label: "systemd", detail: "Restart kubelet after upgrades or config changes" },
        ],
      },
    ],
    examples: [
      {
        title: "Timed RBAC drill",
        explanation: "Task: in namespace dev, ServiceAccount ci must be able to list and create deployments, and nothing else. Step 1: create the ServiceAccount. Step 2: create a Role with verbs list and create on deployments. Step 3: bind it. Step 4: prove one allowed and one denied action. Typical first try: 4 minutes; target under 2.",
        code: {
          lang: "bash",
          code: "k create ns dev\nk -n dev create sa ci\nk -n dev create role deployer --verb=list,create --resource=deployments\nk -n dev create rolebinding deployer --role=deployer --serviceaccount=dev:ci\nk -n dev auth can-i create deployments --as=system:serviceaccount:dev:ci   # yes\nk -n dev auth can-i delete deployments --as=system:serviceaccount:dev:ci   # no\nk -n dev auth can-i list pods --as=system:serviceaccount:dev:ci            # no",
        },
      },
      {
        title: "Timed etcd backup drill",
        explanation: "Task: save a snapshot of etcd to /opt/etcd-backup.db. Step 1: get the cert paths from the manifest with grep. Step 2: run etcdctl with the four connection flags. Step 3: check the file with etcdutl snapshot status. On the real exam the task text tells you which node to work on; if etcdctl is missing locally, the task will say where to run it.",
        code: {
          lang: "bash",
          code: "grep -E 'cert-file|key-file|trusted-ca-file' /etc/kubernetes/manifests/etcd.yaml\nETCDCTL_API=3 etcdctl snapshot save /opt/etcd-backup.db \\\n  --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key\netcdutl snapshot status /opt/etcd-backup.db -w table",
        },
      },
    ],
    cheatSheet: [
      "k auth can-i VERB RESOURCE --as=system:serviceaccount:NS:NAME -n NS",
      "A RoleBinding can reference a Role in its own namespace or any ClusterRole",
      "etcd certs live in /etc/kubernetes/pki/etcd; read paths from manifests/etcd.yaml",
      "Restore with etcdutl snapshot restore --data-dir NEW, then point the manifest at NEW",
      "NetworkPolicy: selectors in one list item = AND, separate items = OR",
      "Egress policies must allow port 53 UDP and TCP or DNS breaks",
      "Upgrade one minor at a time: control plane first, then each worker",
      "apt-cache madison kubeadm shows the exact package versions",
    ],
    quiz: [
      {
        q: "A RoleBinding in namespace dev references a Role named reader in namespace prod. What happens?",
        options: ["It grants reader in both namespaces", "It grants reader in prod only", "It does not work; a RoleBinding can only use a Role from its own namespace or a ClusterRole", "Kubernetes copies the Role into dev"],
        answer: 2,
        why: "roleRef has no namespace field; a Role is always looked up in the binding's namespace.",
      },
      {
        q: "After an etcd restore into /var/lib/etcd-restore, what else must you do?",
        options: ["Point the etcd static pod's data hostPath at the new directory", "Run kubeadm init again", "Delete all pods", "Restart every worker node"],
        answer: 0,
        why: "Until the manifest uses the new data directory, etcd keeps running on the old data.",
      },
      {
        q: "You add an egress policy allowing only port 5432 to the database, and now the app cannot resolve db.prod. Why?",
        options: ["The database is down", "Egress policies block all ingress too", "Service names do not work across namespaces", "DNS on port 53 is no longer allowed"],
        answer: 3,
        why: "Once egress is restricted, DNS lookups to the cluster DNS must be allowed explicitly.",
      },
      {
        q: "The cluster runs 1.32 and the task asks for 1.34. What is the correct approach?",
        options: ["Upgrade straight to 1.34", "Upgrade to 1.33 first, then to 1.34", "Upgrade workers first", "Reinstall the cluster"],
        answer: 1,
        why: "kubeadm supports upgrading only one minor version at a time.",
      },
      {
        q: "Which command proves a ServiceAccount cannot delete pods?",
        options: ["k get sa app -o yaml", "k describe role app", "k auth can-i delete pods --as=system:serviceaccount:dev:app -n dev", "k get pods --as=app"],
        answer: 2,
        why: "auth can-i with impersonation asks the API server's own authorizer and answers yes or no.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a ClusterRole that can get and list nodes and bind it to user jane. Prove she can list nodes but not delete them. Target: under 2 minutes.",
        hint: "Nodes are cluster-scoped, so you need a ClusterRoleBinding.",
        solution: "k create clusterrole node-reader --verb=get,list --resource=nodes\nk create clusterrolebinding jane-nodes --clusterrole=node-reader --user=jane\nk auth can-i list nodes --as=jane     # yes\nk auth can-i delete nodes --as=jane   # no",
      },
      {
        level: "medium",
        task: "In namespace prod, allow ingress to pods labelled app=db on port 5432 only from pods labelled app=api in the same namespace, and deny all other ingress to the db pods. Target: under 5 minutes.",
        hint: "Start from the NetworkPolicy example on the docs page and edit it.",
        solution: "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: { name: db-from-api, namespace: prod }\nspec:\n  podSelector: { matchLabels: { app: db } }\n  policyTypes: [Ingress]\n  ingress:\n    - from: [ { podSelector: { matchLabels: { app: api } } } ]\n      ports: [ { protocol: TCP, port: 5432 } ]",
      },
      {
        level: "hard",
        task: "Upgrade the control plane node of a practice cluster by one minor version, including the package repository change. Time yourself and note the slowest step.",
        hint: "Change the pkgs.k8s.io minor version, then plan, apply, drain, kubelet, uncordon.",
        solution: "sed -i 's/v1.33/v1.34/' /etc/apt/sources.list.d/kubernetes.list\napt-get update && apt-cache madison kubeadm | head -3\napt-mark unhold kubeadm && apt-get install -y kubeadm='1.34.2-1.1' && apt-mark hold kubeadm\nkubeadm upgrade plan && kubeadm upgrade apply v1.34.2 -y\nk drain cp1 --ignore-daemonsets\napt-mark unhold kubelet kubectl && apt-get install -y kubelet='1.34.2-1.1' kubectl='1.34.2-1.1'\napt-mark hold kubelet kubectl && systemctl daemon-reload && systemctl restart kubelet\nk uncordon cp1 && k get nodes",
      },
    ],
    faq: [
      { q: "How long is the CKA exam and what is the pass mark?", a: "Two hours of hands-on tasks, and the pass mark is 66%. Registration includes one free retake." },
      { q: "Which Kubernetes version does the CKA use?", a: "The exam tracks a recent minor release and is updated a few weeks after each new version. Check the Linux Foundation's exam page for the current version before you practise." },
      { q: "Do I need to memorise YAML?", a: "No. You can open the official docs during the exam and use kubectl create with --dry-run=client -o yaml to generate most manifests. Memorise where to find things and the imperative commands." },
      { q: "Where can I practise these drills for free?", a: "A local kubeadm cluster on two virtual machines is the closest to the exam. Tools like kind or minikube work for RBAC and NetworkPolicy drills but not for kubeadm upgrades." },
    ],
  },

  "cka-exam-prep/simulator": {
    plain: [
      "When you register for the CKA you get two sessions on killer.sh, an exam simulator. It gives you a remote desktop with clusters and a task list that looks and feels like the real exam, so the exam day environment is no longer a surprise.",
      "The simulator is harder on purpose. It has more tasks than the real exam and some are tricky. Many people who pass the real exam scored much lower on killer.sh. So the score is not a prediction; it is a list of things to learn.",
      "Each session stays open for 36 hours after you start it. The best use is: sit the first two hours under exam rules, then spend the rest of the window reading every solution and redoing the tasks you missed, from scratch, in the same environment.",
      "Keep the second session for later. Study the weak spots the first session showed, drill them for a week or two, then use session two as a final rehearsal close to your exam date.",
    ],
    deepDive: [
      {
        heading: "Sitting a session under exam rules",
        body: "Treat the first two hours exactly like the exam. Close everything else. Use only the simulator's own browser with the allowed documentation, because the real exam runs in a remote desktop through the PSI secure browser and you cannot use your own bookmarks or tabs. Do your normal terminal setup at the start, and practise switching to the right cluster or host at the beginning of every task, as each task instructs.\n\nRead each task fully before typing. Note its weight; tasks are worth different amounts. If a task stalls for more than about 8 minutes, flag it and move on. Keep a simple note of the order you did tasks in and which you skipped.\n\nWhen two hours are up, stop and record what you finished. That number, not the extra tasks you could do in hour three, is your honest result.",
        visual: {
          type: "flow",
          title: "Using the 36 hour window well",
          steps: [
            { label: "Hours 0 to 2", detail: "Exam rules: allowed docs only, flag and skip" },
            { label: "Score and log", detail: "Record what you finished in two hours" },
            { label: "Read solutions", detail: "Compare each with what you did" },
            { label: "Redo misses", detail: "From scratch, no copying from solutions" },
            { label: "Write weak spots", detail: "Grouped by domain and command" },
          ],
        },
      },
      {
        heading: "Reviewing every solution, including the ones you got right",
        body: "killer.sh solutions show a full worked answer for each task, often with a faster command or a cleaner way to verify. Read them all. For tasks you passed, look for speed: did they use an imperative command where you wrote YAML, or a jsonpath query where you scrolled through describe output?\n\nFor tasks you failed, find the exact reason. Was it a concept gap (you did not know how a static pod gets restarted), a docs gap (you could not find the page in time), a command gap (wrong flag), or an exam-technique slip (wrong cluster, wrong namespace, typo in a name)? Each needs a different fix.\n\nCollect useful commands into your own notes as you go. Things like kubectl get pods -A --sort-by=.metadata.creationTimestamp or -o jsonpath for one field come up again in the real exam.",
        bullets: ["k get pods -A --field-selector=status.phase!=Running", "k get nodes -o jsonpath='{.items[*].status.nodeInfo.kubeletVersion}'", "k top pods -A --sort-by=memory (needs metrics-server)", "k explain deployment.spec.strategy --recursive"],
      },
      {
        heading: "Redoing missed tasks from scratch",
        body: "Reading a solution feels like learning, but your hands have not done it. During the 36-hour window the environment stays available, so reset what you can (delete the objects you created, or use a new namespace) and solve each missed task again without looking. Time it.\n\nIf a task depends on state you cannot reset, such as a broken kubelet you already fixed, reproduce it on your own practice cluster: stop the kubelet, edit its config to point at a wrong file, and practise finding the problem with systemctl status kubelet and journalctl -u kubelet.\n\nA task is truly learned when you can redo it in less than its fair share of time. On the real exam, two hours for around 15 to 20 tasks means about 6 to 8 minutes each.",
      },
      {
        heading: "Turning recurring mistakes into a study plan",
        body: "After session one, put every miss and every slow task into a weak-spot log with three columns: domain, what went wrong, and the fix. Then count. The CKA curriculum weights troubleshooting most heavily (30%), followed by cluster architecture, installation and configuration (25%), services and networking (20%), workloads and scheduling (15%) and storage (10%), so a weak troubleshooting habit costs the most points.\n\nPatterns matter more than single tasks. Missing three tasks because of a wrong namespace is one fix (always pass -n or set the context namespace), worth more than learning one rare feature.\n\nDrill each weak spot daily until it is under target time, then take session two. Compare the two logs: the same mistake appearing twice means the fix did not stick and needs another approach.",
        visual: {
          type: "tree",
          title: "Weak-spot log, grouped",
          root: "Session 1 misses",
          children: [
            { label: "Concept gaps", children: ["Static pod restart behaviour", "PV and PVC binding rules"] },
            { label: "Docs gaps", children: ["Could not find Gateway API example", "Slow to find etcd page"] },
            { label: "Command gaps", children: ["jsonpath syntax", "kubeadm token create --print-join-command"] },
            { label: "Technique slips", children: ["Wrong namespace twice", "Did not verify a Service endpoint"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Simulator vs real exam",
        columns: [
          { title: "killer.sh session", points: ["More tasks than the real exam", "Deliberately harder", "Open for 36 hours with solutions", "Two sessions per registration"] },
          { title: "Real CKA", points: ["About 15 to 20 tasks", "Two hours, no extra time", "Pass mark 66%", "No solutions, results by email"] },
        ],
      },
    ],
    examples: [
      {
        title: "Session one, from start to plan",
        explanation: "Saturday 10:00: start session one. Step 1: two hours under exam rules; finish 14 of 17 tasks attempted, 3 skipped. Step 2: the simulator scores you at 52%; normal for killer.sh. Step 3: Saturday afternoon: read all solutions and note four faster commands. Step 4: Sunday: redo the 7 missed tasks from scratch; 5 now pass in under 6 minutes. Step 5: weak-spot log: troubleshooting (kubelet and DNS), Gateway API docs, and one wrong-namespace slip. Step 6: plan ten days of drills before session two.",
      },
      {
        title: "Reproducing a kubelet failure to practise",
        explanation: "A simulator task had a worker node NotReady because the kubelet was misconfigured, and you could not reset it. Recreate it on your own cluster. Step 1: break the kubelet on purpose. Step 2: from the control plane, see the node go NotReady. Step 3: on the node, read the status and the logs to find the cause. Step 4: fix and verify.",
        code: {
          lang: "bash",
          code: "# on the worker (practice cluster only)\nsudo sed -i 's#/etc/kubernetes/pki/ca.crt#/etc/kubernetes/pki/nope.crt#' /var/lib/kubelet/config.yaml\nsudo systemctl restart kubelet\n# on the control plane\nk get nodes          # worker turns NotReady within about a minute\n# back on the worker: find the cause\nsudo systemctl status kubelet\nsudo journalctl -u kubelet --no-pager | tail -20   # error loading nope.crt\nsudo sed -i 's#nope.crt#ca.crt#' /var/lib/kubelet/config.yaml && sudo systemctl restart kubelet",
        },
      },
    ],
    cheatSheet: [
      "Two killer.sh sessions per registration, each open 36 hours from activation",
      "Score only the first two hours; that is your honest result",
      "A low killer.sh score is normal; the simulator is harder than the exam",
      "Redo every miss from scratch; reading a solution is not practice",
      "Miss types: concept, docs, command, technique; each needs a different fix",
      "Real exam: two hours, about 15 to 20 tasks, pass at 66%",
      "Kubelet problems: systemctl status kubelet, then journalctl -u kubelet",
    ],
    quiz: [
      {
        q: "You score 48% on your first killer.sh session. What does it mean?",
        options: ["You will fail the real exam", "The simulator is broken", "You should book the exam immediately", "It is a normal result on a harder test; use the misses as a study list"],
        answer: 3,
        why: "killer.sh is deliberately harder, so the misses matter more than the number.",
      },
      {
        q: "What is the best use of the 36-hour window after your two timed hours?",
        options: ["Redo missed tasks from scratch and review every solution", "Start the second session", "Close it to save time", "Only read the solutions for tasks you passed"],
        answer: 0,
        why: "The environment stays available, so you can practise the exact tasks you missed.",
      },
      {
        q: "Which CKA domain has the highest weight in the current curriculum?",
        options: ["Storage", "Troubleshooting", "Workloads and scheduling", "Services and networking"],
        answer: 1,
        why: "Troubleshooting is 30% of the exam.",
      },
      {
        q: "Three of your misses were caused by working in the wrong namespace. What kind of fix is this?",
        options: ["Concept study", "A new docs bookmark", "An exam technique habit, such as always passing -n", "Learning a new command"],
        answer: 2,
        why: "The knowledge was there; the slip was in how you worked under time pressure.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write the plan for your first simulator session: date, start time, exam-rule checklist, and the review block afterwards.",
        hint: "Leave a full day for review inside the 36-hour window.",
        solution: "Sat 10:00 start session 1 (window ends Sun 22:00)\nRules: one screen, allowed docs only, phone away, 2 h timer, flag after 8 min\n12:00 stop, record finished tasks\n14:00 to 18:00 read every solution, note faster commands\nSun 10:00 to 15:00 redo missed tasks, timed\nSun 16:00 write weak-spot log and the drill plan",
      },
      {
        level: "medium",
        task: "From your session, list five commands from the solutions that were faster than what you did, and drill each three times.",
        hint: "Look for imperative create commands, jsonpath queries and --sort-by.",
        solution: "1. k create ingress web --rule=\"app.local/*=web:80\"\n2. k get pods -A --sort-by=.metadata.creationTimestamp\n3. k get nodes -o jsonpath='{.items[*].metadata.name}'\n4. k set image deploy/web nginx=nginx:1.27\n5. kubeadm token create --print-join-command\nDrill: run each in a scratch namespace, 3 times, timed.",
      },
      {
        level: "hard",
        task: "After session two, compare both weak-spot logs. Identify which mistakes repeated, explain why the fix did not stick, and design a new fix for each.",
        hint: "A repeated mistake usually means you read about it but did not drill it.",
        solution: "Repeated: NetworkPolicy AND vs OR (both sessions)\nWhy: read the docs once, never drilled\nNew fix: 5 policies a day for 3 days, verify each with wget from 2 pods\nRepeated: slow to find the etcd docs page\nWhy: relied on memory of a URL\nNew fix: practise reaching it by docs search in under 30 s, 5 times",
      },
    ],
    faq: [
      { q: "Is killer.sh harder than the real CKA?", a: "Yes, on purpose. It has more and harder tasks, so many people score well below their real exam result." },
      { q: "When should I use the second killer.sh session?", a: "After you have studied and drilled the weak spots from the first one, ideally a few days to a week before the exam." },
      { q: "Can I buy more simulator sessions?", a: "Yes, killer.sh sells extra sessions, and other practice environments exist. Two well-reviewed sessions plus your own drills are enough for most people." },
    ],
  },

  "cka-exam-prep/final-review": {
    plain: [
      "The last days before the exam are not for learning new topics. They are for making the start of the exam calm and automatic, and for having a clear plan for when things go wrong, such as a task that will not work.",
      "The exam runs in a remote Linux desktop that you open through a secure browser. Inside it you have a terminal and a Firefox window where you may use the official Kubernetes documentation. You cannot use your own bookmarks, so practise finding pages with the docs search box.",
      "Spend no more than a minute or two on setup. On recent exams the alias k and kubectl autocompletion are usually already configured, so check first. Then add two shell variables that save typing, and set vim to use two spaces instead of tabs.",
      "Finally, have a time plan. Do quick, high-weight tasks first, skip anything that gets stuck, and come back at the end. Every task starts with the same habit: switch to the cluster or host the task names, before you type anything else.",
    ],
    deepDive: [
      {
        heading: "Finding docs fast without your own bookmarks",
        body: "In the exam's remote desktop you use a Firefox window with access to kubernetes.io/docs and the few other sites listed in the official allowed-resources page. Your personal browser bookmarks are not there. So \"finalising bookmarks\" really means knowing the exact page titles and search words that take you to each page in seconds.\n\nMake a short list of the pages you open most and practise reaching each through the docs search: \"Operating etcd clusters\" for backup and restore, \"Upgrading kubeadm clusters\", \"Network Policies\", \"Configure a Pod to Use a PersistentVolume for Storage\", \"Ingress\", the Gateway API page, and \"kubectl Quick Reference\" for jsonpath and common commands.\n\nAlso learn to skip the docs entirely: kubectl explain pod.spec.containers.livenessProbe shows field names right in the terminal, and --dry-run=client -o yaml generates most YAML for you.",
        bullets: ["Copy YAML from docs with the copy icon, then fix indentation in vim", "kubectl explain RESOURCE.field --recursive shows the full tree", "In the remote terminal, copy is Ctrl+Shift+C and paste is Ctrl+Shift+V"],
      },
      {
        heading: "A terminal setup you can type in 60 seconds",
        body: "First check what exists: type k get nodes. If the alias works and tab completion completes resource names, do not redo it. Then add only what saves time all exam long. export do=\"--dry-run=client -o yaml\" lets you write k create deploy web --image=nginx $do > web.yaml. export now=\"--force --grace-period=0\" lets you delete a pod instantly with k delete pod x $now.\n\nIn ~/.vimrc, set expandtab tabstop=2 shiftwidth=2 turns tabs into two spaces, which prevents the most common YAML error. Remember that each task may put you on a different host through ssh, and settings in your first shell may not follow you there; know your one-line setup so you can repeat it if needed.\n\nPractise this setup at the start of every drill session for a week so it costs no thought on the day.",
        visual: {
          type: "flow",
          title: "Setup routine",
          steps: [
            { label: "Test what exists", detail: "k get nodes and tab completion" },
            { label: "Add shortcuts", detail: "export do and now" },
            { label: "Fix vim", detail: "expandtab, tabstop=2, shiftwidth=2" },
            { label: "Scan the tasks", detail: "Note weights and quick wins" },
            { label: "Start task one", detail: "Switch context or ssh as instructed" },
          ],
        },
      },
      {
        heading: "Skip-and-return time strategy",
        body: "Two hours for roughly 15 to 20 tasks gives about 6 to 8 minutes each. Tasks have different weights, shown next to each one, and a fully done small task is worth more than a half-done big one, because partial credit is not something to count on.\n\nOn the first pass, do each task in order but set a personal limit of about 8 minutes. If you are not close to done, write the task number on the provided notepad or flag it, and move on. Quick wins like creating a ServiceAccount, scaling a deployment or exposing a service should take two or three minutes and build confidence.\n\nAim to finish the first pass with about 15 to 20 minutes left. Then return to flagged tasks, starting with the highest weight that you think you can finish. In the last two minutes, do not start anything new; check that files you were asked to write exist at the exact path.",
        visual: {
          type: "cycle",
          title: "Per-task routine",
          steps: [
            { label: "Switch context", detail: "Copy the given command from the task" },
            { label: "Read it twice", detail: "Names, namespace, output file paths" },
            { label: "Solve", detail: "Imperative first, YAML when needed" },
            { label: "Verify", detail: "get, describe, can-i or curl" },
            { label: "Over 8 minutes?", detail: "Flag it and move on" },
          ],
        },
      },
      {
        heading: "The day before and exam morning",
        body: "Run the PSI system check on the same computer, network and room you will use. Use a wired connection if you can and close other apps that use bandwidth. A single external monitor or the laptop screen is allowed, but not both at once. Clear the desk; the proctor will ask you to show the room and your desk on camera.\n\nHave your government ID ready with a name that matches your registration exactly. Check in 30 minutes early; the check-in process can take a while.\n\nDo not cram. A short warm-up drill (one RBAC and one NetworkPolicy task) is enough. During the exam, if the environment misbehaves, tell the proctor through the chat rather than losing time silently. After the exam, results arrive by email, usually within 24 hours, and a free retake is included if you need it.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Docs pages to reach by search",
        root: "kubernetes.io/docs search",
        children: [
          { label: "Cluster admin", children: ["Operating etcd clusters", "Upgrading kubeadm clusters"] },
          { label: "Networking", children: ["Network Policies", "Ingress", "Gateway API"] },
          { label: "Storage", children: ["Persistent Volumes", "Configure a Pod to Use a PersistentVolume"] },
          { label: "Security", children: ["Using RBAC Authorization", "Configure Service Accounts for Pods"] },
          { label: "Reference", children: ["kubectl Quick Reference", "JSONPath Support"] },
        ],
      },
    ],
    examples: [
      {
        title: "Using the shortcuts on a real task",
        explanation: "Task: create a deployment web in namespace shop with image nginx:1.27 and 3 replicas, add a memory limit of 128Mi, and expose it on port 80. Step 1: generate YAML with $do instead of writing it. Step 2: add the limit in vim (two-space indentation). Step 3: apply, expose and verify. Total about 3 minutes.",
        code: {
          lang: "bash",
          code: "export do=\"--dry-run=client -o yaml\"\nk -n shop create deploy web --image=nginx:1.27 --replicas=3 $do > web.yaml\nvim web.yaml     # under the container add:\n#   resources:\n#     limits:\n#       memory: 128Mi\nk apply -f web.yaml\nk -n shop expose deploy web --port=80\nk -n shop get deploy,svc,endpoints web",
        },
      },
      {
        title: "A skip-and-return decision",
        explanation: "Minute 52: you are on task 9, a 7% Gateway API task, and after 8 minutes the HTTPRoute still does not attach to the Gateway. Step 1: write \"9: route not accepted, check parentRefs and listener\" in the notepad and flag it. Step 2: tasks 10 to 16 take 38 minutes and are all verified. Step 3: at minute 100, return to task 9 with fresh eyes; k describe httproute shows the parentRef name has a typo. Fixed in 3 minutes. Step 4: last 10 minutes on the other flagged task.",
      },
    ],
    cheatSheet: [
      "Your own browser bookmarks are not available: practise reaching pages by docs search",
      "Check k and completion first; they are usually preset",
      "export do=\"--dry-run=client -o yaml\" and export now=\"--force --grace-period=0\"",
      "~/.vimrc: set expandtab tabstop=2 shiftwidth=2",
      "Remote terminal copy and paste: Ctrl+Shift+C and Ctrl+Shift+V",
      "First command of every task: the context switch or ssh the task gives you",
      "About 8 minutes without progress: flag, note why, move on",
      "Results arrive by email, usually within 24 hours; one free retake is included",
    ],
    quiz: [
      {
        q: "Why should you practise finding docs pages by search rather than relying on bookmarks?",
        options: ["The docs search is faster than any bookmark", "Bookmarks are allowed only for CKAD", "Your personal bookmarks are not available inside the exam's remote desktop", "kubernetes.io blocks bookmarks"],
        answer: 2,
        why: "The exam runs in a remote desktop browser that does not have your own bookmarks.",
      },
      {
        q: "What should you do first on every task?",
        options: ["Switch to the cluster or host the task names", "Open the docs", "Delete old pods", "Reset your vim settings"],
        answer: 0,
        why: "Working on the wrong cluster can make a correct answer score zero.",
      },
      {
        q: "Which vim settings prevent tab characters breaking your YAML?",
        options: ["set number", "set paste", "syntax on", "set expandtab tabstop=2 shiftwidth=2"],
        answer: 3,
        why: "expandtab turns tabs into spaces, and YAML does not allow tabs for indentation.",
      },
      {
        q: "You have spent 9 minutes on a 4% task and are not close. What is the best move?",
        options: ["Keep going until it works", "Flag it with a short note and move to the next task", "Restart the exam environment", "Skip all remaining tasks of that type"],
        answer: 1,
        why: "Time spent here costs easier tasks later; come back with fresh eyes if time remains.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Time your full setup routine three times in a row on a practice machine. Aim for under 60 seconds.",
        hint: "Only add what is missing: check the alias and completion first.",
        solution: "k get nodes                    # alias works?\nk get po <TAB>                 # completion works?\nexport do=\"--dry-run=client -o yaml\"\nexport now=\"--force --grace-period=0\"\necho 'set expandtab tabstop=2 shiftwidth=2' >> ~/.vimrc\n# times: 75 s, 55 s, 48 s",
      },
      {
        level: "medium",
        task: "For each of eight core docs pages, practise reaching it from the docs home using only the search box. Write the search words that work and your time.",
        hint: "Short, exact titles work better than long phrases.",
        solution: "\"etcd\" -> Operating etcd clusters for Kubernetes (8 s)\n\"kubeadm upgrade\" -> Upgrading kubeadm clusters (6 s)\n\"network policies\" -> Network Policies (5 s)\n\"persistent volume pod\" -> Configure a Pod to Use a PersistentVolume (10 s)\n\"ingress\" -> Ingress (4 s)\n\"gateway api\" -> Gateway API (6 s)\n\"rbac\" -> Using RBAC Authorization (5 s)\n\"kubectl quick reference\" -> kubectl Quick Reference (7 s)",
      },
      {
        level: "hard",
        task: "Run a full two-hour mock using your own task list of 16 tasks with weights, applying the setup routine, the per-task routine and the 8-minute skip rule. Record when you hit each quarter of the list.",
        hint: "Checkpoints: task 4 by 30 minutes, task 8 by 60, task 12 by 90.",
        solution: "Setup done 0:01\nTask 4 at 0:27, task 8 at 0:58, task 12 at 1:31 (slightly behind)\nFlagged: 6, 11 (8-minute rule)\nFirst pass done 1:42; returned to 11 (fixed), 6 (not fixed)\nFinal check: output files exist at the asked paths\nNote: speed up storage tasks; they caused the delay.",
      },
    ],
    faq: [
      { q: "Can I use the Kubernetes docs during the CKA?", a: "Yes. You may use kubernetes.io/docs and the other resources listed on the Linux Foundation's allowed-resources page, inside the exam's own browser." },
      { q: "Is the kubectl alias k already set up in the exam?", a: "On recent exams it usually is, along with bash completion. Check with one command at the start and only add what is missing." },
      { q: "How do I copy and paste in the exam terminal?", a: "Use Ctrl+Shift+C and Ctrl+Shift+V in the terminal. Normal Ctrl+C in a terminal stops the running command." },
      { q: "What happens if my internet connection drops during the exam?", a: "The session usually lets you reconnect, and the timer may keep running. Use a stable wired connection and contact support through the proctor if problems last." },
    ],
  },
};

export default extra;

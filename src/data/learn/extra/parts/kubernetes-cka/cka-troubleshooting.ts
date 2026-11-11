import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "cka-troubleshooting/debug-apps": {
    plain: [
      "When a Pod fails, Kubernetes almost always tells you why. The trick is knowing where to look. The STATUS column in kubectl get pods gives the headline, kubectl describe gives the story, and kubectl logs gives the app's own words.",
      "Think of it as three questions in order. Did the Pod get a node? If not, it is Pending and the scheduler explains why in the events. Did the image download? If not, you see ErrImagePull or ImagePullBackOff. Did the program keep running? If not, you see CrashLoopBackOff and need the logs.",
      "BackOff just means waiting. After each failure Kubernetes waits a bit longer before it tries again: 10 seconds, then 20, then 40, up to 5 minutes. So a Pod in CrashLoopBackOff is not stuck; it is retrying slowly.",
      "Most Pods are created by a Deployment or another controller. If you fix the Pod directly, the controller may replace it with an unfixed copy. Fix the owner instead, and let it roll out a healthy Pod.",
    ],
    deepDive: [
      {
        heading: "Exit codes tell you who stopped the container",
        body: "kubectl describe pod shows Last State: Terminated with a Reason and an Exit Code. 0 means the program finished normally; in a Deployment that still causes restarts, because long-running containers are expected never to exit. 1 (or another small number) is an error from the app itself, so read the logs. 126 means the command could not run (no permission), and 127 means the command was not found in the image.\n\nCodes above 128 mean a signal killed the process: 128 plus the signal number. 137 is SIGKILL, from the OOM killer (Reason OOMKilled) or after a liveness probe failure when the process ignored SIGTERM. 143 is SIGTERM, a normal shutdown request. 139 is a segmentation fault inside the app.",
        bullets: ["kubectl get pod P -o jsonpath='{.status.containerStatuses[0].lastState.terminated}'", "A wrong command often shows RunContainerError or StartError instead", "Restart count climbs with every crash; watch it with -w"],
      },
      {
        heading: "Reading CrashLoopBackOff causes",
        body: "kubectl logs POD shows the current attempt, which may be empty because it just started. kubectl logs POD --previous shows the attempt that crashed, which is usually what you want. For multi-container Pods add -c NAME.\n\nIf the logs are empty, the program probably died before printing anything: a bad command or args, a missing file, or a missing environment variable. Compare the command in the Pod spec with what the image expects. If describe shows Liveness probe failed events before each restart, the app is fine but the probe is wrong (wrong port or path, or initialDelaySeconds too short for a slow app). A failing readiness probe never restarts a container; it just leaves the Pod at 0/1 Ready and out of the Service.",
        visual: {
          type: "flow",
          title: "Triage a CrashLoopBackOff",
          steps: [
            { label: "describe pod", detail: "Exit code, reason and probe events" },
            { label: "logs --previous", detail: "Output from the crashed attempt" },
            { label: "Check spec", detail: "command, args, env, mounts, probes" },
            { label: "Fix the owner", detail: "kubectl edit or set on the Deployment" },
            { label: "Watch rollout", detail: "New Pod Running, restarts stay at 0" },
          ],
        },
      },
      {
        heading: "Image pull failures",
        body: "A pull goes through the kubelet and the container runtime on the node, not through your laptop. The first failure shows ErrImagePull; repeated failures become ImagePullBackOff. The event message tells you which case you are in: not found or manifest unknown means the name or tag is wrong; pull access denied, unauthorized or 401 means the registry needs credentials.\n\nFor private registries, create a docker-registry Secret in the Pod's namespace and list it under spec.imagePullSecrets, or attach it to the service account so every Pod using it gets the secret. imagePullPolicy matters too: Always pulls every time, IfNotPresent uses a cached copy (the default unless the tag is latest), and Never only uses images already on the node.",
        bullets: ["kubectl create secret docker-registry regcred --docker-server=REG --docker-username=U --docker-password=P", "kubectl patch sa default -p '{\"imagePullSecrets\":[{\"name\":\"regcred\"}]}'", "On the node: sudo crictl pull IMAGE tests the pull directly"],
      },
      {
        heading: "Pending, and when to use kubectl debug",
        body: "A Pending Pod with a FailedScheduling event lists every node and why it was rejected: Insufficient cpu or memory (requests too big), untolerated taint, didn't match node affinity/selector, or unbound PersistentVolumeClaims. A Pending Pod with no events at all usually means the scheduler is not running. If a Deployment shows no Pods at all, the problem is above the Pod: describe the ReplicaSet to find quota or admission errors.\n\nFor a running but misbehaving container, kubectl debug -it POD --image=busybox:1.36 --target=CONTAINER adds an ephemeral debug container that shares the process namespace, handy for distroless images with no shell. For a crashing container, kubectl debug POD -it --copy-to=POD-debug --container=CONTAINER -- sh makes a copy with the command replaced by a shell, so you can look around inside the same image.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Where each clue lives",
        root: "Clues about a failing Pod",
        children: [
          { label: "kubectl get pod", children: ["STATUS headline", "READY and RESTARTS"] },
          { label: "kubectl describe pod", children: ["Events at the bottom", "Last State and Exit Code", "Probe failures"] },
          { label: "kubectl logs", children: ["--previous for crashes", "-c for one container"] },
          { label: "Owner objects", children: ["describe rs for quota errors", "rollout status for the Deployment"] },
          { label: "On the node", children: ["crictl ps -a and crictl logs", "journalctl -u kubelet"] },
        ],
      },
    ],
    examples: [
      {
        title: "A typo in the command",
        explanation: "Deployment api shows CrashLoopBackOff and empty logs. Step 1: describe shows Exit Code 127 or a StartError with executable file not found. Step 2: print the command from the Deployment; it says pyhton instead of python. Step 3: fix it on the Deployment with a JSON patch. Step 4: watch the rollout finish and the restart count stay at 0.",
        code: {
          lang: "bash",
          code: "kubectl get pods -l app=api\nkubectl describe pod -l app=api | grep -E 'Reason|Exit Code|Message'\nkubectl get deploy api -o jsonpath='{.spec.template.spec.containers[0].command}'; echo\n# [\"pyhton\",\"app.py\"]\nkubectl patch deploy api --type=json -p \\\n  '[{\"op\":\"replace\",\"path\":\"/spec/template/spec/containers/0/command/0\",\"value\":\"python\"}]'\nkubectl rollout status deploy api\nkubectl get pods -l app=api",
        },
      },
      {
        title: "A Pod that is Running but never Ready",
        explanation: "Pod web shows 0/1 READY and the Service has no endpoints, but nothing restarts. Step 1: describe shows Readiness probe failed: connection refused on port 8080. Step 2: check which port the app listens on; nginx uses 80. Step 3: fix the probe port in the Deployment. Step 4: the Pod turns 1/1 and the Service gets an endpoint.",
        code: {
          lang: "bash",
          code: "kubectl get pod -l app=web           # 0/1 Running, 0 restarts\nkubectl describe pod -l app=web | grep -i readiness\n# Readiness probe failed: dial tcp 10.244.1.9:8080: connect: connection refused\nkubectl edit deploy web               # readinessProbe.httpGet.port: 80\nkubectl rollout status deploy web\nkubectl get endpointslices -l kubernetes.io/service-name=web",
        },
      },
    ],
    cheatSheet: [
      "Exit 127 = command not found; 137 = SIGKILL (OOM or liveness); 143 = SIGTERM",
      "kubectl logs POD --previous -c CONTAINER for the attempt that crashed",
      "ErrImagePull then ImagePullBackOff: read the event for not found versus unauthorized",
      "Readiness failure = not Ready, no restarts; liveness failure = restarts",
      "No Pods for a Deployment at all: kubectl describe rs for quota or admission errors",
      "kubectl debug -it POD --image=busybox:1.36 --target=app adds a debug container",
      "Crash back-off doubles from 10s up to a 5 minute cap",
    ],
    quiz: [
      {
        q: "A container exits with code 0 again and again in a Deployment. Why does it show CrashLoopBackOff?",
        options: ["Exit code 0 means OOM", "The image is missing", "Deployment Pods use restartPolicy Always, so any exit is restarted", "The liveness probe is failing"],
        answer: 2,
        why: "Long-running workloads are expected never to exit, so even a clean exit is restarted with back-off.",
      },
      {
        q: "An event says pull access denied, repository does not exist or may require authorization. What do you check?",
        options: ["The CPU request", "The image name and an imagePullSecret for the registry", "The readiness probe", "The node's taints"],
        answer: 1,
        why: "That message appears for both a wrong name and missing credentials.",
      },
      {
        q: "Which command shows the output of the container run that just crashed?",
        options: ["kubectl logs POD --previous", "kubectl logs POD -f", "kubectl describe pod POD", "kubectl get events"],
        answer: 0,
        why: "--previous reads the logs of the last terminated instance of the container.",
      },
      {
        q: "A Pod stays Pending and kubectl describe shows no events at all. Most likely cause?",
        options: ["The image tag is wrong", "A NetworkPolicy blocks it", "The node is out of disk", "The scheduler is not running"],
        answer: 3,
        why: "Without a scheduler nobody even tries to place the Pod, so no FailedScheduling event appears.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a Pod bad with image nginx:9.9.9 and write the exact waiting reason to /opt/reason.txt.",
        hint: "The reason lives in status.containerStatuses[0].state.waiting.",
        solution: "kubectl run bad --image=nginx:9.9.9\nsleep 20\nkubectl get pod bad -o jsonpath='{.status.containerStatuses[0].state.waiting.reason}' > /opt/reason.txt\ncat /opt/reason.txt     # ErrImagePull or ImagePullBackOff",
      },
      {
        level: "medium",
        task: "Create a Pod that runs busybox with sh -c 'echo starting; exit 3'. Find the exit code and the last log line, then explain the restart count growth.",
        hint: "Use --previous, and watch RESTARTS for a few minutes.",
        solution: "kubectl run crash --image=busybox:1.36 -- sh -c 'echo starting; exit 3'\nkubectl get pod crash -w             # Error, then CrashLoopBackOff\nkubectl logs crash --previous        # starting\nkubectl get pod crash -o jsonpath='{.status.containerStatuses[0].lastState.terminated.exitCode}'\n# 3. Restarts grow more slowly over time: the back-off\n# doubles from 10s up to 5 minutes between attempts.",
      },
      {
        level: "hard",
        task: "A distroless app container misbehaves and has no shell. Inspect its processes and files without restarting it.",
        hint: "An ephemeral container with --target shares the process namespace.",
        solution: "kubectl debug -it app-7d9c --image=busybox:1.36 --target=app -- sh\n# inside the debug container:\nps aux                          # the app's processes are visible\nls /proc/1/root/etc             # the app's filesystem through /proc\nexit\nkubectl get pod app-7d9c -o jsonpath='{.spec.ephemeralContainers[*].name}'",
      },
    ],
    faq: [
      { q: "How do I fix CrashLoopBackOff?", a: "Read kubectl logs --previous and the exit code in kubectl describe. The fix is usually in the app config, command, environment, probes or memory limit, and you apply it on the Deployment, not the Pod." },
      { q: "What is the difference between ErrImagePull and ImagePullBackOff?", a: "ErrImagePull is the first failed pull. ImagePullBackOff means it keeps failing and the kubelet is waiting longer between retries. The cause is the same." },
      { q: "Why does my Pod stay Pending?", a: "The scheduler cannot find a node that fits: not enough requested CPU or memory, taints, affinity rules or an unbound PVC. The FailedScheduling event lists the reason for each node." },
    ],
  },

  "cka-troubleshooting/debug-control-plane": {
    plain: [
      "On a kubeadm cluster, the brain of Kubernetes (the API server, etcd, the scheduler and the controller manager) runs as static Pods. The kubelet on the control plane node reads their YAML files from /etc/kubernetes/manifests and keeps them running.",
      "That means a single wrong line in one of those files can break a component. If it is the API server, kubectl stops working completely, so you cannot use kubectl to debug. You have to go to the node and look at the containers and files directly.",
      "Each component breaks in its own recognizable way. API server down: every kubectl command fails. Scheduler down: new Pods stay Pending forever. Controller manager down: Deployments do not create Pods and scaling does nothing. etcd down: the API server crashes too.",
      "The fix loop is always the same: find the failing container, read its log, correct the manifest, and let the kubelet restart it. Keep a backup copy of each file before you edit, but never inside the manifests folder.",
    ],
    deepDive: [
      {
        heading: "Telling the components apart by symptom",
        body: "The fastest path is to guess the broken component from what you see. kubectl answering The connection to the server ...:6443 was refused points at the API server (or etcd behind it). kubectl working but new Pods staying Pending with no scheduling events points at the scheduler. A Deployment that never creates a ReplicaSet, a scale command that changes nothing, or a dead node never marked NotReady points at the controller manager, which runs all those control loops.\n\nWhen the API server is up, kubectl -n kube-system get pods shows the mirror Pods, and kubectl logs works for them. kubectl get --raw='/readyz?verbose' lists each internal check of the API server, including its etcd connection.",
        visual: {
          type: "compare",
          title: "Symptom to suspect",
          columns: [
            { title: "API server or etcd", points: ["kubectl: connection refused", "Every command fails", "Debug with crictl on the node"] },
            { title: "Scheduler", points: ["kubectl works", "New Pods Pending, no events", "Pods with nodeName still run"] },
            { title: "Controller manager", points: ["Deployments make no ReplicaSets", "Scaling does nothing", "Dead nodes not marked NotReady"] },
          ],
        },
      },
      {
        heading: "Debugging without kubectl",
        body: "When the API server is down, work on the control plane node with sudo. crictl ps -a lists all containers, including exited ones; a component restarting every few seconds shows a growing ATTEMPT count and status Exited. crictl logs CONTAINER_ID prints its output, usually ending in the exact flag or file it choked on. The same logs are files under /var/log/pods/kube-system_kube-apiserver-NODE_UID/.\n\nIf crictl shows no container at all for the component, the kubelet could not even parse the manifest, for example because of a YAML indentation error. Then the answer is in journalctl -u kubelet, which reports the manifest file it could not decode. crictl needs to know the runtime socket; on kubeadm nodes /etc/crictl.yaml usually sets runtime-endpoint: unix:///run/containerd/containerd.sock.",
        bullets: ["sudo crictl ps -a --name kube-apiserver", "sudo crictl logs $(sudo crictl ps -a --name kube-apiserver -q | head -1)", "sudo journalctl -u kubelet --since '10 min ago' | grep -i manifest"],
      },
      {
        heading: "The usual breakages in manifests",
        body: "Exam tasks and real outages tend to repeat the same mistakes. A flag name with a typo makes the binary exit with unknown flag. A wrong file path, such as a certificate under /etc/kubernetes/pki that does not exist, gives no such file or directory; check that the path also exists inside a mounted hostPath volume. A wrong etcd address, such as port 2380 (peer traffic) instead of 2379 (client traffic) in --etcd-servers, makes the API server time out connecting to etcd.\n\nOther classics: a wrong image tag (the static Pod stays in image pull errors), a liveness probe pointing at the wrong port so the kubelet keeps killing a healthy component, and a wrong kubeconfig path for the scheduler or controller manager (they use /etc/kubernetes/scheduler.conf and controller-manager.conf).",
        bullets: ["API server 6443; etcd client 2379, peer 2380", "Scheduler health: https://127.0.0.1:10259/healthz", "Controller manager health: https://127.0.0.1:10257/healthz"],
      },
      {
        heading: "Editing safely and waiting correctly",
        body: "Copy the manifest to a folder outside /etc/kubernetes/manifests, such as /root/backup, before editing. The kubelet runs every manifest file in that folder, so a backup left there with another name starts a second copy of the component, which can fight the real one.\n\nAfter you save, the kubelet notices the change within about 20 seconds and recreates the Pod. The API server then takes up to a minute to become ready, so do not panic and edit again too soon; watch with watch sudo crictl ps instead. A trick to force a restart without changing anything is to move the manifest out of the folder, wait until crictl shows the container gone, then move it back. Never restart containers with crictl stop and expect lasting fixes; the manifest is the source of truth.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "What happens after you save a broken manifest",
        actors: ["You", "kubelet", "containerd", "kube-apiserver"],
        messages: [
          { from: 0, to: 1, label: "Save kube-apiserver.yaml with a typo" },
          { from: 1, to: 2, label: "Stop old container, start new one" },
          { from: 2, to: 3, label: "Run binary with the bad flag" },
          { from: 3, to: 2, label: "Exit 1: unknown flag" },
          { from: 1, to: 2, label: "Restart with back-off, again and again" },
          { from: 0, to: 2, label: "crictl ps -a, crictl logs ID" },
        ],
      },
    ],
    examples: [
      {
        title: "The API server will not come back",
        explanation: "After a change, kubectl says connection refused. Step 1: list containers on the control plane; kube-apiserver keeps exiting. Step 2: read its log; the last line names the problem, here a certificate path with a typo. Step 3: back up and fix the manifest. Step 4: wait for the container to stay Running and kubectl to answer.",
        code: {
          lang: "bash",
          code: "ssh cp1\nsudo crictl ps -a --name kube-apiserver\nsudo crictl logs $(sudo crictl ps -a --name kube-apiserver -q | head -1) 2>&1 | tail -3\n# open /etc/kubernetes/pki/apiserver.crtt: no such file or directory\nsudo cp /etc/kubernetes/manifests/kube-apiserver.yaml /root/\nsudo sed -i 's#apiserver.crtt#apiserver.crt#' /etc/kubernetes/manifests/kube-apiserver.yaml\nwatch sudo crictl ps --name kube-apiserver\nkubectl get nodes",
        },
      },
      {
        title: "Deployments that never create Pods",
        explanation: "kubectl create deployment works, but READY stays 0/1 and kubectl get rs shows nothing. Step 1: no ReplicaSet means the Deployment controller is not running, so look at the controller manager. Step 2: its mirror Pod is in CrashLoopBackOff. Step 3: the log says its kubeconfig file does not exist. Step 4: fix the --kubeconfig path in the manifest and watch the ReplicaSet appear.",
        code: {
          lang: "bash",
          code: "kubectl get deploy,rs -l app=test\nkubectl -n kube-system get pods | grep controller-manager\nkubectl -n kube-system logs kube-controller-manager-cp1 | tail -3\n# stat /etc/kubernetes/controller-manager.cnf: no such file or directory\nsudo grep -n 'kubeconfig' /etc/kubernetes/manifests/kube-controller-manager.yaml\nsudo sed -i 's#controller-manager.cnf#controller-manager.conf#g' \\\n  /etc/kubernetes/manifests/kube-controller-manager.yaml\nkubectl get rs -l app=test -w",
        },
      },
    ],
    cheatSheet: [
      "Manifests: /etc/kubernetes/manifests; back up to /root, never next to them",
      "sudo crictl ps -a shows exited control plane containers and their ATTEMPT count",
      "No container at all = manifest cannot be parsed; read journalctl -u kubelet",
      "--etcd-servers must use client port 2379, not peer port 2380",
      "kubectl get --raw='/readyz?verbose' lists API server health checks",
      "Pending with no events = scheduler down; no ReplicaSets = controller manager down",
      "Logs on disk: /var/log/pods/kube-system_COMPONENT-NODE_UID/",
    ],
    quiz: [
      {
        q: "kubectl works, but every new Pod stays Pending with no events, while Pods with spec.nodeName set run fine. Which component is broken?",
        options: ["kube-scheduler", "kube-controller-manager", "etcd", "kube-proxy"],
        answer: 0,
        why: "Only scheduling is missing; nodeName Pods skip the scheduler and still run.",
      },
      {
        q: "After editing kube-apiserver.yaml, crictl ps -a shows no kube-apiserver container at all. Where is the error message?",
        options: ["crictl logs", "kubectl get events", "journalctl -u kubelet", "/var/log/pods"],
        answer: 2,
        why: "If the kubelet cannot parse the manifest, no container is created, so only the kubelet log explains it.",
      },
      {
        q: "You copied kube-scheduler.yaml to /etc/kubernetes/manifests/kube-scheduler.bak.yaml before editing. What risk does that create?",
        options: ["None, the kubelet ignores copies", "etcd may be corrupted", "The API server refuses the original", "The kubelet runs both files as separate static Pods"],
        answer: 3,
        why: "The kubelet runs every manifest file in its staticPodPath, including backups placed there.",
      },
      {
        q: "The API server logs show repeated timeouts connecting to https://127.0.0.1:2380. What is wrong?",
        options: ["The certificate expired", "--etcd-servers points at the etcd peer port instead of 2379", "The scheduler is down", "The CNI is missing"],
        answer: 1,
        why: "Port 2380 is for etcd peer traffic; clients like the API server must use 2379.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "On the control plane node, list every control plane container with its state and write the ID of the etcd container to /opt/etcd-id.txt.",
        hint: "crictl ps supports --name and -q.",
        solution: "sudo crictl ps -a | grep -E 'apiserver|scheduler|controller|etcd'\nsudo crictl ps --name etcd -q > /opt/etcd-id.txt\ncat /opt/etcd-id.txt",
      },
      {
        level: "medium",
        task: "In a lab, break the scheduler by changing its image tag to one that does not exist, observe the symptoms, then fix it.",
        hint: "Pods created meanwhile stay Pending; they schedule once the scheduler returns.",
        solution: "sudo cp /etc/kubernetes/manifests/kube-scheduler.yaml /root/\nsudo sed -i 's#\\(image: .*kube-scheduler:\\).*#\\1v0.0.0#' /etc/kubernetes/manifests/kube-scheduler.yaml\nkubectl run probe --image=nginx; kubectl get pod probe     # Pending\nkubectl -n kube-system get pods | grep scheduler            # ErrImagePull\nsudo cp /root/kube-scheduler.yaml /etc/kubernetes/manifests/\nkubectl get pod probe -w                                    # Running",
      },
      {
        level: "hard",
        task: "The API server is down after someone edited it. Find and fix the problem using only node tools, then prove the cluster is healthy.",
        hint: "Compare the manifest with your earlier backup if one exists, and read the last log lines.",
        solution: "sudo crictl ps -a --name kube-apiserver\nID=$(sudo crictl ps -a --name kube-apiserver -q | head -1)\nsudo crictl logs $ID 2>&1 | tail -5\n[ -n \"$ID\" ] || sudo journalctl -u kubelet -n 50 --no-pager | grep -i apiserver\nsudo diff /root/kube-apiserver.yaml /etc/kubernetes/manifests/kube-apiserver.yaml\nsudo vim /etc/kubernetes/manifests/kube-apiserver.yaml   # fix the line\nwatch sudo crictl ps --name kube-apiserver\nkubectl get --raw='/readyz?verbose' | tail -3\nkubectl get nodes && kubectl -n kube-system get pods",
      },
    ],
    faq: [
      { q: "How do I restart the kube-apiserver in a kubeadm cluster?", a: "Edit or touch its manifest, or move kube-apiserver.yaml out of /etc/kubernetes/manifests and back. The kubelet stops and recreates the static Pod." },
      { q: "Why can't I use kubectl to fix the API server?", a: "kubectl talks to the API server, so when that is down there is nothing to talk to. You must fix it on the node through its static Pod manifest." },
      { q: "Where are control plane logs on a kubeadm cluster?", a: "Use kubectl logs on the mirror Pods if the API works, otherwise crictl logs or the files under /var/log/pods on the control plane node." },
    ],
  },

  "cka-troubleshooting/debug-nodes": {
    plain: [
      "Every node runs a program called the kubelet. It is the node's messenger: it reports to the API server, every few seconds, that the node is alive and healthy, and it starts and stops containers there. If the reports stop, the node is marked NotReady.",
      "So when a node is NotReady, the question is: why did the kubelet stop reporting good news? Either the kubelet is not running, it cannot reach the API server, or it is running but something it depends on (the container runtime or the network plugin) is broken.",
      "You fix nodes from the inside. You ssh to the node and use normal Linux tools: systemctl to check and start services, journalctl to read their logs, and a text editor for config files. kubectl only shows you the symptoms.",
      "After about five minutes NotReady, Kubernetes starts moving Pods off the node to healthy ones. In the exam, the clock is the main pressure: a calm checklist is faster than guessing.",
    ],
    deepDive: [
      {
        heading: "How the control plane decides a node is NotReady",
        body: "The kubelet renews a Lease object in the kube-node-lease namespace about every 10 seconds and updates the node's status conditions periodically. The node lifecycle controller in the controller manager watches those signals. If they stop for the grace period (under a minute by default), it sets Ready to Unknown with the message Kubelet stopped posting node status, and taints the node node.kubernetes.io/unreachable.\n\nThat difference matters. Ready Unknown means the kubelet is silent: stopped, crashed, or unable to reach the API server. Ready False means the kubelet is alive and reporting a problem itself, such as the container runtime or CNI not being ready; the condition's message says which. MemoryPressure, DiskPressure and PIDPressure True mean the node is short of resources and evicting Pods.",
        visual: {
          type: "compare",
          title: "Ready Unknown versus Ready False",
          columns: [
            { title: "Ready: Unknown", points: ["Kubelet stopped posting status", "Kubelet down or cannot reach API", "Check systemctl and kubelet.conf", "unreachable taint added"] },
            { title: "Ready: False", points: ["Kubelet is running and reporting", "Message names the problem", "Often runtime or CNI not ready", "not-ready taint added"] },
          ],
        },
      },
      {
        heading: "Where the kubelet's settings really live",
        body: "On a kubeadm node the kubelet is a systemd service made of several files. systemctl cat kubelet prints the unit and every drop-in, which is the safest way to see which files are used. The kubeadm drop-in (10-kubeadm.conf) passes --kubeconfig=/etc/kubernetes/kubelet.conf, --bootstrap-kubeconfig, --config=/var/lib/kubelet/config.yaml, and reads extra flags from /var/lib/kubelet/kubeadm-flags.env and /etc/default/kubelet (or /etc/sysconfig/kubelet on RHEL).\n\nconfig.yaml holds settings like clusterDNS, staticPodPath, cgroupDriver and the client CA file. kubelet.conf holds the API server address and the client certificate the kubelet uses to log in. After changing a systemd file, run systemctl daemon-reload; after changing any kubelet file, run systemctl restart kubelet.",
        bullets: ["systemctl cat kubelet shows the real ExecStart and flags", "ExecStart must point at the real binary: check with which kubelet", "systemctl enable --now kubelet starts it and keeps it on after reboot"],
      },
      {
        heading: "The classic node breakages",
        body: "Kubelet stopped or disabled: start and enable it. Wrong binary path in the drop-in (for example /usr/local/bin/kubelet when it lives in /usr/bin): the service fails with status=203/EXEC. A wrong path or typo in config.yaml: the kubelet logs failed to load kubelet config file and exits. Wrong server address or port in kubelet.conf: the log shows connection refused or timeout to the API server.\n\nThe container runtime matters too. If containerd is stopped, the node goes NotReady with a runtime message, and if containerRuntimeEndpoint points at the wrong socket the kubelet cannot start Pods. A cgroup driver mismatch (kubelet cgroupDriver systemd but containerd without SystemdCgroup = true) leads to unstable containers. Swap turned on makes the kubelet refuse to start unless it is configured to allow swap.",
        bullets: ["sudo journalctl -u kubelet -n 50 --no-pager", "sudo systemctl status containerd; sudo crictl info", "free -h shows whether swap is on; swapoff -a turns it off"],
      },
      {
        heading: "Certificates and disk pressure",
        body: "The kubelet logs in with a client certificate, normally /var/lib/kubelet/pki/kubelet-client-current.pem, which it rotates automatically before expiry. If rotation failed or the clock jumped, the log shows x509 certificate has expired or is not yet valid. Check dates with openssl x509 -in FILE -noout -dates and the node's time with timedatectl. kubeadm certs check-expiration on the control plane covers the control plane certificates.\n\nDiskPressure appears when free space on the node's filesystem drops below the eviction threshold (by default 10 percent for nodefs and 15 percent for the image filesystem). The kubelet first deletes unused images and dead containers, then evicts Pods. df -h and sudo du -xh --max-depth=1 /var/lib | sort -h show where the space went; often container logs or images.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "What a node needs to be Ready",
        layers: [
          { label: "Node Ready condition", detail: "Reported by the kubelet" },
          { label: "Kubelet reaches API server", detail: "kubelet.conf address and valid client cert" },
          { label: "Kubelet process running", detail: "systemd unit, correct binary and config" },
          { label: "Container runtime", detail: "containerd running, matching cgroup driver" },
          { label: "CNI plugin", detail: "Config in /etc/cni/net.d, plugin Pods healthy" },
          { label: "Linux host", detail: "Disk, memory, swap off, correct time" },
        ],
      },
    ],
    examples: [
      {
        title: "Kubelet fails with status 203/EXEC",
        explanation: "worker1 is NotReady with Ready Unknown. Step 1: ssh in; systemctl status kubelet shows activating (auto-restart) and status=203/EXEC, which means systemd could not run the binary. Step 2: systemctl cat kubelet shows ExecStart=/usr/local/bin/kubelet, but which kubelet says /usr/bin/kubelet. Step 3: fix the path in the drop-in, reload and restart. Step 4: the node turns Ready.",
        code: {
          lang: "bash",
          code: "ssh worker1\nsudo systemctl status kubelet | head -5\nsudo systemctl cat kubelet | grep -n ExecStart\nwhich kubelet                         # /usr/bin/kubelet\nsudo sed -i 's#/usr/local/bin/kubelet#/usr/bin/kubelet#' \\\n  /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf\nsudo systemctl daemon-reload\nsudo systemctl restart kubelet && sudo systemctl enable kubelet\nexit; kubectl get nodes -w",
        },
      },
      {
        title: "Node Ready False: runtime is down",
        explanation: "worker2 shows Ready False, and describe node says container runtime is down or not ready. Step 1: the kubelet is running, so look at what it depends on. Step 2: systemctl status containerd shows inactive (dead). Step 3: start and enable it, and confirm crictl can talk to it. Step 4: the kubelet notices on its next sync and the node returns to Ready.",
        code: {
          lang: "bash",
          code: "kubectl describe node worker2 | grep -A2 'Ready '\nssh worker2\nsudo systemctl is-active kubelet containerd      # active, inactive\nsudo systemctl enable --now containerd\nsudo crictl info | head -5\nsudo journalctl -u kubelet -n 20 --no-pager\nexit; kubectl get node worker2",
        },
      },
    ],
    cheatSheet: [
      "systemctl cat kubelet shows the unit file and every drop-in in use",
      "Kubelet config: /var/lib/kubelet/config.yaml; its kubeconfig: /etc/kubernetes/kubelet.conf",
      "status=203/EXEC means the ExecStart binary path is wrong",
      "Ready Unknown = kubelet silent; Ready False = kubelet reports a problem",
      "After editing unit files: systemctl daemon-reload, then restart kubelet",
      "Client cert: /var/lib/kubelet/pki/kubelet-client-current.pem; check with openssl x509 -noout -dates",
      "systemctl enable --now kubelet starts it now and after every reboot",
    ],
    quiz: [
      {
        q: "A node shows Ready Unknown with Kubelet stopped posting node status. Where do you start?",
        options: ["Check the CoreDNS Pods", "Check whether the kubelet runs and can reach the API server", "Delete the node and rejoin", "Check NetworkPolicies"],
        answer: 1,
        why: "Unknown means the control plane hears nothing from the kubelet.",
      },
      {
        q: "systemctl status kubelet shows status=203/EXEC. What does it mean?",
        options: ["The config.yaml has a syntax error", "The certificate expired", "systemd could not execute the binary in ExecStart", "Swap is enabled"],
        answer: 2,
        why: "203/EXEC is systemd's code for failing to exec the program, usually a wrong path.",
      },
      {
        q: "You changed /usr/lib/systemd/system/kubelet.service.d/10-kubeadm.conf. What must you run before restarting the kubelet?",
        options: ["kubeadm reset", "systemctl enable containerd", "kubectl uncordon", "systemctl daemon-reload"],
        answer: 3,
        why: "systemd only rereads unit files and drop-ins after daemon-reload.",
      },
      {
        q: "Which file holds the API server address the kubelet connects to on a kubeadm node?",
        options: ["/etc/kubernetes/kubelet.conf", "/var/lib/kubelet/config.yaml", "/etc/containerd/config.toml", "/etc/cni/net.d/10-calico.conflist"],
        answer: 0,
        why: "kubelet.conf is the kubelet's kubeconfig, with the server URL and client credentials.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write the conditions of every node (name, Ready status) to /opt/nodes.txt using one kubectl command.",
        hint: "jsonpath with a filter on type==\"Ready\".",
        solution: "kubectl get nodes -o jsonpath='{range .items[*]}{.metadata.name}{\" \"}{.status.conditions[?(@.type==\"Ready\")].status}{\"\\n\"}{end}' > /opt/nodes.txt\ncat /opt/nodes.txt",
      },
      {
        level: "medium",
        task: "In a lab, stop and disable the kubelet on a worker, time how long until it shows NotReady, then bring it back so it survives a reboot.",
        hint: "Watch kubectl get nodes -w from the control plane in another terminal.",
        solution: "ssh worker1 'sudo systemctl disable --now kubelet'\nkubectl get nodes -w                 # NotReady after under a minute\nkubectl describe node worker1 | grep -i 'stopped posting'\nssh worker1 'sudo systemctl enable --now kubelet'\nkubectl get nodes -w                 # Ready again",
      },
      {
        level: "hard",
        task: "A worker is NotReady. Write a short checklist script you could run on the node that prints the state of everything the kubelet depends on.",
        hint: "Cover services, recent kubelet errors, runtime, CNI config, swap, disk and the client certificate.",
        solution: "#!/bin/bash\nsystemctl is-active kubelet containerd\nsystemctl is-enabled kubelet\njournalctl -u kubelet -n 15 --no-pager | grep -iE 'error|fail'\ncrictl info >/dev/null && echo runtime ok\nls /etc/cni/net.d/\nswapon --show\ndf -h / /var/lib\nopenssl x509 -in /var/lib/kubelet/pki/kubelet-client-current.pem -noout -enddate\ngrep server /etc/kubernetes/kubelet.conf",
      },
    ],
    faq: [
      { q: "Why is my Kubernetes node NotReady?", a: "The kubelet is not running, cannot reach the API server, or reports that the container runtime or network plugin is not ready. kubectl describe node shows which, and journalctl -u kubelet on the node shows the details." },
      { q: "What happens to Pods on a NotReady node?", a: "After about five minutes (the default tolerationSeconds for the unreachable and not-ready taints), Pods controlled by Deployments and similar controllers are recreated on healthy nodes." },
      { q: "How do I restart the kubelet?", a: "Run sudo systemctl restart kubelet on that node. If you edited a systemd file first, run sudo systemctl daemon-reload before it." },
    ],
  },

  "cka-troubleshooting/debug-network": {
    plain: [
      "A request inside Kubernetes passes through several stops: the name is turned into an IP by DNS, the Service IP is turned into a Pod IP by kube-proxy rules, the packet travels over the Pod network, any NetworkPolicy checks it, and finally the app must be listening on the right port.",
      "When something fails, testing the whole chain at once tells you little. Testing one stop at a time tells you exactly where it breaks. It is like finding a leak in a pipe: you check each joint in turn.",
      "Always test from inside the cluster. Your laptop cannot reach ClusterIPs or Pod IPs, so a failed curl from outside proves nothing. Start a temporary Pod with network tools and test from there, ideally from the same namespace as the real client.",
      "The good news: most problems are small configuration mistakes, like a Service selector that does not match, a wrong port number, or a forgotten DNS rule in a NetworkPolicy. Once you find the right stop, the fix is usually one line.",
    ],
    deepDive: [
      {
        heading: "Reading the error message correctly",
        body: "The error type already narrows down the stop. Could not resolve host or bad address means DNS: the name is wrong, in another namespace, or CoreDNS is unreachable. Connection refused means a packet arrived but nothing was listening on that port: a wrong targetPort, an app listening on a different port, or a Service with no endpoints on some kube-proxy modes. A timeout means packets disappeared: a NetworkPolicy dropping them, a broken Pod network between nodes, or a Pod that does not exist at that IP.\n\nUse short timeouts so tests fail fast: curl -m 3, wget -T 3 or nc -w 3. Test the IP and the name separately; if the IP works and the name does not, the problem is DNS, nothing else.",
        visual: {
          type: "tree",
          title: "Error type to likely cause",
          root: "Request failed",
          children: [
            { label: "Name not resolved", children: ["Wrong name or namespace", "CoreDNS down or 0 replicas", "Egress policy blocks port 53"] },
            { label: "Connection refused", children: ["Wrong targetPort", "App listens on another port", "App bound to 127.0.0.1 only"] },
            { label: "Timeout", children: ["NetworkPolicy drops it", "Cross-node Pod network broken", "kube-proxy rules missing"] },
          ],
        },
      },
      {
        heading: "Checking each hop with one command",
        body: "DNS: nslookup SERVICE.NAMESPACE from the debug Pod. Service: kubectl get svc NAME -o wide shows the selector and ports. Endpoints: kubectl get endpointslices -l kubernetes.io/service-name=NAME must list Ready Pod IPs. Pod: curl POD_IP:TARGET_PORT from the debug Pod skips the Service entirely. App: kubectl exec POD -- wget -qO- localhost:PORT tests from inside the Pod itself, which skips the network entirely.\n\nIf localhost works but the Pod IP does not, the app is probably listening on 127.0.0.1 instead of 0.0.0.0. If the Pod IP works but the Service does not, look at selector, ports and kube-proxy. If the Pod IP fails only from other nodes, look at the CNI. If it fails only from some namespaces, look at NetworkPolicies.",
        bullets: ["kubectl exec POD -- netstat -tlnp (or ss -tlnp) shows listening ports if the image has it", "kubectl get netpol -n NS before anything else when traffic times out", "kubectl port-forward skips kube-proxy and policies: good for testing the app only"],
      },
      {
        heading: "kube-proxy health",
        body: "kube-proxy runs as a DaemonSet in kube-system, one Pod per node, and is configured by the kube-proxy ConfigMap (the config.conf key holds mode, clusterCIDR and more). If its Pod on a node is crashing, Services stop working only from Pods on that node, a pattern worth spotting: test from Pods on two different nodes.\n\nCheck kubectl -n kube-system get ds kube-proxy for DESIRED equal to READY, then read the logs of the Pod on the bad node. A broken ConfigMap (for example a typo in mode or a wrong kubeconfig path) makes all kube-proxy Pods fail after a restart. After fixing the ConfigMap, run kubectl -n kube-system rollout restart ds kube-proxy. On the node, iptables-save -t nat | grep SERVICE_NAME (or nft list ruleset in nftables mode) proves whether rules exist for the Service.",
      },
      {
        heading: "Debug tools that save time",
        body: "busybox has nslookup, wget and nc, which covers most tests. For deeper work, an image like nicolaka/netshoot adds curl, dig, tcpdump, ss and more. kubectl run tmp --rm -it --image=... --restart=Never -- sh gives you a throwaway shell that deletes itself on exit.\n\nTo test exactly as a real client would, give the debug Pod the same namespace and labels as that client with -n and -l, because NetworkPolicies decide by labels and namespace. For node-level checks, kubectl debug node/NODE -it --image=busybox:1.36 opens a shell in a Pod on that node using the host's network, with the node's filesystem under /host. That lets you test from the node without ssh.",
        bullets: ["kubectl run tmp -n prod -l app=frontend --rm -it --image=busybox:1.36 --restart=Never -- sh", "kubectl debug node/worker1 -it --image=busybox:1.36", "dig +short SERVICE.NS.svc.cluster.local from netshoot"],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Testing a failing call hop by hop",
        actors: ["Debug Pod", "CoreDNS", "Service (kube-proxy)", "Backend Pod"],
        messages: [
          { from: 0, to: 1, label: "nslookup api.prod: gets ClusterIP?" },
          { from: 0, to: 2, label: "curl ClusterIP:80: answer?" },
          { from: 0, to: 3, label: "curl PodIP:8080 directly: answer?" },
          { from: 3, to: 3, label: "exec: wget localhost:8080 inside the Pod" },
          { from: 3, to: 0, label: "First hop that fails is the culprit" },
        ],
      },
    ],
    examples: [
      {
        title: "Service works by Pod IP, not by name",
        explanation: "A frontend reports api.prod unreachable. Step 1: from a debug Pod, nslookup api.prod gets the ClusterIP, so DNS is fine. Step 2: curl to the Service times out, but curl to a Pod IP on 8080 works. Step 3: the Service shows targetPort 80, while the app listens on 8080, and the EndpointSlice port says 80. Step 4: patch the targetPort; curl to the Service now works.",
        code: {
          lang: "bash",
          code: "kubectl run tmp -n prod --rm -it --image=busybox:1.36 --restart=Never -- sh\n  nslookup api.prod                # resolves to 10.96.88.4\n  wget -qO- -T 3 http://api.prod  # fails\n  wget -qO- -T 3 http://10.244.2.7:8080   # works\n  exit\nkubectl -n prod get svc api -o jsonpath='{.spec.ports}'; echo\nkubectl -n prod patch svc api --type=json \\\n  -p '[{\"op\":\"replace\",\"path\":\"/spec/ports/0/targetPort\",\"value\":8080}]'",
        },
      },
      {
        title: "All Services broken from one node only",
        explanation: "Pods on worker2 cannot reach any Service, while Pods on worker1 can. Step 1: Pod IPs work from worker2, so the Pod network is fine. Step 2: list kube-proxy Pods with -o wide; the one on worker2 is in CrashLoopBackOff. Step 3: its log shows the cause; here the node was missing a kernel module after a reboot. Step 4: fix it and delete the Pod so the DaemonSet recreates it.",
        code: {
          lang: "bash",
          code: "kubectl -n kube-system get pods -l k8s-app=kube-proxy -o wide\nkubectl -n kube-system logs kube-proxy-x7k2p --previous | tail -5\nkubectl -n kube-system get cm kube-proxy -o yaml | grep -E 'mode|clusterCIDR'\n# after fixing the cause on the node:\nkubectl -n kube-system delete pod kube-proxy-x7k2p\nkubectl -n kube-system get pods -l k8s-app=kube-proxy -o wide",
        },
      },
    ],
    cheatSheet: [
      "Not resolved = DNS; connection refused = port or listener; timeout = policy, CNI or proxy",
      "Test order: name, Service IP, Pod IP, localhost inside the Pod",
      "Works on localhost but not Pod IP: the app listens on 127.0.0.1",
      "Broken only from one node: check the kube-proxy and CNI Pods on that node",
      "kubectl debug node/NODE -it --image=busybox:1.36 gives a host-network shell",
      "Give debug Pods the client's namespace and labels when policies are involved",
      "kubectl -n kube-system rollout restart ds kube-proxy after fixing its ConfigMap",
    ],
    quiz: [
      {
        q: "curl to a Service name says Could not resolve host, but curl to its ClusterIP works. What do you debug?",
        options: ["The Service selector", "The targetPort", "DNS: CoreDNS, the name and the namespace", "kube-proxy"],
        answer: 2,
        why: "The IP path works, so only name resolution is failing.",
      },
      {
        q: "From inside the Pod, wget localhost:8080 works, but from another Pod, PodIP:8080 is refused. Likely cause?",
        options: ["The app listens only on 127.0.0.1", "A NetworkPolicy", "CoreDNS is down", "kube-proxy is in IPVS mode"],
        answer: 0,
        why: "An app bound to localhost only accepts connections from inside its own Pod.",
      },
      {
        q: "A connection attempt hangs until it times out. Which cause fits best?",
        options: ["Wrong DNS name", "Nothing listens on the port", "The Service has a typo in its name", "A NetworkPolicy is dropping the packets"],
        answer: 3,
        why: "Policies drop packets silently, which shows up as a timeout rather than a refusal.",
      },
      {
        q: "Services fail only from Pods on worker3. What do you check first?",
        options: ["The CoreDNS ConfigMap", "The kube-proxy Pod running on worker3", "The Service's selector", "The API server flags"],
        answer: 1,
        why: "kube-proxy works per node, so a problem on one node points at that node's kube-proxy.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "From a temporary Pod, test DNS, Service IP and one Pod IP for Service web in namespace default, each with a 3 second timeout.",
        hint: "Get the IPs first with kubectl get svc and get endpointslices.",
        solution: "kubectl get svc web -o jsonpath='{.spec.clusterIP}'; echo\nkubectl get endpointslices -l kubernetes.io/service-name=web -o jsonpath='{.items[0].endpoints[0].addresses[0]}'; echo\nkubectl run tmp --rm -it --image=busybox:1.36 --restart=Never -- sh -c \\\n  'nslookup web; wget -qO- -T 3 http://web | head -2; wget -qO- -T 3 http://POD_IP:80 | head -2'",
      },
      {
        level: "medium",
        task: "Service shop in namespace store has no endpoints. Find out why and fix it without changing the Pods.",
        hint: "Compare selector with labels, and check readiness.",
        solution: "kubectl -n store get svc shop -o jsonpath='{.spec.selector}'; echo\nkubectl -n store get pods --show-labels\nkubectl -n store get pods -l app=shop     # empty or not Ready?\n# if labels differ, patch the Service selector:\nkubectl -n store patch svc shop -p '{\"spec\":{\"selector\":{\"app\":\"shop-web\"}}}'\nkubectl -n store get endpointslices -l kubernetes.io/service-name=shop",
      },
      {
        level: "hard",
        task: "Frontend Pods (app=frontend, namespace web) time out calling api.prod:80. DNS works. Find the blocking NetworkPolicy and add the smallest rule that fixes it.",
        hint: "Test as the frontend with -n web -l app=frontend, then read every policy in prod.",
        solution: "kubectl run t -n web -l app=frontend --rm -it --image=busybox:1.36 --restart=Never -- wget -qO- -T 3 http://api.prod\nkubectl -n prod get netpol\nkubectl -n prod describe netpol\nkubectl -n prod get svc api -o jsonpath='{.spec.ports[0].targetPort}'; echo   # 8080\n# new policy in prod: podSelector app=api, ingress from\n#   namespaceSelector kubernetes.io/metadata.name=web AND podSelector app=frontend,\n#   ports TCP 8080 (the targetPort, not 80)\nkubectl apply -f allow-frontend.yaml",
      },
    ],
    faq: [
      { q: "How do I test if a Kubernetes Service is working?", a: "Start a temporary Pod with kubectl run --rm -it and call the Service by name and by ClusterIP with wget or curl. Then check kubectl get endpointslices for Ready Pod IPs." },
      { q: "Why can I not ping a Service IP?", a: "ClusterIPs are virtual and kube-proxy only forwards the Service's TCP, UDP or SCTP ports, so ICMP ping usually gets no reply. Test the port instead." },
      { q: "What is a good image for network debugging?", a: "busybox covers nslookup, wget and nc. nicolaka/netshoot adds curl, dig, tcpdump and many more tools when you need them." },
    ],
  },

  "cka-troubleshooting/monitoring": {
    plain: [
      "To fix a problem you first have to see it. kubectl gives you three windows into a running cluster: logs (what the app says), top (how much CPU and memory things use right now), and events (what Kubernetes itself did, and why).",
      "Logs are simply whatever the container prints to its standard output and error. Kubernetes saves them on the node and kubectl logs fetches them. If your app writes logs only to a file inside the container, kubectl logs shows nothing.",
      "kubectl top shows live numbers from metrics-server. It is a snapshot of now, not a history. To see yesterday's peak you need a real monitoring system such as Prometheus. For the exam, top is enough to find the hungry Pod.",
      "Events are short notes like Scheduled, Pulled, Killing or FailedMount. They are the cluster's diary, but it only keeps about the last hour. Read them early, before they expire.",
    ],
    deepDive: [
      {
        heading: "Where logs live and what kubectl logs can show",
        body: "The container runtime writes each container's output to files on the node under /var/log/pods/NAMESPACE_POD_UID/CONTAINER/, with symlinks in /var/log/containers. The kubelet rotates them: by default at 10Mi per file, keeping 5 files (containerLogMaxSize and containerLogMaxFiles in its config). kubectl logs reads only the current file, so very old lines may be gone even when rotated files remain on disk.\n\nUseful flags: -f follows, --since=10m or --since-time limits by time, --tail=50 limits lines, --timestamps adds times, -c picks a container and --all-containers shows all, -p shows the previous instance. With -l you can read many Pods at once; --prefix labels each line with its source and --max-log-requests (default 5) caps parallel streams. kubectl logs deploy/web picks one Pod of the Deployment.",
        bullets: ["kubectl logs -l app=web --all-containers --prefix --since=15m", "kubectl logs POD --timestamps | tail", "Logs disappear with the Pod; ship them elsewhere for history"],
      },
      {
        heading: "What kubectl top numbers mean",
        body: "kubectl top nodes and kubectl top pods show CPU in millicores and memory as working set, which is roughly the memory the kernel cannot easily free and the number the OOM killer and evictions care about. metrics-server refreshes about every 15 seconds and keeps no history.\n\nCompare usage with requests and limits to find trouble. A Pod near its memory limit is a candidate for OOMKilled. A Pod with high CPU and a CPU limit may be throttled and slow. A node whose real usage is low but whose requests are full (kubectl describe node, Allocated resources) cannot accept new Pods: the scheduler looks at requests, not at top. --containers splits a Pod's usage per container, and --sort-by=cpu or memory ranks them.",
        visual: {
          type: "flow",
          title: "Finding a resource-starved workload",
          steps: [
            { label: "kubectl top nodes", detail: "Which node is busy?" },
            { label: "top pods -A --sort-by", detail: "Which Pods use the most?" },
            { label: "top pod --containers", detail: "Which container inside?" },
            { label: "Compare with spec", detail: "Requests and limits from get -o yaml" },
            { label: "Check events", detail: "OOMKilling, Evicted, FailedScheduling" },
          ],
        },
      },
      {
        heading: "Events: filtering and sorting",
        body: "Events are API objects with a type (Normal or Warning), a reason, a message and the object they concern (involvedObject). The API server deletes them after one hour by default (its --event-ttl flag). kubectl get events sorts poorly by default, so add --sort-by=.metadata.creationTimestamp, or use kubectl events, which sorts by time for you.\n\nFilter with field selectors: type=Warning for problems only, involvedObject.kind=Pod or involvedObject.name=web-0 for one object, reason=FailedScheduling for one kind of event. kubectl events --for pod/web-0 and kubectl events --types=Warning -w (watch) are shorter forms. Events from the kubelet about evictions and OOM kills also appear on the Node object, so look at kubectl describe node too.",
        bullets: ["kubectl get events -A --field-selector type=Warning --sort-by=.metadata.creationTimestamp", "kubectl get events --field-selector involvedObject.name=web-0", "kubectl events -A --types=Warning"],
      },
      {
        heading: "Writing answers the grader can read",
        body: "Monitoring tasks often say: find the Pod with the highest CPU in namespace X and write its name to /opt/answer.txt. The grader compares the file content exactly, so write only the name, without headers or extra columns. --no-headers removes the header line; awk '{print $1}' keeps the first column.\n\nCustom output also helps beyond top. kubectl get pods --sort-by='.status.containerStatuses[0].restartCount' finds crash-prone Pods. -o custom-columns builds small tables, such as name, node and restart count. Always cat the file afterwards to check it contains what you expect.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Where kubectl logs gets its data",
        layers: [
          { label: "kubectl logs", detail: "Your terminal" },
          { label: "API server", detail: "Proxies the request to the node" },
          { label: "kubelet on the node", detail: "Reads the container's log file" },
          { label: "/var/log/pods/...", detail: "Files written by the runtime, rotated" },
          { label: "Container stdout and stderr", detail: "Only what the app prints there" },
        ],
      },
    ],
    examples: [
      {
        title: "Answer file: the hungriest Pod",
        explanation: "Task: in namespace analytics, write the name of the Pod using the most memory to /opt/top-mem.txt. Step 1: sort Pods by memory. Step 2: take the first row without headers and keep only the name. Step 3: check the file. If several Pods share a label, add -l to narrow the search as the task requires.",
        code: {
          lang: "bash",
          code: "kubectl top pods -n analytics --sort-by=memory\nkubectl top pods -n analytics --sort-by=memory --no-headers \\\n  | head -1 | awk '{print $1}' > /opt/top-mem.txt\ncat /opt/top-mem.txt",
        },
      },
      {
        title: "What happened in the last hour?",
        explanation: "Users said the app was slow 20 minutes ago. Step 1: list Warning events across namespaces, sorted by time. Step 2: you see OOMKilling and BackOff for a worker Pod. Step 3: follow up on that Pod with events for it alone, its previous logs and its current usage. Step 4: save the evidence before the events expire.",
        code: {
          lang: "bash",
          code: "kubectl get events -A --field-selector type=Warning \\\n  --sort-by=.metadata.creationTimestamp | tail -15\nkubectl events -n jobs --for pod/worker-2\nkubectl logs -n jobs worker-2 --previous --tail=30\nkubectl top pod -n jobs worker-2 --containers\nkubectl get events -n jobs -o yaml > /tmp/events-$(date +%H%M).yaml",
        },
      },
    ],
    cheatSheet: [
      "kubectl logs -l app=web --all-containers --prefix --since=1h",
      "kubectl top pods -A --sort-by=memory --no-headers | head -3",
      "kubectl top pod POD --containers splits usage per container",
      "kubectl events -A --types=Warning sorts by time automatically",
      "Events expire after 1 hour by default (kube-apiserver --event-ttl)",
      "Node log files: /var/log/pods/NS_POD_UID/CONTAINER/0.log",
      "kubectl get pods -A --sort-by='.status.containerStatuses[0].restartCount'",
    ],
    quiz: [
      {
        q: "Your app writes logs only to /app/logs/app.log inside the container. What does kubectl logs show?",
        options: ["The file's contents", "Nothing from that file, because only stdout and stderr are collected", "An error", "The logs from yesterday"],
        answer: 1,
        why: "kubectl logs reads what the container prints to stdout and stderr, not files inside it.",
      },
      {
        q: "A node's kubectl top shows 20% CPU use, yet new Pods do not fit on it. Why?",
        options: ["The requests on the node are already full", "metrics-server is wrong", "The node is NotReady", "top shows limits, not usage"],
        answer: 0,
        why: "The scheduler places Pods by requests compared with allocatable, not by actual usage.",
      },
      {
        q: "How long are events kept by default?",
        options: ["24 hours", "7 days", "Until the object is deleted", "1 hour"],
        answer: 3,
        why: "The API server's default --event-ttl is one hour.",
      },
      {
        q: "Which command writes only the name of the top CPU Pod in namespace x?",
        options: ["kubectl top pods -n x > f", "kubectl get pods -n x --sort-by=cpu > f", "kubectl top pods -n x --sort-by=cpu --no-headers | head -1 | awk '{print $1}' > f", "kubectl describe pods -n x | grep CPU > f"],
        answer: 2,
        why: "It sorts by CPU, drops the header, keeps the first row and only the name column.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Show the last 20 log lines, with timestamps, from every container of the Pods labeled app=web.",
        hint: "Combine -l, --all-containers, --tail and --timestamps.",
        solution: "kubectl logs -l app=web --all-containers --prefix --tail=20 --timestamps",
      },
      {
        level: "medium",
        task: "Write all Warning events of namespace prod, oldest first, to /opt/prod-warnings.txt with only the reason and the object name.",
        hint: "Use custom-columns with .reason and .involvedObject.name.",
        solution: "kubectl get events -n prod --field-selector type=Warning \\\n  --sort-by=.metadata.creationTimestamp \\\n  -o custom-columns=REASON:.reason,OBJECT:.involvedObject.name --no-headers \\\n  > /opt/prod-warnings.txt\ncat /opt/prod-warnings.txt",
      },
      {
        level: "hard",
        task: "Find, across all namespaces, the container closest to its memory limit as a percentage, and write namespace/pod/container to /opt/near-oom.txt.",
        hint: "kubectl top gives usage per container; the limits come from the Pod spec. Compare a few candidates by hand.",
        solution: "kubectl top pods -A --containers --no-headers | sort -k4 -h | tail -5\n# columns: NAMESPACE POD CONTAINER CPU MEMORY\nkubectl get pods -A -o custom-columns=NS:.metadata.namespace,POD:.metadata.name,\\\nC:.spec.containers[*].name,LIM:.spec.containers[*].resources.limits.memory | grep -v '<none>'\n# divide usage by limit for each candidate, then for example:\necho 'jobs/worker-2/app' > /opt/near-oom.txt",
      },
    ],
    faq: [
      { q: "Why does kubectl top say metrics not available?", a: "metrics-server is not installed, not Ready, or has not collected its first sample yet. Check its Pod in kube-system and its logs." },
      { q: "How do I see logs of a Pod that was deleted?", a: "You cannot with kubectl; the logs are removed with the Pod. Use a log collector that ships logs to central storage if you need history." },
      { q: "What is the difference between kubectl get events and kubectl events?", a: "Both read the same events. kubectl events sorts by time by default and has handy flags like --for and --types, while get events needs --sort-by and field selectors." },
    ],
  },
};

export default extra;

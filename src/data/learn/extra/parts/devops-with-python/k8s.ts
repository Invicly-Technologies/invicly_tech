import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "k8s/k8s-arch": {
    plain: [
      "Kubernetes is a system that runs containers for you on a group of machines. You do not tell it how to start each container. You tell it what you want, for example three copies of my API, and it keeps working until the real world matches that wish. This idea is called desired state.",
      "A cluster has two parts. The control plane is the brain: it stores what you asked for and decides where things should run. The worker nodes are the muscles: each one is a machine that actually runs your containers and reports back how they are doing.",
      "You talk to the cluster with a command line tool called kubectl. Every kubectl command becomes a request to one central component, the API server. Nothing in Kubernetes talks to the database directly; everything goes through the API server, which checks who you are and whether you are allowed.",
      "For learning, you do not need cloud servers. A tool called kind (Kubernetes in Docker) runs a complete cluster inside Docker containers on your laptop. You can create it in about a minute, break it, delete it and start again for free.",
    ],
    deepDive: [
      {
        heading: "Controllers and the reconcile loop",
        body: "The control plane is not one program but several, each with one job. kube-apiserver is the front door: it checks authentication, authorization and the shape of every object, then saves it in etcd, a distributed key-value store. etcd is the only place cluster state lives, so backing it up is backing up the cluster.\n\nThe real work is done by controllers. kube-controller-manager runs dozens of them in one process: the Deployment controller, the ReplicaSet controller, the Node controller, the Job controller and more. Each one watches the API server for changes to its kind of object, compares what exists with what is wanted, and acts to close the gap. Then it waits for the next change and repeats. This is the reconcile loop.\n\nThe scheduler is a special controller: it watches for Pods with no node assigned and picks one, based on free CPU and memory requests, node selectors, taints and affinity rules. In the cloud, cloud-controller-manager also creates load balancers and routes.",
        visual: {
          type: "cycle",
          title: "What every controller does, forever",
          steps: [
            { label: "Watch", detail: "Get change events from the API server" },
            { label: "Observe", detail: "Read the current state of its objects" },
            { label: "Compare", detail: "Desired replicas 3, running 2" },
            { label: "Act", detail: "Create or delete objects through the API" },
          ],
        },
      },
      {
        heading: "What actually runs on a worker node",
        body: "The kubelet is the agent on every node. It watches the API server for Pods bound to its node and makes them real. It does not start containers itself: it calls a container runtime, usually containerd or CRI-O, through a standard interface called CRI (Container Runtime Interface). Docker Engine is no longer used directly as a runtime since Kubernetes 1.24, but images built with Docker run fine because they follow the same OCI image format.\n\nFor each Pod, the runtime first creates a small sandbox (the pause container) that holds the Pod's network namespace. A CNI (Container Network Interface) plugin such as Calico, Cilium or Flannel gives that sandbox its own IP address. Then your containers start inside it, which is why containers in one Pod can reach each other on localhost.\n\nkube-proxy watches Services and programs packet rules (iptables, IPVS or nftables) on each node so that a Service IP is forwarded to a healthy Pod. Some CNI plugins, like Cilium, can replace kube-proxy entirely.",
        visual: {
          type: "layers",
          title: "The stack on one worker node",
          layers: [
            { label: "Your Pods", detail: "App containers sharing one IP per Pod" },
            { label: "kubelet", detail: "Starts, watches and reports on Pods" },
            { label: "Container runtime", detail: "containerd or CRI-O, called via CRI" },
            { label: "CNI plugin and kube-proxy", detail: "Pod IPs and Service forwarding rules" },
            { label: "Linux kernel", detail: "Namespaces, cgroups, netfilter" },
          ],
        },
      },
      {
        heading: "kind: a real cluster inside Docker",
        body: "kind creates each Kubernetes node as a Docker container. Inside that container run systemd, containerd and the kubelet, and on the control-plane node also the API server, etcd, scheduler and controller manager as static Pods. So it is a real, conformant cluster, just packed into containers. It needs Docker (or Podman) and about 2 GB of free memory for a small cluster.\n\nkind create cluster --name dev writes a context called kind-dev into your kubeconfig and switches kubectl to it. A config file lets you add worker nodes, choose the Kubernetes version with a node image, or map ports from your laptop into the cluster.\n\nOne surprise for beginners: the nodes cannot see images you built locally with docker build, because each node has its own containerd image store. Use kind load docker-image api:dev --name dev to copy the image in. minikube is a popular alternative that runs a single VM or container and has handy add-ons like an ingress controller and a dashboard.",
        bullets: ["kind get clusters lists clusters; kind delete cluster --name dev removes one", "Avoid the latest tag with kind load, or Kubernetes will try to pull it from a registry", "k3d (k3s in Docker) is another light option"],
      },
      {
        heading: "Reading Pod status like an engineer",
        body: "A Pod has a phase, one of five values: Pending (accepted but not running yet, for example waiting for scheduling or an image pull), Running, Succeeded (all containers exited with code 0), Failed, and Unknown (the node stopped reporting).\n\nThe words you see in the STATUS column of kubectl get pods are often not phases but container reasons. ErrImagePull and ImagePullBackOff mean the image name, tag or registry credentials are wrong. CrashLoopBackOff means the container keeps exiting and the kubelet waits longer between each restart, up to five minutes. OOMKilled means the container used more memory than its limit.\n\nThe tools follow a fixed order. kubectl get pods -o wide shows status, restarts, IP and node. kubectl describe pod shows the spec plus the Events list at the bottom, which explains scheduling and pull problems. kubectl logs shows container output, and kubectl logs --previous shows the output of the last crashed run, which is usually where the real error is.",
      },
      {
        heading: "Namespaces, kubeconfig and contexts",
        body: "A namespace is a name scope inside one cluster. Two teams can each have a Deployment called api if they live in different namespaces. A fresh cluster has four: default, kube-system (cluster components such as CoreDNS), kube-public and kube-node-lease (node heartbeats). Namespaces are also the unit for access rules and resource quotas. Some objects are cluster-wide and have no namespace, such as Nodes, PersistentVolumes and Namespaces themselves; kubectl api-resources --namespaced=false lists them.\n\nkubectl finds clusters through a kubeconfig file, by default ~/.kube/config, or the files listed in the KUBECONFIG environment variable. It has three lists: clusters (API address and CA certificate), users (credentials) and contexts. A context ties one cluster, one user and an optional default namespace together under a name. kubectl config use-context switches the whole tool to another cluster, so checking the current context before a delete is a habit worth building.",
        visual: {
          type: "tree",
          title: "Inside a kubeconfig file",
          root: "~/.kube/config",
          children: [
            { label: "clusters", children: ["kind-dev: https://127.0.0.1:port", "prod-eks: API URL and CA"] },
            { label: "users", children: ["kind-dev: client certificate", "prod-admin: aws eks get-token"] },
            { label: "contexts", children: ["kind-dev = cluster + user", "prod = cluster + user + namespace"] },
            { label: "current-context", children: ["The one kubectl uses now"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Debugging a Pod that will not run",
        steps: [
          { label: "kubectl get pods", detail: "Read STATUS and RESTARTS" },
          { label: "kubectl describe pod", detail: "Check Events for scheduling or pull errors" },
          { label: "kubectl logs --previous", detail: "See why the last run crashed" },
          { label: "kubectl exec -it", detail: "Look inside a running container" },
          { label: "Fix the spec", detail: "Change the image, command or limits and reapply" },
        ],
      },
      {
        type: "compare",
        title: "Where to run a practice cluster",
        columns: [
          { title: "kind", points: ["Nodes are Docker containers", "Multi-node in one config file", "Fast to create and delete", "Great for CI tests"] },
          { title: "minikube", points: ["Single node VM or container", "Built-in add-ons like ingress", "minikube dashboard opens a UI", "Good for first steps"] },
          { title: "Managed (EKS, GKE, AKS)", points: ["Cloud runs the control plane", "Real load balancers and storage", "Costs money per hour", "What production usually uses"] },
        ],
      },
    ],
    examples: [
      {
        title: "A three-node kind cluster running your own image",
        explanation: "Step 1: write a kind config with one control-plane node and two workers. Step 2: create the cluster; kubectl now points at the context kind-dev. Step 3: build your FastAPI image locally with a fixed tag. Step 4: load it into the kind nodes, because they cannot see your laptop's Docker images. Step 5: run a Pod from it and check which worker the scheduler picked with -o wide.",
        code: {
          lang: "bash",
          code: `cat > kind.yaml <<'EOF'
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
EOF
kind create cluster --name dev --config kind.yaml
kubectl get nodes                       # 3 nodes, all Ready
docker build -t api:dev .
kind load docker-image api:dev --name dev
kubectl run api --image=api:dev --port=8000
kubectl get pod api -o wide             # NODE shows dev-worker or dev-worker2`,
        },
      },
      {
        title: "Find out why a Pod is in CrashLoopBackOff",
        explanation: "Step 1: start a Pod whose command prints a line and exits with code 1. Step 2: kubectl get pods shows the restart count climbing and the status CrashLoopBackOff. Step 3: describe shows Last State: Terminated with Exit Code 1, and Events show Back-off restarting failed container. Step 4: logs --previous shows what the crashed run printed. Step 5: delete the Pod once you understand it. In a real app the logs usually show a missing environment variable or a failed database connection.",
        code: {
          lang: "bash",
          code: `kubectl run crash --image=busybox:1.36 -- sh -c "echo starting; exit 1"
kubectl get pods -w                 # RESTARTS 1, 2, 3... STATUS CrashLoopBackOff
kubectl describe pod crash | grep -A3 "Last State"
kubectl logs crash --previous       # prints: starting
kubectl get events --sort-by=.metadata.creationTimestamp | tail -5
kubectl delete pod crash`,
        },
      },
    ],
    cheatSheet: [
      "kubectl config get-contexts lists contexts; the starred one is current",
      "kubectl config set-context --current --namespace=dev changes your default namespace",
      "kubectl get pods -A lists Pods in all namespaces",
      "kubectl logs pod-name --previous shows output from the last crashed container",
      "kubectl explain pod.spec.containers documents any field from the live API",
      "kubectl get pod web -o yaml shows the full object, including status",
      "kind load docker-image img:tag --name dev copies a local image into kind nodes",
      "kubectl api-resources lists every resource type and its short name",
    ],
    quiz: [
      {
        q: "Which component is the only one that reads and writes etcd directly?",
        options: ["kube-scheduler", "kubelet", "kube-controller-manager", "kube-apiserver"],
        answer: 3,
        why: "All other components go through the API server, which alone talks to etcd.",
      },
      {
        q: "A Pod shows ImagePullBackOff. What is the most likely cause?",
        options: ["The image name, tag or registry credentials are wrong", "The container ran out of memory", "The liveness probe failed", "The node has no free CPU"],
        answer: 0,
        why: "The kubelet could not pull the image, so it backs off and retries.",
      },
      {
        q: "You built api:dev with docker build, but a kind cluster cannot find it. What fixes it?",
        options: ["docker push api:dev", "kind load docker-image api:dev --name dev", "kubectl apply -f api:dev", "Restart Docker"],
        answer: 1,
        why: "kind nodes have their own containerd image store, so the image must be loaded into them.",
      },
      {
        q: "Which object is cluster-scoped and does not belong to any namespace?",
        options: ["Pod", "Service", "Node", "ConfigMap"],
        answer: 2,
        why: "Nodes, PersistentVolumes and Namespaces are cluster-wide resources.",
      },
      {
        q: "Why can two containers in the same Pod talk over localhost?",
        options: ["kube-proxy forwards localhost traffic", "They share one network namespace and IP", "The API server proxies the traffic", "Docker links them by name"],
        answer: 1,
        why: "All containers in a Pod join the same network namespace created by the Pod sandbox.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a kind cluster, list the system Pods, and name which control plane component each one is.",
        hint: "Control plane Pods live in the kube-system namespace and include the node name in their Pod name.",
        solution: `kind create cluster --name lab
kubectl get pods -n kube-system -o wide
# etcd-lab-control-plane                 -> etcd
# kube-apiserver-lab-control-plane       -> API server
# kube-scheduler-lab-control-plane       -> scheduler
# kube-controller-manager-lab-...        -> controllers
# kube-proxy-xxxxx, coredns-xxxxx        -> Service rules, cluster DNS`,
      },
      {
        level: "medium",
        task: "Create a namespace called team-a, make it your default for the current context, run an nginx Pod there, and open a shell in it.",
        hint: "Use kubectl config set-context --current, then confirm with kubectl config view --minify.",
        solution: `kubectl create namespace team-a
kubectl config set-context --current --namespace=team-a
kubectl config view --minify | grep namespace
kubectl run web --image=nginx:1.27
kubectl wait --for=condition=Ready pod/web --timeout=60s
kubectl exec -it web -- sh -c "hostname; cat /etc/resolv.conf"`,
      },
      {
        level: "hard",
        task: "Prove that Kubernetes reconciles: create a Deployment with 3 replicas, delete one Pod, and watch a replacement appear. Then stop the kubelet on a kind worker and see the node turn NotReady.",
        hint: "kind nodes are containers, so docker exec into one and use systemctl.",
        solution: `kubectl create deployment web --image=nginx:1.27 --replicas=3
kubectl get pods -l app=web
kubectl delete pod $(kubectl get pods -l app=web -o name | head -1)
kubectl get pods -l app=web -w          # a new Pod is created at once
docker exec dev-worker systemctl stop kubelet
kubectl get nodes -w                    # dev-worker becomes NotReady after about 40s
docker exec dev-worker systemctl start kubelet`,
      },
    ],
    faq: [
      { q: "Should I learn with kind or minikube?", a: "Both run real Kubernetes. kind is faster to recreate and supports several nodes easily, so it suits practice and CI; minikube has friendlier add-ons for a first look." },
      { q: "Does Kubernetes still use Docker?", a: "Not as its runtime: dockershim was removed in Kubernetes 1.24 and clusters use containerd or CRI-O. Images built with Docker still run, because they are standard OCI images." },
      { q: "What is the difference between a Pod and a container?", a: "A Pod is a wrapper around one or more containers that share an IP address and volumes. Kubernetes schedules and restarts Pods, not single containers." },
      { q: "How do I stop running commands on the wrong cluster?", a: "Check kubectl config current-context before risky commands, give production its own kubeconfig file, and consider a shell prompt that shows the current context." },
    ],
  },

  "k8s/k8s-workloads": {
    plain: [
      "Running a single Pod by hand is fine for a test, but if it dies, nothing brings it back. For a real app you use a Deployment: you say which image and how many copies (replicas), and Kubernetes keeps exactly that many running, replacing any that crash or disappear with their node.",
      "Pods come and go, and each new one gets a new IP address. A Service solves this. It gives your app one stable name and address inside the cluster, and spreads requests across all healthy Pods that carry the right label.",
      "To let people outside the cluster reach the app over HTTP, you add an Ingress. It holds rules like send api.example.com to the api Service. A program called an ingress controller reads these rules and does the actual routing.",
      "Settings should not be baked into the image. A ConfigMap holds normal settings like LOG_LEVEL, and a Secret holds sensitive ones like database passwords. Kubernetes injects them into the containers as environment variables or files, so the same image runs in dev and prod.",
    ],
    deepDive: [
      {
        heading: "Deployments, ReplicaSets and rolling updates",
        body: "A Deployment does not manage Pods directly. It creates a ReplicaSet, and the ReplicaSet keeps the right number of Pods alive. When you change anything in the Pod template, such as the image tag or an environment variable, the Deployment creates a new ReplicaSet and slowly moves Pods from the old one to the new one. Changing only replicas just scales the current ReplicaSet and is not a rollout.\n\nThe default strategy is RollingUpdate with maxSurge 25% and maxUnavailable 25%. With 4 replicas, Kubernetes may run up to 5 Pods during the update and must keep at least 3 available. A new Pod counts as available only after its readiness probe passes, so a broken version stops the rollout instead of taking the site down.\n\nOld ReplicaSets are kept (10 by default, set by revisionHistoryLimit), scaled to zero. That is what makes kubectl rollout undo fast: it just scales an old ReplicaSet back up.",
        bullets: ["kubectl rollout status deployment/api waits until the rollout finishes or fails", "kubectl rollout history deployment/api lists revisions", "strategy Recreate stops all old Pods first; use it only if two versions cannot run together"],
        visual: {
          type: "flow",
          title: "Rolling update from 1.4.0 to 1.4.1 with 3 replicas",
          steps: [
            { label: "Template changes", detail: "New image tag creates ReplicaSet v2" },
            { label: "Surge", detail: "Start one v2 Pod" },
            { label: "Wait for ready", detail: "Readiness probe must pass" },
            { label: "Scale down", detail: "Remove one v1 Pod" },
            { label: "Repeat", detail: "Until v2 has 3 and v1 has 0" },
          ],
        },
      },
      {
        heading: "How a Service really routes traffic",
        body: "A Service has a selector, like app: api. Kubernetes continuously finds the Pods whose labels match and are Ready, and writes their IPs into EndpointSlice objects. The Service also gets a virtual IP (the ClusterIP) and a DNS name from CoreDNS: api in the same namespace, or api.prod.svc.cluster.local in full.\n\nThe ClusterIP is not a real machine. kube-proxy on every node turns it into packet rules, so when a client Pod sends a packet to the Service IP, the node rewrites it to one Pod IP chosen from the endpoints. No extra hop, no proxy process in the path.\n\nTwo port fields confuse people. port is what clients connect to on the Service; targetPort is the port the container listens on. A Service can listen on 80 and forward to 8000. Service types build on each other: ClusterIP (default, inside only), NodePort (also opens a port in 30000 to 32767 on every node), and LoadBalancer (also asks the cloud for an external load balancer).",
        visual: {
          type: "sequence",
          title: "A Pod calls http://api/health",
          actors: ["Client Pod", "CoreDNS", "Node rules", "API Pod"],
          messages: [
            { from: 0, to: 1, label: "What is the IP of api?" },
            { from: 1, to: 0, label: "ClusterIP 10.96.40.12" },
            { from: 0, to: 2, label: "Packet to 10.96.40.12:80" },
            { from: 2, to: 3, label: "Rewritten to 10.244.1.7:8000" },
            { from: 3, to: 0, label: "200 OK" },
          ],
        },
      },
      {
        heading: "Ingress and ingress controllers",
        body: "An Ingress is only a set of HTTP rules: host names, URL paths, and which Service and port each one goes to, plus optional TLS using a certificate stored in a Secret. On its own it does nothing. An ingress controller, such as the NGINX, Traefik or HAProxy controller or a cloud one like the AWS Load Balancer Controller, watches Ingress objects and configures a real proxy. You choose which controller handles an Ingress with ingressClassName.\n\nEach path has a pathType. Prefix matches by path segments, so /api matches /api and /api/users but not /apiv2. Exact matches only that one path. One Ingress, and therefore one external load balancer, can serve many Services, which is much cheaper than one LoadBalancer Service per app.\n\nThe newer Gateway API is the official successor to Ingress. It splits the job into GatewayClass, Gateway and HTTPRoute objects and supports features like header matching and traffic splitting without controller-specific annotations. Many teams are moving to it, but Ingress is still everywhere.",
      },
      {
        heading: "ConfigMaps and Secrets in practice",
        body: "You can use a ConfigMap or Secret in two ways. As environment variables (env with valueFrom, or envFrom for all keys at once), or as files by mounting it as a volume, where each key becomes a file. The difference matters when values change: environment variables are read only when the container starts, so you must restart Pods (kubectl rollout restart deployment/api). Mounted files are updated in place after a short delay, unless you mounted with subPath.\n\nA Secret's data is base64 encoded, which is not encryption: anyone who can read the Secret can decode it. Protect Secrets with RBAC so only the app's namespace and admins can read them, turn on encryption at rest for etcd (managed clusters such as EKS can use a KMS key), and keep the real values out of Git. Common patterns are creating Secrets from the CI system, or syncing them from AWS Secrets Manager with the External Secrets Operator.",
        bullets: ["kubectl create secret generic api-secrets --from-literal=DB_PASSWORD=... creates one without YAML", "stringData lets you write plain values in YAML; Kubernetes encodes them", "Mark a ConfigMap or Secret immutable: true if it should never change"],
      },
      {
        heading: "Probes: readiness, liveness and startup",
        body: "The kubelet can run three kinds of health checks on each container, using an HTTP GET, a TCP connection, a gRPC call or a command. They have different jobs. Readiness decides if the Pod receives traffic: while it fails, the Pod is removed from Service endpoints but not restarted. Liveness decides if the container is broken: after it fails failureThreshold times in a row, the kubelet kills and restarts it. Startup protects slow starters: until it succeeds, liveness and readiness are not run.\n\nThe defaults are periodSeconds 10, timeoutSeconds 1 and failureThreshold 3. So a hung app is restarted about 30 seconds after liveness starts failing.\n\nFor a FastAPI service, a readiness endpoint may check that the database pool is usable, so traffic stops during an outage. The liveness endpoint should only prove the process can answer, with no calls to other services; otherwise one database blip restarts every Pod at once. Also set resources.requests for CPU and memory, which the scheduler uses to place Pods.",
        visual: {
          type: "compare",
          title: "Three probes, three jobs",
          columns: [
            { title: "Readiness", points: ["Can it take traffic now?", "Failing: removed from the Service", "Container keeps running", "May check dependencies"] },
            { title: "Liveness", points: ["Is the process stuck?", "Failing: container restarted", "Keep it cheap and local", "Never check the database"] },
            { title: "Startup", points: ["Has it finished starting?", "Holds back the other probes", "For slow boots or migrations", "Runs only until first success"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Objects in a typical app namespace and what they point to",
        root: "Namespace prod",
        children: [
          { label: "Ingress api", children: ["host api.example.com", "backend: Service api port 80"] },
          { label: "Service api", children: ["selector app=api", "port 80 to targetPort 8000"] },
          { label: "Deployment api", children: ["ReplicaSet api-7c9f", "Pods labeled app=api"] },
          { label: "ConfigMap api-config", children: ["LOG_LEVEL", "WORKERS"] },
          { label: "Secret api-secrets", children: ["DATABASE_URL", "JWT_SECRET"] },
        ],
      },
      {
        type: "compare",
        title: "Service types",
        columns: [
          { title: "ClusterIP", points: ["Default type", "Reachable only inside the cluster", "Used for app to app calls"] },
          { title: "NodePort", points: ["Adds a port in 30000 to 32767", "Open on every node's IP", "Handy for kind and testing"] },
          { title: "LoadBalancer", points: ["Adds a cloud load balancer", "Gets an external address", "One per Service, so it costs more"] },
        ],
      },
    ],
    examples: [
      {
        title: "Expose the FastAPI Deployment with a Service and an Ingress",
        explanation: "The Deployment from the explainer labels its Pods app: api and listens on 8000. Step 1: a ClusterIP Service selects app: api and maps port 80 to targetPort 8000. Step 2: an Ingress sends every path on api.example.com to that Service. Step 3: apply both and check kubectl get endpointslices -l kubernetes.io/service-name=api; if no addresses appear, the selector does not match the Pod labels or the Pods are not ready. Step 4: in kind, test with kubectl port-forward svc/api 8080:80 and curl localhost:8080/health.",
        code: {
          lang: "yaml",
          code: `apiVersion: v1
kind: Service
metadata: { name: api }
spec:
  selector: { app: api }
  ports: [{ port: 80, targetPort: 8000 }]
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata: { name: api }
spec:
  ingressClassName: nginx
  rules:
    - host: api.example.com
      http: { paths: [{ path: /, pathType: Prefix, backend: { service: { name: api, port: { number: 80 } } } }] }`,
        },
      },
      {
        title: "Change config, ship a new image, and roll back",
        explanation: "Step 1: update the ConfigMap from the command line; piping a client dry run into apply creates or updates it. Step 2: because the app reads config from environment variables, restart the Pods with a rollout. Step 3: release 1.4.1 by changing the image, then watch the rollout. Step 4: the new Pods never become ready, so the rollout stalls while the old Pods keep serving. Step 5: roll back to the previous revision and confirm.",
        code: {
          lang: "bash",
          code: `kubectl create configmap api-config --from-literal=LOG_LEVEL=debug \\
  --dry-run=client -o yaml | kubectl apply -f -
kubectl rollout restart deployment/api
kubectl set image deployment/api api=ghcr.io/acme/api:1.4.1
kubectl rollout status deployment/api --timeout=120s   # times out: Pods not ready
kubectl get pods -l app=api                            # new Pods 0/1 READY
kubectl rollout undo deployment/api
kubectl rollout history deployment/api`,
        },
      },
    ],
    cheatSheet: [
      "kubectl create deployment api --image=img:tag --dry-run=client -o yaml writes a starter manifest",
      "kubectl port-forward svc/api 8080:80 tests a Service from your laptop",
      "Service DNS name: service.namespace.svc.cluster.local",
      "kubectl rollout undo deployment/api returns to the previous revision",
      "Env vars from ConfigMaps change only after a Pod restart; mounted files update by themselves",
      "echo value | base64 -d decodes a Secret value; base64 is not encryption",
      "No endpoints for a Service means a label mismatch or Pods that are not ready",
      "Probe defaults: periodSeconds 10, timeoutSeconds 1, failureThreshold 3",
    ],
    quiz: [
      {
        q: "You change only spec.replicas from 3 to 5. What happens?",
        options: ["A new ReplicaSet and a rolling update", "All Pods are restarted", "Nothing until you run rollout restart", "The current ReplicaSet is scaled to 5, with no rollout"],
        answer: 3,
        why: "Only changes to the Pod template trigger a new ReplicaSet; replicas just scales.",
      },
      {
        q: "A Service listens on port 80 and the container on 8000. Which field holds 8000?",
        options: ["targetPort", "port", "nodePort", "containerPort on the Service"],
        answer: 0,
        why: "port is the Service side; targetPort is where traffic goes on the Pod.",
      },
      {
        q: "Your readiness probe fails on one Pod. What does Kubernetes do?",
        options: ["Restarts the container", "Removes the Pod from the Service endpoints", "Deletes the Pod and creates a new one", "Rolls back the Deployment"],
        answer: 1,
        why: "Readiness only controls traffic; restarts are the job of the liveness probe.",
      },
      {
        q: "You updated a ConfigMap used through envFrom. Why do the Pods still see old values?",
        options: ["ConfigMaps are cached for one hour", "The ConfigMap is immutable by default", "Environment variables are read only at container start", "The Service must be recreated"],
        answer: 2,
        why: "Restart the Pods, for example with kubectl rollout restart, to pick up new env values.",
      },
      {
        q: "With 4 replicas and the default rolling update settings, how many Pods can exist at most during a rollout?",
        options: ["4", "8", "6", "5"],
        answer: 3,
        why: "maxSurge 25% of 4 is 1, so at most 5 Pods run at once.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create an nginx Deployment with 2 replicas, expose it with a ClusterIP Service, and reach it from your laptop.",
        hint: "kubectl expose creates a Service whose selector copies the Deployment's labels.",
        solution: `kubectl create deployment web --image=nginx:1.27 --replicas=2
kubectl expose deployment web --port=80 --target-port=80
kubectl get endpointslices -l kubernetes.io/service-name=web
kubectl port-forward svc/web 8080:80 &
curl -s localhost:8080 | head -4`,
      },
      {
        level: "medium",
        task: "Store DB_PASSWORD in a Secret and LOG_LEVEL in a ConfigMap, inject both into the web Deployment as environment variables, and verify inside a Pod.",
        hint: "kubectl set env --from can import a whole ConfigMap or Secret into a Deployment.",
        solution: `kubectl create configmap web-config --from-literal=LOG_LEVEL=info
kubectl create secret generic web-secrets --from-literal=DB_PASSWORD=s3cret
kubectl set env deployment/web --from=configmap/web-config
kubectl set env deployment/web --from=secret/web-secrets
kubectl rollout status deployment/web
kubectl exec deploy/web -- printenv LOG_LEVEL DB_PASSWORD
kubectl get secret web-secrets -o jsonpath='{.data.DB_PASSWORD}' | base64 -d`,
      },
      {
        level: "hard",
        task: "Add readiness and liveness probes to the FastAPI Deployment, then make readiness fail on purpose and show that the Pod leaves the Service without being restarted.",
        hint: "Point readiness at a path that returns 404 and watch READY and RESTARTS separately.",
        solution: `# in the container spec:
# readinessProbe: { httpGet: { path: /ready, port: 8000 }, periodSeconds: 5 }
# livenessProbe:  { httpGet: { path: /health, port: 8000 }, initialDelaySeconds: 10 }
kubectl apply -f deployment.yaml
kubectl patch deployment api --type=json -p \\
 '[{"op":"replace","path":"/spec/template/spec/containers/0/readinessProbe/httpGet/path","value":"/nope"}]'
kubectl get pods -l app=api -w     # new Pods stay 0/1 READY, RESTARTS stays 0
kubectl describe pod -l app=api | grep -i "readiness probe failed"
kubectl rollout undo deployment/api`,
      },
    ],
    faq: [
      { q: "Should I use a LoadBalancer Service or an Ingress?", a: "For HTTP apps, an Ingress (or Gateway API route) lets many Services share one load balancer with host and path rules. A LoadBalancer Service fits non-HTTP traffic or a single app." },
      { q: "Are Kubernetes Secrets secure?", a: "Only partly. They are base64 encoded, not encrypted, so you need RBAC, encryption at rest and a way to keep the real values out of Git, such as External Secrets Operator." },
      { q: "Why is my Service not sending traffic to my Pods?", a: "Usually the Service selector does not match the Pod labels, or the Pods are not passing readiness. Check kubectl get endpointslices for the Service and kubectl describe pod for probe failures." },
      { q: "What is the difference between a Deployment and a StatefulSet?", a: "A Deployment runs interchangeable Pods with random names. A StatefulSet gives each Pod a stable name and its own persistent volume, which databases and queues need." },
    ],
  },

  "k8s/helm": {
    plain: [
      "After a while, your Kubernetes YAML files repeat themselves. Dev and prod need the same Deployment, Service and Ingress, but with a different image tag, replica count and host name. Copying the files and editing them by hand leads to mistakes. Helm fixes this.",
      "Helm is a package manager for Kubernetes. A package is called a chart: a folder of YAML templates with blanks in them, plus a values file that fills in the blanks. You install the same chart many times with different values.",
      "Each installed copy of a chart is a release, with a name like api. Every time you upgrade it, Helm saves a new numbered revision. If version 5 is broken, you can tell Helm to go back to version 4 with one command.",
      "Helm also lets you install software other people packaged, such as Prometheus, Grafana or PostgreSQL, from public chart repositories. You only change the values you care about instead of writing hundreds of lines of YAML.",
    ],
    deepDive: [
      {
        heading: "How Helm renders a chart",
        body: "Helm templates use the Go template language plus extra functions from the Sprig library. Anything between double curly braces is evaluated. Helm gives every template a few built-in objects: .Values (the merged values), .Release (the release name, namespace and revision), .Chart (the fields of Chart.yaml) and .Capabilities (what the cluster's API supports).\n\nCommon functions do most of the work. default gives a fallback value, quote wraps a value in quotes, required stops rendering with your error message if a value is missing, and toYaml turns a whole map, like resources, into YAML. Because YAML depends on indentation, toYaml is usually piped into nindent, which adds a newline and indents the block by a given number of spaces.\n\nFiles in templates/ whose names start with an underscore, like _helpers.tpl, produce no output. They hold named templates created with define and used with include, typically for the chart's standard labels and names. After rendering, Helm sorts the objects by kind (for example Namespaces before Deployments) and sends them to the API server.",
        visual: {
          type: "flow",
          title: "From chart to running objects",
          steps: [
            { label: "Merge values", detail: "values.yaml, -f files, then --set" },
            { label: "Render templates", detail: "Go templates fill in the blanks" },
            { label: "Plain YAML", detail: "What helm template prints" },
            { label: "Send to API", detail: "Create or patch each object" },
            { label: "Save revision", detail: "Release record stored in a Secret" },
          ],
        },
      },
      {
        heading: "Values and their order of precedence",
        body: "Values can come from several places, and Helm merges them in a fixed order where later sources win. First come the chart's own values.yaml defaults. Then each file you pass with -f (or --values), in the order you pass them. Last come --set flags on the command line. So helm upgrade api ./api -f values.yaml -f values-prod.yaml --set image.tag=1.4.1 uses prod overrides on top of the defaults, and the tag from the command line on top of everything.\n\nMaps are merged deeply: if values-prod.yaml sets only resources.limits.memory, the other keys under resources stay. Lists are not merged; a list in a later file replaces the whole earlier list. To delete a default key, set it to null.\n\nA good pattern: keep values.yaml as safe, documented defaults, one small file per environment with only the differences, and use --set only for the value that changes on every deploy, usually the image tag from CI. A values.schema.json file in the chart can validate types and required fields before anything is rendered.",
        visual: {
          type: "layers",
          title: "Who wins: top overrides everything below it",
          layers: [
            { label: "--set image.tag=1.4.1", detail: "Command line, highest priority" },
            { label: "-f values-prod.yaml", detail: "Last -f file wins over earlier ones" },
            { label: "-f values-common.yaml", detail: "Shared overrides" },
            { label: "Chart values.yaml", detail: "Defaults shipped with the chart" },
          ],
        },
      },
      {
        heading: "Turning plain manifests into a chart",
        body: "Start with helm create api, which scaffolds Chart.yaml, values.yaml and templates for a Deployment, Service, Ingress, ServiceAccount and more. Many people delete most of the scaffold and copy in their own working manifests instead, then template them step by step.\n\nGo through each manifest and replace only what really differs between installs: image repository and tag, replicas, resources, host names, and environment settings. Leave everything else as plain YAML; a chart where every line is a value is hard to read. Use the release name in object names (often through the fullname helper) so two installs in one namespace do not collide, and add the recommended labels app.kubernetes.io/name and app.kubernetes.io/instance from a helper.\n\nIn Chart.yaml, version is the chart's own version and must follow semver; appVersion is the version of the app inside, used for information and often as the default image tag. Check your work with helm lint, then helm template to read the output, then helm install with --dry-run to let the server validate it too.",
        bullets: ["helm lint ./api catches template and YAML errors", "helm template api ./api -f values-prod.yaml shows the final YAML", "Bump version in Chart.yaml whenever the chart itself changes"],
      },
      {
        heading: "Releases, revisions and safe upgrades",
        body: "Helm 3 has no server-side component. It stores each revision of a release as a Secret in the release's namespace, named like sh.helm.release.v1.api.v3, holding the rendered manifest and the values used. helm list -n prod and helm history read these Secrets. By default Helm keeps the last 10 revisions per release on upgrade (--history-max).\n\nhelm upgrade --install is the usual command in pipelines because it installs the release if it does not exist and upgrades it if it does. Add --wait so Helm waits until Deployments are ready, and --timeout to set how long. In Helm 3, --atomic also rolls back automatically if the upgrade fails, so a broken release never stays in place.\n\nA rollback does not delete history. helm rollback api 3 creates a new revision, for example 6, whose content equals revision 3. Helm compares the old manifest, the new one and the live objects when it patches, so manual kubectl changes to fields the chart manages may be overwritten on the next upgrade.",
      },
      {
        heading: "Dependencies, OCI registries and secrets",
        body: "A chart can depend on other charts. You list them under dependencies in Chart.yaml with a name, version range and repository, then helm dependency update downloads them into the charts/ folder. Values for a dependency go under its name in your values file, for example redis.auth.enabled.\n\nCharts can be shared through classic chart repositories (helm repo add, then helm install bitnami/postgresql) or through OCI registries, the same registries that store container images, such as GHCR, ECR or Docker Hub. helm package ./api creates a .tgz file, helm push sends it to an oci:// address, and helm install can install straight from that address.\n\nNever put real passwords in values files committed to Git: the rendered values are also stored in the release Secret, readable by anyone who can read Secrets in that namespace. Common options are creating the Kubernetes Secret outside Helm (from CI or External Secrets Operator) and only referencing its name in the chart, or encrypting values files with SOPS and the helm-secrets plugin.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Three ways to manage manifests per environment",
        columns: [
          { title: "Plain kubectl apply", points: ["Copy YAML per environment", "No templating to learn", "Drift and copy mistakes grow", "No release history"] },
          { title: "Helm", points: ["Templates plus values files", "Release revisions and rollback", "Share and install public charts", "Templates can get complex"] },
          { title: "Kustomize", points: ["Base YAML plus patches", "No templates, built into kubectl -k", "No release history or rollback", "Good for small differences"] },
        ],
      },
      {
        type: "sequence",
        title: "helm upgrade --install --wait in a pipeline",
        actors: ["CI job", "Helm CLI", "API server", "Release Secret"],
        messages: [
          { from: 0, to: 1, label: "upgrade --install api --set image.tag=sha" },
          { from: 1, to: 3, label: "Read the last revision" },
          { from: 1, to: 1, label: "Render templates with merged values" },
          { from: 1, to: 2, label: "Patch Deployment, Service, Ingress" },
          { from: 1, to: 2, label: "Wait until Pods are ready" },
          { from: 1, to: 3, label: "Save new revision as deployed" },
          { from: 1, to: 0, label: "Exit 0, deploy done" },
        ],
      },
    ],
    examples: [
      {
        title: "Template the Deployment image, replicas and resources",
        explanation: "Step 1: in values.yaml set replicaCount: 2, image.repository: ghcr.io/acme/api, image.tag empty, and resources with requests and limits. Step 2: in templates/deployment.yaml, use the fullname helper for the name and the labels helper for labels. Step 3: the tag falls back to the chart's appVersion when it is not set. Step 4: resources is a whole map, so toYaml plus nindent writes it with the right indentation. Step 5: run helm template and read the result before installing.",
        code: {
          lang: "yaml",
          code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "api.fullname" . }}
  labels: {{- include "api.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector: { matchLabels: { app.kubernetes.io/instance: {{ .Release.Name }} } }
  template:
    metadata: { labels: { app.kubernetes.io/instance: {{ .Release.Name }} } }
    spec:
      containers:
        - name: api
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          resources: {{- toYaml .Values.resources | nindent 12 }}`,
        },
      },
      {
        title: "A bad upgrade in prod and a quick rollback",
        explanation: "Step 1: CI deploys image 1.5.0 with --wait and a 5 minute timeout. Step 2: the new Pods fail readiness, so Helm times out and marks revision 4 as failed. Step 3: helm history shows revision 3 as the last good one. Step 4: helm get values for revision 3 confirms what it ran with. Step 5: roll back to 3, which creates revision 5 with the same content. Step 6: fix the bug and deploy 1.5.1 normally.",
        code: {
          lang: "bash",
          code: `helm upgrade --install api ./charts/api -n prod \\
  -f charts/api/values-prod.yaml --set image.tag=1.5.0 --wait --timeout 5m
# Error: UPGRADE FAILED: context deadline exceeded
helm history api -n prod          # 3 superseded, 4 failed
helm get values api -n prod --revision 3
helm rollback api 3 -n prod --wait
helm history api -n prod          # 5 deployed: Rollback to 3
kubectl get pods -n prod -l app.kubernetes.io/instance=api`,
        },
      },
    ],
    cheatSheet: [
      "helm upgrade --install name chart -n ns --create-namespace installs or upgrades in one command",
      "helm template name ./chart -f values-prod.yaml renders YAML locally without a cluster",
      "helm get values name -n ns shows the values a release is using now",
      "helm get manifest name -n ns shows the YAML Helm applied",
      "Later -f files override earlier ones, and --set overrides all files",
      "helm list -A lists every release in every namespace",
      "helm uninstall name -n ns removes the release and its objects",
      "helm show values repo/chart prints a public chart's default values",
    ],
    quiz: [
      {
        q: "You run helm upgrade with -f values.yaml -f values-prod.yaml --set replicaCount=4. Both files set replicaCount. Which value is used?",
        options: ["The value in values.yaml", "The value in values-prod.yaml", "The chart default", "4"],
        answer: 3,
        why: "--set has the highest priority, above every -f file.",
      },
      {
        q: "Where does Helm 3 store release history by default?",
        options: ["As Secrets in the release namespace", "In a Tiller Pod", "In a local file in ~/.helm", "In the chart repository"],
        answer: 0,
        why: "Each revision is a Secret named like sh.helm.release.v1.name.vN.",
      },
      {
        q: "A release is at revision 5 and you run helm rollback api 3. What is the new revision number?",
        options: ["3", "5", "6", "4"],
        answer: 2,
        why: "A rollback creates a new revision whose content matches revision 3.",
      },
      {
        q: "Which command shows the final YAML without touching the cluster?",
        options: ["helm status", "helm template", "helm history", "helm get notes"],
        answer: 1,
        why: "helm template renders the chart locally and prints the manifests.",
      },
      {
        q: "values.yaml has a list of env entries and values-prod.yaml has a shorter list. What happens?",
        options: ["The lists are merged item by item", "Helm fails with a conflict", "Both lists are concatenated", "The prod list replaces the default list"],
        answer: 3,
        why: "Helm merges maps deeply but replaces lists completely.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Install the public Bitnami nginx chart in kind with 2 replicas, then list the release and its Pods.",
        hint: "Add the repo, look at the default values for the replica key, and use --set.",
        solution: `helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm show values bitnami/nginx | grep -n replicaCount
helm install web bitnami/nginx -n demo --create-namespace --set replicaCount=2
helm list -n demo
kubectl get pods -n demo`,
      },
      {
        level: "medium",
        task: "Create a chart for your API with values-dev.yaml (1 replica, debug logs) and values-prod.yaml (3 replicas, info logs). Show that the rendered output differs.",
        hint: "Render each environment with helm template and diff the two outputs.",
        solution: `helm create api
printf "replicaCount: 1\\nlogLevel: debug\\n" > api/values-dev.yaml
printf "replicaCount: 3\\nlogLevel: info\\n" > api/values-prod.yaml
# add to the container in templates/deployment.yaml:
#   env: [{ name: LOG_LEVEL, value: {{ .Values.logLevel | quote }} }]
helm lint api
helm template api ./api -f api/values-dev.yaml > dev.yaml
helm template api ./api -f api/values-prod.yaml > prod.yaml
diff dev.yaml prod.yaml`,
      },
      {
        level: "hard",
        task: "Make the chart refuse to render without an image tag, and make Pods restart automatically when the ConfigMap template changes.",
        hint: "Use required for the tag, and put a checksum of the rendered configmap.yaml in a Pod template annotation.",
        solution: `# templates/deployment.yaml
image: "{{ .Values.image.repository }}:{{ required "image.tag is required" .Values.image.tag }}"
# under spec.template.metadata:
annotations:
  checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
# test:
helm template api ./api                         # Error: image.tag is required
helm template api ./api --set image.tag=1.4.1   # renders, with a checksum annotation`,
      },
    ],
    faq: [
      { q: "What is the difference between Helm and Kustomize?", a: "Helm uses templates and values and tracks releases with rollback. Kustomize patches plain YAML without templates and is built into kubectl apply -k, but has no release history." },
      { q: "What is the difference between version and appVersion in Chart.yaml?", a: "version is the chart package's own semver version, which you bump when the chart changes. appVersion is the version of the application it deploys and is informational." },
      { q: "Does Helm still need Tiller?", a: "No. Tiller was removed in Helm 3; Helm now talks to the API server directly with your kubeconfig permissions." },
      { q: "How do I see what an upgrade will change before running it?", a: "Run helm template or helm upgrade --dry-run to see the output, or install the helm-diff plugin and run helm diff upgrade to see a diff against the live release." },
    ],
  },

  "k8s/k8s-python": {
    plain: [
      "kubectl is great for typing commands, but some jobs need real logic: check every namespace, skip Pods with a certain label, keep a count, send a report. Shell scripts that parse kubectl output get messy fast. Python with the official kubernetes package is cleaner.",
      "The Python client talks to the same API server as kubectl, using the same kubeconfig file and the same permissions. Anything kubectl can do, the client can do, and you get Python objects back instead of text to parse.",
      "The basic pattern is always the same. Load the configuration, create an API object for the group of resources you need, call a method like list_namespaced_pod, then loop over the results and read fields like pod.status.phase.",
      "Scripts that change things, like deleting Pods, should be safe by default. They print what they would do, and only act when you pass a flag such as --apply. The same script can later run inside the cluster as a scheduled job.",
    ],
    deepDive: [
      {
        heading: "How the client is organized",
        body: "The kubernetes package (pip install kubernetes) is generated from the API server's OpenAPI specification, so its classes mirror the API groups. Core objects such as Pods, Services, ConfigMaps, Secrets, Namespaces and Nodes are in CoreV1Api. Deployments and StatefulSets are in AppsV1Api, Jobs and CronJobs in BatchV1Api, and Ingresses in NetworkingV1Api.\n\nMethod names follow one pattern: verb, then namespaced or not, then kind. list_namespaced_pod lists Pods in one namespace, list_pod_for_all_namespaces lists them everywhere, and read_, create_, patch_, replace_ and delete_ do the rest. Results are model objects with snake_case attributes: the JSON field containerStatuses becomes pod.status.container_statuses. Call .to_dict() if you want plain dictionaries.\n\nThe client's major version follows the Kubernetes minor version: client 33.x was generated for Kubernetes 1.33. Pick a version close to your cluster's. For custom resources there is CustomObjectsApi, and the separate dynamic client can work with any resource type by name.",
        visual: {
          type: "tree",
          title: "Which API class holds which resources",
          root: "kubernetes.client",
          children: [
            { label: "CoreV1Api", children: ["Pods", "Services", "ConfigMaps, Secrets", "Namespaces, Nodes"] },
            { label: "AppsV1Api", children: ["Deployments", "StatefulSets", "DaemonSets"] },
            { label: "BatchV1Api", children: ["Jobs", "CronJobs"] },
            { label: "NetworkingV1Api", children: ["Ingresses", "NetworkPolicies"] },
            { label: "CustomObjectsApi", children: ["Any custom resource"] },
          ],
        },
      },
      {
        heading: "Loading config on a laptop and inside a Pod",
        body: "On your machine, config.load_kube_config() reads ~/.kube/config (or the KUBECONFIG variable) and uses the current context. You can pass context=\"kind-dev\" to choose a cluster explicitly, which is safer for scripts than trusting whatever context was used last. config.list_kube_config_contexts() returns all contexts and the active one, so a script can print which cluster it is about to touch.\n\nInside a Pod there is no kubeconfig. Kubernetes mounts a ServiceAccount token, the CA certificate and the namespace into /var/run/secrets/kubernetes.io/serviceaccount/, and sets the KUBERNETES_SERVICE_HOST and KUBERNETES_SERVICE_PORT variables. config.load_incluster_config() uses those. It raises ConfigException when they are missing.\n\nA common pattern tries in-cluster config first and falls back to the kubeconfig, so one script works in both places. For managed clusters like EKS, the kubeconfig user entry often runs a command (aws eks get-token) to fetch a short-lived token, and the Python client runs that command too.",
        visual: {
          type: "flow",
          title: "One script, two places to run",
          steps: [
            { label: "Try load_incluster_config", detail: "Works when running in a Pod" },
            { label: "On ConfigException", detail: "Not in a cluster" },
            { label: "load_kube_config", detail: "Use the local kubeconfig and context" },
            { label: "Print the target", detail: "Show cluster or context before acting" },
          ],
        },
      },
      {
        heading: "Reading Pod status correctly",
        body: "pod.status.phase alone hides most problems. A Pod in CrashLoopBackOff usually has phase Running, because the Pod exists and its container keeps restarting. The useful details are in pod.status.container_statuses, a list with one entry per container. Each has ready (True or False), restart_count, and state, where exactly one of state.running, state.waiting or state.terminated is set. The waiting reason holds values like CrashLoopBackOff, ImagePullBackOff or CreateContainerConfigError. last_state.terminated holds the exit code and reason (such as OOMKilled) of the previous run.\n\ncontainer_statuses is None while a Pod is still Pending and not scheduled, so always guard with or [] before looping.\n\nPhase Failed covers more than crashes. Pods evicted by the kubelet because the node ran low on memory or disk stay around with phase Failed and status.reason Evicted. Pods of finished Jobs end as Succeeded or Failed, and the Job controller may manage their clean-up itself, so a clean-up script should skip Pods owned by Jobs unless that is what you want.",
      },
      {
        heading: "Selectors, pagination and errors",
        body: "Filter on the server whenever you can. label_selector takes the same syntax as kubectl -l, for example app=api,tier!=batch. field_selector supports only a few fields for Pods, such as status.phase, spec.nodeName, metadata.name and metadata.namespace; anything else must be filtered in Python.\n\nOn big clusters, ask for results in pages. Pass limit=500, read the token in result.metadata._continue, and pass it back as _continue= until it is empty. This keeps memory and API server load low.\n\nErrors from the API arrive as kubernetes.client.rest.ApiException, with .status holding the HTTP code and .body the JSON message. 404 means the object is gone (often fine during clean-up, because something else deleted it first), 403 means your identity lacks an RBAC permission, 409 means a conflict such as an object that already exists, and 429 means you are being rate limited. Handle the expected ones and let the rest stop the script.",
        bullets: ["Every list call accepts label_selector, field_selector, limit and _continue", "Check e.status, not the message text, when handling ApiException", "watch.Watch().stream(v1.list_namespaced_pod, namespace=\"prod\") streams changes instead of polling"],
      },
      {
        heading: "Safe clean-ups and least-privilege RBAC",
        body: "A clean-up script deletes things, so build safety in. Default to a dry run that prints what it would delete. Show the target context. Limit the scope with namespaces or labels, and skip system namespaces like kube-system unless asked. Add a minimum age, for example only Pods that failed more than an hour ago, so you do not delete something a person is still debugging.\n\nThe API also has its own server-side dry run: passing dry_run=\"All\" to a delete or create call makes the API server run validation and admission checks without saving anything. It is a good test that your permissions are correct.\n\nWhen the script runs in the cluster as a CronJob, give it its own ServiceAccount and only the rights it needs. Listing and deleting Pods in all namespaces needs a ClusterRole with verbs get, list and delete on pods in the core API group, bound with a ClusterRoleBinding. Never bind it to cluster-admin. Test with kubectl auth can-i delete pods --as=system:serviceaccount:ops:pod-cleaner.",
        visual: {
          type: "sequence",
          title: "A clean-up CronJob run inside the cluster",
          actors: ["CronJob Pod", "API server", "RBAC check", "Failed Pod"],
          messages: [
            { from: 0, to: 1, label: "List Pods, phase=Failed, with SA token" },
            { from: 1, to: 2, label: "May pod-cleaner list pods?" },
            { from: 2, to: 1, label: "Allowed by ClusterRole" },
            { from: 1, to: 0, label: "Return matching Pods" },
            { from: 0, to: 1, label: "Delete Pods older than 1 hour" },
            { from: 1, to: 3, label: "Pod removed" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "kubectl in a shell script vs the Python client",
        columns: [
          { title: "kubectl plus bash", points: ["Fast for one-liners", "Parse text or jsonpath output", "Error handling is hard", "Needs kubectl in the image"] },
          { title: "Python client", points: ["Real objects and logic", "Exceptions with HTTP status codes", "Easy to unit test and reuse", "Runs as a CronJob with a ServiceAccount"] },
        ],
      },
    ],
    examples: [
      {
        title: "Report unhealthy containers across the cluster",
        explanation: "Goal: list every container that is waiting with a problem reason or has restarted more than 3 times. Step 1: load config and create CoreV1Api. Step 2: list Pods in pages of 500 so big clusters stay cheap. Step 3: for each Pod, loop over container_statuses, guarding against None for Pending Pods. Step 4: print namespace, Pod, container, reason and restarts. This catches CrashLoopBackOff Pods that a phase check would miss.",
        code: {
          lang: "python",
          code: `from kubernetes import client, config

config.load_kube_config()
v1 = client.CoreV1Api()
token = None
while True:
    page = v1.list_pod_for_all_namespaces(limit=500, _continue=token)
    for pod in page.items:
        for cs in pod.status.container_statuses or []:
            reason = cs.state.waiting.reason if cs.state.waiting else ""
            if reason or cs.restart_count > 3:
                print(pod.metadata.namespace, pod.metadata.name, cs.name, reason, cs.restart_count)
    token = page.metadata._continue
    if not token:
        break`,
        },
      },
      {
        title: "RBAC for a Pod clean-up CronJob",
        explanation: "Step 1: create a ServiceAccount pod-cleaner in an ops namespace. Step 2: a ClusterRole allows only get, list and delete on Pods in the core group (the empty string). Step 3: a ClusterRoleBinding gives that role to the ServiceAccount. Step 4: set serviceAccountName: pod-cleaner in the CronJob's Pod spec, and the script uses load_incluster_config. Step 5: verify with kubectl auth can-i, which should say yes for delete pods and no for delete deployments.",
        code: {
          lang: "yaml",
          code: `apiVersion: v1
kind: ServiceAccount
metadata: { name: pod-cleaner, namespace: ops }
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata: { name: pod-cleaner }
rules: [{ apiGroups: [""], resources: [pods], verbs: [get, list, delete] }]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata: { name: pod-cleaner }
roleRef: { apiGroup: rbac.authorization.k8s.io, kind: ClusterRole, name: pod-cleaner }
subjects: [{ kind: ServiceAccount, name: pod-cleaner, namespace: ops }]`,
        },
      },
    ],
    cheatSheet: [
      "pip install kubernetes, then: from kubernetes import client, config",
      "config.load_kube_config(context=\"kind-dev\") picks a cluster explicitly",
      "config.load_incluster_config() uses the Pod's ServiceAccount token",
      "Pod phase can say Running while a container is in CrashLoopBackOff; check container_statuses",
      "Field selectors for Pods: status.phase, spec.nodeName, metadata.name, metadata.namespace",
      "Use limit= and metadata._continue to page through large lists",
      "Pass dry_run=\"All\" to have the API server validate a change without saving it",
      "kubectl auth can-i delete pods --as=system:serviceaccount:ns:name tests RBAC",
    ],
    quiz: [
      {
        q: "Which class do you use to list Deployments?",
        options: ["CoreV1Api", "AppsV1Api", "BatchV1Api", "ExtensionsApi"],
        answer: 1,
        why: "Deployments belong to the apps API group, so they live in AppsV1Api.",
      },
      {
        q: "A Pod is in CrashLoopBackOff. What does pod.status.phase most likely show?",
        options: ["CrashLoopBackOff", "Failed", "Running", "Unknown"],
        answer: 2,
        why: "The reason is on the container's waiting state; the Pod phase usually stays Running.",
      },
      {
        q: "Your script gets ApiException with status 403. What does it mean?",
        options: ["The identity lacks an RBAC permission", "The object does not exist", "The API server is overloaded", "The kubeconfig file is missing"],
        answer: 0,
        why: "403 Forbidden means authentication worked but authorization denied the action.",
      },
      {
        q: "Why can pod.status.container_statuses be None?",
        options: ["The Pod has no labels", "The client version is too old", "The Pod is in kube-system", "The Pod is still Pending and has no container status yet"],
        answer: 3,
        why: "Statuses appear only after the kubelet starts working on the Pod, so guard with or [].",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Print the current context name, then the name, phase and node of every Pod in the default namespace.",
        hint: "list_kube_config_contexts returns a tuple: all contexts and the active one.",
        solution: `from kubernetes import client, config

_, active = config.list_kube_config_contexts()
print("context:", active["name"])
config.load_kube_config()
v1 = client.CoreV1Api()
for pod in v1.list_namespaced_pod("default").items:
    print(pod.metadata.name, pod.status.phase, pod.spec.node_name)`,
      },
      {
        level: "medium",
        task: "Write a function that loads in-cluster config if available and falls back to kubeconfig, then counts Pods per phase across all namespaces.",
        hint: "Catch config.ConfigException and use collections.Counter.",
        solution: `from collections import Counter
from kubernetes import client, config

def load():
    try:
        config.load_incluster_config()
    except config.ConfigException:
        config.load_kube_config()

load()
pods = client.CoreV1Api().list_pod_for_all_namespaces().items
print(Counter(p.status.phase for p in pods))`,
      },
      {
        level: "hard",
        task: "Extend the failed-Pod clean-up: skip kube-system, skip Pods failed less than one hour ago, ignore 404 on delete, and stay in dry run unless --apply is given.",
        hint: "Use pod.metadata.creation_timestamp (timezone-aware) and catch ApiException from kubernetes.client.rest.",
        solution: `import sys; from datetime import datetime, timedelta, timezone
from kubernetes import client, config; from kubernetes.client.rest import ApiException
config.load_kube_config(); v1 = client.CoreV1Api(); apply = "--apply" in sys.argv
cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
for p in v1.list_pod_for_all_namespaces(field_selector="status.phase=Failed").items:
    ns, name = p.metadata.namespace, p.metadata.name
    if ns == "kube-system" or p.metadata.creation_timestamp > cutoff: continue
    print("DELETE" if apply else "DRY RUN", ns, name)
    if apply:
        try: v1.delete_namespaced_pod(name, ns)
        except ApiException as e:
            if e.status != 404: raise`,
      },
    ],
    faq: [
      { q: "Which Python library should I use for Kubernetes?", a: "The official kubernetes package from the kubernetes-client project is the standard choice. Smaller wrappers like kr8s and lightkube exist with friendlier APIs, but the official one covers every resource." },
      { q: "Is there an async Kubernetes client for Python?", a: "Yes, kubernetes_asyncio is a separate package with the same API shape built on asyncio, useful for operators and tools that watch many resources." },
      { q: "How do I apply a YAML file from Python?", a: "kubernetes.utils.create_from_yaml(api_client, \"file.yaml\") creates the objects in a file. It does not do a full kubectl apply style update, so for updates use patch methods or call kubectl." },
      { q: "Can my script watch for changes instead of polling?", a: "Yes. watch.Watch().stream() wraps a list method and yields ADDED, MODIFIED and DELETED events as they happen. Be ready to restart the watch when it times out." },
    ],
  },
};

export default extra;

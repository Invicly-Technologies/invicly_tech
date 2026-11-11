import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "cka-networking/pod-networking": {
    plain: [
      "In Kubernetes every Pod gets its own IP address, like a small computer on the network. Any Pod can talk to any other Pod using that IP, even if they run on different machines. Nobody has to map ports or translate addresses in between.",
      "Kubernetes sets this rule but does not build the network itself. A plugin does, following a standard called CNI (Container Network Interface). Popular plugins are Calico, Cilium and Flannel. You install one right after kubeadm init, and until you do, nodes stay NotReady.",
      "Inside a Pod, all containers share one network. They see the same IP and can reach each other on localhost, just like programs on one laptop. A tiny hidden container (often called the pause container) holds that shared network open for the Pod.",
      "Pod IPs change every time a Pod is recreated, so apps should never hard-code them. For a stable address you put a Service in front, which is the next topic.",
    ],
    deepDive: [
      {
        heading: "What happens when a Pod gets its network",
        body: "The kubelet asks the container runtime (containerd or CRI-O) to create a Pod sandbox. The runtime creates a new network namespace, which is an isolated copy of the network stack, then runs the CNI plugin named in the first config file (by name order) in /etc/cni/net.d, with the ADD command. The plugin binary comes from /opt/cni/bin.\n\nThe plugin creates a veth pair, a virtual cable with one end inside the Pod (eth0) and one end on the node. Its IPAM part (IP address management) picks a free IP from the node's range, then it sets routes so traffic can leave. When the Pod is deleted, the runtime calls the plugin again with DEL to release the IP. If any of this fails, the Pod stays ContainerCreating with a FailedCreatePodSandBox event.",
        visual: {
          type: "sequence",
          title: "Wiring up one Pod",
          actors: ["kubelet", "containerd", "CNI plugin", "Node kernel"],
          messages: [
            { from: 0, to: 1, label: "RunPodSandbox (CRI call)" },
            { from: 1, to: 3, label: "Create network namespace" },
            { from: 1, to: 2, label: "CNI ADD with netns and config" },
            { from: 2, to: 3, label: "Create veth pair, assign IP, add routes" },
            { from: 2, to: 1, label: "Result: Pod IP" },
            { from: 1, to: 0, label: "Sandbox ready, start containers" },
          ],
        },
      },
      {
        heading: "Pod CIDR, Service CIDR and where to find them",
        body: "Three address ranges must not overlap: the node network (your VMs), the Pod CIDR and the Service CIDR. With kubeadm you set the Pod range with kubeadm init --pod-network-cidr, for example 10.244.0.0/16, and the Service range defaults to 10.96.0.0/12.\n\nThe controller manager can slice the Pod range into one block per node (a /24 by default for IPv4) and write it to node.spec.podCIDR. Some plugins ignore that and run their own IPAM, such as Calico IP pools or Cilium's cluster pool, so the real source of truth is the plugin's own config. To read the cluster values, look at the static Pod manifests: --cluster-cidr in kube-controller-manager.yaml and --service-cluster-ip-range in kube-apiserver.yaml.",
        bullets: ["grep cluster-cidr /etc/kubernetes/manifests/kube-controller-manager.yaml", "grep service-cluster-ip-range /etc/kubernetes/manifests/kube-apiserver.yaml", "kubectl get nodes -o custom-columns=NAME:.metadata.name,CIDR:.spec.podCIDR"],
      },
      {
        heading: "Same node versus different nodes",
        body: "On the same node, traffic between two Pods never leaves the machine. Some plugins connect all veths to a Linux bridge (Flannel uses one called cni0); others, like Calico, use plain routes, one per Pod IP.\n\nAcross nodes there are two styles. Routed (or native) mode sends packets with their real Pod IPs, and the underlying network must know which node owns which Pod range; Calico can share these routes with BGP on TCP port 179. Overlay mode wraps each packet inside another packet addressed node to node, usually VXLAN on UDP port 8472 for Flannel and Cilium. Overlays work on any network but add about 50 bytes per packet, so the Pod MTU must be smaller than the node MTU, or large requests mysteriously hang.",
        visual: {
          type: "compare",
          title: "Routed versus overlay networking",
          columns: [
            { title: "Routed (native)", points: ["Packets keep Pod IPs", "Network must know Pod routes", "No extra header, full MTU", "Calico BGP, cloud VPC routes"] },
            { title: "Overlay (VXLAN)", points: ["Packets wrapped node to node", "Works on any flat network", "About 50 bytes overhead", "Flannel default, Cilium option"] },
          ],
        },
      },
      {
        heading: "Checking that the CNI is healthy",
        body: "Start with the nodes: a node without a working CNI reports Ready False with a message like container runtime network not ready, cni plugin not initialized. Next, list the plugin Pods in kube-system (or their own namespace, such as calico-system or kube-flannel). They are usually a DaemonSet, so there should be one Ready Pod per node.\n\nThen test the data path: run two Pods on different nodes and ping or wget between their IPs. If same-node works but cross-node fails, suspect the overlay ports being blocked by a firewall or cloud security group, or an MTU mismatch. Remember that kube-proxy is not involved in Pod-to-Pod traffic at all; it only handles Service IPs.",
        bullets: ["ls /etc/cni/net.d /opt/cni/bin on the node", "kubectl get ds -A | grep -Ei 'calico|cilium|flannel'", "ip route on a node shows the Pod routes the plugin added"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "The networking stack of one Pod",
        layers: [
          { label: "Containers", detail: "Share one IP; talk over localhost" },
          { label: "Pod network namespace", detail: "Held open by the pause container" },
          { label: "eth0 inside the Pod", detail: "One end of the veth pair" },
          { label: "veth on the node", detail: "Connected to a bridge or routes" },
          { label: "Node routing or overlay", detail: "Set up by the CNI plugin" },
          { label: "Physical network", detail: "Carries traffic between nodes" },
        ],
      },
    ],
    examples: [
      {
        title: "Proving Pod-to-Pod traffic across nodes",
        explanation: "Step 1: start two Pods pinned to different nodes with nodeName overrides. Step 2: read their IPs with -o wide. Step 3: from Pod a, fetch a page from Pod b's IP directly, with no Service. Step 4: if it times out but works when both Pods are on one node, the cross-node path (overlay ports, routes or MTU) is broken.",
        code: {
          lang: "bash",
          code: "kubectl run a --image=busybox:1.36 --overrides='{\"apiVersion\":\"v1\",\"spec\":{\"nodeName\":\"node01\"}}' -- sleep 3600\nkubectl run b --image=nginx:1.27 --overrides='{\"apiVersion\":\"v1\",\"spec\":{\"nodeName\":\"node02\"}}'\nkubectl get pods a b -o wide\nB_IP=$(kubectl get pod b -o jsonpath='{.status.podIP}')\nkubectl exec a -- wget -qO- -T 3 http://$B_IP | head -4\nkubectl exec a -- ip addr show eth0",
        },
      },
      {
        title: "A fresh cluster where every node is NotReady",
        explanation: "After kubeadm init and join, kubectl get nodes shows NotReady and the CoreDNS Pods are Pending. Step 1: describe a node and read the Ready condition message about the CNI. Step 2: check /etc/cni/net.d on the node; it is empty. Step 3: install a CNI plugin whose Pod range matches --pod-network-cidr. Step 4: watch the nodes turn Ready and CoreDNS start.",
        code: {
          lang: "bash",
          code: "kubectl get nodes\nkubectl describe node cp1 | grep -i 'network'\nls /etc/cni/net.d/              # empty: no plugin installed\nkubectl apply -f https://github.com/flannel-io/flannel/releases/latest/download/kube-flannel.yml\nkubectl get nodes -w\nkubectl -n kube-system get pods -l k8s-app=kube-dns",
        },
      },
    ],
    cheatSheet: [
      "Network model: every Pod has its own IP and reaches every other Pod without NAT",
      "CNI config: /etc/cni/net.d (first file wins); binaries: /opt/cni/bin",
      "kubeadm init --pod-network-cidr=10.244.0.0/16 sets the Pod range (Flannel's default)",
      "kubeadm's default Service range is 10.96.0.0/12",
      "VXLAN overlays use UDP 8472 (Flannel, Cilium); Calico BGP uses TCP 179",
      "Containers in one Pod share the network namespace and use localhost",
      "kube-proxy handles Service IPs only, never plain Pod-to-Pod traffic",
    ],
    quiz: [
      {
        q: "Two containers in the same Pod need to talk. Which address should one use to reach the other?",
        options: ["The Pod's Service name", "The node IP", "The other container's own IP", "localhost and the other container's port"],
        answer: 3,
        why: "Containers in a Pod share one network namespace, so they reach each other on localhost.",
      },
      {
        q: "Pods on the same node can talk, but Pods on different nodes cannot. What is the least likely cause?",
        options: ["A firewall blocks the overlay port", "kube-proxy is down", "An MTU mismatch on the overlay", "Missing routes for other nodes' Pod ranges"],
        answer: 1,
        why: "kube-proxy only handles Service traffic, so it does not affect direct Pod-to-Pod packets.",
      },
      {
        q: "Which component calls the CNI plugin when a Pod is created?",
        options: ["The container runtime, such as containerd", "The scheduler", "kube-proxy", "The API server"],
        answer: 0,
        why: "The kubelet asks the runtime for a sandbox, and the runtime runs the CNI plugin.",
      },
      {
        q: "Where do you read the Service IP range on a kubeadm control plane node?",
        options: ["/etc/cni/net.d", "The kubelet config", "--service-cluster-ip-range in kube-apiserver.yaml", "The coredns ConfigMap"],
        answer: 2,
        why: "The API server allocates Service IPs from that flag's range.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Find which CNI plugin your cluster uses and the Pod IP of every Pod in kube-system.",
        hint: "Look at the config file names and at Pods with -o wide.",
        solution: "ls /etc/cni/net.d/          # e.g. 10-calico.conflist\nkubectl get pods -A -o wide | grep -Ei 'calico|cilium|flannel'\nkubectl -n kube-system get pods -o wide",
      },
      {
        level: "medium",
        task: "Write the cluster's Pod CIDR and Service CIDR into /opt/cidrs.txt, one per line.",
        hint: "Both are flags in static Pod manifests on the control plane.",
        solution: "grep -o 'cluster-cidr=[^ ]*' /etc/kubernetes/manifests/kube-controller-manager.yaml > /opt/cidrs.txt\ngrep -o 'service-cluster-ip-range=[^ ]*' /etc/kubernetes/manifests/kube-apiserver.yaml >> /opt/cidrs.txt\ncat /opt/cidrs.txt",
      },
      {
        level: "hard",
        task: "On a node, find the veth interface that belongs to a given Pod.",
        hint: "Inside the Pod, eth0@ifN shows the peer's interface index on the node.",
        solution: "kubectl get pod web -o wide          # note the node\nkubectl exec web -- cat /sys/class/net/eth0/iflink   # e.g. 17\n# on that node:\nip -o link | grep '^17:'               # e.g. 17: cali1a2b3c@if3 or veth...",
      },
    ],
    faq: [
      { q: "Which CNI plugin should I use?", a: "For learning, Flannel is simplest but does not enforce NetworkPolicies. Calico and Cilium both enforce policies and are common in production; pick one and learn its basic checks." },
      { q: "Can Pods talk to each other across namespaces?", a: "Yes. Namespaces do not isolate network traffic by themselves. Use NetworkPolicies if you need to block it." },
      { q: "Why is my Pod stuck in ContainerCreating with a sandbox error?", a: "The CNI plugin failed to set up the Pod network, often because the plugin is not installed, its Pods are crashing, or it has run out of IPs. Read the Pod events and the CNI Pod logs." },
    ],
  },

  "cka-networking/services": {
    plain: [
      "Pods come and go, and each new Pod gets a new IP. If a web front end had to track every backend Pod IP, it would break constantly. A Service fixes this by giving a group of Pods one stable name and one stable IP.",
      "The Service finds its Pods with a label selector, such as app=api. Any Ready Pod with that label becomes a backend, called an endpoint. Requests to the Service are spread across those endpoints.",
      "There are three main types. ClusterIP is only reachable inside the cluster and is the default. NodePort also opens the same port on every node, so you can reach the app from outside. LoadBalancer asks a cloud provider for a real load balancer with a public address.",
      "The magic is done by kube-proxy, a program on every node. It does not pass traffic itself; it writes kernel rules that rewrite the Service IP to a real Pod IP. That is why you cannot ping a Service IP, but you can connect to its port.",
    ],
    deepDive: [
      {
        heading: "Three ports that people mix up",
        body: "port is the port on the Service IP that clients call. targetPort is the port on the container that receives the traffic; if you leave it out, it equals port. nodePort is only for NodePort and LoadBalancer Services and is opened on every node, chosen from 30000 to 32767 unless you set one in that range.\n\ntargetPort may also be a name, such as http, that matches a named containerPort in the Pod spec. That lets different Pods use different numbers behind one Service and survives port changes in the image. The containerPort field itself is informational; a process listening on 8080 receives traffic whether you declared it or not.",
        bullets: ["kubectl expose deploy web --port=80 --target-port=8080", "kubectl create service nodeport web --tcp=80:8080 --node-port=30080", "kubectl get svc web -o yaml shows all three ports"],
      },
      {
        heading: "What kube-proxy really programs",
        body: "kube-proxy watches Services and EndpointSlices and writes rules in the kernel. In the default iptables mode, a packet to the Service IP hits a KUBE-SERVICES rule, jumps to a per-Service chain, and is randomly sent to one per-endpoint chain that rewrites the destination (DNAT) to a Pod IP and port. The nftables mode, stable since Kubernetes 1.33, does the same with nftables and scales better. IPVS mode uses the kernel's load balancer.\n\nBecause only ports are translated, ICMP ping to a ClusterIP usually gets no answer. Test Services with wget, curl or nc instead. sessionAffinity: ClientIP sends one client to the same Pod (default timeout 3 hours). externalTrafficPolicy: Local keeps the client's real source IP for NodePort and LoadBalancer traffic, but only nodes running a Ready endpoint will answer.",
        visual: {
          type: "flow",
          title: "A packet to 10.96.40.12:80 in iptables mode",
          steps: [
            { label: "Client Pod sends", detail: "Destination 10.96.40.12:80" },
            { label: "KUBE-SERVICES", detail: "Matches the Service IP and port" },
            { label: "KUBE-SVC chain", detail: "Picks an endpoint at random" },
            { label: "KUBE-SEP chain", detail: "DNAT to 10.244.2.7:8080" },
            { label: "Normal Pod routing", detail: "CNI delivers to the Pod" },
          ],
        },
      },
      {
        heading: "EndpointSlices and readiness",
        body: "The EndpointSlice controller looks for Pods matching the selector in the Service's namespace and lists their IPs, ports and readiness. Each slice holds up to 100 endpoints by default and carries the label kubernetes.io/service-name. The older Endpoints API still works but is deprecated since 1.33, so prefer EndpointSlices.\n\nA Pod that is not Ready stays in the slice marked ready false, and kube-proxy does not send it traffic. So an empty Service has three common causes: the selector matches no Pods (a label typo, or the Pods are in another namespace), the Pods exist but fail their readiness probe, or the targetPort does not match what the app listens on, which shows up as connection refused rather than an empty list.",
        bullets: ["kubectl get endpointslices -l kubernetes.io/service-name=web -o wide", "kubectl get pods -l app=web -o wide shows whether the selector finds Pods", "kubectl describe svc web shows Selector and Endpoints together"],
      },
      {
        heading: "Special Services",
        body: "A headless Service (clusterIP: None) has no virtual IP and no kube-proxy rules; DNS returns the Pod IPs directly. StatefulSets use it so each Pod gets a stable name like db-0.db.prod.svc.cluster.local.\n\nA Service without a selector gets no automatic endpoints. You add an EndpointSlice by hand, which is a way to give an outside database a cluster-internal name. type ExternalName returns a DNS CNAME to another hostname and involves no proxying at all. A LoadBalancer Service on a cluster without a cloud controller shows EXTERNAL-IP pending forever; in labs use NodePort, or install something like MetalLB.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Each Service type builds on the one below",
        layers: [
          { label: "LoadBalancer", detail: "External LB sends to node ports" },
          { label: "NodePort", detail: "Port 30000-32767 open on every node" },
          { label: "ClusterIP", detail: "Virtual IP and DNS name inside the cluster" },
          { label: "EndpointSlices", detail: "Ready Pod IPs from the selector" },
          { label: "Pods", detail: "Receive traffic on targetPort" },
        ],
      },
    ],
    examples: [
      {
        title: "A Service with no endpoints",
        explanation: "Users get errors from web, and kubectl describe svc web shows an empty Endpoints line. Step 1: read the Service selector. Step 2: list Pods with that exact selector; nothing comes back. Step 3: show Pod labels; the Pods say app=web-app. Step 4: fix the selector to match. Step 5: the EndpointSlice fills within seconds and requests work.",
        code: {
          lang: "bash",
          code: "kubectl get svc web -o jsonpath='{.spec.selector}'; echo   # {\"app\":\"web\"}\nkubectl get pods -l app=web                                 # No resources found\nkubectl get pods --show-labels | grep web                   # app=web-app\nkubectl patch svc web -p '{\"spec\":{\"selector\":{\"app\":\"web-app\"}}}'\nkubectl get endpointslices -l kubernetes.io/service-name=web\nkubectl run t --rm -it --image=busybox:1.36 --restart=Never -- wget -qO- -T 3 http://web",
        },
      },
      {
        title: "Expose an app on a fixed NodePort",
        explanation: "A task says: expose Deployment shop on port 30080 of every node, forwarding to container port 8080. Step 1: generate the Service YAML with expose and dry-run. Step 2: add nodePort: 30080 under ports. Step 3: apply and test from outside with a node IP.",
        code: {
          lang: "bash",
          code: "kubectl expose deploy shop --name=shop-np --type=NodePort --port=80 \\\n  --target-port=8080 --dry-run=client -o yaml > np.yaml\n# edit ports:  - { port: 80, targetPort: 8080, nodePort: 30080 }\nkubectl apply -f np.yaml\nkubectl get svc shop-np        # 80:30080/TCP\ncurl -s http://NODE_IP:30080/ | head -3",
        },
      },
    ],
    cheatSheet: [
      "port = Service port, targetPort = container port, nodePort = 30000-32767 on every node",
      "kubectl expose pod web --port=80 --name=web-svc creates a ClusterIP Service",
      "kubectl create svc clusterip db --tcp=5432:5432 sets selector app=db",
      "Do not ping a ClusterIP; test with wget, curl or nc to the port",
      "EndpointSlice label: kubernetes.io/service-name=NAME",
      "externalTrafficPolicy: Local keeps the client IP; only nodes with endpoints answer",
      "kubectl port-forward svc/web 8080:80 tests a Service from your machine",
    ],
    quiz: [
      {
        q: "Pods are Running and labels match the Service selector, but the Service has no ready endpoints. Most likely cause?",
        options: ["kube-proxy is in iptables mode", "The Pods are failing their readiness probe", "The Service type is ClusterIP", "The nodePort is out of range"],
        answer: 1,
        why: "Only Ready Pods receive traffic, so failing readiness empties the Service.",
      },
      {
        q: "A Service has port 80 and no targetPort. Which container port receives traffic?",
        options: ["80", "8080", "A random port", "The nodePort"],
        answer: 0,
        why: "When targetPort is left out, it defaults to the same value as port.",
      },
      {
        q: "ping 10.96.12.5 (a ClusterIP) fails, but wget to its port works. What does this tell you?",
        options: ["The Service is broken", "DNS is broken", "CoreDNS is down", "Nothing is wrong; kube-proxy only translates ports, not ICMP"],
        answer: 3,
        why: "Service rules match protocol and port, so ping to a ClusterIP normally gets no reply.",
      },
      {
        q: "In a lab without a cloud provider, a LoadBalancer Service shows EXTERNAL-IP pending. What still works?",
        options: ["Nothing until the IP appears", "Only the headless DNS name", "The ClusterIP and the automatically assigned nodePort", "Only port-forward"],
        answer: 2,
        why: "A LoadBalancer Service is also a NodePort and ClusterIP Service underneath.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create Deployment echo (image nginx:1.27, 2 replicas) and a ClusterIP Service echo on port 8000 that targets port 80, then call it from a temporary Pod.",
        hint: "kubectl expose sets the selector from the Deployment for you.",
        solution: "kubectl create deploy echo --image=nginx:1.27 --replicas=2\nkubectl expose deploy echo --port=8000 --target-port=80\nkubectl run t --rm -it --image=busybox:1.36 --restart=Never -- \\\n  wget -qO- -T 3 http://echo:8000",
      },
      {
        level: "medium",
        task: "Give the echo Pods a named port http and change the Service to use targetPort: http. Prove traffic still flows.",
        hint: "Edit the Deployment's containerPort with a name, then patch the Service.",
        solution: "kubectl patch deploy echo --type=json -p \\\n  '[{\"op\":\"add\",\"path\":\"/spec/template/spec/containers/0/ports\",\"value\":[{\"name\":\"http\",\"containerPort\":80}]}]'\nkubectl patch svc echo --type=json -p \\\n  '[{\"op\":\"replace\",\"path\":\"/spec/ports/0/targetPort\",\"value\":\"http\"}]'\nkubectl get endpointslices -l kubernetes.io/service-name=echo\nkubectl run t --rm -it --image=busybox:1.36 --restart=Never -- wget -qO- -T 3 http://echo:8000",
      },
      {
        level: "hard",
        task: "On a node, find the iptables rules kube-proxy created for Service echo and name the Pod IPs it can DNAT to.",
        hint: "Rules carry the Service name in a comment; endpoint chains contain DNAT.",
        solution: "sudo iptables-save -t nat | grep 'default/echo' | head\n# KUBE-SVC-XXXX chain jumps to KUBE-SEP-YYYY chains\nsudo iptables-save -t nat | grep 'default/echo' | grep DNAT\nkubectl get pods -l app=echo -o wide   # compare the IPs\n# (if kube-proxy uses nftables mode: sudo nft list ruleset | grep echo)",
      },
    ],
    faq: [
      { q: "What is the difference between ClusterIP, NodePort and LoadBalancer?", a: "ClusterIP is reachable only inside the cluster. NodePort adds a port on every node for outside access. LoadBalancer adds a cloud load balancer in front of those node ports." },
      { q: "Why does my Service have no endpoints?", a: "The selector does not match any Pod labels in that namespace, or the matching Pods are not Ready. Compare kubectl get svc -o wide with kubectl get pods --show-labels." },
      { q: "Do I need a Service for Pods to talk to each other?", a: "No, Pods can use each other's IPs directly. But Pod IPs change, so a Service gives a stable name and spreads load, which is what you want in practice." },
    ],
  },

  "cka-networking/ingress-gateway": {
    plain: [
      "A LoadBalancer Service per app gets expensive and messy: ten apps, ten public IPs. Most web traffic is HTTP, so it is easier to have one smart entry point that reads each request and sends it to the right Service, based on the host name or the URL path.",
      "Kubernetes has two APIs for that entry point. Ingress is the older, simple one: a list of host and path rules. Gateway API is the newer one, split into objects for different people: platform teams own the Gateway, app teams own their routes.",
      "Neither API does anything alone. They are just descriptions. A controller (a proxy such as NGINX, HAProxy, Traefik, Envoy or Cilium) reads them and actually handles the traffic. No controller means no traffic, even if the YAML looks perfect.",
      "Both can also handle HTTPS. You store the certificate and key in a TLS Secret, point the Ingress or Gateway at it, and the proxy decrypts traffic before passing it to your app.",
    ],
    deepDive: [
      {
        heading: "Ingress rules, path types and classes",
        body: "Each Ingress rule has an optional host and a list of paths, each pointing to a Service name and port. pathType Exact matches only that path. Prefix matches by path segments: /shop matches /shop and /shop/cart but not /shopping. ImplementationSpecific leaves it to the controller. When several paths match, the longest wins.\n\nspec.ingressClassName picks the controller. If it is missing, the IngressClass marked with the annotation ingressclass.kubernetes.io/is-default-class: \"true\" is used, and if there is no default, the Ingress may be ignored. Features like URL rewrites or rate limits are controller-specific annotations and do not carry over between controllers. The Ingress API itself is frozen: it still works, but new features only go into Gateway API.",
        bullets: ["kubectl get ingressclass shows installed classes", "A rule with no host matches every host", "defaultBackend catches requests that match no rule"],
      },
      {
        heading: "Installing a controller in practice",
        body: "Controllers are installed like any app: with Helm or a manifest, usually as a Deployment plus a Service of type LoadBalancer or NodePort. On a lab cluster with no cloud load balancer, the controller's Service is often NodePort, so you test with curl -H \"Host: shop.example.com\" http://NODE_IP:NODEPORT/.\n\nA note on choice: the community ingress-nginx controller was retired in March 2026 and gets no further releases, so new clusters should pick a maintained Ingress controller or move to Gateway API. On the exam, a controller is normally already installed; your job is to find its class name and write correct rules. kubectl describe ingress shows the address the controller assigned and the backends it resolved.",
      },
      {
        heading: "Gateway API objects and how they attach",
        body: "Gateway API is a set of CRDs you install separately (the standard channel from the kubernetes-sigs/gateway-api releases), plus a controller. A GatewayClass names the controller through controllerName. A Gateway uses that class and defines listeners: each has a name, protocol (HTTP or HTTPS), port, optional hostname and, for HTTPS, tls mode Terminate with certificateRefs to a TLS Secret.\n\nallowedRoutes on a listener decides which namespaces may attach routes: Same (the default), All, or a label Selector. An HTTPRoute attaches with parentRefs, optionally naming one listener with sectionName. Rules match on path (PathPrefix, Exact), headers, query parameters or method, can apply filters like RequestRedirect or URLRewrite, and list backendRefs. Giving two backendRefs weights such as 90 and 10 splits traffic, which is a simple canary release.",
        visual: {
          type: "sequence",
          title: "How a route gets attached",
          actors: ["Platform team", "Gateway controller", "App team"],
          messages: [
            { from: 0, to: 1, label: "Create GatewayClass and Gateway" },
            { from: 1, to: 0, label: "Gateway status: Accepted, Programmed, address" },
            { from: 2, to: 1, label: "Create HTTPRoute with parentRefs" },
            { from: 1, to: 1, label: "Check allowedRoutes and backends" },
            { from: 1, to: 2, label: "Route status: Accepted, ResolvedRefs" },
          ],
        },
      },
      {
        heading: "Debugging with status conditions",
        body: "Gateway API objects report problems in their status, which makes them easier to debug than Ingress. A Gateway should show Accepted and Programmed True; if Programmed stays False, the controller could not create the proxy or get an address. An HTTPRoute shows a status entry per parent: Accepted False with reason NotAllowedByListeners means the listener's allowedRoutes rejects the route's namespace. ResolvedRefs False means a backend Service or port does not exist, or it lives in another namespace without a ReferenceGrant allowing the reference.\n\nFor Ingress, check in this order: is the controller running, does the class name match, does describe show the backend endpoints, and does the TLS Secret exist in the same namespace as the Ingress.",
        bullets: ["kubectl get gateway,httproute -A", "kubectl describe httproute NAME, then read Status > Parents > Conditions", "Cross-namespace backendRefs need a ReferenceGrant in the target namespace"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Ingress versus Gateway API",
        columns: [
          { title: "Ingress", points: ["One object holds everything", "HTTP and HTTPS only", "Extras via controller annotations", "Built into Kubernetes", "API frozen, still supported"] },
          { title: "Gateway API", points: ["Split by role: class, gateway, route", "HTTP, gRPC, TLS and more route types", "Headers, weights, redirects in the spec", "CRDs installed separately", "Where new features land"] },
        ],
      },
    ],
    examples: [
      {
        title: "Host and path routing with TLS on Ingress",
        explanation: "Requirement: shop.example.com/ goes to web, shop.example.com/api goes to api, over HTTPS. Step 1: create the TLS Secret in the app's namespace. Step 2: create the Ingress imperatively; a trailing * makes a Prefix path, and tls= adds the certificate. Step 3: describe it to see resolved backends. Step 4: test with curl, forcing the host name to the controller's address.",
        code: {
          lang: "bash",
          code: "kubectl -n shop create secret tls shop-tls --cert=shop.crt --key=shop.key\nkubectl -n shop create ingress shop --class=nginx \\\n  --rule=\"shop.example.com/*=web:80,tls=shop-tls\" \\\n  --rule=\"shop.example.com/api*=api:8080,tls=shop-tls\"\nkubectl -n shop describe ingress shop\ncurl -k --resolve shop.example.com:443:CONTROLLER_IP https://shop.example.com/api",
        },
      },
      {
        title: "A canary release with HTTPRoute weights",
        explanation: "You want 10 percent of traffic on the new version. Step 1: run two Deployments with Services web-v1 and web-v2. Step 2: write an HTTPRoute attached to the shared Gateway with two weighted backendRefs. Step 3: check the route status is Accepted and ResolvedRefs. Step 4: raise the weight in steps until v2 takes 100.",
        code: {
          lang: "yaml",
          code: "apiVersion: gateway.networking.k8s.io/v1\nkind: HTTPRoute\nmetadata: { name: web, namespace: web }\nspec:\n  parentRefs: [{ name: main-gw, namespace: infra, sectionName: https }]\n  hostnames: [\"www.example.com\"]\n  rules:\n    - backendRefs:\n        - { name: web-v1, port: 80, weight: 90 }\n        - { name: web-v2, port: 80, weight: 10 }",
        },
      },
    ],
    cheatSheet: [
      "kubectl create ingress NAME --class=C --rule=\"host/path*=svc:port,tls=secret\"",
      "pathType Prefix matches whole path segments: /shop matches /shop/cart, not /shopping",
      "Default class annotation: ingressclass.kubernetes.io/is-default-class: \"true\"",
      "TLS Secret type kubernetes.io/tls, same namespace as the Ingress",
      "HTTPRoute attaches with parentRefs; sectionName picks one listener",
      "Listener allowedRoutes.namespaces.from: Same (default), All or Selector",
      "Healthy Gateway: Accepted and Programmed True; healthy route: Accepted and ResolvedRefs True",
    ],
    quiz: [
      {
        q: "An Ingress rule uses path /shop with pathType Prefix. Which request does it NOT match?",
        options: ["/shop", "/shop/", "/shop/cart", "/shopping"],
        answer: 3,
        why: "Prefix matching works on whole path segments, and shopping is a different segment.",
      },
      {
        q: "An HTTPRoute in namespace team-a shows Accepted False, reason NotAllowedByListeners. What should you check?",
        options: ["The Gateway listener's allowedRoutes namespaces", "The TLS Secret", "The backend Service port", "The IngressClass"],
        answer: 0,
        why: "The listener only accepts routes from namespaces its allowedRoutes setting permits.",
      },
      {
        q: "Where must the TLS Secret for an Ingress live?",
        options: ["kube-system", "The controller's namespace", "The same namespace as the Ingress", "Any namespace"],
        answer: 2,
        why: "An Ingress can only reference Secrets in its own namespace.",
      },
      {
        q: "Which Gateway API feature gives you a 90/10 traffic split without annotations?",
        options: ["sectionName", "weight on backendRefs", "allowedRoutes", "ReferenceGrant"],
        answer: 1,
        why: "Weights on backendRefs are part of the HTTPRoute spec.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List the installed IngressClasses and say which one is the default.",
        hint: "The default is shown by an annotation; describe or -o yaml reveals it.",
        solution: "kubectl get ingressclass\nkubectl get ingressclass -o yaml | grep -B3 -A1 is-default-class",
      },
      {
        level: "medium",
        task: "Create an Ingress app in namespace web: host app.example.com, path /v1 (Prefix) to Service v1:80 and path /v2 to Service v2:80, class nginx.",
        hint: "Two --rule flags, each ending in * for Prefix.",
        solution: "kubectl -n web create ingress app --class=nginx \\\n  --rule=\"app.example.com/v1*=v1:80\" \\\n  --rule=\"app.example.com/v2*=v2:80\"\nkubectl -n web get ingress app -o yaml | grep -A3 pathType\ncurl -H 'Host: app.example.com' http://NODE_IP:NODEPORT/v1",
      },
      {
        level: "hard",
        task: "Create a Gateway gw in namespace infra (class given as cls) with an HTTP listener on port 80 accepting routes from all namespaces, and an HTTPRoute in web sending app.example.com to Service app:80.",
        hint: "Set allowedRoutes on the listener, and parentRefs with the Gateway's namespace.",
        solution: "apiVersion: gateway.networking.k8s.io/v1\nkind: Gateway\nmetadata: { name: gw, namespace: infra }\nspec:\n  gatewayClassName: cls\n  listeners: [{ name: http, protocol: HTTP, port: 80, allowedRoutes: { namespaces: { from: All } } }]\n---\napiVersion: gateway.networking.k8s.io/v1\nkind: HTTPRoute\nmetadata: { name: app, namespace: web }\nspec:\n  parentRefs: [{ name: gw, namespace: infra }]\n  hostnames: [\"app.example.com\"]\n  rules: [{ backendRefs: [{ name: app, port: 80 }] }]",
      },
    ],
    faq: [
      { q: "Is Ingress deprecated?", a: "The Ingress API is not deprecated, but it is frozen: no new features. Gateway API is the recommended path for new work, and some popular Ingress controllers have been retired." },
      { q: "Why does my Ingress have no ADDRESS?", a: "Usually no controller handles it: none is installed, or ingressClassName does not match an installed class. Check kubectl get ingressclass and the controller Pods." },
      { q: "Do I need a LoadBalancer Service with an Ingress?", a: "The controller itself needs a way in, typically one LoadBalancer or NodePort Service. Your app Services behind it can stay ClusterIP." },
    ],
  },

  "cka-networking/network-policies": {
    plain: [
      "By default, the Kubernetes network is wide open: every Pod can talk to every other Pod in every namespace. That is easy, but risky. If an attacker breaks into one Pod, they can reach your database directly.",
      "A NetworkPolicy is a firewall rule for Pods. It picks some Pods by label and says who may talk to them (ingress) or whom they may talk to (egress). There are only allow rules. Anything not allowed is blocked, but only for Pods that some policy has selected.",
      "The usual approach is: first block everything in a namespace with a default-deny policy, then add small allow rules, like \"frontend may call api on port 8080\". Think of it as locking all doors, then handing out specific keys.",
      "Policies are enforced by the network plugin, not by Kubernetes itself. Calico and Cilium enforce them. Flannel does not, and it will silently accept your policies while blocking nothing.",
    ],
    deepDive: [
      {
        heading: "How isolation really works",
        body: "A Pod is isolated for ingress as soon as any policy with Ingress in policyTypes selects it, and the same for egress. Isolated Pods accept only traffic that at least one selecting policy allows. Policies never conflict: the allowed set is the union of all of them, so you cannot write a rule that blocks something another policy allows.\n\nFor a connection between two Pods, both ends must agree: the sender's egress rules (if it is egress-isolated) and the receiver's ingress rules (if it is ingress-isolated). Reply packets of an allowed connection are always let through, so you never need rules for responses. If you leave out policyTypes, it is set to Ingress, plus Egress only if the policy has egress rules.",
        visual: {
          type: "flow",
          title: "Is a connection from Pod A to Pod B allowed?",
          steps: [
            { label: "Is A egress-isolated?", detail: "If no, A's side allows it" },
            { label: "If yes, any egress rule?", detail: "Some policy on A must allow B and port" },
            { label: "Is B ingress-isolated?", detail: "If no, B's side allows it" },
            { label: "If yes, any ingress rule?", detail: "Some policy on B must allow A and port" },
            { label: "Both sides allow", detail: "Connection and replies flow" },
          ],
        },
      },
      {
        heading: "Selector logic: the indentation trap",
        body: "Inside from or to, each list item (each dash) is a separate peer, and peers are ORed. Inside one item, a podSelector and a namespaceSelector together are ANDed: Pods with that label in namespaces with that label. One missing dash changes the meaning completely.\n\nA podSelector alone means Pods in the policy's own namespace. A namespaceSelector alone means all Pods in matching namespaces. Every namespace has the automatic label kubernetes.io/metadata.name, so you can select a namespace by its name. An ingress rule with no from field allows any source on its ports, and ingress: [{}] allows everything. ipBlock picks CIDR ranges with optional except lists; it is meant for traffic from outside the cluster, because Pod IPs change.",
        bullets: ["- namespaceSelector: ... + podSelector: ... (one item) means AND", "Two dashes means OR: either peer is allowed", "ports with endPort allows a range, like 32000 to 32768"],
      },
      {
        heading: "Egress, DNS and Service ports",
        body: "Default-deny egress also blocks DNS, so names stop resolving and every request looks like a timeout. Always pair it with a rule allowing UDP and TCP port 53 to the CoreDNS Pods: namespaceSelector kubernetes.io/metadata.name: kube-system together with podSelector k8s-app: kube-dns.\n\nAnother trap: policies see traffic after kube-proxy has rewritten the Service IP to a Pod IP. So ports in a policy must be the Pod's targetPort, not the Service port. A Service on port 80 forwarding to 8080 needs a policy allowing 8080. For the same reason, allowing a Service's ClusterIP in an ipBlock does nothing useful; select the backend Pods by label instead.",
      },
      {
        heading: "Testing policies like the grader does",
        body: "Never trust a policy until you test it from both an allowed and a blocked Pod. Start temporary Pods with the labels you want to impersonate using kubectl run -l, and in the right namespace with -n. Use a short timeout (wget -T 2 or nc -w 2) so blocked attempts fail quickly instead of hanging.\n\nA blocked connection usually times out, because packets are dropped silently. Connection refused means the network allowed it but nothing listens on that port. kubectl describe networkpolicy prints the rules in plain words, which is the fastest way to catch an AND versus OR mistake.",
        bullets: ["kubectl run t -n prod -l app=frontend --rm -it --image=busybox:1.36 --restart=Never -- wget -qO- -T 2 api:8080", "kubectl get netpol -A lists every policy", "Test DNS separately with nslookup"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "One item versus two items in from",
        columns: [
          { title: "One item (AND)", points: ["- namespaceSelector: team=a", "  podSelector: app=web", "Only web Pods in team=a namespaces", "Usually what you want"] },
          { title: "Two items (OR)", points: ["- namespaceSelector: team=a", "- podSelector: app=web", "Every Pod in team=a namespaces", "Plus web Pods in this namespace"] },
        ],
      },
    ],
    examples: [
      {
        title: "Lock down a namespace but keep DNS",
        explanation: "Requirement: in namespace prod, block all traffic in and out, except DNS lookups. Step 1: one policy with podSelector {} and both policyTypes and no allow rules for ingress. Step 2: in the same policy, allow egress to CoreDNS on port 53. Step 3: test that nslookup works and wget to an outside address fails.",
        code: {
          lang: "yaml",
          code: "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: { name: default-deny-keep-dns, namespace: prod }\nspec:\n  podSelector: {}\n  policyTypes: [Ingress, Egress]\n  egress:\n    - to:\n        - namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: kube-system } }\n          podSelector: { matchLabels: { k8s-app: kube-dns } }\n      ports: [{ protocol: UDP, port: 53 }, { protocol: TCP, port: 53 }]",
        },
      },
      {
        title: "Allow the monitoring namespace to scrape metrics",
        explanation: "Pods app=api in prod expose metrics on 9090. Only Pods labeled app=prometheus in namespace monitoring may scrape them. Step 1: write one from item with both selectors (AND). Step 2: apply. Step 3: test from a Pod with the right label in monitoring (works) and from a Pod with the same label in default (times out).",
        code: {
          lang: "yaml",
          code: "apiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata: { name: allow-prometheus, namespace: prod }\nspec:\n  podSelector: { matchLabels: { app: api } }\n  policyTypes: [Ingress]\n  ingress:\n    - from:\n        - namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: monitoring } }\n          podSelector: { matchLabels: { app: prometheus } }\n      ports: [{ protocol: TCP, port: 9090 }]",
        },
      },
    ],
    cheatSheet: [
      "Default deny ingress: podSelector: {} and policyTypes: [Ingress] with no ingress rules",
      "Allow all ingress: ingress: [{}]",
      "One from item with both selectors = AND; separate dashes = OR",
      "Select a namespace by name: kubernetes.io/metadata.name: NAME",
      "Default-deny egress needs UDP and TCP 53 to kube-dns allowed",
      "Policy ports are Pod targetPorts, not Service ports",
      "Timeout = blocked by policy; connection refused = allowed but nothing listening",
    ],
    quiz: [
      {
        q: "Policy A allows ingress to app=db from app=api. Policy B, also selecting app=db, allows nothing. Can api reach db?",
        options: ["No, B overrides A", "Only on port 53", "Yes, because policies add up and A allows it", "Only if B is deleted"],
        answer: 2,
        why: "Policies are a union of allow rules; there are no deny rules to override them.",
      },
      {
        q: "A Service listens on port 80 and forwards to container port 8080. Which port must an ingress policy allow?",
        options: ["8080", "80", "Both", "The nodePort"],
        answer: 0,
        why: "Policies are applied after the Service IP and port are translated to the Pod IP and targetPort.",
      },
      {
        q: "After applying default-deny egress, all requests fail even to allowed Pods by name. Why?",
        options: ["kube-proxy stopped", "The CNI crashed", "Ingress is also denied", "DNS lookups on port 53 are blocked"],
        answer: 3,
        why: "Names cannot resolve without egress to CoreDNS on port 53.",
      },
      {
        q: "Your cluster uses Flannel. You apply a default-deny policy. What happens?",
        options: ["All traffic is blocked", "Nothing is blocked, because Flannel does not enforce policies", "The API server rejects the policy", "Only egress is blocked"],
        answer: 1,
        why: "The API accepts the object, but only a policy-capable CNI enforces it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a default-deny ingress policy in namespace test and show that a Pod there can no longer be reached from another Pod.",
        hint: "Start an nginx Pod first, test before and after.",
        solution: "kubectl create ns test\nkubectl -n test run web --image=nginx:1.27 --expose --port=80\n# policy: podSelector: {}  policyTypes: [Ingress]\nkubectl apply -f deny.yaml\nkubectl -n test run t --rm -it --image=busybox:1.36 --restart=Never -- \\\n  wget -qO- -T 2 http://web    # times out",
      },
      {
        level: "medium",
        task: "In test, allow only Pods labeled role=client in the same namespace to reach web on port 80. Prove it with a labeled and an unlabeled Pod.",
        hint: "kubectl run -l sets labels on the test Pod.",
        solution: "# ingress: [{ from: [{ podSelector: { matchLabels: { role: client } } }],\n#             ports: [{ protocol: TCP, port: 80 }] }]\n# podSelector: { matchLabels: { run: web } }\nkubectl apply -f allow-client.yaml\nkubectl -n test run ok -l role=client --rm -it --image=busybox:1.36 \\\n  --restart=Never -- wget -qO- -T 2 http://web       # works\nkubectl -n test run no --rm -it --image=busybox:1.36 \\\n  --restart=Never -- wget -qO- -T 2 http://web       # times out",
      },
      {
        level: "hard",
        task: "Pods app=api in prod may only make outgoing connections to app=db Pods in namespace data on TCP 5432, plus DNS. Write the policy.",
        hint: "Two egress rules: one for db (AND of two selectors), one for DNS.",
        solution: "spec:\n  podSelector: { matchLabels: { app: api } }\n  policyTypes: [Egress]\n  egress:\n    - to:\n        - namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: data } }\n          podSelector: { matchLabels: { app: db } }\n      ports: [{ protocol: TCP, port: 5432 }]\n    - to:\n        - namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: kube-system } }\n          podSelector: { matchLabels: { k8s-app: kube-dns } }\n      ports: [{ protocol: UDP, port: 53 }, { protocol: TCP, port: 53 }]",
      },
    ],
    faq: [
      { q: "Can a NetworkPolicy deny specific traffic?", a: "No. Standard NetworkPolicies only allow. You deny by isolating Pods and not allowing that traffic. Some CNIs add their own policy types with explicit deny rules." },
      { q: "Do NetworkPolicies work on every cluster?", a: "Only if the CNI plugin enforces them. Calico and Cilium do; Flannel on its own does not." },
      { q: "Does a NetworkPolicy affect traffic between containers in the same Pod?", a: "No. Containers in one Pod share a network namespace and talk over localhost, which policies do not touch." },
    ],
  },

  "cka-networking/coredns": {
    plain: [
      "Remembering IP addresses is hard, and in Kubernetes they change all the time. So the cluster runs its own phone book: a DNS server called CoreDNS. You ask for a name like db, and it answers with the Service IP.",
      "Every Service gets a name in the form name.namespace.svc.cluster.local. You rarely type all of that. Inside the same namespace, just db works. From another namespace, db.prod is enough. The rest is added automatically.",
      "That automatic part comes from each Pod's /etc/resolv.conf file. The kubelet writes it when the Pod starts. It points at the cluster DNS Service (called kube-dns for historical reasons) and lists search domains to try after short names.",
      "When DNS breaks, almost everything looks broken: apps time out connecting to each other by name. Testing DNS from a small test Pod is one of the first steps in any network troubleshooting.",
    ],
    deepDive: [
      {
        heading: "What a Pod's resolv.conf contains",
        body: "A Pod in namespace shop usually gets: nameserver 10.96.0.10 (the kube-dns Service IP from the kubelet's clusterDNS setting), search shop.svc.cluster.local svc.cluster.local cluster.local, and options ndots:5.\n\nndots:5 means any name with fewer than five dots is tried with each search domain first. So db becomes db.shop.svc.cluster.local on the first try, which is fast. But an outside name like api.github.com (two dots) is first tried as api.github.com.shop.svc.cluster.local and so on, and only then as itself, which adds extra lookups. Writing it with a trailing dot (api.github.com.) skips the search list. The Pod's dnsPolicy controls all this: ClusterFirst is the default, Default copies the node's resolv.conf, ClusterFirstWithHostNet is for hostNetwork Pods, and None uses only your dnsConfig.",
        bullets: ["kubectl exec POD -- cat /etc/resolv.conf", "kubelet config fields: clusterDNS and clusterDomain", "dnsConfig can add nameservers, searches and options"],
      },
      {
        heading: "Records CoreDNS serves",
        body: "A normal Service gets an A record (and AAAA for IPv6) pointing to its ClusterIP. A headless Service returns one A record per Ready Pod instead. StatefulSet Pods behind a headless Service also get their own names, such as web-0.web.shop.svc.cluster.local, which is how databases find their peers.\n\nNamed Service ports get SRV records, for example _http._tcp.web.shop.svc.cluster.local, which return the port number and target. Pods get records too, in the form 10-244-1-5.shop.pod.cluster.local (the IP with dashes), if the Corefile enables pods. An ExternalName Service returns a CNAME to the outside host. CoreDNS also serves reverse lookups for cluster IPs in in-addr.arpa.",
        visual: {
          type: "tree",
          title: "DNS names in namespace shop",
          root: "cluster.local",
          children: [
            { label: "Service web", children: ["web.shop.svc.cluster.local", "A record: ClusterIP"] },
            { label: "Headless Service db", children: ["db.shop.svc.cluster.local", "A records: each Ready Pod IP", "db-0.db.shop.svc.cluster.local"] },
            { label: "Named port http on web", children: ["_http._tcp.web.shop.svc.cluster.local", "SRV: port and target"] },
            { label: "Pod 10.244.1.5", children: ["10-244-1-5.shop.pod.cluster.local"] },
          ],
        },
      },
      {
        heading: "Reading the Corefile",
        body: "The Corefile in the coredns ConfigMap lists server blocks. The default kubeadm block for .:53 includes errors (log errors), health and ready (probes), kubernetes cluster.local in-addr.arpa ip6.arpa (answer cluster names from the API), prometheus :9153 (metrics), forward . /etc/resolv.conf (send other names to the node's upstream DNS), cache 30, loop (detect forwarding loops), reload (pick up Corefile changes) and loadbalance (rotate answers).\n\nTo send a company domain to its own DNS server, add a second block such as corp.example:53 { forward . 10.0.0.53 }. With reload, CoreDNS picks up edits on its own after the ConfigMap reaches the Pods, which can take a minute or two; kubectl -n kube-system rollout restart deployment coredns is faster. Always check the CoreDNS logs afterwards, because a syntax error keeps the old config or crashes the Pods.",
      },
      {
        heading: "A step by step DNS debug routine",
        body: "First, test from a Pod: nslookup kubernetes.default should return the API Service IP. If it does, cluster DNS works and the problem is the specific name or namespace. If not, check that the Pod's resolv.conf points at the kube-dns Service IP, that the CoreDNS Pods are Running and Ready, and that the kube-dns Service has endpoints.\n\nIf CoreDNS is in CrashLoopBackOff with a log line saying a loop was detected, the node's resolv.conf points at a local stub resolver like 127.0.0.53, so CoreDNS forwards to itself. The fix is pointing the kubelet's resolvConf at the real upstream file, usually /run/systemd/resolve/resolv.conf. If internal names work but outside names fail, look at the forward line and the node's upstream DNS. Also remember that a NetworkPolicy blocking port 53 looks exactly like broken DNS.",
        bullets: ["kubectl -n kube-system get endpointslices -l kubernetes.io/service-name=kube-dns", "kubectl -n kube-system logs deploy/coredns", "busybox:1.28 is often used for nslookup; some newer builds behave oddly"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "How the short name db is resolved from namespace shop",
        steps: [
          { label: "App asks for db", detail: "Fewer than 5 dots, so use the search list" },
          { label: "Try db.shop.svc.cluster.local", detail: "Sent to nameserver 10.96.0.10" },
          { label: "kube-proxy forwards", detail: "To a CoreDNS Pod on port 53" },
          { label: "kubernetes plugin", detail: "Finds Service db in namespace shop" },
          { label: "Answer", detail: "A record with the ClusterIP, cached 30s" },
        ],
      },
    ],
    examples: [
      {
        title: "Name works in one namespace, not in another",
        explanation: "A Pod in namespace web calls http://db and gets a name error, while it works from Pods in data. Step 1: look up the short name from web; it fails. Step 2: look up db.data; it works. Step 3: the Service lives in data, and the short name only searches the caller's own namespace. Step 4: change the app config to db.data or the full name.",
        code: {
          lang: "bash",
          code: "kubectl -n web run t --rm -it --image=busybox:1.28 --restart=Never -- nslookup db\n# fails: can't resolve 'db'\nkubectl -n web run t --rm -it --image=busybox:1.28 --restart=Never -- nslookup db.data\n# resolves to db.data.svc.cluster.local and its ClusterIP\nkubectl get svc -A | grep ' db '",
        },
      },
      {
        title: "Forward a private domain to a company DNS server",
        explanation: "Pods must resolve names under corp.example through the DNS server 10.0.0.53. Step 1: edit the coredns ConfigMap and add a new server block after the main one. Step 2: restart CoreDNS (or wait for reload). Step 3: check the logs for errors. Step 4: test a corp.example name from a Pod.",
        code: {
          lang: "text",
          code: "# kubectl -n kube-system edit configmap coredns\n# add below the existing .:53 { ... } block:\ncorp.example:53 {\n    errors\n    cache 30\n    forward . 10.0.0.53\n}\n# kubectl -n kube-system rollout restart deployment coredns\n# kubectl -n kube-system logs deploy/coredns | tail",
        },
      },
    ],
    cheatSheet: [
      "Service: NAME.NAMESPACE.svc.cluster.local; StatefulSet Pod: POD.SVC.NAMESPACE.svc.cluster.local",
      "Pod resolv.conf: nameserver = kube-dns IP, search NS.svc.cluster.local svc.cluster.local cluster.local",
      "ndots:5 makes short names try search domains first",
      "Corefile: kubectl -n kube-system get cm coredns -o yaml",
      "kubectl -n kube-system rollout restart deploy coredns applies Corefile changes now",
      "CoreDNS loop detected: point kubelet resolvConf to /run/systemd/resolve/resolv.conf",
      "nslookup kubernetes.default from a Pod is the first DNS health check",
    ],
    quiz: [
      {
        q: "A Pod in namespace dev runs nslookup api. Which name is tried first?",
        options: ["api.", "api.svc.cluster.local", "api.dev.svc.cluster.local", "api.cluster.local"],
        answer: 2,
        why: "The first search domain is the Pod's own namespace, dev.svc.cluster.local.",
      },
      {
        q: "What does a DNS lookup of a headless Service return?",
        options: ["The IPs of its Ready Pods", "Its ClusterIP", "The node IPs", "Nothing, headless Services have no DNS"],
        answer: 0,
        why: "With clusterIP None, DNS returns Pod IPs directly.",
      },
      {
        q: "CoreDNS Pods crash with a log about a detected loop. What is the usual cause?",
        options: ["Too many Services", "A NetworkPolicy on port 53", "The cache plugin is missing", "The node's resolv.conf points at a local stub like 127.0.0.53"],
        answer: 3,
        why: "CoreDNS forwards to the node's resolver, which points back to itself, creating a loop.",
      },
      {
        q: "Which dnsPolicy makes a Pod use the node's DNS settings instead of CoreDNS?",
        options: ["ClusterFirst", "Default", "ClusterFirstWithHostNet", "None"],
        answer: 1,
        why: "Despite its name, Default inherits the node's resolv.conf; ClusterFirst is the real default.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "From a test Pod, resolve the kubernetes Service and write the returned IP to /opt/k8s-ip.txt.",
        hint: "The kubernetes Service lives in namespace default.",
        solution: "kubectl run t --rm -it --image=busybox:1.28 --restart=Never -- nslookup kubernetes.default\n# compare with:\nkubectl get svc kubernetes -o jsonpath='{.spec.clusterIP}' > /opt/k8s-ip.txt\ncat /opt/k8s-ip.txt",
      },
      {
        level: "medium",
        task: "Find the cluster domain and the kube-dns Service IP from the node configuration, and check they match a Pod's resolv.conf.",
        hint: "Both are in the kubelet config file.",
        solution: "grep -A2 -E 'clusterDNS|clusterDomain' /var/lib/kubelet/config.yaml\nkubectl -n kube-system get svc kube-dns\nkubectl run t --rm -it --image=busybox:1.28 --restart=Never -- cat /etc/resolv.conf",
      },
      {
        level: "hard",
        task: "Create a headless Service for a 2-replica StatefulSet web and resolve both the Service name and the name of web-0 from a test Pod.",
        hint: "The StatefulSet's serviceName must equal the headless Service name.",
        solution: "kubectl create svc clusterip web --clusterip=None --tcp=80:80\n# StatefulSet web: serviceName: web, replicas: 2,\n#   selector/labels app=web, image nginx:1.27\nkubectl apply -f sts.yaml\nkubectl run t --rm -it --image=busybox:1.28 --restart=Never -- nslookup web\n# two A records, one per Pod\nkubectl run t --rm -it --image=busybox:1.28 --restart=Never -- \\\n  nslookup web-0.web.default.svc.cluster.local",
      },
    ],
    faq: [
      { q: "Why is the CoreDNS Service called kube-dns?", a: "kube-dns was the original cluster DNS server. CoreDNS replaced it but kept the Service name and the k8s-app=kube-dns label so existing setups keep working." },
      { q: "Why are external DNS lookups slow in my Pods?", a: "ndots:5 makes short external names try every cluster search domain first. Use a trailing dot on fully qualified names, or lower ndots with dnsConfig for that Pod." },
      { q: "How do I add a custom hostname for all Pods?", a: "Add a hosts block or a forward to your own DNS server in the Corefile. For a single Pod, use hostAliases in the Pod spec, which writes to its /etc/hosts." },
    ],
  },
};

export default extra;

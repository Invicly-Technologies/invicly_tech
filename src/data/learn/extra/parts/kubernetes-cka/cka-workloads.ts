import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "cka-workloads/deployments": {
    plain: [
      "A Deployment is how you tell Kubernetes: \"keep 3 copies of this app running, and when I give you a new version, swap them in carefully\". You almost never create Pods by hand for an app. You create a Deployment, and it does the boring work for you.",
      "Under the hood there is a helper object called a ReplicaSet. Its only job is to keep the right number of Pods alive. If a Pod dies or a node disappears, the ReplicaSet creates a new Pod somewhere else. The Deployment sits on top and decides which ReplicaSet should be active.",
      "When you change the image, the Deployment makes a new ReplicaSet for the new version and slowly moves Pods over: a few new ones up, a few old ones down. Users keep getting answers the whole time. This is called a rolling update.",
      "If the new version is bad, you do not need to remember the old YAML. Kubernetes kept the old ReplicaSet (scaled to zero), so one command, kubectl rollout undo, brings the previous version back in seconds.",
    ],
    deepDive: [
      {
        heading: "How Pods are tied to a ReplicaSet",
        body: "Every time the Pod template changes, the Deployment controller hashes the template and creates a ReplicaSet named after that hash, for example web-7c5d8f9b6. The same hash is added to the Pods as the label pod-template-hash. That label keeps the old and new ReplicaSets from fighting over each other's Pods, even though both match the Deployment's selector.\n\nThe selector itself is immutable in apps/v1. If you need a different selector, you must delete and recreate the Deployment. This is also why the selector labels must be a subset of the template labels; the API rejects a Deployment where they do not match.",
        bullets: ["kubectl get rs -l app=web shows every revision's ReplicaSet", "kubectl get pods --show-labels reveals pod-template-hash", "Scaling changes replicas only, so no new ReplicaSet appears"],
      },
      {
        heading: "The rollout math: maxSurge and maxUnavailable",
        body: "Both settings accept a number or a percentage, and both default to 25 percent. Percentages are rounded: maxSurge rounds up and maxUnavailable rounds down. With 10 replicas and the defaults, the controller may run up to 13 Pods (10 plus 3) and must keep at least 8 available (10 minus 2).\n\nThe two values cannot both be 0, because then the controller could never make progress. maxSurge 1 with maxUnavailable 0 is the safest choice: one new Pod at a time, never below full capacity, but it needs spare room in the cluster. maxSurge 0 with maxUnavailable 1 needs no extra room but runs one Pod short during the update. The Recreate strategy skips all of this and stops every old Pod first, which you want only when two versions must never run together.",
        visual: {
          type: "compare",
          title: "Three update settings for 4 replicas",
          columns: [
            { title: "Surge 1, unavailable 0", points: ["Up to 5 Pods at once", "Never below 4 ready", "Needs spare capacity", "Slowest but safest"] },
            { title: "Defaults 25% and 25%", points: ["Up to 5 Pods at once", "At least 3 ready", "Good general balance", "Works on most clusters"] },
            { title: "Recreate", points: ["All old Pods stop first", "Short full outage", "Never two versions together", "Use for schema clashes"] },
          ],
        },
      },
      {
        heading: "Readiness gates the rollout",
        body: "The controller only counts a new Pod as available when it is Ready, and if minReadySeconds is set, after it has stayed Ready that long. A readiness probe is therefore what stops a broken version from replacing healthy Pods: if the new Pods never pass the probe, the rollout simply stalls with old Pods still serving.\n\nA stalled rollout does not roll back by itself. After progressDeadlineSeconds (default 600 seconds) the Deployment gets a Progressing condition with reason ProgressDeadlineExceeded, and kubectl rollout status exits with an error. Your pipeline or you must then run rollout undo.",
        bullets: ["minReadySeconds defaults to 0", "progressDeadlineSeconds defaults to 600", "kubectl describe deploy shows the Progressing condition"],
      },
      {
        heading: "History, pause and restart",
        body: "revisionHistoryLimit (default 10) controls how many old ReplicaSets are kept for rollback. kubectl rollout history lists them, and adding --revision=3 prints that revision's full Pod template. To give revisions a readable reason, set the annotation kubernetes.io/change-cause; the old --record flag is deprecated.\n\nRolling back is itself a new revision: undo to revision 2 copies its template forward, so revision 2 disappears from the list and reappears as the newest number. kubectl rollout pause lets you make several template edits (image, env, resources) and release them as one rollout on resume. kubectl rollout restart changes an annotation in the template, which rolls every Pod without changing the image.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Who does what during kubectl set image",
        actors: ["kubectl", "API server", "Deployment controller", "ReplicaSet controller"],
        messages: [
          { from: 0, to: 1, label: "PATCH Pod template image" },
          { from: 1, to: 2, label: "Watch: Deployment changed" },
          { from: 2, to: 1, label: "Create new ReplicaSet, replicas 1" },
          { from: 3, to: 1, label: "Create Pod for new ReplicaSet" },
          { from: 2, to: 1, label: "New Pod Ready: scale old RS down by 1" },
          { from: 2, to: 1, label: "Repeat until new RS is full" },
        ],
      },
    ],
    examples: [
      {
        title: "Ship a release, spot the failure, roll back",
        explanation: "You update the web Deployment to a tag that does not exist. Step 1: set the image and record why. Step 2: watch the rollout; it hangs because new Pods are stuck in ImagePullBackOff while old Pods keep serving. Step 3: confirm with get pods. Step 4: undo, which brings the previous ReplicaSet back to full size. Step 5: check history to see the new revision number.",
        code: {
          lang: "bash",
          code: "kubectl set image deployment/web nginx=nginx:1.99-typo\nkubectl annotate deployment/web kubernetes.io/change-cause=\"try 1.99\"\nkubectl rollout status deployment/web --timeout=60s   # times out\nkubectl get pods -l app=web                           # ImagePullBackOff\nkubectl rollout undo deployment/web\nkubectl rollout status deployment/web\nkubectl rollout history deployment/web",
        },
      },
      {
        title: "Zero-downtime settings from YAML",
        explanation: "A team wants updates that never drop below full capacity and wants every new Pod to stay healthy for 10 seconds before it counts. Step 1: generate a Deployment with dry-run. Step 2: add the strategy block and minReadySeconds. Step 3: apply and test with a new image. With 4 replicas, you will see at most 5 Pods and never fewer than 4 ready.",
        code: {
          lang: "yaml",
          code: "apiVersion: apps/v1\nkind: Deployment\nmetadata: { name: web }\nspec:\n  replicas: 4\n  minReadySeconds: 10\n  strategy:\n    type: RollingUpdate\n    rollingUpdate: { maxSurge: 1, maxUnavailable: 0 }\n  selector: { matchLabels: { app: web } }\n  template:\n    metadata: { labels: { app: web } }\n    spec:\n      containers: [{ name: nginx, image: \"nginx:1.27\" }]",
        },
      },
    ],
    cheatSheet: [
      "kubectl create deploy web --image=nginx:1.27 --replicas=3 --dry-run=client -o yaml > web.yaml",
      "kubectl rollout history deploy/web --revision=2 shows that revision's Pod template",
      "kubectl rollout restart deploy/web re-creates all Pods with the same image",
      "maxSurge rounds up, maxUnavailable rounds down; both default to 25%",
      "revisionHistoryLimit defaults to 10 old ReplicaSets kept for rollback",
      "A Deployment's selector is immutable; it must match the template labels",
      "Find the container name for set image: kubectl get deploy web -o jsonpath='{..containers[*].name}'",
    ],
    quiz: [
      {
        q: "You run kubectl scale deployment web --replicas=6. What happens to the revision history?",
        options: ["A new revision is added", "Nothing, because scaling does not change the Pod template", "All old revisions are deleted", "The rollout is paused"],
        answer: 1,
        why: "Only Pod template changes create a new ReplicaSet and revision.",
      },
      {
        q: "A Deployment has 10 replicas and the default strategy. What is the most Pods that can exist during a rollout?",
        options: ["10", "12", "15", "13"],
        answer: 3,
        why: "25 percent of 10 is 2.5, and maxSurge rounds up to 3, so 13.",
      },
      {
        q: "New Pods never become Ready during a rollout. What does the Deployment do by default?",
        options: ["Stalls and reports ProgressDeadlineExceeded after 600 seconds", "Rolls back automatically", "Deletes all old Pods", "Switches to the Recreate strategy"],
        answer: 0,
        why: "Kubernetes reports the failure but never rolls back on its own.",
      },
      {
        q: "Which command triggers a fresh rollout without changing the image?",
        options: ["kubectl rollout resume", "kubectl replace --force", "kubectl rollout restart", "kubectl rollout status"],
        answer: 2,
        why: "rollout restart sets a restartedAt annotation in the Pod template, which is a template change.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create Deployment api with image nginx:1.26 and 2 replicas, scale it to 4, then show which ReplicaSet owns the Pods.",
        hint: "Scaling keeps one ReplicaSet; look at the DESIRED column.",
        solution: "kubectl create deployment api --image=nginx:1.26 --replicas=2\nkubectl scale deployment api --replicas=4\nkubectl get rs -l app=api\n# one ReplicaSet, DESIRED 4",
      },
      {
        level: "medium",
        task: "Pause api, change its image to nginx:1.27 and set an env var MODE=prod, then resume so both changes ship in one revision.",
        hint: "kubectl set env works on Deployments too.",
        solution: "kubectl rollout pause deployment/api\nkubectl set image deployment/api nginx=nginx:1.27\nkubectl set env deployment/api MODE=prod\nkubectl rollout resume deployment/api\nkubectl rollout status deployment/api\nkubectl rollout history deployment/api   # one new revision",
      },
      {
        level: "hard",
        task: "Make api roll out one Pod at a time without ever dropping below 4 ready Pods, then roll back to revision 1 and explain the history output.",
        hint: "Patch the strategy with a JSON merge patch; undo accepts --to-revision.",
        solution: "kubectl patch deployment api -p '{\"spec\":{\"strategy\":{\"rollingUpdate\":{\"maxSurge\":1,\"maxUnavailable\":0}}}}'\nkubectl set image deployment/api nginx=nginx:1.28\nkubectl rollout status deployment/api\nkubectl rollout undo deployment/api --to-revision=1\nkubectl rollout history deployment/api\n# revision 1 is gone and reappears as the highest number,\n# because undo copies the old template forward.",
      },
    ],
    faq: [
      { q: "What is the difference between a Deployment and a ReplicaSet?", a: "A ReplicaSet only keeps a number of identical Pods running. A Deployment manages ReplicaSets so it can do rolling updates and rollbacks, so you should create Deployments and let them handle ReplicaSets." },
      { q: "How do I restart all Pods of a Deployment?", a: "Run kubectl rollout restart deployment/NAME. It replaces Pods gradually using the normal rolling update rules, so there is no downtime if you have several replicas." },
      { q: "Why does my rollout never finish?", a: "Usually the new Pods are not becoming Ready: a bad image, a crash, or a failing readiness probe. Check kubectl get pods and kubectl describe on a new Pod, then fix the cause or roll back." },
    ],
  },

  "cka-workloads/config-secrets": {
    plain: [
      "Apps need settings: a database address, a log level, a password. You could bake them into the image, but then you would need a new image for every environment. Kubernetes keeps settings outside the image in two objects: ConfigMaps for normal settings and Secrets for sensitive ones.",
      "Your Pod can read these settings in two ways. As environment variables, which the app reads once when it starts. Or as files in a folder, which is better for whole config files and certificates.",
      "A Secret is not a safe. Its values are only base64 encoded, which anyone can decode in one command. What protects a Secret is who may read it (RBAC rules) and whether the cluster encrypts it on disk. Treat Secret YAML like a password file.",
      "Both objects live in a namespace and only Pods in the same namespace can use them. If a Pod refers to a ConfigMap or key that does not exist, it will not start, and kubectl describe tells you exactly which one is missing.",
    ],
    deepDive: [
      {
        heading: "Four ways to create them",
        body: "kubectl create configmap and kubectl create secret generic accept the same sources. --from-literal=KEY=value adds one key. --from-file=path adds one key named after the file, with the file content as the value; --from-file=custom=path renames the key. --from-file=dir/ adds one key per file. --from-env-file=app.env reads KEY=value lines.\n\nSecrets also have typed helpers. kubectl create secret tls NAME --cert=tls.crt --key=tls.key creates a kubernetes.io/tls Secret with keys tls.crt and tls.key, which Ingress expects. kubectl create secret docker-registry NAME --docker-server --docker-username --docker-password creates a pull secret for imagePullSecrets. In YAML you can write plain text under stringData and the API server stores it base64 encoded under data.",
        bullets: ["ConfigMaps and Secrets are limited to 1 MiB each", "Decode a value: kubectl get secret db -o jsonpath='{.data.PASS}' | base64 -d", "Generic Secrets have type Opaque"],
      },
      {
        heading: "Env vars versus mounted files under the hood",
        body: "Environment variables are copied into the container once, when it starts. Changing the ConfigMap later has no effect until the Pod is recreated, for example with kubectl rollout restart. A referenced key that is missing leaves the container in CreateContainerConfigError, unless you mark the reference optional: true.\n\nMounted volumes work differently. The kubelet writes each key as a file and later refreshes it when the object changes, usually within a minute or two, through an atomic symlink swap. Secret volumes are stored in tmpfs (memory) on the node, never on its disk. Two exceptions catch people: a file mounted with subPath never updates, and an object marked immutable: true can never be changed, only deleted and recreated.",
        visual: {
          type: "flow",
          title: "How an edited ConfigMap reaches a mounted file",
          steps: [
            { label: "kubectl edit cm", detail: "New data saved in etcd" },
            { label: "kubelet notices", detail: "On its periodic sync, using its cache" },
            { label: "Writes new files", detail: "Into a fresh hidden folder" },
            { label: "Swaps a symlink", detail: "All keys change at once" },
            { label: "App rereads", detail: "Only if the app watches or reloads" },
          ],
        },
      },
      {
        heading: "Choosing keys, paths and permissions",
        body: "A configMap or secret volume normally creates one file per key. Use items to pick only some keys and give them custom file names, and defaultMode to set permissions; the default is 0644. A Secret holding a private key should usually use defaultMode 0400.\n\nMounting a volume at a path hides whatever the image already had in that folder. To drop a single file into an existing folder such as /etc/nginx/conf.d, mount with subPath, and accept that it will not auto-update. envFrom can add a prefix to every imported key, which avoids clashes when you import from two sources.",
        bullets: ["items: [{ key: nginx.conf, path: default.conf }]", "defaultMode: 0400 for private keys", "envFrom: [{ prefix: DB_, secretRef: { name: db } }]"],
      },
      {
        heading: "Encrypting Secrets at rest",
        body: "By default the API server writes Secrets to etcd as plain bytes, so anyone with an etcd backup can read them. To fix this, write an EncryptionConfiguration file listing a provider such as aescbc, aesgcm, secretbox or kms (v2), followed by identity, and point the API server at it with --encryption-provider-config. On kubeadm clusters you add that flag and a volume mount to /etc/kubernetes/manifests/kube-apiserver.yaml.\n\nOnly new writes are encrypted. Rewrite existing Secrets with kubectl get secrets -A -o json | kubectl replace -f -. You can confirm by reading the raw key with etcdctl get /registry/secrets/NAMESPACE/NAME: encrypted values start with a prefix like k8s:enc:aescbc:v1:.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Where a setting can come from",
        root: "Container settings",
        children: [
          { label: "env", children: ["value: literal", "configMapKeyRef: one key", "secretKeyRef: one key", "fieldRef: Pod name, namespace, IP"] },
          { label: "envFrom", children: ["configMapRef: all keys", "secretRef: all keys", "Optional prefix"] },
          { label: "volumes", children: ["configMap: one file per key", "secret: files in tmpfs", "projected: several sources in one folder"] },
        ],
      },
    ],
    examples: [
      {
        title: "Ship an nginx config file from a ConfigMap",
        explanation: "You want nginx to use your own server block without building an image. Step 1: create a ConfigMap from the file; the key becomes default.conf. Step 2: mount it at /etc/nginx/conf.d, which replaces that folder's contents. Step 3: check the file inside the Pod. Step 4: after editing the ConfigMap, the file updates on its own, but nginx needs a reload or a rollout restart to use it.",
        code: {
          lang: "bash",
          code: "kubectl create configmap nginx-conf --from-file=default.conf\nkubectl create deployment web --image=nginx:1.27 --dry-run=client -o yaml > web.yaml\n# in web.yaml, under the container:\n#   volumeMounts: [{ name: conf, mountPath: /etc/nginx/conf.d }]\n# under spec (Pod level):\n#   volumes: [{ name: conf, configMap: { name: nginx-conf } }]\nkubectl apply -f web.yaml\nkubectl exec deploy/web -- cat /etc/nginx/conf.d/default.conf\nkubectl rollout restart deployment/web   # after editing the ConfigMap",
        },
      },
      {
        title: "A Pod stuck in CreateContainerConfigError",
        explanation: "A new Pod never starts. Step 1: kubectl get pod shows CreateContainerConfigError. Step 2: describe shows the event: secret \"db-creds\" not found, or couldn't find key PASSWORD. Step 3: compare with what exists in that namespace; often the Secret was created in default instead. Step 4: create it in the right namespace. The kubelet retries on its own, so the Pod starts without being deleted.",
        code: {
          lang: "bash",
          code: "kubectl -n shop get pod api-0\nkubectl -n shop describe pod api-0 | grep -A5 Events\nkubectl get secret -A | grep db-creds        # found in default!\nkubectl -n shop create secret generic db-creds --from-literal=PASSWORD=s3cret\nkubectl -n shop get pod api-0 -w",
        },
      },
    ],
    cheatSheet: [
      "kubectl create cm app --from-file=app.properties --from-literal=MODE=prod",
      "kubectl create secret tls web-tls --cert=tls.crt --key=tls.key",
      "kubectl get secret db -o jsonpath='{.data.PASS}' | base64 -d",
      "echo -n 's3cret' | base64 (use -n, or a newline sneaks into the value)",
      "Env vars never refresh; mounted files do, except with subPath",
      "immutable: true cannot be undone; delete and recreate instead",
      "Encryption at rest: --encryption-provider-config on kube-apiserver",
    ],
    quiz: [
      {
        q: "You edit a ConfigMap that a running Pod uses through envFrom. When does the app see the new value?",
        options: ["Within a minute", "After the Pod is recreated", "Immediately", "Never, ConfigMaps are immutable"],
        answer: 1,
        why: "Environment variables are set only when the container starts.",
      },
      {
        q: "Which command creates a Secret that an Ingress can use for HTTPS?",
        options: ["kubectl create secret generic --from-file=cert.pem", "kubectl create configmap tls --from-file=tls.crt", "kubectl create secret docker-registry", "kubectl create secret tls NAME --cert=tls.crt --key=tls.key"],
        answer: 3,
        why: "Ingress expects a kubernetes.io/tls Secret with tls.crt and tls.key keys.",
      },
      {
        q: "A Secret mounted with subPath is updated. What does the container see?",
        options: ["The old file content until the Pod is recreated", "The new content within a minute", "An empty file", "The container is restarted automatically"],
        answer: 0,
        why: "subPath mounts are bound once and never receive updates.",
      },
      {
        q: "After enabling encryption at rest, how do you encrypt Secrets that already existed?",
        options: ["They are encrypted automatically at the next restart", "Run etcdctl defrag", "Rewrite them, for example kubectl get secrets -A -o json | kubectl replace -f -", "Delete the encryption config and add it again"],
        answer: 2,
        why: "Only writes after the change are encrypted, so each Secret must be written again.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a Secret named api-key with key TOKEN=abc123 and print the decoded value back.",
        hint: "jsonpath picks the field; base64 -d decodes it.",
        solution: "kubectl create secret generic api-key --from-literal=TOKEN=abc123\nkubectl get secret api-key -o jsonpath='{.data.TOKEN}' | base64 -d; echo",
      },
      {
        level: "medium",
        task: "Run a busybox Pod that gets LOG_LEVEL from ConfigMap app (key level) as an env var and mounts Secret api-key read-only at /etc/secret with mode 0400.",
        hint: "Use configMapKeyRef for one key and defaultMode on the secret volume.",
        solution: "kubectl create configmap app --from-literal=level=debug\n# Pod spec (container part):\n#   env: [{ name: LOG_LEVEL, valueFrom: { configMapKeyRef: { name: app, key: level } } }]\n#   volumeMounts: [{ name: s, mountPath: /etc/secret, readOnly: true }]\n# Pod spec (volumes):\n#   volumes: [{ name: s, secret: { secretName: api-key, defaultMode: 0400 } }]\nkubectl exec POD -- sh -c 'echo $LOG_LEVEL; ls -l /etc/secret/'",
      },
      {
        level: "hard",
        task: "On a kubeadm lab, enable aescbc encryption at rest for Secrets and prove a new Secret is encrypted in etcd.",
        hint: "Generate a 32-byte key with head -c 32 /dev/urandom | base64 and mount the config file into the API server Pod.",
        solution: "# /etc/kubernetes/enc/enc.yaml\n# kind: EncryptionConfiguration, apiVersion: apiserver.config.k8s.io/v1\n# resources: [{ resources: [secrets], providers: [\n#   { aescbc: { keys: [{ name: key1, secret: <base64 32 bytes> }] } }, { identity: {} } ] }]\n# kube-apiserver.yaml: add --encryption-provider-config=/etc/kubernetes/enc/enc.yaml\n#   plus a hostPath volume and volumeMount for /etc/kubernetes/enc\nkubectl create secret generic probe --from-literal=x=y\nETCDCTL_API=3 etcdctl --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key \\\n  get /registry/secrets/default/probe | hexdump -C | head   # shows k8s:enc:aescbc:v1:",
      },
    ],
    faq: [
      { q: "Are Kubernetes Secrets secure?", a: "Only as secure as your setup. By default they are base64 encoded, not encrypted, so you need RBAC that limits who can read them and encryption at rest for etcd. Many teams add an external secret store on top." },
      { q: "Why does my Pod not see the updated ConfigMap?", a: "If you used environment variables, the Pod must be recreated. If you used a volume, wait a minute or two, check you are not using subPath, and make sure the app rereads the file." },
      { q: "What is the difference between data and stringData in a Secret?", a: "data holds base64 encoded values. stringData lets you write plain text, which the API server encodes and merges into data when it saves the Secret." },
    ],
  },

  "cka-workloads/resources": {
    plain: [
      "Every node has a fixed amount of CPU and memory. When many Pods share a node, Kubernetes needs to know how much each one needs, or one greedy app could starve the rest. You tell it with two numbers per container: a request and a limit.",
      "The request is a reservation. The scheduler only places a Pod on a node that still has that much unreserved room. The limit is a ceiling. The container may use more than its request when the node is quiet, but never more than its limit.",
      "Going over the limit hurts differently for CPU and memory. Too much CPU just makes the app slower, because it gets paused for tiny moments. Too much memory gets the container killed (OOMKilled) and restarted, because memory cannot be taken back gently.",
      "Admins add two guard rails per namespace. A ResourceQuota is a budget for the whole team: for example, no more than 4 CPUs of requests and 20 Pods. A LimitRange fills in sensible default values when a developer forgets to set them.",
    ],
    deepDive: [
      {
        heading: "Units and the classic mistakes",
        body: "CPU is measured in cores: 1 equals 1000m (millicores), so 250m is a quarter of a core. Memory is measured in bytes with suffixes: Mi and Gi are powers of 1024, while M and G are powers of 1000. 128Mi is about 134 million bytes.\n\nThe most painful typo is a lowercase m on memory. memory: 128m means 0.128 bytes, not 128 megabytes, and the container cannot start. Another surprise: if you set only a limit, Kubernetes copies it into the request. That can make a Pod much harder to schedule than you expected.",
        bullets: ["cpu: 0.5 and cpu: 500m are the same", "memory: 1Gi = 1024Mi", "Only limits set means requests equal limits"],
      },
      {
        heading: "What the node really enforces",
        body: "The scheduler compares requests with a node's allocatable resources, which is capacity minus space reserved for the system and the kubelet and a small eviction buffer. kubectl describe node shows both, plus an Allocated resources table with the sum of requests and limits on that node.\n\nOn the node, the kubelet and container runtime turn your numbers into Linux cgroup settings. The CPU limit becomes a CFS quota: the container may use its share of each 100 ms period and is then throttled until the next one. The memory limit becomes a hard cap; crossing it makes the kernel OOM killer stop the process, and the container status shows reason OOMKilled with exit code 137. When the whole node runs short of memory, the kubelet evicts Pods, starting with those using most beyond their requests.",
        visual: {
          type: "layers",
          title: "How a node's memory is split",
          layers: [
            { label: "Capacity", detail: "Total RAM the node reports" },
            { label: "Reserved", detail: "kube-reserved and system-reserved" },
            { label: "Eviction threshold", detail: "Kept free, often 100Mi" },
            { label: "Allocatable", detail: "What Pod requests may add up to" },
            { label: "Pod requests", detail: "Sum must stay at or under allocatable" },
          ],
        },
      },
      {
        heading: "ResourceQuota in practice",
        body: "A ResourceQuota caps the sum of resources in one namespace. Common keys are requests.cpu, requests.memory, limits.cpu, limits.memory, pods, services, persistentvolumeclaims, requests.storage and object counts like count/deployments.apps. Admission checks each new object against the remaining budget and rejects it with an exceeded quota error.\n\nTwo behaviours confuse people. First, once a quota covers a resource such as requests.cpu, every new Pod must specify it, or it is rejected. Second, with a Deployment the rejection does not show on the Deployment: the ReplicaSet simply fails to create Pods, and the reason appears in kubectl describe rs as a FailedCreate event.",
        bullets: ["kubectl describe quota -n dev shows Used versus Hard", "kubectl create quota q --hard=pods=10,requests.cpu=2 -n dev", "Quotas never affect Pods that already exist"],
      },
      {
        heading: "LimitRange: defaults and bounds",
        body: "A LimitRange of type Container can set default (the limit added when none is given), defaultRequest, min, max and maxLimitRequestRatio. It acts at admission, when a Pod is created, so existing Pods are untouched. If only default is set, the request also defaults to that value.\n\nPair a quota with a LimitRange in every shared namespace: the quota sets the team budget, the LimitRange makes sure Pods without values still get some, so they are not rejected. kubectl describe pod shows the values that were actually applied, which is how you confirm the LimitRange worked.",
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Where requests and limits are used",
        steps: [
          { label: "Admission", detail: "LimitRange fills defaults; quota checks budget" },
          { label: "Scheduling", detail: "Requests must fit node allocatable" },
          { label: "Container start", detail: "Limits become cgroup settings" },
          { label: "Running", detail: "CPU over limit is throttled" },
          { label: "Memory over limit", detail: "OOMKilled, exit code 137" },
          { label: "Node pressure", detail: "kubelet evicts by QoS and usage" },
        ],
      },
    ],
    examples: [
      {
        title: "Why the Deployment has zero Pods",
        explanation: "In namespace dev a quota sets requests.cpu, and a developer applies a Deployment without resources. Step 1: kubectl get deploy shows 0/3 ready. Step 2: kubectl get pods shows nothing at all. Step 3: describe the ReplicaSet, not the Deployment, and read the FailedCreate event. Step 4: add a LimitRange with defaults, or set resources on the Deployment, and the ReplicaSet creates the Pods on its next retry.",
        code: {
          lang: "bash",
          code: "kubectl -n dev get deploy api               # READY 0/3\nkubectl -n dev describe rs -l app=api | grep -A3 Events\n# Error creating: pods ... is forbidden: failed quota: team-quota:\n# must specify requests.cpu\nkubectl -n dev set resources deploy api --requests=cpu=100m,memory=128Mi \\\n  --limits=memory=256Mi\nkubectl -n dev describe quota team-quota",
        },
      },
      {
        title: "Spotting an OOMKilled container",
        explanation: "A Pod restarts every few minutes. Step 1: kubectl get pod shows a growing RESTARTS count. Step 2: describe shows Last State: Terminated, Reason: OOMKilled, Exit Code: 137. Step 3: kubectl top pod shows memory close to the limit. Step 4: raise the memory limit, or fix the leak, and watch the restarts stop.",
        code: {
          lang: "bash",
          code: "kubectl get pod worker-0\nkubectl get pod worker-0 -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}'\n# OOMKilled\nkubectl top pod worker-0 --containers\nkubectl set resources statefulset worker --limits=memory=512Mi --requests=memory=384Mi",
        },
      },
    ],
    cheatSheet: [
      "1 CPU = 1000m; memory Mi and Gi are powers of 1024; 128m memory is 0.128 bytes",
      "Only a limit set means the request is copied from it",
      "kubectl describe node | grep -A8 'Allocated resources' shows reserved totals",
      "kubectl set resources deploy web --requests=cpu=100m --limits=memory=256Mi",
      "Quota rejections for Deployments show on the ReplicaSet as FailedCreate",
      "Exit code 137 plus reason OOMKilled means the memory limit was hit",
      "Guaranteed QoS: every container has CPU and memory limits equal to requests",
    ],
    quiz: [
      {
        q: "A container sets limits cpu: 500m and memory: 256Mi and no requests. What are its requests?",
        options: ["Zero", "cpu 500m and memory 256Mi", "The LimitRange minimum", "Half the limits"],
        answer: 1,
        why: "When only limits are set, Kubernetes copies them into the requests.",
      },
      {
        q: "What happens when a container uses more CPU than its limit?",
        options: ["It is OOMKilled", "The Pod is evicted", "It is throttled", "It is moved to another node"],
        answer: 2,
        why: "CPU is compressible, so the kernel just limits its CPU time per period.",
      },
      {
        q: "Namespace dev has a quota with requests.memory. A Pod without a memory request is created and there is no LimitRange. Result?",
        options: ["The Pod is rejected at admission", "The Pod runs as BestEffort", "The Pod stays Pending", "The quota is ignored for that Pod"],
        answer: 0,
        why: "Once a quota tracks a resource, every new Pod must declare it.",
      },
      {
        q: "Which value does the scheduler use to decide if a Pod fits on a node?",
        options: ["Current usage from metrics-server", "The limit", "The node's capacity minus limits", "The request compared with allocatable"],
        answer: 3,
        why: "Scheduling is based on requests against allocatable, not on real usage or limits.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a Pod named qos with image nginx so that it gets the Guaranteed QoS class, and print its QoS class.",
        hint: "Set CPU and memory limits only; requests will copy them.",
        solution: "kubectl run qos --image=nginx --dry-run=client -o yaml > qos.yaml\n# add under the container:\n#   resources: { limits: { cpu: 200m, memory: 128Mi } }\nkubectl apply -f qos.yaml\nkubectl get pod qos -o jsonpath='{.status.qosClass}'   # Guaranteed",
      },
      {
        level: "medium",
        task: "In namespace team, allow at most 5 Pods and 1 CPU of requests, and make Pods without values default to 100m CPU request and 200m CPU limit.",
        hint: "One ResourceQuota plus one LimitRange of type Container.",
        solution: "kubectl create ns team\nkubectl -n team create quota q --hard=pods=5,requests.cpu=1\n# limitrange.yaml\n# apiVersion: v1, kind: LimitRange, metadata: { name: lr, namespace: team }\n# spec: { limits: [{ type: Container,\n#   defaultRequest: { cpu: 100m }, default: { cpu: 200m } }] }\nkubectl apply -f limitrange.yaml\nkubectl -n team run t --image=nginx\nkubectl -n team get pod t -o jsonpath='{.spec.containers[0].resources}'",
      },
      {
        level: "hard",
        task: "Create a Deployment big in team with 8 replicas and no resources set. Explain how many Pods run and prove where the error appears.",
        hint: "The LimitRange gives each Pod 100m. Two limits apply: pods=5 and requests.cpu=1. The stricter wins.",
        solution: "kubectl -n team create deploy big --image=nginx --replicas=8\nkubectl -n team get pods -l app=big\nkubectl -n team describe quota q\nkubectl -n team describe rs -l app=big | grep -i quota\n# pods=5 is hit first (5 x 100m = 500m < 1 CPU), so only 5 run,\n# minus any other Pods (like t) already counted in the namespace.",
      },
    ],
    faq: [
      { q: "Should I always set CPU limits?", a: "Opinions differ. Many teams set CPU requests and memory limits but leave CPU limits off, to avoid needless throttling. For the exam, do exactly what the task asks." },
      { q: "What does exit code 137 mean in Kubernetes?", a: "It is 128 plus signal 9 (SIGKILL). Together with reason OOMKilled, it means the container went over its memory limit." },
      { q: "What is the difference between ResourceQuota and LimitRange?", a: "A ResourceQuota limits the total for a whole namespace. A LimitRange sets defaults and minimum or maximum values for each single container or Pod." },
    ],
  },

  "cka-workloads/autoscaling": {
    plain: [
      "Traffic changes during the day. At night two copies of your app might be enough; at lunch you might need ten. The HorizontalPodAutoscaler (HPA) watches how busy your Pods are and changes the number of copies for you.",
      "It needs numbers to work with. Those come from metrics-server, a small add-on that asks each node's kubelet how much CPU and memory every Pod is using. Without metrics-server, the HPA is blind and does nothing.",
      "You give the HPA a target, such as \"keep average CPU at 50 percent of what the Pods requested\". If Pods run hotter, it adds replicas. If they are idle for a while, it removes some, but never below your minimum or above your maximum.",
      "Horizontal means more copies. There is also vertical scaling (the VerticalPodAutoscaler), which gives each copy more CPU or memory instead. The CKA focuses on the HPA.",
    ],
    deepDive: [
      {
        heading: "Installing and checking metrics-server",
        body: "metrics-server is not part of a kubeadm cluster by default. Install it from its release manifest: kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml. It registers the API group metrics.k8s.io through an APIService, which is what kubectl top and the HPA read.\n\nIn lab clusters the kubelet often uses a self-signed serving certificate, so metrics-server logs x509 errors and stays not Ready. The usual lab fix is adding --kubelet-insecure-tls to its container args. Never do that in production; sign kubelet certificates properly instead. By default it collects every 15 seconds, so give it a minute before expecting numbers.",
        bullets: ["kubectl get apiservice v1beta1.metrics.k8s.io should say True", "kubectl -n kube-system logs deploy/metrics-server for errors", "kubectl top nodes proves the pipeline works end to end"],
      },
      {
        heading: "The algorithm and its safety margins",
        body: "Every 15 seconds the HPA controller computes desiredReplicas = ceil(currentReplicas x currentMetric / targetMetric). Utilization is averaged over Pods and measured against requests, so a Pod requesting 200m and using 100m is at 50 percent.\n\nSeveral rules stop it from flapping. If the ratio is within 10 percent of 1.0 (the tolerance), it does nothing. Pods that are not yet Ready or have no metrics are treated conservatively, so a slow-starting app does not trigger runaway scale-up. With several metrics, the HPA computes a count for each and takes the largest. Scale-down uses a stabilization window of 300 seconds: it picks the highest recommendation from the last 5 minutes, so short dips do not remove Pods.",
        visual: {
          type: "flow",
          title: "One HPA decision with numbers",
          steps: [
            { label: "3 Pods, request 200m", detail: "Target 50 percent utilization" },
            { label: "Average use 180m", detail: "180 / 200 = 90 percent" },
            { label: "Ratio 90 / 50 = 1.8", detail: "Outside the 10 percent tolerance" },
            { label: "ceil(3 x 1.8) = 6", detail: "Within min 2 and max 10" },
            { label: "Scale to 6", detail: "Deployment replicas set to 6" },
          ],
        },
      },
      {
        heading: "Shaping behaviour with the behavior field",
        body: "autoscaling/v2 adds spec.behavior with separate scaleUp and scaleDown sections. Each has a stabilizationWindowSeconds and a list of policies such as type Pods value 4 periodSeconds 60 (at most 4 Pods per minute) or type Percent value 50. selectPolicy chooses Max (the default) or Min among policies, or Disabled to turn that direction off.\n\nThe defaults are sensible: scale-up may double the Pods or add 4 per 15 seconds, whichever is more, with no window; scale-down may remove everything above minimum per 15 seconds but only after the 300 second window. Slow down scale-down for apps with expensive warm-up; speed up scale-up for spiky traffic.",
      },
      {
        heading: "Living with an HPA",
        body: "Once an HPA owns a Deployment, it writes spec.replicas. If your CI pipeline or GitOps tool also applies a replicas value, the two will fight and Pods will jump up and down. Remove replicas from the manifest after enabling the HPA.\n\nMemory is a weaker scaling signal than CPU, because many runtimes do not give memory back after a spike, so the HPA may scale up and never down. kubectl describe hpa shows the current metrics, the conditions AbleToScale, ScalingActive and ScalingLimited, and recent scaling events with reasons, which is the first place to look when it behaves oddly.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "Where the HPA gets its numbers",
        actors: ["kubelet (cAdvisor)", "metrics-server", "HPA controller", "Deployment"],
        messages: [
          { from: 1, to: 0, label: "Scrape Pod CPU and memory, every 15s" },
          { from: 2, to: 1, label: "GET metrics.k8s.io via API server" },
          { from: 1, to: 2, label: "Usage per Pod" },
          { from: 2, to: 2, label: "Compare with requests and target" },
          { from: 2, to: 3, label: "Update scale subresource: replicas" },
        ],
      },
    ],
    examples: [
      {
        title: "Autoscale and load-test a web app",
        explanation: "Step 1: create a Deployment with a CPU request and a Service. Step 2: create the HPA with kubectl autoscale. Step 3: start a busy loop that calls the Service. Step 4: in another terminal watch the HPA; TARGETS climbs above 50 percent and REPLICAS goes up. Step 5: delete the load Pod; after about 5 minutes replicas drop back to the minimum.",
        code: {
          lang: "bash",
          code: "kubectl create deploy php --image=registry.k8s.io/hpa-example --port=80\nkubectl set resources deploy php --requests=cpu=200m\nkubectl expose deploy php --port=80\nkubectl autoscale deploy php --cpu-percent=50 --min=1 --max=10\nkubectl run load --image=busybox:1.36 --restart=Never -- \\\n  /bin/sh -c 'while true; do wget -q -O- http://php; done'\nkubectl get hpa php --watch\nkubectl delete pod load",
        },
      },
      {
        title: "Fixing TARGETS unknown",
        explanation: "kubectl get hpa shows cpu: unknown/50% (shown in angle brackets). Step 1: run kubectl top pods; if it errors, metrics-server is the problem, so check its Pod and logs. Step 2: if top works, check that every container in the target Pods has a CPU request; describe hpa says failed to get cpu utilization: missing request for cpu. Step 3: add the request; new Pods roll out and TARGETS shows a real number within a minute.",
        code: {
          lang: "bash",
          code: "kubectl describe hpa web | grep -A3 Conditions\nkubectl top pods\nkubectl -n kube-system get pods -l k8s-app=metrics-server\nkubectl get deploy web -o jsonpath='{.spec.template.spec.containers[*].resources}'\nkubectl set resources deploy web --requests=cpu=100m",
        },
      },
    ],
    cheatSheet: [
      "kubectl autoscale deploy web --cpu-percent=50 --min=2 --max=10",
      "desired = ceil(current replicas x current metric / target metric)",
      "No scaling if the ratio is within 10 percent of the target (tolerance 0.1)",
      "Scale-down waits a 300 second stabilization window by default",
      "Lab fix for metrics-server x509 errors: add --kubelet-insecure-tls to its args",
      "Several metrics: the HPA uses whichever needs the most replicas",
      "Remove spec.replicas from manifests once an HPA manages the Deployment",
    ],
    quiz: [
      {
        q: "An HPA targets 60% CPU. 5 Pods average 66% of their requests. What happens?",
        options: ["Scales to 6", "Scales to 10", "Nothing, because 66 / 60 = 1.1 is within the tolerance", "Scales down to 4"],
        answer: 2,
        why: "The default 10 percent tolerance stops changes when the ratio is between 0.9 and 1.1.",
      },
      {
        q: "Load stops suddenly. When does the HPA start removing Pods by default?",
        options: ["After the 5 minute scale-down stabilization window", "Immediately", "After 15 seconds", "Only when you run kubectl scale"],
        answer: 0,
        why: "Scale-down uses the highest recommendation from the last 300 seconds.",
      },
      {
        q: "Which API group does the HPA read CPU and memory usage from?",
        options: ["apps/v1", "autoscaling/v2", "monitoring.coreos.com", "metrics.k8s.io"],
        answer: 3,
        why: "metrics-server serves the Resource Metrics API under metrics.k8s.io.",
      },
      {
        q: "An HPA uses both CPU and memory metrics. CPU suggests 4 replicas and memory suggests 7. What does it choose?",
        options: ["4", "7", "The average, 6", "It reports an error"],
        answer: 1,
        why: "With several metrics, the HPA picks the highest recommendation.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Check whether metrics-server works in your cluster and list the three Pods using the most memory in all namespaces.",
        hint: "kubectl top has a --sort-by flag.",
        solution: "kubectl get apiservice v1beta1.metrics.k8s.io\nkubectl top pods -A --sort-by=memory | head -4",
      },
      {
        level: "medium",
        task: "Create an autoscaling/v2 HPA named api for Deployment api: min 2, max 8, target 70% CPU, and scale-down no faster than 1 Pod per minute.",
        hint: "Use behavior.scaleDown.policies with type Pods.",
        solution: "apiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata: { name: api }\nspec:\n  scaleTargetRef: { apiVersion: apps/v1, kind: Deployment, name: api }\n  minReplicas: 2\n  maxReplicas: 8\n  metrics: [{ type: Resource, resource: { name: cpu,\n    target: { type: Utilization, averageUtilization: 70 } } }]\n  behavior:\n    scaleDown: { policies: [{ type: Pods, value: 1, periodSeconds: 60 }] }",
      },
      {
        level: "hard",
        task: "On a kubeadm lab where kubectl top fails with x509 errors, install metrics-server and make it work, then show an HPA reading real numbers.",
        hint: "Patch the Deployment args with a JSON patch that appends one flag.",
        solution: "kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml\nkubectl -n kube-system patch deploy metrics-server --type=json -p \\\n  '[{\"op\":\"add\",\"path\":\"/spec/template/spec/containers/0/args/-\",\"value\":\"--kubelet-insecure-tls\"}]'\nkubectl -n kube-system rollout status deploy metrics-server\nkubectl top nodes\nkubectl get hpa   # TARGETS now shows a percentage",
      },
    ],
    faq: [
      { q: "Why does my HPA say unknown?", a: "Either metrics-server is not running or not reachable, or the target Pods have no CPU request. kubectl describe hpa states which one in its conditions." },
      { q: "Can the HPA scale to zero?", a: "Not by default: minReplicas must be at least 1 unless an alpha feature gate is enabled. Tools like KEDA are used when you need scale to zero." },
      { q: "Should I use HPA and VPA together?", a: "Not on the same CPU or memory metric, because they would fight. A common pattern is VPA in recommendation-only mode to tune requests, and HPA to change the replica count." },
    ],
  },

  "cka-workloads/scheduling": {
    plain: [
      "When you create a Pod, it does not know where it will run yet. A component called the scheduler picks a node for it. Most of the time you let it choose freely. Sometimes you need control: a Pod needs a GPU, or a database must run on fast SSD nodes.",
      "There are two kinds of tools. Some attract: labels on nodes plus a nodeSelector or affinity rule on the Pod say \"put me there\". Others repel: a taint on a node says \"stay away\", and only Pods with a matching toleration may come.",
      "A toleration is like a visitor pass. It lets a Pod enter a tainted node, but it does not send the Pod there. To dedicate nodes to one team, you need both: a taint to keep others out and an affinity to pull the right Pods in.",
      "When nothing fits, the Pod stays Pending and kubectl describe shows a clear message such as 0/3 nodes are available, with the reason for each node. Reading that line is half the job.",
    ],
    deepDive: [
      {
        heading: "Node affinity syntax that actually works",
        body: "requiredDuringSchedulingIgnoredDuringExecution holds nodeSelectorTerms. The terms are ORed: a node needs to match only one. Inside a term, all matchExpressions are ANDed. Operators are In, NotIn, Exists, DoesNotExist, Gt and Lt; NotIn and DoesNotExist give you anti-affinity to nodes.\n\npreferredDuringSchedulingIgnoredDuringExecution is a list of weighted preferences, each with a weight from 1 to 100 and a preference term. The scheduler adds the weights of matching terms to a node's score, but never refuses a node for missing them. IgnoredDuringExecution means label changes after scheduling do not move running Pods.",
        bullets: ["nodeSelector is the simple form: all labels must match", "kubectl get nodes -L disktype shows a label as a column", "Well-known labels: kubernetes.io/hostname, topology.kubernetes.io/zone"],
      },
      {
        heading: "Pod affinity, anti-affinity and spreading",
        body: "Pod affinity places a Pod near other Pods; anti-affinity keeps it away. Both use a labelSelector to pick the other Pods and a topologyKey to define what near means. topologyKey kubernetes.io/hostname means same node; topology.kubernetes.io/zone means same zone.\n\nA required anti-affinity against your own app label puts each replica on a different node. If you have more replicas than nodes, the extra ones stay Pending. For softer spreading, topologySpreadConstraints is often better: maxSkew 1 with topologyKey zone keeps the Pod count per zone within one of each other, and whenUnsatisfiable chooses DoNotSchedule or ScheduleAnyway.",
        visual: {
          type: "compare",
          title: "Three ways to spread replicas",
          columns: [
            { title: "Required anti-affinity", points: ["At most one per node", "Extra replicas stay Pending", "Strict and simple", "Costly to evaluate at scale"] },
            { title: "Preferred anti-affinity", points: ["Tries one per node", "Doubles up when needed", "Never blocks scheduling", "Weight decides strength"] },
            { title: "Topology spread", points: ["Even counts per domain", "maxSkew sets tolerance", "Works for zones and nodes", "Hard or soft mode"] },
          ],
        },
      },
      {
        heading: "Taint effects and tolerations in detail",
        body: "A taint is key=value:effect. NoSchedule blocks new Pods without a toleration. PreferNoSchedule tries to avoid the node. NoExecute also evicts running Pods that do not tolerate it; a toleration may add tolerationSeconds to stay for a limited time before eviction.\n\nA toleration matches with operator Equal (key, value and effect must match) or Exists (no value needed). An empty key with operator Exists tolerates every taint, which is how some system DaemonSets run everywhere. Kubernetes adds taints itself: node.kubernetes.io/unschedulable when you cordon, and node.kubernetes.io/not-ready or unreachable with NoExecute when a node fails. Pods get automatic tolerations of 300 seconds for those two, which is why Pods on a dead node are replaced after about five minutes.",
        bullets: ["kubectl describe node NAME | grep Taints", "Leave out effect in a toleration to match all effects for that key", "kubectl cordon adds the unschedulable taint; uncordon removes it"],
      },
      {
        heading: "Bypassing and overruling the scheduler",
        body: "Setting spec.nodeName in a Pod skips the scheduler entirely: the kubelet on that node just runs it. Taints with NoSchedule are not checked in that case, although NoExecute taints still evict the Pod. This is handy when the scheduler itself is broken, and it is a common exam trick.\n\nPriorityClasses rank Pods. When a high-priority Pod cannot fit, the scheduler may preempt (evict) lower-priority Pods to make room. Cluster components use the built-in classes system-cluster-critical and system-node-critical. Use your own classes sparingly, or preemption can surprise other teams.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Scheduling controls by who sets them",
        root: "Placement controls",
        children: [
          { label: "On the node", children: ["Labels", "Taints: NoSchedule, PreferNoSchedule, NoExecute", "cordon (unschedulable)"] },
          { label: "On the Pod: attract", children: ["nodeSelector", "nodeAffinity required or preferred", "podAffinity"] },
          { label: "On the Pod: repel or spread", children: ["podAntiAffinity", "topologySpreadConstraints"] },
          { label: "On the Pod: override", children: ["tolerations", "nodeName skips the scheduler", "priorityClassName"] },
        ],
      },
    ],
    examples: [
      {
        title: "Dedicate GPU nodes to the ML team",
        explanation: "Step 1: label and taint the GPU node, so ordinary Pods stay away. Step 2: give ML Pods a toleration so they may enter, and a required node affinity so they must land there. Step 3: verify with kubectl get pods -o wide. Without the taint, other Pods would fill the GPU node; without the affinity, ML Pods could land anywhere.",
        code: {
          lang: "yaml",
          code: "# kubectl label node gpu1 hw=gpu\n# kubectl taint node gpu1 hw=gpu:NoSchedule\nspec:\n  tolerations:\n    - { key: hw, operator: Equal, value: gpu, effect: NoSchedule }\n  affinity:\n    nodeAffinity:\n      requiredDuringSchedulingIgnoredDuringExecution:\n        nodeSelectorTerms:\n          - matchExpressions:\n              - { key: hw, operator: In, values: [gpu] }\n  containers: [{ name: train, image: busybox:1.36, command: [sleep, \"3600\"] }]",
        },
      },
      {
        title: "Reading a Pending message",
        explanation: "A Pod is Pending on a 3-node cluster. Step 1: describe it and read the FailedScheduling event, for example: 0/3 nodes are available: 1 node(s) had untolerated taint {node-role.kubernetes.io/control-plane: }, 2 node(s) didn't match Pod's node affinity/selector. Step 2: the control plane is expected to refuse. Step 3: compare the Pod's selector with real node labels; here the label was disk=ssd but the Pod asked for disktype=ssd. Step 4: fix the label or the selector.",
        code: {
          lang: "bash",
          code: "kubectl describe pod db-0 | grep -A4 Events\nkubectl get pod db-0 -o jsonpath='{.spec.nodeSelector}'\nkubectl get nodes --show-labels | grep -o 'dis[a-z]*=ssd'\nkubectl label node node2 disktype=ssd",
        },
      },
    ],
    cheatSheet: [
      "kubectl label node n1 disktype=ssd; remove with kubectl label node n1 disktype-",
      "kubectl taint node n1 key=val:NoSchedule; remove by adding - at the end",
      "nodeSelectorTerms are ORed; matchExpressions inside one term are ANDed",
      "Preferred affinity weights range from 1 to 100",
      "topologyKey kubernetes.io/hostname means per node; topology.kubernetes.io/zone per zone",
      "spec.nodeName skips the scheduler completely",
      "Pods tolerate not-ready and unreachable taints for 300 seconds by default",
    ],
    quiz: [
      {
        q: "A node has taint team=a:NoSchedule. A Pod has a matching toleration and no other rules. Where can it run?",
        options: ["Only on that node", "On that node or any untainted node", "Nowhere until the taint is removed", "Only on control plane nodes"],
        answer: 1,
        why: "A toleration permits the tainted node but does not force the Pod onto it.",
      },
      {
        q: "Which taint effect removes Pods that are already running and do not tolerate it?",
        options: ["NoSchedule", "PreferNoSchedule", "Evict", "NoExecute"],
        answer: 3,
        why: "NoExecute affects running Pods too; Evict is not a real effect.",
      },
      {
        q: "A Deployment has 4 replicas and required pod anti-affinity on its own label with topologyKey kubernetes.io/hostname. The cluster has 3 schedulable nodes. Result?",
        options: ["3 Pods run and 1 stays Pending", "4 Pods run, two share a node", "No Pods run", "The Deployment is rejected"],
        answer: 0,
        why: "Required anti-affinity allows at most one matching Pod per node.",
      },
      {
        q: "The scheduler Pod is broken and you must run a Pod on node2 right now. What works?",
        options: ["Add a nodeSelector", "Add a toleration", "Set spec.nodeName: node2", "Add pod affinity"],
        answer: 2,
        why: "nodeName binds the Pod directly, so the kubelet runs it without the scheduler.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Label node01 with tier=frontend and run a Pod web that only schedules on nodes with that label.",
        hint: "nodeSelector is enough.",
        solution: "kubectl label node node01 tier=frontend\nkubectl run web --image=nginx --dry-run=client -o yaml > web.yaml\n# add under spec:  nodeSelector: { tier: frontend }\nkubectl apply -f web.yaml\nkubectl get pod web -o wide",
      },
      {
        level: "medium",
        task: "Taint node01 with maintenance=true:NoExecute and keep only a Pod named keeper running there, allowed to stay for 1 hour.",
        hint: "tolerationSeconds only works with NoExecute.",
        solution: "kubectl taint node node01 maintenance=true:NoExecute\n# keeper Pod spec:\n#   nodeName: node01\n#   tolerations:\n#     - { key: maintenance, operator: Equal, value: \"true\",\n#         effect: NoExecute, tolerationSeconds: 3600 }\nkubectl get pods -o wide --field-selector spec.nodeName=node01",
      },
      {
        level: "hard",
        task: "Create Deployment cache with 3 replicas that prefers SSD nodes (weight 80) and must never put two replicas on the same node.",
        hint: "Combine preferred nodeAffinity with required podAntiAffinity on app=cache.",
        solution: "affinity:\n  nodeAffinity:\n    preferredDuringSchedulingIgnoredDuringExecution:\n      - weight: 80\n        preference: { matchExpressions: [{ key: disktype, operator: In, values: [ssd] }] }\n  podAntiAffinity:\n    requiredDuringSchedulingIgnoredDuringExecution:\n      - topologyKey: kubernetes.io/hostname\n        labelSelector: { matchLabels: { app: cache } }",
      },
    ],
    faq: [
      { q: "What is the difference between nodeSelector and node affinity?", a: "nodeSelector is a simple exact match on labels. Node affinity adds operators like In, NotIn and Exists, OR between terms, and soft preferences with weights." },
      { q: "Why do my Pods not run on the control plane node?", a: "kubeadm taints control plane nodes with node-role.kubernetes.io/control-plane:NoSchedule. Add a toleration for it, or remove the taint in a lab." },
      { q: "Does changing a node label move running Pods?", a: "No. Affinity rules are IgnoredDuringExecution, so they only matter when a Pod is scheduled. Use a NoExecute taint or delete the Pods to move them." },
    ],
  },

  "cka-workloads/pod-patterns": {
    plain: [
      "A Deployment is great for web apps that run forever with any number of copies. But some jobs have a different shape, and Kubernetes has a different controller for each one.",
      "A DaemonSet runs exactly one Pod on every node, which suits node agents like log shippers and network plugins. A Job runs a task until it finishes, like a database migration. A CronJob starts a Job on a schedule, like a nightly backup.",
      "Static Pods are special. They are not created through the API at all. The kubelet on a node reads YAML files from a folder and runs them directly. This is how the control plane itself (API server, etcd, scheduler) runs on kubeadm clusters, before any API exists.",
      "Inside one Pod you can also have helper containers. Init containers run first and must finish, for example to wait for a database. Sidecar containers start before the app and keep running next to it, for example to ship logs or proxy traffic.",
    ],
    deepDive: [
      {
        heading: "DaemonSets: one per node, and how to limit them",
        body: "The DaemonSet controller creates one Pod per eligible node and pins it there with node affinity on the node's name, so the normal scheduler still binds it. New nodes get a Pod automatically; removed nodes lose theirs. To run on only some nodes, add a nodeSelector or affinity. To include control plane nodes, add a toleration for node-role.kubernetes.io/control-plane:NoSchedule.\n\nDaemonSet Pods automatically tolerate several node condition taints, such as not-ready, unreachable, disk-pressure and memory-pressure, so node agents keep running on unhealthy nodes. updateStrategy RollingUpdate (default, maxUnavailable 1) replaces Pods node by node; OnDelete waits until you delete each Pod yourself. kubectl cannot create a DaemonSet directly, so generate a Deployment and edit it.",
        bullets: ["Change kind to DaemonSet", "Delete replicas, strategy and status", "kubectl get ds -A shows DESIRED versus READY per DaemonSet"],
      },
      {
        heading: "Static Pods: how the kubelet finds them",
        body: "The kubelet reads its configuration file, on kubeadm /var/lib/kubelet/config.yaml, and the staticPodPath field names the folder it watches, normally /etc/kubernetes/manifests. Any valid Pod YAML dropped there starts within seconds; removing the file stops the Pod; editing it recreates the Pod.\n\nThe kubelet also creates a mirror Pod in the API so you can see it with kubectl, named after the Pod plus the node name, like kube-apiserver-cp1. You cannot change a static Pod through the mirror; deleting the mirror only makes it reappear. If a manifest has a YAML error, nothing appears in kubectl at all, and you must read the kubelet logs with journalctl -u kubelet.",
        visual: {
          type: "flow",
          title: "Finding and fixing a static Pod",
          steps: [
            { label: "Find the config", detail: "ps aux | grep kubelet shows --config" },
            { label: "Read staticPodPath", detail: "grep staticPodPath in that file" },
            { label: "Edit the manifest", detail: "Save the file in that folder" },
            { label: "kubelet restarts it", detail: "Watch with crictl ps" },
            { label: "Mirror Pod updates", detail: "kubectl get pods -n kube-system" },
          ],
        },
      },
      {
        heading: "Jobs and CronJobs: the knobs that matter",
        body: "A Job runs Pods until completions of them succeed (default 1), running up to parallelism at once. backoffLimit (default 6) caps retries before the Job is marked Failed; activeDeadlineSeconds fails it after a time limit; ttlSecondsAfterFinished deletes it automatically later. Pods must use restartPolicy OnFailure (restart in place) or Never (a new Pod each try).\n\nA CronJob creates Jobs on a five-field cron schedule in the controller's time zone unless you set spec.timeZone. concurrencyPolicy is Allow (default), Forbid (skip if the last run is still going) or Replace. successfulJobsHistoryLimit defaults to 3 and failedJobsHistoryLimit to 1. suspend: true pauses it. To test right now, run kubectl create job manual --from=cronjob/backup.",
        bullets: ["kubectl create job x --image=busybox -- echo hi", "kubectl create cronjob y --image=busybox --schedule='*/5 * * * *' -- date", "kubectl get jobs shows COMPLETIONS like 3/3"],
      },
      {
        heading: "Init containers and native sidecars",
        body: "Init containers run in order, each to completion, before any app container starts. If one fails, the kubelet retries it (unless the Pod's restartPolicy is Never) and the Pod shows Init:Error or Init:CrashLoopBackOff. Read its log with kubectl logs POD -c INITNAME.\n\nSince Kubernetes 1.33, native sidecars are stable: an init container with restartPolicy: Always starts in order like an init container but keeps running, and the next container starts once it has started (or passed its startup probe). Sidecars stop after the app containers on shutdown, and they do not block a Job from completing. Before this, sidecars were plain extra containers in containers, with no start order and a habit of keeping Jobs alive forever.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Which workload type should I use?",
        root: "What does the Pod do?",
        children: [
          { label: "Serves forever, any copies", children: ["Deployment"] },
          { label: "Serves forever, stable identity and disk", children: ["StatefulSet"] },
          { label: "One per node", children: ["DaemonSet"] },
          { label: "Runs once to completion", children: ["Job"] },
          { label: "Runs on a schedule", children: ["CronJob"] },
          { label: "Must exist before the API", children: ["Static Pod"] },
        ],
      },
    ],
    examples: [
      {
        title: "A DaemonSet that also runs on the control plane",
        explanation: "You need a node agent on every node, including the control plane. Step 1: generate Deployment YAML. Step 2: change kind to DaemonSet and remove replicas and strategy. Step 3: add the control plane toleration. Step 4: apply and check that DESIRED equals the number of nodes.",
        code: {
          lang: "yaml",
          code: "apiVersion: apps/v1\nkind: DaemonSet\nmetadata: { name: node-agent, namespace: kube-system }\nspec:\n  selector: { matchLabels: { app: node-agent } }\n  template:\n    metadata: { labels: { app: node-agent } }\n    spec:\n      tolerations:\n        - { key: node-role.kubernetes.io/control-plane, operator: Exists, effect: NoSchedule }\n      containers:\n        - { name: agent, image: busybox:1.36, command: [sh, -c, \"sleep infinity\"] }\n# kubectl get ds node-agent -n kube-system",
        },
      },
      {
        title: "Wait for a database with an init container",
        explanation: "An app crashes if it starts before its database Service exists. Step 1: add an init container that loops until DNS for the Service resolves. Step 2: apply; the Pod shows Init:0/1 while waiting. Step 3: create the db Service; the init container exits 0 and the app starts. Step 4: if it hangs, read the init container log by name.",
        code: {
          lang: "yaml",
          code: "spec:\n  initContainers:\n    - name: wait-db\n      image: busybox:1.36\n      command: [sh, -c, \"until nslookup db; do echo waiting; sleep 2; done\"]\n  containers:\n    - { name: app, image: nginx:1.27 }\n# kubectl get pod app        STATUS Init:0/1\n# kubectl logs app -c wait-db",
        },
      },
    ],
    cheatSheet: [
      "staticPodPath lives in /var/lib/kubelet/config.yaml; kubeadm uses /etc/kubernetes/manifests",
      "Static Pod mirror name = Pod name + - + node name",
      "kubectl create job manual --from=cronjob/backup runs a CronJob now",
      "Job backoffLimit defaults to 6; restartPolicy must be OnFailure or Never",
      "CronJob concurrencyPolicy: Allow, Forbid or Replace",
      "Native sidecar = initContainers entry with restartPolicy: Always (stable since 1.33)",
      "kubectl logs POD -c INITNAME reads an init container's output",
    ],
    quiz: [
      {
        q: "You run kubectl delete pod kube-scheduler-cp1 -n kube-system. What happens?",
        options: ["The scheduler is gone until you reinstall it", "The kubelet recreates it from the manifest file", "The DaemonSet recreates it", "The Deployment recreates it"],
        answer: 1,
        why: "It is a static Pod; the mirror is recreated as long as the manifest file exists.",
      },
      {
        q: "A CronJob's previous run is still going when the next one is due. Which setting skips the new run?",
        options: ["concurrencyPolicy: Replace", "suspend: true", "concurrencyPolicy: Forbid", "backoffLimit: 0"],
        answer: 2,
        why: "Forbid skips a new run while the last one is still active.",
      },
      {
        q: "How do you declare a native sidecar container?",
        options: ["In initContainers with restartPolicy: Always", "In containers with sidecar: true", "In ephemeralContainers", "With the annotation sidecar.kubernetes.io/enabled"],
        answer: 0,
        why: "Native sidecars are init containers whose own restartPolicy is Always.",
      },
      {
        q: "A DaemonSet shows DESIRED 2 on a 3-node cluster. What is the most likely cause?",
        options: ["The DaemonSet is paused", "maxUnavailable is 1", "One node is out of memory", "The control plane node has a taint the Pods do not tolerate"],
        answer: 3,
        why: "The control plane NoSchedule taint excludes that node unless the Pods tolerate it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a Job named count that runs busybox, prints the numbers 1 to 5, and must succeed 3 times with 2 Pods in parallel.",
        hint: "Generate YAML, then add completions and parallelism.",
        solution: "kubectl create job count --image=busybox:1.36 --dry-run=client -o yaml \\\n  -- sh -c 'seq 1 5' > job.yaml\n# under spec: add  completions: 3  and  parallelism: 2\nkubectl apply -f job.yaml\nkubectl get job count -w     # COMPLETIONS 3/3",
      },
      {
        level: "medium",
        task: "On node01, create a static Pod named static-busy running busybox with sleep 3600, then remove it again.",
        hint: "ssh to the node and find staticPodPath first.",
        solution: "ssh node01\ngrep staticPodPath /var/lib/kubelet/config.yaml\nkubectl run static-busy --image=busybox:1.36 --dry-run=client -o yaml \\\n  --command -- sleep 3600 | sudo tee /etc/kubernetes/manifests/static-busy.yaml\n# (generate the YAML wherever kubectl works and copy it if needed)\nkubectl get pod static-busy-node01\nsudo rm /etc/kubernetes/manifests/static-busy.yaml",
      },
      {
        level: "hard",
        task: "A Pod is stuck in Init:CrashLoopBackOff. Find which init container fails and why, and explain why the app container never started.",
        hint: "describe lists init containers and their states; logs needs -c.",
        solution: "kubectl get pod app -o jsonpath='{.spec.initContainers[*].name}'\nkubectl describe pod app | sed -n '/Init Containers/,/Containers:/p'\nkubectl logs app -c wait-db --previous\n# Fix the cause (for example a wrong Service name in nslookup),\n# then recreate the Pod. App containers start only after\n# every regular init container has exited with code 0.",
      },
    ],
    faq: [
      { q: "What is the difference between a static Pod and a DaemonSet?", a: "A static Pod is run by one kubelet from a local file and works even without an API server. A DaemonSet is a normal API object whose controller schedules one Pod on every matching node." },
      { q: "How do I trigger a CronJob manually?", a: "Run kubectl create job NAME --from=cronjob/CRONJOB. It creates a Job from the CronJob's template right away." },
      { q: "Why does my Job never finish when it has a sidecar?", a: "A sidecar declared as a regular container keeps running, so the Pod never completes. Declare it as a native sidecar in initContainers with restartPolicy: Always, which Kubernetes stops when the main containers finish." },
    ],
  },
};

export default extra;

import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "cka-storage/volumes": {
    plain: [
      "A container's own filesystem is temporary. When the container crashes and restarts, everything it wrote is gone, because it starts again from the clean image. Volumes fix this by giving the Pod folders that live outside any single container.",
      "You declare a volume once for the whole Pod, under spec.volumes. Then each container that needs it mounts it at a path of its choice with volumeMounts. Two containers mounting the same volume see the same files, which is how a helper container can read logs the main app writes.",
      "There are many volume types. emptyDir is a blank scratch folder that lives as long as the Pod. hostPath opens a folder from the node itself. projected puts several small sources (Secrets, ConfigMaps, Pod details, tokens) together in one folder.",
      "None of these keep data safe if the Pod is deleted or moves to another node. For real, long-lived data such as a database, you use PersistentVolumeClaims, covered next. Volumes in this topic are for sharing, scratch space and config.",
    ],
    deepDive: [
      {
        heading: "emptyDir under the hood",
        body: "When a Pod with an emptyDir lands on a node, the kubelet creates a folder under /var/lib/kubelet/pods/POD_UID/volumes/kubernetes.io~empty-dir/NAME. It survives container restarts because it belongs to the Pod, not the container, and it is deleted when the Pod leaves the node for any reason.\n\nBy default it uses the node's disk and counts as ephemeral storage. Set sizeLimit to cap it; if the Pod writes more, the kubelet evicts the Pod. medium: Memory puts it in tmpfs (RAM), which is fast but counts toward the container's memory limit, so a big cache can get the container OOMKilled. Use emptyDir for caches, sorting space, and files passed between an init container and the app.",
        bullets: ["emptyDir: { sizeLimit: 500Mi }", "emptyDir: { medium: Memory, sizeLimit: 64Mi }", "A container restart keeps the files; a Pod deletion removes them"],
      },
      {
        heading: "hostPath: power and danger",
        body: "hostPath mounts a file or folder from the node into the Pod. Its type field adds a check: DirectoryOrCreate and FileOrCreate create the path if missing, while Directory, File and Socket require it to exist already, or the Pod fails to start. The default empty type does no check at all.\n\nhostPath is how node agents read /var/log or reach the container runtime socket, and how kubeadm's static Pods mount certificates from /etc/kubernetes/pki. For normal apps it is risky: a Pod could read or change host files, and data stays on one node, so a rescheduled Pod finds an empty folder elsewhere. The Pod Security Standards forbid hostPath at the baseline level for that reason. If you must use it, mount it readOnly: true.",
        bullets: ["hostPath: { path: /var/log, type: Directory }", "Files are created as root on the node", "Fine for single-node labs; avoid for app data"],
      },
      {
        heading: "Projected volumes and the downward API",
        body: "A projected volume combines several sources into one folder: secret, configMap, downwardAPI and serviceAccountToken. You already use one in every Pod: the kube-api-access-xxxxx volume mounted at /var/run/secrets/kubernetes.io/serviceaccount, which holds a short-lived token, the cluster CA certificate and the namespace name.\n\nThe downward API exposes facts about the Pod itself: metadata.name, metadata.namespace, labels and annotations, and container resource values such as limits.memory. As files, labels and annotations are kept up to date; as env vars, values are fixed at start. A serviceAccountToken source can request a token with its own audience and lifetime (expirationSeconds, at least 600), which the kubelet refreshes before it expires.",
        visual: {
          type: "tree",
          title: "One projected volume at /etc/podinfo",
          root: "projected",
          children: [
            { label: "secret: db", children: ["password"] },
            { label: "configMap: app", children: ["app.properties"] },
            { label: "downwardAPI", children: ["labels", "namespace", "mem_limit"] },
            { label: "serviceAccountToken", children: ["token (audience vault, 1h)"] },
          ],
        },
      },
      {
        heading: "Mount options that matter",
        body: "readOnly: true on a volumeMount stops the container from writing. subPath mounts a single file or subfolder of the volume instead of the whole thing, which avoids hiding the rest of the target folder, but subPath mounts do not receive ConfigMap or Secret updates. subPathExpr can build that path from an env var, such as the Pod name, so each replica writes to its own subfolder of a shared volume.\n\nWhen a volume is mounted over an existing folder in the image, the image's files there are hidden while the mount is active. Use a fresh path, or subPath, when the image already ships files in that folder.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "How long does the data live?",
        columns: [
          { title: "Container filesystem", points: ["Lost on container restart", "Fresh copy of the image", "Use for nothing important"] },
          { title: "emptyDir", points: ["Survives container restarts", "Lost when Pod is deleted", "Never moves between nodes"] },
          { title: "PVC-backed volume", points: ["Survives Pod deletion", "Follows the Pod to new nodes", "Lifetime set by reclaim policy"] },
        ],
      },
    ],
    examples: [
      {
        title: "An init container prepares files for the app",
        explanation: "nginx should serve a page generated at start-up. Step 1: an init container writes index.html into an emptyDir. Step 2: the nginx container mounts the same emptyDir at its web root. Step 3: once the init container exits, nginx starts and serves the generated file. Step 4: test with port-forward.",
        code: {
          lang: "yaml",
          code: "spec:\n  initContainers:\n    - name: gen\n      image: busybox:1.36\n      command: [sh, -c, \"echo built at $(date) > /work/index.html\"]\n      volumeMounts: [{ name: site, mountPath: /work }]\n  containers:\n    - name: web\n      image: nginx:1.27\n      volumeMounts: [{ name: site, mountPath: /usr/share/nginx/html }]\n  volumes:\n    - { name: site, emptyDir: { sizeLimit: 10Mi } }\n# kubectl port-forward pod/NAME 8080:80 ; curl localhost:8080",
        },
      },
      {
        title: "Expose Pod details to the app as files",
        explanation: "An app wants its own Pod name, namespace and memory limit without calling the API. Step 1: add a downwardAPI volume with three items. Step 2: mount it at /etc/podinfo. Step 3: read the files. Note that mem_limit is printed in bytes unless you set a divisor such as 1Mi.",
        code: {
          lang: "yaml",
          code: "volumes:\n  - name: podinfo\n    downwardAPI:\n      items:\n        - { path: name, fieldRef: { fieldPath: metadata.name } }\n        - { path: namespace, fieldRef: { fieldPath: metadata.namespace } }\n        - path: mem_limit\n          resourceFieldRef: { containerName: app, resource: limits.memory, divisor: 1Mi }\n# container: volumeMounts: [{ name: podinfo, mountPath: /etc/podinfo }]\n# kubectl exec POD -- sh -c 'cat /etc/podinfo/*'",
        },
      },
    ],
    cheatSheet: [
      "Declare in spec.volumes, mount per container in volumeMounts (names must match)",
      "emptyDir lives on the node at /var/lib/kubelet/pods/UID/volumes/",
      "emptyDir medium: Memory is tmpfs and counts against the memory limit",
      "hostPath type DirectoryOrCreate creates the path; Directory requires it to exist",
      "Every Pod's token lives at /var/run/secrets/kubernetes.io/serviceaccount",
      "subPath mounts one file but never receives updates",
      "kubectl explain pod.spec.volumes.projected.sources lists all source types",
    ],
    quiz: [
      {
        q: "A container in a Pod crashes and restarts. What happens to files it wrote in an emptyDir?",
        options: ["They are deleted", "They are moved to the node's /tmp", "They are still there", "They become read-only"],
        answer: 2,
        why: "emptyDir belongs to the Pod, so it survives container restarts.",
      },
      {
        q: "An emptyDir uses medium: Memory and the app fills it with 300Mi. The container's memory limit is 256Mi. Likely result?",
        options: ["The container is OOMKilled", "The files spill to disk", "Nothing, tmpfs is free", "The Pod is rescheduled with more memory"],
        answer: 0,
        why: "tmpfs pages count toward the container's memory usage.",
      },
      {
        q: "Which volume type is behind the service account token every Pod gets by default?",
        options: ["secret", "hostPath", "emptyDir", "projected"],
        answer: 3,
        why: "kube-api-access volumes are projected volumes combining a token, the CA cert and the namespace.",
      },
      {
        q: "A hostPath volume uses type: Directory and the folder does not exist on the node. What happens?",
        options: ["The kubelet creates it", "The Pod fails to start with a mount error", "The Pod uses an emptyDir instead", "The scheduler picks another node"],
        answer: 1,
        why: "Directory requires the path to exist; DirectoryOrCreate would create it.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a Pod with two busybox containers sharing an emptyDir at /shared. One writes the date every 5 seconds; read the file from the other.",
        hint: "Both containers mount the same volume name; use kubectl exec -c.",
        solution: "# containers: writer runs sh -c 'while true; do date >> /shared/t; sleep 5; done'\n#             reader runs sleep 3600\n# both: volumeMounts: [{ name: s, mountPath: /shared }]\n# volumes: [{ name: s, emptyDir: {} }]\nkubectl apply -f pod.yaml\nkubectl exec POD -c reader -- tail -3 /shared/t",
      },
      {
        level: "medium",
        task: "Run a Pod that mounts the node's /var/log read-only at /host-logs and lists the files there.",
        hint: "Use type Directory and readOnly on the mount.",
        solution: "# volumes: [{ name: logs, hostPath: { path: /var/log, type: Directory } }]\n# container: volumeMounts: [{ name: logs, mountPath: /host-logs, readOnly: true }]\nkubectl apply -f logs.yaml\nkubectl exec logs -- ls /host-logs\nkubectl exec logs -- touch /host-logs/x   # fails: read-only file system",
      },
      {
        level: "hard",
        task: "Build one projected volume at /etc/bundle that holds Secret db (key password), ConfigMap app (key mode) and the Pod's labels from the downward API.",
        hint: "Each entry in sources is one of secret, configMap or downwardAPI.",
        solution: "volumes:\n  - name: bundle\n    projected:\n      sources:\n        - secret: { name: db, items: [{ key: password, path: db-password }] }\n        - configMap: { name: app, items: [{ key: mode, path: mode }] }\n        - downwardAPI:\n            items: [{ path: labels, fieldRef: { fieldPath: metadata.labels } }]\n# mount: { name: bundle, mountPath: /etc/bundle, readOnly: true }\n# kubectl exec POD -- ls /etc/bundle   -> db-password  labels  mode",
      },
    ],
    faq: [
      { q: "What is the difference between a volume and a PersistentVolume?", a: "A volume is declared inside one Pod and usually lives as long as the Pod. A PersistentVolume is a separate cluster object for durable storage that you attach to Pods through a claim." },
      { q: "Is hostPath safe to use?", a: "Only for trusted system Pods or single-node labs. It gives the Pod access to the node's files and ties data to one node." },
      { q: "Where is emptyDir data stored?", a: "On the node's disk under /var/lib/kubelet/pods, or in RAM if you set medium: Memory." },
    ],
  },

  "cka-storage/pv-pvc": {
    plain: [
      "Some data must outlive Pods: database files, uploads, queues. Kubernetes separates the storage itself from the request for it, so that app teams do not need to know whether the disk is NFS, a cloud disk or something else.",
      "A PersistentVolume (PV) is a real piece of storage that the cluster knows about, like a 10 GB disk. An admin creates it, or a provisioner creates it automatically. PVs belong to the whole cluster, not to any namespace.",
      "A PersistentVolumeClaim (PVC) is a request from an app team: \"I need 5 GB, read-write, from the fast class\". Kubernetes finds a PV that fits and binds them together, one claim to one volume. The Pod then just names the claim.",
      "When the claim is deleted, the reclaim policy decides the PV's fate. Delete removes the storage. Retain keeps the data for a human to look at and clean up. Choosing wrong can mean losing a database, so check this setting.",
    ],
    deepDive: [
      {
        heading: "The exact binding rules",
        body: "A controller in kube-controller-manager looks for a PV that satisfies the claim. The storageClassName must be equal: a PV with no class only matches a PVC whose class is explicitly empty (\"\"). Capacity must be at least the request, and the PV's access modes must include every mode the claim asks for. volumeMode (Filesystem or Block) must match, and a selector on the claim must match the PV's labels.\n\nAmong matching PVs it picks the smallest that fits. If the PV is bigger than the request, the claim gets all of it: a 500Mi claim bound to a 1Gi PV shows capacity 1Gi. Binding is exclusive, so the rest is never shared. To force a specific pairing, set spec.volumeName on the PVC, and optionally claimRef on the PV to reserve it.",
        visual: {
          type: "flow",
          title: "Does this PV fit this PVC?",
          steps: [
            { label: "Same storageClassName?", detail: "Empty only matches explicit \"\"" },
            { label: "Access modes covered?", detail: "PV must include all requested modes" },
            { label: "Capacity big enough?", detail: "PV size at least the request" },
            { label: "volumeMode and selector", detail: "Filesystem or Block; labels match" },
            { label: "Bind smallest match", detail: "claimRef and volumeName set, both Bound" },
          ],
        },
      },
      {
        heading: "Access modes are about nodes",
        body: "ReadWriteOnce (RWO) means one node may mount the volume read-write. Several Pods on that same node can still share it, which surprises many people. ReadOnlyMany (ROX) lets many nodes mount it read-only, ReadWriteMany (RWX) lets many nodes write, and ReadWriteOncePod (RWOP, stable since 1.29) allows exactly one Pod in the whole cluster.\n\nThe backend decides what is possible. Block storage like cloud disks is usually RWO only; file storage like NFS or CephFS supports RWX. A PV can list several modes, but a given mount uses one. Asking for RWX from a class that cannot provide it leaves the claim Pending or fails at provisioning, with the reason in the events.",
        bullets: ["RWO: one node, many Pods on it allowed", "RWOP: one Pod, cluster wide", "RWX needs a shared file system such as NFS"],
      },
      {
        heading: "Phases, protection and reclaiming",
        body: "A PV moves through Available, Bound, Released (its claim was deleted) and Failed. A PVC is Pending, Bound or Lost (its PV disappeared). Two finalizers stop accidents: kubernetes.io/pvc-protection keeps a PVC in Terminating while any Pod still uses it, and kubernetes.io/pv-protection keeps a bound PV from being removed.\n\nWith Retain, a Released PV keeps its data but will not bind again, because claimRef still points to the deleted claim. After you have saved or wiped the data, remove claimRef and the PV becomes Available. With Delete, the PV and the backing storage are removed, which is the default for dynamically provisioned volumes. Recycle, a basic wipe, is deprecated.",
        bullets: ["kubectl patch pv NAME -p '{\"spec\":{\"claimRef\":null}}' makes it Available again", "kubectl patch pv NAME -p '{\"spec\":{\"persistentVolumeReclaimPolicy\":\"Retain\"}}' protects it", "kubectl get pv shows STATUS and CLAIM as namespace/name"],
        visual: {
          type: "cycle",
          title: "Life of a Retain PV",
          steps: [
            { label: "Available", detail: "Created, waiting for a claim" },
            { label: "Bound", detail: "Claim and Pod use it" },
            { label: "Released", detail: "Claim deleted, data kept" },
            { label: "Admin cleans up", detail: "Back up or wipe, clear claimRef" },
          ],
        },
      },
      {
        heading: "Fixing a PVC stuck in Pending",
        body: "Start with kubectl describe pvc and read the events. no persistent volumes available for this claim and no storage class is set means static binding found nothing: compare class, size and access modes with kubectl get pv. If the claim has no storageClassName and the cluster has a default class, the default is filled in automatically, so it will never bind to a manual PV that has no class. That is the most common exam trap.\n\nIf the event says waiting for first consumer, the class uses WaitForFirstConsumer and the claim binds only after a Pod using it is scheduled. A Pod whose claim is not bound stays Pending too, with an event about unbound PersistentVolumeClaims, so always check the claim before the Pod.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "From Pod down to disk",
        layers: [
          { label: "Pod", detail: "volumes: persistentVolumeClaim: claimName" },
          { label: "PersistentVolumeClaim", detail: "Namespaced request: size, mode, class" },
          { label: "PersistentVolume", detail: "Cluster-scoped, bound one to one" },
          { label: "Volume plugin or CSI driver", detail: "Attaches and mounts on the node" },
          { label: "Real storage", detail: "Cloud disk, NFS share, local disk" },
        ],
      },
    ],
    examples: [
      {
        title: "A claim that ignores your PV",
        explanation: "You created PV pv-data with storageClassName manual, and a PVC with no class at all. The PVC binds to a brand-new volume instead, or stays Pending. Step 1: check the PVC's class; it says standard, the default, filled in at creation. Step 2: the class field cannot be changed on an existing claim, so delete and recreate it with storageClassName: manual. Step 3: confirm both show Bound and point to each other.",
        code: {
          lang: "bash",
          code: "kubectl -n app get pvc data -o jsonpath='{.spec.storageClassName}'; echo  # standard\nkubectl get storageclass                    # standard (default)\nkubectl -n app delete pvc data\n# recreate with: storageClassName: manual\nkubectl apply -f pvc.yaml\nkubectl get pv pv-data                      # STATUS Bound, CLAIM app/data\nkubectl -n app get pvc data                 # VOLUME pv-data",
        },
      },
      {
        title: "Reusing a Released PV",
        explanation: "A team deleted its PVC, and the Retain PV now shows Released. They want the same data back under a new claim. Step 1: confirm the status. Step 2: remove the stale claimRef so the PV becomes Available. Step 3: create a new PVC that pins the PV with volumeName. Step 4: mount it in a Pod and check the old files are there.",
        code: {
          lang: "bash",
          code: "kubectl get pv pv-data                       # Released\nkubectl patch pv pv-data -p '{\"spec\":{\"claimRef\":null}}'\nkubectl get pv pv-data                       # Available\n# new PVC spec: storageClassName: manual, volumeName: pv-data,\n#   accessModes: [ReadWriteOnce], resources.requests.storage: 1Gi\nkubectl apply -f pvc-again.yaml\nkubectl get pv pv-data                       # Bound",
        },
      },
    ],
    cheatSheet: [
      "PVs are cluster-scoped; PVCs are namespaced; binding is one to one",
      "A PVC with no class gets the default class; use storageClassName: \"\" or a name to bind static PVs",
      "Pin a claim to a PV with spec.volumeName on the PVC",
      "RWO means one node, not one Pod; RWOP means one Pod",
      "Released PV with Retain: clear spec.claimRef to make it Available",
      "PVC stuck Terminating: a Pod still uses it (pvc-protection finalizer)",
      "There is no kubectl create pv; copy the YAML from the docs page",
    ],
    quiz: [
      {
        q: "A 500Mi PVC binds to a 2Gi PV. What capacity does the PVC show?",
        options: ["500Mi", "1.5Gi", "2Gi", "It cannot bind"],
        answer: 2,
        why: "Binding is exclusive, so the claim receives the whole PV.",
      },
      {
        q: "Two Pods on the same node mount one RWO volume. What happens?",
        options: ["Both can use it, because RWO limits nodes, not Pods", "The second Pod stays Pending", "Both mount it read-only", "The volume is corrupted"],
        answer: 0,
        why: "ReadWriteOnce restricts the volume to one node; use RWOP for one Pod.",
      },
      {
        q: "You delete a PVC that a running Pod uses. What do you see?",
        options: ["The Pod crashes immediately", "The PV is deleted at once", "The PVC disappears and the Pod keeps writing", "The PVC stays Terminating until the Pod is gone"],
        answer: 3,
        why: "The pvc-protection finalizer holds deletion while a Pod uses the claim.",
      },
      {
        q: "A Retain PV is Released. Why does a new matching PVC not bind to it?",
        options: ["Retain PVs can never be reused", "Its claimRef still points to the old claim", "Its capacity is now zero", "The reclaim policy must be changed to Delete"],
        answer: 1,
        why: "The PV still records the deleted claim until you clear claimRef.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a hostPath PV pv-log (1Gi, RWO, class manual, path /mnt/log) and a PVC log-claim in default requesting 200Mi from class manual. Show they are bound.",
        hint: "Copy the YAML from the docs page on configuring a Pod to use a PersistentVolume.",
        solution: "# PV: capacity.storage 1Gi, accessModes [ReadWriteOnce],\n#     storageClassName manual, hostPath.path /mnt/log\n# PVC: storageClassName manual, accessModes [ReadWriteOnce],\n#      resources.requests.storage 200Mi\nkubectl apply -f pv.yaml -f pvc.yaml\nkubectl get pv,pvc",
      },
      {
        level: "medium",
        task: "Mount log-claim in a Pod at /var/log/app, write a file, delete the Pod, start a new Pod on the same node and show the file survived.",
        hint: "hostPath PVs keep data only on one node, so pin the second Pod to the same node.",
        solution: "# volumes: [{ name: d, persistentVolumeClaim: { claimName: log-claim } }]\nkubectl apply -f writer.yaml\nkubectl exec writer -- sh -c 'echo hello > /var/log/app/hi.txt'\nNODE=$(kubectl get pod writer -o jsonpath='{.spec.nodeName}')\nkubectl delete pod writer\n# reader.yaml: same volume, plus nodeName: $NODE\nkubectl apply -f reader.yaml\nkubectl exec reader -- cat /var/log/app/hi.txt",
      },
      {
        level: "hard",
        task: "A PVC db-data in namespace prod is Pending. Find out why and fix it without changing the existing PV.",
        hint: "Compare class, size, access modes and volumeMode side by side.",
        solution: "kubectl -n prod describe pvc db-data | tail -5\nkubectl -n prod get pvc db-data -o jsonpath='{.spec.storageClassName} {.spec.accessModes} {.spec.resources.requests.storage}'; echo\nkubectl get pv -o custom-columns=NAME:.metadata.name,CLASS:.spec.storageClassName,MODES:.spec.accessModes,SIZE:.spec.capacity.storage,STATUS:.status.phase\n# Example cause: PVC asks for RWX and 5Gi, PV offers RWO and 2Gi.\nkubectl -n prod get pvc db-data -o yaml > pvc.yaml\n# fix accessModes and size in pvc.yaml, remove status and uid\nkubectl -n prod delete pvc db-data && kubectl apply -f pvc.yaml",
      },
    ],
    faq: [
      { q: "Why is my PVC stuck in Pending?", a: "No PV matches its class, size and access mode, or its class uses WaitForFirstConsumer and no Pod uses it yet. kubectl describe pvc shows which." },
      { q: "Can I resize a PVC?", a: "You can grow it by editing spec.resources.requests.storage if its StorageClass has allowVolumeExpansion: true. Shrinking is not supported." },
      { q: "Does deleting a Pod delete its PVC?", a: "No. The claim and its data stay until you delete the PVC. Even then, a Retain policy keeps the PV and its data." },
    ],
  },

  "cka-storage/storageclasses": {
    plain: [
      "Creating a PV by hand for every claim is slow. In real clusters, storage is created on demand. A StorageClass is a recipe: \"fast SSD disks from this cloud, deleted when no longer needed\". When a claim names that recipe, a matching disk is made automatically.",
      "The piece that actually makes the disk is the provisioner, today almost always a CSI driver (Container Storage Interface). Each cloud and storage vendor ships its own. Kubernetes talks to all of them the same way.",
      "One class can be marked as the default. Then a claim that names no class at all still gets storage. Most managed clusters and tools like kind come with a default class already, which is why a plain PVC often just works.",
      "A StorageClass also controls when the disk is made and what happens to it later: right away or when a Pod needs it, deleted or kept after the claim is gone, and whether it can grow.",
    ],
    deepDive: [
      {
        heading: "Every field of a StorageClass",
        body: "provisioner names the driver, such as ebs.csi.aws.com, pd.csi.storage.gke.io, disk.csi.azure.com or rancher.io/local-path. parameters are passed to that driver and mean different things for each, for example a disk type like gp3. reclaimPolicy is Delete (default) or Retain and is copied into every PV the class creates. volumeBindingMode is Immediate (default) or WaitForFirstConsumer. allowVolumeExpansion lets claims grow. mountOptions and allowedTopologies fine-tune mounts and zones.\n\nThe provisioner and parameters cannot be changed after creation; you delete and recreate the class, which does not affect existing PVs. Changing a class's reclaimPolicy also does not change PVs it already made, so patch those PVs directly if needed.",
        bullets: ["kubectl get sc shows PROVISIONER, RECLAIMPOLICY, VOLUMEBINDINGMODE", "kubernetes.io/no-provisioner is for static local PVs with WaitForFirstConsumer", "kubectl get csidrivers lists installed CSI drivers"],
      },
      {
        heading: "Immediate versus WaitForFirstConsumer",
        body: "With Immediate, the disk is created as soon as the claim appears. In a cluster spread over zones, that disk might land in zone a, and then the Pod using it can only run on nodes in zone a, even if those are full. With WaitForFirstConsumer, the claim waits until the scheduler picks a node for a Pod that uses it, and the disk is made in that node's zone.\n\nWaitForFirstConsumer is the better default for zonal or local storage, and kind's local-path class uses it. Its side effect confuses people: the PVC stays Pending until a Pod exists, and that is normal. Also, a Pod that sets spec.nodeName skips the scheduler, so the delayed binding never happens; use a nodeSelector instead.",
        visual: {
          type: "compare",
          title: "When is the volume created?",
          columns: [
            { title: "Immediate", points: ["As soon as the PVC exists", "Zone picked without knowing the Pod", "Pod may be stuck in the wrong zone", "PVC Bound before any Pod"] },
            { title: "WaitForFirstConsumer", points: ["After a Pod is scheduled", "Volume made in the Pod's zone or node", "Needed for local volumes", "PVC Pending until then: normal"] },
          ],
        },
      },
      {
        heading: "How the default class is applied",
        body: "The DefaultStorageClass admission plugin fills in storageClassName for new claims that leave it out, using the class annotated storageclass.kubernetes.io/is-default-class: \"true\". If several are marked default, the most recently created one wins, which is rarely what you meant, so keep exactly one. Claims created while no default existed are updated once a default appears.\n\nTo opt out of dynamic provisioning entirely, set storageClassName: \"\" on the claim; it will then bind only to PVs without a class. To switch the default, set the annotation to \"false\" on the old class and \"true\" on the new one. The kubectl get sc output marks the default with (default) after its name.",
      },
      {
        heading: "What a CSI driver does",
        body: "A CSI driver usually runs as two parts. A controller Deployment, with sidecars such as external-provisioner and external-attacher, watches claims and calls the storage API to create, delete and attach volumes. A node DaemonSet, registered with each kubelet, mounts the volume into the Pod's folder on that node.\n\nSo when dynamic provisioning fails, look in two places: the PVC events (provisioning errors such as quota limits or bad parameters come back here) and the driver's controller Pod logs. Attach problems show up as VolumeAttachment objects and as FailedAttachVolume or FailedMount events on the Pod.",
        bullets: ["kubectl describe pvc NAME for ProvisioningFailed events", "kubectl get volumeattachments", "kubectl get pods -A | grep csi"],
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "A PVC with WaitForFirstConsumer",
        steps: [
          { label: "PVC created", detail: "Class local-path; status Pending" },
          { label: "Pod created", detail: "Uses the claim; scheduler picks node2" },
          { label: "Node chosen", detail: "Scheduler notes node2 on the PVC" },
          { label: "Provisioner creates volume", detail: "On node2, then creates the PV" },
          { label: "Bound and mounted", detail: "kubelet on node2 mounts it" },
        ],
      },
    ],
    examples: [
      {
        title: "Switching the default StorageClass",
        explanation: "A cluster has class standard as default, and the team wants fast to be the default instead. Step 1: list the classes. Step 2: remove the default flag from standard. Step 3: add it to fast. Step 4: create a claim with no class and confirm it gets fast.",
        code: {
          lang: "bash",
          code: "kubectl get sc\nkubectl patch sc standard -p \\\n  '{\"metadata\":{\"annotations\":{\"storageclass.kubernetes.io/is-default-class\":\"false\"}}}'\nkubectl patch sc fast -p \\\n  '{\"metadata\":{\"annotations\":{\"storageclass.kubernetes.io/is-default-class\":\"true\"}}}'\nkubectl get sc                 # fast (default)\nkubectl apply -f pvc-no-class.yaml\nkubectl get pvc -o custom-columns=NAME:.metadata.name,CLASS:.spec.storageClassName",
        },
      },
      {
        title: "Growing a volume that is full",
        explanation: "A database PVC of 1Gi is full. Step 1: check that its class allows expansion. Step 2: patch the claim to request 5Gi. Step 3: watch the claim's conditions; many CSI drivers resize online, while some show FileSystemResizePending until the Pod restarts. Step 4: check the new size inside the Pod.",
        code: {
          lang: "bash",
          code: "kubectl get sc fast -o jsonpath='{.allowVolumeExpansion}'; echo   # true\nkubectl patch pvc db-data -p '{\"spec\":{\"resources\":{\"requests\":{\"storage\":\"5Gi\"}}}}'\nkubectl describe pvc db-data | grep -A3 Conditions\nkubectl get pvc db-data        # CAPACITY 5Gi when done\nkubectl exec db-0 -- df -h /var/lib/postgresql/data",
        },
      },
    ],
    cheatSheet: [
      "Default class annotation: storageclass.kubernetes.io/is-default-class: \"true\"",
      "Keep exactly one default; with several, the newest one wins",
      "storageClassName: \"\" on a PVC turns off dynamic provisioning",
      "Dynamic PVs copy reclaimPolicy from the class, default Delete",
      "WaitForFirstConsumer: PVC Pending until a Pod uses it, and that is normal",
      "Do not use nodeName with WaitForFirstConsumer; use a nodeSelector",
      "Provisioner and parameters are immutable; recreate the class to change them",
    ],
    quiz: [
      {
        q: "A PVC using a WaitForFirstConsumer class has been Pending for 10 minutes and no Pod uses it. What is wrong?",
        options: ["The provisioner is broken", "Nothing; it binds when a Pod using it is scheduled", "The class has no default flag", "The PVC needs a volumeName"],
        answer: 1,
        why: "Provisioning is delayed on purpose until a consuming Pod is scheduled.",
      },
      {
        q: "What reclaim policy do dynamically provisioned PVs get if the class sets none?",
        options: ["Retain", "Recycle", "None", "Delete"],
        answer: 3,
        why: "StorageClass reclaimPolicy defaults to Delete and is copied into each PV.",
      },
      {
        q: "Which PVC setting makes sure no class, not even the default, is used?",
        options: ["storageClassName: \"\"", "Leaving storageClassName out", "storageClassName: none", "volumeBindingMode: Immediate"],
        answer: 0,
        why: "An explicit empty string disables the default and dynamic provisioning.",
      },
      {
        q: "You want to change a StorageClass's parameters.type from gp2 to gp3. How?",
        options: ["kubectl edit sc and save", "Patch every PV", "Delete the class and recreate it with the new parameters", "Set allowVolumeExpansion first"],
        answer: 2,
        why: "parameters are immutable, so the class must be recreated; existing PVs stay as they were.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "List all StorageClasses with their provisioner and binding mode, and write the name of the default class to /opt/default-sc.txt.",
        hint: "kubectl get sc marks the default; jsonpath can filter on the annotation.",
        solution: "kubectl get sc\nkubectl get sc -o jsonpath='{range .items[?(@.metadata.annotations.storageclass\\.kubernetes\\.io/is-default-class==\"true\")]}{.metadata.name}{\"\\n\"}{end}' > /opt/default-sc.txt\ncat /opt/default-sc.txt",
      },
      {
        level: "medium",
        task: "Create StorageClass slow-retain using the same provisioner as the default class, with reclaimPolicy Retain, WaitForFirstConsumer and expansion allowed. Create a 100Mi PVC named mydata from it and a Pod named user that binds it.",
        hint: "Copy the provisioner name from kubectl get sc.",
        solution: "apiVersion: storage.k8s.io/v1\nkind: StorageClass\nmetadata: { name: slow-retain }\nprovisioner: rancher.io/local-path   # use your default's provisioner\nreclaimPolicy: Retain\nvolumeBindingMode: WaitForFirstConsumer\nallowVolumeExpansion: true\n# PVC: storageClassName: slow-retain, RWO, 100Mi; then a Pod using it\n# kubectl get pvc  -> Pending until the Pod exists, then Bound\n# kubectl get pv   -> RECLAIM POLICY Retain",
      },
      {
        level: "hard",
        task: "Delete the PVC from the previous task and show that the PV and its data stay. Then make the PV reusable for a new claim.",
        hint: "Retain leaves a Released PV with a stale claimRef.",
        solution: "PV=$(kubectl get pvc mydata -o jsonpath='{.spec.volumeName}')\nkubectl delete pod user && kubectl delete pvc mydata\nkubectl get pv $PV            # STATUS Released\nkubectl patch pv $PV -p '{\"spec\":{\"claimRef\":null}}'\nkubectl get pv $PV            # STATUS Available\n# a new PVC with storageClassName: slow-retain and volumeName: $PV binds it",
      },
    ],
    faq: [
      { q: "What is dynamic provisioning in Kubernetes?", a: "It means storage is created automatically when a PVC is made, using the provisioner named in a StorageClass, instead of an admin creating each PV by hand." },
      { q: "Why do I have two default StorageClasses?", a: "Usually a tool or add-on installed its own class and marked it default. Kubernetes then uses the newest one, so set the annotation to false on the one you do not want." },
      { q: "Does changing a StorageClass affect existing volumes?", a: "No. Settings are copied when a PV is created, so existing PVs keep their original reclaim policy and parameters." },
    ],
  },
};

export default extra;

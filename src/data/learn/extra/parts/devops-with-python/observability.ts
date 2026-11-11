import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "observability/prometheus": {
    plain: [
      "Prometheus is a program that collects numbers about your systems over time. Examples are how many requests your API served, how many failed, and how long they took. Each number with a timestamp is a sample, and a list of samples over time is called a time series.",
      "Prometheus works by asking. Every few seconds it sends an HTTP request to each service it watches and reads a plain text page, usually at /metrics. This is called scraping. Your app does not need to know where Prometheus is; it only has to serve that page.",
      "In Python, the prometheus_client library builds that page for you. You create a metric object once, like a counter for requests, and update it in your code. The library keeps the current values in memory and prints them when Prometheus asks.",
      "To read the data you write queries in PromQL, the Prometheus query language. To be warned about problems, you write alert rules: a query plus a condition. When the condition stays true long enough, Prometheus sends the alert to Alertmanager, which notifies a person.",
    ],
    deepDive: [
      {
        heading: "The data model: names, labels and samples",
        body: "Every time series is identified by a metric name plus a set of labels, which are key and value pairs. http_requests_total{method=\"GET\", route=\"/orders\", status=\"200\"} and the same name with status=\"500\" are two different series. Each scrape adds one sample (a timestamp and a float value) to every series.\n\nThis makes labels powerful: you can sum, filter and group by any of them. It also makes them dangerous. Every new label value creates a new series, and Prometheus keeps recent series in memory. A label like user_id or full URL path with IDs inside can create millions of series and run the server out of memory. This is the cardinality problem.\n\nPrometheus also adds two labels itself when it scrapes: job (from the scrape config) and instance (the host and port of the target). It also records a series called up for each target: 1 if the last scrape worked, 0 if it failed.",
        bullets: [
          "Use labels for small, fixed sets: method, route template, status code",
          "Never put user IDs, emails or raw URLs in labels",
          "up == 0 is the first query to run when a target looks silent",
        ],
      },
      {
        heading: "Running Prometheus and configuring a scrape",
        body: "Prometheus is a single binary that listens on port 9090 and stores data on local disk (15 days by default, changed with --storage.tsdb.retention.time). Its main file is prometheus.yml. The global section sets scrape_interval; the built-in default is 1 minute, but 15 seconds is the common choice. Each entry in scrape_configs is a job with a list of targets.\n\nIn Docker Compose, targets are reached by service name, for example api:8000. In Kubernetes you rarely list targets by hand. Prometheus discovers Pods and Services through the Kubernetes API (kubernetes_sd_configs), or, with the Prometheus Operator, you create a ServiceMonitor object that selects Services by label.\n\nAfter starting it, open http://localhost:9090 and go to Status, then Targets. Each target shows UP or DOWN plus the last error, such as connection refused or a timeout. promtool check config prometheus.yml validates the file before you restart.",
        visual: {
          type: "flow",
          title: "From config file to stored sample",
          steps: [
            { label: "Read prometheus.yml", detail: "Jobs, targets and scrape interval" },
            { label: "Discover targets", detail: "Static list, or Kubernetes API" },
            { label: "Scrape /metrics", detail: "HTTP GET on each target, every interval" },
            { label: "Add job and instance", detail: "Labels that say where data came from" },
            { label: "Write to TSDB", detail: "Compressed blocks on local disk" },
          ],
        },
      },
      {
        heading: "Choosing the metric type",
        body: "prometheus_client offers four types. A Counter only goes up (and resets to zero when the process restarts); use it for things you count, like requests, errors or bytes sent. The library adds the _total suffix to the exposed name. A Gauge can go up and down; use it for current values like queue length, open connections or temperature.\n\nA Histogram counts observations into buckets. For a latency histogram you get one _bucket series per bucket (with an le label meaning less than or equal), plus _sum and _count. The default buckets run from 5 ms to 10 s, which fits most web APIs; pass buckets=[...] when your latencies are very different. Because buckets can be added up across Pods, histograms let you compute a p95 for the whole service.\n\nA Summary calculates quantiles inside each process. In client_python it only exposes _count and _sum, and quantiles from several Pods cannot be combined anyway, so histograms are the usual choice.",
        visual: {
          type: "compare",
          title: "Counter vs Gauge vs Histogram",
          columns: [
            { title: "Counter", points: ["Only increases", "Requests, errors, bytes", "Query with rate() or increase()"] },
            { title: "Gauge", points: ["Goes up and down", "Queue length, connections in use", "Query the value directly"] },
            { title: "Histogram", points: ["Counts values into buckets", "Latency, request size", "Query with histogram_quantile()"] },
          ],
        },
      },
      {
        heading: "How PromQL rate() really works",
        body: "A selector like http_requests_total returns an instant vector: the latest value of each matching series. Adding a range, like http_requests_total[5m], returns a range vector: all samples from the last five minutes. Functions like rate() take a range vector and return one value per series.\n\nrate() computes the per-second average increase over the window. It also handles counter resets: if the value drops (the Pod restarted), rate() treats the drop as a reset instead of a negative change. increase() is the same idea expressed as a total over the window, so increase(x[1h]) is roughly rate(x[1h]) times 3600.\n\nThe window must contain at least two samples, so a common rule is to make it at least four times the scrape interval. With 15 second scrapes, [1m] works and [5m] is smoother. Always apply rate() first and sum() after: sum(rate(x[5m])), never rate(sum(x)), because summing first hides the resets.",
        bullets: [
          "sum by (route) (...) keeps only the route label in the result",
          "=~ and !~ match labels with regular expressions, like status=~\"5..\"",
          "Check queries in the Prometheus web UI Graph tab before using them in alerts",
        ],
      },
      {
        heading: "Alert rules that page for the right reasons",
        body: "An alerting rule lives in a rules file listed under rule_files in prometheus.yml. Each rule has alert (the name), expr (a PromQL expression), for (how long it must stay true), labels (such as severity) and annotations (human text such as summary). Prometheus evaluates rules every evaluation_interval. While expr is true but for has not passed, the alert is pending; after that it is firing and is sent to Alertmanager.\n\nAlertmanager (port 9093) groups related alerts into one notification, removes duplicates, routes by labels (severity critical to the pager, warning to a chat channel) and supports silences during planned work.\n\nGood alerts describe user pain: high error ratio, high p99 latency, or the service being down. Alerting on CPU at 80% usually creates noise, because high CPU without user impact is not an emergency. Use ratios rather than raw counts, so the alert works at both quiet and busy times. Validate files with promtool check rules.",
        visual: {
          type: "cycle",
          title: "Life of an alert",
          steps: [
            { label: "Inactive", detail: "Expression returns nothing" },
            { label: "Pending", detail: "True, waiting for the for duration" },
            { label: "Firing", detail: "Sent to Alertmanager, someone is notified" },
            { label: "Resolved", detail: "Expression false again, resolve message sent" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "A typical Prometheus stack",
        layers: [
          { label: "Grafana", detail: "Dashboards built from PromQL queries" },
          { label: "Alertmanager", detail: "Groups, routes and silences alerts" },
          { label: "Prometheus server", detail: "Scrapes, stores, evaluates rules" },
          { label: "Exporters", detail: "node_exporter, kube-state-metrics, cAdvisor" },
          { label: "Your app's /metrics", detail: "Custom counters and histograms" },
        ],
      },
    ],
    examples: [
      {
        title: "Instrument a FastAPI app with a middleware",
        explanation: "Step 1: create a counter and a histogram at module level, so they exist once per process. Step 2: add an HTTP middleware that times every request. Step 3: label by the route template (like /orders/{id}), not the raw path, to keep cardinality low. Step 4: mount the prometheus_client ASGI app at /metrics. Step 5: run uvicorn, call a few endpoints and open /metrics to see the new series. Note: with several worker processes you must use client_python's multiprocess mode, or each worker reports only its own numbers.",
        code: {
          lang: "python",
          code: `import time
from fastapi import FastAPI, Request
from prometheus_client import Counter, Histogram, make_asgi_app

REQS = Counter("http_requests", "HTTP requests", ["method", "route", "status"])
LAT = Histogram("http_request_duration_seconds", "Request latency", ["route"])
app = FastAPI()
app.mount("/metrics", make_asgi_app())

@app.middleware("http")
async def metrics(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    route = getattr(request.scope.get("route"), "path", "unmatched")
    LAT.labels(route).observe(time.perf_counter() - start)
    REQS.labels(request.method, route, str(response.status_code)).inc()
    return response`,
        },
      },
      {
        title: "Scrape the app and add an error-ratio alert",
        explanation: "Step 1: in prometheus.yml set a 15 second scrape interval and add a job that targets api:8000. Step 2: list a rules file. Step 3: in the rule, divide the 5xx rate by the total rate, so the alert means more than 5% of requests are failing. Step 4: for: 10m stops short spikes from paging anyone. Step 5: run promtool check config and promtool check rules, reload Prometheus, and look at the Alerts page, where the rule shows as inactive, pending or firing.",
        code: {
          lang: "yaml",
          code: `# prometheus.yml
global:
  scrape_interval: 15s
rule_files: ["alerts.yml"]
scrape_configs:
  - job_name: api
    static_configs:
      - targets: ["api:8000"]
# alerts.yml
groups:
  - name: api
    rules:
      - alert: HighErrorRatio
        expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) > 0.05
        for: 10m
        labels: { severity: page }`,
        },
      },
    ],
    cheatSheet: [
      "Prometheus listens on 9090, Alertmanager on 9093, node_exporter on 9100",
      "up == 0 lists every target whose last scrape failed",
      "sum by (route) (rate(http_requests_total[5m])) gives requests per second per route",
      "histogram_quantile(0.95, sum by (le) (rate(x_bucket[5m]))) gives the p95 across all Pods",
      "Make rate() windows at least 4 times the scrape interval",
      "promtool check config prometheus.yml and promtool check rules alerts.yml catch mistakes",
      "Label by route template, never by user ID or raw URL",
    ],
    quiz: [
      {
        q: "Which metric type fits the number of jobs currently waiting in a queue?",
        options: ["Gauge", "Counter", "Histogram", "Summary"],
        answer: 0,
        why: "Queue length goes up and down, which is what a gauge is for.",
      },
      {
        q: "Your query is rate(sum(http_requests_total)[5m:]). What is wrong with it?",
        options: ["rate() does not accept counters", "Nothing, it is the recommended form", "Summing first hides counter resets, so rate() must come before sum()", "sum() only works on gauges"],
        answer: 2,
        why: "rate() detects resets per series; once series are summed it cannot see them.",
      },
      {
        q: "What does the for: 10m field in an alert rule do?",
        options: ["Repeats the notification every 10 minutes", "Keeps the alert pending until the condition has been true for 10 minutes", "Evaluates the rule every 10 minutes", "Deletes the alert after 10 minutes"],
        answer: 1,
        why: "The alert only moves from pending to firing after the condition holds for the whole duration.",
      },
      {
        q: "Why is user_id a bad Prometheus label?",
        options: ["Labels cannot contain numbers", "It is not allowed by prometheus_client", "Prometheus hides labels from Grafana", "Each distinct value creates a new time series, which can exhaust memory"],
        answer: 3,
        why: "High-cardinality labels multiply the number of series Prometheus must keep.",
      },
      {
        q: "A target shows as DOWN on the Targets page. What is the most likely cause?",
        options: ["Prometheus could not fetch its /metrics endpoint", "The app has no counters yet", "An alert is firing for it", "Grafana is not connected"],
        answer: 0,
        why: "DOWN means the last scrape failed, for example connection refused or a timeout.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run Prometheus in Docker so that it scrapes itself, and find the up series in the web UI.",
        hint: "The default config in the official image already scrapes localhost:9090.",
        solution: `docker run -d --name prom -p 9090:9090 prom/prometheus
# open http://localhost:9090/targets  -> job "prometheus" is UP
# in the Graph tab run:
up
# result: up{instance="localhost:9090", job="prometheus"} 1`,
      },
      {
        level: "medium",
        task: "Add a Gauge called jobs_in_queue to a Python worker that rises when a job is added and falls when it finishes, and expose it on port 8001.",
        hint: "Gauge has inc(), dec() and set(). start_http_server serves /metrics in a background thread.",
        solution: `import queue, random, time
from prometheus_client import Gauge, start_http_server

IN_QUEUE = Gauge("jobs_in_queue", "Jobs waiting to be processed")
q: queue.Queue = queue.Queue()
start_http_server(8001)
while True:
    q.put("job"); IN_QUEUE.inc()
    if random.random() < 0.4:
        q.get(); IN_QUEUE.dec()
    time.sleep(0.5)`,
      },
      {
        level: "hard",
        task: "Write an alert that fires when p99 latency of the api job is above 500 ms for 10 minutes, with a summary annotation that shows the current value.",
        hint: "Use histogram_quantile on the bucket rate, summed by le. In annotations, $value holds the result of expr.",
        solution: `groups:
  - name: latency
    rules:
      - alert: HighP99Latency
        expr: histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket{job="api"}[5m]))) > 0.5
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "p99 latency is {{ $value | humanizeDuration }}"`,
      },
    ],
    faq: [
      { q: "Can Prometheus receive pushed metrics?", a: "Prometheus is pull-based. For short batch jobs that end before they can be scraped, push to a Pushgateway, which Prometheus then scrapes; do not use it for normal services." },
      { q: "How long does Prometheus keep data?", a: "By default 15 days on local disk. For long-term or highly available storage, teams add a remote backend such as Thanos, Grafana Mimir or a managed Prometheus service." },
      { q: "What is the difference between rate() and irate()?", a: "rate() averages the increase over the whole window, which is smooth and right for alerts. irate() uses only the last two samples, so it reacts fast but is jumpy and best for zoomed-in graphs." },
      { q: "Do I need an exporter for my Python app?", a: "No. Exporters are for software you cannot change, like Linux hosts or databases. For your own code, prometheus_client exposes metrics directly." },
    ],
  },

  "observability/grafana": {
    plain: [
      "Grafana is a web app for charts. It does not store metrics itself. Instead it asks other systems, called data sources, for data and draws the answers. With Prometheus as the data source, every chart is a PromQL query.",
      "A dashboard is a page of panels. Each panel shows one thing: a line chart of requests per second, a single number for the error percentage, or a gauge for memory use. You arrange panels in rows so the most important ones are at the top.",
      "Good service dashboards answer four questions, often called the golden signals: how much traffic, how many errors, how slow (latency) and how full (saturation). If you can see those four in five seconds, the dashboard is doing its job.",
      "Dashboards are also code. Grafana saves each one as a JSON document. You can export that JSON, keep it in Git, review changes in pull requests, and load it automatically into new Grafana servers.",
    ],
    deepDive: [
      {
        heading: "Connecting Grafana to Prometheus",
        body: "Grafana listens on port 3000; a fresh install logs in as admin with password admin and asks you to change it. Under Connections, then Data sources, add Prometheus and enter its URL as seen from the Grafana server. That detail trips people up: in Docker Compose it is http://prometheus:9090 (the service name), not localhost, because localhost inside the Grafana container is Grafana itself. Save and test should report success.\n\nFor repeatable setups, skip the clicking and use provisioning. Grafana reads YAML files from /etc/grafana/provisioning/datasources/ at startup, so the data source exists every time the container starts. The same mechanism under provisioning/dashboards/ loads dashboard JSON files from a folder. In Kubernetes, the kube-prometheus-stack Helm chart does both for you and ships ready-made cluster dashboards.",
        visual: {
          type: "sequence",
          title: "What happens when a panel refreshes",
          actors: ["Browser", "Grafana", "Prometheus"],
          messages: [
            { from: 0, to: 1, label: "Load dashboard, time range last 6h" },
            { from: 1, to: 1, label: "Replace $namespace and $__rate_interval" },
            { from: 1, to: 2, label: "query_range with start, end and step" },
            { from: 2, to: 1, label: "Matrix of time series" },
            { from: 1, to: 0, label: "Data drawn as a time series panel" },
          ],
        },
      },
      {
        heading: "Latency percentiles and error rate, done right",
        body: "Latency panels should show percentiles from a histogram, usually p50, p95 and p99 as three queries on one time series panel. The query pattern is histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[$__rate_interval]))). Keeping le in the sum is required, because histogram_quantile needs the buckets. Add route to the by clause to split by endpoint.\n\nGrafana's $__rate_interval variable picks a rate() window that is safe for the current zoom level and scrape interval, so you do not need to hard-code [5m]. Set the panel unit to seconds and Grafana prints 250 ms instead of 0.25.\n\nShow errors as a percentage of traffic, not a raw count: 50 errors per second is a disaster at 100 requests per second and noise at 100,000. Use a Stat panel with thresholds (green, then yellow at 1%, red at 5%) so a glance is enough. Remember that histogram percentiles are estimates within a bucket, so choose buckets around your target latency.",
        bullets: [
          "Unit seconds (s) for latency, percent (0-100) for error ratio, requests/sec for traffic",
          "Thresholds turn a number into a traffic light",
          "Legend {{route}} shows the label value instead of the full series name",
        ],
      },
      {
        heading: "Saturation panels and dashboard variables",
        body: "Saturation means how close a resource is to its limit. In Kubernetes, CPU usage comes from cAdvisor as container_cpu_usage_seconds_total (a counter, so use rate()), memory as container_memory_working_set_bytes, and limits from kube-state-metrics as kube_pod_container_resource_limits. Dividing usage by the limit gives a 0 to 1 ratio that means the same thing for every Pod. Memory near the limit predicts an OOM kill; CPU near the limit causes throttling and higher latency. Pod restarts (kube_pod_container_status_restarts_total) and queue length are other good saturation signals.\n\nVariables make one dashboard work everywhere. A query variable such as label_values(kube_pod_info, namespace) fills a dropdown with every namespace; panels then filter with namespace=\"$namespace\". Variables can depend on each other ($pod lists only Pods in the chosen $namespace) and can allow multiple values, in which case you match with =~.",
        visual: {
          type: "tree",
          title: "Variables chain into every query",
          root: "Dashboard variables",
          children: [
            { label: "$datasource", children: ["Pick Prometheus dev or prod"] },
            { label: "$namespace", children: ["label_values(kube_pod_info, namespace)"] },
            { label: "$pod", children: ["Filtered by the chosen namespace", "Multi-value, matched with =~"] },
            { label: "Built-in", children: ["$__rate_interval", "$__range"] },
          ],
        },
      },
      {
        heading: "Dashboards as code: JSON export and provisioning",
        body: "Every dashboard is a JSON object with a uid (a stable ID used in its URL), a title, a panels array, a templating section for variables and a version number. From the dashboard's Export option you can save that JSON to a file. Choosing to export for sharing externally replaces your data source IDs with an input placeholder, so someone else can import it and pick their own Prometheus.\n\nTo keep dashboards in Git, store the JSON files in the repo and load them through a dashboard provisioning file, or through the HTTP API (POST /api/dashboards/db) from CI. Provisioned dashboards are rebuilt from the files on every start, which means edits in the UI are lost unless you export them back to the repo. In Kubernetes, kube-prometheus-stack can load dashboards from ConfigMaps that carry a grafana_dashboard label. Some teams generate the JSON from code with tools like Grafonnet (Jsonnet) to avoid hand-editing large files.",
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "Dashboard layout, top to bottom",
        layers: [
          { label: "Variables bar", detail: "Data source, namespace, route" },
          { label: "Stat row", detail: "Requests/s, error %, p99, Pods up" },
          { label: "Latency row", detail: "p50, p95, p99 per route over time" },
          { label: "Errors row", detail: "5xx rate by route and status" },
          { label: "Saturation row", detail: "CPU and memory vs limit, restarts" },
        ],
      },
    ],
    examples: [
      {
        title: "Provision the Prometheus data source with Docker Compose",
        explanation: "Step 1: create grafana/provisioning/datasources/prometheus.yml. Step 2: point url at the Prometheus service name, not localhost. Step 3: mount the folder into the Grafana container at /etc/grafana/provisioning. Step 4: docker compose up -d, open http://localhost:3000, and the data source is already there and marked as default. Step 5: in Explore, run up to confirm data flows.",
        code: {
          lang: "yaml",
          code: `# grafana/provisioning/datasources/prometheus.yml
apiVersion: 1
datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
# docker-compose.yml (part)
#  grafana:
#    image: grafana/grafana
#    ports: ["3000:3000"]
#    volumes: ["./grafana/provisioning:/etc/grafana/provisioning"]`,
        },
      },
      {
        title: "Build the four golden-signal queries for one service",
        explanation: "Step 1: create a namespace variable from label_values(kube_pod_info, namespace). Step 2: add a Traffic panel with requests per second by route. Step 3: add an Errors stat panel showing the 5xx percentage with thresholds at 1 and 5. Step 4: add a Latency panel with the p95 query (repeat with 0.5 and 0.99). Step 5: add a Saturation panel with memory working set divided by the memory limit, unit percent (0.0-1.0). Save, then export the JSON into the repo.",
        code: {
          lang: "promql",
          code: `# Traffic
sum by (route) (rate(http_requests_total{namespace="$namespace"}[$__rate_interval]))
# Errors (%)
100 * sum(rate(http_requests_total{namespace="$namespace", status=~"5.."}[$__rate_interval]))
  / sum(rate(http_requests_total{namespace="$namespace"}[$__rate_interval]))
# Latency p95
histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket{namespace="$namespace"}[$__rate_interval])))
# Saturation: memory vs limit, per Pod
sum by (pod) (container_memory_working_set_bytes{namespace="$namespace", container!=""})
  / sum by (pod) (kube_pod_container_resource_limits{namespace="$namespace", resource="memory"})`,
        },
      },
    ],
    cheatSheet: [
      "Grafana runs on port 3000; first login is admin / admin",
      "From inside Compose, the Prometheus URL is http://prometheus:9090, not localhost",
      "Use $__rate_interval instead of a fixed [5m] inside rate() in panels",
      "Keep le in sum by (le) when using histogram_quantile",
      "label_values(kube_pod_info, namespace) fills a namespace dropdown",
      "Provisioning folders: /etc/grafana/provisioning/datasources and /dashboards",
      "Put the golden signals at the top: traffic, errors, latency, saturation",
    ],
    quiz: [
      {
        q: "Grafana in Docker Compose cannot reach Prometheus at http://localhost:9090. Why?",
        options: ["Prometheus does not allow Grafana", "Port 9090 is reserved", "Inside the Grafana container, localhost is Grafana itself; use the service name", "Grafana only supports HTTPS"],
        answer: 2,
        why: "Containers reach each other by service name on the Compose network.",
      },
      {
        q: "Which panel query shows the error ratio in a way that works at any traffic level?",
        options: ["sum(http_requests_total{status=~\"5..\"})", "5xx rate divided by total request rate", "count(http_requests_total)", "max(http_request_duration_seconds_sum)"],
        answer: 1,
        why: "A ratio of rates stays meaningful whether traffic is low or high.",
      },
      {
        q: "What does a dashboard variable like $namespace give you?",
        options: ["Faster Prometheus queries", "A separate copy of the dashboard per team", "Automatic alerts", "One dashboard that can switch between namespaces or environments from a dropdown"],
        answer: 3,
        why: "Panels reuse the selected value in their queries.",
      },
      {
        q: "You edited a provisioned dashboard in the UI and restarted Grafana. What happens to your edits?",
        options: ["They are replaced by the JSON file on disk", "They are kept forever", "They are pushed to Git automatically", "Grafana refuses to start"],
        answer: 0,
        why: "Provisioned dashboards are loaded from files, so the files win; export changes back to the repo.",
      },
      {
        q: "Which signal best predicts that a Pod is about to be OOM killed?",
        options: ["High request rate", "Memory working set close to the memory limit", "A low p50 latency", "CPU usage of 10%"],
        answer: 1,
        why: "The kernel kills the container when its memory use reaches the limit.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Start Grafana and Prometheus with Docker Compose, add Prometheus as a data source in the UI, and graph up in Explore.",
        hint: "Both services must be in the same compose file so they share a network.",
        solution: `services:
  prometheus:
    image: prom/prometheus
    ports: ["9090:9090"]
  grafana:
    image: grafana/grafana
    ports: ["3000:3000"]
# docker compose up -d, open localhost:3000, log in admin/admin
# Connections > Data sources > Prometheus, URL http://prometheus:9090
# Explore > query: up`,
      },
      {
        level: "medium",
        task: "Add a time series panel that shows p50, p95 and p99 latency of your API on one chart with readable legends.",
        hint: "Three queries (A, B, C) that differ only in the quantile; set the unit to seconds and a legend per query.",
        solution: `A: histogram_quantile(0.50, sum by (le) (rate(http_request_duration_seconds_bucket[$__rate_interval])))
B: histogram_quantile(0.95, sum by (le) (rate(http_request_duration_seconds_bucket[$__rate_interval])))
C: histogram_quantile(0.99, sum by (le) (rate(http_request_duration_seconds_bucket[$__rate_interval])))
Legend: p50, p95, p99
Standard options > Unit: Time / seconds (s)`,
      },
      {
        level: "hard",
        task: "Write a Python script that downloads a dashboard's JSON by uid through the Grafana HTTP API and saves it as dashboards/UID.json (named after the uid) for Git.",
        hint: "GET /api/dashboards/uid/UID returns an object with a dashboard key. Use a service account token in the Authorization header.",
        solution: `import json, os, sys, requests

base, uid = os.environ["GRAFANA_URL"], sys.argv[1]
headers = {"Authorization": f"Bearer {os.environ['GRAFANA_TOKEN']}"}
r = requests.get(f"{base}/api/dashboards/uid/{uid}", headers=headers, timeout=10)
r.raise_for_status()
dash = r.json()["dashboard"]
dash.pop("id", None)  # id is per-server; uid is the stable key
os.makedirs("dashboards", exist_ok=True)
with open(f"dashboards/{uid}.json", "w") as f:
    json.dump(dash, f, indent=2, sort_keys=True)`,
      },
    ],
    faq: [
      { q: "Is Grafana free?", a: "Grafana OSS is open source under the AGPLv3 license and free to self-host. Grafana Labs also sells Grafana Cloud and an Enterprise edition with extra features." },
      { q: "Should I alert from Grafana or from Prometheus?", a: "Both work. Prometheus rules kept in Git next to the app are simple and reliable; Grafana alerting is handy when you want alerts across several data sources, such as metrics and logs together." },
      { q: "Why does my latency panel show No data?", a: "Usually the metric name or labels do not match, the le label was dropped from the sum, or the rate() window is shorter than two scrape intervals. Run the query in Explore and remove parts until data appears." },
    ],
  },

  "observability/logging": {
    plain: [
      "A log is a line of text your program writes when something happens: a request arrived, an order was saved, a payment failed. On one server you can read logs with a text tool. With 30 containers that move between machines and disappear when they restart, you need one central place that collects them all.",
      "Centralised logging works like this: every app writes logs to standard output, a small agent on each machine picks them up, adds labels such as app name and namespace, and sends them to a log store. You then search all logs from one web page.",
      "Logs are far easier to search when each line is structured, usually as JSON with named fields like level, message and request_id. Then you can ask for all ERROR lines for one request instead of guessing with text search.",
      "The two popular stacks are Loki with Grafana, and ELK (Elasticsearch, Logstash and Kibana). Loki is cheaper to run because it only indexes a few labels. Elasticsearch indexes the full text, which makes searches faster and more flexible but needs much more storage and memory.",
    ],
    deepDive: [
      {
        heading: "Structured logging in Python",
        body: "Python's logging module has three parts that matter: loggers (logging.getLogger(__name__)) that your code calls, handlers that decide where records go, and formatters that turn a record into text. For containers, use one StreamHandler on stdout and a JSON formatter. You can write a small formatter yourself, or use python-json-logger or structlog.\n\nKeep a stable set of fields on every line: timestamp in ISO 8601 UTC, level, logger name, message, service, and request_id. Pass details as fields, not inside the message text: log.info(\"order created\", extra={\"order_id\": 42}) produces a field you can filter on, while an f-string buries the number in a sentence.\n\nLog at the right level: DEBUG for developer detail (off in production), INFO for normal events, WARNING for something odd that recovered, ERROR for a failed operation. log.exception() inside an except block adds the traceback. Never log passwords, tokens, full card numbers or personal data; once shipped, they are hard to delete.",
        bullets: [
          "Configure logging once at startup, not in every module",
          "Uvicorn has its own loggers (uvicorn, uvicorn.access); format them too",
          "One JSON object per line, so the agent never splits a record",
        ],
      },
      {
        heading: "How container logs travel to the store",
        body: "When a container writes to stdout or stderr, the container runtime saves those lines to a file on the node. With Docker's default json-file driver, that is a file named after the container ID ending in -json.log under /var/lib/docker/containers/, and docker logs reads it. In Kubernetes, the kubelet keeps them under /var/log/pods/, with symlinks in /var/log/containers/, and kubectl logs reads them through the kubelet. The kubelet rotates these files (by default at 10 MiB, keeping 5 files), so node files are not long-term storage.\n\nA log agent runs on every node, usually as a DaemonSet in Kubernetes. It tails those files, remembers its position so a restart does not resend lines, adds metadata from the Kubernetes API (namespace, pod, container, app label) and ships batches to the store. For Loki the current agent is Grafana Alloy; Promtail is deprecated. For ELK, Filebeat or Fluent Bit are common. If the store is down, agents buffer and retry.",
        visual: {
          type: "layers",
          title: "Where one log line lives on its way",
          layers: [
            { label: "Grafana or Kibana", detail: "Search and dashboards" },
            { label: "Loki or Elasticsearch", detail: "Central store with retention" },
            { label: "Agent DaemonSet", detail: "Alloy, Fluent Bit or Filebeat adds labels" },
            { label: "Node log files", detail: "/var/log/pods, rotated by kubelet" },
            { label: "Container stdout", detail: "Your app writes one JSON line" },
          ],
        },
      },
      {
        heading: "Loki vs ELK: what gets indexed",
        body: "The big design choice is what you index. Loki groups log lines into streams by their label set, for example {app=\"api\", namespace=\"prod\"}, and indexes only those labels. The lines themselves are compressed into chunks, often in object storage like S3. A query first picks streams by label, then scans their lines. This keeps storage cheap, but a broad query over many days can be slow.\n\nElasticsearch builds an inverted index of every word in every field, like the index at the back of a book. Any full-text search is fast, and Kibana offers rich analysis, but the index can be as large as the data and the cluster needs plenty of RAM and careful tuning.\n\nFor Loki, labels must have low cardinality: app, namespace, environment, level at most. A request_id or user_id label creates a new stream per value and hurts performance badly; keep those inside the JSON line and filter with a parser at query time.",
        visual: {
          type: "compare",
          title: "Loki vs Elasticsearch",
          columns: [
            { title: "Loki", points: ["Indexes labels only", "Lines compressed in object storage", "Cheap, simple to run", "Queries narrow by label first"] },
            { title: "Elasticsearch (ELK)", points: ["Indexes every field and word", "Index can be as big as the data", "Fast full-text search", "Needs more RAM and tuning"] },
          ],
        },
      },
      {
        heading: "Querying with LogQL",
        body: "Every LogQL query starts with a stream selector in braces: {namespace=\"prod\", app=\"api\"}. Then you add a pipeline. Line filters are fast text checks: |= \"timeout\" keeps lines containing timeout, != excludes, |~ uses a regular expression. Put line filters early, because they are cheap.\n\nParsers turn the line into fields: | json for JSON logs, | logfmt for key=value logs. After parsing, label filters compare fields: | level=\"ERROR\" or | duration_ms > 500. | line_format can reshape the output for reading.\n\nLogQL can also produce metrics from logs. count_over_time({app=\"api\"} |= \"ERROR\" [5m]) counts matching lines per stream, and sum by (level) (count_over_time({app=\"api\"} | json [5m])) graphs lines per level. That lets you alert on log patterns, though counters in Prometheus are cheaper for anything you query often. In Grafana, use Explore with the Loki data source, and narrow the time range before running heavy queries.",
      },
      {
        heading: "Following one request with a request ID",
        body: "When a user reports an error, you want every log line from that one request, across every service it touched. The trick is a request ID: a unique value, usually a UUID, created at the edge and passed along.\n\nIn practice: the load balancer or the first service checks for an incoming X-Request-ID header and creates one if it is missing. A middleware stores it in a contextvars.ContextVar, which is safe with async code because each request gets its own context. A logging filter copies it into every record, so you never pass it by hand. Every outgoing HTTP call adds the same header, and the response returns it to the client, so support staff can ask the user for it.\n\nThen one LogQL query finds the story: {namespace=\"prod\"} | json | request_id=\"8f3c...\". Full distributed tracing with OpenTelemetry takes this further, using the W3C traceparent header and a trace_id you can also log, linking logs to traces.",
        visual: {
          type: "sequence",
          title: "One request ID across services",
          actors: ["Client", "API", "Orders service", "Loki"],
          messages: [
            { from: 0, to: 1, label: "POST /checkout (no ID)" },
            { from: 1, to: 1, label: "Create request_id=8f3c, log it" },
            { from: 1, to: 2, label: "Call with X-Request-ID: 8f3c" },
            { from: 2, to: 3, label: "Log ERROR with request_id 8f3c" },
            { from: 1, to: 0, label: "500 with X-Request-ID: 8f3c" },
            { from: 0, to: 3, label: "Support searches request_id=8f3c" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "LogQL pipeline, cheapest step first",
        steps: [
          { label: "Stream selector", detail: "{app=\"api\", namespace=\"prod\"}" },
          { label: "Line filter", detail: "|= \"checkout\" drops most lines fast" },
          { label: "Parser", detail: "| json turns fields into labels" },
          { label: "Label filter", detail: "| level=\"ERROR\"" },
          { label: "Format or aggregate", detail: "line_format, or count_over_time" },
        ],
      },
    ],
    examples: [
      {
        title: "Add request IDs to every log line in FastAPI",
        explanation: "Step 1: a ContextVar holds the current request ID. Step 2: a middleware reads X-Request-ID or creates a UUID, sets the ContextVar, and echoes the ID in the response. Step 3: a logging.Filter copies the value into every record, so any log call in any module gets it. Step 4: the JSON formatter prints it as a field. Now one search by request_id shows the whole request.",
        code: {
          lang: "python",
          code: `import contextvars, json, logging, sys, uuid
from fastapi import FastAPI, Request
request_id = contextvars.ContextVar("request_id", default="-")

class AddRequestId(logging.Filter):
    def filter(self, record):
        record.request_id = request_id.get(); return True

h = logging.StreamHandler(sys.stdout); h.addFilter(AddRequestId())
h.setFormatter(logging.Formatter('{"level":"%(levelname)s","msg":"%(message)s","request_id":"%(request_id)s"}'))
logging.basicConfig(level=logging.INFO, handlers=[h])
app = FastAPI()

@app.middleware("http")
async def add_id(request: Request, call_next):
    request_id.set(request.headers.get("x-request-id") or str(uuid.uuid4()))
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id.get(); return response`,
        },
      },
      {
        title: "Investigate a spike of checkout errors in Grafana",
        explanation: "Step 1: in Explore, choose the Loki data source and the last 30 minutes. Step 2: graph errors per minute to see when the spike started. Step 3: list the error lines, parsed from JSON, and read the messages. Step 4: pick one request_id from a failing line. Step 5: search all namespaces for that ID to see what the downstream services logged for the same request. Step 6: once you know the pattern, turn the count query into an alert.",
        code: {
          lang: "logql",
          code: `# 1. errors per minute for the api
sum(count_over_time({namespace="prod", app="api"} | json | level="ERROR" [1m]))
# 2. the error lines, readable
{namespace="prod", app="api"} |= "checkout" | json | level="ERROR"
  | line_format "{{.request_id}} {{.msg}}"
# 3. everything for one request, in every service
{namespace="prod"} |= "8f3c2a" | json | request_id="8f3c2a"`,
        },
      },
    ],
    cheatSheet: [
      "Log to stdout as one JSON object per line; let the platform collect it",
      "Loki listens on port 3100; Elasticsearch on 9200; Kibana on 5601",
      "Loki labels: app, namespace, env, level. Never request_id or user_id",
      "{app=\"api\"} |= \"error\" filters text; | json then parses fields",
      "count_over_time({app=\"api\"} |= \"ERROR\" [5m]) turns logs into a metric",
      "kubectl logs -l app=api --since=10m --prefix shows recent lines from all matching Pods",
      "Promtail is deprecated; ship logs to Loki with Grafana Alloy",
      "Echo X-Request-ID in responses so users can quote it to support",
    ],
    quiz: [
      {
        q: "Where should a containerised Python app write its logs?",
        options: ["A file inside the container", "Directly to the Loki database", "Standard output, collected by the platform", "Only to a remote syslog server"],
        answer: 2,
        why: "The runtime captures stdout and the node agent ships it, so the app stays simple.",
      },
      {
        q: "Why is request_id a bad Loki label?",
        options: ["Every value creates a new stream, which bloats the index", "Loki labels must be numbers", "Grafana cannot show labels", "It makes logs unreadable"],
        answer: 0,
        why: "Loki is built for few, low-cardinality labels; keep request_id in the line.",
      },
      {
        q: "In LogQL, which part should come first to keep a query fast?",
        options: ["| line_format", "| json", "| level=\"ERROR\"", "A specific stream selector such as {app=\"api\", namespace=\"prod\"}"],
        answer: 3,
        why: "The selector decides which streams are read at all; everything else filters those.",
      },
      {
        q: "What is the main trade-off of Elasticsearch compared with Loki?",
        options: ["It cannot search text", "It indexes all content, so search is flexible but storage and memory costs are higher", "It only works with Docker", "It has no web UI"],
        answer: 1,
        why: "A full inverted index makes any search fast at the price of size and RAM.",
      },
      {
        q: "Why use contextvars for the request ID in an async FastAPI app?",
        options: ["It is faster than a global variable", "It is required by logging", "Each request gets its own value, even when many requests run at once on one thread", "It encrypts the ID"],
        answer: 2,
        why: "A plain global would be overwritten by concurrent requests; a ContextVar is per task.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Change a script that uses print() so it logs JSON lines to stdout with level and message fields using python-json-logger.",
        hint: "pip install python-json-logger; use its JsonFormatter on a StreamHandler.",
        solution: `import logging, sys
from pythonjsonlogger.json import JsonFormatter

h = logging.StreamHandler(sys.stdout)
h.setFormatter(JsonFormatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
logging.basicConfig(level=logging.INFO, handlers=[h])
log = logging.getLogger("worker")
log.info("job finished", extra={"job_id": 7, "seconds": 1.4})`,
      },
      {
        level: "medium",
        task: "Write LogQL that shows, per app in the prod namespace, how many ERROR lines were logged in each 5 minute window.",
        hint: "Parse JSON, filter by level, count_over_time, then sum by app.",
        solution: `sum by (app) (
  count_over_time({namespace="prod"} | json | level="ERROR" [5m])
)`,
      },
      {
        level: "hard",
        task: "Run Loki and Grafana locally with Docker Compose and send one log line to Loki's push API from Python, then find it in Explore.",
        hint: "POST /loki/api/v1/push takes streams with labels and values of [nanosecond timestamp string, line].",
        solution: `import json, time, requests
line = json.dumps({"level": "INFO", "msg": "hello loki"})
body = {"streams": [{"stream": {"app": "demo"},
                     "values": [[str(time.time_ns()), line]]}]}
r = requests.post("http://localhost:3100/loki/api/v1/push", json=body, timeout=5)
print(r.status_code)  # 204 means accepted
# Compose: grafana/loki on 3100, grafana/grafana on 3000
# Grafana: add Loki data source http://loki:3100, Explore: {app="demo"}`,
      },
    ],
    faq: [
      { q: "Should I use Loki or ELK?", a: "If you already use Grafana and Prometheus and mainly filter by service and time, Loki is cheaper and simpler. If you need fast full-text search and rich analytics across huge volumes, ELK (or OpenSearch) fits better." },
      { q: "How long should I keep logs?", a: "It depends on cost and rules: 7 to 30 days of searchable logs is common for debugging, with older logs archived to cheap storage if audits or regulations require it." },
      { q: "What is the difference between logs, metrics and traces?", a: "Metrics are cheap numbers over time that tell you something is wrong. Logs are detailed events that tell you what happened. Traces follow one request through every service and show where the time went." },
      { q: "Why do my Python logs appear late in docker logs?", a: "Python buffers stdout when it is not a terminal. Set PYTHONUNBUFFERED=1 in the image, or use logging handlers, which flush each record." },
    ],
  },
};

export default extra;

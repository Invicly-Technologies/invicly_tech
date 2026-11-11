import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "containers/docker-basics": {
    plain: [
      "A container is a normal program running on your computer, but fenced off. It sees its own files, its own process list and its own network, so it cannot easily disturb other programs. Docker is the tool that creates these fences and starts the program inside them.",
      "The files a container starts with come from an image. An image is a frozen, read-only bundle: an operating system's basic files, the Python runtime, your libraries and your code. You can start many containers from one image, and each one gets its own private scratch space on top.",
      "That scratch space disappears when you remove the container. So anything you want to keep, like database files, must live in a volume. A volume is storage that Docker keeps outside the container, so a new container can pick up the same data.",
      "Containers talk to each other over Docker networks. If you create your own network and attach two containers to it, each can reach the other simply by its name, for example the API can connect to a database at the host name db.",
      "When something goes wrong, you mostly use three commands: docker ps to see what is running, docker logs to read what the program printed, and docker exec to open a shell inside a running container and look around.",
    ],
    deepDive: [
      {
        heading: "What a container really is: namespaces and cgroups",
        body: "A container is not a small virtual machine. There is no second kernel. It is an ordinary Linux process that the kernel has wrapped in namespaces and cgroups.\n\nNamespaces control what the process can see. The PID namespace gives it its own process list, where your app is PID 1. The mount namespace gives it its own file tree (the image). The network namespace gives it its own network interfaces and ports. Other namespaces isolate the host name, users and shared memory.\n\nCgroups (control groups) control how much the process can use: CPU, memory, number of processes. docker run --memory 512m --cpus 1 sets those limits. If the app goes over the memory limit, the kernel kills it, and docker inspect shows OOMKilled true with exit code 137.\n\nBecause containers share the host kernel, they start in well under a second and use little overhead. The trade-off is weaker isolation than a VM, which is why running as non-root matters.",
        visual: {
          type: "compare",
          title: "Container vs virtual machine",
          columns: [
            { title: "Container", points: ["Shares the host kernel", "Starts in under a second", "Isolated by namespaces and cgroups", "Image is often tens of MB"] },
            { title: "Virtual machine", points: ["Runs its own full kernel", "Boots in seconds to minutes", "Isolated by the hypervisor", "Disk image is often several GB"] },
          ],
        },
      },
      {
        heading: "The container lifecycle and what stop really does",
        body: "docker run is really two steps: docker create builds the container (its writable layer, network and settings), and docker start launches the process. A container stays in the list until you remove it, even after it exits, which is why docker ps -a shows old stopped containers. Use docker run --rm for throwaway containers so they delete themselves on exit.\n\ndocker stop sends SIGTERM to PID 1, waits 10 seconds by default, then sends SIGKILL. A well-behaved app catches SIGTERM, finishes current requests and exits cleanly with code 0 or 143. If your app ignores the signal, every stop takes the full 10 seconds and ends in a kill.\n\nA common cause: starting the app with a shell form like CMD uvicorn main:app, which makes /bin/sh PID 1, and the shell does not pass SIGTERM on. Use the JSON exec form, or add --init to run a tiny init process that forwards signals.",
        bullets: ["Exit code 0: clean exit", "Exit code 137: killed by SIGKILL, often out of memory", "Exit code 143: stopped by SIGTERM", "--restart unless-stopped restarts a crashed container automatically"],
        visual: {
          type: "flow",
          title: "From docker run to docker rm",
          steps: [
            { label: "Created", detail: "Writable layer and settings are prepared" },
            { label: "Running", detail: "PID 1 is your app" },
            { label: "Stop requested", detail: "SIGTERM, then SIGKILL after 10 s" },
            { label: "Exited", detail: "Still listed by docker ps -a, logs kept" },
            { label: "Removed", detail: "docker rm deletes the writable layer" },
          ],
        },
      },
      {
        heading: "Layers and copy-on-write",
        body: "An image is a stack of read-only layers. Each layer is a set of file changes, stored once and identified by a hash. Ten images built on python:3.12-slim share the same base layers on disk and in the registry, so only the different layers are downloaded.\n\nWhen a container starts, the storage driver (overlay2 on most Linux hosts) stacks the image layers and adds one thin writable layer on top. Reading a file finds the highest layer that has it. Changing a file copies it up into the writable layer first; this is called copy-on-write. Deleting a file only hides it with a marker, so files removed in a later Dockerfile step still take space in the image.\n\nThe build cache works on the same idea. For each instruction, Docker checks whether it has a layer made by the same instruction on the same parent; for COPY it also compares file checksums. The first changed step and every step after it are rebuilt.",
        bullets: ["docker history myapi:dev shows each layer and its size", "docker system df shows space used by images, containers and volumes", "docker image prune removes dangling images"],
      },
      {
        heading: "Volumes, bind mounts and tmpfs in practice",
        body: "Named volumes live under Docker's data folder (/var/lib/docker/volumes on Linux) and are managed with docker volume ls, inspect and rm. If you mount an empty named volume onto a folder that already has files in the image, Docker copies those files into the volume first. Bind mounts do not do this: the host folder simply hides what was there.\n\nThe newer --mount flag is more explicit than -v and fails if a bind mount source does not exist, instead of silently creating an empty folder: --mount type=bind,src=$(pwd),dst=/app. Add readonly to stop the container writing to it. A tmpfs mount keeps files in memory only, useful for scratch data that should never touch the disk.\n\nOn Docker Desktop for Mac and Windows, containers run inside a hidden Linux VM, so bind mounts cross a file-sharing layer and can be slower than named volumes. File ownership also matters: the container writes files with its own user ID, which may not match yours on the host.",
      },
      {
        heading: "Networking and published ports",
        body: "Each container gets its own IP address on a Docker network. On the default bridge network, containers can only reach each other by IP. On a user-defined network, Docker runs an embedded DNS server (at 127.0.0.11 inside the container) that answers with container names and network aliases, so db just works.\n\nPublishing a port with -p 8000:8000 makes Docker forward traffic from the host's port 8000 to the container's port 8000. The left side is the host, the right side is the container. By default it listens on all host interfaces, so the port may be reachable from your whole network; -p 127.0.0.1:8000:8000 limits it to your machine.\n\nContainers on the same network talk on the container port directly; publishing is only for traffic coming from outside Docker. Inside a container, localhost means the container itself, not your laptop and not another container.",
        visual: {
          type: "sequence",
          title: "A browser request reaching the api, which calls db",
          actors: ["Browser on host", "Docker port forward", "api container", "db container"],
          messages: [
            { from: 0, to: 1, label: "GET localhost:8000/items" },
            { from: 1, to: 2, label: "Forward to api port 8000" },
            { from: 2, to: 3, label: "Resolve db via Docker DNS, connect to 5432" },
            { from: 3, to: 2, label: "Query result" },
            { from: 2, to: 0, label: "200 OK with JSON" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Debugging a container that will not stay up",
        steps: [
          { label: "docker ps -a", detail: "Find the container and its exit status" },
          { label: "docker logs", detail: "Read the last lines it printed" },
          { label: "docker inspect", detail: "Check exit code, OOMKilled, env and mounts" },
          { label: "Run a shell", detail: "docker run -it --entrypoint sh on the image" },
          { label: "Fix and rerun", detail: "Change the command, env or image and try again" },
        ],
      },
    ],
    examples: [
      {
        title: "Find out why a container keeps exiting",
        explanation: "Your api container exits a few seconds after starting. Step 1: docker ps -a shows it as Exited (1), so it is not running. Step 2: docker logs api prints the Python traceback; here it says DATABASE_URL is not set. Step 3: docker inspect confirms the exit code and lists the environment variables, and the one you need is missing. Step 4: remove the old container and run it again with -e. If the logs had been empty, you would start a shell in the image instead and run the command by hand.",
        code: {
          lang: "bash",
          code: `docker ps -a --filter name=api
docker logs --tail 30 api
docker inspect --format '{{.State.ExitCode}} oom={{.State.OOMKilled}}' api
docker inspect --format '{{json .Config.Env}}' api
docker rm api
docker run -d --name api --network appnet -p 8000:8000 \\
  -e DATABASE_URL=postgresql://postgres:dev@db:5432/postgres myapi:dev
# logs empty? open a shell in the image and try by hand:
docker run --rm -it --entrypoint sh myapi:dev`,
        },
      },
      {
        title: "Prove that a volume keeps data after the container is gone",
        explanation: "Step 1: start Postgres with a named volume and create a table. Step 2: remove the container completely with docker rm -f. Step 3: start a brand new container with the same volume. Step 4: the table is still there, because the data lives in the volume, not in the container's writable layer. Step 5: only docker volume rm (or docker compose down -v) deletes the data.",
        code: {
          lang: "bash",
          code: `docker volume create pgdata
docker run -d --name db -e POSTGRES_PASSWORD=dev -v pgdata:/var/lib/postgresql/data postgres:16
sleep 5
docker exec db psql -U postgres -c "CREATE TABLE notes(id int);"
docker rm -f db
docker run -d --name db -e POSTGRES_PASSWORD=dev -v pgdata:/var/lib/postgresql/data postgres:16
sleep 5
docker exec db psql -U postgres -c "\\dt"     # notes is still listed
docker volume ls`,
        },
      },
    ],
    cheatSheet: [
      "docker run --rm -it python:3.12-slim bash starts a throwaway shell that deletes itself on exit",
      "docker ps -a lists stopped containers too; docker rm -f name stops and removes in one step",
      "docker logs -f --since 10m api follows only the last 10 minutes of output",
      "docker exec -it api sh opens a shell in a running container (use bash if the image has it)",
      "docker stats shows live CPU and memory use for each running container",
      "-p 127.0.0.1:8000:8000 publishes a port to your machine only, not the whole network",
      "Exit code 137 means SIGKILL; check docker inspect for OOMKilled true",
      "docker system prune removes stopped containers, unused networks and dangling images",
    ],
    quiz: [
      {
        q: "What does docker stop do by default?",
        options: ["Sends SIGKILL immediately", "Sends SIGTERM, then SIGKILL after 10 seconds", "Pauses the process with SIGSTOP", "Removes the container and its volume"],
        answer: 1,
        why: "It gives the app a 10 second grace period to shut down cleanly before killing it.",
      },
      {
        q: "Two containers are on the default bridge network. Why can't the api reach the database by the name db?",
        options: ["The default bridge network has no name-based DNS", "Port 5432 is not published", "Names only work with Compose", "The database must run as root"],
        answer: 0,
        why: "Only user-defined networks get Docker's embedded DNS for container names.",
      },
      {
        q: "A container exited with code 137 and OOMKilled true. What is the most likely fix?",
        options: ["Publish another port", "Use a bind mount instead of a volume", "Switch to the default network", "Raise the memory limit or reduce the app's memory use"],
        answer: 3,
        why: "The kernel killed the process for going over its cgroup memory limit.",
      },
      {
        q: "Inside the api container, what does localhost:5432 point to?",
        options: ["The host machine's Postgres", "The db container", "The api container itself", "The Docker registry"],
        answer: 2,
        why: "Each container has its own network namespace, so localhost is the container itself.",
      },
      {
        q: "A Dockerfile step deletes a 200 MB file that an earlier step downloaded. What happens to the image size?",
        options: ["It shrinks by 200 MB", "It grows by 200 MB more", "Docker rebuilds all layers", "It stays about the same, because the earlier layer still holds the file"],
        answer: 3,
        why: "Layers are read-only; a later delete only hides the file, so download and delete in the same RUN step.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Run nginx in the background on host port 8080, check it with curl, read its access log, then stop and remove it.",
        hint: "nginx listens on port 80 inside the container; its logs go to stdout.",
        solution: `docker run -d --name web -p 8080:80 nginx:alpine
curl -s localhost:8080 | head -n 4
docker logs web
docker rm -f web`,
      },
      {
        level: "medium",
        task: "Create a user network, start Redis on it, then use a second throwaway container to ping Redis by name.",
        hint: "The redis image includes redis-cli; use -h to pick the host.",
        solution: `docker network create appnet
docker run -d --name cache --network appnet redis:7
docker run --rm --network appnet redis:7 redis-cli -h cache ping   # PONG
docker rm -f cache && docker network rm appnet`,
      },
      {
        level: "hard",
        task: "Start a container with a 64 MB memory limit, make it use more memory than that, and confirm from docker inspect that it was OOM killed.",
        hint: "A short Python one-liner can allocate a large bytes object. Do not use --rm, so you can inspect it afterwards.",
        solution: `docker run --name hog --memory 64m python:3.12-slim \\
  python -c "x = bytearray(200 * 1024 * 1024); print('done')"
echo "exit: $?"                                    # 137
docker inspect --format '{{.State.OOMKilled}} {{.State.ExitCode}}' hog
docker rm hog`,
      },
    ],
    faq: [
      { q: "What is the difference between an image and a container?", a: "An image is a read-only template on disk. A container is a running (or stopped) instance of it, with its own writable layer, process and network settings." },
      { q: "Is Docker a virtual machine?", a: "No. On Linux, a container is an isolated process sharing the host kernel. Docker Desktop on Mac and Windows does run a small Linux VM in the background to host those containers." },
      { q: "How do I copy a file out of a container?", a: "Use docker cp container:/path/in/container ./local-path. It works on stopped containers too." },
      { q: "Why does my container exit immediately?", a: "A container lives only as long as its main process. If the command finishes or crashes, the container stops; docker logs usually shows why." },
    ],
  },

  "containers/dockerfile": {
    plain: [
      "A Dockerfile is a text file with step-by-step instructions for building an image. Each line starts with a keyword: FROM picks the starting image, COPY puts files in, RUN runs a command, and CMD says what to start when a container runs.",
      "Docker remembers the result of each step. If a step and everything before it did not change, Docker reuses the saved result instead of running it again. That is why you install your Python packages before you copy your code: code changes often, packages change rarely.",
      "A multi-stage build uses two or more FROM lines in one file. You install and compile things in the first stage, then copy only the finished result into a clean final stage. Tools you needed only for building stay behind, so the final image is smaller.",
      "Small images download faster, start faster, and contain fewer programs that could have security holes. Using a slim base image, skipping caches, and leaving out test files all help.",
      "By default, the program inside runs as root. Adding a normal user and switching to it with USER means that if someone breaks into your app, they have far fewer powers.",
    ],
    deepDive: [
      {
        heading: "The instructions you will actually use",
        body: "FROM sets the base image. WORKDIR sets the folder for later steps and creates it if needed. COPY copies files from the build context; ADD can also unpack tar files and fetch URLs, but COPY is clearer and preferred. RUN executes a command and saves the result as a layer.\n\nENV sets environment variables that stay in the image and in running containers. ARG sets build-time variables that do not exist at runtime, passed with docker build --build-arg. Never pass secrets through ARG or ENV, because they are visible in docker history and docker inspect.\n\nCMD gives the default command, and ENTRYPOINT gives the fixed program. With both, CMD becomes the default arguments to ENTRYPOINT. Arguments after the image name in docker run replace CMD only. EXPOSE documents the port but publishes nothing; you still need -p.\n\nTwo env vars are common for Python: PYTHONUNBUFFERED=1 so logs appear at once in docker logs, and PYTHONDONTWRITEBYTECODE=1 so no .pyc files are written.",
        visual: {
          type: "compare",
          title: "Shell form vs exec form",
          columns: [
            { title: "Shell form", points: ["CMD uvicorn main:app", "Runs through /bin/sh -c", "Shell is PID 1 and may not forward SIGTERM", "Variables like $PORT are expanded"] },
            { title: "Exec form", points: ["CMD [\"uvicorn\", \"main:app\"]", "Runs the program directly", "Your app is PID 1 and gets signals", "No shell, so no $VAR expansion"] },
          ],
        },
      },
      {
        heading: "Making the build cache work for you",
        body: "Docker checks each instruction in order. A RUN step is reused if the text of the command and the parent layer are the same. A COPY step is reused only if the copied files have the same checksums. Once one step misses the cache, every step after it runs again.\n\nSo order steps from least to most often changed: system packages, then requirements.txt and pip install, then your source code. Put cleanup in the same RUN as the install, for example apt-get update and apt-get install followed by rm -rf /var/lib/apt/lists/* in one line, because a later step cannot make an earlier layer smaller.\n\nBuildKit, the default builder since Docker 23, adds cache mounts. RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt keeps pip's download cache between builds without putting it in the image, so even a changed requirements file installs faster.\n\nThe build context is everything in the folder you pass to docker build. A .dockerignore with .git, .venv, __pycache__ and .env keeps it small and avoids cache misses caused by unrelated files.",
      },
      {
        heading: "Multi-stage builds step by step",
        body: "Each FROM starts a new stage, and you can name it with AS. Only the last stage becomes the image, unless you choose another with docker build --target. COPY --from=build copies files out of an earlier stage.\n\nFor Python, the usual pattern is: in the build stage, install any compilers or headers you need (for example build-essential and libpq-dev for a package that compiles C code), create a virtual environment, and pip install into it. In the final stage, start again from the slim base, install only the runtime libraries (such as libpq5), and copy the whole venv across. Because the venv lives at the same path in both stages, its scripts keep working.\n\nAn alternative is to build wheels in stage one with pip wheel -w /wheels, then pip install --no-index --find-links /wheels in the final stage. Stages that the final stage does not depend on are skipped by BuildKit, and independent stages can build in parallel.",
        visual: {
          type: "flow",
          title: "What travels between stages",
          steps: [
            { label: "Stage build", detail: "python:3.12-slim plus compilers" },
            { label: "Create /venv", detail: "pip install requirements into it" },
            { label: "Stage final", detail: "Fresh python:3.12-slim, runtime libs only" },
            { label: "COPY --from=build", detail: "Bring over /venv and nothing else" },
            { label: "COPY app code", detail: "Add source, set USER, set CMD" },
          ],
        },
      },
      {
        heading: "Choosing a base image",
        body: "The full python:3.12 image is based on Debian with many build tools and is around 1 GB. python:3.12-slim is the same Debian with most extras removed and is roughly 150 MB, which suits most web services.\n\npython:3.12-alpine is smaller still, but Alpine uses the musl C library instead of glibc. Many Python wheels are built for glibc, so pip may have to compile packages from source, which makes builds slow and sometimes fails. Small size is rarely worth that pain for Python.\n\nDistroless images contain only the runtime with no shell or package manager, which shrinks the attack surface but makes debugging harder.\n\nWhatever you choose, pin it. python:3.12-slim moves when new patch versions come out; python:3.12.7-slim-bookworm is more precise; adding @sha256 with a digest pins it exactly. Rebuild regularly anyway, so you pick up security fixes in the base. A scanner such as Trivy or docker scout lists known vulnerabilities in an image.",
        bullets: ["Debian slim: best default for Python", "Alpine: small, but musl can break or slow wheels", "Distroless: smallest attack surface, no shell"],
      },
      {
        heading: "Running as non-root and other hardening",
        body: "If you do not set USER, the process runs as root inside the container. Root in a container is limited by namespaces, but a kernel bug or a bad mount can turn it into real damage on the host. Create a user and switch to it near the end of the Dockerfile.\n\nUse a numeric ID, such as USER 10001, or make sure the user name maps to a fixed ID. Kubernetes with runAsNonRoot can only verify a numeric user. Copy code with COPY --chown so the app user owns it, but keep the code read-only if the app does not need to write.\n\nA non-root user cannot bind ports below 1024 by default, so listen on 8000 or 8080 and map ports outside. Add a HEALTHCHECK if you run plain Docker or Compose; Kubernetes ignores it and uses its own probes.\n\nKeep secrets out of layers: use RUN --mount=type=secret,id=pip_token to read a private index token during the build without saving it in the image.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "Where the bytes in a Python image come from",
        root: "Final image",
        children: [
          { label: "Base image", children: ["Debian slim files", "Python interpreter", "Usually the largest part"] },
          { label: "Runtime libraries", children: ["libpq5 for Postgres", "Only what imports need"] },
          { label: "Virtual environment", children: ["Your pip packages", "Copied from the build stage"] },
          { label: "App code", children: ["Small, changes often", "Filtered by .dockerignore"] },
          { label: "Left out on purpose", children: ["Compilers and headers", "pip cache", ".git and tests"] },
        ],
      },
    ],
    examples: [
      {
        title: "A production-style Dockerfile for a FastAPI app with Postgres",
        explanation: "The app uses psycopg built from source, which needs a C compiler and libpq headers to build but only libpq5 to run. Step 1: the build stage installs the compiler, makes a venv and installs requirements with a pip cache mount. Step 2: the final stage starts clean, installs only libpq5 and cleans apt lists in the same RUN. Step 3: it creates a user with a fixed ID, copies the venv and code, and runs uvicorn in exec form. Build it with docker build -t api:dev . and check the size with docker images.",
        code: {
          lang: "dockerfile",
          code: `# syntax=docker/dockerfile:1
FROM python:3.12-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends build-essential libpq-dev && rm -rf /var/lib/apt/lists/*
RUN python -m venv /venv
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip /venv/bin/pip install -r requirements.txt

FROM python:3.12-slim
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PATH="/venv/bin:$PATH"
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 && rm -rf /var/lib/apt/lists/*
RUN useradd --uid 10001 --create-home app
COPY --from=build /venv /venv
WORKDIR /app
COPY --chown=10001 . .
USER 10001
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`,
        },
      },
      {
        title: "Find out why every build reinstalls all packages",
        explanation: "Builds take three minutes even for a one-line change. Step 1: look at the build output; steps marked CACHED were reused, and the first one without it is where the cache broke. Step 2: you find COPY . . before pip install, so any code change invalidates the install. Step 3: move COPY requirements.txt and pip install above COPY . . Step 4: you also notice .git is in the context, so every commit changes it; add a .dockerignore. Step 5: rebuild twice and edit main.py in between; now only the final COPY runs.",
        code: {
          lang: "bash",
          code: `cat > .dockerignore <<'EOF'
.git
.venv
__pycache__
*.pyc
.env
tests/
EOF
docker build --progress=plain -t api:dev . 2>&1 | grep -E "CACHED|RUN|COPY"
echo "# tweak" >> main.py
docker build -t api:dev .        # pip install step now shows CACHED
docker history api:dev`,
        },
      },
    ],
    cheatSheet: [
      "Order: base, system packages, requirements.txt, pip install, then COPY . . last",
      "Clean apt lists in the same RUN as apt-get install, or the space stays in the image",
      "Use exec form CMD [\"uvicorn\", ...] so your app is PID 1 and receives SIGTERM",
      "ENV PYTHONUNBUFFERED=1 makes print and logging output show up in docker logs at once",
      "docker build --target build -t api:build . builds only up to the named stage",
      "RUN --mount=type=cache,target=/root/.cache/pip keeps the pip cache out of the image",
      "USER 10001 (numeric) lets Kubernetes runAsNonRoot verify the user",
      "EXPOSE only documents a port; you still publish it with -p at run time",
    ],
    quiz: [
      {
        q: "Your Dockerfile has COPY . . before RUN pip install -r requirements.txt. What happens when you edit one Python file?",
        options: ["Only the COPY step reruns", "Nothing reruns", "The COPY step and pip install both rerun", "Only the FROM step reruns"],
        answer: 2,
        why: "The COPY checksum changes, so it and every step after it miss the cache.",
      },
      {
        q: "What is the difference between ARG and ENV?",
        options: ["ARG exists only during the build; ENV also exists in running containers", "ARG is for secrets; ENV is public", "They are the same", "ENV exists only during the build"],
        answer: 0,
        why: "ARG values are build-time only, while ENV values are baked into the image config.",
      },
      {
        q: "Why is python:3.12-alpine often a poor choice for Python apps?",
        options: ["It has no Python", "It cannot run as non-root", "It is larger than slim", "Its musl libc means many wheels must be compiled from source"],
        answer: 3,
        why: "Most prebuilt wheels target glibc, so Alpine builds are slower and can fail.",
      },
      {
        q: "You run docker run api:dev python manage.py check. Which instruction does the extra command replace?",
        options: ["ENTRYPOINT", "CMD", "WORKDIR", "USER"],
        answer: 1,
        why: "Arguments after the image name replace CMD; ENTRYPOINT is changed only with --entrypoint.",
      },
      {
        q: "In a multi-stage build, how do you get the venv from the build stage into the final image?",
        options: ["It is copied automatically", "RUN cp /venv /venv", "COPY --from=build /venv /venv", "ADD build:/venv"],
        answer: 2,
        why: "COPY --from takes files from an earlier named stage.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a .dockerignore for a Python project and show that the build context got smaller.",
        hint: "BuildKit prints the context size in a line like transferring context.",
        solution: `printf ".git\\n.venv\\n__pycache__\\n*.pyc\\n.env\\n.pytest_cache\\n" > .dockerignore
docker build --progress=plain -t api:dev . 2>&1 | grep "transferring context"`,
      },
      {
        level: "medium",
        task: "Build the same app twice, once FROM python:3.12 single-stage and once with the multi-stage slim Dockerfile, and compare the sizes.",
        hint: "Use -f to choose a Dockerfile and docker images to compare.",
        solution: `docker build -f Dockerfile.single -t api:single .
docker build -f Dockerfile -t api:multi .
docker images api --format "{{.Tag}}  {{.Size}}"
# expect the multi-stage slim image to be several times smaller`,
      },
      {
        level: "hard",
        task: "Prove your image runs as non-root and stops quickly. Check the user ID, then time docker stop.",
        hint: "docker exec api id shows the user. If stop takes about 10 seconds, the app is not receiving SIGTERM.",
        solution: `docker run -d --name api -p 8000:8000 api:multi
docker exec api id                # uid=10001(app)
time docker stop api              # should be well under 10 s
# if it takes 10 s: switch CMD to exec form,
# or run with --init so signals are forwarded
docker rm api`,
      },
    ],
    faq: [
      { q: "Should I use CMD or ENTRYPOINT?", a: "Use CMD for a normal app so people can easily override the command. Use ENTRYPOINT when the image is a single tool and arguments should always go to it, often combined with CMD for default arguments." },
      { q: "Do I need a virtual environment inside a Docker image?", a: "It is not required, but a venv makes multi-stage builds easy because you copy one folder, and it keeps your packages separate from the system Python." },
      { q: "How do I make my Docker image smaller?", a: "Use a slim base, a multi-stage build, --no-cache-dir or a cache mount for pip, a .dockerignore, and clean up in the same RUN step that created the files." },
      { q: "How do I pass a secret during docker build?", a: "Use BuildKit secrets: docker build --secret id=token,src=token.txt with RUN --mount=type=secret,id=token in the Dockerfile. Never use ARG or ENV for secrets." },
    ],
  },

  "containers/compose": {
    plain: [
      "Most apps need more than one container: the API, a database, maybe a cache. Starting each with a long docker run command is tiring and easy to get wrong. Docker Compose lets you write all of them in one file and start them together.",
      "The file is called compose.yaml. Under services, you list each container: which image to use or which folder to build, which ports to open, which environment variables to set and which volumes to attach.",
      "Compose creates a private network for the project. Every service can reach the others by service name, so the API connects to the database at db:5432. You do not need to know any IP addresses.",
      "One command, docker compose up, builds what is needed and starts everything. docker compose down stops and removes the containers and the network, but keeps your named volumes and the data in them.",
      "Health checks tell Compose when a service is actually ready, not just started. With them, the API can wait until Postgres accepts connections before it starts, which avoids errors in the first seconds.",
    ],
    deepDive: [
      {
        heading: "How Compose names and connects things",
        body: "Compose groups everything under a project name, by default the name of the folder holding compose.yaml (override it with -p or the top-level name key). Containers are named project-service-1, the network is project_default and named volumes become project_pgdata. This is how two copies of the same stack can run side by side without clashing.\n\nOn the project network, each service name is a DNS name. If you scale a service with --scale worker=3, the name resolves to all its containers. Remember the port rule: containers talk to each other on the container port (db:5432), and ports: only matters for reaching a service from your host. You can drop ports: entirely for the database if only the API needs it, which is also safer.\n\nThe old version: key at the top of the file is obsolete and ignored by Docker Compose v2. The command is docker compose with a space; the old docker-compose Python tool is retired.",
        visual: {
          type: "layers",
          title: "What one compose project creates",
          layers: [
            { label: "Project myapp", detail: "Named after the folder unless set with -p" },
            { label: "Network myapp_default", detail: "DNS: api, db and cache resolve by name" },
            { label: "Containers", detail: "myapp-api-1, myapp-db-1, myapp-cache-1" },
            { label: "Volumes", detail: "myapp_pgdata keeps the database files" },
          ],
        },
      },
      {
        heading: "Environment variables: three different mechanisms",
        body: "Beginners often mix these up. First, environment: sets variables inside a container, written directly in the file. Second, env_file: loads variables into a container from a file such as api.env. Third, a file named .env next to compose.yaml is read by Compose itself to fill in ${VARIABLES} written in compose.yaml; those values are not passed into containers unless you reference them.\n\nSo POSTGRES_PASSWORD: ${DB_PASSWORD:?set DB_PASSWORD} reads DB_PASSWORD from your shell or .env and fails with a clear message if it is missing. ${TAG:-dev} uses dev as a default.\n\nRun docker compose config to print the final file with every variable filled in. It is the fastest way to see what Compose will actually do. Keep .env out of Git, and commit a .env.example that lists the names with dummy values.",
        bullets: ["environment: values written in compose.yaml", "env_file: load a file into one container", ".env: fills ${VAR} in compose.yaml itself", "docker compose config shows the final result"],
      },
      {
        heading: "Start order, health checks and restarts",
        body: "depends_on alone only controls start order: Compose starts db before api, but does not wait until Postgres is ready. Postgres takes a few seconds to initialise, so the API can crash with connection refused. Add a healthcheck to the database and use depends_on with condition: service_healthy. Other conditions are service_started (the default) and service_completed_successfully, useful for a one-off migrate service that must finish before the API starts.\n\nA healthcheck has test (the command), interval, timeout, retries and start_period, a grace time during which failures do not count. For Postgres use pg_isready -U app; for Redis, redis-cli ping.\n\nApps should still retry their database connection on start, because the database can restart later too. restart: unless-stopped brings a crashed container back up, which is handy on a small server, but in development it can hide crashes, so watch docker compose ps for restarting.",
        visual: {
          type: "sequence",
          title: "docker compose up with a healthy dependency",
          actors: ["Compose", "db", "migrate", "api"],
          messages: [
            { from: 0, to: 1, label: "Start db" },
            { from: 0, to: 1, label: "Run pg_isready every 5 s" },
            { from: 1, to: 0, label: "Healthy" },
            { from: 0, to: 2, label: "Start migrate (alembic upgrade head)" },
            { from: 2, to: 0, label: "Exited with code 0" },
            { from: 0, to: 3, label: "Start api" },
          ],
        },
      },
      {
        heading: "Development workflow: overrides, live reload and debugging",
        body: "Compose automatically merges compose.override.yaml on top of compose.yaml. A common setup keeps production-like settings in compose.yaml and puts development extras in the override: a bind mount of your source code, uvicorn --reload, and published database ports for your SQL client. You can also pick files explicitly with -f compose.yaml -f compose.prod.yaml.\n\nprofiles let you mark optional services, such as an admin tool, that start only with --profile tools. docker compose watch can sync or rebuild services when files change, as an alternative to bind mounts.\n\nFor debugging: docker compose ps shows state and health, logs -f api follows one service, exec api sh opens a shell, and run --rm api pytest starts a one-off container with the same settings. After changing a Dockerfile, use up --build, because up alone reuses the old image. down -v also deletes named volumes, so use it only when you really want a fresh database.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Which down or up command do I need?",
        columns: [
          { title: "Keep data", points: ["docker compose stop: stop, keep containers", "docker compose down: remove containers and network", "Named volumes survive both"] },
          { title: "Reset things", points: ["up --build: rebuild images first", "up --force-recreate: new containers", "down -v: also delete volumes and data"] },
        ],
      },
    ],
    examples: [
      {
        title: "A complete dev stack: API, Postgres, Redis and a migration step",
        explanation: "Step 1: db has a health check and no published port. Step 2: migrate uses the API image to run Alembic once and waits for a healthy db. Step 3: api waits for migrate to finish successfully and for Redis to start. Step 4: the password comes from .env through ${DB_PASSWORD}, and Compose stops with an error if it is missing. Step 5: run docker compose up -d --build, then docker compose ps to see every service and its health.",
        code: {
          lang: "yaml",
          code: `services:
  db:
    image: postgres:16
    environment: { POSTGRES_USER: app, POSTGRES_PASSWORD: "\${DB_PASSWORD:?set DB_PASSWORD}" }
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck: { test: ["CMD", "pg_isready", "-U", "app"], interval: 5s, retries: 10 }
  cache: { image: "redis:7" }
  migrate:
    build: .
    command: ["alembic", "upgrade", "head"]
    environment: { DATABASE_URL: "postgresql://app:\${DB_PASSWORD}@db:5432/app" }
    depends_on: { db: { condition: service_healthy } }
  api:
    build: .
    ports: ["8000:8000"]
    environment: { DATABASE_URL: "postgresql://app:\${DB_PASSWORD}@db:5432/app", REDIS_URL: "redis://cache:6379/0" }
    depends_on: { migrate: { condition: service_completed_successfully }, cache: { condition: service_started } }
volumes: { pgdata: {} }`,
        },
      },
      {
        title: "Debug an API that cannot connect to the database",
        explanation: "The api container keeps restarting. Step 1: docker compose ps shows api restarting and db healthy. Step 2: docker compose logs api shows connection refused to localhost:5432. Step 3: docker compose config shows DATABASE_URL uses localhost, which inside the api container means the api itself. Step 4: change the host to db. Step 5: test from inside the container with exec, then recreate only the api service.",
        code: {
          lang: "bash",
          code: `docker compose ps
docker compose logs --tail 20 api
docker compose config | grep DATABASE_URL       # ...@localhost:5432 is wrong
# fix compose.yaml: postgresql://app:...@db:5432/app
docker compose up -d api                        # recreates only api
docker compose exec api python -c "import socket; print(socket.gethostbyname('db'))"
docker compose logs -f api`,
        },
      },
    ],
    cheatSheet: [
      "docker compose up -d --build rebuilds images and starts everything in the background",
      "docker compose config prints the merged file with all ${VARS} filled in",
      "docker compose run --rm api pytest runs a one-off command with the service's settings",
      "Services talk on container ports (db:5432); ports: is only for access from the host",
      "depends_on condition: service_healthy waits for the health check, not just the start",
      "compose.override.yaml is merged automatically; use it for dev-only bind mounts and --reload",
      "docker compose down keeps volumes; down -v deletes them and your database data",
      ".env fills variables in compose.yaml; env_file loads variables into a container",
    ],
    quiz: [
      {
        q: "With only depends_on: [db] (no condition), what does Compose guarantee?",
        options: ["db is started before api, but may not be ready yet", "db accepts connections before api starts", "api restarts until db is ready", "Nothing about order"],
        answer: 0,
        why: "Without a condition, depends_on only orders container starts.",
      },
      {
        q: "The db service publishes 5433:5432. Which address should the api container use?",
        options: ["localhost:5433", "db:5433", "localhost:5432", "db:5432"],
        answer: 3,
        why: "Inside the network, services use the service name and the container port.",
      },
      {
        q: "What does the .env file next to compose.yaml do by default?",
        options: ["Loads variables into every container", "Fills in ${VARIABLES} used in compose.yaml", "Stores Docker Hub credentials", "Nothing unless named in env_file"],
        answer: 1,
        why: ".env is read by Compose for variable interpolation in the compose file.",
      },
      {
        q: "You changed the Dockerfile, ran docker compose up, and the old code still runs. Why?",
        options: ["Compose ignores Dockerfiles", "The volume holds old code", "up reuses the existing image; you need up --build", "The project name changed"],
        answer: 2,
        why: "Compose builds an image only when it is missing unless you ask for a rebuild.",
      },
      {
        q: "Which command removes the containers and network but keeps the database data?",
        options: ["docker compose down -v", "docker compose down", "docker system prune --volumes", "docker compose rm -v"],
        answer: 1,
        why: "Plain down keeps named volumes; -v would delete them.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a compose.yaml with Redis only, start it, and ping it from inside the container.",
        hint: "exec runs a command inside a running service container.",
        solution: `cat > compose.yaml <<'EOF'
services:
  cache:
    image: redis:7
EOF
docker compose up -d
docker compose exec cache redis-cli ping     # PONG
docker compose down`,
      },
      {
        level: "medium",
        task: "Add a health check to a Postgres service and make a second service wait for it. Show the health status in docker compose ps.",
        hint: "Use pg_isready in the test and condition: service_healthy.",
        solution: `services:
  db:
    image: postgres:16
    environment: { POSTGRES_PASSWORD: dev }
    healthcheck: { test: ["CMD", "pg_isready", "-U", "postgres"], interval: 3s, retries: 10 }
  client:
    image: postgres:16
    command: ["psql", "postgresql://postgres:dev@db:5432/postgres", "-c", "select 1"]
    depends_on: { db: { condition: service_healthy } }
# docker compose up, then docker compose ps shows db (healthy)`,
      },
      {
        level: "hard",
        task: "Create a compose.override.yaml that, in development only, bind mounts your code, runs uvicorn with --reload and publishes Postgres on 5432.",
        hint: "Compose merges the override automatically; lists like ports are combined, command is replaced.",
        solution: `services:
  api:
    volumes: ["./:/app"]
    command: ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
  db:
    ports: ["127.0.0.1:5432:5432"]
# docker compose up uses both files;
# docker compose -f compose.yaml up ignores the override`,
      },
    ],
    faq: [
      { q: "What is the difference between docker-compose and docker compose?", a: "docker-compose was the original standalone Python tool (v1), now retired. docker compose is Compose v2, a Docker CLI plugin, and it is the one to use." },
      { q: "Should my file be named docker-compose.yml or compose.yaml?", a: "compose.yaml is the preferred name today, but Compose still finds docker-compose.yml and docker-compose.yaml." },
      { q: "Can I use Docker Compose in production?", a: "For a single server with a small app, yes, many teams do. For many servers, rolling updates and self-healing across machines, use an orchestrator such as Kubernetes or ECS." },
      { q: "How do I reset my database in Compose?", a: "Run docker compose down -v to delete the named volumes, then docker compose up. This deletes all data in those volumes, so be sure first." },
    ],
  },

  "containers/registry": {
    plain: [
      "After you build an image on your laptop, the servers that run it need a way to get it. A registry is a server that stores images so others can download them. You push an image to the registry, and servers pull it from there.",
      "Popular registries are Docker Hub, GitHub Container Registry (ghcr.io) and Amazon ECR. They all speak the same protocol, so the same docker push and docker pull commands work with each. Only the login step is different.",
      "An image's full name says where it lives: registry address, repository name and tag. For example ghcr.io/acme/api:1.4.0 means the api image of the acme account on GitHub's registry, version 1.4.0. If you leave out the registry, Docker assumes Docker Hub.",
      "Tags are labels that people choose, and they can be moved to a different image later. So good teams tag every build with the git commit ID, and tag releases with a version number. Then you always know exactly which code is running.",
      "When you push, the registry only receives the layers it does not already have. That makes pushing a new version of your app fast, because the big base layers are uploaded only once.",
    ],
    deepDive: [
      {
        heading: "What is stored: manifests, layers and digests",
        body: "A registry stores three kinds of things. Blobs are the compressed layers and the image config, each named by the sha256 of its content. A manifest is a small JSON document listing which config and layer blobs make up one image. A tag is just a name in a repository that points to one manifest.\n\nThe digest of an image is the sha256 of its manifest. Because it is a content hash, it can never point to different content. Pulling api@sha256:3f1c... always gives exactly the same image, while api:1.4.0 gives whatever the tag points to right now.\n\nFor multi-platform images, the tag points to an image index (also called a manifest list) that lists one manifest per platform, such as linux/amd64 and linux/arm64. Docker picks the right one for the machine that pulls. docker buildx build --platform linux/amd64,linux/arm64 --push builds and pushes both in one step.",
        visual: {
          type: "tree",
          title: "From a tag to the bytes",
          root: "ghcr.io/acme/api:1.4.0",
          children: [
            { label: "Image index (multi-platform)", children: ["Points to one manifest per platform"] },
            { label: "Manifest linux/amd64", children: ["Its sha256 is the digest", "Lists config and layers"] },
            { label: "Config blob", children: ["CMD, ENV, user, history"] },
            { label: "Layer blobs", children: ["Compressed file changes", "Shared with other images"] },
          ],
        },
      },
      {
        heading: "A tagging scheme that works",
        body: "Give every image built by CI an immutable tag from the commit, such as sha-3f9a2c1 (a short git SHA). Deploy using that tag, or even better, the digest. When you cut a release, add semantic version tags to the same image: 1.4.0, plus moving tags 1.4 and 1 if others pull your image and want automatic patch updates.\n\nlatest is only a default name used when no tag is given. It does not mean newest, and nothing updates it unless you push it. Running latest in production makes it impossible to tell what is deployed and hard to roll back.\n\nTags must be valid: letters, digits, underscores, dots and dashes, up to 128 characters, not starting with a dot or dash. That is why a branch name like feature/login must be cleaned up before it can be a tag. Many registries can make tags immutable, so a pushed tag can never be moved to another image. ECR supports this per repository.",
        bullets: ["sha-3f9a2c1: every build, never moved", "1.4.0: a release, never moved", "1.4 and 1: optional moving tags for consumers", "latest: avoid for deployments"],
      },
      {
        heading: "Logging in to Docker Hub and GHCR",
        body: "docker login stores credentials for one registry host in ~/.docker/config.json, or in your system's credential helper if one is configured. Always use --password-stdin so the secret does not end up in your shell history.\n\nFor Docker Hub, create a personal access token in your account settings and use it as the password. Docker Hub limits how many pulls anonymous users can make, so log in on CI runners and servers too, even when you only pull public images.\n\nFor GHCR, the user name is your GitHub user name and the password is a token. In GitHub Actions, use the built-in GITHUB_TOKEN and give the job permissions: packages: write. From your laptop, use a personal access token with the write:packages scope. New GHCR packages are private by default; you can make one public, or link it to a repository so it inherits that repository's access, in the package settings.",
      },
      {
        heading: "Amazon ECR: repositories, tokens and IAM",
        body: "In ECR, each repository must exist before you push to it: aws ecr create-repository --repository-name api. The registry address is account-ID.dkr.ecr.region.amazonaws.com, one per account per region.\n\nThere is no fixed password. aws ecr get-login-password returns a token valid for 12 hours, made from your current IAM credentials, which you pipe into docker login with the user name AWS. In CI, prefer GitHub's OIDC to assume an IAM role, so no long-lived AWS keys are stored at all.\n\nThe IAM identity needs ecr:GetAuthorizationToken (on all resources) plus push actions on the repository: BatchCheckLayerAvailability, InitiateLayerUpload, UploadLayerPart, CompleteLayerUpload and PutImage. Pulling needs BatchGetImage and GetDownloadUrlForLayer.\n\nUseful repository settings: tag immutability, scan on push for vulnerability findings, and a lifecycle policy that deletes old images, for example untagged images after 14 days, so storage costs do not grow forever.",
        visual: {
          type: "flow",
          title: "First push to a new ECR repository",
          steps: [
            { label: "create-repository", detail: "Once, with immutable tags and scan on push" },
            { label: "get-login-password", detail: "12 hour token from your IAM identity" },
            { label: "docker login", detail: "User AWS, token on stdin" },
            { label: "docker tag", detail: "Full ECR URI plus sha tag" },
            { label: "docker push", detail: "Only missing layers are uploaded" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Choosing a registry",
        columns: [
          { title: "Docker Hub", points: ["Default when no host is given", "Good for public images", "Pull limits for anonymous users", "Login with an access token"] },
          { title: "GHCR", points: ["ghcr.io/owner/name", "Uses GitHub tokens and permissions", "Easy from GitHub Actions", "Private by default"] },
          { title: "Amazon ECR", points: ["Private, per account and region", "IAM controls push and pull", "12 hour login tokens", "Scanning and lifecycle rules"] },
        ],
      },
    ],
    examples: [
      {
        title: "Push a release to GHCR with commit and version tags",
        explanation: "Step 1: log in to ghcr.io with a token read from an environment variable. Step 2: build once and tag the image with the short git SHA. Step 3: add the release tags 1.4.0 and 1.4 to the same image, which costs nothing because tags are just names. Step 4: push all tags. Step 5: read back the digest and record it in your release notes or deployment file.",
        code: {
          lang: "bash",
          code: `echo "$GHCR_TOKEN" | docker login ghcr.io -u my-user --password-stdin
IMAGE=ghcr.io/acme/api
SHA=sha-$(git rev-parse --short HEAD)
docker build -t $IMAGE:$SHA .
docker tag $IMAGE:$SHA $IMAGE:1.4.0
docker tag $IMAGE:$SHA $IMAGE:1.4
docker push --all-tags $IMAGE
docker inspect --format '{{index .RepoDigests 0}}' $IMAGE:$SHA
# ghcr.io/acme/api@sha256:...`,
        },
      },
      {
        title: "Set up an ECR repository with immutable tags and automatic clean-up",
        explanation: "Step 1: create the repository with immutable tags and scan on push turned on. Step 2: write a lifecycle policy that expires untagged images 14 days after they were pushed. Step 3: apply the policy. Step 4: after pushing, list the images and check the scan findings. With immutable tags, pushing sha-3f9a2c1 a second time with different content fails, which protects what is deployed.",
        code: {
          lang: "bash",
          code: `aws ecr create-repository --repository-name api \\
  --image-tag-mutability IMMUTABLE \\
  --image-scanning-configuration scanOnPush=true
cat > policy.json <<'EOF'
{"rules":[{"rulePriority":1,"description":"expire untagged",
  "selection":{"tagStatus":"untagged","countType":"sinceImagePushed","countUnit":"days","countNumber":14},
  "action":{"type":"expire"}}]}
EOF
aws ecr put-lifecycle-policy --repository-name api --lifecycle-policy-text file://policy.json
aws ecr describe-images --repository-name api --query 'imageDetails[].imageTags'
aws ecr describe-image-scan-findings --repository-name api --image-id imageTag=sha-3f9a2c1`,
        },
      },
    ],
    cheatSheet: [
      "Full name: registry/namespace/repo:tag, e.g. ghcr.io/acme/api:1.4.0",
      "No registry host means Docker Hub, so nginx is really docker.io/library/nginx:latest",
      "Pull by digest for an exact image: docker pull ghcr.io/acme/api@sha256:...",
      "Always log in with --password-stdin so tokens stay out of shell history",
      "ECR login: aws ecr get-login-password | docker login --username AWS --password-stdin ACCOUNT.dkr.ecr.REGION.amazonaws.com",
      "GHCR in Actions: log in with GITHUB_TOKEN and set permissions: packages: write",
      "docker buildx imagetools inspect IMAGE shows the digest and platforms of a pushed image",
      "Tags are free: tag one build with sha, version and minor version, push with --all-tags",
    ],
    quiz: [
      {
        q: "What does the tag latest mean?",
        options: ["The most recently pushed image, always", "The default tag used when none is given; it moves only when someone pushes it", "The newest version by semver", "An image that can never change"],
        answer: 1,
        why: "latest is just a name; the registry does not update it automatically.",
      },
      {
        q: "Why deploy by digest instead of by tag?",
        options: ["Digests are shorter", "Tags are not supported by Kubernetes", "A digest always identifies the same content; a tag can be moved", "Digests pull faster"],
        answer: 2,
        why: "The digest is a hash of the manifest, so it cannot point to different content.",
      },
      {
        q: "docker push to a new ECR repository name fails with a repository not found error. What is missing?",
        options: ["A Docker Hub login", "A latest tag", "Scan on push", "The repository must be created first with create-repository"],
        answer: 3,
        why: "Unlike Docker Hub and GHCR, ECR does not create repositories on push by default.",
      },
      {
        q: "How long is the token from aws ecr get-login-password valid?",
        options: ["12 hours", "15 minutes", "7 days", "It never expires"],
        answer: 0,
        why: "ECR authorization tokens last 12 hours, so CI logs in on every run.",
      },
      {
        q: "You push version 1.5.0, and only your code layer changed. What does the push upload?",
        options: ["Every layer again", "Mostly the changed layers; existing ones are skipped", "Only the tag, never layers", "The whole image as one file"],
        answer: 1,
        why: "The registry already has the shared layers, so Docker skips them.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Pull python:3.12-slim, print its full repository digest, then pull it again by that digest.",
        hint: "RepoDigests in docker inspect holds the name@sha256 form.",
        solution: `docker pull python:3.12-slim
DIGEST=$(docker inspect --format '{{index .RepoDigests 0}}' python:3.12-slim)
echo "$DIGEST"
docker pull "$DIGEST"`,
      },
      {
        level: "medium",
        task: "Write a shell snippet that turns any branch name into a valid image tag, then tags and pushes an image with it and with the short SHA.",
        hint: "Replace characters that are not letters, digits, dot, underscore or dash, and cut it to 128 characters.",
        solution: `BRANCH=$(git rev-parse --abbrev-ref HEAD)
SAFE=$(echo "$BRANCH" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9._-]/-/g' | cut -c1-128)
IMAGE=ghcr.io/acme/api
docker tag api:dev $IMAGE:$SAFE
docker tag api:dev $IMAGE:sha-$(git rev-parse --short HEAD)
docker push --all-tags $IMAGE`,
      },
      {
        level: "hard",
        task: "Build a multi-platform image for linux/amd64 and linux/arm64, push it to ECR, and confirm both platforms are in the pushed index.",
        hint: "buildx needs --push for multi-platform output; imagetools inspect lists the platforms.",
        solution: `REG=123456789012.dkr.ecr.us-east-1.amazonaws.com
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $REG
docker buildx create --use --name multi
docker buildx build --platform linux/amd64,linux/arm64 \\
  -t $REG/api:sha-$(git rev-parse --short HEAD) --push .
docker buildx imagetools inspect $REG/api:sha-$(git rev-parse --short HEAD)
# shows a manifest for linux/amd64 and one for linux/arm64`,
      },
    ],
    faq: [
      { q: "Is GHCR free?", a: "Public images on GHCR are free. Private images use your account's GitHub Packages storage and transfer allowance, which depends on your plan." },
      { q: "How do I delete old images from ECR automatically?", a: "Add a lifecycle policy to the repository, for example to expire untagged images after 14 days or keep only the last 50 tagged images." },
      { q: "What does denied: requested access to the resource is denied mean on push?", a: "You are not logged in to that registry, your token lacks write permission, or the repository name does not match your account or organisation. Check the image name and run docker login again." },
      { q: "Can I move an image from one registry to another without rebuilding?", a: "Yes. Pull, retag and push it, or use docker buildx imagetools create, crane copy or skopeo copy, which copy it registry to registry without changing the digest." },
    ],
  },
};

export default extra;

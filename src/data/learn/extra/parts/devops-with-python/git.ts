import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "git/git-basics": {
    plain: [
      "Git is a tool that remembers every saved version of your project. Each saved version is called a commit. If something breaks, you can see exactly what changed, who changed it and why, and go back. In DevOps, Git holds not only app code but also Dockerfiles, pipelines and infrastructure files.",
      "Saving takes two steps. First you choose which changes to include with git add; this is called staging. Then git commit saves those staged changes with a short message. The two steps let you save one tidy change at a time, even if you edited many files.",
      "A branch is a separate line of work. You create one for each feature or fix, so the main branch stays stable while you experiment. When the work is ready, you merge the branch back into main.",
      "On GitHub, merging usually goes through a pull request (PR): a page that shows your changes, runs automatic checks, and lets teammates comment and approve. It is the team's safety net and the place where knowledge is shared.",
    ],
    deepDive: [
      {
        heading: "What a commit and a branch really are",
        body: "A commit is not a diff. It is a snapshot of the whole project, stored efficiently: files that did not change are not stored again, the commit just points to the same content as before. Each commit also records its author, date, message and the commit before it (its parent). Git names it by a hash of all that content, the long hex ID you see in git log. Change anything and you get a different ID.\n\nA branch is just a small file holding one commit ID, stored under .git/refs/heads/. Creating a branch writes one tiny file, which is why branches in Git are instant and cheap. When you commit, Git moves the current branch forward to the new commit. HEAD is a pointer to the branch you are on right now.",
        visual: {
          type: "layers",
          title: "From a branch name down to your file contents",
          layers: [
            { label: "HEAD", detail: "Points to the branch you are on" },
            { label: "Branch main", detail: "A file holding one commit ID" },
            { label: "Commit", detail: "Author, message, parent, top tree" },
            { label: "Tree", detail: "A folder listing: names to blobs and subtrees" },
            { label: "Blob", detail: "One file's contents, stored once" },
          ],
        },
      },
      {
        heading: "The three places your changes live",
        body: "Every change sits in one of three places. The working tree is the files you see and edit. The staging area (also called the index) holds what will go into the next commit. The repository holds the commits themselves. git diff compares the working tree with the staging area, and git diff --staged compares the staging area with the last commit, so together they show exactly what you are about to save.\n\ngit add -p lets you stage part of a file, hunk by hunk, which is how you split a messy afternoon of edits into clean commits. git restore file throws away unstaged edits to a file, and git restore --staged file takes it back out of the staging area without losing the edits.\n\nCommits are local until you push. git push sends them to the remote (usually called origin), and git fetch or git pull bring other people's commits down.",
        visual: {
          type: "flow",
          title: "Where a change travels",
          steps: [
            { label: "Working tree", detail: "You edit files" },
            { label: "git add", detail: "Copy the change into the staging area" },
            { label: "git commit", detail: "Save a snapshot in your local repo" },
            { label: "git push", detail: "Send commits to origin on GitHub" },
          ],
        },
      },
      {
        heading: "Writing commits people can use",
        body: "A good commit holds one logical change: one fix, one feature step, one refactor. That makes it easy to review, easy to revert, and easy to find later with git log or git bisect.\n\nThe message has a short subject line, about 50 characters, written as a command: \"Add retry to S3 upload\", not \"added stuff\". If the change needs explaining, leave a blank line and write a body that says why, wrapped at about 72 characters. The diff already shows what changed; only the message can explain the reason.\n\nSome teams use Conventional Commits, with prefixes like feat:, fix: and docs:, so tools can build changelogs. On GitHub, writing Fixes #123 in a commit or PR description closes issue 123 when the change is merged into the default branch.\n\nBefore pushing, you can still polish: git commit --amend changes the last commit. After pushing to a shared branch, do not rewrite history; add a new commit instead.",
        bullets: ["Subject: imperative, about 50 characters, no full stop", "Body: why the change was needed, not a list of files", "Never commit secrets: add .env to .gitignore first"],
      },
      {
        heading: "How merging works, and what a conflict is",
        body: "When you merge a feature branch into main, Git finds their common ancestor, the last commit both share. If main has not moved since you branched, Git just slides main forward to your latest commit. This is a fast-forward, and no new commit is created. If both sides have new commits, Git does a three-way merge: it compares each side with the ancestor and combines the changes into a new merge commit with two parents.\n\nA conflict happens only when both sides changed the same lines (or one side deleted a file the other edited). Git stops and marks the spot in the file: the lines between the <<<<<<< and ======= markers are yours, the lines up to >>>>>>> are theirs. You edit the file into the final version, delete the markers, git add it and commit. git merge --abort cancels the whole merge and puts everything back.",
        bullets: ["git log --oneline --graph --all draws how branches split and join", "git status lists every conflicted file as both modified", "Pull main into long branches often, so conflicts stay small"],
      },
      {
        heading: "Pull requests, reviews and merge options",
        body: "A pull request asks to merge one branch into another. GitHub shows the diff, runs your CI checks on it, and collects comments. Teams usually protect main with rules: changes must come through a PR, at least one approval is needed, and checks must pass.\n\nAs an author, keep PRs small (a few hundred lines at most is a common guide), write what changed and how to test it, and open a draft PR early if you want feedback. As a reviewer, run the code when it matters: gh pr checkout 42 fetches the branch locally. Ask questions instead of giving orders, separate must-fix issues from small suggestions, and approve when it is good enough, not perfect.\n\nGitHub offers three merge buttons: a merge commit keeps every commit plus a merge commit, squash and merge turns the whole PR into one commit on main, and rebase and merge replays the commits onto main without a merge commit.",
        visual: {
          type: "compare",
          title: "GitHub's three merge buttons",
          columns: [
            { title: "Create a merge commit", points: ["Keeps every branch commit", "Adds a merge commit with two parents", "Full history, but noisier"] },
            { title: "Squash and merge", points: ["Whole PR becomes one commit", "Clean, linear main", "Small branch commits are lost"] },
            { title: "Rebase and merge", points: ["Replays each commit onto main", "Linear, keeps every commit", "Commit IDs change"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "One pull request from push to merge",
        actors: ["Author", "GitHub", "CI", "Reviewer"],
        messages: [
          { from: 0, to: 1, label: "Push branch, open PR" },
          { from: 1, to: 2, label: "Run tests and lint on the PR" },
          { from: 2, to: 1, label: "Checks passed" },
          { from: 1, to: 3, label: "Review requested" },
          { from: 3, to: 1, label: "Comment: please add a test" },
          { from: 0, to: 1, label: "Push a new commit with the test" },
          { from: 3, to: 1, label: "Approve" },
          { from: 0, to: 1, label: "Squash and merge, delete branch" },
        ],
      },
    ],
    examples: [
      {
        title: "Resolve a simple merge conflict",
        explanation: "You changed the port in app/config.py on your branch, and a teammate changed the same line on main. Step 1: merge main into your branch; Git reports a conflict. Step 2: git status lists the conflicted file. Step 3: open it and you see both versions between markers. Step 4: keep the line you want (or combine both), delete the three marker lines. Step 5: git add marks it resolved, git commit finishes the merge, and you push. Run the tests before pushing.",
        code: {
          lang: "bash",
          code: `git switch feature/port
git fetch origin && git merge origin/main
# CONFLICT (content): Merge conflict in app/config.py
git status                      # both modified: app/config.py
# the file now shows:
# <<<<<<< HEAD
# PORT = 8080
# =======
# PORT = 8000
# >>>>>>> origin/main
# edit it to the final line, delete the markers, then:
git add app/config.py
git commit --no-edit            # finishes the merge
git push`,
        },
      },
      {
        title: "Fix mistakes before and after pushing",
        explanation: "Step 1: you forgot a test file in your last commit, which is not pushed yet, so amend it. Step 2: you staged .env by accident; unstage it and add it to .gitignore. Step 3: you want to redo the last commit completely; reset --soft removes the commit but keeps the changes staged. Step 4: a bad commit already reached shared main; do not rewrite history there, revert it, which adds a new commit that undoes the old one.",
        code: {
          lang: "bash",
          code: `git add tests/test_upload.py
git commit --amend --no-edit       # add it to the last, unpushed commit
git restore --staged .env          # unstage a file added by mistake
echo ".env" >> .gitignore
git reset --soft HEAD~1            # undo the last commit, keep changes staged
git revert a1b2c3d                 # on shared main: a new commit that undoes a1b2c3d
git log --oneline --graph -10`,
        },
      },
    ],
    cheatSheet: [
      "Run git status and git diff --staged before every commit to see what you are saving",
      "git add -p stages part of a file, one hunk at a time",
      "git switch -c name creates a new branch and switches to it",
      "git restore file discards local edits; git restore --staged file unstages it",
      "git log --oneline --graph --all draws the branch history in the terminal",
      "git merge --abort leaves a conflicted merge and restores the state before it",
      "After a rebase, git push --force-with-lease is the safer way to force push",
      "Fixes #123 in a PR description closes the issue when merged into the default branch",
    ],
    quiz: [
      {
        q: "What does a Git branch actually store?",
        options: ["A full copy of the project files", "A list of diffs since main", "A pointer to one commit", "A zip file of the history"],
        answer: 2,
        why: "A branch is a small file holding a commit ID, which is why branches are cheap.",
      },
      {
        q: "Which command shows the changes you have staged but not yet committed?",
        options: ["git diff --staged", "git diff", "git log -p", "git status -s"],
        answer: 0,
        why: "git diff --staged compares the staging area with the last commit.",
      },
      {
        q: "You merge a feature branch into main, and main has no new commits since the branch was created. What does Git do by default?",
        options: ["Creates a merge commit", "Refuses the merge", "Squashes all commits into one", "Fast-forwards main to the feature branch's latest commit"],
        answer: 3,
        why: "With nothing new on main, Git simply moves the main pointer forward.",
      },
      {
        q: "A bad commit is already on the shared main branch. What is the safe way to undo it?",
        options: ["git reset --hard HEAD~1, then force push", "git revert followed by that commit's ID", "Delete main and recreate it", "git commit --amend"],
        answer: 1,
        why: "revert adds a new commit and does not rewrite history that others already have.",
      },
      {
        q: "Which is the best commit subject line?",
        options: ["fixed stuff", "WIP", "Add retry to S3 upload", "Changes to upload.py on Tuesday"],
        answer: 2,
        why: "It is short, imperative and says what the commit does.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a new repository, make two commits that change the same file, then show the history and the difference between the two commits.",
        hint: "git log --oneline gives short IDs; git diff takes two commit IDs, or HEAD~1 HEAD.",
        solution: `mkdir demo && cd demo && git init
echo "hello" > notes.txt
git add notes.txt && git commit -m "Add notes"
echo "world" >> notes.txt
git commit -am "Extend notes"
git log --oneline
git diff HEAD~1 HEAD`,
      },
      {
        level: "medium",
        task: "Create a conflict on purpose: two branches change the same line of one file. Merge them, resolve the conflict, and show the merge commit in the graph.",
        hint: "Commit on main, switch -c to a branch, change the line, switch back, change it differently, then merge.",
        solution: `echo "port=8000" > app.cfg && git add app.cfg && git commit -m "Add config"
git switch -c change-port
sed -i 's/8000/8080/' app.cfg && git commit -am "Use port 8080"
git switch main
sed -i 's/8000/9000/' app.cfg && git commit -am "Use port 9000"
git merge change-port            # CONFLICT
echo "port=8080" > app.cfg       # pick the final value
git add app.cfg && git commit --no-edit
git log --oneline --graph --all`,
      },
      {
        level: "hard",
        task: "Your feature branch is far behind main. Rebase it onto the latest origin/main, resolve a conflict during the rebase, run the tests, and update the remote branch safely.",
        hint: "During a rebase you fix, git add, then git rebase --continue. Rebasing changes commit IDs, so the push must be forced.",
        solution: `git fetch origin
git switch feature/health-check
git rebase origin/main
# conflict: edit the files, then
git add app/health.py
git rebase --continue            # repeat for each conflicting commit
pytest -q
git push --force-with-lease      # refuses if someone else pushed meanwhile
# give up instead at any point with: git rebase --abort`,
      },
    ],
    faq: [
      { q: "What is the difference between git fetch and git pull?", a: "git fetch downloads new commits from the remote but changes none of your branches. git pull is a fetch followed by a merge (or a rebase, if configured) into your current branch." },
      { q: "Should I merge or rebase?", a: "Both combine work. Rebase gives a cleaner, linear history but rewrites commit IDs, so only rebase branches that nobody else is working on. When in doubt, merge." },
      { q: "I committed a password. Is deleting it in a new commit enough?", a: "No, it is still in the history. Treat the secret as leaked and rotate it first, then remove it from history with a tool like git filter-repo if needed." },
      { q: "What is the difference between Git and GitHub?", a: "Git is the version control tool that runs on your machine. GitHub is a hosting service for Git repositories that adds pull requests, reviews, issues and CI." },
    ],
  },
};

export default extra;

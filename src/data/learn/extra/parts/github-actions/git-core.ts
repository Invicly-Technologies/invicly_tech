import type { ExtraMap } from "../../types";

const extra: ExtraMap = {
  "git-core/git-model": {
    plain: [
      "Git is a small database that lives in a hidden folder called .git inside your project. When you commit, Git does not save a list of changes. It saves a full snapshot of every file at that moment. To keep this cheap, files that did not change are not copied again; the new snapshot simply points to the old copy.",
      "Everything in that database is an object with a name made from its content. Git runs the content through a hash function (a formula that turns any data into a fixed-length code, like a fingerprint). Same content, same fingerprint. Different content, different fingerprint. This is why a commit ID looks like 4f2a9c1e... and why two identical files are stored only once.",
      "There are three main object types. A blob holds the contents of one file. A tree is a folder listing that maps names to blobs and other trees. A commit points to one tree (the whole project) plus its parent commit, the author and the message. Follow the parents and you walk back through history.",
      "Branches and HEAD are not objects at all. A branch is a tiny text file that holds one commit ID. HEAD is a file that says which branch you are on. When you commit, Git writes the new objects and then moves the branch to point at the new commit. That is all a branch ever does.",
    ],
    deepDive: [
      {
        heading: "How an object gets its name",
        body: "Git builds a short header, the object type, a space, the size in bytes and a zero byte, puts it in front of the content, and hashes the result with SHA-1. The 40 hex characters you see are that hash. The object is then compressed with zlib and stored in .git/objects, in a folder named after the first two characters, with the other 38 as the file name.\n\nBecause the name comes from the content, objects can never change. Edit one byte and you get a different object with a different name. A commit contains its tree hash and its parent hash, so changing anything in the past changes every commit after it. That is what makes Git history tamper-evident. Newer Git versions can also create SHA-256 repositories with git init --object-format=sha256, but most hosting still uses SHA-1.",
        bullets: [
          "echo hello | git hash-object --stdin prints ce013625030ba8dba906f756967f9e9ca394464a",
          "The same content always gives the same hash, on any machine",
          "git cat-file -s HASH prints the size of an object",
        ],
      },
      {
        heading: "The staging area is a real file",
        body: "Between your working folder and the object database sits the index, a binary file at .git/index. It lists every tracked path with the blob hash and file mode that will go into the next commit. git add does two things: it writes a blob for the file's current content and updates that path's entry in the index.\n\ngit commit then turns the index into tree objects (one per folder), writes a commit that points to the top tree and the current commit as parent, and moves the branch. This is why you can stage only part of your changes: the index is a draft of the next snapshot, separate from both your files and the last commit.",
        visual: {
          type: "flow",
          title: "What git add and git commit write",
          steps: [
            { label: "Edit a file", detail: "Only your working folder changes" },
            { label: "git add", detail: "Writes a blob and updates .git/index" },
            { label: "git commit", detail: "Turns the index into tree objects" },
            { label: "New commit object", detail: "Points to the top tree and the parent" },
            { label: "Branch moves", detail: "refs/heads/main now holds the new hash" },
          ],
        },
      },
      {
        heading: "Loose objects, packfiles and garbage collection",
        body: "New objects are first written as loose objects, one compressed file each. That is simple but wasteful when a big file changes a little in every commit. From time to time Git runs garbage collection (git gc, often started automatically) which packs objects into a packfile. Inside a pack, Git stores similar objects as deltas, meaning one full copy plus small differences.\n\nSo Git is snapshot-based in its model but delta-compressed on disk. Objects that nothing points to any more (for example after you amend a commit) are not deleted at once. They stay reachable through the reflog for weeks and are only pruned after they expire, which is why mistakes are usually recoverable.",
        bullets: [
          "git count-objects -vH shows loose and packed object counts and sizes",
          "Packfiles live in .git/objects/pack",
          "git fsck checks every object for corruption",
        ],
      },
      {
        heading: "Refs, symbolic refs and detached HEAD",
        body: "A ref is a name for a commit. Local branches live under refs/heads, remote-tracking branches like origin/main under refs/remotes, and tags under refs/tags. Many refs may be packed into one file, .git/packed-refs, so do not be surprised if a branch file seems missing. Use git rev-parse main to resolve any name to its hash.\n\nHEAD is usually a symbolic ref: its content is ref: refs/heads/main. When you check out a tag or a commit hash directly, HEAD holds a hash instead. That is detached HEAD. You can look around and even commit, but no branch moves, so new commits are only remembered by HEAD itself. Run git switch -c new-name to give them a branch before you leave.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "One commit, unpacked",
        root: "commit 9fceb02",
        children: [
          { label: "tree a1b2c3 (project root)", children: ["blob: README.md", "blob: app.py", "tree: tests/"] },
          { label: "parent 4f2a9c1", children: ["The previous commit", "Its own tree and parent"] },
          { label: "author and committer", children: ["Name, email, timestamp"] },
          { label: "message", children: ["Add health check"] },
        ],
      },
      {
        type: "compare",
        title: "Porcelain vs plumbing commands",
        columns: [
          { title: "Porcelain (daily use)", points: ["git add, commit, log", "Friendly output", "Output may change between versions", "Made for people"] },
          { title: "Plumbing (low level)", points: ["hash-object, cat-file, write-tree", "Raw, stable output", "Safe to use in scripts", "Shows how Git really works"] },
        ],
      },
    ],
    examples: [
      {
        title: "Build a commit by hand with plumbing commands",
        explanation: "To prove that a commit is just objects plus a moving pointer, make one without git add or git commit. Step 1: write a blob from a file. Step 2: put it in the index. Step 3: turn the index into a tree. Step 4: make a commit object that points to that tree. Step 5: move the current branch to the new commit. git log now shows a normal commit. You need user.name and user.email set for commit-tree to work.",
        code: {
          lang: "bash",
          code: "git init demo && cd demo\necho \"hello\" > a.txt\ngit hash-object -w a.txt          # ce01362... the blob\ngit update-index --add a.txt      # stage it in .git/index\ntree=$(git write-tree)            # tree object from the index\ncommit=$(echo \"first\" | git commit-tree \"$tree\")\ngit update-ref HEAD \"$commit\"     # move the current branch\ngit log --oneline                 # shows: <hash> first",
        },
      },
      {
        title: "Why a renamed file costs almost nothing",
        explanation: "You rename config.yml to settings.yml and commit. Step 1: Git hashes the content, which did not change, so the blob hash is identical. Step 2: the new tree lists the name settings.yml pointing at that same blob. Step 3: the only new objects are one tree and one commit. Git does not record renames at all; git log --follow and git diff -M detect them later by noticing that a blob disappeared under one name and appeared under another.",
        code: {
          lang: "bash",
          code: "git mv config.yml settings.yml\ngit commit -m \"Rename config\"\ngit rev-parse HEAD~1:config.yml   # same hash...\ngit rev-parse HEAD:settings.yml   # ...as this one\ngit show --stat -M HEAD           # reported as a rename",
        },
      },
    ],
    cheatSheet: [
      "git cat-file -t HASH prints the object type; -p pretty-prints its content",
      "git rev-parse HEAD turns any name (branch, tag, HEAD~2) into a full hash",
      "git ls-tree -r HEAD lists every file in the current snapshot with its blob hash",
      "git ls-files -s shows what the index (staging area) holds right now",
      "Objects live in .git/objects; branches in .git/refs/heads or .git/packed-refs",
      "HEAD containing ref: refs/heads/x means on branch x; a bare hash means detached",
      "git switch -c rescue saves commits made in detached HEAD",
      "git count-objects -vH shows how big the object database is",
    ],
    quiz: [
      {
        q: "What does a blob object store?",
        options: ["The file name and its contents", "Only the file contents", "A diff against the previous version", "The folder that holds the file"],
        answer: 1,
        why: "Names live in tree objects; a blob holds just the bytes, so identical files share one blob.",
      },
      {
        q: "You change one old commit's message. What happens to the commits after it?",
        options: ["Nothing, only that commit changes", "They are deleted", "Git asks you to merge them", "They all get new hashes because each one includes its parent's hash"],
        answer: 3,
        why: "A commit's hash covers its parent hash, so a change ripples forward through every child.",
      },
      {
        q: "What does git add actually do?",
        options: ["Writes a blob and updates the file's entry in the index", "Creates a commit", "Uploads the file to the remote", "Moves the branch pointer"],
        answer: 0,
        why: "Staging stores the content as a blob and records it in .git/index for the next commit.",
      },
      {
        q: "You are in detached HEAD and make two commits, then switch to main. Where are those commits?",
        options: ["Merged into main automatically", "Deleted immediately", "Still in the object database, reachable through the reflog", "Moved to a branch called detached"],
        answer: 2,
        why: "No branch points to them, but the reflog remembers them until they expire.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "In any repo, find the hash of the tree for your latest commit and list the files in it using only cat-file.",
        hint: "The first line of git cat-file -p HEAD is the tree.",
        solution: "git cat-file -p HEAD | head -1     # tree <hash>\ngit cat-file -p HEAD^{tree}        # lists blobs and trees\n# or in one step:\ngit cat-file -p $(git rev-parse HEAD^{tree})",
      },
      {
        level: "medium",
        task: "Show that two files with identical content are stored as one blob, even in different folders.",
        hint: "Create both files, commit, then compare the hashes with git ls-tree -r.",
        solution: "mkdir -p a b\necho \"same\" > a/x.txt\necho \"same\" > b/y.txt\ngit add a b && git commit -m \"dupes\"\ngit ls-tree -r HEAD | grep -E 'x.txt|y.txt'\n# both lines show the same blob hash",
      },
      {
        level: "hard",
        task: "Make a commit in detached HEAD, switch back to main, then recover the commit onto a new branch without knowing its hash in advance.",
        hint: "HEAD's reflog records every place it has been, including the detached commit.",
        solution: "git switch --detach HEAD\necho try > try.txt && git add try.txt && git commit -m \"experiment\"\ngit switch main                  # Git warns you are leaving a commit\ngit reflog -5                    # find: commit: experiment\ngit branch experiment HEAD@{1}   # use the entry shown for it\ngit log --oneline -1 experiment",
      },
    ],
    faq: [
      { q: "Does Git store diffs or full copies of files?", a: "In its model, every commit is a full snapshot. On disk, packfiles compress similar objects as deltas, so you get the simplicity of snapshots with the size of diffs." },
      { q: "Is SHA-1 in Git still safe?", a: "Git uses a hardened SHA-1 that detects the known collision attack, and it supports SHA-256 repositories. For everyday use the hash is about integrity, and signed commits or tags add proof of who made them." },
      { q: "What is the difference between HEAD, HEAD~1 and HEAD^?", a: "HEAD is your current commit. HEAD~1 and HEAD^ both mean its first parent; they differ only on merge commits, where HEAD^2 means the second parent and HEAD~2 means the grandparent." },
      { q: "Can I just copy the .git folder to back up a repo?", a: "Yes, it holds the whole history. git clone --mirror or git bundle create are cleaner ways to make a portable copy." },
    ],
  },

  "git-core/git-branch": {
    plain: [
      "A branch is a separate line of work. You create one, make commits on it, and main stays untouched until you decide to bring the work back. Because a branch is only a pointer to a commit, making one is instant, even in a huge project. Teams create a new branch for every feature or fix.",
      "Merging brings the work back. Git looks at three commits: the tip of main, the tip of your branch, and the last commit they shared (called the merge base). It works out what each side changed since that shared point and combines the two sets of changes.",
      "If main has not moved since you branched, there is nothing to combine. Git just slides the main pointer forward to your latest commit. That is a fast-forward. If both sides have new commits, Git creates a merge commit with two parents, which ties the two lines of history together.",
      "Branches pile up quickly. After a branch is merged, delete it locally and on the server. Your copy of the server's branch list also goes stale, so fetch with prune now and then. A tidy branch list makes it obvious what work is still open.",
    ],
    deepDive: [
      {
        heading: "How a three-way merge decides",
        body: "Git finds the merge base with the same logic as git merge-base main feature. For each file it compares three versions: base, ours (main) and theirs (feature). If only one side changed a region, that change wins automatically. If both sides made the same change, there is no problem either. Only when both sides changed the same lines differently does Git stop with a conflict.\n\nSince Git 2.34 the default merge engine is called ort. It replaced the older recursive strategy and is faster and better at renames. You rarely pick a strategy yourself, but options such as -X ours (prefer our side for conflicting hunks only) exist for special cases.",
        visual: {
          type: "flow",
          title: "Inside git merge feature",
          steps: [
            { label: "Find merge base", detail: "The newest commit both branches share" },
            { label: "Diff base to ours", detail: "What main changed" },
            { label: "Diff base to theirs", detail: "What feature changed" },
            { label: "Combine hunks", detail: "Non-overlapping changes apply cleanly" },
            { label: "Commit or stop", detail: "Merge commit, or conflict for overlaps" },
          ],
        },
      },
      {
        heading: "Choosing a merge style as a team",
        body: "On GitHub you can allow merge commits, squash merging and rebase merging. Many teams allow only squash: every pull request becomes one commit on main with the PR title as message, so main reads like a changelog and reverting a feature is one git revert. The cost is that the small steps inside the PR are gone from main.\n\nMerge commits keep every commit and show exactly when a branch landed, which helps on long-running release branches. Rebase merging copies each commit onto main for a straight line with all the detail, but the copies get new hashes. Whatever you choose, pick one default and switch off the others in the repository settings so history stays consistent.",
      },
      {
        heading: "Why squash-merged branches look unmerged",
        body: "A squash merge creates a brand new commit on main that contains the same changes, but it is not connected to your branch's commits. As far as Git's graph is concerned, your branch was never merged. So git branch -d feature refuses with \"not fully merged\" and git branch --merged main does not list it.\n\nThis is expected. Once you have confirmed the PR was merged, delete it with git branch -D. On GitHub, turn on \"Automatically delete head branches\" so the remote branch disappears on merge, then git fetch --prune removes your stale origin/feature copy. git branch -vv marks such branches with gone, which makes them easy to spot.",
        bullets: [
          "git branch --merged main lists branches fully merged by merge or fast-forward",
          "git branch -vv shows [origin/x: gone] for branches deleted on the server",
          "git config --global fetch.prune true prunes on every fetch",
        ],
      },
      {
        heading: "Remote branches and tracking",
        body: "origin/main is a remote-tracking branch: your local, read-only memory of where main was on the server the last time you fetched. It only moves when you run git fetch or git pull. Your own main is a separate pointer. git status compares the two and tells you if you are ahead or behind.\n\nWhen you push a new branch with git push -u origin feature/login, the -u sets the upstream, so later git push and git pull know where to go without arguments. git pull is git fetch followed by a merge (or a rebase, if you set pull.rebase true). Setting pull.ff only makes pull refuse to create surprise merge commits.",
      },
    ],
    moreVisuals: [
      {
        type: "cycle",
        title: "Life of a feature branch",
        steps: [
          { label: "Branch from main", detail: "git switch -c feature/x origin/main" },
          { label: "Commit and push", detail: "git push -u origin feature/x" },
          { label: "Pull request", detail: "Review and CI on the branch" },
          { label: "Merge", detail: "Squash, merge commit or rebase" },
          { label: "Delete and prune", detail: "Remove the branch everywhere" },
        ],
      },
    ],
    examples: [
      {
        title: "Fast-forward or not? Checking before you merge",
        explanation: "You want to know if merging feature/search will be a clean fast-forward. Step 1: fetch so origin/main is current. Step 2: count commits on each side with rev-list. If main has 0 commits the feature lacks, a fast-forward is possible. Step 3: if main moved, either merge (creating a merge commit) or rebase the feature first, which makes a fast-forward possible again.",
        code: {
          lang: "bash",
          code: "git fetch origin\ngit rev-list --left-right --count origin/main...feature/search\n# 0  4   -> main has 0 new commits, feature has 4: fast-forward works\n# 2  4   -> both moved: a merge commit (or rebase first)\ngit log --oneline --graph origin/main feature/search -10",
        },
      },
      {
        title: "Cleaning up after a busy sprint",
        explanation: "Your laptop has 30 old branches. Step 1: fetch with prune so deleted remote branches vanish from origin/. Step 2: delete local branches already merged into main, keeping main itself. Step 3: list branches whose upstream is gone (usually squash-merged PRs), check them, then force-delete. Step 4: delete a remote branch you own that was never merged and is no longer needed.",
        code: {
          lang: "bash",
          code: "git switch main && git pull --ff-only\ngit fetch --prune\ngit branch --merged main | grep -vE '^\\*|main$' | xargs -r git branch -d\ngit branch -vv | grep ': gone]'\ngit branch -D fix/old-timeout          # after checking it is merged\ngit push origin --delete spike/graphql"
        },
      },
    ],
    cheatSheet: [
      "git switch -c feature/x origin/main starts a branch from the latest server main",
      "git merge --ff-only fails instead of creating a merge commit",
      "git merge-base main feature prints the commit both branches share",
      "git branch -d deletes only if merged; -D deletes anyway",
      "git push -u origin feature/x pushes and sets the upstream for later pushes",
      "git push origin --delete feature/x removes the branch on the server",
      "git config --global pull.ff only stops git pull from making surprise merges",
      "git log --oneline --graph --all draws every branch in the terminal",
    ],
    quiz: [
      {
        q: "Which three commits does a normal merge compare?",
        options: ["The two tips and the first commit in the repo", "The two tips and their merge base", "The two tips and HEAD~1", "Only the two tips"],
        answer: 1,
        why: "A three-way merge diffs each tip against the newest common ancestor.",
      },
      {
        q: "After a squash merge, git branch -d feature says the branch is not fully merged. Why?",
        options: ["The merge failed silently", "The branch has uncommitted changes", "The remote branch still exists", "The squash commit is new and not connected to the branch's commits"],
        answer: 3,
        why: "Squash copies the changes into one new commit, so Git's graph never sees the branch as merged.",
      },
      {
        q: "What does origin/main represent?",
        options: ["Your local memory of the server's main as of your last fetch", "The live state of main on GitHub", "A backup of your local main", "The branch you will push to next"],
        answer: 0,
        why: "Remote-tracking branches only update when you fetch or pull.",
      },
      {
        q: "Your team wants main to read like a list of features, one commit per pull request. Which method fits?",
        options: ["Merge commits", "Rebase merging", "Squash merging", "Fast-forward only"],
        answer: 2,
        why: "Squash merging turns each pull request into exactly one commit on main.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a branch, make one commit, and merge it into main as a fast-forward. Confirm no merge commit was created.",
        hint: "Do not commit on main in between; use --ff-only to be sure.",
        solution: "git switch -c feature/readme\necho \"More docs\" >> README.md\ngit commit -am \"Expand README\"\ngit switch main\ngit merge --ff-only feature/readme\ngit log --oneline -2   # no 'Merge branch' commit\ngit branch -d feature/readme",
      },
      {
        level: "medium",
        task: "Make main and a feature branch diverge (one commit each, different files), then merge with a merge commit and show both parents.",
        hint: "A merge commit's parents are HEAD^1 and HEAD^2.",
        solution: "git switch -c feature/a\necho a > a.txt && git add a.txt && git commit -m \"A\"\ngit switch main\necho b > b.txt && git add b.txt && git commit -m \"B\"\ngit merge --no-edit feature/a\ngit log --oneline -1 HEAD^1   # B\ngit log --oneline -1 HEAD^2   # A\ngit cat-file -p HEAD | grep parent",
      },
      {
        level: "hard",
        task: "Write a one-line shell alias that deletes every local branch whose upstream is gone, and explain why it needs -D rather than -d.",
        hint: "git branch -vv prints ': gone]' for those branches; awk can pick the name column.",
        solution: "git config --global alias.gone \"!git fetch --prune && git branch -vv | awk '/: gone]/{print \\$1}' | xargs -r git branch -D\"\ngit gone\n# -D is needed because squash-merged branches look unmerged to Git.\n# Run git branch -vv first if you are unsure what will be removed.",
      },
    ],
    faq: [
      { q: "Should I use git checkout or git switch?", a: "Both work. git switch (since Git 2.23) only changes branches, and git restore only restores files, so they are harder to misuse than the all-in-one git checkout." },
      { q: "Is it better to merge or squash pull requests?", a: "Squash gives a clean, one-commit-per-PR main and easy reverts. Merge commits keep full detail and exact branch history. Pick one as the team default and disable the others." },
      { q: "Why can I not create a branch called feature when feature/login exists?", a: "Branches are stored as file paths, so feature/login needs feature to be a folder. A branch named feature would have to be a file with the same name." },
    ],
  },

  "git-core/git-history": {
    plain: [
      "Before you share your work, you can tidy it. Maybe you made five commits called \"wip\" and \"fix typo\". Git lets you combine them, reword them, reorder them or drop some, so reviewers see a clean story. This is called rewriting history, and it is safe as long as nobody else has your commits yet.",
      "Rebase moves your branch so it starts from a newer point, usually the latest main. Git takes each of your commits, one by one, and replays it on top. The result looks as if you started your work today. Cherry-pick does the same thing for a single commit: it copies one change onto the branch you are on.",
      "Reset moves your branch pointer backwards (or anywhere). Depending on the mode, your changes stay staged, stay in your files, or are thrown away. It is the main tool for \"undo my last commit\".",
      "The safety net is the reflog. Every time HEAD moves, Git writes a line in a private log. Even if a rebase or reset seems to destroy commits, they are still in the database and the reflog tells you where. Only work you never committed is truly at risk.",
    ],
    deepDive: [
      {
        heading: "What rebase really does",
        body: "git rebase main on a feature branch runs a precise recipe. Git finds the merge base, lists the commits on your branch after it, saves the old tip as ORIG_HEAD, moves your branch to main's tip, and then applies each saved commit in order, like a series of cherry-picks. Each applied commit gets a new parent, so it gets a new hash. The old commits still exist, unreferenced.\n\nIf any step conflicts, the rebase pauses on that one commit. You fix it, git add, and git rebase --continue. git rebase --abort puts everything back as it was. Right after a finished rebase, git reset --hard ORIG_HEAD undoes it in one step.",
        visual: {
          type: "flow",
          title: "git rebase main, step by step",
          steps: [
            { label: "Find merge base", detail: "Where the branch left main" },
            { label: "Save your commits", detail: "Old tip kept as ORIG_HEAD" },
            { label: "Jump to main's tip", detail: "Branch now starts from new main" },
            { label: "Replay commits", detail: "One by one, each gets a new hash" },
            { label: "Move branch", detail: "Points at the last replayed commit" },
          ],
        },
      },
      {
        heading: "Interactive rebase and autosquash",
        body: "git rebase -i HEAD~4 opens a to-do list of your last four commits, oldest first. Change the word in front of each line: pick keeps it, reword edits the message, edit stops so you can change the content, squash melds it into the previous commit and combines messages, fixup does the same but discards this message, and drop removes it. You can also reorder lines.\n\nA faster habit is to mark fixes as you go. git commit --fixup=HASH creates a commit titled fixup! plus the target's title. Later, git rebase -i --autosquash main moves each fixup under its target and marks it fixup automatically. Set rebase.autoSquash true to make that the default.",
        bullets: [
          "pick, reword, edit, squash, fixup, drop",
          "exec npm test runs a command after a commit is replayed",
          "--rebase-merges keeps merge commits instead of flattening them",
        ],
      },
      {
        heading: "Cherry-pick in practice",
        body: "Cherry-pick takes the change a commit introduced (its diff against its parent) and applies it as a new commit on your current branch. The classic use is a hotfix: fix the bug on main, then copy that one commit to release/1.4. Add -x so the new message records \"cherry picked from commit ...\", which helps people trace it later.\n\nYou can pick several commits at once: git cherry-pick A..B copies everything after A up to and including B. Picking a merge commit needs -m 1 to say which parent is the mainline. Be careful about copying the same change to many branches: later merges can conflict, and the history shows the same change twice under different hashes.",
      },
      {
        heading: "Reflog, expiry and what cannot be saved",
        body: "Each repository keeps a reflog for HEAD and for every branch. Entries look like HEAD@{3}, meaning where HEAD was three moves ago, and you can also write main@{yesterday} or HEAD@{2.hours.ago}. By default, entries for commits still reachable are kept for 90 days, and entries for unreachable commits for 30 days, before git gc can clean them up.\n\nThe reflog is local. It is not pushed or cloned, so a fresh clone has no record of your old moves. It also only tracks commits. Changes you never committed (wiped by reset --hard or git checkout -- file) are not in it. A dropped stash is a commit too, so git fsck --unreachable can still find it for a while.",
      },
      {
        heading: "Rewriting shared branches safely",
        body: "Rewriting a branch that others have pulled forces them to untangle duplicates, so the rule is: rewrite only your own, unshared commits. On shared branches, use git revert, which adds a new commit that undoes an old one without changing history.\n\nWhen you must push a rewritten branch (for example after rebasing your own PR), use git push --force-with-lease. It refuses to overwrite the remote if it has commits you have not seen, protecting a teammate's push. Plain --force overwrites blindly. Branch protection on main should block force pushes entirely.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Which undo tool to use",
        columns: [
          { title: "git revert", points: ["Adds an undo commit", "History unchanged", "Safe on shared branches", "Works for any old commit"] },
          { title: "git reset", points: ["Moves the branch back", "Removes commits from the branch", "Only for unshared work", "Mode decides what happens to files"] },
          { title: "git rebase -i", points: ["Edits a range of commits", "Squash, reword, drop", "Creates new hashes", "Tidy before opening a PR"] },
        ],
      },
    ],
    examples: [
      {
        title: "Turn messy commits into a clean PR",
        explanation: "Your branch has: Add search API, wip, fix test, Add search UI. Step 1: start an interactive rebase onto main. Step 2: change wip and fix test from pick to fixup, so they melt into Add search API. Step 3: save and close; Git replays the commits. Step 4: check the log, run the tests, and push with force-with-lease because the hashes changed.",
        code: {
          lang: "text",
          code: "$ git rebase -i origin/main\n\npick 1a2b3c4 Add search API\nfixup 5d6e7f8 wip\nfixup 9a8b7c6 fix test\npick 3c4d5e6 Add search UI\n\n$ git log --oneline origin/main..HEAD\ne1f2a3b Add search UI\n7c8d9e0 Add search API\n$ git push --force-with-lease",
        },
      },
      {
        title: "Undo a bad reset --hard",
        explanation: "You ran git reset --hard HEAD~3 on the wrong branch and three commits vanished from git log. Step 1: run git reflog to see where HEAD was before the reset. Step 2: the line just before reset: moving to HEAD~3 shows the old tip. Step 3: reset back to it. The commits come back exactly as they were, because they never left the object database.",
        code: {
          lang: "bash",
          code: "git reflog -4\n# a9f3c21 HEAD@{0}: reset: moving to HEAD~3\n# 7e4b0d2 HEAD@{1}: commit: Add export button\n# ...\ngit reset --hard HEAD@{1}\ngit log --oneline -3   # the commits are back",
        },
      },
    ],
    cheatSheet: [
      "git rebase -i --autosquash origin/main folds fixup! commits into their targets",
      "git commit --fixup=HASH marks a commit to be squashed into an earlier one",
      "git cherry-pick -x HASH copies a commit and records where it came from",
      "git reset --hard ORIG_HEAD undoes the last rebase, merge or reset",
      "git commit --amend replaces the last commit; never amend pushed shared commits",
      "git revert HASH undoes a shared commit safely with a new commit",
      "git push --force-with-lease only overwrites if the remote is what you last saw",
      "git rebase --onto main old-base feature moves a branch onto a different base",
    ],
    quiz: [
      {
        q: "In an interactive rebase, what is the difference between squash and fixup?",
        options: ["squash drops the commit, fixup keeps it", "Both meld into the previous commit; fixup throws away this commit's message", "fixup runs tests, squash does not", "There is no difference"],
        answer: 1,
        why: "squash lets you combine both messages, while fixup keeps only the earlier commit's message.",
      },
      {
        q: "A bug fix on main must also go to release/2.1. What is the usual tool?",
        options: ["git rebase release/2.1", "git reset --soft", "git merge main into release/2.1", "git cherry-pick -x of the fix commit"],
        answer: 3,
        why: "Cherry-pick copies just that one change, while merging main would bring every new feature too.",
      },
      {
        q: "What does git push --force-with-lease protect against?",
        options: ["Overwriting commits someone else pushed since your last fetch", "Pushing to a protected branch", "Pushing secrets", "Pushing without tests"],
        answer: 0,
        why: "It checks the remote still points where you expect before overwriting.",
      },
      {
        q: "Which of these can the reflog NOT help you recover?",
        options: ["Commits dropped in an interactive rebase", "A branch deleted with git branch -D", "Edits you never committed, wiped by reset --hard", "Commits lost after git reset --hard HEAD~2"],
        answer: 2,
        why: "The reflog tracks commits; uncommitted changes were never stored as commits.",
      },
      {
        q: "You undo a commit that is already on the shared main branch. What should you use?",
        options: ["git reset --hard and force push", "git rebase -i and drop it", "git commit --amend", "git revert"],
        answer: 3,
        why: "Revert adds an undo commit without rewriting history others already have.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Make a commit with a typo in its message, then fix the message without creating a second commit.",
        hint: "Only the last commit is involved, and it is not pushed yet.",
        solution: "git commit -m \"Add lgoin form\"\ngit commit --amend -m \"Add login form\"\ngit log --oneline -1",
      },
      {
        level: "medium",
        task: "Make three commits, then use reset to turn them into a single commit with a new message, without interactive rebase.",
        hint: "A soft reset keeps all changes staged.",
        solution: "git reset --soft HEAD~3\ngit status            # everything from the 3 commits is staged\ngit commit -m \"Add search feature\"\ngit log --oneline -2",
      },
      {
        level: "hard",
        task: "Your feature branch was cut from release/1.0 by mistake but should be based on main. Move only your 2 commits onto main.",
        hint: "git rebase --onto NEW_BASE OLD_BASE BRANCH moves the commits after OLD_BASE.",
        solution: "git log --oneline release/1.0..feature   # shows your 2 commits\ngit rebase --onto main release/1.0 feature\ngit log --oneline main..feature           # same 2 commits, new hashes\n# if it goes wrong: git reset --hard ORIG_HEAD",
      },
    ],
    faq: [
      { q: "Is rebase dangerous?", a: "Not for commits only you have. It creates new commits and the old ones stay in the reflog, so you can undo it. It becomes painful only when you rebase commits other people already pulled." },
      { q: "What is the difference between git reset and git restore?", a: "git reset moves a branch pointer (and can reset staging). git restore changes files in your working folder or index without touching any branch." },
      { q: "How long does Git keep commits I lost?", a: "By default, reflog entries for unreachable commits expire after 30 days, and reachable ones after 90, before garbage collection may delete them." },
      { q: "Should I rebase or merge main into my feature branch?", a: "Rebase gives a cleaner history and is fine for your own branch. Merging main in is safer when several people share the branch, because nothing is rewritten." },
    ],
  },

  "git-core/git-conflicts": {
    plain: [
      "A merge conflict sounds scary, but it only means Git found two changes to the same lines and refuses to guess which one is right. It pauses, marks the spot in the file, and waits for a human. Nothing is lost: both versions are right there.",
      "Conflicts only happen when both sides touched the same lines, or lines right next to each other. If you changed the top of a file and a teammate changed the bottom, Git combines them on its own. If one person deleted a file the other edited, that is a conflict too.",
      "Your job is to decide what the final code should be. Sometimes you keep one side, often you combine both, and sometimes you write something new. Then you remove the marker lines, run the tests, stage the file and continue.",
      "The best way to avoid painful conflicts is to keep branches short and merge or rebase from main often. Two small conflicts this week are much easier than one giant conflict next month.",
    ],
    deepDive: [
      {
        heading: "Seeing the base with zdiff3",
        body: "Default conflict markers show only two sides: yours between <<<<<<< and =======, theirs between ======= and >>>>>>>. That hides an important clue: what the code looked like before either change. Turn on git config --global merge.conflictStyle zdiff3 (Git 2.35 and later). Now each conflict also has a ||||||| section with the original lines from the merge base.\n\nWith the base visible, you can see what each side intended. If the base said TIMEOUT = 30, ours says 30 with a comment added and theirs says 60, the right answer is probably 60 with the comment. Without the base, you might think the comment was the change from theirs.",
        bullets: [
          "<<<<<<< starts our side (HEAD)",
          "||||||| shows the merge base (with diff3 or zdiff3)",
          "======= separates base or ours from theirs",
          ">>>>>>> ends their side",
        ],
      },
      {
        heading: "The index holds three versions",
        body: "During a conflict, the index stores up to three entries for the file, called stages. Stage 1 is the merge base, stage 2 is ours and stage 3 is theirs. git ls-files -u lists them. You can print any one: git show :1:app.py, :2:app.py or :3:app.py. This is handy for comparing side by side in your own tools.\n\nTo take one side for the whole file, use git checkout --ours app.py or git checkout --theirs app.py (git restore has the same flags). git add then collapses the stages into one normal entry, which is how Git knows the file is resolved. git diff during a conflict shows a combined diff against both sides.",
        visual: {
          type: "tree",
          title: "A conflicted file in the index",
          root: "app.py (unmerged)",
          children: [
            { label: "Stage 1: base", children: ["Version before either change", "git show :1:app.py"] },
            { label: "Stage 2: ours", children: ["Current branch (HEAD)", "git checkout --ours app.py"] },
            { label: "Stage 3: theirs", children: ["Branch being merged in", "git checkout --theirs app.py"] },
            { label: "After git add", children: ["One normal entry: resolved"] },
          ],
        },
      },
      {
        heading: "Conflicts during a rebase feel backwards",
        body: "A rebase replays your commits one at a time on top of main, so conflicts can appear once per commit instead of once in total. And the labels swap: during a rebase, ours (HEAD) is the new base, meaning main plus your commits replayed so far, and theirs is the commit of yours being replayed now. So --theirs keeps your change and --ours keeps main's.\n\nAfter fixing each stop: git add the files, then git rebase --continue. If a commit becomes empty because main already has the same change, git rebase --skip drops it. If things get messy, git rebase --abort returns to the start. For long branches with many repeated conflicts, a single merge can be less work than a rebase.",
      },
      {
        heading: "Tools that make conflicts easier",
        body: "git mergetool opens each conflicted file in a visual tool like VS Code, Meld or vimdiff, configured with merge.tool. Many editors also show buttons like Accept Current or Accept Incoming right above the markers.\n\nIf you resolve the same conflict over and over, for example while rebasing a long branch, turn on rerere (reuse recorded resolution) with git config --global rerere.enabled true. Git remembers how you resolved a conflict and applies the same fix automatically the next time it sees the identical conflict. Before committing, git diff --check warns if any conflict markers or whitespace errors are left in your unstaged changes (add --cached for staged ones).",
        bullets: [
          "git log --merge -p shows the commits that touched the conflicted files",
          "git diff --name-only --diff-filter=U lists unresolved files",
          "git merge -X theirs prefers their side only for conflicting hunks",
        ],
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "A rebase that stops on a conflict",
        actors: ["You", "Git", "Working files"],
        messages: [
          { from: 0, to: 1, label: "git rebase origin/main" },
          { from: 1, to: 2, label: "Replay commit 1: clean" },
          { from: 1, to: 2, label: "Replay commit 2: write markers" },
          { from: 1, to: 0, label: "Stop: CONFLICT in config.py" },
          { from: 0, to: 2, label: "Edit file, remove markers" },
          { from: 0, to: 1, label: "git add, git rebase --continue" },
          { from: 1, to: 2, label: "Replay commit 3: clean" },
          { from: 1, to: 0, label: "Successfully rebased" },
        ],
      },
    ],
    examples: [
      {
        title: "Resolving a conflict with the base shown",
        explanation: "You and a teammate both edited retry settings. With zdiff3 on, the conflict shows three versions. Step 1: read the base: retries was 3. Step 2: ours raised it to 5. Step 3: theirs kept 3 but added a backoff. Both intentions are valid, so the correct result keeps both: 5 retries with a backoff. Step 4: delete all marker lines, run the tests, git add and commit.",
        code: {
          lang: "text",
          code: "<<<<<<< HEAD\nRETRIES = 5\n||||||| 1a2b3c4\nRETRIES = 3\n=======\nRETRIES = 3\nBACKOFF_SECONDS = 2\n>>>>>>> feature/backoff\n\n# resolved:\nRETRIES = 5\nBACKOFF_SECONDS = 2",
        },
      },
      {
        title: "A lockfile conflict: regenerate, do not hand-edit",
        explanation: "Both branches added an npm package, so package-lock.json conflicts in hundreds of lines. Editing it by hand is error-prone. Step 1: resolve package.json by hand (keep both dependencies). Step 2: take either lockfile version. Step 3: run npm install so npm rebuilds the lockfile from package.json. Step 4: stage both files and continue. The same idea works for poetry.lock, yarn.lock and other generated files.",
        code: {
          lang: "bash",
          code: "git status                         # both modified: package.json, package-lock.json\n# edit package.json: keep both new dependencies\ngit checkout --theirs package-lock.json\nnpm install                        # regenerates the lockfile\nnpm test\ngit add package.json package-lock.json\ngit commit                         # or: git rebase --continue",
        },
      },
    ],
    cheatSheet: [
      "git config --global merge.conflictStyle zdiff3 shows the base version in conflicts",
      "git diff --name-only --diff-filter=U lists files that still have conflicts",
      "git checkout --ours file or --theirs file takes one side for the whole file",
      "During a rebase, --theirs is YOUR commit and --ours is the branch you rebase onto",
      "git merge --abort and git rebase --abort return to the state before you started",
      "git rebase --skip drops a commit that became empty or is not needed",
      "git config --global rerere.enabled true reuses resolutions you already made",
      "git diff --check catches leftover conflict markers before you commit",
    ],
    quiz: [
      {
        q: "What does the ||||||| section in a conflict show?",
        options: ["Their version", "The merge base version, before either change", "Your uncommitted edits", "A Git error message"],
        answer: 1,
        why: "With diff3 or zdiff3 style, Git includes the common ancestor so you can see what each side changed.",
      },
      {
        q: "You are rebasing feature onto main and want to keep your own version of a conflicted file. Which command?",
        options: ["git checkout --ours file", "git checkout main -- file", "git checkout --theirs file", "git reset file"],
        answer: 2,
        why: "During a rebase the roles swap: theirs is the commit being replayed, which is yours.",
      },
      {
        q: "How does Git know you have resolved a conflicted file?",
        options: ["You stage it with git add", "You save the file", "You delete the >>>>>>> line", "You run the tests"],
        answer: 0,
        why: "Staging replaces the three index stages with one normal entry.",
      },
      {
        q: "Which setting makes Git repeat a conflict resolution you already did?",
        options: ["merge.ff", "pull.rebase", "fetch.prune", "rerere.enabled"],
        answer: 3,
        why: "rerere records conflict resolutions and replays them for identical conflicts.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create a conflict on purpose: change the same line of a file differently on main and on a branch, merge, then abort.",
        hint: "Commit one change on each branch, then git merge the branch into main.",
        solution: "echo \"color = red\" > cfg.txt && git add cfg.txt && git commit -m base\ngit switch -c feature && echo \"color = blue\" > cfg.txt && git commit -am blue\ngit switch main && echo \"color = green\" > cfg.txt && git commit -am green\ngit merge feature          # CONFLICT (content)\ngit status                 # both modified: cfg.txt\ngit merge --abort",
      },
      {
        level: "medium",
        task: "Repeat the conflict, turn on zdiff3, and resolve it by combining both sides into one line, then finish the merge.",
        hint: "Set the config before running git merge so the markers include the base.",
        solution: "git config merge.conflictStyle zdiff3\ngit merge feature\ncat cfg.txt                # shows ours, base and theirs\nprintf 'color = blue\\naccent = green\\n' > cfg.txt\ngit diff --check           # no leftover markers\ngit add cfg.txt\ngit commit --no-edit",
      },
      {
        level: "hard",
        task: "Rebase a branch with three commits that each conflict with main. Resolve the first, then use rerere so a repeated identical conflict resolves itself after you abort and retry.",
        hint: "Enable rerere before the first attempt; Git records the resolution when you git add and continue.",
        solution: "git config rerere.enabled true\ngit rebase main             # stops on commit 1\n# fix the file, then:\ngit add cfg.txt && git rebase --continue\ngit rebase --abort          # pretend you changed your mind\ngit rebase main             # \"Resolved 'cfg.txt' using previous resolution.\"\ngit diff                    # check it, then git add and continue",
      },
    ],
    faq: [
      { q: "Why do I get the same conflict again and again during a rebase?", a: "A rebase replays each commit separately, so if several of your commits touch the same lines, each one can conflict. Squash those commits first, enable rerere, or merge instead." },
      { q: "Can I resolve conflicts on GitHub instead of locally?", a: "Yes, for simple text conflicts GitHub offers a web editor on the pull request. Complex conflicts, or ones that need testing, are better resolved locally." },
      { q: "What does \"deleted by them\" mean in git status?", a: "One side deleted the file and the other changed it. Decide whether it should exist: git rm the file to accept the deletion, or git add it to keep your version." },
    ],
  },
};

export default extra;

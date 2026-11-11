import os, re
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "data", "learn", "extra", "parts")
imps, entries = [], {}
for slug in sorted(os.listdir(root)):
    d = os.path.join(root, slug)
    if not os.path.isdir(d): continue
    for f in sorted(os.listdir(d)):
        if not f.endswith(".ts"): continue
        name = re.sub(r"[^a-zA-Z0-9]", "_", f"{slug}__{f[:-3]}")
        imps.append(f'import {name} from "./{slug}/{f[:-3]}";')
        entries.setdefault(slug, []).append(name)
body = ",\n".join(f'  "{s}": {{ {", ".join("..."+n for n in ns)} }}' for s, ns in entries.items())
out = f'''// Generated: lists every file in this folder. Each file holds extra content for one module of one path.
import type {{ ExtraMap }} from "../types";
{chr(10).join(imps)}

const parts: Record<string, ExtraMap> = {{
{body}{"," if body else ""}
}};

export default parts;
'''
open(os.path.join(root, "index.ts"), "w").write(out)
print(f"{sum(map(len, entries.values()))} part files")

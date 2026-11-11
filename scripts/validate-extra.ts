/**
 * Usage: npm run content:check  (all files), or npx tsx scripts/validate-extra.ts <file.ts> [more files...]
 * Each file must `export default` an ExtraMap. Path slug is taken from the parent directory name
 * (src/data/learn/extra/parts/<slug>/<module>.ts) or from the file name (src/data/learn/extra/<slug>.ts).
 */
import path from "node:path";
import { paths } from "../src/data/learn/paths";
import { getExplainer } from "../src/data/learn/explainers";

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
let errors = 0, warns = 0;
const err = (k: string, m: string) => { errors++; console.log(`ERROR ${k}: ${m}`); };
const warn = (k: string, m: string) => { warns++; console.log(`warn  ${k}: ${m}`); };

function checkVisual(k: string, v: any, where: string) {
  const n = (a: any[] | undefined, lo: number, hi: number, what: string) => {
    if (!Array.isArray(a)) return err(k, `${where} ${what} missing`);
    if (a.length < lo || a.length > hi) err(k, `${where} ${what} has ${a.length}, need ${lo}-${hi}`);
  };
  if (!v || typeof v.title !== "string" || !v.title) return err(k, `${where} needs a title`);
  switch (v.type) {
    case "flow": n(v.steps, 3, 7, "steps"); break;
    case "cycle": n(v.steps, 3, 6, "steps"); break;
    case "layers": n(v.layers, 3, 7, "layers"); break;
    case "compare": n(v.columns, 2, 3, "columns"); v.columns?.forEach((c: any) => n(c.points, 3, 5, `column "${c.title}" points`)); break;
    case "tree": if (!v.root) err(k, `${where} tree needs root`); n(v.children, 2, 6, "children"); v.children?.forEach((c: any) => c.children && n(c.children, 0, 5, `leaf "${c.label}"`)); break;
    case "sequence": n(v.actors, 2, 4, "actors"); n(v.messages, 3, 8, "messages");
      v.messages?.forEach((m: any) => { if (!(m.from in v.actors) || !(m.to in v.actors)) err(k, `${where} message index out of range`); }); break;
    default: err(k, `${where} unknown type ${v.type}`);
  }
}

async function main() {
  const answers: number[] = [];
  for (const f of process.argv.slice(2)) {
    const abs = path.resolve(f);
    const dir = path.basename(path.dirname(abs));
    const slug = dir === "extra" ? path.basename(abs, ".ts") : dir;
    if (["index", "types"].includes(slug) || ["index.ts", "types.ts"].includes(path.basename(abs))) continue; // helpers, not content
    const p = paths.find((x) => x.slug === slug);
    if (!p) { err(f, `no path with slug "${slug}"`); continue; }
    const valid = new Set(p.modules.flatMap((m) => m.topics.map((t) => `${m.key}/${t.key}`)));
    const mod = await import(abs);
    const map = mod.default?.default ?? mod.default;
    if (!map || typeof map !== "object") { err(f, "no default export"); continue; }
    for (const [k, e] of Object.entries<any>(map)) {
      if (!valid.has(k)) { err(k, `not a topic key in ${slug}`); continue; }
      if (!getExplainer(slug, k)) warn(k, "no explainer");
      if (!Array.isArray(e.plain) || e.plain.length < 3 || e.plain.length > 5) err(k, `plain needs 3-5 paragraphs`);
      e.plain?.forEach((x: string, i: number) => words(x) > 100 && warn(k, `plain[${i}] ${words(x)} words`));
      if (!Array.isArray(e.deepDive) || e.deepDive.length < 3 || e.deepDive.length > 5) err(k, "deepDive needs 3-5 sections");
      let dv = 0;
      e.deepDive?.forEach((d: any, i: number) => {
        if (!d.heading || !d.body) err(k, `deepDive[${i}] needs heading and body`);
        if (words(d.body ?? "") > 200) warn(k, `deepDive[${i}] body ${words(d.body)} words`);
        if (d.bullets && d.bullets.length > 5) err(k, `deepDive[${i}] >5 bullets`);
        if (d.visual) { dv++; checkVisual(k, d.visual, `deepDive[${i}].visual`); }
      });
      if (!Array.isArray(e.moreVisuals) || e.moreVisuals.length < 1 || e.moreVisuals.length > 2) err(k, "moreVisuals needs 1-2");
      e.moreVisuals?.forEach((v: any, i: number) => checkVisual(k, v, `moreVisuals[${i}]`));
      if (dv === 0) warn(k, "no inline deepDive visual (fine only if none would help)");
      if (!Array.isArray(e.examples) || e.examples.length !== 2) err(k, "examples needs exactly 2");
      e.examples?.forEach((x: any, i: number) => { if (!x.title || !x.explanation) err(k, `examples[${i}] incomplete`); if (x.code && x.code.code.split("\n").length > 18) warn(k, `examples[${i}] code > 18 lines`); });
      if (!Array.isArray(e.cheatSheet) || e.cheatSheet.length < 4 || e.cheatSheet.length > 8) err(k, "cheatSheet needs 4-8");
      e.cheatSheet?.forEach((c: string) => c.length > 140 && warn(k, `cheatSheet item ${c.length} chars`));
      if (new Set(e.cheatSheet).size !== e.cheatSheet?.length) err(k, "duplicate cheatSheet items (used as React keys)");
      if (!Array.isArray(e.quiz) || e.quiz.length < 4 || e.quiz.length > 5) err(k, "quiz needs 4-5");
      e.quiz?.forEach((q: any, i: number) => {
        if (q.options?.length !== 4) err(k, `quiz[${i}] needs exactly 4 options`);
        if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) err(k, `quiz[${i}] bad answer index`);
        if (!q.why) err(k, `quiz[${i}] needs why`);
        answers.push(q.answer);
      });
      const lv = (e.practice ?? []).map((x: any) => x.level).join(",");
      if (lv !== "easy,medium,hard") err(k, `practice must be easy,medium,hard (got ${lv})`);
      if (!Array.isArray(e.faq) || e.faq.length < 3 || e.faq.length > 4) err(k, "faq needs 3-4");
      if (new Set(e.faq?.map((x: any) => x.q)).size !== e.faq?.length) err(k, "duplicate faq questions");
      const all = JSON.stringify(e);
      if (/<\/?[a-z][^>]*>|\*\*|`/.test(all.replace(/"code":"(?:[^"\\]|\\.)*"/g, '""').replace(/"solution":"(?:[^"\\]|\\.)*"/g, '""')))
        warn(k, "looks like HTML/Markdown/backticks outside code (text must be plain)");
      if (/—/.test(all)) warn(k, "contains em dash");
    }
    console.log(`${f}: ${Object.keys(map).length} topics`);
  }
  const dist = [0, 1, 2, 3].map((i) => answers.filter((a) => a === i).length);
  console.log(`quiz answer spread (index 0..3): ${dist.join(" / ")}`);
  console.log(errors ? `FAILED: ${errors} errors, ${warns} warnings` : `OK: 0 errors, ${warns} warnings`);
  process.exit(errors ? 1 : 0);
}

main();

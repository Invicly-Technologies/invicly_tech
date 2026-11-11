import type { ExtraMap } from "./types";

// Filled in module by module; topics without an entry simply hide the extra sections.
const extra: ExtraMap = {
  // ───────────────────────── HTML & CSS ─────────────────────────
  "html-css/html-semantics": {
    plain: [
      "HTML is the text that describes what is on a web page. Every piece of content sits inside a tag, like p for a paragraph. Semantic HTML means picking the tag whose name matches what the content is: a navigation menu goes in nav, the main content goes in main, a clickable action is a button.",
      "Why does the name matter if the page looks the same? Because people are not the only readers. Screen readers (software that reads pages aloud for blind users), search engines and browser features like reader mode all read the tags to understand the page. A page built only from div tags looks fine but tells them nothing.",
      "Think of a book. It has a cover, a table of contents, chapters with titles and an index. You can find things because the parts have clear jobs. Semantic HTML gives your page the same parts, so every visitor and every tool can find their way around.",
      "Forms are where this pays off most. A real label tied to an input means clicking the label focuses the field, and screen readers announce the field's name. Input types like email or number give phones the right keyboard and give you free checks before any JavaScript runs.",
    ],
    deepDive: [
      {
        heading: "The accessibility tree",
        body: "The browser turns your HTML into two trees. The DOM is what you style and script. From it, the browser builds a second, smaller tree called the accessibility tree. Each node there has a role (button, link, heading), a name (the text a user hears) and a state (checked, expanded, disabled).\n\nScreen readers never see your CSS. They read only this tree. A button element with the text Save becomes role button, name Save. A div with class btn and the text Save becomes plain text with no role, so a blind user does not know it can be clicked. Semantic tags fill the accessibility tree correctly for free.",
        bullets: ["Role: what the thing is", "Name: what it is called", "State: its current condition", "You can inspect it in Chrome DevTools under Accessibility"],
        visual: {
          type: "compare",
          title: "Same text, two accessibility tree nodes",
          columns: [
            { title: "button with text Save", points: ["Role: button", "Name: Save", "Reachable with Tab", "Announced as \"Save, button\""] },
            { title: "div with class btn", points: ["Role: none (plain text)", "Name: just the text Save", "Skipped by Tab", "Not announced as clickable"] },
          ],
        },
      },
      {
        heading: "Headings are a table of contents",
        body: "Screen reader users often jump from heading to heading to skim a page, the way you scan bold titles. So heading levels should form an outline: one h1 for the page topic, h2 for main sections, h3 for parts inside an h2.\n\nPick the level by meaning, then use CSS to set the size. If a design needs a small-looking h2, style it small. Skipping from h2 to h4 because h4 \"looks right\" leaves a gap in the outline and confuses people who navigate by headings.",
        visual: {
          type: "tree",
          title: "Headings as an outline",
          root: "h1: page topic",
          children: [
            { label: "h2: first main section", children: ["h3: part of it", "h3: another part"] },
            { label: "h2: second main section", children: ["h3: part of it"] },
            { label: "h2: third main section" },
          ],
        },
      },
      {
        heading: "Native form validation",
        body: "The browser can check form fields before submit. Attributes such as required, type=\"email\", min, max, minlength and pattern tell it the rules. When the user submits, the browser blocks the submit, focuses the first bad field and shows a message in the user's language.\n\nThis is a nice first layer, but it is not security. Anyone can turn it off or send a request directly. Always validate again on the server. You can also style fields with the :invalid and :user-invalid pseudo-classes, and add novalidate to the form if you want to show your own messages with JavaScript instead.",
        bullets: ["required: field must not be empty", "type=\"email\" / \"url\": checks the format", "min / max: limits for numbers and dates", "pattern: a regular expression the value must match"],
      },
      {
        heading: "When to use div and span",
        body: "Div and span are not bad. They are neutral boxes with no meaning, and that is exactly right when you only need a wrapper for layout or styling, such as a flex container around two cards. The rule is simple: if a semantic element describes the content, use it; if nothing fits, use div (block) or span (inline). Problems start only when div replaces something that has a real tag, like a button, link, list or heading.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Div soup vs semantic markup",
        columns: [
          { title: "Div soup", points: ["div class=\"header\"", "div onclick for actions", "Bold text as fake headings", "Placeholder used as label", "No landmarks to jump to"] },
          { title: "Semantic", points: ["header, nav, main, footer", "button for actions, a for links", "h1 to h3 in outline order", "label tied to each input", "Screen readers list the regions"] },
        ],
      },
      {
        type: "sequence",
        title: "What happens when a form is submitted",
        actors: ["User", "Browser", "Server"],
        messages: [
          { from: 0, to: 1, label: "Clicks Create account" },
          { from: 1, to: 0, label: "Invalid field: focus it and show a message" },
          { from: 0, to: 1, label: "Fixes the field and submits again" },
          { from: 1, to: 2, label: "All checks pass: POST form data" },
          { from: 2, to: 1, label: "Validates again, returns success or errors" },
          { from: 1, to: 0, label: "Shows the result page" },
        ],
      },
    ],
    examples: [
      {
        title: "Fixing a div-based blog page",
        explanation: "Start with a page made of divs: a top bar, a menu, a post and a sidebar. Step 1: wrap the top bar in header and the menu links in nav with a ul list. Step 2: put the post inside main and article, and turn the bold title into an h1. Step 3: subheadings in the post become h2. Step 4: the sidebar becomes aside, and the bottom becomes footer. The page looks identical, but a screen reader can now list 5 regions and an outline of headings.",
        code: {
          lang: "html",
          code: "<header>\n  <a href=\"/\">My Blog</a>\n  <nav aria-label=\"Main\">\n    <ul><li><a href=\"/posts\">Posts</a></li><li><a href=\"/about\">About</a></li></ul>\n  </nav>\n</header>\n<main>\n  <article>\n    <h1>Learning CSS Grid</h1>\n    <h2>Why Grid?</h2>\n    <p>...</p>\n  </article>\n</main>\n<aside>Related posts</aside>\n<footer>(c) 2026</footer>",
        },
      },
      {
        title: "A delivery-time radio group",
        explanation: "You need users to pick one delivery slot. Radio buttons with the same name attribute form one group, so only one can be selected. Wrap them in a fieldset and give it a legend, so a screen reader says \"Delivery time, Morning, radio button, 1 of 3\". Add required to one radio and the browser refuses to submit until a slot is chosen. Arrow keys move between options with no JavaScript.",
        code: {
          lang: "html",
          code: "<fieldset>\n  <legend>Delivery time</legend>\n  <label><input type=\"radio\" name=\"slot\" value=\"am\" required /> Morning</label>\n  <label><input type=\"radio\" name=\"slot\" value=\"pm\" /> Afternoon</label>\n  <label><input type=\"radio\" name=\"slot\" value=\"eve\" /> Evening</label>\n</fieldset>",
        },
      },
    ],
    cheatSheet: [
      "One h1 per page; go h1 > h2 > h3 without skipping levels",
      "Actions use button; navigation to another URL uses a with href",
      "Landmarks: header, nav, main (only one), aside, footer",
      "Every input needs a label: for=\"id\" or wrap the input inside the label",
      "Group related controls with fieldset + legend (radios, checkboxes, address)",
      "button inside a form defaults to type=\"submit\"; use type=\"button\" for other actions",
      "Browser validation helps users; server validation protects you",
    ],
    quiz: [
      {
        q: "What does a screen reader actually read to understand your page?",
        options: ["Your CSS file", "The accessibility tree built from your HTML", "Only the page title", "The JavaScript source"],
        answer: 1,
        why: "Assistive tech reads roles, names and states from the accessibility tree, which comes from your markup.",
      },
      {
        q: "A section heading looks too big as an h2. What should you do?",
        options: ["Change it to an h5", "Replace it with a bold span", "Keep it as h2 and make it smaller with CSS", "Remove the heading"],
        answer: 2,
        why: "Heading level is about the outline; size is a styling decision for CSS.",
      },
      {
        q: "Which element is right for a \"Delete\" action that does not navigate?",
        options: ["button type=\"button\"", "a href=\"#\"", "div with onclick", "span role=\"text\""],
        answer: 0,
        why: "Buttons perform actions and come with focus, keyboard support and the correct role.",
      },
      {
        q: "Why must you still validate on the server when using required and pattern?",
        options: ["Browsers ignore those attributes", "They only work on phones", "Server validation is faster", "Anyone can bypass client checks and send requests directly"],
        answer: 3,
        why: "Client-side checks are a convenience for users, not a security barrier.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a newsletter sign-up form with one email field and a submit button. The field must be labelled, required and checked as an email.",
        hint: "Use type=\"email\", the required attribute and a label with a matching for/id pair.",
        solution: "<form action=\"/subscribe\" method=\"post\">\n  <label for=\"news-email\">Email address</label>\n  <input id=\"news-email\" name=\"email\" type=\"email\" required />\n  <button type=\"submit\">Subscribe</button>\n</form>",
      },
      {
        level: "medium",
        task: "A recipe page has a title, an ingredients list, numbered steps and a \"Print\" action. Write the semantic HTML skeleton (no CSS).",
        hint: "Ingredients have no order but steps do. Printing is an action, not a link.",
        solution: "<main>\n  <article>\n    <h1>Tomato Soup</h1>\n    <h2>Ingredients</h2>\n    <ul><li>4 tomatoes</li><li>1 onion</li></ul>\n    <h2>Steps</h2>\n    <ol><li>Chop the onion.</li><li>Simmer for 20 minutes.</li></ol>\n    <button type=\"button\" onclick=\"window.print()\">Print</button>\n  </article>\n</main>",
      },
      {
        level: "hard",
        task: "Open any website, then in Chrome DevTools open the Accessibility pane and inspect three interactive elements. List any that have no role, a generic role, or an empty name, and say how you would fix each.",
        hint: "Look for clickable divs, icon-only buttons and inputs without labels.",
        solution: "Typical findings and fixes:\n1. div with click handler (role generic) -> change to <button>.\n2. Icon-only button with empty name -> add aria-label=\"Search\"\n   or visually hidden text inside the button.\n3. Input with only a placeholder (name empty) -> add a visible <label>.\nRe-check the pane: each element should show a correct role and a clear name.",
      },
    ],
    faq: [
      { q: "Does semantic HTML help SEO?", a: "Yes, a little. Search engines use headings, links and landmarks to understand structure, but the main benefits are accessibility and cleaner code." },
      { q: "Can I have more than one header or footer?", a: "Yes. An article or section can have its own header and footer. Only main should appear once per page." },
      { q: "What is the difference between section and article?", a: "An article is self-contained and would make sense on its own, like a blog post or a product card. A section is a themed part of a larger whole and should usually have a heading." },
      { q: "Is placeholder text enough instead of a label?", a: "No. Placeholders disappear when you type, are often low contrast and are not reliably announced. Use a visible label and keep the placeholder for an optional hint." },
    ],
  },

  "html-css/css-basics": {
    plain: [
      "CSS is the language that styles HTML: colors, sizes, spacing and layout. A CSS rule has two parts. The selector picks which elements to style, like .card or h2. The declarations say what to change, like color: navy.",
      "Often several rules target the same element and disagree. One says the text is blue, another says red. The cascade is the set of rules the browser uses to pick a winner. Once you know how it decides, CSS stops feeling random.",
      "Every element is drawn as a box. The box has content in the middle, then padding (space inside the border), then the border, then margin (space outside, pushing other boxes away). Most layout bugs come from forgetting that padding and border add to the size.",
      "Units are how you say how big things are. px is a fixed size. rem follows the user's chosen font size, so text grows if someone sets a larger default. % is relative to the parent. Picking the right unit makes pages that adapt instead of break.",
    ],
    deepDive: [
      {
        heading: "How the cascade really decides",
        body: "When two declarations set the same property on the same element, the browser checks a list of tie-breakers in order and stops at the first one that differs.\n\nFirst comes origin and importance: your styles beat browser defaults, and !important flips the order. Next come cascade layers (@layer), if you use them. Then specificity: the more precise selector wins. Last is source order: if everything else ties, the rule written later wins.\n\nInheritance is a separate idea. Some properties, like color and font-family, flow down from parent to child when the child has no value of its own. Others, like border and padding, do not inherit.",
        bullets: ["1. Origin and !important", "2. Cascade layers", "3. Specificity", "4. Order in the source", "Inheritance only fills gaps"],
      },
      {
        heading: "Counting specificity",
        body: "Specificity is written as three numbers: (IDs, classes, types). Count each part of the selector. #nav a is (1, 0, 1). .menu .item:hover is (0, 3, 0), because pseudo-classes like :hover and attribute selectors like [type] count as classes. ul li is (0, 0, 2).\n\nCompare the numbers left to right. Any ID beats any number of classes, and one class beats any number of types. Inline style attributes beat all selectors. The :where() function adds zero specificity, which is handy for easy-to-override defaults.\n\nA good habit is to style mostly with single classes. Then specificity stays flat and source order does the rest.",
      },
      {
        heading: "content-box vs border-box",
        body: "By default, width sets only the content area (box-sizing: content-box). A 300px wide box with 20px padding and a 2px border actually takes 344px. That is why two 50% columns with padding wrap onto two lines.\n\nWith box-sizing: border-box, width includes padding and border, so 300px means 300px. Most projects set it on every element at the start of the stylesheet. Margin is never part of the width in either mode.",
        visual: {
          type: "compare",
          title: "width: 300px, 20px padding, 2px border",
          columns: [
            { title: "content-box (default)", points: ["width sets the content only", "300 + 40 padding + 4 border", "Box takes 344px", "Margin is extra"] },
            { title: "border-box", points: ["width includes padding and border", "Box takes 300px", "Content shrinks to 256px", "Margin is extra"] },
          ],
        },
      },
      {
        heading: "Choosing units",
        body: "Use rem for font sizes and most spacing. 1rem equals the root font size, usually 16px, and it grows when a user raises the default size in browser settings. em is relative to the current element's font size, which is handy for padding on a button that should scale with its text but can compound when nested.\n\nUse % or fr for widths inside layouts, vw and vh for viewport-based sizes, and px for hairline details like a 1px border.",
        bullets: ["rem: fonts and spacing", "em: sizes that follow the element's own text", "%: relative to the parent", "px: borders and tiny fixed details"],
      },
    ],
    moreVisuals: [
      {
        type: "layers",
        title: "The box model, outside in",
        layers: [
          { label: "Margin", detail: "Transparent space that pushes neighbours away" },
          { label: "Border", detail: "The visible edge, counts toward size" },
          { label: "Padding", detail: "Space inside the border, shows the background" },
          { label: "Content", detail: "Text and children; width applies here in content-box" },
        ],
      },
      {
        type: "tree",
        title: "Specificity of common selectors",
        root: "Selector score (IDs, classes, types)",
        children: [
          { label: "(1,0,0) and up", children: ["#header", "#nav a"] },
          { label: "(0,1,0) to (0,3,0)", children: [".btn", "a:hover", "input[type=\"email\"]", ".menu .item:hover"] },
          { label: "(0,0,1) to (0,0,2)", children: ["p", "ul li"] },
          { label: "(0,0,0)", children: ["* universal", ":where(.card)"] },
        ],
      },
    ],
    examples: [
      {
        title: "Why is my button still grey?",
        explanation: "You write .primary { background: blue; } but the button stays grey. Step 1: inspect it in DevTools; the Styles pane shows .primary crossed out. Step 2: the winning rule is .toolbar button { background: grey; }, score (0,1,1). Step 3: your rule is (0,1,0), so it loses. Fix: raise it to the same weight and place it later, or better, give the button one class and remove the nested toolbar rule so both are single classes.",
        code: {
          lang: "css",
          code: ".toolbar button { background: grey; }   /* (0,1,1) wins */\n.primary { background: blue; }          /* (0,1,0) loses */\n\n/* Fix: equal weight, written later */\n.toolbar .primary { background: blue; } /* (0,2,0) */",
        },
      },
      {
        title: "Two columns that refuse to sit side by side",
        explanation: "Two cards each have width: 50% and padding: 1rem. On screen, the second card drops below the first. Step 1: in content-box mode each card is 50% plus 2rem, so together they exceed 100%. Step 2: add the border-box reset. Step 3: now padding is inside the 50% and both fit. This reset is the first rule in almost every modern stylesheet.",
        code: {
          lang: "css",
          code: "*, *::before, *::after {\n  box-sizing: border-box;\n}\n.card {\n  width: 50%;\n  padding: 1rem;\n  float: left; /* or put both in a flex container */\n}",
        },
      },
    ],
    cheatSheet: [
      "Cascade order: importance > layers > specificity > source order",
      "Specificity (IDs, classes, types); compare left to right",
      "Pseudo-classes and [attributes] count as classes; ::before counts as a type",
      "*, *::before, *::after { box-sizing: border-box; }",
      "1rem = root font size (16px by default)",
      "Vertical margins between blocks collapse: 20px + 30px gives 30px",
      "Use :where() for zero-specificity defaults",
      "Avoid !important except for small utility overrides",
    ],
    quiz: [
      {
        q: "What is the specificity of .nav a:hover?",
        options: ["(0,1,1)", "(0,2,1)", "(1,1,1)", "(0,3,0)"],
        answer: 1,
        why: "One class plus one pseudo-class gives two in the class column, and a is one type.",
      },
      {
        q: "Two rules have identical specificity. Which wins?",
        options: ["The one that appears later in the CSS", "The one that appears first", "Neither applies", "The shorter rule"],
        answer: 0,
        why: "When everything else ties, source order decides and the last one wins.",
      },
      {
        q: "With box-sizing: border-box, a box has width 200px, padding 10px and border 2px. How wide is it on screen?",
        options: ["224px", "220px", "212px", "200px"],
        answer: 3,
        why: "Border-box includes padding and border inside the declared width.",
      },
      {
        q: "Why prefer rem over px for font sizes?",
        options: ["rem is faster to render", "px does not work on phones", "rem respects the user's browser font size setting", "rem cannot be overridden"],
        answer: 2,
        why: "rem scales with the root font size, so users who need bigger text get it.",
      },
      {
        q: "Which property is inherited by default?",
        options: ["padding", "color", "border", "margin"],
        answer: 1,
        why: "Text properties like color and font-family inherit; box properties do not.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write the specificity of each selector: (a) #main p, (b) .card .title, (c) a[href^=\"http\"], (d) li:first-child.",
        hint: "Count IDs, then classes, attributes and pseudo-classes, then element types.",
        solution: "(a) #main p        -> (1,0,1)\n(b) .card .title   -> (0,2,0)\n(c) a[href^=\"http\"] -> (0,1,1)\n(d) li:first-child  -> (0,1,1)",
      },
      {
        level: "medium",
        task: "Create a .btn class whose padding grows with its own font size, and a .btn-lg variant that only changes the font size.",
        hint: "Use em for padding so it follows the button's font size.",
        solution: ".btn {\n  font-size: 1rem;\n  padding: 0.5em 1em;\n  border: 1px solid currentColor;\n  border-radius: 0.375rem;\n}\n.btn-lg { font-size: 1.25rem; } /* padding scales automatically */",
      },
      {
        level: "hard",
        task: "A third-party widget sets .widget .title { color: red; }. You want your theme's titles to override it without !important or IDs, and still let later utilities override yours. Use cascade layers.",
        hint: "Styles not in any layer beat all layered styles. Later layers beat earlier layers.",
        solution: "@layer vendor, theme, utilities;\n@import url(\"widget.css\") layer(vendor);\n\n@layer theme {\n  .title { color: navy; } /* beats vendor despite lower specificity */\n}\n@layer utilities {\n  .text-green { color: green; }\n}",
      },
    ],
    faq: [
      { q: "Why does my margin-top leak out of the parent?", a: "That is margin collapsing: a child's top margin can merge with its parent's when nothing separates them. Add padding or a border to the parent, or make it a flex or grid container." },
      { q: "Is using IDs for styling bad?", a: "IDs work, but their high specificity makes them hard to override later. Use IDs for links and JavaScript hooks, and classes for styling." },
      { q: "What is the difference between rem and em?", a: "rem is relative to the root html font size, so it is the same everywhere. em is relative to the current element's font size, so it changes when nested inside bigger or smaller text." },
    ],
  },

  "html-css/flex-grid": {
    plain: [
      "Layout means deciding where boxes go. Modern CSS gives you two main tools. Flexbox lines up items in one direction, a row or a column. Grid places items in rows and columns at the same time, like cells in a spreadsheet.",
      "Use Flexbox when the content decides the layout: a nav bar where links take the space they need, or a row of buttons. Use Grid when the layout decides where content goes: a card gallery with equal columns, or a page with a header, sidebar and main area.",
      "Both work the same way at the start. You set display: flex or display: grid on the parent, called the container. Its direct children become items and follow the container's rules. You rarely need to position each child by hand.",
      "You can mix them freely. A page might use Grid for the overall shape, and Flexbox inside the header to line up the logo and the links. Choosing well comes from asking one question: am I arranging a line, or a two-dimensional pattern?",
    ],
    deepDive: [
      {
        heading: "How flex items grow and shrink",
        body: "Each flex item has three settings, usually written together as flex: grow shrink basis. Basis is the starting size before any space is shared. Grow says how much of the leftover space this item takes. Shrink says how much it gives up when space runs out.\n\nflex: 1 means 1 1 0%: start from zero and share space equally, so all items end up the same width. flex: auto means 1 1 auto: start from the content size, then share the rest, so wider content stays wider. flex: none means do not grow or shrink at all.\n\nItems also have min-width: auto by default, so long words or wide images can stop an item from shrinking. Setting min-width: 0 on the item often fixes overflow.",
        bullets: ["flex: 1 for equal columns", "flex: none for fixed-size items like icons", "min-width: 0 fixes overflowing text in flex items", "gap adds space between items without margins"],
        visual: {
          type: "compare",
          title: "Three common flex shorthands",
          columns: [
            { title: "flex: 1", points: ["Means 1 1 0%", "Starts from zero size", "Shares space equally", "Equal-width columns"] },
            { title: "flex: auto", points: ["Means 1 1 auto", "Starts from content size", "Shares the leftover space", "Wider content stays wider"] },
            { title: "flex: none", points: ["Means 0 0 auto", "Never grows", "Never shrinks", "Icons and fixed-size items"] },
          ],
        },
      },
      {
        heading: "Grid tracks: fr, minmax and auto-fill",
        body: "In Grid you describe the tracks (rows and columns) on the container. grid-template-columns: 200px 1fr gives a fixed 200px sidebar and a main column that takes the rest. The fr unit means a fraction of the free space after fixed tracks are placed.\n\nThe most useful pattern is repeat(auto-fill, minmax(220px, 1fr)). It says: fit as many columns as you can, each at least 220px, and stretch them to fill the row. The grid becomes responsive with no media queries. auto-fit is similar, but it collapses empty tracks so a few items stretch across the full row.",
      },
      {
        heading: "Alignment words that work in both",
        body: "Flexbox and Grid share alignment properties. justify-content moves the whole group along the main axis (in Grid, the row direction). align-items aligns each item on the cross axis. In Grid, justify-items does the same across columns, and place-items: center sets both at once.\n\nThis gives the classic one-line center: display: grid; place-items: center. For a nav bar, justify-content: space-between pushes the first and last items to the edges. To push a single flex item to the far end, give it margin-left: auto.",
      },
      {
        heading: "Named areas for page layouts",
        body: "grid-template-areas lets you draw the layout with words. Each string is a row, each word is a cell, and items claim an area with grid-area. Repeating a name makes the area span several cells, and a dot leaves a cell empty.\n\nThe best part is changing layouts. In a media query you redefine only the template, for example putting the sidebar under main on phones, and every item moves with no changes to the HTML.",
        visual: {
          type: "compare",
          title: "One HTML, two area templates",
          columns: [
            { title: "Desktop template", points: ["\"header header\"", "\"sidebar main\"", "\"footer footer\""] },
            { title: "Phone template (media query)", points: ["\"header\"", "\"main\"", "\"sidebar\"", "\"footer\""] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "Choosing a layout tool",
        steps: [
          { label: "Look at the design", detail: "Find the parent and its direct children" },
          { label: "One direction?", detail: "A row or a column of items" },
          { label: "Yes: Flexbox", detail: "Content size drives the layout" },
          { label: "No: Grid", detail: "Rows and columns must line up" },
          { label: "Nest freely", detail: "Grid for the page, Flexbox inside parts" },
        ],
      },
      {
        type: "tree",
        title: "Container vs item properties",
        root: "Layout properties",
        children: [
          { label: "Flex container", children: ["flex-direction", "flex-wrap", "justify-content", "align-items", "gap"] },
          { label: "Flex item", children: ["flex (grow shrink basis)", "align-self", "order"] },
          { label: "Grid container", children: ["grid-template-columns", "grid-template-areas", "gap", "place-items"] },
          { label: "Grid item", children: ["grid-column", "grid-row", "grid-area"] },
        ],
      },
    ],
    examples: [
      {
        title: "A card grid with no media queries",
        explanation: "You have 9 product cards. Step 1: make the list a grid. Step 2: use repeat(auto-fill, minmax(220px, 1fr)) so each column is at least 220px. On a 1000px wide container, 4 columns fit (4 x 220 = 880 plus gaps); on a 500px phone, 2 columns fit; on a 300px screen, 1 column. Step 3: add gap for spacing. The cards reflow on every screen size automatically.",
        code: {
          lang: "css",
          code: ".products {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));\n  gap: 1rem;\n}",
        },
      },
      {
        title: "A dashboard with named areas",
        explanation: "The dashboard needs a header across the top, a sidebar on the left and main content beside it. Step 1: draw it with grid-template-areas. Step 2: give each child its grid-area. Step 3: on small screens, stack everything in one column by changing only the template.",
        code: {
          lang: "css",
          code: ".dash {\n  display: grid;\n  grid-template-columns: 240px 1fr;\n  grid-template-areas: \"head head\" \"side main\";\n  min-height: 100vh;\n}\n.dash header { grid-area: head; }\n.dash aside  { grid-area: side; }\n.dash main   { grid-area: main; }\n@media (max-width: 48rem) {\n  .dash { grid-template-columns: 1fr;\n          grid-template-areas: \"head\" \"main\" \"side\"; }\n}",
        },
      },
    ],
    cheatSheet: [
      "Center anything: display: grid; place-items: center;",
      "Equal flex columns: give each item flex: 1",
      "Push one flex item to the end: margin-left: auto",
      "Responsive cards: repeat(auto-fill, minmax(220px, 1fr))",
      "Use gap for spacing in both Flexbox and Grid",
      "Long text overflowing a flex item? Add min-width: 0",
      "Span columns: grid-column: 1 / -1 stretches across the full grid",
    ],
    quiz: [
      {
        q: "Which tool fits a row of tags whose widths depend on their text?",
        options: ["Grid with fixed columns", "Flexbox with flex-wrap: wrap", "Absolute positioning", "A table"],
        answer: 1,
        why: "Flexbox lets content size drive the layout and wrap onto new lines.",
      },
      {
        q: "What does 1fr mean in grid-template-columns?",
        options: ["One pixel", "One font size", "Full row", "One share of the remaining free space"],
        answer: 3,
        why: "fr divides the space left after fixed tracks are sized.",
      },
      {
        q: "What does flex: 1 expand to?",
        options: ["1 1 0%", "1 0 auto", "0 0 auto", "1 1 auto"],
        answer: 0,
        why: "A zero basis with grow 1 makes all items share the space equally.",
      },
      {
        q: "To move the sidebar below main on phones in a grid-template-areas layout, you change...",
        options: ["The HTML order", "Each item's grid-area name", "Only grid-template-areas inside a media query", "The flex-direction"],
        answer: 2,
        why: "Items follow their named areas, so redrawing the template rearranges everything.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Build a nav bar: logo on the left, three links on the right, all vertically centered.",
        hint: "Flexbox with justify-content: space-between on the container.",
        solution: ".nav {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  padding: 0.75rem 1rem;\n}\n.nav ul { display: flex; gap: 1rem; list-style: none; margin: 0; }",
      },
      {
        level: "medium",
        task: "Create a classic \"holy grail\" layout: header, footer, a 200px left nav, main content and a 200px right sidebar. The footer must stay at the bottom even when main is short.",
        hint: "Use grid-template-rows: auto 1fr auto with min-height: 100vh.",
        solution: "body {\n  display: grid;\n  min-height: 100vh;\n  grid-template-columns: 200px 1fr 200px;\n  grid-template-rows: auto 1fr auto;\n  grid-template-areas: \"head head head\" \"nav main side\" \"foot foot foot\";\n}\nheader { grid-area: head; } nav { grid-area: nav; }\nmain { grid-area: main; } aside { grid-area: side; }\nfooter { grid-area: foot; }",
      },
      {
        level: "hard",
        task: "A chat row has an avatar (fixed 40px), a message that should take all remaining width, and a timestamp. Long unbroken words overflow the screen. Fix it with Flexbox.",
        hint: "Fixed items need flex: none; the growing item needs flex: 1 and min-width: 0.",
        solution: ".row { display: flex; gap: 0.5rem; align-items: flex-start; }\n.avatar { flex: none; width: 40px; height: 40px; }\n.message {\n  flex: 1;\n  min-width: 0;            /* allow shrinking below content size */\n  overflow-wrap: anywhere; /* break very long words */\n}\n.time { flex: none; font-size: 0.75rem; }",
      },
    ],
    faq: [
      { q: "Is Grid better than Flexbox?", a: "Neither is better; they solve different problems. Flexbox is for one-direction lines of items, Grid is for two-dimensional layouts, and most pages use both." },
      { q: "Should I still use floats for layout?", a: "No. Floats are now only for wrapping text around an image. Flexbox and Grid replaced them for layout." },
      { q: "Does the order property affect accessibility?", a: "Yes. order and grid placement change the visual order but not the reading or tab order, so keyboard users may jump around. Keep the HTML order logical." },
    ],
  },

  "html-css/responsive": {
    plain: [
      "A responsive page adapts to the screen it is on. The same HTML shows one column on a phone, two on a tablet and three on a laptop. You do not build separate sites; you write CSS that bends.",
      "Phones first need one line in the HTML head: the viewport meta tag. Without it, a phone pretends to be a 980px wide desktop and shrinks everything until it is unreadable. With it, the page uses the real device width.",
      "Mobile-first means you write the simple phone layout as your default, then add rules for bigger screens. It is like packing a small suitcase first, then adding extras when you have a bigger car. Small screens load less CSS logic, and the default always works.",
      "Media queries are the \"if\" statements of CSS: if the screen is at least 48rem wide, use two columns. Fluid tools like percentages, fr units and clamp() let sizes flow smoothly between those points so you need fewer of them.",
    ],
    deepDive: [
      {
        heading: "What the viewport tag fixes",
        body: "Early smartphones met a web built for desktops. To show those pages, mobile browsers render into a virtual window about 980px wide, then zoom out. That is why an old site looks tiny on a phone.\n\nThe meta tag name=\"viewport\" content=\"width=device-width, initial-scale=1\" tells the browser: my page is responsive, use the real device width in CSS pixels. A typical phone then reports about 360 to 430px, and your media queries fire as you expect. Never add maximum-scale=1 or user-scalable=no; that blocks people who need to pinch-zoom.",
        visual: {
          type: "compare",
          title: "With and without the viewport tag",
          columns: [
            { title: "No viewport tag", points: ["Renders into a ~980px virtual window", "Zooms out to fit the screen", "Text looks tiny", "Media queries see about 980px"] },
            { title: "width=device-width, initial-scale=1", points: ["Uses the real device width", "Phones report about 360 to 430px", "Text is readable size", "Media queries fire as expected"] },
          ],
        },
      },
      {
        heading: "Choosing breakpoints from content",
        body: "There is no official list of device sizes, and new devices appear every year. Instead, let the content choose. Start narrow, slowly widen the browser and add a breakpoint when the layout starts to look wrong: lines too long, cards too stretched, empty space.\n\nMost sites end up with two or three breakpoints, often around 40rem, 64rem and 80rem. Using rem in media queries means the layout also adapts when a user increases their font size, not just when the window changes.",
        bullets: ["Write min-width queries for mobile-first", "Use rem in queries so zoomed text gets more room", "Keep line length near 45 to 75 characters", "Two or three breakpoints are usually enough"],
      },
      {
        heading: "Fluid sizing with clamp()",
        body: "clamp(min, preferred, max) picks the preferred value but keeps it between the limits. For headings, clamp(1.75rem, 1rem + 3vw, 3rem) grows smoothly with the screen width, never smaller than 1.75rem, never bigger than 3rem. Mixing rem into the middle value keeps it responsive to user font settings.\n\nYou can use clamp for padding and gaps too, which removes many small media queries. For widths, the pattern width: min(100% - 2rem, 70rem) gives a centered container with side padding on phones and a maximum width on desktops.",
      },
      {
        heading: "Container queries",
        body: "Media queries ask about the whole screen. But a card might sit in a wide main area on one page and a narrow sidebar on another. Container queries let a component ask about its own parent instead.\n\nYou mark a parent with container-type: inline-size, then write @container (min-width: 30rem) { ... } for the children. Now the card switches to a horizontal layout whenever its container is wide enough, wherever it is placed. All modern browsers support this.",
        visual: {
          type: "compare",
          title: "Media query vs container query",
          columns: [
            { title: "@media (min-width: ...)", points: ["Asks about the whole viewport", "Same answer for every card on the page", "Good for page-level layout"] },
            { title: "@container (min-width: 30rem)", points: ["Asks about the parent's width", "Card adapts wherever it is placed", "Parent needs container-type: inline-size", "Good for reusable components"] },
          ],
        },
      },
      {
        heading: "Responsive images",
        body: "Large images are the heaviest part of most pages. Add max-width: 100% and height: auto so images never overflow their box. Then use srcset and sizes so the browser downloads a small file on phones and a big one on large screens. The browser picks the best file based on screen width and pixel density.",
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Mobile-first vs desktop-first",
        columns: [
          { title: "Mobile-first", points: ["Default CSS = phone layout", "Add features with min-width", "Simple base, extras layered on", "Phones never parse overrides they need"] },
          { title: "Desktop-first", points: ["Default CSS = wide layout", "Undo features with max-width", "Many overrides to strip things away", "Easy to forget a phone case"] },
        ],
      },
      {
        type: "layers",
        title: "Tools from least to most specific",
        layers: [
          { label: "Fluid units", detail: "%, fr, vw adapt with no rules" },
          { label: "Intrinsic layout", detail: "auto-fill grids and flex-wrap reflow" },
          { label: "clamp(), min(), max()", detail: "Smooth sizes with limits" },
          { label: "Container queries", detail: "Components adapt to their parent" },
          { label: "Media queries", detail: "Page-level changes at breakpoints" },
        ],
      },
    ],
    examples: [
      {
        title: "Mobile-first article layout",
        explanation: "Step 1: by default, the article and its sidebar stack in one column, and the container has a 1rem gap on each side. Step 2: from 48rem (768px at the default font size) the sidebar moves to the right as a 16rem column. Step 3: the heading scales smoothly with clamp, so there is no jump at the breakpoint.",
        code: {
          lang: "css",
          code: ".page {\n  width: min(100% - 2rem, 70rem);\n  margin-inline: auto;\n  display: grid;\n  gap: 2rem;\n}\nh1 { font-size: clamp(1.75rem, 1rem + 3vw, 3rem); }\n\n@media (min-width: 48rem) {\n  .page { grid-template-columns: 1fr 16rem; }\n}",
        },
      },
      {
        title: "Serving the right image size",
        explanation: "A hero image is 2400px wide (900 KB). On a 390px phone that is wasted data. Step 1: export three versions: 600, 1200 and 2400px. Step 2: list them in srcset with their widths. Step 3: sizes tells the browser the image fills the screen width up to 70rem. A phone with 3x density picks the 1200px file; a laptop picks 2400px.",
        code: {
          lang: "html",
          code: "<img\n  src=\"hero-1200.jpg\"\n  srcset=\"hero-600.jpg 600w, hero-1200.jpg 1200w, hero-2400.jpg 2400w\"\n  sizes=\"(min-width: 70rem) 70rem, 100vw\"\n  alt=\"Team working around a table\"\n  width=\"2400\" height=\"1200\"\n/>",
        },
      },
    ],
    cheatSheet: [
      "meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"",
      "Mobile-first: base styles, then @media (min-width: ...)",
      "Use rem breakpoints such as 40rem, 64rem, 80rem",
      "img { max-width: 100%; height: auto; }",
      "Centered container: width: min(100% - 2rem, 70rem); margin-inline: auto;",
      "Fluid type: font-size: clamp(min, rem + vw, max)",
      "Never disable pinch-zoom with user-scalable=no",
    ],
    quiz: [
      {
        q: "What happens on a phone if the viewport meta tag is missing?",
        options: ["The page will not load", "Media queries work normally", "The phone renders a wide virtual page and zooms out", "Images are hidden"],
        answer: 2,
        why: "Without the tag, mobile browsers assume a desktop-width page of about 980px.",
      },
      {
        q: "In mobile-first CSS, which query adds a desktop layout?",
        options: ["@media (min-width: 64rem)", "@media (max-width: 64rem)", "@media print", "@media (orientation: portrait)"],
        answer: 0,
        why: "Mobile-first builds up from small screens using min-width.",
      },
      {
        q: "What does a container query respond to?",
        options: ["The device type", "The size of a parent element marked as a container", "The user's location", "The page's scroll position"],
        answer: 1,
        why: "Container queries let a component adapt to the space it is given, not the whole screen.",
      },
      {
        q: "Why use rem rather than px in media queries?",
        options: ["px is not allowed in queries", "rem queries are faster", "rem is required for clamp()", "The layout adapts when users increase their default font size"],
        answer: 3,
        why: "rem breakpoints move with the user's font setting, giving larger text more room.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Make a list of feature boxes stack in one column on phones and show three columns from 64rem up.",
        hint: "Default to a single-column grid, then change grid-template-columns in a min-width query.",
        solution: ".features { display: grid; gap: 1rem; }\n@media (min-width: 64rem) {\n  .features { grid-template-columns: repeat(3, 1fr); }\n}",
      },
      {
        level: "medium",
        task: "Make the page padding and h1 size scale smoothly: padding from 1rem to 3rem, h1 from 2rem to 3.5rem, with no media queries.",
        hint: "Use clamp() with a vw-based middle value.",
        solution: "body { padding: clamp(1rem, 4vw, 3rem); }\nh1 { font-size: clamp(2rem, 1.25rem + 3vw, 3.5rem); }",
      },
      {
        level: "hard",
        task: "A .product card should be vertical (image on top) when its container is narrow, and horizontal (image left, text right) when its container is at least 32rem wide, in any part of the site.",
        hint: "Set container-type on the wrapper and use @container in the card styles.",
        solution: ".product-wrap { container-type: inline-size; }\n.product { display: grid; gap: 1rem; }\n@container (min-width: 32rem) {\n  .product { grid-template-columns: 12rem 1fr; align-items: center; }\n}",
      },
    ],
    faq: [
      { q: "What breakpoints should I use?", a: "Add breakpoints where your content breaks, not for specific devices. Two or three, such as 40rem, 64rem and 80rem, cover most designs." },
      { q: "Do I still need media queries with Flexbox and Grid?", a: "Fewer than before. auto-fill grids, flex-wrap and clamp() handle a lot, but big structural changes like moving a sidebar still need a media or container query." },
      { q: "How do I test responsive layouts?", a: "Use the device toolbar in browser DevTools to try many widths, then check on at least one real phone, because touch, fonts and the address bar behave differently there." },
    ],
  },

  "html-css/a11y": {
    plain: [
      "Accessibility (often written a11y, with 11 letters between a and y) means people can use your site whatever their abilities. That includes blind users with screen readers, people who cannot use a mouse, people with low vision or color blindness, and anyone in bright sunlight with a cracked phone.",
      "About one in six people has a disability. Many countries also have laws requiring accessible websites. And the fixes usually help everyone: captions help in noisy places, good contrast helps on dim screens, and keyboard support helps power users.",
      "The good news is that most problems come from a short list: missing text for images, missing form labels, low contrast, things you cannot reach with the keyboard and no visible focus. Learning to spot these five catches the majority of real issues.",
      "Automated tools like axe and Lighthouse find maybe a third of problems quickly. The rest you find by using the page yourself: unplug the mouse and press Tab, zoom to 200%, and try a screen reader for five minutes. It is the fastest way to build empathy and skill.",
    ],
    deepDive: [
      {
        heading: "The four principles: POUR",
        body: "The WCAG guidelines are grouped under four ideas. Perceivable: people can sense the content, so images have text alternatives and videos have captions. Operable: people can use it, with a keyboard, without time pressure, without flashing content. Understandable: text is clear, forms explain errors, and the page behaves predictably. Robust: it works with many browsers and assistive tools, which mostly means valid, semantic HTML.\n\nEach guideline has levels A, AA and AAA. Most laws and companies aim for level AA, which includes the contrast and keyboard rules in this topic.",
        bullets: ["Perceivable: can I see or hear it?", "Operable: can I use it with my input device?", "Understandable: does it make sense?", "Robust: does it work with assistive tech?"],
        visual: {
          type: "tree",
          title: "POUR: the four WCAG principles",
          root: "WCAG",
          children: [
            { label: "Perceivable", children: ["Text alternatives for images", "Captions for video"] },
            { label: "Operable", children: ["Works with a keyboard", "No time pressure", "No flashing content"] },
            { label: "Understandable", children: ["Clear text", "Forms explain errors", "Predictable behavior"] },
            { label: "Robust", children: ["Valid, semantic HTML", "Works with assistive tools"] },
          ],
        },
      },
      {
        heading: "Keyboard and focus",
        body: "Keyboard users move with Tab and Shift+Tab, press Enter or Space to activate, and use arrow keys inside menus and radio groups. Native buttons, links and inputs are focusable automatically. A div is not.\n\nTwo rules matter most. First, never remove the focus outline without a replacement; use :focus-visible to show a clear ring for keyboard users without showing it on mouse clicks. Second, keep the tab order logical by keeping the HTML order logical. Avoid positive tabindex values; use tabindex=\"0\" only to make a custom widget focusable, and tabindex=\"-1\" for elements you focus with code, like a dialog heading.",
      },
      {
        heading: "ARIA: the first rule",
        body: "ARIA attributes add roles, names and states to the accessibility tree. They are powerful, but the first rule of ARIA is: do not use ARIA if a native element does the job. ARIA changes only what is announced; it adds no keyboard behavior.\n\nGood uses are small and specific: aria-label=\"Close\" on an icon-only button, aria-expanded=\"true\" on a button that opens a menu, aria-live=\"polite\" on a region that shows status messages, and aria-describedby to link an input to its error text. Wrong ARIA is worse than none, because it tells assistive tech something untrue.",
      },
      {
        heading: "Contrast and color",
        body: "WCAG AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (about 24px, or 19px bold) and for UI parts like input borders and focus rings. Light grey text on white often fails.\n\nNever use color alone to carry meaning. A red border on an invalid field needs an icon or a message too, because about 1 in 12 men has some color vision deficiency. DevTools shows the contrast ratio when you hover a color in the Styles pane.",
      },
    ],
    moreVisuals: [
      {
        type: "sequence",
        title: "How a screen reader announces a button",
        actors: ["Page code", "Browser", "Screen reader", "User"],
        messages: [
          { from: 0, to: 1, label: "Renders button Menu, aria-expanded=\"false\"" },
          { from: 3, to: 2, label: "Presses Tab" },
          { from: 1, to: 2, label: "Focused: role button, name Menu, collapsed" },
          { from: 2, to: 3, label: "Says \"Menu, button, collapsed\"" },
          { from: 3, to: 1, label: "Presses Enter (click event)" },
          { from: 1, to: 0, label: "Runs the click handler" },
          { from: 0, to: 1, label: "Sets aria-expanded=\"true\"" },
          { from: 1, to: 2, label: "State changed: expanded" },
        ],
      },
      {
        type: "tree",
        title: "A quick manual audit",
        root: "Test the page",
        children: [
          { label: "Keyboard", children: ["Tab through everything", "Focus always visible", "No keyboard traps"] },
          { label: "Eyes", children: ["Contrast 4.5:1 for text", "Zoom to 200%", "Meaning not by color alone"] },
          { label: "Screen reader", children: ["Headings list makes sense", "Buttons and links have names", "Images have useful alt"] },
          { label: "Automated", children: ["axe DevTools", "Lighthouse accessibility score"] },
        ],
      },
    ],
    examples: [
      {
        title: "Fixing an icon-only search button",
        explanation: "A header has a magnifying-glass icon that opens search. It is a div with an SVG inside. Step 1: Tab through the page; focus skips it entirely. Step 2: change it to a button with type=\"button\", which is focusable and responds to Enter and Space. Step 3: a screen reader now says just \"button\", because the icon has no text. Add aria-label=\"Search\". Step 4: hide the decorative SVG from assistive tech with aria-hidden=\"true\". Step 5: check it shows a clear focus ring.",
        code: {
          lang: "html",
          code: "<!-- Before -->\n<div class=\"icon\" onclick=\"openSearch()\"><svg>...</svg></div>\n\n<!-- After -->\n<button type=\"button\" class=\"icon\" aria-label=\"Search\" onclick=\"openSearch()\">\n  <svg aria-hidden=\"true\" focusable=\"false\">...</svg>\n</button>",
        },
      },
      {
        title: "Accessible error messages",
        explanation: "A sign-up form marks a bad email with a red border only. Step 1: add a visible message under the field. Step 2: connect the message to the input with aria-describedby so a screen reader reads it when the field gets focus. Step 3: set aria-invalid=\"true\" so the field is announced as invalid. Step 4: on submit, move focus to the first invalid field so keyboard users land right on the problem.",
        code: {
          lang: "html",
          code: "<label for=\"email\">Email</label>\n<input id=\"email\" type=\"email\" aria-invalid=\"true\" aria-describedby=\"email-err\" />\n<p id=\"email-err\" class=\"error\">Enter an email like name@example.com</p>",
        },
      },
    ],
    cheatSheet: [
      "Text contrast: 4.5:1 normal, 3:1 large text and UI parts (WCAG AA)",
      "Decorative image: alt=\"\"; meaningful image: describe its purpose",
      "Use :focus-visible for focus rings; never just outline: none",
      "First rule of ARIA: prefer a native element",
      "Icon-only button needs aria-label or visually hidden text",
      "Status messages: put them in an aria-live=\"polite\" region",
      "Avoid tabindex values above 0",
      "Test with Tab, 200% zoom, a screen reader and axe",
    ],
    quiz: [
      {
        q: "Which of these does ARIA NOT give you?",
        options: ["A role for assistive tech", "An accessible name", "Keyboard behavior like Enter to activate", "A state like expanded"],
        answer: 2,
        why: "ARIA only changes what is announced; you must add keyboard handling yourself, which is why native elements are better.",
      },
      {
        q: "A product photo links to the product page. What alt text is best?",
        options: ["\"image\"", "\"Blue running shoe, view product\"", "alt=\"\" (empty)", "The file name"],
        answer: 1,
        why: "When an image is a link, its alt text is the link's name, so it must describe the destination.",
      },
      {
        q: "What does the O in POUR stand for?",
        options: ["Operable", "Optimised", "Organised", "Optional"],
        answer: 0,
        why: "Operable means people can use the interface with their input method, like a keyboard.",
      },
      {
        q: "Why is a red border alone a poor way to show an error?",
        options: ["Red is not allowed by WCAG", "Borders are not focusable", "Screen readers read colors aloud", "Color-blind and screen reader users may not notice it"],
        answer: 3,
        why: "Meaning should not rely on color alone; add text and programmatic hints.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write alt text for: (a) a company logo in the header linking home, (b) a decorative wave divider, (c) a chart showing sales doubling in 2025.",
        hint: "Ask what the image does on the page, not what it looks like.",
        solution: "(a) alt=\"Acme home\"            (link: describe the destination)\n(b) alt=\"\"                     (decorative: skip it)\n(c) alt=\"Sales doubled from 2024 to 2025\" (state the takeaway)",
      },
      {
        level: "medium",
        task: "Write CSS that shows a 3px blue focus ring for keyboard users on buttons and links, without showing it on mouse clicks.",
        hint: "Use the :focus-visible pseudo-class and outline-offset.",
        solution: "a:focus-visible,\nbutton:focus-visible {\n  outline: 3px solid #1d4ed8;\n  outline-offset: 2px;\n}",
      },
      {
        level: "hard",
        task: "Build a disclosure: a button \"Show details\" that toggles a hidden panel. It must announce its state to screen readers and work with the keyboard.",
        hint: "Use a native button, aria-expanded and aria-controls, and the hidden attribute.",
        solution: "<button type=\"button\" aria-expanded=\"false\" aria-controls=\"more\">Show details</button>\n<div id=\"more\" hidden>Shipping takes 3 to 5 days.</div>\n<script>\n  const btn = document.querySelector(\"[aria-controls=more]\");\n  const panel = document.getElementById(\"more\");\n  btn.addEventListener(\"click\", () => {\n    const open = btn.getAttribute(\"aria-expanded\") === \"true\";\n    btn.setAttribute(\"aria-expanded\", String(!open));\n    panel.hidden = open;\n  });\n</script>",
      },
    ],
    faq: [
      { q: "Is a 100 Lighthouse accessibility score enough?", a: "No. Automated tools catch only some issues, such as missing alt text or low contrast. You still need keyboard and screen reader testing to find problems like confusing focus order." },
      { q: "Which screen reader should I test with?", a: "Use what is built in: VoiceOver on macOS and iOS, Narrator on Windows, or TalkBack on Android. NVDA is a free and popular choice on Windows." },
      { q: "Do I need to make my site meet AAA?", a: "Usually not. AA is the common target in laws and company policies. Some AAA criteria are impossible for certain content." },
    ],
  },

  // ───────────────────────── JavaScript ─────────────────────────
  "javascript/js-core": {
    plain: [
      "JavaScript is the programming language that runs in every web browser. HTML is the structure, CSS is the look, and JavaScript is the behavior: what happens when you click, type or load data.",
      "Most of your code works with a few building blocks. Values are pieces of data like 42, \"hello\" or true. Variables are names that point to values. Functions are reusable steps. Objects group related values by name, and arrays keep values in order.",
      "Modern JavaScript gives you short, safe ways to do common jobs. const and let create variables. Arrow functions are compact. Destructuring pulls values out of objects. Methods like map and filter turn one list into another without writing loops by hand.",
      "A big idea to grasp early is that objects and arrays are shared by reference. Two variables can point to the same object, like two people holding the address of one house. Change the house through one address and the other person sees the change too.",
    ],
    deepDive: [
      {
        heading: "Primitives vs references",
        body: "JavaScript has seven primitive types: string, number, bigint, boolean, undefined, null and symbol. Primitives are copied by value. let b = a with a number gives b its own copy.\n\nEverything else is an object, including arrays and functions. A variable holding an object stores a reference, like an address. const b = a now gives two names for one object, so b.push(4) also changes a. To get a separate copy, spread it ([...a] or {...obj}) for a shallow copy, or use structuredClone(obj) for a deep copy with nested objects.\n\nThis is also why === on two different objects with the same contents is false: it compares addresses, not contents.",
        bullets: ["Primitives: copied by value", "Objects and arrays: shared by reference", "Spread makes a shallow copy", "structuredClone makes a deep copy"],
      },
      {
        heading: "Scope and closures",
        body: "Scope is where a variable can be seen. let and const are block-scoped: a variable declared inside { } exists only there. Functions can read variables from the scopes around them.\n\nA closure happens when a function keeps using those outer variables after the outer function has finished. The inner function carries a backpack of the variables it needs. That is how a counter function can remember its count between calls, and how event handlers remember the data they were created with.\n\nClosures are everywhere in React too: every handler and effect closes over the props and state of the render that created it.",
        visual: {
          type: "flow",
          title: "How a counter closure remembers",
          steps: [
            { label: "Call makeCounter()", detail: "Creates let count = 0" },
            { label: "Return inner function", detail: "It uses count" },
            { label: "makeCounter finishes", detail: "count stays alive in the closure" },
            { label: "Call counter()", detail: "count becomes 1" },
            { label: "Call counter() again", detail: "count becomes 2" },
          ],
        },
      },
      {
        heading: "What this means",
        body: "this is decided by how a regular function is called, not where it is written. Called as obj.method(), this is obj. Called as a plain function, this is undefined in strict mode. Passed as a callback, it often loses its object.\n\nArrow functions do not have their own this. They use the this of the code around them. That makes arrows ideal for callbacks inside methods, and a poor choice for object methods that need this themselves.",
        visual: {
          type: "tree",
          title: "What this is, by how a function is called",
          root: "Value of this",
          children: [
            { label: "obj.method()", children: ["this is obj"] },
            { label: "Plain call fn()", children: ["undefined in strict mode"] },
            { label: "Passed as a callback", children: ["Often loses its object"] },
            { label: "Arrow function", children: ["No own this", "Uses the surrounding this"] },
          ],
        },
      },
      {
        heading: "Equality and truthiness",
        body: "Use === and !== for comparisons. The loose == converts types first, so 0 == \"\" is true, which surprises people. Only null == undefined is a common, intended loose check.\n\nIn conditions, six values count as false (falsy): false, 0, \"\" (empty string), null, undefined and NaN. Everything else is truthy, including \"0\", [] and {}. Use ?? (nullish coalescing) for defaults when 0 or \"\" are valid values, because || would replace them.",
        bullets: ["count || 10 gives 10 when count is 0", "count ?? 10 keeps 0 and only replaces null or undefined", "user?.address?.city returns undefined instead of crashing"],
      },
    ],
    moreVisuals: [
      {
        type: "compare",
        title: "Copying a primitive vs an object",
        columns: [
          { title: "let b = a (number)", points: ["b gets its own copy", "b = 5 leaves a unchanged", "=== compares values", "Like photocopying a note"] },
          { title: "const b = a (object)", points: ["b points to the same object", "b.x = 5 changes a.x too", "=== compares addresses", "Like sharing a house key"] },
        ],
      },
      {
        type: "flow",
        title: "A data pipeline with array methods",
        steps: [
          { label: "orders", detail: "Raw array of 100 order objects" },
          { label: "filter", detail: "Keep orders with status paid" },
          { label: "map", detail: "Turn each order into its total" },
          { label: "reduce", detail: "Add totals into one number" },
          { label: "Result", detail: "Revenue, with the original array untouched" },
        ],
      },
    ],
    examples: [
      {
        title: "Summarising a shopping cart",
        explanation: "A cart is an array of items with a price and quantity. Step 1: map each item to price times quantity. Step 2: reduce those line totals into one sum, starting from 0. Step 3: filter items over 50 to show a \"big items\" list. Step 4: destructure in the callback parameters to keep it readable. None of these steps change the original cart.",
        code: {
          lang: "js",
          code: "const cart = [\n  { name: \"Shoes\", price: 60, qty: 1 },\n  { name: \"Socks\", price: 5, qty: 3 },\n];\nconst lines = cart.map(({ price, qty }) => price * qty); // [60, 15]\nconst total = lines.reduce((sum, n) => sum + n, 0);       // 75\nconst big = cart.filter((item) => item.price > 50);       // [Shoes]\nconsole.log(\"Total: \" + total);",
        },
      },
      {
        title: "A counter that remembers with a closure",
        explanation: "makeCounter creates a variable count, then returns a function that uses it. Step 1: call makeCounter() and store the returned function. Step 2: each call adds 1 to the same count, because the inner function kept a reference to it. Step 3: a second counter gets its own separate count. Nobody outside can change count directly, so it is private.",
        code: {
          lang: "js",
          code: "function makeCounter() {\n  let count = 0;\n  return () => {\n    count += 1;\n    return count;\n  };\n}\nconst a = makeCounter();\na(); a(); // 2\nconst b = makeCounter();\nb();      // 1, separate count",
        },
      },
    ],
    cheatSheet: [
      "Default to const; use let only when you reassign",
      "Always compare with === and !==",
      "Falsy: false, 0, \"\", null, undefined, NaN; everything else is truthy",
      "Use ?? for defaults when 0 or \"\" are valid",
      "obj?.a?.b stops at null or undefined instead of throwing",
      "map returns a new array; forEach returns undefined",
      "Shallow copy: [...arr], {...obj}; deep copy: structuredClone(obj)",
      "sort() changes the array in place; use toSorted() for a copy",
    ],
    quiz: [
      {
        q: "const a = [1, 2]; const b = a; b.push(3); What is a?",
        options: ["[1, 2]", "[3]", "[1, 2, 3]", "An error, because a is const"],
        answer: 2,
        why: "a and b point to the same array, and const only stops reassignment.",
      },
      {
        q: "What does 0 ?? 5 return?",
        options: ["0", "5", "null", "true"],
        answer: 0,
        why: "?? only replaces null or undefined, and 0 is neither.",
      },
      {
        q: "Which value is truthy?",
        options: ["0", "\"\"", "null", "[]"],
        answer: 3,
        why: "Every object, including an empty array, is truthy.",
      },
      {
        q: "Why do arrow functions work well as callbacks inside methods?",
        options: ["They run faster", "They use the this of the surrounding code", "They cannot return values", "They are hoisted"],
        answer: 1,
        why: "Arrows have no own this, so they keep the method's this.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Given const users = [{ name: \"Ana\", age: 17 }, { name: \"Ben\", age: 25 }, { name: \"Cy\", age: 31 }], get an array of names of users aged 18 or older.",
        hint: "Chain filter, then map.",
        solution: "const adults = users\n  .filter((u) => u.age >= 18)\n  .map((u) => u.name);\n// [\"Ben\", \"Cy\"]",
      },
      {
        level: "medium",
        task: "Write countBy(words) that returns an object counting each word, so countBy([\"a\", \"b\", \"a\"]) gives { a: 2, b: 1 }.",
        hint: "Use reduce with an empty object as the starting value.",
        solution: "function countBy(words) {\n  return words.reduce((acc, w) => {\n    acc[w] = (acc[w] ?? 0) + 1;\n    return acc;\n  }, {});\n}",
      },
      {
        level: "hard",
        task: "Write once(fn) that returns a new function which calls fn only the first time and returns that first result on every later call.",
        hint: "Use a closure to store whether it has run and what it returned.",
        solution: "function once(fn) {\n  let done = false;\n  let result;\n  return (...args) => {\n    if (!done) {\n      result = fn(...args);\n      done = true;\n    }\n    return result;\n  };\n}",
      },
    ],
    faq: [
      { q: "Should I use var?", a: "No. var is function-scoped and hoisted in confusing ways. Use const by default and let when you need to reassign." },
      { q: "What is the difference between null and undefined?", a: "undefined usually means a value was never set. null is a value you set on purpose to mean \"nothing here\"." },
      { q: "Is JavaScript the same as Java?", a: "No. They share some syntax and a similar name for historical marketing reasons, but they are separate languages with different uses." },
    ],
  },

  "javascript/js-dom": {
    plain: [
      "When a browser loads HTML, it builds a live model of the page in memory called the DOM (Document Object Model). Each tag becomes an object, a node, in a tree. JavaScript can read and change that tree, and the screen updates to match.",
      "So the DOM is the bridge between your code and what people see. Want to change some text? Find the node and set its textContent. Want a new list item? Create an element and append it. Want to hide a panel? Toggle a class.",
      "Events are how the page tells your code that something happened: a click, a key press, a form submit, the page finishing loading. You attach a listener, which is a function the browser calls when that event fires.",
      "Think of the DOM as a puppet and events as the strings pulled by the user. Your listener feels the pull and moves the puppet. Frameworks like React do this for you behind the scenes, but knowing the raw version makes their behavior much easier to understand.",
    ],
    deepDive: [
      {
        heading: "Finding and changing elements",
        body: "document.querySelector(selector) returns the first element matching a CSS selector, or null. querySelectorAll returns a static list of all matches that you can loop over with forEach or for...of.\n\nTo change content, prefer textContent, which inserts plain text safely. innerHTML parses a string as HTML, which is handy for trusted templates but dangerous with user input, because a value like an img tag with an onerror attribute could run script. For classes, use element.classList.add, remove and toggle instead of rewriting className. For data, use data- attributes, read through element.dataset.",
        bullets: ["querySelector returns one element or null", "textContent for user data, never innerHTML", "classList.toggle(\"open\") to show and hide", "dataset.id reads data-id"],
      },
      {
        heading: "Capture, target, bubble",
        body: "An event travels in three phases. First it goes down from the window to the clicked element (capture). Then it reaches the element itself (target). Then it bubbles back up through every ancestor. By default, listeners run during bubbling.\n\nevent.target is the deepest element that was actually clicked, maybe an icon inside a button. event.currentTarget is the element whose listener is running now. element.closest(selector) walks up from target to find the nearest matching ancestor, which is the key tool for delegation.\n\nevent.stopPropagation() stops bubbling, but use it rarely, because other code may depend on the event reaching it.",
      },
      {
        heading: "Default actions",
        body: "Some events have a built-in browser action. Clicking a link navigates. Submitting a form reloads the page with a request. Pressing Space scrolls. event.preventDefault() cancels that default so your code can handle it, for example submitting a form with fetch instead.\n\nRead form values with new FormData(form), which collects every named field. Listen for submit on the form, not click on the button, so pressing Enter in a field also works.",
        visual: {
          type: "sequence",
          title: "Submitting a form with fetch",
          actors: ["User", "Form", "Submit handler", "Server"],
          messages: [
            { from: 0, to: 1, label: "Presses Enter in a field" },
            { from: 1, to: 2, label: "submit event" },
            { from: 2, to: 1, label: "preventDefault(): no page reload" },
            { from: 2, to: 3, label: "fetch with new FormData(form)" },
            { from: 3, to: 2, label: "Response" },
            { from: 2, to: 0, label: "Shows the result on the page" },
          ],
        },
      },
      {
        heading: "Doing DOM work efficiently",
        body: "Each change to the DOM can make the browser recalculate layout. Changing many things one by one is fine for small pages, but adding 1,000 list items one at a time is slow. Build them in a DocumentFragment or an array of elements, then append once with append(...items).\n\nAlso avoid reading layout (like offsetHeight) right after writing styles in a loop, because it forces the browser to lay out the page again each time.",
        visual: {
          type: "compare",
          title: "Adding 1,000 list items",
          columns: [
            { title: "One at a time", points: ["1,000 separate DOM changes", "Layout may be recalculated often", "Slow on big lists"] },
            { title: "Fragment or array, append once", points: ["Build items off the page", "append(...items) once", "One change to the live DOM"] },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "HTML becomes a tree of nodes",
        root: "document",
        children: [
          { label: "html", children: ["head", "body"] },
          { label: "body", children: ["h1 (element node)", "ul#todo", "button.add"] },
          { label: "ul#todo", children: ["li", "li", "li"] },
          { label: "li", children: ["\"Buy milk\" (text node)"] },
        ],
      },
      {
        type: "sequence",
        title: "Event delegation on a to-do list",
        actors: ["User", "li > button", "ul listener", "Your code"],
        messages: [
          { from: 0, to: 1, label: "Clicks Delete on item 3" },
          { from: 1, to: 2, label: "Click bubbles up to the ul" },
          { from: 2, to: 3, label: "Calls handler with event" },
          { from: 3, to: 1, label: "target.closest(\"li\") finds the item" },
          { from: 3, to: 2, label: "Removes that li from the list" },
        ],
      },
    ],
    examples: [
      {
        title: "A character counter for a textarea",
        explanation: "A tweet box allows 280 characters. Step 1: select the textarea and the counter paragraph. Step 2: listen for the input event, which fires on every change, including paste. Step 3: compute remaining characters and write them with textContent. Step 4: toggle a warning class when fewer than 20 are left so CSS can turn it red.",
        code: {
          lang: "js",
          code: "const box = document.querySelector(\"#tweet\");\nconst counter = document.querySelector(\"#left\");\n\nbox.addEventListener(\"input\", () => {\n  const left = 280 - box.value.length;\n  counter.textContent = left + \" characters left\";\n  counter.classList.toggle(\"warn\", left < 20);\n});",
        },
      },
      {
        title: "Submitting a form without a page reload",
        explanation: "Step 1: listen for submit on the form. Step 2: call preventDefault so the browser does not reload. Step 3: collect the fields with FormData and turn them into a plain object. Step 4: send them with fetch and show a message. Listening on submit means pressing Enter works too.",
        code: {
          lang: "js",
          code: "const form = document.querySelector(\"#contact\");\nform.addEventListener(\"submit\", async (event) => {\n  event.preventDefault();\n  const data = Object.fromEntries(new FormData(form));\n  await fetch(\"/api/contact\", {\n    method: \"POST\",\n    headers: { \"Content-Type\": \"application/json\" },\n    body: JSON.stringify(data),\n  });\n  form.reset();\n  document.querySelector(\"#status\").textContent = \"Thanks, message sent!\";\n});",
        },
      },
    ],
    cheatSheet: [
      "document.querySelector(\".card\") returns the first match or null",
      "el.textContent = value is safe; el.innerHTML = userValue is not",
      "el.classList.toggle(\"open\", condition) adds or removes by condition",
      "event.target = what was clicked; event.currentTarget = element with the listener",
      "event.target.closest(\"li\") finds the nearest matching ancestor",
      "Listen to submit on forms and call event.preventDefault()",
      "Object.fromEntries(new FormData(form)) gives a plain object of fields",
      "Put scripts at the end of body or use the defer attribute",
    ],
    quiz: [
      {
        q: "A user clicks an icon inside a button with a listener. What is event.target?",
        options: ["The icon", "The button", "The document", "The window"],
        answer: 0,
        why: "target is the deepest element actually clicked; currentTarget would be the button.",
      },
      {
        q: "Why listen for submit instead of click on the submit button?",
        options: ["click does not bubble", "submit also fires when the user presses Enter in a field", "click cannot be prevented", "submit is faster"],
        answer: 1,
        why: "The form submit event covers every way of submitting, including the keyboard.",
      },
      {
        q: "What does event.preventDefault() do on a link click?",
        options: ["Stops the event bubbling", "Removes the link", "Stops the browser from navigating", "Reloads the page"],
        answer: 2,
        why: "It cancels the default browser action, which for a link is navigation.",
      },
      {
        q: "Your script runs in the head and querySelector returns null. Most likely cause?",
        options: ["The selector is too specific", "The browser does not support it", "IDs cannot be selected", "The element has not been parsed yet when the script runs"],
        answer: 3,
        why: "Scripts in the head run before the body exists unless you use defer or wait for DOMContentLoaded.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Make a button with id \"theme\" toggle a class \"dark\" on the body each time it is clicked.",
        hint: "classList.toggle adds the class if missing and removes it if present.",
        solution: "document.querySelector(\"#theme\").addEventListener(\"click\", () => {\n  document.body.classList.toggle(\"dark\");\n});",
      },
      {
        level: "medium",
        task: "Given an array of fruit names, render them as li elements into ul#fruits using a single append call.",
        hint: "map each name to a new li, then spread the array into append.",
        solution: "const fruits = [\"Apple\", \"Mango\", \"Kiwi\"];\nconst items = fruits.map((name) => {\n  const li = document.createElement(\"li\");\n  li.textContent = name;\n  return li;\n});\ndocument.querySelector(\"#fruits\").append(...items);",
      },
      {
        level: "hard",
        task: "Build tabs: buttons with data-tab=\"a\", \"b\", \"c\" inside div.tabs, and panels with ids a, b and c. One listener on .tabs should show the matching panel and hide the others.",
        hint: "Use event delegation with closest(\"button\") and the hidden property on panels.",
        solution: "const tabs = document.querySelector(\".tabs\");\ntabs.addEventListener(\"click\", (e) => {\n  const btn = e.target.closest(\"button[data-tab]\");\n  if (!btn) return;\n  document.querySelectorAll(\".panel\").forEach((p) => {\n    p.hidden = p.id !== btn.dataset.tab;\n  });\n  tabs.querySelectorAll(\"button\").forEach((b) =>\n    b.setAttribute(\"aria-selected\", String(b === btn)));\n});",
      },
    ],
    faq: [
      { q: "What is the difference between the DOM and HTML?", a: "HTML is the text file you write. The DOM is the live tree the browser builds from it, which JavaScript can change without touching the original file." },
      { q: "Why does my listener not work on items I add later?", a: "If you attached listeners to each item at the start, new items never got one. Use event delegation: one listener on the parent handles current and future children." },
      { q: "Do I still need to learn DOM APIs if I use React?", a: "Yes, at least the basics. React manages the DOM for you, but refs, events, focus handling and debugging all rely on knowing what the DOM is doing." },
    ],
  },

  "javascript/js-async": {
    plain: [
      "Some work takes time: downloading data, waiting for a timer, reading a file. JavaScript in the browser runs on one main thread, so if it simply waited, the whole page would freeze. Instead, it starts the slow job, keeps going, and handles the result later.",
      "A promise is the object that represents that later result. Think of the buzzer a restaurant gives you while your food is cooked. You can sit down and chat. When it buzzes, the food is ready, or the kitchen tells you something went wrong.",
      "async and await are a nicer way to write promise code. Inside an async function, await pauses that function until the promise settles, without blocking the rest of the page. Your code reads top to bottom like normal steps.",
      "fetch is the built-in way to make HTTP requests. A good fetch always handles three states the user can see: loading (show a spinner), success (show the data) and error (show a message and a way to retry).",
    ],
    deepDive: [
      {
        heading: "Microtasks vs macrotasks",
        body: "The event loop has two waiting lines. Promise callbacks (then, catch and code after await) go in the microtask queue. Timers, user events and network callbacks go in the task queue, sometimes called the macrotask queue.\n\nWhen the call stack becomes empty, the browser runs every microtask first, then one task, then all microtasks again, and gives the page a chance to repaint between tasks. So Promise.resolve().then(...) always runs before setTimeout(..., 0), even though both seem to mean \"as soon as possible\".\n\nThis also means a long synchronous loop blocks everything, including clicks and painting. Split heavy work into chunks or move it to a Web Worker.",
        bullets: ["Sync code runs first, to completion", "Then all microtasks (promises)", "Then one macrotask (timer, event)", "Repaint can happen between tasks"],
        visual: {
          type: "flow",
          title: "Output order of one script",
          steps: [
            { label: "Sync code", detail: "console.log(\"A\") runs first" },
            { label: "Stack empty", detail: "Event loop checks the queues" },
            { label: "Microtask", detail: "Promise.then logs \"B\"" },
            { label: "Task", detail: "setTimeout(..., 0) logs \"C\"" },
          ],
        },
      },
      {
        heading: "Error handling that actually works",
        body: "A rejected promise that nobody catches shows an \"Uncaught (in promise)\" error. With async/await, wrap awaits in try/catch, and use finally for cleanup like hiding a spinner.\n\nfetch itself only rejects on network failure, such as being offline or a blocked request. A 404 or 500 response still resolves. Always check response.ok (true for status 200 to 299) and throw your own error otherwise. Also remember that response.json() can throw if the body is not valid JSON.",
      },
      {
        heading: "Running things in parallel",
        body: "Awaiting two requests one after the other takes the sum of their times. If they do not depend on each other, start both first and await them together with Promise.all. It resolves when all finish and rejects as soon as one fails.\n\nPromise.allSettled waits for all and tells you which succeeded, which is good for dashboards where one failing widget should not break the rest. Promise.race settles with the first one to finish, which is useful for timeouts.",
        bullets: ["Promise.all: all or nothing", "Promise.allSettled: every result, success or failure", "Promise.race: first to settle wins", "Promise.any: first success wins"],
      },
      {
        heading: "Cancelling requests",
        body: "If a user types in a search box quickly, older requests may come back after newer ones and show stale results. An AbortController lets you cancel a fetch. Create one, pass controller.signal to fetch, and call controller.abort() when the request is no longer needed. The fetch then rejects with an AbortError, which you can ignore. AbortSignal.timeout(5000) gives you a signal that aborts after 5 seconds.",
        visual: {
          type: "sequence",
          title: "Cancelling a stale search",
          actors: ["User", "Search code", "API"],
          messages: [
            { from: 0, to: 1, label: "Types \"re\"" },
            { from: 1, to: 2, label: "fetch ?q=re with signal" },
            { from: 0, to: 1, label: "Types \"react\"" },
            { from: 1, to: 2, label: "abort() old request, fetch ?q=react" },
            { from: 2, to: 1, label: "Results for react" },
            { from: 1, to: 0, label: "Shows fresh results; AbortError ignored" },
          ],
        },
      },
    ],
    moreVisuals: [
      {
        type: "flow",
        title: "The life of a promise",
        steps: [
          { label: "Created", detail: "fetch(url) returns a pending promise" },
          { label: "Pending", detail: "Your code keeps running meanwhile" },
          { label: "Settled", detail: "Fulfilled with a value or rejected with an error" },
          { label: "Callback queued", detail: "then/catch or code after await joins the microtask queue" },
          { label: "Runs", detail: "When the call stack is empty" },
        ],
      },
      {
        type: "compare",
        title: "Sequential vs parallel awaits",
        columns: [
          { title: "Sequential", points: ["const a = await getUser()", "const b = await getPosts()", "Time = a + b", "Use when b needs a's result"] },
          { title: "Parallel", points: ["const [a, b] = await Promise.all([...])", "Both start at once", "Time = the slower of a and b", "Use for independent requests"] },
        ],
      },
    ],
    examples: [
      {
        title: "Predicting the output order",
        explanation: "Step 1: synchronous logs run first, so A then D. Step 2: when the stack is empty, microtasks run, so the promise callback logs C. Step 3: only then does the timer task run and log B. Final order: A, D, C, B. This is the event loop in action.",
        code: {
          lang: "js",
          code: "console.log(\"A\");\nsetTimeout(() => console.log(\"B\"), 0);\nPromise.resolve().then(() => console.log(\"C\"));\nconsole.log(\"D\");\n// Output: A, D, C, B",
        },
      },
      {
        title: "A search box that ignores stale results",
        explanation: "Each keystroke starts a search. Step 1: keep the controller from the previous request. Step 2: before a new search, abort the old one. Step 3: fetch with the new signal and check response.ok. Step 4: ignore AbortError, because it is expected, and show any other error. Old answers can no longer overwrite new ones.",
        code: {
          lang: "js",
          code: "let controller;\nasync function search(q) {\n  controller?.abort();\n  controller = new AbortController();\n  try {\n    const res = await fetch(\"/api/search?q=\" + encodeURIComponent(q), { signal: controller.signal });\n    if (!res.ok) throw new Error(\"HTTP \" + res.status);\n    render(await res.json());\n  } catch (err) {\n    if (err.name !== \"AbortError\") showError(err.message);\n  }\n}",
        },
      },
    ],
    cheatSheet: [
      "Order: sync code, then all microtasks (promises), then the next task (timers, events)",
      "fetch resolves on 404/500; check res.ok yourself",
      "Independent requests: await Promise.all([a(), b()])",
      "Use try/catch/finally around await; hide spinners in finally",
      "Cancel with AbortController; time out with AbortSignal.timeout(ms)",
      "await only pauses the current async function, not the page",
      "Always encodeURIComponent user input in query strings",
    ],
    quiz: [
      {
        q: "Which runs first after the current script finishes: a resolved promise's then, or setTimeout(fn, 0)?",
        options: ["setTimeout", "They run at the same time", "The promise's then callback", "It is random"],
        answer: 2,
        why: "Microtasks such as promise callbacks run before the next macrotask like a timer.",
      },
      {
        q: "Two independent requests take 300ms and 500ms. How long does await Promise.all take?",
        options: ["About 500ms", "About 800ms", "About 300ms", "About 150ms"],
        answer: 0,
        why: "Both run at once, so the total is the slower of the two.",
      },
      {
        q: "When does fetch reject?",
        options: ["On any status code above 399", "On a network failure or abort", "Only on 500 errors", "When the JSON is invalid"],
        answer: 1,
        why: "HTTP error statuses still resolve; rejection means the request itself failed.",
      },
      {
        q: "A dashboard loads 4 widgets and one API fails. Which helper lets the other 3 still show?",
        options: ["Promise.race", "Promise.all", "Promise.resolve", "Promise.allSettled"],
        answer: 3,
        why: "allSettled reports every result instead of failing on the first rejection.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Write a function wait(ms) that returns a promise resolving after ms milliseconds, then use it to log \"done\" after 1 second.",
        hint: "Wrap setTimeout in new Promise((resolve) => ...).",
        solution: "const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));\n\nawait wait(1000);\nconsole.log(\"done\");",
      },
      {
        level: "medium",
        task: "Write getJSON(url) that fetches a URL, throws an Error with the status for non-2xx responses, and returns the parsed JSON.",
        hint: "Check res.ok before calling res.json().",
        solution: "async function getJSON(url) {\n  const res = await fetch(url);\n  if (!res.ok) {\n    throw new Error(\"Request failed: \" + res.status);\n  }\n  return res.json();\n}",
      },
      {
        level: "hard",
        task: "Write retry(fn, times) that calls the async function fn and, if it throws, tries again up to times attempts in total, waiting 500ms, then 1000ms, then 2000ms between tries.",
        hint: "Loop over attempts; double the delay each time; rethrow after the last attempt.",
        solution: "async function retry(fn, times) {\n  let delay = 500;\n  for (let i = 1; i <= times; i++) {\n    try {\n      return await fn();\n    } catch (err) {\n      if (i === times) throw err;\n      await new Promise((r) => setTimeout(r, delay));\n      delay *= 2;\n    }\n  }\n}",
      },
    ],
    faq: [
      { q: "Is JavaScript multithreaded?", a: "Your page code runs on one main thread. The browser does network and timers in the background, and you can use Web Workers for heavy computation on other threads." },
      { q: "Should I use then or async/await?", a: "Prefer async/await for readability. then is still useful for short one-liners, and both work with the same promises." },
      { q: "Can I use await at the top level?", a: "Yes, inside ES modules, such as script type=\"module\" or files bundled by Vite. In classic scripts you need an async function." },
    ],
  },

  "javascript/js-modules": {
    plain: [
      "As a project grows, one huge JavaScript file becomes impossible to manage. ES modules let you split code into many files. Each file chooses what to share with export, and other files ask for those things with import.",
      "Each module has its own private scope. A variable inside math.js is invisible to other files unless it is exported. This stops files from accidentally overwriting each other's names, a common bug in older websites.",
      "npm is a package manager and an online registry of free code packages. Instead of writing a date library yourself, you run npm install and import it. package.json lists what your project needs, so anyone can install the same things.",
      "Tooling ties it together. A dev server like Vite serves your modules, reloads the page instantly when you save, and later bundles everything into small, fast files for production. You write clean modules; the tools handle the delivery.",
    ],
    deepDive: [
      {
        heading: "Named vs default exports",
        body: "A named export shares a value under its own name: export function add() {}. Importers must use that name in braces, import { add } from \"./math.js\", optionally renaming with as. A file can have many named exports.\n\nA default export is the file's main thing: export default function Button() {}. Importers pick any name without braces. A file can have only one.\n\nMany teams prefer named exports because editors can auto-import them, renames are tracked across the project, and typos fail loudly. Frameworks sometimes require defaults, such as Next.js page files.",
        visual: {
          type: "compare",
          title: "Named vs default export",
          columns: [
            { title: "Named", points: ["export function add() {}", "import { add } from \"./math.js\"", "Many per file", "Name must match (or use as)"] },
            { title: "Default", points: ["export default function Button() {}", "import AnyName from \"./Button.js\"", "One per file", "Importer picks the name"] },
          ],
        },
      },
      {
        heading: "How module loading works",
        body: "Imports are static: they sit at the top of a file and cannot be inside an if. This lets tools read the whole import graph before running anything. Each module runs only once, no matter how many files import it, and everyone shares the same instance.\n\nImports are live bindings, not copies: if the exporting module changes an exported let, importers see the new value. When you need to load code later, for example a heavy chart library only when a user opens a tab, use dynamic import(\"./chart.js\"), which returns a promise. Bundlers split dynamic imports into separate files automatically.",
        bullets: ["Static import: known at build time", "Each module runs once and is cached", "Dynamic import(): load on demand", "Top-level await works in modules"],
      },
      {
        heading: "Versions, ranges and lockfiles",
        body: "Packages use semantic versioning: MAJOR.MINOR.PATCH. A patch fixes bugs, a minor adds features without breaking anything, and a major may break your code.\n\nIn package.json, \"^1.4.2\" allows any 1.x.x from 1.4.2 up, and \"~1.4.2\" allows only 1.4.x. The lockfile records the exact version actually installed, including every sub-dependency. Commit it. On CI, use npm ci, which installs exactly what the lockfile says and fails if it does not match package.json.",
        visual: {
          type: "compare",
          title: "What each version range allows",
          columns: [
            { title: "^1.4.2", points: ["1.4.2 up to, not including, 2.0.0", "New minors and patches", "npm install default"] },
            { title: "~1.4.2", points: ["1.4.2 up to, not including, 1.5.0", "Patches only", "Fewer surprise updates"] },
            { title: "1.4.2", points: ["Exactly 1.4.2", "No range at all", "Updated only by hand"] },
          ],
        },
      },
      {
        heading: "dependencies vs devDependencies",
        body: "dependencies are needed when your app runs, like react. devDependencies are only needed to build and test, like vite, typescript or vitest; install them with npm install -D. For a website the bundle only includes what you actually import, but keeping the split clear makes server installs smaller and intent obvious. Scripts in package.json, such as \"dev\": \"vite\", let everyone run the same commands with npm run dev.",
      },
    ],
    moreVisuals: [
      {
        type: "tree",
        title: "A small project's import graph",
        root: "main.js (entry)",
        children: [
          { label: "./ui/cart.js", children: ["./utils/format.js", "./api/client.js"] },
          { label: "./ui/header.js", children: ["./utils/format.js"] },
          { label: "dayjs (from npm)" },
          { label: "./styles.css (handled by Vite)" },
        ],
      },
      {
        type: "compare",
        title: "Dev server vs production build",
        columns: [
          { title: "npm run dev", points: ["Serves source files as modules", "Instant reload on save", "No minification", "Readable errors and source maps"] },
          { title: "npm run build", points: ["Bundles and tree-shakes code", "Minifies and adds content hashes", "Splits chunks at dynamic imports", "Output in dist/ for any static host"] },
        ],
      },
    ],
    examples: [
      {
        title: "Starting a Vite project from scratch",
        explanation: "Step 1: run npm create vite@latest my-app and pick Vanilla. Step 2: cd my-app and run npm install, which reads package.json and creates node_modules and package-lock.json. Step 3: npm run dev starts the server at a local URL. Step 4: add a package with npm install dayjs and import it in main.js. Step 5: npm run build writes optimised files to dist/.",
        code: {
          lang: "bash",
          code: "npm create vite@latest my-app -- --template vanilla\ncd my-app\nnpm install\nnpm install dayjs\nnpm run dev      # local dev server with hot reload\nnpm run build    # production files in dist/",
        },
      },
      {
        title: "Splitting a price formatter into a module",
        explanation: "Two pages both format prices. Step 1: create format.js with a named export. Step 2: import it in both files. Step 3: the formatter now lives in one place, so a fix applies everywhere. Note the ./ and the .js extension: browsers need a real path for local files.",
        code: {
          lang: "js",
          code: "// format.js\nexport function formatPrice(cents, currency = \"USD\") {\n  return new Intl.NumberFormat(\"en-US\", { style: \"currency\", currency })\n    .format(cents / 100);\n}\n\n// cart.js\nimport { formatPrice } from \"./format.js\";\nconsole.log(formatPrice(1999)); // $19.99",
        },
      },
    ],
    cheatSheet: [
      "export function f() {} / import { f } from \"./f.js\"",
      "export default X / import AnyName from \"./x.js\"",
      "Rename on import: import { add as sum } from \"./math.js\"",
      "Lazy load: const mod = await import(\"./heavy.js\")",
      "npm install pkg (dependency); npm install -D pkg (dev only)",
      "Use npm ci in CI for exact, lockfile-based installs",
      "Commit package-lock.json; ignore node_modules",
      "^1.2.3 allows 1.x updates; ~1.2.3 allows 1.2.x only",
    ],
    quiz: [
      {
        q: "A module is imported by 5 different files. How many times does its top-level code run?",
        options: ["5 times", "Once", "Never", "Once per page reload per file"],
        answer: 1,
        why: "Modules are evaluated once and cached; every importer shares that instance.",
      },
      {
        q: "Which version range allows 2.4.0 if package.json says \"^2.1.0\"?",
        options: ["None", "Only exact 2.1.0", "Only 2.1.x", "Yes, any 2.x.x at or above 2.1.0"],
        answer: 3,
        why: "The caret allows minor and patch updates within the same major version.",
      },
      {
        q: "What is dynamic import() mainly used for?",
        options: ["Loading code only when it is needed", "Importing CSS", "Making imports synchronous", "Publishing packages"],
        answer: 0,
        why: "It returns a promise and lets bundlers split the code into a separate, lazily loaded chunk.",
      },
      {
        q: "Where should vitest be listed?",
        options: ["dependencies", "peerDependencies", "devDependencies", "It should not be in package.json"],
        answer: 2,
        why: "Test tools are only needed during development and CI, not when the app runs.",
      },
    ],
    practice: [
      {
        level: "easy",
        task: "Create math.js with named exports add and multiply, and a default export average. Import all three in main.js.",
        hint: "Default import first, then named imports in braces.",
        solution: "// math.js\nexport const add = (a, b) => a + b;\nexport const multiply = (a, b) => a * b;\nexport default function average(...nums) {\n  return nums.reduce(add, 0) / nums.length;\n}\n\n// main.js\nimport average, { add, multiply } from \"./math.js\";\nconsole.log(add(2, 3), multiply(2, 3), average(1, 2, 3));",
      },
      {
        level: "medium",
        task: "Add a script to package.json so npm run check runs both lint and tests (assume eslint and vitest are installed).",
        hint: "Scripts can call other scripts with npm run and chain them with &&.",
        solution: "\"scripts\": {\n  \"dev\": \"vite\",\n  \"lint\": \"eslint .\",\n  \"test\": \"vitest run\",\n  \"check\": \"npm run lint && npm run test\"\n}",
      },
      {
        level: "hard",
        task: "A page imports a 400 KB charting library at the top, but the chart only shows after clicking \"Show stats\". Change it to load the library only on click.",
        hint: "Move the import into the click handler using dynamic import().",
        solution: "const btn = document.querySelector(\"#show-stats\");\nbtn.addEventListener(\"click\", async () => {\n  const { renderChart } = await import(\"./chart.js\"); // chart.js imports the library\n  renderChart(document.querySelector(\"#stats\"));\n}, { once: true });",
      },
    ],
    faq: [
      { q: "What is the difference between npm and npx?", a: "npm installs and manages packages. npx runs a package's command, downloading it temporarily if needed, such as npx eslint." },
      { q: "Why do imports need the .js extension in the browser?", a: "Browsers load modules by URL and do not guess file names. Bundlers like Vite and Node with TypeScript settings can resolve extensionless imports for you." },
      { q: "What are CommonJS and require?", a: "CommonJS is Node's older module system using require and module.exports. New code should use ES modules, which work in both browsers and modern Node." },
    ],
  },
};

export default extra;

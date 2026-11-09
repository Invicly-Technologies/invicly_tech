/** Shared by Invicly Tech and Invicly Learn. */
export const THEME_KEY = "il-theme";

/** Inline script run before paint so the saved theme applies without a flash. Dark is the default. */
export const themeBootScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");document.documentElement.setAttribute("data-theme",t==="light"?"light":"dark")}catch(e){document.documentElement.setAttribute("data-theme","dark")}})()`;

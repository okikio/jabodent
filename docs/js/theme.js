const getTheme = () => {
  const theme = window.localStorage.getItem("theme");
  if (typeof theme === "string")
    return theme;
  return null;
};
const setTheme = (theme) => {
  if (typeof theme === "string")
    window.localStorage.setItem("theme", theme);
};
const mediaTheme = () => {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const hasMediaQueryPreference = typeof mql.matches === "boolean";
  if (hasMediaQueryPreference)
    return mql.matches ? "dark" : "light";
  return null;
};
const html = document.querySelector("html");
try {
  let theme = getTheme();
  if (theme === null)
    theme = mediaTheme();
  theme && html.setAttribute("theme", theme);
} catch (e) {
  console.warn("Theming isn't available on this browser.");
}
let themeSet = (theme) => {
  html.setAttribute("theme", theme);
  setTheme(theme);
};
window.matchMedia("(prefers-color-scheme: dark)").addListener((e) => {
  themeSet(e.matches ? "dark" : "light");
});
window.matchMedia("(prefers-color-scheme: light)").addListener((e) => {
  themeSet(e.matches ? "light" : "dark");
});

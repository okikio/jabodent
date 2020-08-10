// Based on [joshwcomeau.com/gatsby/dark-mode/]
export const getTheme = (): string | null => {
  const theme = window.localStorage.getItem("theme");
  // If the user has explicitly chosen light or dark,
  // let's use it. Otherwise, this value will be null.
  if (typeof theme === "string") return theme;

  // If they are using a browser/OS that doesn't support
  // color themes, let's default to 'light'.
  return null;
};

export const setTheme = (theme: string): void => {
  // If the user has explicitly chosen light or dark, store the default theme
  if (typeof theme === "string") window.localStorage.setItem("theme", theme);
};

export const mediaTheme = (): string | null => {
  // If they haven't been explicitly set, let's check the media query
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const hasMediaQueryPreference = typeof mql.matches === "boolean";
  if (hasMediaQueryPreference) return mql.matches ? "dark" : "light";
  return null;
};

const html = document.querySelector("html");
// Get theme from html tag, if it has a theme or get it from localStorage
export const themeGet = () => {
  let themeAttr = html.getAttribute("data-theme");
  if (typeof themeAttr === "string" && themeAttr.length) {
    return themeAttr;
  }

  return getTheme();
};

// Set theme in localStorage, as well as in the html tag
export const themeSet = (theme: string) => {
    requestAnimationFrame(() => {
        html.setAttribute("data-theme", theme);
    });
    setTheme(theme);
};

try {
  let theme = getTheme();
  if (theme === null) theme = mediaTheme();
  theme && themeSet(theme);

  window.matchMedia("(prefers-color-scheme: dark)").addListener((e) => {
    themeSet(e.matches ? "dark" : "light");
  });

  window.matchMedia("(prefers-color-scheme: light)").addListener((e) => {
    themeSet(e.matches ? "light" : "dark");
  });
} catch (e) {
  console.warn("Theming isn't available on this browser.");
}

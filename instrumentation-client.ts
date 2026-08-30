try {
  const theme = localStorage.getItem("c2k-theme") === "warm" ? "warm" : "dark";
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === "warm" ? "light" : "dark";
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = theme === "warm" ? "#f1eadf" : "#09090b";
  });
} catch {
  // The dark server-rendered theme remains the safe fallback.
}

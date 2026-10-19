import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "@/site/fonts";
import "@/site/site.css";
import App from "./App";
import { theme, meta } from "@/site/site";

function Root() {
  useEffect(() => {
    document.title = meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", meta.description);
    }

    const t = theme;
    const isDark = (hex: string) => {
      const n = parseInt(hex.replace("#", "").slice(0, 6), 16);
      return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 < 140;
    };

    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--bg", t.bg);
    rootStyle.setProperty("--surface", t.surface);
    rootStyle.setProperty("--text", t.text);
    rootStyle.setProperty("--muted", t.muted);
    rootStyle.setProperty("--accent", t.accent);
    rootStyle.setProperty("--accent-text", t.accentText);
    rootStyle.setProperty("--line", t.line);
    rootStyle.setProperty("--hero-text", t.heroText ?? (isDark(t.bg) ? t.text : "#fbf8f3"));
    rootStyle.setProperty("--radius", `${t.radius ?? 0}px`);
    rootStyle.setProperty("--font-display-family", t.fontDisplay);
    rootStyle.setProperty("--font-body-family", t.fontBody);
    rootStyle.setProperty("--heading-case", t.uppercaseHeadings ? "uppercase" : "none");
    rootStyle.setProperty("--heading-tracking", t.uppercaseHeadings ? "0.04em" : "0.005em");
  }, []);

  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);

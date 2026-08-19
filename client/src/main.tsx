import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const App = lazy(() => import("./App"));

function BootFallback() {
  return <div className="boot-screen" aria-label="Loading"><div className="boot-brand"><span className="boot-mark">▶</span><span>LinkLoad</span><span className="boot-dot" /></div></div>;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense fallback={<BootFallback />}><App /></Suspense>
  </React.StrictMode>,
);

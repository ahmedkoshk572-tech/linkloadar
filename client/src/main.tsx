import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const App = lazy(() => import("./App"));

type BoundaryState = { failed: boolean };

class AppLoadBoundary extends React.Component<React.PropsWithChildren, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  retry = () => {
    this.setState({ failed: false });
    window.location.reload();
  };

  render() {
    if (this.state.failed) {
      return <div className="boot-screen boot-error" role="alert"><div className="boot-message"><div className="boot-brand"><span className="boot-mark">▶</span><span>LinkLoad</span></div><p>تعذر تحميل الصفحة. حاول مرة أخرى.</p><button onClick={this.retry}>إعادة المحاولة</button></div></div>;
    }
    return this.props.children;
  }
}

function BootFallback() {
  return <div className="boot-screen" aria-label="Loading"><div className="boot-brand"><span className="boot-mark">▶</span><span>LinkLoad</span><span className="boot-dot" /></div></div>;
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppLoadBoundary><Suspense fallback={<BootFallback />}><App /></Suspense></AppLoadBoundary>
  </React.StrictMode>,
);

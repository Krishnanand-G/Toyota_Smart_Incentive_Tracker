"use client";

import { useEffect, useState, type ReactNode } from "react";

const RELOAD_KEY = "asset-integrity-reload";
const MAX_RELOAD_ATTEMPTS = 1;

let reloadAttemptsThisSession = 0;

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 2147483647,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  backgroundColor: "#f2f2f2",
  color: "#333333",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
};

const cardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "420px",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
  background: "#ffffff",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  padding: "32px 24px",
  textAlign: "center",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "16px",
  width: "100%",
  border: "none",
  borderRadius: "6px",
  padding: "12px 16px",
  background: "#eb0a1e",
  color: "#ffffff",
  fontWeight: 600,
  cursor: "pointer",
};

function readStoredReloadAttempts() {
  try {
    const sessionValue = sessionStorage.getItem(RELOAD_KEY);
    if (sessionValue !== null) return Number(sessionValue);
  } catch {
    // sessionStorage unavailable
  }

  try {
    const localValue = localStorage.getItem(RELOAD_KEY);
    if (localValue !== null) return Number(localValue);
  } catch {
    // localStorage unavailable
  }

  return reloadAttemptsThisSession;
}

function getReloadAttempts() {
  return readStoredReloadAttempts();
}

function setReloadAttempts(count: number) {
  reloadAttemptsThisSession = count;

  try {
    if (count === 0) {
      sessionStorage.removeItem(RELOAD_KEY);
    } else {
      sessionStorage.setItem(RELOAD_KEY, String(count));
    }
  } catch {
    // sessionStorage unavailable
  }

  try {
    if (count === 0) {
      localStorage.removeItem(RELOAD_KEY);
    } else {
      localStorage.setItem(RELOAD_KEY, String(count));
    }
  } catch {
    // localStorage unavailable — in-memory counter is used instead
  }
}

function normalizeCssColor(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "");
}

function isCssLoaded() {
  const rootStyle = getComputedStyle(document.documentElement);
  const background = normalizeCssColor(rootStyle.getPropertyValue("--background"));
  const accent = normalizeCssColor(rootStyle.getPropertyValue("--accent-primary"));

  if (
    (background === "#ffffff" || background === "rgb(255,255,255)") &&
    (accent === "#eb0a1e" || accent === "rgb(235,10,30)")
  ) {
    return true;
  }

  const bodyBackground = normalizeCssColor(getComputedStyle(document.body).backgroundColor);
  return (
    bodyBackground === "rgb(242,242,242)" ||
    bodyBackground === "rgb(255,255,255)" ||
    bodyBackground.includes("242,242,242") ||
    bodyBackground.includes("255,255,255")
  );
}

function isAssetFailure(error: Event | PromiseRejectionEvent) {
  if ("target" in error) {
    const target = error.target;
    if (target instanceof HTMLLinkElement && target.rel === "stylesheet") return true;
    if (target instanceof HTMLScriptElement && target.src.includes("/_next/")) return true;
  }

  const reason = "reason" in error ? error.reason : null;
  const message = String(reason?.message ?? reason ?? "");
  const name = String(reason?.name ?? "");

  return (
    name === "ChunkLoadError" ||
    message.includes("Loading chunk") ||
    message.includes("Failed to fetch dynamically imported module") ||
    message.includes("Cannot find module")
  );
}

function FailureOverlay({
  message,
  onReload,
}: {
  message: string;
  onReload: () => void;
}) {
  return (
    <div style={overlayStyle} role="alert" aria-live="assertive">
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/toyota-wordmark.svg"
            alt="Toyota"
            width={120}
            height={32}
            style={{ height: "32px", width: "auto" }}
          />
        </div>

        <p style={{ margin: 0, fontSize: "16px", fontWeight: 600, letterSpacing: "0.02em" }}>
          Page failed to load
        </p>
        <p style={{ margin: "10px 0 0", fontSize: "14px", lineHeight: 1.5, color: "#666666" }}>
          {message} Stop any running dev servers, then run npm run dev:clean and reload.
        </p>
        <button type="button" style={buttonStyle} onClick={onReload}>
          Reload page
        </button>
      </div>
    </div>
  );
}

export function AssetIntegrityGuard({ children }: { children: ReactNode }) {
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    function fail(reason: string) {
      if (cancelled) return;

      const attempts = getReloadAttempts();
      if (attempts < MAX_RELOAD_ATTEMPTS) {
        setReloadAttempts(attempts + 1);
        window.location.reload();
        return;
      }

      setReloadAttempts(0);
      setFailureMessage(reason);
    }

    function onError(event: Event) {
      if (isAssetFailure(event)) {
        fail("The page assets are out of date or incomplete.");
      }
    }

    function onUnhandledRejection(event: PromiseRejectionEvent) {
      if (isAssetFailure(event)) {
        fail("The app bundle failed to load.");
      }
    }

    function verifyStylesLoaded(attempt = 0) {
      if (cancelled) return;
      if (isCssLoaded()) return;
      if (attempt >= 30) {
        fail("Styles did not load correctly.");
        return;
      }
      window.setTimeout(() => verifyStylesLoaded(attempt + 1), 100);
    }

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.setTimeout(() => verifyStylesLoaded(0), 100);

    return () => {
      cancelled = true;
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  if (failureMessage) {
    return (
      <FailureOverlay
        message={failureMessage}
        onReload={() => {
          setReloadAttempts(0);
          window.location.reload();
        }}
      />
    );
  }

  return children;
}

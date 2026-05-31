"use client";

const overlayStyle: React.CSSProperties = {
  minHeight: "100vh",
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
  padding: "24px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={overlayStyle}>
        <div style={cardStyle}>
          <p style={{ margin: 0, fontSize: "18px", fontWeight: 600 }}>Something went wrong</p>
          <p style={{ margin: "12px 0 0", fontSize: "14px", lineHeight: 1.5, color: "#666666" }}>
            {error.message || "The app hit an unexpected error."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "16px",
              width: "100%",
              border: "none",
              borderRadius: "6px",
              padding: "12px 16px",
              background: "#eb0a1e",
              color: "#ffffff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

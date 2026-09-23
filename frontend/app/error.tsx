"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);
  }, [error]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "80vh",
      padding: "20px",
      textAlign: "center",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Une erreur temporaire est survenue
      </h2>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        Veuillez actualiser la page pour continuer vos achats.
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: "10px 24px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: 600
        }}
      >
        Réessayer
      </button>
    </div>
  );
}

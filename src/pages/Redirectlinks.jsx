import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardLayout from "./Dashboard";

const API_URL = import.meta.env.VITE_API_URL;

const RedirectLinks = () => {
  const linksData = [
    `${API_URL}/api/survey/click?pid=1123&uid=12134&status=complete`,
    `${API_URL}/api/survey/click?pid=1123&uid=12134&status=terminate`,
    `${API_URL}/api/survey/click?pid=1123&uid=12134&status=quota_full`,
  ];
  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    toast.success("Link copied to clipboard!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const shareLink = (link) => {
    if (navigator.share) {
      navigator
        .share({
          title: "Check this link",
          url: link,
        })
        .catch((err) => {
          toast.error("Share failed", {
            position: "top-right",
            autoClose: 2000,
          });
          console.error("Share failed:", err);
        });
    } else {
      toast.info("Share not supported on this browser", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  return (
    <DashboardLayout>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Redirect Links</h1>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Link</th>
                <th style={styles.thActions}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {linksData.map((link, index) => (
                <tr key={index} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.linkContainer}>
                      <svg style={styles.linkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span style={styles.linkText}>{link}</span>
                    </div>
                  </td>
                  <td style={styles.tdActions}>
                    <button
                      onClick={() => copyToClipboard(link)}
                      style={styles.copyButton}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
                    >
                      <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                    <button
                      onClick={() => shareLink(link)}
                      style={styles.shareButton}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#059669"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#10b981"}
                    >
                      <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      Share
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ToastContainer />
      </div>
    </DashboardLayout>
  );
};

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  header: {
    marginBottom: "2rem",
  },
  title: {
    fontSize: "1.875rem",
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: "0.5rem",
  },
  tableWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  headerRow: {
    backgroundColor: "#f9fafb",
    borderBottom: "2px solid #e5e7eb",
  },
  th: {
    padding: "1rem 1.5rem",
    textAlign: "left",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  thActions: {
    padding: "1rem 1.5rem",
    textAlign: "center",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    width: "280px",
  },
  tr: {
    borderBottom: "1px solid #e5e7eb",
    transition: "background-color 0.2s ease",
  },
  td: {
    padding: "1.25rem 1.5rem",
    color: "#374151",
  },
  tdActions: {
    padding: "1.25rem 1.5rem",
    textAlign: "center",
  },
  linkContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  linkIcon: {
    width: "20px",
    height: "20px",
    color: "#6b7280",
    flexShrink: 0,
  },
  linkText: {
    fontSize: "0.875rem",
    color: "#374151",
    wordBreak: "break-all",
  },
  copyButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginRight: "0.5rem",
  },
  shareButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem 1rem",
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  buttonIcon: {
    width: "16px",
    height: "16px",
  },
};

export default RedirectLinks;



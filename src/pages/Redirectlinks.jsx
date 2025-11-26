import React from "react";
import DashboardLayout from "./Dashboard";
const API_URL=import.meta.env.VITE_API_URL
const RedirectLinks = () => {
  const linksData = [
    `${API_URL}/api/survey/click?pid=1123&uid=12134&status=complete&name=ved&class=43&nn=38953`,
    `${API_URL}/api/survey/click?pid=1123&uid=12134&status=terminate&name=ved&class=43&nn=38953`,
    `${API_URL}/api/survey/click?pid=1123&uid=12134&status=quota_full&name=ved&class=43&nn=38953`,
  ];

  const copyToClipboard = (link) => {
    navigator.clipboard.writeText(link);
    alert("Copied to clipboard!");
  };

  const shareLink = (link) => {
    if (navigator.share) {
      navigator
        .share({ title: "Check this link", url: link })
        .catch((err) => console.error("Share failed:", err));
    } else {
      alert("Share not supported on this browser");
    }
  };

  return (
    <DashboardLayout>
      <div style={{ padding: "20px", fontFamily: "Arial" }}>
        <h2>Redirect Links</h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f2f2f2" }}>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Link</th>
              <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {linksData.map((link, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    {link}
                  </a>
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  <button
                    onClick={() => copyToClipboard(link)}
                    style={{
                      marginRight: "10px",
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => shareLink(link)}
                    style={{ padding: "5px 10px", cursor: "pointer" }}
                  >
                    Share
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
};

export default RedirectLinks;

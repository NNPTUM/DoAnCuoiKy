const STATUS_STYLES = {
  pending: { bg: "#fff4e5", color: "#8a5b00" },
  reviewing: { bg: "#e8f1ff", color: "#1c4e9a" },
  resolved: { bg: "#e8f5e9", color: "#2e7d32" },
  dismissed: { bg: "#fdeaea", color: "#b71c1c" },
};

const ReportStatusBadge = ({ status }) => {
  const key = String(status || "").toLowerCase();
  const style = STATUS_STYLES[key] || { bg: "#f0f2f5", color: "#374151" };

  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.color,
        borderRadius: 999,
        padding: "2px 10px",
        fontWeight: 700,
        fontSize: 12,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
};

export default ReportStatusBadge;

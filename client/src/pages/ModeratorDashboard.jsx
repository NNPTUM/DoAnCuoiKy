import React, { useEffect, useState } from "react";
import API from "../api/axios";
import DashboardTopNavbar from "../components/DashboardTopNavbar";
import "./dashboard.css";

const ModeratorDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [message, setMessage] = useState("");
  const [manualPostId, setManualPostId] = useState("");
  const [manualTags, setManualTags] = useState("");
  const [manualUserId, setManualUserId] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      const query = statusFilter ? `?status=${statusFilter}` : "";
      const res = await API.get(`/moderator/reports${query}`);
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setReports(res.data.data);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Không thể tải danh sách báo cáo",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter]);

  const updateReport = async (reportId, status) => {
    try {
      const res = await API.put(`/moderator/reports/${reportId}`, {
        status,
        resolutionNote: `Moderator chuyển trạng thái sang ${status}`,
      });

      if (res.data?.success) {
        setReports((prev) =>
          prev.map((r) => (r._id === reportId ? { ...r, status } : r)),
        );
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Không thể cập nhật trạng thái report",
      );
    }
  };

  const moderatePost = async (postId, payload, successText) => {
    try {
      const res = await API.put(`/moderator/posts/${postId}/moderate`, payload);
      if (res.data?.success) {
        setMessage(successText);
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Không thể kiểm duyệt bài viết",
      );
    }
  };

  const warnUser = async (userId) => {
    try {
      const res = await API.put(`/moderator/users/${userId}/warn`);
      if (res.data?.success) {
        setMessage(res.data?.message || "Đã cảnh cáo người dùng");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Không thể cảnh cáo người dùng",
      );
    }
  };

  return (
    <div className="dashboard-shell">
      <DashboardTopNavbar role="moderator" />

      <div className="dashboard-grid">
        <aside className="dashboard-panel dashboard-side">
          <span className="dashboard-badge">Moderator Hub</span>
          <h1 className="dashboard-title">Bảng kiểm duyệt cộng đồng</h1>
          <p className="dashboard-subtitle">
            Xử lý báo cáo, ẩn nội dung độc hại, cảnh cáo tài khoản vi phạm và
            giữ môi trường an toàn.
          </p>

          <div className="stat-grid" style={{ marginTop: 16 }}>
            <div className="stat-card">
              <div className="stat-label">Tổng report</div>
              <div className="stat-value">{reports.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Đang chờ xử lý</div>
              <div className="stat-value">
                {reports.filter((r) => r.status === "pending").length}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Đã giải quyết</div>
              <div className="stat-value">
                {reports.filter((r) => r.status === "resolved").length}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <label>
              Lọc trạng thái report
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </label>
          </div>
        </aside>

        <main className="dashboard-main dashboard-panel">
          <section>
            <div className="section-row">
              <h2 className="section-title">Hàng đợi báo cáo người dùng</h2>
              <button className="ghost-btn" onClick={loadReports}>
                Tải lại
              </button>
            </div>

            {loading && <div className="helper-text">Đang tải report...</div>}

            {!loading && reports.length === 0 && (
              <div className="helper-text">
                Không có report theo bộ lọc hiện tại.
              </div>
            )}

            <div style={{ display: "grid", gap: 12 }}>
              {reports.map((report) => (
                <article key={report._id} className="report-card">
                  <div className="report-meta">
                    <span className="meta-pill">Type: {report.targetType}</span>
                    <span className="meta-pill">Reason: {report.reason}</span>
                    <span className="meta-pill">Status: {report.status}</span>
                  </div>

                  <div style={{ fontSize: 14 }}>
                    <strong>Target ID:</strong> {report.targetId}
                  </div>

                  {report.description && (
                    <div style={{ fontSize: 14, color: "#334d73" }}>
                      {report.description}
                    </div>
                  )}

                  <div className="inline-actions">
                    <button
                      className="ghost-btn"
                      onClick={() => updateReport(report._id, "reviewing")}
                    >
                      Chuyển reviewing
                    </button>
                    <button
                      className="primary-btn"
                      onClick={() => updateReport(report._id, "resolved")}
                    >
                      Đánh dấu resolved
                    </button>
                    <button
                      className="danger-btn"
                      onClick={() => updateReport(report._id, "dismissed")}
                    >
                      Bác bỏ report
                    </button>

                    {report.targetType === "Post" && (
                      <>
                        <button
                          className="danger-btn"
                          onClick={() =>
                            moderatePost(
                              report.targetId,
                              { status: "hidden" },
                              "Đã ẩn bài viết vi phạm",
                            )
                          }
                        >
                          Ẩn bài viết
                        </button>
                        <button
                          className="tag-btn"
                          onClick={() =>
                            moderatePost(
                              report.targetId,
                              { isPinned: true },
                              "Đã ghim bài viết",
                            )
                          }
                        >
                          Ghim bài viết
                        </button>
                      </>
                    )}

                    {report.targetType === "User" && (
                      <button
                        className="danger-btn"
                        onClick={() => warnUser(report.targetId)}
                      >
                        Cảnh cáo user bị report
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section
            className="dashboard-panel"
            style={{ padding: 12, borderRadius: 12 }}
          >
            <h2 className="section-title" style={{ marginBottom: 12 }}>
              Công cụ kiểm duyệt thủ công
            </h2>

            <div style={{ display: "grid", gap: 10 }}>
              <label>
                Post ID
                <input
                  placeholder="Nhập post id"
                  value={manualPostId}
                  onChange={(e) => setManualPostId(e.target.value)}
                />
              </label>

              <label>
                Tags (phân cách bằng dấu phẩy)
                <input
                  placeholder="news, community, announcement"
                  value={manualTags}
                  onChange={(e) => setManualTags(e.target.value)}
                />
              </label>

              <div className="inline-actions">
                <button
                  className="danger-btn"
                  onClick={() =>
                    moderatePost(
                      manualPostId,
                      { status: "hidden" },
                      "Đã ẩn bài viết theo thao tác thủ công",
                    )
                  }
                  disabled={!manualPostId.trim()}
                >
                  Ẩn post theo ID
                </button>
                <button
                  className="tag-btn"
                  onClick={() =>
                    moderatePost(
                      manualPostId,
                      {
                        tags: manualTags
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      },
                      "Đã gán tag cho bài viết",
                    )
                  }
                  disabled={!manualPostId.trim()}
                >
                  Gán tags cho post
                </button>
              </div>

              <label>
                User ID cần cảnh cáo
                <input
                  placeholder="Nhập user id"
                  value={manualUserId}
                  onChange={(e) => setManualUserId(e.target.value)}
                />
              </label>

              <button
                className="primary-btn"
                onClick={() => warnUser(manualUserId)}
                disabled={!manualUserId.trim()}
              >
                Cảnh cáo user theo ID
              </button>
            </div>
          </section>

          {message && (
            <div
              style={{
                background: "#edf8ff",
                color: "#174581",
                borderRadius: 10,
                border: "1px solid #cbe0ff",
                padding: "10px 12px",
                fontWeight: 600,
              }}
            >
              {message}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ModeratorDashboard;

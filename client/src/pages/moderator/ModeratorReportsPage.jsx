import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import BackButton from "../../components/BackButton";
import "../dashboard.css";

const REASON_TRANSLATIONS = {
  spam: "Spam / Thư rác",
  hate_speech: "Ngôn từ thù ghét",
  nudity: "Khỏa thân / Nội dung khiêu dâm",
  violence: "Bạo lực",
  harassment: "Quấy rối, bắt nạt",
  false_information: "Thông tin sai lệch",
  other: "Khác",
};

const ModeratorReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [message, setMessage] = useState("");

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
      let resolutionNote = `Moderator chuyển trạng thái sang ${status}`;
      
      // Cho phép người kiểm duyệt nhập ghi chú nếu chuyển thành resolved/dismissed
      if (status === "resolved" || status === "dismissed") {
        const userInput = window.prompt(
          `Nhập ghi chú xử lý cho trạng thái "${status}" (tùy chọn):`,
          resolutionNote
        );
        if (userInput === null) return; // Người dùng ấn Cancel thì hủy thao tác
        resolutionNote = userInput.trim() || resolutionNote;
      }

      const res = await API.put(`/moderator/reports/${reportId}`, {
        status,
        resolutionNote,
      });

      if (res.data?.success) {
        setMessage(`Đã cập nhật trạng thái báo cáo thành ${status}`);
        loadReports(); // Tải lại danh sách để lấy thông tin populated (resolvedBy) mới nhất
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
    <section className="dashboard-panel dashboard-content-card">
      <BackButton label="Trở về trang trước" />
      <div className="section-row">
        <h2 className="section-title">Reports</h2>
        <button className="ghost-btn" onClick={loadReports}>
          Tải lại
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
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

      <div className="stat-grid" style={{ marginBottom: 12 }}>
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

      {loading && <div className="helper-text">Đang tải report...</div>}

      {!loading && reports.length === 0 && (
        <div className="helper-text">Không có report theo bộ lọc hiện tại.</div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {reports.map((report) => (
          <article key={report._id} className="report-card">
            <div className="report-meta">
              <span className="meta-pill">Loại: {report.targetType}</span>
              <span className="meta-pill">Lý do: {REASON_TRANSLATIONS[report.reason] || report.reason}</span>
              <span className="meta-pill">Trạng thái: {report.status}</span>
            </div>

            {/* Hiển thị thông tin người tố cáo và thời gian */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0 10px' }}>
              {report.reporterId?.avatarUrl ? (
                <img src={report.reporterId.avatarUrl} alt="avatar" style={{width: 36, height: 36, borderRadius: '50%', objectFit: 'cover'}} />
              ) : (
                <div style={{width: 36, height: 36, borderRadius: '50%', backgroundColor: '#ccd1d9', flexShrink: 0}} />
              )}
              <div>
                <div style={{fontSize: 14, fontWeight: 600, color: '#333'}}>
                  {report.reporterId?.username || 'Người dùng ẩn danh'}
                  {report.reporterId?._id && <span style={{fontSize: 12, color: '#888', marginLeft: 6}}>(ID: {report.reporterId._id})</span>}
                </div>
                <div style={{fontSize: 12, color: '#666'}}>
                  {new Date(report.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 14, marginBottom: 8, color: '#444' }}>
              <strong>Target ID:</strong> {report.targetId?._id || report.targetId}
            </div>

            {/* Hiển thị chi tiết nội dung bị báo cáo (nếu là bài viết) */}
            {report.targetType === "Post" && (report.targetId?.content || (report.targetId?.mediaIds && report.targetId.mediaIds.length > 0)) && (
              <div style={{ fontSize: 14, color: "#333", padding: '12px', backgroundColor: '#fdfdfd', border: '1px solid #e0e0e0', borderRadius: 6, marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 6, color: '#174581' }}>
                  Nội dung bài viết bị báo cáo (Đăng bởi: {report.targetId.userId?.username || 'Ẩn danh'} - ID: {report.targetId.userId?._id}):
                </div>
                {report.targetId.content && (
                  <div style={{ fontStyle: 'italic', wordBreak: 'break-word', borderLeft: '3px solid #ccc', paddingLeft: 8, marginBottom: '8px' }}>
                    "{report.targetId.content}"
                  </div>
                )}
                {report.targetId?.mediaIds?.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {report.targetId.mediaIds.map((media, idx) => (
                      <img key={media._id || idx} src={media.url} alt="Post media" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e0e0' }} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {report.description && (
              <div style={{ fontSize: 14, color: "#334d73", padding: '10px', backgroundColor: '#f0f4f8', borderRadius: 6, marginBottom: 8 }}>
                <strong>Mô tả vi phạm: </strong> {report.description}
              </div>
            )}

            {/* Hiển thị ghi chú của kiểm duyệt viên */}
            {report.resolutionNote && (
              <div style={{ fontSize: 13, color: "#2E7D32", padding: '8px 10px', backgroundColor: '#E8F5E9', borderLeft: '3px solid #2E7D32', borderRadius: '0 6px 6px 0', marginBottom: 12 }}>
                <strong>Ghi chú xử lý: </strong> {report.resolutionNote} 
                {report.resolvedBy?.username && ` (Bởi: ${report.resolvedBy.username})`}
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
                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", width: "100%", paddingLeft: 10, borderLeft: "2px solid #ddd" }}>
                  <button
                    className="danger-btn"
                    onClick={() =>
                      moderatePost(
                        report.targetId?._id || report.targetId,
                        { status: "hidden" },
                        "Đã ẩn bài viết vi phạm",
                      )
                    }
                  >
                    Ẩn (Hidden)
                  </button>
                  <button
                    className="danger-btn"
                    style={{ backgroundColor: '#d32f2f', color: '#ffffff' }}
                    onClick={() =>
                      moderatePost(
                        report.targetId?._id || report.targetId,
                        { status: "deleted" },
                        "Đã xóa bài viết vi phạm vĩnh viễn",
                      )
                    }
                  >
                    Xóa (Deleted)
                  </button>
                  <button
                    className="ghost-btn"
                    style={{ borderColor: '#2E7D32', color: '#2E7D32' }}
                    onClick={() =>
                      moderatePost(
                        report.targetId?._id || report.targetId,
                        { status: "active" },
                        "Đã khôi phục bài viết (Active)",
                      )
                    }
                  >
                    Khôi phục (Active)
                  </button>
                  <button
                    className="tag-btn"
                    onClick={() =>
                      moderatePost(
                        report.targetId?._id || report.targetId,
                        { isPinned: true },
                        "Đã ghim bài viết",
                      )
                    }
                  >
                    Ghim bài
                  </button>
                </div>
              )}

              {report.targetType === "User" && (
                <button
                  className="danger-btn"
                  onClick={() => warnUser(report.targetId?._id || report.targetId)}
                >
                  Cảnh cáo user bị report
                </button>
              )}
            </div>
          </article>
        ))}
      </div>



      {message && (
        <p className="helper-text" style={{ marginTop: 10 }}>
          {message}
        </p>
      )}
    </section>
  );
};

export default ModeratorReportsPage;

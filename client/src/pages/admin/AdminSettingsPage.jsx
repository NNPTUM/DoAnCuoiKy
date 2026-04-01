import React, { useEffect, useState } from "react";
import API from "../../api/axios";
import "../dashboard.css";

const initialSettings = {
  features: {
    isLivestreamEnabled: true,
    isStoryEnabled: true,
    isImageCommentEnabled: true,
    isRegistrationEnabled: true,
  },
  algorithms: {
    newsfeedAlgorithm: "chronological",
    friendSuggestionLimit: 10,
  },
  ads: {
    isAdsEnabled: false,
  },
};

const normalizeSettings = (data = {}) => ({
  features: {
    isLivestreamEnabled: Boolean(data.features?.isLivestreamEnabled),
    isStoryEnabled: Boolean(data.features?.isStoryEnabled),
    isImageCommentEnabled: Boolean(data.features?.isImageCommentEnabled),
    isRegistrationEnabled: Boolean(data.features?.isRegistrationEnabled),
  },
  algorithms: {
    newsfeedAlgorithm:
      data.algorithms?.newsfeedAlgorithm ||
      initialSettings.algorithms.newsfeedAlgorithm,
    friendSuggestionLimit:
      Number(data.algorithms?.friendSuggestionLimit) ||
      initialSettings.algorithms.friendSuggestionLimit,
  },
  ads: {
    isAdsEnabled: Boolean(data.ads?.isAdsEnabled),
  },
});

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await API.get("/admin/settings");
        if (res.data?.success && res.data?.data) {
          setSettings(normalizeSettings(res.data.data));
        }
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Không thể tải cài đặt hệ thống",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const toggleFeature = (featureKey) => {
    setSettings((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [featureKey]: !prev.features?.[featureKey],
      },
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage("");
      const res = await API.put("/admin/settings", normalizeSettings(settings));
      if (res.data?.success) {
        setSettings(normalizeSettings(res.data.data));
        setMessage("Đã lưu cài đặt hệ thống thành công.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Lưu cài đặt thất bại");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="dashboard-panel dashboard-content-card">
      <div className="section-row">
        <h2 className="section-title">Settings</h2>
        <button
          className="primary-btn"
          onClick={saveSettings}
          disabled={saving || loading}
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      {loading ? (
        <div className="helper-text">Đang tải cài đặt...</div>
      ) : (
        <>
          <div className="setting-list">
            {[
              ["isLivestreamEnabled", "Cho phép livestream"],
              ["isStoryEnabled", "Bật hệ thống story"],
              ["isImageCommentEnabled", "Comment bằng hình ảnh"],
              ["isRegistrationEnabled", "Cho phép đăng ký tài khoản"],
            ].map(([key, label]) => (
              <div className="setting-item" key={key}>
                <strong>{label}</strong>
                <button
                  className={`switch ${settings.features?.[key] ? "switch-on" : "switch-off"}`}
                  onClick={() => toggleFeature(key)}
                  aria-label={label}
                />
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
            <label>
              Thuật toán Newfeed
              <select
                value={
                  settings.algorithms?.newsfeedAlgorithm || "chronological"
                }
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    algorithms: {
                      ...prev.algorithms,
                      newsfeedAlgorithm: e.target.value,
                    },
                  }))
                }
              >
                <option value="chronological">Chronological</option>
                <option value="engagement">Engagement</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </label>

            <label>
              Giới hạn gợi ý kết bạn mỗi lần
              <input
                type="number"
                min={1}
                max={100}
                value={settings.algorithms?.friendSuggestionLimit || 10}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    algorithms: {
                      ...prev.algorithms,
                      friendSuggestionLimit: Number(e.target.value),
                    },
                  }))
                }
              />
            </label>

            <label>
              Bật quảng cáo hệ thống
              <select
                value={settings.ads?.isAdsEnabled ? "enabled" : "disabled"}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    ads: {
                      ...prev.ads,
                      isAdsEnabled: e.target.value === "enabled",
                    },
                  }))
                }
              >
                <option value="disabled">Tắt quảng cáo</option>
                <option value="enabled">Bật quảng cáo</option>
              </select>
            </label>
          </div>
        </>
      )}

      {message && (
        <p className="helper-text" style={{ marginTop: 10 }}>
          {message}
        </p>
      )}
    </section>
  );
};

export default AdminSettingsPage;

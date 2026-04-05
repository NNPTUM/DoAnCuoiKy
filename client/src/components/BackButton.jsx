import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ style, label = "Trở về" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        marginBottom: "16px",
        padding: "8px 16px",
        backgroundColor: "#f0f2f5",
        border: "1px solid #dce2f5",
        borderRadius: "8px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
        fontWeight: 600,
        color: "#333",
        width: "fit-content",
        ...style,
      }}
    >
      ← {label}
    </button>
  );
};

export default BackButton;

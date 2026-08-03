import React, { useState } from "react";
import { FiImage } from "react-icons/fi";
import { formatDate, statusColor } from "../utils/studentHelpers";
import EmptyState from "./EmptyState";
import "./PaymentCard.css";

const STATUS_LABEL = {
  approved: "Approved",
  pending: "Pending",
  rejected: "Rejected",
};

/**
 * IMAGE_BASE should point at the endpoint that serves payment screenshots.
 * paymentService.getImage currently reuses the categories/image route — adjust
 * if your backend exposes a dedicated /payment/image/{fileName} endpoint.
 */
const IMAGE_BASE = `${
  import.meta.env.VITE_API_BASE_URL || "https://elp.mytufan.com/api/v1"
}/categories/image`;

export default function PaymentCard({ payment, loading, error }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (loading) {
    return (
      <div className="tsd-payment-card">
        <div className="tsd-skel" style={{ width: 160, height: 160, borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <div className="tsd-skel" style={{ width: "60%", height: 14, marginBottom: 10 }} />
          <div className="tsd-skel" style={{ width: "40%", height: 14 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return <EmptyState type="payment" description={error} />;
  }

  if (!payment) return null;

  const imageUrl = payment.screenshot ? `${IMAGE_BASE}/${payment.screenshot}` : null;

  return (
    <>
      <div className="tsd-payment-card">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Payment screenshot"
            className="tsd-payment-screenshot"
            onClick={() => setLightboxOpen(true)}
          />
        ) : (
          <div
            className="tsd-payment-screenshot"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#98a2b3" }}
          >
            <FiImage size={28} />
          </div>
        )}

        <div className="tsd-payment-details">
          <div>
            <div className="tsd-payment-field-label">Payment ID</div>
            <div className="tsd-payment-field-value">#{payment.paymentId ?? "—"}</div>
          </div>
          <div>
            <div className="tsd-payment-field-label">Status</div>
            <span className={`tsd-badge tsd-badge-${statusColor(payment.status)}`}>
              {STATUS_LABEL[payment.status] || payment.status}
            </span>
          </div>
          <div>
            <div className="tsd-payment-field-label">Uploaded Date</div>
            <div className="tsd-payment-field-value">{formatDate(payment.uploadedDate)}</div>
          </div>
          <div>
            <div className="tsd-payment-field-label">Valid Until</div>
            <div className="tsd-payment-field-value">{formatDate(payment.validUntil)}</div>
          </div>
          <div>
            <div className="tsd-payment-field-label">Verified</div>
            <div className="tsd-payment-field-value">{payment.verified ? "Yes" : "No"}</div>
          </div>
        </div>
      </div>

      {lightboxOpen && imageUrl && (
        <div className="tsd-lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <img src={imageUrl} alt="Payment screenshot full size" />
        </div>
      )}
    </>
  );
}

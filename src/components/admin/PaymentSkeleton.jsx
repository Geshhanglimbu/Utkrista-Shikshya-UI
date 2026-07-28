// components/payment/PaymentSkeleton.jsx
import './PaymentSkeleton.css';
import './PaymentStats.css'; // reuses .payment-stats / .stat-card layout for the stats skeleton

export function StatsSkeleton() {
  return (
    <div className="payment-stats">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="stat-card">
          <div className="skel skel--circle" style={{ width: 40, height: 40 }} />
          <div className="skel" style={{ marginTop: 16, height: 28, width: 64 }} />
          <div className="skel" style={{ marginTop: 8, height: 16, width: 96 }} />
        </div>
      ))}
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="skel-row">
      <td>
        <div className="skel-row__student">
          <div className="skel skel--circle skel-row__avatar" />
          <div className="skel-row__lines">
            <div className="skel" style={{ height: 14, width: 112 }} />
            <div className="skel" style={{ height: 12, width: 144 }} />
          </div>
        </div>
      </td>
      <td><div className="skel" style={{ height: 14, width: 64 }} /></td>
      <td><div className="skel" style={{ height: 14, width: 96 }} /></td>
      <td><div className="skel" style={{ height: 14, width: 56 }} /></td>
      <td><div className="skel" style={{ height: 14, width: 80 }} /></td>
      <td><div className="skel" style={{ height: 20, width: 64, borderRadius: 999 }} /></td>
      <td><div className="skel" style={{ height: 36, width: 36, borderRadius: 8 }} /></td>
      <td><div className="skel skel--circle" style={{ height: 28, width: 28 }} /></td>
    </tr>
  );
}

export default function PaymentSkeleton({ rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRowSkeleton key={i} />
      ))}
    </>
  );
}

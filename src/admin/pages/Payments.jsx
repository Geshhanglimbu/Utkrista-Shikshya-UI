import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import usePayments from '../hooks/usePayments';
import PaymentStats from '../../components/admin/PaymentStats';
import PaymentTable from '../../components/admin/PaymentTable';
import PaymentDetailsModal from '../../components/admin/PaymentDetailsModal';
import './Payments.css';

export default function Payments() {
  const {
    payments,
    totalFiltered,
    stats,
    monthlyRevenue,
    revenueLoading,
    loading,
    error,
    actioningId,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    totalPages,
    rowsPerPage,
    approvePayment,
    rejectPayment,
    refreshAll,
  } = usePayments();

  const [selectedPayment, setSelectedPayment] = useState(null);

  return (
    <div className="payments-page">
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />

      {/* Header */}
      <header className="payments-page__header">
        <h1 className="payments-page__title">Payment Management</h1>
        <p className="payments-page__subtitle">Review and approve student enrollment payments.</p>
      </header>

      {/* Statistics Cards */}
      <PaymentStats
        stats={stats}
        monthlyRevenue={monthlyRevenue}
        revenueLoading={revenueLoading}
        loading={loading}
      />

      {/* Payment Table */}
      <div className="payments-page__table">
        <PaymentTable
          payments={payments}
          loading={loading}
          error={error}
          onRetry={refreshAll}
          onView={setSelectedPayment}
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(val) => {
            setStatusFilter(val);
            setPage(1);
          }}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalFiltered={totalFiltered}
          rowsPerPage={rowsPerPage}
        />
      </div>

      {/* Details & Verification Modal */}
      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onApprove={approvePayment}
          onReject={rejectPayment}
          busy={actioningId === selectedPayment.paymentId}
        />
      )}
    </div>
  );
}

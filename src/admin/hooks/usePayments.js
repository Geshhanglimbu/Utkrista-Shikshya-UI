import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { paymentService } from '../../services/api';

const ROWS_PER_PAGE = 10;

export function formatLocalDateTime(arr) {
  if (!arr) return '—';
  if (!Array.isArray(arr) || arr.length < 3) {
    if (typeof arr === 'string') {
      const d = new Date(arr);
      return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return '—';
  }
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = arr[0];
  const month = arr[1]; // 1-indexed
  const day = arr[2];
  const monthStr = monthNames[month - 1] || '—';
  return `${monthStr} ${day}, ${year}`;
}

export function formatCurrency(val) {
  const num = Number(val);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

function parseDateForSort(arr) {
  if (!Array.isArray(arr) || arr.length < 3) return 0;
  const [year, month, day, hour = 0, minute = 0, second = 0] = arr;
  return new Date(year, month - 1, day, hour, minute, second).getTime();
}

export default function usePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [revenueLoading, setRevenueLoading] = useState(true);

  // Filters & Controls
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('latest');
  const [page, setPage] = useState(1);

  // Busy state tracked strictly by paymentId
  const [actioningId, setActioningId] = useState(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentService.getAllPayments();
      const list = Array.isArray(res.data) ? res.data : res.data?.content || [];
      setPayments(list);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load payments.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

 const fetchMonthlyRevenue = useCallback(async () => {
  setRevenueLoading(true);

  try {
    const res = await paymentService.getMonthlyRevenue();
    console.log(res.data);

    console.log("Monthly Revenue:", res.data);

    let revenue = 0;

    if (typeof res.data === "number") {
      revenue = res.data;
    } else if (typeof res.data === "object" && res.data !== null) {
      revenue = Object.values(res.data).reduce(
        (sum, value) => sum + Number(value || 0),
        0
      );
    }

    setMonthlyRevenue(revenue);
  } catch (err) {
    console.error(err);
    setMonthlyRevenue(0);
  } finally {
    setRevenueLoading(false);
  }
}, []);
  useEffect(() => {
    fetchPayments();
    fetchMonthlyRevenue();
  }, [fetchPayments, fetchMonthlyRevenue]);

  const refreshAll = useCallback(() => {
    fetchPayments();
    fetchMonthlyRevenue();
  }, [fetchPayments, fetchMonthlyRevenue]);

  // Derived real stats from payments list
  const stats = useMemo(() => {
    return payments.reduce(
      (acc, p) => {
        const st = (p.status || '').toUpperCase();
        if (st === 'PENDING') acc.pending += 1;
        else if (st === 'APPROVED') acc.approved += 1;
        else if (st === 'REJECTED') acc.rejected += 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 }
    );
  }, [payments]);

  // Filtering & Sorting
  const filteredPayments = useMemo(() => {
    let result = payments;

    if (statusFilter && statusFilter !== 'ALL') {
      result = result.filter((p) => (p.status || '').toUpperCase() === statusFilter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          (p.user?.name || '').toLowerCase().includes(q) ||
          (p.user?.email || '').toLowerCase().includes(q) ||
          (p.categories?.[0]?.categoryTitle || '').toLowerCase().includes(q) ||
          String(p.user?.id || '').toLowerCase().includes(q) ||
          String(p.paymentId || '').toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a, b) => {
      const aTime = parseDateForSort(a.addedDate || a.paymentDate);
      const bTime = parseDateForSort(b.addedDate || b.paymentDate);
      return sortOrder === 'latest' ? bTime - aTime : aTime - bTime;
    });

    return result;
  }, [payments, statusFilter, search, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / ROWS_PER_PAGE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginatedPayments = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filteredPayments.slice(start, start + ROWS_PER_PAGE);
  }, [filteredPayments, page]);

  const approvePayment = useCallback(
    async (paymentId) => {
      if (!paymentId) return false;
      setActioningId(paymentId);
      try {
        await paymentService.approve(paymentId);
        console.log("Approve Success:", paymentId);

            toast.success("Payment approved successfully");

            // Update UI immediately
            setPayments(prev =>
            prev.map(payment =>
                payment.paymentId === paymentId
                ? {
                    ...payment,
                    status: "APPROVED",
                    }
                : payment
            )
            );

            // Refresh in background
            fetchPayments();
            fetchMonthlyRevenue();

            return true;
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to approve payment.');
        return false;
      } finally {
        setActioningId(null);
      }
    },
    [fetchPayments, fetchMonthlyRevenue]
  );

  const rejectPayment = useCallback(
    async (paymentId) => {
      if (!paymentId) return false;
      setActioningId(paymentId);
      try {
       await paymentService.reject(paymentId);

        toast.success("Payment rejected successfully");

        // Update UI immediately
        setPayments(prev =>
        prev.map(payment =>
            payment.paymentId === paymentId
            ? {
                ...payment,
                status: "REJECTED",
                }
            : payment
        )
        );

        // Refresh in background
        fetchPayments();
        fetchMonthlyRevenue();

        return true;
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to reject payment.');
        return false;
      } finally {
        setActioningId(null);
      }
    },
    [fetchPayments, fetchMonthlyRevenue]
  );

  return {
    payments: paginatedPayments,
    totalFiltered: filteredPayments.length,
    stats,
    monthlyRevenue,
    revenueLoading,
    loading,
    error,
    actioningId,

    // Controls
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    page,
    setPage,
    totalPages,
    rowsPerPage: ROWS_PER_PAGE,

    // Actions
    approvePayment,
    rejectPayment,
    refreshAll,
  };
}

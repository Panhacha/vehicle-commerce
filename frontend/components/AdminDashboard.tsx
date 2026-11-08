"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Car,
  Package,
  ArrowRightLeft,
  History,
  ShoppingCart,
  CreditCard,
  Repeat,
  Calendar,
  Bot,
  Users,
  Search,
  Plus,
  Filter,
  Download,
  X,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building2,
  RefreshCw,
  LogOut,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Send,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Shield,
  KeyRound,
  UserCheck,
  UserX,
  Check,
  Phone,
  Mail,
  Grid,
  List,
  Sparkles,
  ArrowUpRight,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";
import {
  AdminUser,
  Branch,
  Order,
  TradeInRequest,
  InstallmentApplication,
  InstallmentPaymentSchedule,
  BranchInventoryItem,
  NotificationLog,
  Product,
  StockMovement,
  StockTransfer,
  TelegramStatus,
} from "./types";
import { adminApi } from "./adminApi";
import { MarqueeAdminModal } from "./MarqueeAdminModal";

interface AdminDashboardProps {
  branches?: Branch[];
  orders?: Order[];
  tradeIns?: TradeInRequest[];
  installments?: InstallmentApplication[];
  inventory?: BranchInventoryItem[];
  products?: Product[];
  transfers?: StockTransfer[];
  movements?: StockMovement[];
  schedules?: InstallmentPaymentSchedule[];
  users?: AdminUser[];
  telegramStatus?: TelegramStatus | null;
  notificationLogs?: NotificationLog[];
  token: string;
  currentRole: "SUPER_ADMIN" | "BRANCH_ADMIN" | "STAFF";
  currentUserID: string;
  assignedBranchID: string;
  onExitAdmin: () => void;
}

type TabType =
  | "overview"
  | "inventory"
  | "transfers"
  | "history"
  | "orders"
  | "payments"
  | "tradein"
  | "loans"
  | "schedules"
  | "telegram"
  | "users"
  | "categories";

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  branches = [],
  orders: initialOrders = [],
  tradeIns: initialTradeIns = [],
  installments: initialInstallments = [],
  inventory: initialInventory = [],
  products = [],
  transfers: initialTransfers = [],
  movements: initialMovements = [],
  schedules: initialSchedules = [],
  users: initialUsers = [],
  telegramStatus: initialTelegramStatus = null,
  notificationLogs: initialNotificationLogs = [],
  token,
  currentRole,
  currentUserID,
  assignedBranchID,
  onExitAdmin,
}) => {
  // Navigation & Filtering State
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedBranchId, setSelectedBranchId] = useState<string>(assignedBranchID || "ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Collapsible Accordion Groups State
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    inventory: true,
    sales: true,
    finance: false,
    system: false,
  });

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  // Automatically expand group containing active tab
  useEffect(() => {
    if (["inventory", "transfers", "history"].includes(activeTab)) {
      setExpandedGroups((prev) => ({ ...prev, inventory: true }));
    } else if (["orders", "payments", "tradein"].includes(activeTab)) {
      setExpandedGroups((prev) => ({ ...prev, sales: true }));
    } else if (["loans", "schedules"].includes(activeTab)) {
      setExpandedGroups((prev) => ({ ...prev, finance: true }));
    } else if (["telegram", "categories", "users"].includes(activeTab)) {
      setExpandedGroups((prev) => ({ ...prev, system: true }));
    }
  }, [activeTab]);

  // Data State
  const [inventoryList, setInventoryList] = useState(initialInventory ?? []);
  const [ordersList, setOrdersList] = useState(initialOrders ?? []);
  const [tradeInsList, setTradeInsList] = useState(initialTradeIns ?? []);
  const [installmentsList, setInstallmentsList] = useState(initialInstallments ?? []);
  const [transfersList, setTransfersList] = useState(initialTransfers ?? []);
  const [movementsList] = useState(initialMovements ?? []);
  const [schedulesList, setSchedulesList] = useState(initialSchedules ?? []);
  const [usersList, setUsersList] = useState(initialUsers ?? []);
  const [telegramStatus, setTelegramStatus] = useState(initialTelegramStatus);
  const [notificationLogsList, setNotificationLogsList] = useState(initialNotificationLogs ?? []);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync state if parent props update
  useEffect(() => {
    if (initialOrders) setOrdersList(initialOrders);
  }, [initialOrders]);

  useEffect(() => {
    if (initialInventory) setInventoryList(initialInventory);
  }, [initialInventory]);

  // Real-time Fetch & Refresh Orders and Inventory from Backend & Supabase
  const fetchOrdersAndData = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const isSuperAdmin = currentRole === "SUPER_ADMIN";
      const branchQuery = !isSuperAdmin && assignedBranchID ? `?branch_id=${encodeURIComponent(assignedBranchID)}` : "";
      
      const ordersRes = await adminApi<{ data: Order[] }>(`/admin/orders${branchQuery}`, token);
      if (ordersRes && Array.isArray(ordersRes.data)) {
        setOrdersList(ordersRes.data);
      }

      const invRes = await adminApi<{ data: BranchInventoryItem[] }>(`/admin/inventory${branchQuery}`, token).catch(() => null);
      if (invRes && Array.isArray(invRes.data)) {
        setInventoryList(invRes.data);
      }
    } catch (e: any) {
      console.warn("Failed to refresh orders in Admin:", e);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, [currentRole, assignedBranchID, token]);

  // Auto-refresh when switching to Orders tab, on cross-tab order events, or periodically
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrdersAndData(true);
    }
  }, [activeTab, fetchOrdersAndData]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "drivex_last_order_ts" || e.key === "drivex_user_bookings") {
        fetchOrdersAndData(true);
      }
    };
    window.addEventListener("storage", handleStorageChange);

    const interval = setInterval(() => {
      fetchOrdersAndData(true);
    }, 10000); // 10s auto-refresh for real-time order monitoring

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [fetchOrdersAndData]);

  // UI Modals
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AdminUser | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    full_name: "",
    phone: "",
    role: "STAFF" as AdminUser["role"],
    branch_id: "",
    status: "ACTIVE",
    new_password: "",
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>("ALL");
  const [staffBranchFilter, setStaffBranchFilter] = useState<string>("ALL");
  const [appraiseModalItem, setAppraiseModalItem] = useState<TradeInRequest | null>(null);
  const [appraiseAmount, setAppraiseAmount] = useState<number>(0);

  // Status / Alert Feedback
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Product categories
  const stockableProducts = useMemo(
    () => (products ?? []).filter((p) => p.category_type === "SPARE_PART" || p.category_type === "BICYCLE"),
    [products]
  );
  const vehicleProducts = useMemo(
    () => (products ?? []).filter((p) => p.category_type === "GASOLINE_VEHICLE" || p.category_type === "ELECTRIC_VEHICLE"),
    [products]
  );

  // Transfer Form State
  const [fromBranchId, setFromBranchId] = useState(assignedBranchID || branches[0]?.id || "");
  const [toBranchId, setToBranchId] = useState(branches.find((b) => b.id !== (assignedBranchID || branches[0]?.id))?.id || "");
  const [transferProductId, setTransferProductId] = useState(stockableProducts[0]?.id || products[0]?.id || "");
  const [transferQty, setTransferQty] = useState(1);
  const [transferNotes, setTransferNotes] = useState("");

  // Stock Form State
  const [stockBranchID, setStockBranchID] = useState(assignedBranchID || branches[0]?.id || "");
  const [stockProductID, setStockProductID] = useState(stockableProducts[0]?.id || "");
  const [stockQuantity, setStockQuantity] = useState(5);
  const [stockThreshold, setStockThreshold] = useState(2);

  // Vehicle Form State
  const [vehicleForm, setVehicleForm] = useState({
    branch_id: assignedBranchID || branches[0]?.id || "",
    product_id: vehicleProducts[0]?.id || "",
    vin: "",
    engine_no: "",
    color: "Black Metallic",
    mileage_km: 0,
    plate_number: "",
    cost_price: 35000,
    selling_price: 42000,
  });

  // User Form State
  const [userForm, setUserForm] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: "STAFF" as AdminUser["role"],
    branch_id: branches[0]?.id || "",
  });

  // History date filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // POS Payment Lookup State
  const [paymentOrderReference, setPaymentOrderReference] = useState("");
  const [resolvedPaymentOrder, setResolvedPaymentOrder] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const notifySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // ==========================================
  // API ACTIONS
  // ==========================================

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromBranchId === toBranchId) {
      setApiError("Source and destination branch cannot be the same.");
      return;
    }
    setApiError("");
    try {
      await adminApi("/admin/inventory/transfers", token, {
        method: "POST",
        body: JSON.stringify({
          from_branch_id: fromBranchId,
          to_branch_id: toBranchId,
          product_id: transferProductId,
          quantity: transferQty,
          notes: transferNotes,
        }),
      });
      const response = await adminApi<{ data: StockTransfer[] }>("/admin/inventory/transfers", token);
      setTransfersList(response.data);
      notifySuccess("Stock transfer request created successfully.");
      setTransferModalOpen(false);
      setTransferNotes("");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Stock transfer failed.");
    }
  };

  const handleTransferAction = async (transferID: string, action: "approve" | "receive" | "reject") => {
    setApiError("");
    try {
      await adminApi(`/admin/inventory/transfers/${transferID}/${action}`, token, { method: "PATCH" });
      const [transfersRes, inventoryRes] = await Promise.all([
        adminApi<{ data: StockTransfer[] }>("/admin/inventory/transfers", token),
        adminApi<{ data: BranchInventoryItem[] }>("/admin/inventory", token),
      ]);
      setTransfersList(transfersRes.data);
      setInventoryList(inventoryRes.data);
      notifySuccess(`Transfer status updated to ${action.toUpperCase()}.`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Transfer action failed.");
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    try {
      await adminApi("/admin/inventory/stock", token, {
        method: "POST",
        body: JSON.stringify({
          branch_id: stockBranchID,
          product_id: stockProductID,
          quantity: stockQuantity,
          min_threshold: stockThreshold,
        }),
      });
      const response = await adminApi<{ data: BranchInventoryItem[] }>("/admin/inventory", token);
      setInventoryList(response.data);
      notifySuccess("Inventory stock replenished successfully.");
      setStockModalOpen(false);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Stock update failed.");
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    try {
      await adminApi("/admin/inventory/vehicles", token, {
        method: "POST",
        body: JSON.stringify(vehicleForm),
      });
      const response = await adminApi<{ data: BranchInventoryItem[] }>("/admin/inventory", token);
      setInventoryList(response.data);
      notifySuccess(`Vehicle unit (VIN: ${vehicleForm.vin || "Auto"}) registered successfully.`);
      setVehicleModalOpen(false);
      setVehicleForm({
        branch_id: assignedBranchID || branches[0]?.id || "",
        product_id: vehicleProducts[0]?.id || "",
        vin: "",
        engine_no: "",
        color: "Black Metallic",
        mileage_km: 0,
        plate_number: "",
        cost_price: 35000,
        selling_price: 42000,
      });
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Vehicle registration failed.");
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setApiError("");
    try {
      await adminApi(`/admin/orders/${orderId}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      setOrdersList((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      notifySuccess(`Order #${orderId.slice(0, 8)} updated to ${newStatus}.`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Order update failed.");
    }
  };

  const handleFindPaymentOrder = async () => {
    setApiError("");
    setResolvedPaymentOrder(null);
    try {
      const response = await adminApi<{ data: Order }>(
        `/admin/orders/lookup?reference=${encodeURIComponent(paymentOrderReference)}`,
        token
      );
      setResolvedPaymentOrder(response.data);
      setPaymentAmount(response.data.balance_due ? String(response.data.balance_due) : String(response.data.total_amount));
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Order lookup failed. Check Order # or Reference.");
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedPaymentOrder) return;
    setApiError("");
    try {
      await adminApi(`/admin/orders/${encodeURIComponent(resolvedPaymentOrder.id)}/payments`, token, {
        method: "POST",
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          payment_method: paymentMethod,
        }),
      });
      notifySuccess(`Payment of $${parseFloat(paymentAmount).toLocaleString()} recorded successfully.`);
      setResolvedPaymentOrder(null);
      setPaymentOrderReference("");
      setPaymentAmount("");
      const ordersRes = await adminApi<{ data: Order[] }>("/admin/orders", token);
      setOrdersList(ordersRes.data);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Payment recording failed.");
    }
  };

  const handleAppraiseTradeIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appraiseModalItem) return;
    setApiError("");
    try {
      await adminApi(`/admin/trade-in/${appraiseModalItem.id}/appraise`, token, {
        method: "PATCH",
        body: JSON.stringify({
          appraised_value: appraiseAmount,
          status: "APPRAISED",
          notes: "Approved by Senior Vehicle Inspector.",
        }),
      });
      setTradeInsList((prev) =>
        prev.map((t) =>
          t.id === appraiseModalItem.id
            ? { ...t, appraised_value: appraiseAmount, status: "APPRAISED", appraisal_notes: "Approved by Senior Inspector" }
            : t
        )
      );
      notifySuccess("Trade-in appraisal completed.");
      setAppraiseModalItem(null);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Appraisal failed.");
    }
  };

  const handleApproveLoan = async (loanId: string, status: "APPROVED" | "REJECTED") => {
    setApiError("");
    try {
      await adminApi(`/admin/installments/${loanId}/status`, token, {
        method: "PATCH",
        body: JSON.stringify({ status, notes: `Reviewed by ${currentRole}.` }),
      });
      setInstallmentsList((prev) =>
        prev.map((l) => (l.id === loanId ? { ...l, status, reviewer_notes: `Reviewed by ${currentRole}.` } : l))
      );
      notifySuccess(`Installment application ${status}.`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Loan update failed.");
    }
  };

  const handleRecordSchedulePayment = async (scheduleID: string) => {
    setApiError("");
    try {
      await adminApi(`/admin/installment-schedules/${scheduleID}/payment`, token, { method: "PATCH" });
      setSchedulesList((prev) =>
        prev.map((s) => (s.id === scheduleID ? { ...s, payment_status: "PAID", overdue_days: 0 } : s))
      );
      notifySuccess("Installment payment recorded as PAID.");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Schedule payment failed.");
    }
  };

  const handleSendPaymentReminder = async (scheduleID: string) => {
    setApiError("");
    try {
      await adminApi(`/admin/installment-schedules/${scheduleID}/reminder`, token, { method: "POST" });
      notifySuccess("Telegram reminder dispatched to customer.");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Reminder failed.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");

    if (userForm.password.length < 8) {
      setApiError("Password must be at least 8 characters (ពាក្យសម្ងាត់យ៉ាងតិច ៨ តួ)។");
      return;
    }

    try {
      const payload = {
        ...userForm,
        branch_id: userForm.role === "SUPER_ADMIN" ? "" : userForm.branch_id,
      };
      await adminApi("/admin/users", token, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const response = await adminApi<{ data: AdminUser[] }>("/admin/users", token);
      setUsersList(response.data);
      notifySuccess(`Showroom staff account "${userForm.username}" created successfully.`);
      setUserModalOpen(false);
      setUserForm({ username: "", email: "", password: "", full_name: "", phone: "", role: "STAFF", branch_id: branches[0]?.id || "" });
      setShowCreatePassword(false);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Staff creation failed.");
    }
  };

  const handleOpenEditUser = (user: AdminUser) => {
    setSelectedUserForEdit(user);
    setEditUserForm({
      full_name: user.full_name || "",
      phone: user.phone || "",
      role: user.role,
      branch_id: user.branch_id || (branches[0]?.id ?? ""),
      status: user.status || "ACTIVE",
      new_password: "",
    });
    setShowEditPassword(false);
    setEditUserModalOpen(true);
  };

  const handleSaveEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;
    setApiError("");

    if (editUserForm.new_password && editUserForm.new_password.length < 8) {
      setApiError("New password must be at least 8 characters (ពាក្យសម្ងាត់ថ្មីត្រូវមានយ៉ាងតិច ៨ តួ)។");
      return;
    }

    try {
      const payload: any = {
        full_name: editUserForm.full_name,
        phone: editUserForm.phone,
        role: editUserForm.role,
        branch_id: editUserForm.role === "SUPER_ADMIN" ? "" : editUserForm.branch_id,
        status: editUserForm.status,
      };
      if (editUserForm.new_password) {
        payload.password = editUserForm.new_password;
      }

      await adminApi(`/admin/users/${selectedUserForEdit.id}`, token, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      const response = await adminApi<{ data: AdminUser[] }>("/admin/users", token);
      setUsersList(response.data);
      notifySuccess(`Staff member "${editUserForm.full_name || selectedUserForEdit.username}" updated.`);
      setEditUserModalOpen(false);
      setSelectedUserForEdit(null);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Staff account update failed.");
    }
  };

  const handleOpenDeleteUser = (user: AdminUser) => {
    setUserToDelete(user);
    setDeleteUserModalOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setApiError("");
    try {
      await adminApi(`/admin/users/${userToDelete.id}`, token, {
        method: "DELETE",
      });
      const response = await adminApi<{ data: AdminUser[] }>("/admin/users", token);
      setUsersList(response.data);
      notifySuccess(`Staff account "${userToDelete.full_name}" (@${userToDelete.username}) removed or archived.`);
      setDeleteUserModalOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Failed to remove staff account.");
    }
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    setApiError("");
    try {
      const nextStatus = user.status === "ACTIVE" ? "DISABLED" : "ACTIVE";
      await adminApi(`/admin/users/${user.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ role: user.role, branch_id: user.branch_id || "", status: nextStatus }),
      });
      setUsersList((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)));
      notifySuccess(`Account status changed to ${nextStatus}.`);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "User status update failed.");
    }
  };

  const handleTriggerTelegramTest = async (type: string) => {
    setApiError("");
    try {
      const res = await adminApi<{ message: string }>("/admin/telegram/test", token, {
        method: "POST",
        body: JSON.stringify({ message: type }),
      });
      const logs = await adminApi<{ data: NotificationLog[] }>("/admin/telegram/logs", token);
      setNotificationLogsList(logs.data);
      notifySuccess(res.message || "Telegram test alert sent.");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Telegram test failed.");
    }
  };

  const exportStockHistory = () => {
    const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [
      ["Date", "Branch", "Type", "Item", "Quantity", "Performed By"],
      ...filteredMovements.map((m) => [m.created_at, m.branch_name, m.transaction_type, m.product_name, m.quantity, m.performed_by]),
    ];
    const blob = new Blob([rows.map((row) => row.map(csvEscape).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-movements-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ==========================================
  // FILTERED DATA
  // ==========================================
  const filteredOrders = useMemo(
    () =>
      (ordersList ?? []).filter((o) => {
        const matchesBranch = selectedBranchId === "ALL" || o.branch_id === selectedBranchId;
        const matchesSearch =
          !searchQuery ||
          o.order_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.customer_phone?.includes(searchQuery);
        return matchesBranch && matchesSearch;
      }),
    [ordersList, selectedBranchId, searchQuery]
  );

  const filteredInventory = useMemo(
    () =>
      (inventoryList ?? []).filter((i) => {
        const matchesBranch = selectedBranchId === "ALL" || i.branch_id === selectedBranchId;
        const matchesSearch =
          !searchQuery ||
          i.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.branch_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBranch && matchesSearch;
      }),
    [inventoryList, selectedBranchId, searchQuery]
  );

  const filteredTradeIns = useMemo(
    () =>
      (tradeInsList ?? []).filter((t) => {
        const matchesBranch = selectedBranchId === "ALL" || t.target_branch_id === selectedBranchId;
        const matchesSearch =
          !searchQuery ||
          t.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.current_model?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBranch && matchesSearch;
      }),
    [tradeInsList, selectedBranchId, searchQuery]
  );

  const filteredLoans = useMemo(
    () =>
      (installmentsList ?? []).filter((l) => {
        const matchesBranch = selectedBranchId === "ALL" || l.branch_id === selectedBranchId;
        const matchesSearch = !searchQuery || l.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBranch && matchesSearch;
      }),
    [installmentsList, selectedBranchId, searchQuery]
  );

  const filteredTransfers = useMemo(
    () =>
      (transfersList ?? []).filter((t) => {
        const matchesBranch = selectedBranchId === "ALL" || t.from_branch_id === selectedBranchId || t.to_branch_id === selectedBranchId;
        const matchesSearch = !searchQuery || t.product_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBranch && matchesSearch;
      }),
    [transfersList, selectedBranchId, searchQuery]
  );

  const filteredMovements = useMemo(
    () =>
      (movementsList ?? []).filter((m) => {
        const date = m.created_at?.slice(0, 10) ?? "";
        const matchesBranch = selectedBranchId === "ALL" || m.branch_id === selectedBranchId;
        const matchesDate = (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
        const matchesSearch = !searchQuery || m.product_name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBranch && matchesDate && matchesSearch;
      }),
    [movementsList, selectedBranchId, fromDate, toDate, searchQuery]
  );

  const filteredSchedules = useMemo(
    () =>
      (schedulesList ?? []).filter((s) => {
        const matchesBranch = selectedBranchId === "ALL" || s.branch_id === selectedBranchId;
        const matchesSearch = !searchQuery || s.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || s.order_no?.includes(searchQuery);
        return matchesBranch && matchesSearch;
      }),
    [schedulesList, selectedBranchId, searchQuery]
  );

  const filteredUsers = useMemo(
    () =>
      (usersList ?? []).filter((u) => {
        const q = staffSearchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (u.full_name && u.full_name.toLowerCase().includes(q)) ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.email && u.email.toLowerCase().includes(q)) ||
          (u.phone && u.phone.toLowerCase().includes(q));

        const matchesRole = staffRoleFilter === "ALL" || u.role === staffRoleFilter;
        const matchesBranch =
          staffBranchFilter === "ALL" ||
          (staffBranchFilter === "HQ" && (!u.branch_id || u.role === "SUPER_ADMIN")) ||
          u.branch_id === staffBranchFilter;

        return matchesSearch && matchesRole && matchesBranch;
      }),
    [usersList, staffSearchQuery, staffRoleFilter, staffBranchFilter]
  );

  const activeStaffCount = useMemo(
    () => (usersList ?? []).filter((u) => u.status === "ACTIVE").length,
    [usersList]
  );
  const disabledStaffCount = useMemo(
    () => (usersList ?? []).filter((u) => u.status === "DISABLED").length,
    [usersList]
  );

  // Executive KPI calculations
  const totalVehiclesInStock = useMemo(
    () => filteredInventory.reduce((acc, curr) => acc + (curr.available_qty ?? (curr.quantity - (curr.reserved_qty || 0))), 0),
    [filteredInventory]
  );
  const totalOrdersAmount = useMemo(
    () => filteredOrders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0),
    [filteredOrders]
  );
  const pendingOrdersCount = useMemo(
    () => filteredOrders.filter((o) => o.status === "PENDING" || o.status === "PROCESSING").length,
    [filteredOrders]
  );
  const pendingTransfersCount = useMemo(
    () => (transfersList ?? []).filter((t) => t.status === "PENDING").length,
    [transfersList]
  );
  const overdueSchedulesCount = useMemo(
    () => (schedulesList ?? []).filter((s) => s.payment_status !== "PAID" && (s.overdue_days || 0) > 0).length,
    [schedulesList]
  );
  const pendingLoansCount = useMemo(
    () => (installmentsList ?? []).filter((l) => l.status === "PENDING").length,
    [installmentsList]
  );

  const branchStats = useMemo(() => {
    return (branches || []).map((b) => {
      const branchItems = (inventoryList || []).filter((item) => item.branch_id === b.id);
      const totalQty = branchItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
      const reservedQty = branchItems.reduce((acc, curr) => acc + (curr.reserved_qty || 0), 0);
      const availableQty = branchItems.reduce(
        (acc, curr) => acc + (curr.available_qty ?? (curr.quantity - (curr.reserved_qty || 0))),
        0
      );
      return {
        branch: b,
        totalQty,
        reservedQty,
        availableQty,
        itemCount: branchItems.length,
      };
    });
  }, [branches, inventoryList]);

  const lowStockItems = useMemo(() => {
    return (inventoryList || []).filter((i) => {
      const avail = i.available_qty ?? (i.quantity - (i.reserved_qty || 0));
      return avail <= (i.min_threshold || 2);
    });
  }, [inventoryList]);

  const currentBranchName = useMemo(() => {
    if (selectedBranchId === "ALL") return "All Branches (Consolidated)";
    return branches.find((b) => b.id === selectedBranchId)?.name || "Assigned Branch";
  }, [selectedBranchId, branches]);

  // Helper to find image for product
  const getProductImage = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (prod && prod.images && prod.images.length > 0) {
      return prod.images[0];
    }
    return "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/relative/2026/camry/base.png?bg=fff&fmt=webp&qlt=90&wid=600";
  };

  const getProductInfo = (productId: string) => {
    return products.find((p) => p.id === productId);
  };

  return (
    <div className="h-screen w-full bg-[#07090e] text-slate-200 flex font-sans antialiased overflow-hidden selection:bg-blue-600 selection:text-white relative">
      {/* Background Cosmic Glows (Reference RWA.xyz Style) */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-80 w-[500px] h-[400px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* ======================================================== */}
      {/* 1. DARK CYBERPUNK / WEB3 STYLE SLEEK SIDEBAR */}
      {/* ======================================================== */}
      <aside className="w-72 h-screen bg-[#0a0e17] border-r border-white/[0.08] flex flex-col justify-between shrink-0 select-none shadow-2xl sticky top-0 z-30 overflow-y-auto">
        <div className="flex flex-col">
          {/* Logo & Brand Header (Matching Header Height h-16) */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 font-black text-lg">
                H
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  Horizon <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold tracking-wide">FLEET</span>
                </span>
                <p className="text-[11px] text-slate-400 font-medium">Vehicle Commerce ERP</p>
              </div>
            </div>
          </div>

          {/* Sidebar Search Bar */}
          <div className="px-4 py-2.5 border-b border-white/[0.04]">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search operations..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-[#0e1322] border border-white/[0.08] rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:bg-[#12182a] transition-all font-medium"
              />
              {sidebarSearch ? (
                <button
                  onClick={() => setSidebarSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 font-mono bg-[#141b2e] border border-white/10 px-1 py-0.2 rounded shadow-2xs">
                  ⌘F
                </span>
              )}
            </div>
          </div>

          {/* Collapsible Accordion Navigation Items (ចំណុចគោលៗ) */}
          <nav className="p-3 space-y-1.5 text-xs font-semibold">
            {/* 1. STANDALONE: Dashboard Overview */}
            {(!sidebarSearch || "dashboard overview".includes(sidebarSearch.toLowerCase())) && (
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === "overview"
                    ? "bg-gradient-to-r from-blue-600/20 via-indigo-600/15 to-transparent text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className={`w-4 h-4 ${activeTab === "overview" ? "text-blue-400" : "text-slate-400"}`} />
                  <span className="text-xs font-bold">Dashboard Overview</span>
                </div>
              </button>
            )}

            {/* 2. MAIN CATEGORY: Inventory & Logistics (ឃ្លាំង និងស្តុកយានយន្ត) */}
            {(!sidebarSearch || "inventory logistics warehouse transfers movements".includes(sidebarSearch.toLowerCase())) && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0c101c]/80 overflow-hidden">
                <div
                  onClick={() => toggleGroup("inventory")}
                  className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer select-none ${
                    ["inventory", "transfers", "history"].includes(activeTab)
                      ? "text-blue-300 font-bold bg-blue-500/10 border-b border-blue-500/20"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Car className={`w-4 h-4 ${["inventory", "transfers", "history"].includes(activeTab) ? "text-blue-400" : "text-slate-400"}`} />
                    <span className="text-xs font-bold">Inventory & Logistics</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(!expandedGroups.inventory && !sidebarSearch) && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-mono font-bold">
                        {inventoryList.length}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        (expandedGroups.inventory || sidebarSearch) ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Nested Sub-Items */}
                {(expandedGroups.inventory || Boolean(sidebarSearch)) && (
                  <div className="px-2 py-1.5 space-y-0.5 bg-[#080b12] border-t border-white/[0.04]">
                    <button
                      onClick={() => setActiveTab("inventory")}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "inventory"
                          ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "inventory" ? "bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" : "bg-slate-600"}`}></span>
                        <span>Vehicles & Warehouse</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-slate-300 font-mono font-bold border border-white/5">
                        {inventoryList.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab("transfers")}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "transfers"
                          ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "transfers" ? "bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" : "bg-slate-600"}`}></span>
                        <span>Inter-Branch Transfers</span>
                      </span>
                      {pendingTransfersCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                          {pendingTransfersCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab("history")}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "history"
                          ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "history" ? "bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" : "bg-slate-600"}`}></span>
                        <span>Stock Audit Movements</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 3. MAIN CATEGORY: Sales & Orders (ការលក់ និងអតិថិជន) */}
            {(!sidebarSearch || "sales orders customer pos payments trade-in".includes(sidebarSearch.toLowerCase())) && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0c101c]/80 overflow-hidden">
                <div
                  onClick={() => toggleGroup("sales")}
                  className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer select-none ${
                    ["orders", "payments", "tradein"].includes(activeTab)
                      ? "text-blue-300 font-bold bg-blue-500/10 border-b border-blue-500/20"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingCart className={`w-4 h-4 ${["orders", "payments", "tradein"].includes(activeTab) ? "text-blue-400" : "text-slate-400"}`} />
                    <span className="text-xs font-bold">Sales & Orders</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(!expandedGroups.sales && !sidebarSearch && pendingOrdersCount > 0) && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold">
                        {pendingOrdersCount}
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        (expandedGroups.sales || sidebarSearch) ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Nested Sub-Items */}
                {(expandedGroups.sales || Boolean(sidebarSearch)) && (
                  <div className="px-2 py-1.5 space-y-0.5 bg-[#080b12] border-t border-white/[0.04]">
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "orders"
                          ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "orders" ? "bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" : "bg-slate-600"}`}></span>
                        <span>Customer Orders</span>
                      </span>
                      {pendingOrdersCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30 font-bold">
                          {pendingOrdersCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab("payments")}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "payments"
                          ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "payments" ? "bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" : "bg-slate-600"}`}></span>
                        <span>POS Payment Desk</span>
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab("tradein")}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "tradein"
                          ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "tradein" ? "bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" : "bg-slate-600"}`}></span>
                        <span>Trade-In Valuations</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 4. MAIN CATEGORY: Finance & Installments (ហិរញ្ញវត្ថុ និងបង់រំលស់) */}
            {(!sidebarSearch || "finance loans installments schedules".includes(sidebarSearch.toLowerCase())) && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0c101c]/80 overflow-hidden">
                <div
                  onClick={() => toggleGroup("finance")}
                  className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer select-none ${
                    ["loans", "schedules"].includes(activeTab)
                      ? "text-blue-300 font-bold bg-blue-500/10 border-b border-blue-500/20"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <DollarSign className={`w-4 h-4 ${["loans", "schedules"].includes(activeTab) ? "text-blue-400" : "text-slate-400"}`} />
                    <span className="text-xs font-bold">Finance & Loans</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(!expandedGroups.finance && !sidebarSearch && overdueSchedulesCount > 0) && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                        {overdueSchedulesCount} Due
                      </span>
                    )}
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        (expandedGroups.finance || sidebarSearch) ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Nested Sub-Items */}
                {(expandedGroups.finance || Boolean(sidebarSearch)) && (
                  <div className="px-2 py-1.5 space-y-0.5 bg-[#080b12] border-t border-white/[0.04]">
                    <button
                      onClick={() => setActiveTab("loans")}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "loans"
                          ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "loans" ? "bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" : "bg-slate-600"}`}></span>
                        <span>Financing & Loans</span>
                      </span>
                      {pendingLoansCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                          {pendingLoansCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab("schedules")}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "schedules"
                          ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "schedules" ? "bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" : "bg-slate-600"}`}></span>
                        <span>Payment Schedules</span>
                      </span>
                      {overdueSchedulesCount > 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
                          {overdueSchedulesCount} Due
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 5. MAIN CATEGORY: System & Administration (ប្រព័ន្ធ និងការកំណត់) */}
            {(!sidebarSearch || "system settings telegram bot marquee categories staff roles".includes(sidebarSearch.toLowerCase())) && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0c101c]/80 overflow-hidden">
                <div
                  onClick={() => toggleGroup("system")}
                  className={`w-full flex items-center justify-between px-3 py-2 transition-all cursor-pointer select-none ${
                    ["telegram", "categories", "users"].includes(activeTab)
                      ? "text-blue-300 font-bold bg-blue-500/10 border-b border-blue-500/20"
                      : "text-slate-300 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <SlidersHorizontal className={`w-4 h-4 ${["telegram", "categories", "users"].includes(activeTab) ? "text-blue-400" : "text-slate-400"}`} />
                    <span className="text-xs font-bold">System & Settings</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                        (expandedGroups.system || sidebarSearch) ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Nested Sub-Items */}
                {(expandedGroups.system || Boolean(sidebarSearch)) && (
                  <div className="px-2 py-1.5 space-y-0.5 bg-[#080b12] border-t border-white/[0.04]">
                    <button
                      onClick={() => setActiveTab("telegram")}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "telegram"
                          ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "telegram" ? "bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" : "bg-slate-600"}`}></span>
                        <span>Telegram Bot Alerts</span>
                      </span>
                    </button>

                    <button
                      onClick={() => setActiveTab("categories")}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        activeTab === "categories"
                          ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 shadow-2xs"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "categories" ? "bg-amber-400" : "bg-slate-600"}`}></span>
                        <span>Categories & Marquee</span>
                      </span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                        Speed
                      </span>
                    </button>

                    {currentRole === "SUPER_ADMIN" && (
                      <button
                        onClick={() => setActiveTab("users")}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                          activeTab === "users"
                            ? "bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                            : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${activeTab === "users" ? "bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.8)]" : "bg-slate-600"}`}></span>
                          <span>Staff & Role Permissions</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/[0.06] text-slate-300 font-mono font-bold border border-white/5">
                          {usersList.length}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>

        {/* Bottom Banner Card (Compact & Modern Web3 Glass) */}
        <div className="p-3 space-y-2 border-t border-white/[0.06] bg-[#0a0e17]">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600/15 via-indigo-600/5 to-transparent border border-blue-500/20 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/30 shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-[11px] font-bold text-white truncate">Multi-Branch Cloud</p>
                <p className="text-[9px] text-slate-400 truncate">Live Showroom Sync</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedBranchId("ALL")}
              className="py-0.5 px-2 rounded bg-white/[0.06] border border-white/10 text-slate-200 text-[10px] font-bold hover:bg-white/[0.1] shadow-2xs shrink-0 cursor-pointer"
            >
              All
            </button>
          </div>

          {/* User profile & Exit */}
          <div className="flex items-center justify-between pt-1.5 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
                {currentRole === "SUPER_ADMIN" ? "SA" : "BM"}
              </div>
              <div className="truncate">
                <p className="font-bold text-white text-[11px] truncate">
                  {currentRole === "SUPER_ADMIN" ? "Super Admin" : "Branch Admin"}
                </p>
                <p className="text-[9px] text-blue-400 font-semibold uppercase">{currentRole}</p>
              </div>
            </div>
            <button
              onClick={onExitAdmin}
              title="Logout / Exit"
              className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT AREA (Dark Space Theme) */}
      {/* ======================================================== */}
      <main className="flex-1 h-screen flex flex-col min-w-0 overflow-y-auto overflow-x-hidden relative z-10">
        {/* Top Header Bar */}
        <header className="h-16 px-6 bg-[#0a0e17]/85 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between sticky top-0 z-20 shadow-xl">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-0.5">
                <span>Operations</span>
                <ChevronRight className="w-3 h-3 text-slate-600" />
                <span className="text-blue-400 font-bold capitalize">{activeTab}</span>
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                {activeTab === "overview" && "Warehouse & Showroom Operations"}
                {activeTab === "inventory" && "Vehicles & Warehouse Inventory"}
                {activeTab === "transfers" && "Inter-Branch Stock Transfers"}
                {activeTab === "history" && "Audit Log & Stock Movements"}
                {activeTab === "orders" && "Customer Orders & Reservations"}
                {activeTab === "payments" && "Point of Sale (POS) Payment Desk"}
                {activeTab === "tradein" && "Trade-In Vehicle Valuations"}
                {activeTab === "loans" && "Installment Financing Loans"}
                {activeTab === "schedules" && "Customer Monthly Payment Schedules"}
                {activeTab === "telegram" && "Telegram Dispatch Monitor"}
                {activeTab === "users" && "Staff Accounts & Role Permissions"}
                {activeTab === "categories" && "Categories, Brands & Marquee Speed Controls"}
              </h1>
            </div>
          </div>

          {/* Top Controls: Refresh, Branch Selector, Quick Action (Electric Blue Gradient CTA) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={async () => {
                await fetchOrdersAndData(false);
                notifySuccess("Data refreshed from Supabase Cloud.");
              }}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#0e1322] text-slate-300 hover:text-white hover:border-white/20 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-400" : ""}`} />
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>

            {/* Branch Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                disabled={currentRole !== "SUPER_ADMIN"}
                className="appearance-none bg-[#0e1322] border border-white/10 text-white text-xs font-semibold px-3 py-1.5 pr-8 rounded-lg shadow-2xs outline-none cursor-pointer hover:border-blue-500/50 transition-all"
              >
                {currentRole === "SUPER_ADMIN" && <option value="ALL" className="bg-[#0e1322] text-white">All Branches (Consolidated)</option>}
                {branches.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[#0e1322] text-white">
                    {b.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Primary Action Button (Matches Reference Button Gradient!) */}
            <button
              onClick={() => setVehicleModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Vehicle Unit</span>
            </button>
          </div>
        </header>

        {/* Global Feedback Alert */}
        {apiError && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between shadow-2xs backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="font-semibold">{apiError}</span>
            </div>
            <button onClick={() => setApiError("")} className="text-rose-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-2xs backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg("")} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="p-4 sm:p-5 space-y-4">
          {/* ======================================================== */}
          {/* 1. VIEW: DASHBOARD OVERVIEW (Executive Command Center) */}
          {/* ======================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Top Segmented KPI Card (Reference RWA Glass Style) */}
              <div className="bg-[#0c101b]/90 border border-white/[0.08] p-3.5 sm:p-4 rounded-2xl shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">Warehouse & Fleet Overview</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Real-time consolidated fleet status & sales pulse</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium font-mono">Last updated: Today, 11:45 AM</span>
                </div>

                {/* 4 Connected KPI Columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.06] gap-3 md:gap-0">
                  <div className="py-1 md:py-0 md:px-4 first:pl-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <Car className="w-3.5 h-3.5 text-blue-400" />
                      <span>Vehicles inside</span>
                    </div>
                    <div className="mt-1.5">
                      <span className="text-2xl font-black text-white tracking-tight">{totalVehiclesInStock}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{filteredInventory.length} model variants available</p>
                  </div>

                  <div className="py-1 md:py-0 md:px-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <ShoppingCart className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Total shipments & orders</span>
                    </div>
                    <div className="mt-1.5">
                      <span className="text-2xl font-black text-white tracking-tight">{filteredOrders.length}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{pendingOrdersCount} pending delivery</p>
                  </div>

                  <div className="py-1 md:py-0 md:px-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <DollarSign className="w-3.5 h-3.5 text-purple-400" />
                      <span>Active financing loans</span>
                    </div>
                    <div className="mt-1.5">
                      <span className="text-2xl font-black text-white tracking-tight">{filteredLoans.length}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">{pendingLoansCount} awaiting credit review</p>
                  </div>

                  <div className="py-1 md:py-0 md:px-4 last:pr-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Overdue payment alerts</span>
                    </div>
                    <div className="mt-1.5">
                      <span className="text-2xl font-black text-rose-400 tracking-tight">
                        {overdueSchedulesCount < 10 ? `0${overdueSchedulesCount}` : overdueSchedulesCount}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Ready for Telegram reminder</p>
                  </div>
                </div>
              </div>

              {/* Two Column Grid: Recent Orders & Branch Fleet Distribution */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Left 2 Cols: Recent Customer Orders */}
                <div className="xl:col-span-2 bg-[#0c101b]/90 border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <div className="p-3.5 border-b border-white/[0.06] flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">Recent Customer Orders</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Latest vehicle bookings and sales across showrooms</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>View All Orders ({filteredOrders.length})</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0e1322] text-slate-400 font-bold uppercase tracking-wider text-[11px] border-b border-white/[0.06]">
                          <tr>
                            <th className="py-2.5 px-3.5">Order ID</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3">Branch</th>
                            <th className="py-2.5 px-3 text-right">Amount</th>
                            <th className="py-2.5 px-3 text-center">Payment</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04] text-slate-200">
                          {filteredOrders.slice(0, 5).map((o) => (
                            <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-2.5 px-3.5 font-mono font-bold text-blue-400">#{o.order_no}</td>
                              <td className="py-2.5 px-3">
                                <span className="font-bold text-white block truncate max-w-[120px]">{o.customer_name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{o.customer_phone}</span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-400 truncate max-w-[110px]">{o.branch_name}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                                ${o.total_amount?.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    o.payment_status === "PAID" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {o.payment_status || "UNPAID"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    o.status === "COMPLETED"
                                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                      : o.status === "CONFIRMED"
                                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                      : o.status === "CANCELLED"
                                      ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                  }`}
                                >
                                  {o.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {filteredOrders.length === 0 && (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-500">
                                <ShoppingCart className="w-8 h-8 mx-auto mb-1 opacity-25 text-slate-500" />
                                <p className="font-medium text-xs">No recent customer orders</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#0e1322]/60 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Showing latest 5 orders
                    </span>
                    <span className="text-slate-400 text-xs">
                      Total Sales Volume: <strong className="text-white font-bold font-mono">${totalOrdersAmount.toLocaleString()}</strong>
                    </span>
                  </div>
                </div>

                {/* Right 1 Col: Showroom Branches Fleet Distribution */}
                <div className="bg-[#0c101b]/90 border border-white/[0.08] p-4 rounded-2xl shadow-xl backdrop-blur-md flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white">Showroom Fleet Allocation</h4>
                        <p className="text-xs text-slate-400 mt-0.5">Stock capacity by showroom branch</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10">
                        {branches.length} Branches
                      </span>
                    </div>

                    <div className="space-y-2.5 mt-2">
                      {branchStats.map(({ branch, totalQty, reservedQty, availableQty }) => {
                        const pct = totalVehiclesInStock > 0 ? Math.min(100, Math.round((totalQty / totalVehiclesInStock) * 100)) : 0;
                        return (
                          <div key={branch.id} className="p-2.5 rounded-xl bg-[#0e1322]/80 border border-white/[0.06] hover:border-blue-500/30 transition-colors">
                            <div className="flex items-center justify-between text-xs font-bold text-white">
                              <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                                <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                <span className="truncate" title={branch.name}>{branch.name}</span>
                              </div>
                              <span className="font-mono text-blue-400 font-black">{totalQty} units</span>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                              <span>Avail: <strong className="text-slate-200 font-semibold">{availableQty}</strong> | Rsv: <strong className="text-amber-400 font-semibold">{reservedQty}</strong></span>
                              <span className="font-mono font-medium text-slate-500">{pct}% of fleet</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1.5">
                              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("inventory")}
                    className="w-full mt-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-slate-200 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Car className="w-3.5 h-3.5 text-blue-400" />
                    <span>Open Inventory Catalog</span>
                  </button>
                </div>
              </div>

              {/* Bottom 2 Smart Cards: Low Stock Warning & Recent Movements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Low Stock Warning Card */}
                <div className="bg-[#0c101b]/90 border border-white/[0.08] p-4 rounded-2xl shadow-xl backdrop-blur-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
                      <h4 className="text-sm font-bold text-white">Low Stock & Restock Warnings</h4>
                    </div>
                    <span className="text-[11px] font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/30">
                      {lowStockItems.length} Variants
                    </span>
                  </div>

                  <div className="space-y-2">
                    {lowStockItems.slice(0, 3).map((item) => {
                      const avail = item.available_qty ?? (item.quantity - (item.reserved_qty || 0));
                      return (
                        <div key={item.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e1322]/80 border border-white/[0.06] text-xs">
                          <div className="truncate max-w-[180px]">
                            <p className="font-bold text-white truncate">{item.product_name}</p>
                            <p className="text-[10px] text-slate-400 truncate">{item.branch_name}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                              {avail} in stock
                            </span>
                            <button
                              onClick={() => {
                                setStockProductID(item.product_id);
                                setStockModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-[11px] font-bold border border-white/10 shadow-2xs cursor-pointer"
                            >
                              + Stock
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {lowStockItems.length === 0 && (
                      <div className="py-6 text-center text-slate-500">
                        <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-1 opacity-60" />
                        <p className="text-xs font-medium text-slate-400">All vehicles are well-stocked above thresholds</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Stock Audit Ledger */}
                <div className="bg-[#0c101b]/90 border border-white/[0.08] p-4 rounded-2xl shadow-xl backdrop-blur-md">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-bold text-white">Recent Stock Movements</h4>
                    </div>
                    <button
                      onClick={() => setActiveTab("history")}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Audit Ledger</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {filteredMovements.slice(0, 3).map((m) => (
                      <div key={m.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0e1322]/80 border border-white/[0.06] text-xs">
                        <div className="truncate max-w-[180px]">
                          <p className="font-bold text-white truncate">{m.product_name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{m.created_at?.slice(0, 16).replace("T", " ")}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.transaction_type === "INBOUND"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : m.transaction_type === "TRANSFER_OUT"
                                ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30"
                                : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {m.transaction_type}
                          </span>
                          <span className="font-mono font-bold text-white">+{m.quantity}</span>
                        </div>
                      </div>
                    ))}
                    {filteredMovements.length === 0 && (
                      <div className="py-6 text-center text-slate-500">
                        <p className="text-xs font-medium">No recent stock movements recorded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. VIEW: VEHICLES & INVENTORY (Dedicated Inventory Catalog) */}
          {/* ======================================================== */}
          {activeTab === "inventory" && (
            <div className="space-y-3.5">
              {/* Dedicated Inventory KPI Strip */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 gap-3 md:gap-0">
                  <div className="py-1 md:py-0 md:px-4 first:pl-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Car className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Total Units in Stock</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-2xl font-black text-slate-900">{totalVehiclesInStock}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{filteredInventory.length} model variants</p>
                  </div>

                  <div className="py-1 md:py-0 md:px-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Available for Sale</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-2xl font-black text-emerald-600">
                        {filteredInventory.reduce((acc, c) => acc + (c.available_qty ?? (c.quantity - (c.reserved_qty || 0))), 0)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Ready for immediate delivery</p>
                  </div>

                  <div className="py-1 md:py-0 md:px-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Reserved for Orders</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-2xl font-black text-amber-600">
                        {filteredInventory.reduce((acc, c) => acc + (c.reserved_qty || 0), 0)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Pending customer pickup</p>
                  </div>

                  <div className="py-1 md:py-0 md:px-4 last:pr-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Low Stock Variants</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-2xl font-black text-rose-600">
                        {lowStockItems.length < 10 ? `0${lowStockItems.length}` : lowStockItems.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">Replenishment suggested</p>
                  </div>
                </div>
              </div>

              {/* Card Section Header & Filter Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Vehicles & Warehouse Catalog</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Inventory breakdown with live stock, branches, and specs</p>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Search inside card section */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search for vehicle model..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-2xs w-48 sm:w-56"
                    />
                  </div>

                  {/* Filter Button */}
                  <button
                    onClick={() => setStockModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Add Parts Stock</span>
                  </button>

                  <button
                    onClick={() => setTransferModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                    <span>Transfer</span>
                  </button>

                  {/* Grid vs List Toggle Switch (Exact match to reference!) */}
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                        viewMode === "grid" ? "bg-slate-100 text-slate-900 shadow-2xs font-bold" : "text-slate-400 hover:text-slate-700"
                      }`}
                      title="Grid View"
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-md text-xs transition-all cursor-pointer ${
                        viewMode === "list" ? "bg-slate-100 text-slate-900 shadow-2xs font-bold" : "text-slate-400 hover:text-slate-700"
                      }`}
                      title="List View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* GRID VIEW (Compact Modern ERP Style) */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-3.5">
                  {filteredInventory.map((item) => {
                    const avail = item.available_qty ?? (item.quantity - (item.reserved_qty || 0));
                    const totalQty = item.quantity || 1;
                    const progressPct = Math.min(100, Math.round((avail / totalQty) * 100));
                    const imgUrl = getProductImage(item.product_id);
                    const prod = getProductInfo(item.product_id);

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Top Card Row: Status Pill & Price */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                avail === 0
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : avail <= (item.min_threshold || 2)
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  avail === 0 ? "bg-rose-500" : avail <= (item.min_threshold || 2) ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                              ></span>
                              <span>{avail === 0 ? "Out of Stock" : avail <= (item.min_threshold || 2) ? "Low Stock" : "In Warehouse"}</span>
                            </span>

                            <span className="text-xs font-mono font-black text-slate-900 shrink-0">
                              ${item.selling_price ? item.selling_price.toLocaleString() : "Contact"}
                            </span>
                          </div>

                          {/* Vehicle Title & Model ID */}
                          <div className="mt-2">
                            <h4 className="text-sm font-bold text-slate-900 tracking-tight truncate group-hover:text-emerald-700 transition-colors" title={item.product_name}>
                              {item.product_name}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                              {prod?.year || 2026} • {prod?.category_type?.replace(/_/g, " ") || "VEHICLE"}
                            </p>
                          </div>

                          {/* Center Vehicle Image */}
                          <div className="h-24 sm:h-28 my-2.5 flex items-center justify-center overflow-hidden bg-slate-50/80 rounded-lg p-2">
                            <img
                              src={imgUrl}
                              alt={item.product_name}
                              className="h-full w-full object-contain transform group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>

                          {/* Branch Route / Location */}
                          <div className="flex items-center justify-between text-xs py-1.5 border-t border-slate-100">
                            <span className="font-semibold text-slate-700 text-xs truncate max-w-[120px]" title={item.branch_name}>
                              {item.branch_name}
                            </span>
                            <span className="text-slate-500 font-mono text-[11px]">
                              Total: <strong className="text-slate-800 font-bold">{item.quantity}</strong> | Rsv:{" "}
                              <strong className="text-amber-600 font-bold">{item.reserved_qty || 0}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Bottom Stock Progress Bar */}
                        <div className="mt-2 pt-2 border-t border-slate-100">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                            <span>Availability status</span>
                            <span className="font-mono text-emerald-700 font-bold">{avail} units ({progressPct}%)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${progressPct}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* LIST VIEW (Crisp Table) */
                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-4">Product Model</th>
                          <th className="py-2.5 px-3">Branch Location</th>
                          <th className="py-2.5 px-3 text-center">Total Stock</th>
                          <th className="py-2.5 px-3 text-center">Reserved</th>
                          <th className="py-2.5 px-3 text-center">Available</th>
                          <th className="py-2.5 px-3 text-right">Selling Price</th>
                          <th className="py-2.5 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {filteredInventory.map((item) => {
                          const avail = item.available_qty ?? (item.quantity - (item.reserved_qty || 0));
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-2.5 px-4 font-bold text-slate-900">{item.product_name}</td>
                              <td className="py-2.5 px-3 text-slate-600 font-medium">{item.branch_name}</td>
                              <td className="py-2.5 px-3 text-center font-mono font-semibold">{item.quantity}</td>
                              <td className="py-2.5 px-3 text-center font-mono text-amber-600 font-bold">{item.reserved_qty || 0}</td>
                              <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-600">{avail}</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                                ${item.selling_price ? item.selling_price.toLocaleString() : "N/A"}
                              </td>
                              <td className="py-2.5 px-4 text-center">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                    avail === 0
                                      ? "bg-rose-50 text-rose-700"
                                      : avail <= (item.min_threshold || 2)
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-emerald-50 text-emerald-700"
                                  }`}
                                >
                                  {avail === 0 ? "Out of Stock" : avail <= (item.min_threshold || 2) ? "Low Stock" : "In Stock"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: INTER-BRANCH TRANSFERS */}
          {/* ======================================================== */}
          {activeTab === "transfers" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Inter-Branch Stock Transfers</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Manage stock reallocation between showrooms</p>
                </div>
                <button
                  onClick={() => setTransferModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ New Transfer</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider text-xs border-b border-slate-200">
                    <tr>
                      <th className="py-4 px-6">Item Name</th>
                      <th className="py-4 px-5">From Branch</th>
                      <th className="py-4 px-5">To Branch</th>
                      <th className="py-4 px-5 text-center">Quantity</th>
                      <th className="py-4 px-5 text-center">Status</th>
                      <th className="py-4 px-5">Notes</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredTransfers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">{t.product_name}</td>
                        <td className="py-4 px-5 text-slate-600 font-medium">{t.from_branch_name}</td>
                        <td className="py-4 px-5 text-slate-600 font-medium">{t.to_branch_name}</td>
                        <td className="py-4 px-5 text-center font-mono font-black text-slate-900">{t.quantity}</td>
                        <td className="py-4 px-5 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              t.status === "COMPLETED"
                                ? "bg-emerald-50 text-emerald-700"
                                : t.status === "APPROVED"
                                ? "bg-blue-50 text-blue-700"
                                : t.status === "REJECTED"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-500 truncate max-w-xs">{t.notes || "—"}</td>
                        <td className="py-4 px-6 text-right space-x-2">
                          {t.status === "PENDING" && currentRole !== "STAFF" && (
                            <>
                              <button
                                onClick={() => handleTransferAction(t.id, "approve")}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleTransferAction(t.id, "reject")}
                                className="px-3.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {t.status === "APPROVED" && (
                            <button
                              onClick={() => handleTransferAction(t.id, "receive")}
                              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                            >
                              Receive (Confirm)
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredTransfers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-400 font-medium text-sm">
                          No pending stock transfers recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: STOCK AUDIT MOVEMENTS */}
          {/* ======================================================== */}
          {activeTab === "history" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Stock Movements Audit Log</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Complete chronological ledger of inventory movements</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-white border border-slate-200 text-sm px-3.5 py-2 rounded-xl text-slate-700 outline-none shadow-2xs font-medium"
                  />
                  <span className="text-sm text-slate-400 font-medium">to</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-white border border-slate-200 text-sm px-3.5 py-2 rounded-xl text-slate-700 outline-none shadow-2xs font-medium"
                  />
                  <button
                    onClick={exportStockHistory}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200 shadow-2xs cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider text-xs border-b border-slate-200">
                    <tr>
                      <th className="py-4 px-6">Timestamp</th>
                      <th className="py-4 px-5">Branch</th>
                      <th className="py-4 px-5">Transaction Type</th>
                      <th className="py-4 px-5">Product Name</th>
                      <th className="py-4 px-5 text-center">Quantity</th>
                      <th className="py-4 px-6">Performed By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredMovements.map((m) => (
                      <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs text-slate-500">{m.created_at?.slice(0, 19).replace("T", " ")}</td>
                        <td className="py-4 px-5 font-bold text-slate-800">{m.branch_name}</td>
                        <td className="py-4 px-5">
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                              m.transaction_type === "INBOUND"
                                ? "bg-emerald-50 text-emerald-700"
                                : m.transaction_type === "TRANSFER_OUT"
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-blue-50 text-blue-700"
                            }`}
                          >
                            {m.transaction_type}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-900">{m.product_name}</td>
                        <td className="py-4 px-5 text-center font-mono font-black text-slate-900">{m.quantity}</td>
                        <td className="py-4 px-6 text-slate-600 font-medium">{m.performed_by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: CUSTOMER ORDERS */}
          {/* ======================================================== */}
          {activeTab === "orders" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Customer Sales & Reservations</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Order pipeline and payment statuses</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider text-xs border-b border-slate-200">
                    <tr>
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-5">Customer Details</th>
                      <th className="py-4 px-5">Branch</th>
                      <th className="py-4 px-5 text-right">Order Value</th>
                      <th className="py-4 px-5 text-center">Payment Status</th>
                      <th className="py-4 px-5 text-center">Fulfillment Status</th>
                      <th className="py-4 px-6 text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-slate-400">
                          <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                          <p className="font-bold text-sm text-slate-700">No customer orders found</p>
                          <p className="text-xs text-slate-400 mt-1">Orders placed by customers will automatically appear here in real-time.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-6 font-mono font-black text-emerald-700">#{o.order_no}</td>
                          <td className="py-4 px-5">
                            <p className="font-bold text-slate-900">{o.customer_name}</p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">{o.customer_phone}</p>
                          </td>
                          <td className="py-4 px-5 text-slate-600 font-medium">{o.branch_name}</td>
                          <td className="py-4 px-5 text-right font-mono font-black text-slate-900">
                            ${o.total_amount?.toLocaleString()}
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                o.payment_status === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {o.payment_status || "UNPAID"}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                o.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : o.status === "CONFIRMED"
                                  ? "bg-blue-50 text-blue-700"
                                  : o.status === "CANCELLED"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-xl outline-none font-bold cursor-pointer shadow-2xs"
                            >
                              <option value="PENDING">PENDING (រង់ចាំការបញ្ជាក់)</option>
                              <option value="CONFIRMED">CONFIRMED (បានយល់ព្រមលក់)</option>
                              <option value="PROCESSING">PROCESSING (កំពុងដឹកជញ្ជូន / In-Transit)</option>
                              <option value="READY_FOR_PICKUP">READY_FOR_PICKUP (មកដល់ Showroom)</option>
                              <option value="COMPLETED">COMPLETED (បានប្រគល់ជូនជោគជ័យ)</option>
                              <option value="CANCELLED">CANCELLED (បានបោះបង់)</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: POS PAYMENTS */}
          {/* ======================================================== */}
          {activeTab === "payments" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-1">Point of Sale (POS) Payment Desk</h3>
                <p className="text-sm text-slate-500 mb-6">Look up customer orders and log physical cash or KHQR payments</p>

                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="Enter Order # or Reference (e.g. ORD-202611-001)..."
                    value={paymentOrderReference}
                    onChange={(e) => setPaymentOrderReference(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleFindPaymentOrder}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Find Order</span>
                  </button>
                </div>

                {resolvedPaymentOrder && (
                  <form onSubmit={handleRecordPayment} className="mt-6 pt-6 border-t border-slate-100 space-y-5">
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Customer:</span>
                        <span className="font-bold text-slate-900">{resolvedPaymentOrder.customer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Total Price:</span>
                        <span className="font-mono font-bold text-slate-900">${resolvedPaymentOrder.total_amount?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Remaining Balance Due:</span>
                        <span className="font-mono font-black text-rose-600 text-base">
                          ${resolvedPaymentOrder.balance_due ? resolvedPaymentOrder.balance_due.toLocaleString() : resolvedPaymentOrder.total_amount?.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Payment Amount ($ USD)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none font-black font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Payment Channel</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 outline-none font-bold cursor-pointer"
                        >
                          <option value="CASH">Cash Payment (USD / KHR)</option>
                          <option value="KHQR">Bakong KHQR</option>
                          <option value="ABA_PAY">ABA Payway</option>
                          <option value="BANK_TRANSFER">Bank Wire Transfer</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      Record Transaction & Issue Receipt
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: TRADE-IN VALUATIONS */}
          {/* ======================================================== */}
          {activeTab === "tradein" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Trade-In Vehicle Valuations</h3>
                <p className="text-sm text-slate-500 mt-0.5">Appraise customer trade-in units against new showroom models</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider text-xs border-b border-slate-200">
                    <tr>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-5">Trade-In Vehicle</th>
                      <th className="py-4 px-5">Target Model</th>
                      <th className="py-4 px-5 text-right">Expected ($)</th>
                      <th className="py-4 px-5 text-right">Appraised ($)</th>
                      <th className="py-4 px-5 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredTradeIns.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-900">{t.customer_name}</p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{t.customer_phone}</p>
                        </td>
                        <td className="py-4 px-5">
                          <p className="font-bold text-slate-800">
                            {t.current_brand} {t.current_model} ({t.current_year})
                          </p>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">{t.current_mileage?.toLocaleString()} km</p>
                        </td>
                        <td className="py-4 px-5 text-emerald-700 font-bold">{t.target_product_name || "Showroom Model"}</td>
                        <td className="py-4 px-5 text-right font-mono font-medium text-slate-500">${t.customer_expected_price?.toLocaleString()}</td>
                        <td className="py-4 px-5 text-right font-mono font-black text-emerald-700">
                          {t.appraised_value ? `$${t.appraised_value.toLocaleString()}` : "Pending"}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              t.status === "APPRAISED"
                                ? "bg-emerald-50 text-emerald-700"
                                : t.status === "COMPLETED"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setAppraiseModalItem(t);
                              setAppraiseAmount(t.appraised_value || t.customer_expected_price || 20000);
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                          >
                            Appraise Unit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: FINANCING & LOANS */}
          {/* ======================================================== */}
          {activeTab === "loans" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Installment Financing Loan Applications</h3>
                <p className="text-sm text-slate-500 mt-0.5">Credit committee review and loan terms appraisal</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider text-xs border-b border-slate-200">
                    <tr>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-5 text-right">Car Price</th>
                      <th className="py-4 px-5 text-right">Down Payment</th>
                      <th className="py-4 px-5 text-right">Loan Principal</th>
                      <th className="py-4 px-5 text-center">Term (Months)</th>
                      <th className="py-4 px-5 text-right">Monthly Dues</th>
                      <th className="py-4 px-5 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredLoans.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">{l.customer_name}</td>
                        <td className="py-4 px-5 text-right font-mono font-medium">${l.vehicle_price?.toLocaleString()}</td>
                        <td className="py-4 px-5 text-right font-mono text-slate-500">
                          ${l.down_payment?.toLocaleString()} ({l.down_payment_percentage}%)
                        </td>
                        <td className="py-4 px-5 text-right font-mono font-black text-slate-900">${l.loan_amount?.toLocaleString()}</td>
                        <td className="py-4 px-5 text-center font-mono font-semibold">{l.term_months} mos</td>
                        <td className="py-4 px-5 text-right font-mono font-black text-emerald-700">
                          ${l.monthly_installment?.toLocaleString()}
                        </td>
                        <td className="py-4 px-5 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              l.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700"
                                : l.status === "REJECTED"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right space-x-2">
                          {l.status === "PENDING" && (
                            <>
                              <button
                                onClick={() => handleApproveLoan(l.id, "APPROVED")}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApproveLoan(l.id, "REJECTED")}
                                className="px-3.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 font-bold text-xs"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: PAYMENT SCHEDULES */}
          {/* ======================================================== */}
          {activeTab === "schedules" && (
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Installment Payment Schedules</h3>
                <p className="text-sm text-slate-500 mt-0.5">Track upcoming due dates and dispatch automated reminders</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider text-xs border-b border-slate-200">
                    <tr>
                      <th className="py-4 px-6">Order #</th>
                      <th className="py-4 px-5">Customer</th>
                      <th className="py-4 px-5">Branch</th>
                      <th className="py-4 px-5 font-mono">Due Date</th>
                      <th className="py-4 px-5 text-right">Monthly Due</th>
                      <th className="py-4 px-5 text-center">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredSchedules.map((s) => {
                      const isOverdue = s.payment_status !== "PAID" && (s.overdue_days || 0) > 0;
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-6 font-mono font-black text-emerald-700">#{s.order_no}</td>
                          <td className="py-4 px-5 font-bold text-slate-900">{s.customer_name}</td>
                          <td className="py-4 px-5 text-slate-600 font-medium">{s.branch_name}</td>
                          <td className="py-4 px-5 font-mono text-slate-700 font-semibold">{s.due_date}</td>
                          <td className="py-4 px-5 text-right font-mono font-black text-slate-900">
                            ${s.monthly_amount?.toLocaleString()}
                          </td>
                          <td className="py-4 px-5 text-center">
                            {s.payment_status === "PAID" ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                                PAID
                              </span>
                            ) : isOverdue ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Overdue ({s.overdue_days} Days)
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                                PENDING
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right space-x-2">
                            {s.payment_status !== "PAID" && (
                              <>
                                <button
                                  onClick={() => handleRecordSchedulePayment(s.id)}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                                >
                                  Mark Paid
                                </button>
                                <button
                                  onClick={() => handleSendPaymentReminder(s.id)}
                                  className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs inline-flex items-center gap-1.5 shadow-2xs"
                                >
                                  <Send className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Telegram Reminder</span>
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: TELEGRAM BOT MONITOR */}
          {/* ======================================================== */}
          {activeTab === "telegram" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                      <Bot className="w-6 h-6 text-emerald-600" />
                      <span>Telegram Dispatch Alert Integration</span>
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Automated high-priority notifications sent to Telegram showroom groups
                    </p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{telegramStatus?.connection_status || "OPERATIONAL"}</span>
                  </span>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-3.5">
                  <button
                    onClick={() => handleTriggerTelegramTest("New Order Notification")}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Test: New Order Notification</span>
                  </button>
                  <button
                    onClick={() => handleTriggerTelegramTest("Low Stock Warning")}
                    className="px-5 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-sm font-bold flex items-center gap-2 shadow-2xs cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Test: Low Stock Warning</span>
                  </button>
                </div>
              </div>

              {/* Notification Logs */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">Recent Notification Dispatches</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider text-xs border-b border-slate-200">
                      <tr>
                        <th className="py-4 px-6">Timestamp</th>
                        <th className="py-4 px-5">Event Trigger</th>
                        <th className="py-4 px-5">Message Payload</th>
                        <th className="py-4 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {notificationLogsList.slice(0, 15).map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-4 px-6 font-mono text-xs text-slate-400">{log.timestamp?.slice(0, 19).replace("T", " ")}</td>
                          <td className="py-4 px-5 font-bold text-emerald-700">{log.event_type}</td>
                          <td className="py-4 px-5 text-slate-600 truncate max-w-md">{log.message_payload}</td>
                          <td className="py-4 px-6 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                log.delivery_status === "DELIVERED" || log.delivery_status === "SUCCESS"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {log.delivery_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: STAFF & ROLES (Super Admin Only) */}
          {/* ======================================================== */}
          {activeTab === "users" && currentRole === "SUPER_ADMIN" && (
            <div className="space-y-4">
              {/* Header Card with KPIs and Create Action */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          Showroom Team & Staff Management (ការគ្រប់គ្រងគណនីបុគ្គលិក)
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                          គ្រប់គ្រងសិទ្ធិបុគ្គលិក កំណត់សាខា Showroom ប្តូរពាក្យសម្ងាត់ និងសុវត្ថិភាពគណនី
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600">
                      <span>សរុប៖</span>
                      <span className="font-mono text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-lg">{usersList.length} នាក់</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Active:</span>
                      <span className="font-mono text-emerald-700">{activeStaffCount}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      <span>Disabled:</span>
                      <span className="font-mono text-rose-700">{disabledStaffCount}</span>
                    </div>
                    <button
                      onClick={() => setUserModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm cursor-pointer transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ បង្កើតបុគ្គលិកថ្មី (New Staff)</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-6 relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="ស្វែងរកឈ្មោះ, @username, email, ឬលេខទូរស័ព្ទ..."
                      value={staffSearchQuery}
                      onChange={(e) => setStaffSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-500 focus:bg-white transition-colors"
                    />
                    {staffSearchQuery && (
                      <button
                        onClick={() => setStaffSearchQuery("")}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={staffRoleFilter}
                      onChange={(e) => setStaffRoleFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-bold outline-none cursor-pointer focus:border-emerald-500"
                    >
                      <option value="ALL">គ្រប់ Role ទាំងអស់ (All Roles)</option>
                      <option value="SUPER_ADMIN">👑 SUPER_ADMIN (Consolidated HQ)</option>
                      <option value="BRANCH_ADMIN">🏢 BRANCH_ADMIN (Showroom Manager)</option>
                      <option value="STAFF">👤 STAFF (Sales & Inventory)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <select
                      value={staffBranchFilter}
                      onChange={(e) => setStaffBranchFilter(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 font-bold outline-none cursor-pointer focus:border-emerald-500"
                    >
                      <option value="ALL">គ្រប់សាខា Showroom (All Branches)</option>
                      <option value="HQ">🏢 All Showrooms (HQ Central)</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          📍 {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 font-extrabold uppercase tracking-wider text-xs border-b border-slate-200">
                      <tr>
                        <th className="py-4 px-6">Staff Member (បុគ្គលិក)</th>
                        <th className="py-4 px-5">Contact Info (ទំនាក់ទំនង)</th>
                        <th className="py-4 px-5">Assigned Showroom (សាខា)</th>
                        <th className="py-4 px-5 text-center">System Role (តួនាទី)</th>
                        <th className="py-4 px-5 text-center">Status (ស្ថានភាព)</th>
                        <th className="py-4 px-6 text-right">Actions (សកម្មភាព)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="font-bold text-slate-700">រកមិនឃើញគណនីបុគ្គលិកដែលត្រូវគ្នានឹងការស្វែងរកឡើយ</p>
                            <p className="text-xs text-slate-400 mt-1">សូមសាកល្បងផ្លាស់ប្តូរពាក្យគន្លឹះ ឬជ្រើសរើស Role ផ្សេង</p>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const branchName =
                            branches.find((b) => b.id === u.branch_id)?.name || "All Branches (HQ Central)";
                          const isSelf = u.id === currentUserID;

                          const roleBadge = () => {
                            switch (u.role) {
                              case "SUPER_ADMIN":
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                                    <span>SUPER_ADMIN</span>
                                  </span>
                                );
                              case "BRANCH_ADMIN":
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                                    <span>BRANCH_ADMIN</span>
                                  </span>
                                );
                              default:
                                return (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>STAFF</span>
                                  </span>
                                );
                            }
                          };

                          return (
                            <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800 flex items-center justify-center font-black text-sm border border-slate-200 shadow-2xs shrink-0">
                                    {u.full_name?.slice(0, 2).toUpperCase() || "ST"}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900">{u.full_name}</span>
                                      {isSelf && (
                                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-2xs font-extrabold uppercase">
                                          អ្នកផ្ទាល់ (You)
                                        </span>
                                      )}
                                    </div>
                                    <p className="font-mono text-xs text-slate-500 mt-0.5">@{u.username}</p>
                                  </div>
                                </div>
                              </td>

                              <td className="py-4 px-5">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <span className="truncate max-w-[180px]">{u.email}</span>
                                  </div>
                                  {u.phone ? (
                                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                      <span>{u.phone}</span>
                                    </div>
                                  ) : (
                                    <span className="text-2xs text-slate-400 italic">គ្មានលេខទូរស័ព្ទ</span>
                                  )}
                                </div>
                              </td>

                              <td className="py-4 px-5">
                                <div className="flex items-center gap-1.5 text-slate-700 font-medium text-xs sm:text-sm">
                                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                  <span>{branchName}</span>
                                </div>
                              </td>

                              <td className="py-4 px-5 text-center">{roleBadge()}</td>

                              <td className="py-4 px-5 text-center">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                    u.status === "ACTIVE"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      u.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-rose-400"
                                    }`}
                                  ></span>
                                  <span>{u.status === "ACTIVE" ? "ACTIVE" : "DISABLED"}</span>
                                </span>
                              </td>

                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Edit Staff Details & Reset Password */}
                                  <button
                                    onClick={() => handleOpenEditUser(u)}
                                    title="កែសម្រួលព័ត៌មាន និងប្តូរពាក្យសម្ងាត់ (Edit / Reset Password)"
                                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>

                                  {/* Toggle Active / Disabled */}
                                  {!isSelf && (
                                    <button
                                      onClick={() => handleToggleUserStatus(u)}
                                      title={u.status === "ACTIVE" ? "ផ្អាកគណនី (Disable)" : "បើកគណនី (Enable)"}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                                        u.status === "ACTIVE"
                                          ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                                          : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                      }`}
                                    >
                                      {u.status === "ACTIVE" ? "Disable" : "Enable"}
                                    </button>
                                  )}

                                  {/* Delete / Archive Account */}
                                  {!isSelf && (
                                    <button
                                      onClick={() => handleOpenDeleteUser(u)}
                                      title="លុប ឬផ្អាកដំណើរការជាអចិន្ត្រៃយ៍ (Delete / Archive)"
                                      className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: CATEGORIES, BRANDS & MARQUEE CONTROLS */}
          {/* ======================================================== */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <MarqueeAdminModal
                isOpen={true}
                onClose={() => {}}
                isEmbedded={true}
              />
            </div>
          )}
        </div>
      </main>

      {/* ======================================================== */}
      {/* 3. POP-UP MODALS (CLEAN DIALOGS WITH WHITE/EMERALD THEME) */}
      {/* ======================================================== */}

      {/* MODAL: REGISTER VEHICLE UNIT (VIN) */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <Car className="w-5 h-5 text-emerald-600" />
                <span>Register New Vehicle Unit (VIN)</span>
              </h3>
              <button onClick={() => setVehicleModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="p-7 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">Vehicle Model</label>
                  <select
                    value={vehicleForm.product_id}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, product_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-bold cursor-pointer"
                  >
                    {vehicleProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">Assigned Showroom Branch</label>
                  <select
                    value={vehicleForm.branch_id}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, branch_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-bold cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">VIN Number</label>
                  <input
                    type="text"
                    required
                    placeholder="JTDKN3DU..."
                    value={vehicleForm.vin}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, vin: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">Engine Number</label>
                  <input
                    type="text"
                    placeholder="2ZR-FXE..."
                    value={vehicleForm.engine_no}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, engine_no: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">Color</label>
                  <input
                    type="text"
                    value={vehicleForm.color}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">Mileage (km)</label>
                  <input
                    type="number"
                    value={vehicleForm.mileage_km}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, mileage_km: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">Plate Number</label>
                  <input
                    type="text"
                    placeholder="2BK-8899"
                    value={vehicleForm.plate_number}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, plate_number: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">Cost Price ($)</label>
                  <input
                    type="number"
                    value={vehicleForm.cost_price}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, cost_price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">Selling Price ($)</label>
                  <input
                    type="number"
                    value={vehicleForm.selling_price}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, selling_price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none font-mono font-black text-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-5 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setVehicleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/25">
                  Save Vehicle Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD PARTS STOCK */}
      {stockModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <Package className="w-5 h-5 text-emerald-600" />
                <span>Replenish Spare Parts & Bike Stock</span>
              </h3>
              <button onClick={() => setStockModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddStock} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Select Part / Product</label>
                <select
                  value={stockProductID}
                  onChange={(e) => setStockProductID(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-bold cursor-pointer"
                >
                  {stockableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Showroom Branch</label>
                <select
                  value={stockBranchID}
                  onChange={(e) => setStockBranchID(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-bold cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">Quantity to Add</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none font-black font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">Low-Stock Alert Level</label>
                  <input
                    type="number"
                    min="1"
                    value={stockThreshold}
                    onChange={(e) => setStockThreshold(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-mono font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStockModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/25">
                  Replenish Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INTER-BRANCH TRANSFER */}
      {transferModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
                <span>Request Inter-Branch Stock Transfer</span>
              </h3>
              <button onClick={() => setTransferModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleExecuteTransfer} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">Origin Branch</label>
                  <select
                    value={fromBranchId}
                    onChange={(e) => setFromBranchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-bold cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">Destination Branch</label>
                  <select
                    value={toBranchId}
                    onChange={(e) => setToBranchId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-bold cursor-pointer"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Product Item to Transfer</label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-bold cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Transfer Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none font-mono font-black"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Notes / Transfer Reason</label>
                <input
                  type="text"
                  placeholder="Showroom display requirement..."
                  value={transferNotes}
                  onChange={(e) => setTransferNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-medium"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setTransferModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/25">
                  Submit Transfer Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPRAISE TRADE-IN */}
      {appraiseModalItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <Repeat className="w-5 h-5 text-emerald-600" />
                <span>Appraise Trade-In Vehicle</span>
              </h3>
              <button onClick={() => setAppraiseModalItem(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAppraiseTradeIn} className="p-6 space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 space-y-2">
                <p>
                  Customer: <strong className="text-slate-900 font-bold">{appraiseModalItem.customer_name}</strong>
                </p>
                <p>
                  Unit:{" "}
                  <strong className="text-slate-900 font-bold">
                    {appraiseModalItem.current_brand} {appraiseModalItem.current_model} ({appraiseModalItem.current_year})
                  </strong>
                </p>
                <p>
                  Customer Expected:{" "}
                  <strong className="text-emerald-700 font-mono font-black">${appraiseModalItem.customer_expected_price?.toLocaleString()}</strong>
                </p>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">Official Appraised Valuation ($ USD)</label>
                <input
                  type="number"
                  required
                  value={appraiseAmount}
                  onChange={(e) => setAppraiseAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-emerald-700 font-mono text-lg font-black outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAppraiseModalItem(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/25">
                  Confirm Valuation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD STAFF */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <Users className="w-5 h-5 text-emerald-600" />
                <span>បង្កើតគណនីបុគ្គលិកថ្មី (Create Showroom Staff Account)</span>
              </h3>
              <button
                onClick={() => setUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">
                    ឈ្មោះពេញ (Full Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sok San"
                    value={userForm.full_name}
                    onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-medium focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">
                    លេខទូរស័ព្ទ (Phone Number)
                  </label>
                  <input
                    type="text"
                    placeholder="012 888 999"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-medium focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">
                    ឈ្មោះគណនី (Username) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">@</span>
                    <input
                      type="text"
                      required
                      placeholder="soksan_staff"
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3.5 py-2.5 text-slate-800 outline-none font-mono font-medium focus:border-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-700 font-bold">
                      ពាក្យសម្ងាត់ (Password) <span className="text-rose-500">*</span>
                    </label>
                    <span className={`text-2xs font-bold ${userForm.password.length >= 8 ? "text-emerald-600" : "text-slate-400"}`}>
                      {userForm.password.length}/8 chars
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showCreatePassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="យ៉ាងតិច ៨ តួអក្សរ"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 pr-10 py-2.5 text-slate-800 outline-none font-medium focus:border-emerald-500 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">
                  អ៊ីមែល (Work Email) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="sok.san@drivex-cambodia.com"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-medium focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">
                    តួនាទី (System Role) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={userForm.role}
                    onChange={(e) => {
                      const nextRole = e.target.value as AdminUser["role"];
                      setUserForm({
                        ...userForm,
                        role: nextRole,
                        branch_id: nextRole === "SUPER_ADMIN" ? "" : userForm.branch_id || branches[0]?.id || "",
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-bold cursor-pointer focus:border-emerald-500"
                  >
                    <option value="STAFF">👤 STAFF (ផ្នែកលក់ & ស្តុកឡាន)</option>
                    <option value="BRANCH_ADMIN">🏢 BRANCH_ADMIN (ប្រធាន Showroom សាខា)</option>
                    <option value="SUPER_ADMIN">👑 SUPER_ADMIN (អភិបាលជាន់ខ្ពស់ HQ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">
                    សាខា Showroom (Assigned Branch)
                  </label>
                  <select
                    disabled={userForm.role === "SUPER_ADMIN"}
                    value={userForm.role === "SUPER_ADMIN" ? "" : userForm.branch_id}
                    onChange={(e) => setUserForm({ ...userForm, branch_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-bold cursor-pointer focus:border-emerald-500 disabled:opacity-50 disabled:bg-slate-100"
                  >
                    {userForm.role === "SUPER_ADMIN" ? (
                      <option value="">🏢 គ្រប់សាខាទាំងអស់ (All Branches - HQ)</option>
                    ) : (
                      branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          📍 {b.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setUserModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/25 flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>បង្កើតគណនីបុគ្គលិក (Save Staff)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STAFF DETAILS & RESET PASSWORD */}
      {editUserModalOpen && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
                <Pencil className="w-5 h-5 text-emerald-600" />
                <span>កែសម្រួលគណនីបុគ្គលិក (Edit Staff Account)</span>
              </h3>
              <button
                onClick={() => {
                  setEditUserModalOpen(false);
                  setSelectedUserForEdit(null);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditUser} className="p-6 space-y-4 text-sm">
              {/* Account Identifier Badge */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-2xs uppercase tracking-wider font-extrabold text-slate-400">Account Username & Email</span>
                  <p className="font-mono font-bold text-slate-900 text-sm">@{selectedUserForEdit.username}</p>
                </div>
                <span className="text-xs text-slate-500 font-medium">{selectedUserForEdit.email}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">
                    ឈ្មោះពេញ (Full Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editUserForm.full_name}
                    onChange={(e) => setEditUserForm({ ...editUserForm, full_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-medium focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">
                    លេខទូរស័ព្ទ (Phone Number)
                  </label>
                  <input
                    type="text"
                    placeholder="012 888 999"
                    value={editUserForm.phone}
                    onChange={(e) => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-medium focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">
                    តួនាទី (System Role) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    disabled={selectedUserForEdit.id === currentUserID}
                    value={editUserForm.role}
                    onChange={(e) => {
                      const nextRole = e.target.value as AdminUser["role"];
                      setEditUserForm({
                        ...editUserForm,
                        role: nextRole,
                        branch_id: nextRole === "SUPER_ADMIN" ? "" : editUserForm.branch_id || branches[0]?.id || "",
                      });
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-bold cursor-pointer focus:border-emerald-500 disabled:opacity-50"
                  >
                    <option value="STAFF">👤 STAFF (ផ្នែកលក់ & ស្តុកឡាន)</option>
                    <option value="BRANCH_ADMIN">🏢 BRANCH_ADMIN (ប្រធាន Showroom សាខា)</option>
                    <option value="SUPER_ADMIN">👑 SUPER_ADMIN (អភិបាលជាន់ខ្ពស់ HQ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1.5 font-bold">
                    សាខា Showroom (Assigned Branch)
                  </label>
                  <select
                    disabled={editUserForm.role === "SUPER_ADMIN"}
                    value={editUserForm.role === "SUPER_ADMIN" ? "" : editUserForm.branch_id}
                    onChange={(e) => setEditUserForm({ ...editUserForm, branch_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-bold cursor-pointer focus:border-emerald-500 disabled:opacity-50 disabled:bg-slate-100"
                  >
                    {editUserForm.role === "SUPER_ADMIN" ? (
                      <option value="">🏢 គ្រប់សាខាទាំងអស់ (All Branches - HQ)</option>
                    ) : (
                      branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          📍 {b.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1.5 font-bold">
                  ស្ថានភាពគណនី (Account Status)
                </label>
                <select
                  disabled={selectedUserForEdit.id === currentUserID}
                  value={editUserForm.status}
                  onChange={(e) => setEditUserForm({ ...editUserForm, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none font-bold cursor-pointer focus:border-emerald-500 disabled:opacity-50"
                >
                  <option value="ACTIVE">🟢 ACTIVE (អនុញ្ញាតឱ្យ Login និងដំណើរការ)</option>
                  <option value="DISABLED">🔴 DISABLED (ផ្អាកដំណើរការជាបណ្តោះអាសន្ន)</option>
                </select>
              </div>

              {/* Password Reset Section */}
              <div className="pt-3 border-t border-slate-100">
                <div className="p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-amber-600" />
                      <span>ប្តូរពាក្យសម្ងាត់ថ្មី (Password Reset - Optional)</span>
                    </label>
                    <span className="text-2xs text-amber-700 italic">ទុកទំនេរ បើមិនប្តូរ</span>
                  </div>
                  <div className="relative">
                    <input
                      type={showEditPassword ? "text" : "password"}
                      minLength={8}
                      placeholder="បញ្ចូលពាក្យសម្ងាត់ថ្មី (យ៉ាងតិច ៨ តួ)"
                      value={editUserForm.new_password}
                      onChange={(e) => setEditUserForm({ ...editUserForm, new_password: e.target.value })}
                      className="w-full bg-white border border-amber-200 rounded-xl px-3.5 pr-10 py-2 text-slate-800 outline-none text-xs font-medium focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="absolute right-3 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditUserModalOpen(false);
                    setSelectedUserForEdit(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  បោះបង់ (Cancel)
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-md shadow-emerald-600/25 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>រក្សាទុកការកែប្រែ (Save Changes)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE / ARCHIVE STAFF */}
      {deleteUserModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2">
              លុប ឬផ្អាកគណនីបុគ្គលិក?
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              តើអ្នកពិតជាចង់ដកគណនីរបស់ <strong className="text-slate-900 font-bold">{userToDelete.full_name}</strong> (
              <span className="font-mono text-emerald-700 font-bold">@{userToDelete.username}</span>) ចេញពីប្រព័ន្ធមែនទេ?
              <br />
              <span className="text-2xs text-slate-400 mt-2 block">
                * ប្រសិនបើបុគ្គលិកនេះមានទិន្នន័យប្រតិបត្តិការរួចមកហើយ ប្រព័ន្ធនឹងប្តូរទៅជា <strong>DISABLED</strong> ដោយស្វ័យប្រវត្តិដើម្បីរក្សាកំណត់ត្រាប្រវត្តិ។
              </span>
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setDeleteUserModalOpen(false);
                  setUserToDelete(null);
                }}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer text-xs sm:text-sm"
              >
                បោះបង់ (Cancel)
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer shadow-md shadow-rose-600/25 flex items-center gap-2 text-xs sm:text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>បញ្ជាក់ការលុប (Confirm Delete)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

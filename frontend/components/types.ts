export interface Branch {
  id: string;
  code: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  is_headquarters: boolean;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string;
  icon: string;
}

export interface VehicleColorOption {
  id: string;
  name: string;
  code?: string;
  hex: string;
  imageUrl: string;
  swatchUrl?: string;
  priceModifier?: number;
}

export interface Product {
  id: string;
  category_id: string;
  category_name?: string;
  category_type?: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  base_price: number;
  as_shown_price?: number;
  top_label?: string; // e.g. "Hybrid EV", "Battery EV", "Plug-in Hybrid EV", "Fuel Cell EV", "Hybrid EV Available"
  condition: string;
  description: string;
  images: string[];
  colors?: VehicleColorOption[];
  specs: Record<string, any>;
  is_active: boolean;
  available_units?: number;
  mpg_range?: string; // e.g. "20/26", "314 miles", "52/127"
  mpg_sublabel?: string; // e.g. "Up to Est. MPG", "Up to Est. Range", "Up to Est. MPGe"
  seating?: number;
  body_type?: string; // "SUV", "Sedan", "Truck", "Minivan", "Sports"
  powertrain_type?: string; // "BATTERY_EV", "HYBRID_EV", "PLUGIN_HYBRID", "FUEL_CELL", "GASOLINE"
}

export interface Order {
  id: string;
  order_no: string;
  branch_id: string;
  branch_name?: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  payment_method: string;
  subtotal: number;
  total_amount: number;
  paid_amount?: number;
  balance_due?: number;
  status: string;
  payment_status: string;
  notes?: string;
  selected_color?: string;
  created_at: string;
}

export interface TradeInRequest {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  target_vehicle_product_id?: string;
  target_product_name?: string;
  target_branch_id: string;
  target_branch_name?: string;
  trade_in_type: string;
  current_brand: string;
  current_model: string;
  current_year: number;
  current_mileage: number;
  condition_description: string;
  customer_expected_price: number;
  appraised_value: number;
  appraisal_notes?: string;
  status: string;
  created_at: string;
}

export interface InstallmentApplication {
  id: string;
  order_id: string;
  order_no?: string;
  customer_id: string;
  customer_name?: string;
  branch_id: string;
  branch_name?: string;
  vehicle_price: number;
  down_payment: number;
  down_payment_percentage: number;
  loan_amount: number;
  interest_rate_annual: number;
  term_months: number;
  monthly_installment: number;
  status: string;
  reviewer_notes?: string;
  created_at: string;
}

export interface BranchInventoryItem {
  id: string;
  branch_id: string;
  branch_name: string;
  product_id: string;
  product_name: string;
  quantity: number;
  reserved_qty: number;
  available_qty?: number;
  min_threshold: number;
  selling_price: number;
}

export interface StockTransfer {
  id: string;
  from_branch_id: string;
  from_branch_name: string;
  to_branch_id: string;
  to_branch_name: string;
  product_id: string;
  product_name: string;
  quantity: number;
  status: string;
  notes?: string;
  requested_at: string;
}

export interface StockMovement {
  id: string;
  branch_id: string;
  branch_name: string;
  product_id: string;
  product_name: string;
  transaction_type: string;
  quantity: number;
  performed_by: string;
  created_at: string;
}

export interface InstallmentPaymentSchedule {
  id: string;
  customer_id: string;
  customer_name: string;
  order_no: string;
  branch_id: string;
  branch_name: string;
  due_date: string;
  monthly_amount: number;
  payment_status: string;
  overdue_days: number;
}

export interface AdminUser {
  id: string;
  branch_id?: string;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  role: "SUPER_ADMIN" | "BRANCH_ADMIN" | "STAFF";
  status: string;
}

export interface TelegramStatus {
  bot_username: string;
  connection_status: string;
  active_chat_groups: number;
  last_ping_time?: string;
}

export interface NotificationLog {
  id: string;
  event_type: string;
  target_channel: string;
  message_payload: string;
  delivery_status: string;
  error_message?: string;
  timestamp: string;
}

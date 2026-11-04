# VehicleHub Cart Feature Specification

> **Module Identifier:** `cart`  
> **Schema Version:** 1.0  
> **Target Routes:** Drawer (`<CartDrawer />`) & Full Page (`/cart` & `/checkout`)  
> **Status:** Implemented & Verified  

---

## 1. JSON Data Specification

```json
{
  "cart": {
    "cart_id": "cart_123456",
    "customer_id": "user_789",
    "items": [
      {
        "cart_item_id": "item_001",
        "product_id": "prod_taicoma_2026",
        "product_name": "Toyota Tacoma 2026",
        "selected_variant": {
          "color": "Blue",
          "trim": "TRD Off-Road"
        },
        "unit_price": 38500,
        "quantity": 1,
        "total_price": 38500,
        "image_url": "https://example.com/images/tacoma.png"
      }
    ],
    "summary": {
      "subtotal": 38500,
      "discount_amount": 0,
      "estimated_shipping": 500,
      "grand_total": 39000,
      "currency": "USD"
    }
  }
}
```

---

## 2. Architecture & Components

```mermaid
graph TD
    A[Customer on Showroom / Vehicle Detail] -->|Click 'ថែមក្នុងកន្ត្រក' / Cart Icon| B[CartContext State]
    B -->|Persists in| C[LocalStorage vehiclehub_cart_v1]
    B -->|Renders Slide-over Drawer| D[CartDrawer Component]
    B -->|Renders Full Cart Page| E[/cart Page Route]
    D -->|Click 'Proceed to Checkout'| F[/checkout Page Route]
    E -->|Click 'Proceed to Checkout'| F
    F -->|Processes Payment & Reservation| G[Bakong KHQR / Cash / Loan]
```

---

## 3. Data Dictionary

| Field | Type | Description |
| :--- | :--- | :--- |
| `cart_id` | String | Unique identifier of the shopping cart session |
| `customer_id` | String | User / Customer ID |
| `items[].cart_item_id` | String | Unique item row ID in the cart |
| `items[].product_id` | String | Reference to vehicle/product SKU |
| `items[].product_name` | String | Vehicle name (e.g. `Toyota Tacoma 2026`) |
| `items[].selected_variant.color` | String | Selected exterior color (e.g. `Blue`) |
| `items[].selected_variant.trim` | String | Selected trim grade (e.g. `TRD Off-Road`) |
| `items[].unit_price` | Number | Base MSRP unit price in USD ($38,500) |
| `items[].quantity` | Number | Number of units selected |
| `items[].total_price` | Number | Line item total (`unit_price * quantity`) |
| `items[].image_url` | String | High-res vehicle thumbnail image |
| `summary.subtotal` | Number | Sum of all line item totals ($38,500) |
| `summary.discount_amount` | Number | Total promotional discount applied ($0) |
| `summary.estimated_shipping` | Number | Nationwide freight/delivery estimate ($500) |
| `summary.grand_total` | Number | Final total payable ($39,000 USD) |
| `summary.currency` | String | Standard currency code (`USD`) |

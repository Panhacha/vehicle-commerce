import type { Metadata } from "next";
import UnifiedCheckout from "@/components/UnifiedCheckout";

export const metadata: Metadata = {
  title: "Shopping Cart & Checkout | VehicleHub Cambodia",
  description: "Unified Full-Screen Cart and Checkout for Vehicles. Complete your reservation or full purchase with Bakong KHQR.",
};

export default function CartPage() {
  return <UnifiedCheckout />;
}

"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Navbar } from "./Navbar";
import { CarChatbot } from "./CarChatbot";
import { MOCK_PRODUCTS, MOCK_BRANCHES } from "./mockData";

/**
 * GlobalHeader renders the signature DriveX Topbar & Navigation Bar
 * as well as the 24/7 AI Sales Assistant (Vibol) across all customer pages
 * (/ , /shop , /checkout , /cart , etc.) and automatically hides itself on admin routes.
 */
export function GlobalHeader() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide customer web navbar & chatbot completely on admin management portal
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Navbar />
      <CarChatbot
        products={MOCK_PRODUCTS}
        branches={MOCK_BRANCHES}
        onOpenOrderModal={(product) => {
          router.push(`/checkout?id=${product.id}`);
        }}
      />
    </>
  );
}

export default GlobalHeader;


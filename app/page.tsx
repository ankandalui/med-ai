"use client";

import { useTranslation } from "react-i18next";
import { Hero } from "@/components/hero";
import { Features } from "@/components/features";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <Features />
    </div>
  );
}

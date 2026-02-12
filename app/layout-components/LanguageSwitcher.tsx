"use client";
import React from "react";
import { useLocale } from "@/app/i18n/LocaleProvider";

const LanguageSwitcher = () => {
  const { locale, setLocale } = useLocale();

  return (
    <select
      aria-label="Language switcher"
      value={locale}
      onChange={(e) => setLocale(e.target.value as "en" | "ar")}
      className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
    >
      <option value="en">EN</option>
      <option value="ar">AR</option>
    </select>
  );
};

export default LanguageSwitcher;

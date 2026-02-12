"use client";
import React, { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Sidebar (absolute / fixed) */}
      <Sidebar sidebarOpen={sidebarOpen} />
    </>
  );
};

export default Layout;

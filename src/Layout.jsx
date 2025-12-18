import React from "react";
import BottomBar from "@/components/navigation/BottomBar";

export default function Layout({ children, currentPageName }) {
  return (
    <div className="min-h-screen">
      {children}
      <BottomBar />
    </div>
  );
}
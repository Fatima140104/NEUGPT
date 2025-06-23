import React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HeaderProps {
  selectedTitle: string;
}

const Header: React.FC<HeaderProps> = ({ selectedTitle }) => (
  <header className="sticky top-0 z-10 flex h-14 w-full items-center justify-between bg-white p-2 font-semibold text-text-primary dark:bg-gray-800">
    <div className="flex items-center gap-2">
      <SidebarTrigger />
      <h1 className="font-semibold">{selectedTitle}</h1>
    </div>
  </header>
);

export default Header;

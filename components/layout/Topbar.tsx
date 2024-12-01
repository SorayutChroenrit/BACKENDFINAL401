"use client";

import Image from "next/image";
import Link from "next/link";
import { NavUser } from "@/components/ui/extension/nav-user";
import { SidebarProvider } from "../ui/sidebar";

const Topbar = () => {
  return (
    <div className="flex justify-between items-center p-4">
      <div className="pl-2 flex items-center">
        <Link href="/">
          <Image src="/logo.png" height={100} width={60} alt="logo" />
        </Link>
      </div>

      <div className="flex gap-6 items-center">
        <div className="max-sm:hidden flex gap-6">
          <div className="h-[50px]">
            <SidebarProvider>
              <NavUser />
            </SidebarProvider>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;

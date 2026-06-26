"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminMobileNav } from "@/components/admin/admin-mobile-nav";
import { RoleGuard } from "@/components/shared/role-guard";

export default function AdminLayout({ children }) {
  return (
    <RoleGuard allowedRoles={["manager", "admin"]}>
      <div className="flex min-h-screen bg-gf-bg">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminMobileNav />
          <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </RoleGuard>
  );
}

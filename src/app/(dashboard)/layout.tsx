import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        userName={session.user.name ?? session.user.email}
        roleName={session.user.roleName}
        roleColor={session.user.roleColor}
        permissions={session.user.permissions ?? []}
      />
      <main id="main-content" className="flex-1 overflow-y-auto bg-bg p-4 pt-[calc(3.5rem+1rem)] sm:p-6 md:pt-6">
        {children}
      </main>
    </div>
  );
}

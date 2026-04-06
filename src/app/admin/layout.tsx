import { Sidebar } from "@/components/admin/sidebar";
import { ToastProvider } from "@/components/ui/toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-surface-secondary">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <div className="p-4 lg:p-8 pt-16 lg:pt-8">{children}</div>
        </main>
      </div>
    </ToastProvider>
  );
}

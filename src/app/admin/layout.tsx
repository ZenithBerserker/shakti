import { AdminChrome } from "@/components/layout/admin-chrome";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminChrome>{children}</AdminChrome>;
}

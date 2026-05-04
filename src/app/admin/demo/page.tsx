import Link from "next/link";
import {
  Boxes,
  Package,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/money";

const quickTiles = [
  {
    title: "Orders & delivery",
    description: "See who bought what, ship-to address, status.",
    icon: Truck,
  },
  {
    title: "Products & stock",
    description: "Edit descriptions, hide items, mark out of stock.",
    icon: Package,
  },
  {
    title: "Customers",
    description: "Registered buyers — business name and phone.",
    icon: Users,
  },
  {
    title: "Low stock alerts",
    description: "SKUs running low for reorder.",
    icon: Boxes,
  },
] as const;

const fakeOrders = [
  {
    orderNumber: "SK-240501-001",
    business: "Bluecrest Facilities",
    phone: "+91 98765 43210",
    status: "PENDING",
    total: "24899",
  },
  {
    orderNumber: "SK-240501-002",
    business: "Metro Kitchen Services",
    phone: "+91 91234 56789",
    status: "PACKED",
    total: "6840",
  },
  {
    orderNumber: "SK-240430-018",
    business: null,
    phone: "+91 99887 76655",
    status: "DISPATCHED",
    total: "15240",
  },
] as const;

export default function AdminDemoDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/25 dark:text-amber-50">
        <strong>Demo preview</strong> — numbers and orders below are placeholders. Connect{" "}
        <code className="rounded bg-background/60 px-1">DATABASE_URL</code> on Vercel, run migrations, create an admin,
        then use{" "}
        <Link href="/admin/login" className="font-medium underline underline-offset-2">
          Staff login
        </Link>
        .
      </div>

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Same layout as the live console — quick tiles, KPI cards, and a recent-orders table (mock data here).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickTiles.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="border-dashed opacity-95">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-5 w-5" />
                  <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
                </div>
                <CardDescription className="text-xs leading-snug">{item.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lifetime sales (sample)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{formatINR(125430)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Registered customers</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">42</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">All orders</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">186</CardContent>
        </Card>
        <Card className="border-amber-400/60 bg-amber-50/60 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Low-stock SKUs</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-3">
            <div className="text-3xl font-semibold">5</div>
            <span className="text-sm text-muted-foreground">Review (demo)</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
              Recent orders (demo)
            </CardTitle>
            <CardDescription className="mt-1">
              Live rows appear after Supabase + seed / admin:create.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Who ordered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fakeOrders.map((o) => (
                <TableRow key={o.orderNumber}>
                  <TableCell className="font-mono text-xs font-semibold">{o.orderNumber}</TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium">{o.business ?? "Customer"}</div>
                    <div className="text-xs text-muted-foreground">{o.phone}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{formatINR(Number(o.total))}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

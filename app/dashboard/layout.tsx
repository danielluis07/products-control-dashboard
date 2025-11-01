import { ConfirmProvider } from "@/providers/confirm-provider";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ConfirmProvider>{children}</ConfirmProvider>;
}

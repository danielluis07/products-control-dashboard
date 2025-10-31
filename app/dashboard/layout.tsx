import { ConfirmProvider } from "@/providers/confirm-provider";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConfirmProvider>
      <main className="p-5 w-11/12 mx-auto">{children}</main>
    </ConfirmProvider>
  );
}

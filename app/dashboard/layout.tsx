export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="p-5 w-11/12 mx-auto">{children}</main>;
}

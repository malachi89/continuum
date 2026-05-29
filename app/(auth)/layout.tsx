export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-8 lg:px-6">
      {children}
    </main>
  );
}

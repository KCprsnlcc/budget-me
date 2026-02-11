export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white text-slate-900 antialiased overflow-hidden">
      <div className="flex min-h-screen w-full">{children}</div>
    </div>
  );
}

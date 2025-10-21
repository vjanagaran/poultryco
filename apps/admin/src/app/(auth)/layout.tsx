export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-poultryco-green/5 to-poultryco-green/10">
      <div className="w-full max-w-md p-8">
        {children}
      </div>
    </div>
  );
}


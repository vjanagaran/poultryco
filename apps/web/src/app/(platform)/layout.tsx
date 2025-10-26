import { PlatformHeader } from "@/components/layout/PlatformHeader";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PlatformHeader />
      <main>{children}</main>
    </div>
  );
}


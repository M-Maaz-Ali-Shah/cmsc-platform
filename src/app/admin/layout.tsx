import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin Portal",
    template: "%s | CMSC Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-screen bg-paper-muted">{children}</div>;
}

import type { Metadata } from "next";
import "../admin.css";

export const metadata: Metadata = {
  title: "Admin sign in — Fitness Inspired Training",
  robots: { index: false, follow: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-login-wrap">{children}</div>;
}

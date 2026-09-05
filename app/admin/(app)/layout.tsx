import type { Metadata } from "next";
import { cookies } from "next/headers";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import "../admin.css";
import "@uploadthing/react/styles.css";
import { requireAdmin } from "@/lib/auth/dal";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import AdminNav from "./admin-nav";
import { signOut } from "./actions";
import Toaster from "./toaster";
import { TOAST_COOKIE } from "./flash";

export const metadata: Metadata = {
  title: "Admin — Fitness Inspired Training",
  robots: { index: false, follow: false },
};

export default async function AdminAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Authoritative guard — runs on every admin page/action, not just the proxy.
  await requireAdmin();

  const flash = (await cookies()).get(TOAST_COOKIE)?.value ?? "";

  return (
    <div className="admin-shell">
      <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      <header className="admin-topbar">
        <span className="admin-brand">
          Fitness Inspired<span className="tag">Admin</span>
        </span>
        <AdminNav />
        <form action={signOut}>
          <button type="submit" className="admin-signout">
            Sign out
          </button>
        </form>
      </header>
      <main className="admin-main">{children}</main>
      <Toaster flash={flash} />
    </div>
  );
}

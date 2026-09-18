"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/plans", label: "Plans" },
  { href: "/admin/purchases", label: "Purchases" },
];

export default function AdminNav() {
  const pathname = usePathname() ?? "";
  return (
    <nav className="admin-nav">
      {items.map((it) => {
        const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href} aria-current={active ? "page" : undefined}>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/lib/api";

export default function Nav() {
  const path = usePathname();
  const router = useRouter();
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    setInApp(Boolean(localStorage.getItem("ajo_token")));
  }, [path]);

  const signedOut = !inApp || path === "/" || path === "/login" || path === "/register";

  return (
    <header className="sticky top-0 z-30 border-b border-[#F0F0F8] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[84px] max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <img src="/fav.png" alt="" className="h-9 w-9" />
          <span className="text-xl font-semibold text-navy">Ajo</span>
        </Link>

        {signedOut ? (
          <>
            <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
              <Link href="/#home" className="hover:text-navy">
                Home
              </Link>
              <Link href="/#how" className="hover:text-navy">
                How it works
              </Link>
              <Link href="/#features" className="hover:text-navy">
                Features
              </Link>
              <Link href="/#about" className="hover:text-navy">
                About
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-navy">
                Login
              </Link>
              <Link href="/register" className="btn-teal !px-6 !py-2.5">
                Sign Up
              </Link>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-5">
            <Link href="/dashboard" className="text-sm text-muted hover:text-navy">
              Circles
            </Link>
            <button
              className="text-sm font-medium text-orange"
              onClick={() => {
                logout();
                router.push("/");
              }}
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

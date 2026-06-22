"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/api/auth";
import { LoadingState } from "@/components/admin/admin-ui";

const getUser = (response) =>
  response?.data?.user || response?.user || response?.data || response || null;

export default function AdminGuard({ children }) {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((response) => {
        if (active) setState({ loading: false, user: getUser(response) });
      })
      .catch(() => {
        if (active) setState({ loading: false, user: null });
      });
    return () => { active = false; };
  }, []);

  if (state.loading) {
    return <main className="mx-auto min-h-screen max-w-3xl p-8"><LoadingState /></main>;
  }

  if (!state.user || state.user.role !== "admin") {
    return <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4"><section className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm"><div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-sm font-bold text-red-600">403</div><h1 className="mt-4 text-xl font-semibold text-gray-950">Admin access required</h1><p className="mt-2 text-sm leading-6 text-gray-500">Sign in with an active administrator account to access the Storix admin console.</p><div className="mt-6 flex justify-center gap-2"><Link href="/" className="h-9 rounded-md border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700">My Drive</Link><Link href="/auth/login" className="h-9 rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white">Sign in</Link></div></section></main>;
  }

  return children;
}

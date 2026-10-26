"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions";
import { useI18n } from "@/lib/i18n/provider";
import { LangToggle } from "@/components/LangToggle";

export function Header({ children }: { children?: React.ReactNode }) {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 border-b border-violet-100/70 bg-white/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-lg">
            🎓
          </span>
          <span className="text-xl font-extrabold bg-gradient-to-r from-violet-700 to-fuchsia-500 bg-clip-text text-transparent">
            {t.appName}
          </span>
        </Link>
        <div className="min-w-0 flex-1">{children}</div>
        <LangToggle />
        <button
          onClick={async () => {
            await logout();
            router.replace("/");
            router.refresh();
          }}
          className="rounded-xl p-2 text-slate-500 hover:bg-violet-100 hover:text-violet-700 cursor-pointer"
          title={t.common.logout}
          aria-label={t.common.logout}
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

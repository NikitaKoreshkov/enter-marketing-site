"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import styles from "./admin.module.css";

export function AdminShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace(ADMIN_ROUTES.login);
    router.refresh();
  };

  return (
    <div className={styles.shell}>
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <Link href={ADMIN_ROUTES.root} aria-label="Админ-панель">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Enter Marketing"
              className={styles.brandLogo}
              width={132}
              height={30}
            />
          </Link>
          <div className={styles.brandCopy}>
            <span className={styles.brandLabel}>Admin</span>
            <span className={styles.brandMeta}>{email}</span>
          </div>
        </div>
        <div className={styles.topActions}>
          <Link href="/" className={styles.btnGhost} target="_blank">
            Сайт
          </Link>
          <button type="button" className={styles.btnGhost} onClick={logout}>
            Выйти
          </button>
        </div>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}

import { Suspense } from "react";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import styles from "./auth-page.module.css";

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className={styles.main}>
        <Suspense fallback={null}>{children}</Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import styles from "./admin.module.css";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("entermarketing@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Не удалось войти");
        return;
      }
      router.replace(ADMIN_ROUTES.root);
      router.refresh();
    } catch {
      setError("Не удалось войти");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginWrap}>
      <form className={styles.loginCard} onSubmit={onSubmit}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="Enter Marketing"
          className={styles.loginLogo}
          width={148}
          height={34}
        />
        <div className={styles.loginEyebrow}>Control room</div>
        <h1 className={styles.loginTitle}>Админ-панель</h1>
        <p className={styles.loginSub}>
          Управляйте кейсами Enter Marketing. Текст, фото и видео обновляются
          на сайте сразу после сохранения.
        </p>

        <div className={styles.form}>
          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className={styles.label}>
            Пароль
            <input
              className={styles.input}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error ? <p className={styles.error}>{error}</p> : null}

          <button
            className={`${styles.btn} ${styles.btnWide}`}
            type="submit"
            disabled={loading}
          >
            {loading ? "Входим…" : "Войти в панель"}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import type { SiteCase } from "@/lib/site/case-types";
import styles from "./admin.module.css";

export function AdminCasesList({ cases: initial }: { cases: SiteCase[] }) {
  const router = useRouter();
  const [cases, setCases] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const photos = cases.reduce((sum, item) => sum + item.images.length, 0);
  const videos = cases.reduce((sum, item) => sum + item.videos.length, 0);

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Удалить проект «${title}»?`)) return;
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/cases/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Не удалось удалить");
        return;
      }
      setCases((prev) => prev.filter((item) => item.id !== id));
      router.refresh();
    } catch {
      setError("Не удалось удалить");
    } finally {
      setBusyId(null);
    }
  };

  const move = async (id: string, direction: -1 | 1) => {
    const index = cases.findIndex((item) => item.id === id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= cases.length) return;

    const ordered = [...cases];
    const [item] = ordered.splice(index, 1);
    ordered.splice(next, 0, item);
    setCases(ordered);

    try {
      const res = await fetch("/api/admin/cases", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          ids: ordered.map((entry) => entry.id),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        cases?: SiteCase[];
      };
      if (!res.ok || !data.ok) {
        setError(data.error || "Не удалось изменить порядок");
        setCases(cases);
        return;
      }
      if (data.cases) setCases(data.cases);
      router.refresh();
    } catch {
      setError("Не удалось изменить порядок");
      setCases(cases);
    }
  };

  return (
    <>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.eyebrow}>Portfolio CMS</div>
          <h1 className={styles.pageTitle}>Проекты</h1>
          <p className={styles.pageSub}>
            Редактируйте кейсы целиком — от текста и Instagram до фото и видео.
            После сохранения сайт обновляется сразу.
          </p>
        </div>
        <Link href={ADMIN_ROUTES.caseNew} className={styles.btn}>
          + Новый проект
        </Link>
      </div>

      <div className={styles.statsRow}>
        <span className={styles.statChip}>
          Проектов <strong>{cases.length}</strong>
        </span>
        <span className={styles.statChip}>
          Фото <strong>{photos}</strong>
        </span>
        <span className={styles.statChip}>
          Видео <strong>{videos}</strong>
        </span>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}

      {cases.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyTitle}>Пока пусто</div>
          Создайте первый проект — и он сразу появится на сайте.
        </div>
      ) : (
        <div className={styles.list}>
          {cases.map((item, index) => (
            <article key={item.id} className={styles.card}>
              <div className={styles.thumbWrap}>
                {item.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className={styles.thumb} src={item.cover} alt="" />
                ) : (
                  <div className={styles.thumbEmpty} />
                )}
                <span className={styles.thumbIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>{item.title}</h2>
                <p className={styles.cardMeta}>
                  {item.service || "Без услуги"}
                  {item.instagram ? ` · @${item.instagram}` : ""}
                </p>
                <div className={styles.cardChips}>
                  <span className={styles.chip}>{item.images.length} фото</span>
                  <span className={styles.chip}>{item.videos.length} видео</span>
                  <span className={styles.chip}>{item.work.length} шагов</span>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.btnIcon}
                  disabled={index === 0}
                  aria-label="Выше"
                  onClick={() => move(item.id, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className={styles.btnIcon}
                  disabled={index === cases.length - 1}
                  aria-label="Ниже"
                  onClick={() => move(item.id, 1)}
                >
                  ↓
                </button>
                <Link
                  href={ADMIN_ROUTES.caseEdit(item.id)}
                  className={styles.btnGhost}
                >
                  Редактировать
                </Link>
                <button
                  type="button"
                  className={styles.btnDanger}
                  disabled={busyId === item.id}
                  onClick={() => remove(item.id, item.title)}
                >
                  Удалить
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

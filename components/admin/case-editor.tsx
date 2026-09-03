"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ADMIN_ROUTES } from "@/lib/admin/constants";
import type { CaseResult, SiteCase } from "@/lib/site/case-types";
import styles from "./admin.module.css";

type Draft = {
  id: string;
  title: string;
  service: string;
  description: string;
  work: string[];
  result: string;
  results: CaseResult[];
  cover: string;
  images: string[];
  videos: string[];
  instagram: string;
  website: string;
};

function toDraft(item?: SiteCase | null): Draft {
  return {
    id: item?.id ?? "",
    title: item?.title ?? "",
    service: item?.service ?? "",
    description: item?.description ?? "",
    work: item?.work?.length ? [...item.work] : [""],
    result: item?.result ?? "",
    results: item?.results?.length
      ? item.results.map((row) => ({ ...row }))
      : [{ value: "", label: "" }],
    cover: item?.cover ?? "",
    images: item?.images ? [...item.images] : [],
    videos: item?.videos ? [...item.videos] : [],
    instagram: item?.instagram ?? "",
    website: item?.website ?? "",
  };
}

async function uploadFile(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/upload", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = (await res.json()) as {
    ok?: boolean;
    error?: string;
    upload?: { url: string };
  };
  if (!res.ok || !data.ok || !data.upload?.url) {
    throw new Error(data.error || "Не удалось загрузить файл");
  }
  return data.upload.url;
}

export function CaseEditor({
  mode,
  initial,
}: {
  mode: "create" | "edit";
  initial?: SiteCase | null;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => toDraft(initial));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  const setField = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onUpload = async (
    files: FileList | null,
    target: "cover" | "images" | "videos"
  ) => {
    if (!files?.length) return;
    setUploading(target);
    setError(null);
    try {
      if (target === "cover") {
        const url = await uploadFile(files[0]);
        setField("cover", url);
      } else if (target === "images") {
        const urls: string[] = [];
        for (const file of Array.from(files)) {
          urls.push(await uploadFile(file));
        }
        setDraft((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
      } else {
        const urls: string[] = [];
        for (const file of Array.from(files)) {
          urls.push(await uploadFile(file));
        }
        setDraft((prev) => ({ ...prev, videos: [...prev.videos, ...urls] }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(null);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const payload = {
      id: draft.id.trim() || undefined,
      title: draft.title,
      service: draft.service,
      description: draft.description,
      work: draft.work,
      result: draft.result,
      results: draft.results,
      cover: draft.cover,
      images: draft.images,
      videos: draft.videos,
      instagram: draft.instagram,
      website: draft.website,
    };

    try {
      const res = await fetch(
        mode === "create"
          ? "/api/admin/cases"
          : `/api/admin/cases/${initial?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        case?: SiteCase;
      };
      if (!res.ok || !data.ok || !data.case) {
        setError(data.error || "Не удалось сохранить");
        return;
      }

      setSuccess("Сохранено — сайт уже обновлён");
      if (mode === "create") {
        router.replace(ADMIN_ROUTES.caseEdit(data.case.id));
      }
      router.refresh();
    } catch {
      setError("Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className={styles.editorGrid} onSubmit={onSubmit}>
      <div className={styles.headerRow}>
        <div>
          <div className={styles.eyebrow}>
            {mode === "create" ? "Create case" : "Edit case"}
          </div>
          <h1 className={styles.pageTitle}>
            {mode === "create" ? "Новый проект" : draft.title || "Редактирование"}
          </h1>
          <p className={styles.pageSub}>
            Текст, Instagram, обложка, фото и видео — всё в одном месте. После
            сохранения сайт обновляется сразу.
          </p>
        </div>
        <Link href={ADMIN_ROUTES.root} className={styles.btnGhost}>
          К списку
        </Link>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>01</span>
            Основное
          </h2>
          <span className={styles.sectionHint}>Название и описание</span>
        </div>
        <div className={styles.row2}>
          <label className={styles.label}>
            Название
            <input
              className={styles.input}
              value={draft.title}
              onChange={(e) => setField("title", e.target.value)}
              required
            />
          </label>
          <label className={styles.label}>
            Услуга
            <input
              className={styles.input}
              value={draft.service}
              onChange={(e) => setField("service", e.target.value)}
            />
          </label>
        </div>

        {mode === "create" ? (
          <label className={styles.label}>
            ID (slug, необязательно)
            <input
              className={styles.input}
              value={draft.id}
              onChange={(e) => setField("id", e.target.value)}
              placeholder="например: qazaq-jihaz"
            />
          </label>
        ) : null}

        <label className={styles.label}>
          Описание проекта
          <textarea
            className={styles.textarea}
            value={draft.description}
            onChange={(e) => setField("description", e.target.value)}
          />
        </label>

        <div className={styles.row2}>
          <label className={styles.label}>
            Instagram (без @)
            <input
              className={styles.input}
              value={draft.instagram}
              onChange={(e) => setField("instagram", e.target.value)}
            />
          </label>
          <label className={styles.label}>
            Сайт
            <input
              className={styles.input}
              value={draft.website}
              onChange={(e) => setField("website", e.target.value)}
              placeholder="https://"
            />
          </label>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>02</span>
            Что мы сделали
          </h2>
          <span className={styles.sectionHint}>Шаги работы</span>
        </div>
        <div className={styles.listEditor}>
          {draft.work.map((item, index) => (
            <div key={index} className={styles.listRow}>
              <input
                className={styles.input}
                value={item}
                onChange={(e) => {
                  const next = [...draft.work];
                  next[index] = e.target.value;
                  setField("work", next);
                }}
              />
              <button
                type="button"
                className={styles.btnIcon}
                aria-label="Удалить пункт"
                onClick={() =>
                  setField(
                    "work",
                    draft.work.filter((_, i) => i !== index)
                  )
                }
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => setField("work", [...draft.work, ""])}
          >
            + Пункт
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>03</span>
            Результат
          </h2>
          <span className={styles.sectionHint}>Текст и цифры</span>
        </div>
        <label className={styles.label}>
          Текст результата
          <textarea
            className={styles.textarea}
            value={draft.result}
            onChange={(e) => setField("result", e.target.value)}
          />
        </label>

        <div className={styles.listEditor}>
          {draft.results.map((item, index) => (
            <div key={index} className={styles.row2}>
              <input
                className={styles.input}
                placeholder="Значение"
                value={item.value}
                onChange={(e) => {
                  const next = [...draft.results];
                  next[index] = { ...next[index], value: e.target.value };
                  setField("results", next);
                }}
              />
              <div className={styles.listRow}>
                <input
                  className={styles.input}
                  placeholder="Подпись"
                  value={item.label}
                  onChange={(e) => {
                    const next = [...draft.results];
                    next[index] = { ...next[index], label: e.target.value };
                    setField("results", next);
                  }}
                />
                <button
                  type="button"
                  className={styles.btnIcon}
                  aria-label="Удалить показатель"
                  onClick={() =>
                    setField(
                      "results",
                      draft.results.filter((_, i) => i !== index)
                    )
                  }
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() =>
              setField("results", [...draft.results, { value: "", label: "" }])
            }
          >
            + Показатель
          </button>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>04</span>
            Обложка
          </h2>
          <span className={styles.sectionHint}>Главный кадр кейса</span>
        </div>
        {draft.cover ? (
          <div className={styles.mediaGrid}>
            <div className={styles.mediaItem}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={draft.cover} alt="" />
              <button
                type="button"
                className={styles.mediaRemove}
                onClick={() => setField("cover", "")}
              >
                ×
              </button>
            </div>
          </div>
        ) : null}
        <label className={`${styles.btnGhost} ${styles.fileBtn}`}>
          {uploading === "cover" ? "Загрузка…" : "Загрузить обложку"}
          <input
            type="file"
            accept="image/*"
            disabled={Boolean(uploading)}
            onChange={(e) => {
              void onUpload(e.target.files, "cover");
              e.target.value = "";
            }}
          />
        </label>
        <label className={styles.label}>
          Или URL обложки
          <input
            className={styles.input}
            value={draft.cover}
            onChange={(e) => setField("cover", e.target.value)}
          />
        </label>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>05</span>
            Фотографии
          </h2>
          <span className={styles.sectionHint}>{draft.images.length} файлов</span>
        </div>
        <div className={styles.mediaGrid}>
          {draft.images.map((src) => (
            <div key={src} className={styles.mediaItem}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" />
              <button
                type="button"
                className={styles.mediaRemove}
                onClick={() =>
                  setField(
                    "images",
                    draft.images.filter((item) => item !== src)
                  )
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <label className={`${styles.btnGhost} ${styles.fileBtn}`}>
          {uploading === "images" ? "Загрузка…" : "+ Фото"}
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={Boolean(uploading)}
            onChange={(e) => {
              void onUpload(e.target.files, "images");
              e.target.value = "";
            }}
          />
        </label>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.sectionNum}>06</span>
            Видео
          </h2>
          <span className={styles.sectionHint}>{draft.videos.length} файлов</span>
        </div>
        <div className={styles.mediaGrid}>
          {draft.videos.map((src) => (
            <div key={src} className={styles.mediaItem}>
              <video src={src} muted playsInline />
              <button
                type="button"
                className={styles.mediaRemove}
                onClick={() =>
                  setField(
                    "videos",
                    draft.videos.filter((item) => item !== src)
                  )
                }
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <label className={`${styles.btnGhost} ${styles.fileBtn}`}>
          {uploading === "videos" ? "Загрузка…" : "+ Видео"}
          <input
            type="file"
            accept="video/*"
            multiple
            disabled={Boolean(uploading)}
            onChange={(e) => {
              void onUpload(e.target.files, "videos");
              e.target.value = "";
            }}
          />
        </label>
      </section>

      {error ? <p className={styles.error}>{error}</p> : null}
      {success ? <p className={styles.success}>{success}</p> : null}

      <div className={styles.stickyActions}>
        <button
          className={styles.btn}
          type="submit"
          disabled={saving || Boolean(uploading)}
        >
          {saving ? "Сохраняем…" : "Сохранить и обновить сайт"}
        </button>
        <Link href={ADMIN_ROUTES.root} className={styles.btnGhost}>
          Отмена
        </Link>
      </div>
    </form>
  );
}

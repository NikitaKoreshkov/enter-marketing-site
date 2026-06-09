"use client";

import { useState, FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./contact-form.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

type Props = {
  idPrefix?: string;
  submitLabel?: string;
  onSuccess?: () => void;
};

export function ContactForm({
  idPrefix = "cf",
  submitLabel = "Отправить заявку",
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !contact) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setSent(true);
    onSuccess?.();
  };

  return (
    <AnimatePresence mode="wait">
      {sent ? (
        <motion.div
          key="success"
          className={styles.success}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <span className={styles.successIcon}>🎯</span>
          <p className={styles.successTitle}>Заявка отправлена</p>
          <p className={styles.successText}>
            Свяжемся с вами в течение часа. Пока можете изучить наши кейсы —
            чтобы было о чём поговорить.
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          className={styles.form}
          onSubmit={handleSubmit}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className={styles.field}>
            <label htmlFor={`${idPrefix}-name`} className={styles.fieldLabel}>
              Ваше имя
            </label>
            <input
              id={`${idPrefix}-name`}
              type="text"
              className={styles.input}
              placeholder="Как к вам обращаться?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor={`${idPrefix}-contact`} className={styles.fieldLabel}>
              Телефон или Email
            </label>
            <input
              id={`${idPrefix}-contact`}
              type="text"
              className={styles.input}
              placeholder="+7 700 000 00 00"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              autoComplete="tel"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor={`${idPrefix}-message`} className={styles.fieldLabel}>
              Задача или вопрос
            </label>
            <textarea
              id={`${idPrefix}-message`}
              className={styles.textarea}
              placeholder="Расскажите о своём бизнесе и что хотите улучшить"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={styles.submit}
            disabled={sending || !name || !contact}
          >
            {sending ? "Отправляем…" : submitLabel}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

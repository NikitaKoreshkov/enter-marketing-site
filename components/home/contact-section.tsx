"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ContactForm } from "@/components/contact/contact-form";
import styles from "./contact-section.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

export function ContactSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section id="contact" className={styles.section} ref={ref}>
      <div className={styles.inner}>
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease }}
        >
          <p className={styles.label}>Заявка</p>
          <h2 className={styles.heading}>Расскажите о вашем проекте</h2>
        </motion.div>

        <motion.div
          className={styles.formCol}
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease }}
        >
          <ContactForm idPrefix="cf" />
        </motion.div>
      </div>
    </section>
  );
}

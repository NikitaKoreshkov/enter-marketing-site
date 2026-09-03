const HEADER_OFFSET_PX = 112;

export function scrollToSection(hash: string) {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  const el = document.getElementById(id);
  if (!el) return;

  const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX;
  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

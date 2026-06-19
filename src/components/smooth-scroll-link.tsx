"use client";

import { useEffect, type AnchorHTMLAttributes, type MouseEvent } from "react";

type SmoothScrollLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: `#${string}`;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getScrollTop(hash: string) {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  const target = document.getElementById(id);
  if (!target) return null;

  const nav = document.querySelector<HTMLElement>("[data-public-nav]");
  const offset = (nav?.offsetHeight ?? 64) + 16;
  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
}

function scrollToHash(hash: string, updateUrl = true) {
  const top = getScrollTop(hash);
  if (top === null) return false;

  window.scrollTo({
    top,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });

  if (updateUrl && window.location.hash !== hash) {
    history.pushState(null, "", hash);
  }

  return true;
}

export function SmoothScrollLink({ href, onClick, ...props }: SmoothScrollLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    scrollToHash(href);
  }

  return <a href={href} onClick={handleClick} {...props} />;
}

export function SmoothHashScroller() {
  useEffect(() => {
    if (!window.location.hash) return;

    const hash = window.location.hash;
    window.scrollTo({ top: 0, behavior: "auto" });
    requestAnimationFrame(() => scrollToHash(hash, false));
  }, []);

  return null;
}

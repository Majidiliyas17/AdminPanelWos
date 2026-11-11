import { useEffect, useRef } from "react";

/** A subtle lime halo follows desktop pointers while leaving the native cursor intact. */
export function LimeCursorGlow() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine) and (hover: hover)").matches) return;
    const cursor = cursorRef.current;
    if (!cursor) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    cursor.dataset.visible = "true";
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "mouse") cursor.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
    };
    const onDown = () => cursor.classList.add("is-pressed");
    const onUp = () => cursor.classList.remove("is-pressed");
    const onLeave = () => { cursor.dataset.visible = "false"; };
    const onEnter = () => { cursor.dataset.visible = "true"; };
    const onMotion = () => cursor.classList.toggle("reduced-motion", reducedMotion.matches);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    reducedMotion.addEventListener("change", onMotion);
    onMotion();
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      reducedMotion.removeEventListener("change", onMotion);
    };
  }, []);

  return <div ref={cursorRef} className="lime-cursor-glow" aria-hidden="true"><span className="lime-cursor-glow__ring" /><span className="lime-cursor-glow__core" /></div>;
}

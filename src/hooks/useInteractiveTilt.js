import { useRef, useEffect } from "react";

/*
 * Hook para adicionar efeito de tilt 3D baseado na posição do mouse.
 * Opções:
 *  maxRotateX, maxRotateY (graus)
 *  scale (fator de escala ao hover)
 *  perspective (px)
 *  transition (string CSS para transition normal)
 */
export default function useInteractiveTilt({
  maxRotateX = 12,
  maxRotateY = 17,
  scale = 1.025,
  perspective = 1100,
  transition = "transform 0.5s cubic-bezier(.22,.99,.34,1)",
} = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = null;
    let entered = false;

    const setTransition = () => {
      el.style.transition = transition;
    };
    const clearTransition = () => {
      el.style.transition = "transform 0.08s ease-out";
    };

    const handleEnter = () => {
      entered = true;
      setTransition();
    };

    const handleMove = (e) => {
      if (!entered) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const normX = (x - cx) / cx; // -1 a 1
      const normY = (y - cy) / cy; // -1 a 1
      const rotY = normX * maxRotateY; // movimenta para direita -> rotY positivo
      const rotX = -normY * maxRotateX; // movimenta para baixo -> rotX negativo

      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.transform = `perspective(${perspective}px) rotateX(${rotX.toFixed(
          2
        )}deg) rotateY(${rotY.toFixed(2)}deg) scale(${scale})`;
      });
    };

    const reset = () => {
      entered = false;
      setTransition();
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale(1)`;
    };

    el.addEventListener("mouseenter", handleEnter);
    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", reset);
    el.addEventListener("focusin", handleEnter);
    el.addEventListener("focusout", reset);

    return () => {
      el.removeEventListener("mouseenter", handleEnter);
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", reset);
      el.removeEventListener("focusin", handleEnter);
      el.removeEventListener("focusout", reset);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [maxRotateX, maxRotateY, scale, perspective, transition]);

  return ref;
}

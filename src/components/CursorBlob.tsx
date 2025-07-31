import { useEffect } from "react";

export default function CursorBlob() {
  useEffect(() => {

    if(document.body.classList.contains('disable-cursor-blob')) return;

    const blob = document.createElement("div");
    blob.className = "cursor-blob";
    document.body.appendChild(blob);

    const moveBlob = (e: MouseEvent) => {
      blob.style.top = `${e.clientY}px`;
      blob.style.left = `${e.clientX}px`;
    };

    window.addEventListener("mousemove", moveBlob);

    return () => {
      window.removeEventListener("mousemove", moveBlob);
      blob.remove();
    };
  }, []);

  return null;
}

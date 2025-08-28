"use client";

import { useEffect, useState } from "react";

export default function CursorBlob() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Run only on client
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024;
      setShouldRender(isLargeScreen);
    };

    // Check on mount
    handleResize();

    // Optional: update on resize (in case screen size changes)
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (
      !shouldRender ||
      document.body.classList.contains("disable-cursor-blob")
    )
      return;

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
  }, [shouldRender]);

  return null;
}

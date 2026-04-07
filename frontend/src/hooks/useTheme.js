import { useEffect, useState } from "react";

export function useTheme() {
  const [tema, setTema] = useState(localStorage.getItem("tema") || "dark");
  useEffect(() => {
    const root = document.documentElement;
    if (tema === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("tema", tema);
  }, [tema]);

  function alternarTema() {
    setTema((t) => (t === "dark" ? "light" : "dark"));
  }

  return { tema, alternarTema };
}

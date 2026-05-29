import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-40 p-3 rounded-full bg-[#01B4E4] text-black shadow-lg shadow-cyan-500/20 hover:scale-105 transition-transform safe-bottom"
    >
      <ArrowUp size={20} />
    </button>
  );
};

export default BackToTop;

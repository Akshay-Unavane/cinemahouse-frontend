import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const percent = (scrollTop / docHeight) * 100;

      setProgress(percent);
      setVisible(scrollTop > 300);
    };

    updateScroll();

    window.addEventListener("scroll", updateScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  const radius = 25;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        visible
          ? "opacity-100 scale-100"
          : "opacity-0 scale-75 pointer-events-none"
      }`}
    >
      <div className="relative w-16 h-16">

        <svg
          className="absolute inset-0 -rotate-90"
          width="64"
          height="64"
        >
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="rgba(255,255,255,.2)"
            strokeWidth="4"
            fill="transparent"
          />

          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="#06B6D4"
            strokeWidth="4"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: "stroke-dashoffset .2s linear",
            }}
          />
        </svg>

        <div
          className="
            absolute
            inset-2
            rounded-full
            bg-gradient-to-r
            from-cyan-500
            to-sky-500
            flex
            items-center
            justify-center
            shadow-xl
            hover:scale-110
            transition
            duration-300
          "
        >
          <ArrowUp size={24} />
        </div>
      </div>
    </button>
  );
};

export default BackToTop;
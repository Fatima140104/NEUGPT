import React, { memo } from "react";
import type { HoverButtonConfig, HoverButtonType } from "../../common/types";
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  Pencil,
  RefreshCw,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const iconMap: Record<HoverButtonType, React.ReactNode> = {
  copy: <Copy size={18} />,
  like: <ThumbsUp size={18} />,
  dislike: <ThumbsDown size={18} />,
  edit: <Pencil size={18} />,
  regenerate: <RefreshCw size={18} />,
  share: <Share2 size={18} />,
};

interface Props {
  buttons: HoverButtonConfig[];
  containerClassName?: string;
}

const HoverButton = memo(
  ({
    type,
    tooltip,
    active,
    onClick,
    disabled = false,
    className = "",
    icon,
  }: HoverButtonConfig) => {
    const [hovered, setHovered] = React.useState(false);
    return (
      <div
        className={`relative group flex items-center justify-center rounded-md p-1 cursor-pointer transition-colors hover:bg-neutral-400 ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={disabled ? undefined : onClick}
        tabIndex={0}
      >
        <span className="relative inline-block w-5 h-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={active ? "active" : "inactive"}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {icon ? icon : iconMap[type]}
            </motion.span>
          </AnimatePresence>
        </span>
        {hovered && (
          <div className="absolute top-9 left-1/2 -translate-x-1/2 z-10 px-2 py-1 bg-neutral-900 text-white text-xs rounded shadow-md whitespace-nowrap flex items-center">
            {tooltip}
          </div>
        )}
      </div>
    );
  }
);
HoverButton.displayName = "HoverButton";

export const HoverButtons: React.FC<Props> = ({
  buttons,
  containerClassName = "",
}) => {
  return (
    <div className={`flex items-center gap-2 ${containerClassName}`}>
      {buttons
        .filter((btn) => btn.isVisible !== false)
        .map((btn, idx) => (
          <HoverButton key={btn.type + idx} {...btn} />
        ))}
    </div>
  );
};

export default memo(HoverButtons);

import { EventCategory } from "@/types/eventCategory";
import { motion, AnimatePresence } from 'motion/react'

interface PlaceCategoryItemProps {
  category: EventCategory;
  selected?: boolean;
  onClick?: () => void;
}

export default function PlaceCategoryItem({ category, selected, onClick }: PlaceCategoryItemProps) {
  const Icon = category.icon;

  return (
    <button
      className={`flex flex-col items-center gap-2 p-3 min-w-max bg-white transition relative border-b-0 border-red-400`}
      onClick={onClick}
    >
      <Icon className={`size-6 stroke-current transition ${selected ? "text-red-400" : "text-gray-500"}`} />
      <span className={`text-base ${selected ? "text-red-400" : "text-gray-500"} break-`}>{category.name}</span>
      {/* Bottom underline */}
      <AnimatePresence>
        {selected && (
          <motion.span
            layoutId="filter-underline"
            className={"absolute left-1 right-1 bottom-0 h-1 rounded-full bg-red-400"}
          />
        )}
      </AnimatePresence>
    </button>
  );
}

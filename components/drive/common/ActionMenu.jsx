"use client";

import { useState } from "react";
import { DotsIcon } from "../icons/Icons";

export default function ActionMenu({ label, items = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={label}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((value) => !value);
        }}
        className=" cursor-pointer p-1 rounded-full hover:bg-gray-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
      >
        <DotsIcon />
      </button>

      {open && (
        <div className="cursor-pointer absolute right-0 top-full mt-1 w-36 rounded-lg border border-gray-100 bg-white py-1 shadow-xl z-40">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                item.onClick?.();
              }}
              className={`w-full px-3 py-2 text-left text-sm cursor-pointer ${
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
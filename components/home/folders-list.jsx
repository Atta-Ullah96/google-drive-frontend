"use client";

import { useState } from "react";

function FolderIcon({ color = "#5f6368", large = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${large ? "w-8 h-8" : "w-5 h-5"} shrink-0`}
      fill={color}
      aria-hidden="true"
    >
      <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function FolderActions({ folder, onDelete, onRename }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Actions for ${folder.name}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((value) => !value);
        }}
        className="p-1 rounded-full hover:bg-gray-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
      >
        <DotsIcon />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-gray-100 bg-white py-1 shadow-xl z-40">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onRename(folder);
            }}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete(folder);
            }}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function FolderSkeleton({ view }) {
  const items = Array.from({ length: view === "grid" ? 6 : 4 });

  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {items.map((_, index) => (
          <div key={index} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {items.map((_, index) => (
        <div key={index} className={`h-12 bg-gray-50 animate-pulse ${index !== 0 ? "border-t border-gray-100" : ""}`} />
      ))}
    </div>
  );
}

export default function FoldersList({
  folders,
  isLoading,
  onDelete,
  onOpen,
  onRename,
  view,
}) {
  return (
    <section className="mb-7">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Folders</h2>

      {isLoading ? (
        <FolderSkeleton view={view} />
      ) : folders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
          <p className="text-sm font-medium text-gray-700">No folders here</p>
          <p className="text-xs text-gray-400 mt-1">Create a folder to organize this space.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {folders.map((folder) => (
            <div
              key={folder.id}
              onClick={() => onOpen(folder)}
              className="group relative flex flex-col items-center gap-2 p-3 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-150 select-none"
            >
              <div className="absolute right-2 top-2">
                <FolderActions folder={folder} onDelete={onDelete} onRename={onRename} />
              </div>
              <FolderIcon color={folder.color} large />
              <p className="text-xs text-gray-800 font-medium text-center truncate w-full group-hover:text-[#1a73e8]">
                {folder.name}
              </p>
              <p className="text-[10px] text-gray-400">{folder.items} items</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {folders.map((folder, index) => (
            <div
              key={folder.id}
              onClick={() => onOpen(folder)}
              className={`group flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                index !== 0 ? "border-t border-gray-100" : ""
              }`}
            >
              <FolderIcon color={folder.color} />
              <span className="flex-1 text-left text-sm text-gray-800 font-medium truncate group-hover:text-[#1a73e8]">
                {folder.name}
              </span>
              <span className="text-xs text-gray-400 hidden sm:block w-28 text-right">{folder.items} items</span>
              <span className="text-xs text-gray-400 hidden md:block w-32 text-right">{folder.modified}</span>
              <FolderActions folder={folder} onDelete={onDelete} onRename={onRename} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

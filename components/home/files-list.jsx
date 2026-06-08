import { useState } from "react";

function FileIcon({ ext }) {
  const map = {
    pdf: { bg: "#fce8e6", color: "#d93025", label: "PDF" },
    doc: { bg: "#e8f0fe", color: "#1a73e8", label: "DOC" },
    docx: { bg: "#e8f0fe", color: "#1a73e8", label: "DOC" },
    xls: { bg: "#e6f4ea", color: "#188038", label: "XLS" },
    xlsx: { bg: "#e6f4ea", color: "#188038", label: "XLS" },
    ppt: { bg: "#fce8e6", color: "#d93025", label: "PPT" },
    pptx: { bg: "#fce8e6", color: "#d93025", label: "PPT" },
    png: { bg: "#e6f4ea", color: "#188038", label: "IMG" },
    jpg: { bg: "#e6f4ea", color: "#188038", label: "IMG" },
    jpeg: { bg: "#e6f4ea", color: "#188038", label: "IMG" },
    mp4: { bg: "#f3e8fd", color: "#7b1fa2", label: "VID" },
    zip: { bg: "#fef7e0", color: "#e37400", label: "ZIP" },
    txt: { bg: "#f1f3f4", color: "#5f6368", label: "TXT" },
  };
  const cfg = map[ext?.toLowerCase()] ?? {
    bg: "#f1f3f4",
    color: "#5f6368",
    label: ext?.toUpperCase()?.slice(0, 3) ?? "FILE",
  };

  return (
    <div className="w-8 h-9 rounded-sm flex items-end justify-start p-1 shrink-0" style={{ backgroundColor: cfg.bg }} aria-hidden="true">
      <span className="text-[9px] font-bold leading-none" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
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

function FileActions({ file, onDelete, onDownload, onRename , onPreview}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Actions for ${file.name}`}
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
              onDownload(file);
            }}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            Download
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onRename(file);
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
              onPreview(file);
            }}
            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-red-50"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(false);
              onDelete(file);
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

function FileSkeleton({ view }) {
  const items = Array.from({ length: view === "grid" ? 8 : 5 });

  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {items.map((_, index) => (
          <div key={index} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {items.map((_, index) => (
        <div key={index} className={`h-14 bg-gray-50 animate-pulse ${index !== 0 ? "border-t border-gray-100" : ""}`} />
      ))}
    </div>
  );
}

export default function FilesList({
  files,
  isLoading,
  onDelete,
  onDownload,
  onRename,
  onPreview,
  selectedItems,
  view,
  onToggleSelect,
}) {
  return (
    <section>
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Files</h2>

      {isLoading ? (
        <FileSkeleton view={view} />
      ) : files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
          <p className="text-sm font-medium text-gray-700">No files here</p>
          <p className="text-xs text-gray-400 mt-1">Upload files or drop them into this space.</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => onToggleSelect(file.id)}
              className={`group flex flex-col gap-2 p-3 rounded-xl border cursor-pointer transition-all duration-150 select-none ${
                selectedItems.includes(file.id)
                  ? "border-[#1a73e8] bg-[#e8f0fe]"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <FileIcon ext={file.ext} />
                <FileActions
                  file={file}
                  onDelete={onDelete}
                  onDownload={onDownload}
                  onRename={onRename}
                  onPreview={onPreview}
                />
              </div>
              <div>
                <p className="text-xs text-gray-800 font-medium truncate">{file.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{file.size}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <div className="w-7" />
            <span className="flex-1">Name</span>
            <span className="hidden sm:block w-24 text-right">Size</span>
            <span className="hidden md:block w-36 text-right">Modified</span>
            <div className="w-6" />
          </div>
          {files.map((file, index) => (
            <div
              key={file.id}
              onClick={() => onToggleSelect(file.id)}
              className={`group flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${
                index !== 0 ? "border-t border-gray-100" : ""
              } ${selectedItems.includes(file.id) ? "bg-[#e8f0fe]" : "hover:bg-gray-50"}`}
            >
              <FileIcon ext={file.ext} />
              <span className="flex-1 text-sm text-gray-800 font-medium truncate">{file.name}</span>
              <span className="text-xs text-gray-400 hidden sm:block w-24 text-right">{file.size}</span>
              <span className="text-xs text-gray-400 hidden md:block w-36 text-right">{file.modified}</span>
              <FileActions
                file={file}
                onDelete={onDelete}
                onDownload={onDownload}
                onRename={onRename}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

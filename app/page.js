"use client";

import { useEffect, useRef, useState } from "react";

// ─── Icon helpers ──────────────────────────────────────────────────────────────

function FolderIcon({ color = "#5f6368" }) {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill={color} aria-hidden="true">
      <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>
  );
}

function FolderLargeIcon({ color = "#5f6368" }) {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8 shrink-0" fill={color} aria-hidden="true">
      <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>
  );
}

function FileIcon({ ext }) {
  const map = {
    pdf:  { bg: "#fce8e6", color: "#d93025", label: "PDF" },
    doc:  { bg: "#e8f0fe", color: "#1a73e8", label: "DOC" },
    docx: { bg: "#e8f0fe", color: "#1a73e8", label: "DOC" },
    xls:  { bg: "#e6f4ea", color: "#188038", label: "XLS" },
    xlsx: { bg: "#e6f4ea", color: "#188038", label: "XLS" },
    ppt:  { bg: "#fce8e6", color: "#d93025", label: "PPT" },
    pptx: { bg: "#fce8e6", color: "#d93025", label: "PPT" },
    png:  { bg: "#e6f4ea", color: "#188038", label: "IMG" },
    jpg:  { bg: "#e6f4ea", color: "#188038", label: "IMG" },
    jpeg: { bg: "#e6f4ea", color: "#188038", label: "IMG" },
    mp4:  { bg: "#f3e8fd", color: "#7b1fa2", label: "VID" },
    zip:  { bg: "#fef7e0", color: "#e37400", label: "ZIP" },
    txt:  { bg: "#f1f3f4", color: "#5f6368", label: "TXT" },
  };
  const cfg = map[ext?.toLowerCase()] ?? { bg: "#f1f3f4", color: "#5f6368", label: ext?.toUpperCase()?.slice(0, 3) ?? "FILE" };
  return (
    <div
      className="w-8 h-9 rounded-sm flex items-end justify-start p-1 shrink-0"
      style={{ backgroundColor: cfg.bg }}
      aria-hidden="true"
    >
      <span className="text-[9px] font-bold leading-none" style={{ color: cfg.color }}>{cfg.label}</span>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function GridViewIcon({ active }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-[#1a73e8]" : "text-gray-500"}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
    </svg>
  );
}

function ListViewIcon({ active }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-[#1a73e8]" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  );
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

const FOLDERS = [
  { id: 1, name: "Documents",  color: "#1a73e8", items: 24, modified: "Jun 2, 2026" },
  { id: 2, name: "Photos",     color: "#188038", items: 138, modified: "Jun 1, 2026" },
  { id: 3, name: "Projects",   color: "#e37400", items: 9,  modified: "May 28, 2026" },
  { id: 4, name: "Work Files", color: "#7b1fa2", items: 31, modified: "May 22, 2026" },
  { id: 5, name: "Personal",   color: "#d93025", items: 17, modified: "May 15, 2026" },
  { id: 6, name: "Archives",   color: "#5f6368", items: 6,  modified: "Apr 30, 2026" },
];

const FILES = [
  { id: 1, name: "Q2 Report.pdf",             ext: "pdf",  size: "2.4 MB",  modified: "Jun 3, 2026",  owner: "me" },
  { id: 2, name: "Project Proposal.docx",     ext: "docx", size: "840 KB",  modified: "Jun 2, 2026",  owner: "me" },
  { id: 3, name: "Budget 2026.xlsx",          ext: "xlsx", size: "1.1 MB",  modified: "Jun 1, 2026",  owner: "me" },
  { id: 4, name: "Team Photo.jpg",            ext: "jpg",  size: "3.6 MB",  modified: "May 29, 2026", owner: "me" },
  { id: 5, name: "Product Demo.mp4",          ext: "mp4",  size: "58 MB",   modified: "May 27, 2026", owner: "me" },
  { id: 6, name: "Meeting Notes.txt",         ext: "txt",  size: "18 KB",   modified: "May 25, 2026", owner: "me" },
  { id: 7, name: "Presentation Deck.pptx",   ext: "pptx", size: "4.2 MB",  modified: "May 20, 2026", owner: "me" },
  { id: 8, name: "Source Code.zip",           ext: "zip",  size: "12 MB",   modified: "May 18, 2026", owner: "me" },
];

const NAV_ITEMS = [
  {
    label: "My Drive", icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    ), active: true,
  },
  {
    label: "Shared with me", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
  },
  {
    label: "Recent", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
  {
    label: "Starred", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
    ),
  },
  {
    label: "Trash", icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
    ),
  },
];

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function Home() {
  const [view, setView] = useState("grid");
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const newMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target)) {
        setNewMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const newEntries = files.map((f) => ({
      id: Date.now() + Math.random(),
      name: f.name,
      ext: f.name.split(".").pop(),
      size: f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
      modified: "Just now",
      owner: "me",
    }));
    setUploadedFiles((prev) => [...newEntries, ...prev]);
    setNewMenuOpen(false);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files ?? []);
    if (!files.length) return;
    const newEntries = files.map((f) => ({
      id: Date.now() + Math.random(),
      name: f.name,
      ext: f.name.split(".").pop(),
      size: f.size > 1048576 ? `${(f.size / 1048576).toFixed(1)} MB` : `${Math.round(f.size / 1024)} KB`,
      modified: "Just now",
      owner: "me",
    }));
    setUploadedFiles((prev) => [...newEntries, ...prev]);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const allFiles = [...uploadedFiles, ...FILES];

  return (
    <div
      className="flex flex-1 bg-white relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* ── Hidden file inputs ── */}
      <input ref={fileInputRef}   type="file"   multiple className="hidden" onChange={handleFileChange} />
      <input ref={folderInputRef} type="file"   multiple className="hidden" onChange={handleFileChange}
        {...{ webkitdirectory: "", directory: "" }} />

      {/* ── Drag overlay ── */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#1a73e8]/10 border-4 border-dashed border-[#1a73e8] flex flex-col items-center justify-center pointer-events-none rounded-none">
          <div className="bg-white rounded-2xl shadow-xl px-10 py-8 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#e8f0fe] flex items-center justify-center">
              <UploadIcon />
            </div>
            <p className="text-lg font-semibold text-gray-800">Drop files to upload</p>
            <p className="text-sm text-gray-500">Files will be added to My Drive</p>
          </div>
        </div>
      )}

      {/* ── Sidebar ── */}
      <aside className="hidden md:flex flex-col w-56 xl:w-64 shrink-0 py-3 border-r border-gray-100 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
        {/* New button */}
        <div className="px-3 mb-4" ref={newMenuRef}>
          <button
            type="button"
            onClick={() => setNewMenuOpen((v) => !v)}
            className="flex items-center gap-3 w-full px-5 py-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-2xl shadow-sm text-sm font-medium text-gray-700 transition-all duration-150"
          >
            <PlusIcon />
            New
            <ChevronDownIcon />
          </button>

          {newMenuOpen && (
            <div className="absolute mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30">
              <button
                type="button"
                onClick={() => { fileInputRef.current?.click(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload file
              </button>
              <button
                type="button"
                onClick={() => { folderInputRef.current?.click(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 11v6m-3-3h6" />
                </svg>
                Upload folder
              </button>
              <div className="h-px bg-gray-100 my-1" />
              <button
                type="button"
                onClick={() => setNewMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                </svg>
                New folder
              </button>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 space-y-0.5">
          {NAV_ITEMS.map(({ label, icon, active }) => (
            <button
              key={label}
              type="button"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
                active
                  ? "bg-[#e8f0fe] text-[#1a73e8]"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className={active ? "text-[#1a73e8]" : "text-gray-500"}>{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Storage bar */}
        <div className="px-4 pt-4 pb-2 border-t border-gray-100 mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Storage</span>
            <span>2.4 / 15 GB</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-[16%] bg-[#1a73e8] rounded-full" />
          </div>
          <button
            type="button"
            className="mt-3 w-full text-xs text-center text-[#1a73e8] hover:underline font-medium"
          >
            Get more storage
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-[15px] font-medium text-gray-800">My Drive</h1>
          <div className="flex items-center gap-1">
            {/* Mobile upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-[#1a73e8] text-white text-sm font-medium rounded-full hover:bg-[#1557b0] transition-colors mr-2"
            >
              <UploadIcon />
              Upload
            </button>
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setView("grid")}
              className={`p-2 rounded-full transition-colors ${view === "grid" ? "bg-[#e8f0fe]" : "hover:bg-gray-100"}`}
            >
              <GridViewIcon active={view === "grid"} />
            </button>
            <button
              type="button"
              aria-label="List view"
              onClick={() => setView("list")}
              className={`p-2 rounded-full transition-colors ${view === "list" ? "bg-[#e8f0fe]" : "hover:bg-gray-100"}`}
            >
              <ListViewIcon active={view === "list"} />
            </button>
          </div>
        </div>

        {/* ── Folders section ── */}
        <section className="mb-7">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Folders</h2>

          {view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {FOLDERS.map((folder) => (
                <div
                  key={folder.id}
                  className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-all duration-150 select-none"
                  onDoubleClick={() => {}}
                >
                  <FolderLargeIcon color={folder.color} />
                  <p className="text-xs text-gray-800 font-medium text-center truncate w-full">{folder.name}</p>
                  <p className="text-[10px] text-gray-400">{folder.items} items</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              {FOLDERS.map((folder, idx) => (
                <div
                  key={folder.id}
                  className={`flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${idx !== 0 ? "border-t border-gray-100" : ""}`}
                >
                  <FolderIcon color={folder.color} />
                  <span className="flex-1 text-sm text-gray-800 font-medium truncate">{folder.name}</span>
                  <span className="text-xs text-gray-400 hidden sm:block w-28 text-right">{folder.items} items</span>
                  <span className="text-xs text-gray-400 hidden md:block w-32 text-right">{folder.modified}</span>
                  <button type="button" className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DotsIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Files section ── */}
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Files</h2>

          {view === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {allFiles.map((file) => (
                <div
                  key={file.id}
                  onClick={() => toggleSelect(file.id)}
                  className={`group flex flex-col gap-2 p-3 rounded-xl border cursor-pointer transition-all duration-150 select-none ${
                    selectedItems.includes(file.id)
                      ? "border-[#1a73e8] bg-[#e8f0fe]"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <FileIcon ext={file.ext} />
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <DotsIcon />
                    </button>
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
              {allFiles.map((file, idx) => (
                <div
                  key={file.id}
                  onClick={() => toggleSelect(file.id)}
                  className={`group flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${
                    idx !== 0 ? "border-t border-gray-100" : ""
                  } ${selectedItems.includes(file.id) ? "bg-[#e8f0fe]" : "hover:bg-gray-50"}`}
                >
                  <FileIcon ext={file.ext} />
                  <span className="flex-1 text-sm text-gray-800 font-medium truncate">{file.name}</span>
                  <span className="text-xs text-gray-400 hidden sm:block w-24 text-right">{file.size}</span>
                  <span className="text-xs text-gray-400 hidden md:block w-36 text-right">{file.modified}</span>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity w-6 flex items-center justify-center"
                  >
                    <DotsIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Empty drop hint at the bottom ── */}
        <div
          className="mt-8 border-2 border-dashed border-gray-200 rounded-2xl py-10 flex flex-col items-center gap-3 text-gray-400 cursor-pointer hover:border-[#1a73e8] hover:bg-[#f8f9ff] transition-colors group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#e8f0fe] flex items-center justify-center transition-colors">
            <UploadIcon />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 group-hover:text-[#1a73e8] transition-colors">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Supports all file types</p>
          </div>
        </div>
      </main>
    </div>
  );
}

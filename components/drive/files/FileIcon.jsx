export default function FileIcon({ ext }) {
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
    <div
      className="w-8 h-9 rounded-sm flex items-end justify-start p-1 shrink-0"
      style={{ backgroundColor: cfg.bg }}
      aria-hidden="true"
    >
      <span className="text-[9px] font-bold leading-none" style={{ color: cfg.color }}>
        {cfg.label}
      </span>
    </div>
  );
}
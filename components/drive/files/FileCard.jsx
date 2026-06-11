import FileIcon from "./FileIcon";
import FileActions from "./FileActions";

export default function FileCard({
  file,
  selected,
  onToggleSelect,
  onDelete,
  onDownload,
  onRename,
  onPreview,
}) {
  return (
    <div
      onClick={() => onToggleSelect(file.id)}
      className={`group flex flex-col gap-2 p-3 rounded-xl border cursor-pointer transition-all duration-150 select-none ${
        selected
          ? "border-[#1a73e8] bg-[#e8f0fe]"
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      <div className="flex items-start justify-between cursor-pointer">
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
  );
}
import FileIcon from "./FileIcon";
import FileActions from "./FileActions";

export default function FileRow({
  file,
  index,
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
      className={`group flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${
        index !== 0 ? "border-t border-gray-100" : ""
      } ${selected ? "bg-[#e8f0fe]" : "hover:bg-gray-50"}`}
    >
      <FileIcon ext={file.ext} />
      <span className="flex-1 text-sm text-gray-800 font-medium truncate">
        {file.name}
      </span>
      <span className="text-xs text-gray-400 hidden sm:block w-24 text-right">
        {file.size}
      </span>
      <span className="text-xs text-gray-400 hidden md:block w-36 text-right">
        {file.modified}
      </span>
      <FileActions
        file={file}
        onDelete={onDelete}
        onDownload={onDownload}
        onRename={onRename}
        onPreview={onPreview}
      />
    </div>
  );
}
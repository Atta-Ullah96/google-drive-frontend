import FolderIcon from "./FolderIcon";
import FolderActions from "./FolderActions";

export default function FolderRow({
  folder,
  index,
  onOpen,
  onDelete,
  onRename,
}) {
  return (
    <div
      onClick={() => onOpen(folder)}
      className={`group flex items-center gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        index !== 0 ? "border-t border-gray-100" : ""
      }`}
    >
      <FolderIcon color={folder.color} />

      <span className="flex-1 text-left text-sm text-gray-800 font-medium truncate group-hover:text-[#1a73e8]">
        {folder.name}
      </span>

      <span className="text-xs text-gray-400 hidden sm:block w-28 text-right">
        {folder.items} items
      </span>

      <span className="text-xs text-gray-400 hidden md:block w-32 text-right">
        {folder.modified}
      </span>

      <FolderActions
        folder={folder}
        onDelete={onDelete}
        onRename={onRename}
      />
    </div>
  );
}
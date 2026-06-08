import FolderIcon from "./FolderIcon";
import FolderActions from "./FolderActions";

export default function FolderCard({ folder, onOpen, onDelete, onRename }) {
  return (
    <div
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
  );
}
import { GridViewIcon, ListViewIcon, UploadIcon } from "./icons/Icons";

export default function DriveToolbar({
  folderPath,
  goToFolderPath,
  view,
  setView,
  onUploadClick,
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-1 min-w-0">
        {folderPath.map((folder, index) => (
          <div
            key={`${folder.id ?? "root"}-${index}`}
            className="flex items-center gap-1 min-w-0"
          >
            {index > 0 && <span className="text-gray-300">/</span>}

            <button
              type="button"
              onClick={() => goToFolderPath(index)}
              className="text-[15px] font-medium text-gray-800 hover:text-[#1a73e8] truncate max-w-40"
            >
              {folder.name}
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onUploadClick}
          className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-[#1a73e8] text-white text-sm font-medium rounded-full hover:bg-[#1557b0] transition-colors mr-2"
        >
          <UploadIcon />
          Upload
        </button>

        <button
          type="button"
          aria-label="Grid view"
          onClick={() => setView("grid")}
          className={`p-2 rounded-full transition-colors ${
            view === "grid" ? "bg-[#e8f0fe]" : "hover:bg-gray-100"
          }`}
        >
          <GridViewIcon active={view === "grid"} />
        </button>

        <button
          type="button"
          aria-label="List view"
          onClick={() => setView("list")}
          className={`p-2 rounded-full transition-colors ${
            view === "list" ? "bg-[#e8f0fe]" : "hover:bg-gray-100"
          }`}
        >
          <ListViewIcon active={view === "list"} />
        </button>
      </div>
    </div>
  );
}
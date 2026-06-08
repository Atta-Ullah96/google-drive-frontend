import {
  PlusIcon,
  ChevronDownIcon,
  UploadIcon,
  FolderAddIcon,
} from "./icons/Icons";

const NAV_ITEMS = [
  { label: "My Drive", active: true },
  { label: "Shared with me" },
  { label: "Recent" },
  { label: "Starred" },
  { label: "Trash" },
];

export default function DriveSidebar({
  newMenuOpen,
  setNewMenuOpen,
  newMenuRef,
  onUploadFile,
  onUploadFolder,
  onCreateFolder,
}) {
  return (
    <aside className="hidden md:flex flex-col w-56 xl:w-64 shrink-0 py-3 border-r border-gray-100 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
      <div className="px-3 mb-4 relative" ref={newMenuRef}>
        <button
          type="button"
          onClick={() => setNewMenuOpen((value) => !value)}
          className="flex items-center gap-3 w-full px-5 py-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-2xl shadow-sm text-sm font-medium text-gray-700 transition-all duration-150"
        >
          <PlusIcon />
          New
          <ChevronDownIcon />
        </button>

        {newMenuOpen && (
          <div className="absolute left-3 right-3 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30">
            <button
              type="button"
              onClick={onUploadFile}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <UploadIcon />
              Upload file
            </button>

            <button
              type="button"
              onClick={onUploadFolder}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FolderAddIcon />
              Upload folder
            </button>

            <div className="h-px bg-gray-100 my-1" />

            <button
              type="button"
              onClick={onCreateFolder}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <FolderAddIcon />
              New folder
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map(({ label, active }) => (
          <button
            key={label}
            type="button"
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
              active
                ? "bg-[#e8f0fe] text-[#1a73e8]"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FolderAddIcon />
            {label}
          </button>
        ))}
      </nav>

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
  );
}
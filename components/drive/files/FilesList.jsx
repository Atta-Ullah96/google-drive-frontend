import FileCard from "./FileCard";
import FileRow from "./FileRow";

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
        <div
          key={index}
          className={`h-14 bg-gray-50 animate-pulse ${
            index !== 0 ? "border-t border-gray-100" : ""
          }`}
        />
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
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Files
      </h2>

      {isLoading ? (
        <FileSkeleton view={view} />
      ) : files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
          <p className="text-sm font-medium text-gray-700">No files here</p>
          <p className="text-xs text-gray-400 mt-1">
            Upload files or drop them into this space.
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              selected={selectedItems.includes(file.id)}
              onToggleSelect={onToggleSelect}
              onDelete={onDelete}
              onDownload={onDownload}
              onRename={onRename}
              onPreview={onPreview}
            />
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
            <FileRow
              key={file.id}
              file={file}
              index={index}
              selected={selectedItems.includes(file.id)}
              onToggleSelect={onToggleSelect}
              onDelete={onDelete}
              onDownload={onDownload}
              onRename={onRename}
              onPreview={onPreview}
            />
          ))}
        </div>
      )}
    </section>
  );
}
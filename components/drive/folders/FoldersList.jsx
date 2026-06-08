import FolderCard from "./FolderCard";
import FolderRow from "./FolderRow";

function FolderSkeleton({ view }) {
  const items = Array.from({ length: view === "grid" ? 6 : 4 });

  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {items.map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {items.map((_, index) => (
        <div
          key={index}
          className={`h-12 bg-gray-50 animate-pulse ${
            index !== 0 ? "border-t border-gray-100" : ""
          }`}
        />
      ))}
    </div>
  );
}

export default function FoldersList({
  folders,
  isLoading,
  onDelete,
  onOpen,
  onRename,
  view,
}) {
  return (
    <section className="mb-7">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Folders
      </h2>

      {isLoading ? (
        <FolderSkeleton view={view} />
      ) : folders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center">
          <p className="text-sm font-medium text-gray-700">No folders here</p>
          <p className="text-xs text-gray-400 mt-1">
            Create a folder to organize this space.
          </p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              onOpen={onOpen}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden">
          {folders.map((folder, index) => (
            <FolderRow
              key={folder.id}
              folder={folder}
              index={index}
              onOpen={onOpen}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}
        </div>
      )}
    </section>
  );
}
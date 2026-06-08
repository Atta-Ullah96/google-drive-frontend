export default function CreateFolderModal({
  open,
  folderName,
  setFolderName,
  onSubmit,
  onClose,
  isLoading,
  error,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100"
      >
        <h2 className="text-lg font-semibold text-gray-900">
          New folder
        </h2>

        <label
          htmlFor="folder-name"
          className="block text-sm font-medium text-gray-700 mt-4 mb-1.5"
        >
          Folder name
        </label>

        <input
          id="folder-name"
          type="text"
          autoFocus
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          placeholder="Untitled folder"
          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
        />

        {error && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#1a73e8] rounded-lg hover:bg-[#1557b0] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
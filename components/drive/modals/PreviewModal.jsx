export default function PreviewModal({
  open,
  file,
  previewUrl,
  isLoading,
  error,
  onClose,
}) {
  if (!open) return null;

  const ext = file?.ext?.toLowerCase();

  const isImage = ["png", "jpg", "jpeg", "webp", "gif"].includes(ext);
  const isVideo = ["mp4", "webm", "ogg"].includes(ext);
  const isPdf = ext === "pdf";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-5xl h-[85vh] rounded-2xl bg-white p-5 shadow-2xl border border-gray-100 flex flex-col">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {file?.name || "Preview file"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm rounded-lg hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
            Loading preview...
          </div>
        ) : error ? (
          <div className="text-sm text-red-600">
            {error}
          </div>
        ) : !previewUrl ? (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
            Preview URL not found.
          </div>
        ) : isImage ? (
          <div className="flex-1 overflow-auto bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
            <img
              src={previewUrl}
              alt={file?.name || "Preview"}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : isVideo ? (
          <div className="flex-1 bg-black rounded-xl overflow-hidden">
            <video
              src={previewUrl}
              controls
              className="w-full h-full"
            />
          </div>
        ) : isPdf ? (
          <iframe
            src={previewUrl}
            title={file?.name || "PDF preview"}
            className="flex-1 w-full rounded-xl border border-gray-200"
          />
        ) : (
          <iframe
            src={previewUrl}
            title={file?.name || "File preview"}
            className="flex-1 w-full rounded-xl border border-gray-200"
          />
        )}
      </div>
    </div>
  );
}
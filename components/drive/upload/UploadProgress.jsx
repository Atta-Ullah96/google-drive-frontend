export default function UploadProgress({ uploadProgress, uploadingCount }) {
  if (!uploadProgress) return null;

  return (
    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate">
          Uploading {uploadProgress.fileName}
          {uploadingCount > 1
            ? ` (${uploadProgress.index}/${uploadProgress.total})`
            : ""}
        </span>

        <span className="shrink-0 font-medium">
          {uploadProgress.percent}%
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
        <div
          className="h-full rounded-full bg-[#1a73e8] transition-all duration-200"
          style={{ width: `${uploadProgress.percent}%` }}
        />
      </div>
    </div>
  );
}
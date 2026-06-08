import { UploadIcon } from "../icons/Icons";

export default function DragOverlay({ isDragging }) {
  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 z-50 bg-[#1a73e8]/10 border-4 border-dashed border-[#1a73e8] flex flex-col items-center justify-center pointer-events-none">
      <div className="bg-white rounded-2xl shadow-xl px-10 py-8 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-[#e8f0fe] flex items-center justify-center">
          <UploadIcon />
        </div>

        <p className="text-lg font-semibold text-gray-800">
          Drop files to upload
        </p>

        <p className="text-sm text-gray-500">
          Files will be added to My Drive
        </p>
      </div>
    </div>
  );
}
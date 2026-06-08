import { UploadIcon } from "../icons/Icons";

export default function DropZone({ onClick }) {
  return (
    <div
      className="mt-8 border-2 border-dashed border-gray-200 rounded-2xl py-10 flex flex-col items-center gap-3 text-gray-400 cursor-pointer hover:border-[#1a73e8] hover:bg-[#f8f9ff] transition-colors group"
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#e8f0fe] flex items-center justify-center transition-colors">
        <UploadIcon />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 group-hover:text-[#1a73e8] transition-colors">
          Drop files here or click to upload
        </p>

        <p className="text-xs text-gray-400 mt-0.5">
          Supports all file types
        </p>
      </div>
    </div>
  );
}
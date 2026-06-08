export default function FolderIcon({ color = "#5f6368", large = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${large ? "w-8 h-8" : "w-5 h-5"} shrink-0`}
      fill={color}
      aria-hidden="true"
    >
      <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>
  );
}
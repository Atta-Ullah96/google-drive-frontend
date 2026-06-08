import ActionMenu from "../common/ActionMenu";

export default function FileActions({
  file,
  onDelete,
  onDownload,
  onRename,
  onPreview,
}) {
  return (
    <ActionMenu
      label={`Actions for ${file.name}`}
      items={[
        { label: "Download", onClick: () => onDownload(file) },
        { label: "Rename", onClick: () => onRename(file) },
        { label: "Preview", onClick: () => onPreview(file) },
        { label: "Delete", danger: true, onClick: () => onDelete(file) },
      ]}
    />
  );
}
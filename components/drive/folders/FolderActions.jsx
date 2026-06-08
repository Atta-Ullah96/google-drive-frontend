import ActionMenu from "../common/ActionMenu";

export default function FolderActions({ folder, onDelete, onRename }) {
  return (
    <ActionMenu
      label={`Actions for ${folder.name}`}
      items={[
        { label: "Rename", onClick: () => onRename(folder) },
        { label: "Delete", danger: true, onClick: () => onDelete(folder) },
      ]}
    />
  );
}
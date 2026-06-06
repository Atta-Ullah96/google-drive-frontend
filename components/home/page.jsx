"use client";

import { useEffect, useRef, useState } from "react";
import {
  createFolder,
  deleteFolder,
  getFolders,
  renameFolder,
} from "@/lib/api/folderapi";
import {
  completeUpload,
  deleteFile,
  downloadFile,
  getFiles,
  requestUpload,
  renameFile,
  uploadToS3,
} from "@/lib/api/file";
import FilesList from "./files-list";
import FoldersList from "./folders-list";

function UploadIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function GridViewIcon({ active }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-[#1a73e8]" : "text-gray-500"}`} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
    </svg>
  );
}

function ListViewIcon({ active }) {
  return (
    <svg className={`w-5 h-5 ${active ? "text-[#1a73e8]" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function FolderAddIcon() {
  return (
    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 11v6m-3-3h6" />
    </svg>
  );
}

const NAV_ITEMS = [
  { label: "My Drive", active: true },
  { label: "Shared with me" },
  { label: "Recent" },
  { label: "Starred" },
  { label: "Trash" },
];

const getReadableFileSize = (size) => {
  return size > 1048576 ? `${(size / 1048576).toFixed(1)} MB` : `${Math.round(size / 1024)} KB`;
};

const getCreatedFolder = (payload) => {
  return payload?.folder || payload?.data?.folder || payload?.data || payload || {};
};

const getFoldersFromResponse = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.folders)) {
    return payload.folders;
  }

  if (Array.isArray(payload?.data?.folders)) {
    return payload.data.folders;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const normalizeFolder = (folder) => {
  const folderCount =
    folder.folderCount ??
    folder.childrenCount ??
    folder.childFolderCount ??
    folder.foldersCount ??
    folder.subFolderCount ??
    0;
  const fileCount = folder.fileCount ?? folder.filesCount ?? 0;
  const itemCount =
    folder.items ??
    folder.itemCount ??
    folder.itemsCount ??
    folder.totalItems ??
    folder.totalCount ??
    folderCount + fileCount;

  return {
    id: folder._id || folder.id,
    name: folder.name || folder.folderName || folder.title || "Untitled folder",
    color: folder.color || "#1a73e8",
    items: itemCount,
    modified: folder.modified || folder.updatedAt || folder.createdAt || "Just now",
    parentId: folder.parentId || folder.parentFolder || folder.parent || null,
  };
};

const hasExplicitItemCount = (folder) => {
  return [
    folder.items,
    folder.itemCount,
    folder.itemsCount,
    folder.totalItems,
    folder.totalCount,
    folder.folderCount,
    folder.childrenCount,
    folder.childFolderCount,
    folder.foldersCount,
    folder.subFolderCount,
    folder.fileCount,
    folder.filesCount,
  ].some((value) => value !== undefined && value !== null);
};

const getFilesFromResponse = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.files)) {
    return payload.files;
  }

  if (Array.isArray(payload?.data?.files)) {
    return payload.data.files;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
};

const getUploadDetails = (payload) => {
  const data = payload?.data || payload;

  return {
    fileId: data?.fileId || data?.file?._id || data?.file?.id || data?._id || data?.id,
    uploadUrl: data?.uploadUrl || data?.url || data?.signedUrl || data?.presignedUrl,
  };
};

const getCompletedFile = (payload) => {
  return payload?.file || payload?.data?.file || payload?.data || payload || {};
};

const normalizeFile = (file) => {
  const fileName = file.name || file.fileName || file.originalName || "Untitled file";
  const fileSize = file.size || file.fileSize || 0;

  return {
    id: file._id || file.id,
    name: fileName,
    ext: file.ext || file.extension || fileName.split(".").pop(),
    size: typeof fileSize === "number" ? getReadableFileSize(fileSize) : fileSize,
    modified: file.modified || file.updatedAt || file.createdAt || "Just now",
    owner: file.owner || "me",
    url: file.url || file.fileUrl || file.publicUrl,
  };
};

export default function HomePage() {
  const [view, setView] = useState("grid");
  const [folders, setFolders] = useState([]);
  const [folderPath, setFolderPath] = useState([{ id: null, name: "My Drive" }]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [folderListError, setFolderListError] = useState("");
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderError, setFolderError] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderAction, setFolderAction] = useState(null);
  const [folderActionName, setFolderActionName] = useState("");
  const [folderActionError, setFolderActionError] = useState("");
  const [isFolderActionLoading, setIsFolderActionLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [fileListError, setFileListError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [fileAction, setFileAction] = useState(null);
  const [fileActionName, setFileActionName] = useState("");
  const [fileActionError, setFileActionError] = useState("");
  const [isFileActionLoading, setIsFileActionLoading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [downloadingFileId, setDownloadingFileId] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const newMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const dragCounter = useRef(0);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target)) {
        setNewMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentFolderId = folderPath[folderPath.length - 1]?.id ?? null;

  useEffect(() => {
    let ignore = false;

    const getFolderItemCount = async (folderId) => {
      const [childFoldersResponse, childFilesResponse] = await Promise.all([
        getFolders(folderId),
        getFiles(folderId),
      ]);
      const childFolders = getFoldersFromResponse(childFoldersResponse);
      const childFiles = getFilesFromResponse(childFilesResponse);

      return childFolders.length + childFiles.length;
    };

    const loadFolders = async () => {
      setIsLoadingFolders(true);
      setFolderListError("");

      try {
        const response = await getFolders(currentFolderId);
        const rawFolders = getFoldersFromResponse(response);
        const loadedFolders = await Promise.all(
          rawFolders.map(async (folder) => {
            const normalizedFolder = normalizeFolder(folder);

            if (!normalizedFolder.id || hasExplicitItemCount(folder)) {
              return normalizedFolder;
            }

            try {
              return {
                ...normalizedFolder,
                items: await getFolderItemCount(normalizedFolder.id),
              };
            } catch {
              return normalizedFolder;
            }
          })
        );

        if (!ignore) {
          setFolders(loadedFolders);
        }
      } catch (error) {
        if (!ignore) {
          setFolderListError(error.message);
          setFolders([]);
        }
      } finally {
        if (!ignore) {
          setIsLoadingFolders(false);
        }
      }
    };

    loadFolders();

    return () => {
      ignore = true;
    };
  }, [currentFolderId]);

  useEffect(() => {
    let ignore = false;

    const loadFiles = async () => {
      setIsLoadingFiles(true);
      setFileListError("");

      try {
        const response = await getFiles(currentFolderId);
        const loadedFiles = getFilesFromResponse(response).map(normalizeFile);

        if (!ignore) {
          setFiles(loadedFiles);
        }
      } catch (error) {
        if (!ignore) {
          setFileListError(error.message);
          setFiles([]);
        }
      } finally {
        if (!ignore) {
          setIsLoadingFiles(false);
        }
      }
    };

    loadFiles();

    return () => {
      ignore = true;
    };
  }, [currentFolderId]);

  const uploadFiles = async (selectedFiles) => {
    setUploadError("");
    setUploadProgress({
      current: 0,
      fileName: selectedFiles[0]?.name || "file",
      index: 1,
      percent: 0,
      total: selectedFiles.length,
    });
    setUploadingCount(selectedFiles.length);

    try {
      const uploadedEntries = [];

      for (const [index, file] of selectedFiles.entries()) {
        setUploadProgress({
          current: 0,
          fileName: file.name,
          index: index + 1,
          percent: 0,
          total: selectedFiles.length,
        });
        const uploadRequest = await requestUpload(file, currentFolderId);
        const { fileId, uploadUrl } = getUploadDetails(uploadRequest);

        if (!fileId || !uploadUrl) {
          throw new Error("Upload request did not return fileId and uploadUrl.");
        }

        await uploadToS3(uploadUrl, file, (percent) => {
          setUploadProgress({
            current: percent,
            fileName: file.name,
            index: index + 1,
            percent,
            total: selectedFiles.length,
          });
        });
        const completedUpload = await completeUpload(fileId);
        const completedFile = getCompletedFile(completedUpload);

        uploadedEntries.push(
          normalizeFile({
            ...completedFile,
            id: completedFile._id || completedFile.id || fileId,
            name: completedFile.name || completedFile.fileName || file.name,
            size: completedFile.size || completedFile.fileSize || file.size,
          })
        );
      }

      setFiles((prev) => [...uploadedEntries, ...prev]);
    } catch (error) {
      setUploadError(error.message || "Unable to upload file.");
    } finally {
      setUploadingCount(0);
      setUploadProgress(null);
    }
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files ?? []);

    if (!files.length) {
      return;
    }

    await uploadFiles(files);
    setNewMenuOpen(false);
    e.target.value = "";
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files ?? []);

    if (files.length) {
      await uploadFiles(files);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    dragCounter.current += 1;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current -= 1;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    const trimmedName = folderName.trim();

    if (!trimmedName) {
      return;
    }

    setFolderError("");
    setIsCreatingFolder(true);

    try {
      const response = await createFolder({
        name: trimmedName,
        folderName: trimmedName,
        parentId: currentFolderId,
        parentFolder: currentFolderId,
        parent: currentFolderId,
      });
      const createdFolder = getCreatedFolder(response);
      const normalizedFolder = normalizeFolder({
        ...createdFolder,
        name: createdFolder.name || createdFolder.folderName || trimmedName,
        parentId: currentFolderId,
      });

      setFolders((prev) => [
        { ...normalizedFolder, id: normalizedFolder.id || Date.now() },
        ...prev,
      ]);
      setFolderName("");
      setCreateFolderOpen(false);
    } catch (error) {
      setFolderError(error.message);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const openFolder = (folder) => {
    setFolderPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSelectedItems([]);
  };

  const goToFolderPath = (index) => {
    setFolderPath((prev) => prev.slice(0, index + 1));
    setSelectedItems([]);
  };

  const openRenameFolder = (folder) => {
    setFolderAction({ type: "rename", folder });
    setFolderActionName(folder.name);
    setFolderActionError("");
  };

  const openDeleteFolder = (folder) => {
    setFolderAction({ type: "delete", folder });
    setFolderActionName("");
    setFolderActionError("");
  };

  const closeFolderAction = () => {
    setFolderAction(null);
    setFolderActionName("");
    setFolderActionError("");
  };

  const handleRenameFolder = async (e) => {
    e.preventDefault();
    const trimmedName = folderActionName.trim();

    if (!folderAction?.folder || !trimmedName) {
      return;
    }

    setFolderActionError("");
    setIsFolderActionLoading(true);

    try {
      const response = await renameFolder(folderAction.folder.id, { name: trimmedName });
      const updatedFolder = normalizeFolder({
        ...folderAction.folder,
        ...getCreatedFolder(response),
        name: getCreatedFolder(response).name || trimmedName,
      });

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderAction.folder.id ? { ...folder, ...updatedFolder } : folder
        )
      );
      closeFolderAction();
    } catch (error) {
      setFolderActionError(error.message);
    } finally {
      setIsFolderActionLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderAction?.folder) {
      return;
    }

    setFolderActionError("");
    setIsFolderActionLoading(true);

    try {
      await deleteFolder(folderAction.folder.id);
      setFolders((prev) => prev.filter((folder) => folder.id !== folderAction.folder.id));
      closeFolderAction();
    } catch (error) {
      setFolderActionError(error.message);
    } finally {
      setIsFolderActionLoading(false);
    }
  };

  const openRenameFile = (file) => {
    setFileAction({ type: "rename", file });
    setFileActionName(file.name);
    setFileActionError("");
  };

  const openDeleteFile = (file) => {
    setFileAction({ type: "delete", file });
    setFileActionName("");
    setFileActionError("");
  };

  const getDownloadFileName = (response, fallbackName) => {
    const disposition = response.headers?.["content-disposition"];
    const match = disposition?.match(/filename="?([^"]+)"?/i);

    return match?.[1] || fallbackName || "download";
  };

  const handleDownloadFile = async (file) => {
    setDownloadError("");
    setDownloadingFileId(file.id);

    try {
      const response = await downloadFile(file.id);
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");

      link.href = url;
      link.download = getDownloadFileName(response, file.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(error.message);
    } finally {
      setDownloadingFileId(null);
    }
  };

  const closeFileAction = () => {
    setFileAction(null);
    setFileActionName("");
    setFileActionError("");
  };

  const handleRenameFile = async (e) => {
    e.preventDefault();
    const trimmedName = fileActionName.trim();

    if (!fileAction?.file || !trimmedName) {
      return;
    }

    setFileActionError("");
    setIsFileActionLoading(true);

    try {
      const response = await renameFile(fileAction.file.id, trimmedName);
      const updatedFile = normalizeFile({
        ...fileAction.file,
        ...getCompletedFile(response),
        name: getCompletedFile(response).name || getCompletedFile(response).fileName || trimmedName,
      });

      setFiles((prev) =>
        prev.map((file) =>
          file.id === fileAction.file.id ? { ...file, ...updatedFile } : file
        )
      );
      closeFileAction();
    } catch (error) {
      setFileActionError(error.message);
    } finally {
      setIsFileActionLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!fileAction?.file) {
      return;
    }

    setFileActionError("");
    setIsFileActionLoading(true);

    try {
      await deleteFile(fileAction.file.id);
      setFiles((prev) => prev.filter((file) => file.id !== fileAction.file.id));
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== fileAction.file.id));
      closeFileAction();
    } catch (error) {
      setFileActionError(error.message);
    } finally {
      setIsFileActionLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  return (
    <div
      className="flex flex-1 bg-white relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        {...{ webkitdirectory: "", directory: "" }}
      />

      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[#1a73e8]/10 border-4 border-dashed border-[#1a73e8] flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-xl px-10 py-8 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#e8f0fe] flex items-center justify-center">
              <UploadIcon />
            </div>
            <p className="text-lg font-semibold text-gray-800">Drop files to upload</p>
            <p className="text-sm text-gray-500">Files will be added to My Drive</p>
          </div>
        </div>
      )}

      {createFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <form
            onSubmit={handleCreateFolder}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-900">New folder</h2>
            <label htmlFor="folder-name" className="block text-sm font-medium text-gray-700 mt-4 mb-1.5">
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
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
              onClick={() => {
                setCreateFolderOpen(false);
                setFolderName("");
                setFolderError("");
              }}
              disabled={isCreatingFolder}
              className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreatingFolder}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1a73e8] rounded-lg hover:bg-[#1557b0] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isCreatingFolder ? "Creating..." : "Create"}
            </button>
          </div>
          {folderError && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {folderError}
            </p>
          )}
        </form>
      </div>
      )}

      {folderAction?.type === "rename" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <form
            onSubmit={handleRenameFolder}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-900">Rename folder</h2>
            <label htmlFor="rename-folder-name" className="block text-sm font-medium text-gray-700 mt-4 mb-1.5">
              Folder name
            </label>
            <input
              id="rename-folder-name"
              type="text"
              autoFocus
              value={folderActionName}
              onChange={(e) => setFolderActionName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
            />
            {folderActionError && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {folderActionError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeFolderAction}
                disabled={isFolderActionLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isFolderActionLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1a73e8] rounded-lg hover:bg-[#1557b0] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isFolderActionLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {folderAction?.type === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Delete folder</h2>
            <p className="mt-3 text-sm text-gray-600">
              Delete &quot;{folderAction.folder.name}&quot;? This action cannot be undone.
            </p>
            {folderActionError && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {folderActionError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeFolderAction}
                disabled={isFolderActionLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFolder}
                disabled={isFolderActionLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isFolderActionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {fileAction?.type === "rename" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <form
            onSubmit={handleRenameFile}
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-900">Rename file</h2>
            <label htmlFor="rename-file-name" className="block text-sm font-medium text-gray-700 mt-4 mb-1.5">
              File name
            </label>
            <input
              id="rename-file-name"
              type="text"
              autoFocus
              value={fileActionName}
              onChange={(e) => setFileActionName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
            />
            {fileActionError && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {fileActionError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeFileAction}
                disabled={isFileActionLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isFileActionLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#1a73e8] rounded-lg hover:bg-[#1557b0] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isFileActionLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {fileAction?.type === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Delete file</h2>
            <p className="mt-3 text-sm text-gray-600">
              Delete &quot;{fileAction.file.name}&quot;? This action cannot be undone.
            </p>
            {fileActionError && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {fileActionError}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeFileAction}
                disabled={isFileActionLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteFile}
                disabled={isFileActionLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isFileActionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <aside className="hidden md:flex flex-col w-56 xl:w-64 shrink-0 py-3 border-r border-gray-100 h-[calc(100vh-64px)] sticky top-16 overflow-y-auto">
        <div className="px-3 mb-4 relative" ref={newMenuRef}>
          <button
            type="button"
            onClick={() => setNewMenuOpen((value) => !value)}
            className="flex items-center gap-3 w-full px-5 py-3 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-2xl shadow-sm text-sm font-medium text-gray-700 transition-all duration-150"
          >
            <PlusIcon />
            New
            <ChevronDownIcon />
          </button>

          {newMenuOpen && (
            <div className="absolute left-3 right-3 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-30">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UploadIcon />
                Upload file
              </button>
              <button
                type="button"
                onClick={() => folderInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FolderAddIcon />
                Upload folder
              </button>
              <div className="h-px bg-gray-100 my-1" />
              <button
                type="button"
                onClick={() => {
                  setNewMenuOpen(false);
                  setCreateFolderOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <FolderAddIcon />
                New folder
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 px-2 space-y-0.5">
          {NAV_ITEMS.map(({ label, active }) => (
            <button
              key={label}
              type="button"
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-colors ${
                active ? "bg-[#e8f0fe] text-[#1a73e8]" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FolderAddIcon />
              {label}
            </button>
          ))}
        </nav>

        <div className="px-4 pt-4 pb-2 border-t border-gray-100 mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Storage</span>
            <span>2.4 / 15 GB</span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full w-[16%] bg-[#1a73e8] rounded-full" />
          </div>
          <button type="button" className="mt-3 w-full text-xs text-center text-[#1a73e8] hover:underline font-medium">
            Get more storage
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-1 min-w-0">
            {folderPath.map((folder, index) => (
              <div key={`${folder.id ?? "root"}-${index}`} className="flex items-center gap-1 min-w-0">
                {index > 0 && <span className="text-gray-300">/</span>}
                <button
                  type="button"
                  onClick={() => goToFolderPath(index)}
                  className="text-[15px] font-medium text-gray-800 hover:text-[#1a73e8] truncate max-w-40"
                >
                  {folder.name}
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-[#1a73e8] text-white text-sm font-medium rounded-full hover:bg-[#1557b0] transition-colors mr-2"
            >
              <UploadIcon />
              Upload
            </button>
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setView("grid")}
              className={`p-2 rounded-full transition-colors ${view === "grid" ? "bg-[#e8f0fe]" : "hover:bg-gray-100"}`}
            >
              <GridViewIcon active={view === "grid"} />
            </button>
            <button
              type="button"
              aria-label="List view"
              onClick={() => setView("list")}
              className={`p-2 rounded-full transition-colors ${view === "list" ? "bg-[#e8f0fe]" : "hover:bg-gray-100"}`}
            >
              <ListViewIcon active={view === "list"} />
            </button>
          </div>
        </div>

        {folderListError && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            {folderListError}
          </div>
        )}

        {fileListError && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
            {fileListError}
          </div>
        )}

        {uploadProgress && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate">
                Uploading {uploadProgress.fileName}
                {uploadingCount > 1 ? ` (${uploadProgress.index}/${uploadProgress.total})` : ""}
              </span>
              <span className="shrink-0 font-medium">{uploadProgress.percent}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-[#1a73e8] transition-all duration-200"
                style={{ width: `${uploadProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {uploadError}
          </div>
        )}

        {downloadError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {downloadError}
          </div>
        )}

        {downloadingFileId && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800">
            Preparing download...
          </div>
        )}

        <FoldersList
          folders={folders}
          isLoading={isLoadingFolders}
          onDelete={openDeleteFolder}
          onOpen={openFolder}
          onRename={openRenameFolder}
          view={view}
        />
        <FilesList
          files={files}
          isLoading={isLoadingFiles}
          onDelete={openDeleteFile}
          onDownload={handleDownloadFile}
          onRename={openRenameFile}
          selectedItems={selectedItems}
          view={view}
          onToggleSelect={toggleSelect}
        />

        <div
          className="mt-8 border-2 border-dashed border-gray-200 rounded-2xl py-10 flex flex-col items-center gap-3 text-gray-400 cursor-pointer hover:border-[#1a73e8] hover:bg-[#f8f9ff] transition-colors group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#e8f0fe] flex items-center justify-center transition-colors">
            <UploadIcon />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 group-hover:text-[#1a73e8] transition-colors">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Supports all file types</p>
          </div>
        </div>
      </main>
    </div>
  );
}

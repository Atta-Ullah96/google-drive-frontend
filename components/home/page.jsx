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
  getPreviewUrl,
  renameFile,
  requestUpload,
  uploadToS3,
} from "@/lib/api/file";

import FilesList from "@/components/drive/files/FilesList";
import FoldersList from "@/components/drive/folders/FoldersList";
import DriveSidebar from "@/components/drive/SideBar";
import DriveToolbar from "@/components/drive/ToolBar";

import ErrorMessage from "@/components/drive/common/ErrorMessage";

import UploadProgress from "@/components/drive/upload/UploadProgress";
import DragOverlay from "@/components/drive/upload/DragOverlay";
import DropZone from "@/components/drive/upload/DropZone";

import CreateFolderModal from "@/components/drive/modals/CreateFolderModal";
import RenameModal from "@/components/drive/modals/RenameModal";
import DeleteConfirmModal from "@/components/drive/modals/DeleteConfirmModal";
import PreviewModal from "@/components/drive/modals/PreviewModal";

import {
  getCompletedFile,
  getFilesFromResponse,
  getPreviewUrlFromResponse,
  getUploadDetails,
  normalizeFile,
} from "@/utils/drive/file";

import {
  getCreatedFolder,
  getFoldersFromResponse,
  hasExplicitItemCount,
  normalizeFolder,
} from "@/utils/drive/folder";

import { getStorageInfo } from "@/lib/api/user";

const DEFAULT_STORAGE_LIMIT = 8 * 1024 * 1024 * 1024;

const DEFAULT_STORAGE = {
  used: 0,
  limit: DEFAULT_STORAGE_LIMIT,
  remaining: DEFAULT_STORAGE_LIMIT,
  percentage: 0,
};

export default function HomePage() {
  const [view, setView] = useState("grid");

  const [folders, setFolders] = useState([]);
  const [folderPath, setFolderPath] = useState([{ id: null, name: "My Drive" }]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [folderListError, setFolderListError] = useState("");

  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [fileListError, setFileListError] = useState("");

  const [newMenuOpen, setNewMenuOpen] = useState(false);

  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderError, setFolderError] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const [folderAction, setFolderAction] = useState(null);
  const [folderActionName, setFolderActionName] = useState("");
  const [folderActionError, setFolderActionError] = useState("");
  const [isFolderActionLoading, setIsFolderActionLoading] = useState(false);

  const [fileAction, setFileAction] = useState(null);
  const [fileActionName, setFileActionName] = useState("");
  const [fileActionError, setFileActionError] = useState("");
  const [isFileActionLoading, setIsFileActionLoading] = useState(false);

  const [previewUrl, setPreviewUrl] = useState("");

  const [uploadError, setUploadError] = useState("");
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(null);

  const [downloadError, setDownloadError] = useState("");
  const [downloadingFileId, setDownloadingFileId] = useState(null);

  const [selectedItems, setSelectedItems] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  const [storage, setStorage] = useState(DEFAULT_STORAGE);

  const newMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const dragCounter = useRef(0);

  const currentFolderId = folderPath[folderPath.length - 1]?.id ?? null;

  const normalizeStorageResponse = (response) => {
    const storageData =
      response?.storage ||
      response?.data?.storage ||
      response?.data?.data?.storage;

    if (!storageData) {
      return DEFAULT_STORAGE;
    }

    const used = Number(storageData.used ?? storageData.storageUsed ?? 0);

    const limit = Number(
      storageData.limit ?? storageData.storageLimit ?? DEFAULT_STORAGE_LIMIT
    );

    const remaining = Math.max(
      Number(storageData.remaining ?? limit - used),
      0
    );

    const percentage =
      storageData.percentage !== undefined
        ? Number(storageData.percentage)
        : limit > 0
          ? Math.min(Number(((used / limit) * 100).toFixed(2)), 100)
          : 0;

    return {
      used,
      limit,
      remaining,
      percentage,
    };
  };

  const reloadStorageInfo = async () => {
    try {
      const response = await getStorageInfo();
      const normalizedStorage = normalizeStorageResponse(response);

      setStorage(normalizedStorage);
    } catch (error) {
      console.error("Unable to load storage info:", error);
    }
  };

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      try {
        const response = await getStorageInfo();
        const normalizedStorage = normalizeStorageResponse(response);

        if (!ignore) {
          setStorage(normalizedStorage);
        }
      } catch (error) {
        console.error("Unable to load storage info:", error);
      }
    };

    load();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target)) {
        setNewMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          setFolderListError(error.message || "Unable to load folders.");
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
          setFileListError(error.message || "Unable to load files.");
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

        await reloadStorageInfo();
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
    const selectedFiles = Array.from(e.target.files ?? []);

    if (!selectedFiles.length) return;

    await uploadFiles(selectedFiles);

    setNewMenuOpen(false);
    e.target.value = "";
  };

  const handleDrop = async (e) => {
    e.preventDefault();

    dragCounter.current = 0;
    setIsDragging(false);

    const selectedFiles = Array.from(e.dataTransfer.files ?? []);

    if (selectedFiles.length) {
      await uploadFiles(selectedFiles);
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

    if (!trimmedName) return;

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
        {
          ...normalizedFolder,
          id: normalizedFolder.id || Date.now(),
        },
        ...prev,
      ]);

      setFolderName("");
      setCreateFolderOpen(false);
    } catch (error) {
      setFolderError(error.message || "Unable to create folder.");
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

    if (!folderAction?.folder || !trimmedName) return;

    setFolderActionError("");
    setIsFolderActionLoading(true);

    try {
      const response = await renameFolder(folderAction.folder.id, {
        name: trimmedName,
      });

      const updatedFolder = normalizeFolder({
        ...folderAction.folder,
        ...getCreatedFolder(response),
        name: getCreatedFolder(response).name || trimmedName,
      });

      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderAction.folder.id
            ? { ...folder, ...updatedFolder }
            : folder
        )
      );

      closeFolderAction();
    } catch (error) {
      setFolderActionError(error.message || "Unable to rename folder.");
    } finally {
      setIsFolderActionLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!folderAction?.folder) return;

    setFolderActionError("");
    setIsFolderActionLoading(true);

    try {
      await deleteFolder(folderAction.folder.id);

      setFolders((prev) =>
        prev.filter((folder) => folder.id !== folderAction.folder.id)
      );

      await reloadStorageInfo();

      closeFolderAction();
    } catch (error) {
      setFolderActionError(error.message || "Unable to delete folder.");
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

  const openPreviewFile = async (file) => {
    setFileAction({ type: "preview", file });
    setPreviewUrl("");
    setFileActionError("");
    setIsFileActionLoading(true);

    try {
      const response = await getPreviewUrl(file.id);
      const url = getPreviewUrlFromResponse(response);

      if (!url) {
        throw new Error("Preview URL not found.");
      }

      setPreviewUrl(url);
    } catch (error) {
      setFileActionError(error.message || "Unable to preview file.");
    } finally {
      setIsFileActionLoading(false);
    }
  };

  const closeFileAction = () => {
    setFileAction(null);
    setFileActionName("");
    setFileActionError("");
    setPreviewUrl("");
  };

  const handleRenameFile = async (e) => {
    e.preventDefault();

    const trimmedName = fileActionName.trim();

    if (!fileAction?.file || !trimmedName) return;

    setFileActionError("");
    setIsFileActionLoading(true);

    try {
      const response = await renameFile(fileAction.file.id, trimmedName);

      const updatedFile = normalizeFile({
        ...fileAction.file,
        ...getCompletedFile(response),
        name:
          getCompletedFile(response).name ||
          getCompletedFile(response).fileName ||
          trimmedName,
      });

      setFiles((prev) =>
        prev.map((file) =>
          file.id === fileAction.file.id
            ? { ...file, ...updatedFile }
            : file
        )
      );

      closeFileAction();
    } catch (error) {
      setFileActionError(error.message || "Unable to rename file.");
    } finally {
      setIsFileActionLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!fileAction?.file) return;

    setFileActionError("");
    setIsFileActionLoading(true);

    try {
      await deleteFile(fileAction.file.id);

      setFiles((prev) =>
        prev.filter((file) => file.id !== fileAction.file.id)
      );

      setSelectedItems((prev) =>
        prev.filter((itemId) => itemId !== fileAction.file.id)
      );

      await reloadStorageInfo();

      closeFileAction();
    } catch (error) {
      setFileActionError(error.message || "Unable to delete file.");
    } finally {
      setIsFileActionLoading(false);
    }
  };

  const handleDownloadFile = async (file) => {
    setDownloadError("");
    setDownloadingFileId(file.id);

    try {
      if (typeof downloadFile === "function") {
        window.location.href = `http://localhost:4000/api/v1/file/${file.id}/download?redirect=true`;
      }
    } catch (error) {
      setDownloadError(error.message || "Unable to download file.");
    } finally {
      setDownloadingFileId(null);
    }
  };

  const toggleSelect = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
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
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        {...{ webkitdirectory: "", directory: "" }}
      />

      <DragOverlay isDragging={isDragging} />

      <CreateFolderModal
        open={createFolderOpen}
        folderName={folderName}
        setFolderName={setFolderName}
        onSubmit={handleCreateFolder}
        onClose={() => {
          setCreateFolderOpen(false);
          setFolderName("");
          setFolderError("");
        }}
        isLoading={isCreatingFolder}
        error={folderError}
      />

      <RenameModal
        open={folderAction?.type === "rename"}
        title="Rename folder"
        label="Folder name"
        value={folderActionName}
        setValue={setFolderActionName}
        onSubmit={handleRenameFolder}
        onClose={closeFolderAction}
        isLoading={isFolderActionLoading}
        error={folderActionError}
      />

      <DeleteConfirmModal
        open={folderAction?.type === "delete"}
        title="Delete folder"
        message={`Delete "${folderAction?.folder?.name}"? This action cannot be undone.`}
        onDelete={handleDeleteFolder}
        onClose={closeFolderAction}
        isLoading={isFolderActionLoading}
        error={folderActionError}
      />

      <RenameModal
        open={fileAction?.type === "rename"}
        title="Rename file"
        label="File name"
        value={fileActionName}
        setValue={setFileActionName}
        onSubmit={handleRenameFile}
        onClose={closeFileAction}
        isLoading={isFileActionLoading}
        error={fileActionError}
      />

      <DeleteConfirmModal
        open={fileAction?.type === "delete"}
        title="Delete file"
        message={`Delete "${fileAction?.file?.name}"? This action cannot be undone.`}
        onDelete={handleDeleteFile}
        onClose={closeFileAction}
        isLoading={isFileActionLoading}
        error={fileActionError}
      />

      <PreviewModal
        open={fileAction?.type === "preview"}
        file={fileAction?.file}
        previewUrl={previewUrl}
        isLoading={isFileActionLoading}
        error={fileActionError}
        onClose={closeFileAction}
      />

      <DriveSidebar
        storage={storage}
        newMenuOpen={newMenuOpen}
        setNewMenuOpen={setNewMenuOpen}
        newMenuRef={newMenuRef}
        onUploadFile={() => fileInputRef.current?.click()}
        onUploadFolder={() => folderInputRef.current?.click()}
        onCreateFolder={() => {
          setNewMenuOpen(false);
          setCreateFolderOpen(true);
        }}
      />

      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
        <DriveToolbar
          folderPath={folderPath}
          goToFolderPath={goToFolderPath}
          view={view}
          setView={setView}
          onUploadClick={() => fileInputRef.current?.click()}
        />

        <ErrorMessage message={folderListError} />
        <ErrorMessage message={fileListError} />
        <ErrorMessage message={uploadError} />
        <ErrorMessage message={downloadError} />

        <UploadProgress
          uploadProgress={uploadProgress}
          uploadingCount={uploadingCount}
        />

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
          onPreview={openPreviewFile}
          selectedItems={selectedItems}
          view={view}
          onToggleSelect={toggleSelect}
        />

        <DropZone onClick={() => fileInputRef.current?.click()} />
      </main>
    </div>
  );
}
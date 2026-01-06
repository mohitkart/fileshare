import { useEffect, useState } from "react";
import {
  FolderIcon,
  DocumentIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { fire } from "@/components/Swal";
import Modal from "@/components/Modal";
import HostQr from "@/components/HostQr";

export default function FileManager() {
  const [currentPath, setCurrentPath] = useState("");
  const [folders, setFolders] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [newFolder, setNewFolder] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [isQr, setIsQr] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    name: string;
    type: "file" | "folder";
  } | null>(null);



  const load = async () => {
    const res = await fetch(`/api/files/list?folder=${currentPath}`);
    const data = await res.json();
    setFolders(data.folders);
    setFiles(data.files);
  };

  useEffect(() => {
    load();
    setSelectedFiles([]);
  }, [currentPath]);

  const createFolder = async () => {
    if (!newFolder.trim()) return;

    await fetch("/api/folders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        folderPath: currentPath,
        folderName: newFolder.trim(),
      }),
    });

    setNewFolder("");
    load();
  };

  const uploadFiles = async (list: FileList | null) => {
    if (!list) return;

    const fd = new FormData();
    Array.from(list).forEach((f) => fd.append("files", f));

    await fetch(`/api/files/upload?folder=${currentPath}`, {
      method: "POST",
      body: fd,
    });

    load();
  };

  const deleteItem = async (name: string) => {
    const targetPath = `${currentPath}/${name}`;
    fire({
      icon: 'warning',
      title: `Do you want to delete '${name}'?`, cancelButtonText: 'No', confirmButtonText: 'Yes', showCancelButton: true
    }).then(async res => {
      if (res.isConfirmed) {
        await fetch("/api/files/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetPath }),
        });

        load();
      }
    })

  };

  const allSelected = files.length == selectedFiles.length


  const getBreadcrumbs = () => {
    const parts = currentPath.split("/").filter(Boolean);
    return parts.map((part, i) => ({
      name: part,
      path: parts.slice(0, i + 1).join("/"),
    }));
  };

  const renameItem = async (name: string) => {
    const newName = prompt("Enter new name", name);
    if (!newName || newName === name) return;

    await fetch("/api/files/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldPath: `${currentPath}/${name}`,
        newName,
      }),
    });

    load();
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">

        {/* Header */}
        <div className="flex gap-2 items-center mb-6">
          <h1 className="text-xl font-semibold">📁 File Manager</h1>
          <input
            type="file"
            multiple
            className="hidden"
            id="fileUpload"
            onChange={(e) => uploadFiles(e.target.files)}
          />

          <button
            className="cursor-pointer ml-auto"
            onClick={() => setIsQr(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
            </svg>

          </button>
          <label
            htmlFor="fileUpload"
            className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
          >
            Upload
          </label>

        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span
            className="cursor-pointer text-blue-600"
            onClick={() => setCurrentPath("")}
          >
            Root
          </span>

          {getBreadcrumbs().map((b) => (
            <span key={b.path}>
              /{" "}
              <span
                className="cursor-pointer text-blue-600"
                onClick={() => setCurrentPath(b.path)}
              >
                {b.name}
              </span>
            </span>
          ))}
        </div>


        {/* Create Folder */}
        <form className="flex gap-2 mb-4"
          onSubmit={e => {
            e.preventDefault();
            createFolder()
          }}
        >
          <input
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            placeholder="New folder"
            className="border rounded px-3 py-1 w-full max-w-60 "
          />
          <button
            className="bg-green-600 text-white px-3 py-1 rounded cursor-pointer"
          >
            Create
          </button>
        </form>

        <div className="flex gap-3 flex-wrap items-center mb-4">
          {selectedFiles.length > 0 && (
            <>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded"
                onClick={async () => {

                  const ares = await fire({
                    icon: 'warning',
                    title: `Do you want to download selected files?`, cancelButtonText: 'No', confirmButtonText: 'Yes', showCancelButton: true
                  })

                  if (!ares.isConfirmed) return

                  const res = await fetch("/api/files/download-zip", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      files: selectedFiles,
                      currentPath,
                    }),
                  });

                  const blob = await res.blob();
                  const url = window.URL.createObjectURL(blob);

                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "selected-files.zip";
                  a.click();

                  window.URL.revokeObjectURL(url);
                  setSelectedFiles([]);
                }}
              >
                Download Selected ({selectedFiles.length})
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={async () => {
                  const ares = await fire({
                    icon: 'warning',
                    title: `Delete ${selectedFiles.length} selected file(s)?`, cancelButtonText: 'No', confirmButtonText: 'Yes', showCancelButton: true
                  })

                  if (!ares.isConfirmed) return

                  for (const file of selectedFiles) {
                    await fetch("/api/files/delete", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        targetPath: `${currentPath}/${file}`,
                      }),
                    });
                  }

                  setSelectedFiles([]);
                  load();
                }}
              >
                Delete Selected ({selectedFiles.length})
              </button>
            </>
          )}


          {files.length ? <>
            <button
              onClick={() => setSelectedFiles(allSelected ? [] : files)}
              className="text-sm text-blue-600"
            >
              {allSelected ? 'Deselect' : 'Select'} All
            </button>
          </> : <></>}
        </div>



        {/* Grid */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            uploadFiles(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded p-4 ${dragging ? "border-blue-500 bg-blue-50" : "border-transparent"
            }`}
        >

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((f) => (
              <div
                key={f}
                className="group p-3 border rounded hover:bg-gray-50 cursor-pointer relative"
                onDoubleClick={() =>
                  setCurrentPath(`${currentPath}/${f}`)
                }
              >
                <FolderIcon className="w-10 h-10 text-yellow-500" />
                <p className="truncate">{f}</p>
                <TrashIcon
                  className="w-5 h-5 text-red-500 absolute top-2 right-2 sm:block md:hidden group-hover:block"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(f);
                  }}
                />
                <button
                  className="text-xs text-blue-600 cursor-pointer"
                  onClick={() => renameItem(f)}
                >
                  Rename
                </button>

              </div>
            ))}

            {files.map((f) => (
              <div
                key={f}
                onDoubleClick={() => {
                  setSelectedFiles((prev) =>
                    !selectedFiles.includes(f) ? [...prev, f]
                      : prev.filter((x) => x !== f)
                  );
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({
                    x: e.pageX,
                    y: e.pageY,
                    name: f,
                    type: "file",
                  });
                }}
                className={`group p-3 border rounded relative ${selectedFiles.includes(f) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    className="h-[20px] w-[20px]"
                    checked={selectedFiles.includes(f)}
                    onChange={() => {
                      setSelectedFiles((prev) =>
                        !selectedFiles.includes(f) ? [...prev, f]
                          : prev.filter((x) => x !== f)
                      );
                    }}
                  />

                  <div>
                    <DocumentIcon className="w-8 h-8 text-blue-500" />
                    <p className="w-full block">{f}</p>
                  </div>
                </div>

                <div className="flex justify-between mt-2">
                  <a
                    href={`/storage/${currentPath}/${f}`}
                    onClick={e => e.stopPropagation()}
                    download
                    className="text-blue-600 text-sm"
                  >
                    Download
                  </a>

                  <TrashIcon
                    className="w-5 h-5 text-red-500 hidden group-hover:block"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(f)
                    }}
                  />
                  <button
                    className="text-xs text-blue-600 cursor-pointer"
                    onClick={() => renameItem(f)}
                  >
                    Rename
                  </button>

                </div>
              </div>
            ))}

          </div>

        </div>
      </div>


      {contextMenu && (
        <div
          className="fixed bg-white border shadow rounded z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button
            className="flex justify-end w-full text-left"
            onClick={() => {
              setContextMenu(null);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 cursor-pointer text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            onClick={() => {
              renameItem(contextMenu.name);
              setContextMenu(null);
            }}
          >
            Rename
          </button>

          <button
            className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
            onClick={() => {
              deleteItem(contextMenu.name);
              setContextMenu(null);
            }}
          >
            Delete
          </button>

        </div>
      )}

      {isQr ? <>
        <Modal
          title="QR"
          result={() => setIsQr(false)}
          body={<>
            <HostQr />
          </>}
        />
      </> : <></>}
    </div>
  );
}

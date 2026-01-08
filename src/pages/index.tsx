/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import HostQr from "@/components/HostQr";
import FilesList, { FilesListRef } from "@/components/FilesList";

export default function Main() {
  const randomValue='mk_start';
  const [currentPath, setCurrentPath] = useState(randomValue);
  const [newFolder, setNewFolder] = useState("");
  const [isQr, setIsQr] = useState(false);
  const [uploading, setUploading] = useState(false);
  const childRef = useRef<FilesListRef>(null);


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
    childRef.current?.loadData()
  };

  useEffect(()=>{
    const v=localStorage.getItem('currentPath')||''
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPath(v)
  },[])

  useEffect(()=>{
    if(currentPath!=randomValue) localStorage.setItem('currentPath',currentPath)
  },[currentPath])

  const uploadFiles = async (list: FileList | null) => {
    if (uploading) return
    if (!list) return;
    const fd = new FormData();
    Array.from(list).forEach((f) => fd.append("files", f));
    setUploading(true)
    await fetch(`/api/files/upload?folder=${currentPath}`, {
      method: "POST",
      body: fd,
    });
    setUploading(false)
    childRef?.current?.loadData()
  };


  const getBreadcrumbs = () => {
    const parts = currentPath.split("/").filter(Boolean);
    return parts.map((part, i) => ({
      name: part,
      path: `/${parts.slice(0, i + 1).join("/")}`,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-4">

        {/* Header */}
        <div className="flex gap-2 items-center mb-6">
          <h1 className="text-xl font-semibold">📁 File Manager</h1>
          <input
            type="file"
            multiple
            className="hidden"
            id="fileUpload"
            onChange={(e) => {
              uploadFiles(e.target.files)
              e.target.value=""
            }}
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
            {uploading ? 'Uploading...' : 'Upload'}
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


        {currentPath != 'mk_start' ? <>
          <FilesList
            currentPath={currentPath}
            setCurrentPath={setCurrentPath}
            uploadFiles={uploadFiles}
            ref={childRef}
          />
        </> : <></>}


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
    </div>
  );
}

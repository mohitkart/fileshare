/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { memo, useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/components/Modal";
import HostQr from "@/components/HostQr";
import FilesList, { FilesListRef } from "@/components/FilesList";
import { indexedDBStorage } from "../../utills/indexedDBStorage";
import { formatFileSize, parseJson } from "@/utils/shared";
import io from "socket.io-client";
import Virtualization from "@/components/Virtualization";
import VideoHtml from "@/components/VideoHtml";

const LocalFileItem = memo(function a({ uploadFile, item, index, isUploaded, isUploding }: { uploadFile: (files: any[]) => void, item: any, index: number, isUploaded: boolean, isUploding: boolean }) {
  return <div className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 shadow-sm hover:shadow-md transition">
    <div className="flex flex-wrap items-start gap-3 md:gap-4">
      {/* <!-- Thumbnail icon --> */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center shadow-sm">
        {/* <i className="fa-regular fa-image text-indigo-400 text-xl"></i> */}
        {item.file.type.includes('image/') ? <img
          src={URL.createObjectURL(item.file)}
          className="w-12 h-12 rounded-xl object-cover"
        /> : <></>}

        {item.file.type.includes('video/') ? <>
          <VideoHtml
            src={URL.createObjectURL(item.file)}
            controls={false}
            className="w-12 h-12 rounded-xl"
          />
        </> : <></>}

      </div>
      {/* <!-- File info --> */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm md:text-base font-semibold text-gray-800 truncate">#{index + 1}. {item.name}</h3>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
              <span><i className="fa-regular fa-hard-drive"></i> {formatFileSize(item.file.size)}</span>
              <span><i className="fa-regular fa-image"></i> {item.file.type}</span>
              <span className={`${isUploaded ? 'text-emerald-600' : 'text-yellow-600'}`}><i className="fa-regular fa-check-circle"></i> {isUploaded ? 'Completed' : 'Pending'}</span>
              {!isUploaded && !isUploding ? <>
                <span
                  className="text-blue-500 cursor-pointer"
                  onClick={() => uploadFile([item.file])}>Upload File</span>
              </> : <></>}
            </div>
          </div>
          {/* <!-- Uploaded status badge --> */}
          {isUploding ? <>
            <div className="flex-shrink-0 w-full sm:w-48">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">
                  <i className="fa-solid fa-spinner fa-pulse"></i> Uploading
                </span>
                <span className="text-xs font-mono text-gray-500">{item.uploadingPer}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div style={{
                  width:`${item.uploadingPer}%`
                }} className="bg-gradient-to-r from-amber-400 to-orange-500 h-1.5 rounded-full static-progress-45"></div>
              </div>
            </div>
          </> : <>
            <div className="flex-shrink-0">
              <span className={`inline-flex items-center gap-1.5
                      ${isUploaded ? 'bg-emerald-50 text-emerald-700' : 'bg-yellow-50 text-yellow-700'} text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm`}>
                <i className="fa-regular fa-circle-check text-emerald-500"></i> {isUploaded ? 'Uploaded' : 'Pending'}
              </span>
            </div>
          </>}

        </div>
      </div>
    </div>
  </div>
})

const UploadingFiles = memo(function UploadingFiles({ uploadFile, currentPath, uploadedId, uploadingId, controlRef }: { currentPath: string, controlRef: any, uploadedId: any, uploadingId: any, uploadFile: (files: any[]) => void }) {
  const [localFiles, setLocalFiles] = useState<any[]>([])

  const getFiles = async (path = currentPath) => {
    const files = await indexedDBStorage.getStore('files', { folder: path })
    setLocalFiles(files)
    return files
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getFiles()
    if (controlRef) {
      controlRef.current = {
        load: async () => await getFiles(currentPath),
      }
    }
  }, [currentPath])

  const list = useMemo(() => {
    return localFiles.map(itm => {
      const isUploding=uploadingId?.[itm.id] ? true : false
      return {
        ...itm,
        isUploding: isUploding,
        uploadingPer:uploadingId?.[itm.id]?.percent||0,
        isUploaded: uploadedId?.[itm.id] ? true : false,
      }
    })
      .filter(itm => !itm.isUploaded)
  }, [localFiles, uploadedId, uploadingId])

  return <>
    <div className="p-5 md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <i className="fa-regular fa-rectangle-list"></i>
          <span>Current uploads : {list.length}</span>
        </div>
        <span
          onClick={() => uploadFile(list.map(itm => itm.file))}
          className="text-xs text-blue-500 cursor-pointer bg-gray-50 px-2 py-1 rounded-full">
          Upload All
        </span>
      </div>

      {/* <!-- FILE LIST - static representation (image + video, both statuses) --> */}
      <div className="space-y-4 overflow-auto max-h-[380px]">
        {/* <!-- 1. Uploaded Image Item --> */}

        <Virtualization
          count={5}
          list={list}
          RenderComponent={({ item, index }: { item: any, index: number }) => {
            return <LocalFileItem
              isUploaded={item.isUploaded}
              isUploding={item.isUploding}
              uploadFile={uploadFile}
              item={item}
              index={index}
            />
          }}
        />
      </div>
    </div>
  </>
})


export default function Main() {
  const randomValue = 'mk_start';
  const v = localStorage.getItem('currentPath') || ''
  const [currentPath, setCurrentPath] = useState(v || randomValue);
  const [newFolder, setNewFolder] = useState("");
  const [isQr, setIsQr] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingId, setUploadingId] = useState({});
  const [uploadedId, setUploadedId] = useState<any>({});
  const [failedId, setFailedId] = useState<any>({});
  const childRef = useRef<FilesListRef>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const controlRef = useRef<any>(null);
  const socketRef = useRef<any>(null);
  const maxUpload = 1


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

  useEffect(() => {
    if (currentPath != randomValue) localStorage.setItem('currentPath', currentPath)
  }, [currentPath])

  const upload = async (files: any, from: 'storage' | 'file' = 'file') => {
    const uploadList = []
    for (const file of files) {
      const filename = `${currentPath}/${file.name}`.replaceAll(' ', '_').toLowerCase()
      const payload = {
        id: filename,
        file: file,
        name: file.name,
        folder: currentPath
      }
      uploadList.push({ id: filename, file })
      if (from == 'file') await indexedDBStorage.put(payload, 'files')
    }
    controlRef.current?.load()
    console.log("uploadList", uploadList)

    const uploadChunk = async (files: any[], onProgress: (per: number) => void) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `/api/files/upload?folder=${currentPath}`);
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        }
        // xhr.setRequestHeader()

        xhr.onload = async () => {
          console.log("Upload complete");
          const res = await xhr.response
          resolve(parseJson(res))
        };

        xhr.onerror = async () => {
          const res = await xhr.response
          resolve(parseJson(res))
        }

        const fd = new FormData();
        for (const item of files) {
          fd.append("files", item.file as any)
        }
        xhr.send(fd);
      })
    }

    const pageLength = Math.ceil(uploadList.length / maxUpload);
    for (let currentPage = 1; currentPage <= pageLength; currentPage++) {
      const skip = (currentPage - 1) * maxUpload
      const end = maxUpload * currentPage
      const currentList = uploadList.slice(skip, end)
      const uploading: any = currentList.reduce((acc: any, itm) => {
        acc[itm.id] = true
        return acc
      }, {})
      setUploadingId(uploading)
       
      const onprogress=(per:number)=>{
         const uploadingPer: any = currentList.reduce((acc: any, itm) => {
        acc[itm.id] = {percent:per}
        return acc
      }, {})
        setUploadingId(prev=>({
          ...prev,
          ...uploadingPer
        }))
      }
      const res:any = await uploadChunk(currentList,onprogress)

      if (res.success) {
        setUploadedId((prev: any) => ({
          ...prev,
          ...uploading
        }))
        currentList.map(item => {
          indexedDBStorage.removeItem(item.id, 'files')
        })
        socketRef.current.emit('upload_file', {
          path: currentPath,
          files: res.files
        })
      } else {
        setFailedId((prev: any) => ({
          ...prev,
          ...uploading,
          error: res.message
        }))
        console.log("failed", uploading)
      }
    }
    setUploadingId({})
    // setFailedId({})
    return {
      success: true,
      data: uploadList
    }
  }

  const uploadFiles = async (list: FileList | null, from: 'storage' | 'file' = 'file') => {
    if (uploading) return
    if (!list) return;
    setUploading(true)
    const res = await upload(list, from)
    setUploading(false)
    childRef?.current?.loadData()
    return res
  };


  const getBreadcrumbs = () => {
    const parts = currentPath.split("/").filter(Boolean);
    return parts.map((part, i) => ({
      name: part,
      path: `/${parts.slice(0, i + 1).join("/")}`,
    }));
  };

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_API);
    if (inputFileRef.current) {
      inputFileRef.current.setAttribute("webkitdirectory", 'true');
      inputFileRef.current.setAttribute("directory", 'true');
    }
    return () => {
      socketRef.current?.disconnect()
    };
  }, []);


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
            onChange={async (e) => {
              await uploadFiles(e.target.files)
              e.target.value = ""
            }}
          />
          <input
            type="file"
            multiple
            ref={inputFileRef}
            className="hidden"
            id="folderUpload"
            onChange={async (e) => {
              await uploadFiles(e.target.files)
              // e.target.value = ""
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
          <label
            htmlFor="folderUpload"
            className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
          >
            {uploading ? 'Uploading...' : 'Upload Folder'}
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

        <div className="text-red-500">{failedId?.error}</div>

        <UploadingFiles uploadFile={(e: any) => uploadFiles(e, 'storage')} currentPath={currentPath} controlRef={controlRef} uploadingId={uploadingId} uploadedId={uploadedId} />

        {currentPath != 'mk_start' ? <>
          <FilesList
            currentPath={currentPath}
            setCurrentPath={setCurrentPath}
            uploadFiles={uploadFiles}
            ref={childRef}
            socketRef={socketRef}
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

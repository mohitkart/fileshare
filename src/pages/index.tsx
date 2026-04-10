/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import HostQr from "@/components/HostQr";
import FilesList, { FilesListRef } from "@/components/FilesList";
import { indexedDBStorage } from "../../utills/indexedDBStorage";
import { formatFileSize } from "@/utils/shared";


function UploadingFiles({ currentPath, uploadedId, uploadingId, controlRef }: { currentPath: string, controlRef: any, uploadedId: any, uploadingId: any }) {
  const [localFiles, setLocalFiles] = useState<any[]>([])

  const getFiles = async (path=currentPath) => {
    console.log("getFiles")
    const files = await indexedDBStorage.getStore('files', { folder: path })
    console.log("files", files)
    console.log("currentPath", path)
    setLocalFiles(files)
    return files
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getFiles()
     if (controlRef) {
      controlRef.current = {
        load: async ()=>await getFiles(currentPath),
      }
    }
  }, [currentPath])

  return <>
    <div className="p-5 md:p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <i className="fa-regular fa-rectangle-list"></i>
          <span>Current uploads</span>
        </div>
        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
          <i className="fa-regular fa-clock"></i> live status ready
        </span>
      </div>

      {/* <!-- FILE LIST - static representation (image + video, both statuses) --> */}
      <div className="space-y-4 overflow-auto max-h-[380px]">
        {/* <!-- 1. Uploaded Image Item --> */}
        {localFiles.map(item => {
          const isUploaded = uploadedId?.[item.id] ? true : false
          const isUploding = uploadingId?.[item.id] ? true : false
          return <div key={item.id} className="bg-white rounded-xl border border-gray-100 p-3 md:p-4 shadow-sm hover:shadow-md transition">
            <div className="flex flex-wrap items-start gap-3 md:gap-4">
              {/* <!-- Thumbnail icon --> */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center shadow-sm">
                {/* <i className="fa-regular fa-image text-indigo-400 text-xl"></i> */}
                {item.file.type.includes('image/') ? <img
                  src={URL.createObjectURL(item.file)}
                  className="w-12 h-12 rounded-xl object-cover"
                /> : <></>}
              </div>
              {/* <!-- File info --> */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-gray-800 truncate">{item.name}</h3>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                      <span><i className="fa-regular fa-hard-drive"></i> {formatFileSize(item.file.size)}</span>
                      <span><i className="fa-regular fa-image"></i> {item.file.type}</span>
                      <span className={`${isUploaded ? 'text-emerald-600' : 'text-yellow-600'}`}><i className="fa-regular fa-check-circle"></i> {isUploaded ? 'Completed' : 'Pending'}</span>
                    </div>
                  </div>
                  {/* <!-- Uploaded status badge --> */}
                  {isUploding ? <>
                    <div className="flex-shrink-0 w-full sm:w-48">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2 py-1 rounded-full">
                          <i className="fa-solid fa-spinner fa-pulse"></i> Uploading
                        </span>
                        <span className="text-xs font-mono text-gray-500">45%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-1.5 rounded-full static-progress-45"></div>
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
        })}
      </div>
    </div>
  </>
}


export default function Main() {
  const randomValue = 'mk_start';
  const [currentPath, setCurrentPath] = useState(randomValue);
  const [newFolder, setNewFolder] = useState("");
  const [isQr, setIsQr] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingId, setUploadingId] = useState({});
  const [uploadedId, setUploadedId] = useState<any>({});
  const [failedId, setFailedId] = useState<any>({});
  const childRef = useRef<FilesListRef>(null);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const controlRef = useRef<any>(null);

  const maxUpload=5


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
    const v = localStorage.getItem('currentPath') || ''
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPath(v)
  }, [])

  useEffect(() => {
    if (currentPath != randomValue) localStorage.setItem('currentPath', currentPath)
  }, [currentPath])

  const upload = async (files: any) => {
    const uploadList=[]
    for (const file of files) {
      const filename = `${currentPath}/${file.name}`.replaceAll(' ', '_').toLowerCase()
      const payload = {
        id: filename,
        file: file,
        name: file.name,
        folder: currentPath
      }
      uploadList.push({id:filename,file})
      await indexedDBStorage.put(payload, 'files')
    }
    controlRef.current?.load()
    console.log("uploadList",uploadList)

    const uploadChunk = async (files: any[]) => {
      const fd = new FormData();
      for (const item of files) {
        // append file in formData
        fd.append("files", item.file as any)
      }
      const res = await fetch(`/api/files/upload?folder=${currentPath}`, {
        method: "POST",
        body: fd,
      })
      const resValue = await res.json()
      return resValue
    }

    const pageLength=Math.ceil(uploadList.length / maxUpload);
    console.log("pageLength",pageLength)
    for (let currentPage = 1; currentPage <= pageLength; currentPage++) {
      const skip = (currentPage - 1) * maxUpload
      const end = maxUpload * currentPage
      const currentList = uploadList.slice(skip, end)
      console.log("currentList",currentList)
      const uploading:any=currentList.reduce((acc:any,itm)=>{
        acc[itm.id]=true
        return acc
      },{})
      setUploadingId(uploading)
      console.log("uploading",uploading)
      const res=await uploadChunk(currentList)
      if(res.success){
        setUploadedId((prev:any)=>({
          ...prev,
          ...uploading
        }))
        currentList.map(item=>{
          indexedDBStorage.removeItem(item.id,'files')
        })
        console.log("uploaded",uploading)
      }else{
        setFailedId((prev:any)=>({
          ...prev,
          ...uploading
        }))
        console.log("failed",uploading)
      }
    }

    return {
      success:true,
      data:uploadList
    }
  }

  const uploadFiles = async (list: FileList | null) => {
    if (uploading) return
    if (!list) return;
    setUploading(true)
    const res = await upload(list)
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
    if (inputFileRef.current) {
      inputFileRef.current.setAttribute("webkitdirectory", 'true');
      inputFileRef.current.setAttribute("directory", 'true');
    }
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
            onChange={(e) => {
              uploadFiles(e.target.files)
              e.target.value = ""
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

        <UploadingFiles currentPath={currentPath} controlRef={controlRef} uploadingId={uploadingId} uploadedId={uploadedId} />

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

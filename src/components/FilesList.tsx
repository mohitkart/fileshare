/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { fire } from "./Swal";
import { FolderIcon, TrashIcon } from "@heroicons/react/24/outline";
import FileIcon from "./FileIcon";
import Modal from "./Modal";
import { isImage, isVideo } from "@/utils/shared";
import VideoHtml from "./VideoHtml";

type Props = {
    currentPath: string, uploadFiles: (e: any) => void, setCurrentPath: (e: string) => void
};

export type FilesListRef = {
    loadData: () => void;
};

// eslint-disable-next-line react/display-name
const FilesList = forwardRef<FilesListRef, Props>(
    ({ currentPath,
        uploadFiles = (e) => { },
        setCurrentPath = (e) => { } }, ref) => {
        const [folders, setFolders] = useState<string[]>([]);
        const [files, setFiles] = useState<string[]>([]);
        const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
        const [dragging, setDragging] = useState(false);
        const [fileLoading, setFileLoading] = useState(false);
        const [viewModal, setViewModal] = useState('');
        const [contextMenu, setContextMenu] = useState<{
            x: number;
            y: number;
            name: string;
            type: "file" | "folder";
        } | null>(null);

        const load = async () => {
            setFileLoading(true)
            const res = await fetch(`/api/files/list?folder=${currentPath}`);
            const data = await res.json();
            setFolders(data.folders);
            setFiles(data.files);
            setFileLoading(false)
        }

        useImperativeHandle(ref, () => ({
            loadData() {
                load()
            },
        }));


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


        useEffect(() => {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            load();
            setSelectedFiles([]);
            localStorage.setItem('currentPath', currentPath)
        }, [currentPath]);


        const allSelected = files.length == selectedFiles.length
        return <>
            <div className="flex gap-2 flex-wrap items-center sticky top-0 z-9 py-2 bg-white">
                {selectedFiles.length > 0 && (
                    <>
                        <button
                            className="px-2 py-2 bg-indigo-600 text-white rounded flex gap-1 items-center cursor-pointer"
                            onClick={async () => {

                                const ares = await fire({
                                    icon: 'warning',
                                    title: `Do you want to download ${selectedFiles.length} selected file(s)?`, cancelButtonText: 'No', confirmButtonText: 'Yes', showCancelButton: true
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
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg> ({selectedFiles.length})
                        </button>
                        <button
                            className="px-2 py-2 bg-red-600 text-white rounded flex gap-1 items-center cursor-pointer"
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
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            ({selectedFiles.length})
                        </button>
                    </>
                )}


                {files.length ? <>
                    <button
                        onClick={() => setSelectedFiles(allSelected ? [] : files)}
                        className="text-sm text-blue-600 cursor-pointer"
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
                className={`border-2 border-dashed rounded ${dragging ? "border-blue-500 bg-blue-50 p-2" : "border-transparent p-0"
                    }`}
            >

                {fileLoading ? <>
                    <div className="p-3 text-center">Loading...</div>
                </> : <>
                    {files.length ? <div className="mb-3">Total Files : {files.length}</div> : <></>}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {folders.map((f) => (
                            <div
                                key={f}
                                className="group p-3 border border-gray-300 rounded hover:bg-gray-50 cursor-pointer relative"
                                onDoubleClick={() =>
                                    setCurrentPath(`${currentPath}/${f}`)
                                }
                                onTouchStart={() => {
                                    setCurrentPath(`${currentPath}/${f}`)
                                }}
                            >
                                <FolderIcon className="size-[50px] text-yellow-500" />
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
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        renameItem(f)
                                    }}
                                >
                                    Rename
                                </button>
                            </div>
                        ))}

                        {files.map((f) => (
                            <div
                                key={f}
                                onDoubleClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setViewModal(f)
                                }}
                                onClick={() => {
                                    setSelectedFiles((prev) =>
                                        !selectedFiles.includes(f) ? [...prev, f]
                                            : prev.filter((x) => x !== f)
                                    );
                                }}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    setContextMenu({
                                        x: e.clientX,
                                        y: e.clientY,
                                        name: f,
                                        type: "file",
                                    });
                                }}
                                className={`group p-3 border border-gray-300 rounded relative ${selectedFiles.includes(f) ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
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
                                        <FileIcon className="w-8 h-8 text-blue-500"
                                            fileName={f}
                                            path={`/storage/${currentPath}/${f}`}
                                        />
                                        <p className="break-all">{f}</p>

                                    </div>
                                </div>

                                <div className="flex justify-between mt-2">
                                    <a
                                        href={`/storage/${currentPath}/${f}`}
                                        onClick={e => e.stopPropagation()}
                                        download
                                        className="text-blue-600 text-sm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                        </svg>

                                    </a>

                                    <TrashIcon
                                        className="w-5 h-5 text-red-500 hidden group-hover:block cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteItem(f)
                                        }}
                                    />
                                    <button
                                        className="text-xs text-blue-600 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            renameItem(f)
                                        }}
                                    >
                                        Rename
                                    </button>
                                    <button
                                        className="text-xs text-blue-600 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setViewModal(f)
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>

                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>}
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
                    <button
                        className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                        onClick={() => {
                            setViewModal(contextMenu.name);
                            setContextMenu(null);
                        }}
                    >
                        View
                    </button>

                </div>
            )}

            {viewModal ? <>
                <Modal
                    result={() => setViewModal('')}
                    className="max-w-[900px]"
                    body={<>
                        {isImage(viewModal) ? <div>
                            <img
                                alt={viewModal}
                                src={`/storage/${currentPath}/${viewModal}`}
                                className="w-full max-h-[calc(100dvh-20px)] object-contain"
                            />
                        </div> : isVideo(viewModal) ? <div>
                            <VideoHtml
                                src={`/storage/${currentPath}/${viewModal}`}
                                className="w-full max-h-[calc(100dvh-20px)] object-contain"
                            />
                        </div> : <div>
                            <FileIcon />
                        </div>
                        }
                    </>}
                />
            </> : <></>}
        </>
    })

export default FilesList
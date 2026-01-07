// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isVideo = (fileName: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ext: any = fileName.split(".").pop()?.toLowerCase() || "";

    return (ext == 'mp4') ? true : false
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isImage = (fileName: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ext: any = fileName.split(".").pop()?.toLowerCase() || "";

    return (ext == 'jpg' || ext == 'png') ? true : false
}
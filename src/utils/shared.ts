// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isVideo = (fileName: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ext: any = fileName.split(".").pop()?.toLowerCase() || "";

    return (ext == 'mp4'||ext == 'mov') ? true : false
}

export function formatFileSize(bytes:number) {
  const kb = bytes / 1024;
  const mb = kb / 1024;

  if (mb < 1) {
    return `${kb.toFixed(2)} KB`;
  } else {
    return `${mb.toFixed(2)} MB`;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isImage = (fileName: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ext: any = fileName.split(".").pop()?.toLowerCase() || "";

    return (ext == 'jpg' || ext == 'png') ? true : false
}
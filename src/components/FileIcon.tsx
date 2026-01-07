import { isImage, isVideo } from "@/utils/shared";
import VideoHtml from "./VideoHtml";

export default function FileIcon({
    className = "size-6",
    fileName = '',
    path = ''
}) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ext: any = fileName.split(".").pop()?.toLowerCase() || "";
    // const ext: any = "";
    return <>
        {isImage(fileName) ? <img
            src={`${path}`}
            alt={fileName}
            className="w-full h-[200px] object-contain"

        /> : isVideo(fileName) ? <div
            className="relative"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="
            size-[30px]
            absolute
            top-[calc(50%-15px)]
            left-[calc(50%-15px)]
            text-white
            bg-red-500 rounded
            flex items-center justify-center p-2
            ">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>

            <VideoHtml
                src={path}
                controls={false}
                className="w-full h-[130px]"
            />
        </div>
            : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${className} text-gray-600`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
            </svg>
        }
    </>
}
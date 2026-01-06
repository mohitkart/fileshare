// simpleSwal.tsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

export type FireProps = {
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  icon?: "success" | "error" | "warning" | "info" | "question" | string;
  showCancelButton?: boolean;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  allowOutsideClick?: boolean;
  imageUrl?:string;
  imageHeight?:number;
  width?: string;
};

const defaultProps: Partial<FireProps> = {
  showCancelButton: false,
  confirmButtonText: "Ok",
  cancelButtonText: "Cancel",
  confirmButtonColor: "#5b0002",
  allowOutsideClick: true,
  width: "28rem",
  imageHeight:120
};

const createIcon = (icon?: string) => {
  switch (icon) {
    case "warning":
      return (
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mx-auto">
          <svg
            className="w-8 h-8 text-yellow-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
      );
      case "success":
      return (
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto">
          <svg
            className="w-8 h-8 text-green-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      );
       case "error":
      return (
         <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mx-auto">
          <svg
            className="w-8 h-8 text-red-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
      );
       case "error":
      return (
         <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mx-auto">
          <svg
            className="w-8 h-8 text-blue-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
      );
    // add other icons like success, error, etc if you need
    default:
      return icon ? <div className="text-4xl text-center">{icon}</div> : null;
  }
};

const Modal: React.FC<
  FireProps & {
    onClose: (res: { isConfirmed: boolean; isDismissed: boolean }) => void;
  }
> = ({ onClose, ...props }) => {
  const cfg = { ...defaultProps, ...props };

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && cfg.allowOutsideClick) {
          onClose({ isConfirmed: false, isDismissed: true });
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-lg border border-gray-100 transform transition-all duration-200 p-6 text-center"
        style={{ width: cfg.width }}
      >
        {cfg.icon && createIcon(cfg.icon)}

        {cfg.imageUrl?<>
        <div className="text-center">
          <img alt="Swal Image" width="auto" src={cfg.imageUrl} height={cfg.imageHeight} />
        </div>
        </>:<></>}
        <div className="mt-4">
          {typeof cfg.title === "string" ? (
            <h3 className="text-lg font-semibold text-gray-900">{cfg.title}</h3>
          ) : (
            cfg.title
          )}
          {typeof cfg.description === "string" ? (
            <div className="text-sm text-gray-600 mt-2" dangerouslySetInnerHTML={{__html:cfg.description}}></div>
          ) : (
            cfg.description
          )}
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          {cfg.showCancelButton && (
            <button
              onClick={() =>
                onClose({ isConfirmed: false, isDismissed: true })
              }
              className="px-4 py-2 rounded-md text-sm font-medium border border-gray-200 text-gray-700"
            >
              {cfg.cancelButtonText}
            </button>
          )}
          <button
            onClick={() => onClose({ isConfirmed: true, isDismissed: false })}
            style={{ backgroundColor: cfg.confirmButtonColor }}
            className="px-4 py-2 rounded-md text-sm font-medium text-white shadow-sm"
          >
            {cfg.confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * fire(props) -> promise-based popup (like SweetAlert2)
 */
export function fire(props: FireProps) {
  return new Promise<{ isConfirmed: boolean; isDismissed: boolean }>(
    (resolve) => {
      const div = document.createElement("div");
      document.body.appendChild(div);
      const root = ReactDOM.createRoot(div);

      const handleClose = (res: {
        isConfirmed: boolean;
        isDismissed: boolean;
      }) => {
        root.unmount();
        div.remove();
        resolve(res);
      };

      root.render(<Modal {...props} onClose={handleClose} />);
    }
  );
}

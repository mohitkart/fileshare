import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const HostQr = () => {
  const [url, setUrl] = useState("");

  useEffect(() => {
    fetch("/api/host-ip")
      .then(res => res.json())
      .then(data => {
        const port = window.location.port || "3000";
        setUrl(`http://${data.ip}:${port}`);
      });
  }, []);

  if (!url) return <p>Loading QR...</p>;

  return (
    <div className="flex flex-col items-center gap-3">
      <QRCodeCanvas value={url} size={180} />
      <p className="text-sm text-gray-600 break-all">{url}</p>
      <p className="text-xs text-gray-500">
        Scan from mobile (same Wi-Fi)
      </p>
    </div>
  );
};

export default HostQr;

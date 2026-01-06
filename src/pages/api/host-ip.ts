import type { NextApiRequest, NextApiResponse } from "next";
import os from "os";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const interfaces = os.networkInterfaces();
  let ip = "localhost";

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        ip = net.address;
        break;
      }
    }
  }

  res.json({ ip });
}

import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { folderPath, folderName } = req.body;

  const fullPath = path.join(
    process.cwd(),
    "public/storage",
    folderPath,
    folderName
  );

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  res.json({ success: true });
}

import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { oldPath, newName } = req.body;

  const baseDir = path.join(process.cwd(), "public/storage");
  const oldFullPath = path.join(baseDir, oldPath);
  const newFullPath = path.join(
    path.dirname(oldFullPath),
    newName
  );

  if (!oldFullPath.startsWith(baseDir)) {
    return res.status(403).end();
  }

  fs.renameSync(oldFullPath, newFullPath);

  res.json({ success: true });
}

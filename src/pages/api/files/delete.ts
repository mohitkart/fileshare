import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).end();
  }

  const { targetPath } = req.body;

  if (!targetPath) {
    return res.status(400).json({ error: "Path required" });
  }

  const fullPath = path.join(
    process.cwd(),
    "public/storage",
    targetPath
  );

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: "Not found" });
  }

  const stat = fs.statSync(fullPath);

  if (stat.isDirectory()) {
    fs.rmSync(fullPath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(fullPath);
  }

  res.json({ success: true });
}

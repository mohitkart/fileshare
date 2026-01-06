import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { folder = "" } = req.query;

  const dirPath = path.join(
    process.cwd(),
    "public/storage",
    folder as string
  );

  if (!fs.existsSync(dirPath)) {
    return res.json({ folders: [], files: [] });
  }

  const items = fs.readdirSync(dirPath, { withFileTypes: true });

  const folders = items
    .filter((i) => i.isDirectory())
    .map((i) => i.name);

  const files = items
    .filter((i) => i.isFile())
    .map((i) => i.name);

  res.json({ folders, files });
}

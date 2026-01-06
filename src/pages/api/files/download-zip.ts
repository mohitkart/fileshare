import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import archiver from "archiver";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { files, currentPath } = req.body as {
    files: string[];
    currentPath: string;
  };

  if (!files || !files.length) {
    return res.status(400).json({ error: "No files selected" });
  }

  res.setHeader("Content-Type", "application/zip");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=files.zip`
  );

  const archive = archiver("zip", { zlib: { level: 9 } });
  archive.pipe(res);

  for (const file of files) {
    const filePath = path.join(
      process.cwd(),
      "public/storage",
      currentPath,
      file
    );

    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: file });
    }
  }

  await archive.finalize();
}

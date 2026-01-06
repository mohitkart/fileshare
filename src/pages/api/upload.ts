import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), "public/uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    multiples: true,
    filename: (_, __, part) => {
      return `${Date.now()}-${part.originalFilename}`;
    },
  });

  form.parse(req, (err, _, files) => {
    if (err) {
      return res.status(500).json({ error: "Upload failed" });
    }

    const uploadedFiles = files.files as File[] | File;

    const fileArray = Array.isArray(uploadedFiles)
      ? uploadedFiles
      : [uploadedFiles];

    const urls = fileArray.map((file) => {
      const fileName = path.basename(file.filepath);
      return `/uploads/${fileName}`;
    });

    res.status(200).json({
      success: true,
      files: urls,
    });
  });
}

import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: false }
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { folder = "" } = req.query;

  try {
    const uploadDir = path.join(
      process.cwd(),
      "public/storage",
      folder as string
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileSize=2 * 1024 * 1024 * 1024 // 2 GB

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      multiples: true,
      maxFileSize:fileSize,
      maxTotalFileSize:fileSize,
      filename: (name,ext, part) => {
        return `${part.originalFilename}`.replaceAll(' ', '_').toLowerCase().replaceAll('%','percent');
        // return `${Date.now()}-${part.originalFilename}`.replaceAll(' ', '_');
      },
    });

    form.parse(req, (err, _, files) => {
      if (err) return res.status(500).json({
      success: false,
      message: err?.message||err
    })

      const uploaded = files.files as File[] | File;
      const fileArray = Array.isArray(uploaded) ? uploaded : [uploaded];

      const result = fileArray.map((file) => ({
        name: path.basename(file.filepath),
        url: `/storage/${folder}/${path.basename(file.filepath)}`.replaceAll('//','/'),
      }));

      res.json({ files: result, success: true });
    });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message||error
    })
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { File } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: { bodyParser: false },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { folder = "" } = req.query;

  const uploadDir = path.join(
    process.cwd(),
    "public/storage",
    folder as string
  );

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    multiples: true,
      filename: (_, __, part) => {
      return `${Date.now()}-${part.originalFilename}`.replaceAll(' ','_');
    },
  });

  form.parse(req, (err, _, files) => {
    if (err) return res.status(500).end();

    const uploaded = files.files as File[] | File;
    const fileArray = Array.isArray(uploaded) ? uploaded : [uploaded];

    const result = fileArray.map((file) => ({
      name: path.basename(file.filepath),
      url: `/storage/${folder}/${path.basename(file.filepath)}`,
    }));

    res.json({ files: result });
  });
}

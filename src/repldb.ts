import { Router, Request } from 'express';
import fs from 'fs/promises';
import type { PathLike } from "fs";
import bodyParser from 'body-parser';

import toml from '@iarna/toml';
import ini from 'ini';

function defaultParse(data: string, fileType: "json" | "toml" | "ini"): { [key: string]: string | number | boolean } {
  if (fileType == "json") {
    return JSON.parse(data)
  } else if (fileType == "toml") {
    return Object.fromEntries(Object.entries(toml.parse(data))) as { [key: string]: string | number | boolean }
  } else if (fileType == "ini") {
    return ini.parse(data)
  } else {
    throw new Error("unknown fileType type: must be either \"json\", \"toml\" or \"ini\"")
  }
}

function defaultStringify(data: { [key: string]: string | number | boolean }, fileType: "json" | "toml" | "ini"): string {
  if (fileType == "json") {
    return JSON.stringify(data)
  } else if (fileType == "toml") {
    return toml.stringify(data)
  } else if (fileType == "ini") {
    return ini.stringify(data)
  } else {
    throw new Error("unknown fileType type: must be either \"json\", \"toml\" or \"ini\"")
  }
}

export type KVOptions = {
  file: PathLike,
  fileType: "json" | "toml" | "ini",
  parse?: (data: string, fileType: "json" | "toml" | "ini") => { [key: string]: string | number | boolean },
  stringify?: (data: { [key: string]: string | number | boolean }, fileType: "json" | "toml" | "ini") => string
} | {
  file: PathLike,
  fileType: "custom",
  parse: (data: string, fileType: "custom") => { [key: string]: string | number | boolean },
  stringify: (data: { [key: string]: string | number | boolean }, fileType: "custom") => string
}

export async function express({
  file = "database.json",
  fileType = "json",
  parse,
  stringify
}: KVOptions) {
  parse = parse || defaultParse
  stringify = stringify || defaultStringify
  
  const app = Router()

  fileType = fileType.toLowerCase() as "json" | "toml" | "ini" | "custom"
  
  try {
    await fs.readFile(file, 'utf-8')
  } catch (err) {
    console.log(err)
    // @ts-ignore weird error?
    await fs.writeFile(file, stringify({}, fileType))
  }

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded())
  app.get('/', async (req: Request<unknown, unknown, unknown, { prefix: string }>, res) => {
    // @ts-ignore weird error?    
    const db = parse(await fs.readFile(file, 'utf-8'), fileType)
  
    res.send(
      Object.keys(db).filter(key => key.startsWith(req.query.prefix)).join('\n')
    )
  });
  app.post('/', async (req, res) => {
    // @ts-ignore weird error?
    const db = parse(await fs.readFile(file, 'utf-8'), fileType)
  
    for (const key in req.body) {
      db[key] = req.body[key]
    }
    // @ts-ignore weird error?
    await fs.writeFile(file, stringify(db, fileType))
  
    res.send("")
  })
  app.get('/:key', async (req, res) => {
    // @ts-ignore weird error?
    const db = parse(await fs.readFile(file, 'utf-8'), fileType)
  
    res.send(db[req.params.key] || "")
  })
  app.delete('/:key', async (req, res) => {
    // @ts-ignore weird error?
    const db = parse(await fs.readFile(file, 'utf-8'), fileType)
  
    delete db[req.params.key]

    // @ts-ignore weird error?
    await fs.writeFile(file, stringify(db, fileType))
  
    res.send("")
  })

  return app
}
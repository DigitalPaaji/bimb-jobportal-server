import fs from "fs"
import path from "path"
export const removeImage =async (filepath:string)=>{
const imgpathfull = path.join(process.cwd(),filepath)

  await fs.promises.unlink(imgpathfull)

}
import { promises as fs } from "fs";
import path from "path";

const logFilePath = path.resolve(process.cwd(), "logs", "sitefinity-fetch.log");

async function ensureLogDir(): Promise<void> {
  await fs.mkdir(path.dirname(logFilePath), { recursive: true });
}

export async function writeLog(line: string): Promise<void> {
  await ensureLogDir();
  const timestamp = new Date().toISOString();
  await fs.appendFile(logFilePath, `[${timestamp}] ${line}\n`, { encoding: "utf8" });
}

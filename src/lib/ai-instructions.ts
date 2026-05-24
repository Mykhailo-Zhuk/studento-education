import { readFile } from "fs/promises";
import path from "path";

const INSTRUCTIONS_ROOT = path.join(process.cwd(), "instructions");

async function readInstruction(...segments: string[]): Promise<string> {
  const filePath = path.join(INSTRUCTIONS_ROOT, ...segments);
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return "";
  }
}

export async function loadAdminInstructions(): Promise<{
  crudOperations: string;
  homeworkGenerator: string;
  reactHomeworkGenerator: string;
  youtubeVideoDescription: string;
}> {
  const [crudOperations, homeworkGenerator, reactHomeworkGenerator, youtubeVideoDescription] =
    await Promise.all([
      readInstruction("admin", "crud-operations.md"),
      readInstruction("admin", "homework-generator-prompt.md"),
      readInstruction("admin", "react-homework-generator-prompt.md"),
      readInstruction("admin", "youtube-video-description-prompt.md"),
    ]);

  return { crudOperations, homeworkGenerator, reactHomeworkGenerator, youtubeVideoDescription };
}

export async function loadStudentInstructions(): Promise<string> {
  return readInstruction("student", "student-ai-instructions.md");
}

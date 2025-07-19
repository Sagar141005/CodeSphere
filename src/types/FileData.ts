export type FileType = "file" | "folder";

export interface FileData {
  id: string;
  name: string;
  type: FileType;
  content?: string;
  parentId?: string | null;
}

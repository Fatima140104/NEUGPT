import type { ExtendedFile, TFile } from "@/common/types";
import { cn } from "@/lib/utils";
import { getFileType } from "@/utils/files";
import FilePreview from "@/components/Chat/Files/FilePreview";
import RemoveFile from "@/components/Chat/Files/RemoveFile";

const FileContainer = ({
  file,
  overrideType,
  buttonClassName,
  containerClassName,
  onDelete,
  onClick,
}: {
  file: Partial<ExtendedFile | TFile>;
  overrideType?: string;
  buttonClassName?: string;
  containerClassName?: string;
  onDelete?: () => void;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}) => {
  const fileType = getFileType(overrideType ?? file.mimetype);
  const source = file.source || "local";
  let url = file.filepath || "";
  // Path to the file on the server
  // (file.filepath: 'uploads/<userid>/<file_name>.ext')
  if (source === "local") {
    url = file.filepath?.startsWith("/api/uploads")
      ? file.filepath.replace("/api/uploads", "")
      : `/api${file.filepath}`;
  }
  return (
    <div
      className={cn(
        "group relative inline-block text-sm text-text-primary w-full",
        containerClassName
      )}
    >
      <a
        href={url}
        download={file.filename}
        className={"cursor-pointer"}
        title={`Download ${file.filename}`}
      >
        <button
          type="button"
          onClick={onClick}
          aria-label={file.filename}
          className={cn(
            "relative overflow-hidden rounded-2xl border border-border-light bg-surface-hover-alt",
            buttonClassName
          )}
        >
          <div className="w-56 p-1.5">
            <div className="flex flex-row items-start gap-2">
              <FilePreview
                file={file}
                fileType={fileType}
                className="relative"
              />
              <div className="overflow-hidden flex flex-col items-start">
                <div className="truncate font-medium" title={file.filename}>
                  {file.filename}
                </div>
                <div
                  className="truncate text-text-secondary"
                  title={fileType.title}
                >
                  {fileType.title}
                </div>
              </div>
            </div>
          </div>
        </button>
      </a>
      {onDelete && <RemoveFile onRemove={onDelete} />}
    </div>
  );
};

export default FileContainer;

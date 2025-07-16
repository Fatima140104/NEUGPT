import { memo } from "react";
import useFileHandling from "@/hooks/File/useFileHandling";
import FileRow from "@/components/Chat/Files/FileRow";
import { useChatForm } from "@/providers/ChatFormContext";

function FileFormChat() {
  const { files, setFiles, setFilesLoading } = useChatForm();
  const { abortUpload } = useFileHandling();

  return (
    <>
      <FileRow
        files={files}
        setFiles={setFiles}
        abortUpload={abortUpload}
        setFilesLoading={setFilesLoading}
        Wrapper={({ children }: { children: React.ReactNode }) => (
          <div className="mx-2 mt-2 flex flex-wrap gap-2">{children}</div>
        )}
      />
    </>
  );
}

export default memo(FileFormChat);

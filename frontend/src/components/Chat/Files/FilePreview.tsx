import type { ExtendedFile, TFile } from "@/common/types";
import FileIcon from "@/components/svg/FileIcon";
import Spinner from "@/components/svg/Spinner";
// import SourceIcon from "./SourceIcon";
import { cn } from "@/lib/utils";

const FilePreview = ({
  file,
  fileType,
  className = "",
}: {
  file?: Partial<ExtendedFile | TFile>;
  fileType: {
    paths: React.FC;
    fill: string;
    title: string;
  };
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative size-10 shrink-0 overflow-hidden rounded-xl",
        className
      )}
    >
      <FileIcon file={file} fileType={fileType} />
      {/* <SourceIcon
        source={file?.source}
        isCodeFile={!!file?.["metadata"]?.fileIdentifier}
      /> */}
      {typeof (file as ExtendedFile)?.progress === "number" &&
        (file as ExtendedFile)?.progress < 1 && (
          <Spinner
            bgOpacity={0.2}
            color="white"
            className="absolute inset-0 m-2.5 flex items-center justify-center"
          />
        )}
    </div>
  );
};

export default FilePreview;

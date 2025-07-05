import { FileSources } from "@/common/types";
import ImagePreview from "@/components/Chat/Files/ImagePreview";
import RemoveFile from "@/components/Chat/Files/RemoveFile";

const Image = ({
  imageBase64,
  url,
  onDelete,
  progress = 1,
  source = FileSources.local,
}: {
  imageBase64?: string;
  url?: string;
  onDelete: () => void;
  progress: number; // between 0 and 1
  source?: FileSources;
}) => {
  return (
    <div className="group relative inline-block text-sm text-black/70 dark:text-white/90">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-600">
        <ImagePreview
          source={source}
          imageBase64={imageBase64}
          url={url}
          progress={progress}
        />
      </div>
      <RemoveFile onRemove={onDelete} />
    </div>
  );
};

export default Image;

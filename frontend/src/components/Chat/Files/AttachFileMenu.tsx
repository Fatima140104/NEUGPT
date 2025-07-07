import React, { useRef, useState, useMemo } from "react";
import * as Ariakit from "@ariakit/react";
import { ImageUpIcon, Paperclip } from "lucide-react";
import type { EndpointFileConfig } from "@/common/types";
import FileUpload from "@/components/ui/file-upload";
import { EToolResources } from "@/common/types";
import useFileHandling from "@/hooks/File/useFileHandling";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface AttachFileMenuProps {
  disabled?: boolean | null;
  endpointFileConfig?: EndpointFileConfig;
}

const AttachFileMenu = ({
  disabled,
  endpointFileConfig,
}: AttachFileMenuProps) => {
  const isUploadDisabled = disabled ?? false;
  const inputRef = useRef<HTMLInputElement>(null);

  const [toolResource, setToolResource] = useState<
    EToolResources | undefined
  >();
  const { handleFileChange } = useFileHandling({
    overrideEndpointFileConfig: endpointFileConfig,
  });

  const handleUploadClick = (isImage?: boolean) => {
    console.log("handleUploadClick", isImage);
    if (!inputRef.current) {
      return;
    }
    inputRef.current.value = "";
    inputRef.current.accept = isImage === true ? "image/*" : "";
    inputRef.current.click();
    inputRef.current.accept = "";
  };

  const dropdownItems = useMemo(() => {
    const items = [
      {
        label: "Upload Files",
        onClick: () => {
          setToolResource(undefined);
          // Accept most common file type
          handleUploadClick();
        },
        icon: <ImageUpIcon className="icon-md" />,
      },
    ];

    return items;
  }, [setToolResource]);
  const menu = Ariakit.useMenuStore();

  return (
    <FileUpload
      ref={inputRef}
      handleFileChange={(e) => {
        handleFileChange(e, toolResource);
      }}
    >
      <DropdownMenu>
        <Tooltip>
          <DropdownMenuTrigger asChild>
            <Ariakit.MenuButton
              store={menu}
              disabled={isUploadDisabled}
              id="attach-file-menu-button"
              aria-label="Attach File Options"
              className={cn(
                "flex size-9 items-center justify-center rounded-full p-1 transition-colors hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              )}
            >
              <div className="flex w-full items-center justify-center gap-2">
                <Paperclip className="h-5 w-5" />
              </div>
            </Ariakit.MenuButton>
          </DropdownMenuTrigger>
          <TooltipContent>Attach files</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end">
          {dropdownItems.map((item, idx) => (
            <DropdownMenuItem key={idx} onClick={item.onClick}>
              {item.icon}
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </FileUpload>
  );
};

export default React.memo(AttachFileMenu);

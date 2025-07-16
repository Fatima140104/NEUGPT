import { memo } from "react";
import AttachFileMenu from "@/components/Chat/Files/AttachFileMenu";

function AttachFileChat({ disableInputs }: { disableInputs: boolean }) {
  const isUploadDisabled = disableInputs;

  if (!isUploadDisabled) {
    return <AttachFileMenu disabled={disableInputs} />;
  }

  return null;
}

export default memo(AttachFileChat);

// import { TMessage } from "librechat-data-provider";
// import Files from "./Files";

const Container = ({
  children,
}: //   message,
{
  children: React.ReactNode;
  //   message?: TMessage;
}) => (
  <div
    className="markdown prose text-message flex min-h-[20px] flex-col items-start break-words"
    dir="auto"
  >
    {/* {message?.isCreatedByUser === true && <Files message={message} />} */}
    {children}
  </div>
);

export default Container;

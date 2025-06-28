import React, { useEffect, useRef, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Share2, Archive, Trash2, MoreVertical } from "lucide-react";
import { useChatSession } from "@/providers/ChatSessionContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  selectedTitle: string;
  sessionId?: string;
}

const Header: React.FC<HeaderProps> = ({ selectedTitle, sessionId }) => {
  const { deleteSession, updateSession, state } = useChatSession();
  const session = sessionId && state.sessions.find((s) => s._id === sessionId);
  const navigate = useNavigate();

  // const handleArchive = async () => {
  //   if (session) {
  //     await updateSession({ ...session, archived: true });
  //   }
  // };

  const [displayedTitle, setDisplayedTitle] = useState(selectedTitle);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (selectedTitle === displayedTitle) return;

    let i = 0;
    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    function typeNext() {
      setDisplayedTitle(selectedTitle.slice(0, i + 1));
      i++;
      if (i < selectedTitle.length) {
        typingTimeout.current = setTimeout(typeNext, 30);
      }
    }

    setDisplayedTitle("");
    typingTimeout.current = setTimeout(typeNext, 30);

    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [selectedTitle]);

  const handleDelete = async () => {
    if (sessionId) {
      await deleteSession(sessionId);
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-12 w-full items-center justify-between bg-white p-2 font-semibold text-text-primary dark:bg-gray-800">
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="font-semibold">{displayedTitle}</h1>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* <DropdownMenuItem onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem> */}
            <DropdownMenuItem onClick={handleDelete} className="text-red-500">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;

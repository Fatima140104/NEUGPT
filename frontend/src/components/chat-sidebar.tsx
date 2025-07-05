"use client";

import * as React from "react";
import {
  Plus,
  Search,
  Settings,
  User,
  Edit3,
  Trash2,
  Archive,
  Share,
  MoreVertical,
} from "lucide-react";
import logoNeu from "@/assets/favicon.png";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatSession } from "@/providers/ChatSessionContext";
import { useNavigate } from "react-router-dom";
import { getUserFromToken, removeToken } from "@/lib/auth";

function SessionTitleWithTyping({
  title,
  triggerTyping,
}: {
  title: string;
  triggerTyping: boolean;
}) {
  const [displayedTitle, setDisplayedTitle] = React.useState(title);
  const typingTimeout = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (!triggerTyping) {
      setDisplayedTitle(title);
      return;
    }
    let i = 0;
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    function typeNext() {
      setDisplayedTitle(title.slice(0, i + 1));
      i++;
      if (i < title.length) {
        typingTimeout.current = setTimeout(typeNext, 30);
      }
    }
    setDisplayedTitle("");
    typingTimeout.current = setTimeout(typeNext, 30);
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [title, triggerTyping]);

  return (
    <span
      className="font-medium text-sm flex-1 relative overflow-hidden inline-block whitespace-nowrap"
      style={{
        maskImage: "linear-gradient(to right, black 85%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, black 85%, transparent 100%)",
      }}
    >
      {displayedTitle}
    </span>
  );
}

function ChatSidebar() {
  const navigate = useNavigate();
  const { state, selectSession, deleteSession } = useChatSession();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [hoveredSessionId, setHoveredSessionId] = React.useState<string | null>(
    null
  );
  const [menuOpenSessionId, setMenuOpenSessionId] = React.useState<
    string | null
  >(null);
  const [updatedSessionId, setUpdatedSessionId] = React.useState<string | null>(
    null
  );

  const user = getUserFromToken();

  const filteredSessions = (state.sessions || [])
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .filter((session) =>
      session.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Animate session title when updated
  React.useEffect(() => {
    if (state.lastUpdatedSessionId) {
      setUpdatedSessionId(state.lastUpdatedSessionId);
      const timeout = setTimeout(() => setUpdatedSessionId(null), 600);
      return () => clearTimeout(timeout);
    }
  }, [state.lastUpdatedSessionId]);

  const handleNewChat = () => {
    selectSession("new");
    navigate(`/c/new`);
  };

  const handleSelectSession = (id: string) => {
    selectSession(id);
    navigate(`/c/${id}`);
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2 mb-4">
          <img
            src={logoNeu}
            alt="NEU Logo"
            className="h-13 w-13 object-cover object-center rounded"
          />
          <span className="font-semibold text-lg">NEU GPT</span>
        </div>
        <Button
          className="w-full justify-start gap-2"
          size="sm"
          onClick={handleNewChat}
          disabled={state.loading}
        >
          <Plus className="h-4 w-4" />
          Cuộc trò chuyện mới
        </Button>
      </SidebarHeader>
      <SidebarContent className="pt-0 pb-2 px-2">
        <SidebarGroup className="sticky top-0 z-10 bg-sidebar">
          <SidebarGroupContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm cuộc trò chuyện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Cuộc trò chuyện gần đây</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {state.loading && (
                <div className="p-4 text-center text-muted-foreground">
                  Đang tải...
                </div>
              )}
              {state.error && (
                <div className="p-4 text-center text-red-500">
                  {state.error}
                </div>
              )}
              {filteredSessions.map((session) => (
                <SidebarMenuItem
                  key={session._id}
                  className="group"
                  onMouseEnter={() => setHoveredSessionId(session._id)}
                  onMouseLeave={() => setHoveredSessionId(null)}
                >
                  <SidebarMenuButton
                    asChild
                    isActive={state.selectedSessionId === session._id}
                    className="h-auto p-3 items-start"
                  >
                    <button
                      onClick={() => handleSelectSession(session._id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between w-full">
                        <SessionTitleWithTyping
                          title={session.title || "(Không có tiêu đề)"}
                          triggerTyping={updatedSessionId === session._id}
                        />
                        {(hoveredSessionId === session._id ||
                          menuOpenSessionId === session._id) && (
                          <DropdownMenu
                            open={menuOpenSessionId === session._id}
                            onOpenChange={(open) =>
                              setMenuOpenSessionId(open ? session._id : null)
                            }
                          >
                            <DropdownMenuTrigger asChild>
                              <span>
                                <MoreVertical
                                  className="opacity-50 transition-opacity duration-200 ml-1 cursor-pointer h-4 w-4"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenSessionId(session._id);
                                  }}
                                />
                              </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem>
                                <Edit3 className="h-5 w-5 mr-2" /> Đổi tên
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Archive className="h-5 w-5 mr-2" /> Lưu trữ
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  deleteSession(session._id);
                                  navigate("/");
                                }}
                              >
                                <Trash2 className="h-5 w-5 mr-2 text-red-500" />{" "}
                                Xóa
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        {/* TODO: Thêm ngày tạo */}
                        {/* {<span className="text-xs text-muted-foreground ml-2">
                          {new Date(session.timestamp).toLocaleString()}
                        </span>} */}
                      </div>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.imageUrl || ""} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {user?.displayName || "Người dùng"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email || ""}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Hồ sơ
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    removeToken();
                    navigate("/login");
                  }}
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
export default ChatSidebar;

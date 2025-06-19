"use client";

import * as React from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Settings,
  User,
  MoreHorizontal,
  Edit3,
  Trash2,
  Archive,
  Share,
} from "lucide-react";

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
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatSession } from "../providers/ChatSessionContext";
import { useNavigate } from "react-router-dom";

function ChatSidebar() {
  const navigate = useNavigate();
  const { state, selectSession, addSession } = useChatSession();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [hoveredSessionId, setHoveredSessionId] = React.useState<string | null>(
    null
  );
  const [menuOpenSessionId, setMenuOpenSessionId] = React.useState<
    string | null
  >(null);

  const filteredSessions = (state.sessions || [])
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
    .filter((session) =>
      session.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-6 w-6" />
          <span className="font-semibold text-lg">NEU GPT</span>
        </div>
        <Button
          className="w-full justify-start gap-2"
          size="sm"
          onClick={() => addSession()}
          disabled={state.loading}
        >
          <Plus className="h-4 w-4" />
          Cuộc trò chuyện mới
        </Button>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="relative mb-4">
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
                >
                  <SidebarMenuButton
                    asChild
                    isActive={state.selectedSessionId === session._id}
                    className="h-auto p-3  items-start"
                  >
                    <button
                      onClick={() => {
                        selectSession(session._id);
                        navigate(`/c/${session._id}`);
                      }}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-medium text-sm truncate flex-1">
                          {session.title || "(Không có tiêu đề)"}
                        </span>

                        {hoveredSessionId === session._id && (
                          <DropdownMenu
                            open={menuOpenSessionId === session._id}
                            onOpenChange={(open) =>
                              setMenuOpenSessionId(open ? session._id : null)
                            }
                          >
                            <DropdownMenuTrigger asChild>
                              <span>
                                <MoreHorizontal
                                  className="opacity-50 transition-opacity duration-200 ml-1 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpenSessionId(session._id);
                                  }}
                                />
                              </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              <DropdownMenuItem>
                                <Share className="h-5 w-5 mr-2" /> Chia sẻ
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit3 className="h-5 w-5 mr-2" /> Đổi tên
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Archive className="h-5 w-5 mr-2" /> Lưu trữ
                              </DropdownMenuItem>
                              <DropdownMenuItem>
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
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Người dùng</span>
                    <span className="text-xs text-muted-foreground">
                      user@example.com
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
                <DropdownMenuItem>Đăng xuất</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
export default ChatSidebar;

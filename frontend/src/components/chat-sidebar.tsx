"use client"

import * as React from "react"
import { MessageSquare, Plus, Search, Settings, User, MoreHorizontal, Edit3, Trash2, Archive } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
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
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock data cho các cuộc trò chuyện
const conversations = [
  {
    id: "1",
    title: "Hướng dẫn React Hooks",
    timestamp: "2 giờ trước",
    preview: "Giải thích về useState và useEffect...",
  },
  {
    id: "2",
    title: "Thiết kế UI/UX",
    timestamp: "1 ngày trước",
    preview: "Nguyên tắc thiết kế giao diện người dùng...",
  },
  {
    id: "3",
    title: "Tối ưu hóa performance",
    timestamp: "3 ngày trước",
    preview: "Cách tối ưu hóa ứng dụng React...",
  },
  {
    id: "4",
    title: "API Integration",
    timestamp: "1 tuần trước",
    preview: "Kết nối với REST API và GraphQL...",
  },
  {
    id: "5",
    title: "Database Design",
    timestamp: "2 tuần trước",
    preview: "Thiết kế cơ sở dữ liệu hiệu quả...",
  },
]

function ChatSidebar() {
  const [selectedChat, setSelectedChat] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.preview.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar className="border-r">
        <SidebarHeader className="border-b p-4">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-6 w-6" />
            <span className="font-semibold text-lg">AI Chat</span>
          </div>

          <Button className="w-full justify-start gap-2" size="sm">
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
                {filteredConversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={selectedChat === conversation.id}
                      className="h-auto p-3 flex-col items-start"
                    >
                      <button onClick={() => setSelectedChat(conversation.id)} className="w-full text-left">
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-medium text-sm truncate flex-1">{conversation.title}</span>
                          <span className="text-xs text-muted-foreground ml-2">{conversation.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{conversation.preview}</p>
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
                      <span className="text-xs text-muted-foreground">user@example.com</span>
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

      <div className="flex-1 flex flex-col">
        <header className="border-b p-4 flex items-center gap-2">
          <SidebarTrigger />
          <h1 className="font-semibold">
            {selectedChat ? conversations.find((c) => c.id === selectedChat)?.title : "AI Chat Assistant"}
          </h1>
        </header>

        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {selectedChat ? "Cuộc trò chuyện đã chọn" : "Chào mừng đến với AI Chat"}
              </h2>
              <p className="text-muted-foreground">
                {selectedChat
                  ? "Nội dung cuộc trò chuyện sẽ hiển thị ở đây"
                  : "Bắt đầu cuộc trò chuyện mới hoặc chọn từ danh sách bên trái"}
              </p>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
export default ChatSidebar
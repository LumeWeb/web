"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Loader2, Search, User, X } from "lucide-react"
import { useNotification } from "@refinedev/core"
import { type UserResponse, UserRole } from "@/types/user"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AssignUserDialogProps {
  caseId: number
  currentAssigneeId?: number
  onAssign: (userId: number | undefined) => Promise<void>
}

// Mock function to get users - in a real app, this would be an API call
const getUsers = async (): Promise<UserResponse[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@example.com",
      role: UserRole.Admin,
      department: "Security",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Jane Doe",
      email: "jane.doe@example.com",
      role: UserRole.Manager,
      department: "Compliance",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      role: UserRole.Agent,
      department: "Support",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 4,
      name: "Sarah Williams",
      email: "sarah.williams@example.com",
      role: UserRole.Agent,
      department: "Legal",
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 5,
      name: "David Brown",
      email: "david.brown@example.com",
      role: UserRole.Viewer,
      department: "Operations",
      isActive: false,
      createdAt: new Date().toISOString(),
    },
  ]
}

export function AssignUserDialog({ caseId, currentAssigneeId, onAssign }: AssignUserDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<UserResponse[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserResponse[]>([])
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>(currentAssigneeId)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { open: openNotification } = useNotification()

  // Fetch users when dialog opens
  useEffect(() => {
    if (open) {
      setIsLoading(true)
      getUsers()
        .then((data) => {
          setUsers(data)
          setFilteredUsers(data)
          setIsLoading(false)
        })
        .catch(() => {
          openNotification({
            type: "error",
            message: "Failed to load users",
            description: "There was an error loading the user list.",
          })
          setIsLoading(false)
        })
    }
  }, [open, openNotification])

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          (user) =>
            user.name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query) ||
            (user.department && user.department.toLowerCase().includes(query)),
        ),
      )
    }
  }, [searchQuery, users])

  const handleSubmit = async () => {
    if (selectedUserId === currentAssigneeId) {
      openNotification({
        type: "info",
        message: "No change",
        description: "The selected user is already assigned to this case.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onAssign(selectedUserId)
      openNotification({
        type: "success",
        message: "Case assigned",
        description: selectedUserId
          ? `Case has been assigned to ${users.find((u) => u.id === selectedUserId)?.name || "the selected user"}.`
          : "Case has been unassigned.",
      })
      setOpen(false)
    } catch (error) {
      openNotification({
        type: "error",
        message: "Failed to assign case",
        description: "There was an error assigning the case. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.Admin:
        return "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
      case UserRole.Manager:
        return "bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400"
      case UserRole.Agent:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"
      case UserRole.Viewer:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          Assign to User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Case to User</DialogTitle>
          <DialogDescription>
            Search for a user to assign this case to, or remove the current assignment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {selectedUserId && (
                <div className="mb-2">
                  <h3 className="text-sm font-medium mb-2">Currently Assigned</h3>
                  <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={users.find((u) => u.id === selectedUserId)?.avatar} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{users.find((u) => u.id === selectedUserId)?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {users.find((u) => u.id === selectedUserId)?.email}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUserId(undefined)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove assignment</span>
                    </Button>
                  </div>
                </div>
              )}

              <ScrollArea className="h-[300px] rounded-md border">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No users found matching your search.</div>
                ) : (
                  <div className="p-4 space-y-2">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-muted ${
                          selectedUserId === user.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">{user.name}</p>
                              <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                {user.role}
                              </Badge>
                              {!user.isActive && (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{user.email}</span>
                              {user.department && (
                                <>
                                  <span>•</span>
                                  <span>{user.department}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign User"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

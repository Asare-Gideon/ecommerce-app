"use client"

import { useDeferredValue, useEffect, useState } from "react"
import { Bell, CalendarIcon, MessageSquare, MoreHorizontal, ScanEye, UserCheck, UserMinus, UserPlus, Users, UserX } from "lucide-react"
import { format } from "date-fns";
import { RotatingLines } from "react-loader-spinner";

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import OrderStatusCard from "@/components/order-status-card"
import { useUsers } from "@/hooks/useUsers"
import { useNotifications } from "@/hooks/useNotifications"
import { UserType, useUsersStore } from "@/store/usersStore"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { BASE_URL, formatCurrency } from "@/utils/constants";
import { useRouter } from "next/navigation";
import ConfirmDialog from "@/components/confirm-dialog";



export default function UsersPage() {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const deferredSearch = useDeferredValue(searchQuery);
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationTitle, setNotificationTitle] = useState("")
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  const [smsMessage, setSmsMessage] = useState("")
  const { fetchUsersQuery, fetchUsersAnalytics, unblockUser, blockeUser } = useUsers()
  const { sendClientNotification } = useNotifications()
  const { users, usersTotal, analytics, isLoading } = useUsersStore()
  const [status, setStatus] = useState("")
  const [role, setRole] = useState("")
  const [page, setPage] = useState(1)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const router = useRouter()
  const [openDialog, setOpenDialog] = useState(false)
  const [updatedUserId, setUpdatedUserId] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)

  const handleQueries = async () => {
    fetchUsersQuery(`${BASE_URL}/user/get-all?search=${deferredSearch}&isBlock=${status}&role=${role}&page=${page}&dateRange=${dateRange ? JSON.stringify(dateRange) : "all"}`)
  }

  useEffect(() => {
    handleQueries()
  }, [deferredSearch, role, status, dateRange, page, updatedUserId])

  useEffect(() => {
    fetchUsersAnalytics()
  }, [])


  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map((user) => user._id))
    }
  }

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim() || selectedUsers.length === 0 || isSendingNotification) return

    setIsSendingNotification(true)
    try {
      await sendClientNotification({
        title: notificationTitle.trim(),
        message: notificationMessage.trim(),
        audience: "selected",
        recipientIds: selectedUsers,
        severity: "info",
      })
      setNotificationTitle("")
      setNotificationMessage("")
      setSelectedUsers([])
    } finally {
      setIsSendingNotification(false)
    }
  }

  const handleSendSMS = () => {
    alert(`SMS sent to ${selectedUsers.length} users: ${smsMessage}`)
    setSmsMessage("")
  }

  const handleBlockUser = async (user: UserType) => {
    if (user) {
      let response;
      if (user.isBlock) {
        response = await unblockUser(user._id)
      } else {
        response = await blockeUser(user._id)
      }
      if (response) {
        handleQueries()
      }
    }
  }



  return (
    <div className="p-8">
      <div className="flex flex-col space-y-8">
        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <OrderStatusCard
            icon={Users}
            title={"Total Users"}
            value={analytics ? analytics?.totalUsers : 0}
            borderColor={"border-l-purple-500"}
            iconBgColor={"text-purple-500"}
            iconColor={"bg-purple-50"}
          />
          <OrderStatusCard
            icon={Users}
            title={"Active Users"}
            value={analytics ? analytics?.activeUsers : 0}
            borderColor={"border-l-green-500"}
            iconBgColor={"text-green-500"}
            iconColor={"bg-green-50"}
          />
          <OrderStatusCard
            icon={Users}
            title={"Inactive Users"}
            value={analytics ? analytics?.inactiveUsers : 0}
            borderColor={"border-l-yellow-500"}
            iconBgColor={"text-yellow-500"}
            iconColor={"bg-yellow-50"}
          />
          <OrderStatusCard
            icon={Users}
            title={"New Users"}
            value={analytics ? analytics?.newUsers : 0}
            borderColor={"border-l-purple-500"}
            iconBgColor={"text-purple-500"}
            iconColor={"bg-purple-50"}
          />

        </div>

        {/* Users Section */}
        <Card className="p-8">
          <div>
            <div className="flex items-center mb-8">
              <div className="w-1 h-6 bg-primary rounded-full mr-2"></div>
              <h2 className="text-2xl font-bold">Users</h2>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search users by phone number, email or name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11"
                />
              </div>
              <Select onValueChange={(v) => setStatus(v)} defaultValue={status} >
                <SelectTrigger className="w-[180px] h-11">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Blocked</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={(v) => setRole(v)} defaultValue={role} >
                <SelectTrigger className="w-[180px] h-11">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn("w-[180px] md:w-[300px] h-11  justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

            </div>


            <div className="bg-muted/50 p-4 rounded-lg mb-4 flex items-center justify-between">
              <span>{selectedUsers.length} users selected</span>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-11">
                      <Bell className="mr-2 h-4 w-4 " />
                      Send Notification
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send Notification</DialogTitle>
                      <DialogDescription>
                        Send a notification to {selectedUsers.length} selected users.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Input
                        placeholder="Notification title"
                        value={notificationTitle}
                        onChange={(e) => setNotificationTitle(e.target.value)}
                      />
                      <Textarea
                        placeholder="Enter your notification message..."
                        value={notificationMessage}
                        onChange={(e) => setNotificationMessage(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={handleSendNotification}
                        disabled={!notificationTitle.trim() || !notificationMessage.trim() || selectedUsers.length === 0 || isSendingNotification}
                      >
                        {isSendingNotification ? "Sending..." : "Send Notification"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="h-11" >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send SMS
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Send SMS</DialogTitle>
                      <DialogDescription>Send an SMS to {selectedUsers.length} selected users.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Textarea
                        placeholder="Enter your SMS message..."
                        value={smsMessage}
                        onChange={(e) => setSmsMessage(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSendSMS}>Send SMS</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedUsers.length === users.length && users.length > 0}
                        onCheckedChange={selectAllUsers}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="min-h-[10rem] relative">
                  {isLoading && (
                    <div className="w-full absolute md:h-[7rem]  flex flex-col  items-center justify-center">
                      <RotatingLines
                        visible={true}
                        strokeColor="#2563eb"
                        width="60"
                        strokeWidth="2"
                        animationDuration="0.75"
                        ariaLabel="rotating-lines-loading"
                      />
                    </div>
                  )}

                  {!isLoading && users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUsers.includes(user._id)}
                          onCheckedChange={() => toggleUserSelection(user._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-muted-foreground">{user.phone}</div>
                      </TableCell>
                      <TableCell>{formatCurrency(user.totalSpent)}</TableCell>
                      <TableCell>{user.totalOrders}</TableCell>
                      <TableCell>
                        <Badge variant={user.isBlock ? "default" : "secondary"}>{user.isBlock ? "Blocked" : "Active"}</Badge>
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.loginAt ? format(new Date(user.loginAt), "yyyy-MM-dd HH:mm:ss") : "-"}</TableCell>
                      <TableCell>{format(new Date(user.createdAt), "yyyy-MM-dd HH:mm:ss")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 w-[120px] hover:text-blue-900 mx-2"
                          onClick={() => router.push(`/users/details?id=${user._id}`)}
                        >
                          <ScanEye className="h-3 w-3 mr-1" />
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={`${user.isBlock ? "text-yellow-600 hover:text-yellow-900" : "text-red-600 hover:text-red-900"} w-[120px] `}
                          onClick={() => {
                            setSelectedUser(user);
                            setOpenDialog(true);
                          }}
                        >
                          {user.isBlock ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                          {user.isBlock ? "Unblock User" : "Block User"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {users.length} of {usersTotal} users
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === Math.ceil(usersTotal / 10)}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <ConfirmDialog
          title={selectedUser?.isBlock ? "Unblock User" : "Block User"}
          description={`Are you sure you want to ${selectedUser?.isBlock ? "unblock" : "block"} ${selectedUser?.firstName} ${selectedUser?.lastName}?`}
          isOpen={openDialog}
          onClose={() => setOpenDialog(false)}
          confirmText="Yes"
          cancelText="No cancel"
          onConfirm={() => {
            handleBlockUser(selectedUser as any);
          }}
        />

      </div>
    </div>
  )
}


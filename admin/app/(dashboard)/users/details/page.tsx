"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Calendar, DollarSign, Edit, MapPin, Phone, ShoppingBag, User, Shield, Heart, Clock, Package, ChevronRight, CheckCircle, Ban } from "lucide-react"
import { format } from "date-fns";
import { RotatingLines } from "react-loader-spinner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserType, useUsersStore } from "@/store/usersStore"
import { useUsers } from "@/hooks/useUsers"
import Image from "next/image";
import { useOrder } from "@/hooks/useOrder";
import { OrderType } from "@/store/orderStore";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import ConfirmDialog from "@/components/confirm-dialog";
import AddressCard from "@/components/address-card";
import { formatCurrency } from "@/utils/constants";
const notFound = require("../../../../asset/images/no-shopping-cart.png");

type OrderStatus = "pending" | "processing" | "completed" | "cancelled"

type StatusBadgeInfo = {
    label: string
    variant: "default" | "secondary" | "destructive" | "outline"
}

const getStatusBadge = (status: OrderStatus | string): StatusBadgeInfo => {
    const statusMap: Record<OrderStatus, StatusBadgeInfo> = {
        pending: { label: "Pending", variant: "outline" },
        processing: { label: "Processing", variant: "secondary" },
        completed: { label: "Completed", variant: "default" },
        cancelled: { label: "Cancelled", variant: "destructive" },
    }

    return statusMap[status as OrderStatus] || { label: status, variant: "outline" }
}


export default function UserDetailsPage() {
    const searchParams = useSearchParams();
    const userId = searchParams.get("id") as any;

    const [user, setUser] = useState<UserType | null>()
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [editedUser, setEditedUser] = useState(user)
    const { isLoading, error } = useUsersStore()
    const { getOneUser, blockeUser, unblockUser, updateUser } = useUsers()
    const { getUserOrders } = useOrder()
    const [orders, setOrders] = useState<OrderType[] | undefined>([])
    const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)
    const [openDialog, setOpenDialog] = useState(false)




    const fetchOrders = async () => {
        let orders = await getUserOrders(userId)
        setOrders(orders)
    }

    const fetchUser = async () => {
        let user = await getOneUser(userId)
        setUser(user)
        setEditedUser(user)
    }

    console.log(orders)
    useEffect(() => {
        fetchUser()
        fetchOrders()
    }, [])

    const handleEditUser = async () => {
        let newUpdate = {
            firstName: editedUser?.firstName,
            lastName: editedUser?.lastName,
            email: editedUser?.email,
            phone: editedUser?.phone,
            role: editedUser?.role
        }
        let response = await updateUser(userId, newUpdate)
        if (response) {
            fetchUser()
        }

        setIsEditDialogOpen(false)
    }


    const handleBlockUser = async () => {
        if (user) {
            const updatedUser = { ...user, isBlock: !user.isBlock }
            let response;
            if (user.isBlock) {
                response = await unblockUser(userId)
            } else {
                response = await blockeUser(userId)
            }
            if (response) {
                setUser(updatedUser)
            }
        }
    }


    return (
        <div className="p-6">
            <ConfirmDialog
                title={user?.isBlock ? "Unblock User" : "Block User"}
                description={`Are you sure you want to ${user?.isBlock ? "unblock" : "block"} ${user?.firstName} ${user?.lastName}?`}
                isOpen={openDialog}
                onClose={() => setOpenDialog(false)}
                confirmText="Yes"
                cancelText="No cancel"
                onConfirm={() => {
                    handleBlockUser();
                }}
            />
            {isLoading && (
                <>
                    <div className=" absolute top-0 bottom-0 left-0 right-0 bg-[#00000029] z-50 justify-center flex items-center">
                        <RotatingLines
                            visible={true}
                            strokeColor="#2563eb"
                            width="60"
                            strokeWidth="2"
                            animationDuration="0.75"
                            ariaLabel="rotating-lines-loading"
                        />
                    </div>
                </>
            )}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">User Details</h1>
                    <p className="text-muted-foreground">Viewing details for user ID: {userId}</p>
                </div>
                <Button onClick={() => setOpenDialog(true)} variant={user?.isBlock ? "outline" : "destructive"}>
                    {user?.isBlock ? (
                        <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Activate User
                        </>
                    ) : (
                        <>
                            <Ban className="mr-2 h-4 w-4" />
                            Block User
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-bold">User Profile</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setIsEditDialogOpen(true)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage
                                        src={`https://api.dicebear.com/6.x/initials/svg?seed=${user?.firstName} ${user?.lastName}`}
                                        alt={`${user?.firstName} ${user?.lastName}`}
                                    />
                                    <AvatarFallback>
                                        {user?.firstName[0]}
                                        {user?.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {user?.firstName} {user?.lastName}
                                    </h2>
                                    <p className="text-muted-foreground">{user?.email}</p>
                                    <Badge variant={user?.isBlock ? "destructive" : "default"} className="mt-2">
                                        {user?.isBlock ? "Blocked" : "Active"}
                                    </Badge>
                                </div>
                            </div>
                            <Separator className="my-4" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center">
                                    <Phone className="mr-2 h-4 w-4 opacity-70" />
                                    <span>{user?.phone}</span>
                                </div>
                                <div className="flex items-center">
                                    <MapPin className="mr-2 h-4 w-4 opacity-70" />
                                    <span>{user?.addresses[0]?.city}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="mr-2 h-4 w-4 opacity-70" />
                                    <span>Joined  {user && format(new Date(user.createdAt), "dd, MMMM yyyy")}</span>
                                </div>
                                <div className="flex items-center">
                                    <Shield className="mr-2 h-4 w-4 opacity-70" />
                                    <span>{user?.role}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{user?.totalOrders}</div>
                                <p className="text-xs text-muted-foreground">Lifetime orders</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{formatCurrency(user?.totalSpent)}</div>
                                <p className="text-xs text-muted-foreground">Lifetime spend</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div>
                        {user?.addresses.map((address, index) => (
                            <AddressCard key={index} addresses={[address]} title="Address" />
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <Tabs defaultValue="orders" className="w-full">
                        <TabsList className="grid w-full p-2 h-12 grid-cols-3 bg-white">
                            <TabsTrigger className="h-9  shadow-none data-[state=active]:bg-blue-500 data-[state=active]:text-white" value="orders">Orders</TabsTrigger>
                            <TabsTrigger className="h-9  shadow-none data-[state=active]:bg-blue-500 data-[state=active]:text-white" value="carts">Carts</TabsTrigger>
                            <TabsTrigger className="h-9  shadow-none data-[state=active]:bg-blue-500 data-[state=active]:text-white" value="wishlist">Wishlist</TabsTrigger>
                        </TabsList>
                        <TabsContent value="orders">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order History</CardTitle>
                                    <CardDescription>Recent orders placed by the user</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="max-h-[400px] overflow-y-auto pr-4 -mr-4">
                                        {orders && orders.length === 0 && (
                                            <div className="flex items-center justify-center w-full flex-col">
                                                <Image src={notFound} alt="not found" width={80} height={80} />
                                                <p className="text-muted-foreground text-sm sm:text-md">{user?.firstName} has not placed any orders yet</p>
                                            </div>
                                        )}
                                        <div className="space-y-4">
                                            {orders && orders.map((order: OrderType) => {
                                                const orderDate = new Date(order.createdAt || Date.now())
                                                const status = order.status || "pending"
                                                const { label, variant } = getStatusBadge(status)

                                                return (
                                                    <div
                                                        key={order._id}
                                                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-lg border p-4 transition-all hover:bg-muted/50"
                                                    >

                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-medium">
                                                                    #{order._id}
                                                                </h4>
                                                                <Badge variant={variant}>{label}</Badge>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                <Clock className="h-3 w-3" />
                                                                <span>{format(orderDate, "PPP")}</span>
                                                                <Package className="ml-2 h-3 w-3" />
                                                                <span>{order.products?.length || 0} items</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 self-end sm:self-center">
                                                            <div className="text-right">
                                                                <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                                                            </div>

                                                            <Sheet>
                                                                <SheetTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => setSelectedOrder(order)}
                                                                        aria-label={`View details for order from ${order?.user?.firstName} ${order?.user?.lastName}`}
                                                                    >
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    </Button>
                                                                </SheetTrigger>
                                                                <SheetContent className="sm:max-w-md">
                                                                    <SheetHeader>
                                                                        <SheetTitle>Order Details</SheetTitle>
                                                                        <SheetDescription>
                                                                            Order #{order._id} <br className="mb-1" />  placed on {format(orderDate, "PPP")}
                                                                        </SheetDescription>
                                                                    </SheetHeader>
                                                                    <div className="mt-6 space-y-6">
                                                                        <div>
                                                                            <h4 className="text-sm font-medium">Customer</h4>
                                                                            <div className="mt-2 flex items-center gap-2">
                                                                                <Avatar className="h-8 w-8">
                                                                                    <AvatarFallback>
                                                                                        {order?.user?.firstName?.[0]}
                                                                                        {order?.user?.lastName?.[0]}
                                                                                    </AvatarFallback>
                                                                                </Avatar>
                                                                                <div>
                                                                                    <p className="text-sm font-medium">
                                                                                        {order?.user?.firstName} {order?.user?.lastName}
                                                                                    </p>
                                                                                    <p className="text-xs text-muted-foreground">{order?.user?.email}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <h4 className="text-sm font-medium">Order Status</h4>
                                                                            <div className="mt-2">
                                                                                <Badge variant={variant}>{label}</Badge>
                                                                            </div>
                                                                        </div>

                                                                        <div>
                                                                            <h4 className="text-sm font-medium">Order Items</h4>
                                                                            <div className="mt-2 space-y-3">
                                                                                {order?.products && order?.products?.length > 0 ? (
                                                                                    order?.products?.map((item, index) => (
                                                                                        <div key={index} className="flex justify-between border-b pb-2">
                                                                                            <div className="flex items-center">
                                                                                                <Image width={50} height={50} src={item?.product?.images[0]?.url} alt={item?.product?.title} />
                                                                                                <div className="ml-2">
                                                                                                    <p className="text-sm">{item?.product?.title || `Product #${index + 1}`}</p>
                                                                                                    <p className="text-xs text-muted-foreground">Qty: {item?.quantity || 1}</p>
                                                                                                </div>
                                                                                            </div>
                                                                                            <p className="text-sm font-medium">{formatCurrency(item.product.price || 0)}</p>
                                                                                        </div>
                                                                                    ))
                                                                                ) : (
                                                                                    <p className="text-sm text-muted-foreground">No items available</p>
                                                                                )}
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex justify-between border-t pt-4">
                                                                            <p className="font-medium">Total Amount</p>
                                                                            <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                                                                        </div>
                                                                    </div>
                                                                </SheetContent>
                                                            </Sheet>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="carts">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Cart</CardTitle>
                                    <CardDescription>Products the user has added to their cart</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc min-h-[100px] ">
                                        {user && user.carts.length === 0 && (
                                            <div className="flex items-center justify-center w-full flex-col">
                                                <Image src={notFound} alt="not found" width={80} height={80} />
                                                <p className="text-muted-foreground text-sm sm:text-md">{user.firstName} has not Added any products to their cart</p>
                                            </div>
                                        )}
                                        {user && user.carts.length > 0 && user.carts.map((item, index) => (
                                            <div key={index} className="mb-2 flex cursor-pointer bg-gray-50 hover:bg-gray-100 p-2 items-center justify-between">
                                                <div className="flex items-center">
                                                    <Image src={item.image} alt={item.title} width={60} height={60} />
                                                    <div className="ml-2">
                                                        <h3 className="text-sm font-medium">{item.title}</h3>
                                                        <h3 className="text-sm text-muted-foreground">QTY: {item.quantity}</h3>
                                                    </div>
                                                </div>
                                                <h3 className="text-md font-medium">Price: {formatCurrency(item.price)}</h3>
                                            </div>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="wishlist">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Wishlist</CardTitle>
                                    <CardDescription>Products the user has added to their wishlist</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="list-disc min-h-[100px] ">
                                        {user && user.wishlist.length === 0 && (
                                            <div className="flex items-center justify-center w-full flex-col">
                                                <Image src={notFound} alt="not found" width={80} height={80} />
                                                <p className="text-muted-foreground text-sm sm:text-md">{user.firstName} has not Added any products to their wishlist</p>
                                            </div>
                                        )}
                                        {user && user.wishlist.length > 0 && user?.wishlist.map((item, index) => (
                                            <div key={index} className="mb-2 flex cursor-pointer bg-gray-50 hover:bg-gray-100 p-2 items-center justify-between">
                                                <div className="flex items-center">
                                                    <Image src={item.images[0].url} alt={item.title} width={60} height={60} />
                                                    <div className="ml-2">
                                                        <h3 className="text-sm font-medium">{item.title}</h3>
                                                        <h3 className="text-sm text-muted-foreground">Remaining Qty : {item.quantity}</h3>
                                                    </div>
                                                </div>
                                                <h3 className="text-md font-medium">Price: {formatCurrency(item.price)}</h3>
                                            </div>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit User Profile</DialogTitle>
                        <DialogDescription>Make changes to the user profile here. Click save when you're done.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="firstName" className="text-right">
                                First Name
                            </Label>
                            <Input
                                id="firstName"
                                value={editedUser?.firstName}
                                onChange={(e) => editedUser && setEditedUser({ ...editedUser, firstName: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lastName" className="text-right">
                                Last Name
                            </Label>
                            <Input
                                id="lastName"
                                value={editedUser?.lastName}
                                onChange={(e) => editedUser && setEditedUser({ ...editedUser, lastName: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                value={editedUser?.email}
                                onChange={(e) => editedUser && setEditedUser({ ...editedUser, email: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                value={editedUser?.phone}
                                onChange={(e) => editedUser && setEditedUser({ ...editedUser, phone: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">
                                Role
                            </Label>
                            <Input
                                id="role"
                                value={editedUser?.role}
                                onChange={(e) => editedUser && setEditedUser({ ...editedUser, role: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleEditUser}>
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}


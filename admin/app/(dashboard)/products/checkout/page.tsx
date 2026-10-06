"use client"

import { useDeferredValue, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
    ArrowLeft,
    Check,
    ChevronDown,
    CreditCard,
    Info,
    Loader2,
    Plus,
    ShoppingBag,
    User,
    UserPlus,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { useCartStore } from "@/store/cartsStore"
import { useUsers } from "@/hooks/useUsers"
import { BASE_URL, formatCurrency } from "@/utils/constants"
import { UserType, useUsersStore } from "@/store/usersStore"
import { useAuthStore } from "@/store/authStore"
import Loader from "@/components/loader"
import { useSettings } from "@/hooks/useSettings"
import { useSettingsStore } from "@/store/settingsStore"



// const users = [
//     {
//         id: "1",
//         firstName: "Emma",
//         lastName: "Wilson",
//         email: "emma.wilson@example.com",
//         phone: "05422234334",
//         addresses: [
//             {
//                 id: "a1",
//                 address: "123 Main St",
//                 city: "Accra",
//                 state: "Greater Accra",
//                 country: "Ghana",
//                 postalCode: "00233",
//                 isDefault: true,
//             },
//             {
//                 id: "a2",
//                 address: "456 Park Ave",
//                 city: "Kumasi",
//                 state: "Ashanti",
//                 country: "Ghana",
//                 postalCode: "00234",
//                 isDefault: false,
//             },
//         ],
//     },
//     {
//         id: "2",
//         firstName: "Michael",
//         lastName: "Chen",
//         email: "michael.chen@example.com",
//         phone: "05422234335",
//         addresses: [
//             {
//                 id: "a3",
//                 address: "789 Oak St",
//                 city: "Accra",
//                 state: "Greater Accra",
//                 country: "Ghana",
//                 postalCode: "00233",
//                 isDefault: true,
//             },
//         ],
//     },
//     {
//         id: "3",
//         firstName: "Sophia",
//         lastName: "Rodriguez",
//         email: "sophia.r@example.com",
//         phone: "05422234336",
//         addresses: [
//             {
//                 id: "a4",
//                 address: "101 Pine St",
//                 city: "Tamale",
//                 state: "Northern",
//                 country: "Ghana",
//                 postalCode: "00235",
//                 isDefault: true,
//             },
//         ],
//     },
// ]

// Payment methods
const defaultPaymentMethods = [
    {
        id: "credit-card",
        name: "Credit Card",
        description: "Pay securely with card through Paystack",
        icon: CreditCard,
        gateway: "paystack",
    },
    {
        id: "mobile-money",
        name: "Mobile Money",
        description: "Pay securely with mobile money through Paystack",
        icon: CreditCard,
        gateway: "paystack",
    },
    {
        id: "payment-on-delivery",
        name: "Payment on Delivery",
            description: "Pay when you receive your order",
        icon: CreditCard,
        gateway: "manual",
    },
]

const isPaystackPaymentCode = (code: string) => ["credit-card", "mobile-money", "paystack"].includes(code)

// Shipping methods
const defaultShippingMethods = [
    {
        id: "standard",
        name: "Standard Shipping",
        price: 5.99,
        description: "3-5 business days",
    },
    {
        id: "express",
        name: "Express Shipping",
        price: 12.99,
        description: "1-2 business days",
    },
    {
        id: "free",
        name: "Free Shipping",
        price: 0,
        description: "5-7 business days",
    },
]

export default function CheckoutPage() {
    const router = useRouter()

    // State for checkout process
    const { users, isLoading: usersLoading } = useUsersStore()
    const [step, setStep] = useState(1)
    const [isCreatingUser, setIsCreatingUser] = useState(false)
    const [isUserSearchOpen, setIsUserSearchOpen] = useState(false)
    const [userSearchQuery, setUserSearchQuery] = useState("")
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
    const [selectedAddress, setSelectedAddress] = useState<UserType["addresses"][0] | null>(null)
    const [selectedShippingMethod, setSelectedShippingMethod] = useState(defaultShippingMethods[0].id)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(defaultPaymentMethods[0].id)
    const [paymentStatus, setPaymentStatus] = useState<"paid" | "pending">("pending")
    const [isProcessing, setIsProcessing] = useState(false)
    const [discountCode, setDiscountCode] = useState("")
    const [discountApplied, setDiscountApplied] = useState(false)
    const [adminNotes, setAdminNotes] = useState("")
    const deferredSearch = useDeferredValue(userSearchQuery);
    const { fetchUsersQuery, } = useUsers()
    const [userWithAdress, setUserWithAdress] = useState<UserType | null>(null)
    const { token } = useAuthStore();
    const [userCreationLoading, setUserCreationLoading] = useState(false)
    const { getOneUser, } = useUsers()
    const { fetchSettings } = useSettings()
    const { settings } = useSettingsStore()

    const { items: cartItems, totalItems, totalPrice, clearCart } = useCartStore()
    const shippingMethods = (settings?.shippingMethods || [])
        .filter((method) => method.isActive)
        .map((method) => ({
            id: method._id,
            name: method.name,
            price: Number(method.amount) || 0,
            description: method.estimatedDays || method.description,
        }))
    const paymentMethods = (settings?.paymentMethods || [])
        .filter((method) => method.isActive)
        .map((method) => ({
            id: method.code,
            name: method.name,
            description: method.description,
            icon: CreditCard,
            gateway: method.gateway,
        }))
    const availableShippingMethods = shippingMethods.length > 0 ? shippingMethods : defaultShippingMethods
    const availablePaymentMethods = paymentMethods.length > 0 ? paymentMethods : defaultPaymentMethods
    const selectedPayment = availablePaymentMethods.find((method) => method.id === selectedPaymentMethod)
    const isPaystackPayment = selectedPayment?.gateway === "paystack" || isPaystackPaymentCode(selectedPaymentMethod)

    // New user form state
    const [newUser, setNewUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "Ghana",
        postalCode: "",
    })

    // Calculate order summary
    const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
    const selectedShipping = availableShippingMethods.find((method) => method.id === selectedShippingMethod)
    const shipping = selectedShipping?.price || 0
    const discount = discountApplied ? subtotal * 0.1 : 0 // 10% discount
    const tax = (subtotal - discount) * 0.05 // 5% tax
    const total = subtotal + shipping + tax - discount

    // Filter users based on search query
    const filteredUsers = users.filter((user) => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
        const email = user?.email?.toLowerCase()
        const phone = user?.phone
        const query = userSearchQuery.toLowerCase()

        return fullName.includes(query) || email.includes(query) || phone.includes(query)
    })

    // Handle user selection
    const handleSelectUser = (user: (typeof users)[0]) => {
        setSelectedUser(user)
        setSelectedAddress(user.addresses.find((addr: any) => addr.default) || user.addresses[0] || null)
        setIsUserSearchOpen(false)
    }

    // fetching users 
    const handleQueries = async () => {
        fetchUsersQuery(`${BASE_URL}/user/get-all?search=${deferredSearch}`)
    }

    // fectch user with addresses
    const fetchUserWithAddresses = async () => {
        if (!selectedUser) return
        let user = await getOneUser(selectedUser?._id)
        setUserWithAdress(user)
    }

    useEffect(() => {
        handleQueries()
    }, [deferredSearch])

    useEffect(() => {
        fetchSettings()
    }, [])

    useEffect(() => {
        if (!availableShippingMethods.some((method) => method.id === selectedShippingMethod)) {
            setSelectedShippingMethod(availableShippingMethods[0]?.id || defaultShippingMethods[0].id)
        }
        if (!availablePaymentMethods.some((method) => method.id === selectedPaymentMethod)) {
            setSelectedPaymentMethod(availablePaymentMethods[0]?.id || defaultPaymentMethods[0].id)
        }
    }, [settings])

    useEffect(() => {
        fetchUserWithAddresses()
    }, [selectedUser])


    const generateRandomPassword = () => {
        const length = 12;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }

    // Handle new user creation
    const handleCreateUser = async () => {
        // Validate form
        if (
            !newUser.firstName ||
            !newUser.lastName ||
            !newUser.email ||
            !newUser.phone ||
            !newUser.address ||
            !newUser.city ||
            !newUser.state ||
            !newUser.postalCode
        ) {
            toast({
                title: "Missing information",
                description: "Please fill in all required fields.",
                variant: "destructive",
            })
            return
        }

        setUserCreationLoading(true)
        //create user address first
        const createAddress = await fetch(`${BASE_URL}/address/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({
                address: newUser.address,
                city: newUser.city,
                state: newUser.state,
                country: newUser.country,
                postalCode: newUser.postalCode,
            }),
        })
        const address = await createAddress.json()

        // Create new user 
        if (address) {
            const createUser = await fetch(`${BASE_URL}/user/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    phone: newUser.phone,
                    addresses: [address._id],
                    password: generateRandomPassword(),
                }),
            })
            const user = await createUser.json()
            setSelectedUser(user as any)
            setIsCreatingUser(false)

            toast({
                title: "Customer created",
                description: `${user.firstName} ${user.lastName} has been created successfully.`,
            })
            setNewUser({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                address: "",
                city: "",
                state: "",
                country: "Ghana",
                postalCode: "",
            })
        }

        setUserCreationLoading(false)
    }

    // Handle order placement
    const handlePlaceOrder = async () => {
        if (!selectedUser) {
            toast({
                title: "Customer required",
                description: "Please select or create a customer for this order.",
                variant: "destructive",
            })
            return
        }

        if (!selectedAddress) {
            toast({
                title: "Shipping address required",
                description: "Please select a shipping address.",
                variant: "destructive",
            })
            return
        }

        setIsProcessing(true)
        try {
            const createAddress = await fetch(`${BASE_URL}/order/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    user: selectedUser?._id,
                    products: cartItems.map((item) => ({
                        product: item.productId || item.id,
                        quantity: item.quantity,
                        chosenSize: item.selectedSize,
                        chosenColor: item.selectedColor,
                    })),
                    paymentMethod: selectedPaymentMethod,
                    paymentStatus: isPaystackPayment ? "pending" : paymentStatus,
                    subtotalAmount: subtotal,
                    shippingAmount: shipping,
                    taxAmount: tax,
                    discountAmount: discount,
                    shippingMethod: selectedShipping?.name || selectedShippingMethod,
                    shippingAddress: selectedAddress,
                    transactionId: isPaystackPayment ? undefined : generateRandomPassword(),
                }),
            })

            const order = await createAddress.json()
            if (!createAddress.ok) {
                throw new Error(order.message || "Failed to create order")
            }

            if (isPaystackPayment) {
                const callbackUrl = `${window.location.origin}/products/checkout/paystack/callback`
                const paystackResponse = await fetch(`${BASE_URL}/order/paystack/initialize/${order._id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({ callbackUrl }),
                })
                const paystackData = await paystackResponse.json()
                if (!paystackResponse.ok) {
                    throw new Error(paystackData.message || "Failed to initialize Paystack payment")
                }

                clearCart()
                window.location.href = paystackData.paystack.authorization_url
                return
            }

            toast({
                title: "Order created",
                description: "Order has been created successfully.",
                variant: "default",
            })
            setStep(1)
            clearCart()
        } catch (error: any) {
            toast({
                title: "Failed to create order",
                description: error.message || "Something went wrong please try again later",
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }

    }



    // Handle step navigation
    const goToNextStep = () => {
        if (step === 1 && !selectedUser && !isCreatingUser) {
            toast({
                title: "Customer required",
                description: "Please select or create a customer for this order.",
                variant: "destructive",
            })
            return
        }

        if (step === 2 && !selectedAddress) {
            toast({
                title: "Shipping address required",
                description: "Please select a shipping address.",
                variant: "destructive",
            })
            return
        }

        setStep(step + 1)
    }

    const goToPreviousStep = () => {
        setStep(step - 1)
    }

    return (
        <div className=" p-6 md:px-10 bg-white h-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Create Order</h1>
                    <p className="text-muted-foreground">Create a new order for a customer</p>
                </div>
                <Button variant="outline" className="h-11 w-full sm:w-auto" onClick={() => router.push("/products/list")}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                {/* Main checkout form */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    {/* Checkout steps */}
                    <div className="mb-6 overflow-hidden">
                        {/* Mobile stepper (visible on small screens) */}
                        <div className="flex items-center justify-between md:hidden mb-2">
                            <div className="font-medium text-sm">
                                Step {step} of 4:{" "}
                                {step === 1 ? "Customer" : step === 2 ? "Shipping" : step === 3 ? "Payment" : "Review"}
                            </div>
                            <div className="text-sm text-muted-foreground">{Math.round((step / 4) * 100)}% Complete</div>
                        </div>

                        {/* Progress bar for mobile */}
                        <div className="h-2 w-full bg-muted rounded-full md:hidden">
                            <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${(step / 4) * 100}%` }}
                            ></div>
                        </div>

                        {/* Desktop stepper (hidden on small screens) */}
                        <div className="hidden md:flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <div
                                    className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                                        step >= 1 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30",
                                    )}
                                >
                                    1
                                </div>
                                <span className={cn("text-sm font-medium", step >= 1 ? "text-foreground" : "text-muted-foreground")}>
                                    Customer
                                </span>
                            </div>
                            <Separator className="flex-1 mx-4" />
                            <div className="flex items-center space-x-2">
                                <div
                                    className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                                        step >= 2 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30",
                                    )}
                                >
                                    2
                                </div>
                                <span className={cn("text-sm font-medium", step >= 2 ? "text-foreground" : "text-muted-foreground")}>
                                    Shipping
                                </span>
                            </div>
                            <Separator className="flex-1 mx-4" />
                            <div className="flex items-center space-x-2">
                                <div
                                    className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                                        step >= 3 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30",
                                    )}
                                >
                                    3
                                </div>
                                <span className={cn("text-sm font-medium", step >= 3 ? "text-foreground" : "text-muted-foreground")}>
                                    Payment
                                </span>
                            </div>
                            <Separator className="flex-1 mx-4" />
                            <div className="flex items-center space-x-2">
                                <div
                                    className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium",
                                        step >= 4 ? "bg-primary text-primary-foreground border-primary" : "border-muted-foreground/30",
                                    )}
                                >
                                    4
                                </div>
                                <span className={cn("text-sm font-medium", step >= 4 ? "text-foreground" : "text-muted-foreground")}>
                                    Review
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Step 1: Customer Information */}
                    {step === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer Information</CardTitle>
                                <CardDescription>Select an existing customer or create a new one</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {!isCreatingUser ? (
                                    <div className="space-y-4">
                                        {selectedUser ? (
                                            <div className="bg-muted/50 p-4 rounded-lg flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <div className="font-medium">
                                                        {selectedUser.firstName} {selectedUser.lastName}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                                                    <div className="text-sm text-muted-foreground">{selectedUser.phone}</div>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                                                    Change
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    <div className="flex-1">
                                                        <Popover open={isUserSearchOpen} onOpenChange={setIsUserSearchOpen}>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    role="combobox"
                                                                    aria-expanded={isUserSearchOpen}
                                                                    className="w-full justify-between h-11"
                                                                >
                                                                    <span className="truncate">
                                                                        {selectedUser
                                                                            ? `${(selectedUser as any).firstName} ${(selectedUser as any).lastName}`
                                                                            : "Search for a customer..."}
                                                                    </span>
                                                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-full p-0" align="start">
                                                                <Command>
                                                                    <CommandInput
                                                                        placeholder="Search by phone number..."
                                                                        value={userSearchQuery}
                                                                        onValueChange={setUserSearchQuery}
                                                                        className="h-11"
                                                                    />
                                                                    <CommandList>
                                                                        <CommandEmpty>
                                                                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                                                                <User className="h-10 w-10 text-muted-foreground/50 mb-2" />
                                                                                <p className="mb-2">No customers found</p>
                                                                                <Button
                                                                                    size="sm"
                                                                                    className="h-11"
                                                                                    onClick={() => {
                                                                                        setIsUserSearchOpen(false)
                                                                                        setIsCreatingUser(true)
                                                                                    }}
                                                                                >
                                                                                    <UserPlus className="mr-2 h-4 w-4" />
                                                                                    Create New Customer
                                                                                </Button>
                                                                            </div>
                                                                        </CommandEmpty>
                                                                        <CommandGroup>
                                                                            {filteredUsers.map((user) => (
                                                                                <CommandItem
                                                                                    key={user._id}
                                                                                    value={user._id}
                                                                                    onSelect={() => handleSelectUser(user)}
                                                                                    className="flex items-center justify-between"
                                                                                >
                                                                                    <div>
                                                                                        <div className="font-medium">
                                                                                            {user.firstName} {user.lastName}
                                                                                        </div>
                                                                                        <div className="text-sm text-muted-foreground">
                                                                                            {user.email} • {user.phone}
                                                                                        </div>
                                                                                    </div>
                                                                                    {(selectedUser as any)?._id === user._id && <Check className="h-4 w-4 text-primary" />}
                                                                                </CommandItem>
                                                                            ))}
                                                                        </CommandGroup>
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setIsCreatingUser(true)}
                                                        className="sm:w-auto w-full h-11"
                                                    >
                                                        <UserPlus className="mr-2 h-4 w-4" />
                                                        Create New Customer
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="firstName">First Name</Label>
                                                <Input
                                                    id="firstName"
                                                    value={newUser.firstName}
                                                    onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                                    placeholder="Enter first name"
                                                    className="h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="lastName">Last Name</Label>
                                                <Input
                                                    id="lastName"
                                                    value={newUser.lastName}
                                                    onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                                    placeholder="Enter last name"
                                                    className="h-11"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={newUser.email}
                                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                                    placeholder="Enter email address"
                                                    className="h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <Input
                                                    id="phone"
                                                    value={newUser.phone}
                                                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                                    placeholder="Enter phone number"
                                                    className="h-11"
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-2">
                                            <Label htmlFor="address">Address</Label>
                                            <Input
                                                id="address"
                                                value={newUser.address}
                                                onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                                                placeholder="Enter street address"
                                                className="h-11"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="city">City</Label>
                                                <Input
                                                    id="city"
                                                    value={newUser.city}
                                                    onChange={(e) => setNewUser({ ...newUser, city: e.target.value })}
                                                    placeholder="Enter city"
                                                    className="h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="state">State/Region</Label>
                                                <Input
                                                    id="state"
                                                    value={newUser.state}
                                                    onChange={(e) => setNewUser({ ...newUser, state: e.target.value })}
                                                    placeholder="Enter state or region"
                                                    className="h-11"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="country">Country</Label>
                                                <Select
                                                    value={newUser.country}
                                                    onValueChange={(value) => setNewUser({ ...newUser, country: value })}
                                                >
                                                    <SelectTrigger id="country" className="h-11">
                                                        <SelectValue placeholder="Select country" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Ghana">Ghana</SelectItem>
                                                        <SelectItem value="Nigeria">Nigeria</SelectItem>
                                                        <SelectItem value="Kenya">Kenya</SelectItem>
                                                        <SelectItem value="South Africa">South Africa</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="postalCode">Postal Code</Label>
                                                <Input
                                                    id="postalCode"
                                                    value={newUser.postalCode}
                                                    onChange={(e) => setNewUser({ ...newUser, postalCode: e.target.value })}
                                                    placeholder="Enter postal code"
                                                    className="h-11"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end space-x-2 pt-4">
                                            <Button variant="outline" onClick={() => setIsCreatingUser(false)} className="h-11">
                                                Cancel
                                            </Button>
                                            <Button onClick={handleCreateUser} className="h-11">
                                                {userCreationLoading ? <Loader size="small" /> : "Create Customer"}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push("/products")}
                                    className="h-11 w-full sm:w-auto order-2 sm:order-1"
                                >
                                    Back to Products
                                </Button>
                                <Button
                                    onClick={goToNextStep}
                                    disabled={!selectedUser && !isCreatingUser}
                                    className="h-11 w-full sm:w-auto order-1 sm:order-2"
                                >
                                    Continue to Shipping
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* Step 2: Shipping Information */}
                    {step === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Shipping Information</CardTitle>
                                <CardDescription>Select a shipping address and delivery method</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Shipping Address</h3>

                                    <RadioGroup value={selectedAddress as any} onValueChange={(value) => setSelectedAddress(value as any)} className="space-y-3">
                                        {userWithAdress?.addresses?.map((address) => (
                                            <div
                                                key={address._id}
                                                className={cn(
                                                    "flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-all",
                                                    selectedAddress === (address as any)._id ? "border-primary bg-primary/5" : "hover:border-primary/50",
                                                )}
                                                onClick={() => setSelectedAddress((address as any)._id)}
                                            >
                                                <RadioGroupItem value={(address as any)._id} id={(address as any)._id} className="mt-1" />
                                                <div className="flex-1">
                                                    <Label htmlFor={address._id} className="cursor-pointer">
                                                        <div className="font-medium">
                                                            {userWithAdress.firstName} {userWithAdress.lastName}
                                                            {(address as any).default && (
                                                                <Badge variant="outline" className="ml-2 bg-primary/10">
                                                                    Default
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            {address.address}, {address.city}, {address.state} {address.postalCode}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">{address.country}</div>
                                                    </Label>
                                                </div>
                                            </div>
                                        ))}
                                    </RadioGroup>

                                    {/* <Button variant="outline" className="w-full h-11">
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add New Address
                                    </Button> */}
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Shipping Method</h3>

                                    <RadioGroup
                                        value={selectedShippingMethod}
                                        onValueChange={setSelectedShippingMethod}
                                        className="space-y-3"
                                    >
                                        {availableShippingMethods.map((method) => (
                                            <div
                                                key={method.id}
                                                className={cn(
                                                    "flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-all",
                                                    selectedShippingMethod === method.id
                                                        ? "border-primary bg-primary/5"
                                                        : "hover:border-primary/50",
                                                )}
                                                onClick={() => setSelectedShippingMethod(method.id)}
                                            >
                                                <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                                                <div className="flex-1">
                                                    <Label htmlFor={method.id} className="flex items-center justify-between cursor-pointer">
                                                        <span className="font-medium">{method.name}</span>
                                                        <span className="font-medium">
                                                            {method.price === 0 ? "Free" : formatCurrency(method.price)}
                                                        </span>
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Add any special delivery instructions..."
                                        className="resize-none min-h-[100px]"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                                <Button
                                    variant="outline"
                                    onClick={goToPreviousStep}
                                    className="h-11 w-full sm:w-auto order-2 sm:order-1"
                                >
                                    Back to Customer
                                </Button>
                                <Button
                                    onClick={goToNextStep}
                                    disabled={!selectedAddress}
                                    className="h-11 w-full sm:w-auto order-1 sm:order-2"
                                >
                                    Continue to Payment
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* Step 3: Payment Information */}
                    {step === 3 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Information</CardTitle>
                                <CardDescription>Select a payment method and payment status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Payment Method</h3>

                                    <RadioGroup
                                        value={selectedPaymentMethod}
                                        onValueChange={setSelectedPaymentMethod}
                                        className="space-y-3"
                                    >
                                        {availablePaymentMethods.map((method) => (
                                            <div
                                                key={method.id}
                                                className={cn(
                                                    "flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-all",
                                                    selectedPaymentMethod === method.id
                                                        ? "border-primary bg-primary/5"
                                                        : "hover:border-primary/50",
                                                )}
                                                onClick={() => setSelectedPaymentMethod(method.id)}
                                            >
                                                <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                                                <div className="flex-1">
                                                    <Label htmlFor={method.id} className="flex items-center justify-between cursor-pointer">
                                                        <div className="flex items-center">
                                                            <method.icon className="h-5 w-5 mr-2 text-muted-foreground" />
                                                            <span className="font-medium">{method.name}</span>
                                                        </div>
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Payment Status</h3>

                                    {isPaystackPayment ? (
                                        <div className="rounded-lg border border-primary bg-primary/5 p-4">
                                            <div className="font-medium">Paystack Checkout</div>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                The order will be created as pending, then Paystack will collect and verify the payment.
                                            </p>
                                        </div>
                                    ) : (
                                        <RadioGroup
                                            value={paymentStatus}
                                            onValueChange={(value: "paid" | "pending") => setPaymentStatus(value)}
                                            className="space-y-3"
                                        >
                                            <div
                                                className={cn(
                                                    "flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-all",
                                                    paymentStatus === "paid" ? "border-primary bg-primary/5" : "hover:border-primary/50",
                                                )}
                                                onClick={() => setPaymentStatus("paid")}
                                            >
                                                <RadioGroupItem value="paid" id="paid" className="mt-1" />
                                                <div className="flex-1">
                                                    <Label htmlFor="paid" className="flex items-center cursor-pointer">
                                                        <span className="font-medium">Paid</span>
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground mt-1">Mark this order as already paid</p>
                                                </div>
                                            </div>

                                            <div
                                                className={cn(
                                                    "flex items-start space-x-3 border rounded-lg p-4 cursor-pointer transition-all",
                                                    paymentStatus === "pending" ? "border-primary bg-primary/5" : "hover:border-primary/50",
                                                )}
                                                onClick={() => setPaymentStatus("pending")}
                                            >
                                                <RadioGroupItem value="pending" id="pending" className="mt-1" />
                                                <div className="flex-1">
                                                    <Label htmlFor="pending" className="flex items-center cursor-pointer">
                                                        <span className="font-medium">Pending Payment</span>
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground mt-1">Payment will be collected later</p>
                                                </div>
                                            </div>
                                        </RadioGroup>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="adminNotes">Admin Notes (Internal Only)</Label>
                                    <Textarea
                                        id="adminNotes"
                                        placeholder="Add any internal notes about this order..."
                                        className="resize-none min-h-[100px]"
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                                <Button
                                    variant="outline"
                                    onClick={goToPreviousStep}
                                    className="h-11 w-full sm:w-auto order-2 sm:order-1"
                                >
                                    Back to Shipping
                                </Button>
                                <Button onClick={goToNextStep} className="h-11 w-full sm:w-auto order-1 sm:order-2">
                                    Review Order
                                </Button>
                            </CardFooter>
                        </Card>
                    )}

                    {/* Step 4: Order Review */}
                    {step === 4 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Review Order</CardTitle>
                                <CardDescription>Review order details before creating it</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Order Summary</h3>

                                    <div className="border rounded-lg divide-y">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex items-center p-4 gap-4">
                                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                                                    <Image
                                                        src={item.image || "/placeholder.svg"}
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium">{item.name}</h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        Qty: {item.quantity}
                                                    </p>
                                                    {(item.selectedSize || item.selectedColor) && (
                                                        <p className="text-xs text-muted-foreground">
                                                            {[item.selectedSize, item.selectedColor].filter(Boolean).join(" / ")}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Customer</h3>

                                        {selectedUser && (
                                            <div className="bg-muted/30 p-4 rounded-lg">
                                                <div className="font-medium">
                                                    {selectedUser.firstName} {selectedUser.lastName}
                                                </div>
                                                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                                                <div className="text-sm text-muted-foreground">{selectedUser.phone}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Shipping Address</h3>

                                        {selectedUser && selectedAddress && (
                                            <div className="bg-muted/30 p-4 rounded-lg">
                                                {userWithAdress?.addresses
                                                    .filter((address: any) => address._id === selectedAddress)
                                                    .map((address: any) => (
                                                        <div key={address._id}>
                                                            <div className="font-medium">
                                                                {selectedUser.firstName} {selectedUser.lastName}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground mt-1">
                                                                {address.address}, {address.city}, {address.state} {address.postalCode}
                                                            </div>
                                                            <div className="text-sm text-muted-foreground">{address.country}</div>
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Shipping Method</h3>

                                        <div className="bg-muted/30 p-4 rounded-lg">
                                            {availableShippingMethods
                                                .filter((method) => method.id === selectedShippingMethod)
                                                .map((method) => (
                                                    <div key={method.id}>
                                                        <div className="font-medium">{method.name}</div>
                                                        <div className="text-sm text-muted-foreground">{method.description}</div>
                                                        <div className="text-sm font-medium mt-1">
                                                            {method.price === 0 ? "Free" : formatCurrency(method.price)}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Payment Method</h3>

                                        <div className="bg-muted/30 p-4 rounded-lg">
                                            {availablePaymentMethods
                                                .filter((method) => method.id === selectedPaymentMethod)
                                                .map((method) => (
                                                    <div key={method.id}>
                                                        <div className="font-medium">{method.name}</div>
                                                        <div className="text-sm text-muted-foreground">{method.description}</div>
                                                        <div className="text-sm font-medium mt-1">
                                                            Status:{" "}
                                                            <Badge variant={!isPaystackPayment && paymentStatus === "paid" ? "default" : "secondary"}>
                                                                {isPaystackPayment
                                                                    ? "Paystack verification"
                                                                    : paymentStatus === "paid"
                                                                        ? "Paid"
                                                                        : "Pending Payment"}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                </div>

                                {adminNotes && (
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-medium">Admin Notes</h3>
                                        <div className="bg-muted/30 p-4 rounded-lg">
                                            <p className="text-sm">{adminNotes}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-muted/30 p-4 rounded-lg">
                                    <div className="flex items-center mb-2">
                                        <Info className="h-4 w-4 text-muted-foreground mr-2" />
                                        <span className="text-sm font-medium">Order Information</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        You are creating this order as an administrator. The customer will be notified once the order is
                                        created. Orders marked as "Pending Payment" will be held until payment is received.
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                                <Button
                                    variant="outline"
                                    onClick={goToPreviousStep}
                                    className="h-11 w-full sm:w-auto order-2 sm:order-1"
                                >
                                    Back to Payment
                                </Button>
                                <Button
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing}
                                    className="h-11 w-full sm:w-auto order-1 sm:order-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        isPaystackPayment ? "Create Order & Pay with Paystack" : "Create Order"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    )}
                </div>

                {/* Order summary sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Cart items */}
                            <div className="space-y-3">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex justify-between">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium mr-1">{item.quantity}x</span>
                                            <span className="text-sm">
                                                {item.name}
                                                {(item.selectedSize || item.selectedColor) &&
                                                    ` (${[item.selectedSize, item.selectedColor].filter(Boolean).join(" / ")})`}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>

                            <Separator />

                            {/* Order totals */}
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-sm">Subtotal</span>
                                    <span className="text-sm font-medium">{formatCurrency(subtotal)}</span>
                                </div>

                                {discountApplied && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="text-sm">Discount (10%)</span>
                                        <span className="text-sm font-medium">-{formatCurrency(discount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between">
                                    <span className="text-sm">Shipping</span>
                                    <span className="text-sm font-medium">{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-sm">Tax (5%)</span>
                                    <span className="text-sm font-medium">{formatCurrency(tax)}</span>
                                </div>

                                <Separator />

                                <div className="flex justify-between">
                                    <span className="font-medium">Total</span>
                                    <span className="font-bold text-lg">{formatCurrency(total)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Admin Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <ShoppingBag className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium">Order Management</h4>
                                    <p className="text-sm text-muted-foreground">
                                        You can manage this order after creation in the Orders section
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium">Payment Processing</h4>
                                    <p className="text-sm text-muted-foreground">You can update payment status after order creation</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-medium">Customer Notification</h4>
                                    <p className="text-sm text-muted-foreground">
                                        The customer will be notified via email when the order is created
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

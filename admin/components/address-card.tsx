import { format } from "date-fns"
import { Building, Calendar, Mail, MapPin, Phone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Address {
    address: string
    city: string
    state: string
    country: string
    postalCode: string
    phoneNumber: string
    email: string
    createdAt: string
    updatedAt: string
    isDefault?: boolean
}

interface AddressCardProps {
    addresses: Address[]
    title?: string
}

export default function AddressCard({ addresses, title = "Addresses" }: AddressCardProps) {
    if (!addresses || addresses.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-bold">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <MapPin className="h-12 w-12 text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">No addresses found</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {addresses.map((address, index) => (
                    <div key={index} className="space-y-4">
                        {index > 0 && <Separator />}
                        <div className="flex items-start justify-between">
                            <div className="flex items-center">
                                <MapPin className="h-5 w-5 text-primary mr-2" />
                                <h3 className="font-medium">Address {index + 1}</h3>
                            </div>
                            {address.isDefault && (
                                <Badge variant="outline" className="bg-primary/10">
                                    Default
                                </Badge>
                            )}
                        </div>

                        <div className="grid gap-3">
                            <div className="flex items-start">
                                <Building className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
                                <div>
                                    <p>{address.address}</p>
                                    <p>
                                        {address.city}, {address.state} {address.postalCode}
                                    </p>
                                    <p>{address.country}</p>
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-2" />
                                <p>
                                    Added: {format(new Date(address.createdAt), "MMM d, yyyy")} • Updated:{" "}
                                    {format(new Date(address.updatedAt), "MMM d, yyyy")}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}


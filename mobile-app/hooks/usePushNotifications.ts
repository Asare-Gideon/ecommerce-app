import { useAuthStore } from "@/store/auth"
import { useNotificationStore } from "@/store/notifications"
import Constants from "expo-constants"
import { router } from "expo-router"
import { useEffect } from "react"
import { Platform } from "react-native"

type NotificationsModule = typeof import("expo-notifications")

const isAndroidExpoGo = () =>
    Platform.OS === "android" && Constants.executionEnvironment === "storeClient"

const getProjectId = () =>
    Constants.expoConfig?.extra?.eas?.projectId ||
    (Constants as any).easConfig?.projectId ||
    (Constants as any).manifest2?.extra?.eas?.projectId

const hasNotificationPermission = (permissions: unknown) => {
    const value = permissions as { granted?: boolean; status?: string }
    return value.granted === true || value.status === "granted"
}

const openNotificationTarget = (data: Record<string, unknown>) => {
    const entityType = String(data.entityType || "")
    const entityId = String(data.entityId || "")

    setTimeout(() => {
        if (entityType === "order" && entityId) {
            router.push({ pathname: "/pages/orders/details" as any, params: { id: entityId } as any })
            return
        }

        router.push("/pages/notifications" as any)
    }, 0)
}

export function usePushNotifications() {
    const { isAuthenticated, hasHydrated } = useAuthStore()
    const { fetchNotifications, registerPushToken } = useNotificationStore()

    useEffect(() => {
        if (!hasHydrated || !isAuthenticated || Platform.OS === "web" || isAndroidExpoGo()) return

        let isMounted = true
        let responseSubscription: { remove: () => void } | undefined
        let receiveSubscription: { remove: () => void } | undefined

        const setupPushNotifications = async () => {
            try {
                const Notifications: NotificationsModule = await import("expo-notifications")
                if (!isMounted) return

                Notifications.setNotificationHandler({
                    handleNotification: async () => ({
                        shouldShowAlert: true,
                        shouldShowBanner: true,
                        shouldShowList: true,
                        shouldPlaySound: true,
                        shouldSetBadge: true,
                    }),
                })

                responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
                    openNotificationTarget(response.notification.request.content.data || {})
                })

                receiveSubscription = Notifications.addNotificationReceivedListener(() => {
                    fetchNotifications()
                })

                if (Platform.OS === "android") {
                    await Notifications.setNotificationChannelAsync("default", {
                        name: "default",
                        importance: Notifications.AndroidImportance.MAX,
                        vibrationPattern: [0, 250, 250, 250],
                        lightColor: "#6366F1",
                    })
                }

                const currentPermissions = await Notifications.getPermissionsAsync()
                let isGranted = hasNotificationPermission(currentPermissions)

                if (!isGranted) {
                    const requestedPermissions = await Notifications.requestPermissionsAsync()
                    isGranted = hasNotificationPermission(requestedPermissions)
                }

                if (!isGranted || !isMounted) return

                const projectId = getProjectId()
                const tokenResponse = await Notifications.getExpoPushTokenAsync(
                    projectId ? { projectId } : undefined,
                )

                await registerPushToken(
                    tokenResponse.data,
                    Platform.OS,
                    (Constants as any).sessionId || (Constants as any).installationId || "",
                )
            } catch (error) {
                console.log("Failed to register push notifications", error)
            }
        }

        setupPushNotifications()

        return () => {
            isMounted = false
            responseSubscription?.remove()
            receiveSubscription?.remove()
        }
    }, [fetchNotifications, hasHydrated, isAuthenticated, registerPushToken])
}

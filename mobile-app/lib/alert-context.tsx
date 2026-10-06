"use client"

import type React from "react"
import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import Alert, { type AlertType } from "../components/ui/alert"

interface AlertContextProps {
    showAlert: (type: AlertType, message: string, duration?: number) => void
    hideAlert: () => void
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined)

interface AlertProviderProps {
    children: ReactNode
}

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
    const [visible, setVisible] = useState(false)
    const [alertType, setAlertType] = useState<AlertType>("info")
    const [message, setMessage] = useState("")
    const [duration, setDuration] = useState(3000)

    const showAlert = useCallback((type: AlertType, msg: string, dur = 3000) => {
        setAlertType(type)
        setMessage(msg)
        setDuration(dur)
        setVisible(true)
    }, [])

    const hideAlert = useCallback(() => {
        setVisible(false)
    }, [])

    return (
        <AlertContext.Provider value={{ showAlert, hideAlert }}>
            {children}
            <Alert visible={visible} type={alertType} message={message} onClose={hideAlert} duration={duration} />
        </AlertContext.Provider>
    )
}

export const useAlert = (): AlertContextProps => {
    const context = useContext(AlertContext)
    if (!context) {
        throw new Error("useAlert must be used within an AlertProvider")
    }
    return context
}

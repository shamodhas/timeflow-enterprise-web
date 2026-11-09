import toast from "react-hot-toast"

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      style: {
        background: "#10B981",
        color: "#FFFFFF",
        padding: "12px 16px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: "500"
      },
      iconTheme: {
        primary: "#FFFFFF",
        secondary: "#10B981"
      }
    })
  },
  error: (message: string) => {
    toast.error(message, {
      style: {
        background: "#EF4444",
        color: "#FFFFFF",
        padding: "12px 16px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: "500"
      },
      iconTheme: {
        primary: "#FFFFFF",
        secondary: "#EF4444"
      }
    })
  },
  warning: (message: string) => {
    toast(message, {
      icon: "⚠️",
      style: {
        background: "#F59E0B",
        color: "#FFFFFF",
        padding: "12px 16px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: "500"
      }
    })
  },
  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: "#3B82F6",
        color: "#FFFFFF",
        padding: "12px 16px",
        borderRadius: "10px",
        fontSize: "14px",
        fontWeight: "500"
      }
    })
  },
  dismiss: (toastId: string) => {
    toast.dismiss(toastId)
  }
}

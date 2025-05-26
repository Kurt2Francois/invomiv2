import { Timestamp } from "firebase/firestore"

export const convertToDate = (value: Date | Timestamp | string): Date => {
  if (value instanceof Date) return value
  if (value instanceof Timestamp) return value.toDate()
  return new Date(value)
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (dateString === today.toISOString().split('T')[0]) {
    return "Today"
  } else if (dateString === yesterday.toISOString().split('T')[0]) {
    return "Yesterday"
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  })
}

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  })
}

export const getDateKey = (date: Date | Timestamp): string => {
  const converted = convertToDate(date)
  return converted.toISOString().split('T')[0]
}
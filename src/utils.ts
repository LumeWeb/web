import { formatDistanceToNow } from "date-fns"

// Utility function to format dates
export const formatDate = (date: string | Date) => {
    const distance = formatDistanceToNow(new Date(date), { addSuffix: true })
    return distance
      .replace(/less than a minute?/, "<1m")
      .replace(/ minutes?/, "m")
      .replace(/ hours?/, "h")
      .replace(/ days?/, "d")
      .replace(/ weeks?/, "w")
  }
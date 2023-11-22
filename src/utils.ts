import { formatDistanceToNow } from "date-fns"

// Utility function to format dates
export const formatDate = (date: string | Date) => {
  const _date = new Date(date)
  const distance = formatDistanceToNow(_date, { addSuffix: true })
  return distance
    .replace(/less than a minute?/, "<1m")
    .replace(/ minutes?/, "m")
    .replace(/ hours?/, "h")
    .replace(/ days?/, "d")
    .replace(/ weeks?/, "w")
}

export async function getResults({
  query
}: {
  query?: string
}): Promise<SearchResult[]> {
  if (!query) return []

  return [
    {
      id: 1,
      timestamp: new Date(),
      title: "Mock Title 1",
      description: "Mock Description 1",
      slug: "hello-world"
    },
    {
      id: 2,
      timestamp: new Date(),
      title: "Mock Title 2",
      description: "Mock Description 2",
      slug: "hello-world-2"
    }
  ]
}

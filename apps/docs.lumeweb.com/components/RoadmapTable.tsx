import React from 'react'

interface Activity {
  icon: string
  title: string
  description: string
}

interface Quarter {
  quarter: string
  focusArea: string
  activities: Activity[]
}

interface RoadmapSection {
  year: string
  quarters: Quarter[]
}

const RoadmapTable: React.FC<{section: RoadmapSection}> = ({section}) => {
  return (
    <div className="my-12">
      <h2 className="text-3xl font-bold mb-6">{section.year}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-[var(--vocs-color-background2)] border border-[var(--vocs-color-border)]">
          <thead>
            <tr>
              <th className="p-5 text-left font-bold bg-[var(--vocs-color-background)] border border-[var(--vocs-color-border)] text-lg">Quarter</th>
              <th className="p-5 text-left font-bold bg-[var(--vocs-color-background)] border border-[var(--vocs-color-border)] text-lg">Focus Area</th>
              <th className="p-5 text-left font-bold bg-[var(--vocs-color-background)] border border-[var(--vocs-color-border)] text-lg">Activities</th>
            </tr>
          </thead>
          <tbody>
            {section.quarters.map((quarter, i) => (
              <tr key={i} className="hover:bg-[var(--vocs-color-background)]">
                <td className="p-5 border border-[var(--vocs-color-border)] w-24 whitespace-nowrap align-top font-medium">{quarter.quarter}</td>
                <td className="p-5 border border-[var(--vocs-color-border)] w-48 align-top font-medium">{quarter.focusArea}</td>
                <td className="p-5 border border-[var(--vocs-color-border)]">
                  <ul className="space-y-4">
                    {quarter.activities.map((activity, j) => (
                      <li key={j} className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 text-center text-xl">{activity.icon}</span>
                        <span className="flex-1">
                          <strong className="text-[var(--vocs-color-textAccent)] mr-2 font-bold">{activity.title}</strong>
                          {activity.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default RoadmapTable

import { cn } from "@/lib/utils";

interface Differentiator {
  factor: string;
  traditional: string;
  pinnerPrivate: string;
  pinnerPublic: string;
}

const differentiators: Differentiator[] = [
  {
    factor: "Can we read your data?",
    traditional: "Yes, technically",
    pinnerPrivate: "No, zero-knowledge design",
    pinnerPublic: "Yes, but it's public",
  },
  {
    factor: "Pricing",
    traditional: "Complex tiers, hidden fees",
    pinnerPrivate: "Simple, pay for what you store",
    pinnerPublic: "Simple, pay for what you store",
  },
  {
    factor: "Ownership",
    traditional: "They can delete your data",
    pinnerPrivate: "Your data, your rules",
    pinnerPublic: "Your data, your rules",
  },
  {
    factor: "Lock-in",
    traditional: "Export fees, proprietary formats",
    pinnerPrivate: "Open standards, leave anytime",
    pinnerPublic: "Open standards, leave anytime",
  },
  {
    factor: "Infrastructure",
    traditional: "Centralized data centers",
    pinnerPrivate: "Distributed network",
    pinnerPublic: "Distributed network",
  },
];

export default function DifferentiatorsSection() {
  return (
    <>
      <h2 className="text-content-text bg-white pb-4 text-center text-[25px] leading-tight font-medium md:text-[32px] lg:pb-8 lg:text-[40px]">
        Why Pinner?
      </h2>
      <div className="mx-auto w-full md:w-3/4">
        <div className="overflow-x-auto border py-12">
          <table class="w-full overflow-hidden rounded-lg">
            <thead>
              <tr className="border-content-divider border-b">
                <th className="bg-content-section-gray text-content-text px-4 pt-4 pb-4 text-left text-sm font-semibold">
                  Factor
                </th>
                <th className="bg-content-section-gray text-content-text-muted px-4 pt-4 pb-4 text-left text-sm font-semibold">
                  Traditional Cloud
                </th>
                <th className="text-content-text bg-white px-4 pt-4 pb-4 text-left text-sm font-semibold">
                  Pinner (Private)
                </th>
                <th className="text-content-text bg-white px-4 pt-4 pb-4 text-left text-sm font-semibold">
                  Pinner (Public)
                </th>
              </tr>
            </thead>
            <tbody>
              {differentiators.map((d) => (
                <tr
                  key={d.factor}
                  className="border-content-divider/50 border-b last:border-0">
                  <td className="bg-content-section-gray text-content-text px-4 py-4 text-sm font-medium">
                    {d.factor}
                  </td>
                  <td className="bg-content-section-gray text-content-text-muted px-4 py-4 text-sm">
                    {d.traditional}
                  </td>
                  <td className="text-content-text bg-white px-4 py-4 text-sm">
                    {d.pinnerPrivate}
                  </td>
                  <td className="text-content-text bg-white px-4 py-4 text-sm">
                    {d.pinnerPublic}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

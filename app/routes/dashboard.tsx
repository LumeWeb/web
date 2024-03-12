import { GeneralLayout } from "~/components/general-layout";
import { UpgradeAccountBanner } from "~/components/upgrade-account-banner";
import { UsageCard, UsageList } from "~/components/usage-card";
import { UsageChart } from "~/components/usage-chart";

export default function Dashboard() {
    const isLogged = true;
    if (!isLogged) {
        window.location.href = "/login";
    }

    return (
        <GeneralLayout>
            <h1 className="font-bold mb-4 text-lg">Dashboard</h1>
            <UpgradeAccountBanner />
            <h2 className="font-bold mb-8 mt-10">Current Usage</h2>
            <UsageList>
                <UsageCard
                    usageName="Storage"
                    currentUsage={120}
                    monthlyUsage={130}
                    icon={<CloudIcon className="text-ring" />}
                />
                <UsageCard
                    usageName="Download"
                    currentUsage={2}
                    monthlyUsage={10}
                    icon={<CloudDonwloadIcon className="text-ring" />}
                />
                <UsageCard
                    usageName="Upload"
                    currentUsage={5}
                    monthlyUsage={15}
                    icon={<CloudUploadIcon className="text-ring" />}
                />
            </UsageList>
            <h2 className="font-bold mb-8 mt-10">Historical Usage</h2>
            <div className="grid gap-8 grid-cols-2">
                <UsageChart
                    dataset={[
                        { x: "3/2", y: 50 },
                        { x: "3/3", y: 10 },
                        { x: "3/4", y: 20 },
                    ]}
                    usageName="Storage"
                />
                <UsageChart
                    dataset={[
                        { x: "3/2", y: 50 },
                        { x: "3/3", y: 10 },
                        { x: "3/4", y: 20 },
                    ]}
                    usageName="Download"
                />
                <UsageChart
                    dataset={[
                        { x: "3/2", y: 50 },
                        { x: "3/3", y: 10 },
                        { x: "3/4", y: 20 },
                    ]}
                    usageName="Upload"
                />
            </div>
        </GeneralLayout>
    );
}

const CloudIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            width="27"
            height="27"
            viewBox="0 0 27 27"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g clipPath="url(#clip0_290_790)">
                <path
                    d="M23.2503 12.7002C23.247 12.7002 23.2419 12.7019 23.2385 12.7019C23.5271 11.3418 23.4697 9.85681 22.739 8.27731C21.7046 6.04137 19.5868 4.37075 17.145 4.06025C13.7497 3.62825 10.7477 5.56381 9.55122 8.441C9.14791 8.28575 8.70916 8.19969 8.25016 8.19969C6.1796 8.19969 4.50054 9.87875 4.50054 11.9493C4.50054 12.2463 4.54272 12.5298 4.60854 12.8066C3.7091 12.5956 2.7236 12.6192 1.52885 13.5845C0.641224 14.3034 -0.0118379 15.3496 -2.54025e-05 16.4921C0.0235996 18.5441 1.69254 20.1995 3.7496 20.1995H23.0698C24.8231 20.1995 26.4768 19.0841 26.8869 17.3797C27.4826 14.9058 25.6247 12.7002 23.2503 12.7002Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath id="clip0_290_790">
                    <rect width="27" height="27" fill="currentColor" />
                </clipPath>
            </defs>
        </svg>
    );
};

const CloudDonwloadIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            width="25"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g clipPath="url(#clip0_290_792)">
                <path
                    d="M18.9 7C18.2 3.6 15.2 1 11.5 1C8.6 1 6.1 2.6 4.9 5C1.8 5.4 -0.5 7.9 -0.5 11C-0.5 14.3 2.2 17 5.5 17H18.5C21.3 17 23.5 14.8 23.5 12C23.5 9.4 21.4 7.2 18.9 7ZM16.5 10L11.5 15L6.5 10H9.5V6H13.5V10H16.5Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath id="clip0_290_792">
                    <rect width="25" height="24" fill="currentColor" />
                </clipPath>
            </defs>
        </svg>
    );
};

const CloudUploadIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            width="24"
            height="16"
            viewBox="0 0 24 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M19.4 6C18.7 2.6 15.7 0 12 0C9.1 0 6.6 1.6 5.4 4C2.3 4.4 0 6.9 0 10C0 13.3 2.7 16 6 16H19C21.8 16 24 13.8 24 11C24 8.4 21.9 6.2 19.4 6ZM14 9V13H10V9H7L12 4L17 9H14Z"
                fill="currentColor"
            />
        </svg>
    );
};

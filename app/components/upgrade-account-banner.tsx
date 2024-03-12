import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";

export const UpgradeAccountBanner = () => {
    return (
        <div className="flex items-center justify-between p-8 border border-ring rounded-lg bg-secondary-1">
            <div className="flex items-center gap-x-4">
                <Avatar className="border-2 border-ring h-20 w-20" />
                <div>
                    <div className="flex items-center gap-x-2 font-bold">
                        wirtly
                        <CrownIcon className="text-ring" />
                    </div>
                    <div className="flex gap-x-5 mt-2">
                        <div className="flex items-center gap-x-2 text-white text-sm">
                            <PersonIcon />
                            Lite Account (upgrade)
                        </div>
                        <div className="flex items-center gap-x-2 text-white text-sm">
                            <CloudIcon />
                            120 GB / 130 GB
                        </div>
                        <div className="flex items-center gap-x-2 text-white text-sm">
                            <CloudDonwloadIcon />
                            10 GB / 25 GB
                        </div>
                        <div className="flex items-center gap-x-2 text-white text-sm">
                            <CheckRoundedIcon />
                            0% Free Usage
                        </div>
                    </div>
                </div>
            </div>
            <Button className="gap-x-2 py-6" variant="accent">
                <AddIcon />
                Upgrade to Premium
            </Button>
        </div>
    );
};

const CrownIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g clipPath="url(#clip0_320_192)">
                <path
                    d="M18.649 5.74215C18.4702 5.59292 18.2531 5.49694 18.0224 5.46517C17.7917 5.4334 17.5568 5.46711 17.3443 5.56246L13.3912 7.32028L11.0943 3.17965C10.9845 2.98634 10.8255 2.82557 10.6334 2.71373C10.4412 2.60189 10.2229 2.54297 10.0006 2.54297C9.77826 2.54297 9.55992 2.60189 9.36779 2.71373C9.17566 2.82557 9.0166 2.98634 8.90682 3.17965L6.60995 7.32028L2.65682 5.56246C2.44394 5.46725 2.20866 5.43349 1.97759 5.465C1.74652 5.49651 1.52888 5.59203 1.34926 5.74077C1.16964 5.8895 1.03521 6.08552 0.961163 6.30666C0.887119 6.5278 0.876414 6.76525 0.930259 6.99215L2.91463 15.4531C2.95258 15.6169 3.02338 15.7713 3.12276 15.9069C3.22213 16.0426 3.34801 16.1566 3.49276 16.2422C3.68873 16.3595 3.9128 16.4215 4.1412 16.4218C4.25222 16.4216 4.36268 16.4059 4.46932 16.375C8.08637 15.3749 11.907 15.3749 15.524 16.375C15.8543 16.4618 16.2055 16.414 16.5006 16.2422C16.6462 16.1577 16.7728 16.044 16.8723 15.9082C16.9718 15.7724 17.0421 15.6174 17.0787 15.4531L19.0709 6.99215C19.1241 6.76518 19.1128 6.52785 19.0383 6.30696C18.9637 6.08608 18.8289 5.89044 18.649 5.74215Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath id="clip0_320_192">
                    <rect width="20" height="20" fill="currentColor" />
                </clipPath>
            </defs>
        </svg>
    );
};

const PersonIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <g clipPath="url(#clip0_290_800)">
                <path
                    d="M9.99935 1.6665C5.39518 1.6665 1.66602 5.39567 1.66602 9.99984C1.66602 14.604 5.39518 18.3332 9.99935 18.3332C14.6035 18.3332 18.3327 14.604 18.3327 9.99984C18.3327 5.39567 14.6035 1.6665 9.99935 1.6665ZM9.99935 4.1665C11.3785 4.1665 12.4993 5.28734 12.4993 6.6665C12.4993 8.04984 11.3785 9.1665 9.99935 9.1665C8.62018 9.1665 7.49935 8.04984 7.49935 6.6665C7.49935 5.28734 8.62018 4.1665 9.99935 4.1665ZM9.99935 15.9998C7.91185 15.9998 6.07852 14.9332 4.99935 13.3165C5.02018 11.6623 8.33685 10.7498 9.99935 10.7498C11.6618 10.7498 14.9743 11.6623 14.9993 13.3165C13.9202 14.9332 12.0868 15.9998 9.99935 15.9998Z"
                    fill="currentColor"
                />
            </g>
            <defs>
                <clipPath id="clip0_290_800">
                    <rect width="20" height="20" fill="currentColor" />
                </clipPath>
            </defs>
        </svg>
    );
};

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

const CheckRoundedIcon = ({ className }: { className?: string }) => {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M9 1C7.36831 1 5.77325 1.48385 4.41655 2.39038C3.05984 3.2969 2.00242 4.58537 1.378 6.09286C0.753575 7.60035 0.590197 9.25915 0.908525 10.8595C1.22685 12.4598 2.01259 13.9298 3.16637 15.0836C4.32016 16.2374 5.79017 17.0231 7.39051 17.3415C8.99085 17.6598 10.6497 17.4964 12.1571 16.872C13.6646 16.2476 14.9531 15.1902 15.8596 13.8335C16.7661 12.4767 17.25 10.8817 17.25 9.25C17.25 7.06196 16.3808 4.96354 14.8336 3.41637C13.2865 1.86919 11.188 1 9 1ZM13.2803 7.53025L8.03025 12.7802C7.88961 12.9209 7.69888 12.9998 7.5 12.9998C7.30113 12.9998 7.1104 12.9209 6.96975 12.7802L4.71975 10.5302C4.58314 10.3888 4.50754 10.1993 4.50925 10.0027C4.51096 9.80605 4.58983 9.61794 4.72889 9.47889C4.86795 9.33983 5.05606 9.26095 5.2527 9.25924C5.44935 9.25753 5.6388 9.33313 5.78025 9.46975L7.5 11.1895L12.2198 6.46975C12.3612 6.33313 12.5507 6.25754 12.7473 6.25924C12.944 6.26095 13.1321 6.33983 13.2711 6.47889C13.4102 6.61794 13.4891 6.80605 13.4908 7.0027C13.4925 7.19935 13.4169 7.3888 13.2803 7.53025Z"
                fill="currentColor"
            />
        </svg>
    );
};


// TODO: Discuss duplicated icon definitions
const AddIcon = ({ className }: { className?: string }) => {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <g clipPath="url(#clip0_323_1258)">
          <path
            d="M9 1.5C4.85625 1.5 1.5 4.85625 1.5 9C1.5 13.1438 4.85625 16.5 9 16.5C13.1438 16.5 16.5 13.1438 16.5 9C16.5 4.85625 13.1438 1.5 9 1.5ZM12.75 9.75H9.75V12.75H8.25V9.75H5.25V8.25H8.25V5.25H9.75V8.25H12.75V9.75Z"
            fill="currentColor"
          />
        </g>
        <defs>
          <clipPath id="clip0_323_1258">
            <rect width="18" height="18" fill="currentColor" />
          </clipPath>
        </defs>
      </svg>
    );
  };

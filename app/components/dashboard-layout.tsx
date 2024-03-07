import { Button } from "~/components/ui/button"
import logoPng from "~/images/lume-logo.png?url"
import lumeColorLogoPng from "~/images/lume-color-logo.png?url"
import discordLogoPng from "~/images/discord-logo.png?url"
import { Link } from "@remix-run/react"

export const DashboardLayout = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <div className="p-10 h-full flex flex-row">
      <header className="w-full flex flex-col max-w-[240px] h-full">
        <img src={logoPng} alt="Lume logo" className="h-10 w-32" />

        <nav className="my-10 flex-1">
          <ul>
            <li>
              <Link to="/dashboard">
                <NavigationButton>
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Dashboard
                </NavigationButton>
              </Link>
            </li>
            <li>
              <Link to="/file-manager">
                <NavigationButton>
                  <DriveIcon className="w-5 h-5 mr-2" />
                  File Manager
                </NavigationButton>
              </Link>
            </li>
            <li>
              <Link to="/account">
                <NavigationButton>
                  <CircleLockIcon className="w-5 h-5 mr-2" />
                  Account
                </NavigationButton>
              </Link>
            </li>
          </ul>
        </nav>
        <span className="text-primary-2 mb-3 -space-y-1 opacity-40">
        <p>Freedom</p>
        <p>Privacy</p>
        <p>Ownership</p>
        </span>
        <Button className="w-[calc(100%-3rem)] font-semibold h-16">
          <CloudUploadIcon className="w-6 h-6 -ml-3 mr-4" />
          Upload Files
        </Button>
      </header>

      {children}

      <footer className="my-5">
        <ul className="flex flex-row">
          <li>
            <Link to="https://discord.lumeweb.com">
              <Button
                variant={"link"}
                className="flex flex-row gap-x-2 text-input-placeholder"
              >
                <img className="h-5" src={discordLogoPng} alt="Discord Logo" />
                Connect with us
              </Button>
            </Link>
          </li>
          <li>
            <Link to="https://lumeweb.com">
              <Button
                variant={"link"}
                className="flex flex-row gap-x-2 text-input-placeholder"
              >
                <img className="h-5" src={lumeColorLogoPng} alt="Lume Logo" />
                Connect with us
              </Button>
            </Link>
          </li>
        </ul>
      </footer>
    </div>
  )
}

const NavigationButton = ({ children }: React.PropsWithChildren) => {
  return (
    <Button variant="ghost" className="justify-start h-14 w-[calc(100%-3rem)] font-semibold">
      {children}
    </Button>
  )
}

const ClockIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      aria-hidden="true"
      width="23"
      height="23"
      viewBox="0 0 23 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M11.1703 1.8623C16.3127 1.8623 20.4812 6.03079 20.4812 11.1732C20.4812 16.3156 16.3127 20.4841 11.1703 20.4841C6.02786 20.4841 1.85938 16.3156 1.85938 11.1732C1.85938 6.03079 6.02786 1.8623 11.1703 1.8623ZM15.4496 6.89391C15.2596 6.70304 14.9598 6.67697 14.7391 6.83153C12.0483 8.71978 10.5306 9.83895 10.1824 10.1853C9.63769 10.7309 9.63769 11.6155 10.1824 12.1611C10.728 12.7058 11.6125 12.7058 12.1582 12.1611C12.3621 11.9562 13.4784 10.4376 15.5082 7.60154C15.6646 7.38366 15.6395 7.08385 15.4496 6.89391ZM16.2913 10.2421C15.7773 10.2421 15.3602 10.6592 15.3602 11.1732C15.3602 11.6872 15.7773 12.1043 16.2913 12.1043C16.8052 12.1043 17.2223 11.6872 17.2223 11.1732C17.2223 10.6592 16.8052 10.2421 16.2913 10.2421ZM6.04928 10.2421C5.53532 10.2421 5.11819 10.6592 5.11819 11.1732C5.11819 11.6872 5.53532 12.1043 6.04928 12.1043C6.56324 12.1043 6.98037 11.6872 6.98037 11.1732C6.98037 10.6592 6.56324 10.2421 6.04928 10.2421ZM8.20754 6.89391C7.84442 6.53079 7.25411 6.53079 6.89098 6.89391C6.52786 7.25704 6.52786 7.84642 6.89098 8.21047C7.25411 8.5736 7.84349 8.5736 8.20754 8.21047C8.57067 7.84735 8.57067 7.25704 8.20754 6.89391ZM11.1703 5.12112C10.6563 5.12112 10.2392 5.53825 10.2392 6.05221C10.2392 6.56617 10.6563 6.9833 11.1703 6.9833C11.6842 6.9833 12.1014 6.56617 12.1014 6.05221C12.1014 5.53825 11.6842 5.12112 11.1703 5.12112Z"
        fill="currentColor"
      />
    </svg>
  )
}

const CircleLockIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      aria-hidden="true"
      width="23"
      height="24"
      viewBox="0 0 23 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M11.1722 2.56738C16.3146 2.56738 20.4831 6.73587 20.4831 11.8783C20.4831 13.8671 19.8593 15.7106 18.7969 17.2237L15.8277 11.8783H18.6209C18.6208 10.1615 18.0277 8.49755 16.9419 7.16779C15.8561 5.83804 14.3443 4.92415 12.6623 4.58073C10.9802 4.23731 9.23121 4.48544 7.71106 5.28315C6.19092 6.08086 4.99298 7.37917 4.31989 8.95846C3.64681 10.5377 3.5399 12.301 4.01726 13.9501C4.49461 15.5991 5.52693 17.0326 6.93957 18.0082C8.3522 18.9837 10.0584 19.4413 11.7697 19.3036C13.4809 19.1659 15.092 18.4414 16.3305 17.2525L17.2597 18.9238C15.5699 20.388 13.4081 21.1925 11.1722 21.1892C6.02982 21.1892 1.86133 17.0207 1.86133 11.8783C1.86133 6.73587 6.02982 2.56738 11.1722 2.56738ZM11.1722 7.22283C11.913 7.22283 12.6235 7.51712 13.1474 8.04096C13.6712 8.5648 13.9655 9.27528 13.9655 10.0161V10.9472H14.8966V15.6026H7.44786V10.9472H8.37895V10.0161C8.37895 9.27528 8.67324 8.5648 9.19708 8.04096C9.72092 7.51712 10.4314 7.22283 11.1722 7.22283ZM11.1722 9.08501C10.9442 9.08504 10.7241 9.16877 10.5536 9.32031C10.3832 9.47185 10.2743 9.68067 10.2477 9.90716L10.2411 10.0161V10.9472H12.1033V10.0161C12.1033 9.78804 12.0196 9.56793 11.868 9.39751C11.7165 9.22709 11.5076 9.11821 11.2812 9.09153L11.1722 9.08501Z"
        fill="currentColor"
      />
    </svg>
  )
}

const DriveIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      aria-hidden="true"
      width="23"
      height="24"
      viewBox="0 0 23 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10.2417 2.68262V7.33806H7.44842L11.1728 11.0624L14.8971 7.33806H12.1039V2.68262H18.6215C18.8684 2.68262 19.1053 2.78071 19.2799 2.95533C19.4545 3.12994 19.5526 3.36677 19.5526 3.61371V20.3733C19.5526 20.6203 19.4545 20.8571 19.2799 21.0317C19.1053 21.2063 18.8684 21.3044 18.6215 21.3044H3.72406C3.47712 21.3044 3.24029 21.2063 3.06568 21.0317C2.89107 20.8571 2.79297 20.6203 2.79297 20.3733V3.61371C2.79297 3.36677 2.89107 3.12994 3.06568 2.95533C3.24029 2.78071 3.47712 2.68262 3.72406 2.68262H10.2417ZM17.6904 15.7179H4.65515V19.4422H17.6904V15.7179ZM15.8282 16.649V18.5111H13.966V16.649H15.8282Z"
        fill="currentColor"
      />
    </svg>
  )
}

const CloudUploadIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M17.6461 8.20671C17.0642 6.80272 16.0599 5.63779 14.7871 4.89044C13.5144 4.14309 12.0433 3.85454 10.5994 4.06902C9.15553 4.2835 7.81844 4.98916 6.79304 6.07789C5.76764 7.16661 5.1105 8.57833 4.92232 10.0967C4.01431 10.325 3.21777 10.8955 2.68397 11.6999C2.15018 12.5043 1.9163 13.4864 2.02676 14.4599C2.13722 15.4334 2.58431 16.3304 3.28314 16.9806C3.98198 17.6307 4.88387 17.9888 5.81756 17.9867C6.07014 17.9867 6.31239 17.8814 6.49099 17.6938C6.6696 17.5063 6.76994 17.2519 6.76994 16.9867C6.76994 16.7215 6.6696 16.4671 6.49099 16.2796C6.31239 16.0921 6.07014 15.9867 5.81756 15.9867C5.31238 15.9867 4.8279 15.776 4.47069 15.4009C4.11347 15.0259 3.9128 14.5171 3.9128 13.9867C3.9128 13.4563 4.11347 12.9476 4.47069 12.5725C4.8279 12.1974 5.31238 11.9867 5.81756 11.9867C6.07014 11.9867 6.31239 11.8814 6.49099 11.6938C6.6696 11.5063 6.76994 11.2519 6.76994 10.9867C6.77237 9.80399 7.17402 8.66046 7.90353 7.75929C8.63304 6.85813 9.64317 6.25766 10.7545 6.06459C11.8658 5.87151 13.0063 6.09832 13.9733 6.70472C14.9404 7.31112 15.6715 8.25785 16.0366 9.37671C16.091 9.54855 16.1889 9.70164 16.3197 9.81964C16.4506 9.93765 16.6095 10.0161 16.7795 10.0467C17.4138 10.1726 17.9889 10.5203 18.4109 11.0332C18.833 11.5462 19.0771 12.1941 19.1036 12.8714C19.1302 13.5486 18.9374 14.2154 18.5569 14.7629C18.1763 15.3105 17.6304 15.7066 17.008 15.8867C16.763 15.953 16.5531 16.1188 16.4245 16.3476C16.2959 16.5764 16.2592 16.8495 16.3223 17.1067C16.3855 17.364 16.5434 17.5844 16.7613 17.7194C16.9792 17.8544 17.2392 17.893 17.4842 17.8267C18.4865 17.5486 19.375 16.9347 20.0147 16.0782C20.6544 15.2217 21.0105 14.1693 21.0288 13.081C21.0471 11.9926 20.7267 10.9278 20.1162 10.048C19.5057 9.16831 18.6384 8.52181 17.6461 8.20671ZM12.208 10.2767C12.1175 10.1857 12.0107 10.1143 11.8937 10.0667C11.6619 9.96669 11.4018 9.96669 11.1699 10.0667C11.053 10.1143 10.9462 10.1857 10.8557 10.2767L7.99851 13.2767C7.81917 13.465 7.71842 13.7204 7.71842 13.9867C7.71842 14.253 7.81917 14.5084 7.99851 14.6967C8.17785 14.885 8.42108 14.9908 8.6747 14.9908C8.92832 14.9908 9.17155 14.885 9.35089 14.6967L10.5795 13.3967V18.9867C10.5795 19.2519 10.6798 19.5063 10.8584 19.6938C11.037 19.8814 11.2793 19.9867 11.5318 19.9867C11.7844 19.9867 12.0267 19.8814 12.2053 19.6938C12.3839 19.5063 12.4842 19.2519 12.4842 18.9867V13.3967L13.7128 14.6967C13.8013 14.7904 13.9067 14.8648 14.0227 14.9156C14.1388 14.9664 14.2633 14.9925 14.389 14.9925C14.5147 14.9925 14.6392 14.9664 14.7552 14.9156C14.8713 14.8648 14.9766 14.7904 15.0652 14.6967C15.1544 14.6037 15.2253 14.4931 15.2736 14.3713C15.322 14.2494 15.3469 14.1187 15.3469 13.9867C15.3469 13.8547 15.322 13.724 15.2736 13.6021C15.2253 13.4803 15.1544 13.3697 15.0652 13.2767L12.208 10.2767Z"
        fill="currentColor"
      />
    </svg>
  )
}

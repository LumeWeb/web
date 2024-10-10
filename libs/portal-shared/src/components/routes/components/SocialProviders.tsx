/*
Commented entries do not currently have an icon and so are not used
 */
import React from "react";
import {
  Apple,
  Box,
  Chrome,
  DollarSign,
  Facebook,
  Gamepad2,
  Github,
  Gitlab,
  Instagram,
  Link,
  Linkedin,
  MessageCircle,
  Music,
  ShoppingBag,
  Twitter,
  Video,
} from "lucide-react";
import {
  FaAmazon,
  FaBattleNet,
  FaBitbucket,
  FaDigitalOcean,
  FaDropbox,
  FaGooglePlus,
  FaIntercom,
  FaLastfm,
  FaLine,
  FaMastodon,
  FaMeetup,
  FaMicrosoft,
  FaPaypal,
  FaSalesforce,
  FaSlack,
  FaSoundcloud,
  FaSpotify,
  FaSteam,
  FaStrava,
  FaStripe,
  FaTiktok,
  FaTwitch,
  FaUber,
  FaVk,
  FaYahoo,
  FaYandex,
} from "react-icons/fa";
import {
  SiAuth0,
  SiFitbit,
  SiHeroku,
  SiKakao,
  SiNaver,
  SiNextcloud,
  SiOkta,
  SiPatreon,
  SiWechat,
  SiXero,
  SiZoom,
} from "react-icons/si";

type IconComponent = React.ComponentType<React.SVGAttributes<SVGElement>>;

interface SocialLoginProvider {
  name: string;
  icon: IconComponent;
}
/*
Commented entries do not currently have an icon and so are not used
 */
interface SocialLoginProvider {
  name: string;
  icon: IconComponent;
  bgColor: string; // Added background color property
}

const socialLoginProviders: Map<string, SocialLoginProvider> = new Map([
  ["amazon", { name: "Amazon", icon: FaAmazon, bgColor: "bg-[#FF9900]" }],
  ["apple", { name: "Apple", icon: Apple, bgColor: "bg-black" }],
  ["auth0", { name: "Auth0", icon: SiAuth0, bgColor: "bg-[#EB5424]" }],
  [
    "battlenet",
    { name: "Battle.net", icon: FaBattleNet, bgColor: "bg-[#148EFF]" },
  ],
  [
    "bitbucket",
    { name: "Bitbucket", icon: FaBitbucket, bgColor: "bg-[#0052CC]" },
  ],
  ["box", { name: "Box", icon: Box, bgColor: "bg-[#0061D5]" }],
  [
    "dailymotion",
    { name: "Dailymotion", icon: Video, bgColor: "bg-[#00AAFF]" },
  ],
  ["deezer", { name: "Deezer", icon: Music, bgColor: "bg-[#FEAA2D]" }],
  [
    "digitalocean",
    { name: "Digital Ocean", icon: FaDigitalOcean, bgColor: "bg-[#0080FF]" },
  ],
  ["dropbox", { name: "Dropbox", icon: FaDropbox, bgColor: "bg-[#0061FF]" }],
  [
    "eveonline",
    { name: "Eve Online", icon: Gamepad2, bgColor: "bg-[#1A1A1A]" },
  ],
  ["facebook", { name: "Facebook", icon: Facebook, bgColor: "bg-[#1877F2]" }],
  ["fitbit", { name: "Fitbit", icon: SiFitbit, bgColor: "bg-[#00B0B9]" }],
  ["gitea", { name: "Gitea", icon: Github, bgColor: "bg-[#609926]" }],
  ["github", { name: "Github", icon: Github, bgColor: "bg-[#181717]" }],
  ["gitlab", { name: "Gitlab", icon: Gitlab, bgColor: "bg-[#FC6D26]" }],
  ["google", { name: "Google", icon: Chrome, bgColor: "bg-[#4285F4]" }],
  [
    "gplus",
    { name: "Google Plus", icon: FaGooglePlus, bgColor: "bg-[#DB4437]" },
  ],
  ["heroku", { name: "Heroku", icon: SiHeroku, bgColor: "bg-[#430098]" }],
  [
    "instagram",
    { name: "Instagram", icon: Instagram, bgColor: "bg-[#E4405F]" },
  ],
  ["intercom", { name: "Intercom", icon: FaIntercom, bgColor: "bg-[#0335FF]" }],
  ["kakao", { name: "Kakao", icon: SiKakao, bgColor: "bg-[#FEE500]" }],
  ["lastfm", { name: "Last FM", icon: FaLastfm, bgColor: "bg-[#D51007]" }],
  ["line", { name: "LINE", icon: FaLine, bgColor: "bg-[#00C300]" }],
  ["linkedin", { name: "LinkedIn", icon: Linkedin, bgColor: "bg-[#0A66C2]" }],
  ["mastodon", { name: "Mastodon", icon: FaMastodon, bgColor: "bg-[#6364FF]" }],
  ["meetup", { name: "Meetup.com", icon: FaMeetup, bgColor: "bg-[#ED1C40]" }],
  [
    "microsoftonline",
    { name: "Microsoft Online", icon: FaMicrosoft, bgColor: "bg-[#00A4EF]" },
  ],
  ["naver", { name: "Naver", icon: SiNaver, bgColor: "bg-[#03C75A]" }],
  [
    "nextcloud",
    { name: "NextCloud", icon: SiNextcloud, bgColor: "bg-[#0082C9]" },
  ],
  ["okta", { name: "Okta", icon: SiOkta, bgColor: "bg-[#007DC1]" }],
  [
    "openid-connect",
    { name: "OpenID Connect", icon: Link, bgColor: "bg-[#F78C40]" },
  ],
  ["patreon", { name: "Patreon", icon: SiPatreon, bgColor: "bg-[#FF424D]" }],
  ["paypal", { name: "Paypal", icon: FaPaypal, bgColor: "bg-[#00457C]" }],
  [
    "salesforce",
    { name: "Salesforce", icon: FaSalesforce, bgColor: "bg-[#00A1E0]" },
  ],
  ["seatalk", { name: "SeaTalk", icon: MessageCircle, bgColor: "bg-gray-500" }],
  ["shopify", { name: "Shopify", icon: ShoppingBag, bgColor: "bg-[#96BF48]" }],
  ["slack", { name: "Slack", icon: FaSlack, bgColor: "bg-[#4A154B]" }],
  [
    "soundcloud",
    { name: "SoundCloud", icon: FaSoundcloud, bgColor: "bg-[#FF3300]" },
  ],
  ["spotify", { name: "Spotify", icon: FaSpotify, bgColor: "bg-[#1DB954]" }],
  ["steam", { name: "Steam", icon: FaSteam, bgColor: "bg-[#000000]" }],
  ["strava", { name: "Strava", icon: FaStrava, bgColor: "bg-[#FC4C02]" }],
  ["stripe", { name: "Stripe", icon: FaStripe, bgColor: "bg-[#008CDD]" }],
  ["tiktok", { name: "TikTok", icon: FaTiktok, bgColor: "bg-[#000000]" }],
  ["twitch", { name: "Twitch", icon: FaTwitch, bgColor: "bg-[#9146FF]" }],
  ["twitter", { name: "Twitter", icon: Twitter, bgColor: "bg-[#1DA1F2]" }],
  ["twitterv2", { name: "Twitter", icon: Twitter, bgColor: "bg-[#1DA1F2]" }],
  [
    "typetalk",
    { name: "Typetalk", icon: MessageCircle, bgColor: "bg-[#2A5BAC]" },
  ],
  ["uber", { name: "Uber", icon: FaUber, bgColor: "bg-[#000000]" }],
  ["vk", { name: "VK", icon: FaVk, bgColor: "bg-[#4A76A8]" }],
  ["wecom", { name: "WeCom", icon: SiWechat, bgColor: "bg-[#7BB32E]" }],
  ["wepay", { name: "Wepay", icon: DollarSign, bgColor: "bg-[#0077A6]" }],
  ["xero", { name: "Xero", icon: SiXero, bgColor: "bg-[#13B5EA]" }],
  ["yahoo", { name: "Yahoo", icon: FaYahoo, bgColor: "bg-[#6001D2]" }],
  ["yammer", { name: "Yammer", icon: MessageCircle, bgColor: "bg-[#0072C6]" }],
  ["yandex", { name: "Yandex", icon: FaYandex, bgColor: "bg-[#FF0000]" }],
  ["zoom", { name: "Zoom", icon: SiZoom, bgColor: "bg-[#2D8CFF]" }],
]);
export default socialLoginProviders;

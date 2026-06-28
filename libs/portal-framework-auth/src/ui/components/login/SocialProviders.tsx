import { lazyIcon } from "@lumeweb/portal-framework-ui-core";

/*
Commented entries do not currently have an icon and so are not used
 */
import React from "react";
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
const Apple = lazyIcon("Apple");
const Box = lazyIcon("Box");
const Chrome = lazyIcon("Chrome");
const DollarSign = lazyIcon("DollarSign");
const Facebook = lazyIcon("Facebook");
const Gamepad2 = lazyIcon("Gamepad2");
const Github = lazyIcon("Github");
const Gitlab = lazyIcon("Gitlab");
const Instagram = lazyIcon("Instagram");
const Link = lazyIcon("Link");
const Linkedin = lazyIcon("Linkedin");
const MessageCircle = lazyIcon("MessageCircle");
const Music = lazyIcon("Music");
const ShoppingBag = lazyIcon("ShoppingBag");
const Twitter = lazyIcon("Twitter");
const Video = lazyIcon("Video");


type IconComponent = React.ComponentType<React.SVGAttributes<SVGElement>>;

/*
Commented entries do not currently have an icon and so are not used
 */
interface SocialLoginProvider {
  bgColor: string; // Added background color property
  icon: IconComponent;
  name: string;
}

const socialLoginProviders: Map<string, SocialLoginProvider> = new Map([
  ["amazon", { bgColor: "bg-[#FF9900]", icon: FaAmazon, name: "Amazon" }],
  ["apple", { bgColor: "bg-black", icon: Apple, name: "Apple" }],
  ["auth0", { bgColor: "bg-[#EB5424]", icon: SiAuth0, name: "Auth0" }],
  [
    "battlenet",
    { bgColor: "bg-[#148EFF]", icon: FaBattleNet, name: "Battle.net" },
  ],
  [
    "bitbucket",
    { bgColor: "bg-[#0052CC]", icon: FaBitbucket, name: "Bitbucket" },
  ],
  ["box", { bgColor: "bg-[#0061D5]", icon: Box, name: "Box" }],
  [
    "dailymotion",
    { bgColor: "bg-[#00AAFF]", icon: Video, name: "Dailymotion" },
  ],
  ["deezer", { bgColor: "bg-[#FEAA2D]", icon: Music, name: "Deezer" }],
  [
    "digitalocean",
    { bgColor: "bg-[#0080FF]", icon: FaDigitalOcean, name: "Digital Ocean" },
  ],
  ["dropbox", { bgColor: "bg-[#0061FF]", icon: FaDropbox, name: "Dropbox" }],
  [
    "eveonline",
    { bgColor: "bg-[#1A1A1A]", icon: Gamepad2, name: "Eve Online" },
  ],
  ["facebook", { bgColor: "bg-[#1877F2]", icon: Facebook, name: "Facebook" }],
  ["fitbit", { bgColor: "bg-[#00B0B9]", icon: SiFitbit, name: "Fitbit" }],
  ["gitea", { bgColor: "bg-[#609926]", icon: Github, name: "Gitea" }],
  ["github", { bgColor: "bg-[#181717]", icon: Github, name: "Github" }],
  ["gitlab", { bgColor: "bg-[#FC6D26]", icon: Gitlab, name: "Gitlab" }],
  ["google", { bgColor: "bg-[#4285F4]", icon: Chrome, name: "Google" }],
  [
    "gplus",
    { bgColor: "bg-[#DB4437]", icon: FaGooglePlus, name: "Google Plus" },
  ],
  ["heroku", { bgColor: "bg-[#430098]", icon: SiHeroku, name: "Heroku" }],
  [
    "instagram",
    { bgColor: "bg-[#E4405F]", icon: Instagram, name: "Instagram" },
  ],
  ["intercom", { bgColor: "bg-[#0335FF]", icon: FaIntercom, name: "Intercom" }],
  ["kakao", { bgColor: "bg-[#FEE500]", icon: SiKakao, name: "Kakao" }],
  ["lastfm", { bgColor: "bg-[#D51007]", icon: FaLastfm, name: "Last FM" }],
  ["line", { bgColor: "bg-[#00C300]", icon: FaLine, name: "LINE" }],
  ["linkedin", { bgColor: "bg-[#0A66C2]", icon: Linkedin, name: "LinkedIn" }],
  ["mastodon", { bgColor: "bg-[#6364FF]", icon: FaMastodon, name: "Mastodon" }],
  ["meetup", { bgColor: "bg-[#ED1C40]", icon: FaMeetup, name: "Meetup.com" }],
  [
    "microsoftonline",
    { bgColor: "bg-[#00A4EF]", icon: FaMicrosoft, name: "Microsoft Online" },
  ],
  ["naver", { bgColor: "bg-[#03C75A]", icon: SiNaver, name: "Naver" }],
  [
    "nextcloud",
    { bgColor: "bg-[#0082C9]", icon: SiNextcloud, name: "NextCloud" },
  ],
  ["okta", { bgColor: "bg-[#007DC1]", icon: SiOkta, name: "Okta" }],
  [
    "openid-connect",
    { bgColor: "bg-[#F78C40]", icon: Link, name: "OpenID Connect" },
  ],
  ["patreon", { bgColor: "bg-[#FF424D]", icon: SiPatreon, name: "Patreon" }],
  ["paypal", { bgColor: "bg-[#00457C]", icon: FaPaypal, name: "Paypal" }],
  [
    "salesforce",
    { bgColor: "bg-[#00A1E0]", icon: FaSalesforce, name: "Salesforce" },
  ],
  ["seatalk", { bgColor: "bg-gray-500", icon: MessageCircle, name: "SeaTalk" }],
  ["shopify", { bgColor: "bg-[#96BF48]", icon: ShoppingBag, name: "Shopify" }],
  ["slack", { bgColor: "bg-[#4A154B]", icon: FaSlack, name: "Slack" }],
  [
    "soundcloud",
    { bgColor: "bg-[#FF3300]", icon: FaSoundcloud, name: "SoundCloud" },
  ],
  ["spotify", { bgColor: "bg-[#1DB954]", icon: FaSpotify, name: "Spotify" }],
  ["steam", { bgColor: "bg-[#000000]", icon: FaSteam, name: "Steam" }],
  ["strava", { bgColor: "bg-[#FC4C02]", icon: FaStrava, name: "Strava" }],
  ["stripe", { bgColor: "bg-[#008CDD]", icon: FaStripe, name: "Stripe" }],
  ["tiktok", { bgColor: "bg-[#000000]", icon: FaTiktok, name: "TikTok" }],
  ["twitch", { bgColor: "bg-[#9146FF]", icon: FaTwitch, name: "Twitch" }],
  ["twitter", { bgColor: "bg-[#1DA1F2]", icon: Twitter, name: "Twitter" }],
  ["twitterv2", { bgColor: "bg-[#1DA1F2]", icon: Twitter, name: "Twitter" }],
  [
    "typetalk",
    { bgColor: "bg-[#2A5BAC]", icon: MessageCircle, name: "Typetalk" },
  ],
  ["uber", { bgColor: "bg-[#000000]", icon: FaUber, name: "Uber" }],
  ["vk", { bgColor: "bg-[#4A76A8]", icon: FaVk, name: "VK" }],
  ["wecom", { bgColor: "bg-[#7BB32E]", icon: SiWechat, name: "WeCom" }],
  ["wepay", { bgColor: "bg-[#0077A6]", icon: DollarSign, name: "Wepay" }],
  ["xero", { bgColor: "bg-[#13B5EA]", icon: SiXero, name: "Xero" }],
  ["yahoo", { bgColor: "bg-[#6001D2]", icon: FaYahoo, name: "Yahoo" }],
  ["yammer", { bgColor: "bg-[#0072C6]", icon: MessageCircle, name: "Yammer" }],
  ["yandex", { bgColor: "bg-[#FF0000]", icon: FaYandex, name: "Yandex" }],
  ["zoom", { bgColor: "bg-[#2D8CFF]", icon: SiZoom, name: "Zoom" }],
]);
export default socialLoginProviders;

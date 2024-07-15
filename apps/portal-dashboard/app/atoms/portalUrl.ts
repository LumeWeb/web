import { env } from "~/env.js";
import { atom } from "jotai";

export const portalUrlAtom = atom(env.VITE_PORTAL_DOMAIN);

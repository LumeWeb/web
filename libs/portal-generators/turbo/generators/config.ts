import { genPortalPlugin, genLib } from "../../dist/cjs/index";

export default function generator(plop: any): void {
  plop.setGenerator("portal-plugin", genPortalPlugin());
  plop.setGenerator("lib", genLib());
}

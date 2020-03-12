import { PublicPlugin as Plugin } from "./publicPlugin";

export function plugin(initializerContext) {
 return new Plugin(initializerContext);
}
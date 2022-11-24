import { AppProps } from "next/app";
import "nextra-theme-docs/style.css";

import Prism from "prism-react-renderer/prism";
(typeof global !== "undefined" ? global : window).Prism = Prism;
require("prismjs/components/prism-javascript");

export default function Nextra({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

import { extendTheme, theme as baseTheme } from "@chakra-ui/react";
import "focus-visible/dist/focus-visible";
import * as components from "./components";
import * as foundations from "./foundations";

export const theme: Record<string, any> = extendTheme({
  ...foundations,
  components: { ...components },
  colors: { ...baseTheme.colors, brand: baseTheme.colors.yellow },
  space: {
    "4.5": "1.125rem",
  },
  styles: {
    global: () => ({
      html: {
        scrollBehavior: "smooth",
      },
    }),
  },
});

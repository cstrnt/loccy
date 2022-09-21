---
sidebar_position: 1
---

# Getting Started

In it's beta loccy only works in a very specific setup.
It will probably work with other tools, but this is the only tested setup.

## Setup

- Next.js App
- [next-international](https://github.com/QuiiBz/next-international) for i18n

## Prerequisites

1. Create an account on https://loccy.app
2. Create an ApiKey by selecting the _Secrets_ Tab
3. Copy the ApiKey and store it in a safe place

## Installation

Install the loccy-cli by running

```bash
npm i -g @loccy/cli
```

as well as the next.js client by running

```bash
npm i @loccy/client
```

After this is done simply run

```bash
loccy init -t <YOUR APIKEY>
```

to create your loccy config file.

In there you should enter your projects locales and it's default locale.

This is what a example config looks like

```ts
import { asConfig } from "@loccy/client";

export default asConfig({
  defaultLocale: "en",
  locales: ["en", "de", "fr"],
  projectId: "<DO NOT EDIT>",
  keys: {
    saved: {
      description: "Message that is shown when a locale is saved",
    },
    savedError: {
      description: "Message that is shown when a locale is not saved",
    },
    notificationsText: {
      params: {
        count: "The amount of notification",
      },
    },
  },
});
```

If you're done editing, save the file and run

```bash
loccy push -t <YOUR APIKEY>
```

If you go to the web interface again you should see your keys and the locales.
Feel free to enter some values here.

The last step is to link loccy with `next-international` by editing it's config file.

```ts
import { createI18n } from "next-international";

// helper functions from loccy
import { generateLocales, inferLocales } from "@loccy/client";

// This is the path to your loccy config file
import Config from "../../../loccy.config";

export const {
  useI18n,
  I18nProvider,
  useChangeLocale,
  defineLocale,
  getLocaleProps,
} = createI18n<inferLocales<typeof Config>>(generateLocales(Config));
```

And that's it! You can now open your app and see the changes to your translations as well as a **fully typed** client.

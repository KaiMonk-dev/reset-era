import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#0B0B0F" />
        <meta
          name="description"
          content="Reset Era — a 7-day lock-in. Three quests a day. The bars move because you did."
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Reset Era" />
        <meta name="mobile-web-app-capable" content="yes" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}

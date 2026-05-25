import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: "infakt-sdk",
    },
    links: [
      {
        text: "GitHub",
        url: "https://github.com/orafal-dev/infakt-sdk",
        external: true,
      },
      {
        text: "npm",
        url: "https://www.npmjs.com/package/infakt-sdk",
        external: true,
      },
      {
        text: "inFakt API",
        url: "https://docs.infakt.pl/",
        external: true,
      },
    ],
  };
}

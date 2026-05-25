const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const githubOwner = "orafal-dev";
const githubRepo = "infakt-sdk";

export function getMarkdownUrl(slugs: string[] | undefined): string {
  const slugPath =
    slugs?.length === 0 || !slugs ? "index/" : `${slugs.join("/")}/`;
  return `${basePath}/llms/docs/${slugPath}`;
}

export function getGitHubSourceUrl(pagePath: string): string {
  return `https://github.com/${githubOwner}/${githubRepo}/blob/main/docs/content/docs/${pagePath}`;
}

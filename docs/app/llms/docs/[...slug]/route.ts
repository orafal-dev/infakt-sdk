import { getLLMText } from "@/lib/get-llm-text";
import { source } from "@/lib/source";
import { notFound } from "next/navigation";

export const revalidate = false;

export async function GET(
  _req: Request,
  { params }: RouteContext<"/llms/docs/[...slug]">,
) {
  const { slug } = await params;
  const pageSlugs = slug[0] === "index" && slug.length === 1 ? [] : slug;
  const page = source.getPage(pageSlugs);
  if (!page) notFound();

  return new Response(await getLLMText(page), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}

export function generateStaticParams() {
  return source.generateParams().map(({ slug }) => ({
    slug: slug.length === 0 ? ["index"] : slug,
  }));
}

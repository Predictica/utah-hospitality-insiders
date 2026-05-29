import { getPostBySlug, getAllPosts } from "@/lib/blog/posts";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: `${post.title} — Utah Hospitality Insiders`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const date = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/blog" className="text-[#1F4E79] text-sm hover:underline mb-6 inline-block">
        &larr; Back to Blog
      </Link>

      <article>
        <header className="mb-8">
          <span className="text-xs font-semibold text-[#1F4E79] uppercase tracking-wide">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            {post.title}
          </h1>
          <p className="text-gray-500 text-sm mt-3">
            {date} &middot; {post.author}
          </p>
        </header>

        <div
          className="blog-content max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </div>
  );
}

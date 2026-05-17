import Link from "next/link";
import type { PostMeta } from "@/lib/blog/posts";

export default function BlogCard({ post }: { post: PostMeta }) {
  const date = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
    >
      <span className="text-xs font-semibold text-[#1F4E79] uppercase tracking-wide">
        {post.category}
      </span>
      <h3 className="font-semibold text-gray-900 text-lg mt-2">{post.title}</h3>
      <p className="text-gray-600 text-sm mt-2 line-clamp-2">{post.excerpt}</p>
      <p className="text-xs text-gray-400 mt-4">{date}</p>
    </Link>
  );
}

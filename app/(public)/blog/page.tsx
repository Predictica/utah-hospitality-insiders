import { getAllPostsAsync } from "@/lib/blog/posts";
import BlogCard from "@/components/ui/BlogCard";

export const metadata = {
  title: "Blog — Utah Hospitality Insiders",
  description: "Industry news, career tips, and insider resources for Utah hospitality professionals.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getAllPostsAsync();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog</h1>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-16">
          No posts yet. Check back soon!
        </p>
      )}
    </div>
  );
}

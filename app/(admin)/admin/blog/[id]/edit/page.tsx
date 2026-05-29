import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import BlogEditor from "../../BlogEditor";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const post = data as {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    author: string;
    category: string;
    featured_image: string | null;
    is_published: boolean;
  };

  return <BlogEditor initialData={post} />;
}

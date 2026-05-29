import { createClient } from "@supabase/supabase-js";
import { remark } from "remark";
import html from "remark-html";

export interface PostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  author: string;
  category: string;
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
}

export interface Post extends PostMeta {
  contentHtml: string;
}

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export function getAllPosts(): PostMeta[] {
  // This is called at build time for static generation.
  // We can't use async here due to Next.js constraints on generateStaticParams,
  // so we'll keep the file-based fallback for static params.
  // The blog list page uses getAllPostsAsync() instead.
  try {
    const fs = require("fs");
    const path = require("path");
    const matter = require("gray-matter");
    const postsDirectory = path.join(process.cwd(), "posts");

    if (!fs.existsSync(postsDirectory)) return [];

    const fileNames = fs.readdirSync(postsDirectory);
    const posts = fileNames
      .filter((name: string) => name.endsWith(".md"))
      .map((fileName: string) => {
        const slug = fileName.replace(/\.md$/, "");
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data } = matter(fileContents);
        return { slug, ...(data as PostFrontmatter) };
      });

    return posts.sort(
      (a: PostMeta, b: PostMeta) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch {
    return [];
  }
}

export async function getAllPostsAsync(): Promise<PostMeta[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("title, slug, excerpt, author, category, published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error || !data || data.length === 0) {
    // Fallback to file-based posts
    return getAllPosts();
  }

  return (data as {
    title: string;
    slug: string;
    excerpt: string | null;
    author: string;
    category: string;
    published_at: string | null;
  }[]).map((p) => ({
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt || "",
    author: p.author,
    category: p.category,
    date: p.published_at || new Date().toISOString(),
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .limit(1);

  if (!error && data && data.length > 0) {
    const post = data[0] as {
      title: string;
      slug: string;
      excerpt: string | null;
      content: string;
      author: string;
      category: string;
      published_at: string | null;
    };

    // Process markdown content to HTML
    const processed = await remark().use(html).process(post.content);
    const contentHtml = processed.toString();

    return {
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt || "",
      author: post.author,
      category: post.category,
      date: post.published_at || new Date().toISOString(),
      contentHtml,
    };
  }

  // Fallback to file-based post
  try {
    const fs = require("fs");
    const path = require("path");
    const matter = require("gray-matter");
    const postsDirectory = path.join(process.cwd(), "posts");
    const fullPath = path.join(postsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data: frontmatter, content } = matter(fileContents);
    const processed = await remark().use(html).process(content);
    const contentHtml = processed.toString();

    return {
      slug,
      contentHtml,
      ...(frontmatter as PostFrontmatter),
    };
  } catch {
    return null;
  }
}

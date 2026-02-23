import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client/react";
import { CREATE_POST } from "../graphql/queries";
import { ArrowLeft, Save, AlertCircle, Image as ImageIcon } from "lucide-react";

export default function CreatePostPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [status, setStatus] = useState("published"); // default to published
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [createPost, { loading, error }] = useMutation<{
    createPost: { id: string };
  }>(CREATE_POST, {
    onCompleted: (data) => {
      navigate(`/post/${data.createPost.id}`);
    },
    onError: (err) => {
      setFormError(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const tagArray = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    createPost({
      variables: {
        input: {
          title,
          content,
          tags: tagArray,
          status,
          coverImage,
        },
      },
    });
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 mb-8 transition-colors duration-200 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </button>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-surface-50 leading-tight mb-6">
        Create a New Post
      </h1>

      {/* Form */}
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        {(error || formError) && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">
              {formError || error?.message}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-surface-300 mb-2"
            >
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Amazing blog post title..."
              className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-800 text-surface-50 placeholder:text-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-200 shadow-inner"
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-surface-300 mb-2"
            >
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Write your brilliant content here..."
              rows={8}
              className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-800 text-surface-50 placeholder:text-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-200 shadow-inner resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="tags"
                className="block text-sm font-medium text-surface-300 mb-2"
              >
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="nodejs, graphql, tutorial"
                className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-800 text-surface-50 placeholder:text-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-200 shadow-inner"
              />
            </div>

            {/* Cover Image */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Cover Image
              </label>
              <div className="flex items-center gap-4">
                {coverImage && (
                  <img
                    src={coverImage}
                    alt="Cover preview"
                    className="w-16 h-16 object-cover rounded-xl border border-surface-700"
                  />
                )}
                <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-800 border-2 border-dashed border-surface-600 text-surface-300 hover:text-surface-100 hover:border-surface-400 hover:bg-surface-700 transition-colors duration-200 cursor-pointer w-full justify-center">
                  <ImageIcon className="w-5 h-5" />
                  <span>Click to upload image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setCoverImage(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-surface-300 mb-2"
              >
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-surface-900 border border-surface-800 text-surface-50 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all duration-200 shadow-inner appearance-none cursor-pointer"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-surface-950 font-semibold hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:ring-offset-2 focus:ring-offset-surface-950 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-surface-950/30 border-t-surface-950 rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Publish Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

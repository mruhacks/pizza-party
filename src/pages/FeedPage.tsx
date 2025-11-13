import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2, MapPin, Star } from "lucide-react";

interface Post {
  id: number;
  userId: number;
  content: string;
    photo_url?: string;
  createdAt: string;
  pizza?: {
    id: number;
    name?: string;
    lat?: number;
    lng?: number;
  };
  ratings?: {
    happiness?: number;
    rizz?: number;
    experience?: number;
  };
}

interface Author {
  id: number;
  name: string;
  profile_pic_url: string;
}

export function FeedPage() {
  const [posts, setPosts] = useState<(Post & { author?: Author })[]>([]);
  const [composing, setComposing] = useState(false);
  const [newPost, setNewPost] = useState("");
  const [happinessRating, setHappinessRating] = useState<number>(0);
  const [rizzRating, setRizzRating] = useState<number>(0);
  const [experienceRating, setExperienceRating] = useState<number>(0);
  const [pizzas, setPizzas] = useState<{ id: number; name: string }[]>([]);
  const [selectedPizzaId, setSelectedPizzaId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [profilePic, setProfilePic] = useState<string>("");
  const [postMessage, setPostMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("userId");
    const name = localStorage.getItem("userName");
    if (id && name) {
      setUserId(id);
      setUserName(name);
      setProfilePic("https://i.pravatar.cc/150?img=" + id);
    }
    fetchPosts();
    fetchPizzas();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("/api/posts");
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    }
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;

    setPostMessage("");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          userId: userId,
          content: newPost,
          happinessRating: happinessRating || null,
          rizzRating: rizzRating || null,
          experienceRating: experienceRating || null,
          pizzaId: selectedPizzaId || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPosts([data.post, ...posts]);
        setNewPost("");
        setComposing(false);
        setHappinessRating(0);
        setRizzRating(0);
        setExperienceRating(0);
        setSelectedPizzaId(null);
        setPostMessage("Post created successfully!");
        setTimeout(() => setPostMessage(""), 3000);
      }
    } catch (error) {
      setPostMessage("Failed to create post");
    }
  };

  const fetchPizzas = async () => {
    try {
      const resp = await fetch(`/api/search/pizzas?q=`);
      if (resp.ok) {
        const data = await resp.json();
        const list = (data.results || []).map((p: any) => ({ id: p.id, name: p.name }));
        // Sort alphabetically for selection clarity
        list.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setPizzas(list);
      }
    } catch (e) {
      // silent fail
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Feed</h1>

        {userId && (
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex gap-4">
              <img
                src={profilePic}
                alt={userName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                {composing ? (
                  <div className="space-y-3">
                    <textarea
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      placeholder="What's your pizza take?"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all resize-none"
                      rows={4}
                    />
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <RatingSelector label="Happiness" value={happinessRating} onChange={setHappinessRating} color="text-pink-400" />
                      <RatingSelector label="Rizz" value={rizzRating} onChange={setRizzRating} color="text-cyan-400" />
                      <RatingSelector label="Experience" value={experienceRating} onChange={setExperienceRating} color="text-purple-400" />
                    </div>
                    <div className="pt-4">
                      <label className="text-white/60 text-xs font-medium mb-1 block">Pizza (optional)</label>
                      <select
                        value={selectedPizzaId || ''}
                        onChange={(e) => setSelectedPizzaId(e.target.value ? parseInt(e.target.value, 10) : null)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-purple-400 focus:bg-white/15"
                      >
                        <option value="" className="text-black">Select a pizza shop...</option>
                        {pizzas.map(p => (
                          <option key={p.id} value={p.id} className="text-black">{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setComposing(false);
                          setNewPost("");
                        }}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/90 font-medium rounded-lg transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePostSubmit}
                        disabled={!newPost.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setComposing(true)}
                    className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg text-left text-white/50 font-medium transition-all duration-300"
                  >
                    What's your pizza take?
                  </button>
                )}
                {postMessage && (
                  <p className={`text-xs mt-2 ${postMessage.includes("successfully") ? "text-green-400" : "text-red-400"}`}>
                    {postMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60">No posts yet. Be the first to post!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl overflow-hidden hover:border-purple-400/50 transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <img
                      src={post.author?.profile_pic_url || profilePic}
                      alt="Author"
                      className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-purple-400 transition-all"
                      onClick={() => navigate(`/profile/${post.userId}`)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 
                          className="text-white font-bold cursor-pointer hover:text-purple-400 transition-colors"
                          onClick={() => navigate(`/profile/${post.userId}`)}
                        >
                          {post.author?.name || "Unknown"}
                        </h3>
                      </div>
                      <span className="text-white/50 text-sm">
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                  </div>

                  <p className="text-white/90 mb-4">{post.content}</p>
                  {post.ratings && (post.ratings.happiness || post.ratings.rizz || post.ratings.experience) && (
                    <div className="flex gap-4 mb-4 text-xs">
                      {post.ratings.happiness && (
                        <SmallRating label="Happy" value={post.ratings.happiness} color="text-pink-400" />
                      )}
                      {post.ratings.rizz && (
                        <SmallRating label="Rizz" value={post.ratings.rizz} color="text-cyan-400" />
                      )}
                      {post.ratings.experience && (
                        <SmallRating label="Exp" value={post.ratings.experience} color="text-purple-400" />
                      )}
                    </div>
                  )}

                  {post.pizza?.id && (
                    <button
                      onClick={() => navigate(`/search?shopId=${post.pizza?.id}`)}
                      className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs hover:bg-purple-500/30 hover:border-purple-300 transition-colors"
                      title="View this pizza shop on the map"
                    >
                      <MapPin className="w-3 h-3" />
                      <span className="font-medium truncate max-w-[160px]">
                        {post.pizza?.name || 'View Shop'}
                      </span>
                    </button>
                  )}

                  {post.photo_url && (
                    <img
                      src={post.photo_url}
                      alt="Post"
                      className="w-full rounded-xl object-cover mb-4 max-h-96"
                    />
                  )}

                  <div className="flex gap-8 pt-4 border-t border-white/10">
                    <button className="flex items-center gap-2 text-white/50 hover:text-pink-400 transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-pink-400/20">
                        <Heart className="w-4 h-4" />
                      </div>
                      <span className="text-sm">0</span>
                    </button>

                    <button className="flex items-center gap-2 text-white/50 hover:text-cyan-400 transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-cyan-400/20">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-sm">0</span>
                    </button>

                    <button className="flex items-center gap-2 text-white/50 hover:text-purple-400 transition-colors group">
                      <div className="p-2 rounded-full group-hover:bg-purple-400/20">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <span className="text-sm">Share</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Components for rating selection & display
function RatingSelector({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div>
      <p className="text-white/60 text-[11px] mb-1 font-medium">{label}</p>
      <div className="flex gap-1">
        {[1,2,3,4,5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${value >= n ? 'text-yellow-400' : 'text-white/20'}`}
          >
            <Star className="w-3 h-3" />
          </button>
        ))}
      </div>
    </div>
  );
}

function SmallRating({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-1">
      <Star className={`w-3 h-3 ${color}`} />
      <span className="text-white/50">{label}</span>
      <span className="text-white/70 font-semibold">{value}</span>
    </div>
  );
}

export default FeedPage;

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, MapPin, Mail, LogOut, Edit2, Check, X, Camera } from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  address: string;
  profilePic: string;
}

export function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem("userId");
  const profileUserId = id || currentUserId;
  const isOwnProfile = profileUserId === currentUserId;

  useEffect(() => {
    if (!currentUserId) {
      navigate("/login");
      return;
    }

    if (profileUserId) {
      fetchUserProfile(profileUserId);
    }
  }, [profileUserId, currentUserId, navigate]);

  const fetchUserProfile = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        const userWithId = { ...data.user, id: userId };
        setUser(userWithId);
        setFormData(userWithId);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData || !profileUserId) return;

    try {
      const response = await fetch(`/api/users/${profileUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          address: formData.address,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(formData);
        setIsEditing(false);
        setSaveMessage("Profile updated successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to save profile:", error);
      setSaveMessage("Failed to save profile");
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profileUserId) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setSaveMessage("Please select an image file");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage("Image size must be less than 5MB");
      setTimeout(() => setSaveMessage(""), 3000);
      return;
    }

    setUploadingImage(true);

    try {
      const arrayBuffer = await file.arrayBuffer();

      const response = await fetch(`/api/users/${profileUserId}/profile-pic`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: arrayBuffer,
      });

      const data = await response.json();

      if (data.success) {
        // Force reload the profile picture by adding a timestamp
        const newProfilePic = `${data.profilePic}?t=${Date.now()}`;
        if (user) {
          setUser({ ...user, profilePic: newProfilePic });
        }
        if (formData) {
          setFormData({ ...formData, profilePic: newProfilePic });
        }
        setSaveMessage("Profile picture updated successfully!");
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      setSaveMessage("Failed to upload image");
      setTimeout(() => setSaveMessage(""), 3000);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="inline-block w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user && !formData) return null;

  const displayUser = formData || user;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            {isOwnProfile ? "My Profile" : `${displayUser?.name}'s Profile`}
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem("authToken");
              localStorage.removeItem("userId");
              localStorage.removeItem("userName");
              navigate("/login");
            }}
            className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>

          <div className="px-8 pb-8 relative">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative -mt-16">
                <img
                  src={displayUser?.profilePic}
                  alt={displayUser?.name}
                  className="w-32 h-32 rounded-full border-4 border-slate-900 object-cover shadow-lg"
                />
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white p-2 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Upload new profile picture"
                  >
                    {uploadingImage ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </>
              </div>

              <div className="flex-1 pt-4 w-full">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData?.name || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData!,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData?.email || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData!,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Address
                      </label>
                      <textarea
                        value={formData?.address || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData!,
                            address: e.target.value,
                          })
                        }
                        rows={3}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 focus:bg-white/15 transition-all resize-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 rounded-lg transition-all duration-300 justify-center"
                      >
                        <Check className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => {
                          setFormData(user);
                          setIsEditing(false);
                        }}
                        className="flex items-center gap-2 flex-1 bg-red-500/20 border border-red-500/50 hover:bg-red-500/30 text-red-300 font-semibold py-2 rounded-lg transition-all duration-300 justify-center"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-white/60 text-sm font-medium">Name</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {displayUser?.name}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-white/60 text-sm">Email</p>
                          <p className="text-white/90 mt-1">
                            {displayUser?.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-white/60 text-sm">Address</p>
                          <p className="text-white/90 mt-1">
                            {displayUser?.address || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-6 flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/50"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>
                )}

                {saveMessage && (
                  <p className={`text-sm mt-4 ${saveMessage.includes("successfully") ? "text-green-400" : "text-red-400"}`}>
                    {saveMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import {
  Camera,
  User,
  Calendar,
  Briefcase,
  Smile,
  Heart,
  MessageSquare,
  Mars,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useChatBotStore } from "../store/useChatBotStore";
import { useNavigate, useParams } from "react-router-dom";

const EchoConfigPage = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [selectedImg, setSelectedImg] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    occupation: "",
    personality: "",
    relationship: "",
    tone: "",
    isPrivate: false,
  });

  const {
    createChatbot,
    updateChatbot,
    isCreatingChatBot,
    isUpdatingChatBot,
    chatbots,
  } = useChatBotStore();

  const navigate = useNavigate();

  const icons = {
    Name: <User className="w-4 h-4" />,
    Gender: <Mars className="w-4 h-4" />,
    Age: <Calendar className="w-4 h-4" />,
    Occupation: <Briefcase className="w-4 h-4" />,
    Personality: <Smile className="w-4 h-4" />,
    "Relationship Role": <Heart className="w-4 h-4" />,
    "Tone of Speech": <MessageSquare className="w-4 h-4" />,
  };

  useEffect(() => {
    if (isEditing) {
      const chatbot = chatbots.find((bot) => bot._id === id);
      if (chatbot) {
        setFormData({
          name: chatbot.name,
          gender: chatbot.gender,
          age: chatbot.age,
          occupation: chatbot.occupation,
          personality: chatbot.personality || "",
          relationship: chatbot.relationship || "",
          tone: chatbot.tone || "",
          isPrivate: chatbot.isPrivate || false,
        });
        setSelectedImg(chatbot.profilePic);
      } else {
        //toast.error("Chatbot not found");
        navigate("/");
      }
    } else {
      // Reset form data for new Echo
      setFormData({
        name: "",
        gender: "",
        age: "",
        occupation: "",
        personality: "",
        relationship: "",
        tone: "",
        isPrivate: false,
      });
      setSelectedImg(null); // Reset the profile picture
    }
  }, [id, chatbots, navigate, isEditing]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
    };
  };

  const validateAge = (value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    if (numericValue === "") return "";
    const num = parseInt(numericValue);
    if (num > 150) return "150";
    return numericValue;
  };

  const validateOccupation = (value) => {
    return value.replace(/[^a-zA-Z\s-]/g, "");
  };

  const validateName = (value) => {
    return value.replace(/[^a-zA-Z0-9\s\-_]/g, "");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return false;
    }
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(formData.name)) {
      toast.error("Name can only contain letters, numbers and spaces");
      return false;
    }
    if (!formData.gender) {
      toast.error("Gender is required");
      return false;
    }
    if (!formData.age) {
      toast.error("Age is required");
      return false;
    }
    const age = parseInt(formData.age);
    if (isNaN(age) || age < 1 || age > 150) {
      toast.error("Age must be between 1 and 150");
      return false;
    }
    if (!formData.occupation.trim()) {
      toast.error("Occupation is required");
      return false;
    }
    if (!/^[a-zA-Z\s-]+$/.test(formData.occupation)) {
      toast.error("Occupation can only contain letters, spaces, and hyphens");
      return false;
    }
    if (!formData.personality) {
      toast.error("Personality is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success) {
      const data = { ...formData, profilePic: selectedImg };

      try {
        if (isEditing) {
          await updateChatbot(id, data);
          toast.success("Echo updated successfully!");
        } else {
          await createChatbot(data);
          toast.success("Echo created successfully!");
        }
        navigate("/");
      } catch (error) {
        toast.error(
          isEditing ? "Failed to update Echo" : "Failed to create Echo"
        );
      }
    }
  };

  return (
    <div className="h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">
              {isEditing ? "Update Echo" : "Create New Echo"}
            </h1>
            <p className="mt-2">Configure your AI companion</p>
          </div>

          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || "/avatar.png"}
                alt="Echo Avatar"
                className="size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-base-content hover:scale-105 p-2 rounded-full cursor-pointer transition-all duration-200"
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              Click the camera icon to set your Echo's photo
            </p>
          </div>

          {/* Privacy Toggle Section */}
          <div className="flex items-center justify-center gap-3">
            <label className="label-text text-sm">Private:</label>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={formData.isPrivate}
              onChange={(e) =>
                setFormData({ ...formData, isPrivate: e.target.checked })
              }
            />
          </div>

          <p className="mt-1 text-sm text-zinc-400">
            <span className="text-error font-semibold">*</span> Required Fields
          </p>

          {/* Configuration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-1">
                    {icons["Name"]} Name
                    <span className="text-error font-semibold">*</span>
                  </span>
                </label>

                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => {
                    const validatedName = validateName(e.target.value);
                    setFormData({ ...formData, name: validatedName });
                  }}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-1">
                    {icons["Gender"]} Gender
                    <span className="text-error font-semibold">*</span>
                  </span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  required
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-1">
                    {icons["Age"]} Age
                    <span className="text-error font-semibold">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.age}
                  onChange={(e) => {
                    const validatedAge = validateAge(e.target.value);
                    setFormData({ ...formData, age: validatedAge });
                  }}
                  required
                  maxLength={3}
                  placeholder="Enter age (1-150)"
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-1">
                    {icons["Occupation"]} Occupation
                    <span className="text-error font-semibold">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={formData.occupation}
                  onChange={(e) => {
                    const validatedOccupation = validateOccupation(
                      e.target.value
                    );
                    setFormData({
                      ...formData,
                      occupation: validatedOccupation,
                    });
                  }}
                  required
                  placeholder="Enter occupation (letters only)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-1">
                    {icons["Personality"]} Personality
                    <span className="text-error font-semibold">*</span>
                  </span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.personality}
                  onChange={(e) =>
                    setFormData({ ...formData, personality: e.target.value })
                  }
                  required
                >
                  <option value="">Select personality</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Sarcastic">Sarcastic</option>
                  <option value="Wise">Wise</option>
                  <option value="Humorous">Humorous</option>
                  <option value="Caring">Caring</option>
                  <option value="Analytical">Analytical</option>
                  <option value="Creative">Creative</option>
                  <option value="Adventurous">Adventurous</option>
                </select>
              </div>

              {/* Optional Fields */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text flex items-center gap-1">
                    {icons["Relationship Role"]} Relationship Role
                  </span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.relationship}
                  onChange={(e) =>
                    setFormData({ ...formData, relationship: e.target.value })
                  }
                >
                  <option value="">Select relationship</option>
                  <option value="Mentor">Mentor</option>
                  <option value="Friend">Friend</option>
                  <option value="Rival">Rival</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Teacher">Teacher</option>
                </select>
              </div>

              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text flex items-center gap-1">
                    {icons["Tone of Speech"]} Tone of Speech
                  </span>
                </label>
                <select
                  className="select select-bordered"
                  value={formData.tone}
                  onChange={(e) =>
                    setFormData({ ...formData, tone: e.target.value })
                  }
                >
                  <option value="">Select tone</option>
                  <option value="Formal">Formal</option>
                  <option value="Casual">Casual</option>
                  <option value="Poetic">Poetic</option>
                  <option value="Professional">Professional</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {isEditing ? (
                <>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isUpdatingChatBot}
                  >
                    {isUpdatingChatBot ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => navigate("/")}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isCreatingChatBot}
                >
                  {isCreatingChatBot ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EchoConfigPage;

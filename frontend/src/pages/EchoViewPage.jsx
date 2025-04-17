import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChatBotStore } from "../store/useChatBotStore";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import {
  Mars,
  Calendar,
  Briefcase,
  Smile,
  Heart,
  MessageSquare,
  UserCircle2,
  Clock,
} from "lucide-react";

const EchoViewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { chatbots } = useChatBotStore();

  const [bot, setBot] = useState(null);

  const icons = {
    Gender: <Mars className="w-4 h-4" />,
    Age: <Calendar className="w-4 h-4" />,
    Occupation: <Briefcase className="w-4 h-4" />,
    Personality: <Smile className="w-4 h-4" />,
    "Relationship Role": <Heart className="w-4 h-4" />,
    "Tone of Speech": <MessageSquare className="w-4 h-4" />,
    Creator: <UserCircle2 className="w-4 h-4" />,
    "Created On": <Clock className="w-4 h-4" />,
  };

  useEffect(() => {
    const chatbot = chatbots.find((b) => b._id === id);
    if (chatbot) {
      setBot(chatbot);
    } else {
      //toast.error("Echo not found");
      navigate("/");
    }
  }, [id, chatbots, navigate]);

  if (!bot) return null;

  const InfoBox = ({ label, value }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-base-content/60 flex items-center gap-1">
        {icons[label]} {label}
      </label>
      <p className="px-4 py-2.5 bg-base-200 rounded-lg border">
        {value || "-"}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-base-300 rounded-2xl p-8 shadow-md">
          <h1 className="text-2xl font-bold text-center mb-3">{bot.name}</h1>

          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <img
              src={bot.profilePic || "/avatar.png"}
              alt="Echo Avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-base-200"
            />
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <InfoBox label="Gender" value={bot.gender} />
            <InfoBox label="Age" value={bot.age} />
            <InfoBox label="Occupation" value={bot.occupation} />
            <InfoBox label="Personality" value={bot.personality} />
            <InfoBox label="Relationship Role" value={bot.relationship} />
            <InfoBox label="Tone of Speech" value={bot.tone} />
            <InfoBox label="Creator" value={bot.userId?.fullName} />
            <InfoBox
              label="Created On"
              value={dayjs(bot.createdAt).format("DD-MM-YYYY")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EchoViewPage;

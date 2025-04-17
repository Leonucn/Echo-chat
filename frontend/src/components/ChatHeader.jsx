import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useChatBotStore } from "../store/useChatBotStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { selectedChatBot, setSelectedChatBot } = useChatBotStore();
  const { onlineUsers } = useAuthStore();

  // Determine which type of chat is active
  const isEchoChat = Boolean(selectedChatBot);
  const activeChat = isEchoChat ? selectedChatBot : selectedUser;

  const handleClose = () => {
    if (isEchoChat) {
      setSelectedChatBot(null);
    } else {
      setSelectedUser(null);
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={activeChat?.profilePic || "/avatar.png"}
                alt={isEchoChat ? activeChat?.name : activeChat?.fullName}
              />
            </div>
          </div>

          {/* User/Echo info */}
          <div>
            <h3 className="font-medium">
              {isEchoChat ? activeChat?.name : activeChat?.fullName}
            </h3>
            {!isEchoChat ? (
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(activeChat?._id) ? "Online" : "Offline"}
              </p>
            ) : (
              <p className="text-sm text-base-content/70">
                {activeChat?.occupation}
              </p>
            )}
          </div>
        </div>

        {/* Close button */}
        <button onClick={handleClose}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;

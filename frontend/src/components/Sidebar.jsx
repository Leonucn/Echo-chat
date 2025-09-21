import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Bot, Users, Settings, Trash2, Info } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatBotStore } from "../store/useChatBotStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();

  const {
    getChatbots,
    chatbots,
    isGettingChatBot,
    selectedChatBot,
    setSelectedChatBot,
    isDeletingChatBot,
    deleteChatbot,
  } = useChatBotStore();

  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showMyEchosOnly, setShowMyEchosOnly] = useState(false);

  // Retrieve the last selected tab from local storage or default to "chatbots"
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "chatbots";
  });

  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);

  const currentUserId = authUser?._id;

  useEffect(() => {
    getUsers();
    getChatbots();
  }, [getUsers, getChatbots]);

  // Update local storage whenever activeTab changes
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const filteredChatbots = showMyEchosOnly
    ? chatbots.filter((chatbot) => chatbot.userId?._id === currentUserId)
    : chatbots;

  const handleDeleteClick = (chatbotId, e) => {
    e.stopPropagation();
    setDeleteTarget(chatbotId);
    document.getElementById("delete-modal").showModal();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteChatbot(deleteTarget);

      if (selectedChatBot?._id === deleteTarget) {
        setSelectedChatBot(null);
      }

      await getChatbots();
    } catch (error) {
      toast.error("Failed to delete Echo");
    } finally {
      setDeleteTarget(null);
    }
  };

  if (isUsersLoading || isGettingChatBot) return <SidebarSkeleton />;

  return (
    <>
      <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
        {/* Tab Buttons */}
        <div className="flex gap-1 px-2 pt-2 border-b border-base-300">
          <button
            className={`flex-1 px-4 py-1.5 rounded-t-xl relative ${
              activeTab === "users"
                ? "text-primary font-bold"
                : "text-base-content/50"
            }`}
            onClick={() => setActiveTab("users")}
          >
            Users
            {activeTab === "users" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary" />
            )}
          </button>
          <button
            className={`flex-1 px-4 py-1.5 rounded-t-xl relative ${
              activeTab === "chatbots"
                ? "text-primary font-bold"
                : "text-base-content/50"
            }`}
            onClick={() => setActiveTab("chatbots")}
          >
            Chatbots
            {activeTab === "chatbots" && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary" />
            )}
          </button>
        </div>

        {/* Users Section */}
        {activeTab === "users" && (
          <>
            <div className="border-b border-base-300 w-full p-5">
              <div className="flex items-center gap-2">
                <Users className="size-6" />
                <span className="font-medium hidden lg:block">Contacts</span>
              </div>
              {/* Online filter toggle */}
              <div className="mt-3 hidden lg:flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showOnlineOnly}
                    onChange={(e) => setShowOnlineOnly(e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  <span className="text-sm">Show online only</span>
                </label>
                <span className="text-xs text-zinc-500">
                  ({onlineUsers.length - 1} online)
                </span>
              </div>
            </div>

            <div className="overflow-y-auto w-full py-3">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  onClick={() => {
                    setSelectedChatBot(null);
                    setSelectedUser(user);
                  }}
                  className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                    selectedUser?._id === user._id
                      ? "bg-base-300 ring-1 ring-base-300"
                      : ""
                  }`}
                >
                  <div className="relative mx-auto lg:mx-0">
                    <img
                      src={user.profilePic || "/avatar.png"}
                      alt={user.name}
                      className="size-12 object-cover rounded-full"
                    />
                    {onlineUsers.includes(user._id) && (
                      <span
                        className="absolute bottom-0 right-0 size-3 bg-green-500 
                        rounded-full ring-2 ring-zinc-900"
                      />
                    )}
                  </div>
                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{user.fullName}</div>
                    <div className="text-sm text-zinc-400">
                      {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Chatbots Section */}
        {activeTab === "chatbots" && (
          <>
            <div className="border-b border-base-300 w-full p-5">
              <div className="flex items-center gap-2">
                <Bot className="size-6" />
                <span className="font-medium hidden lg:block">Echos</span>
              </div>
              {/* My Echos filter toggle */}
              <div className="mt-3 hidden lg:flex items-center gap-2">
                <label className="cursor-pointer flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showMyEchosOnly}
                    onChange={(e) => setShowMyEchosOnly(e.target.checked)}
                    className="checkbox checkbox-sm"
                  />
                  <span className="text-sm">Show My Echos only</span>
                </label>
                <span className="text-xs text-zinc-500">
                  (
                  {
                    chatbots.filter(
                      (chatbot) => chatbot.userId?._id === currentUserId
                    ).length
                  }{" "}
                  owned)
                </span>
              </div>
            </div>

            <div className="overflow-y-auto w-full py-3">
              {filteredChatbots.length === 0 ? (
                <div className="text-center text-zinc-500 py-4">
                  {showMyEchosOnly ? "No Echos created by you" : "No chatbots"}
                </div>
              ) : (
                filteredChatbots.map((chatbot) => (
                  <div key={chatbot._id} className="group relative">
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setSelectedChatBot(chatbot);
                      }}
                      className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                        selectedChatBot?._id === chatbot._id
                          ? "bg-base-300 ring-1 ring-base-300"
                          : ""
                      }`}
                    >
                      <div className="relative mx-auto lg:mx-0">
                        <img
                          src={chatbot.profilePic || "/avatar.png"}
                          alt={chatbot.name}
                          className="size-12 object-cover rounded-full"
                        />
                      </div>
                      <div className="hidden lg:block text-left min-w-0">
                        <div className="font-medium truncate">
                          {chatbot.name}
                        </div>
                        <div className="text-sm text-zinc-400">
                          {chatbot.occupation}
                        </div>
                      </div>
                    </button>

                    {/* Action Buttons - Only visible on hover */}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-3">
                      {chatbot.userId?._id === currentUserId ? (
                        // Config Button for the creator
                        <>
                          <button
                            className="relative size-8 hover:scale-110 transition-transform"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/echo/edit/${chatbot._id}`);
                            }}
                          >
                            <svg
                              viewBox="0 0 100 100"
                              className="size-full fill-none stroke-2"
                            >
                              <path
                                d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
                                className="stroke-base-content"
                              />
                            </svg>
                            <Settings className="size-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                          </button>

                          {/* Delete Button */}
                          <button
                            className="relative size-8 hover:scale-110 transition-transform"
                            onClick={(e) => handleDeleteClick(chatbot._id, e)}
                            disabled={isDeletingChatBot}
                          >
                            <svg
                              viewBox="0 0 100 100"
                              className="size-full fill-none stroke-2"
                            >
                              <path
                                d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
                                className="stroke-base-content"
                              />
                            </svg>
                            <Trash2 className="size-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500" />
                          </button>
                        </>
                      ) : (
                        // Info Button for non-creators
                        <button
                          className="relative size-8 hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/echo/${chatbot._id}`);
                          }}
                        >
                          <svg
                            viewBox="0 0 100 100"
                            className="size-full fill-none stroke-2"
                          >
                            <path
                              d="M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z"
                              className="stroke-base-content"
                            />
                          </svg>
                          <Info className="size-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </aside>

      {/* Delete Confirmation Modal */}
      <dialog id="delete-modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-sm p-6 rounded-xl flex flex-col items-center justify-center min-h-[200px]">
          <h3 className="font-semibold text-lg">Delete Echo</h3>
          <div className="space-y-2 text-sm text-base-content/80 mt-4 text-center">
            <p>Are you sure you want to delete this Echo?</p>
            <p>This action cannot be undone!</p>
          </div>
          <div className="mt-6 flex gap-2 justify-center">
            <button
              className="btn btn-sm btn-ghost px-4"
              onClick={() => {
                setDeleteTarget(null);
                document.getElementById("delete-modal").close();
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-error px-4"
              onClick={handleConfirmDelete}
              disabled={isDeletingChatBot}
            >
              {isDeletingChatBot ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setDeleteTarget(null)}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default Sidebar;

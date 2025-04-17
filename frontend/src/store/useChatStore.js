import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { useChatBotStore } from "./useChatBotStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUserLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const { selectedChatBot } = useChatBotStore.getState();
    const activeChat = selectedChatBot || selectedUser;

    try {
      // Determine the endpoint based on chat type
      const endpoint = selectedChatBot
        ? `/messages/send/chatbot/${activeChat._id}`
        : `/messages/send/${activeChat._id}`;

      const res = await axiosInstance.post(endpoint, messageData);
      set({ messages: [...get().messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    const { selectedChatBot } = useChatBotStore.getState();
    const activeChat = selectedChatBot || selectedUser;

    if (!activeChat) return;

    const socket = useAuthStore.getState().socket;
    socket.on("newMessage", (newMessage) => {
      const isMessageFromActiveChat =
        newMessage.senderId === activeChat._id ||
        newMessage.receiverId === activeChat._id;

      if (!isMessageFromActiveChat) return;

      // Check if message already exists in the messages array
      const messages = get().messages;
      const messageExists = messages.some((msg) => msg._id === newMessage._id);

      if (!messageExists) {
        set({ messages: [...messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));

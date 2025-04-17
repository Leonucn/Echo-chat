import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios.js";
import { useAuthStore } from "./useAuthStore";

export const useChatBotStore = create((set, get) => ({
  chatbots: [],
  selectedChatBot: null,
  isCreatingChatBot: false,
  isUpdatingChatBot: false,
  isDeletingChatBot: false,
  isGettingChatBot: false,

  getChatbots: async () => {
    set({ isGettingChatBot: true });
    try {
      const res = await axiosInstance.get("/chatbot");
      set({ chatbots: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isGettingChatBot: false });
    }
  },

  createChatbot: async (data) => {
    set({ isCreatingChatBot: true });

    try {
      const res = await axiosInstance.post("/chatbot", data);
      set((state) => ({
        chatbots: [...state.chatbots, res.data],
      }));
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isCreatingChatBot: false });
    }
  },

  updateChatbot: async (id, chatbotData) => {
    set({ isUpdatingChatBot: true });

    try {
      const res = await axiosInstance.put(`/chatbot/${id}`, chatbotData);
      set((state) => ({
        chatbots: state.chatbots.map((chatbot) =>
          chatbot._id === id ? res.data : chatbot
        ),
      }));
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingChatBot: false });
    }
  },

  deleteChatbot: async (id) => {
    set({ isDeletingChatBot: true });

    try {
      await axiosInstance.delete(`/chatbot/${id}`);
      set((state) => ({
        chatbots: state.chatbots.filter((chatbot) => chatbot._id !== id),
      }));
      toast.success("Echo deleted successfully!");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isDeletingChatBot: false });
    }
  },

  setSelectedChatBot: (selectedChatBot) => set({ selectedChatBot }),
}));

import Groq from "groq-sdk";
import Chatbot from "../models/chatbot.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateRoleString = (
  name,
  age,
  gender,
  occupation,
  personality,
  relationship,
  tone
) => {
  let roleString = `You are ${name}, a ${age}-year-old ${gender} ${occupation} with an ${personality} personality.`;

  if (relationship) {
    roleString += ` You act as the user's ${relationship} in conversations.`;
  }

  if (tone) {
    roleString += ` You speak in a ${tone} tone.`;
  }

  // Add human behavior simulation
  roleString += ` Stay in character at all times. Respond like a real person—use contractions, casual phrasing, and natural language. Avoid repeating phrases like "As a ${occupation}" unless it truly fits the context.`;

  // Smart concise mode
  if (tone === "poetic" || tone === "formal") {
    roleString += ` Keep your responses well-structured and clear. Avoid overly casual phrasing unless it fits the context. Elaborate only when needed.`;
  } else {
    roleString += ` Keep your responses short and casual. Avoid overexplaining unless the user asks. Talk like a friend texting — quick, natural, and easy to understand.`;
  }

  return roleString;
};

export const createChatbot = async (req, res) => {
  try {
    const {
      name,
      gender,
      age,
      occupation,
      personality,
      relationship,
      tone,
      profilePic,
      isPrivate,
    } = req.body;
    const userId = req.user._id;

    // Test each required parameter individually for better error messages
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    if (!gender) {
      return res.status(400).json({ message: "Gender is required" });
    }
    if (!age) {
      return res.status(400).json({ message: "Age is required" });
    }
    if (!occupation) {
      return res.status(400).json({ message: "Occupation is required" });
    }
    if (!personality) {
      return res.status(400).json({ message: "Personality is required" });
    }

    const newChatbot = new Chatbot({
      userId,
      name,
      gender,
      age,
      occupation,
      personality,
      ...(relationship && { relationship }),
      ...(tone && { tone }),
      ...(isPrivate !== undefined && { isPrivate }),
    });

    await newChatbot.save();

    if (profilePic) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedChatbot = await Chatbot.findByIdAndUpdate(
          newChatbot._id,
          { profilePic: uploadResponse.secure_url },
          { new: true }
        );

        // Return the updated chatbot with profile pic
        return res.status(201).json({
          _id: updatedChatbot._id,
          name: updatedChatbot.name,
          gender: updatedChatbot.gender,
          age: updatedChatbot.age,
          occupation: updatedChatbot.occupation,
          personality: updatedChatbot.personality,
          relationship: updatedChatbot.relationship,
          tone: updatedChatbot.tone,
          profilePic: updatedChatbot.profilePic,
          isPrivate: updatedChatbot.isPrivate,
        });
      } catch (error) {
        console.log("Error uploading profile picture:", error.message);
        // Still return the chatbot even if profile pic upload fails
        return res.status(201).json({
          _id: newChatbot._id,
          name: newChatbot.name,
          gender: newChatbot.gender,
          age: newChatbot.age,
          occupation: newChatbot.occupation,
          personality: newChatbot.personality,
          relationship: newChatbot.relationship,
          tone: newChatbot.tone,
          profilePic: "",
          isPrivate: newChatbot.isPrivate,
        });
      }
    }

    // Return the chatbot without profile pic if none was provided
    res.status(201).json({
      _id: newChatbot._id,
      name: newChatbot.name,
      gender: newChatbot.gender,
      age: newChatbot.age,
      occupation: newChatbot.occupation,
      personality: newChatbot.personality,
      relationship: newChatbot.relationship,
      tone: newChatbot.tone,
      profilePic: newChatbot.profilePic,
      isPrivate: newChatbot.isPrivate,
    });
  } catch (error) {
    console.log("Error in createChatbot controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllChatbots = async (req, res) => {
  try {
    const userId = req.user._id;
    const chatbots = await Chatbot.find({
      $or: [
        { userId: userId }, // Chatbots created by the current user
        { isPrivate: false }, // Chatbots that are not private
      ],
    }).populate("userId", "fullName");

    res.status(200).json(chatbots);
  } catch (error) {
    console.log("Error in getAllChatbots controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateChatbotConfig = async (req, res) => {
  try {
    const {
      name,
      gender,
      age,
      occupation,
      personality,
      relationship,
      tone,
      profilePic,
      isPrivate,
    } = req.body;
    const userId = req.user._id;
    const { id } = req.params;

    // Validate required fields
    if (!name || !gender || !age || !occupation || !personality) {
      return res.status(400).json({
        message: "Name, gender, age, occupation, and personality are required",
      });
    }

    // Check if the chatbot exists and belongs to the user
    const existingChatbot = await Chatbot.findOne({ _id: id, userId });
    if (!existingChatbot) {
      return res.status(404).json({ message: "Chatbot not found" });
    }

    const updateFields = {
      name,
      gender,
      age,
      occupation,
      personality,
      ...(relationship && { relationship }),
      ...(tone && { tone }),
      ...(isPrivate !== undefined && { isPrivate }),
    };

    // Recalculate the role based on updated fields
    updateFields.role = generateRoleString(
      name,
      age,
      gender,
      occupation,
      personality,
      relationship,
      tone
    );

    if (profilePic && profilePic !== existingChatbot.profilePic) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        updateFields.profilePic = uploadResponse.secure_url;
      } catch (error) {
        console.log("Error uploading profile picture:", error.message);
      }
    }

    const updatedChatbot = await Chatbot.findOneAndUpdate(
      { _id: id, userId },
      updateFields,
      { new: true }
    );

    return res.status(200).json(updatedChatbot);
  } catch (error) {
    console.log("Error in updateChatbotConfig controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteChatbot = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Delete the chatbot
    const chatbot = await Chatbot.findOneAndDelete({ _id: id, userId });
    if (!chatbot) {
      return res.status(404).json({ message: "Chatbot not found" });
    }

    // Delete messages related to the chatbot
    await Message.deleteMany({ $or: [{ senderId: id }, { receiverId: id }] });

    res.status(200).json({ message: "Chatbot deleted successfully" });
  } catch (error) {
    console.log("Error in deleteChatbot controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendChatbotMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: chatbotId } = req.params;
    const userId = req.user._id;

    let config = await Chatbot.findOne({
      _id: chatbotId,
      //userId: userId,
    });

    if (!config) {
      return res.status(404).json({
        message: "Chatbot not found",
      });
    }

    // Get the latest 14 messages
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: chatbotId },
        { senderId: chatbotId, receiverId: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(14);

    // Prepare the messages array
    const messageHistory = [
      { role: "system", content: config.role }, // Include the system prompt
      ...messages.reverse().map((msg) => ({
        role: msg.senderId.equals(userId) ? "user" : "assistant",
        content: msg.text,
      })),
      { role: "user", content: text }, // Add the current user message
    ];

    // Get AI response
    const completion = await groq.chat.completions.create({
      messages: messageHistory,
      model: "llama3-8b-8192",
      temperature: config.temperature,
      max_tokens: config.maxTokens,
    });

    const response = completion.choices[0]?.message?.content;

    // Save user's message first
    const userMessage = new Message({
      senderId: userId,
      receiverId: chatbotId,
      text,
    });
    await userMessage.save();

    // Save chatbot's response
    const botMessage = new Message({
      senderId: chatbotId,
      receiverId: userId,
      text: response,
    });
    await botMessage.save();

    // Emit both messages through socket
    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      // Emit user's message
      io.to(receiverSocketId).emit("newMessage", userMessage);
      // Emit bot's response
      setTimeout(() => {
        io.to(receiverSocketId).emit("newMessage", botMessage);
      }, 500); // Small delay to simulate typing
    }

    return res.status(200).json(botMessage);
  } catch (error) {
    console.log("Error in sendChatbotMessage controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

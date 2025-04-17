import mongoose from "mongoose";

const chatbotSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Required fields
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: ["Male", "Female", "Non-binary"],
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [1, "Age must be at least 1"],
      max: [150, "Age must be less than 150"],
    },
    occupation: {
      type: String,
      required: [true, "Occupation is required"],
      trim: true,
    },
    personality: {
      type: String,
      required: [true, "Personality is required"],
      enum: [
        "Friendly",
        "Sarcastic",
        "Wise",
        "Humorous",
        "Caring",
        "Analytical",
        "Creative",
        "Adventurous",
      ],
    },

    // Optional fields
    profilePic: {
      type: String,
      default: "",
    },
    relationship: {
      type: String,
      enum: ["Mentor", "Friend", "Rival", "Sibling", "Colleague", "Teacher"],
    },
    tone: {
      type: String,
      enum: ["Formal", "Casual", "Poetic", "Professional"],
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },

    // System fields (hidden from user)
    role: {
      type: String,
      default: function () {
        // Build role string dynamically based on available fields
        let roleString = `You are ${this.name}, a ${this.age}-year-old ${this.gender} ${this.occupation}.`;

        if (this.personality) {
          roleString += ` Your personality is ${this.personality}.`;
        }

        if (this.relationship) {
          roleString += ` You act as the user's ${this.relationship}.`;
        }

        return roleString;
      },
    },
    temperature: {
      type: Number,
      default: 0.9,
      select: false,
    },
    maxTokens: {
      type: Number,
      default: 100,
      select: false,
    },
  },
  { timestamps: true }
);

// Middleware to automatically generate role before saving
chatbotSchema.pre("save", function (next) {
  let roleString = `You are ${this.name}, a ${this.age}-year-old ${this.gender} ${this.occupation} with an ${this.personality} personality.`;

  if (this.relationship) {
    roleString += ` You act as the user's ${this.relationship} in conversations.`;
  }

  if (this.tone) {
    roleString += ` You speak in a ${this.tone} tone.`;
  }

  // Add human behavior simulation
  roleString += ` Stay in character at all times. Respond like a real person—use contractions, casual phrasing, and natural language. Avoid repeating phrases like "As a ${this.occupation}" unless it truly fits the context.`;

  // Smart concise mode
  if (this.tone === "poetic" || this.tone === "formal") {
    roleString += ` Keep your responses well-structured and clear. Avoid overly casual phrasing unless it fits the context. Elaborate only when needed.`;
  } else {
    roleString += ` Keep your responses short and casual. Avoid overexplaining unless the user asks. Talk like a friend texting — quick, natural, and easy to understand.`;
  }

  this.role = roleString;
  next();
});

const Chatbot = mongoose.model("Chatbot", chatbotSchema);
export default Chatbot;

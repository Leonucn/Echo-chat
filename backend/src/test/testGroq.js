import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const testGroqAPI = async () => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful AI assistant. Please respond in a professional tone.",
          },
          {
            role: "user",
            content: "The weather is nice recently, do u have any plans?",
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response:", response.data.choices[0]?.message?.content);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

testGroqAPI();

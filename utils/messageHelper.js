import axios from "axios";
import { teleGramAPI } from "../config/botConfig.js";
import { TelegramBot } from "../models/User.js";

export const sendMessage = async (chatId, text, lastMessage) => {
    const payload = {
        chat_id: chatId,
        text,
    };

    // // Buttons ko sahi format me bhejna
    // if (Buttons) {
    //     payload.reply_markup = {
    //         inline_keyboard: Buttons, // Telegram expects buttons inside `reply_markup`
    //     };
    // }

    try {
        const response = await axios.post(`${teleGramAPI}/sendMessage`, payload);
        // console.log("Message sent successfully:", response.data);

        // Agar userFlow diya gaya hai, to next step ko update karo
        if (lastMessage) {
            await updateLastMessage(chatId, lastMessage);
        }

    } catch (error) {
        console.error("Error sending message:", error.response?.data || error.message);
    }
};



export const sendPhoto = async (chatId, photoUrl, caption, options) => {
    const payload = {
        chat_id: chatId,
        photo: photoUrl,
        caption,
        ...(options && { reply_markup: options }),
    };
    try {
        await axios.post(`${teleGramAPI}/sendPhoto`, payload);
    } catch (error) {
        console.error("Error sending photo:", error.response?.data || error.message);
    }
};

export const updateLastMessage = async (chatId, lastMessage) => {
    // console.log("Updating last message:", lastMessage);
    try {
        const telegramBot = await TelegramBot.findOneAndUpdate(
            { recipient: chatId }, // Find by chatId
            { last_message: lastMessage }, // Update last_message
            { upsert: true, new: true } // Create if not exists (upsert)
        );

        // console.log("Updated document:", telegramBot);
    } catch (error) {
        console.error("Error updating last message:", error.response?.data || error.message);
    }
};

 export async function sendButtons(chatId, Buttons,text, lastMessage) {
    // console.log("we are in sendButtons" , lastMessage)
    try {
        const response = await axios.post(`${teleGramAPI}/sendMessage`, {
            chat_id: chatId,
            text: text,
            reply_markup: {
                inline_keyboard: Buttons,
            },
        });
        // console.log('Buttons sent:', response.data);
        if (lastMessage) {
            await updateLastMessage(chatId, lastMessage);
        }
    } catch (error) {
        console.error('Error sending buttons:', error.response?.data || error.message);
    }
}
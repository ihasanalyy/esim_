
import { TelegramBot, User } from "../models/User.js"; // Import User model
import { sendPhoto, sendMessage, sendButtons } from "../utils/messageHelper.js";
import { registerUser } from './registerUser.js';


export const handleUpdates = async (req, res) => {
    // console.log("Received update:", JSON.stringify(req.body, null, 2));

    const data = req.body;
    let chatId;
    const currentTime = new Date();

    let text_message = null;
    let callback_query = null;
    let edited_message = null;
    let image_payloads = [];
    let video_payloads = [];


    //  Find chat data in MongoDB

    if (data.message) {
        if (data.message.text) {
            text_message = data.message.text;
            // console.log('Text Message:', text_message);
        }
        if (data.message.photo) {
            image_payloads = data.message.photo.map(photo => ({
                file_id: photo.file_id,
                caption: data.message.caption || null
            }));
            console.log('Image Payloads:', image_payloads);
        }
        if (data.message.video) {
            video_payloads = [{
                file_id: data.message.video.file_id,
                caption: data.message.caption || null,
                mime_type: data.message.video.mime_type
            }];
            // console.log('Video Payloads:', video_payloads);
        }
        chatId = data.message.chat.id.toString()
    } else if (data.callback_query) {
        callback_query = data.callback_query.data;
        chatId = data.callback_query.message.chat.id.toString()
        // console.log('Callback Query:', callback_query);
    }
    let chat = await TelegramBot.findOne({ recipient: chatId });

    //  If last message is the same, avoid duplicate processing
    if (chat && chat.last_message === text_message) {
        // console.log("Duplicate message detected, ignoring:", text_message);
        return res.sendStatus(200); //  Early exit
    }
    var last_message;
    //  Save new last_message to prevent repeat responses
    if (chat) {
        console.log("1111111111111111111111111111111we are in chat")
        // console.log("Updating existing chat:", chatId);
        // console.log("chat.last_meshihihsage", chat.last_message);
        if (text_message !== "4WOHZT9V") {
            let last_message;
            // chat.last_message =  await TelegramBot.findOneAndUpdate({ last_message: last_message }) || text_message || "unknown";
            chat.last_message = callback_query || text_message || "unknown";
            chat.last_message_time = currentTime;
            await chat.save();
        }
    // } else {
    //     chat = new TelegramBot({
    //         recipient: chatId,
    //         last_message_time: currentTime,
    //         last_message: text_message || callback_query || "unknown",
    //     });
    //     await chat.save();
    // }

    // ✅ Proceed with responses
    if (text_message === "hello") {
        // console.log("Processing 'hello' message for", chatId);
        const buttons = [
            [{ text: "Connect Account", callback_data: "connect_account" }],
            [{ text: "Register", callback_data: "register" }],
            [{ text: "Change Language", callback_data: "language_change" }],
        ];
        await sendPhoto(chatId, "https://cdn.pixabay.com/photo/2023/01/08/14/22/sample-7705350_640.jpg");
        await sendButtons(chatId, buttons, "Welcome onboard!");
    } else if (callback_query || text_message) {
        console.log("Handling callback query:", callback_query);
        console.log("text_message", text_message)
        await registerUser(chatId, callback_query, chat, text_message);
    }
    return res.sendStatus(200); // ✅ Respond with 200 OK to prevent Telegram retries
};}

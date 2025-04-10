const axios = require('axios');
const TelegramBotModel = require('../models/TelegramBot.model');
const lang = require('../utils/languages/languages.json');
const { getServices } = require('./InstaChatbotHelpers');
const BeneficiaryModel = require('../models/Beneficiary.model');
const token = process.env.TELEGRAM_BOT_TOKEN;
const apiUrl = `https://api.telegram.org/bot${token}`;

const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
}); 

const s3 = new AWS.S3();

async function sendMessage(chatId, text, lastMessage) {
    try {
        const response = await axios.post(`${apiUrl}/sendMessage`, {
            chat_id: chatId,
            text: text,
        });
        console.log('Message sent:', response.data);
        if (lastMessage) {
            await updateLastMessage(chatId, lastMessage);
        }
    } catch (error) {
        console.error('Error sending message:', error.response?.data || error.message);
    }
}

async function sendPhoto(chatId, photoUrl, caption, lastMessage) {
    try {
        const response = await axios.post(`${apiUrl}/sendPhoto`, {
            chat_id: chatId,
            photo: photoUrl,
            caption: caption,
        });
        if (lastMessage) {
            await updateLastMessage(chatId, lastMessage);
        }
        console.log('Photo sent:', response.data);
    } catch (error) {
        console.error('Error sending photo:', error.response?.data || error.message);
    }
}

async function sendDocument(chatId, documentUrl, caption) {
    try {
        const response = await axios.post(`${apiUrl}/sendDocument`, {
            chat_id: chatId,
            document: documentUrl,
            caption: caption,
        });
        console.log('Document sent:', response.data);
    } catch (error) {
        console.error('Error sending document:', error.response?.data || error.message);
    }
}


async function sendVideo(chatId, videoUrl, caption) {
    try {
        const response = await axios.post(`${apiUrl}/sendVideo`, {
            chat_id: chatId,
            video: videoUrl,
            caption: caption,
        });
        console.log('Video sent:', response.data);
    } catch (error) {
        console.error('Error sending video:', error.response?.data || error.message);
    }
}

async function sendVideoNote(chatId, videoUrl, caption) {
    try {
        const response = await axios.post(`${apiUrl}/sendVideoNote`, {
            chat_id: chatId,
            video_note: videoUrl,
            caption: caption,
        });
        console.log('Video sent:', response.data);
    } catch (error) {
        console.error('Error sending video:', error.response?.data || error.message);
    }
}

async function sendButtons(chatId, text, buttons, lastMessage) {
    try {
        const response = await axios.post(`${apiUrl}/sendMessage`, {
            chat_id: chatId,
            text: text,
            reply_markup: {
                inline_keyboard: buttons,
            },
        });
        console.log('Buttons sent:', response.data);
        if (lastMessage) {
            await updateLastMessage(chatId, lastMessage);
        }
    } catch (error) {
        console.error('Error sending buttons:', error.response?.data || error.message);
    }
}

async function sendMediaGroup(chatId, media) {
    try {
        const response = await axios.post(`${apiUrl}/sendMediaGroup`, {
            chat_id: chatId,
            media: media,
        });
        console.log('Media group sent:', response.data);
    } catch (error) {
        console.log(error.response?.data || error.message);
    }
}

async function sendLocation(chatId, latitude, longitude, options = {}) {
    try {
        // Telegram API URL for sendLocation

        // Construct request payload
        const payload = {
            chat_id: chatId,
            latitude: latitude,
            longitude: longitude,
            ...options, // Optional parameters like live_period, disable_notification, reply_to_message_id
        };

        // Send request
        const response = await axios.post(`${apiUrl}/sendLocation`, payload);

        // Handle successful response
        console.log('Location sent successfully:', response.data);
        return response.data;
    } catch (error) {
        // Handle errors
        console.error('Error sending location:', error.response?.data || error.message);
        throw error;
    }
}

async function sendVenue(chatId, latitude, longitude, title, address, options = {}) {
    try {

        // Construct request payload
        const payload = {
            chat_id: chatId,
            latitude: latitude,
            longitude: longitude,
            title: title,
            address: address,
            ...options, // Optional parameters like phone_number, foursquare_id, etc.
        };

        // Send request
        const response = await axios.post(`${apiUrl}/sendVenue`, payload);

        // Handle successful response
        console.log('Venue sent successfully:', response.data);
        return response.data;
    } catch (error) {
        // Handle errors
        console.error('Error sending venue:', error.response?.data || error.message);
        throw error;
    }
}

async function sendPoll(chatId, question, options, optionsConfig = {}) {
    try {

        // Construct the request payload
        const payload = {
            chat_id: chatId,
            question: question,
            options: options, // Array of answer options
            is_anonymous: true, // Default: true (anonymous voting)
            type: 'regular', // Default: 'regular' (single-choice), can also be 'quiz' (with correct answer)
            ...optionsConfig, // Optional configurations like time_limit, correct_answer, etc.
        };

        // Send the request to the API
        const response = await axios.post(`${apiUrl}/sendPoll`, payload);

        // Handle successful response
        console.log('Poll sent successfully:', response.data);
        return response.data;
    } catch (error) {
        // Handle errors
        console.error('Error sending poll:', error.response?.data || error.message);
        throw error;
    }
}

async function sendDice(chatId, emoji = '🎲') {
    try {
        // Telegram API URL for sendDice

        // Construct the request payload
        const payload = {
            chat_id: chatId,
            emoji: emoji, // Emoji for the dice roll (default: 🎲)
        };

        // Send the request to the API
        const response = await axios.post(`${apiUrl}/sendDice`, payload);

        // Handle successful response
        console.log('Dice sent successfully:', response.data);
        return response.data;
    } catch (error) {
        // Handle errors
        console.error('Error sending dice:', error.response?.data || error.message);
        throw error;
    }
}

async function sendChatAction(chatId, action) {
    try {
        const payload = {
            chat_id: chatId,
            action: action
        };

        const response = await axios.post(`${apiUrl}/sendChatAction`, payload);
        console.log('Action sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending chat action:', error.response?.data || error.message);
        // throw error;
    }
}

// Helper function to get the file URL from Telegram
async function getFileUrl(file_id) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const apiUrl = `https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`;
    try {
        const response = await axios.get(apiUrl);
        const filePath = response.data.result.file_path;
        return `https://api.telegram.org/file/bot${token}/${filePath}`;
    } catch (error) {
        console.error('Error getting file URL:', error);
        throw new Error('Unable to retrieve file URL');
    }
};

async function updateLastMessage(chatId, lastMessage) {
    try {

        let telegramBot = await TelegramBotModel.findOne({ recipient: chatId });
        if (telegramBot) {
            telegramBot.last_message = lastMessage;
            await telegramBot.save();
        } else {
            await new TelegramBotModel({ recipient: chatId, last_message: lastMessage }).save();
        }
    } catch (error) {
        console.error('Error updating last message:', error);
    }
}

async function mainMenuMessage(chatId, selectedLanguage, chat) {


    if (chat?.international_transfer && Object.keys(chat?.international_transfer).length > 0) {
        chat.international_transfer = {};
    }
    if (chat?.otpToken) {
        chat.otpToken = undefined;
    }
    if (chat?.otpType) {
        chat.otpType = undefined;
    }
    if (chat?.otpAttemptCount > 0) {
        chat.otpAttemptCount = 0;
    }
    if (chat?.chatbotBannedUntil) {
        chat.chatbotBannedUntil = undefined;
    }
    if (chat?.chatbotFailedAttempts > 0) {
        chat.chatbotFailedAttempts = 0;
    }
    if (chat?.chatbotFirstFailedAttempt) {
        chat.chatbotFirstFailedAttempt = undefined;
    }

    // Save updated chat document if changes were made
    if (chat?.isModified()) {
        await chat.save();
    }

    const menuOptions = [
        [
            { text: "💼 Wallet Overview", callback_data: "wallet_overview" }
        ],
        [
            { text: lang[selectedLanguage].INITIATE_PAYMENT, callback_data: "initiate_payment" }
        ],
        [
            { text: "💳 My Mastercard", callback_data: "initiate_payment" }
        ],
        [
            { text: lang[selectedLanguage].MY_TRANSACTIONS, callback_data: "my_transactions" }
        ],
        [
            { text: lang[selectedLanguage].QR_QUICKPAY, callback_data: "qr_quickpay" }
        ],
        [
            { text: lang[selectedLanguage].MY_QR_CODE, callback_data: "my_qrcode" }
        ],
        [
            { text: lang[selectedLanguage].EXPLORE_MORE, callback_data: "explore_more" }
        ],
        [
            { text: lang[selectedLanguage].CHANGE_LANGUAGE, callback_data: "language_change" }
        ],
        [
            { text: lang[selectedLanguage].CHAT_WITH_US, callback_data: "chat_with_us" }
        ]
    ];

    await sendButtons(chatId, lang[selectedLanguage].WELCOME_BACK, menuOptions, "4");
}

async function invalidInputResponse(selectedLanguage, chat) {

    let lastMessage, callbackData;
    if (chat?.account_connected && !chat.last_message.startsWith("register") && !chat.last_message.startsWith("connect")) {
        lastMessage = "4"
        callbackData = "main_menu"
    } else {
        lastMessage = "connect"
        callbackData = "register_template"
    }
    const buttons = [
        [
            { text: lang[selectedLanguage].MAIN_MENU, callback_data: callbackData }
        ]
    ]

    await sendButtons(chat.recipient, "Invalid input. Please try again with a valid input.", buttons, lastMessage);


}

async function handleCountrySelection(chatId, countryCode, selectedLanguage) {
    const availableServices = await getServices(countryCode);

    const serviceTitles = {
        MobileWallet: lang[selectedLanguage].MOBILE_WALLET,
        BankAccount: lang[selectedLanguage].BANK_ACCOUNT,
        CashPickup: lang[selectedLanguage].CASH_PICKUP,
    };

    const buttons = [];
    const allowedServices = ["MobileWallet", "BankAccount", "CashPickup"];

    for (const serviceKey of allowedServices) {
        if (availableServices.hasOwnProperty(serviceKey) && availableServices[serviceKey].status === 'true') {
            buttons.push([
                {
                    text: serviceTitles[serviceKey],
                    callback_data: `intl_transfer_service-${availableServices[serviceKey]?.id}`,
                },
            ]);
        }
    }

    buttons.push([{ text: lang[selectedLanguage].MAIN_MENU_MESSAGE, callback_data: "main_menu" }]);

    await sendButtons(chatId, lang[selectedLanguage].RECEIVE_FUNDS, buttons, "intl_transfer_service");
}

async function somethingWentWrongQuickReplyTelegram(chatId, message, selectedLanguage) {
    await sendButtons(chatId, message, [[{ text: lang[selectedLanguage].MAIN_MENU_MESSAGE, callback_data: "main_menu" }]], "4");
}

async function userKYCVerificationTemplateTelegram(chatId, selectedLanguage) {
    const buttons = [
        [{ text: lang[selectedLanguage].VERIFY, callback_data: "kyc_verification" }],
        [{ text: lang[selectedLanguage].MAIN_MENU_MESSAGE, callback_data: "main_menu" }]
    ];

    const message = "Please verify your identity to make an international transfer.";

    await sendButtons(chatId, message, buttons, "4");
}

async function showBeneficiaries(telegramChatbot, countryISO, context, selectedLanguage) {
    const beneficiaries = await BeneficiaryModel.find({ account: telegramChatbot.account?._id });
    let filteredBeneficiaries;

    if (telegramChatbot.international_transfer.intl_payout_method === "1") {
        filteredBeneficiaries = beneficiaries?.filter(beneficiary => beneficiary.account_type.includes('mobile') && beneficiary.country_iso_code?.toLowerCase() === countryISO.toLowerCase());
    } else if (telegramChatbot.international_transfer.intl_payout_method === "2") {
        filteredBeneficiaries = beneficiaries?.filter(beneficiary => beneficiary.account_type.includes('bank') && beneficiary.country_iso_code?.toLowerCase() === countryISO.toLowerCase());
    } else {
        filteredBeneficiaries = beneficiaries?.filter(beneficiary => beneficiary.account_type.includes('cash') && beneficiary.country_iso_code?.toLowerCase() === countryISO.toLowerCase());
    }

    console.log({ filteredBeneficiaries }, "beneficiaries", { beneficiaries }, filteredBeneficiaries.length);

    if (filteredBeneficiaries?.length > 0) {
        const numberOfBeneficiariesPerPage = 8;
        let currentPage = 1;
        const startIndex = (currentPage - 1) * numberOfBeneficiariesPerPage;
        const endIndex = startIndex + numberOfBeneficiariesPerPage;

        const beneficiariesToDisplay = filteredBeneficiaries.slice(startIndex, endIndex);

        const buttons = beneficiariesToDisplay.map((beneficiary) => [
            {
                text: `${beneficiary?.first_name} ${beneficiary?.last_name}`,
                callback_data: `${context}_sb_${beneficiary._id}`
            }
        ]);

        console.log(buttons, "buttons");
        buttons.push(
            [{ text: lang[selectedLanguage].ADD_BENEFICIARY, callback_data: `add_beneficiary` }],
            [{ text: lang[selectedLanguage].MAIN_MENU_MESSAGE, callback_data: `main_menu` }]
        );

        if (filteredBeneficiaries.length > endIndex) {
            buttons.unshift([{ text: lang[selectedLanguage].NEXT_BUTTON_TITLE, callback_data: `${context}_next_beneficiaries_${currentPage + 1}` }]);
        }
        if (currentPage > 1) {
            buttons.unshift([{ text: lang[selectedLanguage].PREVIOUS_BUTTON_TITLE, callback_data: `${context}_prev_beneficiaries_${currentPage - 1}` }]);
        }

        telegramChatbot.international_transfer.intl_beneficiaries = filteredBeneficiaries;
        await telegramChatbot.save();
        console.log({ buttons1: JSON.stringify(buttons) }, telegramChatbot.recipient, lang[selectedLanguage].SELECT_BENEFICIARY);
        await sendButtons(telegramChatbot.recipient, lang[selectedLanguage].SELECT_BENEFICIARY, buttons, `${context}_select_beneficiary`);
    } else {
        const buttons = [
            [{ text: lang[selectedLanguage].ADD_NEW, callback_data: `add_beneficiary` }],
            [{ text: lang[selectedLanguage].MAIN_MENU_MESSAGE, callback_data: `main_menu` }]
        ];
        await sendButtons(telegramChatbot.recipient, lang[selectedLanguage].NO_BENEFICIARIES, buttons, "4");
    }
}

async function downloadTelegramFile(fileId) {
    const url = `${apiUrl}/getFile?file_id=${fileId}`;
    const response = await axios.get(url);
    const filePath = response.data.result.file_path;

    const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
    const fileResponse = await axios.get(fileUrl, { responseType: 'arraybuffer' });

    return fileResponse.data;
}

const uploadToS3 = async (fileBuffer, fileName, fileType) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `transcaction_attachments/${fileName}`,
        Body: fileBuffer,
        // ContentType: fileType
    };
    const uploadResponse = await s3.upload(params).promise();
    return uploadResponse;
};

const getFileFromTelegram = async (fileId) => {
    console.log({ fileId })
    const response = await axios.get(`${apiUrl}/getFile?file_id=${fileId}`);
    return response.data.result.file_path;
};

const processImageUploads = async (imagePayloads) => {
    const imageUrls = [];

    // return console.log({ imagePayloads })
    for (const imagePayload of imagePayloads) {
        const filePath = await getFileFromTelegram(imagePayload.file_id);

        const imageBuffer = await axios.get(`https://api.telegram.org/file/bot${token}/${filePath}`, { responseType: 'arraybuffer' });

        const fileName = `${Date.now()}.jpg`;
        const fileType = 'image/jpeg';

        const uploadResponse = await uploadToS3(imageBuffer.data, fileName, fileType);

        imageUrls.push({
            key: uploadResponse.Key,
            url: uploadResponse.Location,
            ETag: uploadResponse.ETag
        });
    }

    return imageUrls;
};

// always expecting a single video payload
const processVideoUploads = async (videoPayload) => {
    const filePath = await getFileFromTelegram(videoPayload[0].file_id);

    const videoBuffer = await axios.get(`https://api.telegram.org/file/bot${token}/${filePath}`, { responseType: 'arraybuffer' });

    const fileName = `${Date.now()}.mp4`;
    const fileType = 'video/mp4';

    const uploadResponse = await uploadToS3(videoBuffer.data, fileName, fileType);

    return {
        key: uploadResponse.Key,
        url: uploadResponse.Location,
        ETag: uploadResponse.ETag
    }
}

const sendAttachmentOptions = async (chatId, message, callbackKey, selectedLanguage) => {
    const buttons = [
        [{ text: lang[selectedLanguage].SKIP, callback_data: `${callbackKey}_no_attch` }],
        [{ text: "Images", callback_data: `${callbackKey}_attch_images` }],
        [{ text: "Video", callback_data: `${callbackKey}_attch_videos` }],
        [{ text: "Both", callback_data: `${callbackKey}_attch_both` }],
        [{ text: lang[selectedLanguage].CANCEL, callback_data: "main_menu" }],
    ];
    await sendButtons(chatId, message, buttons, `${callbackKey}_attachments`);
};

const handleImageUploads = async (chat, image_payloads, chatId, nextStepMessage, nextStepKey) => {
    if (image_payloads.length > 4) {
        await sendMessage(chatId, "You can only attach up to 4 images.");
        return;
    }

    const uploadedImageUrls = await processImageUploads(image_payloads);
    for (const image of uploadedImageUrls) {
        chat.international_transfer.intl_attachments.push({
            key: image.key,
            url: image.url,
            ETag: image.ETag,
        });
    }

    await chat.save();
    if (nextStepMessage && nextStepKey) {
        await sendButtons(chatId, nextStepMessage, [{ text: lang[selectedLanguage].CANCEL, callback_data: "main_menu" }], nextStepKey);
    } else {
        await showBeneficiaries(chat, chat.international_transfer.intl_country_code, "intl_transfer_card_payment", selectedLanguage);
    }
};

const handleVideoUploads = async (chat, video_payloads, chatId) => {
    if (video_payloads.length > 1) {
        await sendMessage(chatId, "You can only attach up to 1 video.");
        return;
    }

    const uploadedVideoUrls = await processVideoUploads(video_payloads);
    chat.international_transfer.intl_attachments.push({
        key: uploadedVideoUrls.key,
        url: uploadedVideoUrls.url,
        ETag: uploadedVideoUrls.ETag,
    });

    await chat.save();
    await showBeneficiaries(chat, chat.international_transfer.intl_country_code, "intl_transfer_card_payment", selectedLanguage);
};

module.exports = {
    sendMessage,
    sendPhoto,
    sendDocument,
    sendVideo,
    sendVideoNote,
    sendButtons,
    sendMediaGroup,
    sendLocation,
    sendVenue,
    sendPoll,
    sendDice,
    sendChatAction,
    getFileUrl,
    mainMenuMessage,
    invalidInputResponse,
    handleCountrySelection,
    somethingWentWrongQuickReplyTelegram,
    userKYCVerificationTemplateTelegram,
    showBeneficiaries,
    processImageUploads,
    processVideoUploads,
}


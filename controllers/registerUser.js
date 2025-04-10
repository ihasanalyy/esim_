
// import { text } from "body-parser";
import { sendPhoto, sendMessage, sendButtons } from "../utils/messageHelper.js";
import jwt from "jsonwebtoken";
import { TelegramBot } from './../models/User.js';
import axios from 'axios';
import { getProducts, getProductsByCountry, getProductsById } from "../utils/DT.js";
import countryEmoji from 'country-emoji';
const packageCache = {}; // Store packages per chatId
const pageSize = 6;
const getFlag = (isoCode) => countryEmoji.flag(isoCode) || '';

import { getAvailableCountries } from "../utils/countryHelper.js";

// let user;
// let userLastMessage = user?.last_message;
const countries = [
    { name: "Pakistan", code: "PAK" },
    { name: "India", code: "IND" },
    { name: "United States", code: "USA" },
    { name: "United Kingdom", code: "GBR" },
    { name: "Germany", code: "DEU" }
];

const selectedLanguage = 'en';  // Default language (English)

// Alternatively, you can simulate it as an object for multilingual support:
const lang = {
    en: {
        MAIN_MENU: "🏠 Main Menu",
        ENTER_AGAIN: "🔁 Enter again",
        SELECT_DESTINATION_COUNTRY: "Please select your destination country:"
    },
    es: {
        MAIN_MENU: "🏠 Menú principal",
        ENTER_AGAIN: "🔁 Introduzca de nuevo",
        SELECT_DESTINATION_COUNTRY: "Por favor, seleccione su país de destino:"
    }
};

export async function registerUser(chatId, payload, chat, text_message) {
    console.log("text_message:", text_message);
    console.log("typeof text_message:", typeof text_message);
    //   user  = await TelegramBot.findOne({ recipient: chatId });
    // console.log("text_message in registerUser", text_message)
    // const text_message = data.message.text;
    // console.log("we are checking text", text)
    if (payload === "register_cancel" && chat.last_message?.startsWith("register")) {
        console.log("we are in register cancel")
        const buttonText = "Registration Cancelled";
        const buttons = [
            [{ text: "Connect Account", callback_data: "connect_account" }],
            [{ text: "Register", callback_data: "register" }],
            [{ text: "Change Language", callback_data: "language_change" }],
        ];
        await sendButtons(chatId, buttons, buttonText, "connect");
        console.log("we are in register template")
    }
    // Agar user "Register" button click karta hai
    else if (payload === "register_template" && chat.last_message?.startsWith("connect")) {
        const buttons = [
            [{ text: "Connect Account", callback_data: "connect_account" }],
            [{ text: "Register", callback_data: "register" }],
            [{ text: "Change Language", callback_data: "language_change" }],
        ];
        await sendButtons(chatId, buttons, "How can we help you today? Let's get started!🚀👇", "register000");

    }
    // Agar user "Register" button click karta hai
    else if (payload === "register" && chat.last_message === "register") {
        console.log("we are in register")
        const buttonText = "Great! Are you signing up as an individual or a business?";
        const buttons = [
            [{ text: "Account Register Ind", callback_data: "register_acc_ind" }],
            [{ text: "Account Register Bus", callback_data: "register_acc_bus" }],
            [{ text: "Main Menu", callback_data: "main_menu" }],
        ];
        await sendPhoto(chatId, "https://nodejs-checking-bucket.s3.amazonaws.com/telegram_bot_images/Select.png");

        await sendButtons(chatId, buttons, buttonText, "register_0");
    }
    // Individual account registration ka flow
    else if (payload === "register_acc_ind" && chat.last_message === "register_0") {
        console.log("we are in register individual")
        const buttons = [
            [{ text: "Cancel Registration", callback_data: "register_cancel" }],
        ];
        await sendPhoto(chatId, "https://nodejs-checking-bucket.s3.amazonaws.com/telegram_bot_images/Individual.png");
        await sendMessage(chatId, "Please enter your first name:", buttons, "register_1");
    }
    // Business account registration ka flow
    else if (payload === "register_acc_bus" && chat.last_message === "register_1") {
        console.log("we are in register business")
        const buttons = [
            [{ text: "Cancel Registration", callback_data: "register_cancel" }],
        ];
        await sendPhoto(chatId, "https://nodejs-checking-bucket.s3.amazonaws.com/telegram_bot_images/Business.png");
        await sendMessage(chatId, "Business account registration will come soon.", buttons, "register_2");
    }
    // Main menu par wapas jane ka option
    else if (payload === "main_menu" || chat.last_message === "register_0") {
        console.log("Going to main menu");
        const message = "Welcome back! Need to make a transaction? Select from the options below🚀👇";
        const buttons = [
            // [{ text: "📒 Esim Overview", callback_data: "esim_overview" }],
            [{ text: "💰 Add Esim", callback_data: "add_another_esim" }],
            // [{ text: "📑 My Transactions", callback_data: "my_transactions" }],
            // [{ text: "🔢 QR QuickPay", callback_data: "qr_quickpay" }],
            // [{ text: "🏷️ My QR Code", callback_data: "my_qr_code" }],
            // [{ text: "🔍 Explore More", callback_data: "explore_more" }],
            // [{ text: "🌍 Change Language", callback_data: "language_change" }],
            // [{ text: "💬 Chat with us", callback_data: "chat_with_us" }],
            // [{ text: "Run Recieve Req flow", callback_data: "recieve_request" }] //ye ek temp button hai recieve req flow ko run karne ke liye
        ];
        await sendButtons(chatId, buttons, message, "Opt_all");
    }
    // esim_overview flow
    else if ((chat.last_message?.startsWith("add_another_esim")) || (payload?.startsWith("add_another_esim") || (payload === "add_another_esim"))) {
        console.log("we are in esim overview")
        const data = await TelegramBot.findOne({ recipient: chatId })
        console.log("data", data)
        const message = "Select Origin:";
        const buttons = [
            [{ text: "Global", callback_data: "global_GXX" }],
            [{ text: "Europe", callback_data: "europe_EXX" }],
            [{ text: "Specify Country", callback_data: "specify_country" }],
        ];
        await sendButtons(chatId, buttons, message, "esim_overview")
    }
    else if ((chat.last_message?.startsWith("specify_country")) || (payload?.startsWith("specify_country") || (payload === "specify_country") || (payload == 'enter_again'))) {
        const message = "Enter the country name:";
        sendMessage(chatId, message, "country_name")
    }
    else if ((text_message == chat.last_message)) {
        if (text_message?.length < 4) {
            return await sendMessage(chatId, "Please enter at least 4 characters.");
        }
        console.log('text_message_specify_country_ke_ander', text_message);
        const text = text_message
        const availableCountries = await getAvailableCountries(text, selectedLanguage);
        console.log("Available Countries:", availableCountries);

        if (!availableCountries || availableCountries.length === 0) {
            const buttons = [[{ text: "🏠 Main Menu", callback_data: "main_menu" }]];
            return await sendButtons(chatId, buttons, "❌ No matching country found.");
        }

        let buttons = availableCountries.slice(0, 8).map((country) => {
            const emoji = getFlag(country.country_iso_code);
            return [{
                text: `${emoji} ${country.country_name}`,
                callback_data: `country_${country.country_iso_code}`
            }];
        });

        buttons.push([{ text: "🏠 Main Menu", callback_data: "main_menu" }]);
        buttons.push([{ text: "🔁 Enter again", callback_data: "enter_again" }]);

        return await sendButtons(chatId, buttons, "Please select your country:",);
    }
    // else if (chat.last_message?.startsWith("country_") || payload?.startsWith("country_") || (payload === "country_")) {
    //     console.log("we are in country code");
    //     const parts = payload.split("_");
    //     const countryCode = parts[1];
    //     console.log("countryCode", countryCode);

    //     const response = await getProductsByCountry(countryCode);
    //     const allPackages = response?.data || [];

    //     console.log(allPackages, "allPackages");
    //     const currentPage = 0; // Start from page 0

    //     packageCache[chatId] = {
    //         packages: allPackages,
    //         currentPage: currentPage,
    //     };

    //     const pageSize = 6;
    //     const totalPages = Math.ceil(allPackages.length / pageSize);

    //     const paginated = allPackages.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    //     let message = `🌍 *Available eSIM Packages (Page ${currentPage + 1} of ${totalPages})*\n\n`;
    //     const buttons = [];

    //     paginated.forEach((item, index) => {
    //         const serial = currentPage * pageSize + index + 1;
    //         message += `${serial}.\n Name: ${item.name} \nPrice: ${item.destination.amount} ${item.destination.unit} \nValidity: ${item.validity.quantity} ${item.validity.unit} \nOperator: ${item.operator.name} \nAvailability Zones: ${item.availability_zones.join(", ")} \n\n`;
    //         buttons.push([{ text: `${serial}`, callback_data: `view_package_${item.id}` }]);
    //     });

    //     // Pagination buttons
    //     const navigationButtons = [];
    //     if (currentPage > 0) {
    //         navigationButtons.push({ text: "⬅️ Previous", callback_data: `pagecountry_prev_${countryCode}` });
    //     }
    //     if ((currentPage + 1) < totalPages) {
    //         navigationButtons.push({ text: "Next ➡️", callback_data: `pagecountry_next_${countryCode}` });
    //     }

    //     if (navigationButtons.length > 0) {
    //         buttons.push(navigationButtons);
    //     }

    //     await sendButtons(chatId, buttons, message);
    // }
    else if (chat.last_message?.startsWith("country_") || payload?.startsWith("country_") || (payload === "country_")) {
        console.log("we are in country code");
        const parts = payload.split("_");
        const countryCode = parts[1];
        console.log("countryCode", countryCode);
    
        const response = await getProductsByCountry(countryCode);
        const allPackages = response?.data || [];
    
        console.log(allPackages, "allPackages");
        const currentPage = 0; // Start from page 0
    
        packageCache[chatId] = {
            packages: allPackages,
            currentPage: currentPage,
        };
    
        const pageSize = 6;
        const totalPages = Math.ceil(allPackages.length / pageSize);
    
        const paginated = allPackages.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
    
        let message = `🌍 *Available eSIM Packages (Page ${currentPage + 1} of ${totalPages})*\n\n`;
        const buttons = [];
    
        let row = [];
        paginated.forEach((item, index) => {
            const serial = currentPage * pageSize + index + 1;
            message += `${serial}.\n Name: ${item.name} \nPrice: ${item.destination.amount} ${item.destination.unit} \nValidity: ${item.validity.quantity} ${item.validity.unit} \nOperator: ${item.operator.name} \nAvailability Zones: ${item.availability_zones.join(", ")} \n\n`;
    
            row.push({ text: `${serial}`, callback_data: `view_package_${item.id}` });
    
            // Add row of 3 buttons or if it's the last item
            if ((index + 1) % 3 === 0 || index === paginated.length - 1) {
                buttons.push(row);
                row = [];
            }
        });
    
        // Pagination buttons
        const navigationButtons = [];
        if (currentPage > 0) {
            navigationButtons.push({ text: "⬅️ Previous", callback_data: `pagecountry_prev_${countryCode}` });
        }
        if ((currentPage + 1) < totalPages) {
            navigationButtons.push({ text: "Next ➡️", callback_data: `pagecountry_next_${countryCode}` });
        }
    
        if (navigationButtons.length > 0) {
            buttons.push(navigationButtons);
        }
    
        await sendButtons(chatId, buttons, message);
    }
    

    else if ((chat.last_message?.startsWith("pagecountry_next_")) || (payload?.startsWith("pagecountry_next_")) || (payload === "pagecountry_next_")) {
        console.log("we are in country page next");
        const parts = payload.split("_");
        const countryCode = parts[3];

        const { packages, currentPage } = packageCache[chatId];
        const pageSize = 6;
        const totalPages = Math.ceil(packages.length / pageSize);

        if (currentPage < totalPages - 1) {
            const nextPage = currentPage + 1;
            packageCache[chatId].currentPage = nextPage;

            const paginated = packages.slice(nextPage * pageSize, (nextPage + 1) * pageSize);

            let message = `🌍 *Available eSIM Packages (Page ${nextPage + 1} of ${totalPages})*\n\n`;
            const buttons = [];

            paginated.forEach((item, index) => {
                const serial = nextPage * pageSize + index + 1;
                message += `${serial}\n Name: ${item.name} \nPrice: ${item.destination.amount} ${item.destination.unit} \nValidity: ${item.validity.quantity} ${item.validity.unit} \nOperator: ${item.operator.name} \n\n`;
                buttons.push([{ text: `${serial}`, callback_data: `view_package_${item.id}` }]);
            });

            // Pagination buttons
            const navigationButtons = [];
            if (nextPage > 0) {
                navigationButtons.push({ text: "⬅️ Previous", callback_data: `pagecountry_prev_${countryCode}` });
            }
            if ((nextPage + 1) < totalPages) {
                navigationButtons.push({ text: "Next ➡️", callback_data: `pagecountry_next_${countryCode}` });
            }

            if (navigationButtons.length > 0) {
                buttons.push(navigationButtons);
            }

            await sendButtons(chatId, buttons, message);
        }
    }
    else if ((chat.last_message?.startsWith("pagecountry_prev_")) || (payload?.startsWith("pagecountry_prev_")) || (payload === "pagecountry_prev_")) {
        console.log("we are in country page prev");
        const parts = payload.split("_");

        if (!parts[3]) {
            return sendMessage(chatId, "❗ Invalid previous page request.");
        }

        const countryCode = parts[3];
        const pageSize = 6;

        if (!packageCache[chatId]) {
            return sendMessage(chatId, "⚠️ No cached packages found.");
        }

        const { packages, currentPage } = packageCache[chatId];
        const totalPages = Math.ceil(packages.length / pageSize);

        if (currentPage > 0) {
            const prevPage = currentPage - 1;
            packageCache[chatId].currentPage = prevPage;

            const paginated = packages.slice(prevPage * pageSize, (prevPage + 1) * pageSize);

            let message = `🌍 *Available eSIM Packages (Page ${prevPage + 1} of ${totalPages})*\n\n`;
            const buttons = [];

            paginated.forEach((item, index) => {
                const serial = prevPage * pageSize + index + 1;
                message += `${serial}\n Name: ${item.name} \nPrice: ${item.destination.amount} ${item.destination.unit} \nValidity: ${item.validity.quantity} ${item.validity.unit} \nOperator: ${item.operator.name} \n\n`;
                buttons.push([{ text: `${serial}`, callback_data: `view_package_${item.id}` }]);
            });

            // Pagination buttons
            const navigationButtons = [];
            if (prevPage > 0) {
                navigationButtons.push({ text: "⬅️ Previous", callback_data: `pagecountry_prev_${countryCode}` });
            }
            if ((prevPage + 1) < totalPages) {
                navigationButtons.push({ text: "Next ➡️", callback_data: `pagecountry_next_${countryCode}` });
            }

            if (navigationButtons.length > 0) {
                buttons.push(navigationButtons);
            }

            await sendButtons(chatId, buttons, message);
        }
    }
    else if ((chat.last_message?.startsWith("global_GXX")) || (payload?.startsWith("global_GXX")) || (payload === "global_GXX")) {
        console.log(payload, "payload in region_global");
        const parts = payload.split("_");
        const countryCode = parts[1];

        const allPackages = await getProducts(countryCode);
        const currentPage = 0;

        packageCache[chatId] = {
            packages: allPackages,
            currentPage: currentPage,
        };

        const pageSize = 6;
        const totalPages = Math.ceil(allPackages.length / pageSize);

        const paginated = allPackages.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

        let message = `🌍 *Available eSIM Packages (Page ${currentPage + 1} of ${totalPages})*\n\n`;
        const buttons = [];

        let row = [];
        paginated.forEach((item, index) => {
            const serial = currentPage * pageSize + index + 1;
            message += `${serial}.\n Name: ${item.name} \nPrice: ${item.destination.amount} ${item.destination.unit} \nValidity: ${item.validity.quantity} ${item.validity.unit} \nOperator: ${item.operator.name} \nAvailability Zones: ${item.availability_zones}\n\n`;

            row.push({ text: `${serial}`, callback_data: `view_package_${item.id}` });

            if ((index + 1) % 3 === 0 || index === paginated.length - 1) {
                buttons.push(row);
                row = [];
            }
        });

        const navigationButtons = [];
        if (currentPage > 0) {
            navigationButtons.push({ text: "⬅️ Previous", callback_data: `global_page_prev_${countryCode}` });
        }
        if ((currentPage + 1) < totalPages) {
            navigationButtons.push({ text: "Next ➡️", callback_data: `global_page_next_${countryCode}` });
        }

        if (navigationButtons.length > 0) {
            buttons.push(navigationButtons);
        }

        await sendButtons(chatId, buttons, message);
    }
    else if ((chat.last_message?.startsWith("europe_EXX")) || (payload?.startsWith("europe_EXX")) || (payload === "europe_EXX")) {
        console.log(payload, "payload in region_global");
        const parts = payload.split("_");
        const countryCode = parts[1];

        const allPackages = await getProducts(countryCode);
        const currentPage = 0;

        packageCache[chatId] = {
            packages: allPackages,
            currentPage: currentPage,
        };

        const pageSize = 6;
        const totalPages = Math.ceil(allPackages.length / pageSize);

        const paginated = allPackages.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

        let message = `🌍 *Available eSIM Packages (Page ${currentPage + 1} of ${totalPages})*\n\n`;
        const buttons = [];

        let row = [];
        paginated.forEach((item, index) => {
            const serial = currentPage * pageSize + index + 1;
            message += `${serial}.\n Name: ${item.name} \nPrice: ${item.destination.amount} ${item.destination.unit} \nValidity: ${item.validity.quantity} ${item.validity.unit} \nOperator: ${item.operator.name} \nAvailability Zones: ${item.availability_zones.join(", ")} \n\n`;

            row.push({ text: `${serial}`, callback_data: `view_package_${item.id}` });

            if ((index + 1) % 3 === 0 || index === paginated.length - 1) {
                buttons.push(row);
                row = [];
            }
        });

        const navigationButtons = [];
        if (currentPage > 0) {
            navigationButtons.push({ text: "⬅️ Previous", callback_data: `europe_page_prev_${countryCode}` });
        }
        if ((currentPage + 1) < totalPages) {
            navigationButtons.push({ text: "Next ➡️", callback_data: `europe_page_next_${countryCode}` });
        }

        if (navigationButtons.length > 0) {
            buttons.push(navigationButtons);
        }

        await sendButtons(chatId, buttons, message);
    }
    
    else if (chat.last_message?.match(/^(global|europe)_page_next_/) || payload?.match(/^(global|europe)_page_next_/) || payload === "global_page_next_" || payload === "europe_page_next_") {
        const parts = payload.split("_");
        const region = parts[0];
        const countryCode = parts[3];

        console.log(`we are in ${region} page next`);

        const { packages, currentPage } = packageCache[chatId];
        const pageSize = 6;
        const totalPages = Math.ceil(packages.length / pageSize);

        if (currentPage < totalPages - 1) {
            const nextPage = currentPage + 1;
            packageCache[chatId].currentPage = nextPage;

            const paginated = packages.slice(nextPage * pageSize, (nextPage + 1) * pageSize);

            let message = `🌍 *Available eSIM Packages (Page ${nextPage + 1} of ${totalPages})*\n\n`;
            const buttons = [];

            let row = [];
            paginated.forEach((item, index) => {
                const serial = nextPage * pageSize + index + 1;
                message += `${serial}.\n Name: ${item.name} \nPrice: ${item.destination.amount} ${item.destination.unit} \nValidity: ${item.validity.quantity} ${item.validity.unit} \nOperator: ${item.operator.name} \nAvailability Zones: ${item.availability_zones.join(", ")} \n\n`;

                row.push({ text: `${serial}`, callback_data: `view_package_${item.id}` });

                if ((index + 1) % 3 === 0 || index === paginated.length - 1) {
                    buttons.push(row);
                    row = [];
                }
            });

            const navigationButtons = [];
            if (nextPage > 0) {
                navigationButtons.push({ text: "⬅️ Previous", callback_data: `${region}_page_prev_${countryCode}` });
            }
            if ((nextPage + 1) < totalPages) {
                navigationButtons.push({ text: "Next ➡️", callback_data: `${region}_page_next_${countryCode}` });
            }

            if (navigationButtons.length > 0) {
                buttons.push(navigationButtons);
            }

            await sendButtons(chatId, buttons, message);
        }
    }
    else if (chat.last_message?.match(/^(global|europe)_page_prev_/) || payload?.match(/^(global|europe)_page_prev_/) || payload === "global_page_prev_" || payload === "europe_page_prev_") {
        const parts = payload.split("_");
        const region = parts[0];
        const countryCode = parts[3];

        console.log(`we are in ${region} page prev`);

        const { packages, currentPage } = packageCache[chatId];
        const pageSize = 6;
        const totalPages = Math.ceil(packages.length / pageSize);

        if (currentPage > 0) {
            const prevPage = currentPage - 1;
            packageCache[chatId].currentPage = prevPage;

            const paginated = packages.slice(prevPage * pageSize, (prevPage + 1) * pageSize);

            let message = `🌍 *Available eSIM Packages (Page ${prevPage + 1} of ${totalPages})*\n\n`;
            const buttons = [];

            let row = [];
            paginated.forEach((item, index) => {
                const serial = prevPage * pageSize + index + 1;
                message += `${serial}.\n Name: ${item.name} \nPrice: ${item.destination.amount} ${item.destination.unit} \nValidity: ${item.validity.quantity} ${item.validity.unit} \nOperator: ${item.operator.name}\nAvailability Zones: ${item.availability_zones.join(", ")} \n\n`;

                row.push({ text: `${serial}`, callback_data: `view_package_${item.id}` });

                if ((index + 1) % 3 === 0 || index === paginated.length - 1) {
                    buttons.push(row);
                    row = [];
                }
            });

            const navigationButtons = [];
            if (prevPage > 0) {
                navigationButtons.push({ text: "⬅️ Previous", callback_data: `${region}_page_prev_${countryCode}` });
            }
            if ((prevPage + 1) < totalPages) {
                navigationButtons.push({ text: "Next ➡️", callback_data: `${region}_page_next_${countryCode}` });
            }

            if (navigationButtons.length > 0) {
                buttons.push(navigationButtons);
            }

            await sendButtons(chatId, buttons, message);
        }
    }


    else if (payload?.startsWith("view_package_")) {
        const packageId = payload.split("_")[2]; // Extract the package ID from the callback data
        console.log("packageId", packageId);
        const response = await getProductsById(packageId);
        // const response = await axios.get(`http://localhost:3000/api/products?product_Id=${packageId}`);
        console.log("response data", response.data);
        const { name, destination, validity, operator } = response.data;
        const { availability_zones } = response.data;
        console.log("availability_zones", availability_zones);
        const message = `Name: ${name}\nPrice: ${destination.amount}${destination.unit}\n Operator: ${operator.name}\nValidity: ${validity.quantity}${validity.unit}\nAvailability Zones: ${availability_zones.join(", ")}`;
        const buttons = [
            [{ text: "Confirm", callback_data: `confirm_${packageId}` }],
            [{ text: "Main Menu", callback_data: "main_menu" }],
        ];
        await sendButtons(chatId, buttons, message, "region_global")
    }

  
   









}


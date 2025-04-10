import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true,
        // unique: true // Ensure each user is unique
    },
    userType: {
        type: String,
        enum: ['individual', 'business'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    userName:{
        type : String ,
        // required : true
    },
    firstName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        // required: true
    },
    lastName: {
        type: String,
        required: true
    },
    verifyOtp :{
        type: Boolean,
        default: false
    },
    cityName :{
        type : String ,
        // required : true
    },
    email: {
        type: String,
        // required: true,
        // unique: true // Ensure unique email for individuals
    },
    phoneNumber: {
        type: String,
        // required: true
    },
    businessName: {
        type: String,
        required: function () { return this.userType === 'business'; } // Only required for businesses
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
});

const telegramBot = mongoose.Schema({
    recipient: { type: String, required: false },
    last_message: { type: String, required: false },
    last_message_time: { type: Date, required: false },
    account_connected: { type: Boolean, required: false },
    selected_language: { type: String, required: false },
    account: { type: mongoose.Schema.Types.ObjectId, ref: 'account', required: false },

    otpToken: { type: String, required: false },
    otpType: { type: String, required: false },
    otpAttemptCount: { type: Number, default: 0 },

    registeration: {
        first_name: { type: String, required: false },
        last_name: { type: String, required: false },
        phone_number: { type: String, required: false },
        iso_code: { type: String, required: false },
        temp_password: { type: String, required: false },
        temp_password_count: { type: Number, required: false },
        verificationTokenHash: { type: String, required: false },
        verificationTokenExpiration: { type: Date, required: false },
        verificationAttempts: { type: Number, required: false },
        username: { type: String, required: false },
        timezone: { type: String, required: false },
        timezones: { type: Array, required: false },
        timezonePageIndex: { type: Number, required: false },
        city: { type: String, required: false },
        source: { type: String, required: false },
    },

    international_transfer: {
        intl_country_code: { type: String, required: false },
        intl_country: { type: String, required: false },
        intl_payout_method: { type: String, required: false },
        search_results: { type: Array, required: false },
        intl_payer_id: { type: String, required: false },
        intl_payout_channel: { type: String, required: false },
        intl_note: { type: String, required: false },
        intl_beneficiaries: [{ type: Object, required: false }],
        purpose: { type: String, required: false },
        intl_benef_id: { type: String, required: false },
        intl_amount: { type: Number, required: false },
        intl_exchngrate_token: { type: String, required: false },
        intl_sending_currency: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "wallet",
            required: false,
        },
        intl_quotation_id: { type: String, required: false },
        intl_attachments: [
            {
                key: {
                    type: String,
                    required: false
                },
                url: {
                    type: String,
                    required: false
                },
                ETag: {
                    type: String,
                    required: false
                }
            }
        ],
        card: {
            pan: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "pan",
                required: false,
            },
            amount: { type: Number, required: false },
            intl_exchngrate_token: { type: String, required: false },
            intl_quotation_id: { type: String, required: false },
        },
    },

    wallet_to_wallet: {},

    chatbotBannedUntil: { type: Date, required: false },
    chatbotFailedAttempts: { type: Number, required: false },
    chatbotFirstFailedAttempt: { type: Date, required: false },

    lastResendCodeTime: { type: Date, required: false },
})
export const TelegramBot = mongoose.model( 'telegramBot' , telegramBot)
export const User = mongoose.model('User', userSchema);

// export default User;
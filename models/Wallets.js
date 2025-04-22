import mongoose from 'mongoose';

const walletsSchema = mongoose.Schema({
    cardDetails: {
        cardNumber: { type: String },
        cardHolderName: { type: String },
        expiryDate: { type: String },
        cvv: { type: String },
        billingAddress: {
            street: { type: String },
            city: { type: String },
            country: { type: String },
            postalCode: { type: String }
        }
    }
});

// export const esim = mongoose.model('esim', esimSchema)
 const wallets = mongoose.model('wallets', walletsSchema);
 export default wallets;
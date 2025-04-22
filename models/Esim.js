import mongoose from 'mongoose';

const esimSchema = mongoose.Schema({
    productId: { type: String },
    days: {type: String},
    availabilityZone: [{ type: String }],
    description: {type: String},
    productName: {type: String},
    price: { type: Number },
    wallets: {
        type: mongoose.Schema.Types.ObjectId, ref: "wallets",
        required: false,
    }

})
export const esim = mongoose.model('esim', esimSchema)
// export const wallets = mongoose.model('wallets', wallets);
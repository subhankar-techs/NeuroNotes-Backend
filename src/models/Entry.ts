import mongoose, { Schema, Document } from 'mongoose';

export interface IEntry extends Document {
    userId: mongoose.Types.ObjectId;
    content: string;
    mood: number; // Sentiment score
    moodLabel: string; // 'Positive', 'Negative', 'Neutral'
    createdAt: Date;
}

const EntrySchema: Schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    mood: { type: Number, required: true },
    moodLabel: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model<IEntry>('Entry', EntrySchema);

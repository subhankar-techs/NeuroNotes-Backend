import express from 'express';
import Sentiment from 'sentiment';
import Entry from '../models/Entry';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';

const router = express.Router();
const sentiment = new Sentiment();

// Get all entries for user
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const entries = await Entry.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(entries);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new entry
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
    const { content } = req.body;

    try {
        const result = sentiment.analyze(content);
        const mood = result.score;
        let moodLabel = 'Neutral';

        if (mood > 0) moodLabel = 'Positive';
        if (mood < 0) moodLabel = 'Negative';

        const newEntry = new Entry({
            userId: req.user.id,
            content,
            mood,
            moodLabel,
        });

        const savedEntry = await newEntry.save();
        res.json(savedEntry);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update entry
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
    const { content } = req.body;
    try {
        const entry = await Entry.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        if (entry.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        const result = sentiment.analyze(content);
        const mood = result.score;
        let moodLabel = 'Neutral';
        if (mood > 0) moodLabel = 'Positive';
        if (mood < 0) moodLabel = 'Negative';

        entry.content = content;
        entry.mood = mood;
        entry.moodLabel = moodLabel;

        await entry.save();
        res.json(entry);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete entry
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
    try {
        const entry = await Entry.findById(req.params.id);
        if (!entry) return res.status(404).json({ message: 'Entry not found' });
        if (entry.userId.toString() !== req.user.id) return res.status(401).json({ message: 'Not authorized' });

        await entry.deleteOne();
        res.json({ message: 'Entry removed' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;

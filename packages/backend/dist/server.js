import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Data Room API is running' });
});
// API routes (currently placeholder)
// These will be called from the frontend in future versions
app.get('/api/datarooms', (req, res) => {
    res.json({
        message: 'Get all datarooms',
        note: 'Currently data is stored in browser IndexedDB/localStorage',
    });
});
app.post('/api/datarooms', (req, res) => {
    res.json({
        message: 'Create dataroom',
        note: 'Currently data is stored in browser IndexedDB/localStorage',
    });
});
app.get('/api/datarooms/:id/folders', (req, res) => {
    res.json({
        message: `Get folders for dataroom ${req.params.id}`,
        note: 'Currently data is stored in browser IndexedDB/localStorage',
    });
});
app.post('/api/datarooms/:id/folders', (req, res) => {
    res.json({
        message: `Create folder in dataroom ${req.params.id}`,
        note: 'Currently data is stored in browser IndexedDB/localStorage',
    });
});
app.post('/api/datarooms/:id/upload', (req, res) => {
    res.json({
        message: `Upload file to dataroom ${req.params.id}`,
        note: 'Currently files are stored in browser memory',
    });
});
// Export for Vercel serverless functions
export default app;
// Start local development server
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}
//# sourceMappingURL=server.js.map
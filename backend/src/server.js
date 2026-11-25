import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`[Server] G Mark API server is running on http://localhost:${PORT}`);
});

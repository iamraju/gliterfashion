import dotenv from 'dotenv';
import path from 'path';

// Ensure .env is loaded from the project root (server directory)
dotenv.config({ path: path.join(__dirname, '../.env') });

import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

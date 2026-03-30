import app from "./app.js";
import { config } from "./config/index.js";

try {
  console.log(`🚀 Attempting to start server on port ${config.port}...`);
  app.listen(config.port, () => {
    console.log(`✅ Server running on http://localhost:${config.port}`);
  });
} catch (error) {
  console.error("❌ Fatal error during server startup:", error);
  process.exit(1);
}

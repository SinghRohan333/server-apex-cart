import { MongoClient, Db, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("❌ Critical: Missing MONGODB_URI in environment variables.");
}

class DatabaseService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private dbName: string = "apex-cart-db";

  /**
   * Connects to MongoDB Atlas and returns the shared database instance.
   */
  async connect(): Promise<Db> {
    // Return cached instance if it already exists
    if (this.db) {
      return this.db;
    }

    try {
      this.client = new MongoClient(uri!, {
        maxPoolSize: 50, // Limits maximum concurrent sockets
        minPoolSize: 10, // Maintains minimum idle connections
        maxIdleTimeMS: 30000, // Cleans up idle connections after 30 seconds
        waitQueueTimeoutMS: 5000, // Time to wait for an available socket before failing
      });

      await this.client.connect();
      this.db = this.client.db(this.dbName);

      console.log(
        `📡 [Database]: Natively connected to pool container: "${this.dbName}"`,
      );
      return this.db;
    } catch (error) {
      console.error(
        "❌ [Database]: Connection pool establishment failed:",
        error,
      );
      process.exit(1);
    }
  }

  /**
   * Synchronous accessor to grab the database instance after initial startup
   */
  getDb(): Db {
    if (!this.db) {
      throw new Error("Database connection has not been initialized yet.");
    }
    return this.db;
  }

  /**
   * Safely closes the pool when the application terminates
   */
  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.db = null;
      this.client = null;
      console.log("🔌 [Database]: Connection pool gracefully disconnected.");
    }
  }
}

export const dbService = new DatabaseService();

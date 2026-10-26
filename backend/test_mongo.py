import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb+srv://eswarakumarr2024cse_db_user:u9BShXeu3eI784jP@cluster1.ck0p7sv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1"

async def test():
    try:
        client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=10000)
        await client.admin.command("ping")
        print("✅ MongoDB Atlas connected!")
        db = client["smarttraffic"]
        result = await db["users"].insert_one({"test": "ping"})
        print(f"✅ Insert OK: {result.inserted_id}")
        await db["users"].delete_one({"test": "ping"})
        print("✅ Delete OK — MongoDB is fully working!")
    except Exception as e:
        print(f"❌ Error: {e}")

asyncio.run(test())

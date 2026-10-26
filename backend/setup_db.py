"""Setup SmartTraffic DB: drop sample_mflix, create proper collections with indexes."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb+srv://eswarakumarr2024cse_db_user:u9BShXeu3eI784jP@cluster1.ck0p7sv.mongodb.net/?retryWrites=true&w=majority"
DB_NAME = "smarttraffic"


async def main():
    client = AsyncIOMotorClient(MONGO_URL)

    # List existing databases
    dbs = await client.list_database_names()
    print(f"Existing databases: {dbs}")

    # Drop sample_mflix if it exists
    if "sample_mflix" in dbs:
        await client.drop_database("sample_mflix")
        print("Dropped sample_mflix database")

    db = client[DB_NAME]

    # Create collections with indexes
    # users
    await db["users"].create_index("email", unique=True)
    await db["users"].create_index("username")
    print("Created users collection + indexes")

    # traffic_data
    await db["traffic_data"].create_index("location")
    await db["traffic_data"].create_index("timestamp")
    await db["traffic_data"].create_index("congestion_level")
    print("Created traffic_data collection + indexes")

    # predictions
    await db["predictions"].create_index("timestamp")
    await db["predictions"].create_index("location")
    print("Created predictions collection + indexes")

    # routes
    await db["routes"].create_index("source")
    await db["routes"].create_index("destination")
    print("Created routes collection + indexes")

    # Verify
    cols = await db.list_collection_names()
    print(f"\nSmartTraffic DB collections: {cols}")

    dbs_after = await client.list_database_names()
    print(f"Databases after setup: {dbs_after}")

    client.close()
    print("\nDatabase setup complete!")


asyncio.run(main())

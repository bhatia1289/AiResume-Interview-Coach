from motor.motor_asyncio import AsyncIOMotorClient
import asyncio

async def fix_indexes():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client.dsa_assistant
    
    try:
        # Drop the username index if it exists
        print("Checking for username index...")
        indexes = await db.users.list_indexes().to_list(length=100)
        for index in indexes:
            if "username" in index["name"] or "username" in index["key"]:
                print(f"Dropping index: {index['name']}")
                await db.users.drop_index(index["name"])
        
        print("Successfully cleaned up indexes.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(fix_indexes())

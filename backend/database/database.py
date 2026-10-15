
import os
from dotenv import load_dotenv
from pymongo import MongoClient

# Load environment variables before creating the client
load_dotenv(override=True)

MONGO_URL = os.getenv(
    "MONGODB_URL",
    "mongodb://localhost:27017"
)

client = MongoClient(MONGO_URL)

db = client["ai_learning_assistant"]

users_collection = db["users"]
documents_collection = db["documents"]
quiz_attempts_collection = db["quiz_attempts"]

from pymongo import MongoClient

MONGO_URL = "mongodb://localhost:27017"

client = MongoClient(MONGO_URL)

db = client["ai_learning_assistant"]

users_collection = db["users"]
documents_collection = db["documents"]
quiz_attempts_collection = db["quiz_attempts"]
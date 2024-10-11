from app import app  # Import your Flask app
from extensions import db  # Import the shared db instance
from models import * # Import all models

# Create all tables inside an application context
with app.app_context():
    db.create_all()

print("All tables created successfully!")

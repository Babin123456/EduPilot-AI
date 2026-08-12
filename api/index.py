import sys
import os

# Add backend directory to path so imports like `app.main` resolve correctly on Vercel
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.main import app

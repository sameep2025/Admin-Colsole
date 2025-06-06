from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from enum import Enum

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class VisibilityStatus(str, Enum):
    VISIBLE = "visible"
    HIDDEN = "hidden"
    PRIVATE = "private"
    PUBLIC = "public"

class FieldType(str, Enum):
    TEXT = "text"
    NUMBER = "number"
    BOOLEAN = "boolean"
    DATE = "date"
    EMAIL = "email"
    URL = "url"
    TEXTAREA = "textarea"

# Models
class CategoryField(BaseModel):
    name: str
    type: FieldType
    required: bool = False
    default_value: Optional[str] = None

class CategoryModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    fields: List[CategoryField] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryModelCreate(BaseModel):
    name: str
    description: Optional[str] = None
    fields: List[CategoryField] = []

class CategoryModelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    fields: Optional[List[CategoryField]] = None

class Category(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    model_id: Optional[str] = None
    custom_data: Dict[str, Any] = {}
    visibility_status: VisibilityStatus = VisibilityStatus.VISIBLE
    parent_id: Optional[str] = None
    sort_order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    model_id: Optional[str] = None
    custom_data: Dict[str, Any] = {}
    visibility_status: VisibilityStatus = VisibilityStatus.VISIBLE
    parent_id: Optional[str] = None
    sort_order: int = 0

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    model_id: Optional[str] = None
    custom_data: Optional[Dict[str, Any]] = None
    visibility_status: Optional[VisibilityStatus] = None
    parent_id: Optional[str] = None
    sort_order: Optional[int] = None

class CategoryVisibility(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category_id: str
    visibility_status: VisibilityStatus
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    rules: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CategoryVisibilityCreate(BaseModel):
    category_id: str
    visibility_status: VisibilityStatus
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    rules: Dict[str, Any] = {}

class CategoryVisibilityUpdate(BaseModel):
    visibility_status: Optional[VisibilityStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    rules: Optional[Dict[str, Any]] = None

# Category Model Routes
@api_router.post("/category-models", response_model=CategoryModel)
async def create_category_model(model_data: CategoryModelCreate):
    model_dict = model_data.dict()
    model_obj = CategoryModel(**model_dict)
    await db.category_models.insert_one(model_obj.dict())
    return model_obj

@api_router.get("/category-models", response_model=List[CategoryModel])
async def get_category_models():
    models = await db.category_models.find().to_list(1000)
    return [CategoryModel(**model) for model in models]

@api_router.get("/category-models/{model_id}", response_model=CategoryModel)
async def get_category_model(model_id: str):
    model = await db.category_models.find_one({"id": model_id})
    if not model:
        raise HTTPException(status_code=404, detail="Category model not found")
    return CategoryModel(**model)

@api_router.put("/category-models/{model_id}", response_model=CategoryModel)
async def update_category_model(model_id: str, model_data: CategoryModelUpdate):
    update_dict = {k: v for k, v in model_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.category_models.update_one(
        {"id": model_id}, 
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category model not found")
    
    updated_model = await db.category_models.find_one({"id": model_id})
    return CategoryModel(**updated_model)

@api_router.delete("/category-models/{model_id}")
async def delete_category_model(model_id: str):
    result = await db.category_models.delete_one({"id": model_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category model not found")
    return {"message": "Category model deleted successfully"}

# Category Routes
@api_router.post("/categories", response_model=Category)
async def create_category(category_data: CategoryCreate):
    category_dict = category_data.dict()
    category_obj = Category(**category_dict)
    await db.categories.insert_one(category_obj.dict())
    return category_obj

@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    categories = await db.categories.find().sort("sort_order", 1).to_list(1000)
    return [Category(**category) for category in categories]

@api_router.get("/categories/{category_id}", response_model=Category)
async def get_category(category_id: str):
    category = await db.categories.find_one({"id": category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return Category(**category)

@api_router.put("/categories/{category_id}", response_model=Category)
async def update_category(category_id: str, category_data: CategoryUpdate):
    update_dict = {k: v for k, v in category_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.categories.update_one(
        {"id": category_id}, 
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    updated_category = await db.categories.find_one({"id": category_id})
    return Category(**updated_category)

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str):
    result = await db.categories.delete_one({"id": category_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"message": "Category deleted successfully"}

# Category Visibility Routes
@api_router.post("/category-visibility", response_model=CategoryVisibility)
async def create_category_visibility(visibility_data: CategoryVisibilityCreate):
    visibility_dict = visibility_data.dict()
    visibility_obj = CategoryVisibility(**visibility_dict)
    await db.category_visibility.insert_one(visibility_obj.dict())
    return visibility_obj

@api_router.get("/category-visibility", response_model=List[CategoryVisibility])
async def get_category_visibility():
    visibility_settings = await db.category_visibility.find().to_list(1000)
    return [CategoryVisibility(**setting) for setting in visibility_settings]

@api_router.get("/category-visibility/{visibility_id}", response_model=CategoryVisibility)
async def get_category_visibility_by_id(visibility_id: str):
    visibility = await db.category_visibility.find_one({"id": visibility_id})
    if not visibility:
        raise HTTPException(status_code=404, detail="Category visibility setting not found")
    return CategoryVisibility(**visibility)

@api_router.put("/category-visibility/{visibility_id}", response_model=CategoryVisibility)
async def update_category_visibility(visibility_id: str, visibility_data: CategoryVisibilityUpdate):
    update_dict = {k: v for k, v in visibility_data.dict().items() if v is not None}
    
    result = await db.category_visibility.update_one(
        {"id": visibility_id}, 
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category visibility setting not found")
    
    updated_visibility = await db.category_visibility.find_one({"id": visibility_id})
    return CategoryVisibility(**updated_visibility)

@api_router.delete("/category-visibility/{visibility_id}")
async def delete_category_visibility(visibility_id: str):
    result = await db.category_visibility.delete_one({"id": visibility_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category visibility setting not found")
    return {"message": "Category visibility setting deleted successfully"}

# Utility Routes
@api_router.get("/")
async def root():
    return {"message": "Category Management API"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

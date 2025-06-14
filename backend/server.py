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

class VisibilityType(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class VisibilityTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    active: bool = True

class VisibilityTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    active: Optional[bool] = None

class PricingModel(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    price: Optional[float] = None
    currency: str = "USD"
    interval: Optional[str] = None  # monthly, yearly, one-time
    features: List[str] = []
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PricingModelCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: Optional[float] = None
    currency: str = "USD"
    interval: Optional[str] = None
    features: List[str] = []
    active: bool = True

class PricingModelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    interval: Optional[str] = None
    features: Optional[List[str]] = None
    active: Optional[bool] = None

class DisplayType(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    type_category: Optional[str] = None  # grid, list, carousel, card, etc.
    properties: Dict[str, Any] = {}
    responsive: bool = True
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DisplayTypeCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type_category: Optional[str] = None
    properties: Dict[str, Any] = {}
    responsive: bool = True
    active: bool = True

class DisplayTypeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    type_category: Optional[str] = None
    properties: Optional[Dict[str, Any]] = None
    responsive: Optional[bool] = None
    active: Optional[bool] = None

class SocialHandle(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    icon_image: Optional[str] = None  # Base64 encoded image
    url: Optional[str] = None
    handle: Optional[str] = None
    followers: int = 0
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class SocialHandleCreate(BaseModel):
    name: str
    icon_image: Optional[str] = None
    url: Optional[str] = None
    handle: Optional[str] = None
    followers: int = 0
    active: bool = True

class SocialHandleUpdate(BaseModel):
    name: Optional[str] = None
    icon_image: Optional[str] = None
    url: Optional[str] = None
    handle: Optional[str] = None
    followers: Optional[int] = None
    active: Optional[bool] = None

class BusinessField(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: FieldType = FieldType.TEXT
    required: bool = False
    category: str = "general"
    order: int = 0
    validation: Dict[str, Any] = {}
    options: Optional[List[str]] = None
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BusinessFieldCreate(BaseModel):
    name: str
    type: FieldType = FieldType.TEXT
    required: bool = False
    category: str = "general"
    order: int = 0
    validation: Dict[str, Any] = {}
    options: Optional[List[str]] = None
    active: bool = True

class BusinessFieldUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[FieldType] = None
    required: Optional[bool] = None
    category: Optional[str] = None
    order: Optional[int] = None
    validation: Optional[Dict[str, Any]] = None
    options: Optional[List[str]] = None
    active: Optional[bool] = None

class BusinessFieldInstance(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    template_field_id: str  # References a BusinessField (template)
    value: Optional[str] = None
    custom_properties: Dict[str, Any] = {}
    active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class BusinessFieldInstanceCreate(BaseModel):
    name: str
    template_field_id: str
    value: Optional[str] = None
    custom_properties: Dict[str, Any] = {}
    active: bool = True

class BusinessFieldInstanceUpdate(BaseModel):
    name: Optional[str] = None
    template_field_id: Optional[str] = None
    value: Optional[str] = None
    custom_properties: Optional[Dict[str, Any]] = None
    active: Optional[bool] = None

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

# Visibility Types Routes
@api_router.post("/visibility-types", response_model=VisibilityType)
async def create_visibility_type(type_data: VisibilityTypeCreate):
    type_dict = type_data.dict()
    type_obj = VisibilityType(**type_dict)
    await db.visibility_types.insert_one(type_obj.dict())
    return type_obj

@api_router.get("/visibility-types", response_model=List[VisibilityType])
async def get_visibility_types():
    types = await db.visibility_types.find().sort("created_at", -1).to_list(1000)
    return [VisibilityType(**type_item) for type_item in types]

@api_router.get("/visibility-types/{type_id}", response_model=VisibilityType)
async def get_visibility_type(type_id: str):
    type_item = await db.visibility_types.find_one({"id": type_id})
    if not type_item:
        raise HTTPException(status_code=404, detail="Visibility type not found")
    return VisibilityType(**type_item)

@api_router.put("/visibility-types/{type_id}", response_model=VisibilityType)
async def update_visibility_type(type_id: str, type_data: VisibilityTypeUpdate):
    update_dict = {k: v for k, v in type_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.visibility_types.update_one(
        {"id": type_id}, 
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Visibility type not found")
    
    updated_type = await db.visibility_types.find_one({"id": type_id})
    return VisibilityType(**updated_type)

@api_router.delete("/visibility-types/{type_id}")
async def delete_visibility_type(type_id: str):
    result = await db.visibility_types.delete_one({"id": type_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Visibility type not found")
    return {"message": "Visibility type deleted successfully"}

# Pricing Models Routes
@api_router.post("/pricing-models", response_model=PricingModel)
async def create_pricing_model(model_data: PricingModelCreate):
    model_dict = model_data.dict()
    model_obj = PricingModel(**model_dict)
    await db.pricing_models.insert_one(model_obj.dict())
    return model_obj

@api_router.get("/pricing-models", response_model=List[PricingModel])
async def get_pricing_models():
    models = await db.pricing_models.find().sort("created_at", -1).to_list(1000)
    return [PricingModel(**model) for model in models]

@api_router.get("/pricing-models/{model_id}", response_model=PricingModel)
async def get_pricing_model(model_id: str):
    model = await db.pricing_models.find_one({"id": model_id})
    if not model:
        raise HTTPException(status_code=404, detail="Pricing model not found")
    return PricingModel(**model)

@api_router.put("/pricing-models/{model_id}", response_model=PricingModel)
async def update_pricing_model(model_id: str, model_data: PricingModelUpdate):
    update_dict = {k: v for k, v in model_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.pricing_models.update_one(
        {"id": model_id}, 
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pricing model not found")
    
    updated_model = await db.pricing_models.find_one({"id": model_id})
    return PricingModel(**updated_model)

@api_router.delete("/pricing-models/{model_id}")
async def delete_pricing_model(model_id: str):
    result = await db.pricing_models.delete_one({"id": model_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pricing model not found")
    return {"message": "Pricing model deleted successfully"}

# Display Types Routes
@api_router.post("/display-types", response_model=DisplayType)
async def create_display_type(type_data: DisplayTypeCreate):
    type_dict = type_data.dict()
    type_obj = DisplayType(**type_dict)
    await db.display_types.insert_one(type_obj.dict())
    return type_obj

@api_router.get("/display-types", response_model=List[DisplayType])
async def get_display_types():
    types = await db.display_types.find().sort("created_at", -1).to_list(1000)
    return [DisplayType(**type_item) for type_item in types]

@api_router.get("/display-types/{type_id}", response_model=DisplayType)
async def get_display_type(type_id: str):
    type_item = await db.display_types.find_one({"id": type_id})
    if not type_item:
        raise HTTPException(status_code=404, detail="Display type not found")
    return DisplayType(**type_item)

@api_router.put("/display-types/{type_id}", response_model=DisplayType)
async def update_display_type(type_id: str, type_data: DisplayTypeUpdate):
    update_dict = {k: v for k, v in type_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.display_types.update_one(
        {"id": type_id}, 
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Display type not found")
    
    updated_type = await db.display_types.find_one({"id": type_id})
    return DisplayType(**updated_type)

@api_router.delete("/display-types/{type_id}")
async def delete_display_type(type_id: str):
    result = await db.display_types.delete_one({"id": type_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Display type not found")
    return {"message": "Display type deleted successfully"}

# Social Handles Routes
@api_router.post("/social-handles", response_model=SocialHandle)
async def create_social_handle(handle_data: SocialHandleCreate):
    # Check for duplicates by name
    existing_handle = await db.social_handles.find_one({"name": handle_data.name})
    if existing_handle:
        raise HTTPException(status_code=400, detail="Social handle with this name already exists")
    
    handle_dict = handle_data.dict()
    handle_obj = SocialHandle(**handle_dict)
    await db.social_handles.insert_one(handle_obj.dict())
    return handle_obj

@api_router.get("/social-handles", response_model=List[SocialHandle])
async def get_social_handles():
    handles = await db.social_handles.find().sort("created_at", -1).to_list(1000)
    return [SocialHandle(**handle) for handle in handles]

@api_router.get("/social-handles/{handle_id}", response_model=SocialHandle)
async def get_social_handle(handle_id: str):
    handle = await db.social_handles.find_one({"id": handle_id})
    if not handle:
        raise HTTPException(status_code=404, detail="Social handle not found")
    return SocialHandle(**handle)

@api_router.put("/social-handles/{handle_id}", response_model=SocialHandle)
async def update_social_handle(handle_id: str, handle_data: SocialHandleUpdate):
    # Check for duplicates by name if name is being updated
    if handle_data.name:
        existing_handle = await db.social_handles.find_one({
            "name": handle_data.name,
            "id": {"$ne": handle_id}
        })
        if existing_handle:
            raise HTTPException(status_code=400, detail="Social handle with this name already exists")
    
    update_dict = {k: v for k, v in handle_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.social_handles.update_one(
        {"id": handle_id}, 
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Social handle not found")
    
    updated_handle = await db.social_handles.find_one({"id": handle_id})
    return SocialHandle(**updated_handle)

@api_router.delete("/social-handles/{handle_id}")
async def delete_social_handle(handle_id: str):
    result = await db.social_handles.delete_one({"id": handle_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Social handle not found")
    return {"message": "Social handle deleted successfully"}

# Business Fields Routes
@api_router.post("/business-fields", response_model=BusinessField)
async def create_business_field(field_data: BusinessFieldCreate):
    field_dict = field_data.dict()
    field_obj = BusinessField(**field_dict)
    await db.business_fields.insert_one(field_obj.dict())
    return field_obj

@api_router.get("/business-fields", response_model=List[BusinessField])
async def get_business_fields():
    fields = await db.business_fields.find().sort("order", 1).to_list(1000)
    return [BusinessField(**field) for field in fields]

@api_router.get("/business-fields/{field_id}", response_model=BusinessField)
async def get_business_field(field_id: str):
    field = await db.business_fields.find_one({"id": field_id})
    if not field:
        raise HTTPException(status_code=404, detail="Business field not found")
    return BusinessField(**field)

@api_router.put("/business-fields/{field_id}", response_model=BusinessField)
async def update_business_field(field_id: str, field_data: BusinessFieldUpdate):
    update_dict = {k: v for k, v in field_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.business_fields.update_one(
        {"id": field_id}, 
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Business field not found")
    
    updated_field = await db.business_fields.find_one({"id": field_id})
    return BusinessField(**updated_field)

@api_router.delete("/business-fields/{field_id}")
async def delete_business_field(field_id: str):
    result = await db.business_fields.delete_one({"id": field_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Business field not found")
    return {"message": "Business field deleted successfully"}

# Business Field Instances Routes (Actual Business Fields Data)
@api_router.post("/business-field-instances", response_model=BusinessFieldInstance)
async def create_business_field_instance(instance_data: BusinessFieldInstanceCreate):
    # Verify the template field exists
    template_field = await db.business_fields.find_one({"id": instance_data.template_field_id})
    if not template_field:
        raise HTTPException(status_code=404, detail="Template field not found")
    
    instance_dict = instance_data.dict()
    instance_obj = BusinessFieldInstance(**instance_dict)
    await db.business_field_instances.insert_one(instance_obj.dict())
    return instance_obj

@api_router.get("/business-field-instances", response_model=List[BusinessFieldInstance])
async def get_business_field_instances():
    instances = await db.business_field_instances.find().sort("created_at", -1).to_list(1000)
    return [BusinessFieldInstance(**instance) for instance in instances]

@api_router.get("/business-field-instances/{instance_id}", response_model=BusinessFieldInstance)
async def get_business_field_instance(instance_id: str):
    instance = await db.business_field_instances.find_one({"id": instance_id})
    if not instance:
        raise HTTPException(status_code=404, detail="Business field instance not found")
    return BusinessFieldInstance(**instance)

@api_router.put("/business-field-instances/{instance_id}", response_model=BusinessFieldInstance)
async def update_business_field_instance(instance_id: str, instance_data: BusinessFieldInstanceUpdate):
    update_dict = {k: v for k, v in instance_data.dict().items() if v is not None}
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.business_field_instances.update_one(
        {"id": instance_id}, 
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Business field instance not found")
    
    updated_instance = await db.business_field_instances.find_one({"id": instance_id})
    return BusinessFieldInstance(**updated_instance)

@api_router.delete("/business-field-instances/{instance_id}")
async def delete_business_field_instance(instance_id: str):
    result = await db.business_field_instances.delete_one({"id": instance_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Business field instance not found")
    return {"message": "Business field instance deleted successfully"}

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

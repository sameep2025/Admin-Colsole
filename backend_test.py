import requests
import json
import unittest
from datetime import datetime, timedelta
import os
import sys
import time
import uuid

# Get the backend URL from the frontend .env file
with open('/app/frontend/.env', 'r') as f:
    for line in f:
        if line.startswith('REACT_APP_BACKEND_URL='):
            BACKEND_URL = line.strip().split('=')[1].strip('"\'')
            break

# Ensure the backend URL is set
if not BACKEND_URL:
    print("Error: REACT_APP_BACKEND_URL not found in frontend/.env")
    sys.exit(1)

# Append /api to the backend URL
API_URL = f"{BACKEND_URL}/api"

print(f"Using API URL: {API_URL}")

class CategoryManagementSystemTest(unittest.TestCase):
    """Test suite for the Category Management System API."""

    def setUp(self):
        """Set up test fixtures before each test method."""
        # Check if the API is healthy
        response = requests.get(f"{API_URL}/health")
        self.assertEqual(response.status_code, 200)
        health_data = response.json()
        self.assertEqual(health_data["status"], "healthy")
        print("API health check passed")

        # Test data for category models
        self.category_model_data = {
            "name": "Product Category Model",
            "description": "Model for product categories",
            "fields": [
                {
                    "name": "price_range",
                    "type": "text",
                    "required": True
                },
                {
                    "name": "in_stock",
                    "type": "boolean",
                    "required": True,
                    "default_value": "true"
                },
                {
                    "name": "release_date",
                    "type": "date",
                    "required": False
                }
            ]
        }

        # Test data for categories
        self.category_data = {
            "name": "Electronics",
            "description": "Electronic products",
            "visibility_status": "visible",
            "sort_order": 1,
            "custom_data": {
                "featured": True,
                "icon": "electronics-icon"
            }
        }

        # Test data for category visibility
        self.visibility_data = {
            "visibility_status": "public",
            "start_date": (datetime.utcnow() + timedelta(days=1)).isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "rules": {
                "show_in_menu": True,
                "show_in_search": True
            }
        }

        # Store created resources for cleanup
        self.created_models = []
        self.created_categories = []
        self.created_visibilities = []

    def tearDown(self):
        """Clean up after each test method."""
        # Delete created visibility settings
        for visibility_id in self.created_visibilities:
            try:
                requests.delete(f"{API_URL}/category-visibility/{visibility_id}")
            except Exception as e:
                print(f"Error deleting visibility {visibility_id}: {e}")

        # Delete created categories
        for category_id in self.created_categories:
            try:
                requests.delete(f"{API_URL}/categories/{category_id}")
            except Exception as e:
                print(f"Error deleting category {category_id}: {e}")

        # Delete created models
        for model_id in self.created_models:
            try:
                requests.delete(f"{API_URL}/category-models/{model_id}")
            except Exception as e:
                print(f"Error deleting model {model_id}: {e}")

    # Category Model API Tests
    def test_01_category_model_crud(self):
        """Test CRUD operations for category models."""
        print("\n=== Testing Category Model CRUD Operations ===")

        # Create a category model
        response = requests.post(f"{API_URL}/category-models", json=self.category_model_data)
        self.assertEqual(response.status_code, 200)
        model = response.json()
        self.assertIsNotNone(model["id"])
        self.assertEqual(model["name"], self.category_model_data["name"])
        self.assertEqual(len(model["fields"]), 3)
        model_id = model["id"]
        self.created_models.append(model_id)
        print(f"Created category model with ID: {model_id}")

        # Get all category models
        response = requests.get(f"{API_URL}/category-models")
        self.assertEqual(response.status_code, 200)
        models = response.json()
        self.assertIsInstance(models, list)
        self.assertGreaterEqual(len(models), 1)
        print(f"Retrieved {len(models)} category models")

        # Get a specific category model
        response = requests.get(f"{API_URL}/category-models/{model_id}")
        self.assertEqual(response.status_code, 200)
        retrieved_model = response.json()
        self.assertEqual(retrieved_model["id"], model_id)
        self.assertEqual(retrieved_model["name"], self.category_model_data["name"])
        print(f"Retrieved category model with ID: {model_id}")

        # Update a category model
        update_data = {
            "name": "Updated Product Category Model",
            "fields": [
                {
                    "name": "price_range",
                    "type": "text",
                    "required": True
                },
                {
                    "name": "in_stock",
                    "type": "boolean",
                    "required": True
                },
                {
                    "name": "release_date",
                    "type": "date",
                    "required": False
                },
                {
                    "name": "product_url",
                    "type": "url",
                    "required": False
                }
            ]
        }
        response = requests.put(f"{API_URL}/category-models/{model_id}", json=update_data)
        self.assertEqual(response.status_code, 200)
        updated_model = response.json()
        self.assertEqual(updated_model["name"], update_data["name"])
        self.assertEqual(len(updated_model["fields"]), 4)
        print(f"Updated category model with ID: {model_id}")

        # Delete a category model (will be done in tearDown)
        # We'll test explicit deletion for one model
        model_to_delete = self.category_model_data.copy()
        model_to_delete["name"] = "Model to Delete"
        response = requests.post(f"{API_URL}/category-models", json=model_to_delete)
        self.assertEqual(response.status_code, 200)
        delete_id = response.json()["id"]
        
        response = requests.delete(f"{API_URL}/category-models/{delete_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Category model deleted successfully")
        print(f"Deleted category model with ID: {delete_id}")

        # Verify deletion
        response = requests.get(f"{API_URL}/category-models/{delete_id}")
        self.assertEqual(response.status_code, 404)
        print("Verified deletion of category model")

    # Category API Tests
    def test_02_category_crud(self):
        """Test CRUD operations for categories."""
        print("\n=== Testing Category CRUD Operations ===")

        # First create a model to associate with categories
        response = requests.post(f"{API_URL}/category-models", json=self.category_model_data)
        self.assertEqual(response.status_code, 200)
        model_id = response.json()["id"]
        self.created_models.append(model_id)
        print(f"Created category model with ID: {model_id} for category testing")

        # Create a category with model association
        category_with_model = self.category_data.copy()
        category_with_model["model_id"] = model_id
        category_with_model["custom_data"] = {
            "price_range": "$100-$500",
            "in_stock": True,
            "release_date": "2023-01-15"
        }
        
        response = requests.post(f"{API_URL}/categories", json=category_with_model)
        self.assertEqual(response.status_code, 200)
        category = response.json()
        self.assertIsNotNone(category["id"])
        self.assertEqual(category["name"], category_with_model["name"])
        self.assertEqual(category["model_id"], model_id)
        category_id = category["id"]
        self.created_categories.append(category_id)
        print(f"Created category with ID: {category_id} and model association")

        # Create a parent category
        parent_category = {
            "name": "All Products",
            "description": "Root category for all products",
            "visibility_status": "visible",
            "sort_order": 0
        }
        response = requests.post(f"{API_URL}/categories", json=parent_category)
        self.assertEqual(response.status_code, 200)
        parent_id = response.json()["id"]
        self.created_categories.append(parent_id)
        print(f"Created parent category with ID: {parent_id}")

        # Create a child category
        child_category = {
            "name": "Smartphones",
            "description": "Mobile phones and smartphones",
            "visibility_status": "visible",
            "parent_id": parent_id,
            "sort_order": 1
        }
        response = requests.post(f"{API_URL}/categories", json=child_category)
        self.assertEqual(response.status_code, 200)
        child_id = response.json()["id"]
        self.created_categories.append(child_id)
        self.assertEqual(response.json()["parent_id"], parent_id)
        print(f"Created child category with ID: {child_id} under parent: {parent_id}")

        # Get all categories
        response = requests.get(f"{API_URL}/categories")
        self.assertEqual(response.status_code, 200)
        categories = response.json()
        self.assertIsInstance(categories, list)
        self.assertGreaterEqual(len(categories), 3)  # We created at least 3
        print(f"Retrieved {len(categories)} categories")

        # Get a specific category
        response = requests.get(f"{API_URL}/categories/{category_id}")
        self.assertEqual(response.status_code, 200)
        retrieved_category = response.json()
        self.assertEqual(retrieved_category["id"], category_id)
        self.assertEqual(retrieved_category["name"], category_with_model["name"])
        print(f"Retrieved category with ID: {category_id}")

        # Update a category
        update_data = {
            "name": "Updated Electronics",
            "description": "Updated description",
            "visibility_status": "private",
            "sort_order": 2
        }
        response = requests.put(f"{API_URL}/categories/{category_id}", json=update_data)
        self.assertEqual(response.status_code, 200)
        updated_category = response.json()
        self.assertEqual(updated_category["name"], update_data["name"])
        self.assertEqual(updated_category["visibility_status"], update_data["visibility_status"])
        print(f"Updated category with ID: {category_id}")

        # Delete a category (will be done in tearDown)
        # We'll test explicit deletion for one category
        category_to_delete = self.category_data.copy()
        category_to_delete["name"] = "Category to Delete"
        response = requests.post(f"{API_URL}/categories", json=category_to_delete)
        self.assertEqual(response.status_code, 200)
        delete_id = response.json()["id"]
        
        response = requests.delete(f"{API_URL}/categories/{delete_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Category deleted successfully")
        print(f"Deleted category with ID: {delete_id}")

        # Verify deletion
        response = requests.get(f"{API_URL}/categories/{delete_id}")
        self.assertEqual(response.status_code, 404)
        print("Verified deletion of category")

    # Category Visibility API Tests
    def test_03_category_visibility_crud(self):
        """Test CRUD operations for category visibility settings."""
        print("\n=== Testing Category Visibility CRUD Operations ===")

        # First create a category to associate with visibility settings
        response = requests.post(f"{API_URL}/categories", json=self.category_data)
        self.assertEqual(response.status_code, 200)
        category_id = response.json()["id"]
        self.created_categories.append(category_id)
        print(f"Created category with ID: {category_id} for visibility testing")

        # Create visibility settings for the category
        visibility_data = self.visibility_data.copy()
        visibility_data["category_id"] = category_id
        
        response = requests.post(f"{API_URL}/category-visibility", json=visibility_data)
        self.assertEqual(response.status_code, 200)
        visibility = response.json()
        self.assertIsNotNone(visibility["id"])
        self.assertEqual(visibility["category_id"], category_id)
        self.assertEqual(visibility["visibility_status"], visibility_data["visibility_status"])
        visibility_id = visibility["id"]
        self.created_visibilities.append(visibility_id)
        print(f"Created visibility setting with ID: {visibility_id} for category: {category_id}")

        # Get all visibility settings
        response = requests.get(f"{API_URL}/category-visibility")
        self.assertEqual(response.status_code, 200)
        visibility_settings = response.json()
        self.assertIsInstance(visibility_settings, list)
        self.assertGreaterEqual(len(visibility_settings), 1)
        print(f"Retrieved {len(visibility_settings)} visibility settings")

        # Get a specific visibility setting
        response = requests.get(f"{API_URL}/category-visibility/{visibility_id}")
        self.assertEqual(response.status_code, 200)
        retrieved_visibility = response.json()
        self.assertEqual(retrieved_visibility["id"], visibility_id)
        self.assertEqual(retrieved_visibility["category_id"], category_id)
        print(f"Retrieved visibility setting with ID: {visibility_id}")

        # Update a visibility setting
        update_data = {
            "visibility_status": "hidden",
            "start_date": (datetime.utcnow() + timedelta(days=2)).isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=60)).isoformat(),
            "rules": {
                "show_in_menu": False,
                "show_in_search": False,
                "show_for_roles": ["admin"]
            }
        }
        response = requests.put(f"{API_URL}/category-visibility/{visibility_id}", json=update_data)
        self.assertEqual(response.status_code, 200)
        updated_visibility = response.json()
        self.assertEqual(updated_visibility["visibility_status"], update_data["visibility_status"])
        self.assertEqual(updated_visibility["rules"]["show_in_menu"], False)
        print(f"Updated visibility setting with ID: {visibility_id}")

        # Delete a visibility setting (will be done in tearDown)
        # We'll test explicit deletion for one visibility setting
        # Create another category for this test
        response = requests.post(f"{API_URL}/categories", json=self.category_data)
        self.assertEqual(response.status_code, 200)
        another_category_id = response.json()["id"]
        self.created_categories.append(another_category_id)
        
        # Create visibility setting to delete
        visibility_to_delete = self.visibility_data.copy()
        visibility_to_delete["category_id"] = another_category_id
        response = requests.post(f"{API_URL}/category-visibility", json=visibility_to_delete)
        self.assertEqual(response.status_code, 200)
        delete_id = response.json()["id"]
        
        response = requests.delete(f"{API_URL}/category-visibility/{delete_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Category visibility setting deleted successfully")
        print(f"Deleted visibility setting with ID: {delete_id}")

        # Verify deletion
        response = requests.get(f"{API_URL}/category-visibility/{delete_id}")
        self.assertEqual(response.status_code, 404)
        print("Verified deletion of visibility setting")

    # Test validation and error handling
    def test_04_validation_and_error_handling(self):
        """Test validation and error handling for all APIs."""
        print("\n=== Testing Validation and Error Handling ===")

        # Test invalid category model creation (missing required field)
        invalid_model = {
            # Missing name field
            "description": "Invalid model"
        }
        response = requests.post(f"{API_URL}/category-models", json=invalid_model)
        self.assertNotEqual(response.status_code, 200)
        print("Validation correctly rejected invalid category model")

        # Test invalid category creation (invalid visibility status)
        invalid_category = self.category_data.copy()
        invalid_category["visibility_status"] = "invalid_status"  # Not in enum
        response = requests.post(f"{API_URL}/categories", json=invalid_category)
        self.assertNotEqual(response.status_code, 200)
        print("Validation correctly rejected invalid visibility status")

        # Test getting non-existent resources
        non_existent_id = str(uuid.uuid4())
        
        response = requests.get(f"{API_URL}/category-models/{non_existent_id}")
        self.assertEqual(response.status_code, 404)
        print("Correctly returned 404 for non-existent category model")
        
        response = requests.get(f"{API_URL}/categories/{non_existent_id}")
        self.assertEqual(response.status_code, 404)
        print("Correctly returned 404 for non-existent category")
        
        response = requests.get(f"{API_URL}/category-visibility/{non_existent_id}")
        self.assertEqual(response.status_code, 404)
        print("Correctly returned 404 for non-existent visibility setting")

    # Test relationships between components
    def test_05_component_relationships(self):
        """Test relationships between categories, models, and visibility settings."""
        print("\n=== Testing Component Relationships ===")

        # Create a category model with various field types
        model_data = {
            "name": "Comprehensive Model",
            "description": "Model with all field types",
            "fields": [
                {"name": "text_field", "type": "text", "required": True},
                {"name": "number_field", "type": "number", "required": True},
                {"name": "boolean_field", "type": "boolean", "required": False},
                {"name": "date_field", "type": "date", "required": False},
                {"name": "email_field", "type": "email", "required": False},
                {"name": "url_field", "type": "url", "required": False},
                {"name": "textarea_field", "type": "textarea", "required": False}
            ]
        }
        response = requests.post(f"{API_URL}/category-models", json=model_data)
        self.assertEqual(response.status_code, 200)
        model_id = response.json()["id"]
        self.created_models.append(model_id)
        print(f"Created comprehensive model with ID: {model_id}")

        # Create a category with this model and custom data for each field type
        category_data = {
            "name": "Comprehensive Category",
            "description": "Category with all field types",
            "model_id": model_id,
            "visibility_status": "visible",
            "custom_data": {
                "text_field": "Sample text",
                "number_field": 42,
                "boolean_field": True,
                "date_field": "2023-05-15",
                "email_field": "test@example.com",
                "url_field": "https://example.com",
                "textarea_field": "This is a longer text that would go in a textarea field."
            }
        }
        response = requests.post(f"{API_URL}/categories", json=category_data)
        self.assertEqual(response.status_code, 200)
        category_id = response.json()["id"]
        self.created_categories.append(category_id)
        print(f"Created category with ID: {category_id} using comprehensive model")

        # Create visibility setting for this category
        visibility_data = {
            "category_id": category_id,
            "visibility_status": "private",
            "start_date": (datetime.utcnow() - timedelta(days=1)).isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "rules": {
                "show_in_menu": True,
                "show_in_search": False
            }
        }
        response = requests.post(f"{API_URL}/category-visibility", json=visibility_data)
        self.assertEqual(response.status_code, 200)
        visibility_id = response.json()["id"]
        self.created_visibilities.append(visibility_id)
        print(f"Created visibility setting with ID: {visibility_id} for comprehensive category")

        # Verify the category has the correct model_id
        response = requests.get(f"{API_URL}/categories/{category_id}")
        self.assertEqual(response.status_code, 200)
        retrieved_category = response.json()
        self.assertEqual(retrieved_category["model_id"], model_id)
        print("Verified category has correct model association")

        # Create parent-child relationship
        parent_data = {
            "name": "Parent Category",
            "description": "Parent category for testing",
            "visibility_status": "visible"
        }
        response = requests.post(f"{API_URL}/categories", json=parent_data)
        self.assertEqual(response.status_code, 200)
        parent_id = response.json()["id"]
        self.created_categories.append(parent_id)
        print(f"Created parent category with ID: {parent_id}")

        # Update the comprehensive category to be a child of the parent
        update_data = {
            "parent_id": parent_id
        }
        response = requests.put(f"{API_URL}/categories/{category_id}", json=update_data)
        self.assertEqual(response.status_code, 200)
        updated_category = response.json()
        self.assertEqual(updated_category["parent_id"], parent_id)
        print(f"Updated category {category_id} to be child of {parent_id}")

        # Verify the parent-child relationship
        response = requests.get(f"{API_URL}/categories/{category_id}")
        self.assertEqual(response.status_code, 200)
        retrieved_category = response.json()
        self.assertEqual(retrieved_category["parent_id"], parent_id)
        print("Verified parent-child relationship")


# Business Fields API Tests
class BusinessFieldsAPITest(unittest.TestCase):
    """Test suite for the Business Fields API."""

    def setUp(self):
        """Set up test fixtures before each test method."""
        # Check if the API is healthy
        response = requests.get(f"{API_URL}/health")
        self.assertEqual(response.status_code, 200)
        health_data = response.json()
        self.assertEqual(health_data["status"], "healthy")
        print("API health check passed")

        # Test data for business fields with different types
        self.business_field_data = {
            "name": "Company Name",
            "type": "text",
            "required": True,
            "category": "basic_info",
            "order": 1,
            "validation": {
                "min_length": 2,
                "max_length": 100
            },
            "active": True
        }

        # Store created resources for cleanup
        self.created_fields = []

    def tearDown(self):
        """Clean up after each test method."""
        # Delete created business fields
        for field_id in self.created_fields:
            try:
                requests.delete(f"{API_URL}/business-fields/{field_id}")
            except Exception as e:
                print(f"Error deleting business field {field_id}: {e}")

    def test_01_business_field_creation(self):
        """Test creating business fields with different types."""
        print("\n=== Testing Business Field Creation with Different Types ===")
        
        # Test creating fields with different types
        field_types = ["text", "number", "boolean", "date", "email", "url", "textarea"]
        
        for i, field_type in enumerate(field_types):
            field_data = self.business_field_data.copy()
            field_data["name"] = f"Test Field {field_type.capitalize()}"
            field_data["type"] = field_type
            field_data["order"] = i + 1
            
            response = requests.post(f"{API_URL}/business-fields", json=field_data)
            self.assertEqual(response.status_code, 200)
            field = response.json()
            self.assertIsNotNone(field["id"])
            self.assertEqual(field["name"], field_data["name"])
            self.assertEqual(field["type"], field_type)
            self.created_fields.append(field["id"])
            print(f"Created {field_type} field with ID: {field['id']}")
        
        # Verify all fields were created
        response = requests.get(f"{API_URL}/business-fields")
        self.assertEqual(response.status_code, 200)
        fields = response.json()
        self.assertGreaterEqual(len(fields), len(field_types))
        print(f"Retrieved {len(fields)} business fields")

    def test_02_business_field_categories(self):
        """Test business fields with different categories."""
        print("\n=== Testing Business Field Categories ===")
        
        # Test creating fields with different categories
        categories = ["general", "basic_info", "legal_info", "financial_info", "contact_info"]
        
        for i, category in enumerate(categories):
            field_data = self.business_field_data.copy()
            field_data["name"] = f"Test Field {category.capitalize()}"
            field_data["category"] = category
            field_data["order"] = i + 1
            
            response = requests.post(f"{API_URL}/business-fields", json=field_data)
            self.assertEqual(response.status_code, 200)
            field = response.json()
            self.assertIsNotNone(field["id"])
            self.assertEqual(field["category"], category)
            self.created_fields.append(field["id"])
            print(f"Created field with category '{category}' and ID: {field['id']}")
        
        # Verify fields with different categories
        response = requests.get(f"{API_URL}/business-fields")
        self.assertEqual(response.status_code, 200)
        fields = response.json()
        
        # Check if we have at least one field for each category
        categories_found = set()
        for field in fields:
            categories_found.add(field["category"])
        
        for category in categories:
            self.assertIn(category, categories_found)
        
        print(f"Verified fields with categories: {', '.join(categories_found)}")

    def test_03_business_field_validation(self):
        """Test validation for business fields."""
        print("\n=== Testing Business Field Validation ===")
        
        # Test required fields
        required_field = self.business_field_data.copy()
        required_field["name"] = "Required Field"
        required_field["required"] = True
        
        response = requests.post(f"{API_URL}/business-fields", json=required_field)
        self.assertEqual(response.status_code, 200)
        field_id = response.json()["id"]
        self.created_fields.append(field_id)
        print(f"Created required field with ID: {field_id}")
        
        # Test field with validation rules
        validation_field = self.business_field_data.copy()
        validation_field["name"] = "Email with Validation"
        validation_field["type"] = "email"
        validation_field["validation"] = {
            "pattern": "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$"
        }
        
        response = requests.post(f"{API_URL}/business-fields", json=validation_field)
        self.assertEqual(response.status_code, 200)
        field_id = response.json()["id"]
        self.created_fields.append(field_id)
        print(f"Created field with validation rules and ID: {field_id}")
        
        # Test field with options (for dropdown/select fields)
        options_field = self.business_field_data.copy()
        options_field["name"] = "Field with Options"
        options_field["options"] = ["Option 1", "Option 2", "Option 3"]
        
        response = requests.post(f"{API_URL}/business-fields", json=options_field)
        self.assertEqual(response.status_code, 200)
        field_id = response.json()["id"]
        self.created_fields.append(field_id)
        self.assertEqual(response.json()["options"], options_field["options"])
        print(f"Created field with options and ID: {field_id}")
        
        # Test invalid field type
        invalid_field = self.business_field_data.copy()
        invalid_field["type"] = "invalid_type"  # Not in enum
        
        response = requests.post(f"{API_URL}/business-fields", json=invalid_field)
        self.assertNotEqual(response.status_code, 200)
        print("Validation correctly rejected invalid field type")

    def test_04_business_field_ordering(self):
        """Test field ordering and sorting."""
        print("\n=== Testing Business Field Ordering ===")
        
        # Create fields with different order values
        for i in range(5):
            field_data = self.business_field_data.copy()
            field_data["name"] = f"Ordered Field {5-i}"  # Reverse naming
            field_data["order"] = i
            
            response = requests.post(f"{API_URL}/business-fields", json=field_data)
            self.assertEqual(response.status_code, 200)
            field_id = response.json()["id"]
            self.created_fields.append(field_id)
            print(f"Created field with order {i} and ID: {field_id}")
        
        # Get all fields and verify they are sorted by order
        response = requests.get(f"{API_URL}/business-fields")
        self.assertEqual(response.status_code, 200)
        fields = response.json()
        
        # Check if fields are sorted by order
        for i in range(1, len(fields)):
            if fields[i-1]["order"] > fields[i]["order"]:
                self.fail(f"Fields not sorted by order: {fields[i-1]['order']} > {fields[i]['order']}")
        
        print("Verified fields are sorted by order")

    def test_05_business_field_crud_operations(self):
        """Test all CRUD operations for business fields."""
        print("\n=== Testing Business Field CRUD Operations ===")
        
        # Create a business field
        response = requests.post(f"{API_URL}/business-fields", json=self.business_field_data)
        self.assertEqual(response.status_code, 200)
        field = response.json()
        self.assertIsNotNone(field["id"])
        self.assertEqual(field["name"], self.business_field_data["name"])
        field_id = field["id"]
        self.created_fields.append(field_id)
        print(f"Created business field with ID: {field_id}")
        
        # Get all business fields
        response = requests.get(f"{API_URL}/business-fields")
        self.assertEqual(response.status_code, 200)
        fields = response.json()
        self.assertIsInstance(fields, list)
        self.assertGreaterEqual(len(fields), 1)
        print(f"Retrieved {len(fields)} business fields")
        
        # Get a specific business field
        response = requests.get(f"{API_URL}/business-fields/{field_id}")
        self.assertEqual(response.status_code, 200)
        retrieved_field = response.json()
        self.assertEqual(retrieved_field["id"], field_id)
        self.assertEqual(retrieved_field["name"], self.business_field_data["name"])
        print(f"Retrieved business field with ID: {field_id}")
        
        # Update a business field
        update_data = {
            "name": "Updated Business Field",
            "required": False,
            "category": "legal_info",
            "validation": {
                "min_length": 5,
                "max_length": 200
            }
        }
        response = requests.put(f"{API_URL}/business-fields/{field_id}", json=update_data)
        self.assertEqual(response.status_code, 200)
        updated_field = response.json()
        self.assertEqual(updated_field["name"], update_data["name"])
        self.assertEqual(updated_field["category"], update_data["category"])
        print(f"Updated business field with ID: {field_id}")
        
        # Delete a business field
        field_to_delete = self.business_field_data.copy()
        field_to_delete["name"] = "Field to Delete"
        response = requests.post(f"{API_URL}/business-fields", json=field_to_delete)
        self.assertEqual(response.status_code, 200)
        delete_id = response.json()["id"]
        
        response = requests.delete(f"{API_URL}/business-fields/{delete_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["message"], "Business field deleted successfully")
        print(f"Deleted business field with ID: {delete_id}")
        
        # Verify deletion
        response = requests.get(f"{API_URL}/business-fields/{delete_id}")
        self.assertEqual(response.status_code, 404)
        print("Verified deletion of business field")

    def test_06_business_field_error_handling(self):
        """Test error handling for business fields API."""
        print("\n=== Testing Business Field Error Handling ===")
        
        # Test getting non-existent field
        non_existent_id = str(uuid.uuid4())
        response = requests.get(f"{API_URL}/business-fields/{non_existent_id}")
        self.assertEqual(response.status_code, 404)
        print("Correctly returned 404 for non-existent business field")
        
        # Test updating non-existent field
        update_data = {"name": "Updated Name"}
        response = requests.put(f"{API_URL}/business-fields/{non_existent_id}", json=update_data)
        self.assertEqual(response.status_code, 404)
        print("Correctly returned 404 when updating non-existent business field")
        
        # Test deleting non-existent field
        response = requests.delete(f"{API_URL}/business-fields/{non_existent_id}")
        self.assertEqual(response.status_code, 404)
        print("Correctly returned 404 when deleting non-existent business field")
        
        # Test creating field with missing required fields
        invalid_field = {}  # Missing name and other required fields
        response = requests.post(f"{API_URL}/business-fields", json=invalid_field)
        self.assertNotEqual(response.status_code, 200)
        print("Correctly rejected field creation with missing required fields")

    def test_07_business_field_activation(self):
        """Test field activation/deactivation."""
        print("\n=== Testing Business Field Activation/Deactivation ===")
        
        # Create an active field
        active_field = self.business_field_data.copy()
        active_field["name"] = "Active Field"
        active_field["active"] = True
        
        response = requests.post(f"{API_URL}/business-fields", json=active_field)
        self.assertEqual(response.status_code, 200)
        field_id = response.json()["id"]
        self.created_fields.append(field_id)
        self.assertTrue(response.json()["active"])
        print(f"Created active field with ID: {field_id}")
        
        # Deactivate the field
        update_data = {"active": False}
        response = requests.put(f"{API_URL}/business-fields/{field_id}", json=update_data)
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["active"])
        print(f"Deactivated field with ID: {field_id}")
        
        # Verify the field is deactivated
        response = requests.get(f"{API_URL}/business-fields/{field_id}")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["active"])
        print("Verified field is deactivated")
        
        # Reactivate the field
        update_data = {"active": True}
        response = requests.put(f"{API_URL}/business-fields/{field_id}", json=update_data)
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["active"])
        print(f"Reactivated field with ID: {field_id}")


if __name__ == "__main__":
    # Run the tests
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
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


if __name__ == "__main__":
    # Run the tests
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
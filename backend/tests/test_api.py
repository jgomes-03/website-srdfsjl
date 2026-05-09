"""
Backend API Tests for SRDFSIL Website
Tests: Auth, Events, Gallery, Members, Contacts endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@srdfsil.pt"
ADMIN_PASSWORD = "admin123"


class TestHealthAndPublicEndpoints:
    """Test health check and public endpoints"""
    
    def test_api_health(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "SRDFSIL" in data["message"]
        print("✓ API health check passed")
    
    def test_get_events(self):
        """Test GET /api/events - public endpoint"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            event = data[0]
            assert "id" in event
            assert "title" in event
            assert "date" in event
        print(f"✓ GET /api/events returned {len(data)} events")
    
    def test_get_upcoming_events(self):
        """Test GET /api/events/upcoming - public endpoint"""
        response = requests.get(f"{BASE_URL}/api/events/upcoming")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/events/upcoming returned {len(data)} upcoming events")
    
    def test_get_gallery(self):
        """Test GET /api/gallery - public endpoint"""
        response = requests.get(f"{BASE_URL}/api/gallery")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            item = data[0]
            assert "id" in item
            assert "title" in item
            assert "image_url" in item
        print(f"✓ GET /api/gallery returned {len(data)} items")


class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_login_success(self):
        """Test successful admin login"""
        session = requests.Session()
        response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "email" in data
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        assert "token" in data
        print("✓ Admin login successful")
        return session
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        print("✓ Invalid credentials rejected correctly")
    
    def test_get_me_unauthenticated(self):
        """Test GET /api/auth/me without authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✓ Unauthenticated /auth/me rejected correctly")
    
    def test_get_me_authenticated(self):
        """Test GET /api/auth/me with authentication"""
        session = requests.Session()
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert login_response.status_code == 200
        
        # Use token from response
        token = login_response.json().get("token")
        headers = {"Authorization": f"Bearer {token}"}
        
        me_response = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert me_response.status_code == 200
        data = me_response.json()
        assert data["email"] == ADMIN_EMAIL
        print("✓ Authenticated /auth/me returned user data")
    
    def test_logout(self):
        """Test logout endpoint"""
        session = requests.Session()
        session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        
        response = session.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print("✓ Logout successful")


class TestContactForm:
    """Test contact form submission"""
    
    def test_submit_contact(self):
        """Test POST /api/contact - public endpoint"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_Contact User",
            "email": unique_email,
            "subject": "Test Subject",
            "message": "This is a test message from automated testing."
        })
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "sucesso" in data["message"].lower()
        print("✓ Contact form submission successful")
    
    def test_submit_contact_minimal(self):
        """Test contact with minimal required fields"""
        unique_email = f"test_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_Minimal User",
            "email": unique_email,
            "message": "Minimal test message"
        })
        assert response.status_code == 200
        print("✓ Contact form with minimal fields successful")


class TestMemberRegistration:
    """Test member registration"""
    
    def test_register_member(self):
        """Test POST /api/members - public endpoint"""
        unique_email = f"test_member_{uuid.uuid4().hex[:8]}@test.com"
        response = requests.post(f"{BASE_URL}/api/members", json={
            "full_name": "TEST_Member User",
            "email": unique_email,
            "phone": "912345678",
            "address": "Test Address 123",
            "birth_date": "1990-01-15",
            "message": "Test registration message"
        })
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "sucesso" in data["message"].lower()
        assert "member" in data
        assert data["member"]["email"] == unique_email
        print("✓ Member registration successful")
    
    def test_register_member_duplicate_email(self):
        """Test duplicate email rejection"""
        unique_email = f"test_dup_{uuid.uuid4().hex[:8]}@test.com"
        
        # First registration
        response1 = requests.post(f"{BASE_URL}/api/members", json={
            "full_name": "TEST_First User",
            "email": unique_email,
            "phone": "912345678"
        })
        assert response1.status_code == 200
        
        # Duplicate registration
        response2 = requests.post(f"{BASE_URL}/api/members", json={
            "full_name": "TEST_Second User",
            "email": unique_email,
            "phone": "912345679"
        })
        assert response2.status_code == 400
        data = response2.json()
        assert "detail" in data
        print("✓ Duplicate email rejected correctly")


class TestAdminEventsCRUD:
    """Test admin events CRUD operations"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_create_event(self, auth_headers):
        """Test POST /api/events - admin only"""
        response = requests.post(f"{BASE_URL}/api/events", json={
            "title": "TEST_Event Title",
            "description": "Test event description",
            "date": "2026-12-25",
            "time": "20:00",
            "location": "Test Location",
            "price": "10€"
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "TEST_Event Title"
        assert "id" in data
        print(f"✓ Event created with id: {data['id']}")
        return data["id"]
    
    def test_create_event_unauthorized(self):
        """Test event creation without auth"""
        response = requests.post(f"{BASE_URL}/api/events", json={
            "title": "Unauthorized Event",
            "description": "Should fail",
            "date": "2026-12-25"
        })
        assert response.status_code == 401
        print("✓ Unauthorized event creation rejected")
    
    def test_update_event(self, auth_headers):
        """Test PUT /api/events/{id} - admin only"""
        # First create an event
        create_response = requests.post(f"{BASE_URL}/api/events", json={
            "title": "TEST_Update Event",
            "description": "Original description",
            "date": "2026-12-26"
        }, headers=auth_headers)
        event_id = create_response.json()["id"]
        
        # Update the event
        update_response = requests.put(f"{BASE_URL}/api/events/{event_id}", json={
            "title": "TEST_Updated Event Title",
            "description": "Updated description"
        }, headers=auth_headers)
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["title"] == "TEST_Updated Event Title"
        print(f"✓ Event {event_id} updated successfully")
    
    def test_delete_event(self, auth_headers):
        """Test DELETE /api/events/{id} - admin only"""
        # First create an event
        create_response = requests.post(f"{BASE_URL}/api/events", json={
            "title": "TEST_Delete Event",
            "description": "To be deleted",
            "date": "2026-12-27"
        }, headers=auth_headers)
        event_id = create_response.json()["id"]
        
        # Delete the event
        delete_response = requests.delete(f"{BASE_URL}/api/events/{event_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        
        # Verify deletion - event should not appear in list
        events_response = requests.get(f"{BASE_URL}/api/events")
        events = events_response.json()
        event_ids = [e["id"] for e in events]
        assert event_id not in event_ids
        print(f"✓ Event {event_id} deleted successfully")


class TestAdminGalleryCRUD:
    """Test admin gallery CRUD operations"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_add_gallery_item(self, auth_headers):
        """Test POST /api/gallery - admin only"""
        response = requests.post(f"{BASE_URL}/api/gallery", json={
            "title": "TEST_Gallery Item",
            "image_url": "https://example.com/test-image.jpg",
            "description": "Test gallery description",
            "category": "Test Category"
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "TEST_Gallery Item"
        assert "id" in data
        print(f"✓ Gallery item created with id: {data['id']}")
        return data["id"]
    
    def test_delete_gallery_item(self, auth_headers):
        """Test DELETE /api/gallery/{id} - admin only"""
        # First create a gallery item
        create_response = requests.post(f"{BASE_URL}/api/gallery", json={
            "title": "TEST_Delete Gallery",
            "image_url": "https://example.com/delete-test.jpg"
        }, headers=auth_headers)
        item_id = create_response.json()["id"]
        
        # Delete the item
        delete_response = requests.delete(f"{BASE_URL}/api/gallery/{item_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        
        # Verify deletion
        gallery_response = requests.get(f"{BASE_URL}/api/gallery")
        items = gallery_response.json()
        item_ids = [i["id"] for i in items]
        assert item_id not in item_ids
        print(f"✓ Gallery item {item_id} deleted successfully")


class TestAdminProtectedEndpoints:
    """Test admin-only endpoints"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_members_authenticated(self, auth_headers):
        """Test GET /api/members - admin only"""
        response = requests.get(f"{BASE_URL}/api/members", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/members returned {len(data)} members")
    
    def test_get_members_unauthenticated(self):
        """Test GET /api/members without auth"""
        response = requests.get(f"{BASE_URL}/api/members")
        assert response.status_code == 401
        print("✓ Unauthenticated /api/members rejected")
    
    def test_get_contacts_authenticated(self, auth_headers):
        """Test GET /api/contacts - admin only"""
        response = requests.get(f"{BASE_URL}/api/contacts", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/contacts returned {len(data)} contacts")
    
    def test_get_contacts_unauthenticated(self):
        """Test GET /api/contacts without auth"""
        response = requests.get(f"{BASE_URL}/api/contacts")
        assert response.status_code == 401
        print("✓ Unauthenticated /api/contacts rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

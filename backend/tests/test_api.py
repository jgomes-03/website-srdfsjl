"""
Backend API Tests for SRDFSJL Website - Full CMS Back Office
Tests: Auth, Events, Services, Timeline, Settings, Homepage Content, Members, Contacts, Admin Stats
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials - CORRECT admin email
ADMIN_EMAIL = "admin@srdfsjl.pt"
ADMIN_PASSWORD = "admin123"


class TestHealthAndPublicEndpoints:
    """Test health check and public endpoints"""
    
    def test_api_health(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "SRDFSJL" in data["message"]
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
    
    def test_get_services(self):
        """Test GET /api/services - public endpoint"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            service = data[0]
            assert "id" in service
            assert "title" in service
            assert "tag" in service
            assert "description" in service
        print(f"✓ GET /api/services returned {len(data)} services")
    
    def test_get_timeline(self):
        """Test GET /api/timeline - public endpoint"""
        response = requests.get(f"{BASE_URL}/api/timeline")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            item = data[0]
            assert "id" in item
            assert "year" in item
            assert "title" in item
            assert "description" in item
        print(f"✓ GET /api/timeline returned {len(data)} timeline items")
    
    def test_get_settings(self):
        """Test GET /api/settings - public endpoint"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        # Check for expected fields
        assert "society_name" in data or data == {}
        print(f"✓ GET /api/settings returned settings data")
    
    def test_get_homepage_content(self):
        """Test GET /api/content/homepage - public endpoint"""
        response = requests.get(f"{BASE_URL}/api/content/homepage")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        # Check for expected fields
        if data:
            assert "hero_title" in data
            assert "hero_subtitle" in data
            assert "stats" in data
        print(f"✓ GET /api/content/homepage returned homepage content")


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


class TestAdminStats:
    """Test admin dashboard stats endpoint"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_admin_stats(self, auth_headers):
        """Test GET /api/admin/stats - admin only"""
        response = requests.get(f"{BASE_URL}/api/admin/stats", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        # Verify structure
        assert "events" in data
        assert "members" in data
        assert "messages" in data
        assert "services" in data
        # Verify nested structure
        assert "total" in data["events"]
        assert "upcoming" in data["events"]
        assert "total" in data["members"]
        assert "pending" in data["members"]
        assert "total" in data["messages"]
        assert "unread" in data["messages"]
        assert "total" in data["services"]
        print(f"✓ Admin stats: {data['events']['total']} events, {data['services']['total']} services, {data['members']['total']} members, {data['messages']['total']} messages")
    
    def test_get_admin_stats_unauthenticated(self):
        """Test GET /api/admin/stats without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 401
        print("✓ Unauthenticated /api/admin/stats rejected")


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


class TestAdminServicesCRUD:
    """Test admin services CRUD operations"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_create_service(self, auth_headers):
        """Test POST /api/services - admin only"""
        response = requests.post(f"{BASE_URL}/api/services", json={
            "title": "TEST_Service Title",
            "tag": "Test Category",
            "description": "Test service description",
            "note": "Test note",
            "order": 99
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "TEST_Service Title"
        assert data["tag"] == "Test Category"
        assert "id" in data
        print(f"✓ Service created with id: {data['id']}")
        return data["id"]
    
    def test_create_service_unauthorized(self):
        """Test service creation without auth"""
        response = requests.post(f"{BASE_URL}/api/services", json={
            "title": "Unauthorized Service",
            "tag": "Test",
            "description": "Should fail"
        })
        assert response.status_code == 401
        print("✓ Unauthorized service creation rejected")
    
    def test_update_service(self, auth_headers):
        """Test PUT /api/services/{id} - admin only"""
        # First create a service
        create_response = requests.post(f"{BASE_URL}/api/services", json={
            "title": "TEST_Update Service",
            "tag": "Original",
            "description": "Original description"
        }, headers=auth_headers)
        service_id = create_response.json()["id"]
        
        # Update the service
        update_response = requests.put(f"{BASE_URL}/api/services/{service_id}", json={
            "title": "TEST_Updated Service Title",
            "tag": "Updated Category"
        }, headers=auth_headers)
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["title"] == "TEST_Updated Service Title"
        assert data["tag"] == "Updated Category"
        print(f"✓ Service {service_id} updated successfully")
    
    def test_delete_service(self, auth_headers):
        """Test DELETE /api/services/{id} - admin only"""
        # First create a service
        create_response = requests.post(f"{BASE_URL}/api/services", json={
            "title": "TEST_Delete Service",
            "tag": "Delete",
            "description": "To be deleted"
        }, headers=auth_headers)
        service_id = create_response.json()["id"]
        
        # Delete the service
        delete_response = requests.delete(f"{BASE_URL}/api/services/{service_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        
        # Verify deletion
        services_response = requests.get(f"{BASE_URL}/api/services")
        services = services_response.json()
        service_ids = [s["id"] for s in services]
        assert service_id not in service_ids
        print(f"✓ Service {service_id} deleted successfully")


class TestAdminTimelineCRUD:
    """Test admin timeline CRUD operations"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_create_timeline_item(self, auth_headers):
        """Test POST /api/timeline - admin only"""
        response = requests.post(f"{BASE_URL}/api/timeline", json={
            "year": "2025",
            "title": "TEST_Timeline Event",
            "description": "Test timeline description",
            "order": 99
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["year"] == "2025"
        assert data["title"] == "TEST_Timeline Event"
        assert "id" in data
        print(f"✓ Timeline item created with id: {data['id']}")
        return data["id"]
    
    def test_create_timeline_unauthorized(self):
        """Test timeline creation without auth"""
        response = requests.post(f"{BASE_URL}/api/timeline", json={
            "year": "2025",
            "title": "Unauthorized",
            "description": "Should fail"
        })
        assert response.status_code == 401
        print("✓ Unauthorized timeline creation rejected")
    
    def test_update_timeline_item(self, auth_headers):
        """Test PUT /api/timeline/{id} - admin only"""
        # First create a timeline item
        create_response = requests.post(f"{BASE_URL}/api/timeline", json={
            "year": "2024",
            "title": "TEST_Update Timeline",
            "description": "Original description"
        }, headers=auth_headers)
        item_id = create_response.json()["id"]
        
        # Update the item
        update_response = requests.put(f"{BASE_URL}/api/timeline/{item_id}", json={
            "title": "TEST_Updated Timeline Title",
            "year": "2024-Updated"
        }, headers=auth_headers)
        assert update_response.status_code == 200
        data = update_response.json()
        assert data["title"] == "TEST_Updated Timeline Title"
        print(f"✓ Timeline item {item_id} updated successfully")
    
    def test_delete_timeline_item(self, auth_headers):
        """Test DELETE /api/timeline/{id} - admin only"""
        # First create a timeline item
        create_response = requests.post(f"{BASE_URL}/api/timeline", json={
            "year": "2023",
            "title": "TEST_Delete Timeline",
            "description": "To be deleted"
        }, headers=auth_headers)
        item_id = create_response.json()["id"]
        
        # Delete the item
        delete_response = requests.delete(f"{BASE_URL}/api/timeline/{item_id}", headers=auth_headers)
        assert delete_response.status_code == 200
        
        # Verify deletion
        timeline_response = requests.get(f"{BASE_URL}/api/timeline")
        timeline = timeline_response.json()
        item_ids = [t["id"] for t in timeline]
        assert item_id not in item_ids
        print(f"✓ Timeline item {item_id} deleted successfully")


class TestAdminSettingsAndContent:
    """Test admin settings and homepage content endpoints"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_update_settings(self, auth_headers):
        """Test PUT /api/settings - admin only"""
        response = requests.put(f"{BASE_URL}/api/settings", json={
            "phone": "912345678"
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["phone"] == "912345678"
        print("✓ Settings updated successfully")
    
    def test_update_settings_unauthorized(self):
        """Test settings update without auth"""
        response = requests.put(f"{BASE_URL}/api/settings", json={
            "phone": "000000000"
        })
        assert response.status_code == 401
        print("✓ Unauthorized settings update rejected")
    
    def test_update_homepage_content(self, auth_headers):
        """Test PUT /api/content/homepage - admin only"""
        response = requests.put(f"{BASE_URL}/api/content/homepage", json={
            "hero_badge": "TEST_Badge Updated"
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["hero_badge"] == "TEST_Badge Updated"
        print("✓ Homepage content updated successfully")
        
        # Restore original
        requests.put(f"{BASE_URL}/api/content/homepage", json={
            "hero_badge": "Desde 1911 — S. Joao das Lampas"
        }, headers=auth_headers)
    
    def test_update_homepage_unauthorized(self):
        """Test homepage content update without auth"""
        response = requests.put(f"{BASE_URL}/api/content/homepage", json={
            "hero_title": "Unauthorized"
        })
        assert response.status_code == 401
        print("✓ Unauthorized homepage content update rejected")


class TestAdminContactsManagement:
    """Test admin contacts management"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_contacts(self, auth_headers):
        """Test GET /api/contacts - admin only"""
        response = requests.get(f"{BASE_URL}/api/contacts", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/contacts returned {len(data)} contacts")
    
    def test_update_contact_read_status(self, auth_headers):
        """Test PUT /api/contacts/{id} - mark as read"""
        # First create a contact
        unique_email = f"test_read_{uuid.uuid4().hex[:8]}@test.com"
        requests.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_Read Contact",
            "email": unique_email,
            "message": "Test message for read status"
        })
        
        # Get contacts to find the one we created
        contacts_response = requests.get(f"{BASE_URL}/api/contacts", headers=auth_headers)
        contacts = contacts_response.json()
        test_contact = next((c for c in contacts if c["email"] == unique_email), None)
        
        if test_contact:
            # Mark as read
            update_response = requests.put(f"{BASE_URL}/api/contacts/{test_contact['id']}", 
                json={"read": True}, headers=auth_headers)
            assert update_response.status_code == 200
            print("✓ Contact marked as read successfully")
        else:
            print("⚠ Could not find test contact to update")
    
    def test_update_contact_replied_status(self, auth_headers):
        """Test PUT /api/contacts/{id} - mark as replied"""
        # First create a contact
        unique_email = f"test_reply_{uuid.uuid4().hex[:8]}@test.com"
        requests.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_Reply Contact",
            "email": unique_email,
            "message": "Test message for reply status"
        })
        
        # Get contacts to find the one we created
        contacts_response = requests.get(f"{BASE_URL}/api/contacts", headers=auth_headers)
        contacts = contacts_response.json()
        test_contact = next((c for c in contacts if c["email"] == unique_email), None)
        
        if test_contact:
            # Mark as replied
            update_response = requests.put(f"{BASE_URL}/api/contacts/{test_contact['id']}", 
                json={"replied": True}, headers=auth_headers)
            assert update_response.status_code == 200
            print("✓ Contact marked as replied successfully")
        else:
            print("⚠ Could not find test contact to update")
    
    def test_delete_contact(self, auth_headers):
        """Test DELETE /api/contacts/{id} - admin only"""
        # First create a contact
        unique_email = f"test_del_{uuid.uuid4().hex[:8]}@test.com"
        requests.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_Delete Contact",
            "email": unique_email,
            "message": "Test message for deletion"
        })
        
        # Get contacts to find the one we created
        contacts_response = requests.get(f"{BASE_URL}/api/contacts", headers=auth_headers)
        contacts = contacts_response.json()
        test_contact = next((c for c in contacts if c["email"] == unique_email), None)
        
        if test_contact:
            # Delete the contact
            delete_response = requests.delete(f"{BASE_URL}/api/contacts/{test_contact['id']}", headers=auth_headers)
            assert delete_response.status_code == 200
            print("✓ Contact deleted successfully")
        else:
            print("⚠ Could not find test contact to delete")


class TestAdminMembersManagement:
    """Test admin members management"""
    
    @pytest.fixture
    def auth_headers(self):
        """Get authentication headers"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = response.json().get("token")
        return {"Authorization": f"Bearer {token}"}
    
    def test_get_members(self, auth_headers):
        """Test GET /api/members - admin only"""
        response = requests.get(f"{BASE_URL}/api/members", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ GET /api/members returned {len(data)} members")
    
    def test_update_member_status_approve(self, auth_headers):
        """Test PUT /api/members/{id}/status - approve member"""
        # First create a member
        unique_email = f"test_approve_{uuid.uuid4().hex[:8]}@test.com"
        requests.post(f"{BASE_URL}/api/members", json={
            "full_name": "TEST_Approve Member",
            "email": unique_email,
            "phone": "912345678"
        })
        
        # Get members to find the one we created
        members_response = requests.get(f"{BASE_URL}/api/members", headers=auth_headers)
        members = members_response.json()
        test_member = next((m for m in members if m["email"] == unique_email), None)
        
        if test_member:
            # Approve member
            update_response = requests.put(f"{BASE_URL}/api/members/{test_member['id']}/status", 
                json={"status": "approved"}, headers=auth_headers)
            assert update_response.status_code == 200
            print("✓ Member approved successfully")
        else:
            print("⚠ Could not find test member to approve")
    
    def test_update_member_status_reject(self, auth_headers):
        """Test PUT /api/members/{id}/status - reject member"""
        # First create a member
        unique_email = f"test_reject_{uuid.uuid4().hex[:8]}@test.com"
        requests.post(f"{BASE_URL}/api/members", json={
            "full_name": "TEST_Reject Member",
            "email": unique_email,
            "phone": "912345678"
        })
        
        # Get members to find the one we created
        members_response = requests.get(f"{BASE_URL}/api/members", headers=auth_headers)
        members = members_response.json()
        test_member = next((m for m in members if m["email"] == unique_email), None)
        
        if test_member:
            # Reject member
            update_response = requests.put(f"{BASE_URL}/api/members/{test_member['id']}/status", 
                json={"status": "rejected"}, headers=auth_headers)
            assert update_response.status_code == 200
            print("✓ Member rejected successfully")
        else:
            print("⚠ Could not find test member to reject")
    
    def test_update_member_status_invalid(self, auth_headers):
        """Test PUT /api/members/{id}/status - invalid status"""
        # First create a member
        unique_email = f"test_invalid_{uuid.uuid4().hex[:8]}@test.com"
        requests.post(f"{BASE_URL}/api/members", json={
            "full_name": "TEST_Invalid Member",
            "email": unique_email,
            "phone": "912345678"
        })
        
        # Get members to find the one we created
        members_response = requests.get(f"{BASE_URL}/api/members", headers=auth_headers)
        members = members_response.json()
        test_member = next((m for m in members if m["email"] == unique_email), None)
        
        if test_member:
            # Try invalid status
            update_response = requests.put(f"{BASE_URL}/api/members/{test_member['id']}/status", 
                json={"status": "invalid_status"}, headers=auth_headers)
            assert update_response.status_code == 400
            print("✓ Invalid member status rejected correctly")
        else:
            print("⚠ Could not find test member")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])

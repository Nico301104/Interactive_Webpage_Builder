from rest_framework import status
from rest_framework.test import APITestCase


class LandingTests(APITestCase):
    def test_landing_public(self):
        resp = self.client.get('/api/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('app', resp.data)
        self.assertIn('auth', resp.data)

    def test_landing_no_auth_required(self):
        """Landing trebuie sa fie accesibil fara JWT."""
        self.client.credentials()
        resp = self.client.get('/api/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

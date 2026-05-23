from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

REGISTER_URL    = reverse('users:register')
LOGIN_URL       = reverse('users:login')
LOGOUT_URL      = reverse('users:logout')
PROFILE_URL     = reverse('users:profile')
REFRESH_URL     = reverse('users:token_refresh')
CHANGE_PASS_URL = reverse('users:change_password')


def _register(client, email='test@ex.ro', password='Parola123!', username='testuser'):
    return client.post(REGISTER_URL, {
        'username': username,
        'email': email,
        'password': password,
        'password2': password,
    })


class RegisterTests(APITestCase):
    def test_register_success(self):
        resp = _register(self.client)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', resp.data)
        self.assertIn('user', resp.data)

    def test_register_password_mismatch(self):
        resp = self.client.post(REGISTER_URL, {
            'username': 'u', 'email': 'u@ex.ro',
            'password': 'Parola123!', 'password2': 'Alta123!',
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        _register(self.client)
        resp = _register(self.client, username='altul')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(APITestCase):
    def setUp(self):
        _register(self.client)

    def test_login_success(self):
        resp = self.client.post(LOGIN_URL, {'email': 'test@ex.ro', 'password': 'Parola123!'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)
        self.assertIn('user', resp.data)

    def test_login_wrong_password(self):
        resp = self.client.post(LOGIN_URL, {'email': 'test@ex.ro', 'password': 'Gresit!'})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class ProfileTests(APITestCase):
    def setUp(self):
        resp = _register(self.client)
        self.token = resp.data['tokens']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_get_profile(self):
        resp = self.client.get(PROFILE_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['email'], 'test@ex.ro')

    def test_update_profile_bio(self):
        resp = self.client.patch(PROFILE_URL, {'bio': 'Salut!'})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['bio'], 'Salut!')

    def test_profile_requires_auth(self):
        self.client.credentials()
        resp = self.client.get(PROFILE_URL)
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


class LogoutTests(APITestCase):
    def setUp(self):
        resp = _register(self.client)
        self.access = resp.data['tokens']['access']
        self.refresh = resp.data['tokens']['refresh']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access}')

    def test_logout_success(self):
        resp = self.client.post(LOGOUT_URL, {'refresh': self.refresh})
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_logout_blacklists_token(self):
        self.client.post(LOGOUT_URL, {'refresh': self.refresh})
        # Token-ul refresh nu mai poate fi folosit
        resp = self.client.post(REFRESH_URL, {'refresh': self.refresh})
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

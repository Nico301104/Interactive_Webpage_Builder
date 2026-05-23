from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from projects.models import Project

User = get_user_model()

LAYOUT_BASE = {'components': [
    {'id': 'c1', 'type': 'text', 'content': 'Primul'},
    {'id': 'c2', 'type': 'button', 'label': 'Click'},
]}


def _make_user(email='ed@ex.ro', username='editor'):
    return User.objects.create_user(username=username, email=email, password='Pass123!')


def _auth(client, user):
    resp = client.post('/api/auth/login/', {'email': user.email, 'password': 'Pass123!'})
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["access"]}')


class EditorLayoutTests(APITestCase):
    def setUp(self):
        self.user = _make_user()
        _auth(self.client, self.user)
        self.project = Project.objects.create(
            owner=self.user,
            title='Ed Project',
            slug='ed-project',
            layout=LAYOUT_BASE,
        )
        self.base = f'/api/editor/projects/{self.project.pk}'

    def test_get_layout(self):
        resp = self.client.get(f'{self.base}/layout/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('layout', resp.data)

    def test_put_layout_full_replace(self):
        new = {'components': [{'id': 'nav-1', 'type': 'navbar', 'logo': 'X'}]}
        resp = self.client.put(f'{self.base}/layout/', {'layout': new}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        self.assertEqual(self.project.layout['components'][0]['id'], 'nav-1')

    def test_upsert_add_new_component(self):
        comp = {'id': 'img-1', 'type': 'image', 'src': 'https://ex.com/img.png', 'alt': 'test'}
        resp = self.client.post(f'{self.base}/components/', {'component': comp}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        ids = [c['id'] for c in self.project.layout['components']]
        self.assertIn('img-1', ids)

    def test_upsert_update_existing_component(self):
        comp = {'id': 'c1', 'type': 'text', 'content': 'Continut actualizat'}
        self.client.post(f'{self.base}/components/', {'component': comp}, format='json')
        self.project.refresh_from_db()
        c1 = next(c for c in self.project.layout['components'] if c['id'] == 'c1')
        self.assertEqual(c1['content'], 'Continut actualizat')

    def test_delete_component(self):
        resp = self.client.delete(
            f'{self.base}/components/delete/',
            {'component_id': 'c1'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        ids = [c['id'] for c in self.project.layout['components']]
        self.assertNotIn('c1', ids)

    def test_delete_nonexistent_component(self):
        resp = self.client.delete(
            f'{self.base}/components/delete/',
            {'component_id': 'nu-exista'},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_reorder_components(self):
        resp = self.client.post(
            f'{self.base}/components/reorder/',
            {'ordered_ids': ['c2', 'c1']},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.project.refresh_from_db()
        ids = [c['id'] for c in self.project.layout['components']]
        self.assertEqual(ids, ['c2', 'c1'])

    def test_reorder_with_invalid_id(self):
        resp = self.client.post(
            f'{self.base}/components/reorder/',
            {'ordered_ids': ['c1', 'nu-exista']},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

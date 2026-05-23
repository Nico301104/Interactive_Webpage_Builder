from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import FormSubmission, Project

User = get_user_model()

PROJECTS_URL = '/api/projects/'


def _make_user(email='owner@ex.ro', password='Parola123!', username='owner'):
    return User.objects.create_user(username=username, email=email, password=password)


def _auth_client(client, user, password='Parola123!'):
    resp = client.post('/api/auth/login/', {'email': user.email, 'password': password})
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["access"]}')
    return client


MINIMAL_LAYOUT = {'components': [{'id': 'txt-1', 'type': 'text', 'content': 'Hello'}]}


class ProjectCRUDTests(APITestCase):
    def setUp(self):
        self.user = _make_user()
        _auth_client(self.client, self.user)

    def _create(self, title='Test Page', layout=None):
        return self.client.post(PROJECTS_URL, {
            'title': title,
            'layout': layout or MINIMAL_LAYOUT,
        }, format='json')

    def test_create_project(self):
        resp = self._create()
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['title'], 'Test Page')
        self.assertIn('slug', resp.data)

    def test_list_own_projects(self):
        self._create('P1')
        self._create('P2')
        resp = self.client.get(PROJECTS_URL)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 2)

    def test_cannot_see_other_users_projects(self):
        other = _make_user('other@ex.ro', username='other')
        Project.objects.create(
            owner=other, title='Secret', layout=MINIMAL_LAYOUT, slug='secret'
        )
        resp = self.client.get(PROJECTS_URL)
        self.assertEqual(resp.data['count'], 0)

    def test_update_creates_snapshot(self):
        create_resp = self._create()
        pk = create_resp.data['id']
        new_layout = {'components': [{'id': 'txt-2', 'type': 'text', 'content': 'Updated'}]}
        self.client.patch(f'{PROJECTS_URL}{pk}/', {'layout': new_layout}, format='json')
        detail = self.client.get(f'{PROJECTS_URL}{pk}/')
        self.assertEqual(len(detail.data['versions']), 1)
        self.assertEqual(detail.data['versions'][0]['note'], 'Auto-snapshot la update')

    def test_delete_project(self):
        create_resp = self._create()
        pk = create_resp.data['id']
        resp = self.client.delete(f'{PROJECTS_URL}{pk}/')
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Project.objects.filter(pk=pk).exists())

    def test_duplicate_project(self):
        create_resp = self._create('Original')
        pk = create_resp.data['id']
        resp = self.client.post(f'{PROJECTS_URL}{pk}/duplicate/')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('copy', resp.data['title'])

    def test_toggle_public(self):
        create_resp = self._create()
        pk = create_resp.data['id']
        resp = self.client.post(f'{PROJECTS_URL}{pk}/toggle-public/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['is_public'])

    def test_shared_link_requires_public(self):
        create_resp = self._create()
        token = create_resp.data['share_token']
        # Inainte de toggle — 404
        self.client.credentials()  # fara auth
        resp = self.client.get(f'/api/projects/shared/{token}/')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_layout_validation_rejects_unknown_type(self):
        resp = self._create(layout={
            'components': [{'id': 'x', 'type': 'INVALID_TYPE'}]
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_layout_validation_requires_id(self):
        resp = self._create(layout={
            'components': [{'type': 'text', 'content': 'no id'}]
        })
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


class ProjectVersionTests(APITestCase):
    def setUp(self):
        self.user = _make_user()
        _auth_client(self.client, self.user)
        resp = self.client.post(PROJECTS_URL, {'title': 'VP', 'layout': MINIMAL_LAYOUT}, format='json')
        self.pk = resp.data['id']

    def test_restore_version(self):
        old_layout = {'components': [{'id': 'c1', 'type': 'text', 'content': 'versiunea 1'}]}
        new_layout = {'components': [{'id': 'c2', 'type': 'text', 'content': 'versiunea 2'}]}
        # Creaza versiunea 1
        self.client.patch(f'{PROJECTS_URL}{self.pk}/', {'layout': old_layout}, format='json')
        # Trece la versiunea 2
        self.client.patch(f'{PROJECTS_URL}{self.pk}/', {'layout': new_layout}, format='json')
        # Lista versiuni
        versions = self.client.get(f'{PROJECTS_URL}{self.pk}/versions/')
        first_version_id = versions.data[0]['id']  # cea mai recenta
        # Restaureaza
        resp = self.client.post(
            f'{PROJECTS_URL}{self.pk}/versions/restore/',
            {'version_id': first_version_id},
            format='json',
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


FORM_LAYOUT = {
    'components': [
        {
            'id': 'form-1',
            'type': 'form',
            'title': 'Contact',
            'fields': [
                {'name': 'name', 'label': 'Name', 'type': 'text'},
                {'name': 'message', 'label': 'Message', 'type': 'textarea'},
            ],
        }
    ]
}


class FormSubmitTests(APITestCase):
    def setUp(self):
        self.owner = _make_user()
        _auth_client(self.client, self.owner)
        resp = self.client.post(PROJECTS_URL, {'title': 'Form Project', 'layout': FORM_LAYOUT}, format='json')
        self.project = Project.objects.get(pk=resp.data['id'])
        self.token = str(self.project.share_token)
        self.submit_url = f'/api/projects/shared/{self.token}/forms/form-1/submit/'

    def _make_public(self):
        self.client.post(f'{PROJECTS_URL}{self.project.pk}/toggle-public/')

    def test_submit_to_public_project_creates_submission(self):
        self._make_public()
        self.client.credentials()
        resp = self.client.post(self.submit_url, {'name': 'Ion', 'message': 'Salut'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(FormSubmission.objects.filter(project=self.project, form_id='form-1').count(), 1)
        sub = FormSubmission.objects.get(project=self.project)
        self.assertEqual(sub.data['name'], 'Ion')

    def test_submit_to_private_project_returns_404(self):
        self.client.credentials()
        resp = self.client.post(self.submit_url, {'name': 'Ion'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_submit_with_invalid_form_id_returns_404(self):
        self._make_public()
        self.client.credentials()
        bad_url = f'/api/projects/shared/{self.token}/forms/nonexistent/submit/'
        resp = self.client.post(bad_url, {'name': 'Ion'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_rate_limit_blocks_after_10_submissions(self):
        self._make_public()
        self.client.credentials()
        with patch('projects.views.cache') as mock_cache:
            mock_cache.get.return_value = 10
            resp = self.client.post(self.submit_url, {'name': 'Spam'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_owner_can_list_submissions(self):
        self._make_public()
        self.client.credentials()
        self.client.post(self.submit_url, {'name': 'Ion'}, format='json')
        _auth_client(self.client, self.owner)
        resp = self.client.get(f'{PROJECTS_URL}{self.project.pk}/submissions/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_owner_can_filter_submissions_by_form_id(self):
        self._make_public()
        self.client.credentials()
        self.client.post(self.submit_url, {'name': 'Ion'}, format='json')
        _auth_client(self.client, self.owner)
        resp_match = self.client.get(f'{PROJECTS_URL}{self.project.pk}/submissions/?form_id=form-1')
        resp_no_match = self.client.get(f'{PROJECTS_URL}{self.project.pk}/submissions/?form_id=other')
        self.assertEqual(len(resp_match.data), 1)
        self.assertEqual(len(resp_no_match.data), 0)

    def test_non_owner_cannot_list_submissions(self):
        other = _make_user('other2@ex.ro', username='other2')
        _auth_client(self.client, other)
        resp = self.client.get(f'{PROJECTS_URL}{self.project.pk}/submissions/')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)


# ── Additional imports for new test classes ───────────────────────────────────
from .models import Page, ProjectTemplate, Tag  # noqa: E402


class TagTests(APITestCase):
    BASE = '/api/projects/tags/'

    def setUp(self):
        self.user1 = _make_user()
        self.user2 = _make_user(email='tag_user2@ex.ro', username='tag_user2')
        _auth_client(self.client, self.user1)

    def test_create_tag(self):
        resp = self.client.post(self.BASE, {'name': 'Launch', 'color': '#4F7CFF'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['name'], 'Launch')
        self.assertEqual(resp.data['color'], '#4F7CFF')

    def test_duplicate_tag_same_owner_fails(self):
        self.client.post(self.BASE, {'name': 'Launch', 'color': '#4F7CFF'}, format='json')
        resp = self.client.post(self.BASE, {'name': 'Launch', 'color': '#22C55E'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_other_user_tags_not_visible(self):
        client2 = self.client_class()
        _auth_client(client2, self.user2)
        client2.post(self.BASE, {'name': 'Secret', 'color': '#EF4444'}, format='json')
        resp = self.client.get(self.BASE)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['count'], 0)


class PageTests(APITestCase):
    def setUp(self):
        self.user = _make_user(email='page_user@ex.ro', username='page_user')
        _auth_client(self.client, self.user)
        proj_resp = self.client.post(
            PROJECTS_URL, {'title': 'Page Test Project', 'layout': MINIMAL_LAYOUT}, format='json'
        )
        self.project_pk = proj_resp.data['id']
        self.pages_url = f'{PROJECTS_URL}{self.project_pk}/pages/'
        page_resp = self.client.post(self.pages_url, {'title': 'Home'}, format='json')
        self.page_id = page_resp.data['id']

    def test_list_pages(self):
        resp = self.client.get(self.pages_url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(resp.data), 1)

    def test_create_second_page(self):
        resp = self.client.post(self.pages_url, {'title': 'About'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['title'], 'About')

    def test_patch_page_title(self):
        url = f'{self.pages_url}{self.page_id}/'
        resp = self.client.patch(url, {'title': 'New Title'}, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['title'], 'New Title')

    def test_delete_only_page_fails(self):
        url = f'{self.pages_url}{self.page_id}/'
        resp = self.client.delete(url)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_page_success(self):
        resp2 = self.client.post(self.pages_url, {'title': 'About'}, format='json')
        page2_id = resp2.data['id']
        del_url = f'{self.pages_url}{self.page_id}/'
        resp = self.client.delete(del_url)
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Page.objects.filter(pk=self.page_id).exists())

    def test_set_homepage(self):
        url = f'{PROJECTS_URL}{self.project_pk}/pages/{self.page_id}/set-homepage/'
        resp = self.client.post(url)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['is_homepage'])


class ProjectTemplateTests(APITestCase):
    TMPL_LAYOUT = {'components': [{'id': 't1', 'type': 'text', 'content': 'Hello'}]}

    def setUp(self):
        self.tmpl = ProjectTemplate.objects.create(
            name='Test Template',
            description='A test template',
            layout=self.TMPL_LAYOUT,
        )
        self.use_url = f'/api/projects/templates/{self.tmpl.pk}/use/'

    def test_list_templates_unauthenticated(self):
        resp = self.client.get('/api/projects/templates/')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_use_template_creates_project(self):
        user = _make_user(email='tmpl_user@ex.ro', username='tmpl_user')
        _auth_client(self.client, user)
        resp = self.client.post(self.use_url, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Project.objects.filter(pk=resp.data['id']).exists())
        project = Project.objects.get(pk=resp.data['id'])
        self.assertEqual(project.layout, self.TMPL_LAYOUT)

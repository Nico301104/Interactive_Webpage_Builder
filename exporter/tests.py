from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from projects.models import Project

User = get_user_model()

FULL_LAYOUT = {
    'components': [
        {'id': 'nav-1', 'type': 'navbar', 'logo': 'TestBrand', 'sticky': True,
         'backgroundColor': '#111', 'textColor': '#fff',
         'links': [{'label': 'Home', 'href': '#'}, {'label': 'About', 'href': '#about'}]},
        {'id': 'hero', 'type': 'section', 'backgroundColor': '#f0f0f0', 'padding': '60px 24px',
         'children': [
             {'id': 'title', 'type': 'text', 'tag': 'h1', 'content': 'Titlu export', 'align': 'center'},
             {'id': 'btn', 'type': 'button', 'label': 'CTA', 'href': '#', 'backgroundColor': '#3b82f6'},
         ]},
        {'id': 'img-1', 'type': 'image', 'src': 'https://ex.com/img.png', 'alt': 'Test'},
        {'id': 'vid-1', 'type': 'video', 'src': 'https://ex.com/vid.mp4', 'controls': True},
        {'id': 'lnk-1', 'type': 'link', 'href': 'https://ex.com', 'label': 'Link'},
        {'id': 'div-1', 'type': 'divider', 'color': '#ccc', 'thickness': 2},
        {'id': 'sp-1', 'type': 'spacer', 'height': 40},
    ]
}
META = {
    'title': 'Export Test', 'description': 'Desc', 'lang': 'ro',
    'customCSS': 'body{color:red;}', 'customJS': 'console.log("ok");'
}


def _make_user():
    return User.objects.create_user(username='exp', email='exp@ex.ro', password='Pass123!')


def _auth(client, user):
    resp = client.post('/api/auth/login/',
                       {'email': user.email, 'password': 'Pass123!'},
                       format='json')
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {resp.data["access"]}')


class ExportTests(APITestCase):
    def setUp(self):
        self.user = _make_user()
        _auth(self.client, self.user)
        self.project = Project.objects.create(
            owner=self.user, title='Export Project',
            slug='export-project', layout=FULL_LAYOUT, meta=META,
        )
        # NOTE: folosim ?type= in loc de ?format= (format e rezervat de DRF)
        self.url = f'/api/export/{self.project.pk}/'

    def test_export_zip(self):
        resp = self.client.get(self.url + '?type=zip')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp['Content-Type'], 'application/zip')
        self.assertIn('attachment', resp['Content-Disposition'])

    def test_export_json(self):
        resp = self.client.get(self.url + '?type=json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('html', resp.data)
        self.assertIn('css', resp.data)
        self.assertIn('js', resp.data)

    def test_export_json_html_contains_title(self):
        resp = self.client.get(self.url + '?type=json')
        self.assertIn('Export Test', resp.data['html'])

    def test_export_json_css_contains_custom(self):
        resp = self.client.get(self.url + '?type=json')
        self.assertIn('color:red', resp.data['css'])

    def test_export_json_js_contains_custom(self):
        resp = self.client.get(self.url + '?type=json')
        self.assertIn('console.log("ok")', resp.data['js'])

    def test_export_invalid_format(self):
        resp = self.client.get(self.url + '?type=xml')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_export_requires_auth(self):
        self.client.credentials()
        resp = self.client.get(self.url + '?type=json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cannot_export_other_users_project(self):
        other = User.objects.create_user(username='other2', email='o2@ex.ro', password='Pass123!')
        other_project = Project.objects.create(
            owner=other, title='Other', slug='other', layout=FULL_LAYOUT
        )
        resp = self.client.get(f'/api/export/{other_project.pk}/?type=json')
        self.assertEqual(resp.status_code, status.HTTP_404_NOT_FOUND)

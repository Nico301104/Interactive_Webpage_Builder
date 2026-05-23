from django.test import SimpleTestCase
from rest_framework.exceptions import ValidationError

from .validators import validate_layout, validate_component


class ValidatorTests(SimpleTestCase):

    def test_valid_layout(self):
        validate_layout({'components': [{'id': 'c1', 'type': 'text'}]})

    def test_layout_missing_components_key(self):
        with self.assertRaises(ValidationError):
            validate_layout({'nodes': []})

    def test_layout_not_dict(self):
        with self.assertRaises(ValidationError):
            validate_layout([])

    def test_duplicate_ids(self):
        with self.assertRaises(ValidationError):
            validate_layout({'components': [
                {'id': 'dup', 'type': 'text'},
                {'id': 'dup', 'type': 'button'},
            ]})

    def test_invalid_type(self):
        with self.assertRaises(ValidationError):
            validate_component({'id': 'x', 'type': 'carousel'})

    def test_missing_id(self):
        with self.assertRaises(ValidationError):
            validate_component({'type': 'text'})

    def test_missing_type(self):
        with self.assertRaises(ValidationError):
            validate_component({'id': 'x'})

    def test_empty_id_string(self):
        with self.assertRaises(ValidationError):
            validate_component({'id': '   ', 'type': 'text'})

    def test_children_not_list(self):
        with self.assertRaises(ValidationError):
            validate_component({'id': 'c', 'type': 'container', 'children': 'invalid'})

    def test_valid_nested_children(self):
        validate_layout({'components': [
            {'id': 'sec', 'type': 'section', 'children': [
                {'id': 'inner-1', 'type': 'text', 'content': 'Hi'},
                {'id': 'inner-btn', 'type': 'button', 'label': 'OK'},
            ]}
        ]})

    def test_invalid_child_type(self):
        with self.assertRaises(ValidationError):
            validate_layout({'components': [
                {'id': 'sec', 'type': 'section', 'children': [
                    {'id': 'bad', 'type': 'UNKNOWN'}
                ]}
            ]})

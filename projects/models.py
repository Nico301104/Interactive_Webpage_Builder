import uuid
from django.conf import settings
from django.db import models
from core.models import BaseModel


class Tag(BaseModel):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='tags',
    )
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=7, default='#6366f1')

    class Meta:
        db_table = 'project_tags'
        unique_together = [('owner', 'name')]
        ordering = ['name']

    def __str__(self):
        return self.name


class Project(BaseModel):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED = 'archived', 'Archived'

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='projects',
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    slug = models.SlugField(max_length=255, blank=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT,
    )
    layout = models.JSONField(default=dict)
    meta = models.JSONField(default=dict, blank=True)
    share_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_public = models.BooleanField(default=False)
    tags = models.ManyToManyField('Tag', blank=True, related_name='projects')

    class Meta:
        db_table = 'projects'
        ordering = ['-updated_at']
        unique_together = [('owner', 'slug')]

    def __str__(self):
        return f'{self.title} — {self.owner.email}'


class ProjectVersion(BaseModel):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='versions',
    )
    version_number = models.PositiveIntegerField()
    layout_snapshot = models.JSONField()
    note = models.CharField(max_length=255, blank=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_versions',
    )

    class Meta:
        db_table = 'project_versions'
        ordering = ['-version_number']
        unique_together = [('project', 'version_number')]

    def __str__(self):
        return f'{self.project.title} v{self.version_number}'


class Page(BaseModel):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='pages',
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255)
    layout = models.JSONField(default=dict)
    order = models.PositiveIntegerField(default=0)
    is_homepage = models.BooleanField(default=False)

    class Meta:
        db_table = 'project_pages'
        ordering = ['order']
        unique_together = [('project', 'slug')]

    def __str__(self):
        return f'{self.project.title} / {self.title}'


class ProjectTemplate(BaseModel):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    thumbnail_url = models.URLField(blank=True)
    layout = models.JSONField()

    class Meta:
        db_table = 'project_templates'
        ordering = ['category', 'name']

    def __str__(self):
        return self.name


class FormSubmission(BaseModel):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='submissions',
    )
    form_id = models.CharField(max_length=255)
    data = models.JSONField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    class Meta:
        db_table = 'form_submissions'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.project.title} / {self.form_id}'

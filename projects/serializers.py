from django.utils.text import slugify
from rest_framework import serializers

from core.validators import validate_layout
from .models import FormSubmission, Page, Project, ProjectTemplate, ProjectVersion, Tag


# ── Tag ───────────────────────────────────────────────────────────────────────

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'color', 'created_at')
        read_only_fields = ('id', 'created_at')

    def validate_name(self, value):
        request = self.context.get('request')
        if request:
            qs = Tag.objects.filter(owner=request.user, name=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError('Ai deja un tag cu acest nume.')
        return value

    def validate_color(self, value):
        if not value.startswith('#') or len(value) not in (4, 7):
            raise serializers.ValidationError('Culoarea trebuie sa fie hex (#RGB sau #RRGGBB).')
        return value


# ── Version ───────────────────────────────────────────────────────────────────

class ProjectVersionSerializer(serializers.ModelSerializer):
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)

    class Meta:
        model = ProjectVersion
        fields = ('id', 'version_number', 'layout_snapshot', 'note', 'created_by_email', 'created_at')
        read_only_fields = fields


# ── Page ──────────────────────────────────────────────────────────────────────

class PageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Page
        fields = ('id', 'title', 'slug', 'layout', 'order', 'is_homepage', 'created_at', 'updated_at')
        read_only_fields = ('id', 'slug', 'created_at', 'updated_at')

    def validate_layout(self, value):
        if value:
            validate_layout(value)
        return value


# ── Project ───────────────────────────────────────────────────────────────────

class ProjectListSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    version_count = serializers.SerializerMethodField()
    tags = TagSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = (
            'id', 'title', 'description', 'slug', 'status',
            'is_public', 'owner_email', 'version_count', 'tags',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'slug', 'owner_email', 'created_at', 'updated_at')

    def get_version_count(self, obj):
        return obj.versions.count()


class ProjectDetailSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    share_url = serializers.SerializerMethodField()
    versions = ProjectVersionSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Tag.objects.none(), source='tags',
        write_only=True, required=False,
    )

    class Meta:
        model = Project
        fields = (
            'id', 'title', 'description', 'slug', 'status',
            'layout', 'meta', 'is_public', 'share_token', 'share_url',
            'owner_email', 'versions', 'tags', 'tag_ids', 'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'slug', 'owner_email', 'share_token',
            'share_url', 'created_at', 'updated_at',
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            self.fields['tag_ids'].child_relation.queryset = Tag.objects.filter(owner=request.user)

    def get_share_url(self, obj):
        request = self.context.get('request')
        path = f'/api/projects/shared/{obj.share_token}/'
        return request.build_absolute_uri(path) if request else path

    def validate_layout(self, value):
        validate_layout(value)
        return value

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError('Titlul nu poate fi gol.')
        return value.strip()

    def _unique_slug(self, base, owner, exclude_pk=None):
        slug, n = base, 1
        qs = Project.objects.filter(owner=owner, slug=slug)
        if exclude_pk:
            qs = qs.exclude(pk=exclude_pk)
        while qs.exists():
            slug = f'{base}-{n}'
            n += 1
            qs = Project.objects.filter(owner=owner, slug=slug)
            if exclude_pk:
                qs = qs.exclude(pk=exclude_pk)
        return slug

    def create(self, validated_data):
        tags = validated_data.pop('tags', [])
        owner = self.context['request'].user
        validated_data['owner'] = owner
        validated_data['slug'] = self._unique_slug(slugify(validated_data['title']), owner)
        project = super().create(validated_data)
        project.tags.set(tags)
        return project

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags', None)
        if 'layout' in validated_data and validated_data['layout'] != instance.layout:
            last = instance.versions.first()
            ProjectVersion.objects.create(
                project=instance,
                version_number=(last.version_number + 1) if last else 1,
                layout_snapshot=instance.layout,
                created_by=self.context['request'].user,
                note='Auto-snapshot la update',
            )
        if 'title' in validated_data:
            validated_data['slug'] = self._unique_slug(
                slugify(validated_data['title']),
                instance.owner,
                exclude_pk=instance.pk,
            )
        project = super().update(instance, validated_data)
        if tags is not None:
            project.tags.set(tags)
        return project


class ProjectPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'title', 'description', 'layout', 'meta', 'updated_at')
        read_only_fields = fields


class RestoreVersionSerializer(serializers.Serializer):
    version_id = serializers.UUIDField(required=True)


# ── Template ──────────────────────────────────────────────────────────────────

class ProjectTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTemplate
        fields = ('id', 'name', 'description', 'category', 'thumbnail_url', 'layout', 'created_at')
        read_only_fields = fields


# ── Form Submission ───────────────────────────────────────────────────────────

class FormSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormSubmission
        fields = ('id', 'form_id', 'data', 'ip_address', 'created_at')
        read_only_fields = fields

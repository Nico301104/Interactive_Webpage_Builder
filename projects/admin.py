from django.contrib import admin
from .models import FormSubmission, Page, Project, ProjectTemplate, ProjectVersion, Tag


class ProjectVersionInline(admin.TabularInline):
    model = ProjectVersion
    extra = 0
    readonly_fields = ('version_number', 'created_by', 'created_at', 'note')
    can_delete = False


class PageInline(admin.TabularInline):
    model = Page
    extra = 0
    readonly_fields = ('id', 'slug', 'created_at')
    fields = ('title', 'slug', 'order', 'is_homepage', 'created_at')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'status', 'is_public', 'updated_at')
    list_filter = ('status', 'is_public')
    search_fields = ('title', 'owner__email')
    readonly_fields = ('id', 'share_token', 'created_at', 'updated_at')
    filter_horizontal = ('tags',)
    inlines = [ProjectVersionInline, PageInline]
    ordering = ('-updated_at',)


@admin.register(ProjectVersion)
class ProjectVersionAdmin(admin.ModelAdmin):
    list_display = ('project', 'version_number', 'created_by', 'note', 'created_at')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'color', 'owner', 'created_at')
    list_filter = ('owner',)
    search_fields = ('name', 'owner__email')
    readonly_fields = ('id', 'created_at')


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ('title', 'project', 'slug', 'order', 'is_homepage', 'created_at')
    list_filter = ('is_homepage',)
    search_fields = ('title', 'project__title')
    readonly_fields = ('id', 'slug', 'created_at', 'updated_at')
    ordering = ('project', 'order')


@admin.register(ProjectTemplate)
class ProjectTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_at')
    list_filter = ('category',)
    search_fields = ('name', 'description')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ('project', 'form_id', 'ip_address', 'created_at')
    list_filter = ('form_id',)
    search_fields = ('project__title', 'form_id')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-created_at',)

from rest_framework import serializers
from core.validators import validate_layout, validate_component

# ── Default props per component type (usate de frontend la drag-and-drop) ────
COMPONENT_DEFAULTS = {
    # Layout
    'navbar': {
        'logo': 'Brand', 'homeHref': '/', 'sticky': True,
        'backgroundColor': '#ffffff', 'textColor': '#111111',
        'links': [{'label': 'Home', 'href': '#'}, {'label': 'About', 'href': '#about'}, {'label': 'Contact', 'href': '#contact'}],
        'ctaButtons': [{'label': 'Get started', 'href': '#', 'backgroundColor': '#4F7CFF', 'textColor': '#ffffff', 'size': 'sm'}],
    },
    'section': {
        'backgroundColor': '#ffffff', 'padding': '80px 0', 'children': [],
    },
    'container': {
        'direction': 'row', 'gap': '24px', 'padding': '0',
        'wrap': True, 'alignItems': 'center', 'justifyContent': 'flex-start', 'children': [],
    },
    'columns': {
        'gap': '24px', 'padding': '0',
        'columns': [{'children': []}, {'children': []}],
    },
    'footer': {
        'backgroundColor': '#0f172a', 'textColor': '#e5e7eb',
        'logo': 'Brand', 'description': 'Building great products.',
        'columns': [
            {'title': 'Product', 'links': [{'label': 'Features', 'href': '#'}, {'label': 'Pricing', 'href': '#'}]},
            {'title': 'Company', 'links': [{'label': 'About', 'href': '#'}, {'label': 'Blog', 'href': '#'}]},
        ],
        'social': [{'platform': 'twitter', 'url': '#', 'icon': '𝕏', 'label': 'Twitter'}],
        'copyright': '© 2025 Brand. All rights reserved.',
        'bottomLinks': [{'label': 'Privacy', 'href': '#'}, {'label': 'Terms', 'href': '#'}],
    },
    'divider': {'color': '#e5e7eb', 'thickness': 1, 'margin': '16px 0'},
    'spacer':  {'height': 48},
    'banner':  {'text': 'Welcome! Check out our latest update.', 'backgroundColor': '#4F7CFF', 'textColor': '#ffffff', 'closeable': True},

    # Content
    'text': {'tag': 'p', 'content': 'Your text here. Click to edit.', 'fontSize': '16px', 'color': '#374151'},
    'heading': {
        'eyebrow': 'Section', 'eyebrowColor': '#4F7CFF',
        'title': 'Your Section Title Here', 'titleColor': '#111827',
        'subtitle': 'Add a subtitle that explains what this section is about in a sentence or two.',
        'subtitleColor': '#6B7280', 'align': 'left', 'tag': 'h2',
    },
    'richtext': {'html': '<p>Rich text content. Use <strong>bold</strong>, <em>italic</em>, lists, links and more.</p>', 'padding': '0'},
    'blockquote': {'text': 'The best way to predict the future is to create it.', 'author': 'Abraham Lincoln', 'accentColor': '#4F7CFF'},
    'code_block': {'code': 'console.log("Hello, World!");', 'language': 'javascript', 'backgroundColor': '#0f172a', 'textColor': '#e5e7eb'},
    'icon': {'icon': '⚡', 'size': '48px', 'color': '#4F7CFF', 'backgroundColor': 'rgba(79,124,255,.1)', 'borderRadius': '12px', 'align': 'left'},
    'badge': {'text': 'New', 'backgroundColor': 'rgba(79,124,255,.1)', 'textColor': '#4F7CFF', 'borderRadius': '6px'},

    # Media
    'image': {'src': '', 'alt': '', 'width': '100%', 'borderRadius': '0px'},
    'video': {'src': '', 'controls': True, 'muted': False, 'autoplay': False, 'loop': False, 'width': '100%'},
    'embed': {'url': '', 'height': '400px', 'borderRadius': '8px', 'title': 'Embedded content'},
    'gallery': {
        'galleryLayout': 'grid', 'columns': 3, 'aspectRatio': '16/9', 'gap': '12',
        'images': [{'src': '', 'alt': ''}, {'src': '', 'alt': ''}, {'src': '', 'alt': ''}],
    },
    'logo_strip': {
        'label': 'Trusted by leading companies',
        'logos': [{'name': 'Company A', 'src': ''}, {'name': 'Company B', 'src': ''}, {'name': 'Company C', 'src': ''}],
    },

    # Interactive
    'button': {'label': 'Click me', 'href': '#', 'backgroundColor': '#4F7CFF', 'textColor': '#ffffff', 'size': 'md', 'borderRadius': '8px'},
    'link': {'href': '#', 'label': 'Click here', 'target': '_self', 'color': '#4F7CFF', 'underline': True},
    'social_links': {
        'links': [
            {'platform': 'Twitter', 'url': '#', 'icon': '𝕏', 'backgroundColor': 'rgba(0,0,0,.08)', 'color': '#111'},
            {'platform': 'GitHub', 'url': '#', 'icon': '⌥', 'backgroundColor': 'rgba(0,0,0,.08)', 'color': '#111'},
            {'platform': 'LinkedIn', 'url': '#', 'icon': 'in', 'backgroundColor': 'rgba(0,0,0,.08)', 'color': '#111'},
        ],
        'size': '40px', 'align': 'flex-start',
    },
    'form': {
        'title': 'Get in Touch',
        'fields': [
            {'type': 'text',  'name': 'name',    'label': 'Full Name',    'placeholder': 'John Doe',         'required': True},
            {'type': 'email', 'name': 'email',   'label': 'Email Address','placeholder': 'john@example.com', 'required': True},
            {'type': 'textarea','name': 'message','label': 'Message',     'placeholder': 'Your message...', 'required': True, 'rows': 5},
        ],
        'submitButton': {'label': 'Send Message', 'backgroundColor': '#4F7CFF', 'textColor': '#ffffff', 'size': 'md'},
        'action': '', 'method': 'POST',
    },
    'countdown': {
        'title': 'Launching soon', 'targetDate': '2026-01-01T00:00:00Z',
        'backgroundColor': '#0f172a', 'textColor': '#ffffff', 'accentColor': '#4F7CFF',
    },

    # Sections
    'hero': {
        'backgroundColor': '#0f172a', 'textColor': '#ffffff',
        'eyebrow': '✦ New Product Launch', 'eyebrowColor': '#4F7CFF',
        'title': 'Build something <span style="color:#4F7CFF">amazing</span> today',
        'subtitle': 'The fastest way to go from idea to live product. No code, no hassle, no limits.',
        'subtitleColor': '#94A3B8',
        'buttons': [
            {'label': 'Get started free', 'href': '#', 'backgroundColor': '#4F7CFF', 'textColor': '#fff', 'size': 'lg'},
            {'label': 'Learn more →',     'href': '#', 'backgroundColor': 'transparent', 'textColor': '#fff', 'size': 'lg', 'variant': 'outline'},
        ],
        'note': 'Free forever · No credit card required',
        'layout': 'centered', 'minHeight': '90vh', 'padding': 'clamp(80px,12vw,140px) 0',
    },
    'features': {
        'backgroundColor': '#f8fafc',
        'eyebrow': 'Features', 'eyebrowColor': '#4F7CFF',
        'title': 'Everything you need to succeed',
        'subtitle': 'A complete set of tools to help you build, launch, and grow.',
        'align': 'center', 'columns': 3, 'gap': '24px',
        'iconBackground': 'rgba(79,124,255,.1)', 'iconColor': '#4F7CFF', 'iconSize': '52px',
        'items': [
            {'icon': '⚡', 'title': 'Lightning Fast', 'description': 'Optimized for speed. Every interaction feels instant.'},
            {'icon': '🔒', 'title': 'Secure by Default', 'description': 'Enterprise-grade security baked in from day one.'},
            {'icon': '📊', 'title': 'Powerful Analytics', 'description': 'Real-time insights to make data-driven decisions.'},
            {'icon': '🎨', 'title': 'Beautiful Design', 'description': 'Pixel-perfect components crafted with care.'},
            {'icon': '🔧', 'title': 'Easy Integration', 'description': 'Works with all your existing tools and workflows.'},
            {'icon': '🌍', 'title': 'Global Scale', 'description': 'Deploy worldwide with 99.9% uptime guaranteed.'},
        ],
    },
    'pricing': {
        'backgroundColor': '#ffffff',
        'eyebrow': 'Pricing', 'eyebrowColor': '#4F7CFF',
        'title': 'Simple, transparent pricing',
        'subtitle': 'No hidden fees. No surprises. Cancel anytime.',
        'align': 'center',
        'plans': [
            {'name': 'Starter', 'price': 0, 'currency': '$', 'period': '/month', 'description': 'Perfect for side projects.',
             'accentColor': '#4F7CFF',
             'features': [{'text': '3 projects', 'included': True}, {'text': '10GB storage', 'included': True}, {'text': 'Priority support', 'included': False}],
             'button': {'label': 'Get started free', 'href': '#', 'textColor': '#4F7CFF', 'size': 'md', 'variant': 'outline'}},
            {'name': 'Pro', 'price': 29, 'currency': '$', 'period': '/month', 'description': 'For growing teams.', 'popular': True, 'popularLabel': 'Most popular',
             'accentColor': '#4F7CFF',
             'features': [{'text': 'Unlimited projects', 'included': True}, {'text': '100GB storage', 'included': True}, {'text': 'Priority support', 'included': True}],
             'button': {'label': 'Start free trial', 'href': '#', 'textColor': '#ffffff', 'size': 'md'}},
            {'name': 'Enterprise', 'price': 99, 'currency': '$', 'period': '/month', 'description': 'For large organizations.',
             'accentColor': '#4F7CFF',
             'features': [{'text': 'Unlimited projects', 'included': True}, {'text': '1TB storage', 'included': True}, {'text': 'Dedicated support', 'included': True}],
             'button': {'label': 'Contact sales', 'href': '#', 'textColor': '#4F7CFF', 'size': 'md', 'variant': 'outline'}},
        ],
    },
    'testimonials': {
        'backgroundColor': '#f8fafc',
        'eyebrow': 'Testimonials', 'eyebrowColor': '#4F7CFF',
        'title': 'Loved by thousands', 'align': 'center', 'columns': 3,
        'cardBackground': '#ffffff',
        'items': [
            {'quote': 'This product completely changed how we work. Absolutely incredible.', 'name': 'Sarah Johnson', 'role': 'CEO at TechCorp', 'rating': 5},
            {'quote': 'The best investment we made this year. Our productivity doubled.', 'name': 'Mike Chen', 'role': 'CTO at StartupXYZ', 'rating': 5},
            {'quote': 'I cannot imagine our workflow without this tool anymore.', 'name': 'Emma Wilson', 'role': 'Product Manager', 'rating': 5},
        ],
    },
    'faq': {
        'backgroundColor': '#ffffff',
        'title': 'Frequently asked questions', 'align': 'center',
        'accentColor': '#4F7CFF', 'maxWidth': '760px',
        'items': [
            {'question': 'How do I get started?', 'answer': 'Simply sign up for free and create your first project. No credit card required.'},
            {'question': 'Can I cancel anytime?', 'answer': 'Yes, you can cancel your subscription at any time. No questions asked.'},
            {'question': 'Do you offer a free trial?', 'answer': 'Our Starter plan is free forever. You can upgrade at any time.'},
        ],
    },
    'cta': {
        'backgroundColor': '#0f172a', 'textColor': '#ffffff',
        'eyebrow': 'Get started today',
        'title': 'Ready to transform your workflow?',
        'subtitle': 'Join thousands of teams already using our platform.',
        'align': 'center', 'maxWidth': '600px',
        'buttons': [
            {'label': 'Start for free', 'href': '#', 'backgroundColor': '#4F7CFF', 'textColor': '#fff', 'size': 'lg'},
            {'label': 'Schedule a demo', 'href': '#', 'backgroundColor': 'transparent', 'textColor': '#fff', 'size': 'lg', 'variant': 'outline'},
        ],
        'note': 'No credit card required',
    },
    'team': {
        'backgroundColor': '#ffffff',
        'eyebrow': 'Team', 'eyebrowColor': '#4F7CFF',
        'title': 'Meet our team', 'align': 'center', 'columns': 4,
        'members': [
            {'name': 'Alex Turner', 'role': 'CEO & Co-founder', 'bio': 'Building the future, one product at a time.'},
            {'name': 'Maria Garcia', 'role': 'CTO', 'bio': 'Turning complex problems into elegant solutions.'},
            {'name': 'James Lee', 'role': 'Head of Design', 'bio': 'Design is not just what it looks like, it is how it works.'},
            {'name': 'Sofia Patel', 'role': 'Head of Marketing', 'bio': 'Storytelling meets strategy meets growth.'},
        ],
    },
    'stats': {
        'backgroundColor': '#0f172a', 'textColor': '#ffffff',
        'title': 'Numbers speak for themselves', 'align': 'center',
        'accentColor': '#4F7CFF', 'columns': 4,
        'items': [
            {'value': '10K+', 'label': 'Active users'},
            {'value': '99.9%', 'label': 'Uptime'},
            {'value': '2.4M', 'label': 'Projects built'},
            {'value': '4.9★', 'label': 'Average rating'},
        ],
    },
    'card': {
        'title': 'Card Title', 'text': 'Card description goes here.',
        'backgroundColor': '#ffffff', 'border': '1px solid #e5e7eb',
        'shadow': '0 2px 12px rgba(0,0,0,.08)',
        'button': {'label': 'Learn more →', 'href': '#', 'backgroundColor': '#4F7CFF', 'textColor': '#fff', 'size': 'sm'},
    },
    'cards_grid': {
        'backgroundColor': '#f8fafc', 'title': 'Latest Articles', 'align': 'left', 'columns': 3,
        'cards': [
            {'id': 'card-default-1', 'type': 'card', 'title': 'Article One', 'text': 'Short description of this article.', 'tag': 'Tutorial', 'button': {'label': 'Read more →', 'href': '#', 'backgroundColor': '#4F7CFF', 'textColor': '#fff', 'size': 'sm'}},
            {'id': 'card-default-2', 'type': 'card', 'title': 'Article Two', 'text': 'Short description of this article.', 'tag': 'Case Study', 'button': {'label': 'Read more →', 'href': '#', 'backgroundColor': '#4F7CFF', 'textColor': '#fff', 'size': 'sm'}},
            {'id': 'card-default-3', 'type': 'card', 'title': 'Article Three', 'text': 'Short description of this article.', 'tag': 'News', 'button': {'label': 'Read more →', 'href': '#', 'backgroundColor': '#4F7CFF', 'textColor': '#fff', 'size': 'sm'}},
        ],
    },
    'timeline': {
        'backgroundColor': '#ffffff', 'accentColor': '#4F7CFF',
        'title': 'Our Journey', 'align': 'left',
        'items': [
            {'title': 'Founded', 'date': '2021', 'text': 'Started with a vision to change the industry.'},
            {'title': 'First Product', 'date': '2022', 'text': 'Launched our MVP to overwhelming demand.'},
            {'title': 'Series A', 'date': '2023', 'text': 'Raised $10M to accelerate growth.'},
            {'title': 'Today', 'date': '2025', 'text': '10,000+ customers and growing fast.'},
        ],
    },
    'tabs': {
        'backgroundColor': '#ffffff', 'accentColor': '#4F7CFF',
        'tabs': [
            {'label': 'Tab One', 'children': [{'id': 'tab1-text', 'type': 'text', 'content': 'Content for tab one.'}]},
            {'label': 'Tab Two', 'children': [{'id': 'tab2-text', 'type': 'text', 'content': 'Content for tab two.'}]},
        ],
    },
    'contact': {
        'backgroundColor': '#f8fafc', 'accentColor': '#4F7CFF',
        'title': 'Contact Us', 'align': 'center',
        'items': [
            {'icon': '📍', 'label': 'Address', 'value': '123 Main Street, New York, NY 10001'},
            {'icon': '✉️', 'label': 'Email', 'value': 'hello@company.com'},
            {'icon': '📞', 'label': 'Phone', 'value': '+1 (555) 000-0000'},
            {'icon': '🕐', 'label': 'Hours', 'value': 'Mon–Fri, 9am–6pm EST'},
        ],
    },
}


class LayoutSerializer(serializers.Serializer):
    layout = serializers.JSONField()

    def validate_layout(self, value):
        validate_layout(value)
        return value


class ComponentSerializer(serializers.Serializer):
    component = serializers.JSONField()

    def validate_component(self, value):
        validate_component(value)
        return value


class DeleteComponentSerializer(serializers.Serializer):
    component_id = serializers.CharField(max_length=256)


class ReorderSerializer(serializers.Serializer):
    ordered_ids = serializers.ListField(
        child=serializers.CharField(max_length=256),
        min_length=1,
    )


class ComponentDefaultsSerializer(serializers.Serializer):
    """Returneaza props-urile default pentru un tip de componenta."""
    component_type = serializers.CharField(max_length=64)

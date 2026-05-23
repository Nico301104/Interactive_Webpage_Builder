from rest_framework import serializers

# ── Componente de baza ────────────────────────────────────────────────────────
_LAYOUT = {
    'navbar',       # bara de navigare
    'section',      # sectiune generica (suporta children)
    'container',    # flex/grid container (suporta children)
    'columns',      # layout multi-coloana
    'footer',       # footer cu coloane
    'divider',      # linie despartitoare
    'spacer',       # spatiu vertical
    'banner',       # banner anunt/promo
}

_CONTENT = {
    'text',         # paragraf / text simplu
    'heading',      # titlu cu eyebrow si subtitle optional
    'richtext',     # HTML rich text liber
    'blockquote',   # citat stilizat
    'code_block',   # bloc de cod
    'icon',         # icona cu text optional
    'badge',        # eticheta / tag
}

_MEDIA = {
    'image',        # imagine cu link optional
    'video',        # video nativ
    'embed',        # iframe YouTube / Vimeo / Maps
    'gallery',      # grid de imagini
    'logo_strip',   # rand de logo-uri parteneri
}

_INTERACTIVE = {
    'button',       # buton / CTA
    'link',         # link text
    'social_links', # iconite social media
    'form',         # formular contact
    'countdown',    # timer countdown
}

_SECTIONS = {
    'hero',         # hero complet
    'features',     # grid features cu icoane
    'pricing',      # carduri de pricing
    'testimonials', # testimoniale
    'faq',          # accordion FAQ
    'cta',          # call-to-action
    'team',         # grid echipa
    'stats',        # statistici
    'card',         # card generic
    'cards_grid',   # grid de carduri
    'timeline',     # timeline vertical
    'tabs',         # continut cu taburi
    'contact',      # informatii contact
}

VALID_COMPONENT_TYPES = _LAYOUT | _CONTENT | _MEDIA | _INTERACTIVE | _SECTIONS

# Tipuri care pot contine children (validare recursiva)
CHILDREN_TYPES = {
    'section', 'container', 'columns', 'footer',
    'hero', 'cta', 'features', 'cards_grid', 'tabs',
}


def _collect_ids(components: list) -> list:
    """Colecteaza recursiv toate id-urile dintr-un layout."""
    ids = []
    for c in components:
        if not isinstance(c, dict):
            continue
        if 'id' in c:
            ids.append(c['id'])
        for key in ('children', 'items', 'columns'):
            sub = c.get(key)
            if isinstance(sub, list):
                ids.extend(_collect_ids(sub))
    return ids


def validate_component(component: dict, path: str = 'root') -> None:
    if not isinstance(component, dict):
        raise serializers.ValidationError({path: 'Componenta trebuie sa fie un obiect JSON.'})

    for field in ('id', 'type'):
        if field not in component:
            raise serializers.ValidationError({path: f"Campul '{field}' este obligatoriu."})

    if not isinstance(component['id'], str) or not component['id'].strip():
        raise serializers.ValidationError({path: "'id' trebuie sa fie un string nevid."})

    comp_type = component['type']
    if comp_type not in VALID_COMPONENT_TYPES:
        raise serializers.ValidationError(
            {path: f"Tip invalid '{comp_type}'. Permise: {sorted(VALID_COMPONENT_TYPES)}"}
        )

    if comp_type in CHILDREN_TYPES:
        children = component.get('children')
        if children is not None:
            if not isinstance(children, list):
                raise serializers.ValidationError({path: "'children' trebuie sa fie o lista."})
            for i, child in enumerate(children):
                validate_component(child, path=f'{path}.children[{i}]')

    items = component.get('items')
    if items is not None and not isinstance(items, list):
        raise serializers.ValidationError({path: "'items' trebuie sa fie o lista."})



def validate_layout(layout: dict) -> None:
    if not isinstance(layout, dict):
        raise serializers.ValidationError('Layout-ul trebuie sa fie un obiect JSON.')

    components = layout.get('components')
    if components is None:
        raise serializers.ValidationError("Layout-ul trebuie sa contina cheia 'components'.")
    if not isinstance(components, list):
        raise serializers.ValidationError("'components' trebuie sa fie o lista.")

    all_ids = _collect_ids(components)
    if len(all_ids) != len(set(all_ids)):
        raise serializers.ValidationError('ID-urile componentelor trebuie sa fie unice in tot layout-ul.')

    for i, component in enumerate(components):
        validate_component(component, path=f'components[{i}]')

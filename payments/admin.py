from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'amount', 'status', 'card_last4', 'created_at')
    list_filter = ('plan', 'status')
    search_fields = ('user__email', 'reference')
    readonly_fields = ('reference', 'created_at')

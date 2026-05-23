from django.urls import path
from .views import CheckoutView, PaymentHistoryView, SubscriptionStatusView

app_name = 'payments'

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('status/', SubscriptionStatusView.as_view(), name='status'),
    path('history/', PaymentHistoryView.as_view(), name='history'),
]

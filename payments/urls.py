from django.urls import path
from .views import (
    StripeConfigView,
    CreatePaymentIntentView,
    ConfirmCheckoutView,
    PaymentHistoryView,
    SubscriptionStatusView,
)

app_name = 'payments'

urlpatterns = [
    path('config/',         StripeConfigView.as_view(),         name='config'),
    path('create-intent/',  CreatePaymentIntentView.as_view(),  name='create-intent'),
    path('confirm/',        ConfirmCheckoutView.as_view(),      name='confirm'),
    path('status/',         SubscriptionStatusView.as_view(),   name='status'),
    path('history/',        PaymentHistoryView.as_view(),       name='history'),
]

import uuid
from django.conf import settings
from django.db import models


class Payment(models.Model):
    PLAN_CHOICES = [('pro', 'Pro'), ('enterprise', 'Enterprise')]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments',
    )
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reference = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    card_last4 = models.CharField(max_length=4, blank=True, default='')
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True, default=None, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} — {self.plan} — {self.status}'

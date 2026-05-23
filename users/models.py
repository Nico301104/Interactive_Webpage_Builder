from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    User custom cu login pe email.
    Pastreaza username pentru compatibilitate cu AbstractUser.
    """
    PLAN_FREE = 'free'
    PLAN_PRO = 'pro'
    PLAN_ENTERPRISE = 'enterprise'
    PLAN_CHOICES = [
        (PLAN_FREE, 'Free'),
        (PLAN_PRO, 'Pro'),
        (PLAN_ENTERPRISE, 'Enterprise'),
    ]

    email = models.EmailField(unique=True)
    bio = models.TextField(blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default=PLAN_FREE)
    plan_expires_at = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return self.email

    @property
    def is_pro(self):
        from django.utils import timezone
        if self.plan == self.PLAN_FREE:
            return False
        if self.plan_expires_at and self.plan_expires_at < timezone.now():
            return False
        return True

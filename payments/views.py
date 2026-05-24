from datetime import timedelta

import stripe
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Payment
from .serializers import ConfirmSerializer, CreateIntentSerializer, PaymentSerializer

stripe.api_key = settings.STRIPE_SECRET_KEY

User = get_user_model()

PLAN_PRICES_CENTS = {'pro': 999, 'enterprise': 2999}
PLAN_PRICES       = {'pro': '9.99', 'enterprise': '29.99'}
PLAN_LABELS       = {'pro': 'Pro', 'enterprise': 'Enterprise'}
PLAN_DURATION_DAYS = 30


class StripeConfigView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'publishable_key': settings.STRIPE_PUBLISHABLE_KEY})


class CreatePaymentIntentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = CreateIntentSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        plan = ser.validated_data['plan']

        try:
            intent = stripe.PaymentIntent.create(
                amount=PLAN_PRICES_CENTS[plan],
                currency='usd',
                payment_method_types=['card'],
                metadata={
                    'plan': plan,
                    'user_id': str(request.user.id),
                    'user_email': request.user.email,
                },
            )
        except stripe.StripeError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'client_secret': intent.client_secret,
            'plan': plan,
            'amount': PLAN_PRICES[plan],
        })


class ConfirmCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = ConfirmSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        payment_intent_id = ser.validated_data['payment_intent_id']
        plan              = ser.validated_data['plan']

        # Verify with Stripe that the intent actually succeeded
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        except stripe.StripeError as exc:
            return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        if intent.status != 'succeeded':
            return Response(
                {'detail': 'Plata nu a fost confirmată de Stripe.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Idempotency guard — don't activate twice for the same PaymentIntent
        if Payment.objects.filter(stripe_payment_intent_id=payment_intent_id).exists():
            return Response(
                {'detail': 'Această plată a fost deja procesată.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Retrieve card last4 from the payment method
        card_last4 = ''
        if intent.payment_method:
            try:
                pm = stripe.PaymentMethod.retrieve(intent.payment_method)
                card_last4 = pm.card.last4
            except Exception:
                pass

        payment = Payment.objects.create(
            user=request.user,
            plan=plan,
            amount=PLAN_PRICES[plan],
            status='completed',
            card_last4=card_last4,
            stripe_payment_intent_id=payment_intent_id,
        )

        user = request.user
        user.plan = plan
        user.plan_expires_at = timezone.now() + timedelta(days=PLAN_DURATION_DAYS)
        user.save(update_fields=['plan', 'plan_expires_at'])

        _send_confirmation_email(user, payment)

        return Response({
            'payment': PaymentSerializer(payment).data,
            'plan': plan,
            'plan_expires_at': user.plan_expires_at,
            'is_pro': user.is_pro,
        }, status=status.HTTP_201_CREATED)


class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'plan': user.plan,
            'plan_expires_at': user.plan_expires_at,
            'is_pro': user.is_pro,
        })


class PaymentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = Payment.objects.filter(user=request.user)
        return Response(PaymentSerializer(payments, many=True).data)


def _send_confirmation_email(user, payment):
    plan_label = PLAN_LABELS[payment.plan]
    subject    = f'Confirmare plată — IWB {plan_label}'
    expires    = payment.created_at + timedelta(days=PLAN_DURATION_DAYS)

    message = f"""Bună ziua, {user.username}!

Plata ta a fost procesată cu succes. Contul tău a fost actualizat la planul {plan_label}.

━━━━━━━━━━━━━━━━━━━━━━━━━━
  CONFIRMARE PLATĂ
━━━━━━━━━━━━━━━━━━━━━━━━━━
  Plan:         IWB {plan_label}
  Sumă:         ${payment.amount} / lună
  Referință:    {payment.reference}
  Card:         **** **** **** {payment.card_last4}
  Data plății:  {payment.created_at.strftime('%d %B %Y, %H:%M')} UTC
  Valabil până: {expires.strftime('%d %B %Y')}
━━━━━━━━━━━━━━━━━━━━━━━━━━

Poți accesa toate funcționalitățile premium imediat după autentificare.

Cu stimă,
Echipa IWB
"""

    html_message = f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#051424;font-family:Inter,sans-serif;color:#d4e4fa">
<div style="max-width:560px;margin:40px auto;background:#0d1c2d;border:1px solid #1F2A44;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#1a53d6,#4F7CFF);padding:32px 36px">
    <div style="font-size:22px;font-weight:700;color:white">IWB</div>
    <div style="font-size:28px;font-weight:800;color:white;margin-top:12px">Plată confirmată ✅</div>
    <div style="color:rgba(255,255,255,.8);margin-top:6px">Planul tău a fost activat cu succes</div>
  </div>
  <div style="padding:32px 36px">
    <p style="margin:0 0 24px;color:#94A3B8">Bună ziua, <strong style="color:#d4e4fa">{user.username}</strong>!</p>
    <p style="margin:0 0 24px;color:#94A3B8">Îți mulțumim pentru abonare. Contul tău a fost actualizat la planul <strong style="color:#4F7CFF">IWB {plan_label}</strong>.</p>
    <div style="background:#080E1A;border:1px solid #1F2A44;border-radius:8px;padding:20px;margin-bottom:24px">
      <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:#4F7CFF;margin-bottom:16px">Detalii plată</div>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="color:#94A3B8;padding:6px 0;font-size:14px">Plan</td><td style="color:#d4e4fa;font-weight:600;text-align:right;font-size:14px">IWB {plan_label}</td></tr>
        <tr><td style="color:#94A3B8;padding:6px 0;font-size:14px">Sumă</td><td style="color:#d4e4fa;font-weight:600;text-align:right;font-size:14px">${payment.amount} / lună</td></tr>
        <tr><td style="color:#94A3B8;padding:6px 0;font-size:14px">Referință</td><td style="color:#d4e4fa;font-weight:600;text-align:right;font-size:13px;font-family:monospace">{str(payment.reference)[:8].upper()}...</td></tr>
        <tr><td style="color:#94A3B8;padding:6px 0;font-size:14px">Card</td><td style="color:#d4e4fa;font-weight:600;text-align:right;font-size:14px">•••• {payment.card_last4}</td></tr>
        <tr><td style="color:#94A3B8;padding:6px 0;font-size:14px">Data plății</td><td style="color:#d4e4fa;font-weight:600;text-align:right;font-size:14px">{payment.created_at.strftime('%d %b %Y')}</td></tr>
        <tr style="border-top:1px solid #1F2A44"><td style="color:#94A3B8;padding:12px 0 6px;font-size:14px">Valabil până</td><td style="color:#4ade80;font-weight:700;text-align:right;font-size:14px;padding-top:12px">{expires.strftime('%d %b %Y')}</td></tr>
      </table>
    </div>
    <div style="text-align:center;padding:16px 0">
      <a href="http://localhost:8000/#/dashboard" style="display:inline-block;background:#4F7CFF;color:white;padding:12px 32px;border-radius:6px;font-weight:600;text-decoration:none;font-size:15px">Accesează Dashboard →</a>
    </div>
  </div>
  <div style="padding:20px 36px;border-top:1px solid #1F2A44;text-align:center;color:#4F6080;font-size:12px">
    IWB · Acest email a fost trimis automat, te rugăm nu răspunde.
  </div>
</div>
</body>
</html>
"""

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=None,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=True,
        )
    except Exception:
        pass

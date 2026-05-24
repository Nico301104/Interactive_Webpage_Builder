from rest_framework import serializers
from .models import Payment


class CreateIntentSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(choices=['pro', 'enterprise'])


class ConfirmSerializer(serializers.Serializer):
    payment_intent_id = serializers.CharField(max_length=255)
    plan = serializers.ChoiceField(choices=['pro', 'enterprise'])


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('id', 'plan', 'amount', 'status', 'reference', 'card_last4', 'created_at')

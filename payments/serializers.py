import re
from rest_framework import serializers
from .models import Payment


class CheckoutSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(choices=['pro', 'enterprise'])
    card_number = serializers.CharField(min_length=13, max_length=19)
    card_expiry = serializers.CharField(max_length=5)
    card_cvv = serializers.CharField(min_length=3, max_length=4)
    card_name = serializers.CharField(max_length=100)

    def validate_card_number(self, value):
        digits = value.replace(' ', '').replace('-', '')
        if not digits.isdigit() or len(digits) < 13:
            raise serializers.ValidationError('Numărul cardului este invalid.')
        return digits

    def validate_card_expiry(self, value):
        if not re.match(r'^\d{2}/\d{2}$', value):
            raise serializers.ValidationError('Format invalid. Folosiți MM/YY.')
        month, year = value.split('/')
        if not (1 <= int(month) <= 12):
            raise serializers.ValidationError('Luna este invalidă.')
        return value

    def validate_card_cvv(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('CVV-ul trebuie să conțină doar cifre.')
        return value


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('id', 'plan', 'amount', 'status', 'reference', 'card_last4', 'created_at')

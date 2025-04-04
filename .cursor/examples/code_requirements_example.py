"""
Example implementation demonstrating proper alignment with requirements
for business logic and data models
"""

from django.db import models
from django.conf import settings
import decimal

# Data model aligned with requirements
# @requirement 3_Technical_Requirements.md:Database_Design:Schemas
# @requirement 2_Product_Requirements.md:Data_Models:Invoice
class Invoice(models.Model):
    """
    Invoice data model as specified in requirements:
    
    - 3_Technical_Requirements.md (Database Design section)
    - 2_Product_Requirements.md (Data Models section)
    """
    
    # Field definitions aligned with data model requirements
    # @requirement 2_Product_Requirements.md:Data_Models:Invoice:Fields
    invoice_number = models.CharField(
        max_length=20,  # @requirement 2_Product_Requirements.md:Data_Models:Invoice:FieldConstraints
        unique=True,    # @requirement 2_Product_Requirements.md:Data_Models:Invoice:Uniqueness
        db_index=True   # @requirement 3_Technical_Requirements.md:Database_Design:Indexing
    )
    
    # Relationship follows entity relationship diagram in requirements
    # @requirement 3_Technical_Requirements.md:Database_Design:Relationships
    customer = models.ForeignKey(
        'Customer',
        on_delete=models.PROTECT,  # @requirement 7_Security_Requirements.md:Data_Protection:Deletion
        related_name='invoices'
    )
    
    issue_date = models.DateField()
    due_date = models.DateField()
    
    # Status choices as specified in requirements
    # @requirement 2_Product_Requirements.md:Data_Models:Invoice:StatusValues
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )
    
    # Decimal fields with required precision from requirements
    # @requirement 2_Product_Requirements.md:Data_Models:Invoice:CurrencyPrecision
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Audit fields required by security requirements
    # @requirement 7_Security_Requirements.md:Audit_Logging:Model_Changes
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='created_invoices'
    )
    
    # Metadata as specified in requirements
    # @requirement 3_Technical_Requirements.md:Database_Design:Metadata
    class Meta:
        ordering = ['-issue_date']
        indexes = [
            models.Index(fields=['status', 'due_date']),  # @requirement 3_Technical_Requirements.md:Database_Design:Indexing:Performance
        ]
        
    def __str__(self):
        return f"Invoice {self.invoice_number}"


# Business logic implementation aligned with requirements
# @requirement 2_Product_Requirements.md:Invoicing:Calculation
# @requirement 8_Performance_Requirements.md:Calculation_Performance
class InvoiceCalculator:
    """
    Implements invoice calculation logic as specified in requirements:
    
    - 2_Product_Requirements.md (Invoicing section)
    - 8_Performance_Requirements.md (Calculation Performance section)
    """
    
    # Tax calculation implementation as specified in business requirements
    # @requirement 2_Product_Requirements.md:Invoicing:TaxCalculation
    @staticmethod
    def calculate_tax(subtotal, tax_rate):
        """
        Calculate tax amount based on subtotal and tax rate
        
        Tax calculation formula from requirements:
        tax_amount = subtotal * (tax_rate / 100)
        
        Requirements specify rounding to 2 decimal places.
        """
        # Convert to Decimal for precise calculation as required
        # @requirement 2_Product_Requirements.md:Invoicing:PrecisionRequirements
        if not isinstance(subtotal, decimal.Decimal):
            subtotal = decimal.Decimal(str(subtotal))
        
        if not isinstance(tax_rate, decimal.Decimal):
            tax_rate = decimal.Decimal(str(tax_rate))
        
        # Calculate using the exact formula specified in requirements
        # @requirement 2_Product_Requirements.md:Invoicing:Formulas:Tax
        tax_amount = subtotal * (tax_rate / decimal.Decimal('100'))
        
        # Round to 2 decimal places as specified in requirements
        # @requirement 2_Product_Requirements.md:Invoicing:Rounding
        return tax_amount.quantize(decimal.Decimal('0.01'), rounding=decimal.ROUND_HALF_UP)
    
    # Invoice total calculation as specified in requirements
    # @requirement 2_Product_Requirements.md:Invoicing:TotalCalculation
    @staticmethod
    def calculate_invoice_total(line_items, tax_rate):
        """
        Calculate invoice total based on line items and tax rate
        
        Implements the exact algorithm from requirements:
        1. Sum all line item totals for subtotal
        2. Calculate tax on the subtotal
        3. Add subtotal and tax for final total
        
        @requirement 2_Product_Requirements.md:Invoicing:Calculation:Steps
        """
        # Calculate subtotal by summing line items as specified in requirements
        # @requirement 2_Product_Requirements.md:Invoicing:Formulas:Subtotal
        subtotal = decimal.Decimal('0.00')
        for item in line_items:
            # Line item total calculation from requirements
            # @requirement 2_Product_Requirements.md:Invoicing:Formulas:LineItem
            item_total = item['quantity'] * item['unit_price']
            subtotal += item_total
        
        # Calculate tax using the approved algorithm
        # @requirement 2_Product_Requirements.md:Invoicing:TaxCalculation
        tax_amount = InvoiceCalculator.calculate_tax(subtotal, tax_rate)
        
        # Calculate total as specified in requirements
        # @requirement 2_Product_Requirements.md:Invoicing:Formulas:Total
        total = subtotal + tax_amount
        
        # Return all values with the structure specified in requirements
        # @requirement 2_Product_Requirements.md:Invoicing:ReturnFormat
        return {
            'subtotal': subtotal,
            'tax_amount': tax_amount,
            'total': total
        }
    
    # Status update logic as specified in requirements
    # @requirement 2_Product_Requirements.md:Invoicing:StatusUpdates
    @staticmethod
    def update_invoice_status(invoice, payment_amount=None):
        """
        Update invoice status based on business rules specified in requirements
        
        Status transition rules:
        - DRAFT -> SENT: When invoice is sent to customer
        - SENT -> PAID: When full payment is received
        - SENT -> OVERDUE: When due date passes without payment
        - Any status -> CANCELLED: When invoice is cancelled
        
        @requirement 2_Product_Requirements.md:Invoicing:StatusRules
        """
        today = invoice.due_date.__class__.today()
        
        # Implement the exact status transition logic from requirements
        # @requirement 2_Product_Requirements.md:Invoicing:StatusTransitions
        
        # Paid status check - exact rule from requirements
        # @requirement 2_Product_Requirements.md:Invoicing:StatusRules:Paid
        if payment_amount and payment_amount >= invoice.total_amount:
            return 'PAID'
        
        # Overdue status check - exact rule from requirements
        # @requirement 2_Product_Requirements.md:Invoicing:StatusRules:Overdue
        if invoice.status == 'SENT' and today > invoice.due_date:
            return 'OVERDUE'
        
        # No change needed
        return invoice.status 
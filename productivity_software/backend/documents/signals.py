"""
Signal handlers for the documents app.
"""
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from django.conf import settings

from .models import Document, DocumentVersion

# Cache key format for documents
DOCUMENT_CACHE_KEY = 'document_{id}'
DOCUMENT_LIST_CACHE_KEY = 'document_list_user_{user_id}_page_{page}'


@receiver(post_save, sender=Document)
def invalidate_document_cache(sender, instance, **kwargs):
    """
    Invalidate cache when a document is saved.
    @requirement 8_Performance_Requirements.md:Caching
    """
    # Invalidate document detail cache
    cache_key = DOCUMENT_CACHE_KEY.format(id=instance._id)
    cache.delete(cache_key)
    
    # Invalidate user's document list cache
    user_docs_key = DOCUMENT_LIST_CACHE_KEY.format(user_id=instance.owner.id, page='*')
    cache.delete_pattern(user_docs_key)


@receiver(post_delete, sender=Document)
def invalidate_document_cache_on_delete(sender, instance, **kwargs):
    """
    Invalidate cache when a document is deleted.
    @requirement 8_Performance_Requirements.md:Caching
    """
    # Invalidate document detail cache
    cache_key = DOCUMENT_CACHE_KEY.format(id=instance._id)
    cache.delete(cache_key)
    
    # Invalidate user's document list cache
    user_docs_key = DOCUMENT_LIST_CACHE_KEY.format(user_id=instance.owner.id, page='*')
    cache.delete_pattern(user_docs_key)


@receiver(post_save, sender=DocumentVersion)
def invalidate_document_version_cache(sender, instance, **kwargs):
    """
    Invalidate document cache when a new version is created.
    @requirement 8_Performance_Requirements.md:Caching
    """
    # Invalidate document detail cache since the version has changed
    cache_key = DOCUMENT_CACHE_KEY.format(id=instance.document_id)
    cache.delete(cache_key) 
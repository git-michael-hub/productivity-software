"""
Services for document operations including Elasticsearch search.
"""
from elasticsearch_dsl import Q
from django.core.cache import cache

from .models import Document, DocumentIndex


class DocumentSearchService:
    """
    Service for searching documents using Elasticsearch.
    @requirement 18_Advanced_Technology_Requirements.md:AI_Machine_Learning:Search
    @requirement 8_Performance_Requirements.md:Search_Optimization
    """
    
    @staticmethod
    def search(query, user, filters=None, page=1, page_size=20):
        """
        Search documents using Elasticsearch.
        
        Args:
            query (str): The search query
            user (User): The user performing the search
            filters (dict): Optional filters to apply
            page (int): Page number
            page_size (int): Results per page
            
        Returns:
            dict: Search results with pagination info
        """
        # Generate cache key based on search parameters
        cache_key = f"search_{query}_{user.id}_{page}_{page_size}_{filters}"
        cached_results = cache.get(cache_key)
        
        if cached_results:
            return cached_results
            
        # Start with a base search
        search = DocumentIndex.search()
        
        # Add text query if provided
        if query:
            # Multi-match query for searching across multiple fields with boosting
            search = search.query(
                Q('bool',
                  should=[
                      Q('multi_match',
                        query=query,
                        fields=['title^3', 'content', 'tags^2'],
                        fuzziness='AUTO'),
                      Q('match_phrase',
                        title={
                            'query': query,
                            'boost': 4
                        })
                  ]
                )
            )
        
        # Add permission filters - only return documents the user has access to
        # Either the user owns the document or has explicit permission
        search = search.filter(
            Q('bool',
              should=[
                  Q('term', owner__id=user.id),
                  Q('term', shared_with=user.id)
              ]
            )
        )
        
        # Add status filters if provided
        if filters and 'status' in filters:
            search = search.filter('term', status=filters['status'])
            
        # Add tag filters if provided
        if filters and 'tags' in filters:
            for tag in filters['tags']:
                search = search.filter('term', tags=tag)
                
        # Add date range filters if provided
        if filters and 'date_from' in filters and 'date_to' in filters:
            search = search.filter(
                'range',
                created_at={
                    'gte': filters['date_from'],
                    'lte': filters['date_to']
                }
            )
            
        # Calculate pagination
        start = (page - 1) * page_size
        
        # Execute search with pagination
        response = search[start:start+page_size].execute()
        
        # Format results
        results = {
            'total': response.hits.total.value,
            'page': page,
            'page_size': page_size,
            'pages': (response.hits.total.value + page_size - 1) // page_size,
            'results': [
                {
                    'id': hit.meta.id,
                    'title': hit.title,
                    'snippet': hit.content[:200] + '...' if len(hit.content) > 200 else hit.content,
                    'owner': hit.owner.username if hasattr(hit, 'owner') else None,
                    'created_at': hit.created_at,
                    'updated_at': hit.updated_at,
                    'tags': hit.tags,
                    'status': hit.status,
                    'version': hit.version,
                    'score': hit.meta.score
                }
                for hit in response
            ]
        }
        
        # Cache results for 10 minutes
        cache.set(cache_key, results, 60 * 10)
        
        return results 
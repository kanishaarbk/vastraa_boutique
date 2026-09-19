from rest_framework import viewsets, filters, permissions
from django.db.models import Q
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Allow safe methods (GET, HEAD, OPTIONS) to anyone,
    require staff/admin for write operations (POST, PUT, PATCH, DELETE).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'id'


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related('category')
        
        # Category filter by id or slug
        category_param = self.request.query_params.get('category', None)
        if category_param:
            if category_param.isdigit():
                queryset = queryset.filter(category_id=int(category_param))
            else:
                queryset = queryset.filter(category__slug=category_param)

        # Search filter (name or description)
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(category__name__icontains=search_query)
            )

        # Featured filter
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            if featured.lower() in ('true', '1'):
                queryset = queryset.filter(is_featured=True)

        # Ordering
        ordering = self.request.query_params.get('ordering', None)
        if ordering in ['price', '-price', 'name', '-name', 'created_at', '-created_at']:
            queryset = queryset.order_by(ordering)

        return queryset

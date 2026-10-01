from django.urls import path
from .views import OrderListCreateView, OrderDetailView, MyOrdersView

urlpatterns = [
    path('', OrderListCreateView.as_view(), name='order-list-create'),
    path('my-orders/', MyOrdersView.as_view(), name='my-orders'),
    path('<str:lookup>/', OrderDetailView.as_view(), name='order-detail'),
]

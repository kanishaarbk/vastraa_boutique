from django.urls import path
from .auth_views import (
    CustomerRegisterView,
    CustomerLoginView,
    CustomerLogoutView,
    CurrentUserView,
    ForgotPasswordView,
    VerifyOTPView,
    ResetPasswordView,
)

urlpatterns = [
    path('register/', CustomerRegisterView.as_view(), name='auth-register'),
    path('login/', CustomerLoginView.as_view(), name='auth-login'),
    path('logout/', CustomerLogoutView.as_view(), name='auth-logout'),
    path('me/', CurrentUserView.as_view(), name='auth-me'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth-forgot-password'),
    path('verify-otp/', VerifyOTPView.as_view(), name='auth-verify-otp'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth-reset-password'),
]

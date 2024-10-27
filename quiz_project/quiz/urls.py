from django.urls import path
from . import views

urlpatterns = [
    path("api/login/", views.login_user, name="login_user"),
    path("api/logout/", views.logout_user, name="logout_user"),
    path("api/check-login/", views.check_login_status, name="check_login_status"),
    path("api/csrf/", views.get_csrf_token, name="csrf_token"),
    path("api/quiz-data/", views.get_quiz_data, name="quiz_data"),
    path("api/total-score/", views.get_total_score, name="total_score"),
    path(
        "api/update-total-score/", views.update_total_score, name="update_total_score"
    ),
    path("api/gift-points/", views.gift_points, name="gift_points"),
    path("api/users/", views.get_users, name="get_users"),
    path(
        "api/check-admin/", views.check_admin_status, name="check_admin"
    ),  # New endpoint
    path("", views.serve_react_app, name="quiz_home"),
]

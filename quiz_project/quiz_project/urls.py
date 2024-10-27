import os
from django.contrib import admin
from django.urls import path, include, re_path
from django.contrib.auth.views import LoginView
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from quiz import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path(
        "accounts/login/", LoginView.as_view(template_name="login.html"), name="login"
    ),
    path("quiz/", include("quiz.urls")),
    # Serve manifest.json, favicon.ico, and other assets
    re_path(
        r"^(manifest\.json|favicon\.ico|logo.*\.png)$",
        serve,
        {
            "document_root": os.path.join(settings.BASE_DIR, "frontend", "build"),
        },
    ),
    # Catch-all for React routes, serving index.html from the build
    re_path(r"^(?!static/|api/).*", views.serve_react_app, name="react_app"),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.STATIC_URL,
        document_root=os.path.join(settings.BASE_DIR, "frontend", "build", "static"),
    )
    urlpatterns += static(
        "/", document_root=os.path.join(settings.BASE_DIR, "frontend", "build")
    )

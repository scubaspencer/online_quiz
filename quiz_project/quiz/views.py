# quiz/views.py
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.contrib.auth.decorators import login_required
from .models import Question, Profile
import os
from django.conf import settings
import json
import logging
from django.views.decorators.http import require_POST

logger = logging.getLogger(__name__)


@csrf_exempt
@ensure_csrf_cookie
def login_user(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({"message": "Login successful"}, status=200)
            else:
                return JsonResponse({"error": "Invalid credentials"}, status=401)
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)


@csrf_exempt
def logout_user(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({"message": "Logout successful"}, status=200)

    return JsonResponse({"error": "Invalid request method"}, status=405)


def check_login_status(request):
    if request.user.is_authenticated:
        return JsonResponse(
            {"isLoggedIn": True, "username": request.user.username}, status=200
        )
    else:
        return JsonResponse({"isLoggedIn": False}, status=200)


@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({"message": "CSRF cookie set"}, status=200)


@login_required
def get_quiz_data(request):
    try:
        questions = Question.objects.all()
        questions_data = [
            {
                "id": question.id,
                "text": question.text,
                "answers": [
                    {
                        "id": answer.id,
                        "text": answer.text,
                        "is_correct": answer.is_correct,
                    }
                    for answer in question.answers.all()
                ],
            }
            for question in questions
        ]
        return JsonResponse({"questions": questions_data})
    except Exception as e:
        logger.error(f"Error fetching quiz data: {e}")
        return JsonResponse(
            {"error": "An error occurred while fetching quiz data."}, status=500
        )


def serve_react_app(request):
    index_path = os.path.join(settings.BASE_DIR, "frontend", "build", "index.html")
    try:
        with open(index_path, "r") as file:
            return HttpResponse(file.read(), content_type="text/html")
    except FileNotFoundError:
        return HttpResponse(
            "React app not found. Please build the React app.", status=404
        )


@login_required
def get_total_score(request):
    profile, created = Profile.objects.get_or_create(user=request.user)
    return JsonResponse({"total_score": profile.total_score})


@login_required
@csrf_exempt
def update_total_score(request):
    try:
        data = json.loads(request.body)
        quiz_score = data.get("quiz_score", 0)

        profile, created = Profile.objects.get_or_create(user=request.user)
        profile.total_score += quiz_score
        profile.save()

        return JsonResponse({"total_score": profile.total_score})
    except Exception as e:
        logger.error(f"Error updating total score: {e}")
        return JsonResponse({"error": "Failed to update total score"}, status=500)


@login_required
@require_POST
@csrf_exempt
def gift_points(request):
    try:
        data = json.loads(request.body)
        recipient_username = data.get("recipient")
        points = data.get("points", 0)

        if points <= 0:
            return JsonResponse({"error": "Points must be greater than 0"}, status=400)

        sender_profile = Profile.objects.get(user=request.user)

        if sender_profile.total_score < points:
            return JsonResponse({"error": "Not enough points to gift"}, status=400)

        try:
            recipient_user = User.objects.get(username=recipient_username)
            recipient_profile, created = Profile.objects.get_or_create(
                user=recipient_user
            )
        except User.DoesNotExist:
            return JsonResponse({"error": "Recipient not found"}, status=404)

        sender_profile.total_score -= points
        recipient_profile.total_score += points
        sender_profile.save()
        recipient_profile.save()

        return JsonResponse(
            {
                "message": "Points gifted successfully",
                "total_score": sender_profile.total_score,
            }
        )

    except Exception as e:
        logger.error(f"Error gifting points: {e}")
        return JsonResponse({"error": "Failed to gift points"}, status=500)


@login_required
def get_users(request):
    users = User.objects.exclude(id=request.user.id).values_list("username", flat=True)
    return JsonResponse({"users": list(users)})


@login_required
def check_admin_status(request):
    return JsonResponse(
        {"is_admin": request.user.is_staff or request.user.is_superuser}
    )

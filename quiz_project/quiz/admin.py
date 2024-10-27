# quiz/admin.py
from django.contrib import admin
from .models import Question, Answer


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("text", "created_at")


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ("text", "is_correct", "question")

from django.http import JsonResponse


def health_check(request):
    return JsonResponse({
        "status": "success",
        "application": "InMoshPit API",
        "message": "Backend is running!"
    })
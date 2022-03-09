from django.shortcuts import render


def list_task(request):
    return render(request, 'frontend/list-task.html')

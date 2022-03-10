from rest_framework.decorators import api_view
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response

from .models import Task
from .serializers import TaskHistorySerializer, TaskSerializer


def create_task_history(db_task, deleted=False):
    task = {
        'title': db_task.title,
        'completed': db_task.completed,
        'deleted': deleted,
        'task': db_task.pk,
    }

    serializer = TaskHistorySerializer(data=task)
    if serializer.is_valid():
        serializer.save()


@api_view(['GET'])
def api_overview(request):
    api_urls = {
        'List': '/task-list/',
        'Detail': '/task-detail/<str:pk>/',
        'Create': '/task-create/',
        'Update': '/task-update/<str:pk>',
        'Delete': '/task-delete/<str:pk>',
    }
    return Response(api_urls)


@api_view(['GET'])
def task_list(request):
    tasks = Task.objects.all()
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def task_detail(request, pk):
    task = get_object_or_404(Task, id=pk)
    serializer = TaskSerializer(task, many=False)
    return Response(serializer.data)


@api_view(['POST'])
def task_create(request):
    serializer = TaskSerializer(data=request.data)

    if serializer.is_valid():
        db_task = serializer.save()
        create_task_history(db_task)

    return Response(serializer.data)


@api_view(['PUT'])
def task_update(request, pk):
    task = get_object_or_404(Task, id=pk)
    serializer = TaskSerializer(instance=task, data=request.data)

    if serializer.is_valid():
        db_task = serializer.save()
        create_task_history(db_task)

    return Response(serializer.data)


@api_view(['DELETE'])
def task_delete(request, pk):
    db_task = get_object_or_404(Task, id=pk)
    create_task_history(db_task, deleted=True)
    db_task.delete()

    return Response('Item successfully deleted!')

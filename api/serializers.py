from rest_framework import serializers

from .models import Task, TaskHistory


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'


class TaskHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskHistory
        fields = ('title', 'completed', 'deleted', 'task', 'client_ip')

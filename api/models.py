from django.db import models


class BaseModel(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Task(BaseModel):
    title = models.CharField(max_length=200)
    completed = models.BooleanField(default=False, blank=True, null=True)
    client_ip = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        ordering = ['completed', '-created']

    def __str__(self):
        return self.title


class TaskHistory(BaseModel):
    title = models.CharField(max_length=200, blank=True, null=True)
    completed = models.BooleanField(default=False, blank=True, null=True)
    deleted = models.BooleanField(default=False, blank=True, null=True)
    client_ip = models.CharField(max_length=255, blank=True, null=True)
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, related_name='tasks', blank=True, null=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return self.title

# Django Class-Based Views Guide

This document provides detailed guidance on implementing and using Django Class-Based Views (CBVs) in our productivity software.

## Core Concepts

### Class-Based Views vs Function-Based Views

Class-Based Views offer several advantages over Function-Based Views:

- **Code Reusability**: Inheritance allows sharing code across multiple views
- **DRY Principle**: Common patterns are abstracted into base classes
- **Separation of Concerns**: HTTP methods are separated into different methods
- **Extension Points**: Pre-defined methods for customizing behavior
- **Organized Structure**: Consistent organization of view logic

### View Hierarchy

Django provides a hierarchy of views that build upon each other:

1. **Base View**: `django.views.generic.View`
2. **Template Views**: `TemplateView`, `ListView`, `DetailView` 
3. **Editing Views**: `FormView`, `CreateView`, `UpdateView`, `DeleteView`
4. **Date Views**: `ArchiveIndexView`, `YearArchiveView`, etc.

## Implementation Guidelines

### Base Structure

All Class-Based Views should follow this structure:

```python
from django.views.generic import View

class MyView(View):
    # Class attributes
    template_name = 'my_template.html'
    model = MyModel
    
    # Setup methods
    def setup(self, request, *args, **kwargs):
        super().setup(request, *args, **kwargs)
        # Additional setup
    
    def dispatch(self, request, *args, **kwargs):
        # Custom dispatch logic if needed
        return super().dispatch(request, *args, **kwargs)
    
    # HTTP methods
    def get(self, request, *args, **kwargs):
        # Handle GET requests
        return self.render_to_response(self.get_context_data())
    
    def post(self, request, *args, **kwargs):
        # Handle POST requests
        pass
    
    # Helper methods
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add additional context
        return context
```

### Using Generic Views

Leverage Django's built-in generic views whenever possible:

```python
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView

class ItemListView(ListView):
    model = Item
    template_name = 'item_list.html'
    context_object_name = 'items'
    paginate_by = 10
    
    def get_queryset(self):
        qs = super().get_queryset()
        # Apply filters, etc.
        return qs

class ItemDetailView(DetailView):
    model = Item
    template_name = 'item_detail.html'
    context_object_name = 'item'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add related data
        return context
```

### Custom Mixins

Create reusable mixins for cross-cutting concerns:

```python
class StaffRequiredMixin:
    """Verify that the current user is staff."""
    
    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)
    
    def handle_no_permission(self):
        # Custom handling
        raise PermissionDenied

class AuditLogMixin:
    """Log user actions to audit log."""
    
    def form_valid(self, form):
        response = super().form_valid(form)
        # Log the action
        AuditLog.objects.create(
            user=self.request.user,
            action=f"{self.__class__.__name__}",
            object_id=self.object.pk
        )
        return response
```

## Django REST Framework Integration

### APIView

Use `APIView` for custom API endpoints:

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class UserStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, format=None):
        user = request.user
        stats = calculate_user_stats(user)
        return Response(stats, status=status.HTTP_200_OK)
```

### Generic API Views

Use generic API views for standard operations:

```python
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

class TaskListCreateView(ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TaskDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsOwner]
```

### ViewSets

Use ViewSets for resource-centric APIs:

```python
from rest_framework import viewsets

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Project.objects.filter(
            members=self.request.user
        ).prefetch_related('tasks', 'members')
    
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        project = self.get_object()
        project.is_archived = True
        project.save()
        return Response({'status': 'project archived'})
```

## Best Practices

### View Organization

1. **Group by Resource**: Organize views by the resource they manage
2. **Layer Appropriately**: Use inheritance to layer functionality

```python
# Base abstract view with common functionality
class BaseProjectView(LoginRequiredMixin):
    model = Project
    
    def get_queryset(self):
        return Project.objects.filter(members=self.request.user)

# Concrete views extend the base
class ProjectListView(BaseProjectView, ListView):
    template_name = 'projects/list.html'
    context_object_name = 'projects'

class ProjectDetailView(BaseProjectView, DetailView):
    template_name = 'projects/detail.html'
    context_object_name = 'project'
```

### Method Overriding

When overriding methods, always call the parent implementation:

```python
def get_context_data(self, **kwargs):
    context = super().get_context_data(**kwargs)
    context['additional_data'] = self.get_additional_data()
    return context
```

### URL Configuration

Configure URLs to match view functionality:

```python
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

# For Class-Based Views
urlpatterns = [
    path('projects/', views.ProjectListView.as_view(), name='project-list'),
    path('projects/<int:pk>/', views.ProjectDetailView.as_view(), name='project-detail'),
    path('projects/create/', views.ProjectCreateView.as_view(), name='project-create'),
    path('projects/<int:pk>/update/', views.ProjectUpdateView.as_view(), name='project-update'),
    path('projects/<int:pk>/delete/', views.ProjectDeleteView.as_view(), name='project-delete'),
]

# For DRF ViewSets
router = DefaultRouter()
router.register(r'api/projects', views.ProjectViewSet, basename='api-project')
router.register(r'api/tasks', views.TaskViewSet, basename='api-task')

urlpatterns += [
    path('', include(router.urls)),
]
```

## Testing Class-Based Views

### Unit Testing

Use `RequestFactory` for unit testing:

```python
from django.test import RequestFactory, TestCase
from django.contrib.auth.models import User
from .views import ProjectDetailView

class ProjectDetailViewTest(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(username='testuser', password='password')
        self.project = Project.objects.create(name='Test Project', owner=self.user)
    
    def test_detail_view_shows_project(self):
        request = self.factory.get(f'/projects/{self.project.pk}/')
        request.user = self.user
        
        response = ProjectDetailView.as_view()(request, pk=self.project.pk)
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.context_data['project'], self.project)
```

### Integration Testing

Use Django's test client for integration testing:

```python
from django.test import TestCase
from django.urls import reverse

class ProjectViewsIntegrationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.project = Project.objects.create(name='Test Project', owner=self.user)
        
    def test_project_list_view(self):
        self.client.login(username='testuser', password='password')
        response = self.client.get(reverse('project-list'))
        
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Test Project')
        self.assertTemplateUsed(response, 'projects/list.html')
```

## Django REST Framework Specific Testing

```python
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse

class ProjectAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.project = Project.objects.create(name='Test Project', owner=self.user)
        
    def test_list_projects(self):
        url = reverse('api-project-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        
    def test_create_project(self):
        url = reverse('api-project-list')
        data = {'name': 'New Project', 'description': 'Test description'}
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Project.objects.count(), 2)
```

## Common Patterns & Solutions

### Form Processing

```python
class ProjectCreateView(LoginRequiredMixin, CreateView):
    model = Project
    form_class = ProjectForm
    template_name = 'projects/create.html'
    success_url = reverse_lazy('project-list')
    
    def form_valid(self, form):
        form.instance.created_by = self.request.user
        return super().form_valid(form)
    
    def form_invalid(self, form):
        # Custom error handling
        return super().form_invalid(form)
```

### Filtering QuerySets

```python
class TaskListView(LoginRequiredMixin, ListView):
    model = Task
    template_name = 'tasks/list.html'
    context_object_name = 'tasks'
    
    def get_queryset(self):
        qs = super().get_queryset()
        
        # Filter by project if specified
        project_id = self.request.GET.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
            
        # Filter by status
        status = self.request.GET.get('status')
        if status:
            qs = qs.filter(status=status)
            
        # Only show user's tasks
        return qs.filter(assigned_to=self.request.user)
```

### Multiple Forms in One View

```python
class ProjectSettingsView(LoginRequiredMixin, UpdateView):
    model = Project
    template_name = 'projects/settings.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.POST:
            context['project_form'] = ProjectForm(self.request.POST, instance=self.object)
            context['notification_form'] = NotificationSettingsForm(self.request.POST, instance=self.object.notification_settings)
        else:
            context['project_form'] = ProjectForm(instance=self.object)
            context['notification_form'] = NotificationSettingsForm(instance=self.object.notification_settings)
        return context
    
    def post(self, request, *args, **kwargs):
        self.object = self.get_object()
        project_form = ProjectForm(request.POST, instance=self.object)
        notification_form = NotificationSettingsForm(request.POST, instance=self.object.notification_settings)
        
        if project_form.is_valid() and notification_form.is_valid():
            return self.form_valid(project_form, notification_form)
        else:
            return self.form_invalid(project_form, notification_form)
    
    def form_valid(self, project_form, notification_form):
        project_form.save()
        notification_form.save()
        return redirect(self.get_success_url())
    
    def form_invalid(self, project_form, notification_form):
        context = self.get_context_data()
        context['project_form'] = project_form
        context['notification_form'] = notification_form
        return self.render_to_response(context)
```

## Additional Resources

- [Django Generic Views Documentation](https://docs.djangoproject.com/en/4.2/ref/class-based-views/)
- [Classy Class-Based Views Reference](https://ccbv.co.uk/)
- [Django REST Framework Views Documentation](https://www.django-rest-framework.org/api-guide/views/)
- [Django REST Framework ViewSets Documentation](https://www.django-rest-framework.org/api-guide/viewsets/) 
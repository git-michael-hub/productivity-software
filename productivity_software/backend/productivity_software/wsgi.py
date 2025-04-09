"""
WSGI config for productivity_software project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'productivity_software.settings')

application = get_wsgi_application() 
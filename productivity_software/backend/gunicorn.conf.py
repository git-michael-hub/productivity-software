# Gunicorn configuration file for production deployment

import multiprocessing

# Bind to 0.0.0.0:8000
bind = "0.0.0.0:8000"

# Define the number of workers based on available cores
# The formula is (2 x number_of_cores) + 1
workers = multiprocessing.cpu_count() * 2 + 1

# Worker class - use asynchronous worker
worker_class = "gevent"

# Maximum requests per worker before restarting
max_requests = 1000
max_requests_jitter = 50

# Timeout (in seconds)
timeout = 30

# Keep the workers alive for this many seconds after handling a request
keepalive = 5

# Access and error log settings
accesslog = "/var/log/gunicorn/access.log"
errorlog = "/var/log/gunicorn/error.log"
loglevel = "info"

# Process naming
proc_name = "productivity_software"

# Enable graceful worker timeout
graceful_timeout = 30

# Preload application code to reduce memory usage
preload_app = True

# Post fork hook for setup
def post_fork(server, worker):
    server.log.info(f"Worker spawned (pid: {worker.pid})")

# When the worker boots hook
def when_ready(server):
    server.log.info("Server is ready. Spawning workers")

# Worker exit hook
def worker_exit(server, worker):
    server.log.info(f"Worker exited (pid: {worker.pid})")

# Server starting hook
def on_starting(server):
    server.log.info("Starting Gunicorn server process") 
'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, ListGroup, Badge } from 'react-bootstrap';
import { Task, TaskStatus, TaskPriority } from '@/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Create project structure',
      description: 'Set up the initial project structure and configuration files',
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator_id: '1',
      due_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    },
    {
      id: '2',
      title: 'Implement authentication',
      description: 'Create login, registration and password reset functionality',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator_id: '1',
      due_date: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    },
    {
      id: '3',
      title: 'Design dashboard UI',
      description: 'Create wireframes and mockups for the dashboard interface',
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator_id: '1',
      due_date: new Date(Date.now() + 259200000).toISOString(), // 3 days from now
    },
  ]);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: TaskPriority.MEDIUM
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: TaskStatus.TODO,
      priority: newTask.priority as TaskPriority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator_id: '1',
      due_date: new Date(Date.now() + 604800000).toISOString(), // 1 week from now
    };
    
    setTasks([...tasks, task]);
    setNewTask({
      title: '',
      description: '',
      priority: TaskPriority.MEDIUM
    });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, updated_at: new Date().toISOString() } 
        : task
    ));
  };

  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO: return 'secondary';
      case TaskStatus.IN_PROGRESS: return 'primary';
      case TaskStatus.DONE: return 'success';
      case TaskStatus.ARCHIVED: return 'dark';
      default: return 'light';
    }
  };

  const getPriorityBadgeVariant = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.LOW: return 'info';
      case TaskPriority.MEDIUM: return 'warning';
      case TaskPriority.HIGH: return 'danger';
      case TaskPriority.URGENT: return 'danger';
      default: return 'light';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <Container>
      <h1 className="mb-4">Tasks</h1>
      
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Add New Task</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleAddTask}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={newTask.title}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Priority</Form.Label>
                      <Form.Select
                        name="priority"
                        value={newTask.priority}
                        onChange={handleInputChange}
                      >
                        <option value={TaskPriority.LOW}>Low</option>
                        <option value={TaskPriority.MEDIUM}>Medium</option>
                        <option value={TaskPriority.HIGH}>High</option>
                        <option value={TaskPriority.URGENT}>Urgent</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={newTask.description}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Button type="submit" variant="primary">Add Task</Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">To Do</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {tasks
                .filter(task => task.status === TaskStatus.TODO)
                .map(task => (
                  <ListGroup.Item key={task.id} className="py-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0 fw-bold">{task.title}</h6>
                      <Badge bg={getPriorityBadgeVariant(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-muted small mb-2">{task.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">Due: {formatDate(task.due_date)}</small>
                      <Button 
                        size="sm" 
                        variant="outline-primary"
                        onClick={() => handleStatusChange(task.id, TaskStatus.IN_PROGRESS)}
                      >
                        Start
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              {tasks.filter(task => task.status === TaskStatus.TODO).length === 0 && (
                <ListGroup.Item className="py-3 text-center text-muted">
                  No tasks to do
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">In Progress</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {tasks
                .filter(task => task.status === TaskStatus.IN_PROGRESS)
                .map(task => (
                  <ListGroup.Item key={task.id} className="py-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0 fw-bold">{task.title}</h6>
                      <Badge bg={getPriorityBadgeVariant(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-muted small mb-2">{task.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">Due: {formatDate(task.due_date)}</small>
                      <Button 
                        size="sm" 
                        variant="outline-success"
                        onClick={() => handleStatusChange(task.id, TaskStatus.DONE)}
                      >
                        Complete
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              {tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length === 0 && (
                <ListGroup.Item className="py-3 text-center text-muted">
                  No tasks in progress
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Done</h5>
            </Card.Header>
            <ListGroup variant="flush">
              {tasks
                .filter(task => task.status === TaskStatus.DONE)
                .map(task => (
                  <ListGroup.Item key={task.id} className="py-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0 fw-bold">{task.title}</h6>
                      <Badge bg={getPriorityBadgeVariant(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    <p className="text-muted small mb-2">{task.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">Completed: {formatDate(task.updated_at)}</small>
                      <Button 
                        size="sm" 
                        variant="outline-secondary"
                        onClick={() => handleStatusChange(task.id, TaskStatus.ARCHIVED)}
                      >
                        Archive
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              {tasks.filter(task => task.status === TaskStatus.DONE).length === 0 && (
                <ListGroup.Item className="py-3 text-center text-muted">
                  No completed tasks
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
} 
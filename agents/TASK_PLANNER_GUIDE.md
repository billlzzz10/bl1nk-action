# 📋 Task Planner Agent Guide

**AI-Powered Task Orchestration with Webhook Support**

---

## 🎯 Overview

Task Planner Agent is an intelligent system for managing code review tasks with:

✅ **Task Management**

- Create, update, complete, mark as error
- Track status (pending, in_progress, completed, failed, blocked)
- Priority levels (low, medium, high, critical)

✅ **Webhook Integration**

- Create tasks from webhooks
- Complete tasks via webhooks
- Mark tasks as failed
- Batch processing

✅ **Markdown Reports**

- Generate task summaries
- Track completion metrics
- Time tracking (estimated vs actual)

✅ **Pattern Matching**

- Glob pattern filtering
- Find tasks by title/description
- Advanced search

---

## 📦 Components

### TaskPlannerAgent (Main class)

```python
agent = TaskPlannerAgent()

# Create task
task = await agent.create_task(
    title="Fix authentication bug",
    description="JWT token validation failing",
    priority="high",
    estimated_hours=2.0
)

# Complete task
await agent.complete_task(task.id, actual_hours=1.5)

# Mark as error
await agent.mark_task_error(task.id, "Database timeout")

# Generate report
markdown = await agent.generate_markdown_report()
```

### TaskStorage

In-memory task persistence

### WebhookHandler

Flask blueprints for webhook endpoints

### TaskCLI

Command-line interface

---

## 🔌 Webhook Events

### task.create

```bash
POST /webhooks/task/create
{
  "title": "Fix bug",
  "description": "Authentication issue",
  "priority": "high",
  "estimated_hours": 2.0,
  "tags": ["bugfix", "security"],
  "due_date": "2024-01-20"
}
```

### task.complete

```bash
POST /webhooks/task/complete
{
  "task_id": "task-123",
  "actual_hours": 1.5
}
```

### task.error

```bash
POST /webhooks/task/error
{
  "task_id": "task-123",
  "error_message": "Deployment failed: port already in use"
}
```

### task.status

```bash
POST /webhooks/task/status
{
  "task_id": "task-123",
  "status": "in_progress"
}
```

### report.generate

```bash
POST /webhooks/report/generate
{
  "plan_id": "plan-456"  # optional
}
```

### batch.process

```bash
POST /webhooks/batch/process
{
  "operation": "create",
  "tasks": [
    {
      "title": "Task 1",
      "description": "...",
      "priority": "high"
    },
    {
      "title": "Task 2",
      "description": "...",
      "priority": "medium"
    }
  ]
}
```

---

## 💻 CLI Usage

### Create Task

```bash
python -m agent.cli create "Fix login bug" "JWT token not validating" --priority high

# Interactive mode
> create "Fix bug" "Description" --priority high
✅ Created task: task-1705430400
   Title: Fix bug
   Priority: high
```

### List Tasks

```bash
# All tasks
python -m agent.cli list

# Filter by status
python -m agent.cli list --status pending

# Filter by pattern
python -m agent.cli list --pattern "fix*"

# Interactive
> list --status in_progress
```

### Complete Task

```bash
python -m agent.cli complete task-123 --hours 2.5

# Interactive
> complete task-123 --hours 2.5
✅ Completed task: task-123
```

### Mark as Error

```bash
python -m agent.cli error task-456 "Database connection failed"

# Interactive
> error task-456 "Connection timeout"
❌ Marked task as failed: task-456
   Error: Connection timeout
```

### Generate Report

```bash
python -m agent.cli report

# With specific plan
python -m agent.cli report --plan plan-789

# Interactive
> report
```

### Chat with Agent

```bash
python -m agent.cli chat "How many tasks are pending?"

# Interactive
> chat "What tasks are high priority?"
```

---

## 📊 Markdown Report Example

```markdown
# Task Report

Generated: 2024-01-15 10:30:45

## Plan: Review: my-repo

Auto-generated from code analysis

### In Progress (2)

- **Fix authentication** [high]
  - Status: in_progress
  - Description: JWT token validation failing
  - Estimated: 2.0h
  - Due: 2024-01-20
  - Tags: bugfix, security

### Pending (5)

- **Add logging** [medium]
  - Status: pending
  - Description: Add debug logging to API
  - Estimated: 1.5h

### Completed (3)

- **Update dependencies** [low]
  - Status: completed
  - Description: Update npm packages
  - Actual: 1.0h

### Failed (1)

- **Deploy to production** [critical]
  - Status: failed
  - Description: Deploy new version
  - Error: Port 8080 already in use

## Summary

- Total Tasks: 11
- Completed: 3
- In Progress: 2
- Pending: 5
- Failed: 1
```

---

## 🔍 Glob Pattern Matching

Search tasks using glob patterns:

```python
# Find all tasks with "fix" in title
tasks = await agent.list_tasks_by_pattern("*fix*")

# Find tasks with specific status
tasks = await agent.list_tasks_by_pattern("*auth*", "pending")

# Pattern examples
"*bug*"          # Tasks with "bug"
"auth*"          # Tasks starting with "auth"
"*fix*security*" # Tasks with both "fix" and "security"
```

---

## 🎯 Task Status Flow

```
                ┌─────────────────────────────────────┐
                │          NEW TASK                   │
                │      (PENDING)                      │
                └──────────┬──────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ Start Work? │
                    └──────┬──────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
      ┌─────▼──────┐           ┌─────────▼────┐
      │IN_PROGRESS │           │   BLOCKED    │
      └─────┬──────┘           └──────────────┘
            │
      ┌─────▼──────┐
      │ Complete?  │
      └─────┬──────┘
            │
    ┌───────┴────────┐
    │                │
┌───▼────┐    ┌──────▼─────┐
│COMPLETED    │   FAILED   │
└────────┘    └────────────┘
```

---

## 📈 Time Tracking

```python
# Create task with estimate
task = await agent.create_task(
    title="Implement feature",
    description="Add user authentication",
    estimated_hours=8.0
)

# Complete with actual time
await agent.complete_task(task.id, actual_hours=6.5)

# Report shows both
# Estimated: 8.0h
# Actual: 6.5h
```

---

## 🔗 Integration with Code Review

```python
# From code analysis
analysis = {
    'review': 'Good code quality...',
    'tasks': [
        {
            'title': 'Add error handling',
            'description': 'Handle edge cases',
            'priority': 'high',
            'effort': '2'
        }
    ]
}

# Create task plan
plan = await agent.plan_from_analysis(analysis, repo_url)

# Tasks auto-tagged with:
# - 'auto-generated'
# - 'code-review'
# - repo URL in metadata
```

---

## 🌐 API Endpoints

### REST API (Flask)

```
POST   /webhooks/task/create         → Create task
POST   /webhooks/task/complete       → Complete task
POST   /webhooks/task/error          → Mark as error
POST   /webhooks/task/status         → Update status
POST   /webhooks/report/generate     → Generate report
POST   /webhooks/batch/process       → Batch processing
GET    /webhooks/health              → Health check
```

---

## 💬 AI Chat Integration

```python
# Chat with agent
response = await agent.chat("Create a task for database migration")
# "I'll help you create that task. What's the estimated effort?"

response = await agent.chat("Mark task-123 as complete")
# "Task completed successfully. Great work!"

response = await agent.chat("Show me high priority tasks")
# "You have 3 high priority tasks..."
```

---

## 📋 Task Data Model

```python
@dataclass
class Task:
    id: str                    # Unique ID
    title: str                 # Task title
    description: str           # Full description
    status: TaskStatus         # pending/in_progress/completed/failed
    priority: TaskPriority     # low/medium/high/critical
    created_at: str            # ISO timestamp
    updated_at: str            # ISO timestamp
    due_date: str | None       # Optional due date
    assigned_to: str | None    # Optional assignee
    tags: list[str]            # Task tags
    subtasks: list[Task]       # Nested subtasks
    error_message: str | None  # Error if failed
    completion_time: str | None # When completed
    dependencies: list[str]    # Task dependencies
    estimated_hours: float     # Estimated effort
    actual_hours: float        # Actual hours spent
    metadata: dict             # Custom metadata
```

---

## 🔐 Security

- Webhook signature verification (implement in production)
- Task ownership validation
- Error message sanitization
- Rate limiting (implement in production)

---

## 📊 Example Workflow

```bash
# 1. Create tasks from code analysis
POST /webhooks/task/create
{
  "title": "Add authentication",
  "priority": "high",
  "estimated_hours": 8
}

# 2. Start working
POST /webhooks/task/status
{
  "task_id": "task-123",
  "status": "in_progress"
}

# 3. Hit an error
POST /webhooks/task/error
{
  "task_id": "task-123",
  "error_message": "Permission denied on database"
}

# 4. Fix and complete
POST /webhooks/task/complete
{
  "task_id": "task-123",
  "actual_hours": 6.5
}

# 5. Generate report
POST /webhooks/report/generate
{
  "plan_id": "plan-456"
}
```

---

## 🎓 Advanced Usage

### Batch Import

```python
tasks_data = [
    {
        'title': 'Task 1',
        'description': '...',
        'priority': 'high'
    },
    {
        'title': 'Task 2',
        'description': '...',
        'priority': 'medium'
    }
]

for task_data in tasks_data:
    await agent.create_task(**task_data)
```

### Task Dependencies

```python
task1 = await agent.create_task(
    title="Build backend API",
    description="Create REST endpoints"
)

task2 = await agent.create_task(
    title="Build frontend UI",
    description="Create React components",
    dependencies=[task1.id]
)
```

### Custom Metadata

```python
task = await agent.create_task(
    title="Deploy to production",
    description="Deploy new version",
    metadata={
        'environment': 'prod',
        'version': '1.2.3',
        'branch': 'main'
    }
)
```

---

## 📞 Support

- See agent/planner/ for implementation
- See agent/webhooks/ for webhook handlers
- See agent/cli.py for CLI interface
- See TASK_PLANNER_GUIDE.md (this file)

---

**Ready to manage tasks!** 🚀
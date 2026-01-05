# 📚 Mermaid Diagram Templates Library

Ready-to-use templates for common agent scenarios.

## 🔄 Process Workflows

### Code Review Workflow

```mermaid
graph TD
    A[Pull Request Created] --> B[Webhook Triggered]
    B --> C[Extract Code]
    C --> D[Claude Analysis]
    D --> E{Issues Found?}
    E -->|Yes| F[Categorize Issues]
    E -->|No| G[Approval]
    F --> H{Issue Type}
    H -->|Bug| I[High Priority]
    H -->|Style| J[Low Priority]
    H -->|Security| K[Critical]
    I --> L[Create Issues]
    J --> L
    K --> L
    G --> L
    L --> M[Post Comment]
    M --> N[Complete Review]
    
    style A fill:#E8F5E9
    style N fill:#FFD700
    style E fill:#87CEEB
    style G fill:#C8E6C9
    style I fill:#FFCCBC
    style K fill:#FFAB91
```

### Task Planning Workflow

```mermaid
graph TD
    A[Create Task] --> B[Set Priority]
    B --> C[Estimate Time]
    C --> D[Assign Resources]
    D --> E[Create Subtasks?]
    E -->|Yes| F[Break Down Tasks]
    E -->|No| G[Add to Plan]
    F --> G
    G --> H{Feasible?}
    H -->|No| I[Revise Plan]
    H -->|Yes| J[Approve Plan]
    I --> B
    J --> K[Start Execution]
    
    style A fill:#E3F2FD
    style J fill:#C8E6C9
    style I fill:#FFCCBC
```

### Forecast Generation

```mermaid
graph LR
    A[Collect Metrics] --> B[Analyze Trends]
    B --> C[Calculate Forecast]
    C --> D{Confidence > 80%?}
    D -->|Yes| E[High Confidence]
    D -->|No| F[Flag for Review]
    E --> G[Generate Report]
    F --> G
    
    style A fill:#F3E5F5
    style G fill:#FFD700
    style E fill:#C8E6C9
    style F fill:#FFCCBC
```

## 📊 Data Visualizations

### Task Priority Matrix

```mermaid
graph TD
    A[All Tasks] --> B{Priority Level}
    B -->|High| C[Urgent - Do First]
    B -->|Medium| D[Important - Schedule]
    B -->|Low| E[Nice to Have - Later]
    
    C --> C1["High Priority Tasks"]
    D --> D1["Medium Priority Tasks"]
    E --> E1["Low Priority Tasks"]
    
    C1 --> F[Execute Immediately]
    D1 --> F
    E1 --> G[Plan for Future]
    
    style C fill:#FFCCBC
    style D fill:#FFE0B2
    style E fill:#C8E6C9
    style F fill:#FF7043
    style G fill:#4CAF50
```

### Quality Metrics Dashboard

```mermaid
graph TD
    A[Code Quality Report] --> B{Quality Score}
    B -->|90-100| C[Excellent]
    B -->|80-89| D[Good]
    B -->|70-79| E[Acceptable]
    B -->|Below 70| F[Needs Work]
    
    C --> C1["✓ Pass Review"]
    D --> D1["✓ Pass with Notes"]
    E --> E1["△ Address Issues"]
    F --> F1["✗ Reject - Fix Required"]
    
    style A fill:#E1F5FE
    style C fill:#C8E6C9
    style D fill:#FFE0B2
    style E fill:#FFCCBC
    style F fill:#FFAB91
```

## 📅 Timeline & Scheduling

### Project Gantt Chart Template

```mermaid
gantt
    title Project Development Timeline
    dateFormat YYYY-MM-DD
    
    section Planning
    Requirements :req1, 2024-01-01, 5d
    Design :des1, after req1, 7d
    
    section Development
    Backend :dev1, after des1, 15d
    Frontend :dev2, after des1, 15d
    Integration :int1, after dev1, after dev2, 5d
    
    section Testing
    Unit Tests :test1, after int1, 5d
    Integration Tests :test2, after test1, 5d
    UAT :test3, after test2, 5d
    
    section Deployment
    Staging :deploy1, after test3, 2d
    Production :deploy2, after deploy1, 2d
    
    milestone Kickoff :mile1, 2024-01-01, 0d
    milestone Release :mile2, after deploy2, 0d
```

### Sprint Planning Gantt

```mermaid
gantt
    title Sprint Planning (2 Weeks)
    dateFormat YYYY-MM-DD
    
    section Sprint 1
    Story A (8h) :story1, 2024-01-01, 3d
    Story B (13h) :story2, 2024-01-01, 5d
    Story C (5h) :story3, 2024-01-06, 2d
    Code Review :review1, 2024-01-08, 1d
    
    section Sprint 2
    Bug Fixes (8h) :bugs1, 2024-01-08, 2d
    Technical Debt :debt1, 2024-01-10, 3d
    Documentation :doc1, 2024-01-13, 2d
    
    milestone End Sprint 1 :ms1, 2024-01-08, 0d
    milestone End Sprint 2 :ms2, 2024-01-15, 0d
```

## 🔀 State & Sequence Diagrams

### Task Status State Machine

```mermaid
stateDiagram-v2
    [*] --> Created: New task
    Created --> Planning: Start planning
    Planning --> Ready: Plan approved
    Ready --> InProgress: Assignment confirmed
    InProgress --> Review: Work complete
    Review --> Completed: Approved
    Review --> InProgress: Changes needed
    InProgress --> OnHold: Blocker found
    OnHold --> InProgress: Blocker resolved
    Completed --> [*]
    
    note right of Created
        Task created by user
    end note
    
    note right of InProgress
        Developer working
    end note
    
    note right of Review
        Awaiting approval
    end note
```

### Code Review Sequence

```mermaid
sequenceDiagram
    actor Developer
    participant GitHub
    participant Webhook
    participant Claude
    participant Issues
    
    Developer->>GitHub: Push code / Create PR
    GitHub->>Webhook: Trigger webhook
    Webhook->>Claude: Send code for analysis
    Claude->>Claude: Analyze code
    Claude->>Issues: Generate issues
    Issues->>GitHub: Create GitHub issues
    GitHub->>Developer: Notify with results
    Developer->>Developer: Review feedback
    Developer->>GitHub: Push fixes
```

### Forecast Notification Sequence

```mermaid
sequenceDiagram
    participant Forecaster
    participant DB
    participant Calculator
    participant Notifier
    participant User
    
    Forecaster->>DB: Collect metrics
    DB-->>Forecaster: Return data
    Forecaster->>Calculator: Calculate forecast
    Calculator->>Calculator: Run algorithms
    Calculator-->>Forecaster: Return results
    Forecaster->>Notifier: Generate notification
    Notifier->>User: Send alert
    User-->>Forecaster: Acknowledge
```

## 🏗️ Architecture Diagrams

### System Architecture

```mermaid
graph TB
    subgraph GitHub
        A[GitHub Events]
        B[Webhooks]
    end
    
    subgraph "Web Server"
        C[Flask App]
        D[Router]
    end
    
    subgraph AI
        E[Claude API]
        F[Mermaid System]
    end
    
    subgraph Storage
        G[Database]
        H[Cache]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    D --> G
    E --> F
    F --> G
    G --> H
    
    style A fill:#E8EAF6
    style C fill:#C5CAE9
    style E fill:#9FA8DA
    style G fill:#7986CB
```

### Agent Architecture

```mermaid
graph TD
    A[Unified Agents System] --> B[Mermaid System]
    A --> C[Code Review Agent]
    A --> D[Task Planner Agent]
    A --> E[Forecast Agent]
    A --> F[Cursor Integration]
    
    B --> B1[System Prompt]
    B --> B2[Templates]
    B --> B3[Utilities]
    
    C --> C1[Reviewer]
    C --> C2[Config]
    
    D --> D1[Planner]
    D --> D2[Models]
    
    E --> E1[Forecaster]
    E --> E2[Badges]
    
    F --> F1[Skills]
    F --> F2[Rules]
    
    style A fill:#E8F5E9
    style B fill:#F3E5F5
    style C fill:#FFF3E0
    style D fill:#E0F2F1
    style E fill:#F1F8E9
    style F fill:#FCE4EC
```

## 📈 Data Flow Diagrams

### Code Analysis Pipeline

```mermaid
graph LR
    A[Source Code] --> B[Parser]
    B --> C[AST Builder]
    C --> D[Pattern Detector]
    D --> E[Quality Analyzer]
    E --> F[Issue Classifier]
    F --> G[Report Generator]
    G --> H[Output]
    
    style A fill:#E8F5E9
    style H fill:#FFD700
    style D fill:#87CEEB
    style E fill:#FFCCBC
```

### Data Processing Pipeline

```mermaid
graph TD
    A[Raw Data] --> B[Validation]
    B --> C{Valid?}
    C -->|No| D[Error Log]
    C -->|Yes| E[Transformation]
    E --> F[Aggregation]
    F --> G[Analysis]
    G --> H[Visualization]
    H --> I[Output]
    D --> I
    
    style A fill:#E0F2F1
    style I fill:#FFD700
    style D fill:#FFAB91
```

## 🎯 Decision Trees

### Prioritization Decision Tree

```mermaid
graph TD
    A{Issue Type?} 
    A -->|Security| B[CRITICAL]
    A -->|Performance| C{Impact on UX?}
    A -->|Bug| D{Data Loss Risk?}
    A -->|Feature| E{User Requested?}
    
    C -->|High| F[HIGH]
    C -->|Low| G[MEDIUM]
    
    D -->|Yes| H[HIGH]
    D -->|No| I[MEDIUM]
    
    E -->|Yes| J[HIGH]
    E -->|No| K[LOW]
    
    style B fill:#FFAB91
    style F fill:#FFCCBC
    style G fill:#FFE0B2
    style H fill:#FFCCBC
    style J fill:#FFCCBC
    style K fill:#C8E6C9
```

## 📊 Analytics Dashboards

### Task Distribution Chart

```mermaid
pie title Task Distribution by Status
    "Completed" : 35
    "In Progress" : 25
    "Pending" : 20
    "On Hold" : 15
    "Failed" : 5
```

### Quality Metrics Distribution

```mermaid
pie title Code Quality by Category
    "Excellent (90+)" : 45
    "Good (80-89)" : 30
    "Acceptable (70-79)" : 15
    "Needs Work (-70)" : 10
```

## 🚀 Class Diagrams

### Agent Class Structure

```mermaid
classDiagram
    class Agent {
        <<interface>>
        +execute()
        +validate()
    }
    
    class TaskPlannerAgent {
        -tasks: List
        -plan: Plan
        +createTask()
        +generateReport()
    }
    
    class CodeReviewAgent {
        -rules: List
        -issues: List
        +reviewCode()
        +createIssue()
    }
    
    class ForecastAgent {
        -metrics: Dict
        +forecast()
        +calculateConfidence()
    }
    
    Agent <|-- TaskPlannerAgent
    Agent <|-- CodeReviewAgent
    Agent <|-- ForecastAgent
```

---

## 💡 How to Use Templates

1. Copy template you need
2. Modify labels/values for your data
3. Adjust colors as needed
4. Test in Mermaid Live Editor
5. Integrate into your agent

**Mermaid Live Editor**: [https://mermaid.live](https://mermaid.live)

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: 2024-12-17
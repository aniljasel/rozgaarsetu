# RozgaarSetu System Diagrams

Below are the 8 requested diagrams generated using Standard Mermaid.js syntax. You can paste these code blocks into [Mermaid Live Editor](https://mermaid.live/) or view them in any Markdown previewer that supports Mermaid (like VS Code or GitHub).

---

## Fig 4.1 System Architecture Diagram

```mermaid
graph TD
    classDef frontend fill:#3b82f6,stroke:#1e40af,color:#fff
    classDef backend fill:#10b981,stroke:#047857,color:#fff
    classDef database fill:#f59e0b,stroke:#b45309,color:#fff

    subgraph Client [Presentation Layer - React & Vite]
        UI[Web Browser / Mobile View]
        React[React Components]
        State[Context API / Auth State]
        UI --> React
        React --> State
    end

    subgraph Server [Application Layer - Node.js & Express]
        API[REST API Router]
        Auth[Auth Middleware]
        Controllers[Controllers / Logic]
        API --> Auth
        Auth --> Controllers
    end

    subgraph DB [Data Layer - MongoDB Server]
        Mongoose[Mongoose ODM]
        Data[(MongoDB Cluster)]
        Mongoose --> Data
    end

    Client -- HTTP / JSON --> Server
    Server -- BSON / TCP --> DB

    class UI,React,State frontend
    class API,Auth,Controllers backend
    class Mongoose,Data database
```

---

## Fig 4.2 Use Case Diagram

```mermaid
usecaseDiagram
actor Customer as "Customer"
actor Worker as "Worker"
actor Admin as "Administrator"

rectangle "Rozgaar Setu System" {
    usecase UC1 as "Register / Login"
    usecase UC2 as "Search Worker by Proximity"
    usecase UC3 as "Update Profile & Location"
    usecase UC4 as "Send Job Request"
    usecase UC5 as "Accept / Reject Job"
    usecase UC6 as "Provide Feedback & Rating"
    usecase UC7 as "Verify Worker Identity"
    usecase UC8 as "View Platform Analytics"
    usecase UC9 as "Manage Complaints"
}

Customer --> UC1
Customer --> UC2
Customer --> UC3
Customer --> UC4
Customer --> UC6

Worker --> UC1
Worker --> UC3
Worker --> UC5

Admin --> UC1
Admin --> UC7
Admin --> UC8
Admin --> UC9
```

---

## Fig 4.3 Class Diagram

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String email
        +String passwordHash
        +String role
        +Date createdAt
        +login()
        +register()
        +generateToken()
    }

    class Worker {
        +ObjectId user_id
        +String name
        +String phone
        +String role
        +String[] skills
        +GeoJSON location
        +Boolean isVerified
        +Number rating
        +updateProfile()
        +acceptJob()
    }

    class Customer {
        +ObjectId user_id
        +String name
        +String phone
        +String address
        +bookWorker()
        +rateWorker()
    }

    class Job {
        +ObjectId job_id
        +ObjectId customer_id
        +ObjectId worker_id
        +String status
        +String paymentStatus
        +Date scheduledTime
        +updateStatus()
        +completePayment()
    }

    class Complaint {
        +ObjectId complaint_id
        +ObjectId user_id
        +String issue
        +String status
        +resolve()
    }

    User <|-- Worker : Inherits core auth
    User <|-- Customer : Inherits core auth
    Customer "1" *-- "many" Job : Creates
    Worker "1" *-- "many" Job : Performs
    User "1" *-- "many" Complaint : Files
```

---

## Fig 4.4 Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor C as Customer
    participant F as Frontend (React)
    participant API as Express API
    participant J as Job Controller
    participant DB as MongoDB

    C->>F: Clicks "Book Worker"
    F->>API: POST /api/jobs {workerId}
    API->>API: authMiddleware() validates JWT
    API->>J: Passes validated request
    J->>DB: Job.create({customer, worker})
    DB-->>J: Returns Saved Job Doc
    J-->>F: HTTP 201 Created (JSON Response)
    F-->>C: Show Booking Success Alert
```

---

## Fig 4.5 Activity Diagram

```mermaid
flowchart TD
    Start((Start)) --> A[Worker Logs In]
    A --> B{Is Credentials Valid?}
    B -- No --> C[Show Error Message]
    C --> End((End))
    B -- Yes --> D[Navigate to Worker Dashboard]
    D --> E[Fetch Pending Jobs]
    E --> F[Select specific Job Request]
    F --> G{Accept or Reject?}
    G -- Reject --> H[Update DB Status to Rejected]
    H --> I[Notify Customer via SMS/UI]
    G -- Accept --> J[Update DB Status to Accepted]
    J --> K[Share Customer Contact Info]
    K --> I
    I --> End
```

---

## Fig 4.6 DFD Level 0 (Context Diagram)

```mermaid
flowchart LR
    C[Customer] -->|Search queries, Bookings, Ratings| S((Rozgaar Setu System))
    S -->|Worker profiles, Job status| C

    W[Worker] -->|Location, Skills, Job updates| S
    S -->|New job requests, Earnings, Reviews| W

    A[Administrator] -->|Verification config, Dispute verdicts| S
    S -->|System analytics, Unverified profiles| A
```

---

## Fig 4.7 DFD Level 1

```mermaid
flowchart TD
    C[Customer]
    W[Worker]
    A[Admin]

    P1((1.0 Auth Engine))
    P2((2.0 Mapping & Match Engine))
    P3((3.0 Booking Engine))
    P4((4.0 Admin Module))

    DB1[(Users/Auth DB)]
    DB2[(Workers DB)]
    DB3[(Jobs/Transactions DB)]

    C -->|Credentials| P1
    W -->|Credentials| P1
    P1 <--> DB1

    C -->|Location & Skill Required| P2
    W -->|Update Real-time Location| P2
    P2 <--> DB2

    C -->|Initiate Job| P3
    W -->|Update Job Status| P3
    P3 <--> DB3

    A -->|Resolve Complaints| P4
    P4 <--> DB1
    P4 <--> DB2
```

---

## Fig 4.8 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        string email
        string password_hash
        string role
        datetime createdAt
    }
    
    CUSTOMERS {
        ObjectId _id PK
        ObjectId user_id FK
        string name
        string phone
        string address
    }
    
    WORKERS {
        ObjectId _id PK
        ObjectId user_id FK
        string name
        string phone
        string category
        array skills
        boolean isVerified
        point location
    }

    JOBS {
        ObjectId _id PK
        ObjectId customer_id FK
        ObjectId worker_id FK
        string status
        string pay_status
        datetime created_at
    }

    FEEDBACKS {
        ObjectId _id PK
        ObjectId job_id FK
        ObjectId author_id FK
        int rating
        string comment
    }

    USERS ||--o| CUSTOMERS : "Has Profile"
    USERS ||--o| WORKERS : "Has Profile"
    CUSTOMERS ||--o{ JOBS : "Requests"
    WORKERS ||--o{ JOBS : "Accepts"
    JOBS ||--o| FEEDBACKS : "Receives"
```

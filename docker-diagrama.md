                         🌐 Browser
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       React + Vite                  Nginx
       :5173                         :8081
              │                           │
              │                           ▼
              │                    Laravel API
              │                       :8000
              │                           │
              └──────────────┬────────────┘
                             │
             ┌───────────────┼────────────────┐
             │               │                │
             ▼               ▼                ▼
          MySQL           MongoDB           Redis
          :3307           :27018            :6381
             │               │                │
             │               │                │
             ▼               │                ▼
          Products       Audit Logs        Cache/Queue
          Orders         File Logs
          Users
             │
             ▼
       Elasticsearch
           :9200
             │
             ▼
       Product Search


       Iar Separat:

       Laravel
   │
   ├── Queue
   │      │
   │      ▼
   │  laravel_worker 🔴
   │
   └── Scheduler
          │
          ▼
      laravel_scheduler 🔴


Monitoring:

Laravel / Services
       │
       ▼
   Prometheus :9090
       │
       ▼
    Grafana :3000
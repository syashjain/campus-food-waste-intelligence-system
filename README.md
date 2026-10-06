# Campus Food Waste Intelligence System (CFWIS)
### Enterprise DBMS Engineering Platform & Food Waste Analytics

An enterprise-grade, database-driven system for recording, monitoring, analyzing, and reducing food waste across university dining halls, messes, and cafeterias. Built to strictly demonstrate advanced relational concepts: **BCNF normalization, PostgreSQL 15+ Row-Level Security (RLS), Declarative Partitioning, PostGIS spatial logistics, Serializable Snapshot Isolation (SSI), and advanced indexing (B-Tree, BRIN, GIN, GiST)**.

---

## 🏛️ Project Directory Structure (PRD Section 35)

```
campus-food-waste-intelligence/
├── database/
│   ├── schema.sql         # Full BCNF DDL, Enums, Constraints, Partitioning, RLS
│   ├── seed.sql           # Realistic 30-day dataset (campuses, facilities, items, waste)
│   ├── views.sql          # 4 PRD analytical views + PostGIS spatial rescue view
│   ├── procedures.sql     # Stored procedures for atomic waste & purchase workflows
│   ├── functions.sql      # Waste intelligence scoring & unit conversion functions
│   ├── triggers.sql       # 4 PRD triggers (consumption bounds, cost snapshots, audit)
│   ├── indexes.sql        # B-Tree, BRIN, GIN, and GiST spatial indexes
│   └── queries.sql        # 20+ PRD demonstration queries (CTEs, Window, Joins)
├── docs/
│   ├── er-diagram.md      # Mermaid ER diagram & cardinality specifications
│   ├── relational-schema.md # Table attribute specifications & normalization
│   └── dbms-report.md     # Academic DBMS report: BCNF, RLS, SSI, HikariCP/PgBouncer
├── tests/
│   └── test-cases.md      # Test matrix for constraints, triggers, and transactions
├── src/                   # React + TypeScript + Tailwind v4 interactive application
│   ├── components/        # Specialized DBMS demo components, charts, and forms
│   ├── store/             # In-memory relational database engine with reactive tables
│   ├── types/             # Strict TypeScript models matching PostgreSQL schema
│   └── App.tsx            # Full-featured operational & academic demonstration UI
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Quickstart & Execution

### 1. Web Application Execution (Development)
```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the interactive web application, operational workflows, and the **Academic DBMS Demonstration Hub**.

### 2. Native PostgreSQL 15+ / PostGIS Database Recreation
To deploy the database scripts onto an external PostgreSQL instance:
```bash
# 1. Create database and load schema
psql -U postgres -d cfwis_db -f database/schema.sql

# 2. Load analytical views
psql -U postgres -d cfwis_db -f database/views.sql

# 3. Load functions and triggers
psql -U postgres -d cfwis_db -f database/functions.sql
psql -U postgres -d cfwis_db -f database/triggers.sql

# 4. Load stored procedures
psql -U postgres -d cfwis_db -f database/procedures.sql

# 5. Build indexes (B-Tree, BRIN, GIN, GiST)
psql -U postgres -d cfwis_db -f database/indexes.sql

# 6. Seed with realistic 30-day operational dataset
psql -U postgres -d cfwis_db -f database/seed.sql

# 7. Run 20+ verification queries
psql -U postgres -d cfwis_db -f database/queries.sql
```

---

## 🎯 Key Academic Highlights for Evaluation
1. **BCNF Relational Proofs:** Master data and transaction lines decomposed to guarantee that every non-trivial functional dependency determinant is a candidate key.
2. **Row-Level Security (RLS):** True database kernel tenancy filtering via `current_setting('app.current_campus_id')`.
3. **Time-Series Partitioning:** Declarative quarterly partitions on `food_waste` and `attendance` with automated partition pruning.
4. **PostGIS Spatial Routing:** R-Tree GiST indexes calculating geodetic distances to campus food pantries via `ST_DWithin` and `ST_Distance`.
5. **ACID Transactions:** Full rollback simulation demonstrator preventing partial state contamination.
6. **Query Profiling:** Real-time EXPLAIN ANALYZE comparison of Sequential Scans vs Index Scans vs Bitmap Heap Scans.

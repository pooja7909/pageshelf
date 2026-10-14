import { Category } from './types';

export const CURRICULUM: Category[] = [
  // ==========================================
  // TOP LEVEL: IB COMPUTER SCIENCE
  // ==========================================
  { id: "ib", name: "IB Computer Science", parent: "", order: 1, visibleToStudents: true },

  // --- Theme A: Concepts of Computer Science ---
  // A1 Computer fundamentals
  { id: "ib-a1", name: "A1 Computer fundamentals", parent: "ib", order: 1, visibleToStudents: true },
  
  { id: "ib-a1-1", name: "A1.1 Computer hardware and operation", parent: "ib-a1", order: 1, visibleToStudents: true },
  { id: "ib-a1-1-1", name: "A1.1.1 Main CPU components (ALU, CU, Registers & Buses)", parent: "ib-a1-1", order: 1, visibleToStudents: true },
  { id: "ib-a1-1-2", name: "A1.1.2 Role and architecture of a GPU", parent: "ib-a1-1", order: 2, visibleToStudents: true },
  { id: "ib-a1-1-3", name: "A1.1.3 Differences between CPU and GPU (HL only)", parent: "ib-a1-1", order: 3, visibleToStudents: true },
  { id: "ib-a1-1-4", name: "A1.1.4 Primary memory (RAM, ROM, Cache L1-L3, Registers)", parent: "ib-a1-1", order: 4, visibleToStudents: true },
  { id: "ib-a1-1-5", name: "A1.1.5 Fetch, decode and execute cycle", parent: "ib-a1-1", order: 5, visibleToStudents: true },
  { id: "ib-a1-1-6", name: "A1.1.6 Pipelining in multi-core architectures (HL only)", parent: "ib-a1-1", order: 6, visibleToStudents: true },
  { id: "ib-a1-1-7", name: "A1.1.7 Secondary storage (SSD, HDD, eMMC, NAS)", parent: "ib-a1-1", order: 7, visibleToStudents: true },
  { id: "ib-a1-1-8", name: "A1.1.8 Data compression (Lossy vs Lossless, RLE)", parent: "ib-a1-1", order: 8, visibleToStudents: true },
  { id: "ib-a1-1-9", name: "A1.1.9 Cloud computing services (SaaS, PaaS, IaaS)", parent: "ib-a1-1", order: 9, visibleToStudents: true },

  { id: "ib-a1-2", name: "A1.2 Data representation and computer logic", parent: "ib-a1", order: 2, visibleToStudents: true },
  { id: "ib-a1-2-1", name: "A1.2.1 Binary, hexadecimal & decimal conversions", parent: "ib-a1-2", order: 1, visibleToStudents: true },
  { id: "ib-a1-2-2", name: "A1.2.2 Binary storage (Text, images, audio, video)", parent: "ib-a1-2", order: 2, visibleToStudents: true },
  { id: "ib-a1-2-3", name: "A1.2.3 Logic gates (AND, OR, NOT, NAND, NOR, XOR, XNOR)", parent: "ib-a1-2", order: 3, visibleToStudents: true },
  { id: "ib-a1-2-4", name: "A1.2.4 Truth tables and Boolean expressions", parent: "ib-a1-2", order: 4, visibleToStudents: true },
  { id: "ib-a1-2-5", name: "A1.2.5 Logic diagrams & Boolean algebra simplification", parent: "ib-a1-2", order: 5, visibleToStudents: true },

  { id: "ib-a1-3", name: "A1.3 Operating systems and control systems", parent: "ib-a1", order: 3, visibleToStudents: true },
  { id: "ib-a1-3-1", name: "A1.3.1 Role of operating systems & hardware abstraction", parent: "ib-a1-3", order: 1, visibleToStudents: true },
  { id: "ib-a1-3-2", name: "A1.3.2 Functions of an OS (Memory, files, scheduling, GUI)", parent: "ib-a1-3", order: 2, visibleToStudents: true },
  { id: "ib-a1-3-3", name: "A1.3.3 Scheduling algorithms (FCFS, Round Robin, Multilevel)", parent: "ib-a1-3", order: 3, visibleToStudents: true },
  { id: "ib-a1-3-4", name: "A1.3.4 Polling and interrupt handling", parent: "ib-a1-3", order: 4, visibleToStudents: true },
  { id: "ib-a1-3-5", name: "A1.3.5 Multitasking, contention & deadlock (HL only)", parent: "ib-a1-3", order: 5, visibleToStudents: true },
  { id: "ib-a1-3-6", name: "A1.3.6 Control systems: Sensors, actuators & loops (HL only)", parent: "ib-a1-3", order: 6, visibleToStudents: true },
  { id: "ib-a1-3-7", name: "A1.3.7 Real-world control systems applications (HL only)", parent: "ib-a1-3", order: 7, visibleToStudents: true },

  { id: "ib-a1-4", name: "A1.4 Translation (HL only)", parent: "ib-a1", order: 4, visibleToStudents: true },
  { id: "ib-a1-4-1", name: "A1.4.1 Interpreters, compilers, JIT & bytecode", parent: "ib-a1-4", order: 1, visibleToStudents: true },

  // A2 Networks
  { id: "ib-a2", name: "A2 Networks", parent: "ib", order: 2, visibleToStudents: true },
  { id: "ib-a2-1", name: "A2.1 Network fundamentals", parent: "ib-a2", order: 1, visibleToStudents: true },
  { id: "ib-a2-1-1", name: "A2.1.1 Network types (LAN, WAN, PAN, VPN)", parent: "ib-a2-1", order: 1, visibleToStudents: true },
  { id: "ib-a2-1-2", name: "A2.1.2 Modern digital infrastructure (Edge, cloud, mobile)", parent: "ib-a2-1", order: 2, visibleToStudents: true },
  { id: "ib-a2-1-3", name: "A2.1.3 Network devices (Routers, switches, gateways, WAP)", parent: "ib-a2-1", order: 3, visibleToStudents: true },
  { id: "ib-a2-1-4", name: "A2.1.4 Transport & application protocols (TCP, UDP, HTTP, HTTPS)", parent: "ib-a2-1", order: 4, visibleToStudents: true },
  { id: "ib-a2-1-5", name: "A2.1.5 TCP/IP 4-layer model (HL only)", parent: "ib-a2-1", order: 5, visibleToStudents: true },

  { id: "ib-a2-2", name: "A2.2 Network architecture", parent: "ib-a2", order: 2, visibleToStudents: true },
  { id: "ib-a2-2-1", name: "A2.2.1 Network topologies (Star, mesh, hybrid)", parent: "ib-a2-2", order: 1, visibleToStudents: true },
  { id: "ib-a2-2-2", name: "A2.2.2 Server functions (DNS, DHCP, web, mail, proxy) (HL only)", parent: "ib-a2-2", order: 2, visibleToStudents: true },
  { id: "ib-a2-2-3", name: "A2.2.3 Client-server vs Peer-to-peer networking", parent: "ib-a2-2", order: 3, visibleToStudents: true },
  { id: "ib-a2-2-4", name: "A2.2.4 Network segmentation, subnetting & VLANs", parent: "ib-a2-2", order: 4, visibleToStudents: true },

  { id: "ib-a2-3", name: "A2.3 Data transmissions", parent: "ib-a2", order: 3, visibleToStudents: true },
  { id: "ib-a2-3-1", name: "A2.3.1 IP addressing (IPv4, IPv6, NAT, public vs private)", parent: "ib-a2-3", order: 1, visibleToStudents: true },
  { id: "ib-a2-3-2", name: "A2.3.2 Transmission media (Fibre optic, twisted pair, wireless)", parent: "ib-a2-3", order: 2, visibleToStudents: true },
  { id: "ib-a2-3-3", name: "A2.3.3 Packet switching and routing headers", parent: "ib-a2-3", order: 3, visibleToStudents: true },
  { id: "ib-a2-3-4", name: "A2.3.4 Static and dynamic routing (HL only)", parent: "ib-a2-3", order: 4, visibleToStudents: true },

  { id: "ib-a2-4", name: "A2.4 Network security", parent: "ib-a2", order: 4, visibleToStudents: true },
  { id: "ib-a2-4-1", name: "A2.4.1 Firewalls, packet filtering & rules", parent: "ib-a2-4", order: 1, visibleToStudents: true },
  { id: "ib-a2-4-2", name: "A2.4.2 Common network vulnerabilities (DDoS, MitM, XSS, SQLi) (HL only)", parent: "ib-a2-4", order: 2, visibleToStudents: true },
  { id: "ib-a2-4-3", name: "A2.4.3 Security countermeasures (IDS/IPS, MFA, TLS) (HL only)", parent: "ib-a2-4", order: 3, visibleToStudents: true },
  { id: "ib-a2-4-4", name: "A2.4.4 Encryption & digital certificates (Symmetric vs Asymmetric)", parent: "ib-a2-4", order: 4, visibleToStudents: true },

  // A3 Databases
  { id: "ib-a3", name: "A3 Databases", parent: "ib", order: 3, visibleToStudents: true },
  { id: "ib-a3-1", name: "A3.1 Database fundamentals", parent: "ib-a3", order: 1, visibleToStudents: true },
  { id: "ib-a3-1-1", name: "A3.1.1 Relational database features, keys and integrity", parent: "ib-a3-1", order: 1, visibleToStudents: true },

  { id: "ib-a3-2", name: "A3.2 Database design", parent: "ib-a3", order: 2, visibleToStudents: true },
  { id: "ib-a3-2-1", name: "A3.2.1 Conceptual, logical & physical schemas", parent: "ib-a3-2", order: 1, visibleToStudents: true },
  { id: "ib-a3-2-2", name: "A3.2.2 Entity Relationship Diagrams (ERDs) & Cardinality", parent: "ib-a3-2", order: 2, visibleToStudents: true },
  { id: "ib-a3-2-3", name: "A3.2.3 Relational data types and constraints", parent: "ib-a3-2", order: 3, visibleToStudents: true },
  { id: "ib-a3-2-4", name: "A3.2.4 Table construction & primary/foreign keys", parent: "ib-a3-2", order: 4, visibleToStudents: true },
  { id: "ib-a3-2-5", name: "A3.2.5 Normalization: 1NF, 2NF and 3NF", parent: "ib-a3-2", order: 5, visibleToStudents: true },
  { id: "ib-a3-2-6", name: "A3.2.6 Designing databases normalized to 3NF", parent: "ib-a3-2", order: 6, visibleToStudents: true },
  { id: "ib-a3-2-7", name: "A3.2.7 Denormalization pros, cons & use-cases", parent: "ib-a3-2", order: 7, visibleToStudents: true },

  { id: "ib-a3-3", name: "A3.3 Database programming", parent: "ib-a3", order: 3, visibleToStudents: true },
  { id: "ib-a3-3-1", name: "A3.3.1 DDL vs DML commands in SQL", parent: "ib-a3-3", order: 1, visibleToStudents: true },
  { id: "ib-a3-3-2", name: "A3.3.2 Querying two tables (JOIN, WHERE, GROUP BY, ORDER BY)", parent: "ib-a3-3", order: 2, visibleToStudents: true },
  { id: "ib-a3-3-3", name: "A3.3.3 Modifying records (INSERT, UPDATE, DELETE)", parent: "ib-a3-3", order: 3, visibleToStudents: true },
  { id: "ib-a3-3-4", name: "A3.3.4 SQL aggregate functions (COUNT, AVG, SUM, MAX, MIN) (HL only)", parent: "ib-a3-3", order: 4, visibleToStudents: true },
  { id: "ib-a3-3-5", name: "A3.3.5 Virtual and materialized database views (HL only)", parent: "ib-a3-3", order: 5, visibleToStudents: true },
  { id: "ib-a3-3-6", name: "A3.3.6 ACID transactions & TCL commands (HL only)", parent: "ib-a3-3", order: 6, visibleToStudents: true },

  { id: "ib-a3-4", name: "A3.4 Alternative databases & warehouses (HL only)", parent: "ib-a3", order: 4, visibleToStudents: true },
  { id: "ib-a3-4-1", name: "A3.4.1 NoSQL, cloud, in-memory & spatial databases", parent: "ib-a3-4", order: 1, visibleToStudents: true },
  { id: "ib-a3-4-2", name: "A3.4.2 Data warehouses & OLAP analytics", parent: "ib-a3-4", order: 2, visibleToStudents: true },
  { id: "ib-a3-4-3", name: "A3.4.3 Data mining techniques", parent: "ib-a3-4", order: 3, visibleToStudents: true },
  { id: "ib-a3-4-4", name: "A3.4.4 Distributed databases: Partitioning & replication", parent: "ib-a3-4", order: 4, visibleToStudents: true },

  // A4 Machine learning
  { id: "ib-a4", name: "A4 Machine learning", parent: "ib", order: 4, visibleToStudents: true },
  { id: "ib-a4-1", name: "A4.1 Machine learning fundamentals", parent: "ib-a4", order: 1, visibleToStudents: true },
  { id: "ib-a4-1-1", name: "A4.1.1 Supervised, unsupervised, DL, RL & Transfer learning", parent: "ib-a4-1", order: 1, visibleToStudents: true },
  { id: "ib-a4-1-2", name: "A4.1.2 Hardware requirements: GPUs, TPUs, ASICs & HPC", parent: "ib-a4-1", order: 2, visibleToStudents: true },

  { id: "ib-a4-2", name: "A4.2 Data preprocessing (HL only)", parent: "ib-a4", order: 2, visibleToStudents: true },
  { id: "ib-a4-2-1", name: "A4.2.1 Data cleaning, outlier handling & normalization", parent: "ib-a4-2", order: 1, visibleToStudents: true },
  { id: "ib-a4-2-2", name: "A4.2.2 Feature selection strategies", parent: "ib-a4-2", order: 2, visibleToStudents: true },
  { id: "ib-a4-2-3", name: "A4.2.3 Curse of dimensionality & reduction", parent: "ib-a4-2", order: 3, visibleToStudents: true },

  { id: "ib-a4-3", name: "A4.3 Machine learning approaches (HL only)", parent: "ib-a4", order: 3, visibleToStudents: true },
  { id: "ib-a4-3-1", name: "A4.3.1 Linear regression and line of best fit", parent: "ib-a4-3", order: 1, visibleToStudents: true },
  { id: "ib-a4-3-2", name: "A4.3.2 Supervised classification: K-NN & Decision Trees", parent: "ib-a4-3", order: 2, visibleToStudents: true },
  { id: "ib-a4-3-3", name: "A4.3.3 Hyperparameter tuning & metrics (Precision, Recall, F1)", parent: "ib-a4-3", order: 3, visibleToStudents: true },
  { id: "ib-a4-3-4", name: "A4.3.4 Unsupervised clustering algorithms", parent: "ib-a4-3", order: 4, visibleToStudents: true },
  { id: "ib-a4-3-5", name: "A4.3.5 Association rule mining in large data", parent: "ib-a4-3", order: 5, visibleToStudents: true },
  { id: "ib-a4-3-6", name: "A4.3.6 Reinforcement learning: Agents, rewards & policies", parent: "ib-a4-3", order: 6, visibleToStudents: true },
  { id: "ib-a4-3-7", name: "A4.3.7 Genetic algorithms: Selection, crossover & mutation", parent: "ib-a4-3", order: 7, visibleToStudents: true },
  { id: "ib-a4-3-8", name: "A4.3.8 Artificial Neural Networks (ANNs) & MLPs", parent: "ib-a4-3", order: 8, visibleToStudents: true },
  { id: "ib-a4-3-9", name: "A4.3.9 Convolutional Neural Networks (CNNs) & Computer Vision", parent: "ib-a4-3", order: 9, visibleToStudents: true },
  { id: "ib-a4-3-10", name: "A4.3.10 Model selection, comparison and evaluation", parent: "ib-a4-3", order: 10, visibleToStudents: true },

  { id: "ib-a4-4", name: "A4.4 Ethical considerations", parent: "ib-a4", order: 4, visibleToStudents: true },
  { id: "ib-a4-4-1", name: "A4.4.1 Algorithmic bias, fairness, transparency & consent", parent: "ib-a4-4", order: 1, visibleToStudents: true },
  { id: "ib-a4-4-2", name: "A4.4.2 Ethical impact of AI, AR/VR & quantum tech on society", parent: "ib-a4-4", order: 2, visibleToStudents: true },

  // --- Theme B: Computational Thinking & Problem Solving ---
  // B1 Computational thinking
  { id: "ib-b1", name: "B1 Computational thinking", parent: "ib", order: 5, visibleToStudents: true },
  { id: "ib-b1-1", name: "B1.1 Approaches to computational thinking", parent: "ib-b1", order: 1, visibleToStudents: true },
  { id: "ib-b1-1-1", name: "B1.1.1 Problem specifications, goals and constraints", parent: "ib-b1-1", order: 1, visibleToStudents: true },
  { id: "ib-b1-1-2", name: "B1.1.2 Decomposition, pattern recognition, abstraction & algorithms", parent: "ib-b1-1", order: 2, visibleToStudents: true },
  { id: "ib-b1-1-3", name: "B1.1.3 Applying computational thinking across CS domains", parent: "ib-b1-1", order: 3, visibleToStudents: true },
  { id: "ib-b1-1-4", name: "B1.1.4 Tracing flowcharts & standard symbols", parent: "ib-b1-1", order: 4, visibleToStudents: true },

  // B2 Programming
  { id: "ib-b2", name: "B2 Programming", parent: "ib", order: 6, visibleToStudents: true },
  { id: "ib-b2-1", name: "B2.1 Programming fundamentals", parent: "ib-b2", order: 1, visibleToStudents: true },
  { id: "ib-b2-1-1", name: "B2.1.1 Variable scopes & primitive data types", parent: "ib-b2-1", order: 1, visibleToStudents: true },
  { id: "ib-b2-1-2", name: "B2.1.2 String extraction & manipulation methods", parent: "ib-b2-1", order: 2, visibleToStudents: true },
  { id: "ib-b2-1-3", name: "B2.1.3 Exception handling (try/catch & try/except/finally)", parent: "ib-b2-1", order: 3, visibleToStudents: true },
  { id: "ib-b2-1-4", name: "B2.1.4 Debugging techniques & trace tables", parent: "ib-b2-1", order: 4, visibleToStudents: true },

  { id: "ib-b2-2", name: "B2.2 Data structures", parent: "ib-b2", order: 2, visibleToStudents: true },
  { id: "ib-b2-2-1", name: "B2.2.1 Static vs dynamic memory data structures", parent: "ib-b2-2", order: 1, visibleToStudents: true },
  { id: "ib-b2-2-2", name: "B2.2.2 1D/2D Arrays and dynamic Lists", parent: "ib-b2-2", order: 2, visibleToStudents: true },
  { id: "ib-b2-2-3", name: "B2.2.3 Stacks (LIFO: push, pop, peek, isEmpty)", parent: "ib-b2-2", order: 3, visibleToStudents: true },
  { id: "ib-b2-2-4", name: "B2.2.4 Queues (FIFO: enqueue, dequeue, front, isEmpty)", parent: "ib-b2-2", order: 4, visibleToStudents: true },

  { id: "ib-b2-3", name: "B2.3 Programming constructs", parent: "ib-b2", order: 3, visibleToStudents: true },
  { id: "ib-b2-3-1", name: "B2.3.1 Instruction sequencing & logical execution", parent: "ib-b2-3", order: 1, visibleToStudents: true },
  { id: "ib-b2-3-2", name: "B2.3.2 Selection structures (if, else, elif, relational ops)", parent: "ib-b2-3", order: 2, visibleToStudents: true },
  { id: "ib-b2-3-3", name: "B2.3.3 Loops: Counted for-loops & conditional while-loops", parent: "ib-b2-3", order: 3, visibleToStudents: true },
  { id: "ib-b2-3-4", name: "B2.3.4 Modular functions, parameters & return values", parent: "ib-b2-3", order: 4, visibleToStudents: true },

  { id: "ib-b2-4", name: "B2.4 Programming algorithms", parent: "ib-b2", order: 4, visibleToStudents: true },
  { id: "ib-b2-4-1", name: "B2.4.1 Big O notation: Time & space efficiency", parent: "ib-b2-4", order: 1, visibleToStudents: true },
  { id: "ib-b2-4-2", name: "B2.4.2 Linear search and binary search implementations", parent: "ib-b2-4", order: 2, visibleToStudents: true },
  { id: "ib-b2-4-3", name: "B2.4.3 Bubble sort and selection sort algorithms", parent: "ib-b2-4", order: 3, visibleToStudents: true },
  { id: "ib-b2-4-4", name: "B2.4.4 Recursion fundamentals & base cases (HL only)", parent: "ib-b2-4", order: 4, visibleToStudents: true },
  { id: "ib-b2-4-5", name: "B2.4.5 Tracing & writing recursive algorithms (HL only)", parent: "ib-b2-4", order: 5, visibleToStudents: true },

  { id: "ib-b2-5", name: "B2.5 File processing", parent: "ib-b2", order: 5, visibleToStudents: true },
  { id: "ib-b2-5-1", name: "B2.5.1 Sequential text file I/O: read, write, append & close", parent: "ib-b2-5", order: 1, visibleToStudents: true },

  // B3 Object-oriented programming
  { id: "ib-b3", name: "B3 Object-oriented programming", parent: "ib", order: 7, visibleToStudents: true },
  { id: "ib-b3-1", name: "B3.1 Fundamentals of OOP for a single class", parent: "ib-b3", order: 1, visibleToStudents: true },
  { id: "ib-b3-1-1", name: "B3.1.1 Classes, instances & objects", parent: "ib-b3-1", order: 1, visibleToStudents: true },
  { id: "ib-b3-1-2", name: "B3.1.2 UML class diagrams & attribute design", parent: "ib-b3-1", order: 2, visibleToStudents: true },
  { id: "ib-b3-1-3", name: "B3.1.3 Static vs non-static variables and methods", parent: "ib-b3-1", order: 3, visibleToStudents: true },
  { id: "ib-b3-1-4", name: "B3.1.4 Constructors and object initialization", parent: "ib-b3-1", order: 4, visibleToStudents: true },
  { id: "ib-b3-1-5", name: "B3.1.5 Encapsulation, information hiding & access modifiers", parent: "ib-b3-1", order: 5, visibleToStudents: true },

  { id: "ib-b3-2", name: "B3.2 Multiple classes OOP (HL only)", parent: "ib-b3", order: 2, visibleToStudents: true },
  { id: "ib-b3-2-1", name: "B3.2.1 Inheritance hierarchies & subclasses", parent: "ib-b3-2", order: 1, visibleToStudents: true },
  { id: "ib-b3-2-2", name: "B3.2.2 Polymorphism & method overriding", parent: "ib-b3-2", order: 2, visibleToStudents: true },
  { id: "ib-b3-2-3", name: "B3.2.3 Abstraction & abstract base classes", parent: "ib-b3-2", order: 3, visibleToStudents: true },
  { id: "ib-b3-2-4", name: "B3.2.4 Composition and aggregation relationships", parent: "ib-b3-2", order: 4, visibleToStudents: true },
  { id: "ib-b3-2-5", name: "B3.2.5 OOP design patterns: Singleton, Factory & Observer", parent: "ib-b3-2", order: 5, visibleToStudents: true },

  // B4 Abstract data types (HL only)
  { id: "ib-b4", name: "B4 Abstract data types (HL only)", parent: "ib", order: 8, visibleToStudents: true },
  { id: "ib-b4-1", name: "B4.1 Fundamentals of ADTs", parent: "ib-b4", order: 1, visibleToStudents: true },
  { id: "ib-b4-1-1", name: "B4.1.1 Properties and specifications of ADTs", parent: "ib-b4-1", order: 1, visibleToStudents: true },
  { id: "ib-b4-1-2", name: "B4.1.2 Linked lists: Singly, doubly and circular", parent: "ib-b4-1", order: 2, visibleToStudents: true },
  { id: "ib-b4-1-3", name: "B4.1.3 Linked list operations: insert, delete, traverse", parent: "ib-b4-1", order: 3, visibleToStudents: true },
  { id: "ib-b4-1-4", name: "B4.1.4 Binary Search Trees (BSTs) & traversal", parent: "ib-b4-1", order: 4, visibleToStudents: true },
  { id: "ib-b4-1-5", name: "B4.1.5 Sets as an ADT: Union, intersection, difference", parent: "ib-b4-1", order: 5, visibleToStudents: true },
  { id: "ib-b4-1-6", name: "B4.1.6 Hash tables, hashing functions & collision resolution", parent: "ib-b4-1", order: 6, visibleToStudents: true },

  // Case Study & Internal Assessment
  { id: "ib-cs", name: "Case study", parent: "ib", order: 9, visibleToStudents: true },
  { id: "ib-cs-1", name: "Pre-seen case study analysis & investigation", parent: "ib-cs", order: 1, visibleToStudents: true },
  { id: "ib-cs-2", name: "Challenge questions research & discussion", parent: "ib-cs", order: 2, visibleToStudents: true },

  { id: "ib-ia", name: "Internal assessment (The computational solution)", parent: "ib", order: 10, visibleToStudents: true },
  { id: "ib-ia-a", name: "Criterion A: Problem specification", parent: "ib-ia", order: 1, visibleToStudents: true },
  { id: "ib-ia-b", name: "Criterion B: Planning & decomposition", parent: "ib-ia", order: 2, visibleToStudents: true },
  { id: "ib-ia-c", name: "Criterion C: System overview & models", parent: "ib-ia", order: 3, visibleToStudents: true },
  { id: "ib-ia-d", name: "Criterion D: Development & testing", parent: "ib-ia", order: 4, visibleToStudents: true },
  { id: "ib-ia-e", name: "Criterion E: Evaluation & improvements", parent: "ib-ia", order: 5, visibleToStudents: true },


  // ==========================================
  // TOP LEVEL: IGCSE COMPUTER SCIENCE (9-1)
  // ==========================================
  { id: "igcse", name: "IGCSE Computer Science", parent: "", order: 2, visibleToStudents: true },

  // Topic 1: Problem solving
  { id: "igcse-t1", name: "Topic 1: Problem solving", parent: "igcse", order: 1, visibleToStudents: true },
  { id: "igcse-t1-1", name: "1.1 Algorithms", parent: "igcse-t1", order: 1, visibleToStudents: true },
  { id: "igcse-t1-1-1", name: "1.1.1 Algorithm definition, interpretation & conventions", parent: "igcse-t1-1", order: 1, visibleToStudents: true },
  { id: "igcse-t1-1-2", name: "1.1.2 Creating algorithms: Sequence, selection, iteration", parent: "igcse-t1-1", order: 2, visibleToStudents: true },
  { id: "igcse-t1-1-3", name: "1.1.3 Determining algorithm outputs for test data", parent: "igcse-t1-1", order: 3, visibleToStudents: true },
  { id: "igcse-t1-1-4", name: "1.1.4 Identifying and correcting errors using trace tables", parent: "igcse-t1-1", order: 4, visibleToStudents: true },
  { id: "igcse-t1-1-5", name: "1.1.5 Standard algorithms: Bubble sort, merge sort, linear & binary search", parent: "igcse-t1-1", order: 5, visibleToStudents: true },
  { id: "igcse-t1-1-6", name: "1.1.6 Evaluating fitness for purpose & efficiency", parent: "igcse-t1-1", order: 6, visibleToStudents: true },

  { id: "igcse-t1-2", name: "1.2 Decomposition and abstraction", parent: "igcse-t1", order: 2, visibleToStudents: true },
  { id: "igcse-t1-2-1", name: "1.2.1 Problem analysis: Inputs, outputs, processing & state", parent: "igcse-t1-2", order: 1, visibleToStudents: true },
  { id: "igcse-t1-2-2", name: "1.2.2 Decomposing problems into smaller sub-problems", parent: "igcse-t1-2", order: 2, visibleToStudents: true },
  { id: "igcse-t1-2-3", name: "1.2.3 Abstraction to model aspects of the real world", parent: "igcse-t1-2", order: 3, visibleToStudents: true },

  // Topic 2: Programming
  { id: "igcse-t2", name: "Topic 2: Programming", parent: "igcse", order: 2, visibleToStudents: true },
  { id: "igcse-t2-1", name: "2.1 Develop code", parent: "igcse-t2", order: 1, visibleToStudents: true },
  { id: "igcse-t2-1-1", name: "2.1.1 Writing readable code (Comments, meaningful names, indentation)", parent: "igcse-t2-1", order: 1, visibleToStudents: true },
  { id: "igcse-t2-1-2", name: "2.1.2 Error types: Syntax, runtime and logic errors", parent: "igcse-t2-1", order: 2, visibleToStudents: true },
  { id: "igcse-t2-1-3", name: "2.1.3 Test plans and test data (Normal, boundary, erroneous)", parent: "igcse-t2-1", order: 3, visibleToStudents: true },
  { id: "igcse-t2-1-4", name: "2.1.4 Trace tables & diagnosing code state", parent: "igcse-t2-1", order: 4, visibleToStudents: true },

  { id: "igcse-t2-2", name: "2.2 Constructs", parent: "igcse-t2", order: 2, visibleToStudents: true },
  { id: "igcse-t2-2-1", name: "2.2.1 Program structure, variables, commands & subprograms", parent: "igcse-t2-2", order: 1, visibleToStudents: true },
  { id: "igcse-t2-2-2", name: "2.2.2 Sequencing, selection and iteration in code", parent: "igcse-t2-2", order: 2, visibleToStudents: true },

  { id: "igcse-t2-3", name: "2.3 Data types and structures", parent: "igcse-t2", order: 3, visibleToStudents: true },
  { id: "igcse-t2-3-1", name: "2.3.1 Primitive data types: Integer, real, Boolean, char, string", parent: "igcse-t2-3", order: 1, visibleToStudents: true },
  { id: "igcse-t2-3-2", name: "2.3.2 1D and 2D arrays & record structures", parent: "igcse-t2-3", order: 2, visibleToStudents: true },
  { id: "igcse-t2-3-3", name: "2.3.3 String manipulation techniques", parent: "igcse-t2-3", order: 3, visibleToStudents: true },
  { id: "igcse-t2-3-4", name: "2.3.4 Constants, global and local variables", parent: "igcse-t2-3", order: 4, visibleToStudents: true },

  { id: "igcse-t2-4", name: "2.4 Input/output", parent: "igcse-t2", order: 4, visibleToStudents: true },
  { id: "igcse-t2-4-1", name: "2.4.1 Interactive user input and output handling", parent: "igcse-t2-4", order: 1, visibleToStudents: true },
  { id: "igcse-t2-4-2", name: "2.4.2 Input validation techniques", parent: "igcse-t2-4", order: 2, visibleToStudents: true },
  { id: "igcse-t2-4-3", name: "2.4.3 Reading and writing to sequential text files", parent: "igcse-t2-4", order: 3, visibleToStudents: true },

  { id: "igcse-t2-5", name: "2.5 Operators", parent: "igcse-t2", order: 5, visibleToStudents: true },
  { id: "igcse-t2-5-1", name: "2.5.1 Arithmetic operators (Add, subtract, multiply, DIV, MOD, exponent)", parent: "igcse-t2-5", order: 1, visibleToStudents: true },
  { id: "igcse-t2-5-2", name: "2.5.2 Relational operators (=, <>, >, <, >=, <=)", parent: "igcse-t2-5", order: 2, visibleToStudents: true },
  { id: "igcse-t2-5-3", name: "2.5.3 Logic operators (AND, OR, NOT)", parent: "igcse-t2-5", order: 3, visibleToStudents: true },

  { id: "igcse-t2-6", name: "2.6 Subprograms", parent: "igcse-t2", order: 6, visibleToStudents: true },
  { id: "igcse-t2-6-1", name: "2.6.1 User-defined procedures and functions", parent: "igcse-t2-6", order: 1, visibleToStudents: true },
  { id: "igcse-t2-6-2", name: "2.6.2 Passing parameters by value and returning data", parent: "igcse-t2-6", order: 2, visibleToStudents: true },

  // Topic 3: Data
  { id: "igcse-t3", name: "Topic 3: Data", parent: "igcse", order: 3, visibleToStudents: true },
  { id: "igcse-t3-1", name: "3.1 Binary", parent: "igcse-t3", order: 1, visibleToStudents: true },
  { id: "igcse-t3-1-1", name: "3.1.1 Binary data representation for instructions and data", parent: "igcse-t3-1", order: 1, visibleToStudents: true },
  { id: "igcse-t3-1-2", name: "3.1.2 Unsigned and signed integers (Sign-and-magnitude, two's complement)", parent: "igcse-t3-1", order: 2, visibleToStudents: true },
  { id: "igcse-t3-1-3", name: "3.1.3 Conversions between binary and denary (0-255)", parent: "igcse-t3-1", order: 3, visibleToStudents: true },
  { id: "igcse-t3-1-4", name: "3.1.4 Binary addition, logical & arithmetic shifts and overflow", parent: "igcse-t3-1", order: 4, visibleToStudents: true },
  { id: "igcse-t3-1-5", name: "3.1.5 Hexadecimal notation and conversions", parent: "igcse-t3-1", order: 5, visibleToStudents: true },

  { id: "igcse-t3-2", name: "3.2 Data representation", parent: "igcse-t3", order: 2, visibleToStudents: true },
  { id: "igcse-t3-2-1", name: "3.2.1 Character sets: ASCII and Unicode", parent: "igcse-t3-2", order: 1, visibleToStudents: true },
  { id: "igcse-t3-2-2", name: "3.2.2 Bitmap graphics: Pixels, resolution and colour depth", parent: "igcse-t3-2", order: 2, visibleToStudents: true },
  { id: "igcse-t3-2-3", name: "3.2.3 Sound representation: Analogue to digital, sampling rate", parent: "igcse-t3-2", order: 3, visibleToStudents: true },

  { id: "igcse-t3-3", name: "3.3 Data storage and compression", parent: "igcse-t3", order: 3, visibleToStudents: true },
  { id: "igcse-t3-3-1", name: "3.3.1 Storage multiples: Bits, bytes, KiB/MiB/GiB vs kB/MB/GB", parent: "igcse-t3-3", order: 1, visibleToStudents: true },
  { id: "igcse-t3-3-2", name: "3.3.2 Compression methods: Lossy vs Lossless", parent: "igcse-t3-3", order: 2, visibleToStudents: true },
  { id: "igcse-t3-3-3", name: "3.3.3 Run-length encoding (RLE) algorithms", parent: "igcse-t3-3", order: 3, visibleToStudents: true },
  { id: "igcse-t3-3-4", name: "3.3.4 Calculating storage sizes for text, images and audio", parent: "igcse-t3-3", order: 4, visibleToStudents: true },

  { id: "igcse-t3-4", name: "3.4 Encryption", parent: "igcse-t3", order: 4, visibleToStudents: true },
  { id: "igcse-t3-4-1", name: "3.4.1 Need for encryption & cryptography principles", parent: "igcse-t3-4", order: 1, visibleToStudents: true },
  { id: "igcse-t3-4-2", name: "3.4.2 Classic ciphers: Caesar, Pigpen, Vigenère and Rail Fence", parent: "igcse-t3-4", order: 2, visibleToStudents: true },

  // Topic 4: Computers
  { id: "igcse-t4", name: "Topic 4: Computers", parent: "igcse", order: 4, visibleToStudents: true },
  { id: "igcse-t4-1", name: "4.1 Machines and computational modelling", parent: "igcse-t4", order: 1, visibleToStudents: true },
  { id: "igcse-t4-1-1", name: "4.1.1 Input-Process-Output (IPO) model", parent: "igcse-t4-1", order: 1, visibleToStudents: true },
  { id: "igcse-t4-1-2", name: "4.1.2 Computational models: Sequential, parallel and multi-agent", parent: "igcse-t4-1", order: 2, visibleToStudents: true },

  { id: "igcse-t4-2", name: "4.2 Hardware", parent: "igcse-t4", order: 2, visibleToStudents: true },
  { id: "igcse-t4-2-1", name: "4.2.1 Hardware components: CPU, main memory, storage, I/O devices", parent: "igcse-t4-2", order: 1, visibleToStudents: true },
  { id: "igcse-t4-2-2", name: "4.2.2 Memory types: RAM, ROM, cache and virtual memory", parent: "igcse-t4-2", order: 2, visibleToStudents: true },
  { id: "igcse-t4-2-3", name: "4.2.3 Von Neumann architecture & the fetch-decode-execute cycle", parent: "igcse-t4-2", order: 3, visibleToStudents: true },
  { id: "igcse-t4-2-4", name: "4.2.4 CPU performance factors: Clock speed, cores and cache size", parent: "igcse-t4-2", order: 4, visibleToStudents: true },
  { id: "igcse-t4-2-5", name: "4.2.5 Physical storage technologies: Magnetic, optical and solid state", parent: "igcse-t4-2", order: 5, visibleToStudents: true },
  { id: "igcse-t4-2-6", name: "4.2.6 Cloud storage and embedded systems", parent: "igcse-t4-2", order: 6, visibleToStudents: true },

  { id: "igcse-t4-3", name: "4.3 Logic", parent: "igcse-t4", order: 3, visibleToStudents: true },
  { id: "igcse-t4-3-1", name: "4.3.1 Truth tables for AND, OR, and NOT gates", parent: "igcse-t4-3", order: 1, visibleToStudents: true },
  { id: "igcse-t4-3-2", name: "4.3.2 Formulating Boolean logic statements for real problems", parent: "igcse-t4-3", order: 2, visibleToStudents: true },

  { id: "igcse-t4-4", name: "4.4 Software", parent: "igcse-t4", order: 4, visibleToStudents: true },
  { id: "igcse-t4-4-1", name: "4.4.1 Operating system functions: File, process & hardware management", parent: "igcse-t4-4", order: 1, visibleToStudents: true },
  { id: "igcse-t4-4-2", name: "4.4.2 Utility software: Antivirus, backup, defragmentation, compression", parent: "igcse-t4-4", order: 2, visibleToStudents: true },
  { id: "igcse-t4-4-3", name: "4.4.3 Application vs system software and simulations", parent: "igcse-t4-4", order: 3, visibleToStudents: true },

  { id: "igcse-t4-5", name: "4.5 Programming languages", parent: "igcse-t4", order: 5, visibleToStudents: true },
  { id: "igcse-t4-5-1", name: "4.5.1 High-level vs low-level languages & machine code", parent: "igcse-t4-5", order: 1, visibleToStudents: true },
  { id: "igcse-t4-5-2", name: "4.5.2 Translators: Compilers, interpreters and assemblers", parent: "igcse-t4-5", order: 2, visibleToStudents: true },

  // Topic 5: Communication and the internet
  { id: "igcse-t5", name: "Topic 5: Communication and the internet", parent: "igcse", order: 5, visibleToStudents: true },
  { id: "igcse-t5-1", name: "5.1 Networks", parent: "igcse-t5", order: 1, visibleToStudents: true },
  { id: "igcse-t5-1-1", name: "5.1.1 Network benefits and types: LAN, WAN, PAN", parent: "igcse-t5-1", order: 1, visibleToStudents: true },
  { id: "igcse-t5-1-2", name: "5.1.2 Topologies: Bus, star, ring and mesh", parent: "igcse-t5-1", order: 2, visibleToStudents: true },
  { id: "igcse-t5-1-3", name: "5.1.3 Network protocols & 4-layer TCP/IP model", parent: "igcse-t5-1", order: 3, visibleToStudents: true },
  { id: "igcse-t5-1-4", name: "5.1.4 Data transmission speeds & mobile standards (3G, 4G, 5G)", parent: "igcse-t5-1", order: 4, visibleToStudents: true },

  { id: "igcse-t5-2", name: "5.2 Network security", parent: "igcse-t5", order: 2, visibleToStudents: true },
  { id: "igcse-t5-2-1", name: "5.2.1 Cyber attack vectors (Phishing, malware, unpatched systems)", parent: "igcse-t5-2", order: 1, visibleToStudents: true },
  { id: "igcse-t5-2-2", name: "5.2.2 Security testing: Penetration testing and ethical hacking", parent: "igcse-t5-2", order: 2, visibleToStudents: true },
  { id: "igcse-t5-2-3", name: "5.2.3 Protective measures: Firewalls, authentication, secure coding", parent: "igcse-t5-2", order: 3, visibleToStudents: true },

  { id: "igcse-t5-3", name: "5.3 The internet and the world wide web", parent: "igcse-t5", order: 3, visibleToStudents: true },
  { id: "igcse-t5-3-1", name: "5.3.1 Structure of the Internet & DNS system", parent: "igcse-t5-3", order: 1, visibleToStudents: true },
  { id: "igcse-t5-3-2", name: "5.3.2 World Wide Web components: URLs, HTTP/HTTPS, HTML", parent: "igcse-t5-3", order: 2, visibleToStudents: true },
  { id: "igcse-t5-3-3", name: "5.3.3 Internet hardware: Modems, routers, switches and WAPs", parent: "igcse-t5-3", order: 3, visibleToStudents: true },

  // Topic 6: The bigger picture
  { id: "igcse-t6", name: "Topic 6: The bigger picture", parent: "igcse", order: 6, visibleToStudents: true },
  { id: "igcse-t6-1", name: "6.1 Emerging trends, issues and impact", parent: "igcse-t6", order: 1, visibleToStudents: true },
  { id: "igcse-t6-1-1", name: "6.1.1 Environmental impacts: Energy consumption and e-waste", parent: "igcse-t6-1", order: 1, visibleToStudents: true },
  { id: "igcse-t6-1-2", name: "6.1.2 Ethical and social impacts of digital technology", parent: "igcse-t6-1", order: 2, visibleToStudents: true },
  { id: "igcse-t6-1-3", name: "6.1.3 Legal frameworks, intellectual property, copyrights & patents", parent: "igcse-t6-1", order: 3, visibleToStudents: true },
  { id: "igcse-t6-1-4", name: "6.1.4 Emerging technologies: Quantum, DNA computing & AI", parent: "igcse-t6-1", order: 4, visibleToStudents: true }
];

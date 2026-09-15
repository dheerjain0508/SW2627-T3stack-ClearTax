# ClearTax - Mock UI

## 1. Product Overview

**ClearTax** is a web application for bulk invoice reconciliation.

### Core Workflow

**Upload CSV → Process Invoices → Validate → Review Results**

---

# 2. Landing Page

## Layout

```text
┌─────────────────────────────────────────────────────────────┐
│                         CLEARTAX                            │
│                                                             │
│                    Bulk Invoicing,                          │
│                       Redefined.                            │
│                                                             │
│     Upload, validate, and manage bulk invoices              │
│     through a simple CSV-based workflow.                    │
│                                                             │
│                       [ Get Started ]                       │
│                                                             │
│     ✓ Secure Authentication   ⚡ Bulk Processing           │
│     📊 Processing Tracking                                  │
└─────────────────────────────────────────────────────────────┘

Features
┌──────────────────┐ ┌──────────────────┐
│   CSV Upload     │ │ Bulk Processing  │
│                  │ │                  │
│ Upload multiple  │ │ Process multiple │
│ invoices using   │ │ invoices in one  │
│ a CSV file.      │ │ workflow.        │
└──────────────────┘ └──────────────────┘

┌──────────────────┐ ┌──────────────────┐
│ Invoice          │ │ Processing       │
│ Validation       │ │ Status           │
│                  │ │                  │
│ Identify invoice │ │ Track processing │
│ errors and       │ │ results from the │
│ mismatches.      │ │ dashboard.       │
└──────────────────┘ └──────────────────┘
Why ClearTax?
Less Manual Work
Better Visibility
Centralized Workflow
Faster Review
How It Works
01                02                03                04

Upload CSV   →   Process        →   Validate       →   Review
                 Invoices           Records            Results
Final CTA
┌─────────────────────────────────────────────────────┐
│                                                     │
│      Ready to Simplify Your Invoice Processing?     │
│                                                     │
│              [ Get Started ]                        │
│                                                     │
└─────────────────────────────────────────────────────┘
3. Login Page
┌──────────────────────────────────────┐
│                                      │
│   ←                                  │
│                                      │
│              🔐                      │
│                                      │
│          Welcome Back                │
│                                      │
│   Email                              │
│   ┌──────────────────────────────┐   │
│   │ Enter your email             │   │
│   └──────────────────────────────┘   │
│                                      │
│   Password                           │
│   ┌──────────────────────────────┐   │
│   │ Enter your password          │   │
│   └──────────────────────────────┘   │
│                                      │
│          [ Login ]                   │
│                                      │
│       Don't have an account?         │
│              Sign Up                 │
│                                      │
└──────────────────────────────────────┘
Navigation
Back → Landing Page
Login → Dashboard
Sign Up → Signup Page
4. Signup Page
┌──────────────────────────────────────┐
│                                      │
│   ←                                  │
│                                      │
│              👤                      │
│                                      │
│        Create an Account             │
│                                      │
│   Name                               │
│   ┌──────────────────────────────┐   │
│   │ Enter your name              │   │
│   └──────────────────────────────┘   │
│                                      │
│   Email                              │
│   ┌──────────────────────────────┐   │
│   │ Enter your email             │   │
│   └──────────────────────────────┘   │
│                                      │
│   Password                           │
│   ┌──────────────────────────────┐   │
│   │ Create a password             │   │
│   └──────────────────────────────┘   │
│                                      │
│          [ Create Account ]           │
│                                      │
│        Already registered?            │
│              Login                   │
│                                      │
└──────────────────────────────────────┘
Navigation
Back → Landing Page
Signup → Dashboard
Login → Login Page
5. Dashboard
Header
┌──────────────────────────────────────────────────────────────┐
│  👤 Dheer Jain                         [ History ] [ Sign Out ]│
│     dheer@email.com                                         │
└──────────────────────────────────────────────────────────────┘
Reconciliation Summary
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Total        │ │ Matched      │ │ Partial      │ │ Unpaid       │
│ Invoices     │ │              │ │ Paid         │ │              │
│     25       │ │      18      │ │      3       │ │      2       │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Overpaid     │ │ Failed       │ │ Overdue      │
│      1       │ │      1       │ │      4       │
└──────────────┘ └──────────────┘ └──────────────┘
6. Financial Overview
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Invoice Value  │ │ Total Tax      │ │ Total Payable  │
│ ₹2,50,000      │ │ ₹45,000        │ │ ₹2,95,000      │
└────────────────┘ └────────────────┘ └────────────────┘

┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ Total Paid     │ │ Outstanding    │ │ Overpaid       │
│ ₹2,10,000      │ │ ₹85,000        │ │ ₹5,000         │
└────────────────┘ └────────────────┘ └────────────────┘
7. CSV Upload
Empty State
┌─────────────────────────────────────────────────────┐
│                                                     │
│                    ☁ Upload                         │
│                                                     │
│             Drag & Drop your CSV here              │
│                                                     │
│             or click to browse files               │
│                                                     │
└─────────────────────────────────────────────────────┘
File Selected
┌─────────────────────────────────────────────────────┐
│                    📄 invoices.csv                  │
│                       25 KB                         │
│                                                     │
│              [ Process CSV Now ]                    │
└─────────────────────────────────────────────────────┘
Processing
Processing Invoices...                           75%

[██████████████████████████████░░░░░░░░░░]
Complete
Processing Complete                              100%

[████████████████████████████████████████████]
8. Invoice Results
┌─────────────────────────────────────────────────────────────────────┐
│ Invoices                              [ Upload Another Batch ]      │
├─────────┬──────────┬──────────┬─────────┬────────┬────────┬─────────┤
│ Invoice │ Contact  │ Date     │ Due     │ Total  │ Paid   │ Due     │
├─────────┼──────────┼──────────┼─────────┼────────┼────────┼─────────┤
│ INV001  │ Customer │ 01 Sep   │ 15 Sep  │ ₹5000  │ ₹5000  │ ₹0      │
│ INV002  │ Customer │ 02 Sep   │ 16 Sep  │ ₹8000  │ ₹4000  │ ₹4000   │
│ INV003  │ Customer │ 03 Sep   │ 17 Sep  │ ₹3000  │ ₹0     │ ₹3000   │
└─────────┴──────────┴──────────┴─────────┴────────┴────────┴─────────┘
Status
Matched       ✓
Partially Paid  ◷
Unpaid        !
Overpaid      ✓
Failed        ✕
Timing
On Time      ✓
Late         ◷
Overdue      !
Pending      ...
9. Invoice History

Clicking History opens a right-side panel.

┌───────────────────────────────────┐
│ Invoice History                 X │
├───────────────────────────────────┤
│                                   │
│ INV003                    ₹3000   │
│ Customer C                Unpaid  │
│                                   │
├───────────────────────────────────┤
│ INV002                    ₹8000   │
│ Customer B          Partially Paid│
│                                   │
├───────────────────────────────────┤
│ INV001                    ₹5000   │
│ Customer A                Matched │
│                                   │
└───────────────────────────────────┘

Selecting an invoice opens its details.

10. Invoice Details
┌───────────────────────────────────┐
│ Invoice Details                X  │
├───────────────────────────────────┤
│                                   │
│ Invoice Number                    │
│ INV001                            │
│                                   │
│ Contact             Customer A    │
│ Invoice Date        01 Sep 2026   │
│ Due Date            15 Sep 2026   │
│ Invoice Value       ₹4,500        │
│ Tax                 ₹500          │
│ Total Payable       ₹5,000        │
│ Paid Amount         ₹5,000        │
│ Amount Due          ₹0            │
│ Paid Date           10 Sep 2026   │
│                                   │
│ Payment Status      ✓ Matched     │
│ Timing Status       ✓ On Time     │
│                                   │
└───────────────────────────────────┘
11. Upload Another Batch
Current Batch
      ↓
[ Upload Another Batch ]
      ↓
Current table cleared
      ↓
Select new CSV
      ↓
Process new batch

Previously processed invoices remain accessible through Invoice History.

12. Navigation Map
                     ┌───────────────┐
                     │ Landing Page  │
                     └───────┬───────┘
                             │
                ┌────────────┴────────────┐
                ↓                         ↓
        ┌───────────────┐         ┌───────────────┐
        │     Login     │         │    Signup     │
        └───────┬───────┘         └───────┬───────┘
                │                         │
                └────────────┬────────────┘
                             ↓
                     ┌───────────────┐
                     │   Dashboard   │
                     └───────┬───────┘
                             │
                ┌────────────┼────────────┐
                ↓            ↓            ↓
           CSV Upload     History     Invoice View
13. Design Guidelines
Colors
Purpose	Direction
Background	Cream / Beige
Primary	Brown
Cards	White
Success	Green
Warning	Orange
Error	Red
Secondary	Muted Brown
Components
Rounded cards
Rounded buttons
Soft borders
Status badges
Responsive grids
Horizontal scrolling for invoice tables
Slide-in History panel
Slide-in Invoice Details panel
Subtle animations
14. Final UX Goal

The ClearTax interface should make the invoice workflow feel simple:

Upload → Process → Validate → Review

The primary goal is to reduce manual invoice processing while providing clear visibility into payment status, timing status, financial information, and invoice history.


This one is much more suitable for a **Mock UI submission** because it actually shows the screens and user flow instead of becoming a wall of specification text.
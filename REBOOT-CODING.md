
---

## Remote Reboot Management

NannyAPI provides a complete remote reboot system that allows users to reboot agents (hosts or LXC containers) directly from the API.

### Reboot Architecture

```flowchart
┌──────────────────────────────────────────────────────────────┐
│                    REBOOT WORKFLOW                           │
└──────────────────────────────────────────────────────────────┘

1. USER INITIATES REBOOT
   └─> POST /api/reboot
       {
         "agent_id": "abc123",
         "lxc_id": "lxc100",   // Optional: for LXC container
         "reason": "Monthly maintenance",
         "timeout_seconds": 300
       }

2. API CREATES REBOOT OPERATION
   ├─> Verify user owns agent
   ├─> Check no pending reboot exists
   ├─> Create reboot_operations record (status: pending)
   ├─> Set agent.pending_reboot_id
   └─> Status changes to "sent"

3. AGENT RECEIVES VIA REALTIME
   └─> Agent subscribes to reboot_operations collection
   └─> Receives standard PocketBase record event

4. AGENT ACKNOWLEDGES
   └─> POST /api/reboot/{id}/acknowledge
   └─> Status: "sent" → "rebooting"

5. AGENT EXECUTES REBOOT
   ├─> For host: systemctl reboot (or equivalent)
   └─> For LXC: pct reboot <vmid>

6. AGENT RECONNECTS
   └─> Agent metrics update last_seen

7. API MONITORS COMPLETION
   ├─> Background job checks every 30s
   ├─> If last_seen > acknowledged_at → completed
   ├─> If timeout exceeded → timeout
   └─> Clears agent.pending_reboot_id
```

### Reboot Statuses

| Status | Description |
|--------|-------------|
| `pending` | Reboot operation created, waiting to send |
| `sent` | Command sent via realtime, awaiting agent acknowledgment |
| `rebooting` | Agent acknowledged, reboot in progress |
| `completed` | Agent reconnected after reboot |
| `failed` | Reboot failed (agent reported error) |
| `timeout` | Agent did not reconnect within timeout period |

### API Endpoints

#### Create Reboot (User Only)

```bash
POST /api/reboot
Authorization: Bearer <user_token>

{
  "agent_id": "abc123xyz",
  "lxc_id": "lxc456",           # Optional
  "reason": "Security patches",  # Optional
  "timeout_seconds": 300         # Optional, default 300 (5 min)
}
```

**Response:**
```json
{
  "success": true,
  "reboot_id": "reb123",
  "status": "sent",
  "message": "Reboot command sent. Agent will receive via realtime subscription."
}
```

> **Security Note:** Only authenticated **users** can initiate reboots. Agents cannot reboot themselves via API.

#### List Reboots

```bash
GET /api/reboot?agent_id=abc123&status=completed
Authorization: Bearer <user_token>
```

#### Acknowledge Reboot (Agent Only)

```bash
POST /api/reboot/{id}/acknowledge
Authorization: Bearer <agent_token>
```

### Realtime Subscription for Agents

Agents must subscribe to `reboot_operations` collection changes for their `agent_id`. When a reboot is created, agents receive the standard PocketBase realtime event containing the record:

```json
{
  "action": "create",
  "record": {
    "id": "reb123",
    "agent_id": "abc123xyz",
    "lxc_id": "lxc456",
    "vmid": 100,
    "status": "sent",
    "reason": "Monthly maintenance",
    "timeout_seconds": 300,
    "requested_at": "2026-01-24T10:30:00Z"
  }
}
```

**Agent Implementation:**
1. Subscribe to realtime changes on `reboot_operations`
2. Filter for records where `agent_id` matches
3. On receiving a record with `status: "sent"`:
   - Call `POST /api/reboot/{id}/acknowledge`
   - Execute reboot command:
     - **Host:** `systemctl reboot` or `shutdown -r now`
     - **LXC:** `pct reboot <vmid>` (via Proxmox API or CLI)
4. After reboot, normal metrics ingestion updates `last_seen`
5. API auto-detects reconnection and marks complete

### Scheduled Reboots

Similar to patch scheduling, you can schedule recurring reboots via `reboot_schedules` collection.

**Features:**
- Standard cron expressions
- **Uniqueness Constraint**: One schedule per agent/LXC
- Automatic `reboot_operations` creation at scheduled time

**Creating a Reboot Schedule:**

```bash
POST /api/collections/reboot_schedules/records
Authorization: Bearer <user_token>

{
  "user_id": "<your_user_id>",
  "agent_id": "abc123host",
  "lxc_id": "lxc100",           // Optional: Omit for host
  "cron_expression": "0 4 * * 0", // Weekly Sunday 4 AM
  "reason": "Weekly maintenance window",
  "is_active": true
}
```

**Response includes:**
- `next_run_at`: Calculated next execution time
- `last_run_at`: Last execution (if any)

### Reboot Verification

The API automatically verifies successful reboots by:

1. **Setting `pending_reboot_id`** on agent when reboot created
2. **Monitoring `last_seen`** timestamp after acknowledgment
3. **Comparing timestamps**: If `last_seen > acknowledged_at`, reboot succeeded
4. **Clearing `pending_reboot_id`** and setting status to `completed`

**Timeout Handling:**
- Default timeout: 300 seconds (5 minutes)
- If agent doesn't reconnect within timeout:
  - Status set to `timeout`
  - `error_message`: "Agent did not reconnect within timeout period"
  - `pending_reboot_id` cleared

### Collections Reference

#### reboot_operations

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | relation | User who initiated |
| `agent_id` | relation | Target agent |
| `lxc_id` | relation | Optional LXC target |
| `status` | select | pending/sent/rebooting/completed/failed/timeout |
| `reason` | text | User-provided reason |
| `requested_at` | date | When reboot was requested |
| `acknowledged_at` | date | When agent acknowledged |
| `completed_at` | date | When agent reconnected |
| `error_message` | text | Error details if failed |
| `timeout_seconds` | number | Timeout in seconds |

#### reboot_schedules

| Field | Type | Description |
|-------|------|-------------|
| `user_id` | relation | Schedule owner |
| `agent_id` | relation | Target agent |
| `lxc_id` | relation | Optional LXC target |
| `cron_expression` | text | Standard cron format |
| `reason` | text | Reason for scheduled reboot |
| `next_run_at` | date | Next scheduled execution |
| `last_run_at` | date | Last execution time |
| `is_active` | bool | Enable/disable schedule |

---

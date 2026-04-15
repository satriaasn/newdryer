# AI Agent Specification: Dryering Insights Agent

## 1. Role Definition
**Name**: Dryering Insights Agent (DIA)
**Role**: Proactive monitoring and advisory assistant for dryer operations.
**Standar**: Built on Model Context Protocol (MCP).

## 2. Dynamic Decision Matrix
The agent evaluates the current throughput and moisture data to recommend operational adjustments.

| Condition | Data Point | Agent Action |
|-----------|------------|--------------|
| Idle > 24h | `last_telemetry` | Ping operator via WhatsApp Gateway |
| Low Efficiency | `moisture_diff < 5%` | Suggest temperature adjustment |
| High Humidity | `external_weather == rain` | Advise closure of ventilation |

## 3. Spec Driven Integration
Developers wishing to extend the agent must:
1.  Define the new capability in `docs/specs/`.
2.  Update the MCP Tool definition in `lib/mcp/tools.ts`.
3.  Implement the logic in `lib/mcp/agent.ts`.

## 4. MCP Schema (Draft)
```json
{
  "name": "get_dryer_context",
  "description": "Retrieve current status for a specific dryer unit",
  "parameters": {
    "gapoktan_id": "string",
    "include_weather": "boolean"
  }
}
```

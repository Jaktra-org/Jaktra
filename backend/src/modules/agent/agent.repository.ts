import { eq, desc, and, sql } from 'drizzle-orm';
import { agentRuns, type AgentRun, type NewAgentRun } from '../../db/schema.js';
import type { DatabaseClient } from '../../db/index.js';
import crypto from 'crypto';

export class AgentRepository {
  constructor(private readonly db: DatabaseClient) {}

  async createRun(run: NewAgentRun): Promise<AgentRun> {
    const id = run.id || crypto.randomUUID();
    const data = { ...run, id };
    await this.db.insert(agentRuns).values(data);
    const [row] = await this.db.select().from(agentRuns).where(eq(agentRuns.id, id)).limit(1);
    return row!;
  }

  async updateRun(id: string, tenantId: string, updates: Partial<Omit<AgentRun, 'id' | 'tenantId' | 'createdAt'>>): Promise<AgentRun | undefined> {
    await this.db
      .update(agentRuns)
      .set(updates)
      .where(and(eq(agentRuns.id, id), eq(agentRuns.tenantId, tenantId)));
    return this.getRunById(id, tenantId);
  }

  async recordBounce(id: string, tenantId: string): Promise<void> {
    await this.db
      .update(agentRuns)
      .set({
        emailsSent: sql`GREATEST(0, ${agentRuns.emailsSent} - 1)`,
        errors: sql`${agentRuns.errors} + 1`,
      })
      .where(and(eq(agentRuns.id, id), eq(agentRuns.tenantId, tenantId)));
  }

  async getRuns(tenantId: string, limit = 50, offset = 0): Promise<AgentRun[]> {
    return this.db
      .select()
      .from(agentRuns)
      .where(eq(agentRuns.tenantId, tenantId))
      .orderBy(desc(agentRuns.startTime))
      .limit(limit)
      .offset(offset);
  }

  async getRunById(id: string, tenantId: string): Promise<AgentRun | undefined> {
    const [run] = await this.db
      .select()
      .from(agentRuns)
      .where(and(eq(agentRuns.id, id), eq(agentRuns.tenantId, tenantId)));
    return run;
  }
}

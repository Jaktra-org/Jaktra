import { eq, and } from 'drizzle-orm';
import { agentRunChunks, type AgentRunChunk, type NewAgentRunChunk } from '../../db/schema.js';
import type { DatabaseClient } from '../../db/index.js';

export class AgentChunkRepository {
  constructor(private readonly db: DatabaseClient) {}

  async createChunks(chunks: NewAgentRunChunk[]): Promise<AgentRunChunk[]> {
    if (chunks.length === 0) return [];
    return this.db.insert(agentRunChunks).values(chunks).returning();
  }

  async updateChunk(
    id: string,
    tenantId: string,
    updates: Partial<Omit<AgentRunChunk, 'id' | 'tenantId' | 'createdAt'>>
  ): Promise<AgentRunChunk | undefined> {
    const [updated] = await this.db
      .update(agentRunChunks)
      .set(updates)
      .where(and(eq(agentRunChunks.id, id), eq(agentRunChunks.tenantId, tenantId)))
      .returning();
    return updated;
  }

  async getChunksByRunId(runId: string, tenantId: string): Promise<AgentRunChunk[]> {
    return this.db
      .select()
      .from(agentRunChunks)
      .where(and(eq(agentRunChunks.runId, runId), eq(agentRunChunks.tenantId, tenantId)));
  }
}

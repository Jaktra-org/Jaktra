import { eq, and, inArray } from 'drizzle-orm';
import { agentRunChunks, type AgentRunChunk, type NewAgentRunChunk } from '../../db/schema.js';
import type { DatabaseClient } from '../../db/index.js';
import crypto from 'crypto';

export class AgentChunkRepository {
  constructor(private readonly db: DatabaseClient) { }

  async createChunks(chunks: NewAgentRunChunk[]): Promise<AgentRunChunk[]> {
    if (chunks.length === 0) return [];
    const items = chunks.map((item) => ({
      ...item,
      id: item.id || crypto.randomUUID(),
    }));
    const ids = items.map((item) => item.id);
    await this.db.insert(agentRunChunks).values(items);
    return await this.db
      .select()
      .from(agentRunChunks)
      .where(inArray(agentRunChunks.id, ids));
  }

  async updateChunk(
    id: string,
    tenantId: string,
    updates: Partial<Omit<AgentRunChunk, 'id' | 'tenantId' | 'createdAt'>>
  ): Promise<AgentRunChunk | undefined> {
    await this.db
      .update(agentRunChunks)
      .set(updates)
      .where(and(eq(agentRunChunks.id, id), eq(agentRunChunks.tenantId, tenantId)));
    
    const [row] = await this.db
      .select()
      .from(agentRunChunks)
      .where(and(eq(agentRunChunks.id, id), eq(agentRunChunks.tenantId, tenantId)))
      .limit(1);
    return row;
  }

  async getChunksByRunId(runId: string, tenantId: string): Promise<AgentRunChunk[]> {
    return this.db
      .select()
      .from(agentRunChunks)
      .where(and(eq(agentRunChunks.runId, runId), eq(agentRunChunks.tenantId, tenantId)));
  }
}


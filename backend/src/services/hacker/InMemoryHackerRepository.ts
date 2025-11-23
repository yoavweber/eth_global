import { HackerRepository, HackerProfile } from '../../interfaces/HackerRepository.js';

export class InMemoryHackerRepository implements HackerRepository {
    private store: Map<string, HackerProfile> = new Map();

    upsertFromNameService(input: { walletAddress: string; username: string }): void {
        const key = this.normalizeAddress(input.walletAddress);
        const existing = this.store.get(key) ?? { walletAddress: key, skills: [] };

        const updated: HackerProfile = {
            ...existing,
            walletAddress: key,
            username: input.username,
            skills: existing.skills ?? []
        };

        this.store.set(key, updated);
    }

    upsertSkills(input: { walletAddress: string; skills: string[] }): void {
        const key = this.normalizeAddress(input.walletAddress);
        const existing = this.store.get(key) ?? { walletAddress: key, skills: [] };

        const mergedSkills = Array.from(new Set([...(existing.skills ?? []), ...input.skills]));

        const updated: HackerProfile = {
            ...existing,
            walletAddress: key,
            skills: mergedSkills
        };

        this.store.set(key, updated);
    }

    getByWallet(walletAddress: string): HackerProfile | null {
        const key = this.normalizeAddress(walletAddress);
        return this.store.get(key) ?? null;
    }

    getAll(): HackerProfile[] {
        return Array.from(this.store.values());
    }

    private normalizeAddress(address: string): string {
        return address.toLowerCase();
    }
}


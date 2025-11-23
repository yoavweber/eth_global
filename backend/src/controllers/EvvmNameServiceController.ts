import { Request, Response } from 'express';

import { AppDependencies } from '../container.js';
import {
    EvvmNameServiceSyncRequestSchema,
    EvvmNameServiceSyncRequest,
    EvvmNameServiceSyncResponse,
    EvvmOnboardingRequestSchema,
    EvvmOnboardingRequest,
    EvvmOnboardingResponse,
    HackersDebugResponse
} from '../schemas/evvmSchemas.js';
import { ErrorResponse } from '../schemas/bookingSchemas.js';

export class EvvmNameServiceController {
    private hackerRepository: AppDependencies['hackerRepository'];
    private evvmNameServiceClient: AppDependencies['evvmNameServiceClient'];

    constructor(dependencies: AppDependencies) {
        this.hackerRepository = dependencies.hackerRepository;
        this.evvmNameServiceClient = dependencies.evvmNameServiceClient;
    }

    /**
     * @swagger
     * /internal/evvm/name-service/sync:
     *   post:
     *     summary: Sync EVVM NameService registrations into the in-memory hacker repository
     *     description: >
     *       Reads EVVM NameService registrations for the given block range and upserts them into
     *       an in-memory HackerRepository. Intended for internal use and local development.
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/EvvmNameServiceSyncRequest'
     *     responses:
     *       200:
     *         description: Sync completed successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/EvvmNameServiceSyncResponse'
     *       400:
     *         description: Invalid request body
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Internal server error
     */
    async syncNameService(
        req: Request<{}, EvvmNameServiceSyncResponse | ErrorResponse, EvvmNameServiceSyncRequest>,
        res: Response<EvvmNameServiceSyncResponse | ErrorResponse>
    ): Promise<void> {
        try {
            const body = req.body ?? {};
            const parsed = EvvmNameServiceSyncRequestSchema.parse(body);

            const fromBlock = parsed.fromBlock ?? 0;
            const toBlock = parsed.toBlock ?? 'latest';

            const registrations = await this.evvmNameServiceClient.getRegisteredUsernames(fromBlock, toBlock);

            registrations.forEach(({ walletAddress, username }) => {
                this.hackerRepository.upsertFromNameService({ walletAddress, username });
            });

            const response: EvvmNameServiceSyncResponse = {
                synced: registrations.length
            };

            res.json(response);
        } catch (error) {
            console.error('EVVM NameService sync error:', error);
            if (error instanceof Error && error.name === 'ZodError') {
                const errorResponse: ErrorResponse = { error: error.message };
                res.status(400).json(errorResponse);
                return;
            }
            const errorResponse: ErrorResponse = { error: 'Internal Server Error' };
            res.status(500).json(errorResponse);
        }
    }

    /**
     * @swagger
     * /api/onboarding/evvm-name-service:
     *   post:
     *     summary: Onboard a hacker via EVVM NameService
     *     description: >
     *       Validates wallet address, username, and skills; optionally checks username availability
     *       via EVVM NameService; then upserts the hacker profile and skills into the in-memory repository.
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/EvvmOnboardingRequest'
     *     responses:
     *       200:
     *         description: Onboarding successful
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/EvvmOnboardingResponse'
     *       400:
     *         description: Invalid input
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       409:
     *         description: Username already taken
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *       500:
     *         description: Internal server error
     */
    async onboardViaNameService(
        req: Request<{}, EvvmOnboardingResponse | ErrorResponse, EvvmOnboardingRequest>,
        res: Response<EvvmOnboardingResponse | ErrorResponse>
    ): Promise<void> {
        try {
            const parsed = EvvmOnboardingRequestSchema.parse(req.body ?? {});

            const isAvailable = await this.evvmNameServiceClient.isUsernameAvailable(parsed.username);
            if (!isAvailable) {
                const errorResponse: ErrorResponse = { error: 'Username already taken' };
                res.status(409).json(errorResponse);
                return;
            }

            this.hackerRepository.upsertFromNameService({
                walletAddress: parsed.walletAddress,
                username: parsed.username
            });

            this.hackerRepository.upsertSkills({
                walletAddress: parsed.walletAddress,
                skills: parsed.skills
            });

            const profile = this.hackerRepository.getByWallet(parsed.walletAddress);

            const response: EvvmOnboardingResponse = {
                walletAddress: profile?.walletAddress ?? parsed.walletAddress.toLowerCase(),
                username: profile?.username ?? parsed.username,
                skills: profile?.skills ?? parsed.skills,
                status: 'ok'
            };

            res.json(response);
        } catch (error) {
            console.error('EVVM onboarding error:', error);
            if (error instanceof Error && error.name === 'ZodError') {
                const errorResponse: ErrorResponse = { error: error.message };
                res.status(400).json(errorResponse);
                return;
            }
            const errorResponse: ErrorResponse = { error: 'Internal Server Error' };
            res.status(500).json(errorResponse);
        }
    }

    /**
     * @swagger
     * /api/debug/hackers:
     *   get:
     *     summary: Inspect current hacker profiles in memory
     *     description: Returns the contents of the in-memory HackerRepository. Intended for local debugging only.
     *     responses:
     *       200:
     *         description: Current in-memory hacker profiles
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/HackersDebugResponse'
     *       500:
     *         description: Internal server error
     */
    async listHackers(
        _req: Request<{}, HackersDebugResponse | ErrorResponse>,
        res: Response<HackersDebugResponse | ErrorResponse>
    ): Promise<void> {
        try {
            const hackers = this.hackerRepository.getAll();
            const response: HackersDebugResponse = {
                hackers
            };
            res.json(response);
        } catch (error) {
            console.error('List hackers debug error:', error);
            const errorResponse: ErrorResponse = { error: 'Internal Server Error' };
            res.status(500).json(errorResponse);
        }
    }
}


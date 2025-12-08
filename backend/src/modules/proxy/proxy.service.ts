import { environmentVariables } from '@/src/common/config/env';
import { PrismaService } from '@/src/core/database/prisma.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { FastifyReply } from 'fastify';
/**
 * Proxy Service - Forwards requests to OpenAI API
 * Handles both streaming and non-streaming responses
 */
@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly openaiApiKey: string;
  private readonly openaiBaseUrl: string;
  constructor(private readonly prisma: PrismaService) {
    this.openaiApiKey = environmentVariables.OPENAI_API_KEY ?? '';
    this.openaiBaseUrl = environmentVariables.OPENAI_BASE_URL ?? 'https://api.openai.com';
    if (!this.openaiApiKey) {
      this.logger.warn('OPENAI_API_KEY is not set. Proxy will not work.');
    }
  }
  /**
   * Forward request to OpenAI API
   * @param endpoint - The OpenAI endpoint (e.g., '/v1/chat/completions')
   * @param body - Request body
   * @param method - HTTP method
   * @param reply - Fastify reply object for streaming
   * @param deviceId - Device ID for audit logging
   * @param apiKeyId - API Key ID for audit logging
   */
  async forwardToOpenAI(
    endpoint: string,
    body: any,
    method: string,
    reply: FastifyReply,
    deviceId: string,
    apiKeyId: string,
  ): Promise<void> {
    if (!this.openaiApiKey) {
      throw new BadRequestException('OpenAI API key is not configured');
    }
    // Construct full OpenAI URL
    const url = `${this.openaiBaseUrl}${endpoint}`;
    this.logger.log(`Forwarding ${method} request to: ${url}`);
    this.logger.debug(`Request body: ${JSON.stringify(body)}`);
    const startTime = Date.now();
    try {
      // Check if streaming is requested
      const isStreaming = body?.stream === true;
      if (isStreaming) {
        // Handle streaming response
        await this.handleStreamingResponse(url, body, reply, deviceId, apiKeyId, startTime);
      } else {
        // Handle regular response
        await this.handleRegularResponse(url, body, reply, deviceId, apiKeyId, startTime);
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      // Log error to audit logs
      await this.logProxyRequest(
        deviceId,
        apiKeyId,
        endpoint,
        method,
        'failure',
        latency,
        error instanceof Error ? error.message : 'Unknown error',
      );
      this.logger.error(`Proxy request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      if (axios.isAxiosError(error)) {
        const status = error.response?.status ?? 500;
        const data = error.response?.data ?? { error: 'OpenAI API request failed' };
        reply.code(status).send(data);
      } else {
        throw new InternalServerErrorException('Failed to forward request to OpenAI');
      }
    }
  }
  /**
   * Handle streaming response from OpenAI
   */
  private async handleStreamingResponse(
    url: string,
    body: any,
    reply: FastifyReply,
    deviceId: string,
    apiKeyId: string,
    startTime: number,
  ): Promise<void> {
    try {
      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiApiKey}`,
        },
        responseType: 'stream',
      });
      // Set headers for SSE streaming
      reply.raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      // Pipe the stream from OpenAI to the client
      response.data.pipe(reply.raw);
      // Handle stream end
      response.data.on('end', async () => {
        const latency = Date.now() - startTime;
        this.logger.log(`Streaming completed in ${latency}ms`);
        // Log successful proxy request
        await this.logProxyRequest(
          deviceId,
          apiKeyId,
          url,
          'POST',
          'success',
          latency,
        );
        reply.raw.end();
      });
      // Handle stream error
      response.data.on('error', async (error: Error) => {
        const latency = Date.now() - startTime;
        this.logger.error(`Streaming error: ${error.message}`);
        await this.logProxyRequest(
          deviceId,
          apiKeyId,
          url,
          'POST',
          'failure',
          latency,
          error.message,
        );
        reply.raw.end();
      });
    } catch (error) {
      const latency = Date.now() - startTime;
      this.logger.error(`Streaming setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await this.logProxyRequest(
        deviceId,
        apiKeyId,
        url,
        'POST',
        'failure',
        latency,
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }
  /**
   * Handle regular (non-streaming) response from OpenAI
   */
  private async handleRegularResponse(
    url: string,
    body: any,
    reply: FastifyReply,
    deviceId: string,
    apiKeyId: string,
    startTime: number,
  ): Promise<void> {
    try {
      const response: AxiosResponse = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiApiKey}`,
        },
      });
      const latency = Date.now() - startTime;
      this.logger.log(`Request completed in ${latency}ms`);
      // Log successful proxy request
      await this.logProxyRequest(
        deviceId,
        apiKeyId,
        url,
        'POST',
        'success',
        latency,
      );
      reply.code(response.status).send(response.data);
    } catch (error) {
      const latency = Date.now() - startTime;
      await this.logProxyRequest(
        deviceId,
        apiKeyId,
        url,
        'POST',
        'failure',
        latency,
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }
  /**
   * Log proxy request to audit logs
   */
  private async logProxyRequest(
    deviceId: string,
    apiKeyId: string,
    endpoint: string,
    method: string,
    status: 'success' | 'failure',
    latency: number,
    error?: string,
  ): Promise<void> {
    try {
      await this.prisma.prisma.auditLog.create({
        data: {
          event: 'proxy.request',
          severity: status === 'success' ? 'INFO' : 'WARNING',
          status: status.toUpperCase() as any,
          actorId: deviceId,
          actorName: 'Device',
          actorType: 'DEVICE',
          actorIp: '0.0.0.0', // Will be updated from request in controller
          targetId: endpoint,
          targetName: `${method} ${endpoint}`,
          targetType: 'openai_endpoint',
          metadata: {
            latency,
            error,
            method,
          },
          deviceId,
          apiKeyId,
        },
      });
    } catch (logError) {
      this.logger.error(`Failed to create audit log: ${logError instanceof Error ? logError.message : 'Unknown error'}`);
    }
  }
}

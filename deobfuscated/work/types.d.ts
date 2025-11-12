/**
 * TypeScript Type Definitions for Claude Code CLI
 * Generated from decompilation analysis
 * Version: 2.0.37
 */

// ============================================================================
// Session Management Types
// ============================================================================

/**
 * Session state tracking for Claude Code CLI
 */
export interface SessionState {
  /** Total duration of tool execution in milliseconds */
  totalToolDuration: number;

  /** Whether this is a non-interactive session */
  isNonInteractiveSession: boolean;

  /** Token for session ingress */
  sessionIngressToken?: string;

  /** Session counter for metrics */
  sessionCounter: Counter | null;

  /** Counter for code edit tool decisions */
  codeEditToolDecisionCounter: Counter | null;

  /** Unique session identifier */
  sessionId: string;

  /** Map of agent IDs to their assigned colors */
  agentColorMap: Map<string, Color>;

  /** Index for assigning colors to agents */
  agentColorIndex: number;
}

/**
 * Metrics counter interface
 */
export interface Counter {
  increment(value?: number): void;
  decrement(value?: number): void;
  getValue(): number;
}

/**
 * Color type for agent identification
 */
export type Color = string;

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Claude Code configuration options
 */
export interface ClaudeConfig {
  /** Configuration directory path */
  configDir: string;

  /** AWS region for Bedrock */
  awsRegion: string;

  /** Google Cloud ML region */
  cloudMLRegion: string;

  /** Whether to maintain project working directory in Bash */
  maintainProjectWorkingDir: boolean;

  /** Maximum output length for Bash commands */
  bashMaxOutputLength: number;
}

/**
 * Environment variable parser result
 */
export interface ParsedEnvVars {
  [key: string]: string;
}

/**
 * Configuration validator
 */
export interface ConfigValidator<T = any> {
  name: string;
  default: T;
  validate(value: any): ValidationResult<T>;
}

export interface ValidationResult<T> {
  effective: T;
  status: 'valid' | 'invalid';
  message?: string;
}

// ============================================================================
// Tool System Types
// ============================================================================

/**
 * Base tool interface
 */
export interface Tool {
  /** Tool name */
  name: string;

  /** Tool description */
  description: string;

  /** Tool parameters schema */
  parameters: ToolParameters;

  /** Execute the tool */
  execute(params: unknown): Promise<ToolResult>;
}

/**
 * Tool parameters schema
 */
export interface ToolParameters {
  type: 'object';
  properties: Record<string, ParameterSchema>;
  required?: string[];
}

/**
 * Parameter schema definition
 */
export interface ParameterSchema {
  type: string;
  description?: string;
  enum?: unknown[];
  default?: unknown;
}

/**
 * Tool execution result
 */
export interface ToolResult {
  /** Whether the tool execution succeeded */
  success: boolean;

  /** Result data */
  data?: unknown;

  /** Error message if failed */
  error?: string;

  /** Output text */
  output?: string;
}

// ============================================================================
// API Client Types
// ============================================================================

/**
 * Anthropic API client interface
 */
export interface AnthropicAPIClient {
  /** Send a message to the API */
  sendMessage(params: MessageParams): Promise<MessageResponse>;

  /** Stream a message from the API */
  streamMessage(params: MessageParams): AsyncIterableIterator<StreamEvent>;
}

/**
 * Message parameters for API requests
 */
export interface MessageParams {
  /** The model to use */
  model: string;

  /** Messages in the conversation */
  messages: Message[];

  /** Maximum tokens to generate */
  maxTokens?: number;

  /** Temperature for sampling */
  temperature?: number;

  /** System prompt */
  system?: string;

  /** Tools available to the model */
  tools?: Tool[];

  /** Whether to stream the response */
  stream?: boolean;
}

/**
 * Message in a conversation
 */
export interface Message {
  /** Role of the message sender */
  role: 'user' | 'assistant';

  /** Content of the message */
  content: string | ContentBlock[];
}

/**
 * Content block in a message
 */
export type ContentBlock = TextContent | ImageContent | ToolUseContent | ToolResultContent;

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ImageContent {
  type: 'image';
  source: ImageSource;
}

export interface ImageSource {
  type: 'base64' | 'url';
  media_type: string;
  data: string;
}

export interface ToolUseContent {
  type: 'tool_use';
  id: string;
  name: string;
  input: unknown;
}

export interface ToolResultContent {
  type: 'tool_result';
  tool_use_id: string;
  content: string | ContentBlock[];
  is_error?: boolean;
}

/**
 * API response message
 */
export interface MessageResponse {
  /** Response ID */
  id: string;

  /** Model used */
  model: string;

  /** Response role */
  role: 'assistant';

  /** Response content */
  content: ContentBlock[];

  /** Stop reason */
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use';

  /** Token usage */
  usage: TokenUsage;
}

/**
 * Token usage statistics
 */
export interface TokenUsage {
  /** Input tokens */
  input_tokens: number;

  /** Output tokens */
  output_tokens: number;

  /** Cache read input tokens */
  cache_read_input_tokens?: number;

  /** Cache creation input tokens */
  cache_creation_input_tokens?: number;
}

/**
 * Stream event from API
 */
export type StreamEvent =
  | MessageStartEvent
  | ContentBlockStartEvent
  | ContentBlockDeltaEvent
  | ContentBlockStopEvent
  | MessageDeltaEvent
  | MessageStopEvent;

export interface MessageStartEvent {
  type: 'message_start';
  message: Partial<MessageResponse>;
}

export interface ContentBlockStartEvent {
  type: 'content_block_start';
  index: number;
  content_block: ContentBlock;
}

export interface ContentBlockDeltaEvent {
  type: 'content_block_delta';
  index: number;
  delta: ContentDelta;
}

export type ContentDelta = TextDelta | ToolInputDelta;

export interface TextDelta {
  type: 'text_delta';
  text: string;
}

export interface ToolInputDelta {
  type: 'input_json_delta';
  partial_json: string;
}

export interface ContentBlockStopEvent {
  type: 'content_block_stop';
  index: number;
}

export interface MessageDeltaEvent {
  type: 'message_delta';
  delta: {
    stop_reason?: string;
    stop_sequence?: string;
  };
  usage: Partial<TokenUsage>;
}

export interface MessageStopEvent {
  type: 'message_stop';
}

// ============================================================================
// HTTP Client Types (Axios)
// ============================================================================

/**
 * Axios HTTP client interface
 */
export interface AxiosClient {
  /** Request interceptors */
  interceptors: {
    request: InterceptorManager;
    response: InterceptorManager;
  };

  /** Make an HTTP request */
  request<T = any>(config: RequestConfig): Promise<Response<T>>;

  /** Make a GET request */
  get<T = any>(url: string, config?: RequestConfig): Promise<Response<T>>;

  /** Make a POST request */
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<Response<T>>;
}

/**
 * Interceptor manager for request/response interceptors
 */
export interface InterceptorManager {
  /** Register an interceptor */
  use(
    fulfilled: (value: any) => any | Promise<any>,
    rejected?: (error: any) => any,
    options?: InterceptorOptions
  ): number;

  /** Remove an interceptor */
  eject(id: number): void;

  /** Clear all interceptors */
  clear(): void;
}

export interface InterceptorOptions {
  synchronous?: boolean;
  runWhen?: (config: RequestConfig) => boolean;
}

/**
 * HTTP request configuration
 */
export interface RequestConfig {
  url?: string;
  method?: string;
  headers?: Record<string, string>;
  data?: any;
  params?: any;
  timeout?: number;
  responseType?: 'json' | 'text' | 'blob' | 'arraybuffer';
}

/**
 * HTTP response
 */
export interface Response<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: RequestConfig;
}

// ============================================================================
// Validation Types (Zod)
// ============================================================================

/**
 * Parse status for Zod validation
 */
export class ParseStatus {
  value: 'valid' | 'dirty' | 'aborted';

  constructor();
  dirty(): void;
  abort(): void;

  static mergeArray(status: ParseStatus, results: ParseResult[]): ParseResult;
  static mergeObjectAsync(status: ParseStatus, pairs: AsyncParsePair[]): Promise<ParseResult>;
  static mergeObjectSync(status: ParseStatus, pairs: ParsePair[]): ParseResult;
}

/**
 * Parse context for Zod
 */
export class ParseContext {
  parent: ParseContext | null;
  data: unknown;
  path: (string | number)[];

  constructor(
    parent: ParseContext | null,
    data: unknown,
    path: (string | number)[],
    key: string | number | (string | number)[]
  );
}

/**
 * Parse result
 */
export interface ParseResult<T = any> {
  status: 'valid' | 'dirty' | 'aborted';
  value: T;
}

export interface ParsePair {
  key: ParseResult<string>;
  value: ParseResult;
  alwaysSet?: boolean;
}

export interface AsyncParsePair {
  key: Promise<ParseResult<string>>;
  value: Promise<ParseResult>;
  alwaysSet?: boolean;
}

/**
 * Base Zod type
 */
export abstract class ZodType<T = any> {
  /** Type definition */
  _def: ZodTypeDef;

  /** Get description */
  get description(): string | undefined;

  /** Parse input */
  abstract _parse(input: ParseInput): ParseResult<T>;

  /** Parse synchronously */
  _parseSync(input: ParseInput): ParseResult<T>;

  /** Parse asynchronously */
  _parseAsync(input: ParseInput): Promise<ParseResult<T>>;
}

export interface ZodTypeDef {
  typeName: string;
  errorMap?: ErrorMapFunction;
  description?: string;
}

export interface ParseInput {
  data: unknown;
  path: (string | number)[];
  parent: ParseContext | null;
}

export type ErrorMapFunction = (issue: ZodIssue, context: ErrorMapContext) => ErrorMessage;

export interface ZodIssue {
  code: string;
  path: (string | number)[];
  message?: string;
}

export interface ErrorMapContext {
  data: unknown;
  defaultError: string;
}

export interface ErrorMessage {
  message: string;
}

// ============================================================================
// Storage Types (LocalForage)
// ============================================================================

/**
 * LocalForage storage interface
 */
export interface LocalForageStorage {
  /** Get an item */
  getItem<T>(key: string): Promise<T | null>;

  /** Set an item */
  setItem<T>(key: string, value: T): Promise<T>;

  /** Remove an item */
  removeItem(key: string): Promise<void>;

  /** Clear all items */
  clear(): Promise<void>;

  /** Get number of items */
  length(): Promise<number>;

  /** Get key at index */
  key(index: number): Promise<string | null>;

  /** Get all keys */
  keys(): Promise<string[]>;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Required deep type
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Awaited type (for Promise unwrapping)
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * OtelMetrics
 *
 * Extracted from Claude Code CLI bundle.
 * Category: opentelemetry
 *
 * Original location: Lines 403526-403583
 * Size: 57 lines
 * Occurrences: 0
 */

import {
  createCommonJSModule,
  defineProperty
} from '../../runtime/module-system.js';

var otelMetricsExport = createCommonJSModule(OtelMetrics => {
  Object.defineProperty(OtelMetrics, "__esModule", {
    value: true
  });
  OtelMetrics.METRIC_SIGNALR_SERVER_ACTIVE_CONNECTIONS = OtelMetrics.METRIC_KESTREL_UPGRADED_CONNECTIONS = OtelMetrics.METRIC_KESTREL_TLS_HANDSHAKE_DURATION = OtelMetrics.METRIC_KESTREL_REJECTED_CONNECTIONS = OtelMetrics.METRIC_KESTREL_QUEUED_REQUESTS = OtelMetrics.METRIC_KESTREL_QUEUED_CONNECTIONS = OtelMetrics.METRIC_KESTREL_CONNECTION_DURATION = OtelMetrics.METRIC_KESTREL_ACTIVE_TLS_HANDSHAKES = OtelMetrics.METRIC_KESTREL_ACTIVE_CONNECTIONS = OtelMetrics.METRIC_JVM_THREAD_COUNT = OtelMetrics.METRIC_JVM_MEMORY_USED_AFTER_LAST_GC = OtelMetrics.METRIC_JVM_MEMORY_USED = OtelMetrics.METRIC_JVM_MEMORY_LIMIT = OtelMetrics.METRIC_JVM_MEMORY_COMMITTED = OtelMetrics.METRIC_JVM_GC_DURATION = OtelMetrics.METRIC_JVM_CPU_TIME = OtelMetrics.METRIC_JVM_CPU_RECENT_UTILIZATION = OtelMetrics.METRIC_JVM_CPU_COUNT = OtelMetrics.METRIC_JVM_CLASS_UNLOADED = OtelMetrics.METRIC_JVM_CLASS_LOADED = OtelMetrics.METRIC_JVM_CLASS_COUNT = OtelMetrics.METRIC_HTTP_SERVER_REQUEST_DURATION = OtelMetrics.METRIC_HTTP_CLIENT_REQUEST_DURATION = OtelMetrics.METRIC_DOTNET_TIMER_COUNT = OtelMetrics.METRIC_DOTNET_THREAD_POOL_WORK_ITEM_COUNT = OtelMetrics.METRIC_DOTNET_THREAD_POOL_THREAD_COUNT = OtelMetrics.METRIC_DOTNET_THREAD_POOL_QUEUE_LENGTH = OtelMetrics.METRIC_DOTNET_PROCESS_MEMORY_WORKING_SET = OtelMetrics.METRIC_DOTNET_PROCESS_CPU_TIME = OtelMetrics.METRIC_DOTNET_PROCESS_CPU_COUNT = OtelMetrics.METRIC_DOTNET_MONITOR_LOCK_CONTENTIONS = OtelMetrics.METRIC_DOTNET_JIT_COMPILED_METHODS = OtelMetrics.METRIC_DOTNET_JIT_COMPILED_IL_SIZE = OtelMetrics.METRIC_DOTNET_JIT_COMPILATION_TIME = OtelMetrics.METRIC_DOTNET_GC_PAUSE_TIME = OtelMetrics.METRIC_DOTNET_GC_LAST_COLLECTION_MEMORY_COMMITTED_SIZE = OtelMetrics.METRIC_DOTNET_GC_LAST_COLLECTION_HEAP_SIZE = OtelMetrics.METRIC_DOTNET_GC_LAST_COLLECTION_HEAP_FRAGMENTATION_SIZE = OtelMetrics.METRIC_DOTNET_GC_HEAP_TOTAL_ALLOCATED = OtelMetrics.METRIC_DOTNET_GC_COLLECTIONS = OtelMetrics.METRIC_DOTNET_EXCEPTIONS = OtelMetrics.METRIC_DOTNET_ASSEMBLY_COUNT = OtelMetrics.METRIC_DB_CLIENT_OPERATION_DURATION = OtelMetrics.METRIC_ASPNETCORE_ROUTING_MATCH_ATTEMPTS = OtelMetrics.METRIC_ASPNETCORE_RATE_LIMITING_REQUESTS = OtelMetrics.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_LEASE_DURATION = OtelMetrics.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_TIME_IN_QUEUE = OtelMetrics.METRIC_ASPNETCORE_RATE_LIMITING_QUEUED_REQUESTS = OtelMetrics.METRIC_ASPNETCORE_RATE_LIMITING_ACTIVE_REQUEST_LEASES = OtelMetrics.METRIC_ASPNETCORE_DIAGNOSTICS_EXCEPTIONS = undefined;
  OtelMetrics.METRIC_SIGNALR_SERVER_CONNECTION_DURATION = undefined;
  OtelMetrics.METRIC_ASPNETCORE_DIAGNOSTICS_EXCEPTIONS = "aspnetcore.diagnostics.exceptions";
  OtelMetrics.METRIC_ASPNETCORE_RATE_LIMITING_ACTIVE_REQUEST_LEASES = "aspnetcore.rate_limiting.active_request_leases";
  OtelMetrics.METRIC_ASPNETCORE_RATE_LIMITING_QUEUED_REQUESTS = "aspnetcore.rate_limiting.queued_requests";
  OtelMetrics.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_TIME_IN_QUEUE = "aspnetcore.rate_limiting.request.time_in_queue";
  OtelMetrics.METRIC_ASPNETCORE_RATE_LIMITING_REQUEST_LEASE_DURATION = "aspnetcore.rate_limiting.request_lease.duration";
  OtelMetrics.METRIC_ASPNETCORE_RATE_LIMITING_REQUESTS = "aspnetcore.rate_limiting.requests";
  OtelMetrics.METRIC_ASPNETCORE_ROUTING_MATCH_ATTEMPTS = "aspnetcore.routing.match_attempts";
  OtelMetrics.METRIC_DB_CLIENT_OPERATION_DURATION = "db.client.operation.duration";
  OtelMetrics.METRIC_DOTNET_ASSEMBLY_COUNT = "dotnet.assembly.count";
  OtelMetrics.METRIC_DOTNET_EXCEPTIONS = "dotnet.exceptions";
  OtelMetrics.METRIC_DOTNET_GC_COLLECTIONS = "dotnet.gc.collections";
  OtelMetrics.METRIC_DOTNET_GC_HEAP_TOTAL_ALLOCATED = "dotnet.gc.heap.total_allocated";
  OtelMetrics.METRIC_DOTNET_GC_LAST_COLLECTION_HEAP_FRAGMENTATION_SIZE = "dotnet.gc.last_collection.heap.fragmentation.size";
  OtelMetrics.METRIC_DOTNET_GC_LAST_COLLECTION_HEAP_SIZE = "dotnet.gc.last_collection.heap.size";
  OtelMetrics.METRIC_DOTNET_GC_LAST_COLLECTION_MEMORY_COMMITTED_SIZE = "dotnet.gc.last_collection.memory.committed_size";
  OtelMetrics.METRIC_DOTNET_GC_PAUSE_TIME = "dotnet.gc.pause.time";
  OtelMetrics.METRIC_DOTNET_JIT_COMPILATION_TIME = "dotnet.jit.compilation.time";
  OtelMetrics.METRIC_DOTNET_JIT_COMPILED_IL_SIZE = "dotnet.jit.compiled_il.size";
  OtelMetrics.METRIC_DOTNET_JIT_COMPILED_METHODS = "dotnet.jit.compiled_methods";
  OtelMetrics.METRIC_DOTNET_MONITOR_LOCK_CONTENTIONS = "dotnet.monitor.lock_contentions";
  OtelMetrics.METRIC_DOTNET_PROCESS_CPU_COUNT = "dotnet.process.cpu.count";
  OtelMetrics.METRIC_DOTNET_PROCESS_CPU_TIME = "dotnet.process.cpu.time";
  OtelMetrics.METRIC_DOTNET_PROCESS_MEMORY_WORKING_SET = "dotnet.process.memory.working_set";
  OtelMetrics.METRIC_DOTNET_THREAD_POOL_QUEUE_LENGTH = "dotnet.thread_pool.queue.length";
  OtelMetrics.METRIC_DOTNET_THREAD_POOL_THREAD_COUNT = "dotnet.thread_pool.thread.count";
  OtelMetrics.METRIC_DOTNET_THREAD_POOL_WORK_ITEM_COUNT = "dotnet.thread_pool.work_item.count";
  OtelMetrics.METRIC_DOTNET_TIMER_COUNT = "dotnet.timer.count";
  OtelMetrics.METRIC_HTTP_CLIENT_REQUEST_DURATION = "http.client.request.duration";
  OtelMetrics.METRIC_HTTP_SERVER_REQUEST_DURATION = "http.server.request.duration";
  OtelMetrics.METRIC_JVM_CLASS_COUNT = "jvm.class.count";
  OtelMetrics.METRIC_JVM_CLASS_LOADED = "jvm.class.loaded";
  OtelMetrics.METRIC_JVM_CLASS_UNLOADED = "jvm.class.unloaded";
  OtelMetrics.METRIC_JVM_CPU_COUNT = "jvm.cpu.count";
  OtelMetrics.METRIC_JVM_CPU_RECENT_UTILIZATION = "jvm.cpu.recent_utilization";
  OtelMetrics.METRIC_JVM_CPU_TIME = "jvm.cpu.time";
  OtelMetrics.METRIC_JVM_GC_DURATION = "jvm.gc.duration";
  OtelMetrics.METRIC_JVM_MEMORY_COMMITTED = "jvm.memory.committed";
  OtelMetrics.METRIC_JVM_MEMORY_LIMIT = "jvm.memory.limit";
  OtelMetrics.METRIC_JVM_MEMORY_USED = "jvm.memory.used";
  OtelMetrics.METRIC_JVM_MEMORY_USED_AFTER_LAST_GC = "jvm.memory.used_after_last_gc";
  OtelMetrics.METRIC_JVM_THREAD_COUNT = "jvm.thread.count";
  OtelMetrics.METRIC_KESTREL_ACTIVE_CONNECTIONS = "kestrel.active_connections";
  OtelMetrics.METRIC_KESTREL_ACTIVE_TLS_HANDSHAKES = "kestrel.active_tls_handshakes";
  OtelMetrics.METRIC_KESTREL_CONNECTION_DURATION = "kestrel.connection.duration";
  OtelMetrics.METRIC_KESTREL_QUEUED_CONNECTIONS = "kestrel.queued_connections";
  OtelMetrics.METRIC_KESTREL_QUEUED_REQUESTS = "kestrel.queued_requests";
  OtelMetrics.METRIC_KESTREL_REJECTED_CONNECTIONS = "kestrel.rejected_connections";
  OtelMetrics.METRIC_KESTREL_TLS_HANDSHAKE_DURATION = "kestrel.tls_handshake.duration";
  OtelMetrics.METRIC_KESTREL_UPGRADED_CONNECTIONS = "kestrel.upgraded_connections";
  OtelMetrics.METRIC_SIGNALR_SERVER_ACTIVE_CONNECTIONS = "signalr.server.active_connections";
  OtelMetrics.METRIC_SIGNALR_SERVER_CONNECTION_DURATION = "signalr.server.connection.duration";
});

// Export the module
export default otelMetricsExport;
export const OtelMetrics = otelMetricsExport;

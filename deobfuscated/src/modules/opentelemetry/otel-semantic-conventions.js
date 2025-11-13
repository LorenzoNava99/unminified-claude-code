/**
 * OtelSemanticConventions
 *
 * Extracted from Claude Code CLI bundle.
 * Category: opentelemetry
 *
 * Original location: Lines 403381-403525
 * Size: 144 lines
 * Occurrences: 0
 */

import {
  createCommonJSModule,
  defineProperty
} from '../../runtime/module-system.js';

var otelSemanticConventionsExport = createCommonJSModule(OtelSemanticConventions => {
  Object.defineProperty(OtelSemanticConventions, "__esModule", {
    value: true
  });
  OtelSemanticConventions.ATTR_EXCEPTION_TYPE = OtelSemanticConventions.ATTR_EXCEPTION_STACKTRACE = OtelSemanticConventions.ATTR_EXCEPTION_MESSAGE = OtelSemanticConventions.ATTR_EXCEPTION_ESCAPED = OtelSemanticConventions.ERROR_TYPE_VALUE_OTHER = OtelSemanticConventions.ATTR_ERROR_TYPE = OtelSemanticConventions.DOTNET_GC_HEAP_GENERATION_VALUE_POH = OtelSemanticConventions.DOTNET_GC_HEAP_GENERATION_VALUE_LOH = OtelSemanticConventions.DOTNET_GC_HEAP_GENERATION_VALUE_GEN2 = OtelSemanticConventions.DOTNET_GC_HEAP_GENERATION_VALUE_GEN1 = OtelSemanticConventions.DOTNET_GC_HEAP_GENERATION_VALUE_GEN0 = OtelSemanticConventions.ATTR_DOTNET_GC_HEAP_GENERATION = OtelSemanticConventions.DB_SYSTEM_NAME_VALUE_POSTGRESQL = OtelSemanticConventions.DB_SYSTEM_NAME_VALUE_MYSQL = OtelSemanticConventions.DB_SYSTEM_NAME_VALUE_MICROSOFT_SQL_SERVER = OtelSemanticConventions.DB_SYSTEM_NAME_VALUE_MARIADB = OtelSemanticConventions.ATTR_DB_SYSTEM_NAME = OtelSemanticConventions.ATTR_DB_STORED_PROCEDURE_NAME = OtelSemanticConventions.ATTR_DB_RESPONSE_STATUS_CODE = OtelSemanticConventions.ATTR_DB_QUERY_TEXT = OtelSemanticConventions.ATTR_DB_QUERY_SUMMARY = OtelSemanticConventions.ATTR_DB_OPERATION_NAME = OtelSemanticConventions.ATTR_DB_OPERATION_BATCH_SIZE = OtelSemanticConventions.ATTR_DB_NAMESPACE = OtelSemanticConventions.ATTR_DB_COLLECTION_NAME = OtelSemanticConventions.ATTR_CODE_STACKTRACE = OtelSemanticConventions.ATTR_CODE_LINE_NUMBER = OtelSemanticConventions.ATTR_CODE_FUNCTION_NAME = OtelSemanticConventions.ATTR_CODE_FILE_PATH = OtelSemanticConventions.ATTR_CODE_COLUMN_NUMBER = OtelSemanticConventions.ATTR_CLIENT_PORT = OtelSemanticConventions.ATTR_CLIENT_ADDRESS = OtelSemanticConventions.ATTR_ASPNETCORE_USER_IS_AUTHENTICATED = OtelSemanticConventions.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_SUCCESS = OtelSemanticConventions.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_FAILURE = OtelSemanticConventions.ATTR_ASPNETCORE_ROUTING_MATCH_STATUS = OtelSemanticConventions.ATTR_ASPNETCORE_ROUTING_IS_FALLBACK = OtelSemanticConventions.ATTR_ASPNETCORE_REQUEST_IS_UNHANDLED = OtelSemanticConventions.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_REQUEST_CANCELED = OtelSemanticConventions.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_GLOBAL_LIMITER = OtelSemanticConventions.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ENDPOINT_LIMITER = OtelSemanticConventions.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ACQUIRED = OtelSemanticConventions.ATTR_ASPNETCORE_RATE_LIMITING_RESULT = OtelSemanticConventions.ATTR_ASPNETCORE_RATE_LIMITING_POLICY = OtelSemanticConventions.ATTR_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE = OtelSemanticConventions.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_UNHANDLED = OtelSemanticConventions.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_SKIPPED = OtelSemanticConventions.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_HANDLED = OtelSemanticConventions.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_ABORTED = OtelSemanticConventions.ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT = undefined;
  OtelSemanticConventions.OTEL_STATUS_CODE_VALUE_ERROR = OtelSemanticConventions.ATTR_OTEL_STATUS_CODE = OtelSemanticConventions.ATTR_OTEL_SCOPE_VERSION = OtelSemanticConventions.ATTR_OTEL_SCOPE_NAME = OtelSemanticConventions.NETWORK_TYPE_VALUE_IPV6 = OtelSemanticConventions.NETWORK_TYPE_VALUE_IPV4 = OtelSemanticConventions.ATTR_NETWORK_TYPE = OtelSemanticConventions.NETWORK_TRANSPORT_VALUE_UNIX = OtelSemanticConventions.NETWORK_TRANSPORT_VALUE_UDP = OtelSemanticConventions.NETWORK_TRANSPORT_VALUE_TCP = OtelSemanticConventions.NETWORK_TRANSPORT_VALUE_QUIC = OtelSemanticConventions.NETWORK_TRANSPORT_VALUE_PIPE = OtelSemanticConventions.ATTR_NETWORK_TRANSPORT = OtelSemanticConventions.ATTR_NETWORK_PROTOCOL_VERSION = OtelSemanticConventions.ATTR_NETWORK_PROTOCOL_NAME = OtelSemanticConventions.ATTR_NETWORK_PEER_PORT = OtelSemanticConventions.ATTR_NETWORK_PEER_ADDRESS = OtelSemanticConventions.ATTR_NETWORK_LOCAL_PORT = OtelSemanticConventions.ATTR_NETWORK_LOCAL_ADDRESS = OtelSemanticConventions.JVM_THREAD_STATE_VALUE_WAITING = OtelSemanticConventions.JVM_THREAD_STATE_VALUE_TIMED_WAITING = OtelSemanticConventions.JVM_THREAD_STATE_VALUE_TERMINATED = OtelSemanticConventions.JVM_THREAD_STATE_VALUE_RUNNABLE = OtelSemanticConventions.JVM_THREAD_STATE_VALUE_NEW = OtelSemanticConventions.JVM_THREAD_STATE_VALUE_BLOCKED = OtelSemanticConventions.ATTR_JVM_THREAD_STATE = OtelSemanticConventions.ATTR_JVM_THREAD_DAEMON = OtelSemanticConventions.JVM_MEMORY_TYPE_VALUE_NON_HEAP = OtelSemanticConventions.JVM_MEMORY_TYPE_VALUE_HEAP = OtelSemanticConventions.ATTR_JVM_MEMORY_TYPE = OtelSemanticConventions.ATTR_JVM_MEMORY_POOL_NAME = OtelSemanticConventions.ATTR_JVM_GC_NAME = OtelSemanticConventions.ATTR_JVM_GC_ACTION = OtelSemanticConventions.ATTR_HTTP_ROUTE = OtelSemanticConventions.ATTR_HTTP_RESPONSE_STATUS_CODE = OtelSemanticConventions.ATTR_HTTP_RESPONSE_HEADER = OtelSemanticConventions.ATTR_HTTP_REQUEST_RESEND_COUNT = OtelSemanticConventions.ATTR_HTTP_REQUEST_METHOD_ORIGINAL = OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_TRACE = OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_PUT = OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_POST = OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_PATCH = OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_OPTIONS = OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_HEAD = OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_GET = OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_DELETE = OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_CONNECT = OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_OTHER = OtelSemanticConventions.ATTR_HTTP_REQUEST_METHOD = OtelSemanticConventions.ATTR_HTTP_REQUEST_HEADER = undefined;
  OtelSemanticConventions.ATTR_USER_AGENT_ORIGINAL = OtelSemanticConventions.ATTR_URL_SCHEME = OtelSemanticConventions.ATTR_URL_QUERY = OtelSemanticConventions.ATTR_URL_PATH = OtelSemanticConventions.ATTR_URL_FULL = OtelSemanticConventions.ATTR_URL_FRAGMENT = OtelSemanticConventions.ATTR_TELEMETRY_SDK_VERSION = OtelSemanticConventions.ATTR_TELEMETRY_SDK_NAME = OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_SWIFT = OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_RUST = OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_RUBY = OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON = OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_PHP = OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS = OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_JAVA = OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_GO = OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG = OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET = OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_CPP = OtelSemanticConventions.ATTR_TELEMETRY_SDK_LANGUAGE = OtelSemanticConventions.SIGNALR_TRANSPORT_VALUE_WEB_SOCKETS = OtelSemanticConventions.SIGNALR_TRANSPORT_VALUE_SERVER_SENT_EVENTS = OtelSemanticConventions.SIGNALR_TRANSPORT_VALUE_LONG_POLLING = OtelSemanticConventions.ATTR_SIGNALR_TRANSPORT = OtelSemanticConventions.SIGNALR_CONNECTION_STATUS_VALUE_TIMEOUT = OtelSemanticConventions.SIGNALR_CONNECTION_STATUS_VALUE_NORMAL_CLOSURE = OtelSemanticConventions.SIGNALR_CONNECTION_STATUS_VALUE_APP_SHUTDOWN = OtelSemanticConventions.ATTR_SIGNALR_CONNECTION_STATUS = OtelSemanticConventions.ATTR_SERVICE_VERSION = OtelSemanticConventions.ATTR_SERVICE_NAME = OtelSemanticConventions.ATTR_SERVER_PORT = OtelSemanticConventions.ATTR_SERVER_ADDRESS = OtelSemanticConventions.ATTR_OTEL_STATUS_DESCRIPTION = OtelSemanticConventions.OTEL_STATUS_CODE_VALUE_OK = undefined;
  OtelSemanticConventions.ATTR_ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT = "aspnetcore.diagnostics.exception.result";
  OtelSemanticConventions.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_ABORTED = "aborted";
  OtelSemanticConventions.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_HANDLED = "handled";
  OtelSemanticConventions.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_SKIPPED = "skipped";
  OtelSemanticConventions.ASPNETCORE_DIAGNOSTICS_EXCEPTION_RESULT_VALUE_UNHANDLED = "unhandled";
  OtelSemanticConventions.ATTR_ASPNETCORE_DIAGNOSTICS_HANDLER_TYPE = "aspnetcore.diagnostics.handler.type";
  OtelSemanticConventions.ATTR_ASPNETCORE_RATE_LIMITING_POLICY = "aspnetcore.rate_limiting.policy";
  OtelSemanticConventions.ATTR_ASPNETCORE_RATE_LIMITING_RESULT = "aspnetcore.rate_limiting.result";
  OtelSemanticConventions.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ACQUIRED = "acquired";
  OtelSemanticConventions.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_ENDPOINT_LIMITER = "endpoint_limiter";
  OtelSemanticConventions.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_GLOBAL_LIMITER = "global_limiter";
  OtelSemanticConventions.ASPNETCORE_RATE_LIMITING_RESULT_VALUE_REQUEST_CANCELED = "request_canceled";
  OtelSemanticConventions.ATTR_ASPNETCORE_REQUEST_IS_UNHANDLED = "aspnetcore.request.is_unhandled";
  OtelSemanticConventions.ATTR_ASPNETCORE_ROUTING_IS_FALLBACK = "aspnetcore.routing.is_fallback";
  OtelSemanticConventions.ATTR_ASPNETCORE_ROUTING_MATCH_STATUS = "aspnetcore.routing.match_status";
  OtelSemanticConventions.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_FAILURE = "failure";
  OtelSemanticConventions.ASPNETCORE_ROUTING_MATCH_STATUS_VALUE_SUCCESS = "success";
  OtelSemanticConventions.ATTR_ASPNETCORE_USER_IS_AUTHENTICATED = "aspnetcore.user.is_authenticated";
  OtelSemanticConventions.ATTR_CLIENT_ADDRESS = "client.address";
  OtelSemanticConventions.ATTR_CLIENT_PORT = "client.port";
  OtelSemanticConventions.ATTR_CODE_COLUMN_NUMBER = "code.column.number";
  OtelSemanticConventions.ATTR_CODE_FILE_PATH = "code.file.path";
  OtelSemanticConventions.ATTR_CODE_FUNCTION_NAME = "code.function.name";
  OtelSemanticConventions.ATTR_CODE_LINE_NUMBER = "code.line.number";
  OtelSemanticConventions.ATTR_CODE_STACKTRACE = "code.stacktrace";
  OtelSemanticConventions.ATTR_DB_COLLECTION_NAME = "db.collection.name";
  OtelSemanticConventions.ATTR_DB_NAMESPACE = "db.namespace";
  OtelSemanticConventions.ATTR_DB_OPERATION_BATCH_SIZE = "db.operation.batch.size";
  OtelSemanticConventions.ATTR_DB_OPERATION_NAME = "db.operation.name";
  OtelSemanticConventions.ATTR_DB_QUERY_SUMMARY = "db.query.summary";
  OtelSemanticConventions.ATTR_DB_QUERY_TEXT = "db.query.text";
  OtelSemanticConventions.ATTR_DB_RESPONSE_STATUS_CODE = "db.response.status_code";
  OtelSemanticConventions.ATTR_DB_STORED_PROCEDURE_NAME = "db.stored_procedure.name";
  OtelSemanticConventions.ATTR_DB_SYSTEM_NAME = "db.system.name";
  OtelSemanticConventions.DB_SYSTEM_NAME_VALUE_MARIADB = "mariadb";
  OtelSemanticConventions.DB_SYSTEM_NAME_VALUE_MICROSOFT_SQL_SERVER = "microsoft.sql_server";
  OtelSemanticConventions.DB_SYSTEM_NAME_VALUE_MYSQL = "mysql";
  OtelSemanticConventions.DB_SYSTEM_NAME_VALUE_POSTGRESQL = "postgresql";
  OtelSemanticConventions.ATTR_DOTNET_GC_HEAP_GENERATION = "dotnet.gc.heap.generation";
  OtelSemanticConventions.DOTNET_GC_HEAP_GENERATION_VALUE_GEN0 = "gen0";
  OtelSemanticConventions.DOTNET_GC_HEAP_GENERATION_VALUE_GEN1 = "gen1";
  OtelSemanticConventions.DOTNET_GC_HEAP_GENERATION_VALUE_GEN2 = "gen2";
  OtelSemanticConventions.DOTNET_GC_HEAP_GENERATION_VALUE_LOH = "loh";
  OtelSemanticConventions.DOTNET_GC_HEAP_GENERATION_VALUE_POH = "poh";
  OtelSemanticConventions.ATTR_ERROR_TYPE = "error.type";
  OtelSemanticConventions.ERROR_TYPE_VALUE_OTHER = "_OTHER";
  OtelSemanticConventions.ATTR_EXCEPTION_ESCAPED = "exception.escaped";
  OtelSemanticConventions.ATTR_EXCEPTION_MESSAGE = "exception.message";
  OtelSemanticConventions.ATTR_EXCEPTION_STACKTRACE = "exception.stacktrace";
  OtelSemanticConventions.ATTR_EXCEPTION_TYPE = "exception.type";
  var Hz5 = A => `http.request.header.${A}`;
  OtelSemanticConventions.ATTR_HTTP_REQUEST_HEADER = Hz5;
  OtelSemanticConventions.ATTR_HTTP_REQUEST_METHOD = "http.request.method";
  OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_OTHER = "_OTHER";
  OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_CONNECT = "CONNECT";
  OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_DELETE = "DELETE";
  OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_GET = "GET";
  OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_HEAD = "HEAD";
  OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_OPTIONS = "OPTIONS";
  OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_PATCH = "PATCH";
  OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_POST = "POST";
  OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_PUT = "PUT";
  OtelSemanticConventions.HTTP_REQUEST_METHOD_VALUE_TRACE = "TRACE";
  OtelSemanticConventions.ATTR_HTTP_REQUEST_METHOD_ORIGINAL = "http.request.method_original";
  OtelSemanticConventions.ATTR_HTTP_REQUEST_RESEND_COUNT = "http.request.resend_count";
  var zz5 = A => `http.response.header.${A}`;
  OtelSemanticConventions.ATTR_HTTP_RESPONSE_HEADER = zz5;
  OtelSemanticConventions.ATTR_HTTP_RESPONSE_STATUS_CODE = "http.response.status_code";
  OtelSemanticConventions.ATTR_HTTP_ROUTE = "http.route";
  OtelSemanticConventions.ATTR_JVM_GC_ACTION = "jvm.gc.action";
  OtelSemanticConventions.ATTR_JVM_GC_NAME = "jvm.gc.name";
  OtelSemanticConventions.ATTR_JVM_MEMORY_POOL_NAME = "jvm.memory.pool.name";
  OtelSemanticConventions.ATTR_JVM_MEMORY_TYPE = "jvm.memory.type";
  OtelSemanticConventions.JVM_MEMORY_TYPE_VALUE_HEAP = "heap";
  OtelSemanticConventions.JVM_MEMORY_TYPE_VALUE_NON_HEAP = "non_heap";
  OtelSemanticConventions.ATTR_JVM_THREAD_DAEMON = "jvm.thread.daemon";
  OtelSemanticConventions.ATTR_JVM_THREAD_STATE = "jvm.thread.state";
  OtelSemanticConventions.JVM_THREAD_STATE_VALUE_BLOCKED = "blocked";
  OtelSemanticConventions.JVM_THREAD_STATE_VALUE_NEW = "new";
  OtelSemanticConventions.JVM_THREAD_STATE_VALUE_RUNNABLE = "runnable";
  OtelSemanticConventions.JVM_THREAD_STATE_VALUE_TERMINATED = "terminated";
  OtelSemanticConventions.JVM_THREAD_STATE_VALUE_TIMED_WAITING = "timed_waiting";
  OtelSemanticConventions.JVM_THREAD_STATE_VALUE_WAITING = "waiting";
  OtelSemanticConventions.ATTR_NETWORK_LOCAL_ADDRESS = "network.local.address";
  OtelSemanticConventions.ATTR_NETWORK_LOCAL_PORT = "network.local.port";
  OtelSemanticConventions.ATTR_NETWORK_PEER_ADDRESS = "network.peer.address";
  OtelSemanticConventions.ATTR_NETWORK_PEER_PORT = "network.peer.port";
  OtelSemanticConventions.ATTR_NETWORK_PROTOCOL_NAME = "network.protocol.name";
  OtelSemanticConventions.ATTR_NETWORK_PROTOCOL_VERSION = "network.protocol.version";
  OtelSemanticConventions.ATTR_NETWORK_TRANSPORT = "network.transport";
  OtelSemanticConventions.NETWORK_TRANSPORT_VALUE_PIPE = "pipe";
  OtelSemanticConventions.NETWORK_TRANSPORT_VALUE_QUIC = "quic";
  OtelSemanticConventions.NETWORK_TRANSPORT_VALUE_TCP = "tcp";
  OtelSemanticConventions.NETWORK_TRANSPORT_VALUE_UDP = "udp";
  OtelSemanticConventions.NETWORK_TRANSPORT_VALUE_UNIX = "unix";
  OtelSemanticConventions.ATTR_NETWORK_TYPE = "network.type";
  OtelSemanticConventions.NETWORK_TYPE_VALUE_IPV4 = "ipv4";
  OtelSemanticConventions.NETWORK_TYPE_VALUE_IPV6 = "ipv6";
  OtelSemanticConventions.ATTR_OTEL_SCOPE_NAME = "otel.scope.name";
  OtelSemanticConventions.ATTR_OTEL_SCOPE_VERSION = "otel.scope.version";
  OtelSemanticConventions.ATTR_OTEL_STATUS_CODE = "otel.status_code";
  OtelSemanticConventions.OTEL_STATUS_CODE_VALUE_ERROR = "ERROR";
  OtelSemanticConventions.OTEL_STATUS_CODE_VALUE_OK = "OK";
  OtelSemanticConventions.ATTR_OTEL_STATUS_DESCRIPTION = "otel.status_description";
  OtelSemanticConventions.ATTR_SERVER_ADDRESS = "server.address";
  OtelSemanticConventions.ATTR_SERVER_PORT = "server.port";
  OtelSemanticConventions.ATTR_SERVICE_NAME = "service.name";
  OtelSemanticConventions.ATTR_SERVICE_VERSION = "service.version";
  OtelSemanticConventions.ATTR_SIGNALR_CONNECTION_STATUS = "signalr.connection.status";
  OtelSemanticConventions.SIGNALR_CONNECTION_STATUS_VALUE_APP_SHUTDOWN = "app_shutdown";
  OtelSemanticConventions.SIGNALR_CONNECTION_STATUS_VALUE_NORMAL_CLOSURE = "normal_closure";
  OtelSemanticConventions.SIGNALR_CONNECTION_STATUS_VALUE_TIMEOUT = "timeout";
  OtelSemanticConventions.ATTR_SIGNALR_TRANSPORT = "signalr.transport";
  OtelSemanticConventions.SIGNALR_TRANSPORT_VALUE_LONG_POLLING = "long_polling";
  OtelSemanticConventions.SIGNALR_TRANSPORT_VALUE_SERVER_SENT_EVENTS = "server_sent_events";
  OtelSemanticConventions.SIGNALR_TRANSPORT_VALUE_WEB_SOCKETS = "web_sockets";
  OtelSemanticConventions.ATTR_TELEMETRY_SDK_LANGUAGE = "telemetry.sdk.language";
  OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_CPP = "cpp";
  OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_DOTNET = "dotnet";
  OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_ERLANG = "erlang";
  OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_GO = "go";
  OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_JAVA = "java";
  OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_NODEJS = "nodejs";
  OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_PHP = "php";
  OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_PYTHON = "python";
  OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_RUBY = "ruby";
  OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_RUST = "rust";
  OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_SWIFT = "swift";
  OtelSemanticConventions.TELEMETRY_SDK_LANGUAGE_VALUE_WEBJS = "webjs";
  OtelSemanticConventions.ATTR_TELEMETRY_SDK_NAME = "telemetry.sdk.name";
  OtelSemanticConventions.ATTR_TELEMETRY_SDK_VERSION = "telemetry.sdk.version";
  OtelSemanticConventions.ATTR_URL_FRAGMENT = "url.fragment";
  OtelSemanticConventions.ATTR_URL_FULL = "url.full";
  OtelSemanticConventions.ATTR_URL_PATH = "url.path";
  OtelSemanticConventions.ATTR_URL_QUERY = "url.query";
  OtelSemanticConventions.ATTR_URL_SCHEME = "url.scheme";
  OtelSemanticConventions.ATTR_USER_AGENT_ORIGINAL = "user_agent.original";
});

// Export the module
export default otelSemanticConventionsExport;
export const OtelSemanticConventions = otelSemanticConventionsExport;

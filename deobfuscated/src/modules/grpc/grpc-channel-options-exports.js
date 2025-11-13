/**
 * GrpcChannelOptionsExports
 *
 * Extracted from Claude Code CLI bundle.
 * Category: grpcExtended
 *
 * Original location: Lines 421979-422033
 * Size: 54 lines
 * Occurrences: 5
 */

import {
  createCommonJSModule,
  defineProperty
} from '../../runtime/module-system.js';

var TE2 = createCommonJSModule(GrpcChannelOptionsExports => {
  Object.defineProperty(GrpcChannelOptionsExports, "__esModule", {
    value: true
  });
  GrpcChannelOptionsExports.recognizedOptions = undefined;
  GrpcChannelOptionsExports.channelOptionsEqual = py5;
  GrpcChannelOptionsExports.recognizedOptions = {
    "grpc.ssl_target_name_override": true,
    "grpc.primary_user_agent": true,
    "grpc.secondary_user_agent": true,
    "grpc.default_authority": true,
    "grpc.keepalive_time_ms": true,
    "grpc.keepalive_timeout_ms": true,
    "grpc.keepalive_permit_without_calls": true,
    "grpc.service_config": true,
    "grpc.max_concurrent_streams": true,
    "grpc.initial_reconnect_backoff_ms": true,
    "grpc.max_reconnect_backoff_ms": true,
    "grpc.use_local_subchannel_pool": true,
    "grpc.max_send_message_length": true,
    "grpc.max_receive_message_length": true,
    "grpc.enable_http_proxy": true,
    "grpc.enable_channelz": true,
    "grpc.dns_min_time_between_resolutions_ms": true,
    "grpc.enable_retries": true,
    "grpc.per_rpc_retry_buffer_size": true,
    "grpc.retry_buffer_size": true,
    "grpc.max_connection_age_ms": true,
    "grpc.max_connection_age_grace_ms": true,
    "grpc-node.max_session_memory": true,
    "grpc.service_config_disable_resolution": true,
    "grpc.client_idle_timeout_ms": true,
    "grpc-node.tls_enable_trace": true,
    "grpc.lb.ring_hash.ring_size_cap": true,
    "grpc-node.retry_max_attempts_limit": true,
    "grpc-node.flow_control_window": true,
    "grpc.server_call_metric_recording": true
  };
  function py5(A, B) {
    let Q = Object.keys(A).sort();
    let I = Object.keys(B).sort();
    if (Q.length !== I.length) {
      return false;
    }
    for (let G = 0; G < Q.length; G += 1) {
      if (Q[G] !== I[G]) {
        return false;
      }
      if (A[Q[G]] !== B[I[G]]) {
        return false;
      }
    }
    return true;
  }
});

// Export the module
export default TE2;
export const GrpcChannelOptionsExports = TE2;

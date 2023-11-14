# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
"""Client and server classes corresponding to protobuf-defined services."""
import grpc

import workerproto.worker_v1_pb2 as worker__v1__pb2


class WorkerManagerServiceStub(object):
    """/ Main service for the worker to hit on the server."""

    def __init__(self, channel):
        """Constructor.

        Args:
            channel: A grpc.Channel.
        """
        self.Heartbeat = channel.unary_unary(
            "/WorkerManagerService/Heartbeat",
            request_serializer=worker__v1__pb2.HeartbeatRequest.SerializeToString,
            response_deserializer=worker__v1__pb2.HeartbeatReply.FromString,
        )


class WorkerManagerServiceServicer(object):
    """/ Main service for the worker to hit on the server."""

    def Heartbeat(self, request, context):
        """Heartbeat: health and status updates for clients to send"""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details("Method not implemented!")
        raise NotImplementedError("Method not implemented!")


def add_WorkerManagerServiceServicer_to_server(servicer, server):
    rpc_method_handlers = {
        "Heartbeat": grpc.unary_unary_rpc_method_handler(
            servicer.Heartbeat,
            request_deserializer=worker__v1__pb2.HeartbeatRequest.FromString,
            response_serializer=worker__v1__pb2.HeartbeatReply.SerializeToString,
        ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
        "WorkerManagerService", rpc_method_handlers
    )
    server.add_generic_rpc_handlers((generic_handler,))


# This class is part of an EXPERIMENTAL API.
class WorkerManagerService(object):
    """/ Main service for the worker to hit on the server."""

    @staticmethod
    def Heartbeat(
        request,
        target,
        options=(),
        channel_credentials=None,
        call_credentials=None,
        insecure=False,
        compression=None,
        wait_for_ready=None,
        timeout=None,
        metadata=None,
    ):
        return grpc.experimental.unary_unary(
            request,
            target,
            "/WorkerManagerService/Heartbeat",
            worker__v1__pb2.HeartbeatRequest.SerializeToString,
            worker__v1__pb2.HeartbeatReply.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
        )

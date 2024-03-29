# Generated by the gRPC Python protocol compiler plugin. DO NOT EDIT!
"""Client and server classes corresponding to protobuf-defined services."""
import grpc

import workerproto.worker_v1_pb2 as worker__v1__pb2


class WorkerManagerServiceStub(object):
    """Missing associated documentation comment in .proto file."""

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
        self.WriteOutputChunk = channel.unary_unary(
            "/WorkerManagerService/WriteOutputChunk",
            request_serializer=worker__v1__pb2.WriteOutputChunkRequest.SerializeToString,
            response_deserializer=worker__v1__pb2.WriteOutputChunkReply.FromString,
        )
        self.CompleteJob = channel.unary_unary(
            "/WorkerManagerService/CompleteJob",
            request_serializer=worker__v1__pb2.CompleteJobRequest.SerializeToString,
            response_deserializer=worker__v1__pb2.CompleteJobReply.FromString,
        )


class WorkerManagerServiceServicer(object):
    """Missing associated documentation comment in .proto file."""

    def Heartbeat(self, request, context):
        """Missing associated documentation comment in .proto file."""
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details("Method not implemented!")
        raise NotImplementedError("Method not implemented!")

    def WriteOutputChunk(self, request, context):
        """Stream a chunk of data as an output file to the server.
        If the named chunk does not exist, it gets created on the fly.
        """
        context.set_code(grpc.StatusCode.UNIMPLEMENTED)
        context.set_details("Method not implemented!")
        raise NotImplementedError("Method not implemented!")

    def CompleteJob(self, request, context):
        """Complete a job, either via the output system or otherwise."""
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
        "WriteOutputChunk": grpc.unary_unary_rpc_method_handler(
            servicer.WriteOutputChunk,
            request_deserializer=worker__v1__pb2.WriteOutputChunkRequest.FromString,
            response_serializer=worker__v1__pb2.WriteOutputChunkReply.SerializeToString,
        ),
        "CompleteJob": grpc.unary_unary_rpc_method_handler(
            servicer.CompleteJob,
            request_deserializer=worker__v1__pb2.CompleteJobRequest.FromString,
            response_serializer=worker__v1__pb2.CompleteJobReply.SerializeToString,
        ),
    }
    generic_handler = grpc.method_handlers_generic_handler(
        "WorkerManagerService", rpc_method_handlers
    )
    server.add_generic_rpc_handlers((generic_handler,))


# This class is part of an EXPERIMENTAL API.
class WorkerManagerService(object):
    """Missing associated documentation comment in .proto file."""

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

    @staticmethod
    def WriteOutputChunk(
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
            "/WorkerManagerService/WriteOutputChunk",
            worker__v1__pb2.WriteOutputChunkRequest.SerializeToString,
            worker__v1__pb2.WriteOutputChunkReply.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
        )

    @staticmethod
    def CompleteJob(
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
            "/WorkerManagerService/CompleteJob",
            worker__v1__pb2.CompleteJobRequest.SerializeToString,
            worker__v1__pb2.CompleteJobReply.FromString,
            options,
            channel_credentials,
            insecure,
            call_credentials,
            compression,
            wait_for_ready,
            timeout,
            metadata,
        )

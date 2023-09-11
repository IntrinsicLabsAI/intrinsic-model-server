import functools
import pathlib
import struct
from dataclasses import dataclass
from io import SEEK_CUR, BufferedReader
from typing import List, Tuple, Union

GGML_FORMATS = {
    b"lmgg": "ggml",
    b"tjgg": "ggjt",
    b"fmgg": "ggmf",
}


@dataclass
class GGMLTensorDescriptor:
    name: str
    ggml_type: str
    dims: List[int]


@dataclass
class GGMLFileFields:
    filename: str
    fmt: str
    version: int | None
    n_vocab: int
    n_embd: int
    n_mult: int
    n_head: int
    n_layer: int
    n_rot: int
    ftype: str
    tensors: List[GGMLTensorDescriptor]


LLAMA_FTYPES = [
    "LLAMA_FTYPE_ALL_F32",
    "LLAMA_FTYPE_MOSTLY_F16",
    "LLAMA_FTYPE_MOSTLY_Q4_0",
    "LLAMA_FTYPE_MOSTLY_Q4_1",
    "LLAMA_FTYPE_MOSTLY_Q4_1_SOME_F16",
    "LLAMA_FTYPE_MOSTLY_Q4_2",
    "LLAMA_FTYPE_MOSTLY_Q4_3",
    "LLAMA_FTYPE_MOSTLY_Q8_0",
    "LLAMA_FTYPE_MOSTLY_Q5_0",
    "LLAMA_FTYPE_MOSTLY_Q5_1",
    "LLAMA_FTYPE_MOSTLY_Q2_K",
    "LLAMA_FTYPE_MOSTLY_Q3_K_S",
    "LLAMA_FTYPE_MOSTLY_Q3_K_M",
    "LLAMA_FTYPE_MOSTLY_Q3_K_L",
    "LLAMA_FTYPE_MOSTLY_Q4_K_S",
    "LLAMA_FTYPE_MOSTLY_Q4_K_M",
    "LLAMA_FTYPE_MOSTLY_Q5_K_S",
    "LLAMA_FTYPE_MOSTLY_Q5_K_M",
    "LLAMA_FTYPE_MOSTLY_Q6_K",
]

GGML_TYPE_F32 = 0
GGML_TYPE_F16 = 1
GGML_TYPE_Q4_0 = 2
GGML_TYPE_Q4_1 = 3
GGML_TYPE_Q4_2 = 4  # support has been removed
GGML_TYPE_Q4_3 = 5  # support has been removed
GGML_TYPE_Q5_0 = 6
GGML_TYPE_Q5_1 = 7
GGML_TYPE_Q8_0 = 8
GGML_TYPE_Q8_1 = 9
# k-quantizations
GGML_TYPE_Q2_K = 10
GGML_TYPE_Q3_K = 11
GGML_TYPE_Q4_K = 12
GGML_TYPE_Q5_K = 13
GGML_TYPE_Q6_K = 14
GGML_TYPE_Q8_K = 15
GGML_TYPE_I8 = 16
GGML_TYPE_I16 = 17
GGML_TYPE_I32 = 18
GGML_TYPE_COUNT = 19

GGML_TYPE_NAMES = [
    "GGML_TYPE_F32",
    "GGML_TYPE_F16",
    "GGML_TYPE_Q4_0",
    "GGML_TYPE_Q4_1",
    "GGML_TYPE_Q4_2",
    "GGML_TYPE_Q4_3",
    "GGML_TYPE_Q5_0",
    "GGML_TYPE_Q5_1",
    "GGML_TYPE_Q8_0",
    "GGML_TYPE_Q8_1",
    "GGML_TYPE_Q2_K",
    "GGML_TYPE_Q3_K",
    "GGML_TYPE_Q4_K",
    "GGML_TYPE_Q5_K",
    "GGML_TYPE_Q6_K",
    "GGML_TYPE_Q8_K",
    "GGML_TYPE_I8",
    "GGML_TYPE_I16",
    "GGML_TYPE_I32",
    "GGML_TYPE_COUNT",
]

QK4_0 = 32
QK4_1 = 32
QK5_0 = 32
QK5_1 = 32
QK8_0 = 32
QK8_1 = 32
QK_K = 256  # super-block

GGML_BLOCK_SIZE = {
    GGML_TYPE_F32: 1,
    GGML_TYPE_F16: 1,
    GGML_TYPE_Q4_0: QK4_0,
    GGML_TYPE_Q4_1: QK4_1,
    GGML_TYPE_Q5_0: QK5_0,
    GGML_TYPE_Q5_1: QK5_1,
    GGML_TYPE_Q8_0: QK8_0,
    GGML_TYPE_Q8_1: QK8_1,
    GGML_TYPE_Q2_K: QK_K,
    GGML_TYPE_Q3_K: QK_K,
    GGML_TYPE_Q4_K: QK_K,
    GGML_TYPE_Q5_K: QK_K,
    GGML_TYPE_Q6_K: QK_K,
    GGML_TYPE_Q8_K: QK_K,
    GGML_TYPE_I8: 1,
    GGML_TYPE_I16: 1,
    GGML_TYPE_I32: 1,
}

GGML_TYPE_SIZE = {
    GGML_TYPE_F32: 4,
    GGML_TYPE_F16: 2,
    GGML_TYPE_Q4_0: 2 + 16,
    GGML_TYPE_Q4_1: 2 * 2 + 16,
    GGML_TYPE_Q5_0: 2 + 4 + 16,
    GGML_TYPE_Q5_1: 2 + 2 + 4 + 16,
    GGML_TYPE_Q8_0: 2 + 32,
    GGML_TYPE_Q8_1: 32 + 32 + 32,
    GGML_TYPE_Q2_K: 16 + 64 + 2 + 2,
    GGML_TYPE_Q3_K: 32 + 64 + 12 + 2,
    GGML_TYPE_Q4_K: 2 + 2 + 12 + 128,
    GGML_TYPE_Q5_K: 2 + 2 + 12 + 32 + 128,
    GGML_TYPE_Q6_K: 128 + 64 + 16 + 2,
    GGML_TYPE_Q8_K: 32 + 256 + 32,
    GGML_TYPE_I8: 1,
    GGML_TYPE_I16: 2,
    GGML_TYPE_I32: 4,
}


class GGMLFile:
    def __init__(self, path: pathlib.Path) -> None:
        if not (path.resolve().exists() and path.resolve().is_file()):
            raise ValueError(f"Invalid path: must be file {path}")
        self._path = path

    def read_structure(self) -> GGMLFileFields:
        with self._path.resolve().open("rb") as fp:
            fmt, version = self.read_magic(fp)
            n_vocab = self.read_u32(fp)
            n_embd = self.read_u32(fp)
            n_mult = self.read_u32(fp)
            n_head = self.read_u32(fp)
            n_layer = self.read_u32(fp)
            n_rot = self.read_u32(fp)
            ftype = LLAMA_FTYPES[self.read_u32(fp)]

            # Should we read the vocab?
            self.skip_vocab(fp, n_vocab, fmt, version or 1)
            # Should we read the set of tensor names and dims?
            tensors = self.read_tensor_descriptors(fp)

            return GGMLFileFields(
                filename=str(self._path.absolute()),
                fmt=fmt,
                version=version,
                n_vocab=n_vocab,
                n_embd=n_embd,
                n_mult=n_mult,
                n_head=n_head,
                n_layer=n_layer,
                n_rot=n_rot,
                ftype=ftype,
                tensors=tensors,
            )

    def read_magic(self, fp: BufferedReader) -> Tuple[str, Union[int, None]]:
        magic = fp.read(4)
        if len(magic) < 4:
            return ("unknown", -1)
        format = GGML_FORMATS.get(magic, "unknown")

        if format == "ggml":
            return ("ggml", None)

        version_bytes = fp.read(4)
        if len(version_bytes) < 4:
            return ("unknown", None)
        [version] = struct.unpack("<i", version_bytes)

        return (format, version)

    def read_u32(self, buf: BufferedReader) -> int:
        v = buf.read(4)
        [value] = struct.unpack("<i", v)
        return int(value)

    def skip_vocab(
        self, fp: BufferedReader, n_vocab: int, fmt: str, version: int
    ) -> None:
        for _ in range(n_vocab):
            word_len = self.read_u32(fp)
            _ = fp.read(word_len)
            if fmt == "ggjt" or fmt == "ggmf":
                # For all formats newer than original ggml, the score is embedded in the vocab section.
                _ = fp.read(4)

    def read_tensor_descriptors(self, fp: BufferedReader) -> List[GGMLTensorDescriptor]:
        tensor_descs: List[GGMLTensorDescriptor] = []
        while len(fp.peek(4)[:4]) == 4:
            n_dims = self.read_u32(fp)
            if not (n_dims == 1 or n_dims == 2):
                raise GGMLParseError(f"Invalid n_dims {n_dims}, must be in (1, 2)")

            name_len = self.read_u32(fp)
            if name_len >= 500:
                raise GGMLParseError(
                    f"Invalid name_len {name_len}, this file appears to be corrupted or unaligned"
                )

            shard_type = self.read_u32(fp)
            if not (shard_type >= GGML_TYPE_F32 and shard_type <= GGML_TYPE_Q6_K):
                raise GGMLParseError(f"Invalid shard_type {shard_type}")

            # skip dims
            dims = []
            for _ in range(n_dims):
                dims.append(self.read_u32(fp))
            tensor_name = str(fp.read(name_len), encoding="ascii")
            tensor_descs.append(
                GGMLTensorDescriptor(
                    name=tensor_name, dims=dims, ggml_type=GGML_TYPE_NAMES[shard_type]
                )
            )

            # Skip to next 32 byte aligned address in the file
            addr = fp.tell()
            next_aligned = -addr & 31
            fp.seek(next_aligned, SEEK_CUR)

            # Skip forward thru the file sizes
            tensor_sz = self.calc_shard_size(shard_type, dims)
            fp.seek(tensor_sz, SEEK_CUR)

        return tensor_descs

    def calc_shard_size(self, ggml_type: int, dims: List[int]) -> int:
        """
        Direct translation of:

        static size_t llama_calc_tensor_size(const std::vector<uint32_t> & ne, enum ggml_type type) {
            size_t size = ggml_type_size(type);
            for (uint32_t dim : ne) {
                size = checked_mul<size_t>(size, dim);
            }
            return size / ggml_blck_size(type);
        }
        """

        ne = functools.reduce(lambda d, p: d * p, dims, 1)
        return int(GGML_TYPE_SIZE[ggml_type] * ne / GGML_BLOCK_SIZE[ggml_type])


class GGMLParseError(Exception):
    def __init__(self, reason: str) -> None:
        super().__init__(reason)


class GGMLCompatibilityError(Exception):
    def __init__(self, reason: str) -> None:
        super().__init__(reason)


def check_compatible_with_latest_llamacpp(ggml_parsed: GGMLFileFields) -> None:
    versions = [
        ("ggml", None),  # v0
        ("ggmf", 1),  # v1
        ("ggjt", 1),  # v2
        ("ggjt", 2),  # v3
        ("ggjt", 3),  # v4
    ]
    version_tuple = (ggml_parsed.fmt, ggml_parsed.version)
    try:
        version_idx = versions.index(version_tuple)
    except ValueError:
        version_idx = -1

    if version_idx < 3:
        if ggml_parsed.ftype not in [
            "LLAMA_FTYPE_ALL_F32",
            "LLAMA_FTYPE_MOSTLY_F16",
            "LLAMA_FTYPE_MOSTLY_Q8_0",
        ]:
            raise GGMLCompatibilityError(
                f"quant type {ggml_parsed.ftype} is no longer supported from version {ggml_parsed.fmt}v{ggml_parsed.version}, upgrade your GGML file"
            )

    if version_idx < 4:
        if ggml_parsed.ftype in [
            "LLAMA_FTYPE_MOSTLY_Q4_0",
            "LLAMA_FTYPE_MOSTLY_Q4_1",
            "LLAMA_FTYPE_MOSTLY_Q8_0",
        ]:
            raise GGMLCompatibilityError(
                f"quant type {ggml_parsed.ftype} is no longer supported from version {ggml_parsed.fmt}v{ggml_parsed.version}, upgrade your GGML file"
            )

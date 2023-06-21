import logging
import sys

import colorlog

stdout = colorlog.StreamHandler(stream=sys.stdout)
stdout.setFormatter(
    colorlog.ColoredFormatter(
        "%(log_color)s%(levelname)-8s%(reset)s %(log_color)s%(message)s",
        datefmt=None,
        reset=True,
        log_colors={
            "DEBUG": "cyan",
            "INFO": "green",
            "WARNING": "yellow",
            "ERROR": "red",
            "CRITICAL": "red",
        },
    ),
)


logging.basicConfig(
    level=logging.DEBUG,
    handlers=[
        stdout,
    ],
)

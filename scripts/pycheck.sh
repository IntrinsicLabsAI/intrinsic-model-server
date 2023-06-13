#!/usr/bin/env bash

set -eu -o pipefail

rootdir=$(cd `dirname $0`/.. && pwd)

# $rootdir/venv/bin/isort --profile black --check --diff modelserver
$rootdir/venv/bin/black modelserver --check --diff
$rootdir/venv/bin/mypy --strict modelserver
$rootdir/venv/bin/pytest

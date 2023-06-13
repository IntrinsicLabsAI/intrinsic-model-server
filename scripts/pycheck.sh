#!/usr/bin/env bash

set -eu -o pipefail

rootdir=$(cd `dirname $0`/.. && pwd)

cd $rootdir
ls -l $rootdir

./venv/bin/isort --profile black --check --diff modelserver
./venv/bin/black modelserver --check --diff
./venv/bin/mypy --strict modelserver
./venv/bin/pytest

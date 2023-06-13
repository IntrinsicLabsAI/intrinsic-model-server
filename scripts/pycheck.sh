#!/usr/bin/env bash

set -eu -o pipefail

rootdir=$(cd `dirname $0`/.. && pwd)

$rootdir/venv/bin/isort --profile black --check --diff modelserver
$rootdir/venv/bin/black modelserver --check --diff

$rootdir/venv/bin/flake8 modelserver --count --select=E9,F63,F7,F82 --show-source --statistics
$rootdir/venv/bin/flake8 modelserver --count --exit-zero --max-complexity=10 --max-line-length=127 --statistics

$rootdir/venv/bin/mypy --strict modelserver
$rootdir/venv/bin/pytest

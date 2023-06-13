#!/usr/bin/env bash

set -eu -o pipefail

rootdir=$(cd `dirname $0`/.. && pwd)
mode=${FIX:-check}

function check() {
  ./venv/bin/isort --profile black --check --diff modelserver
  ./venv/bin/black modelserver --check --diff
  ./venv/bin/mypy --strict modelserver
  ./venv/bin/pytest
}

function fix() {
  ./venv/bin/isort --profile black modelserver
  ./venv/bin/black modelserver
}

if [[ "$mode" = "check" ]]; then
	check
else
	fix
fi

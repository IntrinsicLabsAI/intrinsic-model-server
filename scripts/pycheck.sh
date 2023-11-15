#!/usr/bin/env bash

set -eu -o pipefail

rootdir=$(cd `dirname $0`/.. && pwd)
mode=${FIX:-check}

function check() {
  .venv/bin/isort --profile black --check --diff modelserver
  .venv/bin/isort --profile black --check --diff workerserver
  .venv/bin/black modelserver --check --diff
  .venv/bin/black workerserver --check --diff
  .venv/bin/mypy --strict modelserver --ignore-missing-imports
  .venv/bin/mypy --strict workerserver --ignore-missing-imports
  .venv/bin/pytest -v
  .venv/bin/ruff check modelserver
  .venv/bin/ruff check workerserver
}

function fix() {
  .venv/bin/isort --profile black modelserver
  .venv/bin/black modelserver
  .venv/bin/isort --profile black workerserver
  .venv/bin/black workerserver
}

if [[ "$mode" = "check" ]]; then
	check
else
	fix
fi

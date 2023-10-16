# syntax=docker/dockerfile:1

FROM node:18.16.0-alpine3.18 AS build-frontend

RUN mkdir /app
COPY frontend/ /app
WORKDIR /app

RUN npm install && npm run build


FROM python:3.11.4-slim-bullseye
LABEL authors="intrinsiclabsai"

# For cleanliness
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONBUFFERED 1

# Add build packages
RUN apt update \
    && apt install -y build-essential cmake \
    && rm -rf /var/lib/apt /var/lib/dpkg /var/lib/cache /var/lib/log

# Start server
RUN mkdir /app
RUN mkdir /app/frontend

WORKDIR /app
COPY requirements.txt .
COPY modelserver/ ./modelserver
COPY --from=build-frontend /app/dist/ ./frontend/dist

RUN pip install poetry
RUN poetry install --without=dev,remoteworker

EXPOSE 8000
CMD ["./venv/bin/uvicorn", "modelserver.app:app", "--host", "0.0.0.0", "--port", "8000"]

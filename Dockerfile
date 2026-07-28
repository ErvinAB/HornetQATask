FROM mcr.microsoft.com/playwright:v1.62.0-noble AS base

USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends openjdk-21-jre-headless && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY app ./app
COPY serve.json ./
COPY tests ./tests
COPY playwright.config.ts tsconfig.json allure.setup.ts ./

CMD ["npx", "playwright", "test"]

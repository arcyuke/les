FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node package.json ./
COPY --chown=node:node dist ./dist
COPY --chown=node:node server ./server
COPY --chown=node:node scripts ./scripts
RUN node scripts/build.mjs && mkdir /app/.runtime && chown node:node /app/.runtime
USER node
ENV PORT=3000 DATA_DIR=/app/.runtime
EXPOSE 3000
CMD ["node", "server/index.mjs"]

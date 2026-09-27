# FROM node:24-alpine 

# # Set the working directory
# WORKDIR /app

# # Copy the package.json and package-lock.json files
# COPY package*.json ./

# # Install the dependencies
# RUN npm install

# # Copy the source code
# COPY . .

# # Expose the port
# EXPOSE 3000

# # Start the application
# CMD ["npm", "run", "start"]


# Multi-stage builds

# Builder stage (stage 01)
# node:*-alpine (musl libc) cannot run onnxruntime-node, a dependency of
# @huggingface/transformers used for local embeddings: it only ships
# glibc-linked native binaries and fails with ERR_DLOPEN_FAILED on Alpine.
# node:*-bookworm-slim (Debian, glibc) is required instead.
FROM node:24-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./

# Installs dependencies using npm ci 
# (clean install — faster and more reliable than npm install). 
# The --omit=dev flag excludes devDependencies, 
# keeping only production packages. This folder stays in the builder stage.
RUN npm ci --omit=dev
########################################################


# Runner stage (stage 02)
FROM node:24-bookworm-slim
# Copies the production dependencies from the builder stage.
# The --from=builder flag specifies the stage to copy from.
# The /app/node_modules folder is the same as in the builder stage.
# The . . copies the rest of the application code from the current directory.
# The EXPOSE 3000 command exposes the port 3000.
# The CMD ["npm", "run", "start"] command starts the application.
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]

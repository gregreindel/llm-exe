# Use Ubuntu as the base
FROM ubuntu:22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl git unzip jq \
    && rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci  # Install dependencies efficiently

# Copy the rest of the code
COPY . .

# Build the package
RUN npm run build:package
RUN npm pack

# Find the packed package
RUN export PACKED_PACKAGE=$(find . -maxdepth 1 -type f -name 'llm-exe-*.tgz') && \
    echo "Packed package: $PACKED_PACKAGE" && \
    jq --arg pkg "$PACKED_PACKAGE" '.dependencies["llm-exe"] = "./" + $pkg' examples/package.json > examples/package.json.tmp && \
    mv examples/package.json.tmp examples/package.json

# Install dependencies in examples directory
RUN cd examples && npm install

# Expose Ollama API port
EXPOSE 11434

# Start Ollama and keep the container running
CMD ["bash", "-c", "ollama serve & sleep 2 && npm run test-examples"]
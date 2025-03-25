# Start with Ollama base image
FROM ollama/ollama:latest

# Install Node.js (adjust as needed)
RUN apt-get update && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
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

# Find the packed package and install it
RUN npm install $(find . -maxdepth 1 -type f -name '*.tgz')

# Ensure Ollama is ready before testing
RUN for i in {1..10}; do curl -s http://localhost:11434/api/tags && exit 0 || sleep 3; done

# Pull multiple models
RUN for model in mistral deepseek gpt-3.5-turbo claude-3; do \
    echo "Pulling model: $model"; \
    ollama pull $model || echo "Skipping unavailable model: $model"; \
    done

# Run tests
CMD ["npm", "run", "test-examples"]
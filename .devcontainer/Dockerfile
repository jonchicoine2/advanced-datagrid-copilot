# Start from Microsoft Node + PowerShell image
FROM mcr.microsoft.com/devcontainers/typescript-node:18

# Optional: Install SQL Server tools, curl, and other extras
RUN apt-get update && \
    apt-get install -y curl apt-transport-https gnupg && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/debian/10/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y msodbcsql17 mssql-tools unixodbc-dev && \
    echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> /etc/bash.bashrc

# Set default shell to PowerShell
ENV SHELL=/usr/bin/pwsh

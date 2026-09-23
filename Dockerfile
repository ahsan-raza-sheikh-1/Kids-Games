FROM node:24-alpine AS frontend-build
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src
COPY backend/KidsGame.Api.csproj backend/
RUN dotnet restore backend/KidsGame.Api.csproj
COPY backend/ backend/
COPY --from=frontend-build /src/frontend/dist frontend/dist
RUN dotnet publish backend/KidsGame.Api.csproj --configuration Release --output /app/publish --no-restore /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=backend-build /app/publish ./
COPY --from=frontend-build /src/frontend/dist /frontend/dist
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["dotnet", "KidsGame.Api.dll"]

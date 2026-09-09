pipeline {
    agent any

    environment {
        IMAGE = 'dakshsinghal28/placementos'
        DOCKER_PATH = 'C:\\Users\\Daksh\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Docker') {
            steps {
                powershell '''
                    Write-Host "Checking Docker..."

                    & "${env:DOCKER_PATH}" --version

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker CLI could not be executed."
                    }

                    & "${env:DOCKER_PATH}" version

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker daemon is not available. Start Docker Desktop."
                    }

                    Write-Host "Docker is working."
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                powershell '''
                    Write-Host "Building Docker image..."

                    & "${env:DOCKER_PATH}" build `
                        -t "${env:IMAGE}:${env:BUILD_NUMBER}" `
                        -t "${env:IMAGE}:latest" .

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker image build failed."
                    }

                    Write-Host "Docker image built successfully."
                '''
            }
        }

        stage('Test Docker Credentials') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    powershell '''
                        Write-Host "======================================"
                        Write-Host "      DOCKER CREDENTIAL CHECK"
                        Write-Host "======================================"

                        Write-Host "Username: [$env:DOCKER_USER]"

                        if ($null -eq $env:DOCKER_TOKEN) {
                            throw "DOCKER_TOKEN is NULL"
                        }

                        Write-Host "Token length: $($env:DOCKER_TOKEN.Length)"

                        if ($env:DOCKER_TOKEN.Length -eq 0) {
                            throw "DOCKER_TOKEN is EMPTY"
                        }

                        Write-Host "======================================"
                        Write-Host "Testing Docker Hub login..."
                        Write-Host "======================================"

                        $env:DOCKER_TOKEN | & "${env:DOCKER_PATH}" login `
                            --username "$env:DOCKER_USER" `
                            --password-stdin

                        Write-Host "Docker login exit code: $LASTEXITCODE"

                        if ($LASTEXITCODE -ne 0) {
                            throw "Docker Hub authentication failed."
                        }

                        Write-Host "======================================"
                        Write-Host "DOCKER LOGIN SUCCESSFUL"
                        Write-Host "======================================"
                    '''
                }
            }
        }
    }

    post {
        always {
            powershell '''
                Write-Host "Pipeline finished."
            '''
        }
    }
}
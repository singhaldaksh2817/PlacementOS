pipeline {
    agent any

    environment {
        IMAGE = 'dakshsinghal28/placementos'
        DOCKER_PATH = 'C:\Users\Daksh\AppData\Local\Programs\DockerDesktop\resources\bin\docker.exe'
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

        stage('Compare Docker Credential') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    powershell '''
                        Write-Host "======================================"
                        Write-Host "      JENKINS CREDENTIAL CHECK"
                        Write-Host "======================================"

                        Write-Host "Username: [$env:DOCKER_USER]"

                        if ($null -eq $env:DOCKER_TOKEN) {
                            throw "DOCKER_TOKEN is NULL"
                        }

                        Write-Host "Token length: $($env:DOCKER_TOKEN.Length)"

                        if ($env:DOCKER_TOKEN.Length -eq 0) {
                            throw "DOCKER_TOKEN is EMPTY"
                        }

                        $bytes = [System.Text.Encoding]::UTF8.GetBytes($env:DOCKER_TOKEN)

                        $sha256 = [System.Security.Cryptography.SHA256]::Create()

                        $hashBytes = $sha256.ComputeHash($bytes)

                        $hash = [BitConverter]::ToString($hashBytes).Replace("-", "").ToLower()

                        Write-Host "Jenkins token SHA256: $hash"

                        Write-Host "======================================"
                        Write-Host "Expected token SHA256:"
                        Write-Host "00d516c2f6d0b180e9a5f77677489860ab8d176b8eb3443e4dd3ae3fe328abd2"
                        Write-Host "======================================"

                        if ($hash -eq "00d516c2f6d0b180e9a5f77677489860ab8d176b8eb3443e4dd3ae3fe328abd2") {
                            Write-Host "TOKEN MATCHES EXACTLY"
                        }
                        else {
                            Write-Host "TOKEN DOES NOT MATCH"
                            throw "Jenkins is receiving a different Docker Hub token."
                        }
                    '''
                }
            }
        }
    }

    post {
        always {
            Write-Host "Pipeline finished."
        }
    }
}

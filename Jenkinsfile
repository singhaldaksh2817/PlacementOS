pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        IMAGE = 'dakshsinghal28/placementos'
        DOCKER_PATH = 'C:/Users/Daksh/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe'
        DOCKER_HOST = 'npipe:////./pipe/dockerDesktopLinuxEngine'
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
                    Write-Host "===== DOCKER CHECK ====="

                    if (-not (Test-Path "${env:DOCKER_PATH}")) {
                        throw "Docker executable not found."
                    }

                    & "${env:DOCKER_PATH}" version

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker Desktop is not running."
                    }

                    Write-Host "Docker is running successfully."
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                powershell '''
                    Write-Host "===== BUILDING DOCKER IMAGE ====="

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

        stage('Docker Hub Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    powershell '''
                        Write-Host "===== DOCKER HUB LOGIN ====="

                        $env:DOCKER_TOKEN | & "${env:DOCKER_PATH}" login `
                            --username "$env:DOCKER_USER" `
                            --password-stdin

                        if ($LASTEXITCODE -ne 0) {
                            throw "Docker Hub login failed."
                        }

                        Write-Host "Docker Hub login successful."
                    '''
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                powershell '''
                    Write-Host "===== PUSHING IMAGE ====="

                    & "${env:DOCKER_PATH}" push "${env:IMAGE}:${env:BUILD_NUMBER}"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to push build image."
                    }

                    & "${env:DOCKER_PATH}" push "${env:IMAGE}:latest"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to push latest image."
                    }

                    Write-Host "Docker images pushed successfully."
                '''
            }
        }

        stage('Docker Logout') {
            steps {
                powershell '''
                    & "${env:DOCKER_PATH}" logout
                    Write-Host "Docker Hub logout completed."
                '''
            }
        }
    }

    post {
        success {
            echo "========================================="
            echo "      PIPELINE SUCCESSFUL"
            echo "========================================="
            echo "Docker image: ${IMAGE}:${BUILD_NUMBER}"
            echo "Docker image: ${IMAGE}:latest"
            echo "========================================="
        }

        failure {
            echo "========================================="
            echo "       PIPELINE FAILED"
            echo "========================================="
        }
    }
}

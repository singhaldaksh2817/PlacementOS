pipeline {
    agent any

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
    options {
        skipDefaultCheckout(true)
    }
            steps {
                powershell '''
                    Write-Host "===== DOCKER CHECK ====="

                    if (-not (Test-Path "${env:DOCKER_PATH}")) {
                        throw "Docker executable not found at ${env:DOCKER_PATH}"
                    }

                    Write-Host "Docker path:"
                    Write-Host "${env:DOCKER_PATH}"

                    Write-Host ""
                    Write-Host "Docker version:"
                    & "${env:DOCKER_PATH}" version

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker is not running. Please start Docker Desktop."
                    }

                    Write-Host ""
                        throw "Docker executable not found."
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                powershell '''
                    Write-Host "===== BUILDING DOCKER IMAGE ====="

                    & "${env:DOCKER_PATH}" build `
                        throw "Docker Desktop is not running."
                        -t "${env:IMAGE}:latest" .

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker image build failed."
                    }

                    Write-Host ""
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
                    Write-Host "===== PUSHING DOCKER IMAGE ====="

                    & "${env:DOCKER_PATH}" push "${env:IMAGE}:${env:BUILD_NUMBER}"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker image push failed for build number tag."
                    }

                    & "${env:DOCKER_PATH}" push "${env:IMAGE}:latest"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker image push failed for latest tag."
                    }

                    Write-Host ""
                    Write-Host "===== PUSHING IMAGE ====="
                '''
            }
        }

                        throw "Failed to push build image."
            steps {
                powershell '''
                    Write-Host "===== DOCKER HUB LOGOUT ====="

                    & "${env:DOCKER_PATH}" logout
                        throw "Failed to push latest image."
                    Write-Host "Docker Hub logout completed."
                '''
            }
        }
    }

    post {
        success {
            echo "========================================="
            echo " CI/CD PIPELINE COMPLETED SUCCESSFULLY"
            echo " Image: ${IMAGE}:${BUILD_NUMBER}"
        }

        failure {
            echo "========================================="
            echo " CI/CD PIPELINE FAILED"
            echo " Check the stage above for the error."
            echo "========================================="
        }

        cleanup {
            powershell '''
                if (Test-Path "$env:WORKSPACE\\.docker-config") {
                    Remove-Item "$env:WORKSPACE\\.docker-config" -Recurse -Force -ErrorAction SilentlyContinue
                }
            '''
        }
    }
}
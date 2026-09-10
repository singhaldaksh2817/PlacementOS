pipeline {
    agent any

    environment {
        IMAGE = 'dakshsinghal28/placementos'
        DOCKER_PATH = 'C:/Users/Daksh/AppData/Local/Programs/DockerDesktop/resources/bin/docker.exe'
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
                    & "${env:DOCKER_PATH}" --version
                    & "${env:DOCKER_PATH}" version

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker is not available."
                    }
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                powershell '''
                    & "${env:DOCKER_PATH}" build `
                        -t "${env:IMAGE}:${env:BUILD_NUMBER}" `
                        -t "${env:IMAGE}:latest" .

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker build failed."
                    }
                '''
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    powershell '''
                        $env:DOCKER_CONFIG = "$env:WORKSPACE\\.docker-config"

                        New-Item -ItemType Directory `
                            -Path $env:DOCKER_CONFIG `
                            -Force | Out-Null

                        $DOCKER_TOKEN | & "${env:DOCKER_PATH}" login `
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

        stage('Push to Docker Hub') {
            steps {
                powershell '''
                    & "${env:DOCKER_PATH}" push "${env:IMAGE}:${env:BUILD_NUMBER}"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker image push failed."
                    }

                    & "${env:DOCKER_PATH}" push "${env:IMAGE}:latest"

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker latest image push failed."
                    }

                    Write-Host "Docker images pushed successfully."
                '''
            }
        }
    }

    post {
        always {
            powershell '''
                if (Test-Path "$env:WORKSPACE\\.docker-config") {
                    Remove-Item "$env:WORKSPACE\\.docker-config" -Recurse -Force -ErrorAction SilentlyContinue
                }
            '''
        }
    }
}
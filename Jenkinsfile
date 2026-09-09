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

        stage('Docker Context Check') {
            steps {
                powershell '''
                    Write-Host "======================================"
                    Write-Host "        DOCKER CONTEXT CHECK"
                    Write-Host "======================================"

                    Write-Host "Docker version:"
                    & "${env:DOCKER_PATH}" version

                    Write-Host ""
                    Write-Host "Docker context:"
                    & "${env:DOCKER_PATH}" context show

                    Write-Host ""
                    Write-Host "Available Docker contexts:"
                    & "${env:DOCKER_PATH}" context ls

                    Write-Host ""
                    Write-Host "Docker info:"
                    & "${env:DOCKER_PATH}" info

                    Write-Host "======================================"
                '''
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}

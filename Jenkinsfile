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
                    & "${env:DOCKER_PATH}" --version

                    if ($LASTEXITCODE -ne 0) {
                        throw 'Docker CLI could not be executed.'
                    }

                    & "${env:DOCKER_PATH}" version

                    if ($LASTEXITCODE -ne 0) {
                        throw 'Docker daemon is not available. Start Docker Desktop.'
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
                        exit $LASTEXITCODE
                    }
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_TOKEN'
                )]) {
                    powershell '''
                        Write-Host "Docker Hub user: $env:DOCKERHUB_USER"

                        if ([string]::IsNullOrWhiteSpace($env:DOCKERHUB_USER)) {
                            throw 'Docker Hub username is empty.'
                        }

                        if ([string]::IsNullOrWhiteSpace($env:DOCKERHUB_TOKEN)) {
                            throw 'Docker Hub token is empty.'
                        }

                        $env:DOCKERHUB_TOKEN | & "${env:DOCKER_PATH}" login `
                            --username $env:DOCKERHUB_USER `
                            --password-stdin

                        if ($LASTEXITCODE -ne 0) {
                            throw 'Docker Hub login failed.'
                        }

                        Write-Host 'Docker Hub login successful.'

                        Write-Host "Pushing ${env:IMAGE}:${env:BUILD_NUMBER}"

                        & "${env:DOCKER_PATH}" push "${env:IMAGE}:${env:BUILD_NUMBER}"
                        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

                        Write-Host "Pushing ${env:IMAGE}:latest"

                        & "${env:DOCKER_PATH}" push "${env:IMAGE}:latest"
                        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

                        Write-Host 'Docker images pushed successfully.'
                    '''
                }
            }
        }
    }
}
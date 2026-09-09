pipeline {
    agent any

    environment {
        IMAGE = 'daksh280306/placementos'
        PATH+DOCKER = 'C:\\Program Files\\Docker\\Docker\\resources\\bin'
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
                    $docker = Get-Command docker.exe -ErrorAction SilentlyContinue
                    if (-not $docker) {
                        throw 'Docker CLI was not found. Install Docker Engine/Desktop on the Jenkins agent and ensure the Jenkins service can access docker.exe.'
                    }

                    docker version
                    if ($LASTEXITCODE -ne 0) {
                        throw 'Docker CLI was found, but the Docker daemon is not available. Start Docker and grant the Jenkins service access to it.'
                    }
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                powershell 'docker build -t "${env:IMAGE}:${env:BUILD_NUMBER}" -t "${env:IMAGE}:latest" .'
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
                        $env:DOCKERHUB_TOKEN | docker login --username $env:DOCKERHUB_USER --password-stdin
                        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

                        docker push "${env:IMAGE}:${env:BUILD_NUMBER}"
                        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

                        docker push "${env:IMAGE}:latest"
                        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
                    '''
                }
            }
        }
    }
}
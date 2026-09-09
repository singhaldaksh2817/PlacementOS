pipeline {
    agent any

    environment {
        IMAGE = 'daksh280306/placementos'
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
                        $dockerHubUser = $env:DOCKERHUB_USER.Trim()
                        $dockerHubToken = $env:DOCKERHUB_TOKEN.Trim()

                        if ([string]::IsNullOrWhiteSpace($dockerHubUser) -or [string]::IsNullOrWhiteSpace($dockerHubToken)) {
                            throw 'Docker Hub credentials are empty. Update the Jenkins credential with the Docker Hub username and a Personal Access Token.'
                        }

                        $dockerHubToken | & "${env:DOCKER_PATH}" login `
                            --username $dockerHubUser `
                            --password-stdin

                        if ($LASTEXITCODE -ne 0) {
                            throw 'Docker Hub login failed. The Jenkins username must match the image owner and the password must be a valid Docker Hub Personal Access Token.'
                        }

                        & "${env:DOCKER_PATH}" push "${env:IMAGE}:${env:BUILD_NUMBER}"
                        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

                        & "${env:DOCKER_PATH}" push "${env:IMAGE}:latest"
                        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
                    '''
                }
            }
        }
    }
}
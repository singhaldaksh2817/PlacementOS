pipeline {
    agent any

    environment {
        IMAGE = 'daksh280306/placementos'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
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
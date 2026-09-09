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
                    Write-Host "===== DOCKER CHECK ====="

                    & "${env:DOCKER_PATH}" --version
                    & "${env:DOCKER_PATH}" version

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker is not available."
                    }

                    Write-Host "Docker is working."
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                powershell '''
                    Write-Host "===== BUILD IMAGE ====="

                    & "${env:DOCKER_PATH}" build `
                        -t "${env:IMAGE}:${env:BUILD_NUMBER}" `
                        -t "${env:IMAGE}:latest" .

                    if ($LASTEXITCODE -ne 0) {
                        throw "Docker build failed."
                    }

                    Write-Host "Docker build successful."
                '''
            }
        }

        stage('Check Docker Hub Connection') {
            steps {
                powershell '''
                    Write-Host "======================================"
                    Write-Host "     DOCKER HUB CONNECTION TEST"
                    Write-Host "======================================"

                    Write-Host "Testing Docker Hub registry..."

                    try {
                        $response = Invoke-WebRequest `
                            -Uri "https://registry-1.docker.io/v2/" `
                            -UseBasicParsing `
                            -ErrorAction Stop

                        Write-Host "HTTP Status: $($response.StatusCode)"
                    }
                    catch {
                        Write-Host "Docker Hub response received:"
                        Write-Host $_.Exception.Message
                    }

                    Write-Host ""
                    Write-Host "Testing Docker Hub authentication endpoint..."

                    try {
                        $response = Invoke-WebRequest `
                            -Uri "https://auth.docker.io/token?service=registry.docker.io&scope=repository:dakshsinghal28/placementos:push,pull" `
                            -UseBasicParsing `
                            -ErrorAction Stop

                        Write-Host "Auth endpoint HTTP Status: $($response.StatusCode)"
                    }
                    catch {
                        Write-Host "Auth endpoint response:"
                        Write-Host $_.Exception.Message
                    }

                    Write-Host "======================================"
                '''
            }
        }

        stage('Credential Information') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {
                    powershell '''
                        Write-Host "======================================"
                        Write-Host "       CREDENTIAL INFORMATION"
                        Write-Host "======================================"

                        Write-Host "Username: [$env:DOCKER_USER]"
                        Write-Host "Token length: $($env:DOCKER_TOKEN.Length)"

                        Write-Host ""
                        Write-Host "Jenkins Windows user:"

                        whoami

                        Write-Host ""
                        Write-Host "USERPROFILE:"
                        Write-Host $env:USERPROFILE

                        Write-Host ""
                        Write-Host "HOME:"
                        Write-Host $env:HOME

                        Write-Host "======================================"
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Diagnostic pipeline finished.'
        }
    }
}

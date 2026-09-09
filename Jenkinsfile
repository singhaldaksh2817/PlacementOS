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

        stage('Docker Hub Login Test') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_TOKEN'
                )]) {

                    powershell '''
                        Write-Host "======================================"
                        Write-Host "       DOCKER HUB LOGIN TEST"
                        Write-Host "======================================"

                        Write-Host "Username: [$env:DOCKER_USER]"
                        Write-Host "Token length: $($env:DOCKER_TOKEN.Length)"

                        $tokenFile = Join-Path $env:TEMP "jenkins-docker-token.txt"

                        try {

                            # Write the exact Jenkins credential to a temporary file
                            [System.IO.File]::WriteAllText(
                                $tokenFile,
                                $env:DOCKER_TOKEN,
                                [System.Text.UTF8Encoding]::new($false)
                            )

                            Write-Host "Temporary credential file created."

                            # Login using the token file
                            Get-Content $tokenFile -Raw |
                                & "${env:DOCKER_PATH}" login `
                                    --username "$env:DOCKER_USER" `
                                    --password-stdin

                            $loginCode = $LASTEXITCODE

                            Write-Host "Docker login exit code: $loginCode"

                            if ($loginCode -ne 0) {
                                throw "Docker Hub login failed."
                            }

                            Write-Host "======================================"
                            Write-Host "       DOCKER LOGIN SUCCESSFUL"
                            Write-Host "======================================"

                        }
                        finally {

                            if (Test-Path $tokenFile) {
                                Remove-Item $tokenFile -Force
                                Write-Host "Temporary credential file removed."
                            }

                        }
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
    }
}

pipeline {
    agent any

    environment {
        // Ensure PATH includes typical locations for Docker and node
        PATH = "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            echo 'Installing frontend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }
                stage('Backend') {
                    steps {
                        dir('backend') {
                            echo 'Installing backend dependencies...'
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Building Docker images via docker compose...'
                sh 'docker compose build'
            }
        }

        stage('Test') {
            steps {
                // Test backend, ensuring MongoDB connection works
                withCredentials([string(credentialsId: 'mongo-uri', variable: 'MONGO_URI')]) {
                    dir('backend') {
                        echo 'Running backend tests...'
                        // Simple connection sanity check before npm test
                        sh '''
node -e "
    const mongoose = require('mongoose');
    const uri = process.env.MONGO_URI;
    mongoose.connect(uri)
        .then(() => { console.log('MongoDB connection OK'); process.exit(0); })
        .catch(err => { console.error('MongoDB connection FAILED', err); process.exit(1); });
"
'''
                        sh 'npm test'
                    }
                }
            }
        }

        stage('Code Quality') {
            steps {
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    echo 'Running SonarQube analysis...'
                    sh '''
                    sonar-scanner \
                        -Dsonar.projectKey=Kapish08_Emergency \
                        -Dsonar.organization=kapish08 \
                        -Dsonar.host.url=https://sonarcloud.io \
                        -Dsonar.login=$SONAR_TOKEN
                    '''
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Running Trivy security scan...'
                sh '''
                if command -v trivy >/dev/null 2>&1; then
                    echo "Trivy found – scanning filesystem..."
                    trivy fs .
                else
                    echo "Trivy not installed – skipping security scan."
                fi
                '''
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([string(credentialsId: 'mongo-uri', variable: 'MONGO_URI')]) {
                    echo 'Deploying application with Docker Compose...'
                    sh '''
                    docker compose down --remove-orphans || true
                    docker compose up -d --build
                    echo "Running containers:"
                    docker ps
                    '''
                }
            }
        }
        stage('Monitoring Setup') {
            steps {
                echo 'Starting Prometheus & Grafana'

                sh '''
                docker-compose -f docker/monitoring-compose.yml down || true
                docker-compose -f docker/monitoring-compose.yml up -d
                '''
            }
        }
    }

    post {
        always {
            echo 'Cleaning up Docker resources...'
            sh 'docker system prune -f || true'
        }
        failure {
            echo 'Pipeline failed – collecting Docker logs for debugging.'
            sh 'docker compose logs || true'
        }
    }
}
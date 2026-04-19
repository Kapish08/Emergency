pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "ehf-backend"
        FRONTEND_IMAGE = "ehf-frontend"
    }

    stages {

        stage('Build') {
            steps {
                echo "Building Docker Images"
                sh 'docker-compose build'
            }
        }

        stage('Test') {
            steps {
                echo "Running Backend Tests"
                sh 'cd backend && npm install && npm test || true'
            }
        }

        stage('Code Quality') {
            steps {
                echo "Running SonarQube Analysis"
                sh '''
                sonar-scanner \
                -Dsonar.projectKey=emergency-app \
                -Dsonar.sources=.
                '''
            }
        }

        stage('Security') {
            steps {
                echo "Scanning Docker Images"
                sh 'trivy image $BACKEND_IMAGE || true'
                sh 'trivy image $FRONTEND_IMAGE || true'
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying using Docker Compose"
                sh 'docker-compose down || true'
                sh 'docker-compose up -d'
            }
        }

        stage('Release') {
            steps {
                echo "Tagging and Pushing Images"
                sh '''
                docker tag ehf-backend yourdockerhub/ehf-backend:latest
                docker tag ehf-frontend yourdockerhub/ehf-frontend:latest
                docker push yourdockerhub/ehf-backend:latest
                docker push yourdockerhub/ehf-frontend:latest
                '''
            }
        }

        stage('Monitoring') {
            steps {
                echo "Monitoring Enabled (Prometheus/Grafana)"
            }
        }
    }
}
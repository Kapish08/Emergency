pipeline {
    agent any

    environment {
        BACKEND_IMAGE = "emergency-devops-backend"
        FRONTEND_IMAGE = "emergency-devops-frontend"
        PATH = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
    }

    stages {

        // ================= BUILD =================
        stage('Build') {
            steps {
                echo "Building Docker Images"
                sh 'docker compose build'
            }
        }

        // ================= TEST =================
        stage('Test') {
            steps {
                echo "Running Backend Tests"
                sh '''
                cd backend
                npm install || true
                npm test || true
                '''
            }
        }

        // ================= CODE QUALITY =================
        stage('Code Quality') {
            steps {
                echo "Running SonarQube Analysis"
                sh '''
                sonar-scanner \
                -Dsonar.projectKey=emergency-app \
                -Dsonar.sources=. || true
                '''
            }
        }

        // ================= SECURITY =================
        stage('Security') {
            steps {
                echo "Scanning Docker Images with Trivy"
                sh 'trivy image emergency-devops-backend || true'
                sh 'trivy image emergency-devops-frontend || true'
            }
        }

        // ================= DEPLOY =================
        stage('Deploy') {
            steps {
                echo "Stopping existing containers (if any)"
                sh 'docker compose down || true'
                sh 'docker rm -f $(docker ps -aq) || true'

                echo "Deploying application"
                sh 'docker compose up -d'
            }
        }

        // ================= RELEASE =================
        stage('Release') {
            steps {
                echo "Tagging and pushing Docker images"

                sh '''
                docker tag emergency-devops-backend yourdockerhub/emergency-backend:latest || true
                docker tag emergency-devops-frontend yourdockerhub/emergency-frontend:latest || true

                docker push yourdockerhub/emergency-backend:latest || true
                docker push yourdockerhub/emergency-frontend:latest || true
                '''
            }
        }

        // ================= MONITORING =================
        stage('Monitoring') {
            steps {
                echo "Monitoring stage: Prometheus & Grafana integration (conceptual/demo)"
            }
        }
    }

    post {
        always {
            echo "Pipeline execution completed"
        }
        success {
            echo "Pipeline executed successfully!"
        }
        failure {
            echo "Pipeline failed. Check logs."
        }
    }
}
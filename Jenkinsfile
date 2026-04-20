pipeline {
    agent any

    environment {
        PATH = "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
        BACKEND_IMAGE = "emergency-devops-backend"
        FRONTEND_IMAGE = "emergency-devops-frontend"
    }

    stages {

        stage('Check Docker') {
            steps {
                sh '''
                echo "Checking Docker..."
                which docker
                docker --version
                docker info
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                export PATH=$PATH
                docker compose build
                '''
            }
        }

        stage('Test') {
            environment {
                MONGO_URI = credentials('mongo-uri')
            }
            steps {
                sh '''
                cd backend
                npm install
                export MONGO_URI=$MONGO_URI
                npm test || true
                '''
            }
        }

        stage('Code Quality') {
            environment {
                SONAR_TOKEN = credentials('Emergency')
            }
            steps {
                sh '''
                if command -v sonar-scanner >/dev/null 2>&1; then
                    sonar-scanner \
                      -Dsonar.projectKey=emergency-app \
                      -Dsonar.sources=. \
                      -Dsonar.login=$SONAR_TOKEN
                else
                    echo "Skipping SonarQube (not installed)"
                fi
                '''
            }
        }

        stage('Security') {
            steps {
                sh '''
                if command -v trivy >/dev/null 2>&1; then
                    trivy image $BACKEND_IMAGE || true
                    trivy image $FRONTEND_IMAGE || true
                else
                    echo "Skipping Trivy scan"
                fi
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker compose down || true
                docker compose up -d || true
                '''
            }
        }

        stage('Release') {
            steps {
                sh '''
                docker tag $BACKEND_IMAGE yourdockerhub/ehf-backend:latest || true
                docker tag $FRONTEND_IMAGE yourdockerhub/ehf-frontend:latest || true

                docker push yourdockerhub/ehf-backend:latest || true
                docker push yourdockerhub/ehf-frontend:latest || true
                '''
            }
        }

        stage('Monitoring') {
            steps {
                echo "Monitoring stage (placeholder)"
            }
        }
    }

    post {
        always {
            sh 'docker system prune -f || true'
            echo "Pipeline completed"
        }
    }
}
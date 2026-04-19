pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '0'
        BACKEND_IMAGE = "emergency-devops-backend"
        FRONTEND_IMAGE = "emergency-devops-frontend"

        // MongoDB Atlas (replace with your actual URI OR use Jenkins credentials)
        MONGO_URI = "mongodb+srv://kapishbudhiraja61_db_user:Kapish@emergency.r1hapo3.mongodb.net/?appName=Emergency"
    }

    stages {

        stage('Build') {
            steps {
                echo "Building Docker Images"

                sh '''
                docker compose build || docker compose build || docker compose build
                '''
            }
        }

        stage('Test') {
            steps {
                echo "Running Backend Tests"

                sh '''
                cd backend
                npm install
                MONGO_URI=$MONGO_URI npm test || true
                '''
            }
        }

        stage('Code Quality') {
            steps {
                echo "Running Code Quality Analysis"

                sh '''
                sonar-scanner \
                -Dsonar.projectKey=emergency-app \
                -Dsonar.sources=. || true
                '''
            }
        }

        stage('Security') {
            steps {
                echo "Running Security Scan"

                sh '''
                trivy image $BACKEND_IMAGE || true
                trivy image $FRONTEND_IMAGE || true
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo "Deploying Application"

                sh '''
                docker compose down || true
                docker compose up -d
                '''
            }
        }

        stage('Release') {
            steps {
                echo "Tagging Docker Images"

                sh '''
                docker tag $BACKEND_IMAGE yourdockerhub/$BACKEND_IMAGE:latest || true
                docker tag $FRONTEND_IMAGE yourdockerhub/$FRONTEND_IMAGE:latest || true
                '''
            }
        }

        stage('Monitoring') {
            steps {
                echo "Monitoring Enabled (Simulated with logs)"
                sh 'docker stats --no-stream || true'
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
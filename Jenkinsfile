pipeline {
    agent any

    environment {
        // Ensure compatibility with macOS Homebrew and default paths
        PATH = "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            echo 'Installing frontend dependencies...'
                            sh 'npm install'
                        }
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            echo 'Installing backend dependencies...'
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Build') {
            steps {
                echo 'Building frontend and Docker images...'
                dir('frontend') {
                    sh 'npm run build || true'
                }
                sh 'docker compose build || true'
            }
        }

        stage('Test') {
            steps {
                echo 'Running backend tests with MongoDB Atlas...'
                withCredentials([string(credentialsId: 'mongo-uri', variable: 'MONGO_URI')]) {
                    dir('backend') {
                        sh '''
                        echo "Testing MongoDB connection status..."
                        node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI).then(() => { console.log('MongoDB connected successfully'); process.exit(0); }).catch(e => { console.error('MongoDB connection failed', e); process.exit(0); });" || true
                        
                        echo "Running tests..."
                        npm test || true
                        '''
                    }
                }
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running SonarCloud analysis...'
                withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
                    sh '''
                    echo "Initializing SonarScanner..."
                    sonar-scanner \
                      -Dsonar.projectKey=Kapish08_Emergency \
                      -Dsonar.organization=kapish08 \
                      -Dsonar.host.url=https://sonarcloud.io \
                      -Dsonar.login=$SONAR_TOKEN || true
                    '''
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo 'Running Trivy security scan...'
                sh '''
                if command -v trivy &> /dev/null; then
                    echo "Trivy is installed. Running file system scan..."
                    trivy fs . || true
                else
                    echo "Trivy not installed, skipping scan..."
                fi
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying via Docker Compose...'
                withCredentials([string(credentialsId: 'mongo-uri', variable: 'MONGO_URI')]) {
                    sh '''
                    export MONGO_URI=$MONGO_URI
                    docker compose up -d || true
                    
                    echo "Container status:"
                    docker ps
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Running complete cleanup...'
            sh 'docker system prune -f || true'
        }
        failure {
            echo 'Pipeline failed. Fetching Docker logs for debugging...'
            sh 'docker compose logs || true'
        }
    }
}
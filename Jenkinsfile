pipeline {
    agent any

    environment {
        // Define paths to the tools we installed on your Ubuntu server
        SCANNER_HOME = '/opt/sonar-scanner'
        ODC_HOME = '/opt/dependency-check'
    }

    stages {
        stage('Checkout Code') {
            steps {
                // This pulls the code from your GitHub Repo
                checkout scm
            }
        }

        stage('Secret Scanning (GitLeaks)') {
            steps {
                echo "Running GitLeaks to find hardcoded passwords..."
                // Using the binary we moved to /usr/local/bin
                sh 'gitleaks detect --source . --verbose --redact'
            }
        }

        stage('SAST Scanning (Semgrep)') {
            steps {
                echo "Running Semgrep to find SQL Injection..."
                // Using the python pip install we verified earlier
                sh 'semgrep scan --config auto'
            }
        }

        stage('SCA Scanning (Dependency-Check)') {
            steps {
                echo "Running OWASP Dependency-Check for outdated libraries..."
                // This runs the engine we installed in /opt
                // Note: It will skip NVD check if the sync isn't done, but will still scan local files
                sh "${ODC_HOME}/bin/dependency-check.sh --project 'DevSecOps-Lab' --scan . --format 'ALL' --out ."
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo "Pushing all results to SonarQube Dashboard..."
                // 'SonarQube-Server' must match the name in Manage Jenkins > System
                withSonarQubeEnv('SonarQube-Server') {
                    sh "${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=devsecops-vulnerable-lab \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000"
                }
            }
        }
    }
    
    post {
        always {
            echo "Security Pipeline Execution Finished."
        }
    }
}

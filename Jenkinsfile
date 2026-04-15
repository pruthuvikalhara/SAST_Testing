pipeline {
    agent any
    environment {
        SCANNER_HOME = '/opt/sonar-scanner'
        ODC_HOME = '/opt/dependency-check'
    }
    stages {
        stage('Universal Checkout') {
            steps { checkout scm }
        }

        stage('Multi-Tool Security Scan') {
            parallel {
                stage('Secret Scan') {
                    steps {
                        // Gitleaks automatically scans all file types
                        sh 'gitleaks detect --source . --verbose --redact || true'
                    }
                }
                stage('SAST (Auto-Detect)') {
                    steps {
                        // Semgrep 'auto' detects the language and applies relevant rules
                        sh 'semgrep scan --config auto --text || true'
                    }
                }
                stage('SCA (Dependency Check)') {
                    steps {
                        // Dependency-Check identifies libraries in any language (npm, pip, maven, etc.)
                        sh "${ODC_HOME}/bin/dependency-check.sh --project 'Universal-Scan' --scan . --format 'ALL' --out . || true"
                    }
                }
            }
        }

        stage('SonarQube Global Analysis') {
            steps {
                withSonarQubeEnv('SonarQube-Server') {
                    // We remove -Dsonar.sources=app.js and use . to scan EVERYTHING
                    sh "${SCANNER_HOME}/bin/sonar-scanner \
                        -Dsonar.projectKey=${JOB_NAME} \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000"
                }
            }
        }

        stage("Quality Gate Enforcement") {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: '*.json, *.txt, *.html', allowEmptyArchive: true
        }
    }
}
